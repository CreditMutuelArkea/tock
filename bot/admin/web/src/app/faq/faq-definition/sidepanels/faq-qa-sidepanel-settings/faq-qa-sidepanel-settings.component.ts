import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BotService } from '../../../../bot/bot-service';
import { Settings } from '../../../common/model';
import { StorySearchQuery } from '../../../../bot/model/story';
import { StateService } from '../../../../core-nlp/state.service';
import { FaqDefinitionService } from '../../../../faq/common/faq-definition.service';

@Component({
  selector: 'tock-faq-qa-sidepanel-settings',
  templateUrl: './faq-qa-sidepanel-settings.component.html',
  styleUrls: ['./faq-qa-sidepanel-settings.component.scss']
})
export class FaqQaSidepanelSettingsComponent implements OnInit, OnDestroy {
  @Input()
  isSubmitted: boolean = false;

  @Output()
  settings = new EventEmitter<Settings>();

  private readonly destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  availableStories: any = [];

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

  constructor(
    private botService: BotService,
    private state: StateService,
    private toastService: NbToastrService,
    private faqDefinitionService: FaqDefinitionService
  ) {}

  ngOnInit(): void {
    this.getStories();
    this.getSettings();

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.settings.emit(value);
    });

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
    this.faqDefinitionService
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
}
