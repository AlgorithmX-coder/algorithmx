import type { Metadata } from "next";
import ModuleThirteen from "./ModuleThirteen";

/**
 * /desk-ready/m13 - Module 13: Show what you can do (5 lessons: experience
 * in office words, a one-page CV, job sites and fake jobs, agency typing
 * and Excel tests, and video interviews; then two office jobs: a CV from
 * your week, and the agency's tests). Open during UAT like the rest of the
 * course; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 13: Show what you can do | Desk Ready",
  robots: { index: false, follow: false },
};

export default function DeskModuleThirteenPage() {
  return <ModuleThirteen />;
}
