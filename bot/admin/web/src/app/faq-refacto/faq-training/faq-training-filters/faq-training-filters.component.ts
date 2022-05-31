import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'tock-faq-training-filters',
  templateUrl: './faq-training-filters.component.html',
  styleUrls: ['./faq-training-filters.component.scss']
})
export class FaqTrainingFiltersComponent implements OnInit {
  form = new FormGroup({
    search: new FormControl()
  });

  constructor() {}

  ngOnInit(): void {}
}
