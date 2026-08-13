import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import LessonPlayer from "../learn/LessonPlayer";
import week13 from "../lessons/week13";

/**
 * /pro/week13 - Week 13 (Logs and the SIEM). Act 3, so it is behind the
 * £99 purchase. Checked via the existing Entitlement (slug
 * cyberstart-pro); without it, send the learner to the course home.
 * The lab is the in-browser mini-SIEM over real honeypot data.
 */
export const metadata: Metadata = {
  title: "Week 13 | Cyber Pro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProWeek13Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const unlocked = userId ? await hasEntitlement(userId, "cyberstart-pro") : false;
  if (!unlocked) redirect("/pro");
  return <LessonPlayer lesson={week13} />;
}
