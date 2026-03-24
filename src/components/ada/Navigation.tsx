import React from 'react';
import { motion } from 'motion/react';
import type { TabType } from '../../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; width: string }[] = [
  { id: 'home', label: 'HOME', width: 'w-[39px]' },
  { id: 'wealth', label: 'WEALTH', width: 'w-[45px]' },
  { id: 'discover', label: 'DISCOVER', width: 'w-[57px]' },
  { id: 'collective', label: 'COLLECTIVE', width: 'w-[46px]' },
];

export function Navigation({ activeTab = 'home', onTabChange }: NavigationProps) {
  return (
    <div className="bg-[#f7f6f2] content-stretch flex gap-[32px] h-[48px] items-center px-[24px] py-0 relative shrink-0 w-full">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} className="relative min-h-[48px] flex items-center">
            <p
              className={`font-['DM_Sans',sans-serif] ${isActive ? 'font-semibold' : 'font-normal'} h-[10px] leading-[1.3] not-italic text-[#441316] text-[0.625rem] text-center tracking-[1.2px] uppercase ${tab.width} transition-opacity duration-200 ${isActive ? '' : 'opacity-60'}`}
            >
              {tab.label}
            </p>
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -bottom-[6px] left-0 right-0 h-[2px] bg-[#441316] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
