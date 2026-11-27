import Link from "next/link";
import DeadEnd, { R8_ICON } from "@/app/components/dead-end/DeadEnd";
import SignOut from "../SignOut";

/**
 * What somebody sees when they are signed in but their school has no licence.
 *
 * Deliberately a page and not a redirect. A teacher who has just been sent this
 * link by their head of computing needs to know what happened and what to do
 * about it; bouncing them to a marketing page tells them neither and looks
 * broken. The same choice the AI Cleared admin page makes for a firm.
 *
 * Names no course. This screen is the gate for the classes page and the
 * overview as well as the packs, and a licence buys places that a school
 * spends on whichever of the school courses it likes. Saying "a Cyber Heroes
 * licence" here was wrong for every school that bought something else.
 *
 * The look is the round 8 dead end (landing lab r8-state.html?s=not-teacher):
 * the light house, a lock, and a "Signed in as" strip with the school
 * portal's own Sign out, so somebody on the wrong account can switch.
 */
export default function Locked({ email }: { email?: string | null }) {
  return (
    <DeadEnd
      tone="school"
      lockup="school"
      back={{ href: "/schools", label: "AlgorithmX for Schools" }}
      eyebrow="For schools"
      title="This is for schools with a licence"
      glyph="lock"
      actions={
        <Link className="r8-btn" href="/schools">
          See what a school licence includes{R8_ICON.arrow}
        </Link>
      }
      who={{
        label: email ? <>Signed in as <b>{email}</b></> : "Signed in",
        signOut: <SignOut className="r8-signout" />,
      }}
    >
      <p>
        Behind here are your classes, your pupils&rsquo; progress, and the teacher packs that
        carry the whole lesson: the script, the answers, and on some weeks a safeguarding
        briefing written for an adult. They open for staff at a school that holds a licence.
      </p>
      <p>
        If your school has one and you cannot get in, your account is not on it yet. Ask
        whoever set the licence up to add you, or email{" "}
        <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a> and we will sort
        it out.
      </p>
    </DeadEnd>
  );
}
