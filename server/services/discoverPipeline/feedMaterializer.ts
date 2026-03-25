import pool from '../../db/pool';
import { resilientCompletion } from '../openaiClient';

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

interface UserProfileForScoring {
  user_id: string;
  allocation_gaps: Record<string, number>;
  top_asset_classes: string[];
  risk_tolerance: string;
  interests: string[];
  geo_focus: string;
  segment_id: string | null;
  segment_weights: ScoringWeights | null;
}

interface ScoringWeights {
  portfolio_relevance: number;
  allocation_gap: number;
  suitability: number;
  geo: number;
  importance: number;
  freshness: number;
  novelty: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  portfolio_relevance: 0.30,
  allocation_gap: 0.20,
  suitability: 0.15,
  geo: 0.10,
  importance: 0.10,
  freshness: 0.10,
  novelty: 0.05,
};

const MAX_PER_ASSET_CLASS = 2;
const MAX_PER_THEME_IN_TOP5 = 1;
const MIN_GCC_CARDS = 1;
const FOR_YOU_COUNT = { min: 5, max: 7 };
const WHATS_NEW_COUNT = { min: 6, max: 8 };
const PERSONALIZATION_OVERLAY_TOP_N = 3;

function computeCardScore(card: CardRow, userProfile?: UserProfileForScoring | null): number {
  if (!userProfile) {
    return computeBasicScore(card);
  }
  const weights = userProfile.segment_weights || DEFAULT_WEIGHTS;
  return computeWeightedScore(card, userProfile, weights);
}

function computeBasicScore(card: CardRow): number {
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

function computeWeightedScore(card: CardRow, profile: UserProfileForScoring, weights: ScoringWeights): number {
  const tags = card.taxonomy_tags as {
    asset_classes?: string[];
    themes?: string[];
    geographies?: string[];
  } | null;
  const cardAssetClasses = tags?.asset_classes || [];
  const cardThemes = tags?.themes || [];
  const cardGeos = tags?.geographies || [];

  const assetClassMap: Record<string, string> = {
    equities: 'Equities', fixed_income: 'Fixed Income',
    alternatives: 'Alternatives', real_estate: 'Real Estate', cash: 'Cash',
  };

  let portfolioRelevance = 0;
  if (profile.top_asset_classes) {
    for (const topClass of profile.top_asset_classes) {
      const lc = topClass.toLowerCase().replace(/\s+/g, '_');
      if (cardAssetClasses.includes(lc) || cardAssetClasses.includes(topClass)) {
        portfolioRelevance += 40;
      }
    }
  }
  if (profile.interests) {
    for (const interest of profile.interests) {
      if (cardThemes.includes(interest.toLowerCase())) {
        portfolioRelevance += 15;
      }
    }
  }
  portfolioRelevance = Math.min(portfolioRelevance, 100);

  let allocationGap = 0;
  if (profile.allocation_gaps) {
    for (const [gapKey, gapValue] of Object.entries(profile.allocation_gaps)) {
      const assetClassName = assetClassMap[gapKey] || gapKey;
      if (cardAssetClasses.includes(gapKey) || cardAssetClasses.includes(assetClassName)) {
        if (gapValue < -10) allocationGap += 50;
        else if (gapValue < -5) allocationGap += 30;
        else if (gapValue < 0) allocationGap += 15;
      }
    }
  }
  allocationGap = Math.min(allocationGap, 100);

  let suitability = 50;
  if (profile.risk_tolerance === 'conservative') {
    if (card.card_type === 'portfolio_impact' || card.card_type === 'wealth_planning') suitability = 90;
    else if (card.card_type === 'explainer') suitability = 70;
    else if (card.card_type === 'trend_brief') suitability = 40;
  } else if (profile.risk_tolerance === 'aggressive') {
    if (card.card_type === 'trend_brief' || card.card_type === 'market_pulse') suitability = 90;
    else if (card.card_type === 'allocation_gap') suitability = 80;
    else if (card.card_type === 'wealth_planning') suitability = 40;
  } else {
    if (card.card_type === 'portfolio_impact') suitability = 80;
    else if (card.card_type === 'allocation_gap') suitability = 70;
  }

  let geoScore = 30;
  const userGeoTokens = (profile.geo_focus || '').split('/').map(g => g.trim());
  for (const geo of cardGeos) {
    if (userGeoTokens.includes(geo)) { geoScore = 100; break; }
    if (geo === 'GCC' && userGeoTokens.some(t => ['UAE', 'Saudi Arabia', 'Bahrain', 'Kuwait', 'Oman', 'Qatar'].includes(t))) {
      geoScore = Math.max(geoScore, 80);
    }
    if (geo === 'Global') geoScore = Math.max(geoScore, 50);
  }

  let importance = 0;
  if (card.confidence === 'high') importance += 60;
  else if (card.confidence === 'medium') importance += 30;
  importance += Math.min(card.source_count * 5, 40);
  importance = Math.min(importance, 100);

  const ageHours = (Date.now() - card.created_at.getTime()) / 3600000;
  const freshness = Math.round(100 * Math.exp(-0.03 * ageHours));

  const novelty = card.is_editorial ? 30 : 60;

  const totalScore =
    portfolioRelevance * weights.portfolio_relevance +
    allocationGap * weights.allocation_gap +
    suitability * weights.suitability +
    geoScore * weights.geo +
    importance * weights.importance +
    freshness * weights.freshness +
    novelty * weights.novelty;

  return Math.round(totalScore);
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

function applyGuardrails(cards: CardRow[], countBand: { min: number; max: number }, userProfile?: UserProfileForScoring | null): CardRow[] {
  const scored = cards.map(c => ({ card: c, score: computeCardScore(c, userProfile) }));
  scored.sort((a, b) => b.score - a.score);

  const result: CardRow[] = [];
  const assetClassCounts: Record<string, number> = {};
  const themeCounts: Record<string, number> = {};
  const cardTypesIncluded = new Set<string>();
  let gccCount = 0;

  for (const { card } of scored) {
    if (result.length >= countBand.max) break;

    const assetClass = getPrimaryAssetClass(card);
    const theme = getPrimaryTheme(card);

    if ((assetClassCounts[assetClass] || 0) >= MAX_PER_ASSET_CLASS) continue;
    if (result.length < 5 && (themeCounts[theme] || 0) >= MAX_PER_THEME_IN_TOP5) continue;

    result.push(card);
    assetClassCounts[assetClass] = (assetClassCounts[assetClass] || 0) + 1;
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    cardTypesIncluded.add(card.card_type);
    if (hasGCCRelevance(card)) gccCount++;
  }

  if (gccCount < MIN_GCC_CARDS) {
    const gccCards = scored.filter(s => hasGCCRelevance(s.card) && !result.includes(s.card));
    for (const { card } of gccCards.slice(0, MIN_GCC_CARDS - gccCount)) {
      const insertPos = Math.min(4, result.length);
      if (result.length >= countBand.max) {
        result.splice(insertPos, 1, card);
      } else {
        result.splice(insertPos, 0, card);
      }
      gccCount++;
    }
  }

  while (result.length < countBand.min && scored.length > result.length) {
    const next = scored.find(s => !result.includes(s.card));
    if (!next) break;
    result.push(next.card);
  }

  return result.slice(0, countBand.max);
}

const PERSONALIZATION_OVERLAY_PROMPT = `You are Ada, an AI wealth copilot for GCC HNW investors. Personalize this card for a specific investor.

Card Title: {TITLE}
Card Summary: {SUMMARY}
Card Type: {CARD_TYPE}

Investor Profile:
- Risk tolerance: {RISK_TOLERANCE}
- Investment interests: {INTERESTS}
- Geographic focus: {GEO_FOCUS}
- Top asset classes: {TOP_ASSETS}
- Key allocation gaps: {GAPS}

Respond in JSON:
{
  "personalized_overlay": "1-2 sentence personalized insight connecting this card to their specific portfolio or interests (max 120 chars)",
  "personalized_why": "Brief personalized reason they should care about this (max 80 chars)"
}

Rules:
- Be specific — reference their actual interests/allocations
- Keep it concise and actionable
- Write for sophisticated investors`;

async function generatePersonalizedOverlays(
  cards: CardRow[],
  profile: UserProfileForScoring,
): Promise<Map<string, { overlay: string; why: string }>> {
  const overlays = new Map<string, { overlay: string; why: string }>();
  const topCards = cards.slice(0, PERSONALIZATION_OVERLAY_TOP_N);

  for (const card of topCards) {
    try {
      const cardDetails = await pool.query(
        `SELECT title, summary FROM discover_cards WHERE id = $1`,
        [card.id],
      );
      if (cardDetails.rows.length === 0) continue;
      const { title, summary } = cardDetails.rows[0];

      const gapSummary = Object.entries(profile.allocation_gaps || {})
        .filter(([, v]) => Math.abs(v) > 3)
        .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}%`)
        .join(', ') || 'none significant';

      const prompt = PERSONALIZATION_OVERLAY_PROMPT
        .replace('{TITLE}', title)
        .replace('{SUMMARY}', summary)
        .replace('{CARD_TYPE}', card.card_type)
        .replace('{RISK_TOLERANCE}', profile.risk_tolerance)
        .replace('{INTERESTS}', (profile.interests || []).join(', '))
        .replace('{GEO_FOCUS}', profile.geo_focus || 'Global')
        .replace('{TOP_ASSETS}', (profile.top_asset_classes || []).join(', '))
        .replace('{GAPS}', gapSummary);

      const completion = await resilientCompletion({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }, { timeoutMs: 10000 });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        overlays.set(card.id, {
          overlay: parsed.personalized_overlay || '',
          why: parsed.personalized_why || '',
        });
      }
    } catch (err) {
      console.warn(`[FeedMaterializer] Overlay generation failed for card ${card.id}: ${(err as Error).message}`);
    }
  }
  return overlays;
}

function personalizeCtaTemplates(
  ctas: Array<{ text?: string; family?: string; context?: Record<string, unknown> }>,
  profile: UserProfileForScoring,
): Array<{ text?: string; family?: string; context?: Record<string, unknown> }> {
  const gapSummary = Object.entries(profile.allocation_gaps || {})
    .filter(([, v]) => Math.abs(v) > 3)
    .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}%`)
    .join(', ') || 'balanced';

  const topAssets = (profile.top_asset_classes || []).join(', ') || 'diversified portfolio';

  const fillTemplate = (text: string): string =>
    text
      .replace(/\{USER_NAME\}/g, profile.user_id.replace('user-', '').replace(/^\w/, c => c.toUpperCase()))
      .replace(/\{RISK_TOLERANCE\}/g, profile.risk_tolerance || 'moderate')
      .replace(/\{GEO_FOCUS\}/g, profile.geo_focus || 'Global')
      .replace(/\{TOP_ASSETS\}/g, topAssets)
      .replace(/\{ALLOCATION_GAPS\}/g, gapSummary)
      .replace(/\{INTERESTS\}/g, (profile.interests || []).join(', ') || 'general');

  return ctas.map(cta => ({
    text: cta.text ? fillTemplate(cta.text) : cta.text,
    family: cta.family,
    context: cta.context,
  }));
}

async function materializeUserFeed(
  userId: string,
  profile: UserProfileForScoring,
  allCards: CardRow[],
): Promise<void> {
  const forYouCards = allCards.filter(c => c.tab === 'forYou' || c.tab === 'both');
  const whatsNewCards = allCards.filter(c => c.tab === 'whatsNew' || c.tab === 'both');

  const dismissedResult = await pool.query(
    `SELECT card_id FROM user_content_interactions WHERE user_id = $1 AND action = 'dismiss'`,
    [userId],
  );
  const dismissedIds = new Set(dismissedResult.rows.map((r: { card_id: string }) => r.card_id));

  const filteredForYou = forYouCards.filter(c => !dismissedIds.has(c.id));
  const filteredWhatsNew = whatsNewCards.filter(c => !dismissedIds.has(c.id));

  const rankedForYou = applyGuardrails(filteredForYou, FOR_YOU_COUNT, profile);
  const rankedWhatsNew = applyGuardrails(filteredWhatsNew, WHATS_NEW_COUNT);

  const overlays = await generatePersonalizedOverlays(rankedForYou, profile);

  const cardCtaMap = new Map<string, unknown>();
  const cardIds = [...rankedForYou, ...rankedWhatsNew].map(c => c.id);
  if (cardIds.length > 0) {
    const ctaResult = await pool.query(
      `SELECT id, ctas FROM discover_cards WHERE id = ANY($1)`,
      [cardIds],
    );
    for (const row of ctaResult.rows) {
      const rawCtas = Array.isArray(row.ctas) ? row.ctas : [];
      if (rawCtas.length > 0) {
        cardCtaMap.set(row.id, personalizeCtaTemplates(rawCtas, profile));
      }
    }
  }

  await pool.query(
    `DELETE FROM user_discover_feed WHERE user_id = $1`,
    [userId],
  );

  const expiresAt = new Date(Date.now() + 2 * 3600 * 1000);

  for (let i = 0; i < rankedForYou.length; i++) {
    const card = rankedForYou[i];
    const overlay = overlays.get(card.id);
    const score = computeCardScore(card, profile);
    const personalizedCtas = cardCtaMap.get(card.id) || null;
    await pool.query(
      `INSERT INTO user_discover_feed (user_id, card_id, personalized_overlay, personalized_why, personalized_ctas, score, position, tab, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'forYou', $8)
       ON CONFLICT (user_id, card_id, tab) DO UPDATE SET
         personalized_overlay = EXCLUDED.personalized_overlay,
         personalized_why = EXCLUDED.personalized_why,
         personalized_ctas = EXCLUDED.personalized_ctas,
         score = EXCLUDED.score,
         position = EXCLUDED.position,
         expires_at = EXCLUDED.expires_at`,
      [userId, card.id, overlay?.overlay || null, overlay?.why || null,
       personalizedCtas ? JSON.stringify(personalizedCtas) : null,
       score, i + 1, expiresAt],
    );
  }

  for (let i = 0; i < rankedWhatsNew.length; i++) {
    const card = rankedWhatsNew[i];
    const score = computeBasicScore(card);
    const personalizedCtas = cardCtaMap.get(card.id) || null;
    await pool.query(
      `INSERT INTO user_discover_feed (user_id, card_id, personalized_ctas, score, position, tab, expires_at)
       VALUES ($1, $2, $3, $4, $5, 'whatsNew', $6)
       ON CONFLICT (user_id, card_id, tab) DO UPDATE SET
         personalized_ctas = EXCLUDED.personalized_ctas,
         score = EXCLUDED.score,
         position = EXCLUDED.position,
         expires_at = EXCLUDED.expires_at`,
      [userId, card.id,
       personalizedCtas ? JSON.stringify(personalizedCtas) : null,
       score, i + 1, expiresAt],
    );
  }
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

    const { rows: userProfiles } = await pool.query(
      `SELECT up.user_id, up.allocation_gaps, up.top_asset_classes, up.risk_tolerance, up.interests,
              up.geo_focus, up.segment_id, us.scoring_weights
       FROM user_profiles up
       LEFT JOIN user_segments us ON up.segment_id = us.id
       LIMIT 20`,
    );

    let representativeProfile: UserProfileForScoring | null = null;
    const allProfiles: UserProfileForScoring[] = [];

    for (const p of userProfiles) {
      const profile: UserProfileForScoring = {
        user_id: p.user_id,
        allocation_gaps: typeof p.allocation_gaps === 'string' ? JSON.parse(p.allocation_gaps) : p.allocation_gaps || {},
        top_asset_classes: typeof p.top_asset_classes === 'string' ? JSON.parse(p.top_asset_classes) : p.top_asset_classes || [],
        risk_tolerance: p.risk_tolerance || 'moderate',
        interests: Array.isArray(p.interests) ? p.interests : typeof p.interests === 'string' ? JSON.parse(p.interests) : [],
        geo_focus: p.geo_focus || 'Global',
        segment_id: p.segment_id || null,
        segment_weights: p.scoring_weights ? (typeof p.scoring_weights === 'string' ? JSON.parse(p.scoring_weights) : p.scoring_weights) : null,
      };
      allProfiles.push(profile);
      if (!representativeProfile) representativeProfile = profile;
    }

    const guardrailedForYou = applyGuardrails(forYouCards as CardRow[], FOR_YOU_COUNT, representativeProfile);
    const guardrailedWhatsNew = applyGuardrails(whatsNewCards as CardRow[], WHATS_NEW_COUNT);

    const activeIds = new Set([
      ...guardrailedForYou.map(c => c.id),
      ...guardrailedWhatsNew.map(c => c.id),
    ]);

    await pool.query(`UPDATE discover_cards SET priority_score = 0, feed_position = NULL WHERE is_active = TRUE`);

    for (let i = 0; i < guardrailedForYou.length; i++) {
      const card = guardrailedForYou[i];
      const score = computeCardScore(card);
      await pool.query(
        `UPDATE discover_cards SET priority_score = $1, feed_position = $2 WHERE id = $3`,
        [score, i + 1, card.id],
      );
    }
    for (let i = 0; i < guardrailedWhatsNew.length; i++) {
      const card = guardrailedWhatsNew[i];
      const score = computeCardScore(card);
      await pool.query(
        `UPDATE discover_cards SET priority_score = $1, feed_position = COALESCE(feed_position, $2) WHERE id = $3`,
        [score, i + 1, card.id],
      );
    }

    for (const profile of allProfiles) {
      try {
        await materializeUserFeed(profile.user_id, profile, allCards as CardRow[]);
        console.log(`[FeedMaterializer] Materialized feed for user ${profile.user_id}`);
      } catch (err) {
        console.warn(`[FeedMaterializer] Failed to materialize feed for ${profile.user_id}: ${(err as Error).message}`);
      }
    }

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

export async function getUserProfileForScoring(userId: string): Promise<UserProfileForScoring | null> {
  try {
    const { rows } = await pool.query(
      `SELECT up.user_id, up.allocation_gaps, up.top_asset_classes, up.risk_tolerance, up.interests,
              up.geo_focus, up.segment_id, us.scoring_weights
       FROM user_profiles up
       LEFT JOIN user_segments us ON up.segment_id = us.id
       WHERE up.user_id = $1`,
      [userId],
    );
    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      user_id: p.user_id,
      allocation_gaps: typeof p.allocation_gaps === 'string' ? JSON.parse(p.allocation_gaps) : p.allocation_gaps || {},
      top_asset_classes: typeof p.top_asset_classes === 'string' ? JSON.parse(p.top_asset_classes) : p.top_asset_classes || [],
      risk_tolerance: p.risk_tolerance || 'moderate',
      interests: Array.isArray(p.interests) ? p.interests : typeof p.interests === 'string' ? JSON.parse(p.interests) : [],
      geo_focus: p.geo_focus || 'Global',
      segment_id: p.segment_id || null,
      segment_weights: p.scoring_weights ? (typeof p.scoring_weights === 'string' ? JSON.parse(p.scoring_weights) : p.scoring_weights) : null,
    };
  } catch {
    return null;
  }
}

export { computeCardScore, type UserProfileForScoring, type CardRow };
