import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { BotService } from '../../bot/bot-service';
import { StoryDefinitionConfigurationSummary, StorySearchQuery } from '../../bot/model/story';
import { StateService } from '../../core-nlp/state.service';
import { DefaultPrompt, EmbeddingEngines, LlmEngines } from './configurations';
import { LlmEngineConfiguration, LlmEngineConfigurationParams } from './models';

interface RagSettingsForm {
  activation: FormControl<boolean>;
  engine: FormControl<string>;
  temperature: FormControl<number>;
  embeddingEngine: FormControl<string>;
  prompt: FormControl<string>;
  noAnswerRedirection: FormControl<string>;
  apiKey?: FormControl<string>;
  modelName?: FormControl<string>;
  deploymentName?: FormControl<string>;
  privateEndpointBaseUrl?: FormControl<string>;
  apiVersion?: FormControl<string>;
}

@Component({
  selector: 'tock-rag-settings',
  templateUrl: './rag-settings.component.html',
  styleUrls: ['./rag-settings.component.scss']
})
export class RagSettingsComponent implements OnInit, OnDestroy {
  destroy: Subject<unknown> = new Subject();

  LlmEngines: LlmEngineConfiguration[] = LlmEngines;

  EmbeddingEngines: string[] = EmbeddingEngines;

  availableStories: StoryDefinitionConfigurationSummary[];

  isSubmitted: boolean = false;

  constructor(private botService: BotService, private state: StateService) {}

  ngOnInit(): void {
    this.loadAvailableStories();
    this.form.valueChanges.pipe(takeUntil(this.destroy), debounceTime(300)).subscribe(() => {
      this.setActivationDisabledState();
    });
  }

  form = new FormGroup<RagSettingsForm>({
    activation: new FormControl({ value: undefined, disabled: !this.canRagBeActivated() }),
    engine: new FormControl(undefined, [Validators.required]),
    temperature: new FormControl(undefined, [Validators.required]),
    embeddingEngine: new FormControl(undefined, [Validators.required]),
    prompt: new FormControl(DefaultPrompt, [Validators.required]),
    noAnswerRedirection: new FormControl(undefined),
    apiKey: new FormControl(undefined, [this.formEngineParamValidator('apiKey')]),
    modelName: new FormControl(undefined, [this.formEngineParamValidator('modelName')]),
    deploymentName: new FormControl(undefined, [this.formEngineParamValidator('deploymentName')]),
    privateEndpointBaseUrl: new FormControl(undefined, [this.formEngineParamValidator('privateEndpointBaseUrl')]),
    apiVersion: new FormControl(undefined, [this.formEngineParamValidator('apiVersion')])
  });

  canRagBeActivated(): boolean {
    return this.form ? this.form.valid : false;
  }

  setActivationDisabledState(): void {
    if (this.canRagBeActivated()) {
      this.activation.enable();
    } else {
      this.activation.disable();
    }
  }

  private formEngineParamValidator(paramKey): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.form || !control) return;
      const currentEngine = this.currentEngine;
      if (!currentEngine) return;

      if (currentEngine.params.find((p) => p.key === paramKey) && !control.value?.trim().length) {
        return { custom: 'This parameter is required' };
      }

      return null;
    };
  }

  get activation(): FormControl {
    return this.form.get('activation') as FormControl;
  }
  get engine(): FormControl {
    return this.form.get('engine') as FormControl;
  }
  get temperature(): FormControl {
    return this.form.get('temperature') as FormControl;
  }
  get embeddingEngine(): FormControl {
    return this.form.get('embeddingEngine') as FormControl;
  }
  get prompt(): FormControl {
    return this.form.get('prompt') as FormControl;
  }
  get noAnswerRedirection(): FormControl {
    return this.form.get('noAnswerRedirection') as FormControl;
  }

  get apiKey(): FormControl {
    return this.form.get('apiKey') as FormControl;
  }
  get modelName(): FormControl {
    return this.form.get('modelName') as FormControl;
  }
  get deploymentName(): FormControl {
    return this.form.get('deploymentName') as FormControl;
  }
  get privateEndpointBaseUrl(): FormControl {
    return this.form.get('privateEndpointBaseUrl') as FormControl;
  }
  get apiVersion(): FormControl {
    return this.form.get('apiVersion') as FormControl;
  }

  getFormControlByName(paramKey: string): FormControl {
    return this.form.get(paramKey) as FormControl;
  }

  get canSave(): boolean {
    return this.isSubmitted ? this.form.valid : this.form.dirty;
  }

  get currentEngine(): LlmEngineConfiguration {
    return LlmEngines.find((e) => e.key === this.engine.value);
  }

  get currentEngineLabel(): string {
    if (!this.currentEngine) return null;
    return this.currentEngine.label;
  }

  get currentEngineParams(): LlmEngineConfigurationParams[] {
    if (!this.currentEngine) return null;
    return this.currentEngine.params;
  }

  restoreDefaultPrompt(): void {
    this.prompt.setValue(DefaultPrompt);
  }

  private loadAvailableStories(): void {
    this.botService
      .searchStories(
        new StorySearchQuery(
          this.state.currentApplication.namespace,
          this.state.currentApplication.name,
          this.state.currentLocale,
          0,
          10000,
          undefined,
          undefined,
          false
        )
      )
      .pipe(take(1))
      .subscribe((stories: StoryDefinitionConfigurationSummary[]) => {
        this.availableStories = stories;
      });
  }

  submit(): void {
    console.log(this.form.value);
    this.isSubmitted = true;
    if (this.canSave) {
      alert('TODO');
    }
  }

  cancel(): void {
    console.log('TODO');
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
