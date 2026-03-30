import { useCallback } from 'react';
import { usePostHog } from '@posthog/react';
import { sanitizeProperties } from './privacy';
import { dispatchEvent, dispatchIdentify, dispatchReset, dispatchScreenView } from './dispatcher';
import type { EventName, UseAnalytics } from './types';

let currentScreen = 'unknown';
let sessionId = crypto.randomUUID();

export function useAnalytics(): UseAnalytics {
  const posthog = usePostHog();

  const track = useCallback(
    (event: EventName, properties?: Record<string, unknown>) => {
      const enriched = {
        ...sanitizeProperties(properties ?? {}),
        ada_session_id: sessionId,
        ada_screen: currentScreen,
        ada_client_timestamp: new Date().toISOString(),
        ada_app_version: import.meta.env.VITE_APP_VERSION ?? 'dev',
        ada_environment: import.meta.env.DEV ? 'development' : 'demo',
      };

      dispatchEvent(event, enriched, posthog);

      if (import.meta.env.DEV) console.debug(`[Ada] ${event}`, enriched);
    },
    [posthog],
  );

  const identify = useCallback(
    (distinctId: string, traits?: Record<string, unknown>) => {
      dispatchIdentify(distinctId, traits ?? {}, posthog);
    },
    [posthog],
  );

  const reset = useCallback(() => {
    dispatchReset(posthog);
    sessionId = crypto.randomUUID();
  }, [posthog]);

  const setScreen = useCallback((name: string) => {
    currentScreen = name;
    dispatchScreenView(name);
  }, []);

  const getSessionId = useCallback(() => sessionId, []);

  return { track, identify, reset, setScreen, getSessionId };
}
