import React, { useState } from 'react';
import { AdaLogo } from '../ada/AdaLogo';
import { useLogin } from '../../hooks/useAuth';

interface LoginPageProps {
  onLogin: () => void;
}

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

interface DemoPersona {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  riskLevel: string;
  tier: string;
  description: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    email: 'aisha@demo.ada',
    password: 'Ada2026!',
    firstName: 'Aisha',
    lastName: 'Al-Rashid',
    riskLevel: 'moderate',
    tier: 'Platinum',
    description: 'HNW client, full features',
  },
  {
    email: 'khalid@demo.ada',
    password: 'Ada2026!',
    firstName: 'Khalid',
    lastName: 'Al-Mansoori',
    riskLevel: 'conservative',
    tier: 'Gold',
    description: 'Conservative investor',
  },
  {
    email: 'raj@demo.ada',
    password: 'Ada2026!',
    firstName: 'Raj',
    lastName: 'Patel',
    riskLevel: 'aggressive',
    tier: 'Standard',
    description: 'Growth-focused portfolio',
  },
];

function getRiskColor(risk: string): string {
  if (risk === 'aggressive') return '#c0180c';
  if (risk === 'conservative') return '#03561a';
  return '#d97706';
}

function getRiskBg(risk: string): string {
  if (risk === 'aggressive') return 'rgba(192,24,12,0.08)';
  if (risk === 'conservative') return 'rgba(3,86,26,0.08)';
  return 'rgba(217,119,6,0.08)';
}

const AVATAR_COLORS = ['bg-[#441316]', 'bg-[#6d3f42]', 'bg-[#a87174]'];

export function LoginPage({ onLogin }: LoginPageProps) {
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email, password });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaLogin = async (persona: DemoPersona) => {
    setError(null);
    setLoadingPersona(persona.email);
    try {
      await loginMutation.mutateAsync({ email: persona.email, password: persona.password });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoadingPersona(null);
    }
  };

  return (
    <div className="h-full w-full bg-[#efede6] overflow-y-auto">
      <div className="flex flex-col items-center min-h-full px-[32px] pt-safe" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col items-center mb-[32px] mt-[48px]">
          <p className="font-['Crimson_Pro',sans-serif] font-normal text-[1.375rem] tracking-[-0.44px] text-[#555555] mb-[4px]">
            Welcome to
          </p>
          <AdaLogo className="w-[130px] h-[52px] mb-[12px]" />
          <p
            className="font-['DM_Sans',sans-serif] font-light text-[0.875rem] text-[#555555] text-center"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Your modern wealth intelligence platform
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-[16px] px-[16px] py-[12px] mb-[16px]">
            <p className="font-['DM_Sans',sans-serif] text-[0.8125rem] text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-[12px] mb-[24px]">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full h-[48px] px-[20px] rounded-[50px] border-[0.75px] border-[#d8d8d8] bg-white font-['DM_Sans',sans-serif] text-[0.9375rem] text-[#555555] outline-none focus:border-[#441316] transition-colors placeholder:text-[#999]"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-[48px] px-[20px] rounded-[50px] border-[0.75px] border-[#d8d8d8] bg-white font-['DM_Sans',sans-serif] text-[0.9375rem] text-[#555555] outline-none focus:border-[#441316] transition-colors placeholder:text-[#999]"
          />
          <button
            type="submit"
            disabled={isLoading || !!loadingPersona || !email || !password}
            className="w-full h-[48px] rounded-[50px] bg-[#441316] text-white font-['DM_Sans',sans-serif] text-[0.875rem] font-medium tracking-[-0.28px] hover:bg-[#5a1a1e] active:bg-[#330e11] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]"
          >
            {isLoading ? (
              <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {DEMO_MODE && (
          <>
            <div className="w-full flex items-center gap-[12px] mb-[14px]">
              <div className="flex-1 h-[1px] bg-[#d8d8d8]" />
              <span className="font-['DM_Sans',sans-serif] text-[0.625rem] tracking-[0.8px] uppercase text-[#999]">
                Demo shortcuts
              </span>
              <div className="flex-1 h-[1px] bg-[#d8d8d8]" />
            </div>
            <div className="w-full flex flex-col gap-[8px]">
              {DEMO_PERSONAS.map((persona, idx) => {
                const personaLoading = loadingPersona === persona.email;
                return (
                  <button
                    key={persona.email}
                    onClick={() => handlePersonaLogin(persona)}
                    disabled={!!loadingPersona || isLoading}
                    className="w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[20px] bg-white border-[0.75px] border-[#d8d8d8] hover:border-[#441316] hover:bg-[#f7f6f2] transition-all cursor-pointer text-left group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className={`w-[36px] h-[36px] rounded-full ${AVATAR_COLORS[idx]} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-[0.75rem] font-['DM_Sans',sans-serif] font-medium">
                        {persona.firstName.charAt(0)}{persona.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                      <p className="font-['Crimson_Pro',sans-serif] text-[0.9375rem] tracking-[-0.32px] text-[#555555] group-hover:text-[#441316] transition-colors">
                        {persona.firstName} {persona.lastName}
                      </p>
                      <div className="flex items-center gap-[6px]">
                        <span
                          className="font-['DM_Sans',sans-serif] text-[0.5625rem] tracking-[0.2px] uppercase px-[5px] py-[1px] rounded-[50px]"
                          style={{
                            color: getRiskColor(persona.riskLevel),
                            backgroundColor: getRiskBg(persona.riskLevel),
                          }}
                        >
                          {persona.riskLevel}
                        </span>
                        <span className="font-['DM_Sans',sans-serif] text-[0.625rem] text-[#888]">
                          {persona.tier}
                        </span>
                      </div>
                    </div>
                    {personaLoading ? (
                      <div className="w-[14px] h-[14px] border-2 border-[#441316] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <path d="M6 4L10 8L6 12" stroke="#441316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <p className="font-['DM_Sans',sans-serif] text-[0.6875rem] text-[#aaa] text-center mt-[24px]">
          {DEMO_MODE ? 'Preview build \u00b7 All data is mocked' : '\u00a9 Ada Wealth Intelligence'}
        </p>
      </div>
    </div>
  );
}
