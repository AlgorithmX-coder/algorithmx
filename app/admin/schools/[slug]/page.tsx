import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { listClasses } from "@/app/lib/schoolClasses";
import { trialStatus } from "@/app/lib/orgTrial";
import { K } from "../../adminTokens";

/* /admin/schools/[slug]: one school, staff-wide - its classes, pupil
 * counts and trial status. The schools analog of /ai-cleared/ops/[slug],
 * built fresh rather than reusing a teacher's own AdminPanel (schools
 * have no single-org admin console shaped like AdminPanel to borrow). */
export const dynamic = "force-dynamic";

export default async function AdminSchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await prisma.organisation.findFirst({
    where: { slug, school: { isNot: null } },
    include: { school: true },
  });
  if (!org) notFound();

  const classes = await listClasses(org.id);
  const pupilsUsed = classes.reduce((a, c) => a + c._count.pupils, 0);
  const status = trialStatus(org.trialExpiresAt);
  const day = (d: Date | null) => (d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div>
      <p className="ad-back"><Link href="/admin/schools">All schools</Link></p>
      <h1 className="ad-h1">{org.name}</h1>
      <p className="ad-note">
        {org.sector ?? "sector not set"} &middot; contact {org.contactName ?? "not set"}{org.contactRole ? `, ${org.contactRole}` : ""} &middot; {org.stripeCustomerId ? "paid through Stripe" : "manual deal"} &middot; {pupilsUsed} of {org.seatsPurchased} pupil places used &middot; created {day(org.createdAt)}
        {status === "active" && <> &middot; <span className="ad-chip trial">Trial, expires {day(org.trialExpiresAt)}</span></>}
        {status === "expired" && <> &middot; <span className="ad-chip expired">Trial ended {day(org.trialExpiresAt)}</span></>}
      </p>
      {org.school?.safeguardingContact && <p className="ad-note">Safeguarding contact: {org.school.safeguardingContact}{org.school.childLineNumber ? ` · ${org.school.childLineNumber}` : ""}</p>}

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Class</th><th>Year</th><th>Pupils</th><th>Code</th><th>Teacher</th></tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td><b>{c.name}</b></td>
                <td>{c.yearGroup ?? "—"}</td>
                <td>{c._count.pupils}</td>
                <td><code>{c.code}</code></td>
                <td>{c.teacher.name ?? c.teacher.email}</td>
              </tr>
            ))}
            {classes.length === 0 && <tr><td colSpan={5} style={{ color: K.muted }}>No classes yet - the first teacher hasn&rsquo;t claimed their invite.</td></tr>}
          </tbody>
        </table>
      </div>

      <style>{`
        .ad-back { margin: 0 0 10px; font-size: 13px; }
        .ad-back a { color: ${K.accentInk}; text-decoration: none; }
        .ad-h1 { font-family: ${K.display}; font-size: 24px; margin: 0 0 6px; color: ${K.ink}; }
        .ad-note { font-size: 13.5px; color: ${K.muted}; margin: 0 0 8px; }
        .ad-chip { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 6px; padding: 3px 8px; }
        .ad-chip.trial { color: ${K.accentInk}; background: ${K.accentSoft}; }
        .ad-chip.expired { color: ${K.warn}; background: ${K.warnSoft}; }
        .ad-card { background: ${K.panel}; border: 1px solid ${K.edge}; border-radius: 14px; margin-top: 10px; }
        .ad-table-wrap { padding: 6px 0; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 560px; }
        .ad-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 12px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; }
        .ad-table td { padding: 11px 12px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: top; }
        .ad-table td b { color: ${K.ink}; font-weight: 600; }
        .ad-table td code { font-family: ${K.mono}; font-size: 12.5px; }
      `}</style>
    </div>
  );
}
