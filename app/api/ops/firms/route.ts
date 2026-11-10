import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { createFirm, setFirmSeats } from "@/app/lib/aiClearedOps";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/ops/firms: AlgorithmX staff create a firm by hand, with its
 * Cyber Secured seat count, and get its admin invite link. */

const Body = z.object({
  name: z.string().min(2).max(120),
  sector: z.string().max(80).optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  contactRole: z.string().max(120).optional().nullable(),
  plan: z.enum(["TEAM", "FIRM", "ENTERPRISE"]),
  seatsPurchased: z.number().int().min(1).max(100000),

  adminEmail: z.string().email().max(200),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the fields: a name, a plan, a seat count and the admin's email are required." }, { status: 400 });
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  const result = await createFirm({
    ...parsed.data,
    origin: `${proto}://${host}`,
    staffName: session.user.name?.trim() || firstNameOf(session.user.name, session.user.email),
    staffEmail: session.user.email ?? null,
  });
  return Response.json({ ok: true, slug: result.org.slug, name: result.org.name, link: result.link, emailed: result.emailed });
}

/* PATCH /api/ops/firms: staff change a firm's seat count after it was
 * created (an invoice-paid top-up, a correction, a goodwill seat). Seat
 * count only: no Stripe, no charge. Separate from POST for the same reason
 * the schools route splits them: creating a firm emails a person, this
 * quietly moves the invite cap. The rules (whole number, not below the
 * people holding a seat, at most 10,000, a reason) are checked in
 * setFirmSeats, so the body is only shape-checked here. */

const Patch = z.object({
  orgId: z.string().min(1),
  /* Optional here so a missing field reaches setFirmSeats and gets its
     own message ("give a reason"), not a generic shape error. */
  seatsPurchased: z.unknown().optional(),
  reason: z.unknown().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name the firm." }, { status: 400 });

  const result = await setFirmSeats({
    orgId: parsed.data.orgId,
    seats: parsed.data.seatsPurchased,
    reason: parsed.data.reason,
    actor: { name: firstNameOf(session.user.name, session.user.email), email: session.user.email ?? null },
  });
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : result.error === "changed_meanwhile" ? 409 : 400;
    return Response.json({ error: result.message, ...("held" in result ? { held: result.held } : {}) }, { status });
  }
  return Response.json({ ok: true, seats: result.seats, previous: result.previous, held: result.held });
}
