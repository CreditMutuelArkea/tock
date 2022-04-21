import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import { Subscription } from 'rxjs';

const DEFAULT_LABEL = 'Select file';

@Component({
  selector: 'tock-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() currentFile: File | null;
  @Input() disabled: boolean = false;
  @Input() fullWidth = false;

  public isDarkTheme: boolean = false;
  public label = DEFAULT_LABEL;

  private _file: any | null;
  private onChange: Function = () => {};
  private onTouch: Function = () => {};
  private subscriptions = new Subscription();

  get file(): File | null {
    return this._file;
  }

  set file(f: File | null) {
    if (f && f !== this.file) {
      this.label = f?.name || DEFAULT_LABEL;
      this._file = f;
      this.onChange(f);
      this.onTouch(f);
    }
  }

  constructor(private host: ElementRef<HTMLInputElement>, private themeService: NbThemeService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.themeService.onThemeChange().subscribe((theme: any) => {
        this.isDarkTheme = theme.name === 'dark';
      })
    );

    if (this.currentFile) {
      this.file = this.currentFile;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file: File = event && event.item(0);

    this.file = file;
  }

  writeValue(v: null): void {
    // clear file input
    this.host.nativeElement.value = '';
    this.file = null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
