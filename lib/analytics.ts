export type AnalyticsEventType =
  | "artist_page_view"
  | "request_page_view"
  | "tip_link_click"
  | "song_request_submitted";

type AnalyticsEvent = {
  artist_slug: string;
  event_type: AnalyticsEventType;
  gig_id?: number | null;
  occurrence_date?: string | null;
};

const VISITOR_ID_KEY = "ucihh-visitor-id";
const SESSION_SOURCE_KEY = "ucihh-session-source";

export function getAnalyticsVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}

function getTrafficSource() {
  const params = new URLSearchParams(window.location.search);
  const explicitSource = params.get("source") || params.get("utm_source");

  if (explicitSource) {
    const source = explicitSource.slice(0, 100);
    window.sessionStorage.setItem(SESSION_SOURCE_KEY, source);
    return source;
  }

  const savedSource = window.sessionStorage.getItem(SESSION_SOURCE_KEY);
  if (savedSource) return savedSource;

  if (!document.referrer) {
    window.sessionStorage.setItem(SESSION_SOURCE_KEY, "direct");
    return "direct";
  }

  try {
    const referrerHost = new URL(document.referrer).hostname;
    let source = "referral";

    if (referrerHost.includes("google.")) source = "google";
    if (referrerHost.includes("facebook.") || referrerHost.includes("fb.")) {
      source = "facebook";
    }
    if (referrerHost.includes("instagram.")) source = "instagram";
    if (referrerHost === window.location.hostname) source = "internal";

    window.sessionStorage.setItem(SESSION_SOURCE_KEY, source);
    return source;
  } catch {
    window.sessionStorage.setItem(SESSION_SOURCE_KEY, "referral");
    return "referral";
  }
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  const payload = {
    ...event,
    visitor_id: getAnalyticsVisitorId(),
    source: getTrafficSource(),
    page_path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || null
  };

  void fetch("/api/analytics-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {
    // Analytics must never interrupt the visitor experience.
  });
}
