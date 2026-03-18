import React from 'react';
import { useAllocations } from '../../hooks/useAllocations';
import { useHoldings } from '../../hooks/useHoldings';
import { useGoals } from '../../hooks/useGoals';
import { useWealthOverview } from '../../hooks/usePortfolio';
import type { ChatWidget, AssetAllocation, Holding, GoalData } from '../../types';

function AllocationChart() {
  const { data: allocations, isLoading } = useAllocations();

  if (isLoading || !allocations) {
    return <WidgetSkeleton title="Asset Allocation" />;
  }

  const total = (allocations as AssetAllocation[]).reduce((s, a) => s + Number(a.amount || a.value || 0), 0);

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px]">
      <h4 className="text-[13px] text-[#1A1A1A] font-medium mb-[12px]">Asset Allocation</h4>
      <div className="space-y-[8px]">
        {(allocations as AssetAllocation[]).map((a, i) => {
          const pct = total > 0 ? ((Number(a.amount || a.value || 0) / total) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-[4px]">
                <span className="text-[12px] text-[#555555]">{a.label}</span>
                <span className="text-[12px] text-[#1A1A1A] font-medium tabular-nums">{pct.toFixed(1)}%</span>
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
      <h4 className="text-[13px] text-[#1A1A1A] font-medium mb-[12px]">Top Holdings</h4>
      <div className="space-y-[10px]">
        {sorted.map((h, i) => (
          <div key={i} className="flex justify-between items-center">
            <div>
              <span className="text-[12px] text-[#1A1A1A] font-medium">{h.symbol}</span>
              <span className="text-[11px] text-[#888888] ml-[6px]">{h.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[12px] text-[#1A1A1A] tabular-nums">${Number(h.value).toLocaleString()}</span>
              <span className={`text-[11px] ml-[6px] tabular-nums ${Number(h.changePercent) >= 0 ? 'text-[#0F6F4E]' : 'text-[#C1464F]'}`}>
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
      <h4 className="text-[13px] text-[#1A1A1A] font-medium mb-[12px]">Goal Progress</h4>
      <div className="space-y-[12px]">
        {(goals as GoalData[]).map((g, i) => {
          const pct = (Number(g.currentAmount) / Number(g.targetAmount)) * 100;
          const statusColor = g.healthStatus === 'on-track' ? '#0F6F4E' : g.healthStatus === 'at-risk' ? '#C1464F' : '#D4A017';
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-[4px]">
                <span className="text-[12px] text-[#1A1A1A]">{g.title}</span>
                <span className="text-[11px] tabular-nums" style={{ color: statusColor }}>
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
                <span className="text-[11px] text-[#888888] tabular-nums">${Number(g.currentAmount).toLocaleString()}</span>
                <span className="text-[11px] text-[#888888] tabular-nums">${Number(g.targetAmount).toLocaleString()}</span>
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
      <h4 className="text-[13px] text-[#1A1A1A] font-medium mb-[8px]">Portfolio Summary</h4>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[20px] text-[#1A1A1A] font-medium tabular-nums">
            ${Number(overview.totalValue).toLocaleString()}
          </p>
          <p className={`text-[13px] tabular-nums ${isPositive ? 'text-[#0F6F4E]' : 'text-[#C1464F]'}`}>
            {isPositive ? '+' : ''}${Number(overview.dailyChangeAmount).toLocaleString()} ({Number(overview.dailyChangePercent).toFixed(2)}%)
          </p>
        </div>
        <span className="text-[11px] text-[#888888]">Today</span>
      </div>
    </div>
  );
}

function WidgetSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[16px] my-[8px] animate-pulse">
      <div className="text-[13px] text-[#1A1A1A] font-medium mb-[12px]">{title}</div>
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
    default:
      return null;
  }
}
