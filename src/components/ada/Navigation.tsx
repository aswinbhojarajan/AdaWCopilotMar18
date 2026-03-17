import React from 'react';

interface NavigationProps {
  activeTab: 'home' | 'wealth' | 'discover' | 'lounge';
  onTabChange: (tab: 'home' | 'wealth' | 'discover' | 'lounge') => void;
}

export function Navigation({ activeTab = 'home', onTabChange }: NavigationProps) {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[32px] h-[40px] items-center px-[24px] py-0 relative shrink-0 w-full">
      <button onClick={() => onTabChange('home')}>
        <div className="content-stretch flex flex-col items-start relative shrink-0">
          <p className={`font-['DM_Sans:${activeTab === 'home' ? 'SemiBold' : 'Regular'}',sans-serif] h-[10px] leading-[1.3] not-italic relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[39px] ${activeTab === 'home' ? '' : 'opacity-60'}`}>
            HOME
          </p>
        </div>
      </button>

      <button onClick={() => onTabChange('wealth')}>
        <p className={`font-['DM_Sans:${activeTab === 'wealth' ? 'SemiBold' : 'Regular'}',sans-serif] h-[10px] leading-[1.3] not-italic ${activeTab === 'wealth' ? '' : 'opacity-60'} relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[45px]`}>
          WEALTH
        </p>
      </button>

      <button onClick={() => onTabChange('discover')}>
        <p className={`font-['DM_Sans:${activeTab === 'discover' ? 'SemiBold' : 'Regular'}',sans-serif] h-[10px] leading-[1.3] not-italic ${activeTab === 'discover' ? '' : 'opacity-60'} relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[57px]`}>
          DISCOVER
        </p>
      </button>

      <button onClick={() => onTabChange('lounge')}>
        <p className={`font-['DM_Sans:${activeTab === 'lounge' ? 'SemiBold' : 'Regular'}',sans-serif] h-[10px] leading-[1.3] not-italic ${activeTab === 'lounge' ? '' : 'opacity-60'} relative shrink-0 text-[#441316] text-[10px] text-center tracking-[1.2px] uppercase w-[46px]`}>
          COLLECTIVE
        </p>
      </button>
    </div>
  );
}