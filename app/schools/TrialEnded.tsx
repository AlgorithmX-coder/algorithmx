import Link from "next/link";
import SchoolSwitcher from "./SchoolSwitcher";
import type { SchoolChoice } from "@/app/lib/schoolChoice";

/**
 * What a trial teacher sees once their staff-granted trial window closes.
 *
 * Deliberately a page and not a redirect, same reasoning as Locked: a
 * teacher who was shown this during a sales trial needs to know what
 * happened and what to do next, not land somewhere that looks broken.
 *
 * IT TAKES OVER THE WHOLE SCREEN, which is why the switcher is on it. This
 * notice is where the wrong-school bug surfaced: a lapsed school&rsquo;s
 * trial notice shown while a working school sat behind it, with no way to
 * reach the working one. The choice now prefers a live school, and if
 * somebody still lands here with another school available, the way out is
 * on the page rather than in a support email.
 */
export default function TrialEnded({
  orgName,
  trialExpiresAt,
  schools = [],
  currentOrgId = "",
}: {
  orgName: string;
  trialExpiresAt: Date;
  schools?: SchoolChoice[];
  currentOrgId?: string;
}) {
  const day = trialExpiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">Algorithm<span>X</span> &middot; <i>Trial</i></div>
            <div className="sub">{orgName}</div>
          </div>
        </header>

        <div className="brief">
          <h4>Your trial has ended</h4>
          <p>
            {orgName}&rsquo;s trial ended on {day}. Everything you tried stays
            exactly as it was; a licence picks straight back up from here.
          </p>
          <p>
            To carry on, email{" "}
            <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a> and we will set
            up a licence for {orgName}.
          </p>
          <p className="line">
            <Link href="/schools">See what a licence includes</Link>
          </p>
          <SchoolSwitcher schools={schools} currentOrgId={currentOrgId} />
        </div>
      </div>
    </div>
  );
}
