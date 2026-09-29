import Link from "next/link";

/**
 * What somebody sees when they are signed in but their school has no licence.
 *
 * Deliberately a page and not a redirect. A teacher who has just been sent this
 * link by their head of computing needs to know what happened and what to do
 * about it; bouncing them to a marketing page tells them neither and looks
 * broken. The same choice the AI Cleared admin page makes for a firm.
 */
export default function Locked({ email }: { email?: string | null }) {
  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">Cyber <span>Heroes</span> &middot; <i>Teacher packs</i></div>
            <div className="sub">{email ?? "Signed in"}</div>
          </div>
        </header>

        <div className="brief">
          <h4>This is for schools with a licence</h4>
          <p>
            The teacher packs carry the whole lesson: the script, the answers, and on some weeks a
            safeguarding briefing written for an adult. They open for staff at a school that holds
            a Cyber Heroes licence.
          </p>
          <p>
            If your school has one and you cannot get in, your account is not on it yet. Ask
            whoever set the licence up to add you, or email{" "}
            <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a> and we will sort
            it out.
          </p>
          <p className="line">
            <Link href="/schools">See what a school licence includes</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
