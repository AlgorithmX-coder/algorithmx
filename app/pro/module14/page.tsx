import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module14 from "../lessons/module14";

/**
 * /pro/module14 - Module 14: Logs & the SIEM (5 topics).
 *
 * The full logs/SIEM module, with the real in-browser honeypot SIEM
 * investigation (topic 2). Act 3 is paid, so entitlement-gated. Noindex
 * until launch.
 */
export const metadata: Metadata = {
  title: "Module 14: Logs & the SIEM | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule14Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module14")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module14} />;
}
