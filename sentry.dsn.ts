/*
 * Canonical Sentry DSN, shared by the client / server / edge bootstraps.
 *
 * DSNs are not secrets - they ship inside every client bundle by design
 * - so committing the production fallback is safe.  Env vars still take
 * precedence, which keeps per-environment overrides and local opt-out
 * possible.  Dev stays opt-in: without an env var, non-production
 * builds report nothing.
 */

// Project algorithmx-web in the algorithmx org (EU region, de.sentry.io).
const PRODUCTION_FALLBACK_DSN =
  "https://f663e1b120bd4939924fa6509903cf62@o4511722917593088.ingest.de.sentry.io/4511722935550032";

export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  process.env.SENTRY_DSN ??
  (process.env.NODE_ENV === "production" ? PRODUCTION_FALLBACK_DSN : "");
