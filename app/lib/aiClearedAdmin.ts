import { randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { DB_TO_TRACK, FIRM_ORG, TRACK_TO_DB } from "@/app/lib/aiCleared";
import { moduleListFor } from "@/app/lib/courseModules";
import { COURSES, type CourseSlug } from "@/app/ai-cleared/engine/courses";
import { CYBER_SECURED_BRAND, CYBER_SECURED_NAME, SECURED_TRACKS, onePerPerson } from "@/app/lib/cyberSecured";
import { opsAlert } from "@/app/lib/opsAlert";
import { TRACK_LABEL, type Track } from "@/app/ai-cleared/engine/types";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import type { FirmProfile, Organisation, OrgRole } from "@prisma/client";

/* Admin-side helpers for both corporate courses: who may administer a
 * firm, the register per course, invites, nudges and the firm profile.
 * Never import from a client component. */

export const FIRM_THRESHOLD = 0.8;

export interface AdminContext {
  orgId: string;
  role: OrgRole;
  org: Organisation & { profile: FirmProfile | null };
  user: { name: string | null; email: string };
  /* True when AlgorithmX staff are acting on a firm from the ops console. */
  staff: boolean;
}

/* The firm a user may administer. With `orgRef` (an id or slug), staff act
 * on that firm as its ADMIN; anyone else gets null. */
export async function getAdminContext(userId: string, orgRef?: string | null): Promise<AdminContext | null> {
  if (!userId) return null;
  if (orgRef) {
    if (!(await isStaffUser(userId))) return null;
    const [org, user] = await Promise.all([
      prisma.organisation.findFirst({ where: { OR: [{ id: orgRef }, { slug: orgRef }], ...FIRM_ORG }, include: { profile: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);
    if (!org || !user) return null;
    return { orgId: org.id, role: "ADMIN", org, user, staff: true };
  }
  /* A FIRM of theirs, not an org of any kind. Without the filter this
     asked only "is this user an ADMIN or MANAGER of anything", and a head
     teacher is an ADMIN of their school, so /ai-cleared redirected them
     into this console and rendered their school as a firm: the seat
     register, the invite form and the approved-AI-tools profile. The
     ordering makes the answer stable for anyone who belongs to two. */
  const member = await prisma.orgMember.findFirst({
    where: { userId, role: { in: ["ADMIN", "MANAGER"] }, org: FIRM_ORG },
    orderBy: { createdAt: "asc" },
    include: { org: { include: { profile: true } }, user: { select: { name: true, email: true } } },
  });
  if (!member) return null;
  return { orgId: member.orgId, role: member.role, org: member.org, user: member.user, staff: false };
}

/* The firm an API call is about: the caller's own firm, or for staff the
 * one named by ?org= on the request. */
export function orgRefOf(req: { url: string }): string | null {
  return new URL(req.url).searchParams.get("org");
}

/* The course an API call or a page is about; AI Cleared unless said. */
export function courseOf(v: unknown): CourseSlug {
  return v === "ai-fluent" ? "ai-fluent" : "ai-cleared";
}

export interface RegisterRow {
  seatId: string;
  course: CourseSlug;
  email: string;
  name: string | null;
  team: string | null;
  role: OrgRole;
  track: Track | null;
  status: "invited" | "started" | "cleared";
  modulesDone: number;
  modulesTotal: number;
  finalScore: number | null;
  serial: string | null;
  certificateExpires: string | null;
  lastActivity: string | null;
  inviteToken: string;
  invitedAt: string;
}

/* Every person holding a seat at the firm, once each (see onePerPerson). */
async function seatsByPerson(orgId: string) {
  return onePerPerson(await prisma.seat.findMany({ where: { orgId }, include: { user: { select: { name: true } } } }));
}

/* The register for one track: every person at the firm, with their
 * enrolment on that track behind a claimed seat. One seat covers every
 * track, so the people are the same on each; only the progress differs.
 * "cleared" means the track is complete. */
export async function getRegister(orgId: string, course: CourseSlug = "ai-cleared"): Promise<RegisterRow[]> {
  const product = await prisma.product.findUnique({ where: { slug: course }, select: { id: true } });
  const [seats, enrolments] = await Promise.all([
    seatsByPerson(orgId),
    prisma.enrolment.findMany({ where: { orgId, ...(product ? { productId: product.id } : { id: "none" }) }, include: { modules: true, certificate: true } }),
  ]);
  const byUser = new Map(enrolments.map((e) => [e.userId, e]));
  const total = moduleListFor(course).filter((m) => m.available).length;
  return seats.map((s) => {
    const enrolment = s.userId ? byUser.get(s.userId) : undefined;
    const done = enrolment ? enrolment.modules.filter((m) => m.completedAt).length : 0;
    const last = enrolment ? [enrolment.startedAt, ...enrolment.modules.map((m) => m.updatedAt)].sort((a, b) => b.getTime() - a.getTime())[0] : null;
    return {
      seatId: s.id,
      course,
      email: s.email,
      name: s.user?.name ?? null,
      team: s.team,
      role: s.role,
      track: enrolment ? DB_TO_TRACK[enrolment.track] : s.trackHint ? DB_TO_TRACK[s.trackHint] : null,
      status: enrolment?.completedAt ? "cleared" : s.claimedAt ? "started" : "invited",
      modulesDone: done,
      modulesTotal: total,
      finalScore: enrolment?.finalScore ?? null,
      serial: enrolment?.certificate?.serial ?? null,
      certificateExpires: enrolment?.certificate?.expiresAt.toISOString() ?? null,
      lastActivity: last ? last.toISOString() : null,
      inviteToken: s.inviteToken,
      invitedAt: s.invitedAt.toISOString(),
    };
  });
}

/* The firm counts as cleared when at least 80% of claimed seats have
 * completed the course (owner decision 2026-09-28). The same sum on Fluent
 * rows gives the completion rate; there is no firm-level Fluent standing. */
export function firmStanding(rows: RegisterRow[]) {
  const claimed = rows.filter((r) => r.status !== "invited").length;
  const cleared = rows.filter((r) => r.status === "cleared").length;
  const pct = claimed ? cleared / claimed : 0;
  return { claimed, cleared, invited: rows.length - claimed, pct, firmCleared: claimed > 0 && pct >= FIRM_THRESHOLD };
}

export function registerCsv(rows: RegisterRow[], firmName: string): string {
  const esc = (v: string | number | null) => (v === null ? "" : `"${String(v).replace(/"/g, '""')}"`);
  const head = ["Firm", "Course", "Email", "Name", "Team", "Track", "Status", "Modules done", "Final score %", "Certificate serial", "Certificate expires", "Last activity", "Invited"];
  const lines = rows.map((r) => [firmName, COURSES[r.course].name, r.email, r.name, r.team, r.track ? TRACK_LABEL[r.track] : null, r.status === "cleared" ? "complete" : r.status, `${r.modulesDone}/${r.modulesTotal}`, r.finalScore, r.serial, r.certificateExpires?.slice(0, 10) ?? null, r.lastActivity?.slice(0, 10) ?? null, r.invitedAt.slice(0, 10)].map(esc).join(","));
  return [head.map(esc).join(","), ...lines].join("\r\n");
}

export function newInviteToken(prefix: string): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const b = randomBytes(12);
  let s = "";
  for (let i = 0; i < 12; i++) s += alphabet[b[i] % alphabet.length];
  return `${prefix}-${s}`;
}
const token = newInviteToken;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/**
 * What a firm may still invite: the Cyber Secured seats it bought, less
 * the people it has already invited.
 *
 * Counted in people, not seat rows, because one seat is one person on
 * every track; someone holding an old Cleared seat and an old Fluent seat
 * is one seat of the licence.
 *
 * Every person counts, whatever their role, including the admin invited
 * along with the firm. It has to be every role for two reasons: the
 * console lets an admin invite a MANAGER or a second ADMIN, and claiming a
 * seat of any role opens every track, so exempting a role would hand free
 * seats to anyone who picked it from the dropdown.
 *
 * Deliberately the same number the console prints as "N invited", so a
 * refusal agrees with what the admin is looking at.
 */
export async function seatsLeft(orgId: string): Promise<{ licensed: number; used: number; left: number }> {
  const [org, people] = await Promise.all([
    prisma.organisation.findUnique({ where: { id: orgId }, select: { seatsPurchased: true } }),
    prisma.seat.findMany({ where: { orgId }, select: { email: true }, distinct: ["email"] }),
  ]);
  const licensed = org?.seatsPurchased ?? 0;
  const used = people.length;
  return { licensed, used, left: Math.max(0, licensed - used) };
}

export type InviteSeatsResult =
  | { ok: true; created: { email: string; token: string }[]; skipped: string[]; emailFailed: string[] }
  | { ok: false; error: "seats_full"; licensed: number; used: number; left: number; asked: number };

/* Create a Cyber Secured seat for each new address and email each an
 * invite link. An address that already holds a seat at the firm, of any
 * kind, is skipped, never duplicated. Emails go out under the admin's name
 * with reply-to set to them. Refused outright once the seats are taken. */
export async function inviteSeats(args: { orgId: string; orgSlug: string; firmName: string; emails: string[]; team?: string | null; track?: Track | null; role?: OrgRole; origin: string; adminName: string; adminEmail: string | null; staff?: boolean }): Promise<InviteSeatsResult> {
  const clean = Array.from(new Set(args.emails.map((e) => e.trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))));
  const existing = await prisma.seat.findMany({ where: { orgId: args.orgId, email: { in: clean } }, select: { email: true } });
  const have = new Set(existing.map((e) => e.email));
  const wanted = clean.filter((e) => !have.has(e));

  /* The licence, enforced. Until this check a firm that bought ten seats
     could invite five hundred and every one of them got the course: the
     purchased count was taken at checkout, shown on this very screen, and
     never compared against anything. The whole batch is refused rather
     than its first few, because quietly taking part of a pasted list
     leaves an admin with no way of knowing which addresses went out.
     AlgorithmX staff acting on a firm from the ops console are not
     capped, and must not be: a firm's seat count can only be set when
     the firm is created, so until there is a control for changing it,
     going over is the only way to honour "add two seats and invoice us".
     The leak this closes is the firm's own admin, who cannot reach that
     path (orgRef is refused to anyone who is not staff).

     Two admins inviting in the same second can still overshoot by a seat
     or two, the same bounded race the school side lives with; closing
     that needs a constraint in the database, not a second read here. */
  const standing = await seatsLeft(args.orgId);
  if (!args.staff && wanted.length > standing.left) {
    return { ok: false, error: "seats_full", licensed: standing.licensed, used: standing.used, left: standing.left, asked: wanted.length };
  }

  const created: { email: string; token: string }[] = [];
  const failed: string[] = [];
  for (const email of wanted) {
    const t = token(args.orgSlug.slice(0, 6));
    await prisma.seat.create({ data: { orgId: args.orgId, email, inviteToken: t, team: args.team ?? null, trackHint: args.track ? TRACK_TO_DB[args.track] : null, role: args.role ?? "LEARNER", course: "CYBER_SECURED" } });
    created.push({ email, token: t });
    try {
      await sendInvite({ to: email, token: t, firmName: args.firmName, origin: args.origin, adminName: args.adminName, adminEmail: args.adminEmail });
    } catch (err) {
      console.error("[ai-cleared/admin] invite email failed", email, err instanceof Error ? err.message : err);
      failed.push(email);
    }
  }
  if (failed.length) await opsAlert({ what: "Invite emails did not send", detail: { firm: args.firmName, failed, origin: args.origin, links: created.filter((c) => failed.includes(c.email)).map((c) => `${c.email}: ${args.origin}/ai-cleared/join/${c.token}`) } });
  return { ok: true, created, skipped: clean.filter((e) => have.has(e)), emailFailed: failed };
}

/* The tracks a seat opens, as list items for an email: the live ones only,
 * so nothing is promised before it is built. */
function trackItems(): { html: string; text: string } {
  const live = SECURED_TRACKS.filter((t) => t.live);
  return {
    html: `<ul style="font-size:15px;line-height:1.55;margin:0 0 12px;padding-left:20px">${live.map((t) => `<li><b>${esc(t.name)}</b>: ${esc(t.line)}</li>`).join("")}</ul>`,
    text: live.map((t) => `- ${t.name}: ${t.line}`).join("\n"),
  };
}

export async function sendInvite(args: { to: string; token: string; firmName: string; origin: string; adminName: string; adminEmail: string | null }) {
  const link = `${args.origin}/ai-cleared/join/${args.token}`;
  const items = trackItems();
  const lead = `${esc(args.adminName)} has given you a seat on ${CYBER_SECURED_NAME}. It opens every course below. Take them in any order, whenever suits, and stop and resume as you like.`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">${CYBER_SECURED_BRAND}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${esc(args.firmName)} has reserved you a seat on ${CYBER_SECURED_NAME}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${lead}</p>
      ${items.html}
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Claim my seat</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Questions go to ${esc(args.adminName)}${args.adminEmail ? ` (${esc(args.adminEmail)})` : ""}.</p>
    </div>`;
  const text = `${args.firmName} has reserved you a seat on ${CYBER_SECURED_NAME}.\n\n${args.adminName} has given you a seat on ${CYBER_SECURED_NAME}. It opens every course below, in any order, whenever suits:\n${items.text}\n\nClaim your seat: ${link}\n`;
  return sendEmail({ to: args.to, subject: `${args.adminName} has given you a seat on ${CYBER_SECURED_NAME} at ${args.firmName}`, html, text, replyTo: args.adminEmail ?? undefined });
}

/* The welcome to a firm's first admin, after a purchase or a hand set-up.
 * Different from a staff invite: this person runs the course for the
 * firm, so the email says what they can do and where. */
export async function sendAdminWelcome(args: { to: string; token: string; firmName: string; seats: number; origin: string; staffName: string; staffEmail: string | null }) {
  const link = `${args.origin}/ai-cleared/join/${args.token}`;
  const seatLine = `${args.seats} ${CYBER_SECURED_NAME} ${args.seats === 1 ? "seat" : "seats"}`;
  const items = trackItems();
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">${CYBER_SECURED_BRAND}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${seatLine} ${args.seats === 1 ? "is" : "are"} ready for ${esc(args.firmName)}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You are the admin for ${esc(args.firmName)}. Set up your account from the link below, then invite your staff from the admin console: paste their email addresses and each person gets their own invite. One seat is one person, and it opens every course:</p>
      ${items.html}
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">The same console shows how far everyone has got. Your own seat is included, so you can take the courses too.</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Set up my admin account</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Questions go to ${esc(args.staffName)}${args.staffEmail ? ` (${esc(args.staffEmail)})` : ""}.</p>
    </div>`;
  const text = `${seatLine} ${args.seats === 1 ? "is" : "are"} ready for ${args.firmName}.\n\nYou are the admin. Set up your account, then invite your staff from the admin console. One seat is one person, and it opens every course:\n${items.text}\n\nThe same console shows how far everyone has got. Your own seat is included.\n\nSet up your admin account: ${link}\n`;
  return sendEmail({ to: args.to, subject: `${CYBER_SECURED_NAME} is ready for ${args.firmName}: ${seatLine}`, html, text, replyTo: args.staffEmail ?? undefined });
}

/* Seats bought by card by an admin who already runs a firm: no new firm,
 * no new invite, just the count going up and a note saying so. */
export async function sendSeatsAdded(args: { to: string; firmName: string; seats: number; origin: string; staffName: string; staffEmail: string | null }) {
  const link = `${args.origin}/ai-cleared/admin`;
  const seatLine = `${args.seats} ${CYBER_SECURED_NAME} ${args.seats === 1 ? "seat" : "seats"}`;
  const claim = "Each person you invite gets their own link, claims their seat on first sign-in, and has every course from then on.";
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">${CYBER_SECURED_BRAND}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${seatLine} added to ${esc(args.firmName)}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">Thank you. The seats are on your firm's account now and the admin console shows the new total. Invite staff from there: paste their email addresses and each person gets their own invite. ${claim}</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Open the admin console</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Your VAT invoice comes separately from Stripe. Questions go to ${esc(args.staffName)}${args.staffEmail ? ` (${esc(args.staffEmail)})` : ""}.</p>
    </div>`;
  const text = `${seatLine} added to ${args.firmName}.\n\nThe seats are on your firm's account now and the admin console shows the new total. Invite staff from there. ${claim}\n\nAdmin console: ${link}\n`;
  return sendEmail({ to: args.to, subject: `${seatLine} added to ${args.firmName}`, html, text, replyTo: args.staffEmail ?? undefined });
}

/* A reminder to everyone on a course who has not finished, under the
 * admin's name. */
export async function nudge(args: { orgId: string; firmName: string; origin: string; adminName: string; adminEmail: string | null; course?: CourseSlug }) {
  const course = args.course ?? "ai-cleared";
  const c = COURSES[course];
  const rows = await getRegister(args.orgId, course);
  const targets = rows.filter((r) => r.status !== "cleared" && r.role !== "ADMIN");
  let sent = 0;
  const failed: string[] = [];
  for (const r of targets) {
    const link = r.status === "invited" ? `${args.origin}/ai-cleared/join/${r.inviteToken}` : `${args.origin}${c.base}`;
    const line = r.status === "invited" ? `Your seat is still waiting. It takes ${c.length}, and you can stop and resume.` : `You have done ${r.modulesDone} of ${r.modulesTotal} modules. You can stop and resume whenever suits.`;
    const html = `
      <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
        <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">${c.brand}</p>
        <h1 style="font-size:22px;margin:0 0 12px">A reminder from ${esc(args.adminName)}</h1>
        <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${line}</p>
        <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">${r.status === "invited" ? "Claim my seat" : "Continue the course"}</a></p>
        <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">${esc(args.adminName)}, ${esc(args.firmName)}</p>
      </div>`;
    try {
      await sendEmail({ to: r.email, subject: `${args.adminName}: a reminder about ${c.name}`, html, text: `${line}\n\n${link}\n`, replyTo: args.adminEmail ?? undefined });
      sent++;
    } catch (err) {
      console.error("[ai-cleared/admin] nudge failed", r.email, err instanceof Error ? err.message : err);
      failed.push(r.email);
    }
  }
  return { sent, failed, eligible: targets.length };
}

export interface ProfileInput {
  approvedTools: string[];
  askFirstTools: string[];
  bannedTools: string[];
  escalationContact: string;
  escalationRole: string;
  regulator: string;
  classPublic: string;
  classInternal: string;
  classConfidential: string;
  classRestricted: string;
}

export async function saveProfile(orgId: string, p: ProfileInput) {
  const data = {
    approvedTools: p.approvedTools,
    askFirstTools: p.askFirstTools,
    bannedTools: p.bannedTools,
    escalationContact: p.escalationContact.trim(),
    escalationRole: p.escalationRole.trim() || null,
    regulator: p.regulator.trim() || null,
    classPublic: p.classPublic.trim() || "PUBLIC",
    classInternal: p.classInternal.trim() || "INTERNAL",
    classConfidential: p.classConfidential.trim() || "CONFIDENTIAL",
    classRestricted: p.classRestricted.trim() || "RESTRICTED",
  };
  return prisma.firmProfile.upsert({ where: { orgId }, update: data, create: { orgId, ...data } });
}
