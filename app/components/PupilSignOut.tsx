import { auth } from "@/app/lib/auth";
import { isSchoolPupil } from "@/app/lib/pupilAuth";
import { leaveSchoolPortal } from "@/app/schools/signOut.actions";

/**
 * How a child gets out, on a machine the next child is about to use.
 *
 * There was no way out. A school pupil signs in on a shared classroom
 * machine, and nothing on any screen they can reach signed them out again:
 * /cyberhq had no control, Cyber Explorers had none, the Ops portfolio had
 * none. So the session simply stayed, and the next child to sit down was
 * signed in as the last one. Everything they then played was written into
 * somebody else's progress, and the teacher's dashboard recorded it against
 * the wrong name.
 *
 * Renders for nobody else. A parent's child reaches the same pages, and
 * dropping that family on the school login page would be worse than leaving
 * them alone, so the check is "does this account sit in a class".
 *
 * Fixed rather than placed in each page's header, because the three pupil
 * hubs have three completely different chromes (a cosmic hub, a matrix
 * terminal, a mono operations desk) and one pill that carries its own
 * contrast works on all of them without touching any of their layouts.
 * Bottom right: the top of these pages is already busy, and a child's hand
 * is nearer the bottom of a tablet.
 */
export default async function PupilSignOut() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  if (!(await isSchoolPupil(userId))) return null;

  return (
    <form
      action={leaveSchoolPortal}
      style={{
        position: "fixed",
        right: "max(14px, env(safe-area-inset-right, 0px))",
        bottom: "max(14px, env(safe-area-inset-bottom, 0px))",
        zIndex: 60,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        pointerEvents: "auto",
      }}
    >
      <button
        type="submit"
        style={{
          font: "800 0.86rem ui-rounded, 'Nunito', system-ui, sans-serif",
          color: "#0b1020",
          background: "linear-gradient(135deg, #ffd158, #ff9f43)",
          border: "2px solid rgba(11,16,32,.35)",
          borderRadius: 999,
          /* 44px tall, which is the smallest a child's tap target should be. */
          minHeight: 44,
          padding: "0 18px",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,.4)",
        }}
      >
        Sign out
      </button>
      <span
        style={{
          font: "600 0.68rem ui-rounded, 'Nunito', system-ui, sans-serif",
          color: "#e8edff",
          background: "rgba(8,10,22,.78)",
          borderRadius: 7,
          padding: "3px 8px",
          maxWidth: 190,
          textAlign: "right",
          lineHeight: 1.35,
        }}
      >
        Tap this when you have finished, so the next person can sign in.
      </span>
    </form>
  );
}
