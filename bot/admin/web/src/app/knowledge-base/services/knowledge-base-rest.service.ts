/*
 * Copyright (C) 2017/2025 SNCF Connect & Tech
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { RestService } from '../../core-nlp/rest/rest.service';
import { StateService } from '../../core-nlp/state.service';
import { PaginatedResult } from '../../model/nlp';
import {
  KnowledgeBaseDuplicatePolicy,
  KnowledgeBaseEntry,
  KnowledgeBaseEntryPayload,
  KnowledgeBaseEntrySaveResult,
  KnowledgeBaseEntryStatus,
  KnowledgeBaseExportEnvelope,
  KnowledgeBaseImportCandidate,
  KnowledgeBaseImportResult,
  KnowledgeBaseJob,
  KnowledgeBaseRetrievalTest,
  KnowledgeBaseSearchQuery,
  KnowledgeBaseSyncStatus
} from '../models';
import { ParsedImportRow } from '../utils/import.utils';
import { KnowledgeBaseService } from './knowledge-base.service';

/**
 * REST implementation of the knowledge base service.
 *
 * Talks to the admin server routes under /gen-ai/bots/:botId/knowledge-base/*, which relay to
 * the orchestrator through orchestrator-client. The admin server resolves the vector store and
 * embedding settings from Mongo and injects them into the orchestrator call, so the studio
 * never sends credentials nor settings.
 *
 * botId is the current application name: GenAIVerticle passes app.namespace and app.name to
 * every Gen AI service, and app.name is the botId on the backend. The namespace is resolved
 * server side from the session, so it is never sent either.
 *
 * To switch from the mock to this implementation, change the single provider line in the
 * feature module:
 *   { provide: KnowledgeBaseService, useClass: KnowledgeBaseRestService }
 * and drop the mock provider so the demo scenario selector disappears on its own.
 */
@Injectable()
export class KnowledgeBaseRestService extends KnowledgeBaseService {
  private readonly rest = inject(RestService);
  private readonly state = inject(StateService);

  constructor() {
    super();
  }

  private get botId(): string {
    return this.state.currentApplication.name;
  }

  private baseUrl(path: string): string {
    return `/gen-ai/bots/${this.botId}/knowledge-base${path}`;
  }

  // --------------------------------------------------------------------- Entries

  searchEntries(query: KnowledgeBaseSearchQuery): Observable<PaginatedResult<KnowledgeBaseEntry>> {
    // Passed as query params so the listing stays a GET; empty values are dropped.
    const params: Record<string, string> = {
      start: `${query.start}`,
      size: `${query.size}`
    };
    if (query.search) params['search'] = query.search;
    if (query.status) params['status'] = query.status;
    if (query.projectionState) params['projectionState'] = query.projectionState;
    if (query.tag) params['tag'] = query.tag;
    if (query.sort) params['sort'] = query.sort;
    if (query.direction) params['direction'] = query.direction;

    // RestService.get has no params argument, so the query string is built here.
    const queryString = new URLSearchParams(params).toString();
    return this.rest.get<PaginatedResult<KnowledgeBaseEntry>>(
      this.baseUrl(`/entries?${queryString}`),
      (result: PaginatedResult<KnowledgeBaseEntry>) => result
    );
  }

  getEntry(entryId: string): Observable<KnowledgeBaseEntry> {
    return this.rest.get<KnowledgeBaseEntry>(this.baseUrl(`/entries/${entryId}`), (entry: KnowledgeBaseEntry) => entry);
  }

  createEntry(payload: KnowledgeBaseEntryPayload): Observable<KnowledgeBaseEntrySaveResult> {
    return this.rest.post<KnowledgeBaseEntryPayload, KnowledgeBaseEntrySaveResult>(
      this.baseUrl('/entries'),
      payload,
      (result: KnowledgeBaseEntrySaveResult) => result
    );
  }

  updateEntry(entryId: string, payload: KnowledgeBaseEntryPayload): Observable<KnowledgeBaseEntrySaveResult> {
    return this.rest.put<KnowledgeBaseEntryPayload, KnowledgeBaseEntrySaveResult>(
      this.baseUrl(`/entries/${entryId}`),
      payload,
      (result: KnowledgeBaseEntrySaveResult) => result
    );
  }

  deleteEntry(entryId: string): Observable<KnowledgeBaseJob> {
    // The removal projection is a job, so this returns it rather than a boolean; a POST is used
    // because DELETE has no response body in RestService.
    return this.rest.post<void, KnowledgeBaseJob>(this.baseUrl(`/entries/${entryId}/delete`), undefined, (job: KnowledgeBaseJob) => job);
  }

  getTags(): Observable<string[]> {
    return this.rest.getArray<string>(this.baseUrl('/tags'), (tags: string[]) => tags);
  }

  // --------------------------------------------------------------------- Index and synchronization

  getSyncStatus(): Observable<KnowledgeBaseSyncStatus> {
    return this.rest.get<KnowledgeBaseSyncStatus>(this.baseUrl('/sync'), (status: KnowledgeBaseSyncStatus) => status);
  }

  synchronize(): Observable<KnowledgeBaseJob> {
    return this.rest.post<void, KnowledgeBaseJob>(this.baseUrl('/sync'), undefined, (job: KnowledgeBaseJob) => job);
  }

  createIndex(): Observable<KnowledgeBaseJob> {
    return this.rest.post<void, KnowledgeBaseJob>(this.baseUrl('/index'), undefined, (job: KnowledgeBaseJob) => job);
  }

  // --------------------------------------------------------------------- Retrieval test

  searchAndLocateEntry(payload: { question: string; entryId?: string | null }): Observable<KnowledgeBaseRetrievalTest> {
    // No dedicated endpoint: the admin server runs the vector store inspection search with the
    // entry chunk pinned, and maps the result to this shape.
    return this.rest.post<{ question: string; entryId?: string | null }, KnowledgeBaseRetrievalTest>(
      this.baseUrl('/retrieval-test'),
      payload,
      (result: KnowledgeBaseRetrievalTest) => result
    );
  }

  // --------------------------------------------------------------------- Bulk actions and jobs

  bulkUpdateStatus(entryIds: string[], status: KnowledgeBaseEntryStatus): Observable<KnowledgeBaseJob> {
    return this.rest.post<{ entryIds: string[]; status: KnowledgeBaseEntryStatus }, KnowledgeBaseJob>(
      this.baseUrl('/bulk-status'),
      { entryIds, status },
      (job: KnowledgeBaseJob) => job
    );
  }

  getJob(jobId: string): Observable<KnowledgeBaseJob> {
    return this.rest.get<KnowledgeBaseJob>(this.baseUrl(`/jobs/${jobId}`), (job: KnowledgeBaseJob) => job);
  }

  getActiveJob(): Observable<KnowledgeBaseJob | null> {
    // The route answers an empty body when no job is running, mapped to null.
    return this.rest.get<KnowledgeBaseJob | null>(this.baseUrl('/jobs/active'), (job: KnowledgeBaseJob) =>
      job && Object.keys(job).length ? job : null
    );
  }

  // --------------------------------------------------------------------- Import / export

  previewImport(rows: ParsedImportRow[]): Observable<KnowledgeBaseImportCandidate[]> {
    // Reading and mapping the file is done client side (utils/import.utils.ts); only duplicate
    // detection against existing entries needs the server.
    return this.rest.post<{ rows: ParsedImportRow[] }, KnowledgeBaseImportCandidate[]>(
      this.baseUrl('/import/preview'),
      { rows },
      (candidates: KnowledgeBaseImportCandidate[]) => candidates
    );
  }

  importEntries(
    candidates: KnowledgeBaseImportCandidate[],
    duplicatePolicy: KnowledgeBaseDuplicatePolicy
  ): Observable<KnowledgeBaseImportResult> {
    return this.rest.post<
      { candidates: KnowledgeBaseImportCandidate[]; duplicatePolicy: KnowledgeBaseDuplicatePolicy },
      KnowledgeBaseImportResult
    >(this.baseUrl('/import'), { candidates, duplicatePolicy }, (result: KnowledgeBaseImportResult) => result);
  }

  exportEntries(): Observable<KnowledgeBaseExportEnvelope> {
    return this.rest.get<KnowledgeBaseExportEnvelope>(this.baseUrl('/export'), (envelope: KnowledgeBaseExportEnvelope) => envelope);
  }
}
