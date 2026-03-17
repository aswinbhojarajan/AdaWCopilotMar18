import React from 'react';
import svgPaths from '../../imports/svg-npbkfwfylb';
import { AdaLogo } from './AdaLogo';

interface HeaderProps {
  onNotificationsClick?: () => void;
  onClose?: () => void;
}

export function Header({ onNotificationsClick, onClose }: HeaderProps = {}) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start px-[24px] py-0 relative w-full">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            {/* Logo */}
            <div className="content-stretch flex items-center relative shrink-0 w-[191.5px]">
              <div className="flex items-center justify-center h-[28px] relative shrink-0 w-[66px]">
                <AdaLogo className="w-[65px] h-[26px]" />
              </div>
            </div>

            {/* Notification & Settings Icons */}
            <div className="h-[24px] relative shrink-0 w-[64px]">
              {/* Clickable Notification Bell Area */}
              <button
                onClick={onNotificationsClick}
                className="absolute left-0 top-0 w-[24px] h-[24px] -m-[2px] cursor-pointer hover:opacity-70 transition-opacity z-10"
                aria-label="Notifications"
              >
                {/* Unread badge */}
                <div className="absolute top-0 right-0 size-[10px] bg-[#441316] rounded-full border-2 border-[#f7f6f2]" />
              </button>
              {/* Clickable Close (X) Button Area */}
              <button
                onClick={onClose}
                className="absolute right-0 top-0 w-[24px] h-[24px] -m-[2px] cursor-pointer hover:opacity-70 transition-opacity z-10"
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
