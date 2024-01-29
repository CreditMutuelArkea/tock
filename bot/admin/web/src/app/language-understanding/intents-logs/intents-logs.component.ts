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

import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { saveAs } from 'file-saver-es';
import { Observable, debounceTime } from 'rxjs';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { DisplayIntentFullLogComponent } from './display-intents-full-log/display-intents-full-log.component';
import { ScrollComponent } from '../../scroll/scroll.component';
import { StateService } from '../../core-nlp/state.service';
import { NlpService } from '../../nlp-tabs/nlp.service';
import { CoreConfig } from '../../core-nlp/core.config';
import { Log, LogsQuery, PaginatedResult, Sentence } from '../../model/nlp';
import { PaginatedQuery, SearchMark } from '../../model/commons';
import { copyToClipboard } from '../../shared/utils';

interface IntentsLogsFilterForm {
  searchString: FormControl<string>;
  onlyCurrentLocale: FormControl<boolean>;
  displayTests: FormControl<boolean>;
}
@Component({
  selector: 'tock-intents-logs',
  templateUrl: './intents-logs.component.html',
  styleUrls: ['./intents-logs.component.scss']
})
export class IntentsLogsComponent extends ScrollComponent<Log> {
  constructor(
    public state: StateService,
    private nlp: NlpService,
    private dialogService: NbDialogService,
    private config: CoreConfig,
    private toastrService: NbToastrService
  ) {
    super(state);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.form.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.closeDetails();
      this.refresh();
    });
  }

  form = new FormGroup<IntentsLogsFilterForm>({
    searchString: new FormControl(),
    onlyCurrentLocale: new FormControl(false),
    displayTests: new FormControl(false)
  });

  get searchString(): FormControl {
    return this.form.get('searchString') as FormControl;
  }

  get onlyCurrentLocale(): FormControl {
    return this.form.get('onlyCurrentLocale') as FormControl;
  }

  get displayTests(): FormControl {
    return this.form.get('displayTests') as FormControl;
  }

  search(query: PaginatedQuery): Observable<PaginatedResult<Log>> {
    return this.nlp.searchLogs(
      new LogsQuery(
        query.namespace,
        query.applicationName,
        this.onlyCurrentLocale.value ? query.language : null,
        query.start,
        query.size,
        query.searchMark,
        this.searchString.value,
        this.displayTests.value
      )
    );
  }

  resetSearch(): void {
    this.searchString.reset();
  }

  displayFullLog(log: Log): void {
    this.dialogService.open(DisplayIntentFullLogComponent, {
      context: {
        request: JSON.parse(log.requestDetails()),
        response: JSON.parse(log.responseDetails())
      }
    });
  }

  copySentence(sentence): void {
    copyToClipboard(sentence.getText());
    this.toastrService.success(`Sentence copied to clipboard`, 'Clipboard');
  }

  dialogDetailsSentence: Sentence;

  showDetails(sentence: Sentence): void {
    console.log(sentence);
    if (this.dialogDetailsSentence && this.dialogDetailsSentence == sentence) {
      this.dialogDetailsSentence = undefined;
    } else {
      this.dialogDetailsSentence = sentence;
    }
  }

  closeDetails(): void {
    this.dialogDetailsSentence = undefined;
  }

  downloadDump(): void {
    setTimeout((_) => {
      this.nlp.exportLogs(this.state.currentApplication, this.state.currentLocale).subscribe((blob) => {
        saveAs(blob, this.state.currentApplication.name + '_' + this.state.currentLocale + '_logs.csv');
        this.toastrService.show(`Export provided`, 'Dump', { duration: 2000 });
      });
    }, 1);
  }
}
