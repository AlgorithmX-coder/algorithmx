"use client";

import { useRef, useState, useTransition } from "react";
import { createClassAction } from "./class.actions";

/**
 * Make a class.
 *
 * Three fields: what the school calls it, which year it is, and which course
 * it runs. The code is generated and shown once it exists; a teacher never
 * picks one, because a memorable code is a guessable code and this one
 * unlocks a list of children's names.
 *
 * The course is the one that matters, and it is per class rather than per
 * school so one school can run Cyber Heroes in year 4 and Cyber Explorers in
 * year 8. Age ranges are shown beside each course and none is disabled: year
 * groups are named differently in every country, and a catch-up group or an
 * SEN class is a good reason to pick a course that does not match the year.
 */
export interface CourseChoice {
  id: string;
  name: string;
  ageRange: string;
}

export default function NewClass({
  placesLeft,
  courses,
}: {
  placesLeft: number;
  courses: readonly CourseChoice[];
}) {
  const [pending, start] = useTransition();
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const submit = (fd: FormData) => {
    setSaid(null);
    start(async () => {
      const res = await createClassAction(fd);
      setSaid(res.ok ? { ok: true, text: res.message ?? "Class created." } : { ok: false, text: res.error });
      if (res.ok) form.current?.reset();
    });
  };

  return (
    <div className="share">
      <h3>Make a class</h3>
      <p className="sharelede">
        {placesLeft > 0
          ? `Your licence has ${placesLeft} place${placesLeft === 1 ? "" : "s"} left.`
          : "Your licence is full. You can still make a class, but you will not be able to add pupils to it."}
      </p>

      <form ref={form} action={submit} className="sharerow">
        <label className="grow">
          <span>What the class is called</span>
          <input name="name" placeholder="4B" maxLength={40} required />
        </label>
        <label>
          <span>Year group</span>
          <input name="yearGroup" type="number" min={1} max={13} placeholder="4" />
        </label>
        <label className="grow">
          <span>Which course</span>
          <select name="productId" required defaultValue={courses[0]?.id ?? ""}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} &middot; ages {c.ageRange}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending}>{pending ? "Making…" : "Make the class"}</button>
      </form>

      {said && (
        <p className={said.ok ? "sharedone" : "shareerr"}>{said.text}</p>
      )}
    </div>
  );
}
