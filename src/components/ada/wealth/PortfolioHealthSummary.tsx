import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../Button';

interface PortfolioHealthSummaryProps {
  diversificationScore: number;
  riskLevel: string;
  topSuggestion: string;
  additionalSuggestions?: string[];
  onChatSubmit?: (message: string, context?: { category: string; categoryType: string; title: string; sourceScreen?: string }) => void;
}

export function PortfolioHealthSummary({
  diversificationScore,
  riskLevel,
  topSuggestion,
  additionalSuggestions = [],
  onChatSubmit,
}: PortfolioHealthSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = () => {
    if (riskLevel.toLowerCase().includes('low')) return '#6d3f42';
    if (riskLevel.toLowerCase().includes('medium')) return '#a87174';
    return '#992929';
  };

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start relative w-full">
          {/* Collapsed Summary */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="content-stretch flex gap-[12px] items-center w-full px-[24px] py-[16px] text-left"
          >
            <div className="shrink-0 size-[24px] flex items-center justify-center text-[#992929]">
              <Shield className="size-[20px]" strokeWidth={1.5} />
            </div>

            <div className="flex-1 flex flex-col gap-[4px]">
              <div className="flex items-center gap-[8px]">
                <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] not-italic text-[#555555] text-[14px]">
                  Portfolio Health
                </p>
                <div
                  className="px-[8px] py-[2px] rounded-[50px]"
                  style={{ backgroundColor: `${getRiskColor()}20` }}
                >
                  <p
                    className="font-['DM_Sans',sans-serif] text-[10px] capitalize"
                    style={{ color: getRiskColor() }}
                  >
                    {riskLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-[12px]">
                <div className="flex items-center gap-[4px]">
                  <p className="font-['DM_Sans',sans-serif] text-[12px] text-[#555555] opacity-60">
                    Diversification:
                  </p>
                  <p className="font-['DM_Sans',sans-serif] font-semibold text-[12px] text-[#555555]">
                    {diversificationScore}/100
                  </p>
                </div>

                {!isExpanded && (
                  <p className="font-['DM_Sans',sans-serif] text-[11px] text-[#555555] opacity-60 line-clamp-1">
                    {topSuggestion}
                  </p>
                )}
              </div>
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

              <div className="content-stretch flex flex-col gap-[16px] items-start px-[24px] pb-[20px] w-full">
                <div className="mt-[16px] flex flex-col gap-[8px]">
                  <p className="font-['DM_Sans',sans-serif] font-semibold text-[13px] text-[#555555]">
                    Suggested Actions
                  </p>

                  <ul className="flex flex-col gap-[6px]">
                    <li className="font-['DM_Sans',sans-serif] text-[13px] text-[#555555] leading-[1.4] pl-[16px] relative before:content-['•'] before:absolute before:left-[4px]">
                      {topSuggestion}
                    </li>
                    {additionalSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="font-['DM_Sans',sans-serif] text-[13px] text-[#555555] leading-[1.4] pl-[16px] relative before:content-['•'] before:absolute before:left-[4px]"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="ai-chat"
                  size="md"
                  onClick={() =>
                    onChatSubmit?.('Review my risk exposure', {
                      category: 'PORTFOLIO HEALTH',
                      categoryType: 'RISK ANALYSIS',
                      title: 'Portfolio health assessment',
                      sourceScreen: 'wealth',
                    })
                  }
                  className="w-full"
                >
                  Review my risk exposure
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
