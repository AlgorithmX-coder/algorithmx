"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "./engine/tokens";
import { JOB_TITLES } from "./engine/jobTitles";
import { TRACK_LABEL, type Track } from "./engine/types";

/* The invite landing after sign-in: a composer-style field (the same shape
 * as the AI tools' own), suggestion chips, the desk it resolves to, and
 * one gradient action. */
export default function JoinForm({ token, orgName, presetTrack }: { token: string; orgName: string; presetTrack: Track | null }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<Track | null>(presetTrack);
  const [title, setTitle] = useState<string>(presetTrack ? TRACK_LABEL[presetTrack] : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return JOB_TITLES.slice(0, 10);
    return JOB_TITLES.filter((j) => j.title.toLowerCase().includes(s) || TRACK_LABEL[j.track].toLowerCase().includes(s)).slice(0, 10);
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
    <div className="jf">
      <div className="jf-composer">
        <span className="jf-spark" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" /></svg>
        </span>
        <input id="ax-job" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type your job title, e.g. payroll, solicitor, office manager" autoComplete="off" aria-label="Your job title" />
        {title && <span className="jf-picked">{title}</span>}
      </div>
      <div className="jf-chips">
        {hits.map((j) => {
          const on = title === j.title;
          return (
            <button key={j.title} type="button" className={`jf-chip ${on ? "on" : ""}`} onClick={() => { setTitle(j.title); setTrack(j.track); }}>
              {j.title}
            </button>
          );
        })}
      </div>
      <div className="jf-desk">
        {track ? (
          <>
            <span className="jf-desk-dot" aria-hidden />
            <span>Your desk: <b>{TRACK_LABEL[track]}</b>. The practice uses documents this role handles. You can change it once from the course page.</span>
          </>
        ) : (
          <span>Pick the closest title. It decides which desk the practice uses.</span>
        )}
      </div>
      {error && <div className="jf-error">{error}</div>}
      <button type="button" className="cf-btn cf-btn-pri jf-cta" onClick={claim} disabled={!track || busy}>
        {busy ? "Claiming your seat…" : `Claim my seat at ${orgName}`}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
      <style jsx>{`
        .jf { display: flex; flex-direction: column; gap: 14px; }
        .jf-composer { display: flex; align-items: center; gap: 10px; background: ${K.glassStrong}; backdrop-filter: blur(16px); border: 1px solid ${K.glassEdge}; border-radius: 16px; padding: 8px 10px 8px 14px; box-shadow: 0 8px 30px rgba(20,22,29,0.08); transition: box-shadow 160ms ease, border-color 160ms ease; }
        .jf-composer:focus-within { border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12), 0 8px 30px rgba(20,22,29,0.08); }
        .jf-spark { display: inline-flex; color: ${K.accentInk}; }
        .jf-composer input { flex: 1; min-width: 0; font: inherit; font-size: 15.5px; color: ${K.ink}; background: transparent; border: none; outline: none; padding: 8px 0; }
        .jf-composer input::placeholder { color: ${K.faint}; }
        .jf-picked { flex-shrink: 0; font-size: 12.5px; font-weight: 600; color: ${K.onAccent}; background: ${K.grad}; border-radius: 999px; padding: 6px 11px; white-space: nowrap; }
        .jf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .jf-chip { font: inherit; font-size: 13.5px; color: ${K.ink}; background: ${K.glass}; backdrop-filter: blur(10px); border: 1px solid ${K.glassEdge}; border-radius: 999px; padding: 7px 13px; cursor: pointer; transition: transform 120ms ease, border-color 120ms ease; }
        .jf-chip:hover { border-color: ${K.accent}; transform: translateY(-1px); }
        .jf-chip.on { background: ${K.ink}; color: #fff; border-color: ${K.ink}; }
        .jf-desk { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: ${K.muted}; min-height: 22px; }
        .jf-desk b { color: ${K.ink}; }
        .jf-desk-dot { flex-shrink: 0; margin-top: 6px; width: 8px; height: 8px; border-radius: 50%; background: ${K.grad}; box-shadow: 0 0 0 4px rgba(87,68,201,0.14); }
        .jf-error { color: ${K.crit}; font-size: 14px; }
        .jf-cta { align-self: flex-start; margin-top: 4px; }
        .jf-cta:disabled { opacity: 0.5; cursor: default; transform: none; }
      `}</style>
    </div>
  );
}
