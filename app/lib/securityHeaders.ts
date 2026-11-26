/* The security headers every response carries, read by next.config.ts.
 * Kept here, with no imports, so they can be unit tested.
 *
 * The Content-Security-Policy ships REPORT-ONLY: browsers log (and send to
 * Sentry) anything it would have blocked, but block nothing. Once the
 * reports are quiet it can be switched to enforcing by renaming the header.
 *
 * What the app loads, and why each source is here:
 * - Next.js inline bootstrap scripts and styled-jsx / inline styles:
 *   'unsafe-inline' (no nonces yet).
 * - Vercel Analytics: same origin (/_vercel/insights), plus its dev script
 *   host.
 * - Plausible: plausible.io script and events.
 * - Sentry: browser events to the EU ingest host.
 * - Google Fonts: a handful of Cyber Explorers screens @import them at
 *   runtime (next/font is self-hosted and needs nothing).
 * - dotLottie fetches its WASM player from jsDelivr or unpkg, and drei's
 *   Text resolves glyphs from jsDelivr; WASM needs 'wasm-unsafe-eval'.
 * - Canvas, audio and generated media: data: and blob:.
 * - Stripe Checkout is a redirect only, so it appears in form-action and
 *   nowhere else. */

export interface CspOptions {
  dev?: boolean;
  /** Where browsers send violation reports, if anywhere. */
  reportUri?: string | null;
}

export function contentSecurityPolicy({ dev = false, reportUri = null }: CspOptions = {}): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'", ...(dev ? ["'unsafe-eval'"] : []), "https://plausible.io", "https://va.vercel-scripts.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:"],
    "media-src": ["'self'", "data:", "blob:"],
    "connect-src": [
      "'self'",
      "https://plausible.io",
      "https://*.ingest.de.sentry.io",
      "https://*.ingest.sentry.io",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://va.vercel-scripts.com",
      ...(dev ? ["ws:", "wss:"] : []),
    ],
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["'self'", "blob:", "data:"],
    "frame-ancestors": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://checkout.stripe.com"],
  };
  if (reportUri) directives["report-uri"] = [reportUri];
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
}

/** Sentry's CSP report endpoint for a DSN, or null if the DSN is not one. */
export function sentryCspReportUri(dsn: string | null | undefined): string | null {
  if (!dsn) return null;
  try {
    const u = new URL(dsn);
    const projectId = u.pathname.replace(/^\/+|\/+$/g, "");
    if (!u.username || !projectId) return null;
    return `${u.protocol}//${u.host}/api/${projectId}/security/?sentry_key=${u.username}`;
  } catch {
    return null;
  }
}

/* Browser features no page uses are switched off. Fullscreen is used by the
 * fullscreen setting and the teacher pack, and the clipboard by every
 * "copy link" button, so those stay allowed for this origin. Nothing asks
 * for the camera, microphone or location. */
export const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "browsing-topics=()",
  "fullscreen=(self)",
  "clipboard-write=(self)",
].join(", ");

export function securityHeaders(opts: CspOptions = {}): { key: string; value: string }[] {
  return [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy(opts) },
  ];
}
