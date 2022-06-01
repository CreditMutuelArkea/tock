import { Entry } from '../../model/commons';
import { PaginatedResult } from '../../model/nlp';

export interface PaginatedFaqResult extends PaginatedResult<FaqDefinition> {
  faq: FaqDefinition[];
}

export type Utterance = string;

export type FaqDefinition = {
  id?: string;
  intentId?: string;
  language: string;
  applicationId: string;
  creationDate?: Date;
  updateDate?: Date;
  title: string;
  description?: string;
  utterances: Utterance[];
  tags: string[];
  answer: string;
  enabled: boolean;
};

export interface FaqFilter {
  enabled: boolean;
  search: string;
  tags: Array<string>;
  sort;
}
