import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { fromEvent, map, Observable } from 'rxjs';
import { Fragment } from '../models';
import { SelectByLengthComponent } from './select-by-length/select-by-length.component';

// import { saveAs } from 'file-saver-es';
// import { sourceData } from './01f';
import { cleanedData } from './sourceData';

@Component({
  selector: 'tock-sources-processing',
  templateUrl: './sources-processing.component.html',
  styleUrls: ['./sources-processing.component.scss']
})
export class SourcesProcessingComponent implements OnInit {
  fragments: Fragment[] = cleanedData;
  scrolledFragments: Fragment[];
  scrolledFragmentsIndex: number = 0;

  constructor(private nbDialogService: NbDialogService, private router: Router) {}

  ngOnInit(): void {
    this.onScroll();
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
            if (fragment.text.length > res.length) fragment.use = true;
            else fragment.use = false;
          });
        });
        break;
    }
  }

  get selectedFragments(): Fragment[] {
    return this.fragments.filter((fragment) => fragment.use);
  }

  editionValue: string;
  edit(fragment: Fragment) {
    this.cancelEdit();
    this.editionValue = fragment.text;
    fragment._edit = true;
  }

  validateEdit(fragment: Fragment) {
    fragment.text = this.editionValue;
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
    this.cancelNextStep();
    this.router.navigate([`sources-management/board`], { state: { action: 'nlg' } });
  }

  private readonly document = inject(DOCUMENT);
  private readonly viewport = inject(ViewportScroller);

  readonly showScrollToTopButton$: Observable<boolean> = fromEvent(this.document, 'scroll').pipe(
    map(() => this.viewport.getScrollPosition()?.[1] > 0)
  );

  onScrollToTop(): void {
    this.viewport.scrollToPosition([0, 0]);
  }

  // importData() {
  //   const data = [];
  //   sourceData.pages.forEach((page) => {
  //     let text = '';
  //     page.body.forEach((frag) => {
  //       let cleaned = this.convertHtml(frag.bloc);
  //       cleaned.replace(/\n/g, '\\n');
  //       cleaned = cleaned.trim();
  //       if (cleaned.length) {
  //         text += frag.title + ' ' + cleaned;
  //       }
  //     });
  //     if (text.length) {
  //       data.push({
  //         page: text
  //       });
  //     }
  //   });

  //   saveAs(
  //     new Blob([JSON.stringify(data)], {
  //       type: 'application/json'
  //     }),
  //     'sourceData.json'
  //   );
  // }

  // convertHtml(html) {
  //   const tempDivElement = document.createElement('div');
  //   tempDivElement.innerHTML = html;
  //   return tempDivElement.textContent || tempDivElement.innerText || '';
  // }
}
