import posthog from 'posthog-js';
import { PII_PATTERNS, PII_KEYS } from './privacy';

let initialized = false;

export function initPostHog(): void {
  if (initialized) return;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;
  if (!key || !host) {
    if (import.meta.env.DEV) {
      console.warn('[Ada Analytics] PostHog credentials missing — running in no-op mode');
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    defaults: '2026-01-30',

    capture_pageview: false,
    capture_pageleave: true,

    autocapture: {
      dom_event_allowlist: ['click'],
      element_allowlist: ['button', 'a'],
      css_selector_allowlist: ['[data-ph-capture]'],
    },

    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
      recordCrossOriginIframes: false,
      collectFonts: false,
    },
    enable_recording_console_log: false,

    persistence: 'localStorage+cookie',
    cross_subdomain_cookie: false,
    secure_cookie: location.protocol === 'https:',
    property_denylist: [],

    before_send: (event) => {
      if (!event || !event.properties) return event;

      for (const key of PII_KEYS) {
        delete event.properties[key];
      }

      for (const prop of ['$current_url', '$pathname', '$referrer', '$referring_domain']) {
        if (typeof event.properties[prop] === 'string') {
          event.properties[prop] = event.properties[prop]
            .replace(PII_PATTERNS.UUID, '[id]')
            .replace(PII_PATTERNS.ACCOUNT_NUMBER, '[acct]');
        }
      }

      return event;
    },

    request_batching: true,
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug();
    },
  });

  initialized = true;
}

export function isPostHogInitialized(): boolean {
  return initialized;
}

export function getPostHogClient() {
  return posthog;
}
