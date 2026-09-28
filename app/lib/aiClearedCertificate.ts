import { randomBytes } from "crypto";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";

/* Certificates for AI Cleared. Issued once per enrolment when the course is
 * complete, valid for 12 months (owner decision 2026-09-28), with a serial
 * anyone can check at /verify/[serial]. Never import from a client
 * component. */

export const CERTIFICATE_MONTHS = 12;

/* AXC-XXXX-XXXX: unambiguous letters and digits, no vowels, so it reads
 * aloud cleanly over the phone. */
const ALPHABET = "BCDFGHJKLMNPQRSTVWXZ23456789";
export function makeSerial(): string {
  const bytes = randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return `AXC-${s.slice(0, 4)}-${s.slice(4)}`;
}

export type IssueResult =
  | { ok: true; serial: string; issuedAt: Date; expiresAt: Date; score: number; alreadyIssued: boolean }
  | { ok: false; reason: "not-complete" | "not-found" };

/* Idempotent: a second call returns the existing certificate. */
export async function issueCertificate(enrolmentId: string): Promise<IssueResult> {
  const enrolment = await prisma.enrolment.findUnique({ where: { id: enrolmentId }, include: { certificate: true } });
  if (!enrolment) return { ok: false, reason: "not-found" };
  if (enrolment.certificate) {
    const c = enrolment.certificate;
    return { ok: true, serial: c.serial, issuedAt: c.issuedAt, expiresAt: c.expiresAt, score: c.score, alreadyIssued: true };
  }
  if (!enrolment.completedAt) return { ok: false, reason: "not-complete" };
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setMonth(expiresAt.getMonth() + CERTIFICATE_MONTHS);
  const score = enrolment.finalScore ?? 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    const serial = makeSerial();
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

/* What the public verify page shows. Name and firm only; no scores, no
 * track, nothing from the register. */
export async function verifyCertificate(serial: string) {
  const c = await prisma.certificate.findUnique({
    where: { serial: serial.trim().toUpperCase() },
    include: { enrolment: { include: { user: { select: { name: true, email: true } }, org: { select: { name: true } } } } },
  });
  if (!c) return null;
  const now = new Date();
  return {
    serial: c.serial,
    holder: c.enrolment.user.name?.trim() || c.enrolment.user.email.split("@")[0],
    firm: c.enrolment.org.name,
    issuedAt: c.issuedAt,
    expiresAt: c.expiresAt,
    valid: c.expiresAt > now,
  };
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* The learner's copy by email: a link to the certificate page and the
 * public verify link. The PDF itself stays behind sign-in. */
export async function emailCertificate(args: { to: string; holder: string; firm: string; serial: string; expiresAt: Date; origin: string }) {
  const verify = `${args.origin}/verify/${args.serial}`;
  const page = `${args.origin}/ai-cleared/certificate`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">AI CLEARED</p>
      <h1 style="font-size:22px;margin:0 0 12px">You are AI Cleared, ${escapeHtml(args.holder)}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You completed every module of AI Cleared at ${escapeHtml(args.firm)}. Your certificate is ready to download, and anyone can check it with the serial below.</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 4px"><b>Serial:</b> ${escapeHtml(args.serial)}</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 20px"><b>Valid until:</b> ${fmtDate(args.expiresAt)}</p>
      <p style="margin:0 0 10px"><a href="${page}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Download your certificate</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Verify link for a manager or an auditor: <a href="${verify}" style="color:#0a7085">${verify}</a></p>
    </div>`;
  const text = `You are AI Cleared, ${args.holder}.\n\nYou completed every module of AI Cleared at ${args.firm}.\nSerial: ${args.serial}\nValid until: ${fmtDate(args.expiresAt)}\n\nDownload: ${page}\nVerify: ${verify}\n`;
  return sendEmail({ to: args.to, subject: "Your AI Cleared certificate", html, text });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
