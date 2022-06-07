import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/core-nlp/dialog.service';
import { ConfirmDialogComponent } from 'src/app/shared-nlp/confirm-dialog/confirm-dialog.component';

import { BotService } from '../../../bot/bot-service';
import { StorySearchQuery } from '../../../bot/model/story';
import { StateService } from '../../../core-nlp/state.service';
import { FaqDefinitionService } from '../../../faq/common/faq-definition.service';
import { Settings } from '../../models';

@Component({
  selector: 'tock-faq-management-settings',
  templateUrl: './faq-management-settings.component.html',
  styleUrls: ['./faq-management-settings.component.scss']
})
export class FaqManagementSettingsComponent implements OnInit {
  @Input() isLoading: boolean = false;

  @Output() onClose = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Settings>();

  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  availableStories: any = [];

  isSubmitted: boolean = false;

  form = new FormGroup({
    enableSatisfactionAsk: new FormControl(false),
    story: new FormControl({ value: null, disabled: true })
  });

  get enableSatisfactionAsk(): FormControl {
    return this.form.get('enableSatisfactionAsk') as FormControl;
  }

  get story(): FormControl {
    return this.form.get('story') as FormControl;
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  constructor(
    private botService: BotService,
    private state: StateService,
    private toastService: NbToastrService,
    private faqService: FaqDefinitionService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getStories();
    this.getSettings();

    this.enableSatisfactionAsk.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (!value) {
        this.story.reset();
        this.story.disable();
        this.story.clearValidators();
        this.form.updateValueAndValidity();
      } else {
        this.story.setValidators(Validators.required);
        this.story.enable();
        this.form.updateValueAndValidity();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  getSettings(): void {
    this.faqService
      .getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings: Settings) => {
          this.form.patchValue({
            enableSatisfactionAsk: settings.enableSatisfactionAsk,
            story: settings.story
          });
        },
        error: () => {
          this.toastService.danger('Failed to load settings', 'Error');
        }
      });
  }

  getStories(): void {
    this.botService
      .searchStories(
        new StorySearchQuery(
          this.state.currentApplication.namespace,
          this.state.currentApplication.name,
          this.state.currentLocale,
          0,
          10000
        )
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stories) => {
          this.availableStories = stories.filter((story) => story.category !== 'faq');
        },
        error: () => {
          this.toastService.danger('Failed to load stories', 'Error');
        }
      });
  }

  close(): void {
    if (this.form.dirty) {
      const validAction = 'yes';
      const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
        context: {
          title: `Cancel edit settings`,
          subtitle: 'Are you sure you want to cancel ? Changes will not be saved.',
          action: validAction
        }
      });
      dialogRef.onClose.subscribe((result) => {
        if (result === validAction) {
          this.onClose.emit(true);
        }
      });
    } else {
      this.onClose.emit(true);
    }
  }

  save(): void {
    this.isSubmitted = true;

    if (this.canSave) {
      if (!this.enableSatisfactionAsk.value) {
        const validAction = 'yes';
        const dialogRef = this.dialogService.openDialog(ConfirmDialogComponent, {
          context: {
            title: `Disable satisfaction`,
            subtitle: 'This will disable the satisfaction question for all FAQs. Do you confirm ?',
            action: validAction
          }
        });
        dialogRef.onClose.subscribe((result) => {
          if (result === validAction) {
            this.onSave.emit(this.form.value as Settings);
          }
        });
      } else {
        this.onSave.emit(this.form.value as Settings);
      }
    }
  }
}
