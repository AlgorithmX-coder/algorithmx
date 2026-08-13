import type { Metadata } from "next";
import LessonPlayer from "../learn/LessonPlayer";
import week08 from "../lessons/week08";

/**
 * /pro/week08 - Cyber Pro Week 8 prototype (Web attacks / SQL injection).
 *
 * Tests the "recreate a real breach in the browser" pattern: a real
 * in-browser SQLite database (sql.js) the learner really injects, then
 * fixes. Behind the site gate; noindex; not yet entitlement-gated.
 */
export const metadata: Metadata = {
  title: "Week 8 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProWeek08Page() {
  return <LessonPlayer lesson={week08} />;
}
