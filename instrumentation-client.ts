/*
 * Sentry - client-side bootstrap.
 *
 * Next.js 15.3+/Turbopack loads this root-level file in every browser
 * bundle (the old sentry.client.config.ts convention is webpack-only
 * and silently ignored by Turbopack builds).  Production builds always
 * initialise (see sentry.dsn.ts for the fallback); dev only initialises
 * when a DSN env var is set, so dev runs without a key cost nothing
 * and ship nothing.
 */

import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN as dsn } from "./sentry.dsn";

if (dsn) {
  Sentry.init({
    dsn,
    // Lower in production to keep the free tier from getting hammered;
    // higher in dev where errors are rarer and we want the signal.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Replay can be added later via Sentry Replays - keep this slim
    // for the MVP.
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    // Tag every event with the runtime environment so prod / preview
    // / dev show up separately in the Sentry dashboard.
    environment:
      process.env.VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development",
    // Keep the bundle small - no integrations beyond the defaults.
  });
}

// Lets the SDK record app-router navigations as spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
