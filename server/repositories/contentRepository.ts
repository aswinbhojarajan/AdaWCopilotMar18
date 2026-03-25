import pool from '../db/pool';
import type { ContentItem, Alert, ChatThread, ChatMessage, PeerComparison } from '../../shared/types';

export interface DiscoverContentItem extends ContentItem {
  detailSections?: { title: string; type?: string; content: string | string[] }[];
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
}

export async function getHomeContent(_userId: string): Promise<ContentItem[]> {
  const { rows } = await pool.query(
    `SELECT id, category, category_type, title, context_title, description,
            timestamp, button_text, secondary_button_text, image, sources_count,
            topic_label_color
     FROM content_items WHERE target_screen = 'home'
     ORDER BY id`,
  );
  return rows.map(mapRowToContentItem);
}

export async function getDiscoverContent(tab?: string, cursor?: string, limit?: number): Promise<DiscoverContentItem[]> {
  const hasDiscoverCards = await checkDiscoverCardsExist();
  if (hasDiscoverCards) {
    return getDiscoverCardsContent(tab, cursor, limit);
  }
  const query = tab
    ? `SELECT id, category, category_type, title, context_title, description,
              timestamp, button_text, secondary_button_text, image, sources_count,
              topic_label_color, detail_sections, stack_buttons, hide_intent, custom_topic
       FROM content_items WHERE target_screen = 'discover' AND tab = $1
       ORDER BY id`
    : `SELECT id, category, category_type, title, context_title, description,
              timestamp, button_text, secondary_button_text, image, sources_count,
              topic_label_color, detail_sections, stack_buttons, hide_intent, custom_topic
       FROM content_items WHERE target_screen = 'discover'
       ORDER BY id`;
  const { rows } = tab ? await pool.query(query, [tab]) : await pool.query(query);
  return rows.map(mapRowToDiscoverItem);
}

async function checkDiscoverCardsExist(): Promise<boolean> {
  try {
    const { rows } = await pool.query(`SELECT COUNT(*) as cnt FROM discover_cards WHERE is_active = TRUE`);
    return Number(rows[0]?.cnt) > 0;
  } catch {
    return false;
  }
}

function computeFreshnessLabel(createdAt: Date): string {
  const now = Date.now();
  const diffMs = now - createdAt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

async function getDiscoverCardsContent(tab?: string, cursor?: string, limit: number = 5): Promise<DiscoverContentItem[]> {
  const tabFilter = tab === 'forYou'
    ? `AND (tab = 'forYou' OR tab = 'both')`
    : tab === 'whatsNew' || tab === 'whatsHappening'
    ? `AND (tab = 'whatsNew' OR tab = 'both')`
    : '';

  const cursorFilter = cursor ? `AND created_at < $1` : '';
  const params: (string | number)[] = [];
  if (cursor) {
    params.push(cursor);
  }
  params.push(Math.min(limit, 20));

  const { rows } = await pool.query(
    `SELECT id, card_type, tab, title, summary, detail_sections, supporting_articles,
            image_url, source_count, intent_badge, topic_label, relevance_tags,
            confidence, taxonomy_tags, ctas, why_you_are_seeing_this,
            is_editorial, created_at, updated_at
     FROM discover_cards
     WHERE is_active = TRUE ${tabFilter} ${cursorFilter}
     ORDER BY created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map((r: Record<string, unknown>) => {
    const ctas = parseJson(r.ctas) as Array<{ text: string; family: string; context?: Record<string, unknown> }> | null;
    const primaryCta = ctas?.[0];
    const secondaryCta = ctas?.[1];
    const cardType = r.card_type as string;
    const intentBadge = r.intent_badge as string | null;
    const createdAt = new Date(r.created_at as string);

    const categoryType = mapCardTypeToCategoryType(cardType);

    return {
      id: r.id as string,
      category: (r.topic_label as string) || 'News',
      categoryType,
      title: r.title as string,
      contextTitle: r.title as string,
      description: r.summary as string,
      timestamp: computeFreshnessLabel(createdAt),
      buttonText: primaryCta?.text || 'Tell me more',
      secondaryButtonText: secondaryCta?.text || undefined,
      image: (r.image_url as string) || undefined,
      sourcesCount: Number(r.source_count) || undefined,
      topicLabelColor: mapCardTypeToColor(cardType),
      detailSections: parseJson(r.detail_sections) as DiscoverContentItem['detailSections'],
      stackButtons: false,
      hideIntent: !intentBadge,
      customTopic: r.topic_label as string,
      cardType,
      intentBadge,
      topicLabel: r.topic_label as string,
      whyYouAreSeeingThis: r.why_you_are_seeing_this as string | null,
      supportingArticles: parseJson(r.supporting_articles) as DiscoverContentItem['supportingArticles'],
      freshnessLabel: computeFreshnessLabel(createdAt),
      confidence: r.confidence as string,
      createdAt: createdAt.toISOString(),
    };
  });
}

function mapCardTypeToCategoryType(cardType: string): string {
  switch (cardType) {
    case 'portfolio_impact': return 'PORTFOLIO RISK ALERT';
    case 'allocation_gap': return 'MARKET OPPORTUNITY INSIGHT';
    case 'trend_brief': return 'MARKET ANALYSIS';
    case 'market_pulse': return 'NEWS';
    case 'explainer': return 'EDUCATIONAL';
    case 'wealth_planning': return 'ACTION ITEM';
    case 'event_calendar': return 'NEWS';
    case 'ada_view': return 'INSIGHT';
    case 'product_opportunity': return 'MARKET OPPORTUNITY INSIGHT';
    default: return 'NEWS';
  }
}

function mapCardTypeToColor(cardType: string): string {
  switch (cardType) {
    case 'portfolio_impact': return '#d97706';
    case 'allocation_gap': return '#059669';
    case 'trend_brief': return '#992929';
    case 'market_pulse': return '#555555';
    case 'explainer': return '#555555';
    case 'wealth_planning': return '#059669';
    case 'ada_view': return '#992929';
    default: return '#992929';
  }
}

function parseJson(raw: unknown): unknown {
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function getAlertsByUserId(userId: string): Promise<Alert[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, type, title, message, timestamp, unread, category
     FROM alerts WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    type: r.type as Alert['type'],
    title: String(r.title),
    message: String(r.message),
    timestamp: String(r.timestamp),
    unread: Boolean(r.unread),
    category: r.category as Alert['category'],
  }));
}

export async function getChatThreadsByUserId(userId: string): Promise<ChatThread[]> {
  const { rows } = await pool.query(
    `SELECT id, user_id, title, preview, created_at, updated_at
     FROM chat_threads WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    title: String(r.title),
    preview: String(r.preview ?? ''),
    createdAt: new Date(r.created_at as string).toISOString(),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  }));
}

export async function getPeerComparisons(_userId: string): Promise<PeerComparison[]> {
  const { rows } = await pool.query(
    `SELECT asset_class, user_percent, peer_percent, color
     FROM peer_segments ORDER BY id`,
  );
  return rows.map((r) => ({
    assetClass: String(r.asset_class),
    userPercent: Number(r.user_percent),
    peerPercent: Number(r.peer_percent),
    color: String(r.color),
  }));
}

export async function getAllContent(): Promise<ContentItem[]> {
  const { rows } = await pool.query(
    `SELECT id, category, category_type, title, context_title, description,
            timestamp, button_text, secondary_button_text, image, sources_count,
            topic_label_color
     FROM content_items
     ORDER BY id`,
  );
  return rows.map(mapRowToContentItem);
}

export async function getContentByCategory(category: string): Promise<ContentItem[]> {
  const { rows } = await pool.query(
    `SELECT id, category, category_type, title, context_title, description,
            timestamp, button_text, secondary_button_text, image, sources_count,
            topic_label_color
     FROM content_items
     WHERE LOWER(category) = LOWER($1)
     ORDER BY id`,
    [category],
  );
  return rows.map(mapRowToContentItem);
}

export async function getChatMessagesByThreadId(
  threadId: string,
  userId: string,
): Promise<ChatMessage[]> {
  const { rows: threadCheck } = await pool.query(
    `SELECT id FROM chat_threads WHERE id = $1 AND user_id = $2`,
    [threadId, userId],
  );
  if (threadCheck.length === 0) return [];

  const { rows } = await pool.query(
    `SELECT id, thread_id, sender, message, widgets, created_at
     FROM chat_messages WHERE thread_id = $1
     ORDER BY created_at ASC`,
    [threadId],
  );
  return rows.map((r) => ({
    id: String(r.id),
    threadId: String(r.thread_id),
    sender: r.sender as ChatMessage['sender'],
    message: String(r.message),
    timestamp: new Date(r.created_at as string).toISOString(),
    ...(r.widgets ? { widgets: r.widgets } : {}),
  }));
}

export async function insertChatMessage(
  threadId: string,
  sender: 'user' | 'assistant',
  message: string,
): Promise<ChatMessage> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { rows } = await pool.query(
    `INSERT INTO chat_messages (id, thread_id, sender, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, thread_id, sender, message, created_at`,
    [id, threadId, sender, message],
  );
  await pool.query(
    `UPDATE chat_threads SET updated_at = NOW() WHERE id = $1`,
    [threadId],
  );
  const r = rows[0];
  return {
    id: String(r.id),
    threadId: String(r.thread_id),
    sender: r.sender as ChatMessage['sender'],
    message: String(r.message),
    timestamp: new Date(r.created_at as string).toISOString(),
  };
}

export async function ensureChatThread(
  userId: string,
  threadId: string,
  title: string,
): Promise<string> {
  const { rows } = await pool.query(
    `SELECT id FROM chat_threads WHERE id = $1 AND user_id = $2`,
    [threadId, userId],
  );
  if (rows.length > 0) return threadId;

  await pool.query(
    `INSERT INTO chat_threads (id, user_id, title, preview) VALUES ($1, $2, $3, $4)`,
    [threadId, userId, title, ''],
  );
  return threadId;
}

export async function insertChatMessageWithWidgets(
  threadId: string,
  sender: 'user' | 'assistant',
  message: string,
  widgets: string | null,
): Promise<void> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await pool.query(
    `INSERT INTO chat_messages (id, thread_id, sender, message, widgets)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, threadId, sender, message, widgets],
  );
  await pool.query(
    `UPDATE chat_threads SET updated_at = NOW() WHERE id = $1`,
    [threadId],
  );
}

export async function updateThreadPreview(threadId: string, preview: string): Promise<void> {
  await pool.query(
    `UPDATE chat_threads SET preview = $1, updated_at = NOW() WHERE id = $2`,
    [preview, threadId],
  );
}

function mapRowToContentItem(r: Record<string, unknown>): ContentItem {
  return {
    id: String(r.id),
    category: String(r.category),
    categoryType: String(r.category_type),
    title: String(r.title),
    contextTitle: r.context_title ? String(r.context_title) : undefined,
    description: String(r.description),
    timestamp: String(r.timestamp),
    buttonText: String(r.button_text),
    secondaryButtonText: r.secondary_button_text ? String(r.secondary_button_text) : undefined,
    image: r.image ? String(r.image) : undefined,
    isVideo: r.is_video ? Boolean(r.is_video) : false,
    sourcesCount: r.sources_count ? Number(r.sources_count) : undefined,
    topicLabelColor: r.topic_label_color ? String(r.topic_label_color) : undefined,
  };
}

function parseDetailSections(raw: unknown): DiscoverContentItem['detailSections'] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function mapRowToDiscoverItem(r: Record<string, unknown>): DiscoverContentItem {
  return {
    ...mapRowToContentItem(r),
    detailSections: parseDetailSections(r.detail_sections),
    stackButtons: r.stack_buttons ? Boolean(r.stack_buttons) : undefined,
    hideIntent: r.hide_intent ? Boolean(r.hide_intent) : undefined,
    customTopic: r.custom_topic ? String(r.custom_topic) : undefined,
  };
}
