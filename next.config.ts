import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Wrap with Sentry - applies build-time source-map upload + runtime
// instrumentation. Source maps only upload when SENTRY_AUTH_TOKEN is
// set; without it the wrapper is effectively a no-op (the runtime
// Sentry init still happens via instrumentation.ts).
export default withSentryConfig(nextConfig, {
  // Sentry-side org/project - set when you create a Sentry project.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Don't upload source maps if no auth token is set - keeps local
  // dev + first-time builds working without Sentry being configured.
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // Source-map upload + scrub from public assets (so stack traces are
  // readable in Sentry but obscured on the deployed site).
  widenClientFileUpload: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  disableLogger: true,
});
