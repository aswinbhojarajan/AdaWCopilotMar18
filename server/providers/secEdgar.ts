import type { ResearchProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolOk, toolError, checkRateLimit, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const EDGAR_BASE = 'https://efts.sec.gov/LATEST';
const USER_AGENT = 'AdaWealthCopilot/1.0 (ada-wealth@example.com)';

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

export const secEdgarResearchProvider: ResearchProvider = {
  name: 'sec_edgar',

  async getFilings(company: string, type?: string, limit = 10): Promise<ToolResult> {
    const start = Date.now();
    try {
      const upper = company.toUpperCase();
      const ck = cacheKey('sec_edgar', 'filings', upper, type ?? 'all', limit);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('sec_edgar', 'research_api', cached.data, start, ['cache_hit']);

      const formFilter = type ? `&forms=${type}` : '';
      const data = await edgarFetch(
        `${EDGAR_BASE}/search-index?q=%22${encodeURIComponent(upper)}%22${formFilter}&dateRange=custom&startdt=2020-01-01`,
      ) as { hits?: { hits?: Array<{ _source: Record<string, unknown> }> } };

      const hits = data.hits?.hits ?? [];
      const filings = hits.slice(0, limit).map((h) => ({
        form_type: h._source.form_type || h._source.forms,
        filing_date: h._source.file_date || h._source.period_of_report,
        entity_name: h._source.entity_name,
        description: h._source.display_names?.[0] ?? h._source.entity_name,
        file_number: h._source.file_num,
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
    const result = await this.getFilings(company, type, 1);
    return result;
  },

  async searchFilings(query: string, limit = 10): Promise<ToolResult> {
    const start = Date.now();
    try {
      const ck = cacheKey('sec_edgar', 'search', query, limit);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('sec_edgar', 'research_api', cached.data, start, ['cache_hit']);

      const data = await edgarFetch(
        `${EDGAR_BASE}/search-index?q=${encodeURIComponent(query)}&dateRange=custom&startdt=2020-01-01`,
      ) as { hits?: { hits?: Array<{ _source: Record<string, unknown> }> } };

      const hits = data.hits?.hits ?? [];
      const results = hits.slice(0, limit).map((h) => ({
        form_type: h._source.form_type || h._source.forms,
        filing_date: h._source.file_date,
        entity_name: h._source.entity_name,
        description: h._source.display_names?.[0],
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
