/*
 * Sentry - Node.js server bootstrap.
 *
 * Used by API routes + server components running in the Node runtime.
 */

import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN as dsn } from "./sentry.dsn";

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
