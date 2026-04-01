import type { AdaResponseEnvelope } from '../../shared/schemas/agent';

export type TabType = 'home' | 'wealth' | 'discover' | 'collective';

export type ViewType =
  | 'home'
  | 'home-empty'
  | 'chat'
  | 'chat-history'
  | 'notifications'
  | 'client-environment'
  | 'login';

export interface DiscoverCardContext {
  card_id?: string;
  card_type?: string;
  card_summary?: string;
  why_seen?: string;
  entities?: string[];
  evidence_facts?: string[];
  cta_family?: string;
}

export interface ChatContext {
  category: string;
  categoryType: string;
  title: string;
  sourceScreen?: string;
  adaResponse?: string;
  discoverCard?: DiscoverCardContext;
}

export interface SimulatorConfig {
  type: 'retirement' | 'investment' | 'spending' | 'tax';
  initialValues?: Record<string, number>;
}

export interface ChatWidget {
  type: 'allocation_chart' | 'holdings_summary' | 'goal_progress' | 'portfolio_summary' | 'advisor_handoff';
  advisorName?: string;
  actionContext?: string;
  queueId?: number;
}

export type StructuredEnvelope = AdaResponseEnvelope;

export interface StructuredError {
  code: string;
  message: string;
  showRawFallback: boolean;
  rawText?: string;
}

export interface Message {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  simulator?: SimulatorConfig;
  widgets?: ChatWidget[];
  isStreaming?: boolean;
  structuredEnvelope?: StructuredEnvelope;
  structuredError?: StructuredError;
  isSimplifiedView?: boolean;
  pendingStructuredIntent?: string;
  pendingExpectedBlocks?: string[];
  disclosures?: string[];
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
  currency?: string;
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
  currency?: string;
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
  isVideo?: boolean;
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
  onTabChange?: (tab: TabType) => void;
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

export interface WealthInsights {
  primaryInsight: string;
  topAllocationClass: string;
  topAllocationPercent: number;
  diversificationScore: number;
  riskLevel: string;
  topSuggestion: string;
  additionalSuggestions: string[];
  advisorName: string;
  advisorAvailability: string;
}

export interface WealthOverviewResponse {
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  performanceData: Record<string, PerformanceDataPoint[]>;
  insights: WealthInsights;
  currency?: string;
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
  previousAmount?: number;
  deadline: string;
  iconName: string;
  color: string;
  healthStatus: 'on-track' | 'needs-attention' | 'at-risk';
  aiInsight: string;
  ctaText: string;
}

export interface GoalHealthScoreResponse {
  score: number;
  label: string;
}

export interface LifeGapPromptResponse {
  key: string;
  title: string;
  description: string;
  ctaText: string;
}

export interface LifeEventSuggestionResponse {
  title: string;
  targetAmount: number;
  deadline: string;
  iconName: string;
  color: string;
  rationale: string;
}

export type LifeEventType = 'new_baby' | 'home_purchase' | 'inheritance' | 'job_change' | 'marriage';

export interface DiscoverContentItem extends ContentItem {
  id?: string;
  detailSections?: DetailSection[];
  stackButtons?: boolean;
  hideIntent?: boolean;
  customTopic?: string;
  cardType?: string;
  intentBadge?: string | null;
  topicLabel?: string;
  whyYouAreSeeingThis?: string | null;
  supportingArticles?: Array<{ title: string; publisher: string; published_at: string }>;
  freshnessLabel?: string;
  confidence?: string;
  createdAt?: string;
  isNew?: boolean;
  personalizedOverlay?: string | null;
}

export interface PollOption {
  id: string;
  pollId: string;
  label: string;
  voteCount: number;
}

export interface PollQuestion {
  id: string;
  question: string;
  createdAt: string;
  options: PollOption[];
  userVote?: string;
}

export interface AlertResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  category: NotificationCategory;
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

export interface ChatThreadResponse {
  id: string;
  userId: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}
