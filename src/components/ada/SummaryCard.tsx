import React from 'react';

interface SummaryCardProps {
  date: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showSubBodycopy?: boolean;
}

export function SummaryCard({
  date,
  title,
  subtitle,
  children,
  showSubBodycopy = false,
}: SummaryCardProps) {
  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-[16px] px-[24px] relative w-full">
          {/* Header with Date Line */}
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex items-end justify-between not-italic relative shrink-0 w-full">
              <div className="flex flex-col font-['DM_Sans:Regular',sans-serif] h-[7px] justify-center leading-[0] relative shrink-0 text-[#555555] text-[9px] w-[75px]">
                <p className="leading-[18px]">Updated 6:00 AM</p>
              </div>
              <p className="font-['DM_Sans:SemiBold',sans-serif] h-[12px] leading-[18px] not-italic relative shrink-0 text-[#992929] text-[10px] text-center tracking-[0.8px] uppercase w-[138px]">
                {date}
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] h-[17px] leading-[28px] relative shrink-0 text-[#555555] text-[9px] text-right w-[75px]">
                {title}
              </p>
            </div>
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 315 1"
                >
                  <line stroke="#555555" strokeWidth="0.5" x2="315" y1="0.25" y2="0.25" />
                </svg>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="font-['Crimson_Pro:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#555555] text-[18px] text-center tracking-[-0.36px] w-full">
            <p className="leading-[normal] mb-0">
              {subtitle.includes('You have') ? (
                <>
                  {subtitle.split(/(?=You have)/)[0]}
                  <br />
                  {subtitle.split(/(?=You have)/)[1]}
                </>
              ) : subtitle.includes('are focusing on this week') ? (
                <>
                  {subtitle.split(/(?=are focusing on this week)/)[0]}
                  <br />
                  {subtitle.split(/(?=are focusing on this week)/)[1]}
                </>
              ) : subtitle.includes('plus a few') ? (
                <>
                  {subtitle.split(/(?=plus a few)/)[0]}
                  <br />
                  {subtitle.split(/(?=plus a few)/)[1]}
                </>
              ) : (
                subtitle
              )}
            </p>
          </div>

          {/* Sub bodycopy */}
          {showSubBodycopy && (
            <p className="font-['DM_Sans:Regular',sans-serif] leading-[normal] relative shrink-0 text-[#555555] text-[14px] text-center opacity-60 w-full">
              Ada can help you explore any insight here.
            </p>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
