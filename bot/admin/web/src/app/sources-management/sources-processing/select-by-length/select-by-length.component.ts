import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';

interface SelectByLengthForm {
  length: FormControl<number>;
}

@Component({
  selector: 'tock-select-by-length',
  templateUrl: './select-by-length.component.html',
  styleUrls: ['./select-by-length.component.scss']
})
export class SelectByLengthComponent implements OnInit {
  @Input() data;
  @Output() onSubmit = new EventEmitter();

  constructor(public dialogRef: NbDialogRef<SelectByLengthComponent>) {}

  ngOnInit(): void {}

  form = new FormGroup<SelectByLengthForm>({
    length: new FormControl(120, [Validators.required])
  });

  get length(): FormControl {
    return this.form.get('length') as FormControl;
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  submit() {
    if (this.canSave) {
      this.onSubmit.emit(this.form.value);
      this.cancel();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
