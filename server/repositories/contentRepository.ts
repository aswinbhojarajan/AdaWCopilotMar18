import pool from '../db/pool';
import type { ContentItem, Alert, ChatThread, PeerComparison } from '../../shared/types';

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
