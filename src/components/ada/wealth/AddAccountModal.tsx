import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import {
  Search,
  ChevronRight,
  Building2,
  Landmark,
  Wallet,
  TrendingUp,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface FinancialInstitution {
  id: string;
  name: string;
  type: 'bank' | 'broker' | 'crypto' | 'investment';
  logo: React.ReactNode;
  popular?: boolean;
}

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: (institution: FinancialInstitution) => void;
}

const institutions: FinancialInstitution[] = [
  {
    id: 'emirates-nbd',
    name: 'Emirates NBD',
    type: 'bank',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#D32027" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
          ENBD
        </text>
      </svg>
    ),
    popular: true,
  },
  {
    id: 'adcb',
    name: 'ADCB',
    type: 'bank',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0066B2" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          ADCB
        </text>
      </svg>
    ),
    popular: true,
  },
  {
    id: 'mashreq',
    name: 'Mashreq Bank',
    type: 'bank',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#E20714" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
          M
        </text>
      </svg>
    ),
  },
  {
    id: 'fab',
    name: 'FAB',
    type: 'bank',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#00558C" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          FAB
        </text>
      </svg>
    ),
  },
  {
    id: 'interactive-brokers',
    name: 'Interactive Brokers',
    type: 'broker',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#DA1F26" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
          IB
        </text>
      </svg>
    ),
    popular: true,
  },
  {
    id: 'saxo-bank',
    name: 'Saxo Bank',
    type: 'broker',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#003366" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          SAXO
        </text>
      </svg>
    ),
  },
  {
    id: 'binance',
    name: 'Binance',
    type: 'crypto',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#F0B90B" />
        <path d="M12 8L14.5 10.5L12 13L9.5 10.5L12 8Z" fill="white" />
        <path d="M8 12L10.5 14.5L8 17L5.5 14.5L8 12Z" fill="white" />
        <path d="M16 12L18.5 14.5L16 17L13.5 14.5L16 12Z" fill="white" />
      </svg>
    ),
    popular: true,
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    type: 'crypto',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0052FF" />
        <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'kraken',
    name: 'Kraken',
    type: 'crypto',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#5741D9" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
          K
        </text>
      </svg>
    ),
  },
  {
    id: 'sarwa',
    name: 'Sarwa',
    type: 'investment',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#7B61FF" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
          S
        </text>
      </svg>
    ),
  },
  {
    id: 'stashaway',
    name: 'StashAway',
    type: 'investment',
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#00D09C" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
          SA
        </text>
      </svg>
    ),
  },
];

type ConnectionStep = 'select' | 'credentials' | 'connecting' | 'success';

export function AddAccountModal({ isOpen, onClose, onAccountAdded }: AddAccountModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<FinancialInstitution | null>(null);
  const [step, setStep] = useState<ConnectionStep>('select');
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleClose = () => {
    setSearchQuery('');
    setSelectedInstitution(null);
    setStep('select');
    setCredentials({ username: '', password: '' });
    onClose();
  };

  const handleSelectInstitution = (institution: FinancialInstitution) => {
    setSelectedInstitution(institution);
    setStep('credentials');
  };

  const handleConnect = async () => {
    if (!selectedInstitution) return;

    setStep('connecting');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStep('success');

    // Close modal and notify parent after showing success
    setTimeout(() => {
      onAccountAdded(selectedInstitution);
      handleClose();
    }, 1500);
  };

  const handleBack = () => {
    setStep('select');
    setSelectedInstitution(null);
    setCredentials({ username: '', password: '' });
  };

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const popularInstitutions = filteredInstitutions.filter((inst) => inst.popular);
  const otherInstitutions = filteredInstitutions.filter((inst) => !inst.popular);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark className="size-[14px] text-[#555555]" strokeWidth={1.5} />;
      case 'broker':
        return <TrendingUp className="size-[14px] text-[#555555]" strokeWidth={1.5} />;
      case 'crypto':
        return <Wallet className="size-[14px] text-[#555555]" strokeWidth={1.5} />;
      case 'investment':
        return <Building2 className="size-[14px] text-[#555555]" strokeWidth={1.5} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'select' ? 'Add Account' : selectedInstitution?.name || ''}
      subtitle={step === 'select' ? 'Connect your financial accounts' : undefined}
    >
      {step === 'select' && (
        <div className="px-[24px] py-[16px]">
          {/* Search */}
          <div className="relative mb-[20px]">
            <Search
              className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[16px] text-[#555555] opacity-40"
              strokeWidth={1.5}
            />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[44px] pl-[40px] pr-[16px] rounded-[50px] bg-[#f7f6f2] border border-[#d8d8d8] font-['DM_Sans:Regular',sans-serif] text-[#555555] focus:outline-none focus:border-[#555555]"
            />
          </div>

          {/* Popular Institutions */}
          {popularInstitutions.length > 0 && (
            <div className="mb-[20px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[10px] tracking-[0.8px] uppercase mb-[12px] opacity-60">
                Popular
              </p>
              <div className="flex flex-col gap-[2px]">
                {popularInstitutions.map((institution) => (
                  <button
                    key={institution.id}
                    onClick={() => handleSelectInstitution(institution)}
                    className="flex items-center justify-between p-[12px] rounded-[12px] hover:bg-[#f7f6f2] transition-colors w-full"
                  >
                    <div className="flex items-center gap-[12px]">
                      <div className="bg-[#f7f6f2] rounded-[8px] size-[40px] flex items-center justify-center shrink-0">
                        {institution.logo}
                      </div>
                      <div className="flex flex-col items-start gap-[2px]">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555]">
                          {institution.name}
                        </p>
                        <div className="flex items-center gap-[4px]">
                          {getTypeIcon(institution.type)}
                          <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[10px] opacity-60 capitalize">
                            {institution.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className="size-[18px] text-[#555555] opacity-40"
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other Institutions */}
          {otherInstitutions.length > 0 && (
            <div>
              <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[10px] tracking-[0.8px] uppercase mb-[12px] opacity-60">
                All Institutions
              </p>
              <div className="flex flex-col gap-[2px]">
                {otherInstitutions.map((institution) => (
                  <button
                    key={institution.id}
                    onClick={() => handleSelectInstitution(institution)}
                    className="flex items-center justify-between p-[12px] rounded-[12px] hover:bg-[#f7f6f2] transition-colors w-full"
                  >
                    <div className="flex items-center gap-[12px]">
                      <div className="bg-[#f7f6f2] rounded-[8px] size-[40px] flex items-center justify-center shrink-0">
                        {institution.logo}
                      </div>
                      <div className="flex flex-col items-start gap-[2px]">
                        <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555]">
                          {institution.name}
                        </p>
                        <div className="flex items-center gap-[4px]">
                          {getTypeIcon(institution.type)}
                          <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[10px] opacity-60 capitalize">
                            {institution.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className="size-[18px] text-[#555555] opacity-40"
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredInstitutions.length === 0 && (
            <div className="text-center py-[40px]">
              <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] opacity-60">
                No institutions found
              </p>
            </div>
          )}
        </div>
      )}

      {step === 'credentials' && selectedInstitution && (
        <div className="px-[24px] py-[16px]">
          <button
            onClick={handleBack}
            className="flex items-center gap-[6px] mb-[20px] text-[#555555] hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="size-[16px]" strokeWidth={1.5} />
            <p className="font-['DM_Sans:Regular',sans-serif] text-[14px]">Back</p>
          </button>

          <div className="flex items-center gap-[12px] mb-[24px] p-[16px] bg-[#f7f6f2] rounded-[12px]">
            <div className="bg-white rounded-[8px] size-[48px] flex items-center justify-center shrink-0">
              {selectedInstitution.logo}
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555]">
                {selectedInstitution.name}
              </p>
              <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[12px] opacity-60">
                Enter your login credentials
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-[16px] mb-[24px]">
            <div>
              <label className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[12px] mb-[8px] block">
                Username / Account ID
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full h-[44px] px-[16px] rounded-[12px] bg-[#f7f6f2] border border-[#d8d8d8] font-['DM_Sans:Regular',sans-serif] text-[#555555] focus:outline-none focus:border-[#555555]"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[12px] mb-[8px] block">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full h-[44px] px-[16px] rounded-[12px] bg-[#f7f6f2] border border-[#d8d8d8] font-['DM_Sans:Regular',sans-serif] text-[#555555] focus:outline-none focus:border-[#555555]"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="bg-[#fff5e6] border border-[#f59e0b] rounded-[12px] p-[12px] mb-[24px]">
            <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[12px]">
              🔒 Your credentials are encrypted and securely stored. Ada uses bank-level security to
              protect your data.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleConnect}
            className={`w-full ${!credentials.username || !credentials.password ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Connect Account
          </Button>
        </div>
      )}

      {step === 'connecting' && (
        <div className="px-[24px] py-[60px] flex flex-col items-center justify-center">
          <Loader2
            className="size-[48px] text-[#a0e622] animate-spin mb-[16px]"
            strokeWidth={1.5}
          />
          <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[20px] mb-[8px]">
            Connecting...
          </p>
          <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] opacity-60 text-center">
            Securely connecting to {selectedInstitution?.name}
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="px-[24px] py-[60px] flex flex-col items-center justify-center">
          <div className="size-[64px] bg-[#a0e622] rounded-full flex items-center justify-center mb-[16px]">
            <CheckCircle2 className="size-[36px] text-[#2d3a0a]" strokeWidth={2} />
          </div>
          <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[20px] mb-[8px]">
            Connected!
          </p>
          <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] opacity-60 text-center">
            {selectedInstitution?.name} has been successfully connected
          </p>
        </div>
      )}
    </Modal>
  );
}
