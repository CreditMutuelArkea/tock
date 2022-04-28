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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Subscription } from 'rxjs';

import { ConfirmDialogComponent } from '../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { DialogService } from '../../core-nlp/dialog.service';
import { Scenario } from '../models';
import { ScenarioService } from '../services/scenario.service';
@Component({
  selector: 'scenarios-list',
  templateUrl: './scenarios-list.component.html',
  styleUrls: ['./scenarios-list.component.scss']
})
export class ScenariosListComponent implements OnInit, OnDestroy {
  actionsColumn = 'actions';
  categoryColumn = 'category';
  defaultColumns = ['name', 'description'];
  allColumns = [this.categoryColumn, ...this.defaultColumns, this.actionsColumn];

  dataSource: NbTreeGridDataSource<any>;
  subscriptions: Subscription = new Subscription();

  loading: boolean = false;
  isSidePanelOpen: boolean = false;

  constructor(
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<any>,
    private dialogService: DialogService,
    private scenarioService: ScenarioService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.subscriptions.add(
      this.scenarioService.getScenariosTreeGrid().subscribe({
        next: (data: any) => {
          this.loading = false;
          this.dataSource = this.dataSourceBuilder.create(data);
        },
        error: () => {
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  add(): void {
    this.isSidePanelOpen = true;
    console.log('add');
  }

  edit(scenario: any): void {
    this.isSidePanelOpen = true;
    console.log('edit', scenario);
  }

  delete(scenario: Scenario): void {
    const deleteAction = 'delete';
    const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
      context: {
        title: `Delete scenario "${scenario.name}"`,
        subtitle: 'Are you sure you want to delete the scenario ?',
        action: deleteAction
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === deleteAction) {
        this.deleteScenario(scenario.id);
      }
    });
  }

  closeSidePanel(): void {
    this.isSidePanelOpen = false;
  }

  deleteScenario(id: number): void {
    this.subscriptions.add(
      this.scenarioService.deleteScenario(id).subscribe({
        next: () => {
          this.toastrService.success(`Scenario successfully deleted`, 'Success', {
            duration: 5000,
            status: 'success'
          });
        },
        error: () => {
          this.toastrService.danger(`Failed to delete scenario`, 'Error', {
            duration: 5000,
            status: 'danger'
          });
        }
      })
    );
  }
}