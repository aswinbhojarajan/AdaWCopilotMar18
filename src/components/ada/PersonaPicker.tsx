import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useUser } from '../../contexts/UserContext';

const RISK_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  conservative: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Conservative' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
  aggressive: { bg: 'bg-red-100', text: 'text-red-700', label: 'Aggressive' },
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-[#441316]',
  'bg-[#6d3f42]',
  'bg-[#a87174]',
  'bg-[#2E3A59]',
  'bg-[#1a5276]',
  'bg-[#7b5ea7]',
  'bg-[#2e7d32]',
  'bg-[#c0392b]',
];

interface PersonaPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonaPicker({ isOpen, onClose }: PersonaPickerProps) {
  const { personas, userId, switchUser, isLoading } = useUser();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#f7f6f2] rounded-t-[20px] max-h-[75%] overflow-hidden"
          >
            <div className="px-[20px] pt-[16px] pb-[8px] flex items-center justify-between border-b border-[#e3e3e3]">
              <h2 className="font-['Crimson_Pro',serif] font-semibold text-[20px] text-[#2E3A59] tracking-[-0.4px]">
                Switch Persona
              </h2>
              <button
                onClick={onClose}
                className="w-[32px] h-[32px] rounded-full bg-[#efede6] flex items-center justify-center"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-[16px] py-[12px] pb-[32px]" style={{ maxHeight: 'calc(75vh - 60px)' }}>
              {isLoading ? (
                <div className="flex items-center justify-center py-[40px]">
                  <div className="flex gap-[4px]">
                    <div className="w-[6px] h-[6px] bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-[6px] h-[6px] bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-[6px] h-[6px] bg-[#555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-[8px]">
                  {personas.map((persona, idx) => {
                    const isActive = persona.id === userId;
                    const risk = RISK_COLORS[persona.riskLevel] ?? RISK_COLORS.moderate;
                    const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                    return (
                      <button
                        key={persona.id}
                        onClick={() => switchUser(persona.id)}
                        className={`w-full flex items-center gap-[12px] p-[12px] rounded-[14px] transition-all text-left ${
                          isActive
                            ? 'bg-[#441316]/10 ring-1 ring-[#441316]/30'
                            : 'bg-white hover:bg-[#efede6]'
                        }`}
                      >
                        <div className={`w-[42px] h-[42px] rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                          <span className="text-white font-['DM_Sans',sans-serif] font-medium text-[14px]">
                            {getInitials(persona.firstName, persona.lastName)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[8px]">
                            <span className="font-['DM_Sans',sans-serif] font-medium text-[15px] text-[#2E3A59] truncate">
                              {persona.firstName} {persona.lastName}
                            </span>
                            {isActive && (
                              <span className="text-[11px] font-['DM_Sans',sans-serif] font-medium text-[#441316] bg-[#441316]/10 px-[6px] py-[1px] rounded-full shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-[8px] mt-[2px]">
                            <span className={`text-[11px] font-['DM_Sans',sans-serif] font-medium px-[6px] py-[1px] rounded-full ${risk.bg} ${risk.text}`}>
                              {risk.label}
                            </span>
                            <span className="font-['DM_Sans',sans-serif] text-[12px] text-[#888]">
                              {formatCurrency(persona.portfolioValue)}
                            </span>
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-30">
                          <path d="M6 4L10 8L6 12" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
