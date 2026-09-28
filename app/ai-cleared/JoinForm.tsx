"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "./engine/tokens";
import { JOB_TITLES } from "./engine/jobTitles";
import { TRACK_LABEL, type Track } from "./engine/types";

/* The invite landing after sign-in: pick a job title (which picks the
 * track), claim the seat, straight into the console. */
export default function JoinForm({ token, orgName, presetTrack }: { token: string; orgName: string; presetTrack: Track | null }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<Track | null>(presetTrack);
  const [title, setTitle] = useState<string>(presetTrack ? TRACK_LABEL[presetTrack] : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return JOB_TITLES.slice(0, 8);
    return JOB_TITLES.filter((j) => j.title.toLowerCase().includes(s) || TRACK_LABEL[j.track].toLowerCase().includes(s)).slice(0, 8);
  }, [q]);

  async function claim() {
    if (!track || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/ai-cleared/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, track }) });
      const j = (await r.json()) as { error?: string; redirect?: string };
      if (!r.ok) throw new Error(j.error ?? "Something went wrong.");
      router.push(j.redirect ?? "/ai-cleared");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label htmlFor="ax-job" style={{ fontFamily: K.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: K.faint }}>Your job title</label>
      <input
        id="ax-job"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Start typing, e.g. payroll, solicitor, office manager"
        autoComplete="off"
        style={{ font: "inherit", fontSize: 15, color: K.ink, background: K.sunk, border: `1px solid ${K.edge}`, borderRadius: 9, padding: "11px 13px", outline: "none" }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {hits.map((j) => {
          const on = title === j.title;
          return (
            <button
              key={j.title}
              type="button"
              onClick={() => { setTitle(j.title); setTrack(j.track); }}
              style={{ font: "inherit", fontSize: 13.5, color: on ? K.onAccent : K.ink, background: on ? K.accent : "transparent", border: `1px solid ${on ? K.accent : K.edge}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}
            >
              {j.title}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 13.5, color: K.muted, minHeight: 20 }}>
        {track ? (
          <>Your desk: <b style={{ color: K.ink }}>{TRACK_LABEL[track]}</b>. You can change this once from the course page.</>
        ) : (
          "Pick the closest title. It decides which desk the practice uses."
        )}
      </div>
      {error && <div style={{ color: K.crit, fontSize: 14 }}>{error}</div>}
      <button
        type="button"
        onClick={claim}
        disabled={!track || busy}
        style={{ alignSelf: "flex-start", font: "inherit", fontSize: 14.5, fontWeight: 600, color: K.onAccent, background: K.accent, border: "none", borderRadius: 9, padding: "11px 18px", cursor: track && !busy ? "pointer" : "default", opacity: track && !busy ? 1 : 0.5 }}
      >
        {busy ? "Claiming your seat…" : `Claim my seat at ${orgName}`}
      </button>
    </div>
  );
}
