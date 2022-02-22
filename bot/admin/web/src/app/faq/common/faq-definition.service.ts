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

import {Injectable} from '@angular/core';

import {empty, Observable, of} from 'rxjs';
import {FaqDefinition} from './model/faq-definition';
import {FaqSearchQuery} from './model/faq-search-query';
import {RestService} from "../../core-nlp/rest/rest.service";
import {map, takeUntil} from "rxjs/operators";
import {FaqDefinitionResult} from "./model/faq-definition-result";
import {StateService} from "../../core-nlp/state.service";

/**
 * Faq Definition operations for FAQ module
 */
@Injectable()
export class FaqDefinitionService {

  appIdByAppName = new Map<string, string>(); // for mock purpose only

  // generate fake data for pagination
  faqData: FaqDefinitionResult = new FaqDefinitionResult([], 0, 0, 0);

  constructor(private rest: RestService, private state: StateService) {
  }

  // add random data at initialization until real backend is there instead
  setupData({applicationId, applicationName, language}:
              { applicationId: string, applicationName: string, language: string }): void {

    this.appIdByAppName.set(applicationName, applicationId);

    // when there is already data for given bot / language
    if (this.faqData.rows.some((fq: FaqDefinition) => fq.applicationId === applicationId && fq.language == language)) {
      // no need to add mock data
      return;
    }
  }

  // fake real backend call
  delete(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<boolean> {
    let newFq: FaqDefinition | undefined;

    return this.rest.delete(`/faq/${fq.id}`).pipe(
      takeUntil(cancel$),
      map(r => {
        if (r) {
          this.faqData.rows = this.faqData.rows.map(item => {
            if (fq.id && item.id === fq.id) {
              newFq = JSON.parse(JSON.stringify(fq)); // deep copy
              newFq.status = 'deleted';
              return newFq;
            } else {
              return item;
            }

          });
          return r
        }
      }))
  }

  save(faq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
      return this.rest.post('/faq', faq)
        .pipe(
          takeUntil(cancel$),
          map(_ => {
            // add the current save to the state
            this.state.resetConfiguration()
            return JSON.parse(JSON.stringify(faq));
          }));
  }

  searchFaq(request: FaqSearchQuery, cancel$: Observable<any> = empty()): Observable<FaqDefinitionResult> {
    return this.rest.post('/faq/search', request).pipe(
      takeUntil(cancel$),
      map(json => {
        this.faqData = FaqDefinitionResult.fromJSON(json)
        return this.faqData
      }));
  }

  getAvailableTags(applicationId: string, cancel$: Observable<any> = empty()): Observable<string[]> {
    return this.rest.post('/faq/tags', applicationId).pipe(
      takeUntil(cancel$),
      map(tags => {
        return JSON.parse(JSON.stringify(tags));
      }));
  }

  activate(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    return this.updateEnabled(fq, true, cancel$);
  }

  disable(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    return this.updateEnabled(fq, false, cancel$);
  }

  /**
   * Update
   * NOT YET IMPLEMENTED
   * @param fq
   * @param enabled
   * @param cancel$
   * @private
   */
  private updateEnabled(fq: FaqDefinition, enabled: boolean, cancel$: Observable<any>)
    : Observable<FaqDefinition> {

    let dirty = false;

    this.faqData.rows = this.faqData.rows.map(item => {
      if (fq.id && item.id === fq.id) {
        dirty = true;
        fq.enabled = (enabled === true);
        return fq;
      } else {
        return item;
      }
    });

    if (dirty) {
      return of(this.faqData.rows.filter(item => fq.id && item.id === fq.id)[0]);
    } else {
      return empty();
    }
  }

}