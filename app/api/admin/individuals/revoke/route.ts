import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/admin/individuals/revoke: remove one person's access to one
 * course - deletes the Entitlement row, the exact thing hasEntitlement()
 * checks on every lesson load. Staff only. */

const Body = z.object({ userId: z.string(), productSlug: z.string() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { slug: parsed.data.productSlug }, select: { id: true, name: true } });
  if (!product) return Response.json({ error: "That course does not exist." }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { email: true } });

  await prisma.entitlement.deleteMany({ where: { userId: parsed.data.userId, productId: product.id } });
  await opsAlert({ what: "Course access revoked", detail: { user: user?.email ?? parsed.data.userId, course: product.name, by: session.user.email ?? firstNameOf(session.user.name, session.user.email) } });
  return Response.json({ ok: true });
}
