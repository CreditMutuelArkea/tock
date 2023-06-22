import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { fromEvent, map, Observable, Subject, takeUntil } from 'rxjs';
import { Fragment, Source } from '../models';
import { SourceManagementService } from '../source-management.service';
import { SelectByLengthComponent } from './select-by-length/select-by-length.component';

import { cleanedData } from './sourceData';

@Component({
  selector: 'tock-sources-processing',
  templateUrl: './sources-processing.component.html',
  styleUrls: ['./sources-processing.component.scss']
})
export class SourcesProcessingComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  fragments: Fragment[]; //= cleanedData;
  scrolledFragments: Fragment[];
  scrolledFragmentsIndex: number = 0;

  constructor(
    private nbDialogService: NbDialogService,
    private router: Router,
    private route: ActivatedRoute,
    private sourcesService: SourceManagementService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((routeParams) => {
      this.loadSource(routeParams);
    });
  }

  private loadSource(routeParams: Params) {
    this.sourcesService.getSource(routeParams.sourceId).subscribe((data: Source) => {
      this.fragments = SourceManagementService.getSourceFragments(data) as Fragment[];

      this.onScroll();
    });
  }

  onScroll(): void {
    this.scrolledFragmentsIndex += 5;
    this.scrolledFragments = this.fragments.slice(0, this.scrolledFragmentsIndex);
  }

  toggle(fragment: Fragment): void {
    fragment.use = !fragment.use;
  }

  selectFragments(event): void {
    switch (event) {
      case 'all':
        this.fragments.forEach((fragment) => (fragment.use = true));
        break;
      case 'none':
        this.fragments.forEach((fragment) => (fragment.use = false));
        break;
      case 'revert':
        this.fragments.forEach((fragment) => (fragment.use = !fragment.use));
        break;
      case 'limit':
        const modal = this.nbDialogService.open(SelectByLengthComponent, {
          context: {
            data: this.fragments
          }
        });
        modal.componentRef.instance.onSubmit.subscribe((res) => {
          this.fragments.forEach((fragment) => {
            if (fragment.answer.length > res.length) fragment.use = true;
            else fragment.use = false;
          });
        });
        break;
    }
  }

  get selectedFragments(): Fragment[] {
    if (!this.fragments?.length) return [];
    return this.fragments.filter((fragment) => fragment.use);
  }

  editionValue: string;
  edit(fragment: Fragment) {
    this.cancelEdit();
    this.editionValue = fragment.answer;
    fragment._edit = true;
  }

  validateEdit(fragment: Fragment) {
    fragment.answer = this.editionValue;
    this.cancelEdit();
  }

  cancelEdit() {
    this.fragments.forEach((fragment) => {
      delete fragment._edit;
    });
    this.editionValue = undefined;
  }

  submitModalRef;
  submit(modalTemplateRef) {
    this.submitModalRef = this.nbDialogService.open(modalTemplateRef);
  }

  cancelNextStep() {
    this.submitModalRef.close();
  }

  generateQuestions() {
    const selection = this.fragments.filter((f) => f.use);
    this.sourcesService.sendPocSource(selection);
    this.cancelNextStep();
    // this.router.navigate([`sources-management/board`], { state: { action: 'splitting' } });
  }

  private readonly document = inject(DOCUMENT);
  private readonly viewport = inject(ViewportScroller);

  readonly showScrollToTopButton$: Observable<boolean> = fromEvent(this.document, 'scroll').pipe(
    map(() => this.viewport.getScrollPosition()?.[1] > 0)
  );

  onScrollToTop(): void {
    this.viewport.scrollToPosition([0, 0]);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
