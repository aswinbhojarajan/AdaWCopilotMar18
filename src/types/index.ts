export type TabType = 'home' | 'wealth' | 'discover' | 'collective';

export type ViewType =
  | 'home'
  | 'home-empty'
  | 'chat'
  | 'chat-history'
  | 'notifications'
  | 'client-environment';

export interface ChatContext {
  category: string;
  categoryType: string;
  title: string;
  sourceScreen?: string;
  adaResponse?: string;
}

export interface SimulatorConfig {
  type: 'retirement' | 'investment' | 'spending' | 'tax';
  initialValues?: Record<string, number>;
}

export interface Message {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  simulator?: SimulatorConfig;
}

export interface SparklinePoint {
  value: number;
}

export interface PerformanceDataPoint {
  value: number;
  label: string;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  changePercent: number;
  changeAmount: number;
}

export interface AssetAllocation {
  label: string;
  value: number;
  amount: number;
  percentage: number;
  color: string;
}

export interface GoalData {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  iconName: string;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
  chatContext: ChatContext;
}

export interface ConnectedAccountData {
  name: string;
  logoColor: string;
  logoText: string;
  balance: number;
  lastUpdated: string;
  status: 'synced' | 'error' | 'pending';
}

export interface ContentItem {
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
  stackButtons?: boolean;
  hideIntent?: boolean;
  customTopic?: string;
  detailSections?: DetailSection[];
}

export interface DetailSection {
  title: string;
  content: string | string[];
}

export interface PollResults {
  [key: string]: number;
}

export interface PeerComparison {
  assetClass: string;
  userPercent: number;
  peerPercent: number;
  color: string;
}

export type NotificationType =
  | 'PORTFOLIO_ALERT'
  | 'ADVISOR_MESSAGE'
  | 'MARKET_UPDATE'
  | 'DOCUMENT'
  | 'OPPORTUNITY'
  | 'EVENT';

export type NotificationCategory = 'all' | 'alerts' | 'opportunities' | 'updates';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  category: NotificationCategory;
}

export interface ChatHistoryThread {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
}

export interface ChatResponseMapping {
  keywords: string[];
  message: string;
  simulator?: SimulatorConfig;
}

export interface ScreenProps {
  onChatHistoryClick?: () => void;
  onNotificationsClick?: () => void;
  onChatSubmit?: (message: string, context?: ChatContext) => void;
  hasActiveChatToday?: boolean;
  onResumeChat?: () => void;
  onOpenChat?: () => void;
  onClose?: () => void;
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
  contentCards: (ContentItem & { id: string })[];
}

export interface WealthOverviewResponse {
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  performanceData: Record<string, PerformanceDataPoint[]>;
}

export interface AccountResponse {
  id: string;
  institutionName: string;
  logoColor: string;
  logoText: string;
  accountType: string;
  balance: number;
  lastSynced: string;
  status: 'synced' | 'error' | 'pending';
}

export interface GoalResponse {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  iconName: string;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
}
