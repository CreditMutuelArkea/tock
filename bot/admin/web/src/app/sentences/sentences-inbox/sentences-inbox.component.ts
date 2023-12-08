import { Component, OnInit, ViewChild } from '@angular/core';
import { SentenceTrainingMode } from '../../shared/components/sentence-training/models';
import { SentenceTrainingComponent } from '../../shared/components';

@Component({
  selector: 'tock-sentences-inbox',
  templateUrl: './sentences-inbox.component.html',
  styleUrls: ['./sentences-inbox.component.scss']
})
export class SentencesInboxComponent {
  mode = SentenceTrainingMode.INBOX;

  @ViewChild(SentenceTrainingComponent) sentencesTraining;

  constructor() {}

  refresh() {
    this.sentencesTraining.refresh();
  }
}
