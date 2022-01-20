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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { ReplaySubject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { StateService } from 'src/app/core-nlp/state.service';
import {isDocked, ViewMode } from '../../common/model/view-mode';
import { FaqDefinitionService } from '../../common/faq-definition.service';
import { FaqQaFilter } from '../qa-grid/qa-grid.component';
import { QaSidebarEditorService } from '../sidebars/qa-sidebar-editor.service';

@Component({
  selector: 'tock-qa-header',
  templateUrl: './qa-header.component.html',
  styleUrls: ['./qa-header.component.scss']
})
export class QaHeaderComponent implements OnInit {

  @Input()
  filter: FaqQaFilter;

  @Input()
  viewMode: ViewMode;

  @Output()
  onSearch = new EventEmitter<Partial<FaqQaFilter>>();

  @Output()
  onImport = new EventEmitter<void>();

  @Output()
  onNew = new EventEmitter<void>();

  readonly menuItems: NbMenuItem[] = [
    {
      title: 'Export FAQ'
    },
    {
      title: 'Import FAQ'
    },
    {
      title: 'New FAQ'
    }
  ];

  onlyActives = false;

  availableTags: string[] = [];

  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly state: StateService,
    private readonly qaService: FaqDefinitionService,
    private readonly qaSidebarEditorService: QaSidebarEditorService
  ) { }

  ngOnInit(): void {
    this.fetchAvailableTags();

    // when user saved a frequent answer, try also to refresh tags
    // Note: There exist more robust implementation, we use this because it is very simple
    this.qaSidebarEditorService.registerOutcomeListener('save-done', 1000, this.destroy$, () => {
      this.fetchAvailableTags();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  fetchAvailableTags(): void {
    const applicationId = this.state.currentApplication._id;
    const language = this.state.currentLocale;

    this.qaService.getAvailableTags(applicationId, language)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(tags => {
        this.availableTags = tags;
      });
  }

  selectedTagsChanged(evt): void {
    this.search();
  }

  search(): void {
    this.filter.onlyActives = (true === this.onlyActives);
    this.onSearch.emit(this.filter);
  }

  searchChange(value): void {
    this.search();
  }

  toggleOnlyActives(value: boolean) {
    this.onlyActives = value;
    this.search();
  }

  importFaq(): void {
    this.onImport.next(null);
  }

  newFaqDefinition(): void {
    this.onNew.next(null);
  }

  isDocked(): boolean {
    return isDocked(this.viewMode);
  }


}
