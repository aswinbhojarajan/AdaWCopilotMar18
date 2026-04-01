import React from 'react';
import { useAllocations } from '../../hooks/useAllocations';
import { useHoldings } from '../../hooks/useHoldings';
import { useGoals } from '../../hooks/useGoals';
import { useWealthOverview } from '../../hooks/usePortfolio';
import type { ChatWidget, AssetAllocation, Holding, GoalData } from '../../types';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  AED: 'AED ',
  SAR: 'SAR ',
  EUR: '€',
  GBP: '£',
};

function formatCurrency(value: number, currency?: string): string {
  const code = currency?.toUpperCase() ?? 'USD';
  const sym = CURRENCY_SYMBOLS[code] ?? `${code} `;
  return `${sym}${value.toLocaleString()}`;
}

function AllocationChart() {
  const { data: allocations, isLoading } = useAllocations();

  if (isLoading || !allocations) {
    return <WidgetSkeleton title="Asset Allocation" />;
  }

  const total = (allocations as AssetAllocation[]).reduce((s, a) => s + Number(a.amount || a.value || 0), 0);

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px]">
      <h4 className="text-[0.8125rem] text-[#1A1A1A] font-medium mb-[12px]">Asset Allocation</h4>
      <div className="space-y-[8px]">
        {(allocations as AssetAllocation[]).map((a, i) => {
          const pct = total > 0 ? ((Number(a.amount || a.value || 0) / total) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-[4px] gap-[8px]">
                <span className="text-[0.75rem] text-[#555555] flex-1 min-w-0 truncate">{a.label}</span>
                <span className="text-[0.75rem] text-[#1A1A1A] font-medium tabular-nums shrink-0">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-[4px] bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: a.color || '#441316' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HoldingsSummary() {
  const { data: holdings, isLoading } = useHoldings();

  if (isLoading || !holdings) {
    return <WidgetSkeleton title="Top Holdings" />;
  }

  const sorted = [...(holdings as Holding[])].sort((a, b) => Number(b.value) - Number(a.value)).slice(0, 5);

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px]">
      <h4 className="text-[0.8125rem] text-[#1A1A1A] font-medium mb-[12px]">Top Holdings</h4>
      <div className="space-y-[10px]">
        {sorted.map((h, i) => (
          <div key={i} className="flex justify-between items-center">
            <div>
              <span className="text-[0.75rem] text-[#1A1A1A] font-medium">{h.symbol}</span>
              <span className="text-[0.6875rem] text-[#888888] ml-[6px]">{h.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[0.75rem] text-[#1A1A1A] tabular-nums">{formatCurrency(Number(h.value), (h as unknown as { currency?: string }).currency)}</span>
              <span className={`text-[0.6875rem] ml-[6px] tabular-nums ${Number(h.changePercent) >= 0 ? 'text-[#0F6F4E]' : 'text-[#C1464F]'}`}>
                {Number(h.changePercent) >= 0 ? '+' : ''}{Number(h.changePercent).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalProgress() {
  const { data: goals, isLoading } = useGoals();

  if (isLoading || !goals) {
    return <WidgetSkeleton title="Goal Progress" />;
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px]">
      <h4 className="text-[0.8125rem] text-[#1A1A1A] font-medium mb-[12px]">Goal Progress</h4>
      <div className="space-y-[12px]">
        {(goals as unknown as GoalData[]).map((g, i) => {
          const pct = (Number(g.currentAmount) / Number(g.targetAmount)) * 100;
          const statusColor = g.healthStatus === 'on-track' ? '#0F6F4E' : g.healthStatus === 'at-risk' ? '#C1464F' : '#D4A017';
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-[4px]">
                <span className="text-[0.75rem] text-[#1A1A1A]">{g.title}</span>
                <span className="text-[0.6875rem] tabular-nums" style={{ color: statusColor }}>
                  {g.healthStatus.replace('-', ' ')}
                </span>
              </div>
              <div className="h-[4px] bg-[#F0F0F0] rounded-full overflow-hidden mb-[4px]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: g.color || '#441316' }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6875rem] text-[#888888] tabular-nums">{formatCurrency(Number(g.currentAmount), (g as unknown as { currency?: string }).currency)}</span>
                <span className="text-[0.6875rem] text-[#888888] tabular-nums">{formatCurrency(Number(g.targetAmount), (g as unknown as { currency?: string }).currency)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortfolioSummaryWidget() {
  const { data: overview, isLoading } = useWealthOverview();

  if (isLoading || !overview) {
    return <WidgetSkeleton title="Portfolio Summary" />;
  }

  const isPositive = Number(overview.dailyChangeAmount) >= 0;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px]">
      <h4 className="text-[0.8125rem] text-[#1A1A1A] font-medium mb-[8px]">Portfolio Summary</h4>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[1.25rem] text-[#1A1A1A] font-medium tabular-nums">
            {formatCurrency(Number(overview.totalValue), (overview as unknown as { currency?: string }).currency)}
          </p>
          <p className={`text-[0.8125rem] tabular-nums ${isPositive ? 'text-[#0F6F4E]' : 'text-[#C1464F]'}`}>
            {isPositive ? '+' : ''}{formatCurrency(Number(overview.dailyChangeAmount), (overview as unknown as { currency?: string }).currency)} ({Number(overview.dailyChangePercent).toFixed(2)}%)
          </p>
        </div>
        <span className="text-[0.6875rem] text-[#888888]">Today</span>
      </div>
    </div>
  );
}

function AdvisorHandoffWidget({ advisorName, actionContext, queueId }: { advisorName?: string; actionContext?: string; queueId?: number }) {
  const isExecutionHandoff = !!actionContext;
  const title = isExecutionHandoff
    ? `Plan Sent to ${advisorName || 'Your Advisor'}`
    : 'Advisor Review Recommended';
  const description = isExecutionHandoff
    ? `Your request has been sent to ${advisorName || 'your advisor'} for review and execution.${queueId ? ` Reference: #${queueId}` : ''}`
    : 'This topic would benefit from a conversation with your dedicated advisor for personalized guidance.';

  return (
    <div className="bg-[#FFF8F0] border border-[#E5C9A8] rounded-[12px] p-[16px] my-[8px]">
      <div className="flex items-start gap-[10px]">
        <div className="w-[32px] h-[32px] rounded-full bg-[#441316] flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-[0.8125rem] text-[#441316] font-medium mb-[4px]">{title}</h4>
          {actionContext && (
            <p className="text-[0.75rem] text-[#441316] bg-[#FFF0E0] rounded-[6px] px-[8px] py-[4px] mb-[8px]">
              {actionContext}
            </p>
          )}
          <p className="text-[0.75rem] text-[#555555] mb-[10px]">
            {description}
          </p>
          <button className="bg-[#441316] text-white text-[0.75rem] font-medium px-[16px] py-[8px] rounded-[8px]">
            Contact {advisorName || 'Your Advisor'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WidgetSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px] animate-pulse">
      <div className="text-[0.8125rem] text-[#1A1A1A] font-medium mb-[12px]">{title}</div>
      <div className="space-y-[8px]">
        <div className="h-[12px] bg-[#F0F0F0] rounded w-3/4" />
        <div className="h-[12px] bg-[#F0F0F0] rounded w-1/2" />
        <div className="h-[12px] bg-[#F0F0F0] rounded w-2/3" />
      </div>
    </div>
  );
}

export function ChatWidgetRenderer({ widget }: { widget: ChatWidget }) {
  switch (widget.type) {
    case 'allocation_chart':
      return <AllocationChart />;
    case 'holdings_summary':
      return <HoldingsSummary />;
    case 'goal_progress':
      return <GoalProgress />;
    case 'portfolio_summary':
      return <PortfolioSummaryWidget />;
    case 'advisor_handoff':
      return <AdvisorHandoffWidget advisorName={widget.advisorName} actionContext={widget.actionContext} queueId={widget.queueId} />;
    default:
      return null;
  }
}
