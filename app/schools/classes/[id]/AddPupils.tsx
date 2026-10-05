"use client";

import { useRef, useState, useTransition } from "react";
import { addPupilsAction } from "../class.actions";

/**
 * Put children in a class, by first name.
 *
 * A textarea rather than a row of fields, because the register already exists
 * somewhere and the fastest thing a teacher can do is paste it. Commas,
 * semicolons and line breaks all split, so whatever they paste works without
 * being reformatted first.
 *
 * First names only, said out loud in the label and meant: a surname is not
 * needed to run the lesson and we would rather not hold one.
 */
export default function AddPupils({ classId, placesLeft }: { classId: string; placesLeft: number }) {
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

  return (
    <div className="share">
      <h3>Add pupils</h3>
      <p className="sharelede">
        One first name per line. Paste your register straight in: commas and line breaks both
        work. <b>First names only</b>, no surnames.
      </p>

      <form ref={form} action={submit}>
        <input type="hidden" name="classId" value={classId} />
        <label className="pupilbox">
          <span>Names</span>
          <textarea
            name="names"
            rows={6}
            placeholder={"Ada\nSam\nPriya\nTom"}
            onChange={(e) => recount(e.target.value)}
          />
        </label>
        <div className="sharerow" style={{ marginTop: 10 }}>
          <button type="submit" disabled={pending || count === 0 || over}>
            {pending ? "Adding…" : count === 0 ? "Add pupils" : `Add ${count} pupil${count === 1 ? "" : "s"}`}
          </button>
          <span className="pupilcount">
            {over
              ? `That is ${count - placesLeft} over your licence. You have ${placesLeft} place${placesLeft === 1 ? "" : "s"} left.`
              : `${placesLeft} place${placesLeft === 1 ? "" : "s"} left on your licence.`}
          </span>
        </div>
      </form>

      {said && <p className={said.ok ? "sharedone" : "shareerr"}>{said.text}</p>}
    </div>
  );
}
