import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { setEnquiryHandled } from "@/app/lib/schoolEnquiries";

/**
 * PATCH /api/admin/enquiries: tick a school enquiry off, or put it back.
 *
 * Staff only, like everything else under /api/admin. Nothing is deleted: a
 * lead that was answered and came to nothing is still the evidence that the
 * school was spoken to, and somebody who ticks the wrong row has to be able
 * to untick it.
 */
const Body = z.object({
  id: z.string().min(1),
  handled: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name the enquiry." }, { status: 400 });

  const done = await setEnquiryHandled({
    id: parsed.data.id,
    handled: parsed.data.handled,
    staffUserId: session.user.id,
  });
  if (!done) return Response.json({ error: "That enquiry does not exist." }, { status: 404 });

  return Response.json({ ok: true, handled: parsed.data.handled });
}
