import { Router, type Request, type Response, type NextFunction } from 'express';
import * as userRepo from '../repositories/userRepository';
import * as portfolioRepo from '../repositories/portfolioRepository';
import * as contentRepo from '../repositories/contentRepository';
import * as portfolioService from '../services/portfolioService';
import * as chatService from '../services/chatService';
import type { ChatMessageRequest } from '../../shared/types';

const router = Router();

const DEFAULT_USER_ID = 'user-abdullah';

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get('/me', asyncHandler(async (_req, res) => {
  const user = (await userRepo.findUserById(DEFAULT_USER_ID)) ?? (await userRepo.getDefaultUser());
  res.json(user);
}));

router.get('/home/summary', asyncHandler(async (_req, res) => {
  const summary = await portfolioService.getHomeSummary(DEFAULT_USER_ID);
  res.json(summary);
}));

router.get('/wealth/overview', asyncHandler(async (_req, res) => {
  const overview = await portfolioService.getWealthOverview(DEFAULT_USER_ID);
  res.json(overview);
}));

router.get('/wealth/allocation', asyncHandler(async (_req, res) => {
  const allocations = await portfolioRepo.getAllocationsByUserId(DEFAULT_USER_ID);
  res.json(allocations);
}));

router.get('/wealth/holdings', asyncHandler(async (_req, res) => {
  const holdings = await portfolioRepo.getHoldingsByUserId(DEFAULT_USER_ID);
  res.json(holdings);
}));

router.get('/wealth/goals', asyncHandler(async (_req, res) => {
  const goals = await portfolioRepo.getGoalsByUserId(DEFAULT_USER_ID);
  res.json(goals);
}));

router.get('/wealth/accounts', asyncHandler(async (_req, res) => {
  const accounts = await portfolioRepo.getAccountsByUserId(DEFAULT_USER_ID);
  res.json(accounts);
}));

router.get('/notifications', asyncHandler(async (_req, res) => {
  const alerts = await contentRepo.getAlertsByUserId(DEFAULT_USER_ID);
  res.json(alerts);
}));

router.get('/chat/threads', asyncHandler(async (_req, res) => {
  const threads = await contentRepo.getChatThreadsByUserId(DEFAULT_USER_ID);
  res.json(threads);
}));

router.post('/chat/message', (req: Request, res: Response) => {
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }
  const result = chatService.processMessage(DEFAULT_USER_ID, body);
  res.json(result);
});

router.get('/collective/peers', asyncHandler(async (_req, res) => {
  const peers = await contentRepo.getPeerComparisons(DEFAULT_USER_ID);
  res.json(peers);
}));

export default router;
