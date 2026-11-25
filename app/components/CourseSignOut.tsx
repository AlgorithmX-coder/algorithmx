import type { ReactNode } from "react";
import { signOutOfCourse } from "@/app/lib/courseSignOut.actions";

/**
 * A "Sign out" control for a course hub's header. Renders a real form
 * posting to the signOutOfCourse server action, so it works before any
 * script has loaded and from server and client components alike.
 *
 * The form is display:contents so the button sits in the header's own flex
 * row exactly as a link would; each hub passes its own button class so the
 * control matches that course's look.
 */
export default function CourseSignOut({
  course,
  className,
  children,
}: {
  /** The catalogue slug of the course this hub belongs to. */
  course: "cyber-heroes" | "cyberexplorers" | "cyberstart" | "cyberstart-pro" | "desk-ready";
  className?: string;
  children: ReactNode;
}) {
  return (
    <form action={signOutOfCourse} style={{ display: "contents" }}>
      <input type="hidden" name="course" value={course} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
