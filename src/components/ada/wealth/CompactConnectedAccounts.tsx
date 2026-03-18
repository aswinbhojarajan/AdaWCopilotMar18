import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { ConnectedAccountRow } from './ConnectedAccountRow';
import { Button } from '../Button';

interface Account {
  name: string;
  logo: React.ReactNode;
  balance: number;
  lastUpdated: string;
  status: 'synced' | 'syncing' | 'error' | 'pending';
}

interface CompactConnectedAccountsProps {
  accounts: Account[];
  onAddAccount: () => void;
}

export function CompactConnectedAccounts({
  accounts,
  onAddAccount,
}: CompactConnectedAccountsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="bg-white relative rounded-[30px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start relative w-full">
          {/* Header Row */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="content-stretch flex gap-[12px] items-center w-full px-[24px] py-[16px] text-left"
          >
            <div className="shrink-0 size-[24px] flex items-center justify-center text-[#992929]">
              <Wallet className="size-[20px]" strokeWidth={1.5} />
            </div>

            <div className="flex-1 flex flex-col gap-[2px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] leading-[normal] not-italic text-[#555555] text-[14px]">
                Connected Accounts
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] leading-[1.3] not-italic text-[#555555] text-[12px] opacity-60">
                {accounts.length} account{accounts.length !== 1 ? 's' : ''} · $
                {totalBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="shrink-0 size-[20px] flex items-center justify-center text-[#555555]">
              {isExpanded ? (
                <ChevronUp className="size-[16px]" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-[16px]" strokeWidth={2} />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Divider Line - Inset to match card padding */}
              <div className="px-[24px] w-full">
                <div className="h-[1px] bg-[#555555] opacity-20" />
              </div>

              <div className="content-stretch flex flex-col items-start px-[24px] pb-[16px] w-full">
                <div className="mt-[12px] w-full flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                    CONNECTED ACCOUNTS
                  </p>
                  <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[20px] tracking-[-0.4px] mb-[4px]">
                    Your integrated financial accounts
                  </p>
                  <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[13px] opacity-60 mb-[8px]">
                    Securely synced from external institutions and automatically updated in one
                    place.
                  </p>

                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full mt-[4px]">
                    {accounts.map((account, index) => (
                      <ConnectedAccountRow
                        key={index}
                        {...account}
                        showBorder={index !== accounts.length - 1}
                      />
                    ))}

                    <div className="mt-[12px] w-full">
                      <Button variant="primary" size="md" onClick={onAddAccount} className="w-full">
                        Add Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
