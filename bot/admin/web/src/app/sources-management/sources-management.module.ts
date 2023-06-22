import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourcesManagementRoutingModule } from './sources-management-routing.module';
import { BoardComponent } from './board/board.component';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbTooltipModule
} from '@nebular/theme';
import { NewSourceComponent } from './board/new-source/new-source.component';
import { BotSharedModule } from '../shared/bot-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SourcesProcessingComponent } from './sources-processing/sources-processing.component';
import { QuestionsGenerationComponent } from './questions-generation/questions-generation.component';
import { FaqsGenerationComponent } from './faqs-generation/faqs-generation.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SelectByLengthComponent } from './sources-processing/select-by-length/select-by-length.component';
import { SourceImportComponent } from './board/source-import/source-import.component';
import { SourceNormalizationComponent } from './board/source-normalization/source-normalization.component';

@NgModule({
  declarations: [
    BoardComponent,
    NewSourceComponent,
    SourcesProcessingComponent,
    QuestionsGenerationComponent,
    FaqsGenerationComponent,
    SelectByLengthComponent,
    SourceImportComponent,
    SourceNormalizationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BotSharedModule,
    SourcesManagementRoutingModule,
    NbButtonModule,
    NbIconModule,
    NbCardModule,
    NbInputModule,
    NbRadioModule,
    NbCheckboxModule,
    NbSelectModule,
    NbTooltipModule,
    InfiniteScrollModule
  ]
})
export class SourcesManagementModule {}
