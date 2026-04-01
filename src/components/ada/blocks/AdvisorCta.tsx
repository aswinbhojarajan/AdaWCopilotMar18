import React, { useState } from 'react';
import type { AdvisorCtaBlock, AdvisorAction } from '../../../../shared/schemas/agent';

interface AdvisorCtaProps {
  block: AdvisorCtaBlock;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  share_with_rm: (
    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  book_review: (
    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  save_watchlist: (
    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  export_pdf: (
    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

const ACTION_LABELS: Record<string, string> = {
  share_with_rm: 'Share with RM',
  book_review: 'Book Review',
  save_watchlist: 'Save to Watchlist',
  export_pdf: 'Export PDF',
};

export function AdvisorCta({ block }: AdvisorCtaProps) {
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const handleAction = (action: AdvisorAction) => {
    if (action.demoEnabled) {
      setConfirmed(action.actionType);
      setTimeout(() => setConfirmed(null), 2000);
    }
  };

  return (
    <div className="flex gap-[8px] overflow-x-auto scrollbar-hide py-[2px]">
      {block.actions.map((action, idx) => {
        const isConfirmed = confirmed === action.actionType;
        return (
          <button
            key={idx}
            onClick={() => handleAction(action)}
            className={`flex-shrink-0 inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-full border text-[0.6875rem] font-['DM_Sans',sans-serif] font-medium transition-all duration-200 ${
              isConfirmed
                ? 'bg-[#2e7d32] border-[#2e7d32] text-white'
                : 'bg-white border-[#e8e5de] text-[#441316] hover:bg-[#f7f6f2]'
            }`}
          >
            {isConfirmed ? (
              <>
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Done
              </>
            ) : (
              <>
                {ACTION_ICONS[action.actionType]}
                {action.label || ACTION_LABELS[action.actionType] || action.actionType}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
