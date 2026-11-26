import type { Metadata } from "next";
import CourseHub from "../CourseHub";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /pro/course — the course hub: all 21 modules across the four acts,
 * with a route into the built ones. Behind the site-password gate;
 * noindex until the tier launches.
 */
export const metadata: Metadata = {
  title: "Cyber Pro - the course",
  robots: { index: false, follow: false },
};

export default async function ProCoursePage() {
  await requireCourse("cyberstart-pro", "/pro/course");
  return <CourseHub />;
}
