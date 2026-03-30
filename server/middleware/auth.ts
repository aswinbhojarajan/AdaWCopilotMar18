import type { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  persona: string | null;
  avatar_url: string | null;
  mock_tier: string | null;
  mock_config: Record<string, unknown>;
}

declare module 'express-session' {
  interface SessionData {
    authUserId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function resolveSession(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authUserId = req.session?.authUserId;
    if (!authUserId) {
      next();
      return;
    }

    const result = await pool.query(
      `SELECT id, email, display_name, role, status, persona, avatar_url, mock_tier, mock_config
       FROM auth.users WHERE id = $1`,
      [authUserId]
    );

    if (result.rows.length === 0) {
      req.session.destroy(() => {});
      next();
      return;
    }

    const user = result.rows[0];

    if (user.status === 'suspended') {
      req.session.destroy(() => {});
      next();
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch (err) {
    console.error('[Auth] resolveSession error:', (err as Error).message);
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function logAuthEvent(
  userId: string | null,
  eventType: string,
  req: Request,
  metadata: Record<string, unknown> = {}
): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  pool.query(
    `INSERT INTO auth.events (user_id, event_type, ip, user_agent, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, eventType, ip, userAgent, JSON.stringify(metadata)]
  ).catch(err => {
    console.error('[Auth] Failed to log event:', (err as Error).message);
  });
}
