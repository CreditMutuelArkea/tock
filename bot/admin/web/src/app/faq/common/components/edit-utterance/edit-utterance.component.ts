/*
 * Copyright (C) 2017/2022 e-voyageurs technologies
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

import {Component, Input} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';
import {Utterance} from '../../model/utterance';
import {EditUtteranceResult} from './edit-utterance-result';

/**
 * Edit Utterance DIALOG
 */
@Component({
  selector: 'tock-edit-utterance',
  templateUrl: './edit-utterance.component.html',
  styleUrls: ['./edit-utterance.component.scss']
})
export class EditUtteranceComponent {

  @Input()
  public title: string;

  @Input()
  public value: string;

  @Input()
  public lookup?: (string) => (Utterance | null);

  public existingQuestion?: string;

  constructor(
    private readonly dialogRef: NbDialogRef<EditUtteranceComponent>
  ) {
  }

  cancel(): void {
    const result: EditUtteranceResult = {
      cancelled: true
    };
    this.dialogRef.close(result);
  }

  save(): void {
    const result: EditUtteranceResult = {
      cancelled: false,
      value: this.value || ''
    };
    this.dialogRef.close(result);
  }

  canSave(): boolean {
    if (!this.value) {
      return false;
    }

    return this.value.trim().length > 0;
  }

  ensureUniq(evt): void {
    const res = this.lookup ? this.lookup(this.value) : undefined; // look for similar question
    if (res) {
      this.existingQuestion = res;
    } else {
      this.existingQuestion = undefined;
    }
  }
}