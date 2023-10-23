export enum LLMProvider {
  OpenAI = 'OpenAI',
  AzureOpenAIService = 'AzureOpenAIService'
}

export interface RagSettings {
  id: string;
  namespace: string;
  botId: string;
  enabled: boolean;

  noAnswerSentence: string;
  noAnswerStoryId: string;

  llmSetting: llmSetting;
  llmSettingEmbedding: llmSetting;
}

export interface llmSetting {
  provider: LLMProvider;

  temperature?: Number;
  prompt?: String;

  apiKey: String;
  model: String;

  deploymentName?: String;
  privateEndpointBaseUrl?: String;
  apiVersion?: String;
}
