"use client";

import { useRef, useState, useTransition } from "react";
import { addPupilsAction } from "../class.actions";
import type { SchoolWords } from "../../words";

/**
 * Put children in a class, by name: first name then family name.
 *
 * A textarea rather than a row of fields, because the register already exists
 * somewhere and the fastest thing a teacher can do is paste it. Commas,
 * semicolons and line breaks all split, so whatever they paste works without
 * being reformatted first.
 *
 * The family name is there so a teacher can tell two children called Tom
 * apart (owner, 2026-11-27). It is shown to the teacher only: a child sees
 * a first name, plus an initial when two in the class share it. See
 * app/lib/pupilName.ts.
 */
export default function AddPupils({
  classId,
  placesLeft,
  w,
  askLine,
}: {
  classId: string;
  placesLeft: number;
  /* groups of young people, not classes of pupils */
  w: SchoolWords;
  /** Who to ask for more places, as a sentence: the lead, for a teacher;
   *  us, for the lead. See whoAddsPlaces. */
  askLine?: string;
}) {
  const [pending, start] = useTransition();
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const [count, setCount] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  const recount = (v: string) =>
    setCount(v.split(/[\n,;]+/).map((n) => n.trim()).filter(Boolean).length);

  const submit = (fd: FormData) => {
    setSaid(null);
    start(async () => {
      const res = await addPupilsAction(fd);
      setSaid(res.ok ? { ok: true, text: res.message ?? "Added." } : { ok: false, text: res.error });
      if (res.ok) { form.current?.reset(); setCount(0); }
    });
  };

  const over = count > placesLeft;
  /* Every teacher draws on one shared pool, so an empty pool is the lead's
     to refill, and a teacher is told who that is rather than handed our
     address. */
  const whoToAsk = askLine ?? "Email admissions@algorithmx.co.uk to add places.";

  return (
    <div className="share">
      <h3>Add {w.people}</h3>
      <p className="sharelede">
        One pupil per line, first name then family name, like Tom Baker. Paste your register
        straight in: commas and line breaks both work.
      </p>

      <form ref={form} action={submit}>
        <input type="hidden" name="classId" value={classId} />
        <label className="pupilbox">
          <span>Names</span>
          <textarea
            name="names"
            rows={4}
            placeholder={"Ada Okafor\nSam Reid\nPriya Nair\nTom Baker"}
            onChange={(e) => recount(e.target.value)}
          />
        </label>
        <div className="sharerow" style={{ marginTop: 12 }}>
          <button type="submit" disabled={pending || count === 0 || over || placesLeft <= 0}>
            {pending ? "Adding…" : count === 0 ? `Add ${w.people}` : `Add ${count} ${count === 1 ? w.person : w.people}`}
          </button>
          <span className="pupilcount">
            {placesLeft <= 0
              ? `Every place in the ${w.noun}'s shared pool is used. ${whoToAsk}`
              : over
                ? `That is ${count - placesLeft} more than the ${placesLeft} place${placesLeft === 1 ? "" : "s"} left in the ${w.noun}'s shared pool. ${whoToAsk}`
                : `${placesLeft} place${placesLeft === 1 ? "" : "s"} left in the ${w.noun}'s shared pool.`}
          </span>
        </div>
      </form>

      {said && <p className={said.ok ? "sharedone" : "shareerr"}>{said.text}</p>}
    </div>
  );
}
