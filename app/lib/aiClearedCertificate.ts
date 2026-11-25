import { randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { COURSES, isCourseSlug, type CertifiedCourseSlug } from "@/app/ai-cleared/engine/courses";

/* Certificates for AI Cleared and AI Fluent. They were issued once per
 * enrolment when the course was complete, valid for 12 months (owner
 * decision 2026-09-28), each with a serial: AXC for AI Cleared, AXF for
 * AI Fluent. Since 2026-11-09 no new certificate issues (owner: Cyber
 * Secured tracks completion per module only); the ones already out keep
 * working until they expire, so nothing here deletes a Certificate row.
 * Cyber Awareness never had one. Never import from a client component. */

export const CERTIFICATE_MONTHS = 12;

/* AXC-XXXX-XXXX: unambiguous letters and digits, no vowels, so it reads
 * aloud cleanly over the phone. */
const ALPHABET = "BCDFGHJKLMNPQRSTVWXZ23456789";
export function makeSerial(prefix = "AXC"): string {
  const bytes = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return `${prefix}-${s.slice(0, 4)}-${s.slice(4)}`;
}

/* What each certificate says, on screen and in the PDF. */
export const CERT_COPY: Record<CertifiedCourseSlug, { tagline: string; completed: string; pdfBody: string; chips: string[] }> = {
  "ai-cleared": {
    tagline: "Safe and effective AI use for staff",
    completed: "has completed AI Cleared, the five modules on safe and effective AI use, and passed the final assessment.",
    pdfBody: "has completed AI Cleared: the five modules on what happens to what you type, the paste test, the firm's approved tools, trust but verify, and shadow AI, and passed the final assessment.",
    chips: ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
  },
  "ai-fluent": {
    tagline: "Getting real work out of AI, for staff who hold AI Cleared",
    completed: "has completed AI Fluent, the nine modules on prompting, the five workflows, verification and a real task on their own desk, and passed the final assessment.",
    pdfBody: "has completed AI Fluent: the nine modules on the loop, saying what you want, fixing the prompt not the output, summarising, drafting, analysing, researching, verifying and automating, and a real task on their own desk, and passed the final assessment.",
    chips: ["SUMMARISE", "DRAFT", "ANALYSE", "RESEARCH", "AUTOMATE"],
  },
};

export type IssueResult =
  | { ok: true; serial: string; issuedAt: Date; expiresAt: Date; score: number; alreadyIssued: boolean }
  | { ok: false; reason: "not-complete" | "not-found" | "not-issued" };

/* Idempotent: a certificate already issued is always returned, so its
 * holder keeps the page and the PDF. A new one is made only on a course
 * whose `certificate` flag is on, and since 2026-11-09 none is (owner:
 * completion per module only), so this now only ever finds; "not-issued"
 * means there is no certificate and none will come.
 * The serial prefix follows the enrolment's course. */
export async function issueCertificate(enrolmentId: string): Promise<IssueResult> {
  const enrolment = await prisma.enrolment.findUnique({ where: { id: enrolmentId }, include: { certificate: true, product: { select: { slug: true } } } });
  if (!enrolment) return { ok: false, reason: "not-found" };
  if (enrolment.certificate) {
    const c = enrolment.certificate;
    return { ok: true, serial: c.serial, issuedAt: c.issuedAt, expiresAt: c.expiresAt, score: c.score, alreadyIssued: true };
  }
  const course = isCourseSlug(enrolment.product.slug) ? COURSES[enrolment.product.slug] : null;
  if (!course?.certificate || !course.serialPrefix) return { ok: false, reason: "not-issued" };
  if (!enrolment.completedAt) return { ok: false, reason: "not-complete" };
  const prefix = course.serialPrefix;
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setMonth(expiresAt.getMonth() + CERTIFICATE_MONTHS);
  const score = enrolment.finalScore ?? 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    const serial = makeSerial(prefix);
    try {
      const c = await prisma.certificate.create({ data: { enrolmentId, orgId: enrolment.orgId, serial, score, issuedAt, expiresAt } });
      return { ok: true, serial: c.serial, issuedAt: c.issuedAt, expiresAt: c.expiresAt, score: c.score, alreadyIssued: false };
    } catch (err) {
      /* a serial collision is astronomically unlikely; try once more */
      if (attempt === 4) throw err;
    }
  }
  throw new Error("issueCertificate: could not allocate a serial");
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* The learner's copy by email: a link to the certificate page and the
 * serial. The PDF itself stays behind sign-in. */
export async function emailCertificate(args: { to: string; holder: string; firm: string; serial: string; expiresAt: Date; origin: string; course?: CertifiedCourseSlug }) {
  const course = COURSES[args.course ?? "ai-cleared"];
  const page = `${args.origin}${course.base}/certificate`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">${course.brand}</p>
      <h1 style="font-size:22px;margin:0 0 12px">You are ${escapeHtml(course.doneName)}, ${escapeHtml(args.holder)}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You completed every module of ${escapeHtml(course.name)} at ${escapeHtml(args.firm)}. Your certificate is ready to download; its serial is below.</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 4px"><b>Serial:</b> ${escapeHtml(args.serial)}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px"><b>Valid until:</b> ${fmtDate(args.expiresAt)}</p>
      <p style="margin:0 0 10px"><a href="${page}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Download your certificate</a></p>
    </div>`;
  const text = `You are ${course.doneName}, ${args.holder}.\n\nYou completed every module of ${course.name} at ${args.firm}.\nSerial: ${args.serial}\nValid until: ${fmtDate(args.expiresAt)}\n\nDownload: ${page}\n`;
  return sendEmail({ to: args.to, subject: `Your ${course.name} certificate`, html, text });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
