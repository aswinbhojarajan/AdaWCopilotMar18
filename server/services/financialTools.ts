import type OpenAI from 'openai';
import type { ProviderRegistry } from '../providers/types';
import type { ToolResult } from '../../shared/schemas/agent';
import * as wealthEngine from './wealthEngine';

export const FINANCIAL_TOOL_DEFINITIONS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getPortfolioSnapshot',
      description: 'Get the user\'s portfolio snapshot: total value, daily change, cash %, invested %, unrealized P&L, and top movers. Call this when the user asks about their portfolio value, balance, or overall performance.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getHoldings',
      description: 'Get the user\'s current holdings with instrument details: symbol, name, quantity, market value, weight %, sector, geography, asset class. Call this when the user asks about their holdings, positions, or allocation.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
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
  {
    type: 'function',
    function: {
      name: 'getHoldingsRelevantNews',
      description: 'Get news articles relevant to the user\'s portfolio holdings. Call this when the user asks about market news or what\'s happening with their investments.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of articles to return (default 5)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculatePortfolioHealth',
      description: 'Calculate a comprehensive portfolio health score with analysis of diversification, concentration risk, cash buffer, risk alignment, and position count. Call this when the user asks about portfolio health, risk, or whether their portfolio is well-balanced.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
];

export const UI_TOOL_DEFINITIONS: OpenAI.ChatCompletionTool[] = [
  {
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
  {
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
  {
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
];

function getToolName(tool: OpenAI.ChatCompletionTool): string {
  return tool.type === 'function' ? tool.function.name : '';
}

export function getToolDefinitions(allowedToolNames: string[]): OpenAI.ChatCompletionTool[] {
  const allDefs = [...FINANCIAL_TOOL_DEFINITIONS, ...UI_TOOL_DEFINITIONS];
  return allDefs.filter(t => allowedToolNames.includes(getToolName(t)));
}

export function isFinancialTool(name: string): boolean {
  return FINANCIAL_TOOL_DEFINITIONS.some(t => getToolName(t) === name);
}

export function isUiTool(name: string): boolean {
  return UI_TOOL_DEFINITIONS.some(t => getToolName(t) === name);
}

export async function executeFinancialTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  registry: ProviderRegistry,
  riskLevel: string,
): Promise<ToolResult> {
  switch (toolName) {
    case 'getPortfolioSnapshot':
      return registry.portfolio.getPortfolioSnapshot(userId);

    case 'getHoldings':
      return registry.portfolio.getHoldings(userId);

    case 'getQuotes': {
      const symbols = (args.symbols as string[]) ?? [];
      if (symbols.length === 0) {
        return { status: 'error', source_name: 'market', source_type: 'market_api', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: 'No symbols provided' };
      }
      return registry.market.getQuotes(symbols);
    }

    case 'getHoldingsRelevantNews': {
      const holdingsResult = await registry.portfolio.getHoldings(userId);
      const holdings = holdingsResult.status === 'ok' && holdingsResult.data
        ? (holdingsResult.data as Array<{ symbol: string }>).map(h => h.symbol)
        : [];
      const limit = (args.limit as number) ?? 5;
      return registry.news.getHoldingsRelevantNews(holdings, limit);
    }

    case 'calculatePortfolioHealth': {
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
    }

    default:
      return { status: 'error', source_name: 'unknown', source_type: 'unknown', as_of: new Date().toISOString(), latency_ms: 0, data: null, error: `Unknown tool: ${toolName}` };
  }
}
