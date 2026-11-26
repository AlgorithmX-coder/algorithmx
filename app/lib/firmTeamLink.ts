import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { enrolOnEveryTrack } from "@/app/lib/aiCleared";
import { newInviteToken } from "@/app/lib/aiClearedAdmin";
import { CYBER_SECURED_BRAND, CYBER_SECURED_NAME, SECURED_TRACK_SLUGS } from "@/app/lib/cyberSecured";
import { emailEquals, normaliseEmail } from "@/app/lib/emailIdentity";
import { defaultTeamDomain, newTeamToken, seatsTakenLine, teamJoinDecision, type TeamJoinDecision, type TeamJoinRefusal } from "@/app/lib/teamLink";
import type { Track } from "@/app/ai-cleared/engine/types";

/* A firm's one team join link, server side: finding the firm a link
 * belongs to, its lead, the claim itself and the email that tells the lead
 * the seats have run out. The rules are in teamLink.ts. Never import from
 * a client component. */

/* The address a team link lives at. Same route as a personal invite: the
 * page looks the token up as a seat first, then as a firm's team link. */
export function teamJoinUrl(origin: string, token: string): string {
  return `${origin}/ai-cleared/join/${token}`;
}

/* The people a seat count is made of: one per address, removed ones not
 * counted. The same rule seatsLeft applies. */
const ACTIVE = { removedAt: null } as const;

export async function findTeamOrg(token: string) {
  if (!token) return null;
  return prisma.organisation.findUnique({
    where: { teamToken: token },
    include: { profile: { select: { escalationContact: true, escalationRole: true } } },
  });
}

/* The firm's lead: the first admin invited, whoever they are now. Their
 * name is what "Ask ... for more" says, and their address is where the
 * seats-full note goes. A lead who has not claimed yet has no name, so the
 * firm's contact stands in. */
export async function leadOf(orgId: string): Promise<{ name: string | null; email: string | null }> {
  const [seat, org] = await Promise.all([
    prisma.seat.findFirst({
      where: { orgId, role: "ADMIN", ...ACTIVE, NOT: { email: { endsWith: "@removed.invalid" } } },
      orderBy: { invitedAt: "asc" },
      select: { email: true, user: { select: { name: true, email: true } } },
    }),
    prisma.organisation.findUnique({ where: { id: orgId }, select: { contactName: true } }),
  ]);
  return {
    name: seat?.user?.name?.trim() || org?.contactName?.trim() || null,
    email: seat ? normaliseEmail(seat.user?.email ?? seat.email) : null,
  };
}

/* The firm's team link, made the first time anyone asks for it, locked to
 * the lead's domain unless that is a free provider. Safe to call from two
 * places at once: only a firm with no token gets one, so the second call
 * reads the first one's. */
export async function ensureTeamLink(orgId: string): Promise<{ token: string; domain: string | null } | null> {
  const org = await prisma.organisation.findUnique({ where: { id: orgId }, select: { teamToken: true, teamDomain: true } });
  if (!org) return null;
  if (org.teamToken) return { token: org.teamToken, domain: org.teamDomain };
  const lead = await leadOf(orgId);
  await prisma.organisation.updateMany({ where: { id: orgId, teamToken: null }, data: { teamToken: newTeamToken(), teamDomain: defaultTeamDomain(lead.email) } });
  const now = await prisma.organisation.findUnique({ where: { id: orgId }, select: { teamToken: true, teamDomain: true } });
  return now?.teamToken ? { token: now.teamToken, domain: now.teamDomain } : null;
}

async function seatsFor(db: Pick<typeof prisma, "seat">, orgId: string, userId: string, email: string) {
  const [seats, people] = await Promise.all([
    db.seat.findMany({
      where: { orgId, OR: [{ userId }, { email: emailEquals(email) }] },
      select: { id: true, email: true, userId: true, claimedAt: true, removedAt: true, role: true, team: true },
    }),
    db.seat.findMany({ where: { orgId, ...ACTIVE }, select: { email: true }, distinct: ["email"] }),
  ]);
  return { seats, used: people.length };
}

/* What the team link would do for this signed-in person, without doing
 * it: the join page uses this to show the desk question or the reason. */
export async function previewTeamJoin(args: { org: { id: string; revokedAt: Date | null; seatsPurchased: number; teamDomain: string | null }; userId: string; email: string }): Promise<TeamJoinDecision> {
  const email = normaliseEmail(args.email);
  const { seats, used } = await seatsFor(prisma, args.org.id, args.userId, email);
  return teamJoinDecision({ revoked: !!args.org.revokedAt, seatsPurchased: args.org.seatsPurchased, used, teamDomain: args.org.teamDomain, userId: args.userId, email, seats });
}

export type ClaimTeamLinkResult =
  | { ok: true; orgName: string; orgId: string }
  | { ok: false; reason: TeamJoinRefusal | "not-found" | "no-product" | "no-email"; orgId?: string };

/**
 * Take a seat through the team link: the signed-in person joins the firm
 * as a learner and is enrolled on every Cyber Secured track at the desk
 * they picked.
 *
 * The count and the new seat happen under a lock held for this firm only,
 * so fifty people opening the link in the same minute cannot between them
 * take a fifty-first seat. The per-email invites have always lived with a
 * small overshoot; a link forwarded to a whole firm at once cannot.
 */
export async function claimTeamLink(args: { token: string; userId: string; track: Track }): Promise<ClaimTeamLinkResult> {
  const org = await prisma.organisation.findUnique({ where: { teamToken: args.token }, select: { id: true, name: true, slug: true, seatsPurchased: true, revokedAt: true, teamDomain: true } });
  if (!org) return { ok: false, reason: "not-found" };
  if (!(await prisma.product.count({ where: { slug: { in: [...SECURED_TRACK_SLUGS] } } }))) return { ok: false, reason: "no-product", orgId: org.id };
  const user = await prisma.user.findUnique({ where: { id: args.userId }, select: { email: true } });
  const email = normaliseEmail(user?.email);
  if (!email) return { ok: false, reason: "no-email", orgId: org.id };

  const decision = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 AS ok FROM pg_advisory_xact_lock(hashtext(${`team-link:${org.id}`}))`;
    const { seats, used } = await seatsFor(tx, org.id, args.userId, email);
    const d = teamJoinDecision({ revoked: !!org.revokedAt, seatsPurchased: org.seatsPurchased, used, teamDomain: org.teamDomain, userId: args.userId, email, seats });
    if (!d.ok || d.kind === "already-in") return d;
    const now = new Date();
    const seat =
      d.kind === "claim-invite"
        ? await tx.seat.update({ where: { id: d.seatId }, data: { userId: args.userId, claimedAt: now } })
        : await tx.seat.create({ data: { orgId: org.id, email, inviteToken: newInviteToken(org.slug.slice(0, 6)), role: "LEARNER", course: "CYBER_SECURED", userId: args.userId, claimedAt: now } });
    await tx.orgMember.upsert({
      where: { orgId_userId: { orgId: org.id, userId: args.userId } },
      /* An invite that made them an admin still does; nothing lowers a role. */
      update: seat.role === "ADMIN" ? { role: "ADMIN" } : {},
      create: { orgId: org.id, userId: args.userId, role: seat.role, team: seat.team },
    });
    return d;
  });
  if (!decision.ok) return { ok: false, reason: decision.reason, orgId: org.id };
  if (decision.kind !== "already-in") await enrolOnEveryTrack({ userId: args.userId, orgId: org.id, track: args.track });
  return { ok: true, orgName: org.name, orgId: org.id };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/* A plain branded email: heading, paragraphs, one button, the link in
 * full. The same shape as every other Cyber Secured email. */
export function teamEmail(args: { heading: string; paras: string[]; button: string; link: string; foot?: string; extra?: { label: string; link: string } }): { html: string; text: string } {
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">${CYBER_SECURED_BRAND}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${esc(args.heading)}</h1>
      ${args.paras.map((p) => `<p style="font-size:15px;line-height:1.55;margin:0 0 12px">${esc(p)}</p>`).join("")}
      <p style="margin:18px 0 10px"><a href="${args.link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">${esc(args.button)}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${args.link}" style="color:#0a7085">${args.link}</a></p>
      ${args.extra ? `<p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:10px 0 0">${esc(args.extra.label)}: <a href="${args.extra.link}" style="color:#0a7085">${args.extra.link}</a></p>` : ""}
      ${args.foot ? `<p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">${esc(args.foot)}</p>` : ""}
    </div>`;
  const text = [args.heading, "", ...args.paras.flatMap((p) => [p, ""]), `${args.button}: ${args.link}`, ...(args.extra ? [`${args.extra.label}: ${args.extra.link}`] : []), ...(args.foot ? ["", args.foot] : []), ""].join("\n");
  return { html, text };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Tell the lead that the team link has just turned someone away because
 * every seat is taken. At most once a day per firm: the stamp is moved
 * first, conditionally, so two refusals in the same second send one email.
 * Returns whether this call sent it.
 */
export async function notifySeatsFull(args: { orgId: string; origin: string; now?: Date }): Promise<boolean> {
  const now = args.now ?? new Date();
  const moved = await prisma.organisation.updateMany({
    where: { id: args.orgId, OR: [{ teamFullNotifiedAt: null }, { teamFullNotifiedAt: { lt: new Date(now.getTime() - DAY_MS) } }] },
    data: { teamFullNotifiedAt: now },
  });
  if (moved.count === 0) return false;
  const [org, lead] = await Promise.all([prisma.organisation.findUnique({ where: { id: args.orgId }, select: { name: true, seatsPurchased: true } }), leadOf(args.orgId)]);
  if (!org || !lead.email) return false;
  const buy = `${args.origin}/corporate/buy`;
  const team = `${args.origin}/cyber-secured/admin`;
  const taken = seatsTakenLine(org.seatsPurchased);
  const mail = teamEmail({
    heading: `Someone could not join ${org.name}: the seats have run out.`,
    paras: [
      `Someone has just opened your team link for ${CYBER_SECURED_NAME}, but could not join. ${taken} We have asked them to come to you.`,
      `To let them in, buy more seats (use this address at checkout and they are added to ${org.name}), or free a seat on your team page by removing someone who has left.`,
      "We send this at most once a day, however many people try.",
    ],
    button: "Buy more seats",
    link: buy,
    extra: { label: "Your team page", link: team },
  });
  try {
    await sendEmail({ to: lead.email, subject: `${org.name}: your ${CYBER_SECURED_NAME} seats are all taken`, html: mail.html, text: mail.text });
    return true;
  } catch (err) {
    console.error("[team-link] seats-full email failed", err instanceof Error ? err.message : err);
    return false;
  }
}
