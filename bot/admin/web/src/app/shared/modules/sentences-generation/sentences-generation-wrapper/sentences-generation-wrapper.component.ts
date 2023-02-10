import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'tock-sentences-generation-wrapper',
  templateUrl: './sentences-generation-wrapper.component.html',
  styleUrls: ['./sentences-generation-wrapper.component.scss']
})
export class SentencesGenerationWrapperComponent {
  @Input() sentences: string[] = [];

  @Output() onGeneratedSentences = new EventEmitter<string[]>();

  loading: boolean = false;

  constructor(public dialogRef: NbDialogRef<SentencesGenerationWrapperComponent>) {}

  handleLoading(loading: boolean): void {
    this.loading = loading;
  }

  handleGeneratedSentences(generatedSentences: string[]): void {
    this.onGeneratedSentences.emit(generatedSentences);
  }
}
