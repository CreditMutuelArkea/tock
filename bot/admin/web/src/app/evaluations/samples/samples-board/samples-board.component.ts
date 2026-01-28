/*
 * Copyright (C) 2017/2025 SNCF Connect & Tech
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
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DialogService } from '../../../core-nlp/dialog.service';
import { ChoiceDialogComponent } from '../../../shared/components';
import { EvaluationSampleData } from '../temp-data';
import { SampleCreateComponent } from '../sample-create/sample-create.component';
import { EvaluationSampleDefinition, EvaluationSampleStatus } from '../models';

@Component({
  selector: 'tock-samples-board',
  templateUrl: './samples-board.component.html',
  styleUrl: './samples-board.component.scss'
})
export class SamplesBoardComponent implements OnInit, OnDestroy {
  destroy$: Subject<unknown> = new Subject();
  loading: boolean = false;
  samples: EvaluationSampleDefinition[];
  evaluationSampleStatus = EvaluationSampleStatus;

  constructor(private router: Router, private dialogService: DialogService) {}

  ngOnInit(): void {
    this.loading = true;

    // Simulate data loading
    setTimeout(() => {
      this.samples = EvaluationSampleData as EvaluationSampleDefinition[];
      this.loading = false;
    }, 1000);
  }

  getStatusInfo(status: EvaluationSampleStatus): { text: string; status: 'info' | 'success' } {
    switch (status) {
      case EvaluationSampleStatus.IN_PROGRESS:
        return { text: 'In Progress', status: 'success' };
      case EvaluationSampleStatus.VALIDATED:
        return { text: 'Validated', status: 'info' };
    }
  }

  getScore(sample: EvaluationSampleDefinition): { ok: number; percentage: number } {
    return {
      ok: sample.evaluationsResult.positiveCount,
      percentage: sample.botActionCount > 0 ? Math.round((sample.evaluationsResult.positiveCount / sample.botActionCount) * 100) : 0
    };
  }

  createSample(): void {
    const dialogRef = this.dialogService.openDialog(SampleCreateComponent, {
      context: {}
    });
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/evaluations/samples/detail', id]);
  }

  confirmDeleteSample(sample: EvaluationSampleDefinition): void {
    const action = 'delete';
    const dialogRef = this.dialogService.openDialog(ChoiceDialogComponent, {
      context: {
        title: 'Delete an evaluation sample',
        subtitle: `Are you sure you want to delete the sample "${sample.name}" ?`,
        modalStatus: 'danger',
        actions: [
          { actionName: 'cancel', buttonStatus: 'basic', ghost: true },
          { actionName: action, buttonStatus: 'danger' }
        ]
      }
    });
    dialogRef.onClose.subscribe((result) => {
      if (result === action) {
        this.deleteIndicator(sample);
      }
    });
  }

  deleteIndicator(sample: EvaluationSampleDefinition): void {
    alert('TODO: Delete sample: ' + sample.name);
    // this.loading = true;
    // const indicatorName = indicator.name;
    // const url = `/bot/${this.stateService.currentApplication.name}/indicators/${indicator.name}`;
    // this.rest
    //   .delete(url)
    //   .pipe(take(1))
    //   .subscribe({
    //     next: () => {
    //       this.indicators = this.indicators.filter((f) => f.name != indicatorName);
    //       this.updateIndicatorsList();

    //       this.toastrService.success(`Faq successfully deleted`, 'Success', {
    //         duration: 5000,
    //         status: 'success'
    //       });

    //       this.closeSidePanel();
    //       this.loading.delete = false;
    //     },
    //     error: () => {
    //       this.loading.delete = false;
    //     }
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
