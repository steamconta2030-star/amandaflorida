// ============================================================
// Ads & analytics configuration
// Fill in the IDs you have; each pixel activates independently.
// ============================================================
export const META_PIXEL_ID = ""; // e.g. "123456789012345"
export const GA4_MEASUREMENT_ID = ""; // e.g. "G-XXXXXXXX"
export const TIKTOK_PIXEL_ID = ""; // e.g. "CXXXXXXXXXXXXXXXXX"
export const GOOGLE_ADS_ID = ""; // e.g. "AW-1234567890"
// Map named conversions to Google Ads send_to labels (AW-ID/label)
export const GOOGLE_ADS_CONVERSIONS: Record<string, string> = {
  // booking_confirmed: "AW-1234567890/AbCdEfGhIj",
};

export const analyticsEnabled = () =>
  Boolean(META_PIXEL_ID) ||
  Boolean(GA4_MEASUREMENT_ID) ||
  Boolean(TIKTOK_PIXEL_ID) ||
  Boolean(GOOGLE_ADS_ID);

// ============================================================
// Consent (LGPD/GDPR) — Google Consent Mode v2
// ============================================================
const CONSENT_KEY = "tidly_consent_v1";
export type ConsentState = "granted" | "denied" | "unknown";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* noop */
  }
  return "unknown";
}

export function setConsent(state: "granted" | "denied") {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* noop */
  }
  const w = window as unknown as {
    gtag?: (...a: unknown[]) => void;
    fbq?: (...a: unknown[]) => void;
    ttq?: { load?: (id: string) => void; page?: () => void };
  };
  if (w.gtag) {
    w.gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }
  if (state === "granted") {
    if (META_PIXEL_ID && w.fbq) w.fbq("consent", "grant");
    if (TIKTOK_PIXEL_ID && w.ttq && !w.ttq.load) {
      // ttq already initialized when snippet loaded
    }
  } else {
    if (META_PIXEL_ID && w.fbq) w.fbq("consent", "revoke");
  }
}

// ============================================================
// Conversion tracking (all pixels + Google Ads)
// ============================================================
export function trackConversion(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
      ttq?: { track: (name: string, params?: unknown) => void };
    };
    // Meta
    if (META_PIXEL_ID && w.fbq) {
      const standard = [
        "Lead",
        "Purchase",
        "CompleteRegistration",
        "Contact",
        "Schedule",
        "AddToCart",
        "InitiateCheckout",
      ];
      if (standard.includes(name)) w.fbq("track", name, params);
      else w.fbq("trackCustom", name, params);
    }
    // GA4
    if (GA4_MEASUREMENT_ID && w.gtag) {
      w.gtag("event", name, params ?? {});
    }
    // Google Ads (mapped)
    const sendTo = GOOGLE_ADS_CONVERSIONS[name];
    if (GOOGLE_ADS_ID && sendTo && w.gtag) {
      w.gtag("event", "conversion", { send_to: sendTo, ...(params ?? {}) });
    }
    // TikTok
    if (TIKTOK_PIXEL_ID && w.ttq) {
      const map: Record<string, string> = {
        Schedule: "SubmitForm",
        Lead: "SubmitForm",
        Purchase: "CompletePayment",
        Contact: "Contact",
      };
      w.ttq.track(map[name] ?? name, params);
    }
  } catch {
    /* noop */
  }
}

// ============================================================
// UTM capture — persist first-touch attribution across the session
// ============================================================
const UTM_KEY = "tidly_utm_v1";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ttclid",
] as const;
export type UtmData = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing?: string;
  referrer?: string;
  ts?: string;
};

export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    const existing = window.sessionStorage.getItem(UTM_KEY);
    if (existing) return; // first-touch wins for the session
    const url = new URL(window.location.href);
    const data: UtmData = {};
    let found = false;
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k);
      if (v) {
        data[k] = v;
        found = true;
      }
    }
    // Save whenever there's a UTM/click id or a non-direct referrer
    if (found || document.referrer) {
      data.landing = url.pathname + url.search;
      data.referrer = document.referrer || undefined;
      data.ts = new Date().toISOString();
      window.sessionStorage.setItem(UTM_KEY, JSON.stringify(data));
    }
  } catch {
    /* noop */
  }
}

export function getUtm(): UtmData | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(UTM_KEY);
    return v ? (JSON.parse(v) as UtmData) : null;
  } catch {
    return null;
  }
}

// ============================================================
// Pixel snippets (injected via <script> tags in __root.tsx)
// ============================================================
export const consentDefaultSnippet = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
(function(){
  var s='denied';
  try{var v=localStorage.getItem('tidly_consent_v1'); if(v==='granted') s='granted';}catch(e){}
  gtag('consent','default',{ad_storage:s,ad_user_data:s,ad_personalization:s,analytics_storage:s,wait_for_update:500});
  gtag('js', new Date());
})();
`;

export const metaPixelSnippet = (id: string) => `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
try{var c=localStorage.getItem('tidly_consent_v1');if(c!=='granted')fbq('consent','revoke');}catch(e){}
fbq('init','${id}');fbq('track','PageView');
`;

export const ga4Snippet = (id: string, adsId: string) => `
gtag('config','${id}',{send_page_view:true});
${adsId ? `gtag('config','${adsId}');` : ""}
`;

export const tiktokPixelSnippet = (id: string) => `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${id}');
  ttq.page();
}(window, document, 'ttq');
`;

// ============================================================
// Web Vitals → GA4 (LCP / CLS / INP / FCP / TTFB)
// ============================================================
export async function reportWebVitals() {
  if (typeof window === "undefined") return;
  if (!GA4_MEASUREMENT_ID) return;
  try {
    const { onCLS, onLCP, onINP, onFCP, onTTFB } = await import("web-vitals");
    const send = (metric: { name: string; value: number; id: string; rating: string }) => {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void };
      if (w.gtag) {
        w.gtag("event", metric.name, {
          value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_rating: metric.rating,
          non_interaction: true,
        });
      }
    };
    onCLS(send);
    onLCP(send);
    onINP(send);
    onFCP(send);
    onTTFB(send);
  } catch {
    /* noop */
  }
}
