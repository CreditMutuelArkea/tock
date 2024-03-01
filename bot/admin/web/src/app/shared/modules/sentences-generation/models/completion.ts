export interface CompletionRequest {
  sentences: string[];
  nbSentences: number;

  locale: string;
  options: CompletionOptions;
}

export interface CompletionOptions {
  abbreviatedLanguage: boolean;
  smsLanguage: boolean;
  spellingMistakes: boolean;
}

export interface CompletionResponse {
  choices: string[];
}
