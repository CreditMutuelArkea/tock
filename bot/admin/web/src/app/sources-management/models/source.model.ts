export enum ImportDataTypes {
  answer = 'answer',
  sourceId = 'sourceId',
  sourceRef = 'sourceRef'
}

export const dataTypesDefinition = [
  { label: 'Text (answer, question...)', type: ImportDataTypes.answer, formCtrl: 'answer' },
  { label: 'Id (unic identifier of the entry)', type: ImportDataTypes.sourceId, formCtrl: 'sourceId' },
  { label: 'Source reference (public url of the source)', type: ImportDataTypes.sourceRef, formCtrl: 'sourceRef' }
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
