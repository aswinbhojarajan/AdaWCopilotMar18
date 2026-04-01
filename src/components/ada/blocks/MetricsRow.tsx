import React from 'react';
import type { MetricsRowBlock } from '../../../../shared/schemas/agent';

interface MetricsRowProps {
  block: MetricsRowBlock;
}

export function MetricsRow({ block }: MetricsRowProps) {
  return (
    <div className="flex gap-[8px] overflow-x-auto scrollbar-hide py-[4px]">
      {block.metrics.map((metric, idx) => (
        <div
          key={idx}
          className="flex-shrink-0 min-w-[120px] bg-white rounded-[12px] px-[12px] py-[10px] border border-[#e8e5de]"
        >
          <p className="font-['DM_Sans',sans-serif] text-[#999] text-[0.625rem] tracking-[-0.2px] uppercase mb-[2px]">
            {metric.label}
          </p>
          <p className="font-['Crimson_Pro',serif] text-[#333] text-[1.125rem] tracking-[-0.36px] leading-tight">
            {metric.value}
            {metric.unit && (
              <span className="text-[0.75rem] text-[#999] ml-[2px]">{metric.unit}</span>
            )}
          </p>
          {metric.delta && (
            <div className="flex items-center gap-[2px] mt-[2px]">
              <span className={`text-[0.625rem] font-['DM_Sans',sans-serif] font-medium ${
                metric.delta.direction === 'up' ? 'text-[#2e7d32]' :
                metric.delta.direction === 'down' ? 'text-[#c0180c]' :
                'text-[#999]'
              }`}>
                {metric.delta.direction === 'up' && '▲'}
                {metric.delta.direction === 'down' && '▼'}
                {metric.delta.direction === 'neutral' && '—'}
                {' '}{metric.delta.value}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
