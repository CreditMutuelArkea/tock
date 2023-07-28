import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Source, sourceTypes } from '../../models';

interface NewSourceForm {
  name: FormControl<string>;
  description: FormControl<string>;
  source_type: FormControl<sourceTypes>;
  source_parameters: FormGroup<SourceParametersForm>;
}
interface SourceParametersForm {
  source_url?: FormControl<URL>;
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
    this.source_type.valueChanges.subscribe((type) => {
      const validators = [Validators.required, this.isUrl.bind(this)];
      if (type === this.sourceTypes.remote) {
        this.source_url.addValidators(validators);
      } else {
        this.source_url.clearValidators();
      }
      this.source_url.updateValueAndValidity();
    });

    if (this.source) {
      this.form.patchValue(this.source);
      this.source_type.disable();
    }
  }

  form = new FormGroup<NewSourceForm>({
    name: new FormControl(undefined, [Validators.required, Validators.minLength(6), Validators.maxLength(40)]),
    description: new FormControl(undefined),
    source_type: new FormControl(undefined, [Validators.required]),
    source_parameters: new FormGroup<SourceParametersForm>({
      source_url: new FormControl(undefined)
    })
  });

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get source_type(): FormControl {
    return this.form.get('source_type') as FormControl;
  }

  get source_url(): FormControl {
    return this.form.controls.source_parameters.get('source_url') as FormControl;
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
      console.log(this.form.value);
      this.onSave.emit(this.form.value);
      this.cancel();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
