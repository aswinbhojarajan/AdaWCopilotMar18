import pool from '../../db/pool';
import { resilientCompletion } from '../openaiClient';

const BRIEFING_PROMPT = `You are Ada, an AI wealth copilot for GCC HNW investors. Create a concise morning briefing card summarizing overnight market developments.

Top overnight discover cards:
{CARDS}

Respond in JSON with these exact fields:
{
  "title": "A crisp morning headline (max 10 words, e.g. 'Your Wednesday Brief: Markets Shift on Fed Signal')",
  "summary": "2-3 sentence overview of the most important overnight developments (max 200 chars)",
  "detail_sections": [
    {"title": "Overnight movers", "type": "bullets", "content": ["key development 1", "key development 2", "key development 3"]},
    {"title": "What to watch today", "type": "paragraph", "content": ["1-2 sentence forward-looking note for the day ahead"]}
  ],
  "why_seeing_this": "Your personalized morning market brief"
}

Rules:
- Write as a trusted wealth advisor delivering a morning brief
- Prioritize actionable intelligence over noise
- Be specific with numbers when available
- Keep it scannable — this is a quick morning read`;

async function fetchOvernightCards(): Promise<Array<{ id: string; title: string; summary: string; card_type: string; topic_label: string }>> {
  const { rows } = await pool.query(
    `SELECT id, title, summary, card_type, topic_label
     FROM discover_cards
     WHERE card_type NOT IN ('ada_view', 'event_calendar', 'morning_briefing', 'milestone')
       AND is_active = TRUE
       AND created_at > NOW() - INTERVAL '18 hours'
     ORDER BY priority_score DESC, created_at DESC
     LIMIT 8`,
  );
  return rows;
}

async function fetchCTAs(): Promise<Array<{ text: string; family: string }>> {
  const { rows } = await pool.query(
    `SELECT template_text, cta_family FROM cta_templates WHERE card_type = 'morning_briefing' ORDER BY is_primary DESC LIMIT 2`,
  );
  if (rows.length === 0) {
    return [
      { text: 'Walk me through today\'s outlook', family: 'explain' },
      { text: 'How does this affect my portfolio?', family: 'impact' },
    ];
  }
  return rows.map((r: Record<string, unknown>) => ({
    text: r.template_text as string,
    family: r.cta_family as string,
  }));
}

export async function runMorningBriefing(): Promise<number> {
  console.log('[MorningBriefingWorker] Checking if morning briefing is needed...');
  try {
    const { rows: existing } = await pool.query(
      `SELECT id FROM discover_cards
       WHERE card_type = 'morning_briefing' AND is_active = TRUE AND created_at > NOW() - INTERVAL '14 hours'
       LIMIT 1`,
    );

    if (existing.length > 0) {
      console.log('[MorningBriefingWorker] Recent morning briefing exists, skipping');
      return 0;
    }

    const overnightCards = await fetchOvernightCards();
    if (overnightCards.length < 2) {
      console.log('[MorningBriefingWorker] Not enough overnight cards for briefing');
      return 0;
    }

    const cardsText = overnightCards
      .map((c, i) => `${i + 1}. [${c.card_type}] "${c.title}" — ${c.summary} (Topic: ${c.topic_label})`)
      .join('\n');

    const prompt = BRIEFING_PROMPT.replace('{CARDS}', cardsText);

    const completion = await resilientCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }, { timeoutMs: 15000 });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('[MorningBriefingWorker] Empty LLM response');
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
      console.warn('[MorningBriefingWorker] Failed to parse LLM response');
      return 0;
    }

    const ctas = await fetchCTAs();
    const cardId = `disc-briefing-${Date.now().toString(36)}`;

    const ctasJson = ctas.map(c => ({
      text: c.text,
      family: c.family,
      context: {
        card_summary: parsed.summary,
        entities: [],
        evidence_facts: [],
      },
    }));

    const themeSet = [...new Set(overnightCards.map(c => c.topic_label))];

    await pool.query(
      `UPDATE discover_cards SET is_active = FALSE WHERE card_type = 'morning_briefing' AND is_active = TRUE`,
    );

    await pool.query(
      `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
        source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
        why_you_are_seeing_this, is_active, is_editorial, priority_score, feed_position, expires_at)
       VALUES ($1, 'morning_briefing', 'forYou', $2, $3, $4, '[]', $5, 'analysis', 'Morning Brief', $6, 'high',
         $7, $8, $9, TRUE, TRUE, 95, 1, $10)
       ON CONFLICT (id) DO NOTHING`,
      [
        cardId,
        parsed.title,
        parsed.summary,
        JSON.stringify(parsed.detail_sections || []),
        overnightCards.length,
        themeSet.slice(0, 5),
        JSON.stringify({
          asset_classes: [],
          sectors: [],
          geographies: ['GCC', 'Global'],
          themes: themeSet.map(t => t.toLowerCase().replace(/\s+/g, '_')),
          wealth_topics: ['morning_briefing'],
        }),
        JSON.stringify(ctasJson),
        parsed.why_seeing_this || 'Your personalized morning market brief',
        new Date(Date.now() + 16 * 3600 * 1000),
      ],
    );

    console.log(`[MorningBriefingWorker] Created morning briefing card: ${cardId}`);
    return 1;
  } catch (err) {
    console.error('[MorningBriefingWorker] Error:', (err as Error).message);
    return 0;
  }
}
