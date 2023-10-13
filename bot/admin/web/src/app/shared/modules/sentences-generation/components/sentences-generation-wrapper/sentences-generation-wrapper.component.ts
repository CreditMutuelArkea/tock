import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { GeneratedSentenceError } from '../../models';

import { SentencesGenerationService } from '../../services';
import { StateService } from '../../../../../core-nlp/state.service';
import { RestService } from '../../../../../core-nlp/rest/rest.service';
import { LlmSettings } from '../../../../../configuration/llm-settings/models';
import { UserRole } from '../../../../../model/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'tock-sentences-generation-wrapper',
  templateUrl: './sentences-generation-wrapper.component.html',
  styleUrls: ['./sentences-generation-wrapper.component.scss']
})
export class SentencesGenerationWrapperComponent implements OnInit, OnDestroy {
  @Input() sentences: string[] = [];
  @Input() errors: GeneratedSentenceError[] = [];

  @Output() onValidateSelection = new EventEmitter<string[]>();

  loading: boolean = true;

  private subscription = new Subscription();

  llmSettingsMissing = false;

  UserRole = UserRole;

  constructor(
    public dialogRef: NbDialogRef<SentencesGenerationWrapperComponent>,
    private sentencesGenerationService: SentencesGenerationService,
    private state: StateService,
    private rest: RestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLlmSettingsConfiguration();
    this.subscription = this.sentencesGenerationService.state$.subscribe(({ sentencesExample, errors }) => {
      if (sentencesExample.length) {
        this.sentences = sentencesExample;
      }

      this.errors = errors;
    });
  }

  checkLlmSettingsConfiguration() {
    const url = `/configuration/bots/${this.state.currentApplication.name}/rag`;
    this.rest
      .get<LlmSettings>(url, (settings: LlmSettings) => settings)
      .subscribe((settings: LlmSettings) => {
        if (!settings?.id) {
          this.llmSettingsMissing = true;
        }
        this.loading = false;
      });
  }

  jumpToLlmSettings() {
    this.router.navigateByUrl('configuration/llm-settings');
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleLoading(loading: boolean): void {
    this.loading = loading;
  }

  handleGeneratedSentences(generatedSentences: string[]): void {
    this.onValidateSelection.emit(generatedSentences);
  }
}
