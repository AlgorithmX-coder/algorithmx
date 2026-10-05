import { prisma } from "@/app/lib/prisma";
import { opsAlert } from "@/app/lib/opsAlert";
import { AI_CLEARED_SLUG, AI_FLUENT_SLUG } from "@/app/lib/aiCleared";
import { FIRM_THRESHOLD, newInviteToken, sendAdminWelcome } from "@/app/lib/aiClearedAdmin";
import { moduleListFor } from "@/app/lib/courseModules";
import { COURSES, courseByKey, courseOfSerial, type CourseSlug } from "@/app/ai-cleared/engine/courses";
import type { OrgPlan } from "@prisma/client";

/* The AlgorithmX side of both courses: every firm at a glance with its
 * Cleared and Fluent numbers, the totals, creating a firm by hand, and
 * looking a certificate or a person up. Never import from a client
 * component. */

export interface FirmRow {
  id: string;
  slug: string;
  name: string;
  sector: string | null;
  plan: OrgPlan;
  contactName: string | null;
  seatsPurchased: number;
  invited: number;
  claimed: number;
  cleared: number;
  pct: number;
  firmCleared: boolean;
  fluentSeats: number;
  fluentInvited: number;
  fluentClaimed: number;
  fluentDone: number;
  certificates: number;
  lastActivity: string | null;
  createdAt: string;
  paidVia: "stripe" | "manual";
}

export async function listFirms(): Promise<FirmRow[]> {
  const orgs = await prisma.organisation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seats: { select: { claimedAt: true, course: true } },
      enrolments: { select: { completedAt: true, startedAt: true, modules: { select: { updatedAt: true } }, product: { select: { slug: true } } } },
      _count: { select: { certificates: true } },
    },
  });
  return orgs.map((o) => {
    const clearedSeats = o.seats.filter((s) => s.course === "AI_CLEARED");
    const fluentSeats = o.seats.filter((s) => s.course === "AI_FLUENT");
    const claimed = clearedSeats.filter((s) => s.claimedAt).length;
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
      invited: clearedSeats.length,
      claimed,
      cleared,
      pct,
      firmCleared: claimed > 0 && pct >= FIRM_THRESHOLD,
      fluentSeats: o.fluentSeatsPurchased,
      fluentInvited: fluentSeats.length,
      fluentClaimed: fluentSeats.filter((s) => s.claimedAt).length,
      fluentDone: o.enrolments.filter((e) => e.product.slug === AI_FLUENT_SLUG && e.completedAt).length,
      certificates: o._count.certificates,
      lastActivity: last ? last.toISOString() : null,
      createdAt: o.createdAt.toISOString(),
      paidVia: o.stripeCustomerId ? "stripe" : "manual",
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
    fluentLicensed: rows.reduce((a, r) => a + r.fluentSeats, 0),
    fluentClaimed: rows.reduce((a, r) => a + r.fluentClaimed, 0),
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
  plan: OrgPlan;
  seatsPurchased: number;
  fluentSeatsPurchased?: number;
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
      fluentSeatsPurchased: args.fluentSeatsPurchased ?? 0,
    },
  });
  const token = newInviteToken(slug.slice(0, 6));
  await prisma.seat.create({ data: { orgId: org.id, email: args.adminEmail.trim().toLowerCase(), inviteToken: token, team: "Admin", role: "ADMIN" } });
  let emailed = true;
  try {
    await sendAdminWelcome({ to: args.adminEmail, token, firmName: org.name, seats: args.seatsPurchased, fluentSeats: args.fluentSeatsPurchased ?? 0, origin: args.origin, staffName: args.staffName, staffEmail: args.staffEmail });
  } catch (err) {
    emailed = false;
    console.error("[ai-cleared/ops] admin invite email failed", err instanceof Error ? err.message : err);
    await opsAlert({ what: "An admin welcome email did not send", detail: { firm: org.name, slug, adminEmail: args.adminEmail, link: `${args.origin}/ai-cleared/join/${token}` }, error: err });
  }
  return { org, token, link: `${args.origin}/ai-cleared/join/${token}`, emailed };
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
    const course = courseByKey(seat.course).slug;
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
  const seen = new Set(seats.map((s) => `${s.orgId}:${courseByKey(s.course).slug}`));
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

/* Deletion on request. The person's account goes, and with it every
 * enrolment, attempt, progress row, playbook entry and certificate (the
 * schema cascades). Their seats stay on the firm's register, counted as
 * used, with the address replaced so the register no longer carries their
 * data. Refused when the account is also a consumer account (children or
 * course purchases hang off it: that is a different request) or when the
 * person is a firm's only admin. */
export async function eraseLearner(email: string): Promise<
  | { ok: true; deletedAccount: boolean; seatsAnonymised: number; certificatesRemoved: number; firms: string[] }
  | { ok: false; message: string }
> {
  const clean = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: clean },
    select: { id: true, role: true, _count: { select: { children: true, entitlements: true } }, enrolments: { select: { certificate: { select: { id: true } }, org: { select: { name: true } } } }, orgMemberships: { select: { orgId: true, role: true } } },
  });
  const seats = await prisma.seat.findMany({ where: { email: clean }, select: { id: true, orgId: true, role: true, org: { select: { name: true } } } });
  if (!user && !seats.length) return { ok: false, message: "Nobody with that address is on any firm's register." };
  if (user?.role === "staff") return { ok: false, message: "That is a staff account; remove the staff flag first." };
  if (user && (user._count.children > 0 || user._count.entitlements > 0)) return { ok: false, message: "That account also holds consumer courses or child profiles. A consumer deletion is a different request; do it from the database with care." };
  for (const m of user?.orgMemberships ?? []) {
    if (m.role !== "ADMIN") continue;
    const otherAdmins = await prisma.orgMember.count({ where: { orgId: m.orgId, role: "ADMIN", NOT: { userId: user!.id } } });
    if (otherAdmins === 0) return { ok: false, message: "That person is the only admin of a firm. Give the firm another admin first." };
  }
  const stamp = `removed-${Math.random().toString(36).slice(2, 10)}`;
  const certificates = user?.enrolments.filter((e) => e.certificate).length ?? 0;
  const firms = Array.from(new Set([...(user?.enrolments.map((e) => e.org.name) ?? []), ...seats.map((s) => s.org.name)]));
  await prisma.$transaction(async (tx) => {
    if (user) await tx.user.delete({ where: { id: user.id } });
    for (const [i, s] of seats.entries()) await tx.seat.update({ where: { id: s.id }, data: { email: `${stamp}-${i}@removed.invalid`, userId: null } });
  });
  return { ok: true, deletedAccount: !!user, seatsAnonymised: seats.length, certificatesRemoved: certificates, firms };
}
