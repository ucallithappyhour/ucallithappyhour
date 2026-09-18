export type AnalyticsEventType =
  | "artist_page_view"
  | "request_page_view"
  | "tip_link_click";

type AnalyticsEvent = {
  artist_slug: string;
  event_type: AnalyticsEventType;
  gig_id?: number | null;
  occurrence_date?: string | null;
};

const VISITOR_ID_KEY = "ucihh-visitor-id";

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

  if (explicitSource) return explicitSource.slice(0, 100);
  if (!document.referrer) return "direct";

  try {
    const referrerHost = new URL(document.referrer).hostname;

    if (referrerHost.includes("google.")) return "google";
    if (referrerHost.includes("facebook.") || referrerHost.includes("fb.")) {
      return "facebook";
    }
    if (referrerHost.includes("instagram.")) return "instagram";
    if (referrerHost === window.location.hostname) return "internal";

    return "referral";
  } catch {
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
