import { CATALOGUE } from "@/app/lib/courseIntent";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { hasEntitlement } from "@/app/lib/entitlements";
import DynamicLesson from "./DynamicLesson";
import { isStaffUser } from "@/app/lib/aiClearedStaff";

/**
 * Flip to `true` only for local dev / QA when you don't want to
 * provision a Stripe entitlement just to walk into Week 1. Lives at
 * module scope so flipping it requires a server restart - intentional,
 * so the bypass can't be hot-reloaded into a real environment.
 * Production: must be `false`.
 */
const BYPASS_ENTITLEMENT_FOR_TESTING = false;

/**
 * Owner accounts that may use the `?screen=` / `?boss=1` preview deep-links
 * on production (to QA a boss without playing the whole lesson) are
 * AlgorithmX staff, checked on the server by isStaffUser (role "staff", or
 * listed in the PLATFORM_STAFF_EMAILS environment variable). No address
 * lives in the code, and a child's account is never staff, so the "no
 * skipping to the boss" guard still holds for every customer.
 */
const canUsePreviewLinks = (userId: string): Promise<boolean> => isStaffUser(userId);

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
    if (!ok) redirect(CATALOGUE);
  }

  // E2E_TESTS (set only by the Playwright webServer) re-enables the
  // ?screen QA deep-link so the click-through test can visit every screen.
  // ownerPreview grants the same deep-link to AlgorithmX staff only.
  const ownerPreview = await canUsePreviewLinks(session.user.id);
  return (
    <DynamicLesson
      qaEnabled={process.env.E2E_TESTS === "1"}
      ownerPreview={ownerPreview}
    />
  );
}
