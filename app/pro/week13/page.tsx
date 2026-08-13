import type { Metadata } from "next";
import LessonPlayer from "../learn/LessonPlayer";
import week13 from "../lessons/week13";

/**
 * /pro/week13 - Cyber Pro Week 13 prototype (Logs and the SIEM).
 *
 * The highest-risk lab in the course: the in-browser honeypot/SIEM
 * triage that proves the real-infra model can be made completion-safe.
 * Behind the site gate; noindex; not yet entitlement-gated.
 */
export const metadata: Metadata = {
  title: "Week 13 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProWeek13Page() {
  return <LessonPlayer lesson={week13} />;
}
