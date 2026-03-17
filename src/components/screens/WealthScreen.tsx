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
  SlideNotification
} from '../ada';
import { Home, GraduationCap, AlertTriangle, TrendingDown } from 'lucide-react';

// Mock data for Wealth Screen
const sparklineData = [
  { value: 91000 },
  { value: 92500 },
  { value: 91800 },
  { value: 93200 },
  { value: 94100 },
  { value: 94830.19 }
];

// Generate dynamic dates for chart labels
const generatePerformanceData = () => {
  const now = new Date();
  
  // Helper to format date as MM/DD
  const formatMonthDay = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };
  
  // Helper to get month abbreviation
  const getMonthAbbr = (date: Date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()];
  };
  
  // Helper to get day of week abbreviation
  const getDayAbbr = (date: Date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };
  
  return {
    '1D': [
      { value: 94000, label: '9am' },
      { value: 94100, label: '10am' },
      { value: 94200, label: '11am' },
      { value: 94300, label: '12pm' },
      { value: 94400, label: '1pm' },
      { value: 94500, label: '2pm' },
      { value: 94600, label: '3pm' },
      { value: 94700, label: '4pm' },
      { value: 94800, label: '5pm' },
      { value: 94830, label: '6pm' }
    ],
    '1W': Array.from({ length: 5 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (4 - i));
      return {
        value: 93500 + (i * 332.5),
        label: getDayAbbr(date)
      };
    }),
    '1M': Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - ((5 - i) * 7)); // Weekly intervals
      return {
        value: 91000 + (i * 783),
        label: formatMonthDay(date)
      };
    }),
    '3M': Array.from({ length: 4 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (3 - i));
      return {
        value: 85000 + (i * 3276.67),
        label: getMonthAbbr(date)
      };
    }),
    '1Y': Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (11 - i));
      return {
        value: 78000 + (i * 1402.5),
        label: getMonthAbbr(date)
      };
    })
  };
};

const performanceData = generatePerformanceData();

const allocations = [
  { label: 'Stocks', value: 52156.60, amount: 52156.60, percentage: 55, color: '#d9b3b5' },
  { label: 'Cash', value: 18966.04, amount: 18966.04, percentage: 20, color: '#a87174' },
  { label: 'Bonds', value: 14224.53, amount: 14224.53, percentage: 15, color: '#6d3f42' },
  { label: 'Crypto', value: 5689.81, amount: 5689.81, percentage: 6, color: '#8b5a5d' },
  { label: 'Commodities', value: 3793.21, amount: 3793.21, percentage: 4, color: '#441316' }
];

const holdings = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    quantity: 15,
    value: 3755.28,
    changePercent: 6.10,
    changeAmount: 216.05
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 12,
    value: 2503.52,
    changePercent: 5.40,
    changeAmount: 128.18
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    quantity: 0.0195,
    value: 1706.94,
    changePercent: 4.20,
    changeAmount: 68.89
  }
];

interface WealthScreenProps {
  onNavigate?: (path: string) => void;
  onChatSubmit?: (message: string, context?: any) => void;
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

export function WealthScreen({ 
  onNavigate, 
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
  onClose
}: WealthScreenProps) {
  const [showAddAccountModal, setShowAddAccountModal] = React.useState(false);
  const [goalsExpanded, setGoalsExpanded] = React.useState(false);
  const [shouldScrollToGoal, setShouldScrollToGoal] = React.useState(false);
  const houseDepositGoalRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Sync prop with internal states
  React.useEffect(() => {
    if (shouldAutoScrollToGoal) {
      setGoalsExpanded(true);
      setShouldScrollToGoal(true);
    }
  }, [shouldAutoScrollToGoal]);
  
  // Effect to handle scrolling after goals are expanded
  React.useEffect(() => {
    if (shouldScrollToGoal && goalsExpanded) {
      // Use requestAnimationFrame twice to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (houseDepositGoalRef.current && scrollContainerRef.current) {
            const goalElement = houseDepositGoalRef.current;
            const scrollContainer = scrollContainerRef.current;
            
            const containerRect = scrollContainer.getBoundingClientRect();
            const goalRect = goalElement.getBoundingClientRect();
            
            // Calculate position: goal top relative to container top + current container scroll
            // Using 195px buffer to show the entire "Your Goals" section header and title
            const scrollOffset = goalRect.top - containerRect.top + scrollContainer.scrollTop - 195;
            
            scrollContainer.scrollTo({
              top: scrollOffset,
              behavior: 'smooth'
            });
          }
          setShouldScrollToGoal(false);
          onScrollComplete?.();
        });
      });
    }
  }, [shouldScrollToGoal, goalsExpanded, onScrollComplete]);
  
  const [connectedAccounts, setConnectedAccounts] = React.useState([
    {
      name: 'HSBC',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#DB0011"/>
          <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">HSBC</text>
        </svg>
      ),
      balance: 18966.04,
      lastUpdated: '2 min ago',
      status: 'synced' as const
    },
    {
      name: 'Interactive Brokers',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#DA1F26"/>
          <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">IB</text>
        </svg>
      ),
      balance: 66381.13,
      lastUpdated: '5 min ago',
      status: 'synced' as const
    },
    {
      name: 'WIO Bank',
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#6C63FF"/>
          <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">WIO</text>
        </svg>
      ),
      balance: 9483.02,
      lastUpdated: 'Just now',
      status: 'synced' as const
    }
  ]);

  const handleAccountAdded = (institution: any) => {
    // Add the new account to the list with mock data
    const newAccount = {
      name: institution.name,
      logo: institution.logo,
      balance: Math.random() * 50000 + 10000, // Mock balance
      lastUpdated: 'Just now',
      status: 'synced' as const
    };
    setConnectedAccounts([...connectedAccounts, newAccount]);
  };

  const goals = [
    {
      title: 'House deposit',
      targetAmount: 30000,
      currentAmount: 18966.04,
      deadline: 'Dec 2026',
      icon: <Home className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
      color: '#a87174',
      healthStatus: 'needs-attention' as const,
      aiInsight: "You're slightly behind pace. Increasing monthly contributions by $919 keeps you on track.",
      ctaText: 'Why am I off track?',
      onCtaClick: () => {
        onChatSubmit?.("Why am I off track?", {
          category: 'GOALS',
          categoryType: 'goal-analysis',
          title: 'House deposit - Goal Analysis',
          sourceScreen: 'wealth',
          adaResponse: "Here's what changed.\n\nYour house deposit goal slipped off track for two reasons:\n\n1. Recent withdrawals reduced momentum\nYou withdrew $3,000 in December which slowed progress toward your target amount.\n\n2. Time to target is narrowing\nWith only 12 months remaining until your target date of December 2026, your current rate of saving means you would miss your target amount.\n\nThe good news: this isn't a structural issue. Increasing your monthly contribution by $350 per month (4.4% of your monthly salary) will put you back on track."
        });
      }
    },
    {
      title: 'Education fund',
      targetAmount: 100000,
      currentAmount: 33190.57,
      deadline: 'Sep 2035',
      icon: <GraduationCap className="size-[18px] text-[#555555]" strokeWidth={1.5} />,
      color: '#6d3f42',
      healthStatus: 'needs-attention' as const,
      aiInsight: "You're behind schedule. Consistent contributions now will help you catch up over time.",
      ctaText: 'How can I get back on track?',
      onCtaClick: () => {
        onChatSubmit?.("How can I get my Education fund back on track?", {
          category: 'GOALS',
          categoryType: 'goal-optimization',
          title: 'Education fund Recovery',
          sourceScreen: 'wealth'
        });
      }
    }
  ];

  return (
    <div className="bg-[#efede6] relative h-screen w-full">
      {/* Fixed Header - includes TopBar, Ada Logo, and Navigation */}
      <div className="absolute bg-[#f7f6f2] content-stretch flex flex-col gap-[8px] items-center justify-center left-0 top-0 pb-0 pt-0 px-0 w-full z-10">
        <TopBar />
        <Header onNotificationsClick={onNotificationsClick} onClose={onClose} />
        <Navigation activeTab="wealth" onTabChange={() => {}} />
      </div>

      {/* Scrollable Content - starts after header */}
      <div className="absolute top-[128px] left-0 right-0 bottom-0 overflow-y-auto" ref={scrollContainerRef}>
        <div className="content-stretch flex flex-col gap-[5px] items-start px-[6px] pt-[5px] pb-[107px] w-full">
          
          {/* 1. Wealth Snapshot - Above the fold */}
          <WealthSnapshot
            totalValue={94830.19}
            dailyChange={758.64}
            dailyChangePercent={0.8}
            performanceData={performanceData}
            defaultTimeFrame="1M"
            primaryInsight="Your portfolio is 33% concentrated in global equities, driving strong returns but increasing volatility exposure."
            insightDetails={[
              {
                icon: <AlertTriangle className="size-[20px]" strokeWidth={1.5} />,
                title: "Portfolio Concentration Alert",
                summary: "33% in global equities, primarily US technology",
                fullContent: (
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[14px] tracking-[-0.28px]">
                      Over 33% of your invested wealth is currently concentrated in global equities, primarily US technology.{' '}
                      <span className="font-['DM_Sans:Regular',sans-serif]">This has driven strong returns, but it also increases sensitivity to market corrections.</span>
                    </p>
                  </div>
                ),
                cta: {
                  text: 'Review my risk exposure',
                  onClick: () => onChatSubmit?.('Review my risk exposure', {
                    category: 'TOTAL WEALTH',
                    categoryType: 'RISK ANALYSIS',
                    title: '33% concentration in global equities',
                    sourceScreen: 'wealth'
                  })
                }
              },
              {
                icon: <TrendingDown className="size-[20px]" strokeWidth={1.5} />,
                title: "Emerging Risk to Watch",
                summary: "Potential drawdown could exceed comfort range in correction",
                fullContent: (
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-['DM_Sans:Light',sans-serif] leading-[1.5] text-[#555555] text-[14px] tracking-[-0.28px]">
                      If equity markets experience a 15–20% correction, your portfolio drawdown could exceed your comfort range.{' '}
                      <span className="font-['DM_Sans:Regular',sans-serif]">Diversification into lower-volatility or hedged assets could reduce this impact.</span>
                    </p>
                  </div>
                ),
                cta: {
                  text: 'Discover diversification ideas',
                  onClick: () => onChatSubmit?.('Discover diversification ideas', {
                    category: 'TOTAL WEALTH',
                    categoryType: 'DIVERSIFICATION',
                    title: 'Portfolio concentration risk',
                    sourceScreen: 'wealth'
                  })
                }
              }
            ]}
          />

          {/* 2. Asset Allocation - Compact with expand */}
          <CompactAssetAllocation 
            allocations={allocations}
            totalValue={94830}
          />

          {/* 3. Portfolio Health Summary - Merged health + suggestions */}
          <PortfolioHealthSummary
            diversificationScore={82}
            riskLevel="low-medium"
            topSuggestion="At 10%, your alternatives allocation is high"
            additionalSuggestions={[
              'Increasing your fixed income holding could improve stability'
            ]}
            onChatSubmit={onChatSubmit}
          />

          {/* 4. Top Holdings - Compact */}
          <CompactHoldings holdings={holdings} />

          {/* 5. Goals - Compact with expand */}
          <CompactGoals 
            goals={goals}
            isExpanded={goalsExpanded}
            onExpandChange={setGoalsExpanded}
            houseDepositGoalRef={houseDepositGoalRef}
          />

          {/* 6. Connected Accounts - Compact with expand */}
          <CompactConnectedAccounts
            accounts={connectedAccounts}
            onAddAccount={() => setShowAddAccountModal(true)}
          />

          {/* 7. Advisor - Collapsible */}
          <CollapsibleAdvisor 
            advisorName="Sarah Mitchell"
            availability="Available today"
            onContactAdvisor={() => {
              console.log('Contact advisor clicked');
            }}
          />

        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomBar 
          onSubmit={onChatSubmit} 
          onChatHistoryClick={onChatHistoryClick}
          hasActiveChatToday={hasActiveChatToday}
          onResumeChat={onResumeChat}
          onOpenChat={onOpenChat}
        />
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={handleAccountAdded}
      />

      {/* Slide Notification for Goals */}
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
          // Expand the goals section
          setGoalsExpanded(true);
          // Set flag to trigger scrolling
          setShouldScrollToGoal(true);
        }}
      />
    </div>
  );
}