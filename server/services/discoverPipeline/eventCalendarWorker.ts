import pool from '../../db/pool';
import { finnhubMarketProvider } from '../../providers/finnhub';

interface EarningsEvent {
  symbol: string;
  date: string;
  hour: string;
  eps_estimate: number | null;
  eps_actual: number | null;
  revenue_estimate: number | null;
  revenue_actual: number | null;
  quarter: number;
  year: number;
}

const GCC_RELEVANT_SYMBOLS = new Set([
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'MA',
  'BAC', 'GS', 'MS', 'BLK', 'XOM', 'CVX', 'COP', 'SLB',
  'BRK.B', 'UNH', 'JNJ', 'PG', 'KO', 'PEP', 'WMT', 'COST',
  'ADNOC', 'STC', 'QNB', 'FAB', 'EMAAR', 'SNB',
]);

async function fetchAllPortfolioSymbols(): Promise<Set<string>> {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT p.symbol FROM positions p
       JOIN accounts a ON p.account_id = a.id
       WHERE p.symbol IS NOT NULL`,
    );
    return new Set(rows.map((r: { symbol: string }) => r.symbol.toUpperCase()));
  } catch {
    return new Set();
  }
}

async function fetchCTAs(): Promise<Array<{ text: string; family: string }>> {
  const { rows } = await pool.query(
    `SELECT template_text, cta_family FROM cta_templates WHERE card_type = 'event_calendar' ORDER BY is_primary DESC LIMIT 2`,
  );
  return rows.map((r: Record<string, unknown>) => ({
    text: r.template_text as string,
    family: r.cta_family as string,
  }));
}

function groupEventsByWeek(events: EarningsEvent[]): Map<string, EarningsEvent[]> {
  const groups = new Map<string, EarningsEvent[]>();
  for (const event of events) {
    const d = new Date(event.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!groups.has(weekKey)) groups.set(weekKey, []);
    groups.get(weekKey)!.push(event);
  }
  return groups;
}

function formatHour(hour: string): string {
  if (hour === 'bmo') return 'before market open';
  if (hour === 'amc') return 'after market close';
  if (hour === 'dmh') return 'during market hours';
  return '';
}

export async function runEventCalendar(): Promise<number> {
  console.log('[EventCalendarWorker] Fetching earnings calendar...');
  try {
    const result = await finnhubMarketProvider.getEarningsCalendar();
    if (result.status !== 'ok' || !result.data) {
      console.warn('[EventCalendarWorker] Failed to fetch earnings calendar:', result.status === 'ok' ? 'no data' : 'API error');
      return 0;
    }

    const allEvents = result.data as EarningsEvent[];
    if (!Array.isArray(allEvents) || allEvents.length === 0) {
      console.log('[EventCalendarWorker] No earnings events found');
      return 0;
    }

    const portfolioSymbols = await fetchAllPortfolioSymbols();
    const relevantSymbols = new Set([...GCC_RELEVANT_SYMBOLS, ...portfolioSymbols]);

    const relevantEvents = allEvents.filter(e => relevantSymbols.has(e.symbol));
    if (relevantEvents.length === 0) {
      console.log('[EventCalendarWorker] No relevant earnings events found');
      return 0;
    }

    const weeklyGroups = groupEventsByWeek(relevantEvents);
    const ctas = await fetchCTAs();
    let created = 0;

    for (const [weekKey, events] of weeklyGroups) {
      const cardId = `disc-cal-${weekKey}-${Date.now().toString(36)}`;

      const { rows: existing } = await pool.query(
        `SELECT id FROM discover_cards
         WHERE card_type = 'event_calendar' AND is_active = TRUE
           AND id LIKE $1
         LIMIT 1`,
        [`disc-cal-${weekKey}%`],
      );

      if (existing.length > 0) continue;

      const majorEvents = events.filter(e => GCC_RELEVANT_SYMBOLS.has(e.symbol) || portfolioSymbols.has(e.symbol));
      const topEvents = majorEvents.slice(0, 8);

      if (topEvents.length === 0) continue;

      const weekEnd = new Date(weekKey);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekLabel = `${new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      const title = `Key earnings to watch: ${weekLabel}`;

      const bullets = topEvents.map(e => {
        const timing = formatHour(e.hour);
        const estimate = e.eps_estimate ? ` (EPS est: $${e.eps_estimate.toFixed(2)})` : '';
        return `${e.symbol} — ${new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${timing ? ` ${timing}` : ''}${estimate}`;
      });

      const summary = `${topEvents.length} major companies report earnings this week. Watch for potential market-moving results.`;

      const detailSections = [
        { title: 'Upcoming earnings', type: 'bullets', content: bullets },
      ];

      const ctasJson = ctas.map(c => ({
        text: c.text,
        family: c.family,
        context: {
          card_summary: summary,
          entities: topEvents.map(e => e.symbol),
          evidence_facts: [],
        },
      }));

      const symbols = topEvents.map(e => e.symbol);
      const whySeeingThis = 'Major earnings releases that may affect markets';

      await pool.query(
        `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
          source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
          why_you_are_seeing_this, is_active, is_editorial, priority_score, expires_at)
         VALUES ($1, 'event_calendar', 'both', $2, $3, $4, '[]', 0, 'action', 'Earnings Calendar', $5, 'high',
           $6, $7, $8, TRUE, TRUE, 75, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          cardId,
          title,
          summary,
          JSON.stringify(detailSections),
          symbols,
          JSON.stringify({
            asset_classes: ['equities'],
            sectors: [],
            geographies: ['Global', 'GCC'],
            themes: ['earnings', 'corporate_results'],
            wealth_topics: ['portfolio_monitoring'],
          }),
          JSON.stringify(ctasJson),
          whySeeingThis,
          new Date(new Date(weekKey).getTime() + 8 * 24 * 3600 * 1000),
        ],
      );

      created++;
      console.log(`[EventCalendarWorker] Created event calendar card: ${cardId} (${topEvents.length} events)`);
    }

    console.log(`[EventCalendarWorker] Created ${created} event calendar cards`);
    return created;
  } catch (err) {
    console.error('[EventCalendarWorker] Error:', (err as Error).message);
    return 0;
  }
}
