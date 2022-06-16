import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BotService } from '../../../bot/bot-service';
import { DialogService } from '../../../core-nlp/dialog.service';
import { ConfirmDialogComponent } from '../../../shared-nlp/confirm-dialog/confirm-dialog.component';
import { StoryDefinitionConfigurationSummary, StorySearchQuery } from '../../../bot/model/story';
import { StateService } from '../../../core-nlp/state.service';
import { Settings } from '../../models';
import { FaqService } from '../../services/faq.service';

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

  availableStories: StoryDefinitionConfigurationSummary[] = [];

  isSubmitted: boolean = false;

  form = new FormGroup({
    satisfactionEnabled: new FormControl(false),
    satisfactionStoryId: new FormControl({ value: null, disabled: true })
  });

  get satisfactionEnabled(): FormControl {
    return this.form.get('satisfactionEnabled') as FormControl;
  }

  get satisfactionStoryId(): FormControl {
    return this.form.get('satisfactionStoryId') as FormControl;
  }

  get canSave(): boolean {
    return this.form.valid;
  }

  constructor(
    private botService: BotService,
    private stateService: StateService,
    private faqService: FaqService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.satisfactionEnabled.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (!value) {
        this.satisfactionStoryId.reset();
        this.satisfactionStoryId.disable();
        this.satisfactionStoryId.clearValidators();
        this.form.updateValueAndValidity();
      } else {
        this.satisfactionStoryId.setValidators(Validators.required);
        this.satisfactionStoryId.enable();
        this.form.updateValueAndValidity();
      }
    });

    this.getStories();
    this.getSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  getSettings(): void {
    this.isLoading = true;

    this.faqService
      .getSettings(this.stateService.currentApplication._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings: Settings) => {
          this.form.patchValue({
            satisfactionEnabled: settings.satisfactionEnabled,
            satisfactionStoryId: settings.satisfactionStoryId
          });
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  getStories(): void {
    this.botService
      .searchStories(
        new StorySearchQuery(
          this.stateService.currentApplication.namespace,
          this.stateService.currentApplication.name,
          this.stateService.currentLocale,
          0,
          10000
        )
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((stories: StoryDefinitionConfigurationSummary[]) => {
        this.availableStories = stories.filter((story) => story.category !== 'faq');
      });
  }

  close(): Observable<any> {
    const validAction = 'yes';
    if (this.form.dirty) {
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
      return dialogRef.onClose;
    } else {
      this.onClose.emit(true);
      return of(validAction);
    }
  }

  save(): void {
    this.isSubmitted = true;

    if (this.canSave) {
      if (!this.satisfactionEnabled.value) {
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
