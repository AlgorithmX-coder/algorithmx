import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { securityHeaders, sentryCspReportUri } from "./app/lib/securityHeaders";
import { SENTRY_DSN } from "./sentry.dsn";

const nextConfig: NextConfig = {
  // Set by `next upgrade --agent=security` (16.4.1 -> 16.4.6). Records which
  // upgrade track this app opted into, so later runs know a security upgrade
  // has been adopted here.
  experimental: { agentUpgrade: "security" },

  // The Cyber Ops landing moved from /cyberstart to /ops. Keep old links
  // and bookmarks working (temporary redirect - the working name is still
  // subject to change). The internal course slug stays "cyberstart".
  async redirects() {
    return [{ source: "/cyberstart", destination: "/ops", permanent: false }];
  },

  // Security headers on every response (app/lib/securityHeaders.ts says
  // what each one does). The CSP is report-only: it blocks nothing, and
  // violations go to Sentry so it can be tightened and enforced later.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          dev: process.env.NODE_ENV !== "production",
          reportUri: sentryCspReportUri(SENTRY_DSN),
        }),
      },
    ];
  },
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
