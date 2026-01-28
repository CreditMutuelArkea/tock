import { DialogReport } from '../../shared/model/dialog-data';

export enum EvaluationSampleStatus {
  IN_PROGRESS = 'in_progress',
  VALIDATED = 'validated'
}

export interface EvaluationSampleResultDefinition {
  positiveCount: number;
  negativeCount: number;
}

export interface EvaluationSampleDefinition {
  _id: string;
  // applicationName: string;
  // namespace: string;
  name: string;
  description: string;
  dialogActivityFrom: string;
  dialogActivityTo: string;
  allowTestDialogs: boolean;
  creationDate: string;
  createdBy: string;
  validationDate: string | null;
  validatedBy: string | null;
  requestedDialogCount: number;
  dialogsCount: number;
  totalDialogCount: number | null;
  botActionCount: number;
  status: EvaluationSampleStatus;
  evaluationsResult: EvaluationSampleResultDefinition;
}

export enum EvaluationStatus {
  UNSET = 'unset',
  UP = 'up',
  DOWN = 'down'
}

export interface EvaluationDefinition {
  _id: string;
  dialogId: string;
  actionId: string;
  evaluationSampleId: string;
  status: EvaluationStatus;
  reason: string | null;
  evaluatedBy: string;
  evaluationDate: string;
}

export interface EvaluationSampleDataDefinition {
  dialogs: DialogReport[];
  evaluations: EvaluationDefinition[];
}
