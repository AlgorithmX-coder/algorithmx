import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import LessonPlayer from "../learn/LessonPlayer";
import week08 from "../lessons/week08";

/**
 * /pro/week08 - Cyber Pro Module 9 (Web attacks / SQL injection).
 *
 * The "recreate a real breach in the browser" pattern: a real
 * in-browser SQLite database (sql.js) the learner really injects, then
 * fixes. Act 2 content, so entitlement-gated: Act 1 is the free
 * taster, everything after it belongs to buyers.
 */
export const metadata: Metadata = {
  title: "Module 9 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProWeek08Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/week08")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <LessonPlayer lesson={week08} />;
}
