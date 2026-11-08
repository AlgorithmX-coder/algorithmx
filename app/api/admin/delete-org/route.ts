import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { deleteOrganisation } from "@/app/lib/orgDelete";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/admin/delete-org: remove a school, organisation or firm for
 * good. Staff only, shared by all three tabs because all three are
 * Organisation rows.
 *
 * Access must already be closed. That is checked again in
 * deleteOrganisation() rather than trusted from here, because this route is
 * a public endpoint and the button that calls it is not a gate. */

const Body = z.object({ orgId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const res = await deleteOrganisation(parsed.data.orgId, {
    name: firstNameOf(session.user.name, session.user.email),
    email: session.user.email ?? null,
  });

  if (!res.ok) {
    return Response.json(
      {
        error:
          res.error === "not_closed"
            ? "Close this organisation's access first. Deleting is only possible once access is closed."
            : "That organisation does not exist.",
      },
      { status: res.error === "not_closed" ? 409 : 404 },
    );
  }
  return Response.json({ ok: true, summary: res.summary });
}
