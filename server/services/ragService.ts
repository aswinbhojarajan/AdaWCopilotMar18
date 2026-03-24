import pool from '../db/pool';
import type { Intent } from './intentClassifier';

export interface PortfolioContext {
  summary: string;
  holdings?: string;
  allocations?: string;
  goals?: string;
  accounts?: string;
  recentTransactions?: string;
}

type PrefetchBundle = 'holdings' | 'allocations' | 'goals' | 'accounts' | 'transactions';

const INTENT_PREFETCH_MATRIX: Record<Intent, PrefetchBundle[]> = {
  balance_query: ['holdings', 'accounts'],
  portfolio_explain: ['holdings', 'allocations', 'accounts', 'transactions'],
  allocation_breakdown: ['holdings', 'allocations'],
  goal_progress: ['goals'],
  market_context: ['holdings'],
  news_explain: ['holdings'],
  scenario_analysis: ['goals', 'allocations'],
  recommendation_request: ['holdings', 'allocations', 'goals'],
  execution_request: ['holdings'],
  support: [],
  general: ['holdings', 'allocations'],
};

export async function buildPortfolioContext(userId: string, intent: Intent): Promise<PortfolioContext> {
  const bundles = INTENT_PREFETCH_MATRIX[intent] ?? [];

  const promises: Promise<void>[] = [];
  const context: PortfolioContext = { summary: '' };

  promises.push(getPortfolioSummary(userId).then(s => { context.summary = s; }));

  if (bundles.includes('holdings')) {
    promises.push(getHoldingsContext(userId).then(h => { context.holdings = h; }));
  }
  if (bundles.includes('allocations')) {
    promises.push(getAllocationContext(userId).then(a => { context.allocations = a; }));
  }
  if (bundles.includes('goals')) {
    promises.push(getGoalsContext(userId).then(g => { context.goals = g; }));
  }
  if (bundles.includes('accounts')) {
    promises.push(getAccountsContext(userId).then(a => { context.accounts = a; }));
  }
  if (bundles.includes('transactions')) {
    promises.push(getRecentTransactions(userId).then(t => { context.recentTransactions = t; }));
  }

  await Promise.all(promises);

  return context;
}

async function getPortfolioSummary(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT total_value, daily_change_amount, daily_change_percent
     FROM portfolio_snapshots WHERE user_id = $1
     ORDER BY recorded_at DESC LIMIT 1`,
    [userId],
  );

  if (rows.length === 0) return 'No portfolio data available.';

  const s = rows[0];
  return `Total portfolio value: $${Number(s.total_value).toLocaleString()}. Daily change: $${Number(s.daily_change_amount).toLocaleString()} (${Number(s.daily_change_percent)}%).`;
}

async function getHoldingsContext(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT p.symbol, p.name, p.quantity, p.current_price, p.cost_basis, p.asset_class
     FROM positions p
     JOIN accounts a ON p.account_id = a.id
     WHERE a.user_id = $1
     ORDER BY (p.quantity * p.current_price) DESC`,
    [userId],
  );

  if (rows.length === 0) return 'No holdings.';

  return rows.map(h => {
    const value = Number(h.quantity) * Number(h.current_price);
    const gain = value - (Number(h.quantity) * Number(h.cost_basis));
    const gainPct = ((gain / (Number(h.quantity) * Number(h.cost_basis))) * 100).toFixed(1);
    return `${h.symbol} (${h.name}): ${Number(h.quantity).toFixed(2)} shares @ $${Number(h.current_price)} = $${value.toLocaleString()} | Cost basis: $${Number(h.cost_basis)} | Gain: $${gain.toLocaleString()} (${gainPct}%) | Asset class: ${h.asset_class}`;
  }).join('\n');
}

async function getAllocationContext(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT p.asset_class,
            SUM(p.quantity * p.current_price) as total_value
     FROM positions p
     JOIN accounts a ON p.account_id = a.id
     WHERE a.user_id = $1
     GROUP BY p.asset_class
     ORDER BY total_value DESC`,
    [userId],
  );

  if (rows.length === 0) return 'No allocation data.';

  const total = rows.reduce((sum, r) => sum + Number(r.total_value), 0);
  return rows.map(r => {
    const pct = ((Number(r.total_value) / total) * 100).toFixed(1);
    return `${r.asset_class}: $${Number(r.total_value).toLocaleString()} (${pct}%)`;
  }).join('\n');
}

async function getGoalsContext(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT title, target_amount, current_amount, deadline, health_status, ai_insight
     FROM goals WHERE user_id = $1
     ORDER BY deadline`,
    [userId],
  );

  if (rows.length === 0) return 'No goals set.';

  return rows.map(g => {
    const progress = ((Number(g.current_amount) / Number(g.target_amount)) * 100).toFixed(0);
    return `${g.title}: $${Number(g.current_amount).toLocaleString()} / $${Number(g.target_amount).toLocaleString()} (${progress}%) | Deadline: ${g.deadline} | Status: ${g.health_status} | Insight: ${g.ai_insight || 'none'}`;
  }).join('\n');
}

async function getAccountsContext(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT institution_name, account_type, balance, status, last_synced
     FROM accounts WHERE user_id = $1
     ORDER BY balance DESC`,
    [userId],
  );

  if (rows.length === 0) return 'No linked accounts.';

  return rows.map(a =>
    `${a.institution_name} (${a.account_type}): $${Number(a.balance).toLocaleString()} | Status: ${a.status} | Last synced: ${a.last_synced}`
  ).join('\n');
}

async function getRecentTransactions(userId: string): Promise<string> {
  const { rows } = await pool.query(
    `SELECT t.type, t.symbol, t.quantity, t.price, t.amount, t.executed_at
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = $1
     ORDER BY t.executed_at DESC
     LIMIT 10`,
    [userId],
  );

  if (rows.length === 0) return 'No recent transactions.';

  return rows.map(t => {
    const date = new Date(t.executed_at as string).toLocaleDateString();
    if (t.symbol) {
      return `${date}: ${t.type} ${Number(t.quantity).toFixed(2)} ${t.symbol} @ $${Number(t.price)} ($${Number(t.amount).toLocaleString()})`;
    }
    return `${date}: ${t.type} $${Number(t.amount).toLocaleString()}`;
  }).join('\n');
}
