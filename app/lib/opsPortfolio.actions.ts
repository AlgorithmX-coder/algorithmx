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

/** The finding a week files, sent from the client at the report beat. */
export type FileEngagementInput = {
  week: number;
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
    !Number.isInteger(input?.week) ||
    input.week < 1 ||
    input.week > 16 ||
    !input.finding?.title
  ) {
    return { ok: false, reason: "invalid" };
  }

  const childProfileId = await resolveActiveChildProfileId(userId);
  if (!childProfileId) return { ok: false, reason: "no_learner" };

  const rep = Number.isFinite(input.rep) && input.rep > 0 ? Math.trunc(input.rep) : 0;

  // 1. Progress + reputation (reputation = xp, max-merged, week completed).
  const prog = await upsertProgress({
    userId,
    childProfileId,
    productSlug: PRODUCT_SLUG,
    week: input.week,
    screen: 6, // the six-beat engagement is fully walked at report
    stars: 3,
    xp: rep,
    completed: true,
  });
  if (!prog.ok) {
    // The only expected failure here is missing CourseContent for the week
    // (the data migration hasn't reached this DB yet).
    return { ok: false, reason: "content_missing" };
  }

  // 2. Portfolio finding (one per child x week; re-filing updates in place).
  await prisma.opsFinding.upsert({
    where: { childProfileId_week: { childProfileId, week: input.week } },
    create: {
      childProfileId,
      week: input.week,
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
  completedWeeks: number;
  findings: {
    week: number;
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
    return { callsign: null, totalRep: 0, rank: rankFor(0), completedWeeks: 0, findings: [] };
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
    completedWeeks: completed,
    findings: rows.map((r) => ({
      week: r.week,
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
