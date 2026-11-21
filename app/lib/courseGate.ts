import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { isSchoolPupil } from "@/app/lib/pupilAuth";

/**
 * Does this person own this course?
 *
 * WHY IT EXISTS. Cyber Heroes has asked that question on every lesson load
 * since it shipped. Cyber Explorers never asked it at all: `/explorers` was
 * a client component with no session behind it, so anyone past the site
 * password played all twenty cases free. Cyber Ops asked for a sign-in and
 * then never checked what the account had paid for, which is the same hole
 * with a login page in front of it.
 *
 * One function so the three courses cannot drift apart again, and so there
 * is exactly one place to read when somebody asks what the rule is.
 *
 * THE ANSWER IS DELIBERATELY NOT A REDIRECT. A child on a classroom machine
 * who lands on a sales page has been failed twice: they cannot buy anything,
 * and they have lost the thing they were told to open. So the gate reports
 * what it found and the screen decides, which lets a pupil be sent to their
 * own door and an adult to the course's own page.
 */
export type CourseGate =
  | { ok: true; userId: string }
  /** Nobody is signed in. */
  | { ok: false; reason: "signed_out"; pupil: false }
  /** Signed in, but this account does not hold the course. */
  | { ok: false; reason: "not_entitled"; pupil: boolean };

export async function courseGate(productSlug: string): Promise<CourseGate> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, reason: "signed_out", pupil: false };

  if (await hasEntitlement(userId, productSlug)) return { ok: true, userId };

  /* Which door to offer. A school pupil has one, and it is not a sales
     page: their class is on some other course, or their school's access
     has been closed, and either way the person who can fix it is their
     teacher. */
  return { ok: false, reason: "not_entitled", pupil: await isSchoolPupil(userId) };
}
