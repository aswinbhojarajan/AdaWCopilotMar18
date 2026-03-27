import pool from '../db/pool';
import { MODEL } from './modelRouter';
import { resilientCompletion, resilientStreamCompletion } from './openaiClient';
import type { MorningSentinelResponse, MorningSentinelRisk } from '../../shared/types';

interface PortfolioMetrics {
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  holdings: { symbol: string; name: string; value: number; gainPercent: number; assetClass: string }[];
  allocations: { assetClass: string; percentage: number }[];
  goals: { title: string; progress: number; healthStatus: string; targetAmount: number; currentAmount: number; deadline: string }[];
  alerts: { title: string; message: string; category: string; unread: boolean }[];
  userName: string;
}

interface AnomalyFlags {
  largeDailyChange: boolean;
  goalOffTrack: boolean;
  concentrationAlert: boolean;
  details: string[];
}

const briefingCache = new Map<string, { data: MorningSentinelResponse; generatedAt: number }>();
const inFlightRequests = new Map<string, Promise<MorningSentinelResponse>>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

function getCacheKey(userId: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${userId}:${today}`;
}

async function gatherMetrics(userId: string): Promise<PortfolioMetrics> {
  const [snapshotRes, holdingsRes, allocRes, goalsRes, alertsRes, userRes] = await Promise.all([
    pool.query(
      `SELECT total_value, daily_change_amount, daily_change_percent
       FROM portfolio_snapshots WHERE user_id = $1
       ORDER BY recorded_at DESC LIMIT 1`,
      [userId],
    ),
    pool.query(
      `SELECT p.symbol, p.name, p.quantity, p.current_price, p.cost_basis, p.asset_class
       FROM positions p JOIN accounts a ON p.account_id = a.id
       WHERE a.user_id = $1 ORDER BY (p.quantity * p.current_price) DESC`,
      [userId],
    ),
    pool.query(
      `SELECT p.asset_class, SUM(p.quantity * p.current_price) as total_value
       FROM positions p JOIN accounts a ON p.account_id = a.id
       WHERE a.user_id = $1 GROUP BY p.asset_class ORDER BY total_value DESC`,
      [userId],
    ),
    pool.query(
      `SELECT title, target_amount, current_amount, deadline, health_status
       FROM goals WHERE user_id = $1 ORDER BY deadline`,
      [userId],
    ),
    pool.query(
      `SELECT title, message, category, unread FROM alerts
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId],
    ),
    pool.query(
      `SELECT first_name FROM users WHERE id = $1`,
      [userId],
    ),
  ]);

  const snapshot = snapshotRes.rows[0] || { total_value: 0, daily_change_amount: 0, daily_change_percent: 0 };

  const holdings = holdingsRes.rows.map(h => {
    const value = Number(h.quantity) * Number(h.current_price);
    const cost = Number(h.quantity) * Number(h.cost_basis);
    const gainPercent = cost > 0 ? ((value - cost) / cost) * 100 : 0;
    return { symbol: h.symbol as string, name: h.name as string, value, gainPercent, assetClass: h.asset_class as string };
  });

  const holdingsTotal = holdings.reduce((sum, h) => sum + h.value, 0);
  const snapshotValue = Number(snapshot.total_value);
  const totalPortfolioValue = snapshotValue > 0 ? snapshotValue : holdingsTotal;

  const allocations = allocRes.rows.map(r => ({
    assetClass: r.asset_class as string,
    percentage: totalPortfolioValue > 0 ? (Number(r.total_value) / totalPortfolioValue) * 100 : 0,
  }));

  const goals = goalsRes.rows.map(g => ({
    title: g.title as string,
    progress: Number(g.target_amount) > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0,
    healthStatus: g.health_status as string,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    deadline: g.deadline as string,
  }));

  const alerts = alertsRes.rows.map(a => ({
    title: a.title as string,
    message: a.message as string,
    category: a.category as string,
    unread: a.unread as boolean,
  }));

  return {
    totalValue: totalPortfolioValue,
    dailyChangeAmount: Number(snapshot.daily_change_amount),
    dailyChangePercent: Number(snapshot.daily_change_percent),
    holdings,
    allocations,
    goals,
    alerts,
    userName: (userRes.rows[0]?.first_name as string) || 'there',
  };
}

function detectAnomalies(metrics: PortfolioMetrics): AnomalyFlags {
  const flags: AnomalyFlags = {
    largeDailyChange: false,
    goalOffTrack: false,
    concentrationAlert: false,
    details: [],
  };

  if (Math.abs(metrics.dailyChangePercent) >= 1.5) {
    flags.largeDailyChange = true;
    flags.details.push(`Portfolio moved ${metrics.dailyChangePercent > 0 ? '+' : ''}${metrics.dailyChangePercent.toFixed(2)}% overnight — this is above the typical daily range.`);
  }

  const offTrackGoals = metrics.goals.filter(g => g.healthStatus === 'at-risk' || g.healthStatus === 'needs-attention');
  if (offTrackGoals.length > 0) {
    flags.goalOffTrack = true;
    flags.details.push(`${offTrackGoals.length} goal${offTrackGoals.length > 1 ? 's' : ''} ${offTrackGoals.length > 1 ? 'need' : 'needs'} attention: ${offTrackGoals.map(g => g.title).join(', ')}.`);
  }

  const highConcentration = metrics.allocations.filter(a => a.percentage > 40);
  if (highConcentration.length > 0) {
    flags.concentrationAlert = true;
    for (const alloc of highConcentration) {
      flags.details.push(`${alloc.assetClass} allocation is ${alloc.percentage.toFixed(0)}% — above the 40% concentration threshold.`);
    }
  }

  return flags;
}

function buildSentinelPrompt(metrics: PortfolioMetrics, anomalies: AnomalyFlags): string {
  const hasAnomalies = anomalies.largeDailyChange || anomalies.goalOffTrack || anomalies.concentrationAlert;
  const topHoldings = metrics.holdings.slice(0, 5);
  const topAllocations = metrics.allocations.slice(0, 4);

  const unreadAlerts = metrics.alerts.filter(a => a.unread);
  const alertSummary = unreadAlerts.length > 0
    ? ` Alerts (${unreadAlerts.length} unread): ${unreadAlerts.slice(0, 3).map(a => a.title).join('; ')}.`
    : '';

  let prompt = `Return JSON only. Portfolio: $${metrics.totalValue.toLocaleString()}, change: ${metrics.dailyChangePercent}% ($${metrics.dailyChangeAmount.toLocaleString()}). Top holdings: ${topHoldings.map(h => `${h.symbol} $${Math.round(h.value).toLocaleString()} ${h.gainPercent.toFixed(0)}%`).join(', ')}. Allocation: ${topAllocations.map(a => `${a.assetClass} ${a.percentage.toFixed(0)}%`).join(', ')}. Goals: ${metrics.goals.map(g => `${g.title} ${g.progress.toFixed(0)}% ${g.healthStatus}`).join(', ')}.${alertSummary}`;

  if (hasAnomalies) {
    prompt += ` Anomalies: ${anomalies.details.join(' ')} Include 2 risks and 2 actions.`;
  } else {
    prompt += ` No anomalies. Concise all-clear tone. 0-1 risks, 1 action.`;
  }

  prompt += ` JSON: {"headline":"str","overview":"str","keyMovers":[{"symbol":"str","name":"str","direction":"up|down","detail":"str"}],"risks":[{"severity":"high|medium|low","title":"str","description":"str"}],"actions":[{"title":"str","description":"str","ctaText":"str","ctaMessage":"str"}],"benchmarkNote":"str"}`;

  return prompt;
}

type SentinelStreamEvent =
  | { type: 'metrics'; data: Partial<MorningSentinelResponse> & { hasAnomalies: boolean } }
  | { type: 'text'; data: string }
  | { type: 'complete'; data: MorningSentinelResponse };

export async function* generateBriefingStream(userId: string, forceRefresh = false): AsyncGenerator<SentinelStreamEvent> {
  const cacheKey = getCacheKey(userId);

  if (!forceRefresh) {
    const cached = briefingCache.get(cacheKey);
    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      yield { type: 'complete', data: cached.data };
      return;
    }
  }

  const metrics = await gatherMetrics(userId);
  const anomalies = detectAnomalies(metrics);
  const systemPrompt = buildSentinelPrompt(metrics, anomalies);

  const baseFields = {
    userName: metrics.userName,
    generatedAt: new Date().toISOString(),
    portfolioValue: metrics.totalValue,
    dailyChangeAmount: metrics.dailyChangeAmount,
    dailyChangePercent: metrics.dailyChangePercent,
    hasAnomalies: anomalies.largeDailyChange || anomalies.goalOffTrack || anomalies.concentrationAlert,
  };

  yield { type: 'metrics', data: baseFields };

  try {
    const stream = await resilientStreamCompletion({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a JSON API. You always respond with valid JSON only, no markdown or explanation.' },
        { role: 'user', content: systemPrompt },
      ],
      max_completion_tokens: 2048,
      stream: true,
      stream_options: { include_usage: true },
    }, { timeoutMs: 15000, providerAlias: 'ada-fast' });

    let fullContent = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullContent += delta;
        yield { type: 'text', data: delta };
      }
    }

    const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const briefing: MorningSentinelResponse = {
      ...baseFields,
      headline: parsed.headline || 'Your portfolio overview is ready',
      overview: parsed.overview || '',
      keyMovers: (parsed.keyMovers || []).slice(0, 3).map((m: { symbol: string; name: string; direction: string; detail: string }) => ({
        symbol: m.symbol || '',
        name: m.name || '',
        direction: m.direction === 'down' ? 'down' as const : 'up' as const,
        detail: m.detail || '',
      })),
      risks: (parsed.risks || []).slice(0, 3).map((r: { severity: string; title: string; description: string }) => ({
        severity: (['high', 'medium', 'low'].includes(r.severity) ? r.severity : 'medium') as MorningSentinelRisk['severity'],
        title: r.title || '',
        description: r.description || '',
      })),
      actions: (parsed.actions || []).slice(0, 3).map((a: { title: string; description: string; ctaText: string; ctaMessage: string }) => ({
        title: a.title,
        description: a.description,
        ctaText: a.ctaText || 'Explore',
        ctaMessage: a.ctaMessage || a.title,
      })),
      benchmarkNote: parsed.benchmarkNote || '',
    };

    briefingCache.set(cacheKey, { data: briefing, generatedAt: Date.now() });
    yield { type: 'complete', data: briefing };
  } catch (err) {
    console.error('Morning Sentinel streaming error:', err);
    const fallback: MorningSentinelResponse = {
      ...baseFields,
      headline: metrics.dailyChangeAmount >= 0
        ? 'Your portfolio is holding steady'
        : 'Minor movement in your portfolio overnight',
      overview: `Your portfolio is valued at $${metrics.totalValue.toLocaleString()} with a ${metrics.dailyChangePercent >= 0 ? '+' : ''}${metrics.dailyChangePercent}% daily change.`,
      keyMovers: metrics.holdings.slice(0, 2).map(h => ({
        symbol: h.symbol,
        name: h.name,
        direction: (h.gainPercent >= 0 ? 'up' : 'down') as 'up' | 'down',
        detail: `${h.gainPercent >= 0 ? '+' : ''}${h.gainPercent.toFixed(1)}% overall gain`,
      })),
      risks: anomalies.concentrationAlert
        ? [{ severity: 'medium' as const, title: 'Concentration alert', description: anomalies.details.find(d => d.includes('concentration')) || 'Review your allocation' }]
        : [],
      actions: [{ title: 'Review portfolio', description: 'Take a look at your current holdings and allocation', ctaText: 'Dive deeper', ctaMessage: 'Show me a detailed breakdown of my portfolio performance' }],
      benchmarkNote: 'Market comparison data will be available shortly.',
    };
    briefingCache.set(cacheKey, { data: fallback, generatedAt: Date.now() });
    yield { type: 'complete', data: fallback };
  }
}

export async function generateBriefing(userId: string, forceRefresh = false): Promise<MorningSentinelResponse> {
  const cacheKey = getCacheKey(userId);

  if (!forceRefresh) {
    const cached = briefingCache.get(cacheKey);
    if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const existing = inFlightRequests.get(cacheKey);
    if (existing) return existing;
  }

  const promise = generateBriefingInternal(userId, cacheKey);
  inFlightRequests.set(cacheKey, promise);
  promise.finally(() => inFlightRequests.delete(cacheKey));
  return promise;
}

async function generateBriefingInternal(userId: string, cacheKey: string): Promise<MorningSentinelResponse> {
  const metrics = await gatherMetrics(userId);
  const anomalies = detectAnomalies(metrics);
  const systemPrompt = buildSentinelPrompt(metrics, anomalies);

  try {
    const response = await resilientCompletion({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a JSON API. You always respond with valid JSON only, no markdown or explanation.' },
        { role: 'user', content: systemPrompt },
      ],
      max_completion_tokens: 2048,
    }, { timeoutMs: 15000, retries: 2, providerAlias: 'ada-fast' });

    const content = response.choices[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Morning Sentinel: AI response was not JSON:', content.slice(0, 500));
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const briefing: MorningSentinelResponse = {
      userName: metrics.userName,
      generatedAt: new Date().toISOString(),
      portfolioValue: metrics.totalValue,
      dailyChangeAmount: metrics.dailyChangeAmount,
      dailyChangePercent: metrics.dailyChangePercent,
      headline: parsed.headline || 'Your portfolio overview is ready',
      overview: parsed.overview || '',
      keyMovers: (parsed.keyMovers || []).slice(0, 3).map((m: { symbol: string; name: string; direction: string; detail: string }) => ({
        symbol: m.symbol || '',
        name: m.name || '',
        direction: m.direction === 'down' ? 'down' as const : 'up' as const,
        detail: m.detail || '',
      })),
      risks: (parsed.risks || []).slice(0, 3).map((r: { severity: string; title: string; description: string }) => ({
        severity: (['high', 'medium', 'low'].includes(r.severity) ? r.severity : 'medium') as MorningSentinelRisk['severity'],
        title: r.title || '',
        description: r.description || '',
      })),
      actions: (parsed.actions || []).slice(0, 3).map((a: { title: string; description: string; ctaText: string; ctaMessage: string }) => ({
        title: a.title,
        description: a.description,
        ctaText: a.ctaText || 'Explore',
        ctaMessage: a.ctaMessage || a.title,
      })),
      benchmarkNote: parsed.benchmarkNote || '',
      hasAnomalies: anomalies.largeDailyChange || anomalies.goalOffTrack || anomalies.concentrationAlert,
    };

    briefingCache.set(cacheKey, { data: briefing, generatedAt: Date.now() });

    return briefing;
  } catch (err) {
    console.error('Morning Sentinel generation error:', err);

    const fallback: MorningSentinelResponse = {
      userName: metrics.userName,
      generatedAt: new Date().toISOString(),
      portfolioValue: metrics.totalValue,
      dailyChangeAmount: metrics.dailyChangeAmount,
      dailyChangePercent: metrics.dailyChangePercent,
      headline: metrics.dailyChangeAmount >= 0
        ? 'Your portfolio is holding steady'
        : 'Minor movement in your portfolio overnight',
      overview: `Your portfolio is valued at $${metrics.totalValue.toLocaleString()} with a ${metrics.dailyChangePercent >= 0 ? '+' : ''}${metrics.dailyChangePercent}% daily change.`,
      keyMovers: metrics.holdings.slice(0, 2).map(h => ({
        symbol: h.symbol,
        name: h.name,
        direction: (h.gainPercent >= 0 ? 'up' : 'down') as 'up' | 'down',
        detail: `${h.gainPercent >= 0 ? '+' : ''}${h.gainPercent.toFixed(1)}% overall gain`,
      })),
      risks: anomalies.concentrationAlert
        ? [{ severity: 'medium' as const, title: 'Concentration alert', description: anomalies.details.find(d => d.includes('concentration')) || 'Review your allocation' }]
        : [],
      actions: [{ title: 'Review portfolio', description: 'Take a look at your current holdings and allocation', ctaText: 'Dive deeper', ctaMessage: 'Show me a detailed breakdown of my portfolio performance' }],
      benchmarkNote: 'Market comparison data will be available shortly.',
      hasAnomalies: anomalies.largeDailyChange || anomalies.goalOffTrack || anomalies.concentrationAlert,
    };

    briefingCache.set(cacheKey, { data: fallback, generatedAt: Date.now() });
    return fallback;
  }
}
