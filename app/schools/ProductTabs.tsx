"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { PHASES, type Phase } from "./phases";
import { CURRICULUM, STRAND_COLOUR } from "./curriculum";

/**
 * "See the product, not a brochure." Numbered steps on the left, a browser
 * frame on the right showing the real screen for the chosen phase. Four of
 * the six steps are captured from the live product at 2x; the teacher view
 * and the curriculum map are previews of the pilot build and say so.
 * Previous / next controls step through the six, and any real screen can be
 * opened full size.
 */

import { TABS, TEACHER_MOCK, MOCK_CAPTION, pupilStatus, shotSrc, shotSet, shotFull } from "./productData";
export { shotSrc, shotSet, shotFull };

export default function ProductTabs({ phase }: { phase: Phase }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const tab = TABS[active];
  const info = PHASES[phase];
  const shot = tab.kind === "shot" && tab.shot ? tab.shot[phase] : null;

  const go = (i: number) => setActive((i + TABS.length) % TABS.length);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    const idx = (next + TABS.length) % TABS.length;
    setActive(idx);
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[idx]?.focus();
  };

  // Lightbox: Esc closes, page scroll locks while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const caption = shot ? shot.caption : MOCK_CAPTION[tab.kind === "teacher" ? "teacher" : "curriculum"];

  return (
    <div className="sch-tabs" style={{ ["--sch-accent" as string]: info.accent, ["--sch-accent2" as string]: info.accent2 }}>
      <div ref={listRef} role="tablist" aria-label="Product screens" aria-orientation="vertical" className="sch-tablist" onKeyDown={onKeyDown}>
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={t.id}
              role="tab"
              id={`sch-tab-${t.id}`}
              aria-selected={on}
              aria-controls="sch-tabpanel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={`sch-tab${on ? " sch-tab-on" : ""}`}
            >
              <span className="sch-tab-head">
                <span className="sch-tab-n">{t.n}</span>
                <span className="sch-tab-title">{t.title}</span>
              </span>
              <span className="sch-tab-desc">{t.desc}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="sch-tabpanel" aria-labelledby={`sch-tab-${tab.id}`} className="sch-frame">
        <div className="sch-frame-bar">
          <span className="sch-frame-dots" aria-hidden>
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
          </span>
          <span className="sch-frame-url">
            <span aria-hidden style={{ color: "#5fffa3" }}>●</span> {shot ? info.frameUrl : "algorithmx.io/schools/teacher"}
          </span>
          {!shot && <span className="sch-frame-chip">Pilot preview</span>}
        </div>

        <div className="sch-frame-body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${tab.id}-${phase}`}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {shot && (
                <button type="button" className="sch-frame-zoom" onClick={() => setOpen(true)} aria-label={`Open full size: ${shot.caption}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shotSrc(shot.img)}
                    srcSet={shotSet(shot.img)}
                    sizes="(max-width: 900px) 100vw, 800px"
                    alt={shot.caption}
                    loading={active === 0 ? "eager" : "lazy"}
                  />
                </button>
              )}
              {tab.kind === "teacher" && <TeacherMock phase={phase} />}
              {tab.kind === "curriculum" && <CurriculumMock phase={phase} />}
            </motion.div>
          </AnimatePresence>
          {shot && (
            <button type="button" className="sch-enlarge" onClick={() => setOpen(true)} aria-hidden tabIndex={-1}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Full size
            </button>
          )}
        </div>

        <div className="sch-frame-foot">
          <p className="sch-frame-caption">{caption}</p>
          <div className="sch-frame-nav" aria-label="Step through the screens">
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous screen">‹</button>
            <span className="sch-frame-dotnav" aria-hidden>
              {TABS.map((t, i) => <i key={t.id} className={i === active ? "on" : ""} />)}
            </span>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next screen">›</button>
          </div>
        </div>
      </div>

      {/* Portalled to <body>: the section's entrance animation leaves a
          transform on an ancestor, which would trap position: fixed. */}
      {open && shot && createPortal(
        <div className="sch-lightbox" role="dialog" aria-modal="true" aria-label={shot.caption} onClick={() => setOpen(false)}>
          <div className="sch-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="sch-lightbox-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shotFull(shot.img)} alt={shot.caption} />
            <p>{shot.caption}</p>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

/* ── Teacher view preview ─────────────────────────────────────────────── */

function TeacherMock({ phase }: { phase: Phase }) {
  const primary = phase === "primary";
  const { pupils, cls, course, unit, unitN, unitOf, missed, school } = TEACHER_MOCK[phase];
  const done = pupils.filter((p) => p[1] === 100).length;
  const stuck = pupils.filter((p) => p[1] > 0 && p[1] < 100).length;
  const not = pupils.length - done - stuck;
  const accent = PHASES[phase].accent;

  return (
    <div className="sch-mock">
      <div className="sch-mock-side">
        <div className="sch-mock-brand">ALGORITHM<span style={{ color: accent }}>X</span></div>
        <ul>
          <li className="on">My classes</li>
          <li>Reports</li>
          <li>Login cards</li>
          <li>Curriculum</li>
        </ul>
        <div className="sch-mock-school">
          <span>School</span>
          <strong>{school}</strong>
        </div>
      </div>
      <div className="sch-mock-main">
        <div className="sch-mock-title">
          <div>
            <span className="sch-mock-eyebrow">{course} · {unit}</span>
            <h4>Class {cls}</h4>
            <span className="sch-mock-course">
              <span className="sch-mock-course-track" aria-hidden>
                <i style={{ width: `${(unitN / unitOf) * 100}%`, background: accent }} />
              </span>
              <span className="sch-mock-course-txt">
                {primary ? "Week" : "Case"} {unitN} of {unitOf}
              </span>
            </span>
          </div>
          <span className="sch-mock-btn" style={{ borderColor: accent, color: accent }}>Lock screens</span>
        </div>
        <div className="sch-mock-stats">
          <div><b>{done}</b><span>Finished</span></div>
          <div><b>{stuck}</b><span>In progress</span></div>
          <div><b>{not}</b><span>Not started</span></div>
        </div>
        <div className="sch-mock-cols">
          <ul className="sch-mock-pupils">
            {pupils.map(([name, pct]) => (
              <li key={name}>
                <span className="sch-mock-name">{name}</span>
                {/* Done green, in progress amber: state reads without the
                    label. The mint this used to use was invisible on paper,
                    and both clear 3:1 on the track, the bar for a UI
                    element rather than text. */}
                <span className="sch-mock-bar"><i style={{ width: `${pct}%`, background: pct === 100 ? "#0e7a45" : "#b8730a" }} /></span>
                <span className="sch-mock-pct">{pupilStatus(pct)}</span>
              </li>
            ))}
          </ul>
          <div className="sch-mock-missed">
            <span className="sch-mock-eyebrow">Most missed question</span>
            <p className="sch-mock-q">&ldquo;{missed.q}&rdquo;</p>
            <p className="sch-mock-n"><b>{missed.n}</b> of {pupils.length} got it wrong</p>
            <p className="sch-mock-why">{missed.why}</p>
            {/* was near-white ink on a near-white card */}
            <span className="sch-mock-btn" style={{ borderColor: "rgba(138,84,0,0.45)", background: "#fffdf8", color: "#8a5400" }}>Replay this on the board</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Curriculum map preview ───────────────────────────────────────────── */

function CurriculumMock({ phase }: { phase: Phase }) {
  const rows = CURRICULUM[phase];
  const accent = PHASES[phase].accent;
  /* in the order they first appear, so the chips read down the table */
  const strands = [...new Set(rows.map((r) => r.strand))];
  return (
    <div className="sch-mock sch-mock-cur">
      <div className="sch-mock-main" style={{ padding: "18px 20px" }}>
        <div className="sch-mock-title">
          <div>
            <span className="sch-mock-eyebrow">{PHASES[phase].courses[0].name} · {phase === "primary" ? "Lessons 1 to 6" : "Cases 1 to 6"}</span>
            <h4>Curriculum map</h4>
          </div>
          {/* the one thing a head of computing came to this screen for */}
          <span className="sch-mock-btn" style={{ borderColor: accent, background: accent, color: "#fffdfa", fontWeight: 700 }}>
            <span aria-hidden style={{ marginRight: 6 }}>&darr;</span>Download PDF
          </span>
        </div>
        <table className="sch-mock-table">
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Education for a Connected World</th>
              <th>Computing</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.lesson}>
                <td><b>{r.lesson}</b><span>{r.title}</span></td>
                <td><i style={{ background: STRAND_COLOUR[r.strand] ?? accent }} />{r.strand}</td>
                <td>{r.computing}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Owner: the space under the table was dead. The strands these six
            lessons cover is the question the table is being scanned for, so
            it answers it once, in the same colours as the column. */}
        <div className="sch-mock-cover">
          <span className="sch-mock-eyebrow">
            Covers {strands.length} of the 8 Education for a Connected World strands
          </span>
          <span className="sch-mock-cover-row">
            {strands.map((st) => (
              <span key={st} className="sch-mock-cover-chip">
                <i style={{ background: STRAND_COLOUR[st] ?? accent }} />
                {st}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
