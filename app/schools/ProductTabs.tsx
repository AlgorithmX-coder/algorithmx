"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { PHASES, type Phase } from "./phases";
import { CURRICULUM } from "./curriculum";

/**
 * "See the product, not a brochure." Numbered steps on the left, a browser
 * frame on the right showing the real screen for the chosen phase. Four of
 * the six steps are captured from the live product; the teacher view and
 * the curriculum map are previews of the pilot build and say so.
 */

type Shot = { src: string; caption: string };

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
    desc: "Every idea is taught by doing, with a narrator and captions on screen. Nobody needs to read to keep up.",
    kind: "shot",
    shot: {
      primary: {
        src: "/schools/heroes-learn.jpg",
        caption: "Password Hospital, Week 1. Diagnose a sick password, fix it, and watch the strength meter climb.",
      },
      secondary: {
        src: "/schools/explorers-meter.jpg",
        caption: "Case 3, The Guessing Game. Drag the password length and watch the rig's clock jump from an instant to centuries.",
      },
    },
  },
  {
    id: "play",
    n: "02",
    title: "Practise",
    desc: "A hands-on game for every idea. A wrong answer gets a spoken reason and another go.",
    kind: "shot",
    shot: {
      primary: {
        src: "/schools/heroes-play.jpg",
        caption: "Passphrase Forge, Week 1. Three random words make a password the Raccoon's machine can't crack.",
      },
      secondary: {
        src: "/schools/explorers-phone.jpg",
        caption: "The Phone, Block 2. WREN briefs the pupil by text, then a scammer wearing a friend's account arrives.",
      },
    },
  },
  {
    id: "prove",
    n: "03",
    title: "Prove it",
    desc: "Every lesson ends in a boss battle or a must-pass test. There is no skipping to the end.",
    kind: "shot",
    shot: {
      primary: {
        src: "/schools/heroes-boss.jpg",
        caption: "The Week 1 boss: the Hacker Raccoon's Quiz Showdown.",
      },
      secondary: {
        src: "/schools/explorers-boss.jpg",
        caption: "Case 2's boss, The Prize Factory. Three phases, no timer. Think, then act.",
      },
    },
  },
  {
    id: "progress",
    n: "04",
    title: "Their own progress",
    desc: "Stickers, badges and personal bests. A pupil is measured against last week, never against the pupil next to them.",
    kind: "shot",
    shot: {
      primary: {
        src: "/schools/heroes-reward.jpg",
        caption: "The Week 1 badge, Password Protector, on its way to the pupil's Cyber HQ.",
      },
      secondary: {
        src: "/schools/explorers-map.jpg",
        caption: "The mission map. Closed cases get a stamp. Nothing ranks pupils against each other.",
      },
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
  const listRef = useRef<HTMLDivElement>(null);
  const tab = TABS[active];
  const info = PHASES[phase];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    const btn = listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next];
    btn?.focus();
  };

  return (
    <div className="sch-tabs">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Product screens"
        aria-orientation="vertical"
        className="sch-tablist"
        onKeyDown={onKeyDown}
      >
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
              style={{ ["--sch-accent" as string]: info.accent }}
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

      <div
        role="tabpanel"
        id="sch-tabpanel"
        aria-labelledby={`sch-tab-${tab.id}`}
        className="sch-frame"
      >
        <div className="sch-frame-bar">
          <span className="sch-frame-dots" aria-hidden>
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
          </span>
          <span className="sch-frame-url">
            <span aria-hidden style={{ color: "#5fffa3" }}>●</span> {tab.kind === "shot" ? info.frameUrl : "algorithmx.io/schools/teacher"}
          </span>
          {tab.kind !== "shot" && (
            <span className="sch-frame-chip">Pilot preview</span>
          )}
        </div>

        <div className="sch-frame-body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${tab.id}-${phase}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ position: "absolute", inset: 0 }}
            >
              {tab.kind === "shot" && tab.shot && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tab.shot[phase].src}
                  alt={tab.shot[phase].caption}
                  loading={active === 0 ? "eager" : "lazy"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                />
              )}
              {tab.kind === "teacher" && <TeacherMock phase={phase} />}
              {tab.kind === "curriculum" && <CurriculumMock phase={phase} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="sch-frame-caption">
          {tab.kind === "shot" && tab.shot
            ? tab.shot[phase].caption
            : tab.kind === "teacher"
              ? "What a class teacher sees during the block. Built with the pilot school."
              : "One row per lesson, so the computing lead can evidence coverage in minutes."}
        </p>
      </div>
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
