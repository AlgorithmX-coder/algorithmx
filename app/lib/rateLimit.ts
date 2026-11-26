import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { PUPIL_TOO_MANY, TOO_MANY } from "@/app/lib/rateLimitWords";

/* A small Postgres-backed rate limiter.
 *
 * Fixed windows: every key counts up inside a window of `windowSec`
 * seconds that starts on a whole multiple of the window, and a fresh window
 * starts from zero. One row per key per window in the RateLimit table, so
 * it works across every serverless instance without another service.
 *
 * Keys never hold the raw subject. An email or an IP address goes in as a
 * SHA-256 hash behind a readable bucket name, and rows older than two days
 * are pruned as the limiter runs.
 *
 * FAILS OPEN. If the table cannot be reached the request goes ahead: a
 * database blip must not stop every teacher and child signing in. The
 * error is logged so it is seen.
 *
 * Never import from a client component. */

export interface Rule {
  /** How many hits a window allows. */
  limit: number;
  /** The window, in seconds. */
  windowSec: number;
}

export interface Verdict {
  ok: boolean;
  /** Hits counted in this window, including this one when it was a hit. */
  count: number;
  /** Seconds until the window resets. */
  retryAfterSec: number;
}

/* The numbers, in one place. "Fail" rules count only failed attempts, so a
 * person who signs in and out all day is never stopped; the IP rules are
 * generous because a whole school shares one address. */
export const RULES = {
  /** Wrong passwords for one address: 10 per 15 minutes. */
  loginFailEmail: { limit: 10, windowSec: 15 * 60 },
  /** Wrong passwords from one IP: 50 per 15 minutes. */
  loginFailIp: { limit: 50, windowSec: 15 * 60 },
  /** New accounts from one IP: 20 an hour. */
  signupIp: { limit: 20, windowSec: 60 * 60 },
  /** Reset emails to one address: 3 an hour. */
  forgotEmail: { limit: 3, windowSec: 60 * 60 },
  /** Reset requests from one IP: 10 an hour. */
  forgotIp: { limit: 10, windowSec: 60 * 60 },
  /** Wrong site-gate passwords from one IP: 10 per 15 minutes. */
  siteGateFailIp: { limit: 10, windowSec: 15 * 60 },
  /** Wrong pictures for one pupil before the lock: 5 per 15 minutes. */
  pupilFail: { limit: 5, windowSec: 15 * 60 },
  /** Wrong pictures across one class from one IP: 50 per 15 minutes. */
  pupilClassFailIp: { limit: 50, windowSec: 15 * 60 },
  /** Class codes that matched nothing, from one IP: 30 per 15 minutes. */
  classLookupFailIp: { limit: 30, windowSec: 15 * 60 },
  /** Each public email-sending form, from one IP: 10 an hour. */
  publicFormIp: { limit: 10, windowSec: 60 * 60 },
} satisfies Record<string, Rule>;

/** How long a pupil stays locked once they reach RULES.pupilFail. */
export const PUPIL_LOCK_SEC = 15 * 60;

export { TOO_MANY, PUPIL_TOO_MANY };

const PRUNE_AFTER_MS = 2 * 24 * 60 * 60 * 1000;
const PRUNE_CHANCE = 0.02;
const OPEN: Verdict = { ok: true, count: 0, retryAfterSec: 0 };

/** The caller's IP: the first hop of x-forwarded-for, which Vercel sets. */
export function clientIp(source: Request | Headers): string {
  const h = source instanceof Headers ? source : source.headers;
  const first = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim();
  return first || h.get("x-real-ip")?.trim() || "unknown";
}

/** A key that names the bucket but never stores the subject itself. */
export function rateKey(bucket: string, subject: string): string {
  const hash = crypto.createHash("sha256").update(subject.trim().toLowerCase()).digest("hex").slice(0, 40);
  return `${bucket}:${hash}`;
}

export function windowStartOf(nowMs: number, windowSec: number): Date {
  const w = windowSec * 1000;
  return new Date(Math.floor(nowMs / w) * w);
}

export function retryAfterSec(nowMs: number, rule: Rule): number {
  const end = windowStartOf(nowMs, rule.windowSec).getTime() + rule.windowSec * 1000;
  return Math.max(1, Math.ceil((end - nowMs) / 1000));
}

function maybePrune(nowMs: number) {
  if (Math.random() >= PRUNE_CHANCE) return;
  prisma.rateLimit
    .deleteMany({ where: { windowStart: { lt: new Date(nowMs - PRUNE_AFTER_MS) } } })
    .catch((err: unknown) => console.error("[rateLimit] prune failed", err));
}

/** Count one hit and say whether it is within the rule. */
export async function hit(key: string, rule: Rule, nowMs = Date.now()): Promise<Verdict> {
  const windowStart = windowStartOf(nowMs, rule.windowSec);
  try {
    const row = await prisma.rateLimit.upsert({
      where: { key_windowStart: { key, windowStart } },
      create: { key, windowStart, count: 1 },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
    maybePrune(nowMs);
    return { ok: row.count <= rule.limit, count: row.count, retryAfterSec: retryAfterSec(nowMs, rule) };
  } catch (err) {
    console.error("[rateLimit] hit failed, letting the request through", err);
    return OPEN;
  }
}

/** Whether the key is already at its limit, without counting anything. */
export async function peek(key: string, rule: Rule, nowMs = Date.now()): Promise<Verdict> {
  const windowStart = windowStartOf(nowMs, rule.windowSec);
  try {
    const row = await prisma.rateLimit.findUnique({
      where: { key_windowStart: { key, windowStart } },
      select: { count: true },
    });
    const count = row?.count ?? 0;
    return { ok: count < rule.limit, count, retryAfterSec: retryAfterSec(nowMs, rule) };
  } catch (err) {
    console.error("[rateLimit] peek failed, letting the request through", err);
    return OPEN;
  }
}

/** Check several keys at once; the first one at its limit wins. */
export async function peekAll(checks: [string, Rule][], nowMs = Date.now()): Promise<Verdict> {
  const verdicts = await Promise.all(checks.map(([k, r]) => peek(k, r, nowMs)));
  return verdicts.find((v) => !v.ok) ?? OPEN;
}

/** Count a hit on several keys; not ok if any is over. */
export async function hitAll(checks: [string, Rule][], nowMs = Date.now()): Promise<Verdict> {
  const verdicts = await Promise.all(checks.map(([k, r]) => hit(k, r, nowMs)));
  return verdicts.find((v) => !v.ok) ?? OPEN;
}

/** Start a lock on a key from now: a lock row is a window that began now. */
export async function lock(key: string, nowMs = Date.now()): Promise<void> {
  const windowStart = new Date(nowMs);
  try {
    await prisma.rateLimit.upsert({
      where: { key_windowStart: { key, windowStart } },
      create: { key, windowStart, count: 1 },
      update: {},
    });
  } catch (err) {
    console.error("[rateLimit] lock failed", err);
  }
}

/** Seconds left on a lock started within the last `sec` seconds, or 0. */
export async function lockedFor(key: string, sec: number, nowMs = Date.now()): Promise<number> {
  try {
    const row = await prisma.rateLimit.findFirst({
      where: { key, windowStart: { gt: new Date(nowMs - sec * 1000) } },
      orderBy: { windowStart: "desc" },
      select: { windowStart: true },
    });
    if (!row) return 0;
    return Math.max(1, Math.ceil((row.windowStart.getTime() + sec * 1000 - nowMs) / 1000));
  } catch (err) {
    console.error("[rateLimit] lock check failed, letting the request through", err);
    return 0;
  }
}

/** Forget every window for a key (a pupil who got their pictures right). */
export async function clear(key: string): Promise<void> {
  try {
    await prisma.rateLimit.deleteMany({ where: { key } });
  } catch (err) {
    console.error("[rateLimit] clear failed", err);
  }
}

/** The 429 every limited route answers with. */
export function tooManyResponse(verdict: Verdict, message: string = TOO_MANY): Response {
  return Response.json(
    { error: message, rateLimited: true },
    { status: 429, headers: { "retry-after": String(verdict.retryAfterSec || 60) } },
  );
}

/* Email and password sign-in, web and mobile alike: refused while either
 * the address or the IP has too many recent failures, and every failure
 * counts against both. */
const loginKeys = (email: string, ip: string): [string, Rule][] => [
  [rateKey("login-fail-email", email), RULES.loginFailEmail],
  [rateKey("login-fail-ip", ip), RULES.loginFailIp],
];
export const loginAllowed = (email: string, ip: string) => peekAll(loginKeys(email, ip));
export const loginFailed = (email: string, ip: string) => hitAll(loginKeys(email, ip));
