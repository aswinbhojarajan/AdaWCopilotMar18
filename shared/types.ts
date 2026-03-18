export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  riskProfile: RiskProfile;
  advisorId?: string;
}

export interface RiskProfile {
  level: 'conservative' | 'moderate' | 'aggressive';
  score: number;
  lastAssessed: string;
}

export interface Advisor {
  id: string;
  name: string;
  title: string;
  photoUrl?: string;
  availability: string;
  email: string;
  phone: string;
}

export interface Account {
  id: string;
  userId: string;
  institutionName: string;
  logoColor: string;
  logoText: string;
  accountType: 'brokerage' | 'savings' | 'checking' | 'retirement';
  balance: number;
  lastSynced: string;
  status: 'synced' | 'error' | 'pending';
}

export interface Position {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  costBasis: number;
  assetClass: string;
}

export interface AssetAllocation {
  label: string;
  value: number;
  amount: number;
  percentage: number;
  color: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  previousAmount?: number;
  deadline: string;
  iconName: string;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
}

export interface GoalHealthScore {
  score: number;
  label: string;
}

export interface LifeGapPrompt {
  key: string;
  title: string;
  description: string;
  ctaText: string;
}

export interface LifeEventSuggestion {
  title: string;
  targetAmount: number;
  deadline: string;
  iconName: string;
  color: string;
  rationale: string;
}

export type LifeEventType = 'new_baby' | 'home_purchase' | 'inheritance' | 'job_change' | 'marriage';

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'PORTFOLIO_ALERT' | 'ADVISOR_MESSAGE' | 'MARKET_UPDATE' | 'DOCUMENT' | 'OPPORTUNITY' | 'EVENT';
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  category: 'alerts' | 'opportunities' | 'updates';
}

export interface ContentItem {
  id: string;
  category: string;
  categoryType: string;
  title: string;
  contextTitle?: string;
  description: string;
  timestamp: string;
  buttonText: string;
  secondaryButtonText?: string;
  image?: string;
  sourcesCount?: number;
  topicLabelColor?: string;
}

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  widgets?: { type: string }[];
}

export interface ActionContext {
  id: string;
  userId: string;
  category: string;
  categoryType: string;
  title: string;
  sourceScreen: string;
  adaResponse?: string;
  createdAt: string;
}

export interface PeerComparison {
  assetClass: string;
  userPercent: number;
  peerPercent: number;
  color: string;
}

export interface SparklinePoint {
  value: number;
}

export interface PerformanceDataPoint {
  value: number;
  label: string;
}

export interface HomeSummaryResponse {
  greeting: string;
  date: string;
  attentionCount: number;
  summary: string;
  portfolioValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  sparklineData: SparklinePoint[];
  contentCards: ContentItem[];
}

export interface WealthOverviewResponse {
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  performanceData: Record<string, PerformanceDataPoint[]>;
}

export interface HoldingResponse {
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  changePercent: number;
  changeAmount: number;
}

export interface PollQuestion {
  id: string;
  question: string;
  createdAt: string;
  options: PollOption[];
  userVote?: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  label: string;
  voteCount: number;
}

export interface PollVoteRequest {
  optionId: string;
}

export interface PollVoteResponse {
  success: boolean;
  poll: PollQuestion;
}

export interface MorningSentinelRisk {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface MorningSentinelAction {
  title: string;
  description: string;
  ctaText: string;
  ctaMessage: string;
}

export interface MorningSentinelKeyMover {
  symbol: string;
  name: string;
  direction: 'up' | 'down';
  detail: string;
}

export interface MorningSentinelResponse {
  userName: string;
  generatedAt: string;
  portfolioValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  headline: string;
  overview: string;
  keyMovers: MorningSentinelKeyMover[];
  risks: MorningSentinelRisk[];
  actions: MorningSentinelAction[];
  benchmarkNote: string;
  hasAnomalies: boolean;
}

export interface ChatMessageRequest {
  message: string;
  threadId?: string;
  context?: {
    category: string;
    categoryType: string;
    title: string;
    sourceScreen?: string;
  };
}

export interface ChatMessageResponse {
  threadId: string;
  message: ChatMessage;
  suggestedQuestions: string[];
}
