import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Intent, IntentsCategory, nameFromQualifiedName } from '../../../../model/nlp';
import { StateService } from '../../../../core-nlp/state.service';
import { UserRole } from '../../../../model/auth';
import { Action, SentenceTrainingMode } from '../models';
import { Pagination } from '../..';
import { SentenceExtended } from '../sentence-training.component';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { SentenceReviewRequestComponent } from './sentence-review-request/sentence-review-request.component';
import { SentenceTrainingService } from './sentence-training.service';
import { IntentDialogComponent } from '../../../../sentence-analysis/intent-dialog/intent-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { NlpService } from '../../../../nlp-tabs/nlp.service';

@Component({
  selector: 'tock-sentence-training-list',
  templateUrl: './sentence-training-list.component.html',
  styleUrls: ['./sentence-training-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SentenceTrainingListComponent implements OnInit, OnDestroy {
  @Input() isFilteredUnknown!: boolean;
  @Input() pagination!: Pagination;
  @Input() sentences: SentenceExtended[] = [];
  @Input() selection!: SelectionModel<SentenceExtended>;
  @Input() sentenceTrainingMode: SentenceTrainingMode;
  SentenceTrainingMode = SentenceTrainingMode;

  @Output() onDetails = new EventEmitter<SentenceExtended>();
  @Output() onAction = new EventEmitter<{ action: Action; sentence: SentenceExtended }>();
  @Output() onBatchAction = new EventEmitter<Action>();
  @Output() onPaginationChange = new EventEmitter<Pagination>();
  @Output() onSort = new EventEmitter<boolean>();

  private readonly _destroy$: Subject<boolean> = new Subject();

  intentGroups: IntentsCategory[];
  filteredIntentGroups: Observable<IntentsCategory[]>;
  UserRole: typeof UserRole = UserRole;
  Action: typeof Action = Action;
  isSorted: boolean = false;

  scrolled: boolean = false;
  prevScrollVal: number;

  constructor(
    private state: StateService,
    private router: Router,
    private elementRef: ElementRef,
    private toastrService: NbToastrService,
    private nbDialogService: NbDialogService,
    private sentenceTrainingSentenceService: SentenceTrainingService,
    private nlp: NlpService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.state.currentIntentsCategories.pipe(takeUntil(this._destroy$)).subscribe((groups) => {
      this.intentGroups = groups;
      this.resetIntentsListFilter();
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const offset = 240;
    const verticalOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (verticalOffset === 0 && this.prevScrollVal > offset) return; // deal with <nb-select> reseting page scroll when opening select

    this.scrolled = verticalOffset > offset ? true : false;
    this.prevScrollVal = verticalOffset;
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent) {
    this.sentenceTrainingSentenceService.documentClick(event);
  }

  ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  paginationChange(pagination: Pagination): void {
    this.selection.clear();
    this.onPaginationChange.emit(pagination);
  }

  redirectToFaqManagement(sentence: SentenceExtended): void {
    this.router.navigate(['faq/management'], { state: { question: sentence.text } });
  }

  getSentenceAttribut(sentence: SentenceExtended, category: 'intentLabel' | 'probability'): string | number {
    switch (category) {
      case 'intentLabel':
        return sentence.getIntentLabel(this.state);
      case 'probability':
        return sentence.classification.intentProbability;
    }
  }

  addIntentToSentence(intentId: string, sentence: SentenceExtended): void {
    const isSelected = this.selection.isSelected(sentence);
    this.selection.deselect(sentence);

    let originalIndex = this.sentences.findIndex((s) => s === sentence);
    let intentBeforeClassification = sentence._intentBeforeClassification || sentence.classification.intentId;
    const newSentence = sentence.withIntent(this.state, intentId) as SentenceExtended;
    newSentence._intentBeforeClassification = intentBeforeClassification;
    if (isSelected) this.selection.select(newSentence);

    this.sentences.splice(originalIndex, 1, newSentence);
    this.resetIntentsListFilter();
  }

  resetIntentsListFilter(): void {
    this.filteredIntentGroups = of(this.intentGroups);
  }

  filterIntentsList(event: any): void {
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) return;

    let str = event.target.value.toLowerCase();
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

  onFocus(): void {
    this.resetIntentsListFilter();
  }
  onBlur(event: any): void {
    event.target.value = '';
  }

  swapStatsDetails(sentence: SentenceExtended): void {
    sentence._showStatsDetails = !sentence._showStatsDetails;
  }

  showDetails(sentence: SentenceExtended): void {
    this.onDetails.emit(sentence);
  }

  askForReview(sentence: SentenceExtended) {
    const dialogRef = this.nbDialogService.open(SentenceReviewRequestComponent, {
      context: {
        beforeClassification: sentence._intentBeforeClassification || sentence.classification.intentId,
        reviewComment: sentence.reviewComment
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result && result.status === 'confirm') {
        sentence.forReview = true;
        sentence.reviewComment = result.description;
        this.handleAction(Action.VALIDATE, sentence);
      }
    });
  }

  handleAction(action: Action, sentence: SentenceExtended): void {
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

  isSentenceSelected(sentence: SentenceExtended): boolean {
    return this.selection.isSelected(sentence);
  }

  toggle(sentence: SentenceExtended): void {
    this.selection.toggle(sentence);
  }

  toggleSort(): void {
    this.isSorted = !this.isSorted;
    this.onSort.emit(this.isSorted);
  }

  normalizeString(str: string): string {
    /*
      Remove diacrtitics
      Remove western punctuations
      Remove spaces
    */
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`'~()?]/g, '')
      .replace(/\s+/g, '');
  }

  getSentenceId(sentence: SentenceExtended): string {
    return `stnc_${this.normalizeString(sentence.text)}`;
  }

  scrollToSentence(sentence: SentenceExtended): void {
    const id = this.getSentenceId(sentence);
    const nativeElement: HTMLElement = this.elementRef.nativeElement;
    const found: Element | null = nativeElement.querySelector(`#${id}`);
    if (found) found.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
  }

  async copySentence(sentence) {
    await navigator.clipboard.writeText(sentence.getText());
    this.toastrService.success(`Sentence copied to clipboard`, 'Clipboard');
  }

  createNewIntent(sentence: SentenceExtended) {
    const dialogRef = this.nbDialogService.open(IntentDialogComponent, { context: { create: true } });

    dialogRef.onClose.subscribe((result) => {
      if (result && result.name) {
        this.createIntent(sentence, result.name, result.label, result.description, result.category);
      }
    });
  }

  private createIntent(sentence: SentenceExtended, name: string, label: string, description: string, category: string): void {
    if (
      StateService.intentExistsInApp(this.state.currentApplication, name) ||
      name === nameFromQualifiedName(Intent.unknown) ||
      name === nameFromQualifiedName(Intent.ragExcluded)
    ) {
      this.toastrService.warning(`Intent ${name} already exists`);
    } else {
      if (this.state.intentExistsInOtherApplication(name)) {
        const dialogRef = this.nbDialogService.open(ConfirmDialogComponent, {
          context: {
            title: 'This intent is already used in an other application',
            subtitle: 'If you confirm the name, the intent will be shared between the two applications.',
            action: 'Confirm'
          }
        });
        dialogRef.onClose.subscribe((result) => {
          if (result === 'confirm') {
            this.saveIntent(sentence, name, label, description, category);
          }
        });
      } else {
        this.saveIntent(sentence, name, label, description, category);
      }
    }
  }

  private saveIntent(sentence: SentenceExtended, name: string, label: string, description: string, category: string) {
    this.nlp
      .saveIntent(
        new Intent(name, this.state.user.organization, [], [this.state.currentApplication._id], [], [], label, description, category)
      )
      .subscribe({
        next: (intent) => {
          this.state.addIntent(intent);

          sentence.classification.intentId = intent._id;
          const oldSentenceIndex = this.sentences.findIndex((s) => s === sentence);
          const oldSentence = sentence;

          const newSentence = oldSentence.clone();
          newSentence.classification.intentId = intent._id;
          newSentence.classification.entities = oldSentence.classification.entities.filter(
            (e) => intent && intent.containsEntity(e.type, e.role)
          );

          this.sentences.splice(oldSentenceIndex, 1, newSentence);
          this.cd.markForCheck();
        },
        error: () => {
          this.toastrService.warning(`Error on intent creation`);
        }
      });
  }
}
