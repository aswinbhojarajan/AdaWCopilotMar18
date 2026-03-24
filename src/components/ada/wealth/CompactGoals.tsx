import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';
import { GoalCard } from './GoalCard';
import { GoalHealthGauge } from './GoalHealthGauge';

interface Goal {
  title: string;
  targetAmount: number;
  currentAmount: number;
  previousAmount?: number;
  deadline: string;
  icon: React.ReactNode;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
  onCtaClick: () => void;
}

interface CompactGoalsProps {
  goals: Goal[];
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  houseDepositGoalRef?: React.RefObject<HTMLDivElement>;
  healthScore?: { score: number; label: string };
}

export function CompactGoals({
  goals,
  isExpanded: controlledIsExpanded,
  onExpandChange,
  houseDepositGoalRef,
  healthScore,
}: CompactGoalsProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded;
  const setIsExpanded = (value: boolean) => {
    if (controlledIsExpanded !== undefined) {
      onExpandChange?.(value);
    } else {
      setInternalIsExpanded(value);
    }
  };

  const needsAttentionCount = goals.filter((g) => g.healthStatus !== 'on-track').length;

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
              <Target className="size-[20px]" strokeWidth={1.5} />
            </div>

            <div className="flex-1 flex flex-col gap-[2px]">
              <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] not-italic text-[#555555] text-[14px]">
                Your Goals
              </p>
              <div className="flex items-center gap-[8px]">
                <p className="font-['DM_Sans',sans-serif] leading-[1.3] not-italic text-[#555555] text-[12px] opacity-60">
                  {goals.length} active
                </p>
                {needsAttentionCount > 0 && (
                  <>
                    <div className="size-[3px] rounded-full bg-[#555555] opacity-30" />
                    <p className="font-['DM_Sans',sans-serif] leading-[1.3] not-italic text-[#992929] text-[12px]">
                      {needsAttentionCount} need{needsAttentionCount === 1 ? 's' : ''} attention
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 size-[20px] flex items-center justify-center text-[#555555]">
              {isExpanded ? (
                <ChevronUp className="size-[16px]" strokeWidth={2} />
              ) : (
                <ChevronDown className="size-[16px]" strokeWidth={2} />
              )}
            </div>
          </button>

          {healthScore && (
            <div className="px-[24px] pb-[12px] w-full">
              <GoalHealthGauge score={healthScore.score} label={healthScore.label} />
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Divider Line - Inset to match card padding */}
              <div className="px-[24px] w-full">
                <div className="h-[1px] bg-[#555555] opacity-20" />
              </div>

              <div className="content-stretch flex flex-col items-start px-[24px] pb-[16px] w-full">
                <div className="mt-[12px] w-full flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans',sans-serif] font-semibold text-[#992929] text-[10px] tracking-[0.8px] uppercase">
                    YOUR GOALS
                  </p>
                  <p className="font-['Crimson_Pro',sans-serif] text-[#555555] text-[20px] tracking-[-0.4px] mb-[4px]">
                    Track your financial milestones
                  </p>
                  {needsAttentionCount > 0 && (
                    <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[13px] opacity-60 mb-[8px]">
                      {needsAttentionCount === goals.length
                        ? `All ${goals.length} goals`
                        : `${needsAttentionCount} goal${needsAttentionCount === 1 ? '' : 's'}`}{' '}
                      need attention. Small adjustments today can get you back on track.
                    </p>
                  )}

                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full mt-[8px]">
                    {goals.map((goal, index) => (
                      <React.Fragment key={index}>
                        <GoalCard
                          {...goal}
                          goalRef={index === 0 ? houseDepositGoalRef : undefined}
                        />
                        {index < goals.length - 1 && (
                          <div className="w-full h-[1px] bg-[#e5e5e5] my-[12px]" />
                        )}
                      </React.Fragment>
                    ))}
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
