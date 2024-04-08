import { AzureOpenAiApiVersionsList, EnginesConfiguration, LLMProvider, OpenAIModelsList } from '../../../shared/model/ai-settings';

export const DefaultPrompt: string = `Given the base sentences provided below, generate a list of {{nb_sentences}} unique sentences that convey the same meaning but vary in their presentation. 

The variations should reflect a diverse range of alterations, including but not limited to:
{% if options.spelling_mistakes %}
- Spelling Mistakes: Introduce common and uncommon spelling errors that do not hinder the overall comprehension of the sentence.
{% endif %}
{% if options.sms_language %}
- Incorporation of Non-Standard Language Features: Where appropriate, use features like onomatopoeia, mimetic words, or linguistic innovations unique to digital communication.
{% endif %}
{% if options.abbreviated_language %}
- Abbreviations and DM (Direct Message) Language: Transform parts of the sentence using popular text messaging abbreviations, internet slang, and shorthand commonly found in online and informal communication.
{% endif %}
- Answer as a numbered list.
- Answer in {{locale}}.

Base Sentences (remember: you must answer as a numbered list):
{% for sentence in sentences %}
- {{ sentence }}
{% endfor %}
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
