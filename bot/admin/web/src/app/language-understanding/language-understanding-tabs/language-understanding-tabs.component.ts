import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

class TabLink {
  constructor(public route: string, public title: string, public icon?: string) {}
}

const tabs = [
  new TabLink('try', 'New Sentence', 'plus-circle-outline'),
  new TabLink('inbox', 'Inbox', 'inbox-outline'),
  new TabLink('search', 'Search', 'search-outline'),
  new TabLink('unknown', 'Unknown', 'question-mark-circle-outline'),
  new TabLink('intents', 'Intents', 'compass-outline'),
  new TabLink('entities', 'Entities', 'attach-outline'),
  new TabLink('logs', 'Logs', 'list-outline')
];

@Component({
  selector: 'tock-language-understanding-tabs',
  templateUrl: './language-understanding-tabs.component.html',
  styleUrls: ['./language-understanding-tabs.component.scss']
})
export class LanguageUnderstandingTabsComponent implements OnInit {
  tabLinks = tabs;

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.router.routerState.snapshot.url.endsWith('/language-undestanding')) {
      this.router.navigateByUrl('/language-undestanding/inbox');
    }
  }
}
