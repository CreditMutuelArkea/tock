import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Intent, Sentence } from '../../../model/nlp';
import { StateService } from '../../../core-nlp/state.service';
import { UserRole } from '../../../model/auth';
import { Action } from '../../models';
import { pagination } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'tock-faq-training-list',
  templateUrl: './faq-training-list.component.html',
  styleUrls: ['./faq-training-list.component.scss']
})
export class FaqTrainingListComponent implements OnInit, OnDestroy {
  @Input() sentences: Sentence[] = [];
  @Input() selection!: SelectionModel<Sentence>;
  @Input() pagination: pagination;

  @Output() onPaginationChange = new EventEmitter<pagination>();
  @Output() onAction = new EventEmitter<{ action: Action; sentence: Sentence }>();
  @Output() onBatchAction = new EventEmitter<Action>();
  @Output() onSort = new EventEmitter<boolean>();

  private readonly destroy$: Subject<boolean> = new Subject();

  intents: Intent[] = [];
  UserRole: typeof UserRole = UserRole;
  Action: typeof Action = Action;
  sort: boolean = false;

  constructor(public readonly state: StateService, private router: Router) {}

  ngOnInit(): void {
    this.state.currentIntents.pipe(takeUntil(this.destroy$)).subscribe({
      next: (intents: Intent[]) => {
        this.intents = intents;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  paginationChange(pagination: pagination) {
    this.onPaginationChange.emit(pagination);
  }

  redirectToFaqManagement(sentence: Sentence): void {
    this.router.navigate(['faq-refacto/management'], { state: { question: sentence.text } });
  }

  selectIntent(sentence: Sentence, category: 'placeholder' | 'probability'): string | number {
    switch (category) {
      case 'placeholder':
        return sentence.getIntentLabel(this.state);
      case 'probability':
        return Math.trunc(sentence.classification.intentProbability * 100);
    }
  }

  addIntentToSentence(intentId: string, sentence: Sentence): void {
    sentence = sentence.withIntent(this.state, intentId);
  }

  handleAction(action: Action, sentence: Sentence): void {
    this.onAction.emit({ action, sentence });
  }

  handleBatchAction(action: Action): void {
    this.onBatchAction.emit(action);
  }

  handleToggleSelectAll(value: boolean): void {
    if (!value) {
      this.selection.clear();
    } else {
      this.sentences.forEach((sentence) => this.selection.select(sentence));
    }
  }

  isSentenceSelected(sentence: Sentence): boolean {
    return this.selection.isSelected(sentence);
  }

  toggle(sentence: Sentence): void {
    this.selection.toggle(sentence);
  }

  toggleSort(): void {
    this.sort = !this.sort;
    this.onSort.emit(this.sort);
  }
}
