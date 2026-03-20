import type { NewsProvider } from '../types';
import type { ToolResult } from '../../../shared/schemas/agent';
import { toolOk, toolError } from './helpers';
import pool from '../../db/pool';

function mapRow(r: Record<string, unknown>) {
  return {
    id: String(r.id),
    title: String(r.title),
    summary: String(r.summary),
    publisher: String(r.publisher),
    published_at: r.published_at ? new Date(r.published_at as string).toISOString() : new Date().toISOString(),
    url: r.url ? String(r.url) : undefined,
    symbols: (r.symbols as string[]) ?? [],
    relevance_tags: (r.relevance_tags as string[]) ?? [],
    source_provider: String(r.source_provider),
  };
}

export const mockNewsProvider: NewsProvider = {
  name: 'mock',

  async getHoldingsRelevantNews(symbols: string[], limit = 10): Promise<ToolResult> {
    const start = Date.now();
    try {
      const { rows } = await pool.query(
        `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
         FROM news_items WHERE symbols && $1::text[] ORDER BY published_at DESC LIMIT $2`,
        [symbols.map((s) => s.toUpperCase()), limit],
      );
      return toolOk('mock_news', 'news_api', rows.map(mapRow), start);
    } catch (error) {
      return toolError('mock_news', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getLatestNews(limit = 10): Promise<ToolResult> {
    const start = Date.now();
    try {
      const { rows } = await pool.query(
        `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
         FROM news_items ORDER BY published_at DESC LIMIT $1`,
        [limit],
      );
      return toolOk('mock_news', 'news_api', rows.map(mapRow), start);
    } catch (error) {
      return toolError('mock_news', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getNewsByTag(tag: string, limit = 5): Promise<ToolResult> {
    const start = Date.now();
    try {
      const { rows } = await pool.query(
        `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
         FROM news_items WHERE EXISTS (SELECT 1 FROM unnest(relevance_tags) t WHERE LOWER(t) = LOWER($1))
         ORDER BY published_at DESC LIMIT $2`,
        [tag, limit],
      );
      return toolOk('mock_news', 'news_api', rows.map(mapRow), start);
    } catch (error) {
      return toolError('mock_news', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async searchNews(query: string, limit = 5): Promise<ToolResult> {
    const start = Date.now();
    try {
      const { rows } = await pool.query(
        `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
         FROM news_items WHERE title ILIKE $1 OR summary ILIKE $1 ORDER BY published_at DESC LIMIT $2`,
        [`%${query}%`, limit],
      );
      return toolOk('mock_news', 'news_api', rows.map(mapRow), start);
    } catch (error) {
      return toolError('mock_news', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
