"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Delete an organisation for good. Only appears once access is closed.
 *
 * The two-step gate is deliberate and is not a confirmation dialog. Closing
 * access is a separate act, done earlier, that someone had to mean; this
 * button does not exist before it. A dialog alone is something a tired
 * person clicks through at the end of a long afternoon.
 *
 * The server checks the same condition again, because a button is not a
 * gate. What is lost is spelled out in numbers before the fact, since
 * "this deletes 48 pupil accounts" is the sentence that stops a wrong click,
 * and typing the name is the last thing between the two.
 */
export default function DeleteOrgButton({
  orgId,
  name,
  noun,
  backTo,
  closed,
  pupils,
  classes,
}: {
  orgId: string;
  name: string;
  /** "school", "organisation" or "firm". */
  noun: string;
  backTo: string;
  closed: boolean;
  pupils: number;
  classes: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* No button at all until access is closed. Nothing to explain away and
     nothing to misclick. */
  if (!closed) return null;

  async function remove() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/delete-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      router.push(backTo);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="ad-btn ad-btn-danger" onClick={() => setOpen(true)}>
        Delete this {noun}
      </button>
    );
  }

  const matches = typed.trim() === name;

  return (
    <div className="ad-made danger">
      <b>Delete {name} for good?</b>
      <span>
        This cannot be undone.
        {pupils > 0 || classes > 0 ? (
          <>
            {" "}It removes <b>{classes} class{classes === 1 ? "" : "es"}</b> and{" "}
            <b>{pupils} pupil account{pupils === 1 ? "" : "s"}</b>, with every star and badge those
            children earned.
          </>
        ) : (
          " There are no classes or pupils attached to it."
        )}{" "}
        Teachers keep their own accounts.
      </span>
      <label className="ad-confirm">
        Type <b>{name}</b> to confirm
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={name}
          autoComplete="off"
          aria-label={`Type ${name} to confirm deletion`}
        />
      </label>
      <span>
        <button type="button" className="ad-btn ad-btn-danger" onClick={remove} disabled={busy || !matches}>
          {busy ? "Deleting…" : `Delete this ${noun}`}
        </button>
        <button type="button" className="ad-btn" onClick={() => { setOpen(false); setTyped(""); }} disabled={busy}>
          Cancel
        </button>
      </span>
      {err && <div className="ad-err">{err}</div>}
    </div>
  );
}
