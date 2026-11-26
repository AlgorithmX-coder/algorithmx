import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { grantEntitlement, hasEntitlement } from "@/app/lib/entitlements";
import { TESTER_FREE_ACCESS } from "@/app/lib/launchSwitch";
import { pupilCourseHomeFor } from "@/app/lib/courseIntent";
import { COURSE_LANDING_ROUTES } from "@/app/lib/courseLandings";

/**
 * THE ACCESS RULE FOR EVERY CONSUMER COURSE, in one place.
 *
 * Owner, 2026-11-25: "A person buys the course, and then they have access
 * to it. One person pays for one course; they should only have access to
 * that one course and nothing else. At launch nothing is free."
 *
 * So every course surface (hub, module, lesson, portfolio) calls
 * requireCourse(slug, here) on the server before it renders anything:
 *
 *   - Not signed in: that course's own sign-in page, with a callbackUrl
 *     back to `here`, so signing in lands them where they were going.
 *   - Signed in and holding the entitlement for THIS course: allowed.
 *     hasEntitlement already honours school BUNDLE grants and switches
 *     them off when the school's access is closed.
 *   - Signed in without it: that course's landing (buy) page. Until launch
 *     (TESTER_FREE_ACCESS in app/lib/launchSwitch.ts) an adult is instead
 *     granted the course and let in, so testers stay fully open.
 *   - A school pupil without it is never sent to a sales page. If their
 *     class is on another course they still hold, they go there; if not
 *     (their school's access was closed), a quiet page that tells them to
 *     ask their teacher.
 *
 * It redirects rather than rendering a locked screen so the answer is the
 * same on every course and a page cannot forget to stop rendering. Call it
 * from the page (or, for a client-only page, the nearest server layout), not
 * from a shared layout above pages that must stay public.
 */

/* Each course's own sign-in page, and its landing (buy) page from the
 * shared landing map, so the two can never disagree. */
export const CONSUMER_COURSES = {
  "cyber-heroes": { signIn: "/cyberheroes/login", landing: COURSE_LANDING_ROUTES["cyber-heroes"] },
  cyberexplorers: { signIn: "/cyberexplorers/login", landing: COURSE_LANDING_ROUTES.cyberexplorers },
  /** Cyber Ops: the name changed, the catalogue slug did not. */
  cyberstart: { signIn: "/ops/login", landing: COURSE_LANDING_ROUTES.cyberstart },
  /** Cyber Pro. */
  "cyberstart-pro": { signIn: "/pro/login", landing: COURSE_LANDING_ROUTES["cyberstart-pro"] },
  "desk-ready": { signIn: "/desk-ready/login", landing: COURSE_LANDING_ROUTES["desk-ready"] },
} as const;

export type ConsumerCourseSlug = keyof typeof CONSUMER_COURSES;

/** Where a pupil goes when neither this course nor their own class's is open to them. */
export const PUPIL_NO_COURSE = "/schools/no-course";

/** Only same-origin paths go into a callbackUrl. */
function safeHere(here: string): string {
  return here.startsWith("/") && !here.startsWith("//") ? here : "/";
}

export function courseSignInUrl(slug: ConsumerCourseSlug, here: string): string {
  return `${CONSUMER_COURSES[slug].signIn}?callbackUrl=${encodeURIComponent(safeHere(here))}`;
}

/**
 * Where a signed-in person who does not hold `slug` is sent.
 * Exported for the unit test; pages call requireCourse.
 */
type PupilRow = { class: { product: { slug: string } } | null } | null;

function findPupil(userId: string): Promise<PupilRow> {
  return prisma.childProfile.findFirst({
    where: { userId, classId: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { class: { select: { product: { select: { slug: true } } } } },
  });
}

export async function deniedDestination(
  userId: string,
  slug: ConsumerCourseSlug,
  pupilRow?: PupilRow,
): Promise<string> {
  const pupil = pupilRow === undefined ? await findPupil(userId) : pupilRow;
  if (!pupil) return CONSUMER_COURSES[slug].landing;

  const own = pupil.class?.product.slug;
  if (own && own !== slug && (await hasEntitlement(userId, own))) return pupilCourseHomeFor(own);
  return PUPIL_NO_COURSE;
}

/**
 * Let the signed-in owner of `slug` through, or redirect. `here` is this
 * page's own path, used as the callback after signing in.
 */
export type SignedInSession = Session & { user: NonNullable<Session["user"]> & { id: string } };

export async function requireCourse(
  slug: ConsumerCourseSlug,
  here: string,
): Promise<{ userId: string; session: SignedInSession }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session || !userId) redirect(courseSignInUrl(slug, here));
  if (await hasEntitlement(userId, slug)) return { userId, session: session as SignedInSession };

  const pupil = await findPupil(userId);
  /* Tester period (app/lib/launchSwitch.ts): a signed-in adult who lacks
     this course is granted it, the same way signup grants it, and let in.
     A school pupil is never auto-granted: their access is their school's. */
  if (TESTER_FREE_ACCESS && !pupil) {
    let granted = false;
    try {
      await grantEntitlement(userId, slug, "MANUAL");
      granted = true;
    } catch (err) {
      console.error("[requireCourse] tester grant failed", slug, err);
    }
    if (granted) return { userId, session: session as SignedInSession };
  }
  redirect(await deniedDestination(userId, slug, pupil));
}
