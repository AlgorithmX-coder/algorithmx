import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { enrolOnEveryTrack } from "@/app/lib/aiCleared";
import { newInviteToken } from "@/app/lib/aiClearedAdmin";
import { CYBER_SECURED_BRAND, CYBER_SECURED_NAME, SECURED_TRACK_SLUGS, liveTrackNames } from "@/app/lib/cyberSecured";
import { hit, peek, rateKey } from "@/app/lib/rateLimit";
import { emailEquals, normaliseEmail } from "@/app/lib/emailIdentity";
import { defaultTeamDomain, domainAllows, newTeamToken, seatsTakenLine, teamJoinDecision, type TeamJoinDecision, type TeamJoinRefusal } from "@/app/lib/teamLink";
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

/* "Make a new link": the old one stops working the moment this returns,
 * because a token is looked up by exact match and the old string is gone.
 * Seats already taken through it are untouched. */
export async function rotateTeamLink(orgId: string): Promise<string> {
  const existing = await prisma.organisation.findUnique({ where: { id: orgId }, select: { teamToken: true } });
  if (!existing?.teamToken) {
    const made = await ensureTeamLink(orgId);
    if (made) return made.token;
  }
  const token = newTeamToken();
  await prisma.organisation.update({ where: { id: orgId }, data: { teamToken: token } });
  return token;
}

/* The firm-domain check, on or off. On means the lead's own domain; a
 * lead on a free provider has none to lock to, so switching on is refused
 * with the reason rather than locking the link to everyone at Gmail. */
export async function setTeamDomainLock(orgId: string, on: boolean): Promise<{ ok: true; domain: string | null } | { ok: false; message: string }> {
  await ensureTeamLink(orgId);
  if (!on) {
    await prisma.organisation.update({ where: { id: orgId }, data: { teamDomain: null } });
    return { ok: true, domain: null };
  }
  const lead = await leadOf(orgId);
  const domain = defaultTeamDomain(lead.email);
  if (!domain) return { ok: false, message: "Your lead's address is on a free email provider, so there is no firm domain to lock the link to. It stays open to anyone who has it." };
  await prisma.organisation.update({ where: { id: orgId }, data: { teamDomain: domain } });
  return { ok: true, domain };
}

/* The numbers for reminders. One a day per address, so pressing the button
 * twice, or two admins pressing it, never doubles anyone's inbox; and a
 * ceiling per firm per day, so a pasted list of thousands cannot be used
 * to send mail in bulk under our name. */
export const REMIND_RULES = {
  perAddress: { limit: 1, windowSec: 24 * 60 * 60 },
  perFirm: { limit: 300, windowSec: 24 * 60 * 60 },
} as const;

export type RemindResult =
  | { ok: true; sent: string[]; joined: string[]; removed: string[]; recent: string[]; offDomain: string[]; invalid: string[]; failed: string[]; overLimit: string[] }
  | { ok: false; message: string };

/**
 * Email the team link to the addresses on a pasted staff list that have
 * not joined yet, under the admin's name with replies going to them.
 *
 * Someone already in is skipped, as is an address the link would refuse
 * (outside the firm's domain): reminding them would send a link that does
 * not work for them. The result says which addresses fell where, so the
 * portal can tell the admin in a line.
 */
export async function remindNotJoined(args: { orgId: string; firmName: string; emails: string[]; origin: string; adminName: string; adminEmail: string | null }): Promise<RemindResult> {
  const link = await ensureTeamLink(args.orgId);
  if (!link) return { ok: false, message: "That firm does not exist." };
  const raw = Array.from(new Set(args.emails.map((e) => normaliseEmail(e)).filter(Boolean)));
  const invalid = raw.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  const valid = raw.filter((e) => !invalid.includes(e));
  const theirs = await prisma.seat.findMany({ where: { orgId: args.orgId, email: { in: valid } }, select: { email: true, claimedAt: true, removedAt: true } });
  const joinedSet = new Set(theirs.filter((s) => !s.removedAt && s.claimedAt).map((s) => s.email));
  const activeSet = new Set(theirs.filter((s) => !s.removedAt).map((s) => s.email));
  /* Someone the lead removed is not reminded: the link would turn them away. */
  const removedSet = new Set(theirs.filter((s) => s.removedAt && !activeSet.has(s.email)).map((s) => s.email));
  const joined = valid.filter((e) => joinedSet.has(e));
  const removed = valid.filter((e) => removedSet.has(e));
  const waiting = valid.filter((e) => !joinedSet.has(e) && !removedSet.has(e));
  const offDomain = waiting.filter((e) => !activeSet.has(e) && !domainAllows(link.domain, e));
  const targets = waiting.filter((e) => !offDomain.includes(e));

  const url = teamJoinUrl(args.origin, link.token);
  const sent: string[] = [];
  const recent: string[] = [];
  const failed: string[] = [];
  const overLimit: string[] = [];
  for (const to of targets) {
    const mine = await peek(rateKey("team-remind", `${args.orgId}:${to}`), REMIND_RULES.perAddress);
    if (!mine.ok) {
      recent.push(to);
      continue;
    }
    const firm = await hit(rateKey("team-remind-firm", args.orgId), REMIND_RULES.perFirm);
    if (!firm.ok) {
      overLimit.push(to);
      continue;
    }
    await hit(rateKey("team-remind", `${args.orgId}:${to}`), REMIND_RULES.perAddress);
    const mail = teamEmail({
      heading: `${args.adminName} has saved you a seat on ${CYBER_SECURED_NAME}.`,
      paras: [
        `${args.firmName} has given everyone a seat on ${CYBER_SECURED_NAME}, and yours is still waiting. It opens ${liveTrackNames()}, and you can stop and resume whenever suits.`,
        "Open the link, create an account with this address (or sign in), answer one question about your job and you are in.",
      ],
      button: "Join my team",
      link: url,
      foot: `${args.adminName}, ${args.firmName}`,
    });
    try {
      await sendEmail({ to, subject: `${args.adminName}: your seat on ${CYBER_SECURED_NAME} is waiting`, html: mail.html, text: mail.text, replyTo: args.adminEmail ?? undefined });
      sent.push(to);
    } catch (err) {
      console.error("[team-link] reminder failed", to, err instanceof Error ? err.message : err);
      failed.push(to);
    }
  }
  return { ok: true, sent, joined, removed, recent, offDomain, invalid, failed, overLimit };
}

/* What the portal's team link card needs: the link, the domain it is
 * locked to, and the domain switching the check on would use. */
export async function teamLinkView(orgId: string): Promise<{ token: string; domain: string | null; lockable: string | null } | null> {
  const [link, lead] = await Promise.all([ensureTeamLink(orgId), leadOf(orgId)]);
  if (!link) return null;
  return { token: link.token, domain: link.domain, lockable: defaultTeamDomain(lead.email) };
}
