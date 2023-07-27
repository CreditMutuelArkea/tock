import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Source } from '../../../models';

@Component({
  selector: 'tock-source-normalization-csv',
  templateUrl: './source-normalization-csv.component.html',
  styleUrls: ['./source-normalization-csv.component.scss']
})
export class SourceNormalizationCsvComponent {
  @Input() source?: Source;

  @Output() onNormalize = new EventEmitter();

  constructor(public dialogRef: NbDialogRef<SourceNormalizationCsvComponent>) {}

  form: FormGroup = new FormGroup({
    answer: new FormControl<string>(null, Validators.required),
    sourceRef: new FormControl<string>(null),
    sourceId: new FormControl<string>(null)
  });

  get answer(): FormControl {
    return this.form.get('answer') as FormControl;
  }
  get sourceRef(): FormControl {
    return this.form.get('sourceRef') as FormControl;
  }
  get sourceId(): FormControl {
    return this.form.get('sourceId') as FormControl;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  isSubmitted;

  submit(): void {
    this.isSubmitted = true;
    if (this.canSave) {
      const columns = this.getColumnNames();
      const normalization = {
        answer: columns.findIndex((col) => col === this.answer.value),
        sourceRef: columns.findIndex((col) => col === this.sourceRef.value),
        sourceId: columns.findIndex((col) => col === this.sourceId.value)
      };

      const rawData: [] = this.source.rawData;
      rawData.splice(0, 1);

      const normalizedData = rawData.map((entry) => {
        const frag = {};
        Object.entries(normalization).forEach((norm) => {
          if (norm[1]) frag[norm[0]] = entry[norm[1]];
        });
        return frag;
      });

      this.onNormalize.emit(normalizedData);
    }
  }

  getColumnNames(): any[] {
    return this.source.rawData[0];
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
