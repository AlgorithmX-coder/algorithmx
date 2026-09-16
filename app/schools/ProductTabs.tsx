"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { PHASES, type Phase } from "./phases";
import { CURRICULUM } from "./curriculum";

/**
 * "See the product, not a brochure." Numbered steps on the left, a browser
 * frame on the right showing the real screen for the chosen phase. Four of
 * the six steps are captured from the live product at 2x; the teacher view
 * and the curriculum map are previews of the pilot build and say so.
 * Previous / next controls step through the six, and any real screen can be
 * opened full size.
 */

/** Product frames live at /schools/<img>.webp (1000w) + /schools/<img>@2x.webp (2000w). */
export const shotSrc = (img: string) => `/schools/${img}.webp`;
export const shotSet = (img: string) => `/schools/${img}.webp 1000w, /schools/${img}@2x.webp 2000w`;
export const shotFull = (img: string) => `/schools/${img}@2x.webp`;

type Shot = { img: string; caption: string };

type Tab = {
  id: string;
  n: string;
  title: string;
  desc: string;
  kind: "shot" | "teacher" | "curriculum";
  shot?: Record<Phase, Shot>;
};

const TABS: Tab[] = [
  {
    id: "learn",
    n: "01",
    title: "Learn",
    desc: "Every idea is taught by doing, with a narrator and captions on screen, so every pupil can follow along.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-learn", caption: "Password Hospital, Week 1. Diagnose a sick password, fix it, and watch the strength meter climb." },
      secondary: { img: "explorers-meter", caption: "Case 3, The Guessing Game. Drag the password length and watch the rig's clock jump from an instant to centuries." },
    },
  },
  {
    id: "play",
    n: "02",
    title: "Practise",
    desc: "A hands-on game for every idea. A wrong answer gets a spoken reason and another go.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-play", caption: "Passphrase Forge, Week 1. Three random words make a password the Raccoon's machine can't crack." },
      secondary: { img: "explorers-phone", caption: "The Phone, Block 2. WREN briefs the pupil by text, then a scammer wearing a friend's account arrives." },
    },
  },
  {
    id: "prove",
    n: "03",
    title: "Prove it",
    desc: "Every lesson ends in a boss battle or a must-pass test, so pupils prove what they have learned before they move on.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-boss", caption: "The Week 1 boss: the Hacker Raccoon's Quiz Showdown." },
      secondary: { img: "explorers-boss", caption: "Case 2's boss, The Prize Factory. Three phases that reward thinking before acting." },
    },
  },
  {
    id: "progress",
    n: "04",
    title: "Their own progress",
    desc: "Stickers, badges and personal bests that keep every pupil motivated from one week to the next.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-reward", caption: "The Week 1 badge, Password Protector, on its way to the pupil's Cyber HQ." },
      secondary: { img: "explorers-map", caption: "The mission map. Every closed case earns a stamp, so pupils see their progress build across the course." },
    },
  },
  {
    id: "teacher",
    n: "05",
    title: "The teacher view",
    desc: "Who has finished, who is stuck, and which question the class got wrong. Three answers on one screen.",
    kind: "teacher",
  },
  {
    id: "curriculum",
    n: "06",
    title: "The curriculum map",
    desc: "Every lesson mapped to Education for a Connected World and the computing programme of study.",
    kind: "curriculum",
  },
];

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

  const caption = shot
    ? shot.caption
    : tab.kind === "teacher"
      ? "Who has finished, who needs a nudge and what the class found hard, on one screen for the class teacher."
      : "One row per lesson, so the computing lead can evidence coverage in minutes.";

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

const PUPILS_PRIMARY = [
  ["Amara", 100], ["Ben", 100], ["Chloe", 100], ["Dev", 72], ["Ella", 100],
  ["Farah", 40], ["George", 100], ["Hana", 88], ["Isaac", 100], ["Jo", 12],
] as const;

const PUPILS_SECONDARY = [
  ["Aisha", 100], ["Callum", 100], ["Daniel", 64], ["Esme", 100], ["Femi", 100],
  ["Grace", 28], ["Harry", 100], ["Imogen", 91], ["Jack", 100], ["Kai", 0],
] as const;

function TeacherMock({ phase }: { phase: Phase }) {
  const primary = phase === "primary";
  const pupils = primary ? PUPILS_PRIMARY : PUPILS_SECONDARY;
  const cls = primary ? "4 Oak" : "8B";
  const course = primary ? "Cyber Heroes" : "Cyber Explorers";
  const unit = primary ? "Week 3: Spot the Scam" : "Case 2: Too Good To Be True";
  const missed = primary
    ? { q: "Which message is the scam?", n: 6, why: "Most picked the one with the school logo. The tell was the link." }
    : { q: "Which address is the real shop?", n: 5, why: "Most trusted the display name. The tell was the domain." };
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
          <strong>{primary ? "St Mary's Primary" : "Riverside Academy"}</strong>
        </div>
      </div>
      <div className="sch-mock-main">
        <div className="sch-mock-title">
          <div>
            <span className="sch-mock-eyebrow">{course} · {unit}</span>
            <h4>Class {cls}</h4>
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
                <span className="sch-mock-bar"><i style={{ width: `${pct}%`, background: pct === 100 ? "#5fffa3" : accent }} /></span>
                <span className="sch-mock-pct">{pct === 100 ? "Done" : pct === 0 ? "Not started" : `${pct}%`}</span>
              </li>
            ))}
          </ul>
          <div className="sch-mock-missed">
            <span className="sch-mock-eyebrow">Most missed question</span>
            <p className="sch-mock-q">&ldquo;{missed.q}&rdquo;</p>
            <p className="sch-mock-n"><b>{missed.n}</b> of {pupils.length} got it wrong</p>
            <p className="sch-mock-why">{missed.why}</p>
            <span className="sch-mock-btn" style={{ borderColor: "rgba(232,237,255,0.3)", color: "#e8edff" }}>Replay this on the board</span>
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
  return (
    <div className="sch-mock sch-mock-cur">
      <div className="sch-mock-main" style={{ padding: "18px 20px" }}>
        <div className="sch-mock-title">
          <div>
            <span className="sch-mock-eyebrow">{PHASES[phase].courses[0].name} · {phase === "primary" ? "Lessons 1 to 6" : "Cases 1 to 6"}</span>
            <h4>Curriculum map</h4>
          </div>
          <span className="sch-mock-btn" style={{ borderColor: accent, color: accent }}>Download PDF</span>
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
                <td><i style={{ background: accent }} />{r.strand}</td>
                <td>{r.computing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
