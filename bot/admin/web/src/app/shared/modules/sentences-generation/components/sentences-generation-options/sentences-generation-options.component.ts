import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SentencesGenerationOptions } from '../../models';

@Component({
  selector: 'tock-sentences-generation-options',
  templateUrl: './sentences-generation-options.component.html',
  styleUrls: ['./sentences-generation-options.component.scss']
})
export class SentencesGenerationOptionsComponent implements OnInit {
  @Input() sentences: string[] = [];
  @Input() options!: SentencesGenerationOptions;

  @Output() onGenerate = new EventEmitter<SentencesGenerationOptions>();

  ngOnInit(): void {
    this.form.patchValue({ ...this.options });
  }

  sentencesExampleMax: number = 5;

  form = new FormGroup({
    spellingMistakes: new FormControl(false),
    smsLanguage: new FormControl(false),
    abbreviatedLanguage: new FormControl(false),
    temperature: new FormControl(0.7),
    sentenceExample: new FormControl(''),
    sentencesExample: new FormControl([], [Validators.maxLength(this.sentencesExampleMax)])
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

  get canGenerate(): boolean {
    return this.form.valid && (this.sentenceExample.value || this.sentencesExample.value.length);
  }

  generate(): void {
    if (this.canGenerate) this.onGenerate.emit(this.form.value as SentencesGenerationOptions);
  }
}
