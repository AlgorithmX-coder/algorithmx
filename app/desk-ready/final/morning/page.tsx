import type { Metadata } from "next";
import MorningOffice from "./MorningOffice";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /desk-ready/final/morning - the final task itself: Monday morning at the
 * desk, a timed morning in the pretend office (08:30 to 12:30 office time,
 * about an hour real time). Open during UAT like the rest of the course;
 * noindex until launch.
 */
export const metadata: Metadata = {
  title: "Monday morning at the desk | Desk Ready",
  robots: { index: false, follow: false },
};

export default async function DeskFinalMorningPage() {
  await requireCourse("desk-ready", "/desk-ready/final/morning");
  return <MorningOffice />;
}
