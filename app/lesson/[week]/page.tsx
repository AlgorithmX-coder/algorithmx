import { requireCourse } from "@/app/lib/courseAccess";
import DynamicLesson from "./DynamicLesson";
import { isStaffUser } from "@/app/lib/aiClearedStaff";

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
export default async function WeekRoutePage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const { session } = await requireCourse("cyber-heroes", `/lesson/${encodeURIComponent(week)}`);

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
