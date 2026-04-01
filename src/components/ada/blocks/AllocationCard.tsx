import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { AllocationCardBlock } from '../../../../shared/schemas/agent';

interface AllocationCardProps {
  block: AllocationCardBlock;
}

const PALETTE = ['#441316', '#c0180c', '#d4836a', '#e8c4a0', '#a0e622', '#6b8e23', '#4a6741', '#8fbc8f', '#daa520', '#cd853f', '#b8860b'];

function getDimensionLabel(dim: string): string {
  const labels: Record<string, string> = {
    sector: 'Sector Allocation',
    geography: 'Geographic Allocation',
    asset_class: 'Asset Class Allocation',
    currency: 'Currency Allocation',
  };
  return labels[dim] || dim;
}

export function AllocationCard({ block }: AllocationCardProps) {
  const total = block.segments.reduce((sum, s) => sum + s.value, 0);
  const chartData = block.segments.map((seg, i) => ({
    name: seg.label,
    value: seg.value,
    color: seg.color || PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] overflow-hidden px-[14px] py-[12px]">
      <h4 className="font-['Crimson_Pro',serif] text-[#333] text-[0.875rem] tracking-[-0.28px] font-medium mb-[8px]">
        {block.label || getDimensionLabel(block.dimension)}
      </h4>

      <div className="flex items-center gap-[16px]">
        <div className="w-[100px] h-[100px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={46}
                paddingAngle={1}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 flex flex-col gap-[4px]">
          {block.segments.map((seg, i) => {
            const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0';
            const target = block.targetSegments?.find(t => t.label === seg.label);
            const targetTotal = block.targetSegments ? block.targetSegments.reduce((sum, t) => sum + t.value, 0) : 0;
            const targetPct = target && targetTotal > 0 ? ((target.value / targetTotal) * 100).toFixed(1) : null;
            return (
              <div key={i} className="flex items-center gap-[6px]">
                <div
                  className="w-[8px] h-[8px] rounded-full shrink-0"
                  style={{ backgroundColor: chartData[i]?.color }}
                />
                <span className="font-['DM_Sans',sans-serif] text-[#555] text-[0.6875rem] flex-1 truncate">
                  {seg.label}
                </span>
                <span className="font-['DM_Sans',sans-serif] text-[#333] text-[0.6875rem] font-medium tabular-nums">
                  {pct}%
                </span>
                {targetPct && (
                  <span className="font-['DM_Sans',sans-serif] text-[#999] text-[0.5625rem] tabular-nums">
                    (target {targetPct}%)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
