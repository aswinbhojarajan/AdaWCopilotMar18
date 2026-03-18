import React from 'react';
import {
  TopBar,
  Header,
  Navigation,
  BottomBar,
  WealthSnapshot,
  CompactAssetAllocation,
  PortfolioHealthSummary,
  CompactHoldings,
  CompactGoals,
  CollapsibleAdvisor,
  CompactConnectedAccounts,
  AddAccountModal,
  SlideNotification,
} from '../ada';
import { Home, GraduationCap, AlertTriangle, TrendingDown, Wallet, Target } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import type {
  ChatContext,
  WealthOverviewResponse,
  AssetAllocation,
  Holding,
  GoalResponse,
  AccountResponse,
} from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
  GraduationCap: <GraduationCap className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
  Wallet: <Wallet className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
  Target: <Target className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
};

interface WealthScreenProps {
  onNavigate?: (path: string) => void;
  onChatSubmit?: (message: string, context?: ChatContext) => void;
  showGoalNotification?: boolean;
  onDismissNotification?: () => void;
  onChatHistoryClick?: () => void;
  onNotificationsClick?: () => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  shouldAutoScrollToGoal?: boolean;
  onScrollComplete?: () => void;
  onClose?: () => void;
}

function WealthSkeleton() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-[30px] w-full p-6 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function WealthScreen({
  onChatSubmit,
  showGoalNotification,
  onDismissNotification,
  onChatHistoryClick,
  onResumeChat,
  onOpenChat,
  hasActiveChatToday,
  shouldAutoScrollToGoal,
  onScrollComplete,
  onNotificationsClick,
  onClose,
}: WealthScreenProps) {
  const [showAddAccountModal, setShowAddAccountModal] = React.useState(false);
  const [goalsExpanded, setGoalsExpanded] = React.useState(false);
  const [shouldScrollToGoal, setShouldScrollToGoal] = React.useState(false);
  const houseDepositGoalRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { data: overview, loading: loadingOverview } = useApi<WealthOverviewResponse>('/api/wealth/overview');
  const { data: apiAllocations, loading: loadingAlloc } = useApi<AssetAllocation[]>('/api/wealth/allocation');
  const { data: apiHoldings, loading: loadingHoldings } = useApi<Holding[]>('/api/wealth/holdings');
  const { data: apiGoals, loading: loadingGoals } = useApi<GoalResponse[]>('/api/wealth/goals');
  const { data: apiAccounts, loading: loadingAccounts } = useApi<AccountResponse[]>('/api/wealth/accounts');

  const loading = loadingOverview || loadingAlloc || loadingHoldings || loadingGoals || loadingAccounts;

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
          if (houseDepositGoalRef.current && scrollContainerRef.current) {
            const goalElement = houseDepositGoalRef.current;
            const scrollContainer = scrollContainerRef.current;

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

  const connectedAccounts = (apiAccounts ?? []).map((account) => ({
    name: account.institutionName,
    logo: buildAccountLogo(account),
    balance: account.balance,
    lastUpdated: account.lastSynced,
    status: account.status,
  }));

  const [extraAccounts, setExtraAccounts] = React.useState<
    { name: string; logo: React.ReactNode; balance: number; lastUpdated: string; status: 'synced' | 'error' | 'pending' }[]
  >([]);

  const handleAccountAdded = (institution: { name: string; logo: React.ReactNode }) => {
    const newAccount = {
      name: institution.name,
      logo: institution.logo,
      balance: Math.random() * 50000 + 10000,
      lastUpdated: 'Just now',
      status: 'synced' as const,
    };
    setExtraAccounts((prev) => [...prev, newAccount]);
  };

  const goals = (apiGoals ?? []).map((goal) => ({
    title: goal.title,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
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

  const totalValue = overview?.totalValue ?? 0;
  const allocations = apiAllocations ?? [];
  const holdings = apiHoldings ?? [];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="wealth" onTabChange={() => {}} />
      </div>

      <div
        className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto"
        ref={scrollContainerRef}
      >
        {loading ? (
          <WealthSkeleton />
        ) : (
          <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
            <WealthSnapshot
              totalValue={totalValue}
              dailyChange={overview?.dailyChangeAmount ?? 0}
              dailyChangePercent={overview?.dailyChangePercent ?? 0}
              performanceData={overview?.performanceData ?? {}}
              defaultTimeFrame="1M"
              primaryInsight="Your portfolio is 33% concentrated in global equities, driving strong returns but increasing volatility exposure."
              insightDetails={[
                {
                  icon: <AlertTriangle className="size-[20px]" strokeWidth={1.5} />,
                  title: 'Portfolio Concentration Alert',
                  summary: '33% in global equities, primarily US technology',
                  fullContent: (
                    <div className="flex flex-col gap-[8px]">
                      <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[14px] tracking-[-0.28px]">
                        Over 33% of your invested wealth is currently concentrated in global equities,
                        primarily US technology.{' '}
                        <span className="font-['DM_Sans:Regular',sans-serif]">
                          This has driven strong returns, but it also increases sensitivity to market
                          corrections.
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
                        title: '33% concentration in global equities',
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
                      <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[14px] tracking-[-0.28px]">
                        If equity markets experience a 15–20% correction, your portfolio drawdown
                        could exceed your comfort range.{' '}
                        <span className="font-['DM_Sans:Regular',sans-serif]">
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
              diversificationScore={82}
              riskLevel="low-medium"
              topSuggestion="At 10%, your alternatives allocation is high"
              additionalSuggestions={['Increasing your fixed income holding could improve stability']}
              onChatSubmit={onChatSubmit}
            />

            <CompactHoldings holdings={holdings} />

            <CompactGoals
              goals={goals}
              isExpanded={goalsExpanded}
              onExpandChange={setGoalsExpanded}
              houseDepositGoalRef={houseDepositGoalRef}
            />

            <CompactConnectedAccounts
              accounts={[...connectedAccounts, ...extraAccounts]}
              onAddAccount={() => setShowAddAccountModal(true)}
            />

            <CollapsibleAdvisor
              advisorName="Sarah Mitchell"
              availability="Available today"
              onContactAdvisor={() => {
                console.log('Contact advisor clicked');
              }}
            />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar
          onSubmit={onChatSubmit}
          onChatHistoryClick={onChatHistoryClick}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={onResumeChat}
          onOpenChat={onOpenChat}
        />
      </div>

      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={handleAccountAdded}
      />

      <SlideNotification
        variant="system"
        categoryLabel="ALERT"
        categoryLabelColor="#d97706"
        headline="Your house deposit goal is off track"
        message="Recent withdrawals put you at 63% progress, down from 68%."
        show={showGoalNotification || false}
        onDismiss={() => onDismissNotification?.()}
        actionText="View details"
        onAction={() => {
          onDismissNotification?.();
          setGoalsExpanded(true);
          setShouldScrollToGoal(true);
        }}
      />
    </div>
  );
}
