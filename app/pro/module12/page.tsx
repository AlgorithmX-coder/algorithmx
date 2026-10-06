import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module12 from "../lessons/module12";

/**
 * /pro/module12 - Module 12: Hardening & secure configuration.
 *
 * The start of Act 3 (Security+ Domain 4; Cyber Essentials). Paid, so
 * entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 12: Hardening & secure configuration | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule12Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module12")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module12} />;
}
