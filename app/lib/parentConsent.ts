/**
 * A parent's consent for an under-13's account (UK GDPR Article 8, Data
 * Protection Act 2018 s.9).
 *
 * At sign-up on Cyber Explorers or Cyber Ops a child under 13 gives a
 * parent's email, and the account is made in an "awaiting parent" state
 * (User.needsParentConsent, with parentConsentAt empty). The parent gets an
 * email with a link to /parent-approve/<token>: the page says what the
 * child signed up for, records the parent's consent, and lets the parent
 * pay for the course for the child's account. Until consent, requireCourse
 * sends the child to /waiting-for-grown-up instead of any course, and the
 * tester switch does not get around it.
 *
 * Only a SHA-256 hash of the link's token is stored, so a copy of the
 * database cannot be used to give consent. A link lasts seven days; a new
 * one can be sent from the waiting page.
 *
 * Server only.
 */
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { opsAlert } from "@/app/lib/opsAlert";
import { consumerCourse } from "@/app/lib/consumerCatalogue";
import { emailEquals, normaliseEmail } from "@/app/lib/emailIdentity";
import { staffEmails } from "@/app/lib/aiClearedStaff";

export const WAITING_FOR_PARENT_PATH = "/waiting-for-grown-up";
export const CONSENT_LINK_DAYS = 7;
/** How soon the child can ask for the email to be sent again. */
export const RESEND_AFTER_MS = 2 * 60 * 1000;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** True while this account is waiting for a parent to say yes. */
export function awaitingParent(user: { needsParentConsent: boolean; parentConsentAt: Date | null } | null | undefined): boolean {
  return Boolean(user?.needsParentConsent && !user.parentConsentAt);
}

export async function isAwaitingParent(userId: string): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { needsParentConsent: true, parentConsentAt: true } });
  return awaitingParent(user);
}

function firstName(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  return n ? n.split(/\s+/)[0] : "Your child";
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/**
 * Make a fresh seven-day link for this child's parent and email it. Any
 * older link stops working, so only the newest email counts.
 */
export async function sendParentConsentEmail(args: { userId: string; courseSlug: string; origin: string }): Promise<{ sent: boolean }> {
  const user = await prisma.user.findUnique({ where: { id: args.userId }, select: { name: true, parentEmail: true } });
  if (!user?.parentEmail) return { sent: false };
  const course = consumerCourse(args.courseSlug);
  const courseName = course?.name ?? "an AlgorithmX course";

  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + CONSENT_LINK_DAYS * 86400000);
  await prisma.$transaction([
    prisma.parentConsentToken.updateMany({ where: { userId: args.userId, usedAt: null, expiresAt: { gt: new Date() } }, data: { expiresAt: new Date() } }),
    prisma.parentConsentToken.create({ data: { userId: args.userId, courseSlug: args.courseSlug, tokenHash: hashToken(raw), expiresAt } }),
  ]);

  const link = `${args.origin}/parent-approve/${raw}`;
  const child = firstName(user.name);
  const subject = `${child} would like to join ${courseName}`;
  const text = [
    `Hello,`,
    ``,
    `${child} has signed up for ${courseName} on AlgorithmX and gave this address as a parent's email.`,
    ``,
    `Children under 13 need a parent or guardian to say yes before they can start. It takes a minute:`,
    link,
    ``,
    `On that page you can see what ${courseName} is, give your consent and, if you like, buy the course for ${child}. The link works for ${CONSENT_LINK_DAYS} days.`,
    ``,
    `If you do not know about this, you can ignore this email. The account stays closed and nothing is charged.`,
    ``,
    `AlgorithmX`,
  ].join("\n");
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
<p>Hello,</p>
<p><b>${esc(child)}</b> has signed up for <b>${esc(courseName)}</b> on AlgorithmX and gave this address as a parent's email.</p>
<p>Children under 13 need a parent or guardian to say yes before they can start. It takes a minute.</p>
<p style="margin:24px 0"><a href="${esc(link)}" style="display:inline-block;background:#0b6bcb;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">Review and give consent</a></p>
<p>On that page you can see what ${esc(courseName)} is, give your consent and, if you like, buy the course for ${esc(child)}. The link works for ${CONSENT_LINK_DAYS} days.</p>
<p style="color:#555">If you do not know about this, you can ignore this email. The account stays closed and nothing is charged.</p>
<p>AlgorithmX</p>
</div>`;

  try {
    await sendEmail({ to: user.parentEmail, subject, html, text });
    return { sent: true };
  } catch (err) {
    await opsAlert({ what: "A parent consent email did not send", detail: { userId: args.userId, course: args.courseSlug }, error: err });
    return { sent: false };
  }
}

/** The consent link's account, if the link is real and in date. */
export async function findConsentLink(raw: string) {
  if (!raw || raw.length < 20 || raw.length > 200) return null;
  const row = await prisma.parentConsentToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    select: {
      id: true,
      courseSlug: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { id: true, name: true, email: true, parentEmail: true, parentConsentAt: true, needsParentConsent: true } },
    },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row;
}
export type ConsentLink = NonNullable<Awaited<ReturnType<typeof findConsentLink>>>;

/** The parent says yes. Idempotent: the first consent time is kept. */
export async function recordParentConsent(link: ConsentLink): Promise<void> {
  const now = new Date();
  await prisma.$transaction([
    prisma.user.updateMany({ where: { id: link.user.id, parentConsentAt: null }, data: { parentConsentAt: now } }),
    prisma.parentConsentToken.updateMany({ where: { id: link.id, usedAt: null }, data: { usedAt: now } }),
  ]);
}

/**
 * Whether a parent may use the real checkout while it is shut to the
 * public: only when their address belongs to staff, so the owner can test
 * the parent flow on the sandbox keys by giving their own address.
 */
export async function isStaffEmail(email: string | null | undefined): Promise<boolean> {
  const e = normaliseEmail(email ?? "");
  if (!e) return false;
  if (staffEmails().has(e)) return true;
  return (await prisma.user.count({ where: { email: emailEquals(e), role: "staff" } })) > 0;
}
