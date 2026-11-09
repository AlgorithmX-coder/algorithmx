"use server";

import { signOut } from "@/app/lib/auth";

/**
 * Leave the school portal.
 *
 * Until this existed there was no way out of any school screen at all: not
 * the classes page, not the head's overview, not the packs. On a laptop
 * carried between classrooms, or a head's machine a deputy borrows, the
 * only way to stop being signed in was to clear the browser's cookies.
 *
 * Back to /schools/login rather than the site root, because that is the
 * door whoever is next will come through, and it holds both doors: the
 * adult's and the children's.
 */
export async function leaveSchoolPortal() {
  await signOut({ redirectTo: "/schools/login" });
}
