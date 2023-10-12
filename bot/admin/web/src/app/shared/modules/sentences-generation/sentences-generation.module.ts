import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbToggleModule,
  NbTooltipModule,
  NbListModule,
  NbSpinnerModule,
  NbAlertModule,
  NbInputModule,
  NbSelectModule
} from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  SentencesGenerationContentComponent,
  SentencesGenerationListComponent,
  SentencesGenerationOptionsComponent,
  SentencesGenerationWrapperComponent
} from './components';
import { SentencesGenerationService } from './services';

@NgModule({
  declarations: [
    SentencesGenerationContentComponent,
    SentencesGenerationListComponent,
    SentencesGenerationOptionsComponent,
    SentencesGenerationWrapperComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbCheckboxModule,
    NbToggleModule,
    NbIconModule,
    NbButtonModule,
    NbTooltipModule,
    NbListModule,
    NbSpinnerModule,
    NbAlertModule,
    NbInputModule,
    NbSelectModule
  ],
  exports: [SentencesGenerationContentComponent, SentencesGenerationWrapperComponent],
  providers: [SentencesGenerationService]
})
export class SentencesGenerationModule {}
