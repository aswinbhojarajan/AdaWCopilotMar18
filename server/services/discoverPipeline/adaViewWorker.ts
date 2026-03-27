import pool from '../../db/pool';
import { resilientCompletion } from '../openaiClient';
import { resolveModel } from '../modelRouter';

const ADA_VIEW_PROMPT = `You are Ada, an AI wealth copilot for GCC HNW investors. Create a weekly editorial "Ada's View" card that synthesizes the most important themes from this week's market intelligence.

Top cards from the past week:
{CARDS}

Respond in JSON with these exact fields:
{
  "title": "A crisp editorial headline (max 12 words, e.g. 'Three Themes Shaping GCC Wealth This Week')",
  "summary": "2-3 sentence editorial synthesis tying the week's themes together (max 250 chars)",
  "detail_sections": [
    {"title": "This week's key themes", "type": "bullets", "content": ["theme 1 with brief context", "theme 2 with brief context", "theme 3 with brief context"]},
    {"title": "Ada's take", "type": "paragraph", "content": ["1-2 sentence forward-looking perspective for the coming week"]}
  ],
  "why_seeing_this": "Weekly editorial digest from Ada"
}

Rules:
- Write as a trusted wealth advisor giving a weekly briefing
- Connect disparate themes into a coherent narrative
- Be specific with data points when available
- Frame through wealth preservation/growth lens
- Avoid jargon; be direct and actionable`;

async function fetchTopCardsForAdaView(): Promise<Array<{ id: string; title: string; summary: string; card_type: string; topic_label: string }>> {
  const { rows } = await pool.query(
    `SELECT id, title, summary, card_type, topic_label
     FROM discover_cards
     WHERE card_type != 'ada_view' AND card_type != 'event_calendar'
       AND created_at > NOW() - INTERVAL '7 days'
     ORDER BY priority_score DESC, created_at DESC
     LIMIT 10`,
  );
  return rows;
}

async function fetchCTAs(): Promise<Array<{ text: string; family: string }>> {
  const { rows } = await pool.query(
    `SELECT template_text, cta_family FROM cta_templates WHERE card_type = 'ada_view' ORDER BY is_primary DESC LIMIT 2`,
  );
  return rows.map((r: Record<string, unknown>) => ({
    text: r.template_text as string,
    family: r.cta_family as string,
  }));
}

export async function runAdaView(): Promise<number> {
  console.log('[AdaViewWorker] Checking if Ada View editorial is needed...');
  try {
    const { rows: existing } = await pool.query(
      `SELECT id FROM discover_cards
       WHERE card_type = 'ada_view' AND is_active = TRUE AND created_at > NOW() - INTERVAL '5 days'
       LIMIT 1`,
    );

    if (existing.length > 0) {
      console.log('[AdaViewWorker] Recent Ada View already exists, skipping');
      return 0;
    }

    const topCards = await fetchTopCardsForAdaView();
    if (topCards.length < 3) {
      console.log('[AdaViewWorker] Not enough cards for Ada View synthesis');
      return 0;
    }

    const cardsText = topCards
      .map((c, i) => `${i + 1}. [${c.card_type}] "${c.title}" — ${c.summary} (Topic: ${c.topic_label})`)
      .join('\n');

    const prompt = ADA_VIEW_PROMPT.replace('{CARDS}', cardsText);

    const completion = await resilientCompletion({
      model: resolveModel('ada-content'),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_completion_tokens: 800,
      response_format: { type: 'json_object' },
    }, { timeoutMs: 20000, providerAlias: 'ada-content' });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('[AdaViewWorker] Empty LLM response');
      return 0;
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
      console.warn('[AdaViewWorker] Failed to parse LLM response');
      return 0;
    }

    const ctas = await fetchCTAs();
    const cardId = `disc-adaview-${Date.now().toString(36)}`;

    const ctasJson = ctas.map(c => ({
      text: c.text,
      family: c.family,
      context: {
        card_summary: parsed.summary,
        entities: [],
        evidence_facts: [],
      },
    }));

    const sourceCardRefs = topCards.slice(0, 5).map(c => ({
      card_id: c.id,
      title: c.title,
      card_type: c.card_type,
    }));

    const themeSet = [...new Set(topCards.map(c => c.topic_label))];

    await pool.query(
      `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
        source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
        why_you_are_seeing_this, is_active, is_editorial, priority_score, expires_at)
       VALUES ($1, 'ada_view', 'both', $2, $3, $4, $5, $6, 'analysis', 'Ada''s View', $7, 'high',
         $8, $9, $10, TRUE, TRUE, 90, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        cardId,
        parsed.title,
        parsed.summary,
        JSON.stringify(parsed.detail_sections || []),
        JSON.stringify(sourceCardRefs),
        topCards.length,
        themeSet.slice(0, 5),
        JSON.stringify({
          asset_classes: [],
          sectors: [],
          geographies: ['GCC', 'Global'],
          themes: themeSet.map(t => t.toLowerCase().replace(/\s+/g, '_')),
          wealth_topics: ['weekly_digest'],
        }),
        JSON.stringify(ctasJson),
        parsed.why_seeing_this || 'Weekly editorial digest from Ada',
        new Date(Date.now() + 7 * 24 * 3600 * 1000),
      ],
    );

    console.log(`[AdaViewWorker] Created Ada View card: ${cardId}`);
    return 1;
  } catch (err) {
    console.error('[AdaViewWorker] Error:', (err as Error).message);
    return 0;
  }
}
