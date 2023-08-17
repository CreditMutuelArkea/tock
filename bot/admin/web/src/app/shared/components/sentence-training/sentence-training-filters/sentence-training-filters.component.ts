import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { FaqTrainingFilter, SentenceTrainingMode } from './../models';

interface FaqTrainingFilterForm {
  search: FormControl<string>;
  showUnknown: FormControl<boolean>;
}

@Component({
  selector: 'tock-sentence-training-filters',
  templateUrl: './sentence-training-filters.component.html',
  styleUrls: ['./sentence-training-filters.component.scss']
})
export class SentenceTrainingFiltersComponent implements OnInit, OnDestroy {
  @Input() sentenceTrainingMode: SentenceTrainingMode;
  SentenceTrainingMode = SentenceTrainingMode;

  @Output() onFilter = new EventEmitter<FaqTrainingFilter>();

  private _subscription = new Subscription();

  form = new FormGroup<FaqTrainingFilterForm>({
    search: new FormControl(),
    showUnknown: new FormControl(false)
  });

  get search(): FormControl {
    return this.form.get('search') as FormControl;
  }

  get showUnknown(): FormControl {
    return this.form.get('showUnknown') as FormControl;
  }

  ngOnInit(): void {
    this._subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.onFilter.emit(this.form.value as FaqTrainingFilter);
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  clearSearch(): void {
    this.search.reset();
  }

  updateFilter(filter: FaqTrainingFilter): void {
    this.form.patchValue(filter);
  }
}
