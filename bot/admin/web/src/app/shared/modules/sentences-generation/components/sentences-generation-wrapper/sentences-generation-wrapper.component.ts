import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';

import { SentencesGenerationService } from '../../services';

@Component({
  selector: 'tock-sentences-generation-wrapper',
  templateUrl: './sentences-generation-wrapper.component.html',
  styleUrls: ['./sentences-generation-wrapper.component.scss']
})
export class SentencesGenerationWrapperComponent implements OnInit, OnDestroy {
  @Input() sentences: string[] = [];

  @Output() onGeneratedSentences = new EventEmitter<string[]>();

  loading: boolean = false;

  private subscription = new Subscription();

  constructor(
    public dialogRef: NbDialogRef<SentencesGenerationWrapperComponent>,
    private sentencesGenerationService: SentencesGenerationService
  ) {}

  ngOnInit(): void {
    this.subscription = this.sentencesGenerationService.sentencesExample$.subscribe((sentencesExample: string[]) => {
      if (sentencesExample.length) {
        this.sentences = sentencesExample;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleLoading(loading: boolean): void {
    this.loading = loading;
  }

  handleGeneratedSentences(generatedSentences: string[]): void {
    this.onGeneratedSentences.emit(generatedSentences);
  }
}
