import type { AnalyticsEvents } from './events';

export type EventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export interface UseAnalytics {
  track: (event: EventName, props?: Record<string, unknown>) => void;
  identify: (distinctId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
  setScreen: (screenName: string) => void;
  getSessionId: () => string;
}

export interface DemoPersonaIdentity {
  distinctId: string;
  traits: Record<string, string | boolean>;
}
