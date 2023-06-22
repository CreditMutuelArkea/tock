export enum sourceTypes {
  file = 'file',
  remote = 'remote'
}

export interface Source {
  id: string;
  name: string;
  type: sourceTypes;
  url?: URL;
  step?: string;
  isProcessing?: string;
  rawData?: any;
  normalization?: {
    answerIndex: number;
    sourceRefIndex: number;
  };
}
