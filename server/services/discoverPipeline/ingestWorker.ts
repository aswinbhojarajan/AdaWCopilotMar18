import pool from '../../db/pool';
import { finnhubNewsProvider } from '../../providers/finnhub';

interface RawArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: string;
  category?: string;
  symbol?: string;
  source_provider: string;
}

function generateExternalId(article: RawArticle): string {
  const base = `${article.source_provider}:${article.url || article.headline}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const chr = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `fh-${Math.abs(hash).toString(36)}`;
}

function extractTickers(text: string): string[] {
  const tickerRegex = /\b[A-Z]{1,5}\b/g;
  const commonWords = new Set([
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
    'WAS', 'ONE', 'OUR', 'OUT', 'HAS', 'HAD', 'ITS', 'NOW', 'NEW', 'CEO',
    'IPO', 'GDP', 'FED', 'SEC', 'USD', 'ETF', 'API', 'NYSE', 'NASDAQ',
    'WITH', 'FROM', 'THIS', 'THAT', 'WILL', 'HAVE', 'BEEN', 'SAID', 'EACH',
    'MAKE', 'LIKE', 'LONG', 'LOOK', 'MANY', 'SOME', 'THAN', 'THEM', 'VERY',
    'WHEN', 'COME', 'JUST', 'KNOW', 'TAKE', 'INTO', 'YEAR', 'YOUR', 'GOOD',
    'OVER', 'SUCH', 'ALSO', 'BACK', 'MOST', 'ONLY', 'TELL', 'VERY', 'HERE',
  ]);
  const matches: string[] = text.match(tickerRegex) || [];
  return [...new Set(matches.filter(m => m.length >= 2 && m.length <= 5 && !commonWords.has(m)))].slice(0, 10);
}

function inferRegions(text: string): string[] {
  const regionMap: Record<string, string[]> = {
    'UAE': ['UAE', 'Dubai', 'Abu Dhabi', 'Emirati'],
    'Saudi Arabia': ['Saudi', 'Riyadh', 'KSA'],
    'GCC': ['GCC', 'Gulf', 'Bahrain', 'Kuwait', 'Oman', 'Qatar'],
    'US': ['US', 'United States', 'Wall Street', 'Federal Reserve', 'Fed '],
    'China': ['China', 'Chinese', 'Beijing', 'Shanghai'],
    'India': ['India', 'Indian', 'Mumbai', 'Sensex', 'Nifty'],
    'Europe': ['Europe', 'European', 'ECB', 'London', 'Frankfurt'],
    'Global': ['global', 'worldwide', 'international'],
  };
  const lower = text.toLowerCase();
  const regions: string[] = [];
  for (const [region, keywords] of Object.entries(regionMap)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      regions.push(region);
    }
  }
  return regions.length > 0 ? regions : ['Global'];
}

async function getLastFetchedAt(): Promise<Date | null> {
  try {
    const { rows } = await pool.query(
      `SELECT MAX(published_at) as last_fetched FROM raw_articles WHERE source_provider = 'finnhub'`,
    );
    return rows[0]?.last_fetched ? new Date(rows[0].last_fetched) : null;
  } catch {
    return null;
  }
}

export async function runIngest(): Promise<number> {
  console.log('[IngestWorker] Starting Finnhub news ingest...');
  try {
    const lastFetched = await getLastFetchedAt();
    if (lastFetched) {
      console.log(`[IngestWorker] Last fetched at: ${lastFetched.toISOString()}`);
    }
    const result = await finnhubNewsProvider.getLatestNews(50);
    if (result.status === 'error' || !result.data) {
      console.warn('[IngestWorker] Finnhub fetch failed:', result.error);
      return 0;
    }

    const articles = result.data as RawArticle[];
    let inserted = 0;

    for (const article of articles) {
      const externalId = generateExternalId(article);
      const tickers = extractTickers(`${article.headline} ${article.summary || ''}`);
      const regions = inferRegions(`${article.headline} ${article.summary || ''}`);

      try {
        const { rowCount } = await pool.query(
          `INSERT INTO raw_articles (external_id, source_provider, url, title, summary, image_url, publisher, published_at, tickers, regions, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (external_id) DO NOTHING`,
          [
            externalId,
            'finnhub',
            article.url || null,
            article.headline,
            article.summary || null,
            null,
            article.source || null,
            article.datetime ? new Date(article.datetime) : new Date(),
            tickers,
            regions,
            article.category || 'general',
          ],
        );
        if (rowCount && rowCount > 0) inserted++;
      } catch (err) {
        console.warn(`[IngestWorker] Failed to insert article: ${(err as Error).message}`);
      }
    }

    console.log(`[IngestWorker] Ingested ${inserted} new articles (${articles.length} fetched)`);
    return inserted;
  } catch (err) {
    console.error('[IngestWorker] Fatal error:', (err as Error).message);
    return 0;
  }
}
