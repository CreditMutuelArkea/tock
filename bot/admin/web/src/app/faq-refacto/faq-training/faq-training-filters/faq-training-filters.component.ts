import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FaqTrainingFIlter } from '../../models';

@Component({
  selector: 'tock-faq-training-filters',
  templateUrl: './faq-training-filters.component.html',
  styleUrls: ['./faq-training-filters.component.scss']
})
export class FaqTrainingFiltersComponent implements OnInit {
  @Output()
  onFilter = new EventEmitter<FaqTrainingFIlter>();

  subscription = new Subscription();

  form = new FormGroup({
    search: new FormControl()
  });

  get search(): FormControl {
    return this.form.get('search') as FormControl;
  }

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.onFilter.emit(this.form.value as FaqTrainingFIlter);
    });
  }

  clearSearch() {
    this.search.reset();
  }
}
