import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getEnrolment, firstNameOf, DB_TO_TRACK } from "@/app/lib/aiCleared";
import { fmtDate, issueCertificate } from "@/app/lib/aiClearedCertificate";
import { TRACK_LABEL } from "../engine/types";
import { K } from "../engine/tokens";
import CertificateActions from "./CertificateActions";

/* /ai-cleared/certificate: the certificate screen, with the download and
 * the verify link. Issues the certificate on first visit once the course
 * is complete. */
export const dynamic = "force-dynamic";

export default async function CertificatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-cleared%2Fcertificate");
  const enrolment = await getEnrolment(session.user.id);
  if (!enrolment) redirect("/ai-cleared");

  const wrap = (children: React.ReactNode) => (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: K.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.22em", color: K.accentInk }}>AI CLEARED</span>
        <Link href="/ai-cleared" style={{ color: K.ink, fontSize: 13, textDecoration: "none", border: `1px solid ${K.edge}`, borderRadius: 8, padding: "5px 10px" }}>Course</Link>
      </div>
      {children}
    </div>
  );

  const issued = await issueCertificate(enrolment.id);
  if (!issued.ok) {
    const done = enrolment.modules.filter((m) => m.completedAt).length;
    return wrap(
      <>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: K.ink, margin: "26px 0 10px", letterSpacing: "-0.015em", textWrap: "balance" }}>Your certificate issues when every module is cleared.</h1>
        <p style={{ fontSize: 16, color: K.body, maxWidth: "56ch" }}>{done} module{done === 1 ? "" : "s"} cleared so far. The final assessment at the end of Module 5 is the last step.</p>
        <Link href="/ai-cleared" style={{ display: "inline-block", marginTop: 14, fontSize: 14.5, fontWeight: 600, color: K.onAccent, background: K.accent, borderRadius: 9, padding: "11px 18px", textDecoration: "none" }}>Back to your course</Link>
      </>,
    );
  }

  const holder = enrolment.user.name?.trim() || firstNameOf(enrolment.user.name, enrolment.user.email);
  const valid = issued.expiresAt > new Date();
  return wrap(
    <>
      <span style={{ display: "inline-block", marginTop: 26, fontFamily: K.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: valid ? K.ok : K.warn, border: `1.5px solid ${valid ? K.ok : K.warn}`, borderRadius: 6, padding: "5px 10px" }}>{valid ? "Course cleared" : "Certificate expired"}</span>
      <h1 style={{ fontSize: 30, fontWeight: 600, color: K.ink, margin: "16px 0 8px", letterSpacing: "-0.015em", textWrap: "balance" }}>You are AI Cleared, {holder}.</h1>
      <p style={{ fontSize: 16.5, color: K.body, margin: "0 0 24px", maxWidth: "60ch" }}>
        Every module cleared and the final assessment passed. The certificate below is yours to download; the serial lets a manager, an auditor or an insurer check it without asking you.
      </p>

      <div style={{ background: "#fbfaf7", color: "#14161d", borderRadius: 14, padding: "26px 28px", borderLeft: "5px solid #0a7085", boxShadow: K.lift, border: `1px solid ${K.edge}` }}>
        <div style={{ fontFamily: K.mono, fontSize: 10.5, letterSpacing: "0.2em", color: "#0a7085", fontWeight: 700 }}>AI CLEARED</div>
        <div style={{ fontSize: 13, color: "#5b6572", marginTop: 14 }}>This certifies that</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", marginTop: 2 }}>{holder}</div>
        <div style={{ fontSize: 14, color: "#5b6572", marginTop: 2 }}>of {enrolment.org.name}</div>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "16px 0 0", maxWidth: "60ch" }}>has completed AI Cleared, the five modules on safe and effective AI use, and passed the final assessment.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginTop: 22, paddingTop: 16, borderTop: "1px solid #d9dde2" }}>
          {[
            ["Track", TRACK_LABEL[DB_TO_TRACK[enrolment.track]]],
            ["Issued", fmtDate(issued.issuedAt)],
            ["Valid until", fmtDate(issued.expiresAt)],
            ["Serial", issued.serial],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: K.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#98a0aa" }}>{k}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <CertificateActions serial={issued.serial} />

      <p style={{ marginTop: 26, fontSize: 13.5, color: K.muted, maxWidth: "60ch" }}>
        Valid for twelve months. The course content is reviewed every quarter and within weeks of a major change to any tool, and renewal is on the refreshed content, so a certificate is never older than the tools it covers.
      </p>
    </>,
  );
}
