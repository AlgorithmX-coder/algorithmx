import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module03 from "../lessons/week01";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /pro/module03 - Module 3: Passwords & account security (5 topics).
 * (The manifest lives at lessons/week01 for historical reasons.)
 * Behind the site-password gate; noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 3: Passwords & account security | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule03Page() {
  await requireCourse("cyberstart-pro", "/pro/module03");
  return <WeekPlayer week={module03} />;
}
