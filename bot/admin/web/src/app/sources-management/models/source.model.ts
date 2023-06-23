export enum ImportDataTypes {
  answer = 'answer',
  sourceId = 'sourceId',
  sourceRef = 'sourceRef'
}

export const dataTypesDefinition = [
  { label: 'Answer', type: ImportDataTypes.answer, formCtrl: 'answer' },
  { label: 'Id', type: ImportDataTypes.sourceId, formCtrl: 'sourceId' },
  { label: 'Source reference', type: ImportDataTypes.sourceRef, formCtrl: 'sourceRef' }
];

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
  fileFormat?: 'csv' | 'json';
  normalizedData?: any;
}
