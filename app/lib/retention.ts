import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { OPS_ALERT_TO } from "@/app/lib/opsAlert";
import { eraseLearner } from "@/app/lib/aiClearedOps";
import { staffEmails } from "@/app/lib/aiClearedStaff";
import { normaliseEmail } from "@/app/lib/emailIdentity";
import { RETENTION, daysBefore, individualVerdict, pastGrace } from "@/app/lib/retentionRule";

/**
 * THE RETENTION SWITCH. While false, nothing anywhere is deleted and no
 * warning email goes to a customer: the daily job works out exactly what
 * the policy WOULD remove, logs the counts and emails ops one summary.
 *
 * Flip to true only once the owner has read a few of those summaries and
 * agrees with what they say. The deletion code below is written and tested,
 * and `applyRetention` refuses to reach it while this is false.
 */
export const RETENTION_DELETE_ENABLED: boolean = false;

/**
 * The data-retention job (owner-approved 2026-11-26). The policy itself,
 * the numbers and the per-row decisions, is in retentionRule.ts; this file
 * finds the rows and, once switched on, removes them.
 */

export type CategoryKey =
  | "individuals"
  | "pupils"
  | "firmLearners"
  | "paymentRecords"
  | "enquiries"
  | "logs";

export interface RetentionCategory {
  key: CategoryKey;
  label: string;
  rule: string;
  /** Rows (or accounts) the policy would delete today. */
  wouldDelete: number;
  /** Individuals only: accounts that would be sent the 30-day warning. */
  wouldWarn?: number;
  /** Due, but kept for a stated reason. */
  held?: { reason: string; count: number }[];
}

export interface RetentionPlan {
  generatedAt: string;
  deleteEnabled: boolean;
  categories: RetentionCategory[];
  /** Exactly which rows, per table, for the deletion step. */
  targets: {
    individualIds: string[];
    warnIds: { id: string; email: string }[];
    pupilUserIds: string[];
    firmLearnerEmails: string[];
    seatPurchaseIds: string[];
    placePurchaseIds: string[];
    schoolEnquiryIds: string[];
    waitlistEntryIds: string[];
  };
  /** Cut-offs for the bulk log deletes, which go by date, not by id. */
  logCutoff: string;
  logCounts: { modelCall: number; rateLimit: number; passwordResetToken: number; verificationToken: number };
  /** What the policy asks for that the data cannot yet show. */
  unmeasured: string[];
}

export const UNMEASURED: readonly string[] = [
  "Licence end dates are not stored. A licence counts as ended when staff close access (revokedAt) or a staff trial runs out unconverted (trialExpiresAt). A paid licence that simply lapses, with nobody closing it, is invisible to this job.",
  "Sign-ins before 2026-11-26 were never recorded. Accounts with no recorded sign-in are counted from that date, so the first two-year deletions cannot fall before late 2028.",
  "Consumer payments have no ledger of their own: the only local evidence is a PURCHASE entitlement, which goes with the account. Individuals holding one younger than six years are held, not deleted. Invoices themselves live in Stripe and are untouched.",
  "Deleting an organisation (staff, /admin) cascades its SeatPurchase and PlacePurchase rows straight away, inside the six years. This job cannot keep what is already gone.",
];

export async function planRetention(now = new Date()): Promise<RetentionPlan> {
  const warnCut = daysBefore(now, RETENTION.individualInactiveDays - RETENTION.individualWarnDaysBefore);
  const pupilCut = daysBefore(now, RETENTION.pupilGraceDays);
  const learnerCut = daysBefore(now, RETENTION.learnerGraceDays);
  const payCut = daysBefore(now, RETENTION.paymentDays);
  const enquiryCut = daysBefore(now, RETENTION.enquiryDays);
  const logCut = daysBefore(now, RETENTION.logDays);
  const ended = (cut: Date) => ({ OR: [{ revokedAt: { lte: cut } }, { trialExpiresAt: { lte: cut } }] });

  const [
    individuals,
    pupils,
    learners,
    seatPurchases,
    placePurchases,
    schoolEnquiries,
    waitlist,
    modelCall,
    rateLimit,
    passwordResetToken,
    verificationToken,
  ] = await Promise.all([
    /* An individual: an adult account that belongs to no organisation and
       teaches no class. Anyone at a school or firm is that organisation's
       to account for, under the licence rules below. */
    prisma.user.findMany({
      where: {
        role: { notIn: ["pupil", "staff"] },
        orgMemberships: { none: {} },
        classesTaught: { none: {} },
        OR: [{ lastSignInAt: { lt: warnCut } }, { lastSignInAt: null, createdAt: { lt: warnCut } }],
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        lastSignInAt: true,
        retentionWarnedAt: true,
        entitlements: { where: { source: "PURCHASE" }, select: { grantedAt: true } },
      },
    }),
    /* A pupil account exists only because a school made it. */
    prisma.user.findMany({
      where: {
        role: "pupil",
        children: { some: { OR: [{ classId: null }, { class: { org: ended(pupilCut) } }] } },
      },
      select: {
        id: true,
        children: { select: { classId: true, class: { select: { org: { select: { revokedAt: true, trialExpiresAt: true } } } } } },
      },
    }),
    /* A firm's learners: members of an organisation with no school profile. */
    prisma.orgMember.findMany({
      where: { role: "LEARNER", org: { school: { is: null }, ...ended(learnerCut) } },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            orgMemberships: { select: { role: true, org: { select: { revokedAt: true, trialExpiresAt: true } } } },
          },
        },
      },
    }),
    prisma.seatPurchase.findMany({ where: { createdAt: { lt: payCut } }, select: { id: true } }),
    prisma.placePurchase.findMany({ where: { createdAt: { lt: payCut } }, select: { id: true } }),
    prisma.schoolEnquiry.findMany({ where: { createdAt: { lt: enquiryCut } }, select: { id: true } }),
    prisma.waitlistEntry.findMany({ where: { createdAt: { lt: enquiryCut } }, select: { id: true } }),
    prisma.modelCall.count({ where: { at: { lt: logCut } } }),
    prisma.rateLimit.count({ where: { windowStart: { lt: logCut } } }),
    prisma.passwordResetToken.count({ where: { createdAt: { lt: logCut } } }),
    prisma.verificationToken.count({ where: { expires: { lt: logCut } } }),
  ]);

  /* ── individuals ── */
  const staff = staffEmails();
  const individualIds: string[] = [];
  const warnIds: { id: string; email: string }[] = [];
  let heldPayment = 0;
  let heldStaff = 0;
  for (const u of individuals) {
    if (staff.has(normaliseEmail(u.email))) {
      heldStaff++;
      continue;
    }
    const v = individualVerdict(
      { lastSignInAt: u.lastSignInAt, createdAt: u.createdAt, retentionWarnedAt: u.retentionWarnedAt, purchasedAt: u.entitlements.map((e) => e.grantedAt) },
      now,
    );
    if (v === "warn") warnIds.push({ id: u.id, email: u.email });
    else if (v === "delete") individualIds.push(u.id);
    else if (v === "hold_payment") heldPayment++;
  }

  /* ── pupils ── checked again here, against the rule, rather than trusting
     the query alone: every class the account sits in must be at a school
     whose licence ended more than 90 days ago, or have no class at all. */
  const pupilUserIds = pupils
    .filter((u) =>
      u.children.length > 0 &&
      u.children.every((c) => c.classId === null || (c.class !== null && pastGrace(c.class.org, RETENTION.pupilGraceDays, now))),
    )
    .map((u) => u.id);

  /* ── firm learners ── a person, not a seat: somebody still learning at
     another firm whose licence runs is held, because erasing them erases
     them everywhere. */
  const byUser = new Map<string, (typeof learners)[number]["user"]>();
  for (const m of learners) byUser.set(m.user.id, m.user);
  const firmLearnerEmails: string[] = [];
  let heldElsewhere = 0;
  for (const u of byUser.values()) {
    if (u.role === "staff" || staff.has(normaliseEmail(u.email))) continue;
    const allEnded = u.orgMemberships.every((m) => m.role === "LEARNER" && pastGrace(m.org, RETENTION.learnerGraceDays, now));
    if (allEnded) firmLearnerEmails.push(u.email);
    else heldElsewhere++;
  }

  const logCounts = { modelCall, rateLimit, passwordResetToken, verificationToken };
  const plan: RetentionPlan = {
    generatedAt: now.toISOString(),
    deleteEnabled: RETENTION_DELETE_ENABLED,
    categories: [
      {
        key: "individuals",
        label: "Individual accounts",
        rule: "Deleted 2 years after last sign-in, warned by email 30 days before.",
        wouldDelete: individualIds.length,
        wouldWarn: warnIds.length,
        held: [
          { reason: "holds a purchase under 6 years old", count: heldPayment },
          { reason: "AlgorithmX staff address", count: heldStaff },
        ].filter((h) => h.count > 0),
      },
      {
        key: "pupils",
        label: "School pupils",
        rule: "Deleted 90 days after the school's licence ends.",
        wouldDelete: pupilUserIds.length,
      },
      {
        key: "firmLearners",
        label: "Firm learners",
        rule: "Deleted 90 days after the firm's licence ends.",
        wouldDelete: firmLearnerEmails.length,
        held: heldElsewhere > 0 ? [{ reason: "also belongs to an organisation still running", count: heldElsewhere }] : [],
      },
      {
        key: "paymentRecords",
        label: "Payment records",
        rule: "Kept 6 years, then deleted.",
        wouldDelete: seatPurchases.length + placePurchases.length,
      },
      {
        key: "enquiries",
        label: "Enquiry-form leads",
        rule: "Deleted after 2 years.",
        wouldDelete: schoolEnquiries.length + waitlist.length,
      },
      {
        key: "logs",
        label: "AI usage and other logs",
        rule: "Deleted after 90 days.",
        wouldDelete: modelCall + rateLimit + passwordResetToken + verificationToken,
      },
    ],
    targets: {
      individualIds,
      warnIds,
      pupilUserIds,
      firmLearnerEmails,
      seatPurchaseIds: seatPurchases.map((r) => r.id),
      placePurchaseIds: placePurchases.map((r) => r.id),
      schoolEnquiryIds: schoolEnquiries.map((r) => r.id),
      waitlistEntryIds: waitlist.map((r) => r.id),
    },
    logCutoff: logCut.toISOString(),
    logCounts,
    unmeasured: [...UNMEASURED],
  };
  return plan;
}

/** The plan as staff and the ops email see it: counts, no row ids, no
 *  addresses. */
export function summarise(plan: RetentionPlan) {
  return {
    generatedAt: plan.generatedAt,
    deleteEnabled: plan.deleteEnabled,
    categories: plan.categories,
    logCounts: plan.logCounts,
    unmeasured: plan.unmeasured,
  };
}

export interface ApplyResult {
  ran: boolean;
  deleted: Record<string, number>;
  warned: number;
  failures: string[];
}

/**
 * Carry out a plan. Refuses, changing nothing, while RETENTION_DELETE_ENABLED
 * is false: this is the only door to `deleteForPlan`.
 */
export async function applyRetention(plan: RetentionPlan): Promise<ApplyResult> {
  if (!RETENTION_DELETE_ENABLED) return { ran: false, deleted: {}, warned: 0, failures: [] };
  return deleteForPlan(plan, new Date());
}

/**
 * The deletion itself. Exported for its tests only: production code reaches
 * it through applyRetention, behind the switch.
 *
 * One account at a time, each in its own try, so one row that refuses (a
 * foreign key nobody expected) is reported and the rest still go.
 */
export async function deleteForPlan(plan: RetentionPlan, now: Date): Promise<ApplyResult> {
  const t = plan.targets;
  const deleted: Record<string, number> = {};
  const failures: string[] = [];
  const bump = (k: string, n = 1) => (deleted[k] = (deleted[k] ?? 0) + n);

  /* Accounts: the user row cascades everything hanging off it. ModelCall
     has no relation to User, so it is cleared by hand first. */
  const dropAccount = async (userId: string, kind: string) => {
    try {
      await prisma.modelCall.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      bump(kind);
    } catch (err) {
      failures.push(`${kind} ${userId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  for (const id of t.individualIds) await dropAccount(id, "individual");
  for (const id of t.pupilUserIds) await dropAccount(id, "pupil");

  /* Firm learners through the staff erase tool, which already knows what a
     firm may and may not have deleted, and refuses the rest in words. */
  for (const email of t.firmLearnerEmails) {
    try {
      const r = await eraseLearner(email);
      if (r.ok) bump("firmLearner");
      else failures.push(`firmLearner ${email}: ${r.message}`);
    } catch (err) {
      failures.push(`firmLearner ${email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /* Warnings: stamped only once the email has gone, so a failed send is
     simply tried again tomorrow. */
  let warned = 0;
  for (const w of t.warnIds) {
    try {
      await sendRetentionWarning(w.email);
      await prisma.user.update({ where: { id: w.id }, data: { retentionWarnedAt: now } });
      warned++;
    } catch (err) {
      failures.push(`warn ${w.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const byIds = async (k: string, ids: string[], run: (ids: string[]) => Promise<{ count: number }>) => {
    if (!ids.length) return;
    bump(k, (await run(ids)).count);
  };
  await byIds("seatPurchase", t.seatPurchaseIds, (ids) => prisma.seatPurchase.deleteMany({ where: { id: { in: ids } } }));
  await byIds("placePurchase", t.placePurchaseIds, (ids) => prisma.placePurchase.deleteMany({ where: { id: { in: ids } } }));
  await byIds("schoolEnquiry", t.schoolEnquiryIds, (ids) => prisma.schoolEnquiry.deleteMany({ where: { id: { in: ids } } }));
  await byIds("waitlistEntry", t.waitlistEntryIds, (ids) => prisma.waitlistEntry.deleteMany({ where: { id: { in: ids } } }));

  const logCut = new Date(plan.logCutoff);
  bump("modelCall", (await prisma.modelCall.deleteMany({ where: { at: { lt: logCut } } })).count);
  bump("rateLimit", (await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: logCut } } })).count);
  bump("passwordResetToken", (await prisma.passwordResetToken.deleteMany({ where: { createdAt: { lt: logCut } } })).count);
  bump("verificationToken", (await prisma.verificationToken.deleteMany({ where: { expires: { lt: logCut } } })).count);

  return { ran: true, deleted, warned, failures };
}

async function sendRetentionWarning(to: string) {
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">ALGORITHMX</p>
      <h1 style="font-size:22px;margin:0 0 12px">Your AlgorithmX account will be deleted in 30 days</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You have not signed in for almost two years, so under our privacy policy we will delete your account and everything in it in 30 days.</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">To keep it, simply sign in before then. Nothing else is needed.</p>
    </div>`;
  const text = "Your AlgorithmX account will be deleted in 30 days.\n\nYou have not signed in for almost two years, so under our privacy policy we will delete your account and everything in it in 30 days. To keep it, simply sign in before then.\n";
  await sendEmail({ to, subject: "Your AlgorithmX account will be deleted in 30 days", html, text });
}

/** The one ops email per run. Plain counts; no addresses, no ids. */
export async function sendRetentionSummary(plan: RetentionPlan, applied: ApplyResult): Promise<void> {
  const lines = plan.categories.map((c) => {
    const held = (c.held ?? []).map((h) => `${h.count} held (${h.reason})`).join(", ");
    return `${c.label}: ${c.wouldDelete} ${applied.ran ? "deleted" : "would be deleted"}${c.wouldWarn !== undefined ? `, ${c.wouldWarn} ${applied.ran ? "warned" : "would be warned"}` : ""}${held ? `, ${held}` : ""}`;
  });
  const head = applied.ran
    ? "Retention ran and deleted rows."
    : "Retention dry run: nothing was deleted and nobody was emailed (RETENTION_DELETE_ENABLED is false).";
  const text = `${head}\n\n${lines.join("\n")}\n\nNot yet measurable:\n- ${plan.unmeasured.join("\n- ")}${applied.failures.length ? `\n\nFailures:\n${applied.failures.join("\n")}` : ""}\n\nSent by the daily retention job.`;
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  try {
    await sendEmail({
      to: OPS_ALERT_TO,
      subject: `[AlgorithmX ops] Retention ${applied.ran ? "run" : "dry run"}: ${plan.categories.reduce((n, c) => n + c.wouldDelete, 0)} rows`,
      html: `<pre style="font-family:ui-monospace,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap">${esc(text)}</pre>`,
      text,
    });
  } catch (err) {
    console.error("[retention] summary email failed", err instanceof Error ? err.message : err);
  }
}
