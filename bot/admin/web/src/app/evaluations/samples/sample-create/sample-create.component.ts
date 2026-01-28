import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Subject } from 'rxjs';
import { getFirstDayOfPreviousMonth, getLastDayOfPreviousMonth } from '../../../shared/utils';
import { Router } from '@angular/router';

interface DialogListFiltersForm {
  name: FormControl<string>;
  description: FormControl<string>;
  allowTestDialogs: FormControl<boolean>;
  dialogActivityFrom?: FormControl<Date | null>;
  dialogActivityTo?: FormControl<Date | null>;
  requestedDialogCount: FormControl<number>;
}

@Component({
  selector: 'tock-sample-create',
  templateUrl: './sample-create.component.html',
  styleUrl: './sample-create.component.scss'
})
export class SampleCreateComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<boolean> = new Subject();

  isSubmitted: boolean = false;

  constructor(public dialogRef: NbDialogRef<SampleCreateComponent>, private router: Router) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfPreviousMonth = getFirstDayOfPreviousMonth(today);
    const lastDayOfPreviousMonth = getLastDayOfPreviousMonth(today);

    const previousMonthName = firstDayOfPreviousMonth.toLocaleString('en-US', { month: 'long' });
    const previousMonthYear = firstDayOfPreviousMonth.getFullYear();

    this.form.patchValue({
      name: `Evaluation sample ${previousMonthName} ${previousMonthYear}`,
      dialogActivityFrom: firstDayOfPreviousMonth,
      dialogActivityTo: lastDayOfPreviousMonth
    });
  }

  form = new FormGroup<DialogListFiltersForm>({
    name: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
    description: new FormControl('', [Validators.maxLength(750)]),
    allowTestDialogs: new FormControl(false),
    dialogActivityFrom: new FormControl<Date | null>(null),
    dialogActivityTo: new FormControl<Date | null>(null),
    requestedDialogCount: new FormControl(50, [Validators.required])
  });

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  nbDialogOptions = [
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 150, label: '150' },
    { value: 200, label: '200' }
  ];

  getFormControl(formControlName: string): FormControl {
    return this.form.get(formControlName) as FormControl;
  }

  validateForm(): boolean {
    const dateFrom = this.form.get('dialogActivityFrom')?.value;
    const dateTo = this.form.get('dialogActivityTo')?.value;

    if (!dateFrom || !(dateFrom instanceof Date) || isNaN(dateFrom.getTime())) {
      this.form.get('dialogActivityFrom')?.setErrors({ custom: 'This field requires a valid date.' });
      return false;
    }

    if (!dateTo || !(dateTo instanceof Date) || isNaN(dateTo.getTime())) {
      this.form.get('dialogActivityTo')?.setErrors({ custom: 'This field requires a valid date.' });
      return false;
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      this.form.get('dialogActivityFrom')?.setErrors({ custom: 'The start date must be earlier than the end date.' });
      return false;
    }

    return true;
  }

  createSample(): void {
    this.isSubmitted = true;
    if (this.validateForm() && this.canSave) {
      this.router.navigate(['/evaluations/samples/detail', '1'], { state: { formData: this.form.value } });
      this.dialogRef.close(this.form.value);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
