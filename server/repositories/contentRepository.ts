import pool from '../db/pool';
import type { ContentItem, Alert, ChatThread, ChatMessage, PeerComparison } from '../../shared/types';

export interface DiscoverContentItem extends ContentItem {
  detailSections?: { title: string; content: string | string[] }[];
  stackButtons?: boolean;
  hideIntent?: boolean;
  customTopic?: string;
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

export async function getDiscoverContent(tab?: string): Promise<DiscoverContentItem[]> {
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
    sourcesCount: r.sources_count ? Number(r.sources_count) : undefined,
    topicLabelColor: r.topic_label_color ? String(r.topic_label_color) : undefined,
  };
}

function mapRowToDiscoverItem(r: Record<string, unknown>): DiscoverContentItem {
  return {
    ...mapRowToContentItem(r),
    detailSections: r.detail_sections ? (r.detail_sections as DiscoverContentItem['detailSections']) : undefined,
    stackButtons: r.stack_buttons ? Boolean(r.stack_buttons) : undefined,
    hideIntent: r.hide_intent ? Boolean(r.hide_intent) : undefined,
    customTopic: r.custom_topic ? String(r.custom_topic) : undefined,
  };
}
