import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { LlmEngineConfiguration, LlmEngineConfigurationParams, LlmSettings } from './models';
import { DefaultPrompt, LlmEngines } from './models/configurations';
import { StateService } from '../../core-nlp/state.service';
import { RestService } from '../../core-nlp/rest/rest.service';
import { NbToastrService } from '@nebular/theme';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { deepCopy } from '../../shared/utils';

interface LlmSettingsParamsForm {
  apiKey?: FormControl<string>;
  modelName?: FormControl<string>;
  deploymentName?: FormControl<string>;
  privateEndpointBaseUrl?: FormControl<string>;
  apiVersion?: FormControl<string>;
}
interface LlmSettingsForm {
  id: FormControl<string>;
  enabled: FormControl<boolean>;
  engine: FormControl<string>;
  prompt: FormControl<string>;
  params: FormGroup<LlmSettingsParamsForm>;
}

@Component({
  selector: 'tock-llm-settings',
  templateUrl: './llm-settings.component.html',
  styleUrls: ['./llm-settings.component.scss']
})
export class LlmSettingsComponent implements OnInit {
  destroy$: Subject<unknown> = new Subject();

  LlmEngines: LlmEngineConfiguration[] = LlmEngines;

  isSubmitted: boolean = false;

  loading: boolean = true;

  settingsBackup: LlmSettings;

  constructor(
    private state: StateService,
    private rest: RestService,
    private toastrService: NbToastrService,
    private botConfiguration: BotConfigurationService
  ) {}

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe(() => {
      this.setActivationDisabledState();
    });
    this.botConfiguration.configurations.pipe(takeUntil(this.destroy$)).subscribe((confs) => {
      if (confs.length) {
        this.loading = true;
        this.load();
      }
    });
    this.load();
  }

  form = new FormGroup<LlmSettingsForm>({
    id: new FormControl(null),
    enabled: new FormControl({ value: undefined, disabled: !this.canLlmBeActivated() }),
    engine: new FormControl(undefined, [Validators.required]),
    prompt: new FormControl(DefaultPrompt, [Validators.required]),
    params: new FormGroup<LlmSettingsParamsForm>({
      apiKey: new FormControl(undefined, [this.formEngineParamValidator('apiKey')]),
      modelName: new FormControl(undefined, [this.formEngineParamValidator('modelName')]),
      deploymentName: new FormControl(undefined, [this.formEngineParamValidator('deploymentName')]),
      privateEndpointBaseUrl: new FormControl(undefined, [this.formEngineParamValidator('privateEndpointBaseUrl')]),
      apiVersion: new FormControl(undefined, [this.formEngineParamValidator('apiVersion')])
    })
  });

  private load() {
    const url = `/configuration/bots/${this.state.currentApplication.name}/rag`;
    this.rest
      .get<LlmSettings>(url, (settings: LlmSettings) => settings)
      .subscribe((settings: LlmSettings) => {
        if (settings?.id) {
          this.settingsBackup = settings;
          this.form.patchValue(settings as unknown);
          this.form.markAsPristine();
        } else {
          this.form.reset();
        }
        this.loading = false;
      });
  }

  canLlmBeActivated(): boolean {
    return this.form ? this.form.valid : false;
  }

  setActivationDisabledState(): void {
    if (this.canLlmBeActivated()) {
      this.enabled.enable();
    } else {
      this.enabled.disable();
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

  get enabled(): FormControl {
    return this.form.get('enabled') as FormControl;
  }
  get engine(): FormControl {
    return this.form.get('engine') as FormControl;
  }
  get prompt(): FormControl {
    return this.form.get('prompt') as FormControl;
  }

  get apiKey(): FormControl {
    return this.form.controls.params.get('apiKey') as FormControl;
  }
  get modelName(): FormControl {
    return this.form.controls.params.get('modelName') as FormControl;
  }
  get deploymentName(): FormControl {
    return this.form.controls.params.get('deploymentName') as FormControl;
  }
  get privateEndpointBaseUrl(): FormControl {
    return this.form.controls.params.get('privateEndpointBaseUrl') as FormControl;
  }
  get apiVersion(): FormControl {
    return this.form.controls.params.get('apiVersion') as FormControl;
  }

  getFormControlByName(paramKey: string): FormControl {
    return this.form.controls.params.get(paramKey) as FormControl;
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

  submit(): void {
    this.isSubmitted = true;
    if (this.canSave && this.form.dirty) {
      const currentEngine = this.currentEngine;

      const formValue: LlmSettings = deepCopy(this.form.value) as LlmSettings;
      const formValueParams = formValue.params;

      for (let param in formValueParams) {
        if (!currentEngine.params.find((configParam) => configParam.key === param)) delete formValueParams[param];
      }

      formValue.namespace = this.state.currentApplication.namespace;
      formValue.botId = this.state.currentApplication.name;

      const url = `/configuration/bots/${this.state.currentApplication.name}/rag`;
      this.rest.post(url, formValue).subscribe((llmSettings: LlmSettings) => {
        this.settingsBackup = llmSettings;
        this.form.patchValue(this.settingsBackup as unknown);
        this.form.markAsPristine();
        this.isSubmitted = false;

        this.toastrService.success(`LLM settings succesfully saved`, 'Success', {
          duration: 5000,
          status: 'success'
        });
      });
    }
  }

  cancel(): void {
    if (this.settingsBackup) {
      this.form.patchValue(this.settingsBackup as unknown);
      this.form.markAsPristine();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
