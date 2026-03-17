import type { NotificationData, ChatThread } from '../types';

export const notifications: NotificationData[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Portfolio Risk Alert',
    message: 'Your growth stocks allocation has moved above target. Current exposure is 33%.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'insight',
    title: 'Market Opportunity',
    message: 'GCC bonds are seeing renewed investor demand with attractive yields.',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'news',
    title: 'Year-End Market Surge',
    message: 'Markets jump on an unexpected year-end surge that may impact your portfolio.',
    timestamp: '37 min ago',
    read: true,
  },
];

export const chatThreads: ChatThread[] = [
  {
    id: 'thread-1',
    title: 'Portfolio Review',
    lastMessage: 'Your portfolio is performing well, up 0.8% since yesterday.',
    timestamp: 'Today',
    messageCount: 4,
  },
  {
    id: 'thread-2',
    title: 'Tech Allocation Analysis',
    lastMessage: 'Your technology allocation currently stands at 48%.',
    timestamp: 'Yesterday',
    messageCount: 6,
  },
  {
    id: 'thread-3',
    title: 'Bond Opportunities',
    lastMessage: 'GCC Sovereign Bonds offer 4.8-5.2% yield, AAA rated.',
    timestamp: '2 days ago',
    messageCount: 3,
  },
];
