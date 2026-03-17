import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DonutChart, DonutSegment } from '../charts/DonutChart';

interface AllocationItem extends DonutSegment {
  amount: number;
}

interface CompactAssetAllocationProps {
  allocations: AllocationItem[];
  totalValue: number;
}

export function CompactAssetAllocation({ 
  allocations,
  totalValue
}: CompactAssetAllocationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show only top 3 by default
  const topAllocations = allocations.slice(0, 3);
  const displayAllocations = isExpanded ? allocations : topAllocations;

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[20px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full mb-[16px]">
            <div className="flex flex-col gap-[2px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                ASSET ALLOCATION
              </p>
              <p className="font-['Crimson_Pro:Regular',sans-serif] relative shrink-0 text-[#555555] text-[20px] tracking-[-0.4px]">
                Portfolio breakdown
              </p>
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-[4px] text-[#992929]"
            >
              <p className="font-['DM_Sans:Regular',sans-serif] text-[12px]">
                {isExpanded ? 'Show less' : 'View all'}
              </p>
              {isExpanded ? (
                <ChevronUp className="size-[14px]" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-[14px]" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Chart and Legend */}
          <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full">
            {/* Donut Chart - Smaller when collapsed */}
            <div className="shrink-0">
              <DonutChart 
                segments={allocations}
                size={isExpanded ? 140 : 100}
                strokeWidth={isExpanded ? 20 : 16}
                centerLabel="Total"
                centerValue={`$${(totalValue / 1000).toFixed(0)}k`}
              />
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] bg-[#d8d8d8] self-stretch" />

            {/* Legend */}
            <div className="flex-1 flex flex-col gap-[10px]">
              {displayAllocations.map((allocation, index) => {
                const percentage = allocation.percentage;
                return (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex items-center gap-[8px]">
                      <div 
                        className="size-[10px] rounded-[2px] shrink-0"
                        style={{ backgroundColor: allocation.color }}
                      />
                      <p className="font-['DM_Sans:Regular',sans-serif] text-[13px] text-[#555555] tracking-[-0.26px]">
                        {allocation.label}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-['DM_Sans:Regular',sans-serif] text-[14px] text-[#555555] tracking-[-0.28px]">
                        {percentage}%
                      </p>
                      {isExpanded && (
                        <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[10px] opacity-60">
                          ${allocation.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
