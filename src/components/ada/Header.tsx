import React from 'react';
import svgPaths from '../../imports/svg-npbkfwfylb';
import { AdaLogo } from './AdaLogo';
import { useUser } from '../../contexts/UserContext';

interface HeaderProps {
  onNotificationsClick?: () => void;
  onClose?: () => void;
}

export function Header({ onNotificationsClick, onClose }: HeaderProps = {}) {
  const { activePersona, openPicker } = useUser();

  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start py-0 relative w-full" style={{ paddingLeft: 'var(--container-pad)', paddingRight: 'var(--container-pad)' }}>
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <div className="content-stretch flex items-center gap-[10px] relative shrink-0">
              <div className="flex items-center justify-center h-[28px] relative shrink-0 w-[66px]">
                <AdaLogo className="w-[65px] h-[26px]" />
              </div>
              {activePersona && (
                <button
                  onClick={openPicker}
                  className="flex items-center gap-[6px] bg-[#efede6] rounded-full px-[10px] py-[3px] hover:bg-[#e3e1d9] transition-colors cursor-pointer"
                >
                  <div className="w-[18px] h-[18px] rounded-full bg-[#441316] flex items-center justify-center">
                    <span className="text-white text-[0.5625rem] font-['DM_Sans',sans-serif] font-medium">
                      {activePersona.firstName.charAt(0)}{activePersona.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="font-['DM_Sans',sans-serif] font-medium text-[0.75rem] text-[#555] tracking-[-0.2px]">
                    {activePersona.firstName}
                  </span>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M2 3L4 5L6 3" stroke="#888" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="h-[24px] relative shrink-0 w-[64px]">
              <button
                onClick={onNotificationsClick}
                className="absolute left-[-12px] top-[-12px] w-[48px] h-[48px] cursor-pointer hover:opacity-70 transition-opacity z-10 flex items-center justify-center"
                aria-label="Notifications"
              >
                <div className="absolute top-[10px] right-[10px] size-[10px] bg-[#441316] rounded-full border-2 border-[#f7f6f2]" />
              </button>
              <button
                onClick={onClose}
                className="absolute right-[-12px] top-[-12px] w-[48px] h-[48px] cursor-pointer hover:opacity-70 transition-opacity z-10 flex items-center justify-center"
                aria-label="Close"
              />
              <div className="absolute inset-0 pointer-events-none">
                <svg
                  className="block w-full h-full"
                  fill="none"
                  preserveAspectRatio="xMaxYMid meet"
                  viewBox="0 0 65 21"
                >
                  <g>
                    <g>
                      <path
                        d={svgPaths.p19b3ea40}
                        stroke="#4C4C4C"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M8.27781 20.5H12.7223" stroke="#4C4C4C" strokeLinecap="round" />
                    </g>
                    <path
                      d={svgPaths.p24739000}
                      stroke="#4C4C4C"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
