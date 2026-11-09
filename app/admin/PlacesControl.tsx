"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Change what a school has bought, from the school's own page.
 *
 * This did not exist. `seatsPurchased` was written once, by whoever created
 * the school, and there was no control anywhere to change it afterwards, so
 * the two most ordinary second conversations in the business - a trial
 * becoming a licence, and a school buying another block in January - both
 * ended in somebody editing the database by hand.
 *
 * Deliberately shows the spent figure beside the box. The number staff are
 * about to type only means anything against the number already gone, and
 * the server refuses to go below it: showing the floor is kinder than
 * explaining the refusal afterwards.
 */
export default function PlacesControl({
  orgId,
  places,
  spent,
  learners,
}: {
  orgId: string;
  places: number;
  spent: number;
  /** "pupil" for a school, empty for an organisation. Matches the page. */
  learners?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(places));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const word = learners ? `${learners} places` : "places";
  const n = Number(value);
  const valid = Number.isInteger(n) && n >= 0 && n <= 100000;
  const unchanged = n === places;

  async function save() {
    setBusy(true);
    setErr(null);
    setDone(null);
    try {
      const res = await fetch("/api/admin/schools", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, seatsPurchased: n }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; previous?: number; places?: number };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      if (j.previous !== j.places) {
        setDone(`Changed from ${j.previous} to ${j.places}.`);
      } else {
        setDone("Saved. Nothing changed.");
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ad-card ad-form" style={{ padding: "16px 20px" }}>
      <h2 className="ad-h2" style={{ margin: 0 }}>Licensed {word}</h2>
      <p className="ad-note" style={{ margin: "4px 0 12px" }}>
        {spent === 0
          ? `Nothing spent yet, so this can be set to anything.`
          : `${spent} already spent, so it cannot go below ${spent}.`}
      </p>
      <div className="ad-row">
        <label>
          {word.charAt(0).toUpperCase() + word.slice(1)}
          <input
            type="number"
            min={spent}
            max={100000}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setErr(null);
              setDone(null);
            }}
          />
        </label>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            type="button"
            className="ad-btn ad-btn-pri"
            onClick={save}
            disabled={busy || !valid || unchanged}
          >
            {busy ? "Saving…" : unchanged ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      {err && <div className="ad-err">{err}</div>}
      {done && <div className="ad-made">{done}</div>}
    </div>
  );
}
