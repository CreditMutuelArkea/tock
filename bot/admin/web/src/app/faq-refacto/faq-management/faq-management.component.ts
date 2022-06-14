import { Component, OnInit, ViewChild } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { DialogService } from '../../core-nlp/dialog.service';
import { ConfirmDialogComponent } from '../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { RestService } from '../../core-nlp/rest/rest.service';
import { StateService } from '../../core-nlp/state.service';
import { UserRole } from '../../model/auth';
import { Entry, PaginatedQuery, SearchMark } from '../../model/commons';
import { FaqDefinition, FaqFilter, FaqSearchQuery, PaginatedFaqResult, Settings } from '../models';
import { FaqService } from '../services/faq.service';
import { Router } from '@angular/router';
import { FaqManagementEditComponent } from './faq-management-edit/faq-management-edit.component';

export type FaqDefinitionExtended = FaqDefinition & { _makeDirty?: true };

@Component({
  selector: 'tock-faq-management',
  templateUrl: './faq-management.component.html',
  styleUrls: ['./faq-management.component.scss']
})
export class FaqManagementComponent implements OnInit {
  @ViewChild('faqEditComponent') faqEditComponent: FaqManagementEditComponent;

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
    private state: StateService,
    private toastrService: NbToastrService,
    private dialogService: DialogService,
    private faqService: FaqService,
    private router: Router
  ) {
    this.initUtterance = this.router.getCurrentNavigation().extras?.state?.question;
  }

  ngOnInit(): void {
    this.search();
    this.state.configurationChange.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.search();
    });

    if (this.initUtterance) {
      this.addFaq(this.initUtterance);
    }
  }

  get isAuthorized(): boolean {
    return this.state.hasRole(UserRole.faqBotUser);
  }

  openSettings(): void {
    if (this.isSidePanelOpen.edit) {
      const validAction = 'yes';
      const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `Cancel ${this.faqEdit.id ? 'edit' : 'create'} faq`,
          subtitle: 'Are you sure you want to cancel ? Changes will not be saved.',
          action: validAction
        }
      });
      dialogRef.onClose.subscribe((result) => {
        if (result === validAction) {
          this.isSidePanelOpen.edit = false;
          this.isSidePanelOpen.settings = true;
        }
      });
    } else {
      this.isSidePanelOpen.settings = true;
    }
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

    let query: PaginatedQuery = this.state.createPaginatedQuery(
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
    if (this.faqEditComponent) {
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
      applicationId: this.state.currentApplication._id,
      language: this.state.currentLocale
    };

    if (initUtterance) this.faqEdit._makeDirty = true;

    this.setSidePanelSettings();
  }

  editFaq(faq: FaqDefinitionExtended) {
    this.faqEdit = faq;
    this.setSidePanelSettings();
  }

  deleteFaq(faq: FaqDefinitionExtended) {
    this.loading.delete = true;
    const faqId = faq.id;
    this.rest
      .delete(`/faq/${faqId}`)
      .pipe(take(1))
      .subscribe(() => {
        this.faqs = this.faqs.filter((f) => f.id != faqId);
        this.toastrService.success(`Faq successfully deleted`, 'Success', {
          duration: 5000,
          status: 'success'
        });
        this.loading.delete = false;
      });
  }

  enableFaq(faq: FaqDefinitionExtended) {
    faq.enabled = !faq.enabled;
    this.saveFaq(faq);
  }

  saveFaq(faq: FaqDefinitionExtended) {
    this.loading.edit = true;
    this.rest
      .post('/faq', faq)
      .pipe(take(1))
      .subscribe((res) => {
        if (faq.id) {
          const index = this.faqs.findIndex((f) => f.id == faq.id);
          this.faqs.splice(index, 1, faq);

          this.toastrService.success(`Faq successfully updated`, 'Success', {
            duration: 5000,
            status: 'success'
          });
        } else {
          this.search();

          this.toastrService.success(`Faq successfully created`, 'Success', {
            duration: 5000,
            status: 'success'
          });
        }
        this.loading.edit = false;
        this.closeSidePanel();
      });
  }

  setSidePanelSettings(): void {
    if (this.isSidePanelOpen.settings) {
      const validAction = 'yes';
      const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `Cancel edit parameters`,
          subtitle: 'Are you sure you want to cancel ? Changes will not be saved.',
          action: validAction
        }
      });
      dialogRef.onClose.subscribe((result) => {
        if (result === validAction) {
          this.isSidePanelOpen.settings = false;
          this.isSidePanelOpen.edit = true;
        }
      });
    } else {
      this.isSidePanelOpen.edit = true;
    }
  }

  saveSettings(settings: Settings): void {
    this.loading.settings = true;

    this.faqService.saveSettings(settings, this.destroy).subscribe({
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
