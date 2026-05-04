/*
 * Sentry — Edge runtime bootstrap.
 *
 * Used for API routes / middleware running on Vercel's Edge Runtime.
 * We currently don't use Edge runtime anywhere in the app, but having
 * this here keeps the SDK happy and prevents warnings.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment:
      process.env.VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development",
  });
}
