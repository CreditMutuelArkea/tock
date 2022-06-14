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

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NbTagInputAddEvent} from '@nebular/theme/components/tag/tag-input.directive';
import {NbTagComponent} from '@nebular/theme/components/tag/tag.component';
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject} from 'rxjs';
import {concatMap, debounceTime, filter, map, startWith, take, takeUntil} from 'rxjs/operators';
import {DialogService} from 'src/app/core-nlp/dialog.service';
import {notCancelled, ValidUtteranceResult} from 'src/app/faq/common/components/edit-utterance/edit-utterance-result';
import {EditUtteranceComponent} from 'src/app/faq/common/components/edit-utterance/edit-utterance.component';
import {FaqDefinition} from 'src/app/faq/common/model/faq-definition';
import {Utterance, utteranceEquals, utteranceSomewhatSimilar} from 'src/app/faq/common/model/utterance';
import {ActionResult, FaqEditorEvent, FaqDefinitionSidepanelEditorService} from '../faq-definition-sidepanel-editor.service';
import {getPosition, hasItem} from '../../../common/util/array-utils';
import {somewhatSimilar} from 'src/app/faq/common/util/string-utils';
import {FaqDefinitionService} from 'src/app/faq/common/faq-definition.service';
import {EditorTabName} from '../../faq-definition.component';
import {
  ANSWER_MAXLENGTH,
  collectProblems,
  DEFAULT_ERROR_MAPPING,
  DESCRIPTION_MAXLENGTH,
  FormProblems,
  isControlAlert,
  NAME_MAXLENGTH,
  NAME_MINLENGTH,
  NoProblems
} from '../../../common/model/form-problems';
import { StateService } from 'src/app/core-nlp/state.service';
import { ConfirmDialogComponent } from 'src/app/shared-nlp/confirm-dialog/confirm-dialog.component';
import { Intent } from 'src/app/model/nlp';

type DialogEvent = 'EditFaq' | 'IntentExistsInApp' | 'DoNotShareExistingIntent' | 'ShareExistingIntentWithApplication' | 'IntentNotExistsInAllApplications'
const UNQUALIFIED_UNKNOWN_NAME = Intent.unknown.split(":")[1];

// Simple builder for text 'utterance predicate'
function textMatch(text: string): (Utterance) => boolean {
  if (!text?.trim()) {
    return _ => true;
  }
  const lowerText = text.trim().toLowerCase();

  return (u: Utterance) => {
    const lowerUtteranceText = (u || '').toLowerCase();
    return lowerUtteranceText.includes(lowerText);
  };
}

/**
 * Content for FAQ Edition sidepanel
 *
 * Handle both 'New' and 'Edit existing' cases
 *
 * Note: Everything is in this single component because we consider all tabs as a single form
 */
@Component({
  selector: 'tock-qa-sidepanel-editor-content',
  templateUrl: './faq-sidepanel-editor-content.component.html',
  styleUrls: ['./faq-sidepanel-editor-content.component.scss'],
  host: {
    "class": "h-100 d-flex flex-column justify-content-start align-items-stretch"
  }
})
export class FaqSidepanelEditorContentComponent implements OnInit, OnDestroy, OnChanges {
  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  @Input()
  tabName: EditorTabName;

  @Input()
  fq?: FaqDefinition;

  @Output()
  validityChanged = new EventEmitter<FormProblems>();

  /* Form Data */

  tags: Set<string> = new Set();

  editedUtterances$: ReplaySubject<Utterance[]> = new ReplaySubject(1);

  readonly newFaqForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(NAME_MINLENGTH),
      Validators.maxLength(NAME_MAXLENGTH)
    ]),
    description: new FormControl('', [
      Validators.maxLength(DESCRIPTION_MAXLENGTH)
    ]),
    answer: new FormControl('', [
      Validators.required,
      Validators.maxLength(ANSWER_MAXLENGTH)
    ]),
    active: new FormControl(true, [
      Validators.required
    ]),
  });

  /* Search */

  search?: string;
  searchSubject$: BehaviorSubject<string> = new BehaviorSubject('');
  displayedUtterances$: Observable<Utterance[]>;
  utteranceTouched = false;

  public readonly ERR_MSG = DEFAULT_ERROR_MAPPING; // shorcut for access inside template

  constructor(
    private readonly state: StateService,
    private readonly sidepanelEditorService: FaqDefinitionSidepanelEditorService,
    private readonly qaService: FaqDefinitionService,
    private readonly dialog: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.observeUtteranceSearch();
    this.observeValidity();
    this.registerSaveAction();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }): any {
    if (changes.hasOwnProperty('fq')) {
      this.updateForm(changes?.fq?.currentValue);
    }
  }

  observeUtteranceSearch(): void {
    this.displayedUtterances$ = combineLatest(this.editedUtterances$, this.searchSubject$).pipe(
      // unsubscribe handled by angular template mechanism
      takeUntil(this.destroy$),
      debounceTime(200),
      map(([utterances, search]) => {
        const res = utterances.filter(textMatch(search));

        res.sort((a, b) => (a || '').localeCompare(b || ''));
        return res;
      })
    );
  }

  observeValidity(): void {
    const valueChanges$ = this.newFaqForm.valueChanges
      .pipe(
        startWith(null), // so combineLatest just has to wait for first editedUtterances$ event
        takeUntil(this.destroy$),
        debounceTime(200)
      );

    combineLatest(this.editedUtterances$, valueChanges$)
      .pipe(
        map(([utterances, _]) => this.buildProblemsReport(this.newFaqForm, utterances))
      )
      .subscribe(problems => this.validityChanged.next(problems));
  }

  registerSaveAction(): void {
    // listen to event 'save'
    this.sidepanelEditorService.registerActionHandler('save', this.destroy$, this.save.bind(this));
  }

  save(evt: FaqEditorEvent): Observable<ActionResult> {
    // replay last known utterances array
    return this.editedUtterances$.pipe(take(1), concatMap(async utterances => {
      const faqTitle = this.newFaqForm.controls['name'].value.trim() || ''

      // validate and construct entity from form data
      const fq: FaqDefinition = {
        id: this.fq.id,
        intentId: this.fq.intentId,
        applicationId: this.fq.applicationId,
        language: this.fq.language,
        tags: Array.from(this.tags).map(el => el.trim()),
        description: this.newFaqForm.controls['description'].value.trim(),
        answer: this.newFaqForm.controls['answer'].value.trim(),
        title: faqTitle,
        intentName: this.formatName(faqTitle),
        status: this.fq.status,
        utterances: Array.from(utterances.map(el => el.trim())),
        enabled: this.newFaqForm.controls['active'].value
      };

      const canSave = await this.canSaveIntent(fq)
      if(canSave === 'DoNotShareExistingIntent') {
        fq.intentName = this.generateIntentName(fq)
      }

      if(canSave !== 'IntentExistsInApp'){
        return this.qaService.save(fq, this.destroy$).pipe(
          map(fq => {
            const res: ActionResult = {
              outcome: 'save-done',
              payload: fq
            };
            return res;
          })
        ).toPromise();
      } else {
        const res: ActionResult = {
          outcome: 'cancel-save',
          payload: null
        };
        return res;
      }
    }));
  }

  private formatName(faqTitle?: string): string {
    if (faqTitle) {
      return faqTitle
        .replace(/[^A-Za-z_-]*/g, '')
        .toLowerCase()
        .trim();
    }
  }

  private generateIntentName(fq : FaqDefinition): string {
    let candidate = fq.intentName;
    let count = 1;
    const candidateBase = candidate;
    while (this.state.intentExists(candidate)) {
      candidate = candidateBase + count++;
    }
    return candidate;
  }

  private canSaveIntent(fq : FaqDefinition): Promise<DialogEvent> {
    if(fq.intentId){
      return Promise.resolve('EditFaq');
    }

    if (StateService.intentExistsInApp(this.state.currentApplication, fq.intentName) || fq.intentName === UNQUALIFIED_UNKNOWN_NAME) {
      this.dialog.notify(`Intent ${fq.intentName} already exists`, 'Cancelled',
        {duration: 5000, status: "warning"});
      return Promise.resolve('IntentExistsInApp');
    }

    if (this.state.intentExistsInOtherApplication(fq.intentName)) {
      const dialogRef = this.dialog.openDialog(ConfirmDialogComponent, {
        context: {
          title: 'This intent is already used in an other application',
          subtitle: 'If you confirm the name, the intent will be shared between the two applications.',
          action: 'Confirm'
        }
      });
      return dialogRef.onClose.pipe(
        map(res => {
          let dialogEvent : DialogEvent = 'DoNotShareExistingIntent';
          if (res === 'confirm'){
            dialogEvent = 'ShareExistingIntentWithApplication';
          }
          return dialogEvent;
        }, take(1))
      ).toPromise();
    } else {
      return Promise.resolve('IntentNotExistsInAllApplications');
    }
  }

  getControlStatus(controlName: string): 'success' | 'basic' | 'warning' {
    const control = this.newFaqForm.controls[controlName];

    if (control.dirty || control.touched) {
      if (control.invalid) {
        return 'warning';
      } else {
        return 'success';
      }
    } else {
      return 'basic';
    }
  }

  getTagControlStatus(): 'success' | 'basic' {
    if (this.tags.size) {
      return 'success';
    } else {
      return 'basic';
    }
  }

  isControlAlert(controlName: string): boolean {
    const control = this.newFaqForm.controls[controlName];

    return isControlAlert(control);
  }

  updateForm(fq?: FaqDefinition): void {
    if (fq) {
      const utterances = JSON.parse(JSON.stringify(fq.utterances)); // deep clone

      this.editedUtterances$.next(utterances);

      this.newFaqForm.setValue({
        name: '' + (fq.title || ''),
        description: '' + (fq.description || ''),
        answer: '' + (fq.answer || ''),
        active: fq.enabled === true
      });
      this.tags = new Set<string>(fq.tags.slice());

      this.validityChanged.emit(this.buildProblemsReport(this.newFaqForm, utterances)); // initial event value
    } else {
      this.editedUtterances$.next([]);
      this.newFaqForm.setValue({
        name: '',
        description: '',
        answer: '',
        active: false
      });
      this.tags = new Set<string>();

      this.validityChanged.emit(NoProblems); // initial event value
    }

    this.utteranceTouched = false;
  }

  public onTagRemove(tagToRemove: NbTagComponent): void {
    this.tags.delete(tagToRemove.text);
  }

  public onTagAdd({ value, input }: NbTagInputAddEvent): void {
    if (value) {
      this.tags.add(value);
    }
    input.nativeElement.value = '';
  }

  handleKeyEnter(evt) {
    evt.preventDefault(); // fix weird behavior
  }

  utteranceSearchChange(e) {
    this.searchSubject$.next(e.target.value);
  }

  private buildProblemsReport(form: FormGroup, utterances: Utterance[]): FormProblems {
    // validation is not only function of angular Form errors but also overall component errors
    const overallValid = form.valid && !!utterances?.length;

    // when everythings is ok, report no problems
    if (overallValid) {
      return NoProblems;
    }

    // else grab angular form errors if any
    const problems = collectProblems(form, this.ERR_MSG);

    // also grab other errors if any
    if (!utterances?.length && this.utteranceTouched) {
      problems.items.push({
        controlLabel: 'Questions',
        errorLabel: this.ERR_MSG.utterances_required
      });
    }

    return problems;
  }

  private removeFromUtterances(u: Utterance): void {
    this.utteranceTouched = true;

    // get array
    this.editedUtterances$.pipe(take(1)).subscribe((arr) => {
      // find existing item location
      const index = getPosition(arr, u, utteranceEquals);

      // Remove utterance
      const updatedArr = arr.slice();
      updatedArr.splice(index, 1);

      // publish updated array
      this.editedUtterances$.next(updatedArr);
    });
  }

  private appendToUtterances(u: Utterance): void {
    this.utteranceTouched = true;

    // get array
    this.editedUtterances$.pipe(take(1)).subscribe((arr) => {
      let updatedArr: Utterance[];

      if (hasItem(arr, u, utteranceSomewhatSimilar)) {
        // if we found similar item
        // replace that similar item
        updatedArr = arr.slice();
        const index = getPosition(arr, u, utteranceSomewhatSimilar);
        updatedArr.splice(index, 1, u);
      } else {
        // else it means that item is new
        updatedArr = arr.concat([u]);
      }

      // publish updated array
      this.editedUtterances$.next(updatedArr);
    });
  }

  private replaceUtterance(oldVersion: Utterance, newVersion: Utterance): void {
    if (oldVersion === newVersion) {
      return;
    }
    this.utteranceTouched = true;

    // get array
    this.editedUtterances$.pipe(take(1)).subscribe((arr) => {
      const updatedArr = arr.slice(); // copy

      // when edited value is already elsewhere
      if (hasItem(arr, newVersion, utteranceSomewhatSimilar)) {
        // get that elsewhere position
        const targetedIndex = getPosition(arr, newVersion, utteranceSomewhatSimilar);

        // remove edited position because value is now represented in another existing position
        const prevIndex = getPosition(arr, oldVersion, utteranceEquals);

        updatedArr.splice(targetedIndex, 1, newVersion);

        // when edited position
        if (prevIndex !== targetedIndex) {
          updatedArr.splice(prevIndex, 1);
        }
      } else {
        // when edited value is not elsewhere

        // replace value at edited position
        const prevIndex = getPosition(arr, oldVersion, utteranceEquals);
        updatedArr.splice(prevIndex, 1, newVersion);
      }

      // publish updated array
      this.editedUtterances$.next(updatedArr);
    });
  }

  edit(utterance: Utterance): void {
    const origValue = utterance || '';

    // ask user to modify its utterance
    const dialogRef = this.dialog.openDialog(
      EditUtteranceComponent,
      {
        context:
          {
            value: '' + origValue,
            title: 'Edit training question',
            mode : "edit"
          }
      }
    );

    // wait for user response
    dialogRef.onClose
      .pipe(take(1), takeUntil(this.destroy$), filter(notCancelled))
      .subscribe((result: ValidUtteranceResult) => {
        const newVersion: Utterance = '' + (result.value || '');

        this.replaceUtterance(utterance, newVersion);
      });
  }

  remove(utterance: Utterance): void {
    this.removeFromUtterances(utterance);
  }

  utteranceLookupFor(utterances: Utterance[]): (string) => Utterance | null {
    return (search) => {
      return utterances.filter((u) => somewhatSimilar(u, search))[0] || null;
    };
  }

  async addUtterance(): Promise<any> {
    const allUtterances = await this.editedUtterances$.pipe(take(1)).toPromise();

    const dialogRef = this.dialog.openDialog(
      EditUtteranceComponent,
      {
        context:
          {
            value: '',
            title: 'New training question',
            lookup: this.utteranceLookupFor(allUtterances),
            mode : "add",
            saveAction : (utterance) => {
              this.appendToUtterances('' + (utterance || ''));
            }
          }
      }
    );
    dialogRef.onClose
      .pipe(take(1), takeUntil(this.destroy$), filter(notCancelled))
      .subscribe((result: ValidUtteranceResult) => {
        this.appendToUtterances('' + (result?.value || ''));
      });
  }
}
