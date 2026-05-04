/*
 * Sentry — client-side bootstrap.
 *
 * Loaded by the @sentry/nextjs SDK in every browser bundle.  Only
 * actually initialises when SENTRY_DSN is set, so dev runs without a
 * key cost nothing and ship nothing.
 */

import * as Sentry from "@sentry/nextjs";

const dsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN ?? "";

if (dsn) {
  Sentry.init({
    dsn,
    // Lower in production to keep the free tier from getting hammered;
    // higher in dev where errors are rarer and we want the signal.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Replay can be added later via Sentry Replays — keep this slim
    // for the MVP.
    replaysOnErrorSampleRate: 0,
    replaysSessionSampleRate: 0,
    // Tag every event with the runtime environment so prod / preview
    // / dev show up separately in the Sentry dashboard.
    environment:
      process.env.VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development",
    // Keep the bundle small — no integrations beyond the defaults.
  });
}
