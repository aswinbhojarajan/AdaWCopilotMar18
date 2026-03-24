import React from 'react';
import { Clock, MoreVertical } from 'lucide-react';

interface ChatThreadProps {
  title: string;
  preview: string;
  timestamp: string;
  onClick?: () => void;
  onMenuClick?: () => void;
}

export function ChatThread({ title, preview, timestamp, onClick, onMenuClick }: ChatThreadProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white relative rounded-[20px] shrink-0 w-full text-left cursor-pointer"
    >
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-start justify-center px-[22px] py-[14px] relative w-full">
          {/* Content */}
          <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 flex-1">
            <p className="font-['DM_Sans',sans-serif] font-semibold text-[#667085] text-[0.875rem] tracking-[-0.28px]">
              {title}
            </p>
            <p
              className="font-['DM_Sans',sans-serif] font-light text-[#667085] text-[0.875rem] tracking-[-0.28px] line-clamp-2"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {preview}
            </p>

            {/* Timestamp */}
            <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
              <Clock className="size-[12px] text-[#667085]" strokeWidth={1.2} />
              <p className="font-['DM_Sans',sans-serif] text-[#667085] text-[0.625rem] tracking-[-0.2px]">
                {timestamp}
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.();
            }}
            className="relative shrink-0 size-[17px]"
          >
            <MoreVertical className="size-full text-[#667085]" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#e3e3e3] border-solid inset-0 pointer-events-none rounded-[20px]"
      />
    </div>
  );
}
