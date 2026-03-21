import type { ResearchProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolOk, toolError, checkRateLimit, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const EFTS_BASE = 'https://efts.sec.gov/LATEST';
const DATA_BASE = 'https://data.sec.gov';
const USER_AGENT = 'AdaWealthCopilot/1.0 (ada-wealth@example.com)';

const TICKER_CIK_MAP = new Map<string, string>();

async function edgarFetch(url: string): Promise<unknown> {
  if (!checkRateLimit('sec_edgar', 9, 1000)) {
    throw new Error('SEC EDGAR rate limit exceeded (10 req/sec per SEC guidelines)');
  }
  const resp = await fetchWithTimeout(url, {
    timeout: 12000,
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });
  if (!resp.ok) {
    throw new Error(`SEC EDGAR HTTP ${resp.status}: ${resp.statusText}`);
  }
  const data = await resp.json();
  recordProviderSuccess('sec_edgar');
  return data;
}

async function resolveTickerToCik(ticker: string): Promise<string | null> {
  const upper = ticker.toUpperCase();
  const cached = TICKER_CIK_MAP.get(upper);
  if (cached) return cached;

  try {
    const data = await edgarFetch(`${DATA_BASE}/submissions/CIK${upper}.json`) as { cik?: string };
    if (data.cik) {
      const padded = String(data.cik).padStart(10, '0');
      TICKER_CIK_MAP.set(upper, padded);
      return padded;
    }
  } catch {
    // ticker-based CIK lookup failed, try company search
  }

  try {
    const tickerMap = await edgarFetch('https://www.sec.gov/files/company_tickers.json') as Record<string, { cik_str: number; ticker: string }>;
    for (const entry of Object.values(tickerMap)) {
      if (entry.ticker?.toUpperCase() === upper) {
        const padded = String(entry.cik_str).padStart(10, '0');
        TICKER_CIK_MAP.set(upper, padded);
        return padded;
      }
    }
  } catch {
    // fallback also failed
  }

  return null;
}

function buildFilingUrl(cik: string, accessionNumber: string, primaryDocument: string): string {
  const cleanAccession = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${parseInt(cik, 10)}/${cleanAccession}/${primaryDocument}`;
}

interface FilingSummary {
  form_type: string;
  filing_date: string;
  entity_name: string;
  description: string;
  accession_number: string;
  filing_url: string | null;
  file_number: string | null;
  source_provider: string;
  as_of: string;
}

export const secEdgarResearchProvider: ResearchProvider = {
  name: 'sec_edgar',

  async getFilings(company: string, type?: string, limit = 10): Promise<ToolResult> {
    const start = Date.now();
    try {
      const upper = company.toUpperCase();
      const ck = cacheKey('sec_edgar', 'filings', upper, type ?? 'all', limit);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('sec_edgar', 'research_api', cached.data, start, ['cache_hit:memory']);

      const cik = await resolveTickerToCik(upper);

      if (cik) {
        const subData = await edgarFetch(`${DATA_BASE}/submissions/CIK${cik}.json`) as {
          name?: string;
          filings?: {
            recent?: {
              form?: string[];
              filingDate?: string[];
              accessionNumber?: string[];
              primaryDocument?: string[];
              primaryDocDescription?: string[];
              fileNumber?: string[];
            };
          };
        };

        const recent = subData.filings?.recent;
        if (recent?.form) {
          const filings: FilingSummary[] = [];
          const forms = recent.form;
          for (let i = 0; i < forms.length && filings.length < limit; i++) {
            if (type && forms[i] !== type) continue;
            const accession = recent.accessionNumber?.[i] ?? '';
            const primaryDoc = recent.primaryDocument?.[i] ?? '';
            filings.push({
              form_type: forms[i],
              filing_date: recent.filingDate?.[i] ?? '',
              entity_name: subData.name ?? upper,
              description: recent.primaryDocDescription?.[i] ?? forms[i],
              accession_number: accession,
              filing_url: primaryDoc ? buildFilingUrl(cik, accession, primaryDoc) : null,
              file_number: recent.fileNumber?.[i] ?? null,
              source_provider: 'sec_edgar',
              as_of: new Date().toISOString(),
            });
          }

          cacheSet(ck, filings, 'filing');
          return toolOk('sec_edgar', 'research_api', filings, start);
        }
      }

      const formFilter = type ? `&forms=${type}` : '';
      const data = await edgarFetch(
        `${EFTS_BASE}/search-index?q=%22${encodeURIComponent(upper)}%22${formFilter}&dateRange=custom&startdt=2020-01-01`,
      ) as { hits?: { hits?: Array<{ _source: Record<string, unknown> }> } };

      const hits = data.hits?.hits ?? [];
      const filings = hits.slice(0, limit).map((h) => ({
        form_type: String(h._source.form_type ?? h._source.forms ?? ''),
        filing_date: String(h._source.file_date ?? h._source.period_of_report ?? ''),
        entity_name: String(h._source.entity_name ?? upper),
        description: String((h._source.display_names as string[])?.[0] ?? h._source.entity_name ?? ''),
        accession_number: String(h._source.accession_no ?? ''),
        filing_url: h._source.file_num
          ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${h._source.file_num}&type=${type ?? ''}&dateb=&owner=include&count=10`
          : null,
        file_number: h._source.file_num ? String(h._source.file_num) : null,
        source_provider: 'sec_edgar',
        as_of: new Date().toISOString(),
      }));

      cacheSet(ck, filings, 'filing');
      return toolOk('sec_edgar', 'research_api', filings, start);
    } catch (error) {
      recordProviderFailure('sec_edgar');
      return toolError('sec_edgar', 'research_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getLatestFiling(company: string, type: string): Promise<ToolResult> {
    return this.getFilings(company, type, 1);
  },

  async searchFilings(query: string, limit = 10): Promise<ToolResult> {
    const start = Date.now();
    try {
      const ck = cacheKey('sec_edgar', 'search', query, limit);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('sec_edgar', 'research_api', cached.data, start, ['cache_hit:memory']);

      const data = await edgarFetch(
        `${EFTS_BASE}/search-index?q=${encodeURIComponent(query)}&dateRange=custom&startdt=2020-01-01`,
      ) as { hits?: { hits?: Array<{ _source: Record<string, unknown> }> } };

      const hits = data.hits?.hits ?? [];
      const results = hits.slice(0, limit).map((h) => ({
        form_type: String(h._source.form_type ?? h._source.forms ?? ''),
        filing_date: String(h._source.file_date ?? ''),
        entity_name: String(h._source.entity_name ?? ''),
        description: String((h._source.display_names as string[])?.[0] ?? ''),
        accession_number: String(h._source.accession_no ?? ''),
        filing_url: h._source.file_num
          ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${h._source.file_num}`
          : null,
        file_number: h._source.file_num ? String(h._source.file_num) : null,
        source_provider: 'sec_edgar',
        as_of: new Date().toISOString(),
      }));

      cacheSet(ck, results, 'filing');
      return toolOk('sec_edgar', 'research_api', results, start);
    } catch (error) {
      recordProviderFailure('sec_edgar');
      return toolError('sec_edgar', 'research_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
