import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlmSettingsComponent } from './llm-settings.component';
import { BotService } from '../../bot/bot-service';
import { StateService } from '../../core-nlp/state.service';
import { RestService } from '../../core-nlp/rest/rest.service';
import { NbToastrService } from '@nebular/theme';
import { BotConfigurationService } from '../../core/bot-configuration.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LlmSettings } from './models';
import { of } from 'rxjs';
import { deepCopy } from '../../shared/utils';

const settings = {
  _id: 'abcdefghijkl123456789',
  namespace: 'app',
  botId: 'new_assistant',
  enabled: true,
  engine: 'azureOpenAi',
  temperature: '0.15',
  prompt:
    'Use the following context to answer the question at the end.\nIf you dont know the answer, just say {no_answer}.\n\nContext:\n{context}\n\nQuestion:\n{question}\n\nAnswer in {locale}:',
  params: {
    modelName: 'gpt-4-32k',
    deploymentName: 'azure deployment name',
    privateEndpointBaseUrl: 'azure endpoint url',
    apiVersion: '2023-03-15-preview'
  },
  noAnswerRedirection: 'null'
} as unknown as LlmSettings;

describe('LlmSettingsComponent', () => {
  let component: LlmSettingsComponent;
  let fixture: ComponentFixture<LlmSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LlmSettingsComponent],
      providers: [
        {
          provide: StateService,
          useValue: {
            currentLocale: 'fr',
            currentApplication: {
              namespace: 'testNamespace',
              name: 'testName'
            }
          }
        },
        {
          provide: RestService,
          useValue: { get: () => of(settings) }
        },
        {
          provide: NbToastrService,
          useValue: { success: () => {} }
        },
        {
          provide: BotConfigurationService,
          useValue: { configurations: of([]) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LlmSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load settings', () => {
    expect(component.settingsBackup).toEqual(settings);

    const cleanedSettings = deepCopy(settings);
    delete cleanedSettings['namespace'];
    delete cleanedSettings['botId'];

    const cleanedFormValue = deepCopy(component.form.getRawValue());
    delete cleanedFormValue.params.apiKey;

    expect(cleanedFormValue as unknown).toEqual(cleanedSettings as unknown);
  });
});
