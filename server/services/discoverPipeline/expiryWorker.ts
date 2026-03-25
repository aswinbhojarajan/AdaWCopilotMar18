import pool from '../../db/pool';

const EXPIRY_RULES: Record<string, { minHours: number; maxHours: number }> = {
  market_pulse: { minHours: 6, maxHours: 24 },
  trend_brief: { minHours: 24, maxHours: 48 },
  portfolio_impact: { minHours: 24, maxHours: 72 },
  allocation_gap: { minHours: 72, maxHours: 168 },
  explainer: { minHours: 168, maxHours: 720 },
  wealth_planning: { minHours: 168, maxHours: 720 },
  ada_view: { minHours: 120, maxHours: 168 },
  event_calendar: { minHours: 168, maxHours: 192 },
  morning_briefing: { minHours: 14, maxHours: 18 },
  milestone: { minHours: 48, maxHours: 72 },
  product_opportunity: { minHours: 168, maxHours: 720 },
};

const ARCHIVE_ARTICLES_OLDER_THAN_DAYS = 14;
const ARCHIVE_CLUSTERS_OLDER_THAN_DAYS = 14;
const COMPACT_INTERACTIONS_OLDER_THAN_DAYS = 30;

export async function runExpiryEnforcement(): Promise<{
  expiredCards: number;
  archivedArticles: number;
  archivedClusters: number;
  compactedInteractions: number;
}> {
  console.log('[ExpiryWorker] Running expiry enforcement...');
  const result = {
    expiredCards: 0,
    archivedArticles: 0,
    archivedClusters: 0,
    compactedInteractions: 0,
  };

  try {
    const { rows: expiredByDate } = await pool.query(
      `UPDATE discover_cards SET is_active = FALSE, updated_at = NOW()
       WHERE is_active = TRUE AND expires_at IS NOT NULL AND expires_at < NOW()
       RETURNING id, card_type`,
    );
    result.expiredCards += expiredByDate.length;

    for (const [cardType, rules] of Object.entries(EXPIRY_RULES)) {
      const { rows: typeExpired } = await pool.query(
        `UPDATE discover_cards SET is_active = FALSE, updated_at = NOW()
         WHERE is_active = TRUE
           AND card_type = $1
           AND is_editorial = FALSE
           AND created_at < NOW() - INTERVAL '1 hour' * $2
         RETURNING id`,
        [cardType, rules.maxHours],
      );
      result.expiredCards += typeExpired.length;
      if (typeExpired.length > 0) {
        console.log(`[ExpiryWorker] Expired ${typeExpired.length} ${cardType} cards (max age: ${rules.maxHours}h)`);
      }
    }
  } catch (err) {
    console.warn(`[ExpiryWorker] Card expiry error: ${(err as Error).message}`);
  }

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM raw_articles
       WHERE published_at < NOW() - INTERVAL '1 day' * $1
         AND id NOT IN (SELECT unnest(article_ids) FROM article_clusters WHERE is_synthesized = TRUE)`,
      [ARCHIVE_ARTICLES_OLDER_THAN_DAYS],
    );
    result.archivedArticles = rowCount || 0;
    if (result.archivedArticles > 0) {
      console.log(`[ExpiryWorker] Archived ${result.archivedArticles} old articles`);
    }
  } catch (err) {
    console.warn(`[ExpiryWorker] Article archive error: ${(err as Error).message}`);
  }

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM article_clusters
       WHERE created_at < NOW() - INTERVAL '1 day' * $1
         AND is_synthesized = TRUE`,
      [ARCHIVE_CLUSTERS_OLDER_THAN_DAYS],
    );
    result.archivedClusters = rowCount || 0;
    if (result.archivedClusters > 0) {
      console.log(`[ExpiryWorker] Archived ${result.archivedClusters} old clusters`);
    }
  } catch (err) {
    console.warn(`[ExpiryWorker] Cluster archive error: ${(err as Error).message}`);
  }

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM user_content_interactions
       WHERE created_at < NOW() - INTERVAL '1 day' * $1
         AND action IN ('impression', 'view')`,
      [COMPACT_INTERACTIONS_OLDER_THAN_DAYS],
    );
    result.compactedInteractions = rowCount || 0;
    if (result.compactedInteractions > 0) {
      console.log(`[ExpiryWorker] Compacted ${result.compactedInteractions} old interaction logs`);
    }
  } catch (err) {
    console.warn(`[ExpiryWorker] Interaction compact error: ${(err as Error).message}`);
  }

  console.log(`[ExpiryWorker] Done — expired: ${result.expiredCards} cards, archived: ${result.archivedArticles} articles + ${result.archivedClusters} clusters, compacted: ${result.compactedInteractions} interactions`);
  return result;
}
