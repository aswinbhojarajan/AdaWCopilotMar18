/**
 * Morning Sentinel Express Route Handlers
 * Original source: server/routes/api.ts (sentinel route handlers only)
 *
 * Auth middleware should run before these routes are mounted.
 * Adjust getUserId to match your auth middleware's request shape.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import * as morningSentinelService from '../services/morningSentinelService';

interface AuthenticatedRequest extends Request {
  user?: { persona?: string };
}

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

function getUserId(req: AuthenticatedRequest): string {
  const persona = req.user?.persona;
  if (!persona) {
    throw new Error('No persona assigned to this account');
  }
  return persona;
}

router.get('/morning-sentinel', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const forceRefresh = req.query.refresh === 'true';
  const briefing = await morningSentinelService.generateBriefing(userId, forceRefresh);
  res.json(briefing);
}));

router.get('/morning-sentinel/stream', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const forceRefresh = req.query.refresh === 'true';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let closed = false;
  res.on('close', () => { closed = true; });

  const stream = morningSentinelService.generateBriefingStream(userId, forceRefresh);

  for await (const event of stream) {
    if (closed) break;
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  res.end();
}));

export default router;
