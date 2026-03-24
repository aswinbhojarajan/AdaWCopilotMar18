import React, { useState } from 'react';
import { AdaLogo } from '../ada/AdaLogo';
import { useUser } from '../../contexts/UserContext';
import type { DemoPersona } from '../../contexts/UserContext';

interface LoginPageProps {
  onLogin: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getRiskColor(risk: string): string {
  const r = risk.toLowerCase();
  if (r === 'aggressive') return '#c0180c';
  if (r === 'conservative') return '#03561a';
  return '#d97706';
}

function getRiskBg(risk: string): string {
  const r = risk.toLowerCase();
  if (r === 'aggressive') return 'rgba(192,24,12,0.08)';
  if (r === 'conservative') return 'rgba(3,86,26,0.08)';
  return 'rgba(217,119,6,0.08)';
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { personas, switchUser, isLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devOpen, setDevOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handlePersonaSelect = (persona: DemoPersona) => {
    switchUser(persona.id);
    onLogin();
  };

  return (
    <div className="h-full w-full bg-[#efede6] overflow-y-auto">
      <div className="flex flex-col items-center px-[24px] pt-[60px] pb-[40px] min-h-full">
        <div className="flex flex-col items-center mb-[32px]">
          <p className="font-['Crimson_Pro',sans-serif] font-normal text-[22px] tracking-[-0.44px] text-[#555555] mb-[4px]">
            Welcome to
          </p>
          <AdaLogo className="w-[130px] h-[52px] mb-[12px]" />
          <p
            className="font-['DM_Sans',sans-serif] font-light text-[14px] text-[#555555] text-center"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Your modern wealth intelligence platform
          </p>
        </div>

        <div className="w-full bg-white rounded-[30px] px-[24px] py-[24px] mb-[20px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label
                className="font-['DM_Sans',sans-serif] font-semibold text-[10px] tracking-[0.8px] uppercase text-[#992929]"
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[44px] px-[16px] rounded-[50px] border-[0.75px] border-[#d8d8d8] bg-[#f7f6f2] font-['DM_Sans',sans-serif] text-[14px] text-[#555555] outline-none focus:border-[#441316] transition-colors placeholder:text-[#999]"
              />
            </div>

            <div className="flex flex-col gap-[6px]">
              <label
                className="font-['DM_Sans',sans-serif] font-semibold text-[10px] tracking-[0.8px] uppercase text-[#992929]"
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[44px] px-[16px] rounded-[50px] border-[0.75px] border-[#d8d8d8] bg-[#f7f6f2] font-['DM_Sans',sans-serif] text-[14px] text-[#555555] outline-none focus:border-[#441316] transition-colors placeholder:text-[#999]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-[44px] rounded-[50px] bg-[#441316] text-white font-['DM_Sans',sans-serif] text-[14px] tracking-[-0.28px] hover:bg-[#5a1a1e] active:bg-[#331012] transition-colors cursor-pointer mt-[8px]"
            >
              Sign In
            </button>
          </form>
        </div>

        <div className="w-full">
          <button
            onClick={() => setDevOpen(!devOpen)}
            className="w-full flex items-center justify-between px-[16px] py-[10px] mb-[8px] cursor-pointer bg-transparent"
          >
            <span className="font-['DM_Sans',sans-serif] font-semibold text-[10px] tracking-[0.8px] uppercase text-[#999]">
              Dev Quick Access
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform duration-200 ${devOpen ? 'rotate-180' : ''}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {devOpen && (
            <div className="w-full rounded-[30px] border-[1.5px] border-dashed border-[#d8d8d8] bg-white/50 px-[16px] py-[16px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-[20px]">
                  <p className="font-['DM_Sans',sans-serif] font-light text-[12px] text-[#999]">
                    Loading personas...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-[8px]">
                  {personas.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => handlePersonaSelect(persona)}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[20px] bg-white border-[0.75px] border-[#d8d8d8] hover:border-[#441316] hover:bg-[#f7f6f2] transition-all cursor-pointer text-left group"
                    >
                      <div className="w-[36px] h-[36px] rounded-full bg-[#441316] flex items-center justify-center shrink-0">
                        <span className="text-white text-[12px] font-['DM_Sans',sans-serif] font-medium">
                          {persona.firstName.charAt(0)}{persona.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                        <p className="font-['Crimson_Pro',sans-serif] text-[16px] tracking-[-0.32px] text-[#555555] group-hover:text-[#441316] transition-colors">
                          {persona.firstName} {persona.lastName}
                        </p>
                        <div className="flex items-center gap-[8px]">
                          <span
                            className="font-['DM_Sans',sans-serif] text-[10px] tracking-[0.2px] uppercase px-[6px] py-[1px] rounded-[50px]"
                            style={{
                              color: getRiskColor(persona.riskLevel),
                              backgroundColor: getRiskBg(persona.riskLevel),
                            }}
                          >
                            {persona.riskLevel}
                          </span>
                          <span className="font-['DM_Sans',sans-serif] text-[11px] text-[#888]">
                            {formatCurrency(persona.portfolioValue)}
                          </span>
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <path d="M6 4L10 8L6 12" stroke="#441316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
