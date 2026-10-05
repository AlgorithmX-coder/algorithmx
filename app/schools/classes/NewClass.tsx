"use client";

import { useRef, useState, useTransition } from "react";
import { createClassAction } from "./class.actions";

/**
 * Make a class.
 *
 * Two fields, because that is all a class needs before it is useful: what the
 * school calls it, and which year it is. The code is generated and shown
 * once it exists; a teacher never picks one, because a memorable code is a
 * guessable code and this one unlocks a list of children's names.
 */
export default function NewClass({ placesLeft }: { placesLeft: number }) {
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
        <button type="submit" disabled={pending}>{pending ? "Making…" : "Make the class"}</button>
      </form>

      {said && (
        <p className={said.ok ? "sharedone" : "shareerr"}>{said.text}</p>
      )}
    </div>
  );
}
