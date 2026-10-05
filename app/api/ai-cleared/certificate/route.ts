import { NextRequest } from "next/server";
import { opsAlert } from "@/app/lib/opsAlert";
import { jsPDF } from "jspdf";
import { auth } from "@/app/lib/auth";
import { getEnrolment, firstNameOf, DB_TO_TRACK } from "@/app/lib/aiCleared";
import { CERT_COPY, emailCertificate, fmtDate, issueCertificate } from "@/app/lib/aiClearedCertificate";
import { COURSES, isCourseSlug, type CourseSlug } from "@/app/ai-cleared/engine/courses";
import { TRACK_LABEL } from "@/app/ai-cleared/engine/types";

/* GET  /api/ai-cleared/certificate?course=   the PDF, for the signed-in holder
 * POST /api/ai-cleared/certificate            issue (idempotent) and, with
 *                                            { email: true, course? }, send the copy
 * Both courses: the course picks the enrolment, the serial prefix and the
 * words on the paper. */

const INK = "#14161d";
const MUTED = "#5b6572";
const FAINT = "#98a0aa";
const TEAL = "#0a7085";
const LINE = "#d9dde2";
const PAPER = "#fbfaf7";

function originOf(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  return `${proto}://${host}`;
}

function courseOf(v: unknown): CourseSlug {
  return isCourseSlug(v) ? v : "ai-cleared";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { email?: boolean; course?: string };
  const course = courseOf(body.course);
  const enrolment = await getEnrolment(session.user.id, course);
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });

  const issued = await issueCertificate(enrolment.id);
  if (!issued.ok) return Response.json({ error: issued.reason === "not-complete" ? "Finish every module first." : "No enrolment." }, { status: 409 });

  let emailed = false;
  let emailError: string | undefined;
  if (body.email && enrolment.user.email) {
    try {
      await emailCertificate({
        to: enrolment.user.email,
        holder: enrolment.user.name?.trim() || firstNameOf(enrolment.user.name, enrolment.user.email),
        firm: enrolment.org.name,
        serial: issued.serial,
        expiresAt: issued.expiresAt,
        origin: originOf(req),
        course,
      });
      emailed = true;
    } catch (err) {
      console.error("[ai-cleared/certificate] email failed", err instanceof Error ? err.message : err);
      await opsAlert({ what: "A certificate email did not send", detail: { serial: issued.serial, to: enrolment.user.email, firm: enrolment.org.name, course }, error: err });
      emailError = "The email could not be sent just now. The download and the verify link still work.";
    }
  }
  return Response.json({ ok: true, serial: issued.serial, issuedAt: issued.issuedAt, expiresAt: issued.expiresAt, score: issued.score, emailed, emailError });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const course = courseOf(new URL(req.url).searchParams.get("course"));
  const enrolment = await getEnrolment(session.user.id, course);
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });
  const issued = await issueCertificate(enrolment.id);
  if (!issued.ok) return Response.json({ error: "Finish every module first." }, { status: 409 });

  const c = COURSES[course];
  const copy = CERT_COPY[course];
  const holder = enrolment.user.name?.trim() || firstNameOf(enrolment.user.name, enrolment.user.email);
  const firm = enrolment.org.name;
  const track = TRACK_LABEL[DB_TO_TRACK[enrolment.track]];
  const verify = `${originOf(req)}/verify/${issued.serial}`;

  /* Landscape A4, printable: paper ground, graphite ink, one teal accent. */
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  doc.setFillColor(PAPER);
  doc.rect(0, 0, W, H, "F");

  /* teal rule down the left, the console's accent */
  doc.setFillColor(TEAL);
  doc.rect(14, 14, 2.2, H - 28, "F");

  /* frame */
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.3);
  doc.rect(14, 14, W - 28, H - 28, "S");

  const x = 28;
  doc.setFont("courier", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(TEAL);
  doc.text(c.brand, x, 30, { charSpace: 1.6 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(FAINT);
  doc.text(`AlgorithmX  ·  ${copy.tagline}`, x, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(MUTED);
  doc.text("This certifies that", x, 62);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(INK);
  doc.text(holder, x, 78);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(MUTED);
  doc.text(`of ${firm}`, x, 88);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(INK);
  const body = doc.splitTextToSize(copy.pdfBody, W - x - 40);
  doc.text(body, x, 104);

  /* the chips: Cleared's four classes in their colours, Fluent's five workflows in teal */
  const chipColours = course === "ai-cleared" ? ["#4f8fa6", "#0a7085", "#8a5400", "#a63a08"] : copy.chips.map(() => TEAL);
  let cx = x;
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  copy.chips.forEach((label, i) => {
    const colour = chipColours[i];
    const w = doc.getTextWidth(label) + 6;
    doc.setDrawColor(colour);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, 122, w, 6.5, 1, 1, "S");
    doc.setTextColor(colour);
    doc.text(label, cx + 3, 126.6);
    cx += w + 3;
  });

  /* facts row */
  const rowY = 150;
  const cols: [string, string][] = [
    ["Track", track],
    ["Issued", fmtDate(issued.issuedAt)],
    ["Valid until", fmtDate(issued.expiresAt)],
    ["Serial", issued.serial],
  ];
  let fx = x;
  for (const [k, v] of cols) {
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(FAINT);
    doc.text(k.toUpperCase(), fx, rowY, { charSpace: 0.8 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(INK);
    doc.text(v, fx, rowY + 7);
    fx += 62;
  }

  doc.setDrawColor(LINE);
  doc.line(x, 170, W - 28, 170);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(`Check this certificate at ${verify}`, x, 178);
  doc.text("Content reviewed quarterly and within weeks of a major change to any tool. Renewal is on the refreshed content.", x, 184);
  doc.setTextColor(FAINT);
  doc.text("AlgorithmX  ·  algorithmx.co.uk  ·  admissions@algorithmx.co.uk", x, 190);

  const bytes = doc.output("arraybuffer");
  const safe = holder.replace(/[^a-zA-Z0-9-_]+/g, "_");
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${c.name.replace(/\s+/g, "-")}-${safe}-${issued.serial}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
