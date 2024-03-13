import { LLMProvider } from './rag-settings';

export const DefaultPrompt: string = `# TOCK (The Open Conversation Kit) chatbot

## General context

You are a chatbot designed to provide short conversational messages in response to user queries.

## Guidelines

Incorporate any relevant details from the provided context into your answers, ensuring they are directly related to the user's query.

## Style and format

Your tone is empathetic, informative and polite.

## Additional instructions

Use the following pieces of retrieved context to answer the question.
If you dont know the answer, answer (exactly) with "{no_answer}".
Answer in {locale}.

## Context

{context}

## Question

{question}
`;

export interface EnginesConfiguration {
  label: string;
  key: LLMProvider;
  params: EnginesConfigurationParam[];
}

export interface EnginesConfigurationParam {
  label: string;
  key: string;
  type: 'text' | 'prompt' | 'list' | 'openlist' | 'number' | 'obfuscated';
  source?: string[];
  inputScale?: 'default' | 'fullwidth';
  defaultValue?: string;
}

export const AzureOpenAiApiVersionsList: string[] = [
  '2022-12-01',
  '2023-05-15',
  '2023-06-01-preview',
  '2023-07-01-preview',
  '2023-08-01-preview',
  '2023-09-01-preview'
];

export const OpenAIModelsList: string[] = [
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-0613',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-4-32k-0613',

  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-16k-0613',
  'gpt-3.5-turbo-instruct',

  'babbage-002',
  'davinci-002'
];

export const OpenAIEmbeddingModel: string[] = ['text-embedding-ada-002'];

const EnginesConfigurations_Llm: EnginesConfiguration[] = [
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

const EnginesConfigurations_Embedding: EnginesConfiguration[] = [
  {
    label: 'OpenAi',
    key: LLMProvider.OpenAI,
    params: [
      { key: 'apiKey', label: 'Api key', type: 'obfuscated' },
      { key: 'model', label: 'Model name', type: 'openlist', source: OpenAIEmbeddingModel }
    ]
  },
  {
    label: 'Azure OpenAi',
    key: LLMProvider.AzureOpenAIService,
    params: [
      { key: 'apiKey', label: 'Api key', type: 'obfuscated' },
      { key: 'apiVersion', label: 'Api version', type: 'openlist', source: AzureOpenAiApiVersionsList },
      { key: 'deploymentName', label: 'Deployment name', type: 'text' },
      { key: 'apiBase', label: 'Private endpoint base url', type: 'obfuscated' }
    ]
  }
];

export const EnginesConfigurations: { [key: string]: EnginesConfiguration[] } = {
  llmSetting: EnginesConfigurations_Llm,
  emSetting: EnginesConfigurations_Embedding
};
