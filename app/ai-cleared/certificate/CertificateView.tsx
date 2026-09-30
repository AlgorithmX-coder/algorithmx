import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getEnrolment, firstNameOf, DB_TO_TRACK } from "@/app/lib/aiCleared";
import { CERT_COPY, fmtDate, issueCertificate } from "@/app/lib/aiClearedCertificate";
import { COURSES, type CourseSlug } from "../engine/courses";
import { TRACK_LABEL } from "../engine/types";
import { K } from "../engine/tokens";
import Frame from "../Frame";
import CourseAside from "../CourseAside";
import CertificateActions from "./CertificateActions";

/* The certificate screen for either course, with the download and the
 * verify link. Issues the certificate on first visit once the course is
 * complete. */
export default async function CertificateView({ course }: { course: CourseSlug }) {
  const c = COURSES[course];
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`${c.base}/certificate`)}`);
  const enrolment = await getEnrolment(session.user.id, course);
  if (!enrolment) redirect(c.base);

  const holder = enrolment.user.name?.trim() || firstNameOf(enrolment.user.name, enrolment.user.email);
  const profile = enrolment.org.profile;
  const aside = <CourseAside course={course} firmName={enrolment.org.name} contactName={profile?.escalationContact ?? enrolment.org.contactName} contactRole={profile?.escalationRole ?? enrolment.org.contactRole} learnerName={holder} done={enrolment.modules.filter((m) => m.completedAt).map((m) => m.module)} />;

  const issued = await issueCertificate(enrolment.id);
  if (!issued.ok) {
    const done = enrolment.modules.filter((m) => m.completedAt).length;
    return (
      <Frame course={course} firmName={enrolment.org.name} courseLink aside={aside}>
        <span className="cf-eyebrow">Certificate</span>
        <h1 className="cf-h1">Your certificate issues when every module is <span className="cf-grad">{course === "ai-fluent" ? "done" : "cleared"}</span>.</h1>
        <p className="cf-lead">{done} module{done === 1 ? "" : "s"} {course === "ai-fluent" ? "done" : "cleared"} so far. The final assessment at the end of Module {c.finalModule} is the last step.</p>
        <Link href={c.base} className="cf-btn cf-btn-pri">Back to your course</Link>
      </Frame>
    );
  }

  const valid = issued.expiresAt > new Date();
  const copy = CERT_COPY[course];
  return (
    <Frame course={course} firmName={enrolment.org.name} courseLink aside={aside}>
      <span className="cf-eyebrow" style={{ color: valid ? K.ok : K.warn }}>{valid ? (course === "ai-fluent" ? "Course complete" : "Course cleared") : "Certificate expired"}</span>
      <h1 className="cf-h1">You are <span className="cf-grad">{c.doneName}</span>, {holder}.</h1>
      <p className="cf-lead">
        Every module {course === "ai-fluent" ? "done" : "cleared"} and the final assessment passed. The certificate below is yours to download; the serial lets a manager, an auditor or an insurer check it without asking you.
      </p>

      <div style={{ position: "relative", borderRadius: 18, padding: 1.5, background: K.grad, boxShadow: K.lift }}>
        <div style={{ background: "#fbfaf7", color: "#14161d", borderRadius: 17, padding: "26px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: K.mono, fontSize: 10.5, letterSpacing: "0.2em", color: "#0a7085", fontWeight: 700 }}>{c.brand}</div>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: K.grad, transform: "rotate(45deg)" }} aria-hidden />
          </div>
          <div style={{ fontSize: 13, color: "#5b6572", marginTop: 16 }}>This certifies that</div>
          <div style={{ fontFamily: K.display, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 2 }}>{holder}</div>
          <div style={{ fontSize: 14, color: "#5b6572", marginTop: 2 }}>of {enrolment.org.name}</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, margin: "16px 0 0", maxWidth: "60ch" }}>{copy.completed}</p>
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
      </div>

      <CertificateActions serial={issued.serial} course={course} />

      <p className="cf-note" style={{ marginTop: 26, maxWidth: "60ch" }}>
        Valid for twelve months. The course content is reviewed every quarter and within weeks of a major change to any tool, and renewal is on the refreshed content, so a certificate is never older than the tools it covers.
      </p>
    </Frame>
  );
}
