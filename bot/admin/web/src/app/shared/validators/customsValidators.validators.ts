import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomsValidators {
  static url(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const pattern =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const urlRegex = new RegExp(pattern);

    return urlRegex.test(value) ? null : { url: true };
  }
}
