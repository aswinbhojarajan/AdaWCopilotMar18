import React, { useState } from 'react';

interface DisclaimerTrayProps {
  disclaimer: string;
}

export function DisclaimerTray({ disclaimer }: DisclaimerTrayProps) {
  const [expanded, setExpanded] = useState(false);

  if (!disclaimer) return null;

  return (
    <div className="border-t border-[#e8e5de]/60 pt-[6px]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-[4px] text-[#999] text-[0.5625rem] font-['DM_Sans',sans-serif] tracking-[0.2px]"
      >
        <svg
          className={`w-[10px] h-[10px] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Regulatory information
      </button>

      {expanded && (
        <p className="mt-[4px] font-['DM_Sans',sans-serif] text-[#999] text-[0.5625rem] leading-[1.4] font-light">
          {disclaimer}
        </p>
      )}
    </div>
  );
}
