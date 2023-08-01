export enum SourceTypes {
  file = 'file',
  remote = 'remote'
}

export interface SourceParameters {}

export interface FileSourceParameters extends SourceParameters {
  file_format: 'csv' | 'json';

  source_url?: never;
  exclusion_urls?: never;
  xpaths?: never;

  periodic_update?: never;
  periodic_update_frequency?: never;
}

export interface RemoteSourceParameters extends SourceParameters {
  file_format?: never;

  source_url: URL;
  exclusion_urls?: URL[];
  xpaths?: string[];

  periodic_update?: boolean;
  periodic_update_frequency?: number;
}

export interface Source {
  id: string;
  name: string;
  description: string;
  source_type: SourceTypes;

  enabled: boolean;

  current_indexing_session_id?: string;
  indexing_sessions?: IndexingSession[];

  source_parameters: FileSourceParameters | RemoteSourceParameters;

  rawData?: any;
}

export interface IndexingSession {
  id: string;
  job_id: string;
  status: IndexingSessionStatus;
  start_date: Date;
  end_date: Date;
  embeding_engine: string;
}

export enum IndexingSessionStatus {
  running = 'running',
  complete = 'complete',
  error = 'error'
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
