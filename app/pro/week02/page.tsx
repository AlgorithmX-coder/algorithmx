import type { Metadata } from "next";
import LessonPlayer from "../learn/LessonPlayer";
import week02 from "../lessons/week02";

/**
 * /pro/week02 - Cyber Pro Week 2 (Encryption).
 *
 * The partner to Week 1: hashing proves, encryption hides. The lab runs
 * real AES-256-GCM in the browser (Web Crypto), so the learner locks a
 * message, watches it become noise, and sees a wrong key return nothing.
 * Behind the site gate; noindex; not yet entitlement-gated.
 */
export const metadata: Metadata = {
  title: "Week 2 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProWeek02Page() {
  return <LessonPlayer lesson={week02} />;
}
