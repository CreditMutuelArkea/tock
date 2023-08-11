import { Component, OnInit } from '@angular/core';
import { TabLink } from '../../shared/utils';

const tabLinks = [
  new TabLink('sources', 'Rag sources', 'cloud-download-outline'),
  new TabLink('exclusions', 'Rag exclusions', 'alert-triangle-outline'),
  new TabLink('settings', 'Rag settings', 'settings-outline')
];

@Component({
  selector: 'tock-rag-tabs',
  templateUrl: './rag-tabs.component.html',
  styleUrls: ['./rag-tabs.component.scss']
})
export class RagTabsComponent implements OnInit {
  tabLinks: TabLink[] = tabLinks;

  constructor() {}

  ngOnInit(): void {}
}
