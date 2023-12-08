import { Component } from '@angular/core';
import { SentenceTrainingMode } from '../../../shared/components/sentence-training/models';

@Component({
  selector: 'tock-sentences-unknown',
  templateUrl: './sentences-unknown.component.html',
  styleUrls: ['./sentences-unknown.component.scss']
})
export class SentencesUnknownComponent {
  mode = SentenceTrainingMode.UNKNOWN;
  constructor() {}
}
