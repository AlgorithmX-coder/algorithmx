import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { leaveSchoolPortal } from "@/app/schools/signOut.actions";
import DeadEnd from "@/app/components/dead-end/DeadEnd";

/**
 * Where a school pupil lands when a course is not open to them: their
 * class is on a course they no longer hold, usually because the school's
 * access has been closed. requireCourse sends them here instead of to a
 * course's sales page.
 *
 * A child is never offered a price, never told to buy anything and never
 * told they did something wrong. They are told to ask their teacher, which
 * is the only thing they can act on, and they can sign out so the next
 * child can sign in. It runs no course gate itself, so it cannot loop.
 *
 * The look is the round 8 dead end for a pupil (landing lab
 * r8-state.html?s=no-course): the light house in amber, a Fredoka title, a
 * waving hand, and no link anywhere: Sign out is the only way out.
 */
export const metadata: Metadata = {
  title: "Ask your teacher | AlgorithmX",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PupilNoCoursePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/schools/login");

  return (
    <DeadEnd
      tone="pupil"
      lockup="school"
      lockupLink={false}
      eyebrow="Ask your teacher"
      title="This one is not open for you right now"
      glyph="wave"
      actions={
        <form action={leaveSchoolPortal}>
          <button type="submit" className="r8-btn">
            Sign out
          </button>
        </form>
      }
    >
      <p>Ask your teacher to check your class. Nothing you have done is lost.</p>
    </DeadEnd>
  );
}
