import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import LessonPlayer from "../learn/LessonPlayer";
import week13 from "../lessons/week13";

/**
 * /pro/week13 - Cyber Pro Module 14 (Logs and the SIEM).
 *
 * The in-browser honeypot/SIEM triage that proves the real-infra model
 * can be made completion-safe. Act 3 content, so entitlement-gated:
 * Act 1 is the free taster, everything after it belongs to buyers.
 */
export const metadata: Metadata = {
  title: "Module 14 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProWeek13Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/week13")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <LessonPlayer lesson={week13} />;
}
