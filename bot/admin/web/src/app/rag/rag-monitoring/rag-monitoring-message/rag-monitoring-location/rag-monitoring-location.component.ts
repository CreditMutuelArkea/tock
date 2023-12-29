import { Component, Input, OnInit } from '@angular/core';
import { Location } from '../../../../shared/model/dialog-data';

@Component({
  selector: 'tock-rag-monitoring-location',
  templateUrl: './rag-monitoring-location.component.html',
  styleUrls: ['./rag-monitoring-location.component.scss']
})
export class RagMonitoringLocationComponent implements OnInit {
  @Input() location: Location;

  constructor() {}

  ngOnInit(): void {}
}
