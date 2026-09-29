import { randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { AI_CLEARED_SLUG, DB_TO_TRACK, TRACK_TO_DB } from "@/app/lib/aiCleared";
import { MODULE_LIST } from "@/app/ai-cleared/manifests";
import { TRACK_LABEL, type Track } from "@/app/ai-cleared/engine/types";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import type { FirmProfile, Organisation, OrgRole } from "@prisma/client";

/* Admin-side helpers for AI Cleared: who may administer a firm, the
 * register, invites, nudges and the firm profile. Never import from a
 * client component. */

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
      prisma.organisation.findFirst({ where: { OR: [{ id: orgRef }, { slug: orgRef }] }, include: { profile: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);
    if (!org || !user) return null;
    return { orgId: org.id, role: "ADMIN", org, user, staff: true };
  }
  const member = await prisma.orgMember.findFirst({
    where: { userId, role: { in: ["ADMIN", "MANAGER"] } },
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

export interface RegisterRow {
  seatId: string;
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

export async function getRegister(orgId: string): Promise<RegisterRow[]> {
  const product = await prisma.product.findUnique({ where: { slug: AI_CLEARED_SLUG }, select: { id: true } });
  const [seats, enrolments] = await Promise.all([
    prisma.seat.findMany({ where: { orgId }, orderBy: [{ claimedAt: "asc" }, { invitedAt: "asc" }], include: { user: { select: { name: true } } } }),
    prisma.enrolment.findMany({ where: { orgId, ...(product ? { productId: product.id } : {}) }, include: { modules: true, certificate: true } }),
  ]);
  const byUser = new Map(enrolments.map((e) => [e.userId, e]));
  const total = MODULE_LIST.filter((m) => m.available).length;
  return seats.map((s) => {
    const enrolment = s.userId ? byUser.get(s.userId) : undefined;
    const done = enrolment ? enrolment.modules.filter((m) => m.completedAt).length : 0;
    const last = enrolment ? [enrolment.startedAt, ...enrolment.modules.map((m) => m.updatedAt)].sort((a, b) => b.getTime() - a.getTime())[0] : null;
    return {
      seatId: s.id,
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
 * completed the course (owner decision 2026-09-28). */
export function firmStanding(rows: RegisterRow[]) {
  const claimed = rows.filter((r) => r.status !== "invited").length;
  const cleared = rows.filter((r) => r.status === "cleared").length;
  const pct = claimed ? cleared / claimed : 0;
  return { claimed, cleared, invited: rows.length - claimed, pct, firmCleared: claimed > 0 && pct >= FIRM_THRESHOLD };
}

export function registerCsv(rows: RegisterRow[], firmName: string): string {
  const esc = (v: string | number | null) => (v === null ? "" : `"${String(v).replace(/"/g, '""')}"`);
  const head = ["Firm", "Email", "Name", "Team", "Track", "Status", "Modules cleared", "Final score %", "Certificate serial", "Certificate expires", "Last activity", "Invited"];
  const lines = rows.map((r) => [firmName, r.email, r.name, r.team, r.track ? TRACK_LABEL[r.track] : null, r.status, `${r.modulesDone}/${r.modulesTotal}`, r.finalScore, r.serial, r.certificateExpires?.slice(0, 10) ?? null, r.lastActivity?.slice(0, 10) ?? null, r.invitedAt.slice(0, 10)].map(esc).join(","));
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

/* Create seats for new addresses and email each an invite link. Existing
 * addresses are skipped, never duplicated. Emails go out under the
 * admin's name with reply-to set to them. */
export async function inviteSeats(args: { orgId: string; orgSlug: string; firmName: string; emails: string[]; team?: string | null; track?: Track | null; role?: OrgRole; origin: string; adminName: string; adminEmail: string | null }) {
  const clean = Array.from(new Set(args.emails.map((e) => e.trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))));
  const existing = await prisma.seat.findMany({ where: { orgId: args.orgId, email: { in: clean } }, select: { email: true } });
  const have = new Set(existing.map((e) => e.email));
  const created: { email: string; token: string }[] = [];
  const failed: string[] = [];
  for (const email of clean) {
    if (have.has(email)) continue;
    const t = token(args.orgSlug.slice(0, 6));
    await prisma.seat.create({ data: { orgId: args.orgId, email, inviteToken: t, team: args.team ?? null, trackHint: args.track ? TRACK_TO_DB[args.track] : null, role: args.role ?? "LEARNER" } });
    created.push({ email, token: t });
    try {
      await sendInvite({ to: email, token: t, firmName: args.firmName, origin: args.origin, adminName: args.adminName, adminEmail: args.adminEmail });
    } catch (err) {
      console.error("[ai-cleared/admin] invite email failed", email, err instanceof Error ? err.message : err);
      failed.push(email);
    }
  }
  return { created, skipped: clean.filter((e) => have.has(e)), emailFailed: failed };
}

export async function sendInvite(args: { to: string; token: string; firmName: string; origin: string; adminName: string; adminEmail: string | null }) {
  const link = `${args.origin}/ai-cleared/join/${args.token}`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">AI CLEARED</p>
      <h1 style="font-size:22px;margin:0 0 12px">${esc(args.firmName)} has reserved you a seat on AI Cleared.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${esc(args.adminName)} has enrolled you on AI Cleared, about ninety minutes in five short modules on using AI tools safely at work. You practise inside a copy of the tool you already use, on invented data, and a certificate issues at the end.</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Claim my seat</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Questions go to ${esc(args.adminName)}${args.adminEmail ? ` (${esc(args.adminEmail)})` : ""}.</p>
    </div>`;
  const text = `${args.firmName} has reserved you a seat on AI Cleared.\n\n${args.adminName} has enrolled you on AI Cleared, about ninety minutes in five short modules on using AI tools safely at work.\n\nClaim your seat: ${link}\n`;
  return sendEmail({ to: args.to, subject: `${args.adminName} has enrolled you on AI Cleared at ${args.firmName}`, html, text, replyTo: args.adminEmail ?? undefined });
}

/* The welcome to a firm's first admin, after a purchase or a hand set-up.
 * Different from a staff invite: this person runs the course for the
 * firm, so the email says what they can do and where. */
export async function sendAdminWelcome(args: { to: string; token: string; firmName: string; seats: number; origin: string; staffName: string; staffEmail: string | null }) {
  const link = `${args.origin}/ai-cleared/join/${args.token}`;
  const seatLine = `${args.seats} ${args.seats === 1 ? "seat" : "seats"}`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">AI CLEARED</p>
      <h1 style="font-size:22px;margin:0 0 12px">${seatLine} on AI Cleared are ready for ${esc(args.firmName)}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You are the admin for ${esc(args.firmName)}. Set up your account from the link below, then invite your staff from the admin console: paste their email addresses and each person gets their own invite. The same console shows who has finished, and their certificates.</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">Your own seat is included, so you can take the course too: about ninety minutes in five short modules, practised inside a copy of the tool your firm uses, on invented data.</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Set up my admin account</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Questions go to ${esc(args.staffName)}${args.staffEmail ? ` (${esc(args.staffEmail)})` : ""}.</p>
    </div>`;
  const text = `${seatLine} on AI Cleared are ready for ${args.firmName}.

You are the admin. Set up your account, then invite your staff from the admin console; the same console shows who has finished and their certificates. Your own seat is included.

Set up your admin account: ${link}
`;
  return sendEmail({ to: args.to, subject: `AI Cleared is ready for ${args.firmName}: ${seatLine}`, html, text, replyTo: args.staffEmail ?? undefined });
}

/* A reminder to everyone who has not finished, under the admin's name. */
export async function nudge(args: { orgId: string; firmName: string; origin: string; adminName: string; adminEmail: string | null }) {
  const rows = await getRegister(args.orgId);
  const targets = rows.filter((r) => r.status !== "cleared" && r.role !== "ADMIN");
  let sent = 0;
  const failed: string[] = [];
  for (const r of targets) {
    const link = r.status === "invited" ? `${args.origin}/ai-cleared/join/${r.inviteToken}` : `${args.origin}/ai-cleared`;
    const line = r.status === "invited" ? "Your seat is still waiting. It takes about ninety minutes, in five short modules, and you can stop and resume." : `You have cleared ${r.modulesDone} of ${r.modulesTotal} modules. The rest takes under an hour, and you can stop and resume.`;
    const html = `
      <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
        <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">AI CLEARED</p>
        <h1 style="font-size:22px;margin:0 0 12px">A reminder from ${esc(args.adminName)}</h1>
        <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${line}</p>
        <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">${r.status === "invited" ? "Claim my seat" : "Continue the course"}</a></p>
        <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">${esc(args.adminName)}, ${esc(args.firmName)}</p>
      </div>`;
    try {
      await sendEmail({ to: r.email, subject: `${args.adminName}: a reminder about AI Cleared`, html, text: `${line}\n\n${link}\n`, replyTo: args.adminEmail ?? undefined });
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
