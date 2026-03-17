import type { NotificationItem, ChatHistoryThread } from '../types';

export const notificationsData: NotificationItem[] = [
  {
    id: '1',
    type: 'PORTFOLIO_ALERT',
    title: 'Stock allocation reached 55% of portfolio',
    message:
      "Your equity holdings now represent 55% of your portfolio, above your peers' average of 45%. This positions you for growth while accepting higher near-term volatility.",
    timestamp: '12 min ago',
    unread: true,
    category: 'alerts',
  },
  {
    id: '3',
    type: 'ADVISOR_MESSAGE',
    title: 'Message from your advisor',
    message:
      "Hi Abdullah, I've reviewed your Q4 performance. Let's schedule a call to discuss rebalancing strategies for the new year. \u2014Khalid",
    timestamp: '2 hours ago',
    unread: true,
    category: 'updates',
  },
  {
    id: '4',
    type: 'MARKET_UPDATE',
    title: 'Federal Reserve signals pause on rate cuts',
    message:
      'The Fed maintained its cautious stance, keeping rates unchanged through Q2 2026. This may impact your 15% bond allocation and 20% cash position.',
    timestamp: '6 hours ago',
    unread: false,
    category: 'updates',
  },
  {
    id: '5',
    type: 'DOCUMENT',
    title: 'Q4 2025 Portfolio Report ready',
    message:
      'Your quarterly performance report is now available. Portfolio value: $94,830.19, up 2.1% this week. Review your returns, asset allocation, and personalized recommendations.',
    timestamp: '8 hours ago',
    unread: false,
    category: 'updates',
  },
  {
    id: '6',
    type: 'OPPORTUNITY',
    title: 'Emerging market bonds offer 6.8% yields',
    message:
      'High-quality sovereign debt in stable economies now offers attractive income. Your current 15% bond allocation could benefit from diversification into higher-yielding instruments.',
    timestamp: 'Yesterday',
    unread: false,
    category: 'opportunities',
  },
  {
    id: '7',
    type: 'PORTFOLIO_ALERT',
    title: 'Portfolio up $758 today on equity gains',
    message:
      'Your portfolio gained $758.64 (+0.8%) today, driven primarily by your 55% stock allocation. Year-to-date performance continues to track above peer benchmarks.',
    timestamp: 'Yesterday',
    unread: false,
    category: 'alerts',
  },
  {
    id: '8',
    type: 'EVENT',
    title: 'Reminder: Estate planning consultation',
    message:
      'Your scheduled consultation with our estate planning specialist is tomorrow at 2:00 PM. Meeting link sent to your email.',
    timestamp: '2 days ago',
    unread: false,
    category: 'updates',
  },
];

export const chatHistoryThreads: ChatHistoryThread[] = [
  {
    id: '1',
    title: 'Portfolio rebalancing and asset allocation',
    preview: 'If you want, I can estimate the new risk/return profile for you.',
    timestamp: '52m',
  },
  {
    id: '2',
    title: 'Portfolio concentration and risk management',
    preview:
      'Your tech exposure is 48%, compared to your target range of 30\u201340%. Would you...',
    timestamp: '2d',
  },
  {
    id: '3',
    title: 'Portfolio diversification and hedging against macroeconomic risks',
    preview: 'Silver jumps above $32/oz amid global debt concerns. With 0% commodity exposure...',
    timestamp: '3d',
  },
];
