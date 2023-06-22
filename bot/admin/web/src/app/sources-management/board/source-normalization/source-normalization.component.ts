import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Source } from '../../models';

@Component({
  selector: 'tock-source-normalization',
  templateUrl: './source-normalization.component.html',
  styleUrls: ['./source-normalization.component.scss']
})
export class SourceNormalizationComponent implements OnInit {
  @Input() source?: Source;

  @Output() onNormalize = new EventEmitter();

  constructor(public dialogRef: NbDialogRef<SourceNormalizationComponent>) {}

  ngOnInit(): void {
    console.log(this.source);
  }

  form: FormGroup = new FormGroup({
    answer: new FormControl<string>(null, Validators.required),
    sourceRef: new FormControl<string>(null)
  });

  get answer(): FormControl {
    return this.form.get('answer') as FormControl;
  }
  get sourceRef(): FormControl {
    return this.form.get('sourceRef') as FormControl;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  isSubmitted;

  submit() {
    this.isSubmitted = true;
    if (this.canSave) {
      const columns = this.getColumnNames();
      this.onNormalize.emit({
        answerIndex: columns.findIndex((col) => col === this.answer.value),
        sourceRefIndex: columns.findIndex((col) => col === this.sourceRef.value)
      });
    }
  }

  getColumnNames() {
    return this.source.rawData.data[0];
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
