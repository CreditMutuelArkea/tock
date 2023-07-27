export interface IndexingSessionVersion {
  id: string;
  job_id: string;
  start_date: Date;
  end_date: Date;
  embeding_engine: string;
}

export interface Source {
  id: string;
  name: string;
  description: string;
  source_type: sourceTypes;

  current_indexing_session_version?: IndexingSessionVersion;
  indexing_session_versions?: IndexingSessionVersion[];

  url?: URL;
  step?: string;
  isProcessing?: string;
  rawData?: any;
  file_format?: 'csv' | 'json';
  normalizedData?: any;
}

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
