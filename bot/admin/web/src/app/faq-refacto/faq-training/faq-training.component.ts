import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { StateService } from '../../core-nlp/state.service';
import { PaginatedQuery } from '../../model/commons';
import { Intent, PaginatedResult, SearchQuery, Sentence, SentenceStatus } from '../../model/nlp';
import { NlpService } from '../../nlp-tabs/nlp.service';
import { pagination } from '../../shared/pagination/pagination.component';
import { Action, FaqTrainingFilter } from '../models';
import { truncate } from '../../model/commons';

@Component({
  selector: 'tock-faq-training',
  templateUrl: './faq-training.component.html',
  styleUrls: ['./faq-training.component.scss']
})
export class FaqTrainingComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  selection: SelectionModel<Sentence> = new SelectionModel<Sentence>(true, []);
  Action = Action;
  filter = {
    search: null,
    sort: [{ first: 'creationDate', second: false }],
    intentId: null,
    status: [0],
    onlyToReview: false,
    maxIntentProbability: 100,
    minIntentProbability: 0
  };

  loading: boolean = false;

  sentences: Sentence[] = [];

  constructor(
    private nlp: NlpService,
    private state: StateService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.state.configurationChange.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  pagination: pagination = {
    pageStart: 0,
    pageEnd: undefined,
    pageSize: 10,
    pageTotal: undefined
  };

  paginationChange(pagination: pagination) {
    this.pagination = { ...this.pagination, ...pagination };
    this.loadData(this.pagination.pageStart, this.pagination.pageSize);
  }

  filterFaqTraining(filters: FaqTrainingFilter): void {
    this.selection.clear();
    this.filter = { ...this.filter, ...filters };
    this.loadData();
  }

  sortFaqTraining(sort: boolean): void {
    this.selection.clear();
    this.filter.sort[0].second = sort;
    this.loadData();
  }

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
    this.loading = true;

    this.search(this.state.createPaginatedQuery(start, size))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PaginatedResult<Sentence>) => {
          this.loading = false;
          this.pagination.pageTotal = data.total;
          this.pagination.pageStart = data.start;
          this.pagination.pageEnd = data.end;
          this.sentences = data.rows;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  async handleAction({ action, sentence }): Promise<void> {
    const actionTitle = this.setActionTitle(action);

    this.setSentenceAccordingToAction(action, sentence);

    await this.nlp.updateSentence(sentence).pipe(take(1)).toPromise();
    this.pagination.pageEnd--;
    this.pagination.pageTotal--;

    if (this.selection.isSelected(sentence)) {
      this.selection.deselect(sentence);
    }
    this.sentences = this.sentences.filter((s) => sentence.text !== s.text);

    this.toastrService.success(truncate(sentence.text), actionTitle, {
      duration: 2000,
      status: 'basic'
    });

    if (this.pagination.pageEnd < 1) this.loadData();
  }

  async handleBatchAction(action: Action): Promise<void> {
    if (!this?.selection?.selected?.length) {
      this.toastrService.warning('No data selected', { duration: 2000, status: 'info' });
      return;
    }
    const actionTitle = this.setActionTitle(action);

    for (let sentence of this.selection.selected) {
      this.setSentenceAccordingToAction(action, sentence);
    }

    await Promise.all(
      this.selection.selected.map(async (sentence) => {
        await this.nlp.updateSentence(sentence).pipe(take(1)).toPromise();
        this.sentences = this.sentences.filter((s) => sentence.text !== s.text);
        this.pagination.pageEnd--;
        this.pagination.pageTotal--;
      })
    );

    this.toastrService.success(
      `${actionTitle} ${this.selection.selected.length} sentences`,
      actionTitle,
      {
        duration: 2000,
        status: 'basic'
      }
    );

    if (this.pagination.pageEnd < 1) this.loadData();
  }

  private setSentenceAccordingToAction(action: Action, sentence: Sentence): void {
    switch (action) {
      case Action.DELETE:
        sentence.status = SentenceStatus.deleted;
        break;
      case Action.TOGGLE:
        break;
      case Action.UNKNOWN:
        sentence.classification.intentId = Intent.unknown;
        sentence.classification.entities = [];
        sentence.status = SentenceStatus.validated;
        break;
      case Action.VALIDATE:
        const intentId = sentence.classification.intentId;

        if (!intentId) {
          this.toastrService.show(`Please select an intent first`);
          break;
        }
        if (intentId === Intent.unknown) {
          sentence.classification.intentId = Intent.unknown;
          sentence.classification.entities = [];
        }
        sentence.status = SentenceStatus.validated;
        break;
    }
  }

  private setActionTitle(action: Action): string {
    switch (action) {
      case Action.DELETE:
        return 'Delete';
      case Action.UNKNOWN:
        return 'Unknown';
      case Action.VALIDATE:
        return 'Validate';
    }
  }
}
