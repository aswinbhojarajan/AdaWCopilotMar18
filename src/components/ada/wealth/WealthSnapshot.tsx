import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { WealthPerformanceChart } from '../charts/WealthPerformanceChart';
import { Button } from '../Button';

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

interface InsightDetail {
  icon: React.ReactNode;
  title: string;
  summary: string;
  fullContent: string | React.ReactNode;
  cta?: {
    text: string;
    onClick: () => void;
  };
}

interface WealthSnapshotProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  performanceData?: Record<string, { value: number; label: string }[]>;
  defaultTimeFrame?: TimeFrame;
  primaryInsight: string;
  onViewDetails?: () => void;
  insightDetails?: InsightDetail[];
}

export function WealthSnapshot({
  totalValue,
  dailyChange,
  dailyChangePercent,
  performanceData,
  defaultTimeFrame = '1M',
  primaryInsight,
  onViewDetails,
  insightDetails,
}: WealthSnapshotProps) {
  const isPositive = dailyChange >= 0;
  const [hoveredData, setHoveredData] = useState<{ value: number; label: string } | null>(null);
  const displayValue = hoveredData ? hoveredData.value : totalValue;

  const [expandedInsights, setExpandedInsights] = useState<{ [key: number]: boolean }>({});

  const toggleInsight = (index: number) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start relative w-full">
          <div className="content-stretch flex flex-col gap-[6px] items-start pb-[16px] pt-[16px] px-[24px] relative shrink-0 w-full">
            {/* Header */}
            <p className="font-['DM_Sans',sans-serif] font-semibold not-italic relative shrink-0 text-[#992929] text-[0.625rem] tracking-[0.8px] uppercase">
              TOTAL WEALTH
            </p>

            {/* Main Value and Change */}
            <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
              <p className="font-['Crimson_Pro',sans-serif] font-extralight leading-[28px] relative shrink-0 text-[#555555] text-[2.25rem] text-nowrap tracking-[-1.2px]">
                $
                {displayValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>

              {/* Daily Change Badge */}
              <div
                className={`content-stretch flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0 ${
                  isPositive ? 'bg-[#c6ff6a]' : 'bg-[#ff7e7e]'
                }`}
              >
                <div className="relative shrink-0 size-[8px]">
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 8 8"
                  >
                    {isPositive ? (
                      <path d="M4 0 L8 8 L0 8 Z" fill="#03561A" />
                    ) : (
                      <path d="M4 8 L8 0 L0 0 Z" fill="#560303" />
                    )}
                  </svg>
                </div>
                <p
                  className={`font-['DM_Sans',sans-serif] leading-[normal] not-italic relative shrink-0 text-[0.75rem] text-nowrap whitespace-pre ${
                    isPositive ? 'text-[#03561a]' : 'text-[#560303]'
                  }`}
                >
                  $
                  {Math.abs(dailyChange).toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  ({isPositive ? '+' : ''}
                  {dailyChangePercent.toFixed(2)}%)
                </p>
              </div>
            </div>

            {/* Performance Chart */}
            {performanceData && (
              <div className="mt-[12px] w-full">
                <WealthPerformanceChart
                  data={performanceData}
                  defaultTimeFrame={defaultTimeFrame}
                  height={160}
                  color="#441316"
                  fillGradient={{
                    startColor: 'rgba(217, 179, 181, 0.25)',
                    endColor: 'rgba(168, 113, 116, 0.05)',
                  }}
                  benchmarkComparison="+0.8% vs S&P 500"
                  onHoverData={setHoveredData}
                />
              </div>
            )}

            {/* Primary Insight */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full mt-[12px]">
              <p className="font-['DM_Sans',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#555555] text-[0.8125rem] tracking-[-0.26px] w-full">
                {primaryInsight}
              </p>
            </div>

            {/* View Details Link */}
            {!insightDetails && (
              <button
                onClick={onViewDetails}
                className="content-stretch flex gap-[4px] items-center relative shrink-0 group mt-[4px]"
              >
                <p className="font-['DM_Sans',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#992929] text-[0.75rem] group-hover:underline">
                  View full analysis
                </p>
                <ChevronRight className="size-[14px] text-[#992929]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Insight Details - Expandable Rows */}
          {insightDetails && insightDetails.length > 0 && (
            <>
              {insightDetails.map((detail, index) => {
                const isExpanded = expandedInsights[index];
                return (
                  <div key={index} className="w-full">
                    {/* Divider */}
                    <div className="px-[24px] w-full">
                      <div className="h-[1px] bg-[#555555] opacity-20" />
                    </div>

                    {/* Collapsed Row */}
                    <button
                      onClick={() => toggleInsight(index)}
                      className="content-stretch flex gap-[12px] items-center w-full px-[24px] py-[16px] text-left"
                    >
                      <div className="shrink-0 size-[24px] flex items-center justify-center text-[#992929]">
                        {detail.icon}
                      </div>

                      <div className="flex-1 flex flex-col gap-[2px]">
                        <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] not-italic text-[#555555] text-[0.875rem]">
                          {detail.title}
                        </p>
                        {!isExpanded && (
                          <p className="font-['DM_Sans',sans-serif] leading-[1.3] not-italic text-[#555555] text-[0.75rem] opacity-60">
                            {detail.summary}
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
                      <div className="content-stretch flex flex-col gap-[12px] items-start px-[24px] pb-[20px] w-full">
                        <div>
                          {typeof detail.fullContent === 'string' ? (
                            <p className="font-['DM_Sans',sans-serif] font-light leading-[1.5] not-italic text-[#555555] text-[0.875rem] tracking-[-0.28px]">
                              {detail.fullContent}
                            </p>
                          ) : (
                            detail.fullContent
                          )}
                        </div>

                        {detail.cta && (
                          <Button
                            variant="ai-primary"
                            size="md"
                            onClick={detail.cta.onClick}
                            className="w-full"
                          >
                            {detail.cta.text}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
