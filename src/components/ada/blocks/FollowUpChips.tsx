import React from 'react';
import type { FollowUpChip } from '../../../../shared/schemas/agent';

interface FollowUpChipsProps {
  chips: FollowUpChip[];
  onTap: (prompt: string) => void;
}

const CHIP_ICONS: Record<string, React.ReactNode> = {
  chart: (
    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  compare: (
    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  risk: (
    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  action: (
    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  info: (
    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  advisor: (
    <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export function FollowUpChips({ chips, onTap }: FollowUpChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex gap-[6px] overflow-x-auto scrollbar-hide py-[2px]">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onTap(chip.prompt)}
          className="flex-shrink-0 inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-full bg-[#f7f6f2] border border-[#e8e5de] text-[#441316] text-[0.6875rem] font-['DM_Sans',sans-serif] font-medium transition-colors hover:bg-[#efede6] active:bg-[#e8e5de]"
        >
          {chip.icon && CHIP_ICONS[chip.icon]}
          {chip.label}
        </button>
      ))}
    </div>
  );
}
