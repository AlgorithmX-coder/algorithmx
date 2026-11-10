"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  phase: string;
  size: string;
  message: string;
  emailed: boolean;
  /** Pre-formatted on the server so both ends agree about the day. */
  came: string;
}

/**
 * The schools waiting for an answer.
 *
 * Before this, an enquiry was an email and nothing else: no list, no state,
 * no way to tell whether anyone had replied, and nothing at all if the email
 * failed to send. This is the working list, newest first, and ticking one
 * off is the only state it has.
 *
 * An enquiry whose email never went out is marked. That is the case this
 * screen exists for: the lead is safe here, but nobody was told, so nobody
 * is looking for it in their inbox.
 */
export default function EnquiriesPanel({ enquiries }: { enquiries: EnquiryItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);

  const left = enquiries.filter((e) => !gone.has(e.id));

  async function tick(id: string) {
    setBusy(id);
    setErr(null);
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, handled: true }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setGone((g) => new Set(g).add(id));
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    /* ad-card, NOT ad-form: a form is capped at 640px, and the first
       render of this squeezed a head teacher's message into a column one
       word wide. This one is as wide as the page. */
    <div className="ad-card" style={{ padding: "16px 20px" }}>
      <h2 className="ad-h2" style={{ margin: 0 }}>
        Enquiries waiting{left.length > 0 ? ` (${left.length})` : ""}
      </h2>
      <p className="ad-note" style={{ margin: "4px 0 12px" }}>
        {left.length === 0
          ? "Nothing waiting. Every enquiry from the schools page has been answered."
          : "From the form on the schools page. Reply from your own inbox, then tick it off here."}
      </p>

      {left.length > 0 && (
        <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>School</th>
              <th style={{ width: "22%" }}>Who</th>
              {/* The widest column on purpose: what they actually wrote is
                  the only part of this that cannot be summarised. */}
              <th style={{ width: "42%" }}>About</th>
              <th>Came</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {left.map((e) => (
              <tr key={e.id}>
                <td>
                  <b>{e.school}</b>
                  <small>
                    {e.phase}
                    {e.size === "Not given" ? "" : ` · ${e.size}`}
                  </small>
                </td>
                <td>
                  {e.name}
                  <small>
                    <a href={`mailto:${e.email}`}>{e.email}</a>
                  </small>
                  <small>{e.role}</small>
                </td>
                <td style={{ whiteSpace: "pre-wrap", minWidth: 260 }}>
                  {e.message || <span className="dim">No message</span>}
                  {/* The one thing staff cannot find out any other way. */}
                  {!e.emailed && (
                    <small style={{ fontWeight: 700, color: "var(--warn)" }}>
                      No email went out for this one, so nobody is looking for it in their inbox.
                    </small>
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{e.came}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="ad-btn"
                    onClick={() => tick(e.id)}
                    disabled={busy !== null}
                  >
                    {busy === e.id ? "Saving…" : "Done"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {err && <div className="ad-err">{err}</div>}
    </div>
  );
}
