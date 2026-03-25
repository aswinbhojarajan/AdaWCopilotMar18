import pool from '../../db/pool';

export async function runFeedMaterializer(): Promise<number> {
  console.log('[FeedMaterializer] Materializing discover feed...');
  try {
    const expiredResult = await pool.query(
      `UPDATE discover_cards SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE RETURNING id`,
    );
    if (expiredResult.rowCount && expiredResult.rowCount > 0) {
      console.log(`[FeedMaterializer] Deactivated ${expiredResult.rowCount} expired cards`);
    }

    const lowConfResult = await pool.query(
      `UPDATE discover_cards SET is_active = FALSE
       WHERE confidence = 'low' AND is_editorial = FALSE AND created_at < NOW() - INTERVAL '6 hours' AND is_active = TRUE
       RETURNING id`,
    );
    if (lowConfResult.rowCount && lowConfResult.rowCount > 0) {
      console.log(`[FeedMaterializer] Deactivated ${lowConfResult.rowCount} low-confidence cards`);
    }

    const { rows: tabCounts } = await pool.query(
      `SELECT tab, COUNT(*) as cnt FROM discover_cards WHERE is_active = TRUE GROUP BY tab`,
    );
    const counts: Record<string, number> = {};
    for (const r of tabCounts) {
      counts[r.tab as string] = Number(r.cnt);
    }

    const forYouCount = (counts['forYou'] || 0) + (counts['both'] || 0);
    const whatsNewCount = (counts['whatsNew'] || 0) + (counts['both'] || 0);

    console.log(`[FeedMaterializer] Active cards — For You: ${forYouCount}, What's New: ${whatsNewCount}`);
    return forYouCount + whatsNewCount;
  } catch (err) {
    console.error('[FeedMaterializer] Fatal error:', (err as Error).message);
    return 0;
  }
}
