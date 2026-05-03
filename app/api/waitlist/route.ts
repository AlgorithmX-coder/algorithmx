import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const VALID_SLUGS = new Set([
  "cyberexplorers",
  "cyberstart",
  "cyberstart-pro",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, courseSlug, source } = (body ?? {}) as {
    email?: string;
    courseSlug?: string;
    source?: string;
  };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!courseSlug || !VALID_SLUGS.has(courseSlug)) {
    return NextResponse.json({ error: "Invalid course" }, { status: 400 });
  }

  try {
    await prisma.waitlistEntry.upsert({
      where: { email_courseSlug: { email, courseSlug } },
      update: { source: source ?? undefined },
      create: { email, courseSlug, source: source ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] create failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
