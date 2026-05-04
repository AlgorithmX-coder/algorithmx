import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail, passwordResetTemplate } from "@/app/lib/resend";

/**
 * POST /api/forgot-password
 *
 * Body: { email: string }
 *
 * Generates a single-use password-reset token, stores its SHA-256 hash
 * in the DB (so a leaked DB can't reuse live tokens), and emails the
 * raw token in a reset link.
 *
 * Always returns 200 OK regardless of whether the email exists — this
 * prevents user-enumeration via the response code.  The user-facing UI
 * shows "if an account exists, a link is on its way" either way.
 *
 * Tokens expire after 60 minutes.
 */

export const runtime = "nodejs";

const EXPIRY_MINUTES = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const email = ((body ?? {}) as { email?: string }).email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    // Same generic 200 — don't leak whether validation failed vs the
    // user not existing.
    return NextResponse.json({ ok: true });
  }

  // Look up user — silent if not found.
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    // No-op response — same shape so attackers can't enumerate.
    return NextResponse.json({ ok: true });
  }

  // Generate a 32-byte token, encode to URL-safe base64 (43 chars).
  // The DB stores only the SHA-256 hash; the raw token only ever
  // travels in the email link.
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  // Build absolute URL.  NEXTAUTH_URL is set on Vercel; in dev we
  // fall back to the request's origin header.
  const origin =
    process.env.NEXTAUTH_URL ??
    req.headers.get("origin") ??
    "http://localhost:3000";
  const resetUrl = `${origin}/reset-password?token=${rawToken}`;

  const tpl = passwordResetTemplate({
    resetUrl,
    expiryMinutes: EXPIRY_MINUTES,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  } catch (err) {
    // Send failure is logged inside `sendEmail`; we still return ok=true
    // so we don't leak any signal to the caller.
    // eslint-disable-next-line no-console
    console.error("[forgot-password] email send failed", err);
  }

  return NextResponse.json({ ok: true });
}
