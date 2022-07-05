/*
7 * Copyright (C) 2017/2021 e-voyageurs technologies
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbAccordionModule,
  NbAutocompleteModule,
  NbButtonModule,
  NbCardModule,
  NbContextMenuModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTagModule,
  NbTooltipModule,
  NbTreeGridModule
} from '@nebular/theme';

import { ScenariosListComponent } from './scenarios-list/scenarios-list.component';
import {
  ScenarioDesignerNavigationGuard,
  ScenarioDesignerComponent
} from './scenario-designer/scenario-designer.component';
import { ScenarioDesignerEntryComponent } from './scenario-designer/scenario-designer-entry.component';
import { IntentsSearchComponent } from './scenario-designer/intents-search/intents-search.component';
import { IntentCreateComponent } from './scenario-designer/intent-create/intent-create.component';
import { IntentEditComponent } from './scenario-designer/intent-edit/intent-edit.component';
import { ActionEditComponent } from './scenario-designer/action-edit/action-edit.component';
import { ContextCreateComponent } from './scenario-designer/context-create/context-create.component';
import { DndModule } from 'ngx-drag-drop';
import { BotSharedModule } from '../shared/bot-shared.module';
import { SharedModule } from '../shared-nlp/shared.module';
import { NbChatModule, NbCheckboxModule } from '@nebular/theme';
import { ScenarioService } from './services/scenario.service';
import { ScenarioApiService } from './services/scenario.api.service';
import { ScenarioEditComponent } from './scenario-edit/scenario-edit.component';
import { ScenariosRoutingModule } from './scenarios-routing.module';
import { ScenarioListSimpleComponent } from './scenarios-list/scenario-list-simple/scenario-list-simple.component';
import { ScenarioTreeComponent } from './scenarios-list/scenario-tree/scenario-tree.component';
import { NlpService } from '../nlp-tabs/nlp.service';
import { ScenarioFiltersComponent } from './scenarios-list/scenario-filters/scenario-filters.component';
import { ScenariosResolver } from './scenarios.resolver';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DndModule,
    ScenariosRoutingModule,
    BotSharedModule,
    SharedModule,
    NbAutocompleteModule,
    NbListModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbCardModule,
    NbChatModule,
    NbCheckboxModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTagModule,
    NbTooltipModule,
    NbTreeGridModule,
    NbAccordionModule,
    NbContextMenuModule
  ],
  declarations: [
    ScenariosListComponent,
    ScenarioEditComponent,
    ScenarioListSimpleComponent,
    ScenarioTreeComponent,
    ScenarioDesignerComponent,
    ScenarioDesignerEntryComponent,
    ScenarioFiltersComponent,
    IntentsSearchComponent,
    IntentCreateComponent,
    IntentEditComponent,
    ActionEditComponent,
    ContextCreateComponent
  ],
  exports: [],
  providers: [
    ScenarioService,
    ScenarioApiService,
    ScenarioDesignerNavigationGuard,
    ScenariosResolver,
    NlpService
  ],
  entryComponents: []
})
export class ScenariosModule {
  constructor() {}
}
