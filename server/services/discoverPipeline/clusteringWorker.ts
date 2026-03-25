import pool from '../../db/pool';
import crypto from 'crypto';

interface EnrichedArticle {
  article_id: number;
  title: string;
  summary: string;
  tickers: string[];
  taxonomy_tags: Record<string, string[]>;
  importance_score: number;
  regions: string[];
  published_at: Date;
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function getFeatureSet(article: EnrichedArticle): Set<string> {
  const features = new Set<string>();
  for (const ticker of (article.tickers || [])) {
    features.add(`ticker:${ticker}`);
  }
  for (const [category, keywords] of Object.entries(article.taxonomy_tags || {})) {
    features.add(`tax:${category}`);
    for (const kw of keywords) {
      features.add(`kw:${kw}`);
    }
  }
  for (const region of (article.regions || [])) {
    features.add(`region:${region}`);
  }
  const words = (article.title || '').toLowerCase().split(/\s+/);
  for (const word of words) {
    if (word.length > 4) features.add(`w:${word}`);
  }
  return features;
}

function inferTheme(articles: EnrichedArticle[]): string {
  const tagCounts: Record<string, number> = {};
  for (const a of articles) {
    for (const tag of Object.keys(a.taxonomy_tags || {})) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'general';
}

function inferPrimaryAssetClass(articles: EnrichedArticle[]): string {
  const assetClasses = ['equities', 'fixed_income', 'crypto', 'commodities', 'real_estate', 'alternatives'];
  const counts: Record<string, number> = {};
  for (const a of articles) {
    for (const tag of Object.keys(a.taxonomy_tags || {})) {
      if (assetClasses.includes(tag)) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'equities';
}

function inferPrimaryGeography(articles: EnrichedArticle[]): string {
  const counts: Record<string, number> = {};
  for (const a of articles) {
    for (const region of (a.regions || [])) {
      counts[region] = (counts[region] || 0) + 1;
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'Global';
}

const SIMILARITY_THRESHOLD = 0.25;
const MIN_CLUSTER_SIZE = 2;
const MAX_ARTICLE_AGE_HOURS = 48;

export async function runClustering(): Promise<number> {
  console.log('[ClusteringWorker] Building article clusters...');
  try {
    const cutoff = new Date(Date.now() - MAX_ARTICLE_AGE_HOURS * 3600 * 1000);
    const { rows } = await pool.query(
      `SELECT ra.id AS article_id, ra.title, ra.summary, ra.tickers, ra.regions, ra.published_at,
              ae.taxonomy_tags, ae.importance_score
       FROM raw_articles ra
       JOIN article_enrichment ae ON ae.article_id = ra.id
       WHERE ae.is_duplicate = FALSE AND ra.published_at > $1
       ORDER BY ae.importance_score DESC
       LIMIT 200`,
      [cutoff],
    );

    if (rows.length < MIN_CLUSTER_SIZE) {
      console.log('[ClusteringWorker] Not enough articles to cluster');
      return 0;
    }

    const articles: EnrichedArticle[] = rows.map((r: Record<string, unknown>) => ({
      article_id: r.article_id as number,
      title: r.title as string,
      summary: r.summary as string,
      tickers: r.tickers as string[],
      taxonomy_tags: (typeof r.taxonomy_tags === 'string' ? JSON.parse(r.taxonomy_tags) : r.taxonomy_tags || {}) as Record<string, string[]>,
      importance_score: Number(r.importance_score),
      regions: r.regions as string[],
      published_at: new Date(r.published_at as string),
    }));

    const featureSets = articles.map(a => getFeatureSet(a));
    const assigned = new Set<number>();
    const clusters: EnrichedArticle[][] = [];

    for (let i = 0; i < articles.length; i++) {
      if (assigned.has(i)) continue;
      const cluster: EnrichedArticle[] = [articles[i]];
      assigned.add(i);

      for (let j = i + 1; j < articles.length; j++) {
        if (assigned.has(j)) continue;
        const sim = jaccardSimilarity(featureSets[i], featureSets[j]);
        if (sim >= SIMILARITY_THRESHOLD) {
          cluster.push(articles[j]);
          assigned.add(j);
        }
      }

      if (cluster.length >= MIN_CLUSTER_SIZE) {
        clusters.push(cluster);
      }
    }

    await pool.query(`DELETE FROM article_clusters WHERE created_at < NOW() - INTERVAL '72 hours' AND is_synthesized = TRUE`);

    let created = 0;
    for (const cluster of clusters) {
      const theme = inferTheme(cluster);
      const articleIds = cluster.map(a => a.article_id).sort((a, b) => a - b);
      const fingerprint = crypto.createHash('md5').update(articleIds.join(',')).digest('hex');
      const aggregateImportance = cluster.reduce((sum, a) => sum + a.importance_score, 0) / cluster.length;
      const primaryAssetClass = inferPrimaryAssetClass(cluster);
      const primaryGeography = inferPrimaryGeography(cluster);
      const primaryThemes = [...new Set(cluster.flatMap(a => Object.keys(a.taxonomy_tags || {})))].slice(0, 5);

      const headlines = cluster.map(a => a.title);
      const narrativeHeadline = headlines[0];

      const { rowCount } = await pool.query(
        `INSERT INTO article_clusters (theme, fingerprint, article_ids, article_count, narrative_headline, aggregate_importance, primary_asset_class, primary_geography, primary_themes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (fingerprint) DO NOTHING`,
        [theme, fingerprint, articleIds, cluster.length, narrativeHeadline, aggregateImportance, primaryAssetClass, primaryGeography, primaryThemes],
      );
      if (rowCount && rowCount > 0) created++;
    }

    console.log(`[ClusteringWorker] Created ${created} clusters from ${articles.length} articles`);
    return created;
  } catch (err) {
    console.error('[ClusteringWorker] Fatal error:', (err as Error).message);
    return 0;
  }
}
