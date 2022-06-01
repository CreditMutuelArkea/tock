import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbTagComponent, NbTagInputAddEvent } from '@nebular/theme';
import { of } from 'rxjs';
import { DialogService } from '../../../core-nlp/dialog.service';
import { ConfirmDialogComponent } from '../../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { FaqDefinition } from '../../models';

@Component({
  selector: 'tock-faq-management-edit',
  templateUrl: './faq-management-edit.component.html',
  styleUrls: ['./faq-management-edit.component.scss']
})
export class FaqManagementEditComponent implements OnInit, OnChanges {
  @Input()
  loading: boolean;

  @Input()
  faq?: FaqDefinition;

  @Input()
  faqs?: FaqDefinition[];

  @Output()
  handleClose = new EventEmitter<boolean>();

  @Output()
  handleSave = new EventEmitter();

  isSubmitted: boolean = false;

  form = new FormGroup({
    description: new FormControl(),
    title: new FormControl(undefined, Validators.required),
    tags: new FormArray([])
  });

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get title(): FormControl {
    return this.form.get('title') as FormControl;
  }

  get tags(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {}

  tagsAutocompleteValues;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.scenario?.currentValue) {
      const faq: FaqDefinition = changes.faq.currentValue;

      this.form.reset();
      this.tags.clear();
      this.isSubmitted = false;

      if (faq) {
        this.form.patchValue(faq);

        if (faq.tags?.length) {
          faq.tags.forEach((tag) => {
            this.tags.push(new FormControl(tag));
          });
        }
      }
    }

    this.tagsAutocompleteValues = of([
      ...new Set(
        [].concat.apply(
          [],
          this.faqs.map((v) => v.tags)
        )
      )
    ]);
  }

  onTagAdd({ value, input }: NbTagInputAddEvent): void {
    if (value && !this.tags.value.find((v: string) => v.toUpperCase() === value.toUpperCase())) {
      this.tags.push(new FormControl(value));
      this.form.markAsDirty();
      this.form.markAsTouched();
    }

    input.nativeElement.value = '';
  }

  onTagRemove(tag: NbTagComponent): void {
    const tagToRemove = this.tags.value.findIndex((t: string) => t === tag.text);

    if (tagToRemove !== -1) {
      this.tags.removeAt(tagToRemove);
      this.form.markAsDirty();
      this.form.markAsTouched();
    }
  }

  close(): void {
    if (this.form.dirty) {
      const validAction = 'yes';
      const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `Cancel ${this.faq?.id ? 'edit' : 'create'} faq`,
          subtitle: 'Are you sure you want to cancel ? Changes will not be saved.',
          action: validAction
        }
      });
      dialogRef.onClose.subscribe((result) => {
        if (result === validAction) {
          this.handleClose.emit(true);
        }
      });
    } else {
      this.handleClose.emit(true);
    }
  }

  save(redirect = false): void {
    this.isSubmitted = true;

    if (this.canSave) {
      this.handleSave.emit({
        redirect: redirect,
        scenario: { ...this.faq, ...this.form.value }
      });
    }
  }

  eventPreventDefault(e: KeyboardEvent): void {
    e.preventDefault();
  }
}
