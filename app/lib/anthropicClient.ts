import Anthropic from "@anthropic-ai/sdk";

/* One place that reads ANTHROPIC_API_KEY, checks it is a bare key, builds
 * the client, and scrubs any error before it reaches a log. A pasted
 * value that is more than the key (the Console's cURL example, a
 * trailing line) must fail loudly and never be echoed. Server only. */

export type KeyStatus = "ok" | "missing" | "malformed";

const KEY_SHAPE = /^sk-ant-[A-Za-z0-9_-]{20,}$/;

export function apiKeyStatus(): KeyStatus {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw || !raw.trim()) return "missing";
  return KEY_SHAPE.test(raw.trim()) ? "ok" : "malformed";
}

export const KEY_STATUS_MESSAGE: Record<KeyStatus, string> = {
  ok: "",
  missing: "ANTHROPIC_API_KEY is not set on this deployment.",
  malformed: "ANTHROPIC_API_KEY holds more than a key. Paste only the value that starts sk-ant-, on one line, and redeploy.",
};

/* One client per setting. No automatic retry: every caller has its own
 * fallback (the rules-only grade, the scripted reply), so an overloaded or
 * slow API hands over inside the timeout instead of after a retry on top.
 * Seen on production 2026-10-06: a retry plus two timeouts kept a learner
 * waiting about two minutes before the scripted reply appeared. */
const clients = new Map<string, Anthropic>();
export function anthropicClient(opts: { timeout: number; maxRetries?: number }): Anthropic | null {
  if (apiKeyStatus() !== "ok") return null;
  const maxRetries = opts.maxRetries ?? 0;
  const key = `${opts.timeout}:${maxRetries}`;
  let c = clients.get(key);
  if (!c) {
    c = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY!.trim(), maxRetries, timeout: opts.timeout });
    clients.set(key, c);
  }
  return c;
}

/* Never let a key, a header or a whole request body reach the logs. */
export function safeErrorMessage(err: unknown): string {
  const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return text
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "sk-ant-[redacted]")
    .replace(/\s+/g, " ")
    .slice(0, 200);
}
