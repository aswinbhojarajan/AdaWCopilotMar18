import React from 'react';
import { ProgressRing } from '../charts/ProgressRing';
import { Button } from '../Button';
import { motion } from 'motion/react';

interface RecoveryOption {
  id: 'A' | 'B';
  title: string;
  description: string;
}

interface GoalCardProps {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: React.ReactNode;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
  onCtaClick: () => void;
  onChatSubmit?: (message: string, context?: any) => void;
  showRecoveryOptions?: boolean;
  onSelectRecoveryOption?: (optionId: 'A' | 'B' | null) => void;
  selectedRecoveryOption?: 'A' | 'B' | null;
  goalRef?: React.RefObject<HTMLDivElement>;
}

export function GoalCard({
  title,
  targetAmount,
  currentAmount,
  deadline,
  icon,
  color,
  healthStatus,
  aiInsight,
  ctaText,
  onCtaClick,
  onChatSubmit,
  showRecoveryOptions = false,
  onSelectRecoveryOption,
  selectedRecoveryOption,
  goalRef
}: GoalCardProps) {
  const progress = (currentAmount / targetAmount) * 100;
  const remaining = targetAmount - currentAmount;

  // Health status badge config (using Ada's burgundy palette)
  const healthConfig = {
    'on-track': {
      label: 'On Track',
      bgColor: '#f7f6f2',
      textColor: '#555555',
      dotColor: '#a87174'
    },
    'needs-attention': {
      label: 'Needs Attention',
      bgColor: '#fef3c7',
      textColor: '#78350f',
      dotColor: '#f59e0b'
    },
    'at-risk': {
      label: 'At Risk',
      bgColor: '#fddcdc',
      textColor: '#992929',
      dotColor: '#f87171'
    }
  };

  const statusConfig = healthStatus ? healthConfig[healthStatus] : null;

  // Recovery options data
  const recoveryOptions: RecoveryOption[] = [
    {
      id: 'A',
      title: 'Get back on track',
      description: 'Increase contributions by $420/month to restore probability above 75%.'
    },
    {
      id: 'B',
      title: 'Protect the timeline',
      description: 'Shift a small portion toward lower-volatility income to reduce drawdown risk.'
    }
  ];

  return (
    <div className="w-full">
      <div ref={goalRef} className="content-stretch flex flex-col pb-[24px] pt-[16px] relative w-full">
        {/* Top Row: Progress Ring + Goal Details */}
        <div className="flex gap-[16px] items-start w-full">
          {/* Progress Ring */}
          <div className="shrink-0">
            <ProgressRing 
              progress={progress}
              size={72}
              strokeWidth={8}
              color={color}
              showPercentage={true}
            />
          </div>

          {/* Goal Details */}
          <div className="flex-1 flex flex-col gap-[8px] min-w-0">
            {/* Title */}
            <div className="flex items-center gap-[8px] w-full">
              <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] tracking-[-0.48px] text-[20px]">
                {title}
              </p>
            </div>

            {/* Progress Details */}
            <div className="flex flex-col gap-[4px] w-full">
              <div className="flex items-baseline gap-[6px] w-full flex-wrap">
                <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[18px]">
                  ${currentAmount.toLocaleString()}
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] opacity-60">
                  of ${targetAmount.toLocaleString()}
                </p>
              </div>
              
              <div className="flex flex-col gap-[2px] w-full">
                <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[13px]">
                  ${remaining.toLocaleString()} remaining
                </p>
                <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[11px] opacity-60">
                  Target: {deadline}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional: Show Recovery Options or AI Insight */}
        {showRecoveryOptions ? (
          <div className="flex flex-col gap-[20px] w-full mt-[20px]">
            {/* Ada Panel Header */}
            <div className="flex flex-col gap-[12px] w-full">
              {/* Health Status Badge */}
              {statusConfig && (
                <motion.div 
                  initial={healthStatus === 'needs-attention' ? { boxShadow: "0 0 0 rgba(245, 158, 11, 0)" } : false}
                  animate={healthStatus === 'needs-attention' ? { 
                    boxShadow: [
                      "0 0 0px rgba(245, 158, 11, 0)", 
                      "0 0 12px rgba(245, 158, 11, 0.4)", 
                      "0 0 0px rgba(245, 158, 11, 0)"
                    ] 
                  } : false}
                  transition={healthStatus === 'needs-attention' ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : undefined}
                  className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-full self-start"
                  style={{ backgroundColor: statusConfig.bgColor }}
                >
                  <div 
                    className="size-[6px] rounded-full shrink-0"
                    style={{ backgroundColor: statusConfig.dotColor }}
                  />
                  <span 
                    className="font-['DM_Sans:SemiBold',sans-serif] text-[9px] tracking-[0.6px] uppercase whitespace-nowrap"
                    style={{ color: statusConfig.textColor }}
                  >
                    {statusConfig.label} ({Math.round(progress)}%)
                  </span>
                </motion.div>
              )}
              
              {/* Ada Panel Title */}
              <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[20px] tracking-[-0.48px]">
                Here's what changed — and 2 ways to fix it.
              </p>
              
              {/* Inline Copy */}
              <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] leading-[20px]">
                Recent withdrawals increased your funding gap for Dec 2026.
              </p>
            </div>

            {/* Option Tiles */}
            <div className="flex flex-col gap-[12px] w-full">
              {recoveryOptions.map((option) => (
                <div 
                  key={option.id}
                  className="flex flex-col gap-[12px] p-[16px] border border-[#e5e5e5] rounded-[12px] w-full"
                >
                  <div className="flex flex-col gap-[8px] w-full">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                      OPTION {option.id}
                    </p>
                    <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[18px] tracking-[-0.48px]">
                      {option.title}
                    </p>
                    <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] leading-[20px]">
                      {option.description}
                    </p>
                  </div>
                  
                  <div className="w-full">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        onSelectRecoveryOption?.(option.id);
                      }}
                    >
                      Review option
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary CTA: Ask Ada */}
            <div className="w-full">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  onChatSubmit?.("What are other ways to get my Buy a Home goal back on track?", {
                    category: 'GOALS',
                    categoryType: 'goal-recovery',
                    title: 'Buy a Home Recovery Options',
                    sourceScreen: 'wealth'
                  });
                }}
              >
                Ask Ada
              </Button>
            </div>

            {/* Option Detail View (when option is selected) */}
            {selectedRecoveryOption && (
              <div className="flex flex-col gap-[16px] p-[20px] bg-[#f7f6f2] rounded-[12px] w-full mt-[4px]">
                <div className="flex flex-col gap-[8px] w-full">
                  <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                    OPTION {selectedRecoveryOption} — DECISION SUPPORT
                  </p>
                  <p className="font-['Crimson_Pro:Regular',sans-serif] text-[#555555] text-[20px] tracking-[-0.48px]">
                    {recoveryOptions.find(o => o.id === selectedRecoveryOption)?.title}
                  </p>
                </div>

                <div className="flex flex-col gap-[12px] w-full">
                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[12px]">
                      Impact
                    </p>
                    <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] leading-[20px]">
                      {selectedRecoveryOption === 'A' 
                        ? "This brings your goal probability from 68% to 78%, putting you back in a comfortable range. You'll hit your Dec 2026 target with moderate confidence."
                        : "This reduces your downside risk by 12% while maintaining a 71% probability of success. You trade some upside for timeline protection."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <p className="font-['DM_Sans:SemiBold',sans-serif] text-[#555555] text-[12px]">
                      What this means
                    </p>
                    <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] leading-[20px]">
                      {selectedRecoveryOption === 'A'
                        ? "You'll need to adjust your budget to accommodate the higher monthly contribution. This is the most direct path to staying on schedule."
                        : "Your portfolio becomes more conservative, which may lower returns but gives you greater certainty around the Dec 2026 deadline."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] w-full">
                  <Button
                    variant="ai-primary"
                    size="md"
                    onClick={() => {
                      onChatSubmit?.(`Help me implement Option ${selectedRecoveryOption} for my Buy a Home goal`, {
                        category: 'GOALS',
                        categoryType: 'goal-implementation',
                        title: `Implement Option ${selectedRecoveryOption}`,
                        sourceScreen: 'wealth'
                      });
                    }}
                  >
                    Help me implement this
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onSelectRecoveryOption?.(null)}
                  >
                    View other option
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AI Insight Section (original view) */
          aiInsight && (
            <div className="flex flex-col gap-[20px] w-full mt-[20px]">
              {/* Health Status Badge + Insight Text */}
              <div className="flex flex-col gap-[12px] w-full">
                {/* Health Status Badge */}
                {statusConfig && (
                  <motion.div 
                    initial={healthStatus === 'needs-attention' ? { boxShadow: "0 0 0 rgba(245, 158, 11, 0)" } : false}
                    animate={healthStatus === 'needs-attention' ? { 
                      boxShadow: [
                        "0 0 0px rgba(245, 158, 11, 0)", 
                        "0 0 12px rgba(245, 158, 11, 0.4)", 
                        "0 0 0px rgba(245, 158, 11, 0)"
                      ] 
                    } : false}
                    transition={healthStatus === 'needs-attention' ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : undefined}
                    className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-full self-start"
                    style={{ backgroundColor: statusConfig.bgColor }}
                  >
                    <div 
                      className="size-[6px] rounded-full shrink-0"
                      style={{ backgroundColor: statusConfig.dotColor }}
                    />
                    <span 
                      className="font-['DM_Sans:SemiBold',sans-serif] text-[9px] tracking-[0.6px] uppercase whitespace-nowrap"
                      style={{ color: statusConfig.textColor }}
                    >
                      {statusConfig.label}
                    </span>
                  </motion.div>
                )}
                
                <p className="font-['DM_Sans:Regular',sans-serif] text-[#555555] text-[14px] leading-[20px] w-full">
                  {aiInsight}
                </p>
              </div>

              {/* CTA Button - Left Aligned */}
              {ctaText && onCtaClick && (
                <div className="w-full">
                  <Button
                    variant="ai-primary"
                    size="md"
                    onClick={onCtaClick}
                  >
                    {ctaText}
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
