import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { RestService } from '../../core-nlp/rest/rest.service';
import { StateService } from '../../core-nlp/state.service';
import { UserRole } from '../../model/auth';
import { Entry, PaginatedQuery, SearchMark } from '../../model/commons';
import { FaqDefinition, FaqFilter, PaginatedFaqResult } from '../models';
@Component({
  selector: 'tock-faq-management',
  templateUrl: './faq-management.component.html',
  styleUrls: ['./faq-management.component.scss']
})
export class FaqManagementComponent implements OnInit {
  destroy = new Subject();

  faqs: FaqDefinition[];
  faqEdit: FaqDefinition;
  isSidePanelOpen: boolean = false;

  loading = {
    delete: false,
    edit: false,
    list: false
  };

  constructor(
    private rest: RestService,
    private state: StateService,
    private readonly toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.search();
  }
  get isAuthorized(): boolean {
    return this.state.hasRole(UserRole.faqBotUser);
  }

  openSettings(): void {
    console.log('TO DO');
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
        this.loading.list = false;
      });
  }

  closeSidePanel(): void {
    this.isSidePanelOpen = false;
    this.faqEdit = undefined;
  }

  addFaq() {
    this.faqEdit = {
      id: undefined,
      intentId: undefined,
      title: '',
      description: '',
      utterances: [],
      tags: [],
      answer: '',
      enabled: true,
      applicationId: this.state.currentApplication._id,
      language: this.state.currentLocale
    };
    this.isSidePanelOpen = true;
  }

  editFaq(faq: FaqDefinition) {
    this.faqEdit = faq;
    this.isSidePanelOpen = true;
  }

  deleteFaq(faq: FaqDefinition) {
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
      });
  }

  enableFaq(faq: FaqDefinition) {
    faq.enabled = !faq.enabled;
    this.saveFaq(faq);
  }

  saveFaq(faq: FaqDefinition) {
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
      });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}

export class FaqSearchQuery extends PaginatedQuery {
  constructor(
    public namespace: string,
    public applicationName: string,
    public language: string,
    public start: number,
    public size: number,
    public tags: string[] = [],
    public searchMark?: SearchMark,
    public search?: string,
    public sort?: Entry<string, boolean>[],
    public enabled: Boolean = null,
    public user?: string,
    public allButUser?: string
  ) {
    super(namespace, applicationName, language, start, size, searchMark, sort);
  }
}
