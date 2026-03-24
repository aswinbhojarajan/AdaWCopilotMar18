import React from 'react';
import { AdaLogo } from './AdaLogo';

interface ChatHeaderProps {
  onBack?: () => void;
  showNotifications?: boolean;
  title?: string;
}

export function ChatHeader({
  onBack,
  showNotifications: _showNotifications = true,
  title = 'Ada',
}: ChatHeaderProps) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start py-0 relative w-full" style={{ paddingLeft: 'var(--container-pad)', paddingRight: 'var(--container-pad)' }}>
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            {/* Back Button */}
            <button onClick={onBack} className="min-h-[48px] h-[48px] shrink-0 w-[48px] z-10 flex items-center justify-center cursor-pointer">
              <svg width="11" height="21" viewBox="0 0 11 21" fill="none">
                <path
                  d="M10.5 20.5L0.5 10.5L10.5 0.5"
                  stroke="#555555"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Logo - Centered to screen width */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-[28px] shrink-0">
              {title === 'Ada' ? (
                <AdaLogo className="w-[65px] h-[26px]" />
              ) : (
                <p className="font-['rl-limo',sans-serif] text-[1.25rem] text-[#441316] text-center">
                  {title}
                </p>
              )}
            </div>

            {/* Spacer for layout balance */}
            <div className="h-[48px] shrink-0 w-[48px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
