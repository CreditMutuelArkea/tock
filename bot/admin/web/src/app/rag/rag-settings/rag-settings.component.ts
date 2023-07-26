import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { BotService } from '../../bot/bot-service';
import { StoryDefinitionConfigurationSummary, StorySearchQuery } from '../../bot/model/story';
import { StateService } from '../../core-nlp/state.service';

const AzureOpenAiApiVersions = ['2023-03-15-preview', '2022-12-01', '2023-05-15', '2023-06-01-preview'];
const OpenAiModels = ['gpt-4', 'gpt-4-32k'];

const EmbeddingEngines = [
  'text-embedding-ada-002',
  'text-search-davinci-*-001',
  'text-search-curie-*-001',
  'text-search-babbage-*-001',
  'text-search-ada-*-001'
];

export interface LlmEngineConfiguration {
  label: string;
}

const LlmEngines = [
  {
    label: 'OpenAi',
    key: 'openAi',
    params: [
      { key: 'apiKey', label: 'Api key', type: 'string' },
      { key: 'modelName', label: 'Model name', type: 'list', source: OpenAiModels }
    ]
  },
  {
    label: 'Azure OpenAi',
    key: 'azureOpenAi',
    params: [
      { key: 'modelName', label: 'Model name', type: 'list', source: OpenAiModels },
      { key: 'deploymentName', label: 'Deployment name', type: 'string' },
      { key: 'privateEndpointBaseUrl', label: 'Private endpoint base url', type: 'string' },
      { key: 'apiVersion', label: 'Api version', type: 'list', source: AzureOpenAiApiVersions }
    ]
  }
];

const DefaultPrompt = `Use the following context to answer the question at the end.
If you dont know the answer, just say {no_answer}.

Context:
{context}

Question:
{question}

Answer in {locale}:`;

interface RagSettingsForm {
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
export class RagSettingsComponent implements OnInit {
  LlmEngines = LlmEngines;
  EmbeddingEngines = EmbeddingEngines;

  isSubmitted: boolean = false;

  availableStories: StoryDefinitionConfigurationSummary[];

  constructor(private botService: BotService, private state: StateService) {}

  form = new FormGroup<RagSettingsForm>({
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

  ngOnInit(): void {
    this.loadAvailableStories();
  }

  get currentEngine() {
    return LlmEngines.find((e) => e.key === this.engine.value);
  }

  get currentEngineLabel(): string {
    if (!this.currentEngine) return null;
    return this.currentEngine.label;
  }

  get currentEngineParams() {
    if (!this.currentEngine) return null;
    return this.currentEngine.params;
  }

  restoreDefaultPrompt() {
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

  submit() {
    console.log(this.form.value);
    this.isSubmitted = true;
    if (this.canSave) {
      console.log('SUBMIT !');
    }
  }
}
