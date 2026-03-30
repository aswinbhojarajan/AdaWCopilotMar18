import React, { useState, useRef, useEffect } from 'react';
import svgPaths from '../../imports/svg-npbkfwfylb';
import { AdaLogo } from './AdaLogo';
import { useSession, useLogout } from '../../hooks/useAuth';

interface HeaderProps {
  onNotificationsClick?: () => void;
  onClose?: () => void;
}

export function Header({ onNotificationsClick }: HeaderProps = {}) {
  const { data: session } = useSession();
  const logoutMutation = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const displayName = session?.displayName || 'User';
  const initials = displayName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    logoutMutation.mutate();
  };

  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start py-0 relative w-full px-[24px]">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <div className="content-stretch flex items-center gap-[10px] relative shrink-0">
              <div className="flex items-center justify-center h-[28px] relative shrink-0 w-[66px]">
                <AdaLogo className="w-[65px] h-[26px]" />
              </div>
              {session && (
                <div className="flex items-center gap-[6px] bg-[#efede6] rounded-full px-[10px] py-[3px]">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#441316] flex items-center justify-center">
                    <span className="text-white text-[0.5625rem] font-['DM_Sans',sans-serif] font-medium">
                      {initials}
                    </span>
                  </div>
                  <span className="font-['DM_Sans',sans-serif] font-medium text-[0.75rem] text-[#555] tracking-[-0.2px]">
                    {displayName.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center shrink-0 -mr-[14px]">
              <button
                onClick={onNotificationsClick}
                className="relative w-[48px] h-[48px] cursor-pointer hover:opacity-70 transition-opacity z-10 flex items-center justify-center"
                aria-label="Notifications"
              >
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                  <path
                    d={svgPaths.p19b3ea40}
                    stroke="#4C4C4C"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8.27781 20.5H12.7223" stroke="#4C4C4C" strokeLinecap="round" />
                </svg>
                <div className="absolute top-[8px] right-[8px] size-[10px] bg-[#441316] rounded-full border-2 border-[#f7f6f2]" />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="relative w-[48px] h-[48px] cursor-pointer hover:opacity-70 transition-opacity z-10 flex items-center justify-center"
                  aria-label="Profile menu"
                >
                  <div className="w-[28px] h-[28px] rounded-full bg-[#441316] flex items-center justify-center border-2 border-[#f7f6f2]">
                    <span className="text-white text-[0.625rem] font-['DM_Sans',sans-serif] font-medium">
                      {initials}
                    </span>
                  </div>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-[48px] w-[200px] bg-white rounded-[16px] shadow-lg border border-[#e3e3e3] overflow-hidden z-50">
                    <div className="px-[16px] py-[12px] border-b border-[#f0f0f0]">
                      <p className="font-['DM_Sans',sans-serif] font-medium text-[0.8125rem] text-[#333]">
                        {displayName}
                      </p>
                      <p className="font-['DM_Sans',sans-serif] text-[0.6875rem] text-[#999] mt-[2px]">
                        {session?.email}
                      </p>
                      {session?.mockTier && (
                        <span className="inline-block mt-[4px] font-['DM_Sans',sans-serif] text-[0.5625rem] tracking-[0.4px] uppercase text-[#441316] bg-[#441316]/8 px-[6px] py-[1px] rounded-full">
                          {session.mockTier}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-[16px] py-[12px] text-left font-['DM_Sans',sans-serif] text-[0.8125rem] text-[#c0180c] hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-[8px]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H6" stroke="#c0180c" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M11 11L14 8L11 5" stroke="#c0180c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 8H6" stroke="#c0180c" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
