import { isPostHogInitialized } from './posthog';
import { isGA4Initialized, gtagEvent, gtagSetUserId, gtagScreenView, resetScrollDepth } from './gtag';
import { sanitizeProperties } from './privacy';
import type { PostHog } from 'posthog-js';

export function dispatchEvent(
  eventName: string,
  enrichedProps: Record<string, unknown>,
  posthog: PostHog | undefined,
): void {
  if (isPostHogInitialized() && posthog) {
    posthog.capture(eventName, enrichedProps);
  }

  if (isGA4Initialized()) {
    const ga4Props = toGA4Params(enrichedProps);
    gtagEvent(eventName, ga4Props);
  }
}

export function dispatchIdentify(
  distinctId: string,
  traits: Record<string, unknown>,
  posthog: PostHog | undefined,
): void {
  if (isPostHogInitialized() && posthog) {
    posthog.identify(distinctId, sanitizeProperties(traits));
  }

  if (isGA4Initialized()) {
    gtagSetUserId(distinctId);
    if (Object.keys(traits).length > 0) {
      const sanitizedTraits = sanitizeProperties(traits);
      window.gtag('set', 'user_properties', sanitizedTraits);
    }
  }
}

export function dispatchReset(posthog: PostHog | undefined): void {
  if (isPostHogInitialized()) {
    posthog?.reset();
  }

  if (isGA4Initialized()) {
    gtagSetUserId(null);
  }
}

export function dispatchPageview(
  props: Record<string, unknown>,
  posthog: PostHog | undefined,
): void {
  if (isPostHogInitialized() && posthog) {
    posthog.capture('$pageview', props);
  }

  if (isGA4Initialized()) {
    resetScrollDepth();
    const screenName = (props.screen_name as string) ?? 'unknown';
    gtagScreenView(screenName);
  }
}

export function dispatchScreenView(screenName: string): void {
  if (isGA4Initialized()) {
    resetScrollDepth();
    gtagScreenView(screenName);
  }
}

function toGA4Params(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const ga4: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      ga4[key] = JSON.stringify(value);
    } else {
      ga4[key] = value;
    }
  }
  return ga4;
}
