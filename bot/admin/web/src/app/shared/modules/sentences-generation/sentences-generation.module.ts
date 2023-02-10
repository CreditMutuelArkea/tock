import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SentencesGenerationComponent } from './sentences-generation-content/sentences-generation.component';
import { SentencesGenerationWrapperComponent } from './sentences-generation-wrapper/sentences-generation-wrapper.component';
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

@NgModule({
  declarations: [SentencesGenerationComponent, SentencesGenerationWrapperComponent],
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
  exports: [SentencesGenerationComponent, SentencesGenerationWrapperComponent]
})
export class SentencesGenerationModule {}
