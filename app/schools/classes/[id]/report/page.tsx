import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getSchoolContext } from "@/app/lib/schoolClasses";
import { getClassProgress } from "@/app/lib/classProgress";
import Locked from "../../../teach/Locked";
import { wordsFor } from "../../../words";
import PrintReport from "./PrintReport";
import ReportSheet from "./ReportSheet";
import "./report.css";

/**
 * The class report: one page to print for a head of year, a governor, or a
 * parents' evening folder.
 *
 * WHY IT EXISTS. A school renews on evidence. Everything the product knows
 * about a year's work sits on a screen behind a login that only the class
 * teacher has, which is no use to the person deciding next year's budget.
 * This is that evidence on one sheet of A4, in the register order a school
 * reads names in.
 *
 * An archived class is the normal case here rather than an edge case: the
 * report is wanted most the week after a year ends. So it reads an archived
 * class happily and changes its own title to suit.
 *
 * This file is the gate and the query. Everything that lands on the paper
 * is in ReportSheet, so it can be rendered with made-up names and looked
 * at without a database behind it.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Class report | AlgorithmX",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClassReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // GATE
  /* The same gate as the class page, re-checked here rather than assumed.
     A server-rendered page is a public endpoint whatever linked to it, and
     behind this one is a list of children and how they are doing. */
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/schools/login?callbackUrl=${encodeURIComponent(`/schools/classes/${id}/report`)}`);
  }
  const school = await getSchoolContext(session.user.id);
  if (!school) return <Locked email={session.user.email} />;

  /* Scoped to this teacher's own school inside the query, so a class id
     from another school comes back as not found. */
  const klass = await getClassProgress(school.orgId, id);
  if (!klass) notFound();

  const w = wordsFor(school.kind);

  return (
    <div className="axrep">
      <div className="wrap">
        <div className="modes">
          <Link href={`/schools/classes/${id}`} className="axbtn">
            Back to the {w.group}
          </Link>
          {klass.pupils.length > 0 && <PrintReport />}
        </div>

        {klass.pupils.length === 0 ? (
          <p className="none">
            <b>Nobody is in this {w.group} yet, so there is nothing to report.</b>
            Paste your register into the {w.group} page and this fills itself in as they work.
          </p>
        ) : (
          <ReportSheet klass={klass} orgName={school.orgName} w={w} printedOn={new Date()} />
        )}
      </div>
    </div>
  );
}
