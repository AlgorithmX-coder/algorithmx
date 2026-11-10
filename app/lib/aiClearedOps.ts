import { randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { eraseRefusal, planSeats } from "@/app/lib/eraseLearnerRule";
import { opsAlert } from "@/app/lib/opsAlert";
import { AI_CLEARED_SLUG, AI_FLUENT_SLUG, FIRM_ORG } from "@/app/lib/aiCleared";
import { FIRM_THRESHOLD, newInviteToken, seatsLeft, sendAdminWelcome } from "@/app/lib/aiClearedAdmin";
import { checkFirmSeats } from "@/app/lib/firmSeats";
import { moduleListFor } from "@/app/lib/courseModules";
import { COURSES, courseByKey, corporateCourse, courseOfSerial, type CourseSlug } from "@/app/ai-cleared/engine/courses";
import type { OrgPlan } from "@prisma/client";
import { DEFAULT_FIRM } from "@/app/ai-cleared/engine/types";

/* The AlgorithmX side of Cyber Secured: every firm at a glance with its
 * seats and how far its people have got on each track, the totals,
 * creating a firm by hand, and looking a certificate or a person up.
 * Never import from a client component. */

export interface FirmRow {
  id: string;
  slug: string;
  name: string;
  sector: string | null;
  plan: OrgPlan;
  contactName: string | null;
  /* Cyber Secured seats, and the people holding them: one seat each. */
  seatsPurchased: number;
  invited: number;
  claimed: number;
  /* People who finished AI Cleared, and the firm's standing on it. */
  cleared: number;
  pct: number;
  firmCleared: boolean;
  /* People who finished AI Fluent. */
  fluentDone: number;
  certificates: number;
  lastActivity: string | null;
  createdAt: string;
  paidVia: "stripe" | "manual";
  trialExpiresAt: string | null;
  revokedAt: string | null;
}

export async function listFirms(): Promise<FirmRow[]> {
  const orgs = await prisma.organisation.findMany({
    // Schools are Organisation rows too (see SchoolProfile); this list
    // is firm-shaped (seat/course columns), so schools are excluded
    // rather than rendered nonsensically. FIRM_ORG is this same test,
    // shared with the console gates that were missing it.
    where: FIRM_ORG,
    orderBy: { createdAt: "desc" },
    include: {
      seats: { select: { email: true, claimedAt: true } },
      enrolments: { select: { completedAt: true, startedAt: true, modules: { select: { updatedAt: true } }, product: { select: { slug: true } } } },
      _count: { select: { certificates: true } },
    },
  });
  return orgs.map((o) => {
    /* People, not seat rows: someone holding an old Cleared seat and an
       old Fluent seat is one seat of the licence. */
    const people = new Map<string, boolean>();
    for (const s of o.seats) people.set(s.email, (people.get(s.email) ?? false) || !!s.claimedAt);
    const claimed = [...people.values()].filter(Boolean).length;
    const cleared = o.enrolments.filter((e) => e.product.slug === AI_CLEARED_SLUG && e.completedAt).length;
    const pct = claimed ? cleared / claimed : 0;
    const stamps = o.enrolments.flatMap((e) => [e.startedAt, ...e.modules.map((m) => m.updatedAt)]);
    const last = stamps.length ? new Date(Math.max(...stamps.map((d) => d.getTime()))) : null;
    return {
      id: o.id,
      slug: o.slug,
      name: o.name,
      sector: o.sector,
      plan: o.plan,
      contactName: o.contactName,
      seatsPurchased: o.seatsPurchased,
      invited: people.size,
      claimed,
      cleared,
      pct,
      firmCleared: claimed > 0 && pct >= FIRM_THRESHOLD,
      fluentDone: o.enrolments.filter((e) => e.product.slug === AI_FLUENT_SLUG && e.completedAt).length,
      certificates: o._count.certificates,
      lastActivity: last ? last.toISOString() : null,
      createdAt: o.createdAt.toISOString(),
      paidVia: o.stripeCustomerId ? "stripe" : "manual",
      trialExpiresAt: o.trialExpiresAt ? o.trialExpiresAt.toISOString() : null,
      revokedAt: o.revokedAt ? o.revokedAt.toISOString() : null,
    };
  });
}

export function platformTotals(rows: FirmRow[]) {
  return {
    firms: rows.length,
    seatsLicensed: rows.reduce((a, r) => a + r.seatsPurchased, 0),
    seatsInvited: rows.reduce((a, r) => a + r.invited, 0),
    seatsClaimed: rows.reduce((a, r) => a + r.claimed, 0),
    cleared: rows.reduce((a, r) => a + r.cleared, 0),
    fluentDone: rows.reduce((a, r) => a + r.fluentDone, 0),
    certificates: rows.reduce((a, r) => a + r.certificates, 0),
    firmsCleared: rows.filter((r) => r.firmCleared).length,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "firm";
}

/* Create a firm by hand (an invoiced deal, or a test firm) and its admin
 * invite. The admin gets the welcome email under the staff member's name
 * when email is configured; the link comes back either way. */
export async function createFirm(args: {
  name: string;
  sector?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  /* The approved-tool line named at purchase; the firm profile starts from
   * it so the courses never default to Copilot for a Google or ChatGPT firm. */
  approvedTool?: string | null;
  plan: OrgPlan;
  seatsPurchased: number;
  adminEmail: string;
  origin: string;
  staffName: string;
  staffEmail: string | null;
}) {
  const base = slugify(args.name);
  let slug = base;
  for (let i = 2; await prisma.organisation.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  const org = await prisma.organisation.create({
    data: {
      name: args.name.trim(),
      slug,
      sector: args.sector?.trim() || null,
      contactName: args.contactName?.trim() || null,
      contactRole: args.contactRole?.trim() || null,
      plan: args.plan,
      seatsPurchased: args.seatsPurchased,
    },
  });
  if (args.approvedTool) {
    await prisma.firmProfile.create({
      data: {
        orgId: org.id,
        approvedTools: [args.approvedTool],
        askFirstTools: [],
        bannedTools: [...DEFAULT_FIRM.bannedTools],
        escalationContact: args.contactName?.trim() || DEFAULT_FIRM.contactName,
        escalationRole: args.contactRole?.trim() || null,
      },
    });
  }
  const token = newInviteToken(slug.slice(0, 6));
  await prisma.seat.create({ data: { orgId: org.id, email: args.adminEmail.trim().toLowerCase(), inviteToken: token, team: "Admin", role: "ADMIN", course: "CYBER_SECURED" } });
  let emailed = true;
  try {
    await sendAdminWelcome({ to: args.adminEmail, token, firmName: org.name, seats: args.seatsPurchased, origin: args.origin, staffName: args.staffName, staffEmail: args.staffEmail });
  } catch (err) {
    emailed = false;
    console.error("[ai-cleared/ops] admin invite email failed", err instanceof Error ? err.message : err);
    await opsAlert({ what: "An admin welcome email did not send", detail: { firm: org.name, slug, adminEmail: args.adminEmail, link: `${args.origin}/ai-cleared/join/${token}` }, error: err });
  }
  return { org, token, link: `${args.origin}/ai-cleared/join/${token}`, emailed };
}

/* Staff change a firm's Cyber Secured seat count after it was created: an
 * invoice paid for a top-up, a correction, a goodwill seat. Never touches
 * Stripe and takes no money; it only moves the number the invite cap is
 * checked against.
 *
 * The rules live in checkFirmSeats (pure, unit-tested); this recounts the
 * people holding a seat at the moment of saving and runs them again, so a
 * stale screen cannot sneak under the floor. Schools are refused: a school
 * is re-licensed by setPlaces against its place ledger, a different floor.
 *
 * There is no audit table, so the trail is the same one a revoke or a
 * school's place change leaves: an ops alert (Sentry + the ops mailbox)
 * naming who, from, to and why, plus a log line. The write is conditional
 * on the number not having moved since it was read, so two staff saving at
 * once cannot silently overwrite each other. */
export type SetFirmSeatsResult =
  | { ok: true; seats: number; previous: number; held: number }
  | { ok: false; error: "not_found" | "changed_meanwhile"; message: string }
  | { ok: false; error: "invalid"; message: string; held: number };

export async function setFirmSeats(args: {
  orgId: string;
  seats: unknown;
  reason: unknown;
  actor: { name: string; email: string | null };
}): Promise<SetFirmSeatsResult> {
  const org = await prisma.organisation.findFirst({
    where: { id: args.orgId, ...FIRM_ORG },
    select: { id: true, name: true, slug: true, seatsPurchased: true },
  });
  if (!org) return { ok: false, error: "not_found", message: "That firm does not exist." };

  const { used: held } = await seatsLeft(org.id);
  const check = checkFirmSeats({ seats: args.seats, held, current: org.seatsPurchased, reason: args.reason });
  if (!check.ok) return { ok: false, error: "invalid", message: check.message, held };

  /* Saying the same number again changes nothing and alerts nobody. */
  if (check.unchanged) return { ok: true, seats: check.seats, previous: org.seatsPurchased, held };

  const moved = await prisma.organisation.updateMany({
    where: { id: org.id, seatsPurchased: org.seatsPurchased },
    data: { seatsPurchased: check.seats },
  });
  if (moved.count === 0) {
    return { ok: false, error: "changed_meanwhile", message: "Someone else changed this firm's seats a moment ago. Reload the page and try again." };
  }

  const detail = {
    firm: org.name,
    slug: org.slug,
    from: org.seatsPurchased,
    to: check.seats,
    held,
    reason: check.reason,
    changedBy: args.actor.email ?? args.actor.name,
    charged: "no (seat count only, Stripe untouched)",
  };
  console.info("[ops] firm seats changed", JSON.stringify(detail));
  await opsAlert({ what: "Firm seats changed", detail });
  return { ok: true, seats: check.seats, previous: org.seatsPurchased, held };
}

export interface LookupHit {
  kind: "certificate" | "person";
  course: CourseSlug;
  name: string | null;
  email: string;
  firm: string;
  firmSlug: string;
  serial: string | null;
  score: number | null;
  issuedAt: string | null;
  expiresAt: string | null;
  status: "cleared" | "started" | "invited";
  modulesDone: number;
}

/* A serial (AXC- or AXF-XXXX-XXXX) or an email address. A person gets one
 * hit per seat, each with its course. */
export async function lookup(q: string): Promise<LookupHit[]> {
  const s = q.trim();
  if (!s) return [];
  if (/^AX[CF]-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(s)) {
    const c = await prisma.certificate.findUnique({ where: { serial: s.toUpperCase() }, include: { org: true, enrolment: { include: { user: true, product: { select: { slug: true } } } } } });
    if (!c) return [];
    const course = courseOfSerial(c.serial)?.slug ?? (c.enrolment.product.slug === "ai-fluent" ? "ai-fluent" : "ai-cleared");
    const total = moduleListFor(course).filter((m) => m.available).length;
    return [{ kind: "certificate", course, name: c.enrolment.user.name, email: c.enrolment.user.email, firm: c.org.name, firmSlug: c.org.slug, serial: c.serial, score: c.score, issuedAt: c.issuedAt.toISOString(), expiresAt: c.expiresAt.toISOString(), status: "cleared", modulesDone: total }];
  }
  const email = s.toLowerCase();
  const seats = await prisma.seat.findMany({ where: { email }, include: { org: true, user: true }, orderBy: [{ course: "asc" }] });
  const enrolments = await prisma.enrolment.findMany({ where: { user: { email } }, include: { certificate: true, modules: true, org: true, product: { select: { slug: true } } } });
  const byOrgCourse = new Map(enrolments.map((e) => [`${e.orgId}:${e.product.slug}`, e]));
  const hits: LookupHit[] = seats.map((seat) => {
    const course = courseByKey(corporateCourse(seat.course)).slug;
    const e = byOrgCourse.get(`${seat.orgId}:${course}`);
    return {
      kind: "person",
      course,
      name: seat.user?.name ?? null,
      email: seat.email,
      firm: seat.org.name,
      firmSlug: seat.org.slug,
      serial: e?.certificate?.serial ?? null,
      score: e?.certificate?.score ?? e?.finalScore ?? null,
      issuedAt: e?.certificate?.issuedAt.toISOString() ?? null,
      expiresAt: e?.certificate?.expiresAt.toISOString() ?? null,
      status: e?.completedAt ? "cleared" : seat.claimedAt ? "started" : "invited",
      modulesDone: e ? e.modules.filter((m) => m.completedAt).length : 0,
    };
  });
  /* An enrolment whose seat was issued to a different address (the person
   * signed in with another email) still shows, from the enrolment itself. */
  const seen = new Set(seats.map((s) => `${s.orgId}:${courseByKey(corporateCourse(s.course)).slug}`));
  for (const e of enrolments) {
    const course = (e.product.slug === "ai-fluent" ? "ai-fluent" : "ai-cleared") as CourseSlug;
    if (seen.has(`${e.orgId}:${course}`)) continue;
    hits.push({
      kind: "person",
      course,
      name: null,
      email,
      firm: e.org.name,
      firmSlug: e.org.slug,
      serial: e.certificate?.serial ?? null,
      score: e.certificate?.score ?? e.finalScore ?? null,
      issuedAt: e.certificate?.issuedAt.toISOString() ?? null,
      expiresAt: e.certificate?.expiresAt.toISOString() ?? null,
      status: e.completedAt ? "cleared" : "started",
      modulesDone: e.modules.filter((m) => m.completedAt).length,
    });
  }
  return hits;
}

export { COURSES };

/* Deletion on a firm's written request. Who may be erased, and the
 * refusals, are in eraseLearnerRule.ts: a firm learner whose only course
 * access came from their seat goes; an account with a paid consumer
 * course, child profiles or any access of its own does not.
 *
 * What goes, in one transaction: the person's AI-model call log
 * (ModelCall has no relation to User, so nothing would cascade to it),
 * every enrolment with its module progress, sandbox attempts, playbook
 * entries and certificate, their entitlements, firm memberships, sign-in
 * sessions, linked sign-in accounts, password-reset and email sign-in
 * tokens, preferences, waitlist entries, share links they made, and the
 * account itself. Each table is deleted explicitly rather than left to the
 * schema's cascades, so the erase does not quietly depend on them. The
 * seats are planned by planSeats: claimed seats stay, used and anonymised;
 * unclaimed invites are removed. */
export type EraseResult =
  | {
      ok: true;
      deletedAccount: boolean;
      seatsAnonymised: number;
      invitesRemoved: number;
      certificatesRemoved: number;
      firms: string[];
      /* Rows deleted, per table: what the PR and the tests pin. */
      deleted: Record<string, number>;
    }
  | { ok: false; message: string };

export async function eraseLearner(email: string): Promise<EraseResult> {
  const clean = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: clean },
    select: {
      id: true,
      role: true,
      _count: { select: { children: true, proProgress: true, classesTaught: true } },
      entitlements: { select: { source: true, product: { select: { slug: true, name: true } } } },
      enrolments: { select: { id: true, certificate: { select: { id: true } }, org: { select: { name: true } } } },
      orgMemberships: { select: { orgId: true, role: true } },
    },
  });
  /* The seats sent to this address, and any this account claimed under
     another address (a claim binds the seat to whoever signed in). */
  const seats = await prisma.seat.findMany({
    where: { OR: [{ email: clean }, ...(user ? [{ userId: user.id }] : [])] },
    select: { id: true, orgId: true, course: true, userId: true, claimedAt: true, invitedAt: true, org: { select: { name: true } }, user: { select: { email: true } } },
  });
  if (!user && !seats.length) return { ok: false, message: "Nobody with that address is on any firm's register. Nothing has been deleted." };

  const teacherInvites = await prisma.teacherInvite.count({ where: { OR: [{ email: clean }, ...(user ? [{ userId: user.id }] : [])] } });
  const refusal = eraseRefusal({
    role: user?.role ?? "learner",
    entitlements: (user?.entitlements ?? []).map((e) => ({ source: e.source, productSlug: e.product.slug, productName: e.product.name })),
    children: user?._count.children ?? 0,
    proProgress: user?._count.proProgress ?? 0,
    classesTaught: user?._count.classesTaught ?? 0,
    teacherInvites,
  });
  if (refusal) return { ok: false, message: refusal };

  const claimedByOther = seats.find((s) => s.userId && s.userId !== user?.id);
  if (claimedByOther) {
    return { ok: false, message: `A seat sent to that address at ${claimedByOther.org.name} was claimed by a different account (${claimedByOther.user?.email ?? "unknown"}). Check which account is the person's and erase that address. Nothing has been deleted.` };
  }
  for (const m of user?.orgMemberships ?? []) {
    if (m.role !== "ADMIN") continue;
    const otherAdmins = await prisma.orgMember.count({ where: { orgId: m.orgId, role: "ADMIN", NOT: { userId: user!.id } } });
    if (otherAdmins === 0) return { ok: false, message: "That person is the only admin of a firm. Give the firm another admin first. Nothing has been deleted." };
  }

  const plan = planSeats(seats);
  const removedAddress = `removed-${randomBytes(6).toString("hex")}@removed.invalid`;
  const certificates = user?.enrolments.filter((e) => e.certificate).length ?? 0;
  const firms = Array.from(new Set([...(user?.enrolments.map((e) => e.org.name) ?? []), ...seats.map((s) => s.org.name)]));
  const deleted: Record<string, number> = {};
  await prisma.$transaction(async (tx) => {
    for (const id of plan.anonymise) {
      /* A fresh token as well as the address: the old invite link would
         otherwise let anyone holding it claim the now-empty seat. */
      await tx.seat.update({ where: { id }, data: { email: removedAddress, userId: null, inviteToken: newInviteToken("removed"), team: null, trackHint: null } });
    }
    deleted.seat = plan.remove.length ? (await tx.seat.deleteMany({ where: { id: { in: plan.remove } } })).count : 0;
    deleted.verificationToken = (await tx.verificationToken.deleteMany({ where: { identifier: clean } })).count;
    deleted.waitlistEntry = (await tx.waitlistEntry.deleteMany({ where: { email: clean } })).count;
    if (!user) return;
    const userId = user.id;
    const enrolmentId = { in: user.enrolments.map((e) => e.id) };
    deleted.modelCall = (await tx.modelCall.deleteMany({ where: { userId } })).count;
    deleted.playbookEntry = (await tx.playbookEntry.deleteMany({ where: { enrolmentId } })).count;
    deleted.sandboxAttempt = (await tx.sandboxAttempt.deleteMany({ where: { enrolmentId } })).count;
    deleted.moduleProgress = (await tx.moduleProgress.deleteMany({ where: { enrolmentId } })).count;
    deleted.certificate = (await tx.certificate.deleteMany({ where: { enrolmentId } })).count;
    deleted.enrolment = (await tx.enrolment.deleteMany({ where: { userId } })).count;
    deleted.entitlement = (await tx.entitlement.deleteMany({ where: { userId } })).count;
    deleted.orgMember = (await tx.orgMember.deleteMany({ where: { userId } })).count;
    deleted.session = (await tx.session.deleteMany({ where: { userId } })).count;
    deleted.account = (await tx.account.deleteMany({ where: { userId } })).count;
    deleted.passwordResetToken = (await tx.passwordResetToken.deleteMany({ where: { userId } })).count;
    deleted.userPreference = (await tx.userPreference.deleteMany({ where: { userId } })).count;
    deleted.packShareLink = (await tx.packShareLink.deleteMany({ where: { createdById: userId } })).count;
    await tx.user.delete({ where: { id: userId } });
    deleted.user = 1;
  });
  return { ok: true, deletedAccount: !!user, seatsAnonymised: plan.anonymise.length, invitesRemoved: plan.remove.length, certificatesRemoved: certificates, firms, deleted };
}
