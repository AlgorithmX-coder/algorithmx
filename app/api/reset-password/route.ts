import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

/**
 * POST /api/reset-password
 *
 * Body: { token: string, password: string }
 *
 * Verifies the reset token (exists, not expired, not used), updates
 * the user's password (bcrypt), and marks the token as used.  Returns
 * a generic error code for any failure mode so a malicious caller
 * can't tell which step failed.
 */

export const runtime = "nodejs";

const MIN_PASSWORD = 8;

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, password } = (body ?? {}) as {
    token?: string;
    password?: string;
  };

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters` },
      { status: 400 },
    );
  }

  const tokenHash = sha256(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true } } },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }
  if (record.usedAt) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Single transaction: update user + mark token used. Also wipe any
  // other outstanding reset tokens for this user - once they've reset,
  // older outstanding requests should not still be redeemable.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: record.userId,
        tokenHash: { not: tokenHash },
        usedAt: null,
      },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
