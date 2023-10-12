export interface CompletionRequest {
  data: CompletionData;
  config: CompletionConfig;
}

export interface CompletionData {
  sentences: string[];
  locale: string;
  abbreviatedLanguage: boolean;
  smsLanguage: boolean;
  spellingMistakes: boolean;
}

export interface CompletionConfig {
  temperature: number;
}

export interface CompletionResponse {
  choices: string[];
}
