import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NbAlertModule,
  NbAutocompleteModule,
  NbButtonModule,
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
import { SharedModule } from '../shared-nlp/shared.module';
import { MomentModule } from 'ngx-moment';
import { SentencesService } from '../faq/common/sentences.service';
import { FaqManagementFiltersComponent } from './faq-management/faq-management-filters/faq-management-filters.component';
import { FaqManagementListComponent } from './faq-management/faq-management-list/faq-management-list.component';
import { FaqManagementEditComponent } from './faq-management/faq-management-edit/faq-management-edit.component';
import { BotSharedModule } from '../shared/bot-shared.module';
import { FaqManagementSettingsComponent } from './faq-management/faq-management-settings/faq-management-settings.component';
import { FaqDefinitionService } from '../faq/common/faq-definition.service';

@NgModule({
  imports: [
    BotSharedModule,
    CommonModule,
    FaqRoutingModule,
    NlpModule,
    MomentModule,
    SharedModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTagModule,
    NbTabsetModule,
    NbTooltipModule,
    NbAutocompleteModule,
    NbAlertModule
  ],
  declarations: [
    FaqManagementComponent,
    FaqTrainingComponent,
    FaqTrainingFiltersComponent,
    FaqTrainingListComponent,
    FaqManagementFiltersComponent,
    FaqManagementListComponent,
    FaqManagementEditComponent,
    FaqManagementSettingsComponent
  ],
  exports: [],
  providers: [SentencesService, FaqDefinitionService]
})
export class FaqModule {}
