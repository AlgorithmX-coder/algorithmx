import { NextRequest, after } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { claimSeat } from "@/app/lib/aiCleared";
import { TRACKS } from "@/app/ai-cleared/engine/types";
import { claimTeamLink, leadOf, notifySeatsFull } from "@/app/lib/firmTeamLink";
import { askLine, seatsTakenLine } from "@/app/lib/teamLink";
import { prisma } from "@/app/lib/prisma";

/* POST /api/ai-cleared/join
 * Claims an invite seat for the signed-in user on the chosen desk, which
 * enrols them on every Cyber Secured track. The invite landing page posts
 * here after sign-in.
 *
 * The token may also be a firm's team link (a token no seat has): then
 * the claim takes a new seat for this person, or the invite already sent
 * to their address, under the rules in teamLink.ts. */

const Body = z.object({
  token: z.string().min(6).max(120),
  track: z.enum(TRACKS),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const result = await claimSeat({ token: parsed.data.token, userId: session.user.id, track: parsed.data.track });
  if (!result.ok && result.reason === "not-found") return claimByTeamLink(req, parsed.data.token, session.user.id, parsed.data.track);
  if (!result.ok) {
    const status = result.reason === "taken" || result.reason === "closed" ? 409 : 500;
    const message =
      result.reason === "taken"
        ? "That seat has already been claimed by someone else."
        : result.reason === "closed"
          ? "Your firm's access to these courses is closed. Your admin can reopen it with us at admissions@algorithmx.co.uk."
          : "The courses are not set up yet. Ask your admin.";
    return Response.json({ error: message }, { status });
  }
  /* Into the portal: every course the seat opens, in one place. */
  return Response.json({ ok: true, orgName: result.orgName, redirect: "/cyber-secured" });
}

async function claimByTeamLink(req: NextRequest, token: string, userId: string, track: (typeof TRACKS)[number]) {
  const r = await claimTeamLink({ token, userId, track });
  if (r.ok) return Response.json({ ok: true, orgName: r.orgName, redirect: "/cyber-secured" });
  if (r.reason === "not-found") return Response.json({ error: "That link is not working any more. Ask whoever sent it for the latest one." }, { status: 404 });
  const lead = r.orgId ? await leadOf(r.orgId) : { name: null };
  if (r.reason === "full" && r.orgId) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
    const orgId = r.orgId;
    after(() => notifySeatsFull({ orgId, origin: `${proto}://${host}` }).catch((err) => console.error("[team-link] notify failed", err)));
    const org = await prisma.organisation.findUnique({ where: { id: orgId }, select: { seatsPurchased: true } });
    return Response.json({ error: `${seatsTakenLine(org?.seatsPurchased ?? 0)} ${askLine(lead.name, "for more.")}` }, { status: 409 });
  }
  const message =
    r.reason === "closed"
      ? "Your firm's access to these courses is closed. Your admin can reopen it with us at admissions@algorithmx.co.uk."
      : r.reason === "removed"
        ? `Your seat here has been handed back. ${askLine(lead.name, "if you need it again.")}`
        : r.reason === "taken"
          ? `A seat for your address is already in use on another account. ${askLine(lead.name, "to sort it out.")}`
          : r.reason === "wrong-domain"
            ? `This link only works for your firm's email addresses. Sign in with your work address, or ${askLine(lead.name, "to invite you.").replace(/^Ask/, "ask")}`
            : r.reason === "no-email"
              ? "Your account has no email address, so we cannot give it a seat. Sign in with your work address."
              : "The courses are not set up yet. Ask your admin.";
  return Response.json({ error: message }, { status: r.reason === "no-product" ? 500 : 409 });
}
