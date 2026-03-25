import type OpenAI from 'openai';
import type { ProviderRegistry } from '../providers/types';
import type { ToolResult } from '../../shared/schemas/agent';
import type { ToolGroup } from './modelRouter';
import * as wealthEngine from './wealthEngine';

export interface ToolSuggestionRule {
  forIntents?: string[];
  forIntentWithKeywords?: Array<{ intent: string; keywords: string[] }>;
  forKeywords?: string[];
  forKeywordsWithTicker?: string[];
}

const INTENT_TOOL_ORDER: Record<string, string[]> = {
  recommendation_request: ['calculatePortfolioHealth', 'getPortfolioSnapshot', 'getHoldings'],
  execution_request: ['route_to_advisor', 'getPortfolioSnapshot'],
};

export type ToolExecutor = (
  args: Record<string, unknown>,
  userId: string,
  registry: ProviderRegistry,
  riskLevel: string,
) => Promise<ToolResult>;

export interface ToolManifest {
  name: string;
  group: ToolGroup;
  profile: string;
  definition: OpenAI.ChatCompletionTool;
  execute: ToolExecutor;
  suggestions?: ToolSuggestionRule;
  prefetch?: boolean;
}

const MANIFESTS: ToolManifest[] = [
  {
    name: 'getPortfolioSnapshot',
    group: 'financial_data',
    profile: 'portfolio_read',
    definition: {
      type: 'function',
      function: {
        name: 'getPortfolioSnapshot',
        description: 'Get the user\'s portfolio snapshot: total value, daily change, cash %, invested %, unrealized P&L, and top movers. Call this when the user asks about their portfolio value, balance, or overall performance.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async (_args, userId, registry) => registry.portfolio.getPortfolioSnapshot(userId),
    prefetch: true,
    suggestions: {
      forIntents: [
        'balance_query', 'portfolio_explain', 'allocation_breakdown',
        'goal_progress', 'scenario_analysis', 'recommendation_request', 'execution_request',
      ],
    },
  },

  {
    name: 'getHoldings',
    group: 'financial_data',
    profile: 'portfolio_read',
    definition: {
      type: 'function',
      function: {
        name: 'getHoldings',
        description: 'Get the user\'s current holdings with instrument details: symbol, name, quantity, market value, weight %, sector, geography, asset class. Call this when the user asks about their holdings, positions, or allocation.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async (_args, userId, registry) => registry.portfolio.getHoldings(userId),
    prefetch: true,
    suggestions: {
      forIntents: ['portfolio_explain', 'allocation_breakdown', 'recommendation_request'],
    },
  },

  {
    name: 'getQuotes',
    group: 'market_intel',
    profile: 'market_read',
    definition: {
      type: 'function',
      function: {
        name: 'getQuotes',
        description: 'Get real-time market quotes for given symbols: last price, daily change %, volume, high/low. Call this when the user asks about stock prices or market data.',
        parameters: {
          type: 'object',
          properties: {
            symbols: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of ticker symbols to get quotes for (e.g., ["AAPL", "NVDA", "BTC"])',
            },
          },
          required: ['symbols'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const symbols = (args.symbols as string[]) ?? [];
      if (symbols.length === 0) {
        return { status: 'error', source_name: 'market', source_type: 'market_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No symbols provided' };
      }
      return registry.market.getQuotes(symbols);
    },
    suggestions: {
      forIntentWithKeywords: [
        { intent: 'market_context', keywords: ['__TICKER__'] },
        { intent: 'news_explain', keywords: ['__TICKER__'] },
      ],
    },
  },

  {
    name: 'getHoldingsRelevantNews',
    group: 'market_intel',
    profile: 'news_read',
    definition: {
      type: 'function',
      function: {
        name: 'getHoldingsRelevantNews',
        description: 'Get news articles relevant to the user\'s portfolio holdings. Call this when the user asks about market news or what\'s happening with their investments.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of articles to return (default 5)' },
          },
          required: [],
        },
      },
    },
    execute: async (args, userId, registry) => {
      const holdingsResult = await registry.portfolio.getHoldings(userId);
      const holdings = holdingsResult.status === 'ok' && holdingsResult.data
        ? (holdingsResult.data as Array<{ symbol: string }>).map(h => h.symbol)
        : [];
      const limit = (args.limit as number) ?? 5;
      return registry.news.getHoldingsRelevantNews(holdings, limit);
    },
    suggestions: {
      forIntents: ['news_explain'],
    },
  },

  {
    name: 'getHistoricalPrices',
    group: 'market_intel',
    profile: 'market_read',
    definition: {
      type: 'function',
      function: {
        name: 'getHistoricalPrices',
        description: 'Get historical price data for a stock or ETF over a specified number of days. Call this when the user asks about price history, trends, or charts for a specific instrument.',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'The ticker symbol (e.g., "AAPL", "NVDA")' },
            days: { type: 'number', description: 'Number of days of history to retrieve (e.g., 7, 30, 90, 365). Default 30.' },
          },
          required: ['symbol'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const symbol = (args.symbol as string) ?? '';
      const days = (args.days as number) ?? 30;
      if (!symbol) {
        return { status: 'error', source_name: 'market', source_type: 'market_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No symbol provided' };
      }
      return registry.market.getHistoricalPrices(symbol, days);
    },
    suggestions: {
      forKeywords: ['history', 'historical', 'chart', 'trend', 'past', 'performance over'],
    },
  },

  {
    name: 'getCompanyProfile',
    group: 'market_intel',
    profile: 'market_read',
    definition: {
      type: 'function',
      function: {
        name: 'getCompanyProfile',
        description: 'Get detailed company information: name, industry, sector, market cap, exchange, country, website. Call this when the user asks about a specific company or wants background on a stock.',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'The ticker symbol (e.g., "AAPL", "MSFT")' },
          },
          required: ['symbol'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const symbol = (args.symbol as string) ?? '';
      if (!symbol) {
        return { status: 'error', source_name: 'market', source_type: 'market_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No symbol provided' };
      }
      return registry.market.getCompanyProfile(symbol);
    },
    suggestions: {
      forKeywordsWithTicker: ['company', 'profile', 'about', 'what is', 'who is', 'tell me about'],
    },
  },

  {
    name: 'getMacroIndicator',
    group: 'market_intel',
    profile: 'macro_read',
    definition: {
      type: 'function',
      function: {
        name: 'getMacroIndicator',
        description: 'Get macroeconomic indicators from FRED: inflation (CPI), GDP, unemployment, treasury yields, Fed Funds Rate, VIX, oil/gold prices, consumer sentiment, and more. Call this when the user asks about the economy, interest rates, inflation, macro outlook, or market conditions.',
        parameters: {
          type: 'object',
          properties: {
            seriesIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'FRED series IDs to fetch. Common: FEDFUNDS (Fed rate), DGS10 (10Y yield), DGS2 (2Y yield), CPIAUCSL (CPI), UNRATE (unemployment), GDP, T10Y2Y (yield curve), VIXCLS (VIX), DCOILBRENTEU (oil), GOLDAMGBD228NLBM (gold), UMCSENT (consumer sentiment)',
            },
          },
          required: ['seriesIds'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const seriesIds = (args.seriesIds as string[]) ?? [];
      if (seriesIds.length === 0) {
        return { status: 'error', source_name: 'macro', source_type: 'macro_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No series IDs provided' };
      }
      if (seriesIds.length === 1) {
        return registry.macro.getIndicator(seriesIds[0]);
      }
      return registry.macro.getMultipleIndicators(seriesIds);
    },
    suggestions: {
      forIntentWithKeywords: [
        {
          intent: 'market_context',
          keywords: [
            'inflat', 'gdp', 'interest rate', 'yield', 'fed', 'cpi',
            'unemployment', 'economy', 'macro', 'vix', 'oil', 'gold', 'treasury',
          ],
        },
      ],
    },
  },

  {
    name: 'getCompanyFilings',
    group: 'market_intel',
    profile: 'research_read',
    definition: {
      type: 'function',
      function: {
        name: 'getCompanyFilings',
        description: 'Search SEC EDGAR for company filings (10-K, 10-Q, 8-K, etc.) and XBRL financial facts (revenue, net income, assets). Call this when the user asks about SEC filings, annual reports, quarterly earnings filings, or fundamental financial data from regulatory filings.',
        parameters: {
          type: 'object',
          properties: {
            company: { type: 'string', description: 'Company ticker symbol (e.g., "AAPL") or name' },
            type: { type: 'string', description: 'Filing type filter: "10-K" (annual), "10-Q" (quarterly), "8-K" (current events), "DEF 14A" (proxy). Omit for all types.' },
            includeFacts: { type: 'boolean', description: 'If true, also fetch XBRL financial facts (revenue, net income, EPS, assets, liabilities). Default false.' },
            limit: { type: 'number', description: 'Max number of filings to return. Default 5.' },
          },
          required: ['company'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const company = (args.company as string) ?? '';
      const filingType = args.type as string | undefined;
      const includeFacts = (args.includeFacts as boolean) ?? false;
      const filingLimit = (args.limit as number) ?? 5;
      if (!company) {
        return { status: 'error', source_name: 'research', source_type: 'research_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No company provided' };
      }
      const filingsResult = await registry.research.getFilings(company, filingType, filingLimit);
      if (includeFacts) {
        const factsResult = await registry.research.getCompanyFacts(company);
        if (factsResult.status === 'ok') {
          return {
            ...filingsResult,
            data: { filings: filingsResult.data, facts: factsResult.data },
          };
        }
      }
      return filingsResult;
    },
    suggestions: {
      forIntentWithKeywords: [
        {
          intent: 'news_explain',
          keywords: ['filing', '10-k', '10-q', '8-k', 'sec', 'annual report', 'quarterly'],
        },
      ],
    },
  },

  {
    name: 'lookupInstrument',
    group: 'market_intel',
    profile: 'research_read',
    definition: {
      type: 'function',
      function: {
        name: 'lookupInstrument',
        description: 'Look up a financial instrument by ticker, ISIN, CUSIP, or FIGI to get standardized identifiers and exchange information. Call this when the user asks about an instrument identifier, wants to verify a security, or needs to map between different ID systems.',
        parameters: {
          type: 'object',
          properties: {
            queries: {
              type: 'array',
              items: { type: 'string' },
              description: 'Instrument identifiers to resolve (tickers like "AAPL", ISINs like "US0378331005", CUSIPs, or FIGIs)',
            },
          },
          required: ['queries'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const queries = (args.queries as string[]) ?? [];
      if (queries.length === 0) {
        return { status: 'error', source_name: 'identity', source_type: 'identity_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No queries provided' };
      }
      if (queries.length === 1) {
        return registry.identity.resolveInstrument(queries[0]);
      }
      return registry.identity.resolveMultiple(queries);
    },
    suggestions: {
      forKeywords: ['isin', 'cusip', 'figi', 'identifier', 'look up', 'lookup'],
    },
  },

  {
    name: 'getFxRate',
    group: 'market_intel',
    profile: 'fx_read',
    definition: {
      type: 'function',
      function: {
        name: 'getFxRate',
        description: 'Get current or historical foreign exchange rates. Supports all major currencies including AED (UAE Dirham) via CBUAE and global rates via ECB. Call this when the user asks about currency conversion, exchange rates, or FX.',
        parameters: {
          type: 'object',
          properties: {
            base: { type: 'string', description: 'Base currency code (e.g., "USD", "AED", "EUR")' },
            target: { type: 'string', description: 'Target currency code (e.g., "AED", "USD", "GBP")' },
            date: { type: 'string', description: 'Optional date for historical rate in YYYY-MM-DD format. Omit for latest rate.' },
          },
          required: ['base', 'target'],
        },
      },
    },
    execute: async (args, _userId, registry) => {
      const base = (args.base as string) ?? '';
      const target = (args.target as string) ?? '';
      const date = args.date as string | undefined;
      if (!base || !target) {
        return { status: 'error', source_name: 'fx', source_type: 'fx_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'Both base and target currencies are required' };
      }
      const isAed = base.toUpperCase() === 'AED' || target.toUpperCase() === 'AED';
      if (isAed) {
        const localResult = date
          ? await registry.fxLocalized.getHistoricalRate(base, target, date)
          : await registry.fxLocalized.getRate(base, target);
        if (localResult.status === 'ok') return localResult;
        const fallbackResult = date
          ? await registry.fx.getHistoricalRate(base, target, date)
          : await registry.fx.getRate(base, target);
        return fallbackResult;
      }
      const fxProvider = registry.fx;
      if (date) {
        return fxProvider.getHistoricalRate(base, target, date);
      }
      return fxProvider.getRate(base, target);
    },
    suggestions: {
      forIntentWithKeywords: [
        {
          intent: 'market_context',
          keywords: [
            'currency', 'exchange rate', 'fx', 'convert',
            'aed', 'dirham', 'usd to', 'eur to', 'gbp to',
          ],
        },
      ],
    },
  },

  {
    name: 'calculatePortfolioHealth',
    group: 'financial_data',
    profile: 'health_compute',
    definition: {
      type: 'function',
      function: {
        name: 'calculatePortfolioHealth',
        description: 'Calculate a comprehensive portfolio health score with analysis of diversification, concentration risk, cash buffer, risk alignment, and position count. Call this when the user asks about portfolio health, risk, or whether their portfolio is well-balanced.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    execute: async (_args, userId, registry, riskLevel) => {
      const [snapshot, holdings] = await Promise.all([
        registry.portfolio.getPortfolioSnapshot(userId),
        registry.portfolio.getHoldings(userId),
      ]);
      const healthResult = wealthEngine.calculateHealthScore(holdings, snapshot, riskLevel);
      const concentration = wealthEngine.analyzeConcentration(holdings);
      const allocation = wealthEngine.computeAllocationBreakdown(holdings, snapshot);
      return {
        status: 'ok',
        source_name: 'wealth_engine',
        source_type: 'wealth_engine',
        as_of: new Date().toISOString(),
        latency_ms: 0,
        data: {
          health: healthResult,
          concentration,
          allocation: {
            by_asset_class: allocation.by_asset_class,
            cash_pct: allocation.cash_pct,
            invested_pct: allocation.invested_pct,
            total_value: allocation.total_value,
          },
        },
      };
    },
    suggestions: {
      forIntents: ['recommendation_request'],
      forIntentWithKeywords: [
        {
          intent: 'portfolio_explain',
          keywords: ['health', 'risk', 'diversif', 'rebalance'],
        },
      ],
    },
  },

  {
    name: 'route_to_advisor',
    group: 'crm_actions',
    profile: 'execution_route',
    definition: {
      type: 'function',
      function: {
        name: 'route_to_advisor',
        description: 'Route an action request to the user\'s advisor (Relationship Manager) for review and execution. Call this when the user confirms they want to proceed with a trade, rebalance, transfer, or any financial action. You CANNOT execute trades yourself — this tool sends the plan to the advisor.',
        parameters: {
          type: 'object',
          properties: {
            action_type: {
              type: 'string',
              enum: ['rebalance', 'buy', 'sell', 'transfer', 'allocation_change', 'other'],
              description: 'The type of action the user wants to execute',
            },
            summary: {
              type: 'string',
              description: 'A brief summary of what the user wants to do (e.g., "Rebalance portfolio to 60% equities, 30% bonds, 10% cash")',
            },
            details: {
              type: 'object',
              description: 'Detailed action parameters (instruments, quantities, target allocations, etc.)',
              additionalProperties: true,
            },
          },
          required: ['action_type', 'summary'],
        },
      },
    },
    execute: async () => {
      return { status: 'error', source_name: 'rm_handoff', source_type: 'execution_routing', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'route_to_advisor is handled by the orchestrator directly' };
    },
    suggestions: {
      forIntents: ['execution_request'],
    },
  },

  {
    name: 'show_simulator',
    group: 'ui_actions',
    profile: 'workflow_light',
    definition: {
      type: 'function',
      function: {
        name: 'show_simulator',
        description: 'Show an interactive financial scenario simulator to the user. Use when the user wants to model retirement, investment growth, spending projections, or tax scenarios.',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['retirement', 'investment', 'spending', 'tax'],
              description: 'The type of scenario simulator to show',
            },
            initialValues: {
              type: 'object',
              description: 'Initial values for the simulator sliders',
              additionalProperties: { type: 'number' },
            },
          },
          required: ['type'],
        },
      },
    },
    execute: async () => {
      return { status: 'ok', source_name: 'ui', source_type: 'ui_action', as_of: new Date().toISOString(), latency_ms: 0, data: { rendered: true } };
    },
    suggestions: {
      forIntents: ['scenario_analysis'],
      forKeywords: ['simulat', 'retire', 'what if'],
    },
  },

  {
    name: 'show_widget',
    group: 'ui_actions',
    profile: 'workflow_light',
    definition: {
      type: 'function',
      function: {
        name: 'show_widget',
        description: 'Show an embedded data widget in the chat. Use to display portfolio allocation, holdings summary, or goal progress visually.',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['allocation_chart', 'holdings_summary', 'goal_progress', 'portfolio_summary'],
              description: 'The type of widget to display',
            },
          },
          required: ['type'],
        },
      },
    },
    execute: async () => {
      return { status: 'ok', source_name: 'ui', source_type: 'ui_action', as_of: new Date().toISOString(), latency_ms: 0, data: { rendered: true } };
    },
  },

  {
    name: 'extract_user_fact',
    group: 'ui_actions',
    profile: 'workflow_light',
    definition: {
      type: 'function',
      function: {
        name: 'extract_user_fact',
        description: 'Extract and remember a personal fact or preference the user shared. Use when the user reveals something about themselves like life events, preferences, risk tolerance changes, or financial goals.',
        parameters: {
          type: 'object',
          properties: {
            fact: { type: 'string', description: 'The fact to remember about the user' },
            category: {
              type: 'string',
              enum: ['preference', 'life_event', 'financial_goal', 'risk_tolerance', 'general'],
              description: 'Category of the fact',
            },
          },
          required: ['fact', 'category'],
        },
      },
    },
    execute: async () => {
      return { status: 'ok', source_name: 'memory', source_type: 'memory_action', as_of: new Date().toISOString(), latency_ms: 0, data: { extracted: true } };
    },
  },
];

const _manifestMap = new Map<string, ToolManifest>();
const _allToolNames: string[] = [];
const _toolGroupMap: Record<string, ToolGroup> = {};
const _profileToolMap: Record<string, string[]> = {};
const _allDefinitions: OpenAI.ChatCompletionTool[] = [];

const _intentToolMap = new Map<string, string[]>();
const _intentKeywordToolMap = new Map<string, Array<{ keywords: string[]; toolName: string }>>();
const _globalKeywordTools: Array<{ keywords: string[]; toolName: string }> = [];
const _globalKeywordWithTickerTools: Array<{ keywords: string[]; toolName: string }> = [];
const _tickerIntentTools: Array<{ intent: string; toolName: string }> = [];

function buildDerivedState(): void {
  _manifestMap.clear();
  _allToolNames.length = 0;
  _allDefinitions.length = 0;
  _intentToolMap.clear();
  _intentKeywordToolMap.clear();
  _globalKeywordTools.length = 0;
  _globalKeywordWithTickerTools.length = 0;
  _tickerIntentTools.length = 0;

  for (const key of Object.keys(_toolGroupMap)) delete _toolGroupMap[key];
  for (const key of Object.keys(_profileToolMap)) delete _profileToolMap[key];

  for (const m of MANIFESTS) {
    _manifestMap.set(m.name, m);
    _allToolNames.push(m.name);
    _toolGroupMap[m.name] = m.group;
    _allDefinitions.push(m.definition);

    if (!_profileToolMap[m.profile]) _profileToolMap[m.profile] = [];
    _profileToolMap[m.profile].push(m.name);

    if (m.suggestions) {
      if (m.suggestions.forIntents) {
        for (const intent of m.suggestions.forIntents) {
          if (!_intentToolMap.has(intent)) _intentToolMap.set(intent, []);
          _intentToolMap.get(intent)!.push(m.name);
        }
      }
      if (m.suggestions.forIntentWithKeywords) {
        for (const rule of m.suggestions.forIntentWithKeywords) {
          if (rule.keywords.length === 1 && rule.keywords[0] === '__TICKER__') {
            _tickerIntentTools.push({ intent: rule.intent, toolName: m.name });
          } else {
            if (!_intentKeywordToolMap.has(rule.intent)) _intentKeywordToolMap.set(rule.intent, []);
            _intentKeywordToolMap.get(rule.intent)!.push({ keywords: rule.keywords, toolName: m.name });
          }
        }
      }
      if (m.suggestions.forKeywords) {
        _globalKeywordTools.push({ keywords: m.suggestions.forKeywords, toolName: m.name });
      }
      if (m.suggestions.forKeywordsWithTicker) {
        _globalKeywordWithTickerTools.push({ keywords: m.suggestions.forKeywordsWithTicker, toolName: m.name });
      }
    }
  }
}

buildDerivedState();

export function getAllToolNames(): string[] {
  return _allToolNames;
}

export function getProfileToolMap(): Record<string, string[]> {
  return _profileToolMap;
}

export function getToolGroupForName(toolName: string): ToolGroup | undefined {
  return _toolGroupMap[toolName];
}

export function filterToolNamesByGroups(
  toolNames: string[],
  allowedGroups: ToolGroup[],
): string[] {
  if (allowedGroups.length === 0) return [];
  const groupSet = new Set<ToolGroup>(allowedGroups);
  return toolNames.filter(name => {
    const group = _toolGroupMap[name];
    return group !== undefined && groupSet.has(group);
  });
}

export function getToolDefinitions(allowedToolNames: string[]): OpenAI.ChatCompletionTool[] {
  return _allDefinitions.filter(t =>
    allowedToolNames.includes(t.type === 'function' ? t.function.name : ''),
  );
}

export function getAllToolDefinitions(): OpenAI.ChatCompletionTool[] {
  return _allDefinitions;
}

export function isFinancialTool(name: string): boolean {
  const manifest = _manifestMap.get(name);
  return manifest !== undefined && (manifest.group === 'financial_data' || manifest.group === 'market_intel' || manifest.group === 'crm_actions');
}

export function isUiTool(name: string): boolean {
  const manifest = _manifestMap.get(name);
  return manifest !== undefined && manifest.group === 'ui_actions';
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  registry: ProviderRegistry,
  riskLevel: string,
): Promise<ToolResult> {
  const manifest = _manifestMap.get(toolName);
  if (!manifest) {
    return {
      status: 'error',
      source_name: 'unknown',
      source_type: 'unknown',
      as_of: new Date().toISOString(),
      latency_ms: 0,
      data: null,
      error: `Unknown tool: ${toolName}`,
    };
  }
  return manifest.execute(args, userId, registry, riskLevel);
}

export function inferSuggestedTools(
  intent: string,
  message: string,
): string[] {
  const tools: string[] = [];
  const lower = message.toLowerCase();
  const hasTicker = /\b[A-Z]{2,5}\b/.test(message);

  const explicitOrder = INTENT_TOOL_ORDER[intent];
  if (explicitOrder) {
    const intentDefaults = _intentToolMap.get(intent);
    const defaultSet = new Set(intentDefaults ?? []);
    for (const name of explicitOrder) {
      if (defaultSet.has(name)) {
        tools.push(name);
      }
    }
    if (intentDefaults) {
      for (const name of intentDefaults) {
        if (!tools.includes(name)) tools.push(name);
      }
    }
  } else {
    const intentDefaults = _intentToolMap.get(intent);
    if (intentDefaults) {
      tools.push(...intentDefaults);
    }
  }

  if (hasTicker) {
    for (const entry of _tickerIntentTools) {
      if (entry.intent === intent && !tools.includes(entry.toolName)) {
        tools.push(entry.toolName);
      }
    }
  }

  const intentKeywordRules = _intentKeywordToolMap.get(intent);
  if (intentKeywordRules) {
    for (const rule of intentKeywordRules) {
      if (rule.keywords.some(kw => lower.includes(kw)) && !tools.includes(rule.toolName)) {
        tools.push(rule.toolName);
      }
    }
  }

  for (const rule of _globalKeywordTools) {
    if (rule.keywords.some(kw => lower.includes(kw)) && !tools.includes(rule.toolName)) {
      tools.push(rule.toolName);
    }
  }

  for (const rule of _globalKeywordWithTickerTools) {
    if (hasTicker && rule.keywords.some(kw => lower.includes(kw)) && !tools.includes(rule.toolName)) {
      tools.push(rule.toolName);
    }
  }

  return tools;
}

export function getPrefetchableToolNames(): string[] {
  return MANIFESTS.filter(m => m.prefetch === true).map(m => m.name);
}

export function getManifest(name: string): ToolManifest | undefined {
  return _manifestMap.get(name);
}

export function getAllManifests(): ToolManifest[] {
  return MANIFESTS;
}

export function validateRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const m of MANIFESTS) {
    const defName = m.definition.type === 'function' ? m.definition.function.name : '';
    if (defName !== m.name) {
      errors.push(`Tool "${m.name}": OpenAI definition name "${defName}" does not match manifest name`);
    }

    if (typeof m.execute !== 'function') {
      errors.push(`Tool "${m.name}": execute handler is not a function`);
    }

    const validGroups: ToolGroup[] = ['financial_data', 'market_intel', 'ui_actions', 'crm_actions'];
    if (!validGroups.includes(m.group)) {
      errors.push(`Tool "${m.name}": invalid group "${m.group}"`);
    }

    if (!m.profile) {
      errors.push(`Tool "${m.name}": missing profile`);
    }
  }

  const names = MANIFESTS.map(m => m.name);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    errors.push(`Duplicate tool names: ${dupes.join(', ')}`);
  }

  const profileKeys = Object.keys(_profileToolMap);
  for (const profile of profileKeys) {
    const toolsInProfile = _profileToolMap[profile];
    for (const toolName of toolsInProfile) {
      if (!_manifestMap.has(toolName)) {
        errors.push(`Profile "${profile}" references unknown tool "${toolName}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
