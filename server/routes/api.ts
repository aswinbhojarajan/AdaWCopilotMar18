import { Router, type Request, type Response, type NextFunction } from 'express';
import * as userRepo from '../repositories/userRepository';
import * as portfolioRepo from '../repositories/portfolioRepository';
import * as contentRepo from '../repositories/contentRepository';
import * as pollRepo from '../repositories/pollRepository';
import * as portfolioService from '../services/portfolioService';
import * as goalService from '../services/goalService';
import * as morningSentinelService from '../services/morningSentinelService';
import * as memoryService from '../services/memoryService';
import { runFeedMaterializer } from '../services/discoverPipeline/feedMaterializer';
import { getDiscoverPipelineHealth, triggerEventDrivenRefresh } from '../services/discoverPipeline/index';
import { recordInteraction, recordDiscoverVisit } from '../repositories/contentRepository';

import * as agentRepo from '../repositories/agentRepository';
import { orchestrateStream } from '../services/agentOrchestrator';
import { getProviderRegistry } from '../providers/registry';
import { getProviderHealthStatus } from '../providers/helpers';
import { getCacheStats } from '../providers/cache';
import type { ChatMessageRequest, PollVoteRequest, LifeEventType } from '../../shared/types';
import { requireAuth } from '../middleware/auth';

const router = Router();

function getUserId(req: Request): string {
  const persona = req.user?.persona;
  if (!persona) {
    throw new Error('No persona assigned to this account');
  }
  return persona;
}

router.use(requireAuth);

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await userRepo.getAllDemoUsers();
  res.json(users);
}));

router.get('/me', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const user = (await userRepo.findUserById(userId)) ?? (await userRepo.getDefaultUser());
  const tenantId = await agentRepo.getUserTenantId(userId);
  const tenantConfig = tenantId
    ? await agentRepo.getTenantConfig(tenantId)
    : await agentRepo.getDefaultTenantConfig();
  const verboseModeAvailable = tenantConfig?.feature_flags?.verbose_mode === true;
  res.json({ ...user, capabilities: { verbose_mode: verboseModeAvailable } });
}));

router.get('/home/summary', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const summary = await portfolioService.getHomeSummary(userId);
  res.json(summary);
}));

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

router.get('/wealth/overview', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const overview = await portfolioService.getWealthOverview(userId);
  res.json(overview);
}));

router.get('/wealth/allocation', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const allocations = await portfolioRepo.getAllocationsByUserId(userId);
  res.json(allocations);
}));

router.get('/wealth/holdings', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const holdings = await portfolioRepo.getHoldingsByUserId(userId);
  res.json(holdings);
}));

router.get('/wealth/goals', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const goals = await portfolioRepo.getGoalsByUserId(userId);
  res.json(goals);
}));

router.get('/wealth/goals/health-score', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const goals = await portfolioRepo.getGoalsByUserId(userId);
  const score = goalService.calculateGoalHealthScore(goals);
  res.json(score);
}));

router.get('/wealth/goals/life-gaps', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const goals = await portfolioRepo.getGoalsByUserId(userId);
  const prompts = await goalService.generateLifeGapPrompts(userId, goals);
  res.json(prompts);
}));

router.post('/wealth/goals/life-gaps/dismiss', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { promptKey } = req.body as { promptKey: string };
  if (!promptKey) {
    res.status(400).json({ error: 'promptKey is required' });
    return;
  }
  await goalService.dismissPrompt(userId, promptKey);
  res.json({ success: true });
}));

router.post('/wealth/goals/life-event', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { eventType } = req.body as { eventType: LifeEventType };
  if (!eventType) {
    res.status(400).json({ error: 'eventType is required' });
    return;
  }
  const goals = await portfolioRepo.getGoalsByUserId(userId);
  const suggestions = await goalService.generateLifeEventSuggestions(eventType, goals);
  res.json(suggestions);
}));

router.post('/wealth/goals', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
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
  const goal = await goalService.createGoalFromSuggestion(userId, {
    title,
    targetAmount,
    deadline,
    iconName: iconName || 'Target',
    color: color || '#a87174',
  });
  res.status(201).json(goal);
  triggerEventDrivenRefresh(userId).catch(err => {
    console.error(`[EventRefresh] Failed: ${(err as Error).message}`);
  });
}));

router.get('/wealth/accounts', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const accounts = await portfolioRepo.getAccountsByUserId(userId);
  res.json(accounts);
}));

router.post('/wealth/accounts', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { institutionName, accountType } = req.body as { institutionName: string; accountType: string };
  if (!institutionName || !accountType) {
    res.status(400).json({ error: 'institutionName and accountType are required' });
    return;
  }
  const account = await portfolioRepo.createAccount(userId, institutionName, accountType);
  res.status(201).json(account);
  triggerEventDrivenRefresh(userId).catch(err => {
    console.error(`[EventRefresh] Failed: ${(err as Error).message}`);
  });
}));

router.get('/notifications', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const alerts = await contentRepo.getAlertsByUserId(userId);
  res.json(alerts);
}));

router.get('/chat/threads', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const threads = await contentRepo.getChatThreadsByUserId(userId);
  res.json(threads);
}));

router.post('/chat/message', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }
  const result = await processMessageSync(userId, body);
  res.json(result);
}));

router.post('/chat/stream', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
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

  let seqId = 0;
  let closed = false;
  res.on('close', () => { closed = true; });

  const keepaliveInterval = setInterval(() => {
    if (!closed) {
      res.write(':keepalive\n\n');
    }
  }, 10_000);

  try {
    const stream = orchestrateStream(userId, body);

    for await (const event of stream) {
      if (closed) break;
      seqId++;
      res.write(`id: ${seqId}\ndata: ${JSON.stringify(event)}\n\n`);
      if (event.type === 'thinking' || event.type === 'meta') {
        const flushable = res as unknown as { flush?: () => void };
        if (typeof flushable.flush === 'function') flushable.flush();
      }
    }
  } catch (err) {
    console.error('[ChatStream] Error during streaming:', (err as Error).message);
    seqId++;
    res.write(`id: ${seqId}\ndata: ${JSON.stringify({ type: 'error', content: 'An unexpected error occurred. Please try again.' })}\n\n`);
    seqId++;
    res.write(`id: ${seqId}\ndata: ${JSON.stringify({ type: 'done' })}\n\n`);
  } finally {
    clearInterval(keepaliveInterval);
  }

  res.end();
}));

router.get('/portfolio', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const overview = await portfolioService.getWealthOverview(userId);
  res.json(overview);
}));

router.get('/holdings', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const holdings = await portfolioRepo.getHoldingsByUserId(userId);
  res.json(holdings);
}));

router.get('/allocations', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const allocations = await portfolioRepo.getAllocationsByUserId(userId);
  res.json(allocations);
}));

router.get('/goals', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const goals = await portfolioRepo.getGoalsByUserId(userId);
  res.json(goals);
}));

router.get('/accounts', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const accounts = await portfolioRepo.getAccountsByUserId(userId);
  res.json(accounts);
}));

router.get('/collective/peers', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const peers = await contentRepo.getPeerComparisons(userId);
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
  const cursor = req.query.cursor as string | undefined;
  const rawLimit = parseInt(req.query.limit as string, 10);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 20)) : undefined;
  const userId = getUserId(req);
  const usePagination = cursor !== undefined || limit !== undefined;
  const items = await contentRepo.getDiscoverContent(tab, cursor, limit, userId);
  if (usePagination) {
    const offset = cursor ? parseInt(cursor, 10) : 0;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;
    const nextCursor = items.length > 0 ? String(safeOffset + items.length) : undefined;
    res.json({ items, nextCursor });
  } else {
    res.json(items);
  }
}));

router.post('/content/discover/refresh', asyncHandler(async (_req, res) => {
  const materialized = await runFeedMaterializer();
  res.json({ ok: true, materialized });
}));

router.post('/discover/refresh', asyncHandler(async (_req, res) => {
  const materialized = await runFeedMaterializer();
  res.json({ ok: true, materialized });
}));

router.post('/discover/interact', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { cardId, action, metadata } = req.body as {
    cardId: string;
    action: string;
    metadata?: Record<string, unknown>;
  };
  if (!cardId || !action) {
    res.status(400).json({ error: 'cardId and action are required' });
    return;
  }
  const validActions = ['impression', 'view', 'click', 'cta_tap', 'expand', 'dismiss', 'feedback', 'share'];
  if (!validActions.includes(action)) {
    res.status(400).json({ error: `action must be one of: ${validActions.join(', ')}` });
    return;
  }
  res.status(202).json({ ok: true });
  recordInteraction(userId, cardId, action, metadata || {}).catch(err => {
    console.error(`[Interact] Failed to record interaction: ${(err as Error).message}`);
  });
}));

router.get('/discover/health', asyncHandler(async (_req, res) => {
  const health = await getDiscoverPipelineHealth();
  res.json({ ...health, timestamp: new Date().toISOString() });
}));

router.post('/discover/visit', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  res.status(202).json({ ok: true });
  recordDiscoverVisit(userId).catch(err => {
    console.error(`[Visit] Failed to record visit: ${(err as Error).message}`);
  });
}));

router.get('/polls', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const polls = await pollRepo.getActivePolls(userId);
  res.json(polls);
}));

router.post('/polls/:pollId/vote', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const pollId = req.params.pollId as string;
  const body = req.body as PollVoteRequest;
  if (!body.optionId) {
    res.status(400).json({ error: 'optionId is required' });
    return;
  }
  try {
    const poll = await pollRepo.vote(pollId, userId, body.optionId);
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
  const userId = getUserId(req);
  const threadId = req.params.threadId as string;
  const messages = await contentRepo.getChatMessagesByThreadId(threadId, userId);
  res.json(messages);
}));

router.post('/chat/:threadId/messages', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const threadId = req.params.threadId as string;
  const body = req.body as ChatMessageRequest;
  if (!body.message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const result = await processMessageSync(userId, {
    ...body,
    threadId,
  });

  res.json(result);
}));

router.post('/chat/:threadId/close', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const threadId = req.params.threadId as string;
  await finalizeSession(userId, threadId);
  res.json({ success: true });
}));

router.get('/providers/status', asyncHandler(async (_req, res) => {
  const providerNames = ['finnhub', 'yahoo_finance', 'fred', 'sec_edgar', 'openfigi', 'frankfurter', 'cbuae'];

  const domains = {
    market: {
      primary: process.env.MARKET_PROVIDER_PRIMARY ?? 'mock',
      secondary: process.env.MARKET_PROVIDER_SECONDARY ?? undefined,
      fallback: 'mock',
    },
    news: {
      primary: process.env.NEWS_PROVIDER_PRIMARY ?? 'mock',
      secondary: process.env.NEWS_PROVIDER_SECONDARY ?? undefined,
      fallback: 'mock',
    },
    macro: {
      primary: process.env.MACRO_PROVIDER_PRIMARY ?? 'mock',
      fallback: 'mock',
    },
    fx: {
      primary: process.env.FX_PROVIDER_PRIMARY ?? 'mock',
      secondary: process.env.FX_PROVIDER_SECONDARY ?? undefined,
      fallback: 'mock',
    },
    filing: {
      primary: process.env.FILING_PROVIDER_PRIMARY ?? 'mock',
      fallback: 'mock',
    },
    identity: {
      primary: process.env.IDENTITY_PROVIDER_PRIMARY ?? 'mock',
      fallback: 'mock',
    },
  };

  const providers: Record<string, unknown> = {};
  for (const name of providerNames) {
    providers[name] = getProviderHealthStatus(name);
  }

  const cache = getCacheStats();

  res.json({
    domains,
    providers,
    cache,
    timestamp: new Date().toISOString(),
  });
}));

async function processMessageSync(
  userId: string,
  req: ChatMessageRequest,
): Promise<{ threadId: string; message: { id: string; threadId: string; sender: 'assistant'; message: string; timestamp: string; widgets?: { type: string }[]; simulator?: { type: string; initialValues?: Record<string, number> } }; suggestedQuestions: string[] }> {
  const threadId = req.threadId ?? `thread-${Date.now()}`;

  let fullResponse = '';
  let suggestedQuestions: string[] = [];
  const widgets: { type: string }[] = [];
  let simulator: { type: string; initialValues?: Record<string, number> } | undefined;

  for await (const event of orchestrateStream(userId, { ...req, threadId })) {
    if (event.type === 'text' && event.content) {
      fullResponse += event.content;
    } else if (event.type === 'suggested_questions' && event.suggestedQuestions) {
      suggestedQuestions = event.suggestedQuestions;
    } else if (event.type === 'widget' && event.widget) {
      widgets.push(event.widget as { type: string });
    } else if (event.type === 'simulator' && event.simulator) {
      simulator = event.simulator;
    }
  }

  return {
    threadId,
    message: {
      id: `msg-${Date.now()}`,
      threadId,
      sender: 'assistant',
      message: fullResponse || "I'm here to help with your portfolio. What would you like to know?",
      timestamp: new Date().toISOString(),
      ...(widgets.length > 0 ? { widgets } : {}),
      ...(simulator ? { simulator } : {}),
    },
    suggestedQuestions,
  };
}

async function finalizeSession(userId: string, threadId: string): Promise<void> {
  const workingMem = await memoryService.getWorkingMemory(threadId);

  if (workingMem.length >= 2) {
    try {
      const episodic = await memoryService.generateEpisodicSummary(workingMem);
      await memoryService.saveEpisodicMemory(
        userId, threadId, episodic.summary, episodic.topics,
        episodic.preferences, episodic.watchedEntities, episodic.unresolvedTopics,
      );
    } catch {
      // episodic save is best-effort
    }
  }

  await memoryService.clearWorkingMemory(threadId);

  await memoryService.logAudit({
    userId,
    threadId,
    action: 'session_closed',
  });
}

export default router;
