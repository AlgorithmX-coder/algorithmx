import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module07 from "../lessons/module07";

/**
 * /pro/module07 - Module 7: Social engineering & phishing.
 *
 * The human-factors heart of Act 2 (Security+ Domain 2). Act 2 is paid,
 * so this is entitlement-gated: Act 1 is the free taster, everything
 * from here belongs to buyers. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 7: Social engineering & phishing | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule07Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module07")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module07} />;
}
