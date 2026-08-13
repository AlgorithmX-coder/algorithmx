import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import LessonPlayer from "../learn/LessonPlayer";
import week08 from "../lessons/week08";

/**
 * /pro/week08 - Week 8 (Web attacks / real SQL injection). Act 2, so it
 * is behind the £99 purchase. We check the existing Entitlement
 * (slug cyberstart-pro); without it, send the learner to the course
 * home to unlock. The lab itself is a real in-browser SQLite the learner
 * injects then fixes.
 */
export const metadata: Metadata = {
  title: "Week 8 | Cyber Pro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProWeek08Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const unlocked = userId ? await hasEntitlement(userId, "cyberstart-pro") : false;
  if (!unlocked) redirect("/pro");
  return <LessonPlayer lesson={week08} />;
}
