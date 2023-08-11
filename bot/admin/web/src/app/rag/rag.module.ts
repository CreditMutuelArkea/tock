import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RagTabsComponent } from './rag-tabs/rag-tabs.component';
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbRouteTabsetModule,
  NbSelectModule,
  NbSpinnerModule,
  NbToggleModule,
  NbTooltipModule
} from '@nebular/theme';
import { RagSettingsComponent } from './rag-settings/rag-settings.component';
import { BotSharedModule } from '../shared/bot-shared.module';
import { RagRoutingModule } from './rag-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NlpModule } from '../nlp-tabs/nlp.module';
import { RagExcludedComponent } from './rag-excluded/rag-excluded.component';
import { BoardComponent } from './sources-management/board/board.component';
import { NewSourceComponent } from './sources-management/board/new-source/new-source.component';
import { SourceEntryComponent } from './sources-management/board/source-entry/source-entry.component';
import { SourceImportComponent } from './sources-management/board/source-import/source-import.component';
import { SourceNormalizationCsvComponent } from './sources-management/board/source-normalization/csv/source-normalization-csv.component';
import { SourceNormalizationJsonComponent } from './sources-management/board/source-normalization/json/source-normalization-json.component';
import { JsonIteratorComponent } from './sources-management/board/source-normalization/json/json-iterator/json-iterator.component';
import { SourceManagementService } from './sources-management/source-management.service';
import { SourceManagementApiService } from './sources-management/source-management.api.service';

@NgModule({
  imports: [
    CommonModule,
    BotSharedModule,
    RagRoutingModule,
    ReactiveFormsModule,
    NbRouteTabsetModule,
    NbSelectModule,
    NbToggleModule,
    NbRadioModule,
    NbSpinnerModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NlpModule,
    NbIconModule,
    NbAccordionModule,
    NbTooltipModule
  ],
  declarations: [
    RagTabsComponent,
    RagSettingsComponent,
    RagExcludedComponent,
    BoardComponent,
    NewSourceComponent,
    SourceEntryComponent,
    SourceImportComponent,
    SourceNormalizationCsvComponent,
    SourceNormalizationJsonComponent,
    JsonIteratorComponent
  ],
  providers: [SourceManagementService, SourceManagementApiService]
})
export class RagModule {}
