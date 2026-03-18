import { Router, type Request, type Response, type NextFunction } from 'express';
import * as userRepo from '../repositories/userRepository';
import * as portfolioRepo from '../repositories/portfolioRepository';
import * as contentRepo from '../repositories/contentRepository';
import * as pollRepo from '../repositories/pollRepository';
import * as portfolioService from '../services/portfolioService';
import * as chatService from '../services/chatService';
import * as goalService from '../services/goalService';
import * as morningSentinelService from '../services/morningSentinelService';
import type { ChatMessageRequest, PollVoteRequest, LifeEventType } from '../../shared/types';

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

router.get('/morning-sentinel', asyncHandler(async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const briefing = await morningSentinelService.generateBriefing(DEFAULT_USER_ID, forceRefresh);
  res.json(briefing);
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

router.get('/wealth/goals/health-score', asyncHandler(async (_req, res) => {
  const goals = await portfolioRepo.getGoalsByUserId(DEFAULT_USER_ID);
  const score = goalService.calculateGoalHealthScore(goals);
  res.json(score);
}));

router.get('/wealth/goals/life-gaps', asyncHandler(async (_req, res) => {
  const goals = await portfolioRepo.getGoalsByUserId(DEFAULT_USER_ID);
  const prompts = await goalService.generateLifeGapPrompts(DEFAULT_USER_ID, goals);
  res.json(prompts);
}));

router.post('/wealth/goals/life-gaps/dismiss', asyncHandler(async (req, res) => {
  const { promptKey } = req.body as { promptKey: string };
  if (!promptKey) {
    res.status(400).json({ error: 'promptKey is required' });
    return;
  }
  await goalService.dismissPrompt(DEFAULT_USER_ID, promptKey);
  res.json({ success: true });
}));

router.post('/wealth/goals/life-event', asyncHandler(async (req, res) => {
  const { eventType } = req.body as { eventType: LifeEventType };
  if (!eventType) {
    res.status(400).json({ error: 'eventType is required' });
    return;
  }
  const goals = await portfolioRepo.getGoalsByUserId(DEFAULT_USER_ID);
  const suggestions = await goalService.generateLifeEventSuggestions(eventType, goals);
  res.json(suggestions);
}));

router.post('/wealth/goals', asyncHandler(async (req, res) => {
  const { title, targetAmount, deadline, iconName, color } = req.body as {
    title: string;
    targetAmount: number;
    deadline: string;
    iconName: string;
    color: string;
  };
  if (!title || !targetAmount || !deadline) {
    res.status(400).json({ error: 'title, targetAmount, and deadline are required' });
    return;
  }
  const goal = await goalService.createGoalFromSuggestion(DEFAULT_USER_ID, {
    title,
    targetAmount,
    deadline,
    iconName: iconName || 'Target',
    color: color || '#a87174',
  });
  res.status(201).json(goal);
}));

router.get('/wealth/accounts', asyncHandler(async (_req, res) => {
  const accounts = await portfolioRepo.getAccountsByUserId(DEFAULT_USER_ID);
  res.json(accounts);
}));

router.post('/wealth/accounts', asyncHandler(async (req, res) => {
  const { institutionName, accountType } = req.body as { institutionName: string; accountType: string };
  if (!institutionName || !accountType) {
    res.status(400).json({ error: 'institutionName and accountType are required' });
    return;
  }
  const account = await portfolioRepo.createAccount(DEFAULT_USER_ID, institutionName, accountType);
  res.status(201).json(account);
}));

router.get('/notifications', asyncHandler(async (_req, res) => {
  const alerts = await contentRepo.getAlertsByUserId(DEFAULT_USER_ID);
  res.json(alerts);
}));

router.get('/chat/threads', asyncHandler(async (_req, res) => {
  const threads = await contentRepo.getChatThreadsByUserId(DEFAULT_USER_ID);
  res.json(threads);
}));

router.post('/chat/message', asyncHandler(async (req, res) => {
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }
  const result = await chatService.processMessageSync(DEFAULT_USER_ID, body);
  res.json(result);
}));

router.post('/chat/stream', asyncHandler(async (req, res) => {
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  res.flushHeaders();

  const stream = chatService.processMessageStream(DEFAULT_USER_ID, body);

  for await (const event of stream) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  res.end();
}));

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
  const pollId = req.params.pollId as string;
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
  const threadId = req.params.threadId as string;
  const messages = await contentRepo.getChatMessagesByThreadId(threadId, DEFAULT_USER_ID);
  res.json(messages);
}));

router.post('/chat/:threadId/messages', asyncHandler(async (req, res) => {
  const threadId = req.params.threadId as string;
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const result = await chatService.processMessageSync(DEFAULT_USER_ID, {
    ...body,
    threadId,
  });

  res.json(result);
}));

router.post('/chat/:threadId/close', asyncHandler(async (req, res) => {
  const threadId = req.params.threadId as string;
  await chatService.finalizeSession(DEFAULT_USER_ID, threadId);
  res.json({ success: true });
}));

export default router;
