import { Observable } from 'rxjs';

import { CompressorSettings } from '../../configuration/compressor-settings/models/compressor-settings';
import {
  CondenseRequest,
  CondenseResponse,
  DocumentsRequest,
  DocumentsResponse,
  IndexListResponse,
  SearchRequest,
  SearchResponse,
  VectorStoreCapabilities
} from '../models/vector-store-inspection.models';
import { VectorDbProvider } from '../../configuration/vector-db-settings/models/providers-configuration';

/**
 * API surface for vector store inspection.
 *
 * Declared as an abstract class rather than an interface so it can be used as
 * an Angular injection token. Two implementations are expected:
 *  - VectorStoreInspectionMockService, used while the backend endpoints are
 *    being specified and reviewed;
 *  - a REST implementation calling /gen-ai/bots/:botId/vector-store/*, once
 *    those routes land.
 *
 * Switching between them is a single provider change in the module. No
 * component should ever reference the mock directly.
 */
export abstract class VectorStoreInspectionService {
  /**
   * Declared capabilities of the store backing the current bot. The UI builds
   * its controls from this rather than hardcoding provider conditions, so that
   * a provider gaining hybrid search needs no frontend change.
   */
  abstract getCapabilities(): Observable<VectorStoreCapabilities>;

  /** Indexes belonging to the current namespace / bot pair. */
  abstract getIndexes(): Observable<IndexListResponse>;

  /** Ingestion report and a page of documents, grouped server side. */
  abstract getDocuments(request: DocumentsRequest): Observable<DocumentsResponse>;

  /**
   * Runs the question condensation step alone. Optional: the diagnostic view
   * works without it, and comparing runs with and without is one of the cases
   * the comparison mode covers.
   */
  abstract condense(request: CondenseRequest): Observable<CondenseResponse>;

  /**
   * Runs a retrieval and returns the full funnel. The query and keywords are
   * always supplied by the caller and never recomputed server side, which is
   * what makes condensation optional and run comparison possible.
   */
  abstract search(request: SearchRequest): Observable<SearchResponse>;

  /**
   * Compressor configuration of the current bot, used to seed the diagnostic
   * form so it mirrors the running chain.
   *
   * No new endpoint is needed: the REST implementation calls the existing
   * GET /rest/admin/gen-ai/bots/{botId}/configuration/document-compressor.
   * Returns null when no compressor is configured at all.
   */
  abstract getCompressorSettings(): Observable<CompressorSettings | null>;
}
