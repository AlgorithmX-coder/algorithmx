import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module09 from "../lessons/module09";

/**
 * /pro/module09 - Module 9: Web attacks & the OWASP Top 10.
 *
 * The full web-security module, with the real in-browser SQL-injection
 * lab at its heart (topic 2). Act 2 is paid, so this is entitlement-
 * gated: Act 1 is the free taster, everything from here belongs to
 * buyers. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 9: Web attacks & the OWASP Top 10 | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule09Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module09")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module09} />;
}
