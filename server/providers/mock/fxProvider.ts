import type { FxProvider } from '../types';
import type { FxRate } from '../../../shared/schemas/agent';

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

function getRate(base: string, target: string): number {
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

export const mockFxProvider: FxProvider = {
  name: 'mock',

  async getRate(base: string, target: string): Promise<FxRate> {
    const rate = getRate(base.toUpperCase(), target.toUpperCase());
    return {
      base: base.toUpperCase(),
      target: target.toUpperCase(),
      rate,
      inverse_rate: +(1 / rate).toFixed(6),
      source_provider: 'mock',
      as_of: new Date().toISOString(),
    };
  },

  async getRates(base: string, targets: string[]): Promise<FxRate[]> {
    return Promise.all(targets.map((t) => this.getRate(base, t)));
  },

  async getHistoricalRate(base: string, target: string, _date: string): Promise<FxRate> {
    const rate = getRate(base.toUpperCase(), target.toUpperCase());
    const noise = 1 + (Math.random() * 0.01 - 0.005);
    return {
      base: base.toUpperCase(),
      target: target.toUpperCase(),
      rate: +(rate * noise).toFixed(6),
      inverse_rate: +(1 / (rate * noise)).toFixed(6),
      source_provider: 'mock',
      as_of: new Date().toISOString(),
    };
  },
};
