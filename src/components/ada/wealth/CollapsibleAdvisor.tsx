import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { Button } from '../Button';

interface CollapsibleAdvisorProps {
  advisorName?: string;
  availability?: string;
  onContactAdvisor: () => void;
  defaultExpanded?: boolean;
}

export function CollapsibleAdvisor({
  advisorName = 'Sarah Mitchell',
  availability = 'Available today',
  onContactAdvisor,
  defaultExpanded = false,
}: CollapsibleAdvisorProps) {
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
            <div className="shrink-0 size-[40px] rounded-full bg-[#efede6] flex items-center justify-center text-[#992929]">
              <User className="size-[20px]" strokeWidth={1.5} />
            </div>

            <div className="flex-1 flex flex-col gap-[2px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] not-italic text-[#555555] text-[0.875rem]">
                {advisorName}
              </p>
              <p className="font-['DM_Sans',sans-serif] leading-[1.3] not-italic text-[#555555] text-[0.75rem] opacity-60">
                {availability}
              </p>
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
                  <p className="font-['DM_Sans',sans-serif] font-semibold text-[#992929] text-[0.625rem] tracking-[0.8px] uppercase">
                    YOUR ADVISOR
                  </p>
                  <p className="font-['Crimson_Pro',sans-serif] text-[#555555] text-[1.25rem] tracking-[-0.4px]">
                    Expert guidance when you need it
                  </p>
                  <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.8125rem] opacity-60 leading-[1.5]">
                    Your dedicated advisor is available to discuss your portfolio, review your
                    goals, or explore new strategies tailored to your needs.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-[8px]">
                  <div className="flex items-center gap-[8px] pb-[8px] border-b border-[#e3e3e3]">
                    <div className="shrink-0 size-[48px] rounded-full bg-[#efede6] flex items-center justify-center text-[#992929]">
                      <User className="size-[24px]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="font-['DM_Sans',sans-serif] font-semibold text-[0.875rem] text-[#555555]">
                        {advisorName}
                      </p>
                      <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#555555] opacity-60">
                        Senior Wealth Advisor
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="size-[8px] rounded-full bg-[#6abe45]" />
                    </div>
                  </div>

                  <p className="font-['DM_Sans',sans-serif] text-[0.75rem] text-[#555555] opacity-60">
                    {availability} · Response time: ~2 hours
                  </p>
                </div>

                <Button variant="primary" size="md" onClick={onContactAdvisor} className="w-full">
                  Contact advisor
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
