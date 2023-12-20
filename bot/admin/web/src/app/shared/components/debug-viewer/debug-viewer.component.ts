import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'tock-debug-viewer',
  templateUrl: './debug-viewer.component.html',
  styleUrls: ['./debug-viewer.component.scss']
})
export class DebugViewerComponent {
  @Input() debug?: any;
  @Input() title?: string = 'Debug infos';

  constructor(public dialogRef: NbDialogRef<DebugViewerComponent>) {}

  cancel() {
    this.dialogRef.close();
  }
}
