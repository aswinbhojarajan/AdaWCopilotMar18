import type { ToolResult } from '../../shared/schemas/agent';

export interface HealthScoreResult {
  score: number;
  label: string;
  components: {
    diversification: number;
    cash_buffer: number;
    concentration_risk: number;
    risk_alignment: number;
    position_count: number;
  };
  strengths: string[];
  concerns: string[];
}

export interface ConcentrationAnalysis {
  largest_holding_pct: number;
  top5_pct: number;
  sector_concentration: Record<string, number>;
  geography_concentration: Record<string, number>;
  asset_class_concentration: Record<string, number>;
  flags: string[];
}

export interface AllocationBreakdown {
  by_asset_class: Record<string, { value: number; pct: number }>;
  by_geography: Record<string, { value: number; pct: number }>;
  by_sector: Record<string, { value: number; pct: number }>;
  total_value: number;
  cash_pct: number;
  invested_pct: number;
}

export interface DriftAnalysis {
  buckets: Array<{ name: string; actual_pct: number; target_pct: number; drift_pct: number; flagged: boolean }>;
  max_drift: number;
  needs_rebalance: boolean;
}

interface Holding {
  symbol: string;
  name?: string;
  quantity: number;
  current_price: number;
  cost_basis?: number;
  asset_class?: string;
  sector?: string;
  geography?: string;
  market_value?: number;
}

function parseHoldings(toolResult: ToolResult): Holding[] {
  if (toolResult.status !== 'ok' || !toolResult.data) return [];
  const d = toolResult.data as Record<string, unknown>;
  const holdings = (d.holdings ?? d) as Holding[];
  if (!Array.isArray(holdings)) return [];
  return holdings.map(h => ({
    ...h,
    market_value: h.market_value ?? (Number(h.quantity) * Number(h.current_price)),
  }));
}

function parseSnapshot(toolResult: ToolResult): { total_value: number; cash_value: number } {
  if (toolResult.status !== 'ok' || !toolResult.data) return { total_value: 0, cash_value: 0 };
  const d = toolResult.data as Record<string, unknown>;
  return {
    total_value: Number(d.total_value ?? 0),
    cash_value: Number(d.cash_value ?? 0),
  };
}

export function calculateHealthScore(
  holdingsResult: ToolResult,
  snapshotResult: ToolResult,
  riskLevel: string,
): HealthScoreResult {
  const holdings = parseHoldings(holdingsResult);
  const { total_value, cash_value } = parseSnapshot(snapshotResult);

  if (holdings.length === 0 || total_value === 0) {
    return { score: 50, label: 'Needs Setup', components: { diversification: 50, cash_buffer: 50, concentration_risk: 50, risk_alignment: 50, position_count: 50 }, strengths: [], concerns: ['No holdings data available'] };
  }

  const values = holdings.map(h => h.market_value ?? 0);
  const totalInvested = values.reduce((s, v) => s + v, 0);

  const diversificationScore = computeDiversification(holdings, totalInvested);
  const cashBufferScore = computeCashBuffer(cash_value, total_value, riskLevel);
  const concentrationScore = computeConcentrationScore(values, totalInvested);
  const alignmentScore = computeRiskAlignment(holdings, riskLevel);
  const positionCountScore = computePositionCountScore(holdings.length);

  const weights = { diversification: 0.25, cash_buffer: 0.15, concentration_risk: 0.25, risk_alignment: 0.20, position_count: 0.15 };
  const raw = diversificationScore * weights.diversification
    + cashBufferScore * weights.cash_buffer
    + concentrationScore * weights.concentration_risk
    + alignmentScore * weights.risk_alignment
    + positionCountScore * weights.position_count;

  const score = Math.round(Math.min(100, Math.max(0, raw)));

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (diversificationScore >= 70) strengths.push('Well-diversified across asset classes');
  else concerns.push('Portfolio could benefit from broader diversification');

  if (cashBufferScore >= 70) strengths.push('Healthy cash buffer');
  else if (cashBufferScore < 40) concerns.push('Cash position may be too low for your risk profile');

  if (concentrationScore >= 70) strengths.push('No significant concentration risk');
  else concerns.push('Concentration risk detected in top holdings');

  if (alignmentScore >= 70) strengths.push('Portfolio aligns with your risk profile');
  else concerns.push('Portfolio risk level may not match your stated risk tolerance');

  if (positionCountScore >= 70) strengths.push('Good number of positions for diversification');
  else if (holdings.length < 5) concerns.push('Consider adding more positions for better diversification');

  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';

  return {
    score,
    label,
    components: {
      diversification: Math.round(diversificationScore),
      cash_buffer: Math.round(cashBufferScore),
      concentration_risk: Math.round(concentrationScore),
      risk_alignment: Math.round(alignmentScore),
      position_count: Math.round(positionCountScore),
    },
    strengths,
    concerns,
  };
}

function computeDiversification(holdings: Holding[], totalInvested: number): number {
  if (totalInvested === 0) return 50;
  const classes = new Set<string>();
  const sectors = new Set<string>();
  const geos = new Set<string>();
  for (const h of holdings) {
    if (h.asset_class) classes.add(h.asset_class);
    if (h.sector) sectors.add(h.sector);
    if (h.geography) geos.add(h.geography);
  }
  const classScore = Math.min(classes.size / 4, 1) * 40;
  const sectorScore = Math.min(sectors.size / 5, 1) * 30;
  const geoScore = Math.min(geos.size / 3, 1) * 30;
  return classScore + sectorScore + geoScore;
}

function computeCashBuffer(cash: number, total: number, riskLevel: string): number {
  if (total === 0) return 50;
  const cashPct = (cash / total) * 100;
  const ideal = riskLevel === 'conservative' ? 20 : riskLevel === 'aggressive' ? 5 : 10;
  const diff = Math.abs(cashPct - ideal);
  if (diff <= 3) return 100;
  if (diff <= 8) return 75;
  if (diff <= 15) return 50;
  return 25;
}

function computeConcentrationScore(values: number[], total: number): number {
  if (total === 0 || values.length === 0) return 50;
  const sorted = [...values].sort((a, b) => b - a);
  const topPct = (sorted[0] / total) * 100;
  const top5Pct = (sorted.slice(0, 5).reduce((s, v) => s + v, 0) / total) * 100;
  let score = 100;
  if (topPct > 30) score -= 30;
  else if (topPct > 20) score -= 15;
  if (top5Pct > 80) score -= 20;
  else if (top5Pct > 60) score -= 10;
  return Math.max(0, score);
}

function computeRiskAlignment(holdings: Holding[], riskLevel: string): number {
  const equityHoldings = holdings.filter(h => (h.asset_class ?? '').toLowerCase().includes('stock') || (h.asset_class ?? '').toLowerCase().includes('equit'));
  const bondHoldings = holdings.filter(h => (h.asset_class ?? '').toLowerCase().includes('bond') || (h.asset_class ?? '').toLowerCase().includes('fixed'));
  const equityRatio = holdings.length > 0 ? equityHoldings.length / holdings.length : 0;

  if (riskLevel === 'conservative') {
    if (equityRatio > 0.6) return 30;
    if (equityRatio > 0.4) return 60;
    return 90;
  }
  if (riskLevel === 'aggressive') {
    if (equityRatio < 0.3) return 40;
    if (equityRatio < 0.5) return 60;
    return 85;
  }
  if (equityRatio > 0.7) return 50;
  if (equityRatio < 0.2) return 50;
  return 80 + (bondHoldings.length > 0 ? 10 : 0);
}

function computePositionCountScore(count: number): number {
  if (count >= 8 && count <= 25) return 90;
  if (count >= 5) return 70;
  if (count >= 3) return 50;
  return 30;
}

export function analyzeConcentration(holdingsResult: ToolResult): ConcentrationAnalysis {
  const holdings = parseHoldings(holdingsResult);
  const total = holdings.reduce((s, h) => s + (h.market_value ?? 0), 0);

  if (total === 0) {
    return { largest_holding_pct: 0, top5_pct: 0, sector_concentration: {}, geography_concentration: {}, asset_class_concentration: {}, flags: ['No holdings data'] };
  }

  const sorted = [...holdings].sort((a, b) => (b.market_value ?? 0) - (a.market_value ?? 0));
  const largestPct = ((sorted[0]?.market_value ?? 0) / total) * 100;
  const top5Pct = (sorted.slice(0, 5).reduce((s, h) => s + (h.market_value ?? 0), 0) / total) * 100;

  const sectorMap: Record<string, number> = {};
  const geoMap: Record<string, number> = {};
  const classMap: Record<string, number> = {};

  for (const h of holdings) {
    const v = (h.market_value ?? 0) / total * 100;
    const sec = h.sector || 'Unknown';
    const geo = h.geography || 'Unknown';
    const cls = h.asset_class || 'Unknown';
    sectorMap[sec] = (sectorMap[sec] ?? 0) + v;
    geoMap[geo] = (geoMap[geo] ?? 0) + v;
    classMap[cls] = (classMap[cls] ?? 0) + v;
  }

  const flags: string[] = [];
  if (largestPct > 25) flags.push(`Largest holding (${sorted[0]?.symbol}) is ${largestPct.toFixed(1)}% of portfolio`);
  if (top5Pct > 75) flags.push(`Top 5 holdings make up ${top5Pct.toFixed(1)}% of portfolio`);
  for (const [sector, pct] of Object.entries(sectorMap)) {
    if (pct > 40) flags.push(`${sector} sector concentration: ${pct.toFixed(1)}%`);
  }
  for (const [geo, pct] of Object.entries(geoMap)) {
    if (pct > 70) flags.push(`${geo} geography concentration: ${pct.toFixed(1)}%`);
  }

  return {
    largest_holding_pct: +largestPct.toFixed(2),
    top5_pct: +top5Pct.toFixed(2),
    sector_concentration: Object.fromEntries(Object.entries(sectorMap).map(([k, v]) => [k, +v.toFixed(2)])),
    geography_concentration: Object.fromEntries(Object.entries(geoMap).map(([k, v]) => [k, +v.toFixed(2)])),
    asset_class_concentration: Object.fromEntries(Object.entries(classMap).map(([k, v]) => [k, +v.toFixed(2)])),
    flags,
  };
}

export function computeAllocationBreakdown(holdingsResult: ToolResult, snapshotResult: ToolResult): AllocationBreakdown {
  const holdings = parseHoldings(holdingsResult);
  const { total_value, cash_value } = parseSnapshot(snapshotResult);
  const investedValue = holdings.reduce((s, h) => s + (h.market_value ?? 0), 0);

  const byClass: Record<string, { value: number; pct: number }> = {};
  const byGeo: Record<string, { value: number; pct: number }> = {};
  const bySector: Record<string, { value: number; pct: number }> = {};

  for (const h of holdings) {
    const v = h.market_value ?? 0;
    const cls = h.asset_class || 'Other';
    const geo = h.geography || 'Global';
    const sec = h.sector || 'Other';

    byClass[cls] = { value: (byClass[cls]?.value ?? 0) + v, pct: 0 };
    byGeo[geo] = { value: (byGeo[geo]?.value ?? 0) + v, pct: 0 };
    bySector[sec] = { value: (bySector[sec]?.value ?? 0) + v, pct: 0 };
  }

  if (cash_value > 0) {
    byClass['Cash'] = { value: cash_value, pct: 0 };
  }

  const grandTotal = total_value || (investedValue + cash_value);
  for (const map of [byClass, byGeo, bySector]) {
    for (const key of Object.keys(map)) {
      map[key].pct = grandTotal > 0 ? +((map[key].value / grandTotal) * 100).toFixed(2) : 0;
    }
  }

  return {
    by_asset_class: byClass,
    by_geography: byGeo,
    by_sector: bySector,
    total_value: grandTotal,
    cash_pct: grandTotal > 0 ? +((cash_value / grandTotal) * 100).toFixed(2) : 0,
    invested_pct: grandTotal > 0 ? +((investedValue / grandTotal) * 100).toFixed(2) : 0,
  };
}

export function computeDriftAnalysis(
  holdingsResult: ToolResult,
  snapshotResult: ToolResult,
  targetAllocation?: Record<string, number>,
): DriftAnalysis {
  const breakdown = computeAllocationBreakdown(holdingsResult, snapshotResult);

  const targets = targetAllocation ?? {
    'Stocks': 55,
    'Bonds': 25,
    'Cash': 10,
    'Alternatives': 10,
  };

  const buckets: DriftAnalysis['buckets'] = [];
  const allKeys = new Set([...Object.keys(targets), ...Object.keys(breakdown.by_asset_class)]);

  for (const name of allKeys) {
    const actual = breakdown.by_asset_class[name]?.pct ?? 0;
    const target = targets[name] ?? 0;
    const drift = +(actual - target).toFixed(2);
    buckets.push({ name, actual_pct: actual, target_pct: target, drift_pct: drift, flagged: Math.abs(drift) > 5 });
  }

  const maxDrift = Math.max(...buckets.map(b => Math.abs(b.drift_pct)), 0);

  return {
    buckets,
    max_drift: +maxDrift.toFixed(2),
    needs_rebalance: maxDrift > 10,
  };
}
