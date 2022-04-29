/*
 * Copyright (C) 2017/2021 e-voyageurs technologies
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

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbSpinnerModule,
  NbTagModule,
  NbTooltipModule,
  NbTreeGridModule
} from '@nebular/theme';

import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { ScenariosListComponent } from './scenarios-list/scenarios-list.component';
import {
  ScenarioEditorNavigationGuard,
  ScenariosEditComponent
} from './scenarios-edit/scenarios-edit.component';
import { EditorEntryComponent } from './scenarios-edit/editor-entry.component';
import { DndModule } from 'ngx-drag-drop';
import { BotSharedModule } from '../shared/bot-shared.module';
import { SharedModule } from '../shared-nlp/shared.module';
import { NbChatModule, NbCheckboxModule } from '@nebular/theme';
import { ScenarioService } from './services/scenario.service';
import { ScenarioApiService } from './services/scenario.api.service';
import { ScenarioEditComponent } from './scenario-edit/scenario-edit.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    resolve: {
      application: ApplicationResolver
    },
    children: [
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
        component: ScenariosListComponent
      },
      {
        path: ':id',
        component: ScenariosEditComponent,
        canDeactivate: [ScenarioEditorNavigationGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ScenariosRoutingModule {}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    BotSharedModule,
    ScenariosRoutingModule,
    DndModule,
    NbCheckboxModule,
    NbChatModule,
    NbCardModule,
    NbTreeGridModule,
    NbSpinnerModule,
    NbButtonModule,
    NbIconModule,
    NbTooltipModule,
    NbInputModule,
    NbTagModule,
    ReactiveFormsModule
  ],
  declarations: [
    ScenariosListComponent,
    ScenariosEditComponent,
    EditorEntryComponent,
    ScenarioEditComponent
  ],
  exports: [],
  providers: [ScenarioService, ScenarioApiService, ScenarioEditorNavigationGuard],
  entryComponents: []
})
export class ScenariosModule {
  constructor() {}
}
