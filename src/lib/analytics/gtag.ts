import { sanitizeProperties } from './privacy';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;
let measurementId = '';

export function initGA4(): void {
  if (initialized) return;

  const id = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  if (!id) {
    if (import.meta.env.DEV) {
      console.warn('[Ada Analytics] GA4 measurement ID missing — running in no-op mode');
    }
    return;
  }

  measurementId = id;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    debug_mode: import.meta.env.DEV,
  });

  initialized = true;
}

export function isGA4Initialized(): boolean {
  return initialized;
}

export function gtagEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (!initialized) return;
  const sanitized = params
    ? sanitizeProperties(params)
    : {};
  window.gtag('event', eventName, sanitized);
}

export function gtagScreenView(screenName: string): void {
  if (!initialized) return;
  window.gtag('event', 'screen_view', {
    screen_name: screenName,
  });
}

export function gtagSetUserId(userId: string | null): void {
  if (!initialized) return;
  window.gtag('config', measurementId, {
    user_id: userId,
    send_page_view: false,
  });
}
