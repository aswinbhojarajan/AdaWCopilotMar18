import type { MacroProvider } from '../types';
import type { ToolResult, MacroIndicator } from '../../../shared/schemas/agent';
import { toolOk } from './helpers';

const MOCK_INDICATORS: Record<string, { name: string; value: number; unit: string; category: string; frequency: string }> = {
  FEDFUNDS: { name: 'Federal Funds Rate', value: 5.33, unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  DGS10: { name: '10-Year Treasury Yield', value: 4.65, unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  DGS2: { name: '2-Year Treasury Yield', value: 4.92, unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  CPIAUCSL: { name: 'Consumer Price Index (All Urban)', value: 313.2, unit: 'index_1982_100', category: 'inflation', frequency: 'monthly' },
  UNRATE: { name: 'Unemployment Rate', value: 3.7, unit: 'percent', category: 'labor', frequency: 'monthly' },
  GDP: { name: 'Gross Domestic Product', value: 27956.3, unit: 'billions_usd', category: 'output', frequency: 'quarterly' },
  GDPC1: { name: 'Real GDP Growth Rate', value: 3.3, unit: 'percent_change', category: 'output', frequency: 'quarterly' },
  DTWEXBGS: { name: 'US Dollar Index (Broad)', value: 127.85, unit: 'index', category: 'fx', frequency: 'daily' },
  VIXCLS: { name: 'CBOE Volatility Index (VIX)', value: 14.2, unit: 'index', category: 'volatility', frequency: 'daily' },
  T10Y2Y: { name: '10Y-2Y Treasury Spread', value: -0.27, unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  DCOILBRENTEU: { name: 'Brent Crude Oil Price', value: 82.10, unit: 'usd_per_barrel', category: 'commodities', frequency: 'daily' },
  GOLDAMGBD228NLBM: { name: 'Gold Price (London Fix)', value: 2148.50, unit: 'usd_per_troy_oz', category: 'commodities', frequency: 'daily' },
  UMCSENT: { name: 'Consumer Sentiment Index', value: 79.4, unit: 'index_1966_100', category: 'sentiment', frequency: 'monthly' },
  BAMLH0A0HYM2: { name: 'US High Yield Spread', value: 3.42, unit: 'percent', category: 'credit', frequency: 'daily' },
  WALCL: { name: 'Fed Balance Sheet Total Assets', value: 7720.5, unit: 'billions_usd', category: 'monetary_policy', frequency: 'weekly' },
};

function buildIndicator(seriesId: string): MacroIndicator {
  const data = MOCK_INDICATORS[seriesId.toUpperCase()];
  if (!data) {
    return {
      series_id: seriesId,
      name: seriesId,
      value: 0,
      unit: 'unknown',
      date: new Date().toISOString().split('T')[0],
      source_provider: 'mock',
      as_of: new Date().toISOString(),
    };
  }
  return {
    series_id: seriesId.toUpperCase(),
    name: data.name,
    value: data.value,
    unit: data.unit,
    date: new Date().toISOString().split('T')[0],
    frequency: data.frequency,
    source_provider: 'mock',
    as_of: new Date().toISOString(),
  };
}

export const mockMacroProvider: MacroProvider = {
  name: 'mock',

  async getIndicator(seriesId: string): Promise<ToolResult> {
    const start = Date.now();
    return toolOk('mock_macro', 'macro_api', buildIndicator(seriesId), start);
  },

  async getMultipleIndicators(seriesIds: string[]): Promise<ToolResult> {
    const start = Date.now();
    const indicators = seriesIds.map((id) => buildIndicator(id));
    return toolOk('mock_macro', 'macro_api', indicators, start);
  },

  async getAvailableIndicators(): Promise<ToolResult> {
    const start = Date.now();
    const list = Object.entries(MOCK_INDICATORS).map(([id, data]) => ({
      id,
      name: data.name,
      category: data.category,
    }));
    return toolOk('mock_macro', 'macro_api', list, start);
  },
};
