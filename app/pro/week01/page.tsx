import type { Metadata } from "next";
import LessonPlayer from "../learn/LessonPlayer";
import week01 from "../lessons/week01";

/**
 * /pro/week01 - Week 1 (Passwords). Act 1 is the free taster, so this
 * is open behind the site gate, no entitlement required. Progress saves
 * to localStorage today; server progress is a follow-up.
 */
export const metadata: Metadata = {
  title: "Week 1 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProWeek01Page() {
  return <LessonPlayer lesson={week01} />;
}
