import { Router, type Request, type Response, type NextFunction } from 'express';
import * as userRepo from '../repositories/userRepository';
import * as portfolioRepo from '../repositories/portfolioRepository';
import * as contentRepo from '../repositories/contentRepository';
import * as pollRepo from '../repositories/pollRepository';
import * as portfolioService from '../services/portfolioService';
import * as chatService from '../services/chatService';
import type { ChatMessageRequest, PollVoteRequest } from '../../shared/types';

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

router.get('/portfolio', asyncHandler(async (_req, res) => {
  const overview = await portfolioService.getWealthOverview(DEFAULT_USER_ID);
  res.json(overview);
}));

router.get('/holdings', asyncHandler(async (_req, res) => {
  const holdings = await portfolioRepo.getHoldingsByUserId(DEFAULT_USER_ID);
  res.json(holdings);
}));

router.get('/allocations', asyncHandler(async (_req, res) => {
  const allocations = await portfolioRepo.getAllocationsByUserId(DEFAULT_USER_ID);
  res.json(allocations);
}));

router.get('/goals', asyncHandler(async (_req, res) => {
  const goals = await portfolioRepo.getGoalsByUserId(DEFAULT_USER_ID);
  res.json(goals);
}));

router.get('/accounts', asyncHandler(async (_req, res) => {
  const accounts = await portfolioRepo.getAccountsByUserId(DEFAULT_USER_ID);
  res.json(accounts);
}));

router.get('/collective/peers', asyncHandler(async (_req, res) => {
  const peers = await contentRepo.getPeerComparisons(DEFAULT_USER_ID);
  res.json(peers);
}));

router.get('/content', asyncHandler(async (req, res) => {
  const category = req.query.category as string | undefined;
  const items = category
    ? await contentRepo.getContentByCategory(category)
    : await contentRepo.getAllContent();
  res.json(items);
}));

router.get('/content/discover', asyncHandler(async (req, res) => {
  const tab = req.query.tab as string | undefined;
  const items = await contentRepo.getDiscoverContent(tab);
  res.json(items);
}));

router.get('/polls', asyncHandler(async (_req, res) => {
  const polls = await pollRepo.getActivePolls(DEFAULT_USER_ID);
  res.json(polls);
}));

router.post('/polls/:pollId/vote', asyncHandler(async (req, res) => {
  const { pollId } = req.params;
  const body = req.body as PollVoteRequest;
  if (!body.optionId) {
    res.status(400).json({ error: 'optionId is required' });
    return;
  }
  try {
    const poll = await pollRepo.vote(pollId, DEFAULT_USER_ID, body.optionId);
    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }
    res.json({ success: true, poll });
  } catch (err) {
    if (err instanceof Error && err.message.includes('does not belong to poll')) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}));

router.get('/chat/:threadId/messages', asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const messages = await contentRepo.getChatMessagesByThreadId(threadId, DEFAULT_USER_ID);
  res.json(messages);
}));

router.post('/chat/:threadId/messages', asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  await contentRepo.ensureChatThread(DEFAULT_USER_ID, threadId, body.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', body.message);

  const result = chatService.processMessage(DEFAULT_USER_ID, {
    ...body,
    threadId,
  });

  await contentRepo.insertChatMessage(threadId, 'assistant', result.message.message);

  res.json(result);
}));

export default router;
