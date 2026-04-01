import pool from '../db/pool';
import type {
  Account,
  AssetAllocation,
  HoldingResponse,
  Goal,
  PortfolioSnapshot,
  SparklinePoint,
  PerformanceDataPoint,
} from '../../shared/types';

export async function getAccountsByUserId(userId: string): Promise<Account[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, institution_name, logo_color, logo_text,
            account_type, balance, last_synced, status
     FROM accounts WHERE user_id = $1`,
    [userId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    institutionName: String(r.institution_name),
    logoColor: String(r.logo_color),
    logoText: String(r.logo_text),
    accountType: r.account_type as Account['accountType'],
    balance: Number(r.balance),
    lastSynced: String(r.last_synced),
    status: r.status as Account['status'],
  }));
}

export async function getHoldingsByUserId(userId: string): Promise<HoldingResponse[]> {
  const { rows } = await pool.query(
    `SELECT p.symbol, p.name, p.quantity, p.current_price, p.cost_basis
     FROM positions p
     JOIN accounts a ON a.id = p.account_id
     WHERE a.user_id = $1
     ORDER BY (p.quantity * p.current_price) DESC
     LIMIT 5`,
    [userId],
  );
  return rows.map((r) => {
    const qty = Number(r.quantity);
    const price = Number(r.current_price);
    const cost = Number(r.cost_basis);
    const value = qty * price;
    const costTotal = qty * cost;
    const changeAmount = value - costTotal;
    const changePercent = costTotal > 0 ? (changeAmount / costTotal) * 100 : 0;
    return {
      symbol: String(r.symbol),
      name: String(r.name),
      quantity: qty,
      value: Math.round(value * 100) / 100,
      changePercent: Math.round(changePercent * 10) / 10,
      changeAmount: Math.round(changeAmount * 100) / 100,
    };
  });
}

export interface EnrichedHolding extends HoldingResponse {
  current_price: number;
  cost_basis: number;
  market_value: number;
  assetClass: string;
  sector?: string;
  geography: string;
  currency: string;
  instrumentType: string;
  isin?: string;
  exchange?: string;
}

export async function getEnrichedHoldingsByUserId(userId: string): Promise<EnrichedHolding[]> {
  const { rows } = await pool.query(
    `SELECT p.symbol, p.name, p.quantity, p.current_price, p.cost_basis, p.asset_class,
            i.sector, i.geography, i.currency, i.instrument_type, i.isin, i.exchange
     FROM positions p
     JOIN accounts a ON a.id = p.account_id
     LEFT JOIN instruments i ON UPPER(i.symbol) = UPPER(p.symbol)
     WHERE a.user_id = $1
     ORDER BY (p.quantity * p.current_price) DESC`,
    [userId],
  );
  return rows.map((r) => {
    const qty = Number(r.quantity);
    const price = Number(r.current_price);
    const cost = Number(r.cost_basis);
    const value = qty * price;
    const costTotal = qty * cost;
    const changeAmount = value - costTotal;
    const changePercent = costTotal > 0 ? (changeAmount / costTotal) * 100 : 0;
    return {
      symbol: String(r.symbol),
      name: String(r.name),
      quantity: qty,
      current_price: price,
      cost_basis: cost,
      market_value: Math.round(value * 100) / 100,
      value: Math.round(value * 100) / 100,
      changePercent: Math.round(changePercent * 10) / 10,
      changeAmount: Math.round(changeAmount * 100) / 100,
      assetClass: String(r.asset_class ?? 'Unknown'),
      sector: r.sector ? String(r.sector) : undefined,
      geography: String(r.geography ?? 'Global'),
      currency: String(r.currency ?? 'USD'),
      instrumentType: String(r.instrument_type ?? 'equity'),
      isin: r.isin ? String(r.isin) : undefined,
      exchange: r.exchange ? String(r.exchange) : undefined,
    };
  });
}

const ALLOCATION_COLORS: Record<string, string> = {
  Stocks: '#d9b3b5',
  Cash: '#a87174',
  Bonds: '#6d3f42',
  Crypto: '#8b5a5d',
  Commodities: '#441316',
};

export async function getAllocationsByUserId(userId: string): Promise<AssetAllocation[]> {
  const { rows } = await pool.query(
    `SELECT p.asset_class, SUM(p.quantity * p.current_price) as total_value
     FROM positions p
     JOIN accounts a ON a.id = p.account_id
     WHERE a.user_id = $1
     GROUP BY p.asset_class
     ORDER BY total_value DESC`,
    [userId],
  );

  const cashResult = await pool.query(
    `SELECT COALESCE(SUM(balance), 0) as cash
     FROM accounts
     WHERE user_id = $1 AND account_type IN ('savings', 'checking')`,
    [userId],
  );
  const savingsCheckingCash = Number(cashResult.rows[0]?.cash ?? 0);

  const brokerageCashResult = await pool.query(
    `SELECT COALESCE(SUM(a.balance), 0) - COALESCE(SUM(pv.pos_value), 0) as brokerage_cash
     FROM accounts a
     LEFT JOIN (
       SELECT account_id, SUM(quantity * current_price) as pos_value
       FROM positions GROUP BY account_id
     ) pv ON pv.account_id = a.id
     WHERE a.user_id = $1 AND a.account_type = 'brokerage'`,
    [userId],
  );
  const brokerageCash = Math.max(0, Number(brokerageCashResult.rows[0]?.brokerage_cash ?? 0));
  const cashAmount = savingsCheckingCash + brokerageCash;

  const positionTotal = rows.reduce((sum, r) => sum + Number(r.total_value), 0);
  const grandTotal = positionTotal + cashAmount;

  const allocations: AssetAllocation[] = [];

  for (const r of rows) {
    const val = Number(r.total_value);
    const pct = grandTotal > 0 ? Math.round((val / grandTotal) * 100) : 0;
    allocations.push({
      label: String(r.asset_class),
      value: Math.round(val * 100) / 100,
      amount: Math.round(val * 100) / 100,
      percentage: pct,
      color: ALLOCATION_COLORS[String(r.asset_class)] ?? '#888',
    });
  }

  if (cashAmount > 0) {
    const pct = grandTotal > 0 ? Math.round((cashAmount / grandTotal) * 100) : 0;
    allocations.push({
      label: 'Cash',
      value: Math.round(cashAmount * 100) / 100,
      amount: Math.round(cashAmount * 100) / 100,
      percentage: pct,
      color: ALLOCATION_COLORS['Cash'],
    });
  }

  allocations.sort((a, b) => b.percentage - a.percentage);
  return allocations;
}

export async function getGoalsByUserId(userId: string): Promise<Goal[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, title, target_amount, current_amount, previous_amount, deadline,
            icon_name, color, health_status, ai_insight, cta_text
     FROM goals WHERE user_id = $1`,
    [userId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    title: String(r.title),
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    previousAmount: r.previous_amount != null ? Number(r.previous_amount) : undefined,
    deadline: String(r.deadline),
    iconName: String(r.icon_name),
    color: String(r.color),
    healthStatus: r.health_status as Goal['healthStatus'],
    aiInsight: String(r.ai_insight ?? ''),
    ctaText: String(r.cta_text),
  }));
}

export async function createGoal(
  userId: string,
  suggestion: { title: string; targetAmount: number; deadline: string; iconName: string; color: string },
): Promise<Goal> {
  const { rows } = await pool.query(
    `INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline, icon_name, color, health_status, ai_insight, cta_text)
     VALUES (gen_random_uuid(), $1, $2, $3, 0, $4, $5, $6, 'on-track', 'New goal created. Start contributing to build momentum.', 'View details')
     RETURNING id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text`,
    [userId, suggestion.title, suggestion.targetAmount, suggestion.deadline, suggestion.iconName, suggestion.color],
  );
  const r = rows[0];
  return {
    id: String(r.id),
    userId: String(r.user_id),
    title: String(r.title),
    targetAmount: Number(r.target_amount),
    currentAmount: Number(r.current_amount),
    previousAmount: r.previous_amount != null ? Number(r.previous_amount) : undefined,
    deadline: String(r.deadline),
    iconName: String(r.icon_name),
    color: String(r.color),
    healthStatus: r.health_status as Goal['healthStatus'],
    aiInsight: String(r.ai_insight ?? ''),
    ctaText: String(r.cta_text),
  };
}

export async function getDismissedLifeGapPrompts(userId: string): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT prompt_key FROM dismissed_life_gap_prompts WHERE user_id = $1`,
    [userId],
  );
  return rows.map((r) => String(r.prompt_key));
}

export async function dismissLifeGapPrompt(userId: string, promptKey: string): Promise<void> {
  await pool.query(
    `INSERT INTO dismissed_life_gap_prompts (user_id, prompt_key) VALUES ($1, $2) ON CONFLICT (user_id, prompt_key) DO NOTHING`,
    [userId, promptKey],
  );
}

export async function getLatestSnapshot(userId: string): Promise<PortfolioSnapshot> {
  const { rows } = await pool.query(
    `SELECT id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at
     FROM portfolio_snapshots WHERE user_id = $1
     ORDER BY recorded_at DESC LIMIT 1`,
    [userId],
  );
  if (rows.length === 0) {
    return {
      id: 'snap-0',
      userId,
      totalValue: 0,
      dailyChangeAmount: 0,
      dailyChangePercent: 0,
      timestamp: new Date().toISOString(),
    };
  }
  const r = rows[0];
  return {
    id: String(r.id),
    userId: String(r.user_id),
    totalValue: Number(r.total_value),
    dailyChangeAmount: Number(r.daily_change_amount),
    dailyChangePercent: Number(r.daily_change_percent),
    timestamp: r.recorded_at ? new Date(r.recorded_at as string).toISOString() : new Date().toISOString(),
  };
}

const INSTITUTION_META: Record<string, { logoColor: string; logoText: string }> = {
  'ADCB': { logoColor: '#0066B2', logoText: 'ADCB' },
  'Mashreq Bank': { logoColor: '#E20714', logoText: 'M' },
  'FAB': { logoColor: '#00558C', logoText: 'FAB' },
  'Interactive Brokers': { logoColor: '#DA1F26', logoText: 'IB' },
  'Saxo Bank': { logoColor: '#003366', logoText: 'SAXO' },
  'Binance': { logoColor: '#F0B90B', logoText: 'BN' },
  'Coinbase': { logoColor: '#0052FF', logoText: 'CB' },
  'Kraken': { logoColor: '#5741D9', logoText: 'K' },
  'Sarwa': { logoColor: '#7B61FF', logoText: 'S' },
  'StashAway': { logoColor: '#00D09C', logoText: 'SA' },
};

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  bank: 'savings',
  broker: 'brokerage',
  crypto: 'brokerage',
  investment: 'brokerage',
  savings: 'savings',
  checking: 'checking',
  retirement: 'retirement',
  brokerage: 'brokerage',
};

export async function createAccount(
  userId: string,
  institutionName: string,
  accountType: string,
): Promise<Account> {
  const meta = INSTITUTION_META[institutionName] ?? {
    logoColor: '#888888',
    logoText: institutionName.substring(0, 2).toUpperCase(),
  };
  const dbAccountType = ACCOUNT_TYPE_MAP[accountType] ?? 'brokerage';
  const { rows } = await pool.query(
    `INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 0, NOW(), 'synced')
     RETURNING id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status`,
    [userId, institutionName, meta.logoColor, meta.logoText, dbAccountType],
  );
  const r = rows[0];
  return {
    id: String(r.id),
    userId: String(r.user_id),
    institutionName: String(r.institution_name),
    logoColor: String(r.logo_color),
    logoText: String(r.logo_text),
    accountType: r.account_type as Account['accountType'],
    balance: Number(r.balance),
    lastSynced: String(r.last_synced),
    status: r.status as Account['status'],
  };
}

export async function getHomeSparkline(userId: string): Promise<SparklinePoint[]> {
  const { rows } = await pool.query(
    `SELECT value FROM performance_history
     WHERE user_id = $1 AND recorded_date >= CURRENT_DATE - INTERVAL '7 days'
     ORDER BY recorded_date ASC`,
    [userId],
  );
  if (rows.length >= 2) {
    return rows.map((r) => ({ value: Number(r.value) }));
  }
  const snapshot = await getLatestSnapshot(userId);
  const base = snapshot.totalValue * 0.995;
  const step = (snapshot.totalValue - base) / 7;
  return Array.from({ length: 8 }, (_, i) => ({
    value: Math.round((base + step * i) * 100) / 100,
  }));
}

export async function getPerformanceHistory(
  userId: string,
  days: number,
): Promise<{ value: number; recordedDate: string }[]> {
  const { rows } = await pool.query(
    `SELECT value, recorded_date
     FROM performance_history
     WHERE user_id = $1 AND recorded_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
     ORDER BY recorded_date ASC`,
    [userId, days],
  );
  return rows.map((r) => ({
    value: Number(r.value),
    recordedDate: String(r.recorded_date),
  }));
}

export async function getPerformanceData(userId: string): Promise<Record<string, PerformanceDataPoint[]>> {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formatMonthDay = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

  const yearData = await getPerformanceHistory(userId, 365);

  if (yearData.length === 0) {
    return { '1D': [], '1W': [], '1M': [], '3M': [], '1Y': [] };
  }

  const latest = yearData[yearData.length - 1];
  const latestValue = latest.value;

  const make1D = (): PerformanceDataPoint[] => {
    const hours = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];
    const base = latestValue * 0.991;
    const step = (latestValue - base) / (hours.length - 1);
    return hours.map((label, i) => ({
      value: Math.round((base + step * i) * 100) / 100,
      label,
    }));
  };

  const sampleEvery = (data: typeof yearData, n: number): PerformanceDataPoint[] => {
    if (data.length <= n) {
      return data.map((d) => {
        const dt = new Date(d.recordedDate);
        return { value: d.value, label: dayNames[dt.getDay()] };
      });
    }
    const step = Math.floor(data.length / n);
    const result: PerformanceDataPoint[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.min(i * step, data.length - 1);
      const d = data[idx];
      const dt = new Date(d.recordedDate);
      let label: string;
      if (n <= 7) label = dayNames[dt.getDay()];
      else if (n <= 12) label = monthNames[dt.getMonth()];
      else label = formatMonthDay(dt);
      result.push({ value: d.value, label });
    }
    const last = data[data.length - 1];
    const lastDt = new Date(last.recordedDate);
    result.push({
      value: last.value,
      label: n <= 12 ? monthNames[lastDt.getMonth()] : formatMonthDay(lastDt),
    });
    return result;
  };

  const weekData = yearData.filter((d) => {
    const diff = (Date.now() - new Date(d.recordedDate).getTime()) / 86400000;
    return diff <= 7;
  });

  const monthData = yearData.filter((d) => {
    const diff = (Date.now() - new Date(d.recordedDate).getTime()) / 86400000;
    return diff <= 30;
  });

  const qtrData = yearData.filter((d) => {
    const diff = (Date.now() - new Date(d.recordedDate).getTime()) / 86400000;
    return diff <= 90;
  });

  return {
    '1D': make1D(),
    '1W': sampleEvery(weekData, 5),
    '1M': sampleEvery(monthData, 6),
    '3M': sampleEvery(qtrData, 4),
    '1Y': sampleEvery(yearData, 11),
  };
}
