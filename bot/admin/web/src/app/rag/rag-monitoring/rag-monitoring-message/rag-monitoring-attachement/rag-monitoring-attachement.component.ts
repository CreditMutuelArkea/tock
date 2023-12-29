import { Component, Input, OnInit } from '@angular/core';
import { Attachment } from '../../../../shared/model/dialog-data';

@Component({
  selector: 'tock-rag-monitoring-attachement',
  templateUrl: './rag-monitoring-attachement.component.html',
  styleUrls: ['./rag-monitoring-attachement.component.scss']
})
export class RagMonitoringAttachementComponent implements OnInit {
  @Input() attachment: Attachment;

  constructor() {}

  ngOnInit(): void {}
}
