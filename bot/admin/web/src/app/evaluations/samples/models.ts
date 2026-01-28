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

type EvaluationBase = {
  _id: string;
  dialogId: string;
  actionId: string;
  evaluationSampleId: string;
  evaluatedBy: string;
  evaluationDate: string;
};

type EvaluationUnset = EvaluationBase & {
  status: EvaluationStatus.UNSET;
  reason?: null;
};

type EvaluationUp = EvaluationBase & {
  status: EvaluationStatus.UP;
  reason?: null;
};

type EvaluationDown = EvaluationBase & {
  status: EvaluationStatus.DOWN;
  reason: string;
};

export type EvaluationDefinition = EvaluationUnset | EvaluationUp | EvaluationDown;

export interface EvaluationSampleDataDefinition {
  dialogs: DialogReport[];
  evaluations: EvaluationDefinition[];
}
