import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Source, sourceTypes } from '../../models';

interface NewSourceForm {
  name: FormControl<string>;
  description: FormControl<string>;
  type: FormControl<sourceTypes>;
  url?: FormControl<URL>;
}

@Component({
  selector: 'tock-new-source',
  templateUrl: './new-source.component.html',
  styleUrls: ['./new-source.component.scss']
})
export class NewSourceComponent implements OnInit {
  isSubmitted: boolean = false;
  sourceTypes = sourceTypes;

  @Input() source?: Source;
  @Output() onSave = new EventEmitter();

  constructor(public dialogRef: NbDialogRef<NewSourceComponent>) {}

  ngOnInit(): void {
    this.type.valueChanges.subscribe((type) => {
      const validators = [Validators.required, this.isUrl.bind(this)];
      if (type === this.sourceTypes.remote) {
        this.url.addValidators(validators);
      } else {
        this.url.clearValidators();
      }
      this.url.updateValueAndValidity();
    });

    if (this.source) {
      this.form.patchValue(this.source);
      this.type.disable();
    }
  }

  form = new FormGroup<NewSourceForm>({
    name: new FormControl(undefined, [Validators.required, Validators.minLength(6), Validators.maxLength(40)]),
    description: new FormControl(undefined),
    type: new FormControl(undefined, [Validators.required]),
    url: new FormControl(undefined)
  });

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get type(): FormControl {
    return this.form.get('type') as FormControl;
  }

  get url(): FormControl {
    return this.form.get('url') as FormControl;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  private isUrl(control: FormControl): null | {} {
    if (!control?.value?.length) return null;

    const reg = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
    if (reg.test(control.value)) {
      return null;
    }

    return { custom: 'This is not a valid url' };
  }

  saveNewSource(): void {
    this.isSubmitted = true;

    if (this.canSave) {
      this.onSave.emit(this.form.value);
      this.cancel();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
