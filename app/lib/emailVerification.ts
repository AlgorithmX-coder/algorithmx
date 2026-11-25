import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, verifyEmailTemplate } from "@/app/lib/resend";

/* Proving an account owns its email address.
 *
 * Signup emails a welcome with a link to /verify-email/<token>. Only the
 * SHA-256 of the token is stored, so a leaked database holds no live links;
 * a link works once and lasts seven days. Opening it stamps
 * User.emailVerified.
 *
 * Verification does not gate any course: testers are using the site and
 * nothing they paid for should wait on an inbox. What it does gate is staff
 * by email (app/lib/aiClearedStaff.ts): an address on PLATFORM_STAFF_EMAILS
 * only counts once the account has proved it receives that address's mail.
 *
 * Never import from a client component. */

export const VERIFY_EXPIRY_DAYS = 7;

export function hashVerifyToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Make a fresh link for a user. Returns the raw token (it only travels in the email). */
export async function createVerifyToken(userId: string, nowMs = Date.now()): Promise<string> {
  const raw = crypto.randomBytes(32).toString("base64url");
  await prisma.emailVerificationToken.create({
    data: { tokenHash: hashVerifyToken(raw), userId, expiresAt: new Date(nowMs + VERIFY_EXPIRY_DAYS * 24 * 60 * 60 * 1000) },
  });
  return raw;
}

/** Send the welcome-and-verify email. Best effort: a failed send never fails signup. */
export async function sendWelcomeVerify(args: { userId: string; email: string; name?: string | null; origin: string }): Promise<boolean> {
  try {
    const token = await createVerifyToken(args.userId);
    const tpl = verifyEmailTemplate({ verifyUrl: `${args.origin}/verify-email/${token}`, name: args.name ?? null, expiryDays: VERIFY_EXPIRY_DAYS });
    await sendEmail({ to: args.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    return true;
  } catch (err) {
    console.error("[verify-email] welcome email failed", err instanceof Error ? err.message : err);
    return false;
  }
}

export type VerifyOutcome = "verified" | "already" | "expired" | "invalid";

/** Redeem a link. Single use: a used, expired or unknown token verifies nothing. */
export async function redeemVerifyToken(raw: string, nowMs = Date.now()): Promise<VerifyOutcome> {
  if (!raw || raw.length > 200) return "invalid";
  const tokenHash = hashVerifyToken(raw);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, usedAt: true, expiresAt: true, user: { select: { emailVerified: true } } },
  });
  if (!record) return "invalid";
  if (record.usedAt) return record.user.emailVerified ? "already" : "invalid";
  if (record.expiresAt.getTime() < nowMs) return "expired";

  const now = new Date(nowMs);
  /* Claim the token first, conditionally, so two clicks at once cannot both
     count; then stamp the user. */
  const claimed = await prisma.emailVerificationToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: now } });
  if (claimed.count === 0) return record.user.emailVerified ? "already" : "invalid";
  if (!record.user.emailVerified) {
    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: now } });
  }
  return "verified";
}
