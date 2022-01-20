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
import {MOCK_FREQUENT_QUESTIONS} from '../common/mock/qa.mock';

import {empty, Observable, of} from 'rxjs';
import {PaginatedResult} from 'src/app/model/nlp';
import {FaqDefinition} from './model/faq-definition';
import {QaSearchQuery} from './model/qa-search-query';
import {Utterance} from './model/utterance';
import {RestService} from "../../core-nlp/rest/rest.service";
import {map, takeUntil} from "rxjs/operators";

/**
 * Faq Definition operations for FAQ module
 */
@Injectable()
export class FaqDefinitionService {

  appIdByAppName = new Map<string, string>(); // for mock purpose only

  // generate fake data for pagination
  mockData: FaqDefinition[] = [];

  constructor(private rest: RestService) {
  }

  // add random data at initialization until real backend is there instead
  setupMockData({applicationId, applicationName, language}:
                  { applicationId: string, applicationName: string, language: string }): void {

    this.appIdByAppName.set(applicationName, applicationId);

    // when there is already data for given bot / language
    if (this.mockData.some((fq: FaqDefinition) => fq.applicationId === applicationId && fq.language == language)) {
      // no need to add mock data
      return;
    }

    const seed = (new Date().getTime()); // timestamp as random seed
    const now = new Date();

    const someData: FaqDefinition[] = Array<number>(3).fill(0).map((_, index) => {
      const template = MOCK_FREQUENT_QUESTIONS[index % MOCK_FREQUENT_QUESTIONS.length];

      return {
        id: '' + (index + 1) + '_' + seed,
        utterances: [`${template.utterances[0]} ${index + 1}`],
        answer: `${template.answer} ${index + 1}`,
        title: template.title, // pick random (rotating) title
        enabled: (index < 5),
        status: template.status,
        tags: (template.tags || []).slice(),
        applicationId,
        language,
        creationDate: now,
        updateDate: now
      };
    });

    someData.forEach(fq => this.mockData.push(fq));
  }

  // fake real backend call
  delete(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    let newFq: FaqDefinition | undefined;

    this.mockData = this.mockData.map(item => {
      if (fq.id && item.id === fq.id) {
        newFq = JSON.parse(JSON.stringify(fq)); // deep copy
        newFq.status = 'deleted';
        return newFq;
      } else {
        return item;
      }
    });

    return (newFq === undefined) ? Observable.throw("Item not found") : of(newFq);
  }

  // fake real backend call
  save(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {

    let dirty = false;

    this.mockData = this.mockData.map(item => {
      if (fq.id && item.id === fq.id) {
        dirty = true;
        fq.updateDate = new Date();
        return fq;
      } else {
        return item;
      }
    });

    if (!dirty) {
      return this.newFaq(fq, cancel$);
    }
  }

  newFaq(request: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    return this.rest.post('/faq/new', request)
      .pipe(
        takeUntil(cancel$),
        map(_ => {
          return JSON.parse(JSON.stringify(request));
        }));
  }

  // fake real backend call
  searchQas(query: QaSearchQuery): Observable<PaginatedResult<FaqDefinition>> {

    // Because for historical reason, PaginatedResilt hold a application name instead of application id
    const queryApplicationId = this.appIdByAppName.get(query.applicationName);

    // guard against empty case
    if (query.start < 0 || query.size <= 0) {
      return of({
        start: 0,
        end: 0,
        rows: [],
        total: this.mockData.length
      });
    }

    // simulate backend query (filtering on status, application name etc..)
    const data = this.mockData
      .filter(fq => {
        const predicates: Array<(FaqDefinition) => boolean> = [];

        predicates.push(
          (fq: FaqDefinition) => fq.status !== 'deleted'
        );

        predicates.push(
          (fq: FaqDefinition) => fq.applicationId === queryApplicationId
        );

        const lowerSearch = (query.search || '').toLowerCase().trim();
        if (lowerSearch) {
          predicates.push(
            (fq: FaqDefinition) => (fq.answer || '').toLowerCase().includes(lowerSearch) ||
              (fq.description || '').toLowerCase().includes(lowerSearch) ||
              fq.utterances.some((u: Utterance) => u.toLowerCase().includes(lowerSearch)) ||
              (fq.title || '').toLowerCase().includes(lowerSearch)
          );
        }

        if (query.tags.length > 0) {
          predicates.push(
            (fq: FaqDefinition) => fq.tags.some(
              tag => query.tags.some(queryTag => queryTag.toLowerCase() === tag.toLowerCase())
            )
          );
        }

        if (query.enabled) {
          predicates.push(
            (fq) => (true === fq.enabled)
          );
        }

        // Return true when all criterias pass
        return predicates.reduce((accepted, predicate) => {
          return accepted && predicate(fq);
        }, true);
      });

    // simulate backend pagination
    const chunk = data.slice(query.start, query.start + query.size);

    // simulate backend output
    return of({
      start: query.start,
      end: query.start + query.size,
      rows: chunk,
      total: data.length
    });
  }

  getAvailableTags(applicationId: string, language: string): Observable<string[]> {
    const tagSet = new Set<string>();

    // simulate backend aggregation query
    this.mockData
      .filter(fq => fq.applicationId === applicationId && fq.language === language)
      .forEach(fq => fq.tags.forEach(tagSet.add.bind(tagSet)));

    return of(Array.from(tagSet));
  }

  activate(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    return this.updateEnabled(fq, true, cancel$);
  }

  disable(fq: FaqDefinition, cancel$: Observable<any> = empty()): Observable<FaqDefinition> {
    return this.updateEnabled(fq, false, cancel$);
  }

  private updateEnabled(fq: FaqDefinition, enabled: boolean, cancel$: Observable<any>)
    : Observable<FaqDefinition> {

    let dirty = false;

    this.mockData = this.mockData.map(item => {
      if (fq.id && item.id === fq.id) {
        dirty = true;
        fq.enabled = (enabled === true);
        return fq;
      } else {
        return item;
      }
    });

    if (dirty) {
      return of(this.mockData.filter(item => fq.id && item.id === fq.id)[0]);
    } else {
      return empty();
    }
  }

}
