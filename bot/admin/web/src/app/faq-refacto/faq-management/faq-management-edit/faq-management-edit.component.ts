import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbTagComponent, NbTagInputAddEvent } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogService } from '../../../core-nlp/dialog.service';
import { StateService } from '../../../core-nlp/state.service';
import { PaginatedQuery } from '../../../model/commons';
import { Intent, SearchQuery } from '../../../model/nlp';
import { NlpService } from '../../../nlp-tabs/nlp.service';
import { ConfirmDialogComponent } from '../../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { FaqDefinition } from '../../models';

@Component({
  selector: 'tock-faq-management-edit',
  templateUrl: './faq-management-edit.component.html',
  styleUrls: ['./faq-management-edit.component.scss']
})
export class FaqManagementEditComponent implements OnInit, OnChanges {
  @Input()
  loading: boolean;

  @Input()
  faq?: FaqDefinition;

  @Input()
  faqs?: FaqDefinition[];

  @Output()
  handleClose = new EventEmitter<boolean>();

  @Output()
  handleSave = new EventEmitter();

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

  isSubmitted: boolean = false;

  currentTab = 'info';

  controlsMaxLength = {
    description: 500,
    answer: 960
  };

  setCurrentTab($event) {
    this.currentTab = $event.tabTitle;
    if ($event.tabTitle == 'info') {
      this.nameInput?.nativeElement.focus();
      setTimeout(() => {
        this.nameInput?.nativeElement.focus();
      });
    }
    if ($event.tabTitle == 'question') {
      this.addUtteranceInput?.nativeElement.focus();
      setTimeout(() => {
        this.addUtteranceInput?.nativeElement.focus();
      });
    }
    if ($event.tabTitle == 'answer') {
      this.answerInput?.nativeElement.focus();
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
    description: new FormControl(
      undefined,
      Validators.maxLength(this.controlsMaxLength.description)
    ),
    tags: new FormArray([]),
    utterances: new FormArray([], Validators.required),
    answer: new FormControl(undefined, [
      Validators.required,
      Validators.maxLength(this.controlsMaxLength.answer)
    ])
  });

  getControlLengthIndicatorClass(controlName) {
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

  ngOnInit(): void {}

  tagsAutocompleteValues: Observable<any[]>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.faq?.currentValue) {
      const faq: FaqDefinition = changes.faq.currentValue;

      this.form.reset();
      this.tags.clear();
      this.utterances.clear();
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
      }

      if (!faq.id) {
        this.setCurrentTab({ tabTitle: 'info' });
      }
    }

    this.tagsAutocompleteValues = of([
      ...new Set(
        [].concat.apply(
          [],
          this.faqs.map((v) => v.tags)
        )
      )
    ]);
  }

  tagSelected($event) {
    this.onTagAdd({ value: $event, input: this.tagInput });
  }

  onTagAdd({ value, input }: NbTagInputAddEvent): void {
    if (value && !this.tags.value.find((v: string) => v.toUpperCase() === value.toUpperCase())) {
      this.tags.push(new FormControl(value));
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

  normalizeString(str) {
    /*
      Remove diacrtitics
      Trim
      toLowerCase
      Remove western punctuations
      Deduplicate spaces
    */
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .replace(/\s\s+/g, ' ');
  }

  utterancesInclude(str) {
    return this.utterances.controls.find((u) => {
      return this.normalizeString(u.value) == this.normalizeString(str);
    });
  }

  existingUterranceInOtherintent: string;
  lookingForSameUterranceInOtherInent: boolean = false;

  resetAlerts() {
    this.existingUterranceInOtherintent = undefined;
  }

  addUtterance() {
    this.existingUterranceInOtherintent = undefined;

    let utterance = this.addUtteranceInput.nativeElement.value.trim();
    if (utterance) {
      if (!this.utterancesInclude(utterance)) {
        this.lookingForSameUterranceInOtherInent = true;
        const searchQuery: SearchQuery = this.createSearchIntentsQuery({
          searchString: utterance
        });

        this.nlp
          .searchSentences(searchQuery)
          .pipe(take(1))
          .subscribe((res) => {
            let existingIntentId;
            res.rows.forEach((sentence) => {
              if (this.normalizeString(sentence.text) == this.normalizeString(utterance)) {
                if (
                  !this.faq.intentId ||
                  (sentence.classification.intentId != Intent.unknown &&
                    sentence.classification.intentId != this.faq.intentId)
                ) {
                  existingIntentId = sentence.classification.intentId;
                }
              }
            });

            if (existingIntentId) {
              let intent = this.state.findIntentById(existingIntentId);
              this.existingUterranceInOtherintent = intent.label || intent.name;
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
  editUtterance(utterance) {
    this.utterances.controls.forEach((c) => {
      delete c['_edit'];
    });
    const ctrl = this.utterances.controls.find((u) => u.value == utterance);
    this.utteranceEditionValue = ctrl.value;
    ctrl['_edit'] = true;
  }

  validateEditUtterance(utterance: FormControl) {
    utterance.setValue(this.utteranceEditionValue);
    this.cancelEditUtterance(utterance);
  }

  cancelEditUtterance(utterance: FormControl) {
    delete utterance['_edit'];
  }

  removeUtterance(utterance) {
    const index = this.utterances.controls.findIndex((u) => u.value == utterance);
    this.utterances.removeAt(index);
  }

  close(): void {
    if (this.form.dirty) {
      const validAction = 'yes';
      const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `Cancel ${this.faq?.id ? 'edit' : 'create'} faq`,
          subtitle: 'Are you sure you want to cancel ? Changes will not be saved.',
          action: validAction
        }
      });
      dialogRef.onClose.subscribe((result) => {
        if (result === validAction) {
          this.handleClose.emit(true);
        }
      });
    } else {
      this.handleClose.emit(true);
    }
  }

  save(): void {
    this.isSubmitted = true;

    if (this.canSave) {
      this.handleSave.emit({
        ...this.faq,
        ...this.form.value
      });
      if (!this.faq.id) this.handleClose.emit(true);
    }
  }

  eventPreventDefault(e: KeyboardEvent): void {
    e.preventDefault();
  }
}
