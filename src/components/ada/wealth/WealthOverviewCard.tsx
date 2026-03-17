import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { WealthPerformanceChart } from '../charts/WealthPerformanceChart';
import { Sparkline } from '../charts/Sparkline';
import { SparkIcon } from '../SparkIcon';

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y';

interface WealthOverviewCardProps {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChangePercent?: number;
  monthlyChangePercent?: number;
  sparklineData?: number[];
  performanceData?: {
    '1D': { value: number; label: string }[];
    '1W': { value: number; label: string }[];
    '1M': { value: number; label: string }[];
    '3M': { value: number; label: string }[];
    '1Y': { value: number; label: string }[];
  };
  defaultTimeFrame?: TimeFrame;
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
}

export function WealthOverviewCard({
  totalValue,
  dailyChange,
  dailyChangePercent,
  weeklyChangePercent,
  monthlyChangePercent,
  sparklineData = [],
  performanceData,
  defaultTimeFrame = '1M',
  onChatSubmit
}: WealthOverviewCardProps) {
  const isPositive = dailyChange >= 0;
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(defaultTimeFrame);
  const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y'];
  
  // State for hovered data point from chart
  const [hoveredData, setHoveredData] = useState<{ value: number; label: string } | null>(null);
  
  // Display the hovered value or the default total value
  const displayValue = hoveredData ? hoveredData.value : totalValue;

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            {/* Header */}
            <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
              <div className="flex items-center gap-[6px]">
                <p className="font-['DM_Sans:SemiBold',sans-serif] not-italic relative shrink-0 text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                  TOTAL WEALTH
                </p>
              </div>
            </div>

            {/* Main Value */}
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              {/* Value and Badge Row */}
              <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
                <p className="font-['Crimson_Pro:ExtraLight',sans-serif] font-extralight leading-[28px] relative shrink-0 text-[#555555] text-[40px] text-nowrap tracking-[-1.2px] whitespace-pre">
                  ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                
                {/* Daily Change Badge */}
                <div className={`content-stretch flex gap-[6px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[50px] shrink-0 ${
                  isPositive ? 'bg-[#c6ff6a]' : 'bg-[#ff7e7e]'
                }`}>
                  <div className="relative shrink-0 size-[8px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                      {isPositive ? (
                        <path d="M4 0 L8 8 L0 8 Z" fill="#03561A" />
                      ) : (
                        <path d="M4 8 L8 0 L0 0 Z" fill="#560303" />
                      )}
                    </svg>
                  </div>
                  <p className={`font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-nowrap whitespace-pre ${
                    isPositive ? 'text-[#03561a]' : 'text-[#560303]'
                  }`}>
                    ${Math.abs(dailyChange).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigals: 1 })} ({isPositive ? '+' : ''}{dailyChangePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
                  Yesterday: {dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent.toFixed(1)}%
                </p>
                <div className="flex h-[16px] items-center justify-center relative shrink-0 w-0">
                  <div className="flex-none rotate-[270deg]">
                    <div className="h-0 relative w-[16px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 1">
                        <line stroke="#441316" strokeWidth="0.5" x2="16" y1="0.25" y2="0.25" />
                      </svg>
                    </div>
                  </div>
                </div>
                {weeklyChangePercent !== undefined && (
                  <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">
                    Last 7 days: {weeklyChangePercent >= 0 ? '+' : ''}{weeklyChangePercent.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>

            {/* Performance Chart */}
            {performanceData && (
              <div className="mt-[16px] w-full">
                <WealthPerformanceChart 
                  data={performanceData}
                  defaultTimeFrame={defaultTimeFrame}
                  height={220}
                  color="#441316"
                  fillGradient={{
                    startColor: 'rgba(217, 179, 181, 0.25)',
                    endColor: 'rgba(168, 113, 116, 0.05)'
                  }}
                  benchmarkComparison="+0.8% vs S&P 500"
                  onHoverData={setHoveredData}
                />
              </div>
            )}

            {/* Intelligence Insights Section */}
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full mt-[24px]">
              
              {/* Insight Block 1 - Portfolio Concentration Alert */}
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full pb-[16px] border-b border-[#e3e3e3]">
                <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px]">
                  Portfolio Concentration Alert
                </p>
                <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">
                  Over 33% of your invested wealth is currently concentrated in global equities, primarily US technology.{' '}
                  <span className="font-['DM_Sans:Regular',sans-serif]">This has driven strong returns, but it also increases sensitivity to market corrections.</span>
                </p>
              </div>

              {/* Insight Block 2 - Top Contributors to Performance */}
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full pb-[16px] border-b border-[#e3e3e3]">
                <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px]">
                  Top Contributors to Performance
                </p>
                <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">
                  Your strongest contributors this year have been:
                </p>
                <ul className="ml-[16px] space-y-[4px]">
                  <li className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[14px] tracking-[-0.28px] list-disc">
                    US Technology Equity Fund
                  </li>
                  <li className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[14px] tracking-[-0.28px] list-disc">
                    Global Growth ETF
                  </li>
                </ul>
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">
                  These assets account for 65% of your portfolio gains.
                </p>
              </div>

              {/* Insight Block 3 - Emerging Risk to Watch */}
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px]">
                  Emerging Risk to Watch
                </p>
                <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#555555] text-[14px] tracking-[-0.28px] w-full">
                  If equity markets experience a 15–20% correction, your portfolio drawdown could exceed your comfort range.{' '}
                  <span className="font-['DM_Sans:Regular',sans-serif]">Diversification into lower-volatility or hedged assets could reduce this impact.</span>
                </p>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full mt-[20px]">
              <button 
                onClick={() => onChatSubmit?.('Review my risk exposure', {
                  category: 'TOTAL WEALTH',
                  categoryType: 'RISK ANALYSIS',
                  title: `33% concentration in global equities`,
                  sourceScreen: 'wealth'
                })}
                className="content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0"
              >
                <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
                <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                  <SparkIcon color="#555555" />
                </div>
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Review my risk exposure</p>
              </button>
              <button 
                onClick={() => onChatSubmit?.('Discover diversification ideas', {
                  category: 'TOTAL WEALTH',
                  categoryType: 'DIVERSIFICATION',
                  title: `Portfolio concentration risk`,
                  sourceScreen: 'wealth'
                })}
                className="content-stretch flex gap-[6px] h-[44px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0"
              >
                <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]" />
                <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                  <SparkIcon color="#555555" />
                </div>
                <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[12px] text-nowrap whitespace-pre">Discover diversification ideas</p>
              </button>
            </div>

            {/* Timestamp - Bottom Right */}
            <div className="content-stretch flex gap-[2px] items-center justify-end relative shrink-0 w-full mt-[8px]">
              <Clock className="size-[12px] text-[#555555]" strokeWidth={1} />
              <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap text-right">
                <p className="leading-[normal]">Updated today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}