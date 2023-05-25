import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { fromEvent, map, Observable } from 'rxjs';
import { Fragment } from '../models';
import { cleanedData } from '../sources-processing/sourceData';

@Component({
  selector: 'tock-questions-generation',
  templateUrl: './questions-generation.component.html',
  styleUrls: ['./questions-generation.component.scss']
})
export class QuestionsGenerationComponent implements OnInit {
  fragments: Fragment[] = cleanedData;
  scrolledFragments: Fragment[];
  scrollindex: number = 0;

  constructor(private nbDialogService: NbDialogService, private router: Router) {}

  ngOnInit(): void {
    const questions = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ?',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat ?',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur ?',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ?',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo ?',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt ?',
      ' Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem ?',
      'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur ?'
    ];
    this.fragments.forEach((fragment) => {
      fragment.questions = [
        ...questions
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => {
            return { value: value };
          })
      ];
    });
    this.onScroll();
  }

  onScroll() {
    this.scrollindex += 10;
    this.scrolledFragments = this.fragments.slice(0, this.scrollindex);
  }

  delete(fragment: Fragment, question) {
    fragment.questions = fragment.questions.filter((q) => q !== question);
  }

  questionEditionValue: string;
  edit(fragment: Fragment, question) {
    this.fragments.forEach((frag) => {
      frag.questions.forEach((quest) => delete quest._edit);
    });
    const editedQuestion = fragment.questions.find((q) => q === question);
    this.questionEditionValue = question.value;
    editedQuestion._edit = true;
  }

  validateEditQuestion(fragment, question) {
    const editedQuestion = fragment.questions.find((q) => q === question);
    editedQuestion.value = this.questionEditionValue;
    delete editedQuestion._edit;
  }

  cancelEditQuestion(fragment, question) {
    const editedQuestion = fragment.questions.find((q) => q === question);
    this.questionEditionValue = undefined;
    delete editedQuestion._edit;
  }

  submitModalRef;
  submit(modalTemplateRef) {
    this.submitModalRef = this.nbDialogService.open(modalTemplateRef);
  }

  cancelNextStep() {
    this.submitModalRef.close();
  }

  createFaqs() {
    this.cancelNextStep();
    this.router.navigate([`sources-management/board`], { state: { action: 'faq' } });
  }

  private readonly document = inject(DOCUMENT);
  private readonly viewport = inject(ViewportScroller);

  readonly showScrollToTopButton$: Observable<boolean> = fromEvent(this.document, 'scroll').pipe(
    map(() => this.viewport.getScrollPosition()?.[1] > 0)
  );

  onScrollToTop(): void {
    this.viewport.scrollToPosition([0, 0]);
  }
}
