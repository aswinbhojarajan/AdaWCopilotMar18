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

  initEnhancedMeasurement();
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

function stripUrlPii(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function initEnhancedMeasurement(): void {
  trackScrollDepth();
  trackOutboundClicks();
  trackEngagementTime();
}

let scrollFired = new Set<number>();

export function resetScrollDepth(): void {
  scrollFired = new Set<number>();
}

function trackScrollDepth(): void {
  const thresholds = [25, 50, 75, 90];

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target || typeof target.scrollTop !== 'number') return;
    const scrollable = target.scrollHeight - target.clientHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((target.scrollTop / scrollable) * 100);
    for (const t of thresholds) {
      if (pct >= t && !scrollFired.has(t)) {
        scrollFired.add(t);
        gtagEvent('scroll', { percent_scrolled: t });
      }
    }
  };

  document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
}

function trackOutboundClicks(): void {
  document.addEventListener('click', (e) => {
    const anchor = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    try {
      const url = new URL(anchor.href, window.location.origin);
      if (url.hostname !== window.location.hostname) {
        gtagEvent('outbound_click', {
          link_url: stripUrlPii(url.href),
          link_domain: url.hostname,
          outbound: true,
        });
      }
    } catch {
      // malformed URL — skip
    }
  }, { capture: true });
}

function trackEngagementTime(): void {
  let engagedMs = 0;
  let lastTick = Date.now();
  let visible = !document.hidden;

  const tick = () => {
    if (visible) {
      engagedMs += Date.now() - lastTick;
    }
    lastTick = Date.now();
  };

  setInterval(tick, 1000);

  const flush = () => {
    tick();
    if (engagedMs > 0) {
      gtagEvent('engagement_time', {
        engagement_time_msec: engagedMs,
      });
      engagedMs = 0;
    }
  };

  document.addEventListener('visibilitychange', () => {
    tick();
    if (document.hidden) {
      flush();
    }
    visible = !document.hidden;
    lastTick = Date.now();
  });

  window.addEventListener('beforeunload', flush);
}
