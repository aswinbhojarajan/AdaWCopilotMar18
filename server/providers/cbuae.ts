import type { FxProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolOk, toolError, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';
import { frankfurterFxProvider } from './frankfurter';

const CBUAE_API = 'https://www.centralbank.ae/umbraco/Surface/Exchange/GetExchangeRateAllCurrency';

interface CbuaeRate {
  CurrencyNameEn: string;
  CurrencyCode: string;
  Rate: string;
  Date: string;
}

async function fetchCbuaeRates(): Promise<Record<string, { rate: number; date: string }>> {
  const ck = cacheKey('cbuae', 'all-rates');
  const cached = cacheGet<Record<string, { rate: number; date: string }>>(ck);
  if (cached) return cached.data;

  const resp = await fetchWithTimeout(CBUAE_API, {
    timeout: 10000,
    headers: { 'Accept': 'application/json' },
  });

  if (!resp.ok) {
    throw new Error(`CBUAE HTTP ${resp.status}: ${resp.statusText}`);
  }

  const data = await resp.json() as CbuaeRate[];
  recordProviderSuccess('cbuae');

  const rates: Record<string, { rate: number; date: string }> = {};
  for (const item of data) {
    if (item.CurrencyCode && item.Rate) {
      rates[item.CurrencyCode.toUpperCase()] = {
        rate: parseFloat(item.Rate),
        date: item.Date ?? new Date().toISOString().split('T')[0],
      };
    }
  }

  cacheSet(ck, rates, 'fx_rate');
  return rates;
}

export const cbuaeFxProvider: FxProvider = {
  name: 'cbuae',

  async getRate(base: string, target: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const b = base.toUpperCase();
      const t = target.toUpperCase();

      if (b !== 'AED' && t !== 'AED') {
        return frankfurterFxProvider.getRate(base, target);
      }

      const rates = await fetchCbuaeRates();

      const otherCurrency = b === 'AED' ? t : b;
      const rateData = rates[otherCurrency];

      if (!rateData) {
        console.warn(`CBUAE: no rate for ${otherCurrency}, falling back to Frankfurter`);
        return frankfurterFxProvider.getRate(base, target);
      }

      let rate = rateData.rate;
      if (b === 'AED') {
        rate = 1 / rate;
      }

      const result = {
        base: b,
        target: t,
        rate: Math.round(rate * 10000) / 10000,
        date: rateData.date,
        source_label: 'CBUAE reference rate',
        source_provider: 'cbuae',
        as_of: new Date().toISOString(),
      };

      return toolOk('cbuae', 'fx_api', result, start);
    } catch (error) {
      recordProviderFailure('cbuae');
      console.warn(`CBUAE failed, falling back to Frankfurter: ${error instanceof Error ? error.message : 'Unknown'}`);
      try {
        return await frankfurterFxProvider.getRate(base, target);
      } catch {
        return toolError('cbuae', 'fx_api', error instanceof Error ? error.message : 'Unknown error', start);
      }
    }
  },

  async getRates(base: string, targets: string[]): Promise<ToolResult> {
    const start = Date.now();
    try {
      const b = base.toUpperCase();

      if (b !== 'AED' && !targets.some((t) => t.toUpperCase() === 'AED')) {
        return frankfurterFxProvider.getRates(base, targets);
      }

      const rates = await fetchCbuaeRates();
      const result: Record<string, number> = {};
      const warnings: string[] = [];

      const nonAedTargets: string[] = [];

      for (const t of targets) {
        const upper = t.toUpperCase();
        if (b === 'AED') {
          const rateData = rates[upper];
          if (rateData) {
            result[upper] = Math.round((1 / rateData.rate) * 10000) / 10000;
          } else {
            warnings.push(`No CBUAE rate for AED→${upper}`);
          }
        } else if (upper === 'AED') {
          const rateData = rates[b];
          if (rateData) {
            result[upper] = Math.round(rateData.rate * 10000) / 10000;
          } else {
            warnings.push(`No CBUAE rate for ${b}→AED`);
          }
        } else {
          nonAedTargets.push(upper);
        }
      }

      if (nonAedTargets.length > 0) {
        try {
          const fbResult = await frankfurterFxProvider.getRates(base, nonAedTargets);
          if (fbResult.status === 'ok' && fbResult.data) {
            const fbData = fbResult.data as { rates?: Record<string, number> };
            if (fbData.rates) {
              for (const [k, v] of Object.entries(fbData.rates)) {
                result[k] = v;
              }
            }
          }
        } catch {
          warnings.push(`Could not fetch non-AED targets via Frankfurter: ${nonAedTargets.join(',')}`);
        }
      }

      return toolOk('cbuae', 'fx_api', {
        base: b,
        rates: result,
        source_label: 'CBUAE reference rates',
        source_provider: 'cbuae',
        as_of: new Date().toISOString(),
      }, start, warnings.length > 0 ? warnings : undefined);
    } catch (error) {
      recordProviderFailure('cbuae');
      console.warn(`CBUAE getRates failed, falling back to Frankfurter`);
      try {
        return await frankfurterFxProvider.getRates(base, targets);
      } catch {
        return toolError('cbuae', 'fx_api', error instanceof Error ? error.message : 'Unknown error', start);
      }
    }
  },

  async getHistoricalRate(base: string, target: string, date: string): Promise<ToolResult> {
    return frankfurterFxProvider.getHistoricalRate(base, target, date);
  },
};
