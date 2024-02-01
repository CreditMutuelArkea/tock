import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DefaultPrompt, EnginesConfigurationParam } from '../models/engines-configurations';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'tock-rag-settings-input',
  templateUrl: './rag-settings-input.component.html',
  styleUrls: ['./rag-settings-input.component.scss']
})
export class RagSettingsInputComponent {
  @Input() configurationParam: EnginesConfigurationParam;
  @Input() parentGroup: string;
  @Input() form: FormGroup;
  @Input() isSubmitted: boolean;

  @ViewChild('clearInput') clearInput: ElementRef;

  inputVisible: boolean = false;

  getFormControl(): FormControl {
    return this.form.get(this.parentGroup).get(this.configurationParam.key) as FormControl;
  }

  restoreDefaultPrompt(): void {
    this.form.get(this.parentGroup).get('prompt').setValue(DefaultPrompt);
    this.form.get(this.parentGroup).get('prompt').markAsDirty();
  }

  showInput(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;

    setTimeout(() => {
      const selectionStart = target.selectionStart;
      this.inputVisible = true;
      setTimeout(() => {
        const clearInputElem = this.clearInput.nativeElement;
        clearInputElem.focus();
        if (Number.isInteger(selectionStart)) clearInputElem.setSelectionRange(selectionStart, selectionStart);
      });
    });
  }

  hideInput(): void {
    this.inputVisible = false;
  }

  getControlObfuscatedValue(): string {
    let str = this.getFormControl().value;
    if (!str) return '';

    let url: URL;
    let strLen: number;
    let protocol: string;

    try {
      url = new URL(str);
    } catch (_) {}

    if (url) {
      protocol = url.protocol;
      str = str.replace(protocol, '');
      strLen = str.length;
    } else {
      strLen = str.length;
    }

    const nbVisibleChars = Math.min(3, Math.floor(strLen / 8.1));
    if (nbVisibleChars) {
      const nbHiddens = strLen - 2 * nbVisibleChars;
      const obfuscation = [str.substring(0, nbVisibleChars), '*'.repeat(nbHiddens), str.slice(nbVisibleChars * -1)].join('');

      return [protocol, obfuscation].join('');
    }

    return '*'.repeat(strLen);
  }
}
