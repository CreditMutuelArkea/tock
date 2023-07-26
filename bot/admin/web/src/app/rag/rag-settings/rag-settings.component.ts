import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

const AzureOpenAiApiVersions = ['2023-03-15-preview', '2022-12-01', '2023-05-15', '2023-06-01-preview'];
const OpenAiModels = ['gpt-4', 'gpt-4-32k'];

const LlmEngines = [
  {
    label: 'OpenAi',
    value: 'openAi',
    params: [
      { key: 'apiKey', label: 'Api key', type: 'string' },
      { key: 'modelName', label: 'Model name', type: 'list', source: OpenAiModels }
    ]
  },
  {
    label: 'Azure OpenAi',
    value: 'azureOpenAi',
    params: [
      { key: 'modelName', label: 'Model name', type: 'list', source: OpenAiModels },
      { key: 'deploymentName', label: 'Deployment name', type: 'string' },
      { key: 'privateEndpointBaseUrl', label: 'Private endpoint base url', type: 'string' },
      { key: 'apiVersion', label: 'Api version', type: 'list', source: AzureOpenAiApiVersions }
    ]
  }
];

interface RagSettingsForm {
  engine: FormControl<string>;
  temperature: FormControl<number>;
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

  constructor() {}

  form = new FormGroup<RagSettingsForm>({
    engine: new FormControl(undefined, [Validators.required]),
    temperature: new FormControl(undefined, [Validators.required]),
    apiKey: new FormControl(undefined, [Validators.required]),
    modelName: new FormControl(undefined, [Validators.required]),
    deploymentName: new FormControl(undefined, [Validators.required]),
    privateEndpointBaseUrl: new FormControl(undefined, [Validators.required]),
    apiVersion: new FormControl(undefined, [Validators.required])
  });

  get engine(): FormControl {
    return this.form.get('engine') as FormControl;
  }
  get temperature(): FormControl {
    return this.form.get('temperature') as FormControl;
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

  ngOnInit(): void {
    console.log(this.engine);
  }

  get currentEngine() {
    return LlmEngines.find((e) => e.value === this.engine.value);
  }

  get currentEngineLabel() {
    if (!this.currentEngine) return null;
    return this.currentEngine.label;
  }

  get currentEngineParams() {
    if (!this.currentEngine) return null;
    return this.currentEngine.params;
  }
}
