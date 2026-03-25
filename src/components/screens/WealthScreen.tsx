import React from 'react';
import {
  WealthSnapshot,
  CompactAssetAllocation,
  PortfolioHealthSummary,
  CompactHoldings,
  CompactGoals,
  CollapsibleAdvisor,
  CompactConnectedAccounts,
  AddAccountModal,
  SlideNotification,
  PullToRefresh,
  LifeGapCards,
  LifeEventModal,
  ErrorBoundary,
} from '../ada';
import { Home, GraduationCap, AlertTriangle, TrendingDown, Wallet, Target, CalendarPlus } from 'lucide-react';
import { SkeletonList } from '../ada/Skeleton';
import { ErrorBanner } from '../ada/ErrorBanner';
import { useWealthOverview } from '../../hooks/usePortfolio';
import { useHoldings } from '../../hooks/useHoldings';
import { useAllocations } from '../../hooks/useAllocations';
import { useGoals, useGoalHealthScore, useLifeGapPrompts, useDismissLifeGapPrompt, useLifeEventSuggestions, useCreateGoal } from '../../hooks/useGoals';
import { useAccounts, useAddAccount } from '../../hooks/useAccounts';
import type { ChatContext, AccountResponse, LifeEventType, LifeEventSuggestionResponse } from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
  GraduationCap: <GraduationCap className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
  Wallet: <Wallet className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
  Target: <Target className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
};

interface WealthScreenProps {
  onChatSubmit?: (message: string, context?: ChatContext) => void;
  showGoalNotification?: boolean;
  onDismissNotification?: () => void;
  shouldAutoScrollToGoal?: boolean;
  onScrollComplete?: () => void;
}

export function WealthScreen({
  onChatSubmit,
  showGoalNotification,
  onDismissNotification,
  shouldAutoScrollToGoal,
  onScrollComplete,
}: WealthScreenProps) {
  const [showAddAccountModal, setShowAddAccountModal] = React.useState(false);
  const [showLifeEventModal, setShowLifeEventModal] = React.useState(false);
  const [lifeEventSuggestions, setLifeEventSuggestions] = React.useState<LifeEventSuggestionResponse[]>([]);
  const [goalsExpanded, setGoalsExpanded] = React.useState(false);
  const [shouldScrollToGoal, setShouldScrollToGoal] = React.useState(false);
  const houseDepositGoalRef = React.useRef<HTMLDivElement>(null);
  const pullToRefreshRef = React.useRef<HTMLDivElement>(null);

  const overviewQuery = useWealthOverview();
  const allocationsQuery = useAllocations();
  const holdingsQuery = useHoldings();
  const goalsQuery = useGoals();
  const accountsQuery = useAccounts();
  const addAccountMutation = useAddAccount();
  const healthScoreQuery = useGoalHealthScore();
  const lifeGapQuery = useLifeGapPrompts();
  const dismissLifeGapMutation = useDismissLifeGapPrompt();
  const lifeEventMutation = useLifeEventSuggestions();
  const createGoalMutation = useCreateGoal();

  const loading = overviewQuery.isLoading;

  const hasError = overviewQuery.isError;

  const refetchAll = () => {
    overviewQuery.refetch();
    allocationsQuery.refetch();
    holdingsQuery.refetch();
    goalsQuery.refetch();
    accountsQuery.refetch();
  };

  React.useEffect(() => {
    if (shouldAutoScrollToGoal) {
      setGoalsExpanded(true);
      setShouldScrollToGoal(true);
    }
  }, [shouldAutoScrollToGoal]);

  React.useEffect(() => {
    if (shouldScrollToGoal && goalsExpanded) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (houseDepositGoalRef.current && pullToRefreshRef.current) {
            const goalElement = houseDepositGoalRef.current;
            const scrollContainer = pullToRefreshRef.current;

            const containerRect = scrollContainer.getBoundingClientRect();
            const goalRect = goalElement.getBoundingClientRect();

            const scrollOffset = goalRect.top - containerRect.top + scrollContainer.scrollTop - 195;

            scrollContainer.scrollTo({
              top: scrollOffset,
              behavior: 'smooth',
            });
          }
          setShouldScrollToGoal(false);
          onScrollComplete?.();
        });
      });
    }
  }, [shouldScrollToGoal, goalsExpanded, onScrollComplete]);

  const buildAccountLogo = (account: AccountResponse) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill={account.logoColor} />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize={account.logoText.length > 3 ? '9' : '10'}
        fontWeight="bold"
      >
        {account.logoText}
      </text>
    </svg>
  );

  const connectedAccounts = (accountsQuery.data ?? []).map((account) => ({
    name: account.institutionName,
    logo: buildAccountLogo(account),
    balance: account.balance,
    lastUpdated: account.lastSynced,
    status: account.status,
  }));

  const handleAccountAdded = (institution: { name: string; type: string }) => {
    addAccountMutation.mutate(
      { institutionName: institution.name, accountType: institution.type },
      { onError: () => setShowAddAccountModal(false) },
    );
  };

  const goals = (goalsQuery.data ?? []).map((goal) => ({
    title: goal.title,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    previousAmount: goal.previousAmount,
    deadline: goal.deadline,
    icon: ICON_MAP[goal.iconName] ?? null,
    color: goal.color,
    healthStatus: goal.healthStatus,
    aiInsight: goal.aiInsight,
    ctaText: goal.ctaText,
    onCtaClick: () => {
      onChatSubmit?.(goal.ctaText, {
        category: 'GOALS',
        categoryType: goal.healthStatus === 'on-track' ? 'GOAL_ON_TRACK' : 'GOAL_ATTENTION',
        title: goal.title,
        sourceScreen: 'wealth',
      });
    },
  }));

  const handleLifeEventSubmit = (eventType: LifeEventType) => {
    lifeEventMutation.mutate(eventType, {
      onSuccess: (data) => setLifeEventSuggestions(data),
    });
  };

  const handleConfirmSuggestion = (suggestion: LifeEventSuggestionResponse) => {
    createGoalMutation.mutate(
      {
        title: suggestion.title,
        targetAmount: suggestion.targetAmount,
        deadline: suggestion.deadline,
        iconName: suggestion.iconName,
        color: suggestion.color,
      },
      {
        onSuccess: () => {
          setLifeEventSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title));
        },
      },
    );
  };

  const overview = overviewQuery.data;
  const totalValue = overview?.totalValue ?? 0;
  const allocations = allocationsQuery.data ?? [];
  const holdings = holdingsQuery.data ?? [];
  const insights = overview?.insights;

  const topClass = insights?.topAllocationClass ?? 'equities';
  const topPct = insights?.topAllocationPercent ?? 0;

  return (
    <ErrorBoundary fallbackMessage="Unable to load your wealth dashboard. Please try again.">
      <PullToRefresh
        ref={pullToRefreshRef}
        onRefresh={async () => { await Promise.all([overviewQuery.refetch(), holdingsQuery.refetch(), allocationsQuery.refetch(), goalsQuery.refetch(), accountsQuery.refetch()]); }}
        className="h-full"
      >
        {loading ? (
          <div className="px-[6px] pt-[5px] pb-[107px]">
            <SkeletonList count={5} />
          </div>
        ) : hasError ? (
          <ErrorBanner onRetry={refetchAll} />
        ) : (
          <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
            <WealthSnapshot
              totalValue={totalValue}
              dailyChange={overview?.dailyChangeAmount ?? 0}
              dailyChangePercent={overview?.dailyChangePercent ?? 0}
              performanceData={overview?.performanceData ?? {}}
              defaultTimeFrame="1M"
              primaryInsight={insights?.primaryInsight ?? ''}
              insightDetails={[
                {
                  icon: <AlertTriangle className="size-[20px]" strokeWidth={1.5} />,
                  title: 'Portfolio Concentration Alert',
                  summary: `${topPct}% in ${topClass.toLowerCase()}`,
                  fullContent: (
                    <div className="flex flex-col gap-[8px]">
                      <p className="font-['DM_Sans',sans-serif] font-light leading-[1.5] text-[#555555] text-[0.875rem] tracking-[-0.28px]">
                        {topPct}% of your invested wealth is currently concentrated in {topClass.toLowerCase()}.{' '}
                        <span className="font-['DM_Sans',sans-serif]">
                          {topPct > 50
                            ? 'This level of concentration increases sensitivity to sector-specific corrections.'
                            : 'This is within a reasonable range, but monitoring allocation drift is recommended.'}
                        </span>
                      </p>
                    </div>
                  ),
                  cta: {
                    text: 'Review my risk exposure',
                    onClick: () =>
                      onChatSubmit?.('Review my risk exposure', {
                        category: 'TOTAL WEALTH',
                        categoryType: 'RISK ANALYSIS',
                        title: `${topPct}% concentration in ${topClass.toLowerCase()}`,
                        sourceScreen: 'wealth',
                      }),
                  },
                },
                {
                  icon: <TrendingDown className="size-[20px]" strokeWidth={1.5} />,
                  title: 'Emerging Risk to Watch',
                  summary: 'Potential drawdown could exceed comfort range in correction',
                  fullContent: (
                    <div className="flex flex-col gap-[8px]">
                      <p className="font-['DM_Sans',sans-serif] font-light leading-[1.5] text-[#555555] text-[0.875rem] tracking-[-0.28px]">
                        If markets experience a 15–20% correction, your portfolio drawdown
                        could exceed your comfort range.{' '}
                        <span className="font-['DM_Sans',sans-serif]">
                          Diversification into lower-volatility or hedged assets could reduce this
                          impact.
                        </span>
                      </p>
                    </div>
                  ),
                  cta: {
                    text: 'Discover diversification ideas',
                    onClick: () =>
                      onChatSubmit?.('Discover diversification ideas', {
                        category: 'TOTAL WEALTH',
                        categoryType: 'DIVERSIFICATION',
                        title: 'Portfolio concentration risk',
                        sourceScreen: 'wealth',
                      }),
                  },
                },
              ]}
            />

            <CompactAssetAllocation allocations={allocations} totalValue={totalValue} />

            <PortfolioHealthSummary
              diversificationScore={insights?.diversificationScore ?? 70}
              riskLevel={insights?.riskLevel ?? 'medium'}
              topSuggestion={insights?.topSuggestion ?? 'Your allocation looks balanced'}
              additionalSuggestions={insights?.additionalSuggestions ?? []}
              onChatSubmit={onChatSubmit}
            />

            <CompactHoldings holdings={holdings} />

            {(lifeGapQuery.data ?? []).length > 0 && (
              <LifeGapCards
                prompts={lifeGapQuery.data ?? []}
                onDismiss={(key) => dismissLifeGapMutation.mutate(key)}
                onAction={() => {
                  setShowLifeEventModal(true);
                }}
              />
            )}

            <button
              onClick={() => setShowLifeEventModal(true)}
              className="bg-white rounded-[20px] px-[20px] py-[14px] w-full flex items-center gap-[12px] text-left hover:bg-[#fafaf8] transition-colors"
            >
              <div className="shrink-0 size-[32px] rounded-full bg-[#f7f6f2] flex items-center justify-center">
                <CalendarPlus className="size-[16px] text-[#992929]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-[1px]">
                <p className="font-['DM_Sans',sans-serif] font-semibold text-[#555555] text-[0.875rem]">
                  Log a life event
                </p>
                <p className="font-['DM_Sans',sans-serif] text-[#555555] text-[0.75rem] opacity-60">
                  Get AI-powered goal suggestions
                </p>
              </div>
            </button>

            <CompactGoals
              goals={goals}
              isExpanded={goalsExpanded}
              onExpandChange={setGoalsExpanded}
              houseDepositGoalRef={houseDepositGoalRef}
              healthScore={healthScoreQuery.data}
            />

            <CompactConnectedAccounts
              accounts={connectedAccounts}
              onAddAccount={() => setShowAddAccountModal(true)}
            />

            <CollapsibleAdvisor
              advisorName={insights?.advisorName ?? 'Your Advisor'}
              availability={insights?.advisorAvailability ?? 'Available'}
              onContactAdvisor={() => {}}
            />
          </div>
        )}
      </PullToRefresh>

      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={handleAccountAdded}
      />

      <LifeEventModal
        isOpen={showLifeEventModal}
        onClose={() => {
          setShowLifeEventModal(false);
          setLifeEventSuggestions([]);
        }}
        onSubmit={handleLifeEventSubmit}
        suggestions={lifeEventSuggestions}
        isLoading={lifeEventMutation.isPending}
        onConfirmSuggestion={handleConfirmSuggestion}
      />

      <SlideNotification
        variant="system"
        categoryLabel="ALERT"
        categoryLabelColor="#d97706"
        message="Your house deposit goal is off track. Recent withdrawals put you at 63% progress, down from 68%."
        show={showGoalNotification || false}
        onDismiss={() => onDismissNotification?.()}
        actionText="View details"
        onAction={() => {
          onDismissNotification?.();
          setGoalsExpanded(true);
          setShouldScrollToGoal(true);
        }}
      />
    </ErrorBoundary>
  );
}
