import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { GeneratedSentenceError } from '../../models';

import { SentencesGenerationService } from '../../services';

@Component({
  selector: 'tock-sentences-generation-wrapper',
  templateUrl: './sentences-generation-wrapper.component.html',
  styleUrls: ['./sentences-generation-wrapper.component.scss']
})
export class SentencesGenerationWrapperComponent implements OnInit, OnDestroy {
  @Input() sentences: string[] = [];
  @Input() errors: GeneratedSentenceError[] = [];

  @Output() onValidateSelection = new EventEmitter<string[]>();

  loading: boolean = false;

  private subscription = new Subscription();

  constructor(
    public dialogRef: NbDialogRef<SentencesGenerationWrapperComponent>,
    private sentencesGenerationService: SentencesGenerationService
  ) {}

  ngOnInit(): void {
    this.subscription = this.sentencesGenerationService.state$.subscribe(({ sentencesExample, errors }) => {
      if (sentencesExample.length) {
        this.sentences = sentencesExample;
      }

      this.errors = errors;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleLoading(loading: boolean): void {
    this.loading = loading;
  }

  handleGeneratedSentences(generatedSentences: string[]): void {
    this.onValidateSelection.emit(generatedSentences);
  }
}
