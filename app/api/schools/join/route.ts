import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { claimTeacherInvite } from "@/app/lib/schoolOps";
import { joinByStaffLink, type StaffLinkRefusal } from "@/app/lib/staffLink";

/* POST /api/schools/join
 * Claims a teacher invite for the signed-in user. The invite landing page
 * posts here after sign-in. No job-title/track picker: a teacher enrols
 * on nothing, so there is nothing to choose.
 *
 * The same landing also serves a school's one staff join link (see
 * app/lib/staffLink.ts). A token that is not a per-email invite is tried
 * as a staff link; on a link locked to the school's domain the first post
 * sends a confirmation email, and the post from the emailed link (which
 * carries `confirm`) is the one that joins. */

const Body = z.object({
  token: z.string().min(6).max(120),
  confirm: z.string().max(120).optional(),
});

const REFUSED: Record<StaffLinkRefusal, string> = {
  not_found: "That link is not valid any more. Ask whoever sent it for the new one.",
  closed: "Access for this school is closed. Ask whoever sent the link.",
  pupil: "A pupil account cannot join as staff. Sign out and sign in with your own account.",
  wrong_domain: "This link only works for the school's own email addresses. Sign in with yours, or ask for a personal invite.",
  no_account: "Sign in again.",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const result = await claimTeacherInvite(parsed.data.token, session.user.id);
  if (result.ok) return Response.json({ ok: true, orgName: result.orgName, redirect: "/schools/classes" });
  if (result.error === "claimed_by_other") {
    return Response.json({ error: "That invite has already been claimed by someone else." }, { status: 409 });
  }

  /* Not a per-email invite: try it as the school's staff link. */
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "algorithmx.io";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const done = await joinByStaffLink({
    token: parsed.data.token,
    userId: session.user.id,
    confirm: parsed.data.confirm ?? null,
    origin: `${proto}://${host}`,
  });

  switch (done.state) {
    case "ready":
    case "already":
      return Response.json({ ok: true, orgName: done.target.orgName, redirect: "/schools/classes" });
    case "confirm_by_email":
      if (!done.emailed) {
        return Response.json({ error: "We could not send the confirmation email. Try again in a moment." }, { status: 502 });
      }
      return Response.json({ ok: true, emailed: true, email: done.email });
    case "refused": {
      const status = done.why === "not_found" ? 404 : done.why === "no_account" ? 401 : 403;
      /* An unknown token keeps the old wording, which per-email invitees
         have seen for months. */
      const error = done.why === "not_found" && !parsed.data.token.startsWith("staff-")
        ?"That invite link is not valid. Ask AlgorithmX for a new one."
        : REFUSED[done.why];
      return Response.json({ error }, { status });
    }
  }
}
