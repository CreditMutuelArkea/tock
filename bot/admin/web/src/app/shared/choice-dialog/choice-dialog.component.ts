import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'tock-choice-dialog',
  templateUrl: './choice-dialog.component.html',
  styleUrls: ['./choice-dialog.component.scss']
})
export class ChoiceDialogComponent {
  @Input() modalStatus: string = 'primary';
  @Input() title: string;
  @Input() subtitle: string;
  @Input() action1: string;
  @Input() action2: string;

  constructor(public dialogRef: NbDialogRef<ChoiceDialogComponent>) {}
}
