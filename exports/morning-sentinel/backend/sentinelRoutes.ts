/**
 * Morning Sentinel Express Route Handlers
 *
 * EXTERNAL DEPENDENCIES (consumer must provide):
 *
 * 1. getUserId(req: Request): string
 *    - Extracts the authenticated user ID from the Express request.
 *    - In Ada, this reads `req.user.persona` set by auth middleware.
 *
 * 2. asyncHandler(fn): RequestHandler
 *    - Wraps async route handlers to forward errors to Express error middleware.
 *    - Example: (fn) => (req, res, next) => fn(req, res, next).catch(next)
 *
 * 3. Auth middleware
 *    - Your auth middleware should run before these routes.
 *
 * Mount these routes on your Express router (e.g., router.use('/api', sentinelRoutes)).
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import * as morningSentinelService from './morningSentinelService';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

function getUserId(req: Request): string {
  const persona = (req as any).user?.persona;
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
