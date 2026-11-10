"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CreditablePlace {
  id: string;
  /** Pre-formatted on the server, so the two never disagree about a date. */
  spentOn: string;
}

/**
 * Places a school spent on pupils who have since gone, and the one button
 * that puts one back.
 *
 * WHY STAFF AND NOT THE SCHOOL. A place follows the child (owner,
 * 2026-11-09). That is what stops a school teaching a hundred children on
 * fifty places by removing them one at a time, so the school cannot free
 * its own places: it asks, and somebody here looks.
 *
 * WHY THERE IS NO NAME ON THESE ROWS. When a pupil is removed the place
 * keeps the school but loses the child, by design, so there is genuinely
 * nothing left to identify them with. The date is all there is, and
 * pretending otherwise would mean holding a child's name for no reason.
 *
 * It only appears when there is something to credit. A school that has
 * never removed a pupil should not be shown a control for a problem it
 * does not have.
 */
export default function CreditPlaces({
  orgId,
  places,
  learners,
}: {
  orgId: string;
  places: CreditablePlace[];
  /** "pupil" for a school, empty for an organisation. Matches the page. */
  learners?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (places.length === 0) return null;

  const who = learners ? `${learners}s` : "learners";
  const left = places.filter((p) => !gone.has(p.id));

  async function credit(id: string) {
    setBusy(id);
    setErr(null);
    setDone(null);
    try {
      const res = await fetch("/api/admin/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, redemptionId: id }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        credited?: boolean;
        spent?: number;
      };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setGone((g) => new Set(g).add(id));
      setDone(
        j.credited
          ? `Back in the pool. ${j.spent} place${j.spent === 1 ? "" : "s"} spent now.`
          : "That one was already back.",
      );
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="ad-card ad-form" style={{ padding: "16px 20px" }}>
      <h2 className="ad-h2" style={{ margin: 0 }}>Places held for {who} who have left</h2>
      <p className="ad-note" style={{ margin: "4px 0 12px" }}>
        {left.length === 0
          ? "All back in the pool."
          : `${left.length} place${left.length === 1 ? " is" : "s are"} still counted against this licence. A place follows the ${learners || "learner"} it was spent on, so only we can put one back. Do it when a ${learners || "learner"} was added twice or added by mistake, not simply because they have left.`}
      </p>

      {left.length > 0 && (
        <table className="ad-table">
          <thead>
            <tr>
              <th>Spent on</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {left.map((p) => (
              <tr key={p.id}>
                <td>{p.spentOn}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="ad-btn"
                    onClick={() => credit(p.id)}
                    disabled={busy !== null}
                  >
                    {busy === p.id ? "Crediting…" : "Credit back"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {err && <div className="ad-err">{err}</div>}
      {done && <div className="ad-made">{done}</div>}
    </div>
  );
}
