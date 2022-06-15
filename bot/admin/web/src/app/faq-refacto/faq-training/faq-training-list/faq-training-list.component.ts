import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IntentsCategory, Sentence } from '../../../model/nlp';
import { StateService } from '../../../core-nlp/state.service';
import { UserRole } from '../../../model/auth';
import { Action } from '../../models';
import { Pagination } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'tock-faq-training-list',
  templateUrl: './faq-training-list.component.html',
  styleUrls: ['./faq-training-list.component.scss']
})
export class FaqTrainingListComponent implements OnInit, OnDestroy {
  @Input() pagination: Pagination;
  @Input() sentences: Sentence[] = [];
  @Input() selection!: SelectionModel<Sentence>;

  @Output() onAction = new EventEmitter<{ action: Action; sentence: Sentence }>();
  @Output() onBatchAction = new EventEmitter<Action>();
  @Output() onPaginationChange = new EventEmitter<Pagination>();
  @Output() onSort = new EventEmitter<boolean>();

  private readonly destroy$: Subject<boolean> = new Subject();

  intentGroups: IntentsCategory[];
  filteredIntentGroups: Observable<IntentsCategory[]>;
  UserRole: typeof UserRole = UserRole;
  Action: typeof Action = Action;
  sort: boolean = false;

  selectionOption = [
    {
      action: Action.VALIDATE,
      class: 'tock--success',
      icon: 'checkmark-circle-2',
      label: 'Validate'
    },
    {
      action: Action.UNKNOWN,
      class: 'tock--danger',
      icon: 'close-circle-outline',
      label: 'Unknown'
    },
    {
      action: Action.DELETE,
      class: null,
      icon: 'trash-2-outline',
      label: 'Delete'
    }
  ];

  constructor(public readonly stateService: StateService, private router: Router) {}

  ngOnInit(): void {
    this.stateService.currentIntentsCategories
      .pipe(takeUntil(this.destroy$))
      .subscribe((groups) => {
        this.intentGroups = groups;
        this.resetIntentsListFilter();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  paginationChange(pagination: Pagination) {
    this.onPaginationChange.emit(pagination);
  }

  redirectToFaqManagement(sentence: Sentence): void {
    this.router.navigate(['faq-refacto/management'], { state: { question: sentence.text } });
  }

  selectIntent(sentence: Sentence, category: 'placeholder' | 'probability'): string | number {
    switch (category) {
      case 'placeholder':
        return sentence.getIntentLabel(this.stateService);
      case 'probability':
        return Math.trunc(sentence.classification.intentProbability * 100);
    }
  }

  addIntentToSentence(intentId: string, sentence: Sentence): void {
    let originalIndex = this.sentences.findIndex((s) => s === sentence);
    sentence = sentence.withIntent(this.stateService, intentId);
    this.sentences.splice(originalIndex, 1, sentence);
    this.resetIntentsListFilter();
  }

  resetIntentsListFilter(): void {
    this.filteredIntentGroups = of(this.intentGroups);
  }

  filterIntentsList($event): void {
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes($event.key)) return;

    let str = $event.target.value.toLowerCase();
    let result: IntentsCategory[] = [];
    this.intentGroups.forEach((group) => {
      group.intents.forEach((intent) => {
        if (intent.label?.toLowerCase().includes(str) || intent.name?.toLowerCase().includes(str)) {
          let cat = result.find((cat) => cat.category == group.category);
          if (!cat) {
            cat = { category: group.category, intents: [] };
            result.push(cat);
          }
          cat.intents.push(intent);
        }
      });
    });
    this.filteredIntentGroups = of(result);
  }

  onBlur($event): void {
    $event.target.value = '';
    this.resetIntentsListFilter();
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
