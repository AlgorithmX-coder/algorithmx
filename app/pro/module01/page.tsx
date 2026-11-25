import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module01 from "../lessons/module01";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /pro/module01 - Module 1: What security actually means (5 topics).
 *
 * The concept foundation (Security+ Domain 1 / ISC² CC principles).
 * Behind the site-password gate via middleware; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 1: What security actually means | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule01Page() {
  await requireCourse("cyberstart-pro", "/pro/module01");
  return <WeekPlayer week={module01} />;
}
