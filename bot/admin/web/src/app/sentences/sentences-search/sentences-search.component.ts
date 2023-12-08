import { Component, OnInit, ViewChild } from '@angular/core';
import { SentenceTrainingMode } from '../../shared/components/sentence-training/models';
import { SentenceTrainingComponent } from '../../shared/components';

@Component({
  selector: 'tock-sentences-search',
  templateUrl: './sentences-search.component.html',
  styleUrls: ['./sentences-search.component.scss']
})
export class SentencesSearchComponent {
  mode = SentenceTrainingMode.SEARCH;
  @ViewChild(SentenceTrainingComponent) sentencesTraining;

  refresh() {
    this.sentencesTraining.refresh();
  }

  downloadSentencesDump() {
    this.sentencesTraining.downloadSentencesDump();
  }

  constructor() {}
}
