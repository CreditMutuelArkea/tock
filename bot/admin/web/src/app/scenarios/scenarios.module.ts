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
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../core-nlp/auth/auth.guard';
import { ApplicationResolver } from '../core-nlp/application.resolver';
import { ScenariosListComponent } from './scenarios-list/scenarios-list.component';
import { ScenariosEditComponent } from './scenarios-edit/scenarios-edit.component';
import { EditorEntryComponent } from './scenarios-edit/editor-entry.component';
import { DndModule } from 'ngx-drag-drop';
import { BotSharedModule } from '../shared/bot-shared.module';
import { SharedModule } from '../shared-nlp/shared.module';
import { NbChatModule, NbCheckboxModule } from '@nebular/theme';
import { ScenarioService } from './services/scenario.service';


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
        redirectTo: 'scenarios-list',
        pathMatch: 'full'
      },
      {
        path: 'scenarios-list',
        component: ScenariosListComponent
      },
      {
        path: 'scenarios-edit',
        component: ScenariosEditComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
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
    NbChatModule
  ],
  declarations: [ScenariosListComponent, ScenariosEditComponent, EditorEntryComponent],
  exports: [],
  providers: [ScenarioService],
  entryComponents: []
})
export class ScenariosModule {
  constructor() {}
}
