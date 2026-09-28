import { prisma } from "@/app/lib/prisma";
import { grantEntitlement } from "@/app/lib/entitlements";
import type { ClearedTrack, ModulePhase, SandboxTool, SandboxVerdict } from "@prisma/client";
import {
  CLASS_DEFAULT_NAME,
  DEFAULT_FIRM,
  type FirmView,
  type Phase,
  type Tool,
  type Track,
  type Verdict,
} from "@/app/ai-cleared/engine/types";

/* Server-side helpers for AI Cleared. Never import from a client
 * component: this file reaches Prisma. */

export const AI_CLEARED_SLUG = "ai-cleared";

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

/* The learner's enrolment with everything a module page needs. */
export async function getEnrolment(userId: string) {
  if (!userId) return null;
  return prisma.enrolment.findFirst({
    where: { userId, product: { slug: AI_CLEARED_SLUG } },
    include: {
      org: { include: { profile: true } },
      modules: { orderBy: { module: "asc" } },
      user: { select: { name: true, email: true } },
    },
  });
}
export type EnrolmentWithOrg = NonNullable<Awaited<ReturnType<typeof getEnrolment>>>;

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

/* Claim a seat: the invite token's seat is bound to this user, they join
 * the firm as a LEARNER, an Enrolment is created on the chosen track, and
 * the entitlement is granted through the normal funnel. Idempotent for a
 * user re-opening their own invite. */
export async function claimSeat(args: { token: string; userId: string; track: Track }) {
  const seat = await prisma.seat.findUnique({ where: { inviteToken: args.token }, include: { org: true } });
  if (!seat) return { ok: false as const, reason: "not-found" as const };
  if (seat.userId && seat.userId !== args.userId) return { ok: false as const, reason: "taken" as const };

  const product = await prisma.product.findUnique({ where: { slug: AI_CLEARED_SLUG }, select: { id: true } });
  if (!product) return { ok: false as const, reason: "no-product" as const };

  const now = new Date();
  await prisma.$transaction([
    prisma.seat.update({ where: { id: seat.id }, data: { userId: args.userId, claimedAt: seat.claimedAt ?? now } }),
    prisma.orgMember.upsert({
      where: { orgId_userId: { orgId: seat.orgId, userId: args.userId } },
      update: {},
      create: { orgId: seat.orgId, userId: args.userId, role: seat.role, team: seat.team },
    }),
    prisma.enrolment.upsert({
      where: { userId_productId: { userId: args.userId, productId: product.id } },
      update: {},
      create: { userId: args.userId, productId: product.id, orgId: seat.orgId, track: TRACK_TO_DB[args.track] },
    }),
  ]);
  await grantEntitlement(args.userId, AI_CLEARED_SLUG, "BUNDLE");
  return { ok: true as const, orgName: seat.org.name };
}

/* Written on every screen change. Scores max-merge, the verdict keeps the
 * best, so a replay can never lower what the register shows. */
export async function saveScreen(args: {
  enrolmentId: string;
  module: number;
  phase: Phase;
  screen: number;
  proveScore?: number;
  proveTotal?: number;
  bestVerdict?: Verdict;
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
  const proveScore =
    args.proveScore != null && existing?.proveScore != null ? Math.max(args.proveScore, existing.proveScore) : (args.proveScore ?? existing?.proveScore ?? undefined);
  const data = {
    phase: PHASE_TO_DB[args.phase],
    screen: args.screen,
    proveScore,
    proveTotal: args.proveTotal ?? existing?.proveTotal ?? undefined,
    bestVerdict,
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
  const { MODULE_LIST } = await import("@/app/ai-cleared/manifests");
  const rows = await prisma.moduleProgress.findMany({ where: { enrolmentId } });
  const byModule = new Map(rows.map((r) => [r.module, r]));
  const available = MODULE_LIST.filter((m) => m.available);
  const allDone = available.every((m) => byModule.get(m.n)?.completedAt);
  if (!allDone) return false;
  const finalRow = byModule.get(5);
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
    },
  });
}
