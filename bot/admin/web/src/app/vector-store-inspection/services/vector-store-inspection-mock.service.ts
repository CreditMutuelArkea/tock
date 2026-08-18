import { inject, Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { StateService } from '../../core-nlp/state.service';
import { CompressorSettings } from '../../configuration/compressor-settings/models/compressor-settings';
import { CompressorProvider } from '../../configuration/compressor-settings/models/providers-configuration';
import { VectorDbProvider } from '../../configuration/vector-db-settings/models/providers-configuration';
import { DocumentSearchType } from '../../rag/rag-settings/models/engines-configurations';
import {
  AnomalyCode,
  ChunkId,
  ChunkOutcome,
  CompressionOverride,
  CondenseRequest,
  CondenseResponse,
  DocumentsRequest,
  DocumentsResponse,
  FunnelStage,
  IndexAnomaly,
  IndexListResponse,
  IndexStats,
  InspectedChunk,
  InspectedDocument,
  SearchRequest,
  SearchResponse,
  SearchResultChunk,
  VectorStoreCapabilities,
  VectorStoreIndex
} from '../models/vector-store-inspection.models';
import { VectorStoreInspectionService } from './vector-store-inspection.service';

/**
 * Mock data source for the inspection mockup.
 *
 * Goals:
 *  - deterministic corpus, seeded from the namespace/bot pair: a given bot
 *    always gets the same data, two bots get different data;
 *  - realistic volumetry so pagination and filtering are actually exercised;
 *  - anomalies injected on purpose, in known quantities;
 *  - rankings produced by naive but reproducible scoring, staging two teaching
 *    cases: a reformulation that silently loses a chunk (condensation), and a
 *    chunk the reranker rescues that the top-k cut would otherwise drop.
 *
 * To be replaced by a REST implementation once the endpoints ship. The public
 * signature is identical.
 *
 * Known limitation: vector scoring here is lexical overlap, not semantic
 * similarity. It demonstrates the funnel mechanics faithfully, but a chunk that
 * is semantically close without sharing vocabulary will never surface the way a
 * real embedding would.
 */

// ---------------------------------------------------------------------------
// Deterministic PRNG and seeding
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * FNV-1a. Turns the namespace/bot pair into a stable seed so each bot always
 * gets the same corpus, and two different bots get different ones.
 */
function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Same treatment as PGVectorUtils.normalizeDocumentIndexName(): lowercase and
 * collapse anything outside [a-z0-9] into underscores. Reproduced here so the
 * mock produces index names of the exact shape the backend will return.
 */
function normalizeIndexName(namespace: string, botId: string, sessionId: string): string {
  return `ns-${namespace}-bot-${botId}-session-${sessionId}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// ---------------------------------------------------------------------------
// Corpus source material
// ---------------------------------------------------------------------------

const THEMES = [
  'home insurance',
  'car insurance',
  'mortgage',
  'savings account',
  'current account',
  'debit card',
  'income protection',
  'loan insurance',
  'term deposit',
  'life insurance'
];

const ASPECTS = [
  'general terms',
  'cancellation',
  'subscription',
  'pricing',
  'coverage',
  'exclusions',
  'claims',
  'deductible',
  'waiting period',
  'payment terms',
  'limits',
  'beneficiaries'
];

/**
 * Enlarged, varied pool. Twelve sentences saturated lexical coverage — a
 * thousand chunks scored a perfect 1.0 and only length told them apart, which
 * left no exploitable ranking. A wider vocabulary spreads the scores out.
 */
const SENTENCES = [
  'The contract may be cancelled at each annual renewal date subject to two months notice.',
  'After the first year, the policy may be cancelled at any time, free of charge.',
  'The request must be sent by registered letter or through the online portal.',
  'Coverage takes effect on the date stated in the particular conditions.',
  'The deductible remains payable by the policyholder for each reported claim.',
  'The premium is reviewed annually against the reference index.',
  'Any inaccurate declaration may render the contract void.',
  'The waiting period runs from the subscription date.',
  'Coverage exclusions are exhaustively listed in article 7.',
  'Claims must be reported within five working days.',
  'Reimbursement occurs within thirty days of the claim being accepted.',
  'Compensation limits are detailed in the coverage table.',
  'Interest is credited to the account on the last business day of each month.',
  'Withdrawals above the daily ceiling require prior authorisation.',
  'The card is replaced free of charge in the event of proven fraud.',
  'Opposition to a payment must be declared without undue delay.',
  'The borrower may repay early, subject to an indemnity capped by law.',
  'The amortisation schedule is provided before signature.',
  'A guarantor may be required depending on the borrowing capacity.',
  'The rate is fixed for the whole duration of the loan.',
  'Beneficiaries are designated in the membership form.',
  'The capital is paid within one month of receiving the supporting documents.',
  'Medical formalities depend on the amount insured and the age at subscription.',
  'Suicide is excluded during the first year of the contract.',
  'Roadside assistance is included from the first kilometre.',
  'A courtesy vehicle is provided for the duration of the repair.',
  'Damage caused while driving without a licence is never covered.',
  'The bonus malus coefficient is updated at each anniversary.',
  'Water damage is covered after the plumbing origin has been identified.',
  'Theft requires a police report filed within forty eight hours.',
  'Jewellery is covered up to a specific sub limit.',
  'Garden furniture is considered outdoor property.',
  'Transfers between accounts held by the same holder are free.',
  'An overdraft facility may be granted after review of the account history.',
  'Statements are made available online on the second working day.',
  'Direct debits rejected for insufficient funds incur a fixed fee.',
  'The savings ceiling is set by regulation and revised periodically.',
  'Interest earned is exempt from income tax under conditions.',
  'Funds remain available at all times without notice.',
  'A single account per holder is authorised.',
  'Income protection benefits start after the elimination period.',
  'The benefit is proportional to the declared professional income.',
  'Part time resumption of work is taken into account pro rata.',
  'Psychological conditions require an additional medical assessment.',
  'Loan insurance may be delegated to another provider.',
  'The equivalence of guarantees is assessed on eleven criteria.',
  'Termination is possible at each anniversary of the offer.',
  'The insurer must respond within ten working days.'
];

const DUPLICATE_TITLE = 'General terms - common provisions';

/**
 * Scripted case for the run comparison view: this chunk ranks well against the
 * raw question ("mid-year") and collapses once the question is reformulated as
 * "early cancellation", because the reformulation drops the renewal-date notion.
 */
const SCRIPTED_DOCUMENT_ID = 'c9e4a71f';

/**
 * Scripted case for the pipeline-ordering demo. Its words are all common in the
 * corpus, so lexical similarity buries it in the crowd (rank ~30-100), but they
 * are gathered in one sentence, so sentence-level rerank scoring puts it at the
 * top — exactly what a cross-encoder is for. Surrounded by noise sentences so
 * its overall cosine stays below the top-k cut while its best sentence stays
 * perfect.
 *
 * Demo query: "claim reported registered letter working days", fetchK 150,
 * k 8, maxDocuments 4. In the intended order the three planted chunks reach the
 * final context; reproducing the runtime order drops them, because k truncates
 * before the reranker ever sees them.
 */
const PLANTED_SENTENCE =
  'The deductible remains payable at each annual renewal date, and any claim must be reported by registered letter within five working days.';

/** Below this length a chunk is treated as empty noise rather than content. */
const NEAR_EMPTY_LENGTH = 50;

const DEFAULT_MIN_SCORE = 0.4;
const DEFAULT_MAX_DOCUMENTS = 4;

/**
 * Above this many candidates the simulated reranker exceeds its 5s timeout.
 * BloomzRerank is fault tolerant, so it returns the documents unchanged. Set
 * high enough that the pipeline-ordering demo (fetchK 150) does not trip it;
 * lower fetchK further, or push it past this, to demonstrate the fallback.
 */
const MOCK_COMPRESSOR_TIMEOUT_ABOVE = 250;

const CURRENT_SESSION_ID = '4f2a1b8c-9d3e-4c11-8a52-1e7b6c0d9f34';
const PREVIOUS_SESSION_ID = '8b1c4e02-2f77-4a90-b3d1-5c8e2a4f7b16';

/**
 * Provider simulated by the mock. Switch to OpenSearch to exercise the
 * capabilities-driven degradation of the search mode selector.
 */
const MOCK_PROVIDER: VectorDbProvider = VectorDbProvider.PGVector;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

interface MockChunk extends InspectedChunk {
  documentId: string;
  title: string;
  /** Title plus content, used for the vector-like score. */
  tokens: Set<string>;
  /** Content only, used by the rerank score, which ignores the title. */
  contentTokens: Set<string>;
  /** Content split into sentences, used by the sentence-level rerank score. */
  sentences: Set<string>[];
}

interface ScoredChunk {
  chunk: MockChunk;
  score: number;
}

@Injectable()
export class VectorStoreInspectionMockService extends VectorStoreInspectionService {
  private readonly latencyMs = 240;

  /** Corpora are cached per namespace/bot pair, keyed by `${namespace}/${botId}`. */
  private indexesByBot = new Map<string, VectorStoreIndex[]>();
  private documentsByIndex = new Map<string, InspectedDocument[]>();
  private chunksByIndex = new Map<string, MockChunk[]>();

  /** Output of the last compression, needed by the beforeCut ordering. */
  private lastCompressed: MockChunk[] = [];

  private readonly state = inject(StateService);

  constructor() {
    super();
  }

  // -- Public API --------------------------------------------------------

  /**
   * The provider is resolved server side from the bot's vector store
   * configuration, so the client never passes it.
   */
  getCapabilities(): Observable<VectorStoreCapabilities> {
    const capabilities: VectorStoreCapabilities =
      MOCK_PROVIDER === VectorDbProvider.OpenSearch
        ? {
            // Reflects the current state of the backend:
            // getDocumentSearchParams() silently forces SIMILARITY_SEARCH and
            // get_text_store_retriever() raises NotImplementedError.
            provider: VectorDbProvider.OpenSearch,
            searchTypes: [DocumentSearchType.SIMILARITY_SEARCH],
            supportsScores: true,
            supportsIndexListing: true,
            supportsMetadataFilter: true,
            notes: ['hybrid_and_fts_not_implemented']
          }
        : {
            provider: VectorDbProvider.PGVector,
            searchTypes: [DocumentSearchType.SIMILARITY_SEARCH, DocumentSearchType.FULL_TEXT_SEARCH, DocumentSearchType.HYBRID_SEARCH],
            supportsScores: true,
            supportsIndexListing: true,
            supportsMetadataFilter: true,
            notes: []
          };

    return of(capabilities).pipe(delay(this.latencyMs));
  }

  getIndexes(): Observable<IndexListResponse> {
    return of({ indexes: this.ensureCorpus() }).pipe(delay(this.latencyMs));
  }

  getCompressorSettings(): Observable<CompressorSettings | null> {
    const bot = this.botKey;

    return of({
      id: 'mock-compressor',
      namespace: bot?.namespace ?? '',
      botId: bot?.botId ?? '',
      enabled: true,
      setting: {
        provider: CompressorProvider.BloomzRerank,
        minScore: DEFAULT_MIN_SCORE,
        maxDocuments: DEFAULT_MAX_DOCUMENTS,
        label: 'entailment',
        endpoint: 'https://example.com/rerank',
        fillToMaxDocuments: false
      }
    } as CompressorSettings).pipe(delay(this.latencyMs));
  }

  getDocuments(request: DocumentsRequest): Observable<DocumentsResponse> {
    this.ensureCorpus();

    const all = this.documentsByIndex.get(request.indexName) ?? [];
    const chunks = this.chunksByIndex.get(request.indexName) ?? [];

    let filtered = all;

    const text = request.filter?.text?.trim().toLowerCase();
    if (text) {
      filtered = filtered.filter(
        (doc) => doc.title.toLowerCase().includes(text) || (doc.chunks ?? []).some((c) => c.content.toLowerCase().includes(text))
      );
    }

    if (request.filter?.documentId) {
      filtered = filtered.filter((doc) => doc.documentId === request.filter!.documentId);
    }

    if (request.filter?.anomaly) {
      filtered = filtered.filter((doc) => this.matchesAnomaly(doc, request.filter!.anomaly!));
    }

    // Offsets rather than page numbers, matching the shared Pagination
    // contract. start is clamped so an out-of-range offset (index switched
    // while on the last page) falls back into range instead of returning
    // nothing.
    const start = Math.max(0, Math.min(request.start, Math.max(0, filtered.length - 1)));
    const end = Math.min(start + request.size, filtered.length);

    const rows = filtered.slice(start, end).map((doc) => ({
      ...doc,
      chunks: request.includeChunks === false ? undefined : doc.chunks
    }));

    return of({
      // Stats and anomalies describe the whole index, never the filtered
      // subset: the counts on the chips are what the user filters against.
      stats: this.buildStats(all, chunks, request.indexName),
      anomalies: this.buildAnomalies(all),
      rows,
      total: filtered.length,
      start,
      end
    }).pipe(delay(this.latencyMs));
  }

  condense(request: CondenseRequest): Observable<CondenseResponse> {
    const question = request.question.toLowerCase();

    // Scripted reformulation: "mid-year" is replaced by "early", which drops
    // the renewal-date notion and sinks the chunk that carries it.
    const isScriptedCase = question.includes('mid-year') && question.includes('cancel');

    const response: CondenseResponse = isScriptedCase
      ? {
          condensedQuestion: 'Conditions for early cancellation of a home insurance contract',
          keyWords: ['cancellation', 'insurance', 'early'],
          effectivePrompt:
            'Rewrite the following question as a standalone one, taking the conversation history ' +
            'into account. Also extract the relevant keywords.',
          duration: 1.284
        }
      : {
          condensedQuestion: request.question,
          keyWords: this.tokenize(request.question)
            .filter((t) => t.length > 4)
            .slice(0, 3),
          effectivePrompt:
            'Rewrite the following question as a standalone one, taking the conversation history ' +
            'into account. Also extract the relevant keywords.',
          duration: 0.9 + Math.random() * 0.6
        };

    return of(response).pipe(delay(700));
  }

  search(request: SearchRequest): Observable<SearchResponse> {
    this.ensureCorpus();

    const chunks = this.chunksByIndex.get(request.indexName) ?? [];
    const queryTokens = this.tokenize(request.query);
    const keyWords = (request.keyWords ?? []).map((k) => k.toLowerCase());

    const useVector =
      request.searchType === DocumentSearchType.SIMILARITY_SEARCH || request.searchType === DocumentSearchType.HYBRID_SEARCH;
    const useFts = request.searchType === DocumentSearchType.FULL_TEXT_SEARCH || request.searchType === DocumentSearchType.HYBRID_SEARCH;

    // Complete rankings. The fetchK window is applied below, so the same
    // sorted list also answers "where does this chunk really sit", which is
    // what the exact_rank strategy needs.
    const vectorFull = useVector ? this.rankByVector(chunks, queryTokens) : [];
    const ftsFull = useFts ? this.rankByFts(chunks, keyWords) : [];

    const vectorExactRank = new Map<ChunkId, number>();
    const vectorExactScore = new Map<ChunkId, number>();
    vectorFull.forEach((entry, i) => {
      vectorExactRank.set(entry.chunk.chunkId, i + 1);
      vectorExactScore.set(entry.chunk.chunkId, entry.score);
    });

    const ftsExactRank = new Map<ChunkId, number>();
    const ftsExactScore = new Map<ChunkId, number>();
    ftsFull.forEach((entry, i) => {
      ftsExactRank.set(entry.chunk.chunkId, i + 1);
      ftsExactScore.set(entry.chunk.chunkId, entry.score);
    });

    const vectorRanked = vectorFull.slice(0, request.fetchK);
    const ftsRanked = ftsFull.slice(0, request.fetchK);

    // Within the window, window rank and exact rank coincide.
    const vectorRank = new Map<ChunkId, number>();
    const vectorScore = new Map<ChunkId, number>();
    vectorRanked.forEach((entry, i) => {
      vectorRank.set(entry.chunk.chunkId, i + 1);
      vectorScore.set(entry.chunk.chunkId, entry.score);
    });

    const ftsRank = new Map<ChunkId, number>();
    const ftsScore = new Map<ChunkId, number>();
    ftsRanked.forEach((entry, i) => {
      ftsRank.set(entry.chunk.chunkId, i + 1);
      ftsScore.set(entry.chunk.chunkId, entry.score);
    });

    // RRF fusion — mirrors apply_rrf_ranking(): score = sum of 1 / (k + rank),
    // with k = 60.
    const RRF_K = 60;
    const rrfScore = new Map<ChunkId, number>();
    const seen = new Map<ChunkId, MockChunk>();

    for (const list of [vectorRanked, ftsRanked]) {
      list.forEach((entry, i) => {
        const id = entry.chunk.chunkId;
        rrfScore.set(id, (rrfScore.get(id) ?? 0) + 1 / (RRF_K + i + 1));
        if (!seen.has(id)) {
          seen.set(id, entry.chunk);
        }
      });
    }

    const isHybrid = useVector && useFts;
    const fused = [...seen.values()].sort((a, b) => (rrfScore.get(b.chunkId) ?? 0) - (rrfScore.get(a.chunkId) ?? 0));

    // Single-channel searches are not fused: the order is that of the active
    // channel, as in the backend.
    const retrieved = isHybrid ? fused : useVector ? vectorRanked.map((e) => e.chunk) : ftsRanked.map((e) => e.chunk);

    const rrfRank = new Map<ChunkId, number>();
    if (isHybrid) {
      fused.forEach((chunk, i) => rrfRank.set(chunk.chunkId, i + 1));
    }

    const override: CompressionOverride = request.compressionOverride ?? {
      minScore: DEFAULT_MIN_SCORE,
      maxDocuments: DEFAULT_MAX_DOCUMENTS,
      fillToMaxDocuments: false
    };

    const outcomes = new Map<ChunkId, ChunkOutcome>();
    const compressorScore = new Map<ChunkId, number>();
    let compression: FunnelStage;
    let cutCount: number;
    let discarded: number;

    if (!request.compressionEnabled) {
      // No compression: the top-k cut is the last stage.
      const kept = retrieved.slice(0, request.k);
      kept.forEach((c) => outcomes.set(c.chunkId, 'kept'));
      retrieved.slice(request.k).forEach((c) => outcomes.set(c.chunkId, 'cut_by_top_k'));
      cutCount = kept.length;
      discarded = Math.max(0, retrieved.length - kept.length);
      compression = { status: 'disabled', count: null, reason: null };
    } else if (request.compressionStage === 'afterCut') {
      // Runtime-faithful: the retriever truncates first, the compressor can
      // then only remove. With a small k the reranker has almost no material,
      // which is precisely what the beforeCut mode exists to expose.
      const cut = retrieved.slice(0, request.k);
      retrieved.slice(request.k).forEach((c) => outcomes.set(c.chunkId, 'cut_by_top_k'));
      cutCount = cut.length;
      discarded = Math.max(0, retrieved.length - cut.length);

      compression = this.runCompression(cut, queryTokens, override, outcomes, compressorScore);
    } else {
      // Intended order: the reranker sorts the whole fetched window, then the
      // cut applies to its output.
      compression = this.runCompression(retrieved, queryTokens, override, outcomes, compressorScore);

      const ordered = this.lastCompressed;
      const kept = ordered.slice(0, request.k);
      const keptIds = new Set(kept.map((c) => c.chunkId));
      kept.forEach((c) => outcomes.set(c.chunkId, 'kept'));
      ordered.filter((c) => !keptIds.has(c.chunkId)).forEach((c) => outcomes.set(c.chunkId, 'cut_by_top_k'));
      cutCount = kept.length;
      discarded = Math.max(0, retrieved.length - kept.length);
    }

    const results: SearchResultChunk[] = retrieved.map((chunk) =>
      this.toResult(chunk, {
        vectorRank,
        vectorScore,
        ftsRank,
        ftsScore,
        rrfRank,
        rrfScore,
        compressorScore,
        outcome: outcomes.get(chunk.chunkId) ?? 'cut_by_top_k',
        pinned: (request.pinnedChunkIds ?? []).includes(chunk.chunkId)
      })
    );

    // Pinning: requested chunks always appear, even when returned by no
    // channel. With exact_rank the true position in the complete ranking is
    // resolved, which is what distinguishes "ranked 312nd" from "not in the
    // index at all".
    const exactRankRequested = (request.pinnedRankStrategy ?? 'score_only') === 'exact_rank';

    for (const pinnedId of request.pinnedChunkIds ?? []) {
      if (results.some((r) => r.chunkId === pinnedId)) {
        continue;
      }
      const chunk = chunks.find((c) => c.chunkId === pinnedId);
      if (!chunk) {
        // Pinned in another index and absent from this one. Pins deliberately
        // survive an index change, so this is an expected state.
        continue;
      }

      results.push(
        this.toResult(chunk, {
          // RRF has no meaning outside the fused window: fusion only ever runs
          // on what was fetched, so no exact RRF rank can exist here.
          vectorRank: exactRankRequested ? vectorExactRank : new Map(),
          vectorScore: vectorExactScore,
          ftsRank: exactRankRequested ? ftsExactRank : new Map(),
          ftsScore: ftsExactScore,
          rrfRank: new Map(),
          rrfScore: new Map(),
          compressorScore: new Map(),
          outcome: 'not_retrieved',
          pinned: true
        })
      );
    }

    const funnel = {
      vector: this.stage(useVector, vectorRanked.length),
      fts: this.stage(useFts, ftsRanked.length),
      rrf: this.stage(isHybrid, fused.length),
      topKCut: { status: 'applied', count: cutCount, discarded } as FunnelStage,
      compression
    };

    return of({
      funnel,
      compressionStage: request.compressionStage,
      results,
      duration: 0.3 + Math.random() * 0.3
    }).pipe(delay(this.latencyMs));
  }

  // -- Bot scoping -------------------------------------------------------

  /**
   * Namespace and application name, which is what the backend calls botId:
   * GenAIVerticle passes app.namespace and app.name to every Gen AI service.
   */
  private get botKey(): { namespace: string; botId: string; key: string } | null {
    const application = this.state.currentApplication;
    if (!application) return null;

    return {
      namespace: application.namespace,
      botId: application.name,
      key: `${application.namespace}/${application.name}`
    };
  }

  /**
   * Builds the corpus for the current bot on first access. Two sessions are
   * generated so the diagnostic view has something to compare against.
   */
  private ensureCorpus(): VectorStoreIndex[] {
    const bot = this.botKey;
    if (!bot) return [];

    const cached = this.indexesByBot.get(bot.key);
    if (cached) return cached;

    const seed = hashSeed(bot.key);

    // Sizes derived from the seed too, so different bots look different: some
    // carry a few hundred documents, others a few thousand.
    const currentSize = 400 + (seed % 3600);
    const previousSize = Math.floor(currentSize * 0.86);

    const indexes: VectorStoreIndex[] = [
      this.buildIndex(bot.namespace, bot.botId, CURRENT_SESSION_ID, '2026-08-09T03:14:00', currentSize, true, seed),
      this.buildIndex(bot.namespace, bot.botId, PREVIOUS_SESSION_ID, '2026-06-21T02:47:00', previousSize, false, seed ^ 0x5bf03635)
    ];

    this.indexesByBot.set(bot.key, indexes);
    return indexes;
  }

  // -- Compression simulation -------------------------------------------

  /**
   * Wraps compress() with the fault tolerance of the real reranker: on timeout
   * it logs and returns the documents untouched. Without an explicit
   * failed_fallback status, "the compressor kept everything" and "the
   * compressor crashed" would look identical.
   */
  private runCompression(
    input: MockChunk[],
    queryTokens: string[],
    setting: CompressionOverride,
    outcomes: Map<ChunkId, ChunkOutcome>,
    scores: Map<ChunkId, number>
  ): FunnelStage {
    if (input.length > MOCK_COMPRESSOR_TIMEOUT_ABOVE) {
      this.lastCompressed = input;
      input.forEach((chunk) => outcomes.set(chunk.chunkId, 'kept'));

      return {
        status: 'failed_fallback',
        count: input.length,
        reason: `Read timed out after 5s on ${input.length} candidates`
      };
    }

    this.lastCompressed = this.compress(input, queryTokens, setting, outcomes, scores);
    return { status: 'applied', count: this.lastCompressed.length, reason: null };
  }

  /**
   * Mirrors BloomzRerank.compress_documents(): score every document, drop
   * those below minScore, keep at most maxDocuments, then optionally pad back
   * up with below-threshold documents when fillToMaxDocuments is set.
   *
   * Returns the surviving chunks in reranked order and records an outcome for
   * every input chunk.
   */
  private compress(
    input: MockChunk[],
    queryTokens: string[],
    setting: CompressionOverride,
    outcomes: Map<ChunkId, ChunkOutcome>,
    scores: Map<ChunkId, number>
  ): MockChunk[] {
    const scored = input
      .map((chunk) => {
        const score = this.rerankScore(chunk, queryTokens);
        scores.set(chunk.chunkId, score);
        return { chunk, score };
      })
      .sort((a, b) => b.score - a.score);

    const above = scored.filter((e) => e.score >= setting.minScore);
    const below = scored.filter((e) => e.score < setting.minScore);

    const kept = above.slice(0, setting.maxDocuments);
    kept.forEach((e) => outcomes.set(e.chunk.chunkId, 'kept'));

    // Above threshold but ranked past maxDocuments.
    above.slice(setting.maxDocuments).forEach((e) => outcomes.set(e.chunk.chunkId, 'reranked_out'));

    below.forEach((e) => outcomes.set(e.chunk.chunkId, 'below_min_score'));

    if (setting.fillToMaxDocuments && kept.length < setting.maxDocuments) {
      const padding = below.slice(0, setting.maxDocuments - kept.length);
      // Survived despite an insufficient score — not the same as being kept
      // on merit, and surfaced distinctly in the UI.
      padding.forEach((e) => outcomes.set(e.chunk.chunkId, 'filled_below_threshold'));
      return [...kept, ...padding].map((e) => e.chunk);
    }

    return kept.map((e) => e.chunk);
  }

  /**
   * Stands in for the reranker's cross-encoder score. Deliberately unlike the
   * vector score: it reads the best single sentence rather than the whole
   * chunk, and ignores the title. A chunk whose query terms are gathered in one
   * statement scores high here even when they are diluted across the chunk for
   * the vector score — which is exactly the reordering a reranker exists to do.
   */
  private rerankScore(chunk: MockChunk, queryTokens: string[]): number {
    if (!queryTokens.length) return 0;

    let best = 0;
    for (const sentence of chunk.sentences) {
      const coverage = this.coverage(sentence, queryTokens);
      if (coverage > best) best = coverage;
    }
    const overall = this.coverage(chunk.contentTokens, queryTokens);

    return Number(Math.min(1, 0.7 * best + 0.3 * overall).toFixed(4));
  }

  // -- Corpus construction ----------------------------------------------

  private buildIndex(
    namespace: string,
    botId: string,
    sessionId: string,
    datetime: string,
    documentCount: number,
    isCurrent: boolean,
    seed: number
  ): VectorStoreIndex {
    const indexName = normalizeIndexName(namespace, botId, sessionId);
    const rand = mulberry32(seed);

    const documents: InspectedDocument[] = [];
    const chunks: MockChunk[] = [];

    // Anomalies and scripted cases injected on purpose, in known quantities.
    const nearEmptyTargets = new Set(this.pickIndices(rand, documentCount, 23));
    const nonUrlTargets = new Set(this.pickIndices(rand, documentCount, 61));
    const duplicateTitleTargets = new Set(this.pickIndices(rand, documentCount, 4));
    const plantedTargets = new Set(this.pickIndices(rand, documentCount, 3));

    for (let i = 0; i < documentCount; i++) {
      const isScripted = isCurrent && i === 0;

      const documentId = isScripted ? SCRIPTED_DOCUMENT_ID : this.hexId(rand);
      const theme = THEMES[Math.floor(rand() * THEMES.length)];
      const aspect = ASPECTS[Math.floor(rand() * ASPECTS.length)];

      let title = isScripted ? 'Contract cancellation and renewal date' : this.capitalize(`${theme} - ${aspect}`);
      if (duplicateTitleTargets.has(i)) {
        title = DUPLICATE_TITLE;
      }

      // Planted documents need at least the chunk that carries the sentence.
      const chunkCount = isScripted ? 9 : Math.max(plantedTargets.has(i) ? 3 : 2, 2 + Math.floor(rand() * 11));
      const source = nonUrlTargets.has(i) ? `/var/ingestion/exports/${documentId}.md` : `https://example.com/docs/${documentId}`;

      const documentChunks: InspectedChunk[] = [];

      for (let c = 1; c <= chunkCount; c++) {
        const chunkLabel = `${c}/${chunkCount}`;
        const chunkId: ChunkId = `${documentId}:${chunkLabel}`;

        let content: string;
        if (isScripted && c === 5) {
          content =
            'After the first year, the policy may be cancelled at any time, free of charge. ' +
            'Mid-year, outside the annual renewal date, this applies to home insurance ' +
            'contracts renewed by tacit agreement.';
        } else if (isScripted && c === 4) {
          content = 'The contract may be cancelled at each annual renewal date subject to two months notice.';
        } else if (plantedTargets.has(i) && c === 2) {
          // Noise on both sides dilutes the overall cosine so the chunk sits
          // past the top-k cut, while the planted sentence keeps its rerank
          // score perfect.
          content = this.randomSentences(rand, 6) + ' ' + PLANTED_SENTENCE + ' ' + this.randomSentences(rand, 6);
        } else if (nearEmptyTargets.has(i) && c === chunkCount) {
          content = '-';
        } else {
          content = this.randomSentences(rand, 2 + Math.floor(rand() * 4));
        }

        documentChunks.push(this.buildChunk(chunkId, chunkLabel, content, documentId, title, sessionId, datetime));
        chunks.push(documentChunks[documentChunks.length - 1] as MockChunk);
      }

      documents.push({
        documentId,
        title,
        source,
        chunkCount,
        indexSessionId: sessionId,
        chunks: documentChunks
      });
    }

    this.documentsByIndex.set(indexName, documents);
    this.chunksByIndex.set(indexName, chunks);

    return {
      indexName,
      indexSessionId: sessionId,
      indexDatetime: datetime,
      documentCount,
      chunkCount: chunks.length,
      isCurrent
    };
  }

  private buildChunk(
    chunkId: ChunkId,
    chunkLabel: string,
    content: string,
    documentId: string,
    title: string,
    sessionId: string,
    datetime: string
  ): MockChunk {
    return {
      chunkId,
      chunk: chunkLabel,
      content,
      contentLength: content.length,
      documentId,
      title,
      tokens: new Set(this.tokenize(`${title} ${content}`)),
      contentTokens: new Set(this.tokenize(content)),
      sentences: this.splitSentences(content),
      metadata: {
        id: documentId,
        chunk: chunkLabel,
        title,
        source: title,
        reference: title,
        index_session_id: sessionId,
        index_datetime: datetime
      }
    };
  }

  private randomSentences(rand: () => number, count: number): string {
    return Array.from({ length: count }, () => SENTENCES[Math.floor(rand() * SENTENCES.length)]).join(' ');
  }

  private splitSentences(content: string): Set<string>[] {
    return content.split(/(?<=\.)\s+/).map((sentence) => new Set(this.tokenize(sentence)));
  }

  // -- Retrieval scoring -------------------------------------------------

  private coverage(tokens: Set<string>, queryTokens: string[]): number {
    if (!queryTokens.length) return 0;
    let hits = 0;
    for (const token of queryTokens) {
      if (tokens.has(token)) hits++;
    }
    return hits / queryTokens.length;
  }

  /** Normalised lexical overlap over title plus content, standing in for cosine. */
  private cosineLike(chunk: MockChunk, queryTokens: string[]): number {
    const coverage = this.coverage(chunk.tokens, queryTokens);
    // Slight density bonus: a short relevant chunk beats a long one.
    const density = Math.min(1, 400 / Math.max(80, chunk.contentLength));
    return Number((0.55 * coverage + 0.35 * coverage * density + 0.1 * density).toFixed(4));
  }

  /**
   * Full ranking, not truncated. The fetchK window is applied by the caller so
   * the same list can also answer "where does this chunk really sit", which is
   * what the exact_rank strategy needs.
   */
  private rankByVector(chunks: MockChunk[], queryTokens: string[]): ScoredChunk[] {
    return chunks
      .map((chunk) => ({ chunk, score: this.cosineLike(chunk, queryTokens) }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /** Approximation of ts_rank: share of keywords present in the chunk. */
  private rankByFts(chunks: MockChunk[], keyWords: string[]): ScoredChunk[] {
    if (!keyWords.length) {
      return [];
    }
    return chunks
      .map((chunk) => {
        let hits = 0;
        for (const kw of keyWords) {
          if (chunk.tokens.has(kw)) {
            hits++;
          }
        }
        return { chunk, score: Number((hits / keyWords.length).toFixed(4)) };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // -- Helpers -----------------------------------------------------------

  private toResult(
    chunk: MockChunk,
    ctx: {
      vectorRank: Map<ChunkId, number>;
      vectorScore: Map<ChunkId, number>;
      ftsRank: Map<ChunkId, number>;
      ftsScore: Map<ChunkId, number>;
      rrfRank: Map<ChunkId, number>;
      rrfScore: Map<ChunkId, number>;
      compressorScore: Map<ChunkId, number>;
      outcome: ChunkOutcome;
      pinned: boolean;
    }
  ): SearchResultChunk {
    return {
      chunkId: chunk.chunkId,
      documentId: chunk.documentId,
      title: chunk.title,
      chunk: chunk.chunk,
      content: chunk.content,
      ranks: {
        vector: ctx.vectorRank.get(chunk.chunkId) ?? null,
        fts: ctx.ftsRank.get(chunk.chunkId) ?? null,
        rrf: ctx.rrfRank.get(chunk.chunkId) ?? null
      },
      scores: {
        vector: ctx.vectorScore.get(chunk.chunkId) ?? null,
        fts: ctx.ftsScore.get(chunk.chunkId) ?? null,
        rrf: ctx.rrfScore.has(chunk.chunkId) ? Number(ctx.rrfScore.get(chunk.chunkId)!.toFixed(4)) : null,
        compressor: ctx.compressorScore.get(chunk.chunkId) ?? null
      },
      outcome: ctx.outcome,
      pinned: ctx.pinned
    };
  }

  private stage(active: boolean, count: number): FunnelStage {
    return active ? { status: 'applied', count } : { status: 'skipped', count: null };
  }

  private buildStats(documents: InspectedDocument[], chunks: MockChunk[], indexName: string): IndexStats {
    const lengths = chunks.map((c) => c.contentLength).sort((a, b) => a - b);
    const median = lengths.length ? lengths[Math.floor(lengths.length / 2)] : 0;
    const index = this.ensureCorpus().find((i) => i.indexName === indexName);

    return {
      documentCount: documents.length,
      chunkCount: chunks.length,
      chunksPerDocumentAvg: documents.length ? Number((chunks.length / documents.length).toFixed(1)) : 0,
      chunkLengthMedian: median,
      indexDatetime: index?.indexDatetime ?? ''
    };
  }

  private buildAnomalies(documents: InspectedDocument[]): IndexAnomaly[] {
    const count = (code: AnomalyCode) => documents.filter((d) => this.matchesAnomaly(d, code)).length;

    return [
      { code: AnomalyCode.NEAR_EMPTY_CHUNK, count: count(AnomalyCode.NEAR_EMPTY_CHUNK), severity: 'warning' },
      { code: AnomalyCode.NON_URL_SOURCE, count: count(AnomalyCode.NON_URL_SOURCE), severity: 'info' },
      { code: AnomalyCode.DUPLICATE_TITLE, count: count(AnomalyCode.DUPLICATE_TITLE), severity: 'info' }
    ];
  }

  private matchesAnomaly(doc: InspectedDocument, code: AnomalyCode): boolean {
    const chunks = doc.chunks ?? [];
    switch (code) {
      case AnomalyCode.NEAR_EMPTY_CHUNK:
        return chunks.some((c) => c.contentLength < NEAR_EMPTY_LENGTH);
      case AnomalyCode.NON_URL_SOURCE:
        return !!doc.source && !doc.source.startsWith('http');
      case AnomalyCode.DUPLICATE_TITLE:
        return doc.title === DUPLICATE_TITLE;
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2);
  }

  private hexId(rand: () => number): string {
    return Array.from({ length: 8 }, () => Math.floor(rand() * 16).toString(16)).join('');
  }

  private pickIndices(rand: () => number, max: number, count: number): number[] {
    const picked = new Set<number>();
    while (picked.size < count && picked.size < max) {
      picked.add(Math.floor(rand() * max));
    }
    return [...picked];
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
