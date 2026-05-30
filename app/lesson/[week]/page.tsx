import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { hasEntitlement } from "@/app/lib/entitlements";
import DynamicLesson from "./DynamicLesson";

/**
 * Flip to `true` only for local dev / QA when you don't want to
 * provision a Stripe entitlement just to walk into Week 1. Lives at
 * module scope so flipping it requires a server restart - intentional,
 * so the bypass can't be hot-reloaded into a real environment.
 * Production: must be `false`.
 */
const BYPASS_ENTITLEMENT_FOR_TESTING = false;

/**
 * /lesson/[week] - server-side auth + entitlement gate.
 *
 * The lesson UI itself is a client component (DynamicLesson) that uses
 * useParams + browser-only state. This server wrapper exists solely
 * to bounce unauthenticated and unentitled users before any client JS
 * loads.
 */
export default async function WeekRoutePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!BYPASS_ENTITLEMENT_FOR_TESTING) {
    const ok = await hasEntitlement(session.user.id, "cyber-heroes");
    if (!ok) redirect("/hub");
  }

  return <DynamicLesson />;
}
