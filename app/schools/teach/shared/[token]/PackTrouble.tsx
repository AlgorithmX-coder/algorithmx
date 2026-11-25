import type { CSSProperties } from "react";
import Link from "next/link";
import SchoolBrand from "@/app/schools/SchoolBrand";
import CourseLockup from "@/app/components/CourseLockup";
import CampusShell, { BackLink } from "@/app/components/campus-console/CampusShell";

/* Why a shared teacher-pack link does not open, in the round 6 Campus
 * Console. The words are the page's own TROUBLE entries, passed in. */
const WARN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });

export default function PackTrouble({ head, body, link }: { head: string; body: string; link: boolean }) {
  return (
    <CampusShell
      family="schools"
      page="pack-share"
      lockup={<span className="r6-brand"><SchoolBrand /></span>}
      lockupHref="/schools"
      lockupLabel="Cyber School by AlgorithmX"
      right={<BackLink href="/schools">AlgorithmX for Schools</BackLink>}
      width={500}
    >
      <div className="r6-packbrand" data-rise="" style={{ marginBottom: 18, "--i": 0 } as CSSProperties}>
        <CourseLockup id="heroes" tone="night" size={0.95} />
        <span className="r6-chip" style={{ marginLeft: 4 }}>Teacher pack</span>
      </div>
      <p className="r6-msg err" role="alert" aria-live="polite" {...rise(1)}>{WARN}<span>{head}</span></p>
      <h1 className="r6-title" id="r6-title" {...rise(2)}>{head}</h1>
      <p className="r6-sub" {...rise(3)}>{body}</p>
      {link && (
        <div className="r6-actions" {...rise(4)}>
          <Link className="r6-btn ghost" href="/schools"><span className="lbl">See what a school licence includes</span></Link>
        </div>
      )}
    </CampusShell>
  );
}
