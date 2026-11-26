import type { Metadata } from "next";
import ModuleEleven from "./ModuleEleven";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /desk-ready/m11 - Module 11: Staying safe at work (5 lessons, then three
 * office jobs: a changed-bank-details scam, the wrong Emma, and a sign-in
 * you didn't start). Open during UAT like the rest of the course; noindex
 * until launch.
 */
export const metadata: Metadata = {
  title: "Module 11: Staying safe at work | Desk Ready",
  robots: { index: false, follow: false },
};

export default async function DeskModuleElevenPage() {
  await requireCourse("desk-ready", "/desk-ready/m11");
  return <ModuleEleven />;
}
