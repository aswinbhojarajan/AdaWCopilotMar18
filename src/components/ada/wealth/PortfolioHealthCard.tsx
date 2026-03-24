import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SparkIcon } from '../SparkIcon';

interface PortfolioHealthCardProps {
  diversificationScore: number; // 0-100
  riskLevel: 'low' | 'low-medium' | 'moderate' | 'high';
  suggestions?: string[];
  onChatSubmit?: (message: string) => void;
}

export function PortfolioHealthCard({
  diversificationScore,
  riskLevel,
  suggestions = [],
  onChatSubmit,
}: PortfolioHealthCardProps) {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'low':
        return {
          color: '#a0e622',
          textColor: '#2d3a0a',
          label: 'Low Risk',
          icon: CheckCircle,
        };
      case 'low-medium':
        return {
          color: '#a0e622',
          textColor: '#2d3a0a',
          label: 'Low-Medium',
          icon: CheckCircle,
        };
      case 'moderate':
        return {
          color: '#f59e0b',
          textColor: '#78350f',
          label: 'Moderate Risk',
          icon: AlertCircle,
        };
      case 'high':
        return {
          color: '#992929',
          textColor: '#ffffff',
          label: 'High Risk',
          icon: AlertCircle,
        };
    }
  };

  const riskConfig = getRiskConfig();
  const _RiskIcon = riskConfig.icon;

  const _getScoreColor = () => {
    if (diversificationScore >= 75) return '#a87174';
    if (diversificationScore >= 50) return '#6d3f42';
    return '#441316';
  };

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
            <p className="font-['DM_Sans',sans-serif] font-semibold not-italic relative shrink-0 text-[#992929] text-[0.625rem] tracking-[0.8px] uppercase">
              PORTFOLIO HEALTH
            </p>

            <p className="font-['Crimson_Pro',sans-serif] relative shrink-0 text-[#555555] text-[1.5rem] tracking-[-0.48px] w-full">
              Diversification & Risk
            </p>
          </div>

          {/* Metrics */}
          <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
            {/* Diversification Score */}
            <div className="flex-1 flex flex-col gap-[4px]">
              <p className="font-['DM_Sans',sans-serif] font-medium text-[#555555] text-[0.75rem]">
                Diversification Score
              </p>
              <p
                className="tracking-[-0.4px] text-[1.5rem] text-[rgb(85,85,85)]"
                style={{ fontFamily: 'Crimson Pro', fontWeight: 200 }}
              >
                {diversificationScore}/100
              </p>
              <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.6875rem] opacity-50">
                Well diversified
              </p>
            </div>

            {/* Risk Level */}
            <div className="flex-1 flex flex-col gap-[4px]">
              <p className="font-['DM_Sans',sans-serif] font-medium text-[#555555] text-[0.75rem]">
                Risk Level
              </p>
              <p
                className="tracking-[-0.4px] text-[1.5rem] text-[rgb(85,85,85)]"
                style={{ fontFamily: 'Crimson Pro', fontWeight: 200 }}
              >
                {riskConfig.label}
              </p>
              <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.6875rem] opacity-50">
                Aligned with current asset mix
              </p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full pt-[20px] border-t border-[#f0ede4]">
            <p className="font-['DM_Sans',sans-serif] font-semibold text-[#555555] text-[0.6875rem] uppercase tracking-[0.8px]">
              Suggested Actions
            </p>

            {/* Render suggestions from props */}
            {suggestions.length > 0 && (
              <>
                {/* Primary Insight (first suggestion) */}
                <div className="flex items-start gap-[8px] w-full">
                  <div className="size-[3px] rounded-full bg-[#441316] mt-[7px] shrink-0" />
                  <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.75rem] flex-1">
                    {suggestions[0]}
                  </p>
                </div>

                {/* Secondary Suggestions (remaining suggestions) */}
                {suggestions.length > 1 && (
                  <div className="flex flex-col gap-[6px] w-full">
                    {suggestions.slice(1).map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-[8px]">
                        <div className="size-[3px] rounded-full bg-[#441316] mt-[7px] shrink-0 opacity-40" />
                        <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.75rem] flex-1 opacity-60">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex gap-[8px] w-full">
            <button
              onClick={() => onChatSubmit?.('View my risk breakdown')}
              className="bg-[#441316] content-stretch flex gap-[6px] h-[48px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0 flex-1"
            >
              <div className="relative shrink-0 size-[24px] flex items-center justify-center">
                <SparkIcon />
              </div>
              <p className="font-['DM_Sans',sans-serif] leading-[normal] not-italic relative shrink-0 text-white text-[0.75rem] text-nowrap whitespace-pre">
                View risk breakdown
              </p>
            </button>
            <button className="content-stretch flex h-[48px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0 flex-1">
              <div
                aria-hidden="true"
                className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
              />
              <p className="font-['DM_Sans',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[0.75rem] text-nowrap whitespace-pre">
                Contact advisor
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
