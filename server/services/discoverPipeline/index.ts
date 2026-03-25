import { runIngest } from './ingestWorker';
import { runEnrichment } from './enrichmentWorker';
import { runClustering } from './clusteringWorker';
import { runSynthesis } from './synthesisWorker';
import { runFeedMaterializer } from './feedMaterializer';

const INGEST_INTERVAL_MS = 10 * 60 * 1000;
const CLUSTER_INTERVAL_MS = 15 * 60 * 1000;
const MATERIALIZE_INTERVAL_MS = 60 * 60 * 1000;

let ingestTimer: ReturnType<typeof setInterval> | null = null;
let clusterTimer: ReturnType<typeof setInterval> | null = null;
let materializeTimer: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let pipelineLock = false;
let ingestLock = false;
let clusterLock = false;
let lastRunTimes: Record<string, Date | null> = {
  ingest: null,
  enrichment: null,
  clustering: null,
  synthesis: null,
  materialization: null,
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
    try {
      await runFullPipeline();
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

  console.log('[DiscoverPipeline] Scheduled — Ingest: 10min, Cluster+Synth: 15min, Materialize: 60min');
}

export function getDiscoverPipelineHealth(): {
  isRunning: boolean;
  lastRunTimes: Record<string, string | null>;
} {
  return {
    isRunning,
    lastRunTimes: Object.fromEntries(
      Object.entries(lastRunTimes).map(([k, v]) => [k, v?.toISOString() ?? null]),
    ),
  };
}

export function stopDiscoverPipeline(): void {
  if (ingestTimer) clearInterval(ingestTimer);
  if (clusterTimer) clearInterval(clusterTimer);
  if (materializeTimer) clearInterval(materializeTimer);
  ingestTimer = null;
  clusterTimer = null;
  materializeTimer = null;
  isRunning = false;
  console.log('[DiscoverPipeline] Stopped');
}
