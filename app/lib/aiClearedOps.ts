import { prisma } from "@/app/lib/prisma";
import { AI_CLEARED_SLUG } from "@/app/lib/aiCleared";
import { FIRM_THRESHOLD, newInviteToken, sendAdminWelcome } from "@/app/lib/aiClearedAdmin";
import { MODULE_LIST } from "@/app/ai-cleared/manifests";
import type { OrgPlan } from "@prisma/client";

/* The AlgorithmX side of AI Cleared: every firm at a glance, the totals,
 * creating a firm by hand, and looking a certificate or a person up.
 * Never import from a client component. */

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
  certificates: number;
  lastActivity: string | null;
  createdAt: string;
  paidVia: "stripe" | "manual";
}

export async function listFirms(): Promise<FirmRow[]> {
  const orgs = await prisma.organisation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seats: { select: { claimedAt: true } },
      enrolments: { select: { completedAt: true, startedAt: true, modules: { select: { updatedAt: true } } } },
      _count: { select: { certificates: true } },
    },
  });
  return orgs.map((o) => {
    const claimed = o.seats.filter((s) => s.claimedAt).length;
    const cleared = o.enrolments.filter((e) => e.completedAt).length;
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
      invited: o.seats.length,
      claimed,
      cleared,
      pct,
      firmCleared: claimed > 0 && pct >= FIRM_THRESHOLD,
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
 * invite. The admin gets the invite email under the staff member's name
 * when email is configured; the link comes back either way. */
export async function createFirm(args: {
  name: string;
  sector?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
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
  const token = newInviteToken(slug.slice(0, 6));
  await prisma.seat.create({ data: { orgId: org.id, email: args.adminEmail.trim().toLowerCase(), inviteToken: token, team: "Admin", role: "ADMIN" } });
  let emailed = true;
  try {
    await sendAdminWelcome({ to: args.adminEmail, token, firmName: org.name, seats: args.seatsPurchased, origin: args.origin, staffName: args.staffName, staffEmail: args.staffEmail });
  } catch (err) {
    emailed = false;
    console.error("[ai-cleared/ops] admin invite email failed", err instanceof Error ? err.message : err);
  }
  return { org, token, link: `${args.origin}/ai-cleared/join/${token}`, emailed };
}

export interface LookupHit {
  kind: "certificate" | "person";
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

/* A serial (AXC-XXXX-XXXX) or an email address. */
export async function lookup(q: string): Promise<LookupHit[]> {
  const s = q.trim();
  if (!s) return [];
  const total = MODULE_LIST.filter((m) => m.available).length;
  if (/^AXC-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(s)) {
    const c = await prisma.certificate.findUnique({ where: { serial: s.toUpperCase() }, include: { org: true, enrolment: { include: { user: true } } } });
    if (!c) return [];
    return [{ kind: "certificate", name: c.enrolment.user.name, email: c.enrolment.user.email, firm: c.org.name, firmSlug: c.org.slug, serial: c.serial, score: c.score, issuedAt: c.issuedAt.toISOString(), expiresAt: c.expiresAt.toISOString(), status: "cleared", modulesDone: total }];
  }
  const email = s.toLowerCase();
  const seats = await prisma.seat.findMany({ where: { email }, include: { org: true, user: true } });
  const enrolments = await prisma.enrolment.findMany({ where: { user: { email }, product: { slug: AI_CLEARED_SLUG } }, include: { certificate: true, modules: true, org: true } });
  const byOrg = new Map(enrolments.map((e) => [e.orgId, e]));
  const hits: LookupHit[] = seats.map((seat) => {
    const e = byOrg.get(seat.orgId);
    return {
      kind: "person",
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
  return hits;
}
