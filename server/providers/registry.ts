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
    default:
      return mockPortfolioProvider;
  }
}

function resolveMarketProvider(key?: string) {
  switch (key) {
    default:
      return mockMarketProvider;
  }
}

function resolveNewsProvider(key?: string) {
  switch (key) {
    default:
      return mockNewsProvider;
  }
}

function resolveMacroProvider(key?: string) {
  switch (key) {
    default:
      return mockMacroProvider;
  }
}

function resolveFxProvider(key?: string) {
  switch (key) {
    default:
      return mockFxProvider;
  }
}

function resolveResearchProvider(key?: string) {
  switch (key) {
    default:
      return mockResearchProvider;
  }
}

function resolveIdentityProvider(key?: string) {
  switch (key) {
    default:
      return mockIdentityProvider;
  }
}
