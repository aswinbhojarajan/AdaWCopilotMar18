import type { NewsProvider } from '../types';
import type { NewsArticle } from '../../../shared/schemas/agent';
import pool from '../../db/pool';

export const mockNewsProvider: NewsProvider = {
  name: 'mock',

  async getLatestNews(limit = 10): Promise<NewsArticle[]> {
    const { rows } = await pool.query(
      `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
       FROM news_items ORDER BY published_at DESC LIMIT $1`,
      [limit],
    );
    return rows.map(mapRow);
  },

  async getNewsBySymbol(symbol: string, limit = 5): Promise<NewsArticle[]> {
    const { rows } = await pool.query(
      `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
       FROM news_items WHERE $1 = ANY(symbols) ORDER BY published_at DESC LIMIT $2`,
      [symbol.toUpperCase(), limit],
    );
    return rows.map(mapRow);
  },

  async getNewsByTag(tag: string, limit = 5): Promise<NewsArticle[]> {
    const { rows } = await pool.query(
      `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
       FROM news_items WHERE EXISTS (SELECT 1 FROM unnest(relevance_tags) t WHERE LOWER(t) = LOWER($1))
       ORDER BY published_at DESC LIMIT $2`,
      [tag, limit],
    );
    return rows.map(mapRow);
  },

  async searchNews(query: string, limit = 5): Promise<NewsArticle[]> {
    const { rows } = await pool.query(
      `SELECT id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider
       FROM news_items WHERE title ILIKE $1 OR summary ILIKE $1 ORDER BY published_at DESC LIMIT $2`,
      [`%${query}%`, limit],
    );
    return rows.map(mapRow);
  },
};

function mapRow(r: Record<string, unknown>): NewsArticle {
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
