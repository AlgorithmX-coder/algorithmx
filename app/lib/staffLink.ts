import type { LearnerOrgKind } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { SCHOOLS_EMAIL } from "@/app/lib/schoolOps";
import { licenceHolder } from "@/app/lib/schoolHead";
import {
  checkJoinConfirm,
  domainAccepts,
  makeJoinConfirm,
  newStaffLinkToken,
  schoolDomainFrom,
} from "@/app/lib/staffLinkRule";

/**
 * A school's one staff join link.
 *
 * Owner, 2026-11-26. Per-email invites made the lead type every colleague's
 * address, one at a time. Now the lead forwards ONE link, and any teacher who
 * opens it and signs in joins as a teacher: MANAGER, exactly what a per-email
 * invite gives, never ADMIN. Per-email invites still work alongside it.
 *
 * Lives on SchoolProfile, so firms (which have none) never get one. The pure
 * rules (domains, the token, the confirmation signature) are in
 * staffLinkRule.ts; this file is the database and the email.
 *
 * Joining gives a teacher their own classes and the names of the children in
 * them, so the link is treated as a key: it can be replaced at any time, which
 * kills the old one, and by default it only opens for the school's own email
 * domain, proved by a confirmation email, not merely typed at sign-up.
 */

export interface StaffLink {
  token: string;
  /** The domain the link is locked to, or null when anyone may join. */
  lockedTo: string | null;
  madeAt: Date | null;
  /** The domain the link COULD be locked to: the lead's own, or null when
   *  the lead is on a free provider and there is nothing to lock to. */
  leadDomain: string | null;
}

async function read(orgId: string) {
  return prisma.schoolProfile.findUnique({
    where: { orgId },
    select: { staffLinkToken: true, staffLinkDomain: true, staffLinkMadeAt: true },
  });
}

/**
 * The link, made the first time anybody asks for it.
 *
 * Made lazily rather than in a backfill, so every school that already exists
 * gets one the first time its lead (or staff) opens a screen that shows it.
 * The write is conditional on there being no token yet, so two screens
 * opening at once cannot make two links and leave one of them dead.
 */
export async function ensureStaffLink(orgId: string): Promise<StaffLink | null> {
  const lead = await licenceHolder(orgId);
  const leadDomain = schoolDomainFrom(lead?.email);

  let row = await read(orgId);
  if (!row) return null;
  if (!row.staffLinkToken) {
    await prisma.schoolProfile.updateMany({
      where: { orgId, staffLinkToken: null },
      data: { staffLinkToken: newStaffLinkToken(), staffLinkDomain: leadDomain, staffLinkMadeAt: new Date() },
    });
    row = await read(orgId);
    if (!row?.staffLinkToken) return null;
  }
  return { token: row.staffLinkToken, lockedTo: row.staffLinkDomain, madeAt: row.staffLinkMadeAt, leadDomain };
}

/** A new link. The old one stops working the moment this returns, and so
 *  does every confirmation email sent for it. The lock setting is kept. */
export async function renewStaffLink(orgId: string): Promise<StaffLink | null> {
  const row = await read(orgId);
  if (!row) return null;
  await prisma.schoolProfile.update({
    where: { orgId },
    data: { staffLinkToken: newStaffLinkToken(), staffLinkMadeAt: new Date() },
  });
  return ensureStaffLink(orgId);
}

/** Lock the link to the lead's domain, or open it to any address. */
export async function setStaffLinkLock(
  orgId: string,
  locked: boolean,
): Promise<{ ok: true } | { ok: false; error: "no_domain" | "not_found" }> {
  const link = await ensureStaffLink(orgId);
  if (!link) return { ok: false, error: "not_found" };
  if (locked && !link.leadDomain) return { ok: false, error: "no_domain" };
  await prisma.schoolProfile.update({
    where: { orgId },
    data: { staffLinkDomain: locked ? link.leadDomain : null },
  });
  return { ok: true };
}

export interface StaffLinkTarget {
  orgId: string;
  orgName: string;
  kind: LearnerOrgKind;
  lockedTo: string | null;
  closed: boolean;
}

/** The school a link opens, or null for a link that does not exist or has
 *  been replaced. */
export async function findStaffLink(token: string): Promise<StaffLinkTarget | null> {
  if (!token.startsWith("staff-")) return null;
  const p = await prisma.schoolProfile.findUnique({
    where: { staffLinkToken: token },
    select: { orgId: true, kind: true, staffLinkDomain: true, org: { select: { name: true, revokedAt: true } } },
  });
  if (!p) return null;
  return { orgId: p.orgId, orgName: p.org.name, kind: p.kind, lockedTo: p.staffLinkDomain, closed: p.org.revokedAt !== null };
}

function secret(): string {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

export type StaffLinkRefusal = "not_found" | "closed" | "pupil" | "wrong_domain" | "no_account";

export type StaffLinkVerdict =
  | { state: "refused"; why: StaffLinkRefusal; target: StaffLinkTarget | null }
  | { state: "already"; target: StaffLinkTarget }
  /** Locked link, address at the right domain, not yet proved by email. */
  | { state: "confirm_by_email"; target: StaffLinkTarget; email: string }
  | { state: "ready"; target: StaffLinkTarget };

/**
 * What would happen if this person used this link now. Read by the landing
 * page to decide what to draw, and by the join itself, so the two can never
 * disagree.
 */
export async function judgeStaffLink(token: string, userId: string, confirm?: string | null): Promise<StaffLinkVerdict> {
  const target = await findStaffLink(token);
  if (!target) return { state: "refused", why: "not_found", target: null };
  if (target.closed) return { state: "refused", why: "closed", target };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, role: true } });
  if (!user) return { state: "refused", why: "no_account", target };
  /* A child's account never becomes a teacher's, whatever link it opens. */
  if (user.role === "pupil") return { state: "refused", why: "pupil", target };

  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId: target.orgId, userId } },
    select: { role: true },
  });
  if (member && member.role !== "LEARNER") return { state: "already", target };

  if (!domainAccepts(target.lockedTo, user.email)) return { state: "refused", why: "wrong_domain", target };
  if (target.lockedTo && !checkJoinConfirm(secret(), token, userId, confirm)) {
    return { state: "confirm_by_email", target, email: user.email };
  }
  return { state: "ready", target };
}

/**
 * Use the link. Joins as MANAGER when the verdict is ready, sends the
 * confirmation email when the link is locked and the address is not yet
 * proved, and otherwise changes nothing.
 *
 * Never lowers a role: somebody who already holds the licence and opens
 * their own link stays ADMIN.
 */
export async function joinByStaffLink(args: {
  token: string;
  userId: string;
  confirm?: string | null;
  origin: string;
}): Promise<StaffLinkVerdict & { emailed?: boolean }> {
  const verdict = await judgeStaffLink(args.token, args.userId, args.confirm);

  if (verdict.state === "confirm_by_email") {
    const link = `${args.origin}/schools/join/${encodeURIComponent(args.token)}?confirm=${encodeURIComponent(
      makeJoinConfirm(secret(), args.token, args.userId),
    )}`;
    try {
      await sendStaffLinkConfirm({ to: verdict.email, orgName: verdict.target.orgName, kind: verdict.target.kind, link });
      return { ...verdict, emailed: true };
    } catch (err) {
      console.error("[schools/staff-link] confirm email failed", err instanceof Error ? err.message : err);
      return { ...verdict, emailed: false };
    }
  }

  if (verdict.state === "ready") {
    await prisma.orgMember.upsert({
      where: { orgId_userId: { orgId: verdict.target.orgId, userId: args.userId } },
      /* Only reached for a LEARNER row or none at all: judgeStaffLink
         answers "already" for ADMIN and MANAGER. */
      update: { role: "MANAGER" },
      create: { orgId: verdict.target.orgId, userId: args.userId, role: "MANAGER" },
    });
  }
  return verdict;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function sendStaffLinkConfirm(args: { to: string; orgName: string; kind: LearnerOrgKind; link: string }) {
  const isOrg = args.kind === "ORGANISATION";
  const role = isOrg ? "leader" : "teacher";
  const school = esc(args.orgName);
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">ALGORITHMX &middot; ${isOrg ? "FOR ORGANISATIONS" : "FOR SCHOOLS"}</p>
      <h1 style="font-size:22px;margin:0 0 12px">Confirm it is you joining ${school}</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You asked to join ${school} on AlgorithmX as a ${role}. Press the button to finish. The link works for 24 hours.</p>
      <p style="margin:18px 0 10px"><a href="${args.link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Finish joining</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${args.link}" style="color:#0a7085">${args.link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">If this was not you, ignore this email and nothing happens. Anything we can help with, write to <a href="mailto:${SCHOOLS_EMAIL}" style="color:#0a7085">${SCHOOLS_EMAIL}</a>.</p>
    </div>`;
  const text = `You asked to join ${args.orgName} on AlgorithmX as a ${role}.\n\nFinish joining (works for 24 hours): ${args.link}\n\nIf this was not you, ignore this email and nothing happens.\n`;
  return sendEmail({ to: args.to, subject: `Confirm you are joining ${args.orgName} on AlgorithmX`, html, text, replyTo: SCHOOLS_EMAIL });
}
