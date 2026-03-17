import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface ConnectedAccountRowProps {
  name: string;
  logo: React.ReactNode;
  balance: number;
  lastUpdated: string;
  status?: 'synced' | 'syncing' | 'error';
  onRefresh?: () => void;
  showBorder?: boolean;
}

export function ConnectedAccountRow({
  name,
  logo,
  balance,
  lastUpdated,
  status = 'synced',
  onRefresh,
  showBorder = true,
}: ConnectedAccountRowProps) {
  return (
    <div
      className={`content-stretch flex items-center justify-between py-[12px] relative w-full ${showBorder ? 'border-b border-[#efede6]' : ''}`}
    >
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-[12px]">
        <div className="bg-[#f7f6f2] rounded-[8px] size-[40px] flex items-center justify-center shrink-0">
          {logo}
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="font-['DM_Sans:Regular',sans-serif] text-[14px] text-[#555555] tracking-[-0.28px]">
            {name}
          </p>
          <div className="flex items-center gap-[4px]">
            {status === 'syncing' ? (
              <RefreshCw className="size-[10px] text-[#555555] animate-spin" strokeWidth={2} />
            ) : (
              <Clock className="size-[10px] text-[#555555]" strokeWidth={1.5} />
            )}
            <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[10px] opacity-60">
              {status === 'syncing' ? 'Syncing...' : lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Balance */}
      <div className="flex items-center gap-[8px]">
        <p className="font-['DM_Sans:Regular',sans-serif] text-[16px] text-[#555555] tracking-[-0.28px]">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {status === 'synced' && onRefresh && (
          <button onClick={onRefresh} className="opacity-0 hover:opacity-100 transition-opacity">
            <RefreshCw className="size-[14px] text-[#555555]" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
