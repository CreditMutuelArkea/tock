import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ScenarioVersion } from '../../../models';

@Component({
  selector: 'tock-contexts-graph-modal',
  templateUrl: './contexts-graph-modal.component.html',
  styleUrls: ['./contexts-graph-modal.component.scss']
})
export class ContextsGraphModalComponent {
  @Input() scenario: ScenarioVersion;

  offsets;

  constructor(private dialogRef: NbDialogRef<ContextsGraphModalComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
