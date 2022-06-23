import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbTabComponent, NbTagComponent, NbTagInputAddEvent } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { DialogService } from '../../../core-nlp/dialog.service';
import { StateService } from '../../../core-nlp/state.service';
import { PaginatedQuery } from '../../../model/commons';
import { Intent, SearchQuery, SentenceStatus } from '../../../model/nlp';
import { NlpService } from '../../../nlp-tabs/nlp.service';
import { ConfirmDialogComponent } from '../../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { ChoiceDialogComponent } from '../../../shared/choice-dialog/choice-dialog.component';
import { FaqDefinitionExtended } from '../faq-management.component';

enum FaqTabs {
  INFO = 'info',
  QUESTION = 'question',
  ANSWER = 'answer'
}

@Component({
  selector: 'tock-faq-management-edit',
  templateUrl: './faq-management-edit.component.html',
  styleUrls: ['./faq-management-edit.component.scss']
})
export class FaqManagementEditComponent implements OnChanges {
  @Input()
  loading: boolean;

  @Input()
  faq?: FaqDefinitionExtended;

  @Input()
  tagsCache?: string[];

  @Output()
  onClose = new EventEmitter<boolean>();

  @Output()
  onSave = new EventEmitter();

  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('answerInput') answerInput: ElementRef;
  @ViewChild('tagInput') tagInput: ElementRef;
  @ViewChild('addUtteranceInput') addUtteranceInput: ElementRef;
  @ViewChild('utterancesListWrapper') utterancesListWrapper: ElementRef;

  constructor(
    private dialogService: DialogService,
    private nlp: NlpService,
    private readonly state: StateService
  ) {}

  faqTabs: typeof FaqTabs = FaqTabs;

  isSubmitted: boolean = false;

  currentTab = FaqTabs.INFO;

  controlsMaxLength = {
    description: 500,
    answer: 960
  };

  setCurrentTab(tab: NbTabComponent): void {
    this.currentTab = tab.tabTitle as FaqTabs;
    if (tab.tabTitle == FaqTabs.INFO) {
      setTimeout(() => {
        this.nameInput?.nativeElement.focus();
      });
    }
    if (tab.tabTitle == FaqTabs.QUESTION) {
      setTimeout(() => {
        this.addUtteranceInput?.nativeElement.focus();
      });
    }
    if (tab.tabTitle == FaqTabs.ANSWER) {
      setTimeout(() => {
        this.answerInput?.nativeElement.focus();
      });
    }
  }

  form = new FormGroup({
    title: new FormControl(undefined, [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(40)
    ]),
    description: new FormControl('', Validators.maxLength(this.controlsMaxLength.description)),
    tags: new FormArray([]),
    utterances: new FormArray([], Validators.required),
    answer: new FormControl('', [
      Validators.required,
      Validators.maxLength(this.controlsMaxLength.answer)
    ])
  });

  getControlLengthIndicatorClass(controlName: string): string {
    if (this.form.controls[controlName].value.length > this.controlsMaxLength[controlName]) {
      return 'text-danger';
    }
    return 'text-muted';
  }

  get answer(): FormControl {
    return this.form.get('answer') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get title(): FormControl {
    return this.form.get('title') as FormControl;
  }

  get tags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  get utterances(): FormArray {
    return this.form.get('utterances') as FormArray;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  tagsAutocompleteValues: Observable<any[]>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.faq?.currentValue) {
      const faq: FaqDefinitionExtended = changes.faq.currentValue;

      this.form.reset();
      this.tags.clear();
      this.utterances.clear();
      this.resetAlerts();
      this.isSubmitted = false;

      if (faq) {
        this.form.patchValue(faq);

        if (faq.tags?.length) {
          faq.tags.forEach((tag) => {
            this.tags.push(new FormControl(tag));
          });
        }

        faq.utterances.forEach((utterance) => {
          this.utterances.push(new FormControl(utterance));
        });

        if (faq._initUtterance) {
          this.form.markAsDirty();
          this.form.markAsTouched();

          this.setCurrentTab({ tabTitle: FaqTabs.QUESTION } as NbTabComponent);

          setTimeout(() => {
            this.addUtterance(faq._initUtterance);
            delete faq._initUtterance;
          });
        }
      }

      if (!faq.id && !faq._initUtterance) {
        this.setCurrentTab({ tabTitle: FaqTabs.INFO } as NbTabComponent);
      }
    }

    this.tagsAutocompleteValues = of(this.tagsCache);
  }

  updateTagsAutocompleteValues(event: any) {
    this.tagsAutocompleteValues = of(
      this.tagsCache.filter((tag) => tag.toLowerCase().includes(event.target.value.toLowerCase()))
    );
  }

  tagSelected(value: string) {
    this.onTagAdd({ value, input: this.tagInput });
  }

  onTagAdd({ value, input }: NbTagInputAddEvent): void {
    let deduplicatedSpaces = value.replace(/\s\s+/g, ' ').toLowerCase();
    if (
      deduplicatedSpaces &&
      !this.tags.value.find((v: string) => v.toUpperCase() === deduplicatedSpaces.toUpperCase())
    ) {
      this.tags.push(new FormControl(deduplicatedSpaces));
      this.form.markAsDirty();
      this.form.markAsTouched();
    }

    input.nativeElement.value = '';
  }

  onTagRemove(tag: NbTagComponent): void {
    const tagToRemove = this.tags.value.findIndex((t: string) => t === tag.text);

    if (tagToRemove !== -1) {
      this.tags.removeAt(tagToRemove);
      this.form.markAsDirty();
      this.form.markAsTouched();
    }
  }

  normalizeString(str: string): string {
    /*
      Remove diacrtitics
      Trim
      Remove western punctuations
      Deduplicate spaces
    */
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .replace(/\s\s+/g, ' ');
  }

  utterancesInclude(str: string): AbstractControl | undefined {
    return this.utterances.controls.find((u) => {
      return this.normalizeString(u.value) == this.normalizeString(str);
    });
  }

  existingUterranceInOtherintent: string;
  lookingForSameUterranceInOtherInent: boolean = false;

  resetAlerts() {
    this.existingUterranceInOtherintent = undefined;
  }

  addUtterance(utt?) {
    this.resetAlerts();

    let utterance = utt || this.addUtteranceInput.nativeElement.value.trim();
    if (utterance) {
      if (!this.utterancesInclude(utterance)) {
        this.lookingForSameUterranceInOtherInent = true;
        const searchQuery: SearchQuery = this.createSearchIntentsQuery({
          searchString: utterance
        });

        this.nlp
          .searchSentences(searchQuery)
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              let existingIntentId;
              res.rows.forEach((sentence) => {
                if (this.normalizeString(sentence.text) == this.normalizeString(utterance)) {
                  if (
                    [SentenceStatus.model, SentenceStatus.validated].includes(sentence.status) &&
                    sentence.classification.intentId != Intent.unknown &&
                    (!this.faq.intentId || sentence.classification.intentId != this.faq.intentId)
                  ) {
                    existingIntentId = sentence.classification.intentId;
                  }
                }
              });
              if (existingIntentId) {
                let intent = this.state.findIntentById(existingIntentId);
                this.existingUterranceInOtherintent = intent?.label || intent?.name || '';
              } else {
                this.utterances.push(new FormControl(utterance));
                this.form.markAsDirty();
                setTimeout(() => {
                  this.addUtteranceInput?.nativeElement.focus();
                  this.utterancesListWrapper.nativeElement.scrollTop =
                    this.utterancesListWrapper.nativeElement.scrollHeight;
                });
              }
              this.lookingForSameUterranceInOtherInent = false;
            },
            error: () => {
              this.lookingForSameUterranceInOtherInent = false;
            }
          });
      }
      this.addUtteranceInput.nativeElement.value = '';
    }
  }

  createSearchIntentsQuery(params: { searchString?: string; intentId?: string }): SearchQuery {
    const cursor: number = 0;
    const paginatedQuery: PaginatedQuery = this.state.createPaginatedQuery(cursor);
    return new SearchQuery(
      paginatedQuery.namespace,
      paginatedQuery.applicationName,
      paginatedQuery.language,
      paginatedQuery.start,
      paginatedQuery.size,
      paginatedQuery.searchMark,
      params.searchString || null,
      params.intentId || null
    );
  }

  utteranceEditionValue: string;
  editUtterance(utterance: string): void {
    this.utterances.controls.forEach((c) => {
      delete c['_edit'];
    });
    const ctrl = this.utterances.controls.find((u) => u.value == utterance);
    this.utteranceEditionValue = ctrl.value;
    ctrl['_edit'] = true;
  }

  validateEditUtterance(utterance: FormControl): void {
    utterance.setValue(this.utteranceEditionValue);
    this.cancelEditUtterance(utterance);
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  cancelEditUtterance(utterance: FormControl): void {
    delete utterance['_edit'];
  }

  removeUtterance(utterance: string): void {
    const index = this.utterances.controls.findIndex((u) => u.value == utterance);
    this.utterances.removeAt(index);
    this.form.markAsDirty();
    this.form.markAsTouched();
  }

  close(): Observable<any> {
    const validAction = 'yes';
    if (this.form.dirty) {
      const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `Cancel ${this.faq?.id ? 'edit' : 'create'} faq`,
          subtitle: 'Are you sure you want to cancel ? Changes will not be saved.',
          action: validAction
        }
      });
      dialogRef.onClose.subscribe((result) => {
        if (result === validAction) {
          this.onClose.emit(true);
        }
      });
      return dialogRef.onClose;
    } else {
      this.onClose.emit(true);
      return of(validAction);
    }
  }

  getFormatedIntentName(): string {
    return this.title.value
      .replace(/[^A-Za-z_-]*/g, '')
      .toLowerCase()
      .trim();
  }

  checkIntentNameAndSave(): void {
    if (this.canSave) {
      let faqDFata = {
        ...this.faq,
        ...this.form.value
      };

      if (!this.faq.id) {
        faqDFata.intentName = this.getFormatedIntentName();

        let existsInApp = StateService.intentExistsInApp(
          this.state.currentApplication,
          faqDFata.intentName
        );

        if (existsInApp) {
          console.log('existsInApp', existsInApp);
          return;
        }

        let existsInOtherApp = this.state.intentExistsInOtherApplication(faqDFata.intentName);

        if (existsInOtherApp) {
          const shareAction = 'Share the intent';
          const createNewAction = 'Create a new intent';
          const dialogRef = this.dialogService.openDialog(ChoiceDialogComponent, {
            context: {
              title: `This intent is already used in an other application`,
              subtitle:
                'Do you want to share the intent between the two applications or create a new one ?',
              action1: shareAction,
              action2: createNewAction
            }
          });
          dialogRef.onClose.subscribe((result) => {
            if (result) {
              if (result == createNewAction) {
                faqDFata.intentName = this.generateIntentName(faqDFata);
              }
              this.save(faqDFata);
            }
          });
          return;
        }
      }

      this.save(faqDFata);
    }
  }

  private generateIntentName(fq: FaqDefinitionExtended): string {
    let candidate = fq.intentName;
    let count = 1;
    const candidateBase = candidate;
    while (this.state.intentExists(candidate)) {
      candidate = candidateBase + count++;
    }
    return candidate;
  }

  save(faqDFata): void {
    this.isSubmitted = true;
    this.onSave.emit(faqDFata);
    if (!this.faq.id) this.onClose.emit(true);
  }
}
