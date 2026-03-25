import pool from '../../db/pool';
import crypto from 'crypto';

const TAXONOMY: Record<string, string[]> = {
  'equities': ['stock', 'shares', 'equity', 'earnings', 'dividend', 'market cap', 'ipo', 'buyback'],
  'fixed_income': ['bond', 'yield', 'treasury', 'sukuk', 'credit', 'interest rate', 'coupon', 'debt'],
  'crypto': ['bitcoin', 'crypto', 'ethereum', 'blockchain', 'defi', 'web3', 'token', 'nft'],
  'commodities': ['oil', 'gold', 'silver', 'commodity', 'crude', 'opec', 'brent', 'wti', 'copper'],
  'real_estate': ['real estate', 'property', 'reit', 'housing', 'mortgage', 'rental yield'],
  'alternatives': ['private equity', 'hedge fund', 'venture capital', 'private credit', 'alternative'],
  'macro': ['gdp', 'inflation', 'unemployment', 'central bank', 'federal reserve', 'monetary policy', 'fiscal'],
  'esg': ['esg', 'sustainable', 'climate', 'carbon', 'green bond', 'responsible investing'],
  'ai_tech': ['artificial intelligence', 'ai ', 'machine learning', 'semiconductor', 'chip', 'nvidia', 'tech'],
  'gcc_markets': ['gcc', 'gulf', 'saudi', 'uae', 'dubai', 'abu dhabi', 'riyadh', 'tadawul', 'dfm'],
  'regulation': ['regulation', 'compliance', 'sec ', 'cftc', 'law', 'legislation', 'sanction'],
  'wealth_planning': ['estate', 'succession', 'trust', 'inheritance', 'family office', 'wealth transfer'],
};

const SENTIMENT_POSITIVE = ['surge', 'rally', 'gain', 'growth', 'rise', 'bullish', 'outperform', 'strong', 'upgrade', 'boom', 'record high'];
const SENTIMENT_NEGATIVE = ['crash', 'plunge', 'decline', 'fall', 'bearish', 'risk', 'warning', 'downgrade', 'crisis', 'slump', 'recession'];

function classifyTaxonomy(text: string): Record<string, string[]> {
  const lower = text.toLowerCase();
  const result: Record<string, string[]> = {};
  for (const [category, keywords] of Object.entries(TAXONOMY)) {
    const matched = keywords.filter(k => lower.includes(k));
    if (matched.length > 0) {
      result[category] = matched;
    }
  }
  return result;
}

function computeSentiment(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const word of SENTIMENT_POSITIVE) {
    if (lower.includes(word)) score += 0.15;
  }
  for (const word of SENTIMENT_NEGATIVE) {
    if (lower.includes(word)) score -= 0.15;
  }
  return Math.max(-1, Math.min(1, score));
}

function computeImportance(text: string, taxonomyTags: Record<string, string[]>, tickers: string[]): number {
  let score = 0.3;
  const tagCount = Object.keys(taxonomyTags).length;
  score += Math.min(tagCount * 0.1, 0.3);
  score += Math.min(tickers.length * 0.05, 0.2);
  const lower = text.toLowerCase();
  if (lower.includes('breaking') || lower.includes('urgent')) score += 0.2;
  if (lower.includes('exclusive') || lower.includes('first')) score += 0.1;
  return Math.min(1, score);
}

function computeDedupHash(title: string, summary: string): string {
  const normalized = `${title}${summary}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  return crypto.createHash('md5').update(normalized).digest('hex');
}

export async function runEnrichment(): Promise<number> {
  console.log('[EnrichmentWorker] Processing unprocessed articles...');
  try {
    const { rows } = await pool.query(
      `SELECT id, title, summary, tickers FROM raw_articles WHERE is_processed = FALSE ORDER BY ingested_at ASC LIMIT 100`,
    );

    if (rows.length === 0) {
      console.log('[EnrichmentWorker] No unprocessed articles found');
      return 0;
    }

    let enriched = 0;
    for (const row of rows) {
      const text = `${row.title} ${row.summary || ''}`;
      const taxonomyTags = classifyTaxonomy(text);
      const sentimentScore = computeSentiment(text);
      const importanceScore = computeImportance(text, taxonomyTags, row.tickers || []);
      const dedupHash = computeDedupHash(row.title, row.summary || '');

      const { rows: dupeCheck } = await pool.query(
        `SELECT id FROM article_enrichment WHERE dedup_hash = $1 AND article_id != $2`,
        [dedupHash, row.id],
      );
      const isDuplicate = dupeCheck.length > 0;

      await pool.query(
        `INSERT INTO article_enrichment (article_id, tickers, entities, sentiment_score, importance_score, taxonomy_tags, dedup_hash, is_duplicate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (article_id) DO UPDATE SET
           tickers = EXCLUDED.tickers,
           entities = EXCLUDED.entities,
           sentiment_score = EXCLUDED.sentiment_score,
           importance_score = EXCLUDED.importance_score,
           taxonomy_tags = EXCLUDED.taxonomy_tags,
           dedup_hash = EXCLUDED.dedup_hash,
           is_duplicate = EXCLUDED.is_duplicate`,
        [
          row.id,
          row.tickers || [],
          JSON.stringify({}),
          sentimentScore,
          importanceScore,
          JSON.stringify(taxonomyTags),
          dedupHash,
          isDuplicate,
        ],
      );

      await pool.query(`UPDATE raw_articles SET is_processed = TRUE WHERE id = $1`, [row.id]);
      enriched++;
    }

    console.log(`[EnrichmentWorker] Enriched ${enriched} articles`);
    return enriched;
  } catch (err) {
    console.error('[EnrichmentWorker] Fatal error:', (err as Error).message);
    return 0;
  }
}
