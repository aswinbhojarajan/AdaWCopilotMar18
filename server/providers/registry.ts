import type { ProviderRegistry, PortfolioProvider, MarketProvider, NewsProvider, MacroProvider, FxProvider, ResearchProvider, IdentityProvider } from './types';
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
import { yahooFinanceMarketProvider, yahooFinanceNewsProvider } from './yahooFinance';
import { isProviderHealthy } from './helpers';

const _registryCache = new Map<string, ProviderRegistry>();

function configKey(providerConfig?: Record<string, string>): string {
  if (!providerConfig || Object.keys(providerConfig).length === 0) return '__default__';
  const sorted = Object.keys(providerConfig).sort().map((k) => `${k}=${providerConfig[k]}`);
  return sorted.join('|');
}

function withFallbackChain<T extends { name: string }>(
  providers: T[],
  domain: string,
): T {
  if (providers.length === 0) throw new Error(`No providers configured for ${domain}`);
  if (providers.length === 1) return providers[0];

  const primary = providers[0];

  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (typeof val !== 'function') return val;
      return async (...args: unknown[]) => {
        for (let i = 0; i < providers.length; i++) {
          const provider = providers[i];
          const isPrimary = i === 0;
          const providerName = provider.name;

          if (!isPrimary && !isProviderHealthy(providerName)) {
            continue;
          }

          if (isPrimary && !isProviderHealthy(providerName)) {
            console.warn(`[${domain}] ${providerName} unhealthy, skipping to next in chain`);
            continue;
          }

          try {
            const fn = Reflect.get(provider, prop, provider) as (...a: unknown[]) => Promise<ToolResult>;
            const result = await fn.apply(provider, args) as ToolResult;

            if (result.status === 'error' && i < providers.length - 1) {
              console.warn(`[${domain}] ${providerName} returned error, trying next provider in chain`);
              continue;
            }

            if (!isPrimary) {
              result.warnings = [
                ...(result.warnings ?? []),
                `fallback_chain:${providers.slice(0, i + 1).map((p) => p.name).join('->')}`,
                `primary_skipped:${primary.name}`,
              ];
            }

            return result;
          } catch (err) {
            console.warn(`[${domain}] ${providerName} threw: ${err instanceof Error ? err.message : 'unknown'}`);
            if (i < providers.length - 1) continue;
            throw err;
          }
        }

        const lastProvider = providers[providers.length - 1];
        const fn = Reflect.get(lastProvider, prop, lastProvider) as (...a: unknown[]) => Promise<ToolResult>;
        const result = await fn.apply(lastProvider, args) as ToolResult;
        result.warnings = [
          ...(result.warnings ?? []),
          `fallback_chain:all_providers_failed_or_unhealthy`,
        ];
        return result;
      };
    },
  };
  return new Proxy(primary, handler);
}

function getChainKeys(domain: string, config: Record<string, string>): string[] {
  const envPrefix = domain.toUpperCase();

  const primary = config[`${domain}_primary`]
    ?? process.env[`${envPrefix}_PROVIDER_PRIMARY`]
    ?? 'mock';
  const secondary = config[`${domain}_secondary`]
    ?? process.env[`${envPrefix}_PROVIDER_SECONDARY`]
    ?? undefined;
  const fallback = config[`${domain}_fallback`]
    ?? process.env[`${envPrefix}_PROVIDER_FALLBACK`]
    ?? undefined;

  const chain = [primary];
  if (secondary && secondary !== primary) chain.push(secondary);
  if (fallback && !chain.includes(fallback)) chain.push(fallback);
  if (!chain.includes('mock')) chain.push('mock');

  return chain;
}

export function getProviderRegistry(providerConfig?: Record<string, string>): ProviderRegistry {
  const key = configKey(providerConfig);
  const cached = _registryCache.get(key);
  if (cached) return cached;

  const config = providerConfig ?? {};

  const portfolioChain = getChainKeys('portfolio', config).map(resolvePortfolioProvider);
  const marketChain = getChainKeys('market', config).map(resolveMarketProvider);
  const newsChain = getChainKeys('news', config).map(resolveNewsProvider);
  const macroChain = getChainKeys('macro', config).map(resolveMacroProvider);
  const fxChain = getChainKeys('fx', config).map(resolveFxProvider);
  const researchChain = getChainKeys('filing', config).map(resolveResearchProvider);
  const identityChain = getChainKeys('identity', config).map(resolveIdentityProvider);

  const fxLocalizedKey = config.fx_localized
    ?? process.env.FX_PROVIDER_LOCALIZED
    ?? 'cbuae';
  const fxLocalizedChain = [resolveFxProvider(fxLocalizedKey)];
  if (!fxLocalizedChain.some((p) => p.name === 'frankfurter')) {
    fxLocalizedChain.push(frankfurterFxProvider);
  }
  if (!fxLocalizedChain.some((p) => p.name === 'mock')) {
    fxLocalizedChain.push(mockFxProvider);
  }

  const registry: ProviderRegistry = {
    portfolio: withFallbackChain(portfolioChain, 'portfolio'),
    market: withFallbackChain(marketChain, 'market'),
    news: withFallbackChain(newsChain, 'news'),
    macro: withFallbackChain(macroChain, 'macro'),
    fx: withFallbackChain(fxChain, 'fx'),
    fxLocalized: withFallbackChain(fxLocalizedChain, 'fx_localized'),
    research: withFallbackChain(researchChain, 'research'),
    identity: withFallbackChain(identityChain, 'identity'),
  };

  _registryCache.set(key, registry);
  return registry;
}

export function resetRegistry(): void {
  _registryCache.clear();
}

function resolvePortfolioProvider(key: string): PortfolioProvider {
  switch (key) {
    case 'demo_db':
    case 'mock':
      return mockPortfolioProvider;
    default:
      console.warn(`Unknown portfolio provider '${key}', using mock`);
      return mockPortfolioProvider;
  }
}

function resolveMarketProvider(key: string): MarketProvider {
  switch (key) {
    case 'finnhub':
      return finnhubMarketProvider;
    case 'yahoo_finance':
      return yahooFinanceMarketProvider;
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
    case 'yahoo_finance':
      return yahooFinanceNewsProvider;
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
