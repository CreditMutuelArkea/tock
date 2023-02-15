import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NbToastrService } from '@nebular/theme';

import { RestService } from '../../../../../core-nlp/rest/rest.service';
import { GeneratedSentence, SentencesGenerationOptions } from '../../models';

@Component({
  selector: 'tock-sentences-generation',
  templateUrl: './sentences-generation-content.component.html',
  styleUrls: ['./sentences-generation-content.component.scss']
})
export class SentencesGenerationContentComponent implements OnChanges {
  @Input() sentences: string[] = [];
  @Input() closable: boolean | string = false;

  @Output() onClose = new EventEmitter<boolean>(false);
  @Output() onLoading = new EventEmitter<boolean>(false);
  @Output() onGeneratedSentences = new EventEmitter<string[]>();

  generatedSentences: GeneratedSentence[] = [];
  alert: boolean = true;
  options: SentencesGenerationOptions = {
    abbreviatedLanguage: false,
    sentenceExample: '',
    sentencesExample: [],
    spellingMistakes: false,
    smsLanguage: false,
    temperature: 0.7
  };

  constructor(private toastrService: NbToastrService, private rest: RestService, private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sentences.currentValue?.length !== changes.sentences.previousValue?.length) {
      this.generatedSentences = this.generatedSentences.map((sentence: GeneratedSentence) => ({
        ...sentence,
        selected: false,
        distinct: this.isDistinct(sentence.sentence)
      }));
    }
  }

  private getRequest(
    spellingMistakes: boolean,
    smsLanguage: boolean,
    abbreviatedLanguage: boolean,
    sentenceExample: string,
    sentencesExample: string[]
  ): string {
    const request = ['Parameters:\n'];
    const sentences = [];

    if (spellingMistakes || smsLanguage || abbreviatedLanguage) {
      if (spellingMistakes) request.push('- include sentences with spelling mistakes\n');
      if (smsLanguage) request.push('- include sentences with sms language\n');
      if (abbreviatedLanguage) request.push('- include sentences with abbreviated language\n');
    } else {
      request.push('- no parameters\n');
    }

    request.push(
      'Takes into account the previous parameters and generates 5 sentences derived from the sentences in the following table: '
    );
    request.push('[');

    if (sentenceExample) sentences.push(`"${sentenceExample}"`);

    sentencesExample.forEach((sentence: string) => {
      sentences.push(`"${sentence}"`);
    });

    request.push(sentences.toString());
    request.push(']');

    return request.join('');
  }

  generate(options: SentencesGenerationOptions = this.options): void {
    const { abbreviatedLanguage, sentenceExample, sentencesExample, smsLanguage, spellingMistakes, temperature } = options;
    const body = {
      model: 'text-davinci-003',
      prompt: this.getRequest(spellingMistakes, smsLanguage, abbreviatedLanguage, sentenceExample, sentencesExample),
      max_tokens: 2048,
      temperature: temperature
    };

    const headers = {
      Authorization: 'Bearer '
    };

    const request = this.http.post<any>('https://api.openai.com/v1/completions', body, {
      headers: headers
    });

    this.updateOptions(options);
    this.onLoading.emit(true);

    request.subscribe({
      next: (v) => {
        this.generatedSentences = this.feedGeneratedSentences(this.parseResult(v.choices[0].text));
        this.onLoading.emit(false);
      },
      error: (e) => {
        this.onLoading.emit(false);
        console.error(e);
        this.toastrService.danger(e?.error?.error?.message || 'An error has occured', 'Error');
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

  private parseResult(text: string): string[] {
    return text
      .split(new RegExp('[\\n]+[0-9]+.'))
      .map((r) => r.trim())
      .filter((r) => r);
  }

  private isDistinct(sentence: string): boolean {
    return !!!this.sentences.find((s) => s === sentence);
  }

  validateSelection(selectedGeneratedSentences: string[]): void {
    this.onGeneratedSentences.emit(selectedGeneratedSentences);
  }

  closeAlert(): void {
    this.alert = false;
  }

  backOptions(): void {
    this.generatedSentences = [];
  }

  close(): void {
    this.onClose.emit(true);
  }
}
