import { Component, OnInit, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { DialogService } from '../../core-nlp/dialog.service';
import { RestService } from '../../core-nlp/rest/rest.service';
import { StateService } from '../../core-nlp/state.service';
import { UserRole } from '../../model/auth';
import { Entry, PaginatedQuery, SearchMark } from '../../model/commons';
import { FaqDefinition, FaqFilter, FaqSearchQuery, PaginatedFaqResult, Settings } from '../models';
import { FaqService } from '../services/faq.service';
import { FaqManagementEditComponent } from './faq-management-edit/faq-management-edit.component';
import { FaqManagementSettingsComponent } from './faq-management-settings/faq-management-settings.component';

export type FaqDefinitionExtended = FaqDefinition & { _makeDirty?: true };

@Component({
  selector: 'tock-faq-management',
  templateUrl: './faq-management.component.html',
  styleUrls: ['./faq-management.component.scss']
})
export class FaqManagementComponent implements OnInit {
  @ViewChild('faqEditComponent') faqEditComponent: FaqManagementEditComponent;
  @ViewChild('faqSettingsComponent') faqSettingsComponent: FaqManagementSettingsComponent;

  destroy = new Subject();

  faqs: FaqDefinitionExtended[];
  faqEdit: FaqDefinitionExtended;

  isSidePanelOpen = {
    edit: false,
    settings: false
  };

  loading = {
    delete: false,
    edit: false,
    list: false,
    settings: false
  };

  initUtterance: string;

  constructor(
    private rest: RestService,
    private stateService: StateService,
    private toastrService: NbToastrService,
    private dialogService: DialogService,
    private faqService: FaqService,
    private router: Router
  ) {
    this.initUtterance = this.router.getCurrentNavigation().extras?.state?.question;
  }

  ngOnInit(): void {
    this.search();
    this.stateService.configurationChange.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.search();
    });

    if (this.initUtterance) {
      this.addFaq(this.initUtterance);
    }
  }

  get isAuthorized(): boolean {
    return this.stateService.hasRole(UserRole.faqBotUser);
  }

  DEFAULT_FAQ_SENTENCE_SORT: Entry<string, boolean> = new Entry('creationDate', false);

  currentFilters: FaqFilter = {
    search: null,
    tags: [],
    enabled: undefined,
    sort: [this.DEFAULT_FAQ_SENTENCE_SORT]
  };

  filterFaqs(filters: FaqFilter) {
    this.currentFilters = filters;
    this.search();
  }

  toSearchQuery(query: PaginatedQuery): FaqSearchQuery {
    return new FaqSearchQuery(
      query.namespace,
      query.applicationName,
      query.language,
      query.start,
      query.size,
      this.currentFilters.tags,
      null /* NOTE: There is a weird behavior when set */,
      this.currentFilters.search,
      this.currentFilters.sort,
      this.currentFilters.enabled
    );
  }

  cursor: number = 0;
  pageSize: number = 5;
  mark: SearchMark;

  tagsCache: string[] = [];

  search() {
    this.loading.list = true;

    let query: PaginatedQuery = this.stateService.createPaginatedQuery(
      this.cursor,
      this.pageSize,
      this.mark
    );
    const request = this.toSearchQuery(query);

    this.rest
      .post('/faq/search', request)
      .pipe(takeUntil(this.destroy))
      .subscribe((faqs: PaginatedFaqResult) => {
        this.faqs = faqs.faq;

        this.tagsCache = [
          ...new Set(
            <string>[].concat.apply(
              [...this.tagsCache],
              this.faqs.map((v: FaqDefinitionExtended) => v.tags)
            )
          )
        ];

        this.loading.list = false;
      });
  }

  closeSidePanel(): void {
    this.isSidePanelOpen.settings = false;
    this.isSidePanelOpen.edit = false;
    this.faqEdit = undefined;
  }

  addOrEditFaq(faq?: FaqDefinitionExtended): void {
    if (this.faqSettingsComponent) {
      this.faqSettingsComponent
        .close()
        .pipe(take(1))
        .subscribe((res) => {
          if (res != 'cancel') {
            setTimeout(() => {
              this.addOrEditFaq(faq);
            }, 200);
          }
        });
    } else if (this.faqEditComponent) {
      this.faqEditComponent
        .close()
        .pipe(take(1))
        .subscribe((res) => {
          if (res != 'cancel') {
            if (faq) this.editFaq(faq);
            else this.addFaq();
          }
        });
    } else {
      if (faq) this.editFaq(faq);
      else this.addFaq();
    }
  }

  addFaq(initUtterance?: string) {
    this.faqEdit = {
      id: undefined,
      intentId: undefined,
      title: initUtterance ? initUtterance : '',
      description: '',
      utterances: initUtterance ? [initUtterance] : [],
      tags: [],
      answer: '',
      enabled: true,
      applicationId: this.stateService.currentApplication._id,
      language: this.stateService.currentLocale
    };

    if (initUtterance) this.faqEdit._makeDirty = true;

    this.isSidePanelOpen.edit = true;
  }

  editFaq(faq: FaqDefinitionExtended) {
    this.faqEdit = faq;
    this.isSidePanelOpen.edit = true;
  }

  deleteFaq(faq: FaqDefinitionExtended) {
    this.loading.delete = true;
    const faqId = faq.id;
    this.rest
      .delete(`/faq/${faqId}`)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.faqs = this.faqs.filter((f) => f.id != faqId);
          this.toastrService.success(`Faq successfully deleted`, 'Success', {
            duration: 5000,
            status: 'success'
          });
          this.loading.delete = false;
          this.closeSidePanel();
        },
        error: () => {
          this.loading.delete = false;
        }
      });
  }

  enableFaq(faq: FaqDefinitionExtended) {
    faq.enabled = !faq.enabled;
    this.saveFaq(faq);
  }

  saveFaq(faq: FaqDefinitionExtended) {
    let toastLabel = 'created';
    this.loading.edit = true;
    this.rest
      .post('/faq', faq)
      .pipe(take(1))
      .subscribe({
        next: () => {
          if (faq.id) {
            const index = this.faqs.findIndex((f) => f.id == faq.id);
            this.faqs.splice(index, 1, faq);
            toastLabel = 'updated';
          } else {
            this.search();
          }

          this.toastrService.success(`Faq successfully ${toastLabel}`, 'Success', {
            duration: 5000,
            status: 'success'
          });
          this.loading.edit = false;
          this.closeSidePanel();
        },
        error: () => {
          this.loading.edit = false;
        }
      });
  }

  openSettings(): void {
    if (this.faqEditComponent) {
      this.faqEditComponent
        .close()
        .pipe(take(1))
        .subscribe((res) => {
          if (res != 'cancel') {
            this.isSidePanelOpen.settings = true;
          }
        });
    } else {
      this.isSidePanelOpen.settings = true;
    }
  }

  saveSettings(settings: Settings): void {
    this.loading.settings = true;

    this.faqService
      .saveSettings(this.stateService.currentApplication._id, settings, this.destroy)
      .subscribe({
        next: () => {
          this.loading.settings = false;
          this.isSidePanelOpen.settings = false;
          this.toastrService.success(`Settings successfully updated`, 'Success', {
            duration: 5000,
            status: 'success'
          });
        },
        error: () => {
          this.loading.settings = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
