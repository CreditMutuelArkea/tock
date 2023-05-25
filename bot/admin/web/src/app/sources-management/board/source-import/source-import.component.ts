import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Source, sourceTypes } from '../../models';

@Component({
  selector: 'source-tock-import',
  templateUrl: './source-import.component.html',
  styleUrls: ['./source-import.component.scss']
})
export class SourceImportComponent implements OnInit {
  @Input() source?: Source;

  @Output() onImport = new EventEmitter();

  sourceTypes = sourceTypes;

  constructor(public dialogRef: NbDialogRef<SourceImportComponent>) {}

  ngOnInit(): void {}

  import() {
    this.onImport.emit();
    this.cancel();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
