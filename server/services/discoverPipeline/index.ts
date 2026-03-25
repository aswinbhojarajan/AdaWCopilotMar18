import pool from '../../db/pool';
import { runIngest } from './ingestWorker';
import { runEnrichment } from './enrichmentWorker';
import { runClustering } from './clusteringWorker';
import { runSynthesis } from './synthesisWorker';
import { runAdaView } from './adaViewWorker';
import { runEventCalendar } from './eventCalendarWorker';
import { runMorningBriefing } from './morningBriefingWorker';
import { runMilestoneDetection } from './milestoneWorker';
import { runExpiryEnforcement } from './expiryWorker';
import { runFeedMaterializer } from './feedMaterializer';
import { computeUserProfileGaps } from './userProfileEnricher';

const INGEST_INTERVAL_MS = 10 * 60 * 1000;
const CLUSTER_INTERVAL_MS = 15 * 60 * 1000;
const MATERIALIZE_INTERVAL_MS = 60 * 60 * 1000;
const EDITORIAL_INTERVAL_MS = 6 * 60 * 60 * 1000;
const EXPIRY_INTERVAL_MS = 4 * 60 * 60 * 1000;
const MORNING_INTERVAL_MS = 6 * 60 * 60 * 1000;

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
        await runAdaView().catch(e => console.warn('[DiscoverPipeline] Ada View error:', (e as Error).message));
        await runEventCalendar().catch(e => console.warn('[DiscoverPipeline] Event Calendar error:', (e as Error).message));
        await runMorningBriefing().catch(e => console.warn('[DiscoverPipeline] Morning Briefing error:', (e as Error).message));
        await runMilestoneDetection().catch(e => console.warn('[DiscoverPipeline] Milestone error:', (e as Error).message));
        await runFeedMaterializer();
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
  }, INGEST_INTERVAL_MS);

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
  }, CLUSTER_INTERVAL_MS);

  materializeTimer = setInterval(async () => {
    try {
      await runFeedMaterializer();
      lastRunTimes.materialization = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Materialize cycle error:', (err as Error).message);
    }
  }, MATERIALIZE_INTERVAL_MS);

  editorialTimer = setInterval(async () => {
    if (editorialLock) return;
    editorialLock = true;
    try {
      await runAdaView();
      lastRunTimes.ada_view = new Date();
      await runEventCalendar();
      lastRunTimes.event_calendar = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Editorial cycle error:', (err as Error).message);
    } finally {
      editorialLock = false;
    }
  }, EDITORIAL_INTERVAL_MS);

  expiryTimer = setInterval(async () => {
    try {
      await runExpiryEnforcement();
      lastRunTimes.expiry = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Expiry cycle error:', (err as Error).message);
    }
  }, EXPIRY_INTERVAL_MS);

  morningTimer = setInterval(async () => {
    try {
      await runMorningBriefing();
      lastRunTimes.morning_briefing = new Date();
      await runMilestoneDetection();
      lastRunTimes.milestone = new Date();
    } catch (err) {
      console.error('[DiscoverPipeline] Morning/Milestone cycle error:', (err as Error).message);
    }
  }, MORNING_INTERVAL_MS);

  console.log('[DiscoverPipeline] Scheduled — Ingest: 10min, Cluster+Synth: 15min, Materialize: 60min, Editorial: 6hr, Expiry: 4hr, Morning: 6hr');
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
  lastRunTimes: Record<string, string | null>;
  cardStats: {
    total_active: number;
    by_type: Record<string, number>;
    by_tab: Record<string, number>;
    avg_source_count: number;
    confidence_distribution: Record<string, number>;
    oldest_active_hours: number;
    newest_active_hours: number;
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

  return {
    isRunning,
    lastRunTimes: Object.fromEntries(
      Object.entries(lastRunTimes).map(([k, v]) => [k, v?.toISOString() ?? null]),
    ),
    cardStats,
    articleStats,
    clusterStats,
  };
}

export async function triggerEventDrivenRefresh(): Promise<void> {
  console.log('[DiscoverPipeline] Event-driven refresh triggered');
  try {
    await runFeedMaterializer();
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
