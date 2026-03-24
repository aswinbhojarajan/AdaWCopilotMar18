import React from 'react';
import { Clock } from 'lucide-react';

interface TrendCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function TrendCard({
  icon,
  title,
  description,
  timestamp,
  buttonText = 'Ask Ada',
  onButtonClick,
}: TrendCardProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header */}
          <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
            <div className="flex items-center justify-center shrink-0 size-[40px] rounded-full bg-[#f7f6f2]">
              {icon}
            </div>
            <div className="flex flex-col gap-[4px] flex-1">
              <p className="font-['Crimson_Pro',sans-serif] text-[#555555] tracking-[-0.48px]">
                {title}
              </p>
              <p
                className="font-['DM_Sans',sans-serif] font-light text-[#555555]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {description}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <button
              onClick={onButtonClick}
              className="bg-[#f7f6f2] content-stretch flex h-[48px] items-center justify-center px-[14px] py-[10px] relative rounded-[50px] shrink-0"
            >
              <div
                aria-hidden="true"
                className="absolute border-[#d8d8d8] border-[0.75px] border-solid inset-0 pointer-events-none rounded-[50px]"
              />
              <p className="font-['DM_Sans',sans-serif] not-italic relative shrink-0 text-[#555555] text-nowrap whitespace-pre">
                {buttonText}
              </p>
            </button>

            {timestamp && (
              <div className="content-stretch flex gap-[2px] items-center justify-end relative shrink-0 w-full">
                <Clock className="size-[12px] text-[#555555]" strokeWidth={1} />
                <div className="flex flex-col font-['DM_Sans',sans-serif] justify-center not-italic relative shrink-0 text-[#555555] text-nowrap text-right">
                  <p>{timestamp}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
