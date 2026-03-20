import type { ResearchProvider } from '../types';
import type { ToolResult, Filing } from '../../../shared/schemas/agent';
import { toolOk } from './helpers';

const MOCK_FILINGS: Filing[] = [
  { id: 'fil-1', company: 'NVDA', type: '10-K', title: 'NVIDIA Annual Report FY2025', filed_date: '2025-02-28', url: 'https://sec.gov/example/nvda-10k', summary: 'Record revenue of $60.9B driven by data center GPU demand. AI infrastructure remains primary growth driver.', source_provider: 'mock' },
  { id: 'fil-2', company: 'AAPL', type: '10-K', title: 'Apple Annual Report FY2025', filed_date: '2025-11-15', url: 'https://sec.gov/example/aapl-10k', summary: 'Revenue of $394B with services segment growing 15% YoY. iPhone remains largest segment at 52% of revenue.', source_provider: 'mock' },
  { id: 'fil-3', company: 'MSFT', type: '10-Q', title: 'Microsoft Q2 FY2026 Report', filed_date: '2026-01-28', url: 'https://sec.gov/example/msft-10q', summary: 'Cloud revenue grew 29% with Azure AI services contributing $2B in incremental annual revenue.', source_provider: 'mock' },
  { id: 'fil-4', company: 'TSLA', type: '10-K', title: 'Tesla Annual Report FY2025', filed_date: '2025-02-15', url: 'https://sec.gov/example/tsla-10k', summary: 'Delivered 1.8M vehicles globally. Energy storage business grew 150% YoY. Automotive margins compressed to 18.2%.', source_provider: 'mock' },
  { id: 'fil-5', company: 'META', type: '10-Q', title: 'Meta Platforms Q4 FY2025 Report', filed_date: '2026-02-05', url: 'https://sec.gov/example/meta-10q', summary: 'Ad revenue grew 22% driven by AI-powered targeting. Reality Labs losses narrowed to $3.2B for the quarter.', source_provider: 'mock' },
  { id: 'fil-6', company: 'JPM', type: '10-K', title: 'JPMorgan Chase Annual Report FY2025', filed_date: '2026-02-20', url: 'https://sec.gov/example/jpm-10k', summary: 'Net income of $52B. Trading revenue hit record levels. Consumer banking deposits grew 8% YoY.', source_provider: 'mock' },
  { id: 'fil-7', company: 'GOOGL', type: '10-Q', title: 'Alphabet Q4 FY2025 Report', filed_date: '2026-02-01', url: 'https://sec.gov/example/googl-10q', summary: 'Search revenue grew 12%. Google Cloud crossed $40B annual run rate. YouTube ad revenue up 18%.', source_provider: 'mock' },
  { id: 'fil-8', company: 'AMZN', type: '10-K', title: 'Amazon Annual Report FY2025', filed_date: '2026-02-10', url: 'https://sec.gov/example/amzn-10k', summary: 'AWS revenue reached $105B. North America retail margins improved to 6.8%. Advertising segment grew 24%.', source_provider: 'mock' },
];

export const mockResearchProvider: ResearchProvider = {
  name: 'mock',

  async getFilings(company: string, type?: string, limit = 5): Promise<ToolResult> {
    const start = Date.now();
    let results = MOCK_FILINGS.filter((f) => f.company.toUpperCase() === company.toUpperCase());
    if (type) results = results.filter((f) => f.type.toUpperCase() === type.toUpperCase());
    return toolOk('mock_research', 'research_api', results.slice(0, limit), start);
  },

  async getLatestFiling(company: string, type: string): Promise<ToolResult> {
    const start = Date.now();
    const results = MOCK_FILINGS.filter(
      (f) => f.company.toUpperCase() === company.toUpperCase() && f.type.toUpperCase() === type.toUpperCase(),
    );
    return toolOk('mock_research', 'research_api', results[0] ?? null, start);
  },

  async searchFilings(query: string, limit = 5): Promise<ToolResult> {
    const start = Date.now();
    const q = query.toLowerCase();
    const results = MOCK_FILINGS
      .filter((f) => f.title.toLowerCase().includes(q) || (f.summary?.toLowerCase().includes(q) ?? false))
      .slice(0, limit);
    return toolOk('mock_research', 'research_api', results, start);
  },
};
