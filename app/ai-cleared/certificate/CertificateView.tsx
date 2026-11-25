import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getEnrolment, firstNameOf, DB_TO_TRACK } from "@/app/lib/aiCleared";
import { CERT_COPY, fmtDate, issueCertificate } from "@/app/lib/aiClearedCertificate";
import { COURSES, type CertifiedCourseSlug } from "../engine/courses";
import { TRACK_LABEL } from "../engine/types";
import LightTable from "./LightTable";

/* The certificate screen for a holder of an AI Cleared or AI Fluent
 * certificate issued before 2026-11-09, with the download. Nothing links
 * here any more and no new certificate issues; it stays so the people who
 * hold one can still reach it. Anyone without one goes back to their
 * course. Cyber Awareness never had one.
 *
 * The page is the round 6 "Light Table" (LightTable.tsx); the gates, the
 * lookups and the facts are unchanged. */
export default async function CertificateView({ course }: { course: CertifiedCourseSlug }) {
  const c = COURSES[course];
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`${c.base}/certificate`)}`);
  const enrolment = await getEnrolment(session.user.id, course);
  if (!enrolment) redirect(c.base);

  const holder = enrolment.user.name?.trim() || firstNameOf(enrolment.user.name, enrolment.user.email);

  /* No new certificate issues (owner, 2026-11-09), so this only finds one
   * issued before then. Without one there is nothing to show: back to
   * the course, where completion is shown module by module. */
  const issued = await issueCertificate(enrolment.id);
  if (!issued.ok) redirect(c.base);

  const valid = issued.expiresAt > new Date();
  const copy = CERT_COPY[course];
  return (
    <LightTable
      course={course}
      name={c.name}
      brand={c.brand}
      doneName={c.doneName}
      base={c.base}
      holder={holder}
      firm={enrolment.org.name}
      email={enrolment.user.email}
      track={TRACK_LABEL[DB_TO_TRACK[enrolment.track]]}
      issued={fmtDate(issued.issuedAt)}
      until={fmtDate(issued.expiresAt)}
      serial={issued.serial}
      valid={valid}
      completed={copy.completed}
      chips={copy.chips}
    />
  );
}
