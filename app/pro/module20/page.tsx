import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module20 from "../lessons/module20";

/**
 * /pro/module20 - Module 20: The roles & the certification roadmap.
 *
 * Act 4 (career map). Paid, so entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 20: The roles & the cert roadmap | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule20Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module20")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module20} />;
}
