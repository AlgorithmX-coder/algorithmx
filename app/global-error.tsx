"use client"; // Error boundaries must be Client Components

import CrashScreen from "@/app/components/crash/CrashScreen";

/**
 * app/global-error.tsx: the last line, for an error in the root layout
 * itself. It replaces the root layout, so it renders its own <html> and
 * <body> and relies on nothing else in the app: the crash screen's
 * "global" variant uses system fonts and leaves out the cube and the
 * pools. Reload does a full page load, since a broken root layout is not
 * something a re-render can be trusted to fix. Reported to Sentry like
 * app/error.tsx.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en-GB">
      <body style={{ margin: 0 }}>
        <title>AlgorithmX couldn&apos;t load</title>
        <CrashScreen error={error} onRetry={() => window.location.reload()} variant="global" />
      </body>
    </html>
  );
}
