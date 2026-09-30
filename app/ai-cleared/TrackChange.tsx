"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "./engine/tokens";
import { TRACKS, TRACK_LABEL, type Track } from "./engine/types";
import type { CourseSlug } from "./engine/courses";

/* The one-time desk change from the course page, per course. */
export default function TrackChange({ current, locked, course = "ai-cleared" }: { current: Track; locked: boolean; course?: CourseSlug }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<Track>(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (locked) return <span style={{ fontSize: 12.5, color: K.faint }}>Desk changed once. Ask your admin for another change.</span>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} style={{ font: "inherit", fontSize: 12.5, color: K.accentInk, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Change my desk</button>;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/ai-cleared/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ track: pick, course }) });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? "Could not change your desk.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change your desk.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <select value={pick} onChange={(e) => setPick(e.target.value as Track)} style={{ font: "inherit", fontSize: 13, color: K.ink, background: K.sunk, border: `1px solid ${K.edge}`, borderRadius: 7, padding: "5px 8px" }}>
        {TRACKS.map((t) => <option key={t} value={t}>{TRACK_LABEL[t]}</option>)}
      </select>
      <button type="button" onClick={save} disabled={busy || pick === current} style={{ font: "inherit", fontSize: 12.5, fontWeight: 600, color: K.onAccent, background: K.accent, border: "none", borderRadius: 7, padding: "6px 10px", cursor: "pointer", opacity: busy || pick === current ? 0.5 : 1 }}>{busy ? "Saving…" : "Change once"}</button>
      <button type="button" onClick={() => setOpen(false)} style={{ font: "inherit", fontSize: 12.5, color: K.muted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
      {error && <span style={{ fontSize: 12.5, color: K.crit }}>{error}</span>}
    </span>
  );
}
