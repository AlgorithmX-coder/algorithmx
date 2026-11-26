import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module19 from "../lessons/module19";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /pro/module19 - Module 19: Resilience: backups & continuity.
 *
 * Act 4 (Security+ Domains 3/4; ISC2 CC D2). Paid, so entitlement-gated.
 * Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 19: Resilience: backups & continuity | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule19Page() {
  await requireCourse("cyberstart-pro", "/pro/module19");
  return <WeekPlayer week={module19} />;
}
