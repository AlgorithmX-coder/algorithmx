import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { courseOf, getAdminContext, orgRefOf, getRegister, registerCsv } from "@/app/lib/aiClearedAdmin";
import { COURSES } from "@/app/ai-cleared/engine/courses";

/* GET /api/org/register[?format=csv][&course=ai-fluent]
 * The firm's training register for one course, for its admins and
 * managers. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id, orgRefOf(req));
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });

  const params = new URL(req.url).searchParams;
  const course = courseOf(params.get("course"));
  const rows = await getRegister(ctx.orgId, course);
  if (params.get("format") === "csv") {
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(registerCsv(rows, ctx.org.name), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${COURSES[course].name.replace(/\s+/g, "-")}-register-${ctx.org.slug}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return Response.json({ rows });
}
