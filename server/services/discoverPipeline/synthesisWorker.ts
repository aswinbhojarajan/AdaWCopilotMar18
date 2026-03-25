import pool from '../../db/pool';
import { resilientCompletion } from '../openaiClient';

interface ClusterRow {
  id: number;
  theme: string;
  article_ids: number[];
  article_count: number;
  narrative_headline: string;
  aggregate_importance: number;
  primary_asset_class: string;
  primary_geography: string;
  primary_themes: string[];
}

interface ArticleForSynthesis {
  title: string;
  summary: string;
  publisher: string;
  published_at: Date;
}

function mapCardType(theme: string, importance: number): string {
  if (importance > 0.7) return 'portfolio_impact';
  if (theme === 'macro' || theme === 'regulation') return 'market_pulse';
  return 'trend_brief';
}

function mapIntentBadge(cardType: string): string | null {
  switch (cardType) {
    case 'portfolio_impact': return 'alert';
    case 'market_pulse': return 'analysis';
    case 'trend_brief': return 'analysis';
    default: return null;
  }
}

function formatTopicLabel(theme: string): string {
  const labels: Record<string, string> = {
    equities: 'Equities',
    fixed_income: 'Fixed Income',
    crypto: 'Digital Assets',
    commodities: 'Commodities',
    real_estate: 'Real Estate',
    alternatives: 'Alternatives',
    macro: 'Macro',
    esg: 'ESG',
    ai_tech: 'AI & Tech',
    gcc_markets: 'GCC Markets',
    regulation: 'Regulation',
    wealth_planning: 'Wealth Planning',
  };
  return labels[theme] || theme.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const CLUSTER_SYNTHESIS_PROMPT = `You are Ada, an AI wealth copilot for GCC HNW investors. Synthesize these related news articles into a single insight card.

Articles:
{ARTICLES}

Cluster Theme: {THEME}
Primary Asset Class: {ASSET_CLASS}
Geography: {GEOGRAPHY}

Respond in JSON with these exact fields:
{
  "title": "A crisp, action-oriented headline (max 12 words, Crimson Pro serif style)",
  "summary": "2-3 sentence synthesis explaining the significance for a HNW investor (max 200 chars)",
  "detail_sections": [
    {"title": "Key developments", "type": "bullets", "content": ["bullet 1", "bullet 2", "bullet 3"]},
    {"title": "What this means", "type": "paragraph", "content": ["1-2 sentence implications for portfolio"]}
  ],
  "why_seeing_this": "Brief reason this matters to a wealth-focused investor"
}

Rules:
- Write for sophisticated investors who want concise, actionable intelligence
- Avoid jargon; be specific with numbers when available
- Frame through wealth preservation/growth lens
- Never use clickbait or sensationalism`;

async function fetchArticlesForCluster(articleIds: number[]): Promise<ArticleForSynthesis[]> {
  if (articleIds.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT title, summary, publisher, published_at FROM raw_articles WHERE id = ANY($1) ORDER BY published_at DESC`,
    [articleIds],
  );
  return rows.map((r: Record<string, unknown>) => ({
    title: r.title as string,
    summary: r.summary as string,
    publisher: r.publisher as string,
    published_at: new Date(r.published_at as string),
  }));
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

export async function runSynthesis(): Promise<number> {
  console.log('[SynthesisWorker] Synthesizing unsynthesized clusters...');
  try {
    const { rows } = await pool.query(
      `SELECT id, theme, article_ids, article_count, narrative_headline, aggregate_importance,
              primary_asset_class, primary_geography, primary_themes
       FROM article_clusters WHERE is_synthesized = FALSE
       ORDER BY aggregate_importance DESC LIMIT 10`,
    );

    if (rows.length === 0) {
      console.log('[SynthesisWorker] No clusters to synthesize');
      return 0;
    }

    let synthesized = 0;
    for (const row of rows as ClusterRow[]) {
      try {
        const articles = await fetchArticlesForCluster(row.article_ids);
        if (articles.length === 0) continue;

        const articlesText = articles
          .map((a, i) => `${i + 1}. "${a.title}" (${a.publisher}, ${a.published_at.toISOString().split('T')[0]})\n   ${a.summary || 'No summary'}`)
          .join('\n');

        const prompt = CLUSTER_SYNTHESIS_PROMPT
          .replace('{ARTICLES}', articlesText)
          .replace('{THEME}', row.theme)
          .replace('{ASSET_CLASS}', row.primary_asset_class)
          .replace('{GEOGRAPHY}', row.primary_geography);

        const completion = await resilientCompletion({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 800,
          response_format: { type: 'json_object' },
        }, { timeoutMs: 20000 });

        const content = completion.choices[0]?.message?.content;
        if (!content) continue;

        let parsed: {
          title: string;
          summary: string;
          detail_sections: Array<{ title: string; type: string; content: string | string[] }>;
          why_seeing_this: string;
        };
        try {
          parsed = JSON.parse(content);
        } catch {
          console.warn(`[SynthesisWorker] Failed to parse LLM response for cluster ${row.id}`);
          continue;
        }

        const cardType = mapCardType(row.theme, row.aggregate_importance);
        const intentBadge = mapIntentBadge(cardType);
        const topicLabel = formatTopicLabel(row.theme);
        const ctas = await fetchCTAs(cardType);

        const supportingArticles = articles.slice(0, 3).map(a => ({
          title: a.title,
          publisher: a.publisher,
          published_at: a.published_at.toISOString(),
        }));

        const cardId = `disc-live-${row.id}-${Date.now().toString(36)}`;

        const ctasJson = ctas.map(c => ({
          text: c.text,
          family: c.family,
          context: {
            card_summary: parsed.summary,
            entities: [],
            evidence_facts: [],
          },
        }));

        await pool.query(
          `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
            source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
            why_you_are_seeing_this, cluster_id, is_active, is_editorial, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, TRUE, FALSE, $17)
           ON CONFLICT (id) DO NOTHING`,
          [
            cardId,
            cardType,
            'whatsNew',
            parsed.title,
            parsed.summary,
            JSON.stringify(parsed.detail_sections || []),
            JSON.stringify(supportingArticles),
            row.article_count,
            intentBadge,
            topicLabel,
            row.primary_themes,
            row.aggregate_importance > 0.6 ? 'high' : 'medium',
            JSON.stringify({
              asset_classes: [row.primary_asset_class],
              sectors: [],
              geographies: [row.primary_geography],
              themes: row.primary_themes,
              wealth_topics: [],
            }),
            JSON.stringify(ctasJson),
            parsed.why_seeing_this || 'Based on current market developments',
            row.id,
            new Date(Date.now() + 48 * 3600 * 1000),
          ],
        );

        await pool.query(`UPDATE article_clusters SET is_synthesized = TRUE, updated_at = NOW() WHERE id = $1`, [row.id]);
        synthesized++;
        console.log(`[SynthesisWorker] Synthesized cluster ${row.id} → card ${cardId}`);
      } catch (err) {
        console.warn(`[SynthesisWorker] Failed to synthesize cluster ${row.id}: ${(err as Error).message}`);
      }
    }

    const standaloneSynthesized = await synthesizeStandaloneArticles();
    const total = synthesized + standaloneSynthesized;
    console.log(`[SynthesisWorker] Synthesized ${synthesized} clusters + ${standaloneSynthesized} standalone articles`);
    return total;
  } catch (err) {
    console.error('[SynthesisWorker] Fatal error:', (err as Error).message);
    return 0;
  }
}

async function synthesizeStandaloneArticles(): Promise<number> {
  try {
    const { rows } = await pool.query(
      `SELECT ra.id, ra.title, ra.summary, ra.publisher, ra.published_at, ra.tickers, ra.regions,
              ae.taxonomy_tags, ae.importance_score, ae.sentiment_score
       FROM raw_articles ra
       JOIN article_enrichment ae ON ae.article_id = ra.id
       WHERE ae.is_duplicate = FALSE
         AND ae.importance_score >= 0.5
         AND ra.id NOT IN (SELECT unnest(article_ids) FROM article_clusters)
         AND NOT EXISTS (
           SELECT 1 FROM discover_cards dc
           WHERE dc.is_active = TRUE AND dc.is_editorial = FALSE
             AND dc.id LIKE 'disc-solo-' || ra.id || '-%'
         )
         AND ra.published_at > NOW() - INTERVAL '24 hours'
       ORDER BY ae.importance_score DESC LIMIT 5`,
    );

    if (rows.length === 0) return 0;

    let created = 0;
    for (const row of rows) {
      const taxonomyTags = typeof row.taxonomy_tags === 'string' ? JSON.parse(row.taxonomy_tags) : row.taxonomy_tags || {};
      const primaryTheme = Object.keys(taxonomyTags)[0] || 'general';
      const topicLabel = formatTopicLabel(primaryTheme);
      const ctas = await fetchCTAs('market_pulse');

      const cardId = `disc-solo-${row.id}-${Date.now().toString(36)}`;
      const ctasJson = ctas.map((c: { text: string; family: string }) => ({
        text: c.text,
        family: c.family,
        context: {
          card_summary: row.summary || row.title,
          entities: row.tickers || [],
          evidence_facts: [],
        },
      }));

      const supportingArticles = [{
        article_id: row.id,
        title: row.title,
        publisher: row.publisher || 'Unknown',
        published_at: new Date(row.published_at).toISOString(),
      }];

      await pool.query(
        `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
          source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
          why_you_are_seeing_this, is_active, is_editorial, expires_at)
         VALUES ($1, 'market_pulse', 'whatsNew', $2, $3, '[]', $4, 1, 'analysis', $5, $6, 'medium',
           $7, $8, 'Breaking market development', TRUE, FALSE, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          cardId,
          row.title,
          row.summary || '',
          JSON.stringify(supportingArticles),
          topicLabel,
          Object.keys(taxonomyTags).slice(0, 5),
          JSON.stringify({ asset_classes: [], sectors: [], geographies: row.regions || [], themes: Object.keys(taxonomyTags), wealth_topics: [] }),
          JSON.stringify(ctasJson),
          new Date(Date.now() + 24 * 3600 * 1000),
        ],
      );
      created++;
    }

    return created;
  } catch (err) {
    console.warn(`[SynthesisWorker] Standalone synthesis error: ${(err as Error).message}`);
    return 0;
  }
}
