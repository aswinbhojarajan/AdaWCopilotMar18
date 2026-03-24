import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { HoldingRow } from './HoldingRow';

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  changePercent: number;
  changeAmount: number;
}

interface CompactHoldingsProps {
  holdings: Holding[];
}

export function CompactHoldings({ holdings }: CompactHoldingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (holdings.length === 0) return null;

  const topHoldings = holdings.slice(0, 3);

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start relative w-full">
          {/* Header Row */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="content-stretch flex gap-[12px] items-center w-full px-[24px] py-[16px] text-left"
          >
            <div className="shrink-0 size-[24px] flex items-center justify-center text-[#992929]">
              <TrendingUp className="size-[20px]" strokeWidth={1.5} />
            </div>

            <div className="flex-1 flex flex-col gap-[2px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] not-italic text-[#555555] text-[14px]">
                Top Holdings
              </p>
              {!isExpanded && topHoldings.length > 0 && (
                <p className="font-['DM_Sans',sans-serif] leading-[1.3] not-italic text-[#555555] text-[12px] opacity-60">
                  {topHoldings.map((h) => h.symbol).join(', ')} · +
                  {topHoldings[0].changePercent.toFixed(1)}% avg
                </p>
              )}
            </div>

            <div className="shrink-0 size-[20px] flex items-center justify-center text-[#555555]">
              {isExpanded ? (
                <ChevronUp className="size-[16px]" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-[16px]" strokeWidth={2} />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Divider Line - Inset to match card padding */}
              <div className="px-[24px] w-full">
                <div className="h-[1px] bg-[#555555] opacity-20" />
              </div>

              <div className="content-stretch flex flex-col items-start px-[24px] pb-[16px] w-full">
                <div className="mt-[12px] w-full">
                  <p className="font-['DM_Sans',sans-serif] font-semibold text-[#992929] text-[10px] tracking-[0.8px] uppercase mb-[8px]">
                    YOUR TOP GAINERS THIS YEAR
                  </p>
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                    {holdings.map((holding, index) => (
                      <HoldingRow key={index} {...holding} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
