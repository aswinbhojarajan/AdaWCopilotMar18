import React, { useState, useRef } from 'react';
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

function AdaLoginLogo() {
  return (
    <svg width="182" height="69" viewBox="0 0 182 69" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64.1447 56L84.2294 11.4371H86.4889L106.574 56H98.7908L94.1462 44.7651C93.2675 42.6311 92.7026 42.2545 89.7527 42.2545H75.5051L70.6723 56H64.1447ZM77.4508 37.7355C77.4508 38.9908 78.3295 39.4929 80.338 39.4929H91.8867L83.6645 20.0986L79.2082 31.7729C77.953 34.9739 77.4508 36.543 77.4508 37.7355ZM121.882 56.9415C113.66 56.9415 108.136 51.0416 108.136 42.0035C108.136 31.7101 115.543 23.99 125.397 23.99C129.853 23.99 133.556 25.4964 136.004 28.1325L135.313 12.0648H141.715V56H135.941L135.816 49.6608C132.866 54.1171 127.719 56.9415 121.882 56.9415ZM124.706 53.1756C131.234 53.1756 136.004 47.5268 136.004 39.6812C136.004 31.9612 131.485 26.94 124.832 26.94C118.304 26.94 114.538 31.5218 114.538 39.6812C114.538 47.9661 118.493 53.1756 124.706 53.1756ZM158.365 56.9415C152.591 56.9415 149.139 53.866 149.139 48.7821C149.139 44.3885 151.649 41.7524 158.742 38.8025L164.579 36.3547C167.78 35.0366 168.721 33.9069 168.721 31.5218C168.721 28.5719 166.713 27.1283 163.386 27.1283C157.989 27.1283 153.595 30.8942 151.273 36.9823V26.4379C154.913 24.9315 159.934 23.99 164.077 23.99C171.734 23.99 175.249 27.191 174.935 33.8441L174.307 48.4682C174.182 50.665 175.061 52.0458 176.567 52.0458C178.073 52.0458 179.015 51.6065 180.584 50.1629C180.584 54.0543 178.073 56.5649 174.119 56.5649C170.855 56.5649 169.098 54.8702 168.91 51.4809C166.901 54.933 163.073 56.9415 158.365 56.9415ZM160.813 52.9245C164.893 52.9245 168.721 49.9746 168.721 46.7736V37.0451L161.817 40.4344C157.11 42.7567 155.541 44.5768 155.541 47.7778C155.541 50.9161 157.549 52.9245 160.813 52.9245Z" fill="#441316"/>
      <path d="M44.0877 55.4589C43.0973 56.4493 41.6186 56.9989 39.636 57.0121C37.6461 57.0253 35.2342 56.493 32.5421 55.4162C27.1618 53.2643 20.8808 49.0222 15.0257 43.1672C9.1711 37.3125 4.9303 31.0321 2.77816 25.6523C1.70157 22.9602 1.16925 20.5481 1.18224 18.5582C1.19543 16.5755 1.74507 15.0969 2.73548 14.1065C3.72589 13.1165 5.20326 12.5679 7.18574 12.5549C9.17563 12.5417 11.589 13.0724 14.2811 14.1494C19.6609 16.3013 25.9401 20.5437 31.7947 26.3982C37.6496 32.2532 41.8931 38.533 44.045 43.9133C45.1218 46.6054 45.6527 49.0187 45.6395 51.0086C45.6263 52.9907 45.0777 54.4687 44.0877 55.4589Z" stroke="#441316" strokeWidth="2.36402"/>
      <path d="M3.34281 55.4589C4.33301 56.4493 5.81183 56.9989 7.79451 57.0121C9.7842 57.0253 12.1963 56.493 14.8884 55.4162C20.2685 53.2643 26.5497 49.0222 32.4047 43.1672C38.2594 37.3125 42.5002 31.0321 44.6521 25.6523C45.7289 22.9602 46.2612 20.5481 46.248 18.5582C46.235 16.5755 45.6852 15.0969 44.695 14.1065C43.7046 13.1165 42.2272 12.5679 40.2447 12.5549C38.2546 12.5417 35.8415 13.0724 33.1492 14.1494C27.7693 16.3013 21.4902 20.5437 15.6358 26.3982C9.7809 32.2532 5.53742 38.533 3.38548 43.9133C2.30869 46.6054 1.77782 49.0187 1.79101 51.0086C1.80421 52.9907 2.35281 54.4687 3.34281 55.4589Z" stroke="#441316" strokeWidth="2.36402"/>
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect fill="black" fillOpacity="0.1" height="20" rx="10" width="20" />
      <path d="M13 7L7 13M7 7L13 13" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C5 20 1 12 1 12C2.24 9.68 3.97 7.65 6.06 6.06M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.39 13.13 21.69 14.18 20.88 15.12M14.12 14.12C13.56 14.72 12.8 15.05 12 15.05C11.2 15.05 10.44 14.72 9.88 14.12C9.32 13.56 9 12.8 9 12C9 11.2 9.32 10.44 9.88 9.88" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 1L23 23" stroke="#555555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ExclamationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 5C10.5523 5 11 5.44772 11 6V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V6C9 5.44772 9.44772 5 10 5ZM10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13Z" fill="#78350F"/>
    </svg>
  );
}

interface FloatingInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  autoComplete?: string;
  inputMode?: 'email' | 'text';
  trailing?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

function FloatingInput({ id, label, type, value, onChange, autoComplete, inputMode, trailing, inputRef }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || fallbackRef;
  const isActive = focused || value.length > 0;

  return (
    <div
      className="w-full h-[58px] bg-white rounded-[50px] flex items-center justify-between px-[24px] cursor-text transition-colors border border-transparent focus-within:border-[#441316]"
      onClick={() => ref.current?.focus()}
    >
      <div className="flex flex-col justify-center relative flex-1 min-w-0 h-full">
        <label
          htmlFor={id}
          className={`font-['DM_Sans',sans-serif] text-black/50 pointer-events-none transition-all duration-200 leading-none absolute left-0 ${
            isActive ? 'text-[12px] top-[10px]' : 'text-[16px] top-1/2 -translate-y-1/2'
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`font-['DM_Sans',sans-serif] text-[16px] text-[#555] w-full bg-transparent border-none outline-none p-0 leading-[21px] transition-all duration-200 ${
            isActive ? 'mt-[14px] opacity-100' : 'mt-0 opacity-0'
          }`}
        />
      </div>
      {trailing && <div className="shrink-0 ml-[12px]">{trailing}</div>}
    </div>
  );
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

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
    <div className="relative h-full w-full bg-[#f7f6f2] overflow-y-auto">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 60% at 50% 15%, rgba(68,19,22,0.06) 0%, rgba(68,19,22,0.02) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 40% at 30% 25%, rgba(169,113,116,0.05) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center min-h-full px-[20px] pt-safe" style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex flex-col items-center mt-[140px] mb-[60px]">
          <AdaLoginLogo />
        </div>

        <p className="font-['DM_Sans',sans-serif] font-semibold text-[12px] tracking-[0.8px] uppercase text-[#431315] mb-[8px]">
          SIGN IN
        </p>
        <p className="font-['Crimson_Pro',sans-serif] font-light text-[22px] tracking-[-0.24px] text-[#555] text-center mb-[40px]">
          Your personalized wealth intelligence
        </p>

        {error && (
          <div className="w-full bg-[#fef3c7] rounded-[8px] px-[12px] py-[8px] mb-[16px] border border-black/10">
            <div className="flex items-center gap-[8px]">
              <div className="shrink-0 w-[20px] h-[20px]">
                <ExclamationIcon />
              </div>
              <p className="font-['DM_Sans',sans-serif] font-medium text-[14px] text-[#78350f]">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-[12px] mb-[24px]">
          <FloatingInput
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            inputMode="email"
            inputRef={emailRef}
            trailing={
              email ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEmail(''); emailRef.current?.focus(); }}
                  className="flex items-center justify-center w-[20px] h-[20px] cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label="Clear email"
                >
                  <ClearIcon />
                </button>
              ) : null
            }
          />
          <FloatingInput
            id="login-password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            trailing={
              password ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword); }}
                  className="flex items-center justify-center w-[24px] h-[24px] cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : null
            }
          />
          <button
            type="submit"
            disabled={isLoading || !!loadingPersona || !email || !password}
            className="w-full h-[58px] rounded-[50px] bg-[#431315] text-white font-['DM_Sans',sans-serif] text-[16px] hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-[8px]"
          >
            {isLoading ? (
              <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Log in'
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
                    type="button"
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
