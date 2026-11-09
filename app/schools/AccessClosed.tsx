import Link from "next/link";

/**
 * What a teacher sees once staff close their school's access via the
 * admin portal's "Revoke" action. Distinct from TrialEnded: this is a
 * deliberate staff action, not a trial running its natural course.
 */
export default function AccessClosed({ orgName }: { orgName: string }) {
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
        </div>
      </div>
    </div>
  );
}
