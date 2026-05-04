/*
 * Next.js instrumentation hook.
 *
 * Runs once per server start.  Loads the appropriate Sentry config
 * for the runtime that's booting (Node vs Edge).  Required by
 * @sentry/nextjs in Next.js 15+.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  } else if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// captureRequestError is the current API — replaces the old
// onRequestError export. Forwarding it here lets Next.js auto-wire
// uncaught errors from server actions / route handlers into Sentry.
export async function onRequestError(
  err: unknown,
  request: Parameters<
    NonNullable<typeof import("next/server").NextRequest>["valueOf"]
  > extends infer _ ? unknown : unknown,
  context: unknown,
) {
  const Sentry = await import("@sentry/nextjs");
  // captureRequestError exists in @sentry/nextjs v8+; older versions
  // fall back to plain captureException.
  const fn = (Sentry as unknown as Record<string, unknown>)
    .captureRequestError as
    | ((e: unknown, r: unknown, c: unknown) => void)
    | undefined;
  if (fn) {
    fn(err, request, context);
  } else {
    Sentry.captureException(err);
  }
}
