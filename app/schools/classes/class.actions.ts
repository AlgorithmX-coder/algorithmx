"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import {
  addPupils,
  createClass,
  getSchoolContext,
  removePupil,
  type ClassFailure,
} from "@/app/lib/schoolClasses";

/**
 * Making a class and putting children in it.
 *
 * Every action re-checks the session and the school itself. A server action
 * is a public endpoint whatever renders it, so the gate on the page that
 * draws the button is not a gate on the action behind it. That matters more
 * here than anywhere else in the codebase, because what is behind these is a
 * list of children's names.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/** One sentence per failure, in words a teacher can act on. A raw enum name
 *  in front of a teacher is a support call. */
const SAID: Record<ClassFailure, string> = {
  not_a_school: "Your account is not on a school licence.",
  seats_full: "That would go over your licence.",
  bad_name: "Give the class a name, up to 40 characters.",
  bad_year: "Year group should be a number between 1 and 13.",
  class_not_found: "That class does not exist, or it belongs to another school.",
  bad_pupil_name: "One of those names is too long.",
  no_pupils: "Type at least one name.",
};

export async function createClassAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  const school = await getSchoolContext(session.user.id);
  if (!school) return { ok: false, error: SAID.not_a_school };

  const rawYear = String(formData.get("yearGroup") ?? "").trim();
  const res = await createClass({
    orgId: school.orgId,
    teacherId: session.user.id,
    name: String(formData.get("name") ?? ""),
    yearGroup: rawYear ? Number(rawYear) : null,
  });
  if (!res.ok) return { ok: false, error: SAID[res.error] };

  revalidatePath("/schools/classes");
  return { ok: true, message: `Class created. The code is ${res.code}.` };
}

export async function addPupilsAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  const school = await getSchoolContext(session.user.id);
  if (!school) return { ok: false, error: SAID.not_a_school };

  const classId = String(formData.get("classId") ?? "");
  /* One per line, or commas: a teacher pastes from wherever the register
     already lives and should not have to reformat it first. */
  const names = String(formData.get("names") ?? "")
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  const res = await addPupils({ orgId: school.orgId, classId, firstNames: names });
  if (!res.ok) {
    if (res.error === "seats_full") {
      const left = Number(res.detail ?? 0);
      return {
        ok: false,
        error: left > 0
          ? `That would go over your licence. You have ${left} place${left === 1 ? "" : "s"} left.`
          : "Your licence is full. Email schools@algorithmx.co.uk to add places.",
      };
    }
    if (res.error === "bad_pupil_name") return { ok: false, error: `“${res.detail}” is too long for a first name.` };
    return { ok: false, error: SAID[res.error] };
  }

  revalidatePath("/schools/classes");
  revalidatePath(`/schools/classes/${classId}`);
  return { ok: true, message: `${res.added} pupil${res.added === 1 ? "" : "s"} added.` };
}

export async function removePupilAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const school = await getSchoolContext(session.user.id);
  if (!school) return;

  const id = String(formData.get("childProfileId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  if (id) await removePupil(school.orgId, id);
  revalidatePath(`/schools/classes/${classId}`);
}
