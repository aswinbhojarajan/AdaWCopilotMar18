import pool from '../../db/pool';
import { runIngest } from './ingestWorker';
import { runEnrichment } from './enrichmentWorker';
import { runClustering } from './clusteringWorker';
import { runSynthesis } from './synthesisWorker';
import { runAdaView } from './adaViewWorker';
import { runEventCalendar } from './eventCalendarWorker';
import { runMorningBriefing } from './morningBriefingWorker';
import { runMilestoneDetection } from './milestoneWorker';
import { runEditorialContent } from './editorialContentWorker';
import { runExpiryEnforcement } from './expiryWorker';
import { runFeedMaterializer, runFeedMaterializerForUser } from './feedMaterializer';
import { computeUserProfileGaps } from './userProfileEnricher';

const INTERVAL_DEFAULTS: Record<string, number> = {
  ingest: 10,
  cluster: 15,
  materialize: 60,
  editorial: 1440,
  expiry: 240,
  morning: 360,
};

const INTERVAL_ENV_KEYS: Record<string, string> = {
  ingest: 'PIPELINE_INGEST_INTERVAL_MIN',
  cluster: 'PIPELINE_CLUSTER_INTERVAL_MIN',
  materialize: 'PIPELINE_MATERIALIZE_INTERVAL_MIN',
  editorial: 'PIPELINE_EDITORIAL_INTERVAL_MIN',
  expiry: 'PIPELINE_EXPIRY_INTERVAL_MIN',
  morning: 'PIPELINE_MORNING_INTERVAL_MIN',
};

function resolveIntervalMin(job: string): number {
  const envKey = INTERVAL_ENV_KEYS[job];
  const envVal = envKey ? process.env[envKey] : undefined;
  if (envVal && /^\d+$/.test(envVal.trim())) {
    const parsed = parseInt(envVal.trim(), 10);
    if (parsed > 0) return parsed;
  }
  return INTERVAL_DEFAULTS[job] ?? 60;
}

interface ResolvedIntervals {
  ingest: number;
  cluster: number;
  materialize: number;
  editorial: number;
  expiry: number;
  morning: number;
}

function resolveAllIntervals(): ResolvedIntervals {
  return {
    ingest: resolveIntervalMin('ingest'),
    cluster: resolveIntervalMin('cluster'),
    materialize: resolveIntervalMin('materialize'),
    editorial: resolveIntervalMin('editorial'),
    expiry: resolveIntervalMin('expiry'),
    morning: resolveIntervalMin('morning'),
  };
}

let resolvedIntervals: ResolvedIntervals = resolveAllIntervals();

let ingestTimer: ReturnType<typeof setInterval> | null = null;
let clusterTimer: ReturnType<typeof setInterval> | null = null;
let materializeTimer: ReturnType<typeof setInterval> | null = null;
let editorialTimer: ReturnType<typeof setInterval> | null = null;
let expiryTimer: ReturnType<typeof setInterval> | null = null;
let morningTimer: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let pipelineLock = false;
let ingestLock = false;
let clusterLock = false;
let editorialLock = false;
let lastRunTimes: Record<string, Date | null> = {
  ingest: null,
  enrichment: null,
  clustering: null,
  synthesis: null,
  materialization: null,
  ada_view: null,
  editorial_content: null,
  event_calendar: null,
  morning_briefing: null,
  milestone: null,
  expiry: null,
};

async function runFullPipeline(): Promise<void> {
  if (pipelineLock) {
    console.log('[DiscoverPipeline] Pipeline already running, skipping');
    return;
  }
  pipelineLock = true;
  console.log('[DiscoverPipeline] Running full pipeline cycle...');
  try {
    await runIngest();
    lastRunTimes.ingest = new Date();

    await runEnrichment();
    lastRunTimes.enrichment = new Date();

    await runClustering();
    lastRunTimes.clustering = new Date();

    await runSynthesis();
    lastRunTimes.synthesis = new Date();

    await runAdaView();
    lastRunTimes.ada_view = new Date();

    await runEventCalendar();
    lastRunTimes.event_calendar = new Date();

    await runEditorialContent();
    lastRunTimes.editorial_content = new Date();

    await runMorningBriefing();
    lastRunTimes.morning_briefing = new Date();

    await runMilestoneDetection();
    lastRunTimes.milestone = new Date();

    await runFeedMaterializer();
    lastRunTimes.materialization = new Date();

    console.log('[DiscoverPipeline] Full pipeline cycle complete');
  } catch (err) {
    console.error('[DiscoverPipeline] Pipeline cycle error:', (err as Error).message);
  } finally {
    pipelineLock = false;
  }
}

export async function initDiscoverPipeline(): Promise<void> {
  if (isRunning) {
    console.log('[DiscoverPipeline] Already running, skipping init');
    return;
  }

  console.log('[DiscoverPipeline] Initializing...');
  isRunning = true;
  resolvedIntervals = resolveAllIntervals();

  setTimeout(async () => {
    await migrateCardTypeConstraint();

    try {
      await computeUserProfileGaps();
    } catch (err) {
      console.warn('[DiscoverPipeline] User profile enrichment error:', (err as Error).message);
    }

    try {
      const { rows } = await pool.query(`SELECT COUNT(*) as cnt FROM discover_cards WHERE is_active = TRUE AND is_editorial = FALSE`);
      const hasLiveCards = Number(rows[0]?.cnt) > 0;
      if (!hasLiveCards) {
        console.log('[DiscoverPipeline] No live cards found, running initial pipeline...');
        await runFullPipeline();
      } else {
        console.log(`[DiscoverPipeline] ${rows[0]?.cnt} live cards already exist, skipping initial pipeline run`);
        try { await runAdaView(); lastRunTimes.ada_view = new Date(); } catch (e) { console.warn('[DiscoverPipeline] Ada View error:', (e as Error).message); }
        try { await runEditorialContent(); lastRunTimes.editorial_content = new Date(); } catch (e) { console.warn('[DiscoverPipeline] Editorial Content error:', (e as Error).message); }
        try { await runEventCalendar(); lastRunTimes.event_calendar = new Date(); } catch (e) { console.warn('[DiscoverPipeline] Event Calendar error:', (e as Error).message); }
        try { await runMorningBriefing(); lastRunTimes.morning_briefing = new Date(); } catch (e) { console.warn('[DiscoverPipeline] Morning Briefing error:', (e as Error).message); }
        try { await runMilestoneDetection(); lastRunTimes.milestone = new Date(); } catch (e) { console.warn('[DiscoverPipeline] Milestone error:', (e as Error).message); }
        try { await runFeedMaterializer(); lastRunTimes.materialization = new Date(); } catch (e) { console.warn('[DiscoverPipeline] Materialize error:', (e as Error).message); }
      }
    } catch (err) {
      console.error('[DiscoverPipeline] Initial run failed:', (err as Error).message);
    }
  }, 5000);

  ingestTimer = setInterval(async () => {
    if (ingestLock) return;
    ingestLock = true;
    try {
      await runIngest();
      lastRunTimes.ingest = new Date();
      await runEnrichment();
      lastRunTimes.enrichment = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Ingest cycle error:', (err as Error).message);
    } finally {
      ingestLock = false;
    }
  }, resolvedIntervals.ingest * 60 * 1000);

  clusterTimer = setInterval(async () => {
    if (clusterLock) return;
    clusterLock = true;
    try {
      await runClustering();
      lastRunTimes.clustering = new Date();
      await runSynthesis();
      lastRunTimes.synthesis = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Cluster cycle error:', (err as Error).message);
    } finally {
      clusterLock = false;
    }
  }, resolvedIntervals.cluster * 60 * 1000);

  materializeTimer = setInterval(async () => {
    try {
      await runFeedMaterializer();
      lastRunTimes.materialization = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Materialize cycle error:', (err as Error).message);
    }
  }, resolvedIntervals.materialize * 60 * 1000);

  editorialTimer = setInterval(async () => {
    if (editorialLock) return;
    editorialLock = true;
    try {
      await runAdaView();
      lastRunTimes.ada_view = new Date();
      await runEditorialContent();
      lastRunTimes.editorial_content = new Date();
      await runEventCalendar();
      lastRunTimes.event_calendar = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Editorial cycle error:', (err as Error).message);
    } finally {
      editorialLock = false;
    }
  }, resolvedIntervals.editorial * 60 * 1000);

  expiryTimer = setInterval(async () => {
    try {
      await runExpiryEnforcement();
      lastRunTimes.expiry = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Expiry cycle error:', (err as Error).message);
    }
  }, resolvedIntervals.expiry * 60 * 1000);

  morningTimer = setInterval(async () => {
    try {
      await runMorningBriefing();
      lastRunTimes.morning_briefing = new Date();
      await runMilestoneDetection();
      lastRunTimes.milestone = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Morning/Milestone cycle error:', (err as Error).message);
    }
  }, resolvedIntervals.morning * 60 * 1000);

  const fmtInterval = (job: string, min: number) => {
    const def = INTERVAL_DEFAULTS[job];
    const label = min >= 60 ? `${min / 60}hr` : `${min}min`;
    return def !== min ? `${label} (override)` : label;
  };
  console.log(`[DiscoverPipeline] Scheduled — Ingest: ${fmtInterval('ingest', resolvedIntervals.ingest)}, Cluster+Synth: ${fmtInterval('cluster', resolvedIntervals.cluster)}, Materialize: ${fmtInterval('materialize', resolvedIntervals.materialize)}, Editorial: ${fmtInterval('editorial', resolvedIntervals.editorial)}, Expiry: ${fmtInterval('expiry', resolvedIntervals.expiry)}, Morning: ${fmtInterval('morning', resolvedIntervals.morning)}`);
}

async function migrateCardTypeConstraint(): Promise<void> {
  try {
    await pool.query(`
      ALTER TABLE discover_cards DROP CONSTRAINT IF EXISTS discover_cards_card_type_check;
      ALTER TABLE discover_cards ADD CONSTRAINT discover_cards_card_type_check
        CHECK (card_type IN (
          'portfolio_impact', 'trend_brief', 'market_pulse',
          'explainer', 'wealth_planning', 'allocation_gap',
          'event_calendar', 'ada_view', 'product_opportunity',
          'morning_briefing', 'milestone'
        ));
    `);
  } catch (err) {
    console.warn('[DiscoverPipeline] Constraint migration skipped:', (err as Error).message);
  }
}

export async function getDiscoverPipelineHealth(): Promise<{
  isRunning: boolean;
  configuredIntervals: {
    ingest: number;
    cluster: number;
    materialize: number;
    editorial: number;
    expiry: number;
    morning: number;
  };
  lastRunTimes: Record<string, string | null>;
  pipelineLag: Record<string, number | null>;
  cardStats: {
    total_active: number;
    by_type: Record<string, number>;
    by_tab: Record<string, number>;
    avg_source_count: number;
    confidence_distribution: Record<string, number>;
    oldest_active_hours: number;
    newest_active_hours: number;
  } | null;
  feedFreshness: {
    total_user_feeds: number;
    median_age_hours: number;
    oldest_feed_hours: number;
  } | null;
  articleStats: { total: number; last_24h: number } | null;
  clusterStats: { total: number; unsynthesized: number } | null;
}> {
  let cardStats = null;
  let articleStats = null;
  let clusterStats = null;

  try {
    const { rows: typeRows } = await pool.query(
      `SELECT card_type, COUNT(*) as cnt FROM discover_cards WHERE is_active = TRUE GROUP BY card_type`,
    );
    const { rows: tabRows } = await pool.query(
      `SELECT tab, COUNT(*) as cnt FROM discover_cards WHERE is_active = TRUE GROUP BY tab`,
    );
    const { rows: confRows } = await pool.query(
      `SELECT confidence, COUNT(*) as cnt FROM discover_cards WHERE is_active = TRUE GROUP BY confidence`,
    );
    const { rows: aggRows } = await pool.query(
      `SELECT COUNT(*) as total, COALESCE(AVG(source_count), 0) as avg_src,
              EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 3600 as newest_h,
              EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600 as oldest_h
       FROM discover_cards WHERE is_active = TRUE`,
    );

    const byType: Record<string, number> = {};
    for (const r of typeRows) byType[r.card_type] = Number(r.cnt);
    const byTab: Record<string, number> = {};
    for (const r of tabRows) byTab[r.tab] = Number(r.cnt);
    const confDist: Record<string, number> = {};
    for (const r of confRows) confDist[r.confidence] = Number(r.cnt);

    const agg = aggRows[0];
    cardStats = {
      total_active: Number(agg?.total) || 0,
      by_type: byType,
      by_tab: byTab,
      avg_source_count: Math.round((Number(agg?.avg_src) || 0) * 10) / 10,
      confidence_distribution: confDist,
      oldest_active_hours: Math.round((Number(agg?.oldest_h) || 0) * 10) / 10,
      newest_active_hours: Math.round((Number(agg?.newest_h) || 0) * 10) / 10,
    };
  } catch {
  }

  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(*) FILTER (WHERE published_at > NOW() - INTERVAL '24 hours') as last_24h
       FROM raw_articles`,
    );
    articleStats = { total: Number(rows[0]?.total) || 0, last_24h: Number(rows[0]?.last_24h) || 0 };
  } catch {
  }

  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as total,
              COUNT(*) FILTER (WHERE is_synthesized = FALSE) as unsynthesized
       FROM article_clusters`,
    );
    clusterStats = { total: Number(rows[0]?.total) || 0, unsynthesized: Number(rows[0]?.unsynthesized) || 0 };
  } catch {
  }

  let feedFreshness = null;
  try {
    const { rows: feedRows } = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as total_feeds,
              COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600), 0) as median_age_h,
              COALESCE(MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600), 0) as oldest_feed_h
       FROM user_discover_feed`,
    );
    const ff = feedRows[0];
    feedFreshness = {
      total_user_feeds: Number(ff?.total_feeds) || 0,
      median_age_hours: Math.round((Number(ff?.median_age_h) || 0) * 10) / 10,
      oldest_feed_hours: Math.round((Number(ff?.oldest_feed_h) || 0) * 10) / 10,
    };
  } catch {
  }

  const now = Date.now();
  const pipelineLag: Record<string, number | null> = {};
  for (const [stage, lastRun] of Object.entries(lastRunTimes)) {
    if (lastRun) {
      pipelineLag[stage] = Math.round((now - lastRun.getTime()) / 60000);
    } else {
      pipelineLag[stage] = null;
    }
  }

  return {
    isRunning,
    configuredIntervals: { ...resolvedIntervals },
    lastRunTimes: Object.fromEntries(
      Object.entries(lastRunTimes).map(([k, v]) => [k, v?.toISOString() ?? null]),
    ),
    pipelineLag,
    cardStats,
    feedFreshness,
    articleStats,
    clusterStats,
  };
}

export async function triggerEventDrivenRefresh(userId?: string): Promise<void> {
  console.log(`[DiscoverPipeline] Event-driven refresh triggered${userId ? ` for user ${userId}` : ''}`);
  try {
    if (userId) {
      await runFeedMaterializerForUser(userId);
    } else {
      await runFeedMaterializer();
    }
    lastRunTimes.materialization = new Date();
  } catch (err) {
    console.error('[DiscoverPipeline] Event-driven refresh error:', (err as Error).message);
  }
}

export function stopDiscoverPipeline(): void {
  if (ingestTimer) clearInterval(ingestTimer);
  if (clusterTimer) clearInterval(clusterTimer);
  if (materializeTimer) clearInterval(materializeTimer);
  if (editorialTimer) clearInterval(editorialTimer);
  if (expiryTimer) clearInterval(expiryTimer);
  if (morningTimer) clearInterval(morningTimer);
  ingestTimer = null;
  clusterTimer = null;
  materializeTimer = null;
  editorialTimer = null;
  expiryTimer = null;
  morningTimer = null;
  isRunning = false;
  console.log('[DiscoverPipeline] Stopped');
}
