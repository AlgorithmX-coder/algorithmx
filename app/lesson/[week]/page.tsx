import { requireCourse } from "@/app/lib/courseAccess";
import DynamicLesson from "./DynamicLesson";

/**
 * Owner accounts that may use the `?screen=` / `?boss=1` preview deep-links
 * on production (to QA a boss without playing the whole lesson). Kids' own
 * accounts are never in this list, so the "no skipping to the boss" guard
 * still holds for them. The email is already public in this repo's git
 * history, so it leaks nothing new.
 */
const OWNER_EMAILS = ["asadjalal96@outlook.com"];

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
  // ownerPreview grants the same deep-link to the site owner only.
  const ownerPreview = !!session.user.email && OWNER_EMAILS.includes(session.user.email);
  return (
    <DynamicLesson
      qaEnabled={process.env.E2E_TESTS === "1"}
      ownerPreview={ownerPreview}
    />
  );
}
