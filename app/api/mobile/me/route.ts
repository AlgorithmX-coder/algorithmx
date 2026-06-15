import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getMobileUser } from "@/app/lib/mobileAuth";

/**
 * GET /api/mobile/me — returns the current user for a valid Bearer token.
 * The app calls this on launch to confirm a stored token is still valid.
 */
export async function GET(request: Request) {
  const claims = await getMobileUser(request);
  if (!claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
