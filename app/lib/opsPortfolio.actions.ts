"use server";

/**
 * Cyber Ops persistence — the server actions behind a real engagement.
 *
 * Week progress + reputation reuse the platform Progress spine (one row per
 * child x product x week; reputation lives in Progress.xp, max-merged). The
 * portfolio — the pentest-style finding each engagement files — is the tier's
 * own OpsFinding table. Filing an engagement does both in one call so the
 * report screen can show the learner their real, saved rank and portfolio.
 *
 * The learner is the ChildProfile on the signed-in family account (for 14-17
 * that profile is the teen). We resolve the active child from the session, so
 * nothing child-identifying is ever trusted from the client.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { upsertProgress, resolveActiveChildProfileId } from "@/app/lib/progressService";
import { rankFor, type RankStatus } from "@/app/lib/opsRank";
import type { OpsSeverity } from "@prisma/client";

const PRODUCT_SLUG = "cyberstart";

/** The beats a module can resume into. The two opening beats (intro/brief) and
 *  the report beat aren't resumable, so reaching any of those clears the row. */
const RESUMABLE_BEATS = new Set(["lesson", "authorize", "act", "drills", "challenge", "defend"]);

/** The finding a module files, sent from the client at the report beat.
 *  `module` is the learner-facing unit (1-20); it maps to the shared
 *  Progress.week column at the DB boundary below. */
export type FileEngagementInput = {
  module: number;
  callsign: string;
  rep: number;
  flag: string;
  finding: {
    title: string;
    severity: OpsSeverity;
    cvss: string;
    location: string;
    impact: string;
    fix: string;
  };
};

export type FileEngagementResult =
  | { ok: true; totalRep: number; rank: RankStatus }
  | { ok: false; reason: "unauthenticated" | "no_learner" | "invalid" | "content_missing" };

function cleanCallsign(raw: string): string {
  return (raw || "").trim().toUpperCase().slice(0, 14) || "OPERATOR";
}

export async function fileEngagement(input: FileEngagementInput): Promise<FileEngagementResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, reason: "unauthenticated" };

  if (
    !Number.isInteger(input?.module) ||
    input.module < 1 ||
    input.module > 20 ||
    !input.finding?.title
  ) {
    return { ok: false, reason: "invalid" };
  }

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return { ok: false, reason: "no_learner" };

  const rep = Number.isFinite(input.rep) && input.rep > 0 ? Math.trunc(input.rep) : 0;
  // The learner-facing "module" is stored in the shared Progress.week column.
  const week = input.module;

  // 1. Progress + reputation (reputation = xp, max-merged, module completed).
  const prog = await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week,
    screen: 6, // the six-beat module is fully walked at report
    stars: 3,
    xp: rep,
    completed: true,
  });
  if (!prog.ok) {
    // The only expected failure here is missing CourseContent for the module
    // (the data migration hasn't reached this DB yet).
    return { ok: false, reason: "content_missing" };
  }

  // 2. Portfolio finding (one per child x module; re-filing updates in place).
  await prisma.opsFinding.upsert({
    where: { childProfileId_week: { childProfileId, week } },
    create: {
      childProfileId,
      week,
      callsign: cleanCallsign(input.callsign),
      title: input.finding.title,
      severity: input.finding.severity,
      cvss: input.finding.cvss,
      location: input.finding.location,
      impact: input.finding.impact,
      fix: input.finding.fix,
      flag: input.flag,
    },
    update: {
      callsign: cleanCallsign(input.callsign),
      title: input.finding.title,
      severity: input.finding.severity,
      cvss: input.finding.cvss,
      location: input.finding.location,
      impact: input.finding.impact,
      fix: input.finding.fix,
      flag: input.flag,
    },
  });

  // The module is finished, so there's nothing left to resume.
  await prisma.opsResume.deleteMany({ where: { childProfileId, week } });

  // 3. Real total reputation = sum of per-week xp for this child x product.
  const agg = await prisma.progress.aggregate({
    where: { childProfileId, product: { slug: PRODUCT_SLUG } },
    _sum: { xp: true },
  });
  const totalRep = agg._sum.xp ?? rep;

  return { ok: true, totalRep, rank: rankFor(totalRep) };
}

/** A learner's full Cyber Ops portfolio + standing, for the portfolio page. */
export type OpsPortfolio = {
  callsign: string | null;
  totalRep: number;
  rank: RankStatus;
  completedModules: number;
  findings: {
    module: number;
    title: string;
    severity: OpsSeverity;
    cvss: string;
    location: string;
    impact: string;
    fix: string;
    flag: string;
    filedAt: Date;
  }[];
};

export async function getPortfolio(): Promise<OpsPortfolio | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) {
    return { callsign: null, totalRep: 0, rank: rankFor(0), completedModules: 0, findings: [] };
  }

  const [rows, agg, completed] = await Promise.all([
    prisma.opsFinding.findMany({
      where: { childProfileId },
      orderBy: { week: "asc" },
    }),
    prisma.progress.aggregate({
      where: { childProfileId, product: { slug: PRODUCT_SLUG } },
      _sum: { xp: true },
    }),
    prisma.progress.count({
      where: { childProfileId, product: { slug: PRODUCT_SLUG }, completedAt: { not: null } },
    }),
  ]);

  const totalRep = agg._sum.xp ?? 0;
  return {
    callsign: rows[rows.length - 1]?.callsign ?? null,
    totalRep,
    rank: rankFor(totalRep),
    completedModules: completed,
    findings: rows.map((r) => ({
      module: r.week,
      title: r.title,
      severity: r.severity,
      cvss: r.cvss,
      location: r.location,
      impact: r.impact,
      fix: r.fix,
      flag: r.flag,
      filedAt: r.createdAt,
    })),
  };
}

// ---------------------------------------------------------------------------
// Save/resume (account-wide). The learner's current section (beat) per module,
// stored server-side so a module reopens where they left off on any device.
// ---------------------------------------------------------------------------

/** Called by the live shell whenever the beat changes. A resumable beat is
 *  upserted; reaching intro/brief/report (or starting over) clears the row. */
export async function saveOpsResume(module: number, beat: string, callsign?: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  if (!Number.isInteger(module) || module < 1 || module > 20) return;

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return;

  if (!RESUMABLE_BEATS.has(beat)) {
    await prisma.opsResume.deleteMany({ where: { childProfileId, week: module } });
    return;
  }

  const cs = (callsign || "").trim().slice(0, 14) || null;
  await prisma.opsResume.upsert({
    where: { childProfileId_week: { childProfileId, week: module } },
    create: { childProfileId, week: module, beat, callsign: cs },
    update: { beat, ...(cs ? { callsign: cs } : {}) },
  });
}

/** The saved resume point for one module (null if none / not resumable). */
export async function getOpsResume(module: number): Promise<{ beat: string; callsign: string | null } | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  if (!Number.isInteger(module) || module < 1 || module > 20) return null;

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return null;

  const row = await prisma.opsResume.findUnique({
    where: { childProfileId_week: { childProfileId, week: module } },
    select: { beat: true, callsign: true },
  });
  if (!row || !RESUMABLE_BEATS.has(row.beat)) return null;
  return { beat: row.beat, callsign: row.callsign };
}

/** Every in-progress module for the signed-in learner, for the portfolio's
 *  "Continue where you left off" strip. */
export async function getOpsResumes(): Promise<{ module: number; beat: string }[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return [];

  const rows = await prisma.opsResume.findMany({
    where: { childProfileId },
    select: { week: true, beat: true },
    orderBy: { week: "asc" },
  });
  return rows.filter((r) => RESUMABLE_BEATS.has(r.beat)).map((r) => ({ module: r.week, beat: r.beat }));
}
