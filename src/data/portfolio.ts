import type {
  SparklinePoint,
  AssetAllocation,
  Holding,
  PerformanceDataPoint,
  GoalData,
  ConnectedAccountData,
} from '../types';

export const portfolioValue = 94830.19;
export const dailyChangeAmount = 758.64;
export const dailyChangePercent = 0.8;

export const homeSparklineData: SparklinePoint[] = [
  { value: 129000 },
  { value: 129500 },
  { value: 129200 },
  { value: 130000 },
  { value: 130200 },
  { value: 130500 },
  { value: 130800 },
  { value: 131230.19 },
];

export const wealthSparklineData: SparklinePoint[] = [
  { value: 91000 },
  { value: 92500 },
  { value: 91800 },
  { value: 93200 },
  { value: 94100 },
  { value: 94830.19 },
];

export const allocations: AssetAllocation[] = [
  { label: 'Stocks', value: 52156.6, amount: 52156.6, percentage: 55, color: '#d9b3b5' },
  { label: 'Cash', value: 18966.04, amount: 18966.04, percentage: 20, color: '#a87174' },
  { label: 'Bonds', value: 14224.53, amount: 14224.53, percentage: 15, color: '#6d3f42' },
  { label: 'Crypto', value: 5689.81, amount: 5689.81, percentage: 6, color: '#8b5a5d' },
  { label: 'Commodities', value: 3793.21, amount: 3793.21, percentage: 4, color: '#441316' },
];

export const holdings: Holding[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    quantity: 15,
    value: 3755.28,
    changePercent: 6.1,
    changeAmount: 216.05,
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 12,
    value: 2503.52,
    changePercent: 5.4,
    changeAmount: 128.18,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    quantity: 0.0195,
    value: 1706.94,
    changePercent: 4.2,
    changeAmount: 68.89,
  },
];

export const goalsData: GoalData[] = [
  {
    title: 'House deposit',
    targetAmount: 30000,
    currentAmount: 18966.04,
    deadline: 'Dec 2026',
    iconName: 'Home',
    color: '#a87174',
    healthStatus: 'needs-attention',
    aiInsight:
      "You're slightly behind pace. Increasing monthly contributions by $919 keeps you on track.",
    ctaText: 'Why am I off track?',
    chatContext: {
      category: 'GOALS',
      categoryType: 'goal-analysis',
      title: 'House deposit - Goal Analysis',
      sourceScreen: 'wealth',
      adaResponse:
        "Here's what changed.\n\nYour house deposit goal slipped off track for two reasons:\n\n1. Recent withdrawals reduced momentum\nYou withdrew $3,000 in December which slowed progress toward your target amount.\n\n2. Time to target is narrowing\nWith only 12 months remaining until your target date of December 2026, your current rate of saving means you would miss your target amount.\n\nThe good news: this isn't a structural issue. Increasing your monthly contribution by $350 per month (4.4% of your monthly salary) will put you back on track.",
    },
  },
  {
    title: 'Education fund',
    targetAmount: 100000,
    currentAmount: 33190.57,
    deadline: 'Sep 2035',
    iconName: 'GraduationCap',
    color: '#6d3f42',
    healthStatus: 'needs-attention',
    aiInsight:
      "You're behind schedule. Consistent contributions now will help you catch up over time.",
    ctaText: 'How can I get back on track?',
    chatContext: {
      category: 'GOALS',
      categoryType: 'goal-optimization',
      title: 'Education fund Recovery',
      sourceScreen: 'wealth',
    },
  },
];

export const connectedAccountsData: ConnectedAccountData[] = [
  {
    name: 'HSBC',
    logoColor: '#DB0011',
    logoText: 'HSBC',
    balance: 18966.04,
    lastUpdated: '2 min ago',
    status: 'synced',
  },
  {
    name: 'Interactive Brokers',
    logoColor: '#DA1F26',
    logoText: 'IB',
    balance: 66381.13,
    lastUpdated: '5 min ago',
    status: 'synced',
  },
  {
    name: 'WIO Bank',
    logoColor: '#6C63FF',
    logoText: 'WIO',
    balance: 9483.02,
    lastUpdated: 'Just now',
    status: 'synced',
  },
];

export function generatePerformanceData(): Record<string, PerformanceDataPoint[]> {
  const now = new Date();

  const formatMonthDay = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const getMonthAbbr = (date: Date) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[date.getMonth()];
  };

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
      { value: 94830, label: '6pm' },
    ],
    '1W': Array.from({ length: 5 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (4 - i));
      return { value: 93500 + i * 332.5, label: getDayAbbr(date) };
    }),
    '1M': Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (5 - i) * 7);
      return { value: 91000 + i * 783, label: formatMonthDay(date) };
    }),
    '3M': Array.from({ length: 4 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (3 - i));
      return { value: 85000 + i * 3276.67, label: getMonthAbbr(date) };
    }),
    '1Y': Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (11 - i));
      return { value: 78000 + i * 1402.5, label: getMonthAbbr(date) };
    }),
  };
}
