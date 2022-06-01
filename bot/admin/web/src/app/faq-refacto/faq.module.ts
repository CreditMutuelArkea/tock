import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbCheckboxModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTabsetModule,
  NbTagModule,
  NbTooltipModule
} from '@nebular/theme';
import { NlpModule } from '../nlp-tabs/nlp.module';

import { FaqManagementComponent } from './faq-management/faq-management.component';
import { FaqRoutingModule } from './faq-routing.module';
import { FaqTrainingFiltersComponent } from './faq-training/faq-training-filters/faq-training-filters.component';
import { FaqTrainingComponent } from './faq-training/faq-training.component';
import { FaqTrainingListComponent } from './faq-training/faq-training-list/faq-training-list.component';
import { FaqManagementFiltersComponent } from './faq-management/faq-management-filters/faq-management-filters.component';
import { FaqManagementListComponent } from './faq-management/faq-management-list/faq-management-list.component';
import { FaqManagementEditComponent } from './faq-management/faq-management-edit/faq-management-edit.component';
import { BotSharedModule } from '../shared/bot-shared.module';
import { SharedModule } from '../shared-nlp/shared.module';

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
    NbSpinnerModule,
    NbSelectModule,
    NbTagModule,
    NbTabsetModule,
    NbCheckboxModule,
    NbTooltipModule,
    SharedModule,
    BotSharedModule
  ],
  declarations: [
    FaqManagementComponent,
    FaqTrainingComponent,
    FaqTrainingFiltersComponent,
    FaqTrainingListComponent,
    FaqManagementFiltersComponent,
    FaqManagementListComponent,
    FaqManagementEditComponent
  ],
  exports: [],
  providers: []
})
export class FaqModule {}
