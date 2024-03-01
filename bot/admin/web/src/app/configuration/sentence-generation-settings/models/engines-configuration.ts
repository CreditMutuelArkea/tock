import { AzureOpenAiApiVersionsList, EnginesConfiguration, LLMProvider, OpenAIModelsList } from '../../../shared/model/ai-settings';

export const DefaultPrompt: string = `Parameters :
{% if spelling_mistakes %}
- include sentences with spelling mistakes
{% endif %}
{% if sms_language %}
- include sentences with sms language
{% endif %}
{% if abbreviated_language %}
- include sentences with abbreviated language
{% endif %}

Takes into account the previous parameters and generates in {locale}, {nb_sentences} sentences derived from the sentences in the following table {sentences}
`;

export const EngineConfigurations: EnginesConfiguration[] = [
  {
    label: 'OpenAi',
    key: LLMProvider.OpenAI,
    params: [
      { key: 'apiKey', label: 'Api key', type: 'obfuscated' },
      { key: 'model', label: 'Model name', type: 'openlist', source: OpenAIModelsList },
      { key: 'temperature', label: 'Temperature', type: 'number', inputScale: 'fullwidth' },
      { key: 'prompt', label: 'Prompt', type: 'prompt', inputScale: 'fullwidth', defaultValue: DefaultPrompt }
    ]
  },
  {
    label: 'Azure OpenAi',
    key: LLMProvider.AzureOpenAIService,
    params: [
      { key: 'apiKey', label: 'Api key', type: 'obfuscated' },
      { key: 'apiVersion', label: 'Api version', type: 'openlist', source: AzureOpenAiApiVersionsList },
      { key: 'deploymentName', label: 'Deployment name', type: 'text' },
      { key: 'apiBase', label: 'Private endpoint base url', type: 'obfuscated' },
      { key: 'temperature', label: 'Temperature', type: 'number', inputScale: 'fullwidth' },
      { key: 'prompt', label: 'Prompt', type: 'prompt', inputScale: 'fullwidth', defaultValue: DefaultPrompt }
    ]
  }
];
