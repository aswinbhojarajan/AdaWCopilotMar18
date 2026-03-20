import type { ProviderRegistry } from './types';
import { mockPortfolioProvider } from './mock/portfolioProvider';
import { mockMarketProvider } from './mock/marketProvider';
import { mockNewsProvider } from './mock/newsProvider';
import { mockMacroProvider } from './mock/macroProvider';
import { mockFxProvider } from './mock/fxProvider';
import { mockResearchProvider } from './mock/researchProvider';
import { mockIdentityProvider } from './mock/identityProvider';

const _registryCache = new Map<string, ProviderRegistry>();

function configKey(providerConfig?: Record<string, string>): string {
  if (!providerConfig || Object.keys(providerConfig).length === 0) return '__default__';
  const sorted = Object.keys(providerConfig).sort().map((k) => `${k}=${providerConfig[k]}`);
  return sorted.join('|');
}

export function getProviderRegistry(providerConfig?: Record<string, string>): ProviderRegistry {
  const key = configKey(providerConfig);
  const cached = _registryCache.get(key);
  if (cached) return cached;

  const config = providerConfig ?? {};

  const registry: ProviderRegistry = {
    portfolio: resolvePortfolioProvider(config.portfolio_primary),
    market: resolveMarketProvider(config.market_primary),
    news: resolveNewsProvider(config.news_primary),
    macro: resolveMacroProvider(config.macro_primary),
    fx: resolveFxProvider(config.fx_primary),
    research: resolveResearchProvider(config.filing_primary),
    identity: resolveIdentityProvider(config.identity_primary),
  };

  _registryCache.set(key, registry);
  return registry;
}

export function resetRegistry(): void {
  _registryCache.clear();
}

function resolvePortfolioProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockPortfolioProvider;
    default:
      // TODO: Wire real provider (e.g. 'custodian_api') when available
      console.warn(`Unknown portfolio provider '${key}', falling back to mock`);
      return mockPortfolioProvider;
  }
}

function resolveMarketProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockMarketProvider;
    case 'finnhub':
      // TODO: Wire FinnhubMarketProvider when Task #3 lands
      console.warn(`Finnhub market provider not yet implemented, falling back to mock`);
      return mockMarketProvider;
    default:
      console.warn(`Unknown market provider '${key}', falling back to mock`);
      return mockMarketProvider;
  }
}

function resolveNewsProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockNewsProvider;
    case 'finnhub':
      // TODO: Wire FinnhubNewsProvider when Task #3 lands
      console.warn(`Finnhub news provider not yet implemented, falling back to mock`);
      return mockNewsProvider;
    default:
      console.warn(`Unknown news provider '${key}', falling back to mock`);
      return mockNewsProvider;
  }
}

function resolveMacroProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockMacroProvider;
    case 'fred':
      // TODO: Wire FRED macro provider when Task #3 lands
      console.warn(`FRED macro provider not yet implemented, falling back to mock`);
      return mockMacroProvider;
    default:
      console.warn(`Unknown macro provider '${key}', falling back to mock`);
      return mockMacroProvider;
  }
}

function resolveFxProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockFxProvider;
    case 'frankfurter':
      // TODO: Wire Frankfurter FX provider when Task #3 lands
      console.warn(`Frankfurter FX provider not yet implemented, falling back to mock`);
      return mockFxProvider;
    case 'cbuae':
      // TODO: Wire CBUAE FX provider when Task #3 lands
      console.warn(`CBUAE FX provider not yet implemented, falling back to mock`);
      return mockFxProvider;
    default:
      console.warn(`Unknown FX provider '${key}', falling back to mock`);
      return mockFxProvider;
  }
}

function resolveResearchProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockResearchProvider;
    case 'sec_edgar':
      // TODO: Wire SEC EDGAR provider when Task #3 lands
      console.warn(`SEC EDGAR research provider not yet implemented, falling back to mock`);
      return mockResearchProvider;
    default:
      console.warn(`Unknown research provider '${key}', falling back to mock`);
      return mockResearchProvider;
  }
}

function resolveIdentityProvider(key?: string) {
  switch (key) {
    case 'mock':
    case undefined:
      return mockIdentityProvider;
    default:
      console.warn(`Unknown identity provider '${key}', falling back to mock`);
      return mockIdentityProvider;
  }
}
