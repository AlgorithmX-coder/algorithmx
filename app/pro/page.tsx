import type { Metadata } from "next";
import CourseHub from "./CourseHub";

/**
 * /pro - the Cyber Pro landing: all 21 modules across four acts, with a
 * route into the built ones. Behind the site-password gate via middleware;
 * noindex until the tier launches.
 */
export const metadata: Metadata = {
  title: "Cyber Pro - the course",
  robots: { index: false, follow: false },
};

export default function ProHomePage() {
  return <CourseHub />;
}
