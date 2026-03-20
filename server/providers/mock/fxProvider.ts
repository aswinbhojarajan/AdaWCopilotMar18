import type { FxProvider } from '../types';
import type { ToolResult, FxRate } from '../../../shared/schemas/agent';
import { toolOk } from './helpers';

const MOCK_RATES: Record<string, number> = {
  'USD/AED': 3.6725,
  'USD/SAR': 3.7500,
  'USD/EUR': 0.9215,
  'USD/GBP': 0.7890,
  'USD/JPY': 149.85,
  'USD/CHF': 0.8810,
  'USD/CNY': 7.2450,
  'USD/INR': 83.15,
  'USD/KWD': 0.3075,
  'USD/BHD': 0.3770,
  'USD/QAR': 3.6400,
  'USD/OMR': 0.3845,
  'USD/EGP': 30.90,
  'EUR/USD': 1.0852,
  'GBP/USD': 1.2674,
  'AED/USD': 0.2723,
  'SAR/USD': 0.2667,
};

function resolveRate(base: string, target: string): number {
  const key = `${base}/${target}`;
  if (MOCK_RATES[key]) return MOCK_RATES[key];

  const inverseKey = `${target}/${base}`;
  if (MOCK_RATES[inverseKey]) return 1 / MOCK_RATES[inverseKey];

  if (base === target) return 1;

  const baseToUsd = MOCK_RATES[`${base}/USD`] ?? (MOCK_RATES[`USD/${base}`] ? 1 / MOCK_RATES[`USD/${base}`] : undefined);
  const usdToTarget = MOCK_RATES[`USD/${target}`] ?? (MOCK_RATES[`${target}/USD`] ? 1 / MOCK_RATES[`${target}/USD`] : undefined);

  if (baseToUsd !== undefined && usdToTarget !== undefined) {
    return baseToUsd * usdToTarget;
  }

  return 1;
}

function buildFxRate(base: string, target: string): FxRate {
  const rate = resolveRate(base, target);
  return {
    base,
    target,
    rate,
    inverse_rate: +(1 / rate).toFixed(6),
    source_provider: 'mock',
    as_of: new Date().toISOString(),
  };
}

export const mockFxProvider: FxProvider = {
  name: 'mock',

  async getRate(base: string, target: string): Promise<ToolResult> {
    const start = Date.now();
    const rate = buildFxRate(base.toUpperCase(), target.toUpperCase());
    return toolOk('mock_fx', 'fx_api', rate, start);
  },

  async getRates(base: string, targets: string[]): Promise<ToolResult> {
    const start = Date.now();
    const rates = targets.map((t) => buildFxRate(base.toUpperCase(), t.toUpperCase()));
    return toolOk('mock_fx', 'fx_api', rates, start);
  },

  async getHistoricalRate(base: string, target: string, _date: string): Promise<ToolResult> {
    const start = Date.now();
    const rate = resolveRate(base.toUpperCase(), target.toUpperCase());
    const noise = 1 + (Math.random() * 0.01 - 0.005);
    const fxRate: FxRate = {
      base: base.toUpperCase(),
      target: target.toUpperCase(),
      rate: +(rate * noise).toFixed(6),
      inverse_rate: +(1 / (rate * noise)).toFixed(6),
      source_provider: 'mock',
      as_of: new Date().toISOString(),
    };
    return toolOk('mock_fx', 'fx_api', fxRate, start);
  },
};
