import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbRadioModule,
  NbSelectModule,
  NbTagModule,
  NbToggleModule,
  NbTooltipModule
} from '@nebular/theme';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { BotSharedModule } from '../shared/bot-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SourcesManagementRoutingModule } from './sources-management-routing.module';
import { BoardComponent } from './board/board.component';

import { NewSourceComponent } from './board/new-source/new-source.component';
import { SourceImportComponent } from './board/source-import/source-import.component';
import { SourceNormalizationCsvComponent } from './board/source-normalization/csv/source-normalization-csv.component';
import { SourceNormalizationJsonComponent } from './board/source-normalization/json/source-normalization-json.component';
import { JsonIteratorComponent } from './board/source-normalization/json/json-iterator/json-iterator.component';
import { SourceEntryComponent } from './board/source-entry/source-entry.component';

@NgModule({
  declarations: [
    BoardComponent,
    NewSourceComponent,
    SourceImportComponent,
    SourceNormalizationCsvComponent,
    SourceNormalizationJsonComponent,
    JsonIteratorComponent,
    SourceEntryComponent
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
    NbTagModule,
    NbToggleModule,
    NbAccordionModule,
    NbListModule,
    NbFormFieldModule,
    InfiniteScrollModule
  ]
})
export class SourcesManagementModule {}
