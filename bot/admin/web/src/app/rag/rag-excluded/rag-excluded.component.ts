import { Component, OnInit } from '@angular/core';
import { Intent, SentenceStatus } from '../../model/nlp';
import { SentenceFilter } from '../../sentences-scroll/sentences-scroll.component';

@Component({
  selector: 'tock-rag-excluded',
  templateUrl: './rag-excluded.component.html',
  styleUrls: ['./rag-excluded.component.scss']
})
export class RagExcludedComponent implements OnInit {
  filter: SentenceFilter = new SentenceFilter(null, Intent.ragExcluded, [SentenceStatus.validated, SentenceStatus.model]);

  constructor() {}

  ngOnInit(): void {}
}
