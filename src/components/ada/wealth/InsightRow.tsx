import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../Button';

interface InsightRowProps {
  icon: React.ReactNode;
  title: string;
  summary: string;
  fullContent: string | React.ReactNode;
  cta?: {
    text: string;
    onClick: () => void;
  };
  defaultExpanded?: boolean;
}

export function InsightRow({
  icon,
  title,
  summary,
  fullContent,
  cta,
  defaultExpanded = false,
}: InsightRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start relative w-full">
          {/* Collapsed Row */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="content-stretch flex gap-[12px] items-center w-full px-[24px] py-[16px] text-left"
          >
            <div className="shrink-0 size-[24px] flex items-center justify-center text-[#992929]">
              {icon}
            </div>

            <div className="flex-1 flex flex-col gap-[2px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] not-italic text-[#555555] text-[0.875rem]">
                {title}
              </p>
              {!isExpanded && (
                <p className="font-['DM_Sans',sans-serif] leading-[1.3] not-italic text-[#555555] text-[0.75rem] opacity-60">
                  {summary}
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

              <div className="content-stretch flex flex-col gap-[12px] items-start px-[24px] pb-[20px] w-full">
                <div className="mt-[16px]">
                  {typeof fullContent === 'string' ? (
                    <p className="font-['DM_Sans',sans-serif] font-light leading-[1.5] not-italic text-[#555555] text-[0.875rem] tracking-[-0.28px]">
                      {fullContent}
                    </p>
                  ) : (
                    fullContent
                  )}
                </div>

                {cta && (
                  <Button variant="ai-chat" size="md" onClick={cta.onClick} className="w-full">
                    {cta.text}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
