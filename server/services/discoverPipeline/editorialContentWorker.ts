import pool from '../../db/pool';
import { resilientCompletion } from '../openaiClient';
import { resolveModel } from '../modelRouter';

interface EditorialRow {
  id: number;
  card_type: string;
  title: string;
  summary: string;
  detail_sections: Array<{ title: string; type: string; content: string | string[] }>;
  asset_classes: string[];
  themes: string[];
  regions: string[];
  eligibility: { risk_levels?: string[]; aum_tiers?: string[] };
  rotation_days: number;
}

const EDITORIAL_REFRESH_PROMPT = `You are Ada, an AI wealth copilot for GCC HNW investors. Refresh this editorial card with current, relevant content while preserving the core topic.

Original card:
Type: {CARD_TYPE}
Title: {TITLE}
Summary: {SUMMARY}
Detail sections: {DETAIL_SECTIONS}
Asset classes: {ASSET_CLASSES}
Themes: {THEMES}
Regions: {REGIONS}

Recent market context (top pipeline cards):
{MARKET_CONTEXT}

Respond in JSON:
{
  "title": "Refreshed headline (max 12 words, Crimson Pro serif style)",
  "summary": "Updated 2-3 sentence summary with current data points (max 250 chars)",
  "detail_sections": [
    {"title": "section heading", "type": "bullets|paragraph", "content": ["bullet or paragraph text"]}
  ],
  "why_seeing_this": "Brief reason this is relevant now (max 80 chars)"
}

Rules:
- Preserve the core educational/planning/product topic
- Update data points and framing for current market conditions
- Write for sophisticated GCC HNW investors
- Be specific with numbers when available
- Frame through wealth preservation/growth lens
- Keep detail_sections to 2-3 sections max`;

async function fetchMarketContext(): Promise<string> {
  const { rows } = await pool.query(
    `SELECT title, summary, card_type, topic_label
     FROM discover_cards
     WHERE is_active = TRUE AND is_editorial = FALSE
       AND created_at > NOW() - INTERVAL '3 days'
     ORDER BY priority_score DESC, created_at DESC
     LIMIT 5`,
  );
  if (rows.length === 0) return 'No recent market data available.';
  return rows
    .map((r: { title: string; summary: string; card_type: string; topic_label: string }, i: number) =>
      `${i + 1}. [${r.card_type}] "${r.title}" — ${r.summary}`)
    .join('\n');
}

async function fetchCTAs(cardType: string): Promise<Array<{ text: string; family: string }>> {
  const { rows } = await pool.query(
    `SELECT template_text, cta_family FROM cta_templates WHERE card_type = $1 ORDER BY is_primary DESC LIMIT 2`,
    [cardType],
  );
  return rows.map((r: Record<string, unknown>) => ({
    text: r.template_text as string,
    family: r.cta_family as string,
  }));
}

function mapTab(cardType: string): string {
  if (cardType === 'explainer') return 'whatsNew';
  return 'forYou';
}

function mapIntentBadge(cardType: string): string | null {
  switch (cardType) {
    case 'explainer': return null;
    case 'wealth_planning': return 'action';
    case 'product_opportunity': return 'opportunity';
    default: return null;
  }
}

function mapTopicLabel(cardType: string): string {
  switch (cardType) {
    case 'explainer': return 'Explainer';
    case 'wealth_planning': return 'Planning';
    case 'product_opportunity': return 'Product';
    default: return 'Editorial';
  }
}

async function fetchEligibleEditorial(): Promise<EditorialRow[]> {
  const { rows } = await pool.query(
    `SELECT id, card_type, title, summary, detail_sections, asset_classes, themes, regions,
            eligibility, rotation_days
     FROM editorial_content
     WHERE is_active = TRUE
       AND (last_used_at IS NULL OR last_used_at < NOW() - (rotation_days || ' days')::INTERVAL)
     ORDER BY last_used_at ASC NULLS FIRST, id ASC`,
  );
  return rows as EditorialRow[];
}

async function countRecentEditorialCards(cardType: string): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*) as cnt FROM discover_cards
     WHERE card_type = $1 AND is_active = TRUE AND is_editorial = TRUE
       AND created_at > NOW() - INTERVAL '2 days'`,
    [cardType],
  );
  return Number(rows[0]?.cnt) || 0;
}

export async function runEditorialContent(): Promise<number> {
  console.log('[EditorialContentWorker] Checking for editorial content to generate...');
  try {
    const eligible = await fetchEligibleEditorial();
    if (eligible.length === 0) {
      console.log('[EditorialContentWorker] No eligible editorial content found');
      return 0;
    }

    const typeCounts: Record<string, number> = { explainer: 0, wealth_planning: 0, product_opportunity: 0 };
    const typeTargets: Record<string, number> = { explainer: 2, wealth_planning: 1, product_opportunity: 1 };

    for (const type of Object.keys(typeTargets)) {
      const count = await countRecentEditorialCards(type);
      typeCounts[type] = Math.min(count, typeTargets[type]);
    }

    const toGenerate = eligible.filter(e => (typeCounts[e.card_type] || 0) < (typeTargets[e.card_type] || 1));
    if (toGenerate.length === 0) {
      console.log('[EditorialContentWorker] All editorial types have recent cards');
      return 0;
    }

    const marketContext = await fetchMarketContext();
    let generated = 0;

    for (const editorial of toGenerate) {
      if ((typeCounts[editorial.card_type] || 0) >= (typeTargets[editorial.card_type] || 1)) continue;

      try {
        const prompt = EDITORIAL_REFRESH_PROMPT
          .replace('{CARD_TYPE}', editorial.card_type)
          .replace('{TITLE}', editorial.title)
          .replace('{SUMMARY}', editorial.summary)
          .replace('{DETAIL_SECTIONS}', JSON.stringify(editorial.detail_sections))
          .replace('{ASSET_CLASSES}', editorial.asset_classes.join(', '))
          .replace('{THEMES}', editorial.themes.join(', '))
          .replace('{REGIONS}', editorial.regions.join(', '))
          .replace('{MARKET_CONTEXT}', marketContext);

        const completion = await resilientCompletion({
          model: resolveModel('ada-content'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_completion_tokens: 800,
          response_format: { type: 'json_object' },
        }, { timeoutMs: 20000, providerAlias: 'ada-content' });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          console.warn(`[EditorialContentWorker] Empty LLM response for editorial ${editorial.id}`);
          continue;
        }

        let parsed: {
          title: string;
          summary: string;
          detail_sections: Array<{ title: string; type: string; content: string | string[] }>;
          why_seeing_this: string;
        };
        try {
          parsed = JSON.parse(content);
        } catch {
          console.warn(`[EditorialContentWorker] Failed to parse LLM response for editorial ${editorial.id}`);
          continue;
        }

        if (!parsed.title || !parsed.summary || !Array.isArray(parsed.detail_sections) || parsed.detail_sections.length === 0) {
          console.warn(`[EditorialContentWorker] LLM response missing required fields for editorial ${editorial.id}`);
          continue;
        }

        const ctas = await fetchCTAs(editorial.card_type);
        const cardId = `disc-ed-${editorial.card_type.charAt(0)}${editorial.id}-${Date.now().toString(36)}`;
        const tab = mapTab(editorial.card_type);
        const intentBadge = mapIntentBadge(editorial.card_type);
        const topicLabel = mapTopicLabel(editorial.card_type);

        const ctasJson = ctas.map(c => ({
          text: c.text,
          family: c.family,
          context: {
            card_summary: parsed.summary,
            entities: [],
            evidence_facts: [],
          },
        }));

        const expiryDays = editorial.card_type === 'explainer' ? 14 : 7;

        await pool.query(
          `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
            source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
            why_you_are_seeing_this, is_active, is_editorial, priority_score, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, '[]', 0, $7, $8, $9, 'high',
             $10, $11, $12, TRUE, TRUE, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [
            cardId,
            editorial.card_type,
            tab,
            parsed.title,
            parsed.summary,
            JSON.stringify(parsed.detail_sections || []),
            intentBadge,
            topicLabel,
            editorial.themes.slice(0, 5),
            JSON.stringify({
              asset_classes: editorial.asset_classes.map(a => a.toLowerCase().replace(/\s+/g, '_')),
              sectors: [],
              geographies: editorial.regions,
              themes: editorial.themes,
              wealth_topics: editorial.card_type === 'wealth_planning'
                ? ['succession', 'tax_optimization']
                : editorial.card_type === 'product_opportunity'
                  ? ['product_access', 'income_generation']
                  : ['education'],
            }),
            JSON.stringify(ctasJson),
            parsed.why_seeing_this || 'Curated editorial content from Ada',
            editorial.card_type === 'product_opportunity' ? 85 : 75,
            new Date(Date.now() + expiryDays * 24 * 3600 * 1000),
          ],
        );

        await pool.query(
          `UPDATE editorial_content SET last_used_at = NOW(), updated_at = NOW() WHERE id = $1`,
          [editorial.id],
        );

        typeCounts[editorial.card_type] = (typeCounts[editorial.card_type] || 0) + 1;
        generated++;
        console.log(`[EditorialContentWorker] Generated ${editorial.card_type} card: ${cardId} (from editorial #${editorial.id})`);
      } catch (err) {
        console.warn(`[EditorialContentWorker] Failed to generate card for editorial ${editorial.id}: ${(err as Error).message}`);
      }
    }

    console.log(`[EditorialContentWorker] Generated ${generated} editorial cards`);
    return generated;
  } catch (err) {
    console.error('[EditorialContentWorker] Error:', (err as Error).message);
    return 0;
  }
}
