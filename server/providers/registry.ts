import type { ProviderRegistry, MarketProvider, NewsProvider, MacroProvider, FxProvider, ResearchProvider, IdentityProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { mockPortfolioProvider } from './mock/portfolioProvider';
import { mockMarketProvider } from './mock/marketProvider';
import { mockNewsProvider } from './mock/newsProvider';
import { mockMacroProvider } from './mock/macroProvider';
import { mockFxProvider } from './mock/fxProvider';
import { mockResearchProvider } from './mock/researchProvider';
import { mockIdentityProvider } from './mock/identityProvider';
import { finnhubMarketProvider, finnhubNewsProvider } from './finnhub';
import { fredMacroProvider } from './fred';
import { secEdgarResearchProvider } from './secEdgar';
import { openFigiIdentityProvider } from './openFigi';
import { frankfurterFxProvider } from './frankfurter';
import { cbuaeFxProvider } from './cbuae';
import { isProviderHealthy } from './helpers';

const _registryCache = new Map<string, ProviderRegistry>();

function configKey(providerConfig?: Record<string, string>): string {
  if (!providerConfig || Object.keys(providerConfig).length === 0) return '__default__';
  const sorted = Object.keys(providerConfig).sort().map((k) => `${k}=${providerConfig[k]}`);
  return sorted.join('|');
}

function withFallback<T extends { name: string }>(
  primary: T,
  fallback: T,
  domain: string,
): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (typeof val !== 'function') return val;
      return async (...args: unknown[]) => {
        if (!isProviderHealthy(primary.name)) {
          console.warn(`[${domain}] ${primary.name} unhealthy, using fallback ${fallback.name}`);
          const fn = Reflect.get(fallback, prop, fallback) as (...a: unknown[]) => Promise<ToolResult>;
          const result = await fn.apply(fallback, args) as ToolResult;
          result.warnings = [...(result.warnings ?? []), `fallback_from:${primary.name}`, `reason:unhealthy`];
          return result;
        }
        try {
          const result = await (val as (...a: unknown[]) => Promise<ToolResult>).apply(target, args);
          if (result && typeof result === 'object' && 'status' in result) {
            const r = result as ToolResult;
            if (r.status === 'error') {
              console.warn(`[${domain}] ${primary.name} returned error, trying fallback ${fallback.name}`);
              const fn = Reflect.get(fallback, prop, fallback) as (...a: unknown[]) => Promise<ToolResult>;
              const fbResult = await fn.apply(fallback, args) as ToolResult;
              fbResult.warnings = [...(fbResult.warnings ?? []), `fallback_from:${primary.name}`, `primary_error:${r.error ?? 'unknown'}`];
              return fbResult;
            }
          }
          return result;
        } catch (err) {
          console.warn(`[${domain}] ${primary.name} threw, using fallback ${fallback.name}: ${err instanceof Error ? err.message : 'unknown'}`);
          const fn = Reflect.get(fallback, prop, fallback) as (...a: unknown[]) => Promise<ToolResult>;
          const result = await fn.apply(fallback, args) as ToolResult;
          result.warnings = [...(result.warnings ?? []), `fallback_from:${primary.name}`];
          return result;
        }
      };
    },
  };
  return new Proxy(primary, handler);
}

function autoDetectProvider(domain: string): string {
  switch (domain) {
    case 'market':
      return process.env.FINNHUB_API_KEY ? 'finnhub' : 'mock';
    case 'news':
      return process.env.FINNHUB_API_KEY ? 'finnhub' : 'mock';
    case 'macro':
      return process.env.FRED_API_KEY ? 'fred' : 'mock';
    case 'fx':
      return 'frankfurter';
    case 'fx_localized':
      return 'cbuae';
    case 'research':
      return 'sec_edgar';
    case 'identity':
      return 'openfigi';
    default:
      return 'mock';
  }
}

export function getProviderRegistry(providerConfig?: Record<string, string>): ProviderRegistry {
  const key = configKey(providerConfig);
  const cached = _registryCache.get(key);
  if (cached) return cached;

  const config = providerConfig ?? {};

  const marketKey = config.market_primary ?? process.env.MARKET_PROVIDER_PRIMARY ?? autoDetectProvider('market');
  const newsKey = config.news_primary ?? process.env.NEWS_PROVIDER_PRIMARY ?? autoDetectProvider('news');
  const macroKey = config.macro_primary ?? process.env.MACRO_PROVIDER_PRIMARY ?? autoDetectProvider('macro');
  const fxKey = config.fx_primary ?? process.env.FX_PROVIDER_PRIMARY ?? autoDetectProvider('fx');
  const researchKey = config.filing_primary ?? process.env.FILING_PROVIDER_PRIMARY ?? autoDetectProvider('research');
  const identityKey = config.identity_primary ?? process.env.IDENTITY_PROVIDER_PRIMARY ?? autoDetectProvider('identity');

  const registry: ProviderRegistry = {
    portfolio: mockPortfolioProvider,
    market: withFallback(resolveMarketProvider(marketKey), mockMarketProvider, 'market'),
    news: withFallback(resolveNewsProvider(newsKey), mockNewsProvider, 'news'),
    macro: withFallback(resolveMacroProvider(macroKey), mockMacroProvider, 'macro'),
    fx: withFallback(resolveFxProvider(fxKey), mockFxProvider, 'fx'),
    research: withFallback(resolveResearchProvider(researchKey), mockResearchProvider, 'research'),
    identity: withFallback(resolveIdentityProvider(identityKey), mockIdentityProvider, 'identity'),
  };

  _registryCache.set(key, registry);
  return registry;
}

export function resetRegistry(): void {
  _registryCache.clear();
}

function resolveMarketProvider(key: string): MarketProvider {
  switch (key) {
    case 'finnhub':
      return finnhubMarketProvider;
    case 'mock':
      return mockMarketProvider;
    default:
      console.warn(`Unknown market provider '${key}', using mock`);
      return mockMarketProvider;
  }
}

function resolveNewsProvider(key: string): NewsProvider {
  switch (key) {
    case 'finnhub':
      return finnhubNewsProvider;
    case 'mock':
      return mockNewsProvider;
    default:
      console.warn(`Unknown news provider '${key}', using mock`);
      return mockNewsProvider;
  }
}

function resolveMacroProvider(key: string): MacroProvider {
  switch (key) {
    case 'fred':
      return fredMacroProvider;
    case 'mock':
      return mockMacroProvider;
    default:
      console.warn(`Unknown macro provider '${key}', using mock`);
      return mockMacroProvider;
  }
}

function resolveFxProvider(key: string): FxProvider {
  switch (key) {
    case 'frankfurter':
      return frankfurterFxProvider;
    case 'cbuae':
      return cbuaeFxProvider;
    case 'mock':
      return mockFxProvider;
    default:
      console.warn(`Unknown FX provider '${key}', using mock`);
      return mockFxProvider;
  }
}

function resolveResearchProvider(key: string): ResearchProvider {
  switch (key) {
    case 'sec_edgar':
      return secEdgarResearchProvider;
    case 'mock':
      return mockResearchProvider;
    default:
      console.warn(`Unknown research provider '${key}', using mock`);
      return mockResearchProvider;
  }
}

function resolveIdentityProvider(key: string): IdentityProvider {
  switch (key) {
    case 'openfigi':
      return openFigiIdentityProvider;
    case 'mock':
      return mockIdentityProvider;
    default:
      console.warn(`Unknown identity provider '${key}', using mock`);
      return mockIdentityProvider;
  }
}
