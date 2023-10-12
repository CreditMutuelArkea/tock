export interface LlmSettings {
  id: string;
  namespace: string;
  botId: string;
  enabled: boolean;
  engine: string;
  prompt: string;
  params: LlmSettingsParams[];
}

export interface LlmSettingsParams {
  apiKey?: string;
  modelName?: string;
  deploymentName?: string;
  privateEndpointBaseUrl?: string;
  apiVersion?: string;
}
