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
  const cashAmount = Number(cashResult.rows[0]?.cash ?? 0);

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
    `SELECT id, user_id, title, target_amount, current_amount, deadline,
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
    deadline: String(r.deadline),
    iconName: String(r.icon_name),
    color: String(r.color),
    healthStatus: r.health_status as Goal['healthStatus'],
    aiInsight: String(r.ai_insight ?? ''),
    ctaText: String(r.cta_text),
  }));
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

export function getHomeSparkline(_userId: string): SparklinePoint[] {
  return [
    { value: 129000 },
    { value: 129500 },
    { value: 129200 },
    { value: 130000 },
    { value: 130200 },
    { value: 130500 },
    { value: 130800 },
    { value: 131230.19 },
  ];
}

export function getPerformanceData(_userId: string): Record<string, PerformanceDataPoint[]> {
  const now = new Date();
  const formatMonthDay = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return {
    '1D': [
      { value: 94000, label: '9am' },
      { value: 94100, label: '10am' },
      { value: 94200, label: '11am' },
      { value: 94300, label: '12pm' },
      { value: 94400, label: '1pm' },
      { value: 94500, label: '2pm' },
      { value: 94600, label: '3pm' },
      { value: 94700, label: '4pm' },
      { value: 94800, label: '5pm' },
      { value: 94830, label: '6pm' },
    ],
    '1W': Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (4 - i));
      return { value: 93500 + i * 332.5, label: dayNames[d.getDay()] };
    }),
    '1M': Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (5 - i) * 7);
      return { value: 91000 + i * 783, label: formatMonthDay(d) };
    }),
    '3M': Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (3 - i));
      return { value: 85000 + i * 3276.67, label: monthNames[d.getMonth()] };
    }),
    '1Y': Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      return { value: 78000 + i * 1402.5, label: monthNames[d.getMonth()] };
    }),
  };
}
