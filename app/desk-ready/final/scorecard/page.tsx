import type { Metadata } from "next";
import MorningScorecard from "./MorningScorecard";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /desk-ready/final/scorecard - the one-page scorecard for the final task:
 * every job done, done late or missed, the criteria and habits, and the
 * order the learner chose. Printable (Save as PDF). Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Your Monday morning scorecard | Desk Ready",
  robots: { index: false, follow: false },
};

export default async function DeskFinalScorecardPage() {
  await requireCourse("desk-ready", "/desk-ready/final/scorecard");
  return <MorningScorecard />;
}
