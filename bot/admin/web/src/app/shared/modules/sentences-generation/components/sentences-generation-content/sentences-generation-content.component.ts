import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { StateService } from '../../../../../core-nlp/state.service';
import { CompletionRequest, CompletionResponse, GeneratedSentence, GeneratedSentenceError, SentencesGenerationOptions } from '../../models';
import { SentencesGenerationApiService } from '../../services';

@Component({
  selector: 'tock-sentences-generation-content',
  templateUrl: './sentences-generation-content.component.html',
  styleUrls: ['./sentences-generation-content.component.scss']
})
export class SentencesGenerationContentComponent implements OnChanges {
  @Input() sentences: string[] = [];
  @Input() errors: GeneratedSentenceError[] = [];
  @Input() closable: boolean | string = false;

  @Output() onClose = new EventEmitter<boolean>(false);
  @Output() onLoading = new EventEmitter<boolean>(false);
  @Output() onValidateSelection = new EventEmitter<string[]>();

  generatedSentences: GeneratedSentence[] = [];
  showAlert: boolean = true;
  options: SentencesGenerationOptions = {
    abbreviatedLanguage: false,
    sentenceExample: '',
    sentencesExample: [],
    spellingMistakes: false,
    smsLanguage: false,
    temperature: 0.7
  };

  constructor(private stateService: StateService, private sentencesGenerationApiService: SentencesGenerationApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sentences?.currentValue?.length !== changes.sentences?.previousValue?.length) {
      this.generatedSentences = this.generatedSentences.map((sentence: GeneratedSentence) => ({
        ...sentence,
        selected: false,
        distinct: this.isDistinct(sentence.sentence)
      }));
    }

    if (changes.errors?.currentValue?.length !== changes.errors?.previousValue?.length) {
      this.generatedSentences = this.generatedSentences.map((sentence: GeneratedSentence) => ({
        ...sentence,
        selected: false,
        errorMessage: this.feedGeneratedSentenceError(changes.errors.currentValue, sentence.sentence)
      }));
    }
  }

  private feedGeneratedSentenceError(errors: GeneratedSentenceError[], sentence: string): string | undefined {
    return errors.find((error: GeneratedSentenceError) => error.sentence === sentence)?.message;
  }

  generate(options: SentencesGenerationOptions = this.options): void {
    const { abbreviatedLanguage, sentenceExample, sentencesExample, smsLanguage, spellingMistakes, temperature } = options;
    const sentences: string[] = sentenceExample ? [sentenceExample, ...sentencesExample] : sentencesExample;
    const completionRequest: CompletionRequest = {
      data: {
        sentences,
        locale: this.stateService.currentLocale,
        abbreviatedLanguage,
        smsLanguage,
        spellingMistakes
      },
      config: {
        temperature
      }
    };

    this.updateOptions(options);
    this.onLoading.emit(true);

    this.sentencesGenerationApiService.generateSentences(completionRequest).subscribe({
      next: (completionResponse: CompletionResponse) => {
        this.generatedSentences = this.feedGeneratedSentences(completionResponse.choices);
        this.onLoading.emit(false);
      },
      error: (e) => {
        this.onLoading.emit(false);
      }
    });
  }

  private updateOptions(options: SentencesGenerationOptions): void {
    this.options = { ...options };
  }

  private feedGeneratedSentences(generatedSentences: string[]): GeneratedSentence[] {
    return generatedSentences.map((sentence: string) => ({
      distinct: this.isDistinct(sentence),
      selected: false,
      sentence
    }));
  }

  private isDistinct(sentence: string): boolean {
    return !!!this.sentences.find((s) => s === sentence);
  }

  validateSelection(selectedGeneratedSentences: string[]): void {
    this.onValidateSelection.emit(selectedGeneratedSentences);
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  backOptions(): void {
    this.generatedSentences = [];
  }

  close(): void {
    this.onClose.emit(true);
  }
}
