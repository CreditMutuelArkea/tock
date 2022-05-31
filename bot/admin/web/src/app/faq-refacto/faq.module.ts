import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule
} from '@nebular/theme';
import { NlpModule } from '../nlp-tabs/nlp.module';

import { FaqManagementComponent } from './faq-management/faq-management.component';
import { FaqRoutingModule } from './faq-routing.module';
import { FaqTrainingFiltersComponent } from './faq-training/faq-training-filters/faq-training-filters.component';
import { FaqTrainingComponent } from './faq-training/faq-training.component';
import { FaqTrainingListComponent } from './faq-training/faq-training-list/faq-training-list.component';

@NgModule({
  imports: [
    CommonModule,
    FaqRoutingModule,
    ReactiveFormsModule,
    NlpModule,
    NbCardModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbSpinnerModule
  ],
  declarations: [FaqManagementComponent, FaqTrainingComponent, FaqTrainingFiltersComponent, FaqTrainingListComponent],
  exports: [],
  providers: []
})
export class FaqModule {}
