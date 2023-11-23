import { Entry } from '../../../../model/commons';

export interface SentenceTrainingFilter {
  search: string;
  sort: Entry<string, boolean>[];
  intentId?: string;
  showUnknown?: boolean;
  status: number[];
  onlyToReview: boolean;
  modifiedBefore?: Date;
  modifiedAfter?: Date;
  minIntentProbability: number;
  maxIntentProbability: number;
  user?: string;
  allButUser?: string;
  configuration?: string;
}
