import { NextRequest, NextResponse } from "next/server";
import { RULES, clientIp, hit, peek, rateKey, tooManyResponse } from "@/app/lib/rateLimit";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "algorithmx2026!";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  /* Wrong guesses at the site gate, per IP. Only failures count. */
  const ipKey = rateKey("site-gate-fail-ip", clientIp(req));
  const allowed = await peek(ipKey, RULES.siteGateFailIp);
  if (!allowed.ok) return tooManyResponse(allowed);

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password !== SITE_PASSWORD) {
    await hit(ipKey, RULES.siteGateFailIp);
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: "site_auth",
    value: "v2",
    httpOnly: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
