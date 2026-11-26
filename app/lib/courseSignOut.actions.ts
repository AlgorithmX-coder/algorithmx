"use server";

import { auth, signOut } from "@/app/lib/auth";
import { isSchoolPupil } from "@/app/lib/pupilAuth";

/**
 * Sign out of a course, from that course's own hub.
 *
 * A child on a family account could not sign out of Cyber HQ, Cyber
 * Explorers or Cyber Ops at all: the only control there (PupilSignOut)
 * renders for school pupils. Every course hub now carries a Sign out, and
 * this is what it calls.
 *
 * Where it lands: that course's own sign-in page, so whoever is next can
 * sign straight back in to the same course. A school pupil keeps today's
 * behaviour and goes to /schools/login, the door the next child in the
 * class comes through. An unknown course falls back to the general sign-in.
 *
 * The course arrives as a hidden form field rather than a bound argument so
 * the same <form> works from server and client components alike.
 */
const COURSE_SIGN_IN: ReadonlyMap<string, string> = new Map([
  ["cyber-heroes", "/cyberheroes/login"],
  ["cyberexplorers", "/cyberexplorers/login"],
  ["cyberstart", "/ops/login"],
  ["cyberstart-pro", "/pro/login"],
  ["desk-ready", "/desk-ready/login"],
]);

export async function signOutOfCourse(formData: FormData): Promise<void> {
  const course = String(formData.get("course") ?? "");
  const session = await auth();
  const userId = session?.user?.id;
  const pupil = userId ? await isSchoolPupil(userId) : false;
  const redirectTo = pupil ? "/schools/login" : (COURSE_SIGN_IN.get(course) ?? "/login");
  await signOut({ redirectTo });
}
