import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module13 from "../lessons/module13";

/**
 * /pro/module13 - Module 13: The SOC & the analyst's day.
 *
 * Act 3 (Security+ Domain 4; NICE Cyber Defense Analyst). Paid, so
 * entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 13: The SOC & the analyst's day | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule13Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module13")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module13} />;
}
