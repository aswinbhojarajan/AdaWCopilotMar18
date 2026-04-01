import React from 'react';
import type { AlertBannerBlock } from '../../../../shared/schemas/agent';

interface AlertBannerProps {
  block: AlertBannerBlock;
  onChipTap?: (prompt: string) => void;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; title: string }> = {
  info: { bg: 'bg-[#e3f2fd]', border: 'border-[#90caf9]', icon: 'text-[#1565c0]', title: 'text-[#1565c0]' },
  warning: { bg: 'bg-[#fff8e1]', border: 'border-[#ffe082]', icon: 'text-[#f57f17]', title: 'text-[#f57f17]' },
  critical: { bg: 'bg-[#fef2f2]', border: 'border-[#ffcdd2]', icon: 'text-[#c0180c]', title: 'text-[#c0180c]' },
};

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  info: (
    <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  critical: (
    <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function AlertBanner({ block, onChipTap }: AlertBannerProps) {
  const styles = SEVERITY_STYLES[block.severity] || SEVERITY_STYLES.info;

  return (
    <div className={`rounded-[12px] ${styles.bg} border ${styles.border} px-[12px] py-[10px]`}>
      <div className="flex items-start gap-[8px]">
        <span className={`${styles.icon} mt-[1px] shrink-0`}>
          {SEVERITY_ICONS[block.severity]}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className={`font-['DM_Sans',sans-serif] ${styles.title} text-[0.8125rem] font-medium mb-[2px]`}>
            {block.title}
          </h4>
          <p className="font-['DM_Sans',sans-serif] text-[#555] text-[0.75rem] leading-[1.4] font-light">
            {block.message}
          </p>
          {block.action && (
            <button
              onClick={() => onChipTap?.(block.action!.chipText)}
              className={`mt-[6px] inline-flex items-center px-[10px] py-[4px] rounded-full ${styles.bg} border ${styles.border} ${styles.title} text-[0.6875rem] font-['DM_Sans',sans-serif] font-medium`}
            >
              {block.action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
