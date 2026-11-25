"use client"; // Error boundaries must be Client Components

import CrashScreen from "@/app/components/crash/CrashScreen";

/**
 * app/error.tsx: what anyone sees when a page throws while rendering,
 * inside the root layout. The bright crash screen (landing lab round 7,
 * owner-approved): Try again re-runs the broken segment, Back to home is a
 * plain link, and the error is reported to Sentry with a reference the
 * visitor can quote to support.
 *
 * `retry` re-fetches and re-renders the segment, which the Next 16 docs
 * recommend over `reset` (reset only clears the boundary's state).
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <CrashScreen error={error} onRetry={retry} variant="page" />;
}
