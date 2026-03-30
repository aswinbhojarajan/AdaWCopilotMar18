import { useCallback } from 'react';
import { usePostHog } from '@posthog/react';
import { isPostHogInitialized } from './posthog';
import { sanitizeProperties } from './privacy';
import type { EventName, UseAnalytics } from './types';

let currentScreen = 'unknown';
let sessionId = crypto.randomUUID();

export function useAnalytics(): UseAnalytics {
  const posthog = usePostHog();
  const active = isPostHogInitialized();

  const track = useCallback(
    (event: EventName, properties?: Record<string, unknown>) => {
      if (!active || !posthog) return;
      const enriched = {
        ...sanitizeProperties(properties ?? {}),
        ada_session_id: sessionId,
        ada_screen: currentScreen,
        ada_client_timestamp: new Date().toISOString(),
        ada_app_version: import.meta.env.VITE_APP_VERSION ?? 'dev',
        ada_environment: import.meta.env.DEV ? 'development' : 'demo',
      };

      posthog.capture(event, enriched);

      if (import.meta.env.DEV) console.debug(`[Ada] ${event}`, enriched);
    },
    [active, posthog],
  );

  const identify = useCallback(
    (distinctId: string, traits?: Record<string, unknown>) => {
      if (!active || !posthog) return;
      posthog.identify(distinctId, sanitizeProperties(traits ?? {}));
    },
    [active, posthog],
  );

  const reset = useCallback(() => {
    if (active) posthog?.reset();
    sessionId = crypto.randomUUID();
  }, [active, posthog]);

  const setScreen = useCallback((name: string) => {
    currentScreen = name;
  }, []);

  const getSessionId = useCallback(() => sessionId, []);

  return { track, identify, reset, setScreen, getSessionId };
}
