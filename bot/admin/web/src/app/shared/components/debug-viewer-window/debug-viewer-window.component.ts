import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tock-debug-viewer-window',
  templateUrl: './debug-viewer-window.component.html',
  styleUrls: ['./debug-viewer-window.component.scss']
})
export class DebugViewerWindowComponent implements OnInit {
  @Input() debug?: any;
  constructor() {}

  ngOnInit(): void {
    console.log(this.debug);
  }
}
