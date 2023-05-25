export enum sourceTypes {
  file = 'file',
  remote = 'remote'
}

export interface Source {
  name: string;
  type: sourceTypes;
  url?: URL;
  step: string;
  isProcessing?: string;
}
