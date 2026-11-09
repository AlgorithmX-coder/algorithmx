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
import { resetPupilPictures } from "@/app/lib/pupilAuth";
import { SCHOOL_WORDS, wordsFor, type SchoolWords } from "@/app/schools/words";

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

/** One sentence per failure, in words the person can act on. A raw enum
 *  name in front of a teacher is a support call, and so is a youth
 *  project being told its "class" belongs to another "school". */
function saidFor(w: SchoolWords): Record<ClassFailure, string> {
  return {
    not_a_school: `Your account is not on ${w.an} ${w.noun} licence.`,
    seats_full: "That would go over your licence.",
    bad_name: `Give the ${w.group} a name, up to 40 characters.`,
    bad_year: `${w.yearLabel} should be a number between 1 and 13.`,
    bad_course: `Pick one of the four courses for this ${w.group}.`,
    class_not_found: `That ${w.group} does not exist, or it belongs to another ${w.noun}.`,
    bad_pupil_name: "One of those names is too long.",
    no_pupils: "Type at least one name.",
  };
}

/* Before we know who is asking there is no vocabulary to use, so the one
   message that fires without a context stays in the default. */
const NOT_A_SCHOOL = saidFor(SCHOOL_WORDS).not_a_school;

export async function createClassAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  const school = await getSchoolContext(session.user.id);
  if (!school) return { ok: false, error: NOT_A_SCHOOL };
  const w = wordsFor(school.kind);

  const rawYear = String(formData.get("yearGroup") ?? "").trim();
  const res = await createClass({
    orgId: school.orgId,
    teacherId: session.user.id,
    name: String(formData.get("name") ?? ""),
    yearGroup: rawYear ? Number(rawYear) : null,
    productId: String(formData.get("productId") ?? ""),
  });
  if (!res.ok) return { ok: false, error: saidFor(w)[res.error] };

  revalidatePath("/schools/classes");
  return { ok: true, message: `${w.Group} created. The code is ${res.code}.` };
}

export async function addPupilsAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  const school = await getSchoolContext(session.user.id);
  if (!school) return { ok: false, error: NOT_A_SCHOOL };
  const w = wordsFor(school.kind);

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
    return { ok: false, error: saidFor(w)[res.error] };
  }

  revalidatePath("/schools/classes");
  revalidatePath(`/schools/classes/${classId}`);
  return { ok: true, message: `${res.added} ${res.added === 1 ? w.person : w.people} added.` };
}

/**
 * Clear a child's pictures so they can choose again.
 *
 * The only way back in for a child who has forgotten them, and it has to be
 * one click in the middle of a lesson. It is also the mitigation for the
 * first-run claim: a pupil's account is taken by whoever signs in as them
 * first, so a teacher needs to be able to undo that.
 */
export async function resetPicturesAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const school = await getSchoolContext(session.user.id);
  if (!school) return;

  const id = String(formData.get("childProfileId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  if (id) await resetPupilPictures(school.orgId, id);
  revalidatePath(`/schools/classes/${classId}`);
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
