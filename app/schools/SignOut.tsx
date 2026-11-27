import { leaveSchoolPortal } from "./signOut.actions";

/**
 * The sign-out control, shared by every school screen.
 *
 * A form with a submit button rather than a link, because signing out
 * changes something and must not be reachable by a prefetch or a crawl.
 * `className` is the caller's own, so the control reads as one of the
 * buttons already sitting beside it rather than as a stranger: the classes
 * and packs pages pass `axbtn`, the overview passes `sxh-navlink`. `kind`
 * becomes data-kind, for a house that styles its quiet button that way
 * (the round 8 light house: r8-btn with data-kind="ghost").
 */
export default function SignOut({
  className = "axbtn",
  label = "Sign out",
  kind,
}: {
  className?: string;
  label?: string;
  kind?: "ghost";
}) {
  return (
    <form action={leaveSchoolPortal} style={{ margin: 0, display: "inline-flex" }}>
      <button type="submit" className={className} data-kind={kind}>
        {label}
      </button>
    </form>
  );
}
