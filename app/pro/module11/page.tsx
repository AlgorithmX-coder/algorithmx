import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module11 from "../lessons/module11";

/**
 * /pro/module11 - Module 11: Vulnerabilities & patching.
 *
 * The close of Act 2 (Security+ Domains 2/4; OWASP A06; CE Update
 * Management). Act 2 is paid, so this is entitlement-gated: Act 1 is the
 * free taster, everything from here belongs to buyers. Noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Module 11: Vulnerabilities & patching | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule11Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module11")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module11} />;
}
