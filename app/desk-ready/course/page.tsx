import type { Metadata } from "next";
import CourseHome from "./CourseHome";

/**
 * /desk-ready/course - "Your desk": progress, the next lesson, and every
 * part and module with its own status. Where a learner lands after signing
 * up or in (courseIntent COURSE_HOME). No entitlement gate yet: like Cyber
 * Pro during UAT, the course is open while it is being tested. Progress
 * lives in the browser, so the page is a client component. Noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Your desk | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskCoursePage() {
  return <CourseHome />;
}
