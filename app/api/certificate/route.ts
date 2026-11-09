import { NextRequest } from "next/server";
import { jsPDF } from "jspdf";
import { MILESTONES } from "@/app/lib/certificates";
import { auth } from "@/app/lib/auth";
import { certificateFor } from "@/app/lib/certificateAccess";

/**
 * The Cyber Heroes milestone certificate, as a PDF.
 *
 * WHO IT NAMES IS NO LONGER UP TO THE CALLER. It used to take the child's
 * name, the week and the date as query parameters and print whatever it was
 * handed, so the document was a name-to-PDF service rather than a record of
 * anything: any signed-out stranger could mint one in any name, at any rank,
 * dated anything. A school being promised "a certificate for every pupil"
 * is being promised something that means something, so the name, the rank
 * and the date all come out of the database now, and the milestone has to
 * have actually been earned.
 *
 * `week` says which milestone. `childProfileId` is optional and is how a
 * teacher prints one for a pupil; without it the certificate is for the
 * caller's own active child, which is the pupil themselves or the parent's
 * current child. certificateAccess.ts holds the rule about who may ask for
 * whom.
 */

const BRAND = {
  blue: "#60a5fa",
  green: "#34d399",
  orange: "#f97316",
  yellow: "#f59e0b",
  dark: "#1e293b",
  mid: "#64748b",
  light: "#94a3b8",
  paper: "#fefefe",
  hairline: "#e2e8f0",
};

function sanitizeFilename(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]/g, "_");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  /* `weekNumber` is still read as well as `week`: the two lesson players
     already link here with the older name, and a certificate button that
     stops working at the moment a child finishes week 20 is not a trade
     worth making for a tidier parameter. */
  const weekParam = url.searchParams.get("week") ?? url.searchParams.get("weekNumber");
  const weekNumber = weekParam ? parseInt(weekParam, 10) : NaN;
  const milestone = MILESTONES.find((m) => m.week === weekNumber);

  if (!milestone) {
    return new Response(
      JSON.stringify({
        error: "Certificates are available at weeks 5, 10, 15, and 20",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Sign in first." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const earned = await certificateFor({
    userId: session.user.id,
    week: milestone.week,
    childProfileId: url.searchParams.get("childProfileId"),
  });
  if (!earned.ok) {
    /* 404 for "not yours" as well as "not earned yet". Telling a caller
       which of the two it was tells them whether a child profile exists,
       and that is not a thing to confirm to somebody who is not entitled
       to it. */
    return new Response(JSON.stringify({ error: earned.error }), {
      status: earned.reason === "unauthenticated" ? 401 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const childName = earned.childName;
  const completedDate = earned.completedDate;

  // Landscape A4: 297mm x 210mm
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // Paper background
  doc.setFillColor(BRAND.paper);
  doc.rect(0, 0, W, H, "F");

  // Outer border - rounded, 10mm inset, 2px, brand blue
  doc.setDrawColor(BRAND.blue);
  doc.setLineWidth(0.7);
  doc.roundedRect(10, 10, W - 20, H - 20, 4, 4, "S");

  // Inner border - 14mm inset, thinner, green
  doc.setDrawColor(BRAND.green);
  doc.setLineWidth(0.18);
  doc.roundedRect(14, 14, W - 28, H - 28, 3, 3, "S");

  // Shield at top centre
  const shieldCX = W / 2;
  const shieldTopY = 22;
  const shieldH = 18;
  const shieldHalfW = 7.5;
  doc.setFillColor(BRAND.blue);
  doc.setDrawColor(BRAND.blue);
  // Shield path: rounded top, pointed bottom. Approximate with triangles + lines.
  // Draw as filled polygon using lines().
  const shieldOrigin: [number, number] = [shieldCX - shieldHalfW, shieldTopY];
  doc.lines(
    [
      [2 * shieldHalfW, 0], // top edge
      [0, shieldH * 0.55], // right side down
      [-shieldHalfW, shieldH * 0.45], // diag to bottom point
      [-shieldHalfW, -shieldH * 0.45], // back up to left
      [0, -shieldH * 0.55], // close left
    ],
    shieldOrigin[0],
    shieldOrigin[1],
    [1, 1],
    "FD",
    true,
  );

  // Checkmark inside shield (white)
  doc.setDrawColor("#ffffff");
  doc.setLineWidth(0.6);
  doc.setLineCap("round");
  doc.setLineJoin("round");
  doc.lines(
    [
      [1.6, 1.8],
      [3.2, -3.8],
    ],
    shieldCX - 2.4,
    shieldTopY + 8,
    [1, 1],
    "S",
    false,
  );

  // Brand text under shield
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND.blue);
  doc.text("ALGORITHMX", shieldCX, shieldTopY + shieldH + 6, {
    align: "center",
    charSpace: 1,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND.light);
  doc.text("Cyber Heroes Academy", shieldCX, shieldTopY + shieldH + 11, {
    align: "center",
  });

  // Main heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(BRAND.dark);
  doc.text("Certificate of Achievement", shieldCX, 70, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(BRAND.mid);
  doc.text("This certificate is proudly awarded to", shieldCX, 82, {
    align: "center",
  });

  // Child name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(BRAND.blue);
  doc.text(childName, shieldCX, 100, { align: "center" });

  // Decorative underline
  doc.setDrawColor(BRAND.hairline);
  doc.setLineWidth(0.35);
  doc.line(shieldCX - 60, 106, shieldCX + 60, 106);

  // "for achieving the rank of"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(BRAND.mid);
  doc.text("for achieving the rank of", shieldCX, 117, { align: "center" });

  // Milestone title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(BRAND.dark);
  doc.text(milestone.title, shieldCX, 130, { align: "center" });

  // Description (wrapped)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(BRAND.mid);
  const descLines = doc.splitTextToSize(milestone.description, 180);
  doc.text(descLines, shieldCX, 140, { align: "center" });

  // Bottom-left: date + programme director
  const bottomY = H - 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(BRAND.mid);
  if (completedDate) {
    doc.text(`Date: ${completedDate}`, 28, bottomY);
  }
  doc.setDrawColor(BRAND.hairline);
  doc.setLineWidth(0.3);
  doc.line(28, bottomY + 6, 88, bottomY + 6);
  doc.setFontSize(8);
  doc.setTextColor(BRAND.light);
  doc.text("Programme Director", 28, bottomY + 10);

  // Bottom-right: frameworks
  doc.setFontSize(8);
  doc.setTextColor(BRAND.light);
  /* This line used to read "Aligned with CyberFirst & ASDAN frameworks".
     CyberFirst is the NCSC's programme and ASDAN is an awarding
     organisation, so that is a claim about two third parties printed on a
     document handed to a child and shown to their parents. Nothing in this
     repository evidences either agreement, and the certificate was until
     now effectively unreachable, so the claim had never been made in
     public. Wiring the certificate up would have published it.

     Saying less is the only safe direction for a claim like that, so it
     says what we can stand behind: which course it is and how many weeks
     it took. If the agreements exist, put the line back. */
  doc.text(`Cyber Heroes Academy · ${milestone.week} of 20 weeks`, W - 28, bottomY + 10, {
    align: "right",
  });

  // Bottom-centre: website. Was www.algorithmx.com, a domain that is not
  // ours; the site is algorithmx.io.
  doc.text("algorithmx.io", shieldCX, H - 18, { align: "center" });

  // Corner decorations - filled dots, one brand colour per corner
  const dots: { x: number; y: number; color: string }[] = [
    { x: 20, y: 20, color: BRAND.blue },
    { x: W - 20, y: 20, color: BRAND.green },
    { x: 20, y: H - 20, color: BRAND.orange },
    { x: W - 20, y: H - 20, color: BRAND.yellow },
  ];
  dots.forEach((d) => {
    doc.setFillColor(d.color);
    doc.circle(d.x, d.y, 1.6, "F");
    // small satellite ring
    doc.setDrawColor(d.color);
    doc.setLineWidth(0.15);
    doc.circle(d.x, d.y, 3, "S");
  });

  // PDF metadata
  doc.setProperties({
    title: `${childName} - ${milestone.title} Certificate`,
    subject: `Cyber Heroes Academy - Week ${weekNumber} milestone`,
    creator: "AlgorithmX",
    author: "AlgorithmX - Cyber Heroes Academy",
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const filename = `${sanitizeFilename(childName)}-${sanitizeFilename(milestone.title)}-Certificate.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
