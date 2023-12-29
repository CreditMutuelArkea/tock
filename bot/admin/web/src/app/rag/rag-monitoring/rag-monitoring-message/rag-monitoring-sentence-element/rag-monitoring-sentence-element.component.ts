import { Component, Input, OnInit } from '@angular/core';
import { SentenceElement } from '../../../../shared/model/dialog-data';

@Component({
  selector: 'tock-rag-monitoring-sentence-element',
  templateUrl: './rag-monitoring-sentence-element.component.html',
  styleUrls: ['./rag-monitoring-sentence-element.component.scss']
})
export class RagMonitoringSentenceElementComponent implements OnInit {
  @Input() element: SentenceElement;

  constructor() {}

  ngOnInit(): void {}
}
