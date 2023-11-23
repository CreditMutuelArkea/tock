import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SentenceTrainingFilter, SentenceTrainingMode } from './../models';
import { Options } from '@angular-slider/ngx-slider';
import { EntityType, Intent, IntentsCategory, SentenceStatus } from '../../../../model/nlp';
import { StateService } from '../../../../core-nlp/state.service';
import { NlpService } from '../../../../nlp-tabs/nlp.service';

interface SentenceTrainingFilterForm {
  search: FormControl<string>;
  showUnknown: FormControl<boolean>;
  status: FormControl<SentenceStatus | ''>;
  onlyToReview: FormControl<boolean>;
  intent: FormControl<Intent>;
  modifiedBefore: FormControl<Date>;
  modifiedAfter: FormControl<Date>;
  intentProbability: FormControl<number[]>;
  user: FormControl<string>;
  allButUser: FormControl<string>;
  configuration: FormControl<string>;
}

@Component({
  selector: 'tock-sentence-training-filters',
  templateUrl: './sentence-training-filters.component.html',
  styleUrls: ['./sentence-training-filters.component.scss']
})
export class SentenceTrainingFiltersComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  @Input() sentenceTrainingMode: SentenceTrainingMode;

  SentenceTrainingMode = SentenceTrainingMode;

  @Output() onFilter = new EventEmitter<SentenceTrainingFilter>();

  advanced: boolean = true;

  sentenceStatus = SentenceStatus;

  users: string[];

  configurations: string[];

  filteredIntentsGroups$: Observable<IntentsCategory[]>;

  constructor(public state: StateService, private nlp: NlpService) {}

  form = new FormGroup<SentenceTrainingFilterForm>({
    search: new FormControl(),
    showUnknown: new FormControl(false),
    status: new FormControl(''),
    onlyToReview: new FormControl(),
    intent: new FormControl(),
    modifiedBefore: new FormControl(),
    modifiedAfter: new FormControl(),
    intentProbability: new FormControl([0, 100]),
    user: new FormControl(),
    allButUser: new FormControl(),
    configuration: new FormControl()
  });

  get search(): FormControl {
    return this.form.get('search') as FormControl;
  }

  get showUnknown(): FormControl {
    return this.form.get('showUnknown') as FormControl;
  }

  get status(): FormControl {
    return this.form.get('status') as FormControl;
  }

  get onlyToReview(): FormControl {
    return this.form.get('onlyToReview') as FormControl;
  }

  get intent(): FormControl {
    return this.form.get('intent') as FormControl;
  }

  get modifiedBefore(): FormControl {
    return this.form.get('modifiedBefore') as FormControl;
  }

  get modifiedAfter(): FormControl {
    return this.form.get('modifiedAfter') as FormControl;
  }

  ngOnInit(): void {
    this.nlp.findUsers(this.state.currentApplication).subscribe((u) => {
      this.users = u;
    });

    this.nlp.findConfigurations(this.state.currentApplication).subscribe((res) => {
      this.configurations = res;
    });

    this.onlyToReview.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((state: boolean) => {
      if (state) {
        this.form.patchValue({
          status: ''
        });
      }
    });

    this.status.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((status: SentenceStatus | '') => {
      if (status !== '') {
        this.form.patchValue({
          onlyToReview: false
        });
      }
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe(() => {
      const formValue = this.form.value;
      console.log(formValue);
      const payload = {
        search: formValue.search,
        status: [],
        onlyToReview: formValue.onlyToReview,
        intentId: formValue.intent?._id,
        modifiedBefore: formValue.modifiedBefore,
        modifiedAfter: formValue.modifiedAfter,
        minIntentProbability: formValue.intentProbability[0],
        maxIntentProbability: formValue.intentProbability[1],
        user: formValue.user,
        allButUser: formValue.allButUser,
        configuration: formValue.configuration
      } as SentenceTrainingFilter;

      if (formValue.status !== '') {
        payload.status = [this.status.value];
      }

      console.log(payload);
      this.onFilter.emit(payload as SentenceTrainingFilter);
    });
  }

  swapAdvanced(): void {
    this.advanced = !this.advanced;
  }

  resetControl(ctrl: FormControl, input?: HTMLInputElement): void {
    ctrl.reset();
    if (input) {
      input.value = '';
    }
  }

  filterIntentsList(event: any): void {
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) return;

    let str = event.target.value.toLowerCase();
    let result: IntentsCategory[] = [];
    this.state.currentIntentsCategories.getValue().forEach((group) => {
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
    this.filteredIntentsGroups$ = of(result);
  }

  setIntentsListFilter(): void {
    this.filteredIntentsGroups$ = of(this.state.currentIntentsCategories.getValue());
  }

  onFocusIntentsInput(): void {
    this.setIntentsListFilter();
  }

  onBlurIntentsInput(event: any): void {
    if (!this.intent.value) event.target.value = '';
    else {
      event.target.value = this.intent.value.label || this.intent.value.name;
    }
  }

  intentsAutocompleteViewHandle(stringOrIntent: string | Intent) {
    if (typeof stringOrIntent === 'object') {
      return stringOrIntent?.label || stringOrIntent?.name || '';
    } else {
      return stringOrIntent;
    }
  }

  unknownIntent: Partial<Intent> = {
    label: 'Unknown',
    _id: Intent.unknown
  };

  selectIntent(intent: Intent) {
    this.intent.patchValue(intent);
  }

  updateFilter(filter): void {
    this.form.patchValue({
      search: filter.text,
      showUnknown: filter.showUnknown
    });
  }

  intentProbaSliderOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 1,
    noSwitching: true,
    translate: (value: number): string => {
      return `${value}%`;
    }
  };

  entityTypes: EntityType[];

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
