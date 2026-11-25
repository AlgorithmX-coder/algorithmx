import type { Metadata } from "next";
import ModuleTwo from "./ModuleTwo";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /desk-ready/m2 - Module 2: Writing a work email (5 lessons). The pilot
 * module. Open during UAT like the rest of the course; noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Module 2: Writing a work email | Desk Ready",
  robots: { index: false, follow: false },
};

export default async function DeskModuleTwoPage() {
  await requireCourse("desk-ready", "/desk-ready/m2");
  return <ModuleTwo />;
}
