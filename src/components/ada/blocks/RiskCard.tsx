import React from 'react';
import type { RiskCardBlock } from '../../../../shared/schemas/agent';

interface RiskCardProps {
  block: RiskCardBlock;
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  low: { bg: 'bg-[#f0faf0]', text: 'text-[#2e7d32]', border: 'border-[#c8e6c9]', badge: 'bg-[#2e7d32]' },
  moderate: { bg: 'bg-[#fff8e1]', text: 'text-[#f57f17]', border: 'border-[#ffe082]', badge: 'bg-[#f57f17]' },
  elevated: { bg: 'bg-[#fff3e0]', text: 'text-[#e65100]', border: 'border-[#ffcc80]', badge: 'bg-[#e65100]' },
  high: { bg: 'bg-[#fef2f2]', text: 'text-[#c0180c]', border: 'border-[#ffcdd2]', badge: 'bg-[#c0180c]' },
};

const RISK_TYPE_LABELS: Record<string, string> = {
  concentration: 'Concentration Risk',
  volatility: 'Volatility Risk',
  diversification: 'Diversification Risk',
  liquidity: 'Liquidity Risk',
  drawdown: 'Drawdown Risk',
};

export function RiskCard({ block }: RiskCardProps) {
  const styles = SEVERITY_STYLES[block.severity] || SEVERITY_STYLES.moderate;

  return (
    <div className={`rounded-[12px] ${styles.bg} border ${styles.border} overflow-hidden px-[14px] py-[12px]`}>
      <div className="flex items-center gap-[8px] mb-[6px]">
        <span className={`${styles.badge} text-white text-[0.5625rem] font-['DM_Sans',sans-serif] font-medium uppercase tracking-[0.5px] px-[6px] py-[2px] rounded-full`}>
          {block.severity}
        </span>
        <span className="font-['DM_Sans',sans-serif] text-[#999] text-[0.625rem] uppercase tracking-[0.3px]">
          {RISK_TYPE_LABELS[block.riskType] || block.riskType}
        </span>
      </div>

      <h4 className={`font-['Crimson_Pro',serif] ${styles.text} text-[0.9375rem] tracking-[-0.3px] font-medium mb-[4px]`}>
        {block.title}
      </h4>

      <p className="font-['DM_Sans',sans-serif] text-[#555] text-[0.75rem] leading-[1.5] font-light">
        {block.description}
      </p>

      {block.metric && (
        <div className="mt-[8px] pt-[8px] border-t border-[#e8e5de]/50">
          <div className="flex items-baseline gap-[4px]">
            <span className="font-['DM_Sans',sans-serif] text-[#999] text-[0.625rem]">{block.metric.label}:</span>
            <span className={`font-['Crimson_Pro',serif] ${styles.text} text-[0.875rem] font-medium`}>
              {block.metric.value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
