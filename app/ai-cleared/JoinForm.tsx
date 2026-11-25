"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JOB_TITLES, OTHER_ROLES, TRACK_KEYWORDS, TRACK_ORDER } from "./engine/jobTitles";
import { TRACK_LABEL, type Track } from "./engine/types";
import { COURSES, type CourseSlug } from "./engine/courses";

/* The invite landing after sign-in: a composer-style field (the same shape
 * as the AI tools' own), every desk with its common titles, the desk the
 * pick resolves to, and one gradient action. Typing narrows the titles
 * across every desk; "IT" on its own finds the IT desk through keywords.
 * Both courses use it; the seat's course decides where the claim lands.
 * The look comes from the Campus Console (campus-console.css, the .jf
 * rules), which the invite page wraps it in. */
const PER_DESK = 4;

export default function JoinForm({ token, orgName, presetTrack, course = "ai-cleared" }: { token: string; orgName: string; presetTrack: Track | null; course?: CourseSlug }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [track, setTrack] = useState<Track | null>(presetTrack);
  const [title, setTitle] = useState<string>(presetTrack ? TRACK_LABEL[presetTrack] : "");
  const [open, setOpen] = useState<Set<Track>>(new Set());
  const [tab, setTab] = useState<"desks" | "other">("desks");
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
  const others = useMemo(() => OTHER_ROLES.map((t) => JOB_TITLES.find((j) => j.title === t)).filter((j): j is { title: string; track: Track } => !!j), []);

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
      router.push(j.redirect ?? COURSES[course].base);
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
        <>
        <div className="jf-tabs" role="tablist" aria-label="Find your title">
          <button type="button" role="tab" aria-selected={tab === "desks"} className={`jf-tab ${tab === "desks" ? "on" : ""}`} onClick={() => setTab("desks")}>By desk</button>
          <button type="button" role="tab" aria-selected={tab === "other"} className={`jf-tab ${tab === "other" ? "on" : ""}`} onClick={() => setTab("other")}>Other roles</button>
          <span className="jf-tabs-hint">{tab === "desks" ? "Nine desks, the common titles on each." : "Titles that could sit on more than one desk, and where each one lands."}</span>
        </div>
        {tab === "other" ? (
          <div className="jf-other">
            <div className="jf-chips">
              {others.map((j) => (
                <button key={j.title} type="button" className={`jf-chip tagged ${title === j.title ? "on" : ""}`} onClick={() => pick(j)}>
                  {j.title}<small>{TRACK_LABEL[j.track]}</small>
                </button>
              ))}
            </div>
            <div className="jf-direct">
              <span className="jf-desk-name">Still not there? Choose the desk closest to your work</span>
              <div className="jf-chips">
                {TRACK_ORDER.map((t) => (
                  <button key={t} type="button" className={`jf-chip ${track === t && title === TRACK_LABEL[t] ? "on" : ""}`} onClick={() => pick({ title: TRACK_LABEL[t], track: t })}>
                    {TRACK_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
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
        </>
      )}

      <div className="jf-desk">
        {track ? (
          <>
            <span className="jf-desk-dot" aria-hidden />
            <span>Your desk: <b>{TRACK_LABEL[track]}</b>. The practice in every course uses documents this role handles. You can change it once from a course page.</span>
          </>
        ) : (
          <span>Pick the closest title. It decides which desk the practice uses.</span>
        )}
      </div>
      {error && <div className="jf-error" role="alert">{error}</div>}
      <button type="button" className="r6-btn pri jf-cta" onClick={claim} disabled={!track || busy} aria-busy={busy}>
        <span className="lbl">{busy ? "Claiming your seat…" : `Claim my seat at ${orgName}`}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}
