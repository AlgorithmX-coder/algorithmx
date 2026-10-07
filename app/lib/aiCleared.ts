import { prisma } from "@/app/lib/prisma";
import { grantEntitlement } from "@/app/lib/entitlements";
import type { ClearedTrack, CourseKey, FluentVerdict, ModulePhase, SandboxTool, SandboxVerdict } from "@prisma/client";
import {
  CLASS_DEFAULT_NAME,
  DEFAULT_FIRM,
  type FirmView,
  type Phase,
  type Tool,
  type Track,
  type Verdict,
} from "@/app/ai-cleared/engine/types";
import { COURSES, courseByKey, corporateCourse, type CourseSlug } from "@/app/ai-cleared/engine/courses";
import { moduleListFor } from "@/app/lib/courseModules";

/* Server-side helpers for the corporate courses, AI Cleared and AI Fluent.
 * Both share firms, seats, logins and this file; a course slug picks the
 * product. Never import from a client component: this file reaches Prisma. */

export const AI_CLEARED_SLUG = "ai-cleared";
export const AI_FLUENT_SLUG = "ai-fluent";

export const TRACK_TO_DB: Record<Track, ClearedTrack> = {
  finance: "FINANCE",
  legal: "LEGAL",
  hr: "HR",
  sales: "SALES",
  support: "SUPPORT",
  ops: "OPS",
  it: "IT",
  leadership: "LEADERSHIP",
  general: "GENERAL",
};
export const DB_TO_TRACK: Record<ClearedTrack, Track> = Object.fromEntries(
  Object.entries(TRACK_TO_DB).map(([k, v]) => [v, k]),
) as Record<ClearedTrack, Track>;

export const PHASE_TO_DB: Record<Phase, ModulePhase> = { learn: "LEARN", practise: "PRACTISE", prove: "PROVE", done: "DONE" };
export const DB_TO_PHASE: Record<ModulePhase, Phase> = { LEARN: "learn", PRACTISE: "practise", PROVE: "prove", DONE: "done" };
export const TOOL_TO_DB: Record<Tool, SandboxTool> = { copilot: "COPILOT", chatgpt: "CHATGPT", gemini: "GEMINI", claude: "CLAUDE" };
export const VERDICT_TO_DB: Record<Verdict, SandboxVerdict> = { ok: "OK", warn: "WARN", crit: "CRIT" };
export const DB_TO_VERDICT: Record<SandboxVerdict, Verdict> = { OK: "ok", WARN: "warn", CRIT: "crit" };
const VERDICT_SEVERITY: Record<SandboxVerdict, number> = { OK: 0, WARN: 1, CRIT: 2 };

/* AI Fluent's three verdicts, client word to database word. Lower rank is
 * better, so the register keeps the best a learner reached. */
export type FluentWord = "fluent" | "nearly" | "notyet";
export const FLUENT_TO_DB: Record<FluentWord, FluentVerdict> = { fluent: "FLUENT", nearly: "NEARLY", notyet: "NOT_YET" };
export const DB_TO_FLUENT: Record<FluentVerdict, FluentWord> = { FLUENT: "fluent", NEARLY: "nearly", NOT_YET: "notyet" };
const FLUENT_RANK: Record<FluentVerdict, number> = { FLUENT: 0, NEARLY: 1, NOT_YET: 2 };

/* The learner's enrolment on a course with everything a module page needs. */
export async function getEnrolment(userId: string, course: CourseSlug = "ai-cleared") {
  if (!userId) return null;
  return prisma.enrolment.findFirst({
    where: { userId, product: { slug: course } },
    include: {
      org: { include: { profile: true } },
      modules: { orderBy: { module: "asc" } },
      user: { select: { name: true, email: true } },
      product: { select: { slug: true } },
    },
  });
}
export type EnrolmentWithOrg = NonNullable<Awaited<ReturnType<typeof getEnrolment>>>;

/* Both enrolments at once, for the home pages' cross-links. */
export async function getEnrolments(userId: string) {
  const [cleared, fluent] = await Promise.all([getEnrolment(userId, "ai-cleared"), getEnrolment(userId, "ai-fluent")]);
  return { cleared, fluent };
}

/* The client-safe view of the firm. A firm with no profile yet gets the
 * defaults; the manifest's placeholders resolve against this. */
export function firmViewOf(enrolment: EnrolmentWithOrg): FirmView {
  const p = enrolment.org.profile;
  if (!p) return { ...DEFAULT_FIRM, name: enrolment.org.name, contactName: enrolment.org.contactName ?? DEFAULT_FIRM.contactName, contactRole: enrolment.org.contactRole ?? "" };
  return {
    name: enrolment.org.name,
    contactName: p.escalationContact,
    contactRole: p.escalationRole ?? "",
    approvedTools: p.approvedTools,
    askFirstTools: p.askFirstTools,
    bannedTools: p.bannedTools,
    classNames: {
      P: p.classPublic || CLASS_DEFAULT_NAME.P,
      I: p.classInternal || CLASS_DEFAULT_NAME.I,
      C: p.classConfidential || CLASS_DEFAULT_NAME.C,
      R: p.classRestricted || CLASS_DEFAULT_NAME.R,
    },
  };
}

/* Which simulator the firm's approved list points at. Copilot is the
 * default when nothing matches (the proposed answer to the open decision). */
export function defaultToolFor(firm: FirmView): Tool {
  const joined = firm.approvedTools.join(" ").toLowerCase();
  if (joined.includes("chatgpt")) return "chatgpt";
  if (joined.includes("gemini")) return "gemini";
  if (joined.includes("claude")) return "claude";
  return "copilot";
}

export function firstNameOf(name: string | null | undefined, email: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (n) return n.split(/\s+/)[0];
  const e = (email ?? "").split("@")[0];
  return e ? e.charAt(0).toUpperCase() + e.slice(1) : "there";
}

/* A valid AI Cleared certificate on this login: the entry ticket to AI
 * Fluent (design decision, 30 September 2026). */
export async function hasValidClearedCertificate(userId: string): Promise<boolean> {
  if (!userId) return false;
  const c = await prisma.certificate.findFirst({
    where: { enrolment: { userId, product: { slug: AI_CLEARED_SLUG } }, expiresAt: { gt: new Date() } },
    select: { id: true },
  });
  return !!c;
}

/* The desk a Fluent seat inherits: the person's Cleared desk, when they
 * have one. The invite page offers it pre-picked and lets them change it. */
export async function clearedTrackOf(userId: string): Promise<Track | null> {
  const e = await prisma.enrolment.findFirst({ where: { userId, product: { slug: AI_CLEARED_SLUG } }, select: { track: true } });
  return e ? DB_TO_TRACK[e.track] : null;
}

/* Claim a seat: the invite token's seat is bound to this user, they join
 * the firm with the seat's role, an Enrolment is created on the seat's
 * course and the chosen track, and the entitlement is granted through the
 * normal funnel. A Fluent seat is refused without a valid Cleared
 * certificate. Idempotent for a user re-opening their own invite. */
export async function claimSeat(args: { token: string; userId: string; track: Track }) {
  const seat = await prisma.seat.findUnique({ where: { inviteToken: args.token }, include: { org: true } });
  if (!seat) return { ok: false as const, reason: "not-found" as const };
  if (seat.userId && seat.userId !== args.userId) return { ok: false as const, reason: "taken" as const };

  const course = courseByKey(corporateCourse(seat.course));
  if (course.slug === "ai-fluent" && !(await hasValidClearedCertificate(args.userId))) return { ok: false as const, reason: "needs-cleared" as const };

  const product = await prisma.product.findUnique({ where: { slug: course.slug }, select: { id: true } });
  if (!product) return { ok: false as const, reason: "no-product" as const };

  const now = new Date();
  await prisma.$transaction([
    prisma.seat.update({ where: { id: seat.id }, data: { userId: args.userId, claimedAt: seat.claimedAt ?? now } }),
    prisma.orgMember.upsert({
      where: { orgId_userId: { orgId: seat.orgId, userId: args.userId } },
      /* A second seat never lowers a role the first one granted. */
      update: seat.role === "ADMIN" ? { role: "ADMIN" } : {},
      create: { orgId: seat.orgId, userId: args.userId, role: seat.role, team: seat.team },
    }),
    prisma.enrolment.upsert({
      where: { userId_productId: { userId: args.userId, productId: product.id } },
      update: {},
      create: { userId: args.userId, productId: product.id, orgId: seat.orgId, track: TRACK_TO_DB[args.track] },
    }),
  ]);
  await grantEntitlement(args.userId, course.slug, "BUNDLE");
  return { ok: true as const, orgName: seat.org.name, course: course.slug };
}

/* Written on every screen change. Scores max-merge, the verdicts keep the
 * best, so a replay can never lower what the register shows. */
export async function saveScreen(args: {
  enrolmentId: string;
  module: number;
  phase: Phase;
  screen: number;
  proveScore?: number;
  proveTotal?: number;
  bestVerdict?: Verdict;
  bestFluent?: FluentWord;
  completed?: boolean;
}) {
  const existing = await prisma.moduleProgress.findUnique({ where: { enrolmentId_module: { enrolmentId: args.enrolmentId, module: args.module } } });
  const incomingVerdict = args.bestVerdict ? VERDICT_TO_DB[args.bestVerdict] : undefined;
  const bestVerdict =
    incomingVerdict && existing?.bestVerdict
      ? VERDICT_SEVERITY[incomingVerdict] < VERDICT_SEVERITY[existing.bestVerdict]
        ? incomingVerdict
        : existing.bestVerdict
      : (incomingVerdict ?? existing?.bestVerdict ?? undefined);
  const incomingFluent = args.bestFluent ? FLUENT_TO_DB[args.bestFluent] : undefined;
  const bestFluent =
    incomingFluent && existing?.bestFluent
      ? FLUENT_RANK[incomingFluent] < FLUENT_RANK[existing.bestFluent]
        ? incomingFluent
        : existing.bestFluent
      : (incomingFluent ?? existing?.bestFluent ?? undefined);
  const proveScore =
    args.proveScore != null && existing?.proveScore != null ? Math.max(args.proveScore, existing.proveScore) : (args.proveScore ?? existing?.proveScore ?? undefined);
  const data = {
    phase: PHASE_TO_DB[args.phase],
    screen: args.screen,
    proveScore,
    proveTotal: args.proveTotal ?? existing?.proveTotal ?? undefined,
    bestVerdict,
    bestFluent,
    completedAt: args.completed ? (existing?.completedAt ?? new Date()) : existing?.completedAt,
  };
  const row = await prisma.moduleProgress.upsert({
    where: { enrolmentId_module: { enrolmentId: args.enrolmentId, module: args.module } },
    update: data,
    create: { enrolmentId: args.enrolmentId, module: args.module, ...data },
  });
  if (args.completed) await completeIfFinished(args.enrolmentId);
  return row;
}

/* The course is complete when every available module has a completion
 * date. finalScore is the final assessment score as a percentage. */
export async function completeIfFinished(enrolmentId: string) {
  const enrolment = await prisma.enrolment.findUnique({ where: { id: enrolmentId }, select: { product: { select: { slug: true } } } });
  if (!enrolment) return false;
  const slug = (enrolment.product.slug === "ai-fluent" ? "ai-fluent" : "ai-cleared") as CourseSlug;
  const list = moduleListFor(slug);
  const rows = await prisma.moduleProgress.findMany({ where: { enrolmentId } });
  const byModule = new Map(rows.map((r) => [r.module, r]));
  const available = list.filter((m) => m.available);
  const allDone = available.length > 0 && available.every((m) => byModule.get(m.n)?.completedAt);
  if (!allDone) return false;
  const finalRow = byModule.get(COURSES[slug].finalModule);
  const finalScore = finalRow?.proveScore != null && finalRow.proveTotal ? Math.round((finalRow.proveScore / finalRow.proveTotal) * 100) : null;
  await prisma.enrolment.update({ where: { id: enrolmentId }, data: { completedAt: new Date(), finalScore } });
  return true;
}

/* Scores only. Never the prompt, never the reply. */
export async function recordAttempt(args: {
  enrolmentId: string;
  module: number;
  tool: Tool;
  verdict: Verdict;
  counts: { P: number; I: number; C: number; R: number };
  halted: boolean;
  fluent?: FluentWord;
  rubricScore?: number;
}) {
  return prisma.sandboxAttempt.create({
    data: {
      enrolmentId: args.enrolmentId,
      module: args.module,
      tool: TOOL_TO_DB[args.tool],
      verdict: VERDICT_TO_DB[args.verdict],
      countPublic: args.counts.P,
      countInternal: args.counts.I,
      countConfidential: args.counts.C,
      countRestricted: args.counts.R,
      halted: args.halted,
      fluentVerdict: args.fluent ? FLUENT_TO_DB[args.fluent] : undefined,
      rubricScore: args.rubricScore,
    },
  });
}
