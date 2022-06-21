import { Component, OnInit, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { BotApplicationConfiguration } from '../../core/model/configuration';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { RestService } from '../../core-nlp/rest/rest.service';
import { StateService } from '../../core-nlp/state.service';
import { UserRole } from '../../model/auth';
import { Entry, PaginatedQuery, SearchMark } from '../../model/commons';
import { FaqDefinition, FaqFilter, FaqSearchQuery, PaginatedFaqResult, Settings } from '../models';
import { FaqManagementEditComponent } from './faq-management-edit/faq-management-edit.component';
import { FaqManagementSettingsComponent } from './faq-management-settings/faq-management-settings.component';
import { Pagination } from '../../shared/pagination/pagination.component';

export type FaqDefinitionExtended = FaqDefinition & { _makeDirty?: true };

@Component({
  selector: 'tock-faq-management',
  templateUrl: './faq-management.component.html',
  styleUrls: ['./faq-management.component.scss']
})
export class FaqManagementComponent implements OnInit {
  @ViewChild('faqEditComponent') faqEditComponent: FaqManagementEditComponent;
  @ViewChild('faqSettingsComponent') faqSettingsComponent: FaqManagementSettingsComponent;

  configurations: BotApplicationConfiguration[];

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
    list: false
  };

  initUtterance: string;

  constructor(
    private botConfiguration: BotConfigurationService,
    private rest: RestService,
    private stateService: StateService,
    private toastrService: NbToastrService,
    private router: Router
  ) {
    this.initUtterance = this.router.getCurrentNavigation().extras?.state?.question;
  }

  ngOnInit(): void {
    this.botConfiguration.configurations.pipe(takeUntil(this.destroy)).subscribe((confs) => {
      this.configurations = confs;

      if (confs.length) {
        this.search();
        this.stateService.configurationChange.pipe(takeUntil(this.destroy)).subscribe(() => {
          this.search();
        });

        if (this.initUtterance) {
          this.addFaq(this.initUtterance);
        }
      }
    });
  }

  get isAuthorized(): boolean {
    return this.stateService.hasRole(UserRole.faqBotUser);
  }

  pagination: Pagination = {
    pageStart: 0,
    pageEnd: undefined,
    pageSize: 10,
    pageTotal: undefined
  };

  paginationChange(pagination: Pagination): void {
    this.search(this.pagination.pageStart, this.pagination.pageSize);
  }

  onScroll(): void {
    if (this.loading.list || this.pagination.pageEnd >= this.pagination.pageTotal) return;

    return this.search(this.pagination.pageEnd, this.pagination.pageSize, true, false);
  }

  DEFAULT_FAQ_SENTENCE_SORT: Entry<string, boolean> = new Entry('creationDate', false);

  currentFilters: FaqFilter = {
    search: null,
    tags: [],
    enabled: undefined,
    sort: [this.DEFAULT_FAQ_SENTENCE_SORT]
  };

  filterFaqs(filters: FaqFilter): void {
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

  tagsCache: string[] = [];

  search(
    start: number = 0,
    size: number = this.pagination.pageSize,
    add: boolean = false,
    showLoadingSpinner: boolean = true
  ): void {
    if (showLoadingSpinner) this.loading.list = true;

    let query: PaginatedQuery = this.stateService.createPaginatedQuery(start, size);
    const request = this.toSearchQuery(query);

    this.rest
      .post('/faq/search', request)
      .pipe(takeUntil(this.destroy))
      .subscribe((faqs: PaginatedFaqResult) => {
        this.pagination.pageTotal = faqs.total;
        this.pagination.pageEnd = faqs.end;

        if (add) {
          this.faqs = [...this.faqs, ...faqs.faq];
        } else {
          this.faqs = faqs.faq;
          this.pagination.pageStart = faqs.start;
        }

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
          this.pagination.pageEnd--;
          this.pagination.pageTotal--;

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

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
