import SchoolSwitcher from "./SchoolSwitcher";
import type { SchoolChoice } from "@/app/lib/schoolChoice";

/**
 * What a teacher sees once staff close their school's access via the
 * admin portal's "Revoke" action. Distinct from TrialEnded: this is a
 * deliberate staff action, not a trial running its natural course.
 */
export default function AccessClosed({
  orgName,
  schools = [],
  currentOrgId = "",
}: {
  orgName: string;
  schools?: SchoolChoice[];
  currentOrgId?: string;
}) {
  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">Algorithm<span>X</span> &middot; <i>Access closed</i></div>
            <div className="sub">{orgName}</div>
          </div>
        </header>

        <div className="brief">
          <h4>This account&rsquo;s access has been closed</h4>
          <p>
            {orgName}&rsquo;s access to AlgorithmX has been closed. If you believe this
            is a mistake, email{" "}
            <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a>.
          </p>
          {/* A closed account takes over the screen, so anybody who also
              belongs to a working school needs the way out right here. */}
          <SchoolSwitcher schools={schools} currentOrgId={currentOrgId} />
        </div>
      </div>
    </div>
  );
}
