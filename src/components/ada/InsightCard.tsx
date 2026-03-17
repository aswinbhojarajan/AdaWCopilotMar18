import React from 'react';
import { Clock } from 'lucide-react';

interface InsightCardProps {
  type: 'INSIGHT' | 'TREND' | 'POLL';
  title: string;
  description?: string;
  children: React.ReactNode;
  timestamp?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function InsightCard({
  type,
  title,
  description,
  children,
  timestamp,
  buttonText = "Ask Ada",
  onButtonClick
}: InsightCardProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
              <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
                <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] text-center tracking-[0.8px] uppercase">
                  {type === 'INSIGHT' ? 'INSIGHT | PEER SNAPSHOT' : type === 'POLL' ? 'POLL OF THE WEEK' : type}
                </p>
              </div>
              <div className="h-0 relative shrink-0 w-[162px]">
                <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 162 1">
                    <line stroke="#555555" strokeWidth="0.5" x2="162" y1="0.25" y2="0.25" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#555555] text-[24px] text-center tracking-[-0.48px] w-[277px]">
              {title}
            </p>

            {description && (
              <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#555555] text-[14px] text-center tracking-[-0.28px] w-[273px]">
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          {children}

          {/* Footer */}
          {timestamp && (
            <div className="bg-white h-[40px] relative rounded-bl-[32px] rounded-br-[32px] shrink-0 w-full -mx-[24px] -mb-[24px]">
              <div aria-hidden="true" className="absolute border-[#d8d8d8] border-[0.5px_0px_0px] border-solid inset-0 pointer-events-none rounded-bl-[32px] rounded-br-[32px]" />
              <div className="flex flex-col items-center justify-center size-full">
                <div className="content-stretch flex flex-col items-center justify-center px-[16px] py-[8px] relative size-full">
                  <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                    <div className="content-stretch flex gap-[6px] items-center justify-center opacity-70 relative shrink-0">
                      <div className="relative shrink-0 size-[7px]">
                        <div className="absolute inset-[-3.57%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                            <path d="M7.5 4C7.5 5.933 5.933 7.5 4 7.5C2.067 7.5 0.5 5.933 0.5 4C0.5 2.067 2.067 0.5 4 0.5C5.933 0.5 7.5 2.067 7.5 4Z" stroke="#555555" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[9px] text-nowrap">
                        <p className="leading-[18px] whitespace-pre">{timestamp}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}