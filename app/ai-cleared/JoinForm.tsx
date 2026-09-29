"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "./engine/tokens";
import { JOB_TITLES, TRACK_KEYWORDS, TRACK_ORDER } from "./engine/jobTitles";
import { TRACK_LABEL, type Track } from "./engine/types";

/* The invite landing after sign-in: a composer-style field (the same shape
 * as the AI tools' own), every desk with its common titles, the desk the
 * pick resolves to, and one gradient action. Typing narrows the titles
 * across every desk; "IT" on its own finds the IT desk through keywords. */
const PER_DESK = 4;

export default function JoinForm({ token, orgName, presetTrack }: { token: string; orgName: string; presetTrack: Track | null }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<Track | null>(presetTrack);
  const [title, setTitle] = useState<string>(presetTrack ? TRACK_LABEL[presetTrack] : "");
  const [open, setOpen] = useState<Set<Track>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s = q.trim().toLowerCase();

  /* Search: titles whose words match, plus every title on a desk whose
   * keywords match ("it", "law", "tech"). */
  const hits = useMemo(() => {
    if (!s) return null;
    const deskHit = new Set<Track>(TRACK_ORDER.filter((t) => TRACK_KEYWORDS[t].some((k) => k === s || (s.length > 2 && k.startsWith(s))) || TRACK_LABEL[t].toLowerCase().includes(s)));
    /* A word in the title starts with what was typed ("it" finds "IT
     * support", not "Credit controller"); longer queries also match inside
     * words ("ounts" still finds "Accounts"). */
    const direct = JOB_TITLES.filter((j) => {
      const t = j.title.toLowerCase();
      return t.split(/[\s-]+/).some((w) => w.startsWith(s)) || (s.length >= 4 && t.includes(s));
    });
    const exactDesk = TRACK_ORDER.filter((t) => deskHit.has(t) && TRACK_KEYWORDS[t].includes(s));
    const onDesk = direct.filter((j) => exactDesk.includes(j.track));
    const offDesk = direct.filter((j) => !exactDesk.includes(j.track));
    const viaDesk = JOB_TITLES.filter((j) => deskHit.has(j.track) && !direct.includes(j));
    return [...onDesk, ...viaDesk, ...offDesk].slice(0, 18);
  }, [s]);

  const groups = useMemo(() => TRACK_ORDER.map((t) => ({ track: t, titles: JOB_TITLES.filter((j) => j.track === t) })), []);

  function pick(j: { title: string; track: Track }) {
    setTitle(j.title);
    setTrack(j.track);
  }

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

  const chip = (j: { title: string; track: Track }) => (
    <button key={j.title} type="button" className={`jf-chip ${title === j.title ? "on" : ""}`} onClick={() => pick(j)}>
      {j.title}
    </button>
  );

  return (
    <div className="jf">
      <div className="jf-composer">
        <span className="jf-spark" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" /></svg>
        </span>
        <input id="ax-job" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type your job title, e.g. payroll, solicitor, IT support" autoComplete="off" aria-label="Your job title" />
        {title && <span className="jf-picked">{title}</span>}
      </div>

      {hits ? (
        <div className="jf-chips">
          {hits.length ? hits.map(chip) : <span className="jf-none">No title matches that. Pick the closest desk below, or choose Other.</span>}
          {!hits.length && chip({ title: "Other", track: "general" })}
        </div>
      ) : (
        <div className="jf-desks">
          {groups.map((g) => {
            const isOpen = open.has(g.track);
            const shown = isOpen ? g.titles : g.titles.slice(0, PER_DESK);
            const rest = g.titles.length - shown.length;
            return (
              <div key={g.track} className={`jf-desk-row ${track === g.track ? "here" : ""}`}>
                <span className="jf-desk-name">{TRACK_LABEL[g.track]}</span>
                <div className="jf-chips">
                  {shown.map(chip)}
                  {rest > 0 && (
                    <button type="button" className="jf-chip more" onClick={() => setOpen((o) => new Set(o).add(g.track))} aria-label={`Show ${rest} more ${TRACK_LABEL[g.track]} titles`}>
                      +{rest} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
        .jf-desks { display: flex; flex-direction: column; gap: 10px; }
        .jf-desk-row { display: grid; grid-template-columns: 148px 1fr; gap: 6px 14px; align-items: start; padding: 8px 0; border-top: 1px solid ${K.glassEdge}; }
        .jf-desk-row:first-child { border-top: none; padding-top: 0; }
        .jf-desk-name { font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${K.muted}; padding-top: 9px; line-height: 1.3; }
        .jf-desk-row.here .jf-desk-name { color: ${K.accentInk}; }
        .jf-chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .jf-chip { font: inherit; font-size: 13.5px; color: ${K.ink}; background: ${K.glass}; backdrop-filter: blur(10px); border: 1px solid ${K.glassEdge}; border-radius: 999px; padding: 7px 13px; cursor: pointer; transition: transform 120ms ease, border-color 120ms ease; }
        .jf-chip:hover { border-color: ${K.accent}; transform: translateY(-1px); }
        .jf-chip.on { background: ${K.ink}; color: #fff; border-color: ${K.ink}; }
        .jf-chip.more { color: ${K.accentInk}; background: transparent; border-style: dashed; }
        .jf-none { font-size: 14px; color: ${K.muted}; }
        .jf-desk { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: ${K.muted}; min-height: 22px; }
        .jf-desk b { color: ${K.ink}; }
        .jf-desk-dot { flex-shrink: 0; margin-top: 6px; width: 8px; height: 8px; border-radius: 50%; background: ${K.grad}; box-shadow: 0 0 0 4px rgba(87,68,201,0.14); }
        .jf-error { color: ${K.crit}; font-size: 14px; }
        .jf-cta { align-self: flex-start; margin-top: 4px; }
        .jf-cta:disabled { opacity: 0.5; cursor: default; transform: none; }
        @media (max-width: 640px) {
          .jf-desk-row { grid-template-columns: 1fr; gap: 6px; }
          .jf-desk-name { padding-top: 0; }
        }
      `}</style>
    </div>
  );
}
