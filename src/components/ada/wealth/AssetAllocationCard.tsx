import React from 'react';
import { DonutChart, DonutSegment } from '../charts/DonutChart';

interface AllocationItem extends DonutSegment {
  amount: number;
}

interface AssetAllocationCardProps {
  allocations: AllocationItem[];
  totalValue: number;
}

export function AssetAllocationCard({ allocations, totalValue }: AssetAllocationCardProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            <p className="font-['DM_Sans',sans-serif] font-semibold not-italic relative shrink-0 text-[#992929] text-[0.625rem] tracking-[0.8px] uppercase">
              ASSET ALLOCATION
            </p>

            <p className="font-['Crimson_Pro',sans-serif] relative shrink-0 text-[#555555] text-[1.5rem] tracking-[-0.48px] w-full">
              Your portfolio breakdown
            </p>

            <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.875rem] opacity-60">
              Based on current market value
            </p>
          </div>

          {/* Chart and Legend */}
          <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
            {/* Donut Chart */}
            <div className="shrink-0">
              <DonutChart
                segments={allocations}
                size={140}
                strokeWidth={20}
                centerLabel="Total"
                centerValue={`$${(totalValue / 1000).toFixed(0)}k`}
              />
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] bg-[#d8d8d8] self-stretch" />

            {/* Legend */}
            <div className="flex-1 flex flex-col gap-[12px]">
              {allocations.map((allocation, index) => {
                const percentage = ((allocation.value / totalValue) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex items-center gap-[8px]">
                      <div
                        className="size-[12px] rounded-[2px] shrink-0"
                        style={{ backgroundColor: allocation.color }}
                      />
                      <p className="font-['DM_Sans',sans-serif] text-[0.875rem] text-[#555555] tracking-[-0.28px]">
                        {allocation.label}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-['DM_Sans',sans-serif] text-[1rem] text-[#555555] tracking-[-0.28px]">
                        {percentage}%
                      </p>
                      <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.625rem] opacity-60">
                        ${allocation.amount.toLocaleString()}
                      </p>
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
