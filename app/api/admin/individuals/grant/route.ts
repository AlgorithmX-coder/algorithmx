import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";
import { grantEntitlement } from "@/app/lib/entitlements";
import { opsAlert } from "@/app/lib/opsAlert";
import { firstNameOf } from "@/app/lib/aiCleared";

/**
 * POST /api/admin/individuals/grant: give one person one course, free.
 *
 * The other half of revoke, which has existed on its own since the admin
 * console was built: staff could take a course away and had no way to give
 * one, so every comp, every tester and every goodwill fix meant somebody
 * editing the database by hand.
 *
 * The grant is MANUAL, which is the provenance that says nobody paid for
 * it. `grantEntitlement` leaves an existing row alone, so granting a course
 * somebody already bought never rewrites their purchase as a freebie.
 *
 * Staff only, and announced to ops: a free grant is revenue not taken, so
 * it belongs in the same place every other money-shaped act is recorded.
 */
const Body = z.object({ userId: z.string().min(1), productSlug: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name the person and the course." }, { status: 400 });

  const [product, user] = await Promise.all([
    prisma.product.findUnique({ where: { slug: parsed.data.productSlug }, select: { id: true, name: true } }),
    prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, email: true } }),
  ]);
  if (!product) return Response.json({ error: "That course does not exist." }, { status: 404 });
  if (!user) return Response.json({ error: "That person does not exist." }, { status: 404 });

  await grantEntitlement(user.id, parsed.data.productSlug, "MANUAL");

  await opsAlert({
    what: "Course granted for free",
    detail: {
      user: user.email ?? user.id,
      course: product.name,
      by: session.user.email ?? firstNameOf(session.user.name, session.user.email),
    },
  });

  return Response.json({ ok: true, course: product.name });
}
