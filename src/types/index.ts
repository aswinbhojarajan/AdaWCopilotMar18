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

export interface PortfolioSummary {
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  sparklineData: SparklinePoint[];
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

export interface Goal {
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: React.ReactNode;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
  onCtaClick?: () => void;
}

export interface ConnectedAccount {
  name: string;
  logo: React.ReactNode;
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

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
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
