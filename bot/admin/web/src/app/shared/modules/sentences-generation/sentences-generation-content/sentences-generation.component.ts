import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';

import { RestService } from '../../../../core-nlp/rest/rest.service';

type GeneratedSentence = {
  sentence: string;
  selected: boolean;
  distinct: boolean;
};

@Component({
  selector: 'tock-sentences-generation',
  templateUrl: './sentences-generation.component.html',
  styleUrls: ['./sentences-generation.component.scss']
})
export class SentencesGenerationComponent implements OnChanges {
  @Input() sentences: string[] = [];
  @Input() closable: boolean | string = false;

  @Output() onClose = new EventEmitter<boolean>(false);
  @Output() onLoading = new EventEmitter<boolean>(false);
  @Output() onGeneratedSentences = new EventEmitter<string[]>();

  generatedSentences: GeneratedSentence[] = [];
  selection: SelectionModel<GeneratedSentence> = new SelectionModel<GeneratedSentence>(true, []);
  distinctGeneratedSentencesLength: number = 0;
  alert: boolean = true;

  form = new FormGroup({
    spellingMistakes: new FormControl(false),
    smsLanguage: new FormControl(false),
    abbreviatedLanguage: new FormControl(false),
    temperature: new FormControl(0.7),
    sentenceExample: new FormControl(''),
    sentencesExample: new FormControl([], [Validators.maxLength(3)])
  });

  get spellingMistakes(): FormControl {
    return this.form.get('spellingMistakes') as FormControl;
  }

  get smsLanguage(): FormControl {
    return this.form.get('smsLanguage') as FormControl;
  }

  get abbreviatedLanguage(): FormControl {
    return this.form.get('abbreviatedLanguage') as FormControl;
  }

  get temperature(): FormControl {
    return this.form.get('temperature') as FormControl;
  }

  get sentenceExample(): FormControl {
    return this.form.get('sentenceExample') as FormControl;
  }

  get sentencesExample(): FormControl {
    return this.form.get('sentencesExample') as FormControl;
  }

  constructor(private toastrService: NbToastrService, private rest: RestService, private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sentences.currentValue?.length !== changes.sentences.previousValue?.length) {
      this.generatedSentences = this.generatedSentences.map((sentence: GeneratedSentence) => ({
        ...sentence,
        selected: false,
        distinct: this.isDistinct(sentence.sentence)
      }));
      this.distinctGeneratedSentencesLength = this.feedDistinctGeneratedSentencesLength();
    }
  }

  private getRequest(): string {
    const request = ['Parameters:\n'];
    const sentences = [];

    if (this.spellingMistakes.value || this.smsLanguage.value || this.abbreviatedLanguage.value) {
      if (this.spellingMistakes.value) request.push('- include sentences with spelling mistakes\n');
      if (this.smsLanguage.value) request.push('- include sentences with sms language\n');
      if (this.abbreviatedLanguage.value) request.push('- include sentences with abbreviated language\n');
    } else {
      request.push('- no parameters\n');
    }

    request.push(
      'Takes into account the previous parameters and generates 10 sentences derived from the sentences in the following table:'
    );
    request.push('[');

    if (this.sentenceExample.value) sentences.push(`"${this.sentenceExample.value}"`);

    this.sentencesExample.value.forEach((sentence: string) => {
      sentences.push(`"${sentence}"`);
    });

    request.push(sentences.toString());
    request.push(']');

    return request.join('');
  }

  generate(): void {
    const body = {
      model: 'text-davinci-003',
      prompt: this.getRequest(),
      max_tokens: 2048,
      temperature: this.temperature.value
    };

    const headers = {
      Authorization: 'Bearer '
    };

    const request = this.http.post<any>('https://api.openai.com/v1/completions', body, {
      headers: headers
    });

    this.onLoading.emit(true);

    request.subscribe({
      next: (v) => {
        this.generatedSentences = this.feedGeneratedSentences(this.parseResult(v.choices[0].text));
        this.distinctGeneratedSentencesLength = this.feedDistinctGeneratedSentencesLength();
        this.onLoading.emit(false);
      },
      error: (e) => {
        this.onLoading.emit(false);
        this.toastrService.danger(e?.message || 'An error has occured', 'Error');
      }
    });
  }

  private feedGeneratedSentences(generatedSentences: string[]): GeneratedSentence[] {
    return generatedSentences.map((sentence: string) => ({
      distinct: this.isDistinct(sentence),
      selected: false,
      sentence
    }));
  }

  private feedDistinctGeneratedSentencesLength(): number {
    return this.generatedSentences.reduce((acc, curr) => {
      if (curr.distinct) acc++;

      return acc;
    }, 0);
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

  isSelectedGeneratedSentences(): boolean {
    const generatedSentencesLength = this.generatedSentences.filter((s: GeneratedSentence) => s.selected).length;

    return generatedSentencesLength > 0 && generatedSentencesLength < this.distinctGeneratedSentencesLength;
  }

  isAllSelectedGeneratedSentences(): boolean {
    const generatedSentencesLength = this.generatedSentences.filter((s: GeneratedSentence) => s.selected).length;

    return this.distinctGeneratedSentencesLength === generatedSentencesLength;
  }

  validateSelection(): void {
    const selectedGeneratedSentences = this.generatedSentences
      .filter((s: GeneratedSentence) => s.selected)
      .map((s: GeneratedSentence) => s.sentence);

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
