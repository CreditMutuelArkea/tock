import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { StateService } from 'src/app/core-nlp/state.service';
import { PaginatedQuery } from 'src/app/model/commons';
import { PaginatedResult, SearchQuery, Sentence } from 'src/app/model/nlp';
import { NlpService } from 'src/app/nlp-tabs/nlp.service';

@Component({
  selector: 'tock-faq-training',
  templateUrl: './faq-training.component.html',
  styleUrls: ['./faq-training.component.scss']
})
export class FaqTrainingComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  filter = {
    search: '',
    sort: [],
    intentId: null,
    status: [],
    onlyToReview: false,
    maxIntentProbability: 100,
    minIntentProbability: 0
  };
  isSidePanelOpen: boolean = false;

  loading = {
    list: false
  };

  sentences: Sentence[] = [];

  constructor(private nlp: NlpService, private state: StateService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  filterFaqTraining(filters: any): void {}

  toSearchQuery(query: PaginatedQuery): SearchQuery {
    const result = new SearchQuery(
      query.namespace,
      query.applicationName,
      query.language,
      query.start,
      query.size,
      null /* NOTE: There is a weird behavior when set */,
      this.filter.search,
      this.filter.intentId,
      this.filter.status,
      null,
      [],
      [],
      null,
      null,
      this.filter.sort,
      this.filter.onlyToReview,
      null,
      null,
      null,
      this.filter.maxIntentProbability / 100,
      this.filter.minIntentProbability / 100
    );
    return result;
  }

  search(query: PaginatedQuery): Observable<PaginatedResult<Sentence>> {
    return this.nlp.searchSentences(this.toSearchQuery(query));
  }

  loadData(start: number = 0, size: number = 10): void {
    this.loading.list = true;

    this.search(this.state.createPaginatedQuery(start, size))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PaginatedResult<Sentence>) => {
          this.loading.list = false;
          this.sentences = [...this.sentences, ...data.rows];
        },
        error: () => {
          this.loading.list = false;
        }
      });
  }
}
