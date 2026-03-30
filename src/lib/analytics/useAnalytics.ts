import { useCallback } from 'react';
import { getPostHog } from './posthog';
import { sanitizeProperties } from './privacy';
import type { EventName, UseAnalytics } from './types';

let currentScreen = 'unknown';
let sessionId = crypto.randomUUID();

export function useAnalytics(): UseAnalytics {
  const ph = getPostHog();

  const track = useCallback(
    (event: EventName, properties?: Record<string, unknown>) => {
      if (!ph) return;
      const enriched = {
        ...sanitizeProperties(properties ?? {}),
        ada_session_id: sessionId,
        ada_screen: currentScreen,
        ada_client_timestamp: new Date().toISOString(),
        ada_app_version: import.meta.env.VITE_APP_VERSION ?? 'dev',
        ada_environment: import.meta.env.DEV ? 'development' : 'demo',
      };

      ph.capture(event, enriched);

      if (import.meta.env.DEV) console.debug(`[Ada] ${event}`, enriched);
    },
    [ph],
  );

  const identify = useCallback(
    (distinctId: string, traits?: Record<string, unknown>) => {
      if (!ph) return;
      ph.identify(distinctId, sanitizeProperties(traits ?? {}));
    },
    [ph],
  );

  const reset = useCallback(() => {
    ph?.reset();
    sessionId = crypto.randomUUID();
  }, [ph]);

  const setScreen = useCallback((name: string) => {
    currentScreen = name;
  }, []);

  const getSessionId = useCallback(() => sessionId, []);

  return { track, identify, reset, setScreen, getSessionId };
}
