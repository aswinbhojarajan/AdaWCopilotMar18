import pool from '../../db/pool';

interface CardRow {
  id: string;
  card_type: string;
  tab: string;
  confidence: string;
  source_count: number;
  relevance_tags: string[];
  taxonomy_tags: Record<string, unknown>;
  is_editorial: boolean;
  created_at: Date;
}

const MAX_PER_ASSET_CLASS = 3;
const MAX_PER_THEME = 2;
const MIN_GCC_CARDS = 1;
const CARD_TYPE_DIVERSITY_MIN = 3;

function computeCardScore(card: CardRow): number {
  let score = 0;

  if (card.confidence === 'high') score += 30;
  else if (card.confidence === 'medium') score += 15;
  else score += 5;

  score += Math.min(card.source_count * 2, 20);

  const ageHours = (Date.now() - card.created_at.getTime()) / 3600000;
  if (ageHours < 1) score += 25;
  else if (ageHours < 6) score += 20;
  else if (ageHours < 24) score += 10;
  else if (ageHours < 48) score += 5;

  if (card.is_editorial) score += 10;

  const tagCount = (card.relevance_tags || []).length;
  score += Math.min(tagCount * 3, 12);

  return score;
}

function hasGCCRelevance(card: CardRow): boolean {
  const tags = card.taxonomy_tags as { geographies?: string[] } | null;
  const geos = tags?.geographies || [];
  return geos.some(g => ['UAE', 'Saudi Arabia', 'GCC', 'Bahrain', 'Kuwait', 'Oman', 'Qatar'].includes(g));
}

function getPrimaryAssetClass(card: CardRow): string {
  const tags = card.taxonomy_tags as { asset_classes?: string[] } | null;
  return tags?.asset_classes?.[0] || 'General';
}

function getPrimaryTheme(card: CardRow): string {
  const tags = card.taxonomy_tags as { themes?: string[] } | null;
  return tags?.themes?.[0] || 'general';
}

function applyGuardrails(cards: CardRow[]): CardRow[] {
  const scored = cards.map(c => ({ card: c, score: computeCardScore(c) }));
  scored.sort((a, b) => b.score - a.score);

  const result: CardRow[] = [];
  const assetClassCounts: Record<string, number> = {};
  const themeCounts: Record<string, number> = {};
  const cardTypesIncluded = new Set<string>();
  let gccCount = 0;

  for (const { card } of scored) {
    const assetClass = getPrimaryAssetClass(card);
    const theme = getPrimaryTheme(card);

    if ((assetClassCounts[assetClass] || 0) >= MAX_PER_ASSET_CLASS) continue;
    if ((themeCounts[theme] || 0) >= MAX_PER_THEME && result.length > CARD_TYPE_DIVERSITY_MIN) continue;

    result.push(card);
    assetClassCounts[assetClass] = (assetClassCounts[assetClass] || 0) + 1;
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    cardTypesIncluded.add(card.card_type);
    if (hasGCCRelevance(card)) gccCount++;
  }

  if (gccCount < MIN_GCC_CARDS) {
    const gccCards = scored.filter(s => hasGCCRelevance(s.card) && !result.includes(s.card));
    for (const { card } of gccCards.slice(0, MIN_GCC_CARDS - gccCount)) {
      result.push(card);
    }
  }

  return result;
}

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

    const { rows: allCards } = await pool.query(
      `SELECT id, card_type, tab, confidence, source_count, relevance_tags, taxonomy_tags, is_editorial, created_at
       FROM discover_cards WHERE is_active = TRUE ORDER BY created_at DESC`,
    );

    const forYouCards = allCards.filter((c: CardRow) => c.tab === 'forYou' || c.tab === 'both');
    const whatsNewCards = allCards.filter((c: CardRow) => c.tab === 'whatsNew' || c.tab === 'both');

    const guardrailedForYou = applyGuardrails(forYouCards as CardRow[]);
    const guardrailedWhatsNew = applyGuardrails(whatsNewCards as CardRow[]);

    const activeIds = new Set([
      ...guardrailedForYou.map(c => c.id),
      ...guardrailedWhatsNew.map(c => c.id),
    ]);

    const allActive = allCards as CardRow[];
    const toDeactivate = allActive
      .filter(c => !activeIds.has(c.id) && !c.is_editorial)
      .filter(c => {
        const ageHours = (Date.now() - new Date(c.created_at).getTime()) / 3600000;
        return ageHours > 72;
      });

    if (toDeactivate.length > 0) {
      const idsToDeactivate = toDeactivate.map(c => c.id);
      await pool.query(
        `UPDATE discover_cards SET is_active = FALSE WHERE id = ANY($1)`,
        [idsToDeactivate],
      );
      console.log(`[FeedMaterializer] Pruned ${toDeactivate.length} old non-editorial cards`);
    }

    const forYouTypes = [...new Set(guardrailedForYou.map(c => c.card_type))];
    const whatsNewTypes = [...new Set(guardrailedWhatsNew.map(c => c.card_type))];

    console.log(`[FeedMaterializer] Active cards — For You: ${guardrailedForYou.length} (types: ${forYouTypes.join(',')}), What's New: ${guardrailedWhatsNew.length} (types: ${whatsNewTypes.join(',')})`);
    return guardrailedForYou.length + guardrailedWhatsNew.length;
  } catch (err) {
    console.error('[FeedMaterializer] Fatal error:', (err as Error).message);
    return 0;
  }
}
