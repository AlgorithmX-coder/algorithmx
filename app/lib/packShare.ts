import { createHash, randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { getPack } from "@/app/schools/teach/packs";

/**
 * Read-only links to one week of a teacher pack.
 *
 * A school that asks about Cyber Heroes cannot be shown anything today: the
 * packs sit behind a login and an org membership, so the head of computing who
 * filled in the enquiry form has nothing to look at. This is the answer to
 * that, and it is deliberately the smallest thing that works: one week, one
 * link, expires, revocable, no account at either end.
 *
 * The token is the same shape as PasswordResetToken and for the same reason:
 * the random half lives only in the URL and only its SHA-256 is stored, so a
 * copy of the table hands out no working links. Unlike a signed stateless
 * token it can be revoked the moment a conversation goes wrong, and the open
 * count is the part whoever sent it actually wants: you can tell whether the
 * school looked at it before you follow up.
 */

/** Long enough that guessing is not a strategy, short enough to paste into an
 *  email without it wrapping across three lines. */
const TOKEN_BYTES = 24;

/** A sales conversation runs for weeks, not months, and a link that outlives
 *  the conversation is a link nobody remembers sending. */
export const DEFAULT_DAYS = 30;
export const MAX_DAYS = 90;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export interface MintedLink {
  token: string;
  url: string;
  week: number;
  expiresAt: Date;
}

/**
 * Mint a link to one week. Returns the raw token exactly once: it is never
 * stored and cannot be recovered, so a lost link is reissued, not looked up.
 */
export async function mintShareLink(args: {
  week: number;
  orgId: string;
  createdById: string;
  label?: string | null;
  days?: number;
  origin: string;
}): Promise<MintedLink | null> {
  /* never mint a link to a week nobody has written: the recipient would open
     a 404 with our name on it */
  if (!getPack(args.week)) return null;

  const days = Math.min(MAX_DAYS, Math.max(1, Math.round(args.days ?? DEFAULT_DAYS)));
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.packShareLink.create({
    data: {
      tokenHash: hash(token),
      week: args.week,
      label: args.label?.trim() || null,
      orgId: args.orgId,
      createdById: args.createdById,
      expiresAt,
    },
  });

  return { token, url: `${args.origin}/schools/teach/shared/${token}`, week: args.week, expiresAt };
}

export type ShareFailure = "unknown" | "expired" | "revoked";

/**
 * Resolve a link and count the open.
 *
 * The three failure reasons are kept apart because they need different things
 * said to the person holding the link: an expired one should be reissued, a
 * revoked one should not, and an unknown one is usually a truncated paste.
 */
export async function openShareLink(token: string): Promise<
  | { ok: true; week: number; orgName: string }
  | { ok: false; reason: ShareFailure }
> {
  if (!token || token.length > 128) return { ok: false, reason: "unknown" };

  const row = await prisma.packShareLink.findUnique({
    where: { tokenHash: hash(token) },
    select: {
      id: true, week: true, expiresAt: true, revokedAt: true,
      org: { select: { name: true } },
    },
  });
  if (!row) return { ok: false, reason: "unknown" };
  if (row.revokedAt) return { ok: false, reason: "revoked" };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  /* Count the open but never let a counter failure cost somebody the page
     they were sent. The number is for us; the pack is for them. */
  try {
    await prisma.packShareLink.update({
      where: { id: row.id },
      data: { opens: { increment: 1 }, lastOpenedAt: new Date() },
    });
  } catch (err) {
    console.error("[packShare] open count failed", err instanceof Error ? err.message : err);
  }

  return { ok: true, week: row.week, orgName: row.org.name };
}

export interface ShareRow {
  id: string;
  week: number;
  label: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  opens: number;
  lastOpenedAt: Date | null;
  createdAt: Date;
}

/** Every link this organisation has sent, newest first. Scoped to the org and
 *  not to the person, so a colleague can see and revoke what was sent while
 *  they were away. */
export async function listShareLinks(orgId: string): Promise<ShareRow[]> {
  return prisma.packShareLink.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, week: true, label: true, expiresAt: true, revokedAt: true,
      opens: true, lastOpenedAt: true, createdAt: true,
    },
  });
}

/** Revoking is scoped by orgId in the same query, so a guessed id from another
 *  organisation updates nothing rather than erroring informatively. */
export async function revokeShareLink(id: string, orgId: string): Promise<boolean> {
  const { count } = await prisma.packShareLink.updateMany({
    where: { id, orgId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return count > 0;
}
