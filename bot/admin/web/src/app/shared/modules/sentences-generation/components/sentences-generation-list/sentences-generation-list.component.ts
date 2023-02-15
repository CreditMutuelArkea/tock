import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { GeneratedSentence } from '../../models';

@Component({
  selector: 'tock-sentences-generation-list',
  templateUrl: './sentences-generation-list.component.html',
  styleUrls: ['./sentences-generation-list.component.scss']
})
export class SentencesGenerationListComponent implements OnChanges {
  @Input() generatedSentences: GeneratedSentence[] = [];

  @Output() onBackOptions = new EventEmitter();
  @Output() onGenerate = new EventEmitter();
  @Output() onValidateSelection = new EventEmitter<string[]>();

  distinctGeneratedSentencesLength: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.generatedSentences.currentValue) {
      this.distinctGeneratedSentencesLength = this.feedDistinctGeneratedSentencesLength();
    }
  }

  get isSelectedGeneratedSentences(): boolean {
    const generatedSentencesLength = this.generatedSentences.filter((s: GeneratedSentence) => s.selected).length;

    return generatedSentencesLength > 0 && generatedSentencesLength < this.distinctGeneratedSentencesLength;
  }

  get isAllSelectedGeneratedSentences(): boolean {
    const generatedSentencesLength = this.generatedSentences.filter((s: GeneratedSentence) => s.selected).length;

    return this.distinctGeneratedSentencesLength > 0 && this.distinctGeneratedSentencesLength === generatedSentencesLength;
  }

  private feedDistinctGeneratedSentencesLength(): number {
    return this.generatedSentences.reduce((acc, curr) => {
      if (curr.distinct) acc++;

      return acc;
    }, 0);
  }

  toggleAllSelectGeneratedSentences(value: boolean): void {
    if (!value) {
      this.generatedSentences = this.generatedSentences.map((s: GeneratedSentence) => {
        if (s.distinct) return { ...s, selected: false };

        return s;
      });
    } else {
      this.generatedSentences = this.generatedSentences.map((s: GeneratedSentence) => {
        if (s.distinct) return { ...s, selected: true };

        return s;
      });
    }
  }

  toggleSelectGeneratedSentence(sentence: GeneratedSentence): void {
    this.generatedSentences = this.generatedSentences.map((s: GeneratedSentence) => {
      if (s === sentence) return { ...s, selected: !s.selected };

      return s;
    });
  }

  backOptions(): void {
    this.onBackOptions.emit();
  }

  generate(): void {
    this.onGenerate.emit();
  }

  validateSelection(): void {
    const selectedGeneratedSentences = this.generatedSentences
      .filter((s: GeneratedSentence) => s.selected)
      .map((s: GeneratedSentence) => s.sentence);

    this.onValidateSelection.emit(selectedGeneratedSentences);
  }
}
