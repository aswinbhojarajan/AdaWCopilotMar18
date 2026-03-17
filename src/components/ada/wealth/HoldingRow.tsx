import React from 'react';
import { Sparkline } from '../charts/Sparkline';

interface HoldingRowProps {
  symbol: string;
  name: string;
  value: number;
  changePercent: number;
  sparklineData?: number[];
}

export function HoldingRow({
  symbol,
  name,
  value,
  changePercent,
  sparklineData = [],
}: HoldingRowProps) {
  const isPositive = changePercent >= 0;

  return (
    <div className="content-stretch flex items-center justify-between py-[12px] relative w-full border-b border-[#efede6] last:border-0">
      {/* Left: Symbol + Name */}
      <div className="flex flex-col gap-[2px] flex-1">
        <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555]">{symbol}</p>
        <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[12px] opacity-60">
          {name}
        </p>
      </div>

      {/* Center: Sparkline */}
      {sparklineData.length > 0 && (
        <div className="flex items-center justify-center px-[12px]">
          <Sparkline
            data={sparklineData}
            width={60}
            height={24}
            color={isPositive ? '#2d3a0a' : '#992929'}
          />
        </div>
      )}

      {/* Right: Value + Change */}
      <div className="flex flex-col items-end gap-[4px]">
        <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555]">
          ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div
          className={`content-stretch flex h-[20px] items-center justify-center px-[6px] py-[4px] relative rounded-[4px] shrink-0 ${
            isPositive ? 'bg-[#c6ff6a]' : 'bg-[#ff7e7e]'
          }`}
        >
          <p
            className={`font-['DM_Sans:SemiBold',sans-serif] not-italic relative shrink-0 text-[10px] text-nowrap whitespace-pre ${
              isPositive ? 'text-[#03561a]' : 'text-[#560303]'
            }`}
          >
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
