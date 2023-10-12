import { LlmEngineConfiguration } from '.';

export const AzureOpenAiApiVersions = ['2023-03-15-preview', '2022-12-01', '2023-05-15', '2023-06-01-preview'];

export const OpenAiModels = ['gpt-4', 'gpt-4-32k'];

export const LlmEngines: LlmEngineConfiguration[] = [
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

export const DefaultPrompt = `Options :
{% if OPTIONS.SPELLINGMISTAKES %}
include sentences with spelling mistakes
{% endif %}
{% if OPTIONS.SMSLANGUAGE %}
include sentences with sms language
{% endif %}
{% if OPTIONS.ABBREVIATEDLANGUAGE %}
include sentences with abbreviated language
{% endif %}

Takes into account the previous options and generates in {{ LOCAL }} language, {{ NB_SENTENCES }} sentences derived from the sentences in the following table:
{% for sentence in SENTENCES %}
{{ sentence }}
{% endfor %}
`;
