import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module16 from "../lessons/module16";

/**
 * /pro/module16 - Module 16: Incident response & forensics.
 *
 * The close of Act 3 (Security+ Domain 4; NIST 800-61). Paid, so
 * entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 16: Incident response & forensics | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule16Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module16")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module16} />;
}
