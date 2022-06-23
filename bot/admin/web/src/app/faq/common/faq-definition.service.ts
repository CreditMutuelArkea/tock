/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, empty, merge, Observable, of } from 'rxjs';
import { map, switchMap, takeUntil, tap, filter, mergeMap } from 'rxjs/operators';

import { BotService } from '../../bot/bot-service';
import { FaqDefinition } from './model/faq-definition';
import { FaqSearchQuery } from './model/faq-search-query';
import { RestService } from '../../core-nlp/rest/rest.service';
import { FaqDefinitionResult } from './model/faq-definition-result';
import { StateService } from '../../core-nlp/state.service';
import { Settings } from './model';

interface FaqState {
  loaded: boolean;
  settings: Settings;
}

const faqInitialState: { loaded: boolean; settings: Settings } = {
  loaded: false,
  settings: {
    enableSatisfactionAsk: false,
    story: null
  }
};

/**
 * Faq Definition operations for FAQ module
 */
@Injectable()
export class FaqDefinitionService {
  private _state: BehaviorSubject<FaqState>;
  state$: Observable<FaqState>;

  appIdByAppName = new Map<string, string>(); // for mock purpose only

  faqData: FaqDefinitionResult = new FaqDefinitionResult([], 0, 0, 0);

  constructor(
    private rest: RestService,
    private state: StateService,
    private botService: BotService
  ) {
    this._state = new BehaviorSubject(faqInitialState);
    this.state$ = this._state.asObservable();
  }

  getState(): FaqState {
    return this._state.getValue();
  }

  setState(state: FaqState): void {
    return this._state.next(state);
  }

  /**
   * Compare faq but without creation or update Date
   * @param newFaq
   * @param oldFaq
   * @private
   */
  private static compareFaqSave(newFaq: FaqDefinition, oldFaq: FaqDefinition): boolean {
    return (
      newFaq.id === oldFaq.id &&
      newFaq.intentId === oldFaq.intentId &&
      newFaq.title === oldFaq.title &&
      newFaq.description === oldFaq.description &&
      newFaq.applicationId === oldFaq.applicationId &&
      newFaq.enabled === oldFaq.enabled &&
      JSON.stringify(newFaq.utterances) === JSON.stringify(oldFaq.utterances) &&
      newFaq.answer === oldFaq.answer &&
      JSON.stringify(newFaq.tags) === JSON.stringify(oldFaq.tags)
    );
  }

  // add random data at initialization until real backend is there instead
  setupData({
    applicationId,
    applicationName,
    language
  }: {
    applicationId: string;
    applicationName: string;
    language: string;
  }): void {
    this.appIdByAppName.set(applicationName, applicationId);

    // when there is already data for given bot / language
    if (
      this.faqData.rows.some(
        (fq: FaqDefinition) => fq.applicationId === applicationId && fq.language == language
      )
    ) {
      // no need to add mock data
      return;
    }
  }

  delete(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<boolean> {
    let newFq: FaqDefinition | undefined;

    return this.rest.delete(`/faq/${fq.id}`).pipe(
      takeUntil(cancel$),
      map((r) => {
        //delete to current state
        this.state.resetConfiguration();
        if (r) {
          this.faqData.rows = this.faqData.rows.map((item) => {
            if (fq.id && item.id === fq.id) {
              newFq.status = 'deleted';
              newFq = JSON.parse(JSON.stringify(fq)); // deep copy
              return newFq;
            } else {
              return item;
            }
          });
          return r;
        }
      })
    );
  }

  save(faq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    let dirty = false;

    this.faqData.rows
      .filter((item) => item.id == faq.id)
      .some((item) => {
        if (FaqDefinitionService.compareFaqSave(faq, item)) {
          dirty = true;
        }
      });

    if (!dirty) {
      return this.rest.post('/faq', faq).pipe(
        takeUntil(cancel$),
        map((_) => {
          // add the current save to the state
          this.state.resetConfiguration();
          return JSON.parse(JSON.stringify(faq));
        })
      );
    } else {
      return of(faq);
    }
  }

  searchFaq(
    request: FaqSearchQuery,
    cancel$: Observable<any> = empty()
  ): Observable<FaqDefinitionResult> {
    return this.rest.post('/faq/search', request).pipe(
      takeUntil(cancel$),
      map((json) => {
        this.faqData = FaqDefinitionResult.fromJSON(json);
        return this.faqData;
      })
    );
  }

  getAvailableTags(
    applicationId: string,
    cancel$: Observable<any> = empty()
  ): Observable<string[]> {
    return this.rest.post('/faq/tags', applicationId).pipe(
      takeUntil(cancel$),
      map((tags) => {
        return JSON.parse(JSON.stringify(tags));
      })
    );
  }

  /**
   * Update enable/disable Faq
   * @param faq
   * @param status : faq is activated or deactivated
   * @param cancel$
   */
  updateFaqStatus(
    faq: FaqDefinition,
    status: boolean,
    cancel$: Observable<any>
  ): Observable<FaqDefinition> {
    let dirty = false;

    this.faqData.rows
      .filter((item) => item.id == faq.id)
      .some((item) => {
        if (item.enabled == status) {
          dirty = true;
        }
      });

    if (!dirty) {
      faq.enabled = status;
      return this.rest.post('/faq/status', faq).pipe(
        takeUntil(cancel$),
        map((_) => {
          // add the current save to the state
          this.state.resetConfiguration();
          return JSON.parse(JSON.stringify(faq));
        })
      );
    } else {
      return of(faq);
    }
  }

  getSettings(): Observable<Settings> {
    const faqState = this.state$;
    const notLoaded = faqState.pipe(
      filter((state) => !state.loaded),
      switchMap(() =>
        this.rest.get<Settings>('/faq/settings', (settings: any) => ({
          enableSatisfactionAsk: settings.enableSatisfactionAsk,
          story: settings.story
        }))
      ),
      tap((settings: Settings) =>
        this.setState({
          loaded: true,
          settings
        })
      ),
      switchMap(() => faqState),
      map((state) => state.settings)
    );
    const loaded = faqState.pipe(
      filter((state) => state.loaded === true),
      map((state) => state.settings)
    );
    return merge(notLoaded, loaded);
  }

  saveSettings(settings: any, cancel$: Observable<any>): Observable<any> {
    return this.rest.post('/faq/settings', settings).pipe(
      takeUntil(cancel$),
      tap((newSettings: Settings) => {
        let state = this.getState();
        state.settings = {
          enableSatisfactionAsk: newSettings.enableSatisfactionAsk,
          story: newSettings.story
        };
        this.setState(state);
      })
    );
  }
}
