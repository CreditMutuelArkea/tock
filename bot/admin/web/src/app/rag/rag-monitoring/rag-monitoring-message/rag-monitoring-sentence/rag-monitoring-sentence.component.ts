import { Component, Input, OnInit } from '@angular/core';
import { Sentence } from '../../../../shared/model/dialog-data';

@Component({
  selector: 'tock-rag-monitoring-sentence',
  templateUrl: './rag-monitoring-sentence.component.html',
  styleUrls: ['./rag-monitoring-sentence.component.scss']
})
export class RagMonitoringSentenceComponent implements OnInit {
  @Input() sentence: Sentence;

  constructor() {}

  ngOnInit(): void {}
}
