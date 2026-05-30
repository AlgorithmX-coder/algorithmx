import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, productSlug, source } = (body ?? {}) as {
    email?: string;
    productSlug?: string;
    source?: string;
  };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!productSlug) {
    return NextResponse.json(
      { error: "We can't find that course" },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "We can't find that course" },
        { status: 400 },
      );
    }

    await prisma.waitlistEntry.upsert({
      where: { email_productId: { email, productId: product.id } },
      update: source ? { source } : {},
      create: { email, productId: product.id, source: source ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] create failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
