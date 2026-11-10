/*
 * Sentry - Node.js server bootstrap.
 *
 * Used by API routes + server components running in the Node runtime.
 *
 * Privacy: on @sentry/nextjs 10.x the server SDK captures incoming request
 * bodies by default (httpIntegration maxIncomingRequestBodySize "medium",
 * up to 10 KB) and attaches body, cookies, headers and query string to
 * every event (requestDataIntegration). Practice chats are never stored, so
 * a learner's prompt must not reach Sentry either. The options below stop
 * the body being read at all, and app/lib/sentryScrub.ts removes anything
 * request-shaped that is left before an event leaves the server.
 */

import * as Sentry from "@sentry/nextjs";
import { SENTRY_DSN as dsn } from "./sentry.dsn";
import { scrubSentryEvent } from "./app/lib/sentryScrub";

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment:
      process.env.VERCEL_ENV ??
      process.env.NODE_ENV ??
      "development",
    // No IP addresses, and no AI prompt or response text on spans.
    sendDefaultPii: false,
    integrations: [
      // Replaces the SDK's default Http integration by name. Keep
      // disableIncomingRequestSpans: true, which @sentry/nextjs sets on its
      // own default because Next.js already traces incoming requests.
      Sentry.httpIntegration({
        disableIncomingRequestSpans: true,
        maxIncomingRequestBodySize: "none",
      }),
      Sentry.requestDataIntegration({
        include: {
          data: false,
          cookies: false,
          ip: false,
        },
      }),
      // Explicit, rather than leaning on the sendDefaultPii fallback.
      Sentry.anthropicAIIntegration({
        recordInputs: false,
        recordOutputs: false,
      }),
    ],
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: scrubSentryEvent,
  });
}
