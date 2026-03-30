export const AnalyticsEvents = {
  LOGIN_VIEWED: 'login_viewed',
  LOGIN_SUBMITTED: 'login_submitted',
  LOGIN_SUCCEEDED: 'login_succeeded',
  LOGIN_FAILED: 'login_failed',

  TAB_VIEW: 'tab_view',
  TAB_SWITCH: 'tab_switch',
  APP_FOREGROUND: 'app_foreground',
  APP_BACKGROUND: 'app_background',

  CHAT_OPENED: 'chat_opened',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_STREAM_STARTED: 'chat_stream_started',
  CHAT_STREAM_COMPLETED: 'chat_stream_completed',
  CHAT_STREAM_INTERRUPTED: 'chat_stream_interrupted',
  CHAT_ERROR: 'chat_error',

  PORTFOLIO_VIEW: 'portfolio_view',

  DISCOVER_CARD_TAP: 'discover_card_tap',
  DISCOVER_CARD_DISMISS: 'discover_card_dismiss',

  MORNING_SENTINEL_EXPANDED: 'morning_sentinel_expanded',
} as const;
