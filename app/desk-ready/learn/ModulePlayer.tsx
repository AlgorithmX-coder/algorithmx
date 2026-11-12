"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import DeskHeader from "../DeskHeader";
import PartPreview, { PREVIEW_CSS, type PreviewKind } from "../PartPreview";
import { OFFICE_APPS } from "../office/apps/registry";
import { jobsFor } from "../office/jobs";
import { PARTS } from "../syllabus";
import { D, PART_ACCENT } from "../tokens";
import { markDone, useDone } from "./progress";
import TopicPlayer from "./TopicPlayer";
import type { ModuleManifest } from "./types";
import { Button, Kicker, SHELL_CSS, Tick } from "./ui";

/* The apps a module's jobs use, in words: "Outlook, File Explorer, Excel and Word". */
function officeApps(jobs: ReturnType<typeof jobsFor>): string {
  const extra = [...new Set(jobs.flatMap((j) => j.apps ?? []))].map((id) => OFFICE_APPS[id]?.label).filter((l): l is string => typeof l === "string");
  const all = ["Outlook", "File Explorer", "Excel", ...extra];
  return `${all.slice(0, -1).join(", ")} and ${all[all.length - 1]}`;
}

/* A Desk Ready module: a hero band in its part's colour (the app it teaches,
 * drawn large, what you will be able to do, your progress), then the
 * lessons as a glowing timeline; and the lesson player when one is open.
 * Which lesson is open is client state; the page returns to the top
 * whenever it changes. */

const PART_PREVIEW: ReadonlyArray<PreviewKind> = ["desktop", "outlook", "excel", "sharepoint", "copilot", "word"];

export default function ModulePlayer({ module: m }: { module: ModuleManifest }) {
  const done = useDone();
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [open]);

  const partIndex = Math.max(0, PARTS.findIndex((p) => p.modules.some((x) => x.id === m.id)));
  const part = PARTS[partIndex];
  const acc = PART_ACCENT[partIndex];
  const finished = m.topics.filter((t) => done.includes(t.id)).length;
  const firstOpen = m.topics.findIndex((t) => !done.includes(t.id));
  const resumeAt = firstOpen === -1 ? 0 : firstOpen;
  const allDone = finished === m.topics.length;
  const jobs = jobsFor(m.id);
  const shellStyle = { "--acc": acc, "--dr-accent": acc } as CSSProperties;

  const styles = (
    <style>{`
      ${SHELL_CSS}
      ${PREVIEW_CSS}
      ${MODULE_CSS}
    `}</style>
  );

  if (open !== null) {
    const t = m.topics[open];
    const hasNext = open + 1 < m.topics.length;
    return (
      <div className="dr-shell" style={shellStyle}>
        <DeskHeader link={{ href: "/desk-ready/course", label: "Your desk" }} trail={`Module ${m.number} · Lesson ${open + 1} of ${m.topics.length}`} />
        <main style={{ maxWidth: 920, margin: "0 auto", padding: "22px 16px 90px" }}>
          <TopicPlayer
            key={t.id}
            topic={t}
            index={open}
            total={m.topics.length}
            moduleLabel={`Module ${m.number}: ${m.title}`}
            onBack={() => setOpen(null)}
            onFinish={() => markDone(t.id)}
            next={hasNext ? { label: `Next lesson: ${m.topics[open + 1].title}`, go: () => setOpen(open + 1) } : { label: "Back to the module", go: () => setOpen(null) }}
          />
        </main>
        {styles}
      </div>
    );
  }

  return (
    <div className="dr-shell" style={shellStyle}>
      <DeskHeader link={{ href: "/desk-ready/course", label: "Your desk" }} trail={`${part.label} · ${part.title}`} />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 16px 90px" }}>
        <Link href="/desk-ready/course" className="mp-back">
          &larr; Your desk
        </Link>

        {/* hero band */}
        <section className="mp-hero dr-glass">
          <span className="mp-ghost" aria-hidden>
            {String(m.number).padStart(2, "0")}
          </span>
          <div className="mp-hero-copy">
            <Kicker color={acc}>
              {part.label} · Module {m.number}
            </Kicker>
            <h1 className="mp-h1">{m.title}</h1>
            <p className="mp-intro">{m.intro}</p>
            <div className="mp-cta">
              <Button onClick={() => setOpen(resumeAt)}>{finished === 0 ? "Start the first lesson" : allDone ? "Go through it again" : `Carry on: lesson ${resumeAt + 1}`}</Button>
              <span className="mp-count">
                {finished} of {m.topics.length} lessons finished
              </span>
            </div>
            <div className="mp-bar" aria-hidden>
              <span style={{ width: `${(finished / m.topics.length) * 100}%` }} />
            </div>
          </div>
          <div className="mp-hero-art" aria-hidden>
            <PartPreview kind={PART_PREVIEW[partIndex]} />
          </div>
        </section>

        {/* outcomes */}
        <section className="mp-outcomes">
          <Kicker color={D.faint}>By the end you will be able to</Kicker>
          <ul>
            {m.outcomes.map((o) => (
              <li key={o}>
                <Tick color={acc} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* the lessons, as a timeline */}
        <section aria-labelledby="mp-lessons-h" style={{ marginTop: 44 }}>
          <Kicker color={D.faint}>The lessons</Kicker>
          <h2 id="mp-lessons-h" className="mp-h2">
            {m.topics.length} short lessons
          </h2>
          <ol className="mp-timeline">
            {m.topics.map((t, i) => {
              const isDone = done.includes(t.id);
              const isNext = !allDone && i === resumeAt;
              return (
                <li key={t.id} className={isDone ? "done" : isNext ? "next" : ""}>
                  <span className="mp-node" aria-hidden>
                    {isDone ? <Tick size={16} color={D.good} /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <button type="button" onClick={() => setOpen(i)} className="mp-row">
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="mp-row-title">{t.title}</span>
                      <span className="mp-row-meta">{isDone ? "Finished" : isNext ? `Up next · about ${t.minutes} minutes` : `About ${t.minutes} minutes`}</span>
                    </span>
                    <span aria-hidden className="mp-row-go">
                      &rarr;
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {/* on the job: a real piece of work in the pretend office */}
        {jobs.length > 0 && (
          <section aria-labelledby="mp-jobs-h" style={{ marginTop: 44 }}>
            <Kicker color={D.faint}>On the job</Kicker>
            <h2 id="mp-jobs-h" className="mp-h2">
              Now do it for real
            </h2>
            <p className="mp-jobs-lede">A job from someone at Northfield Supplies, done in the pretend office with {officeApps(jobs)}. You are marked on what you made and where you put it.</p>
            {jobs.map((j) => {
              const jobDone = done.includes(j.id);
              return (
                <Link key={j.id} href={`/desk-ready/office/${j.slug}`} className={jobDone ? "mp-job done" : "mp-job"}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="mp-row-meta">{jobDone ? "Finished" : `From the office · ${j.deadline}`}</span>
                    <span className="mp-job-title">{j.title}</span>
                    <span className="mp-job-sum">{j.summary}</span>
                    {/* ── Module 13 ── */}
                    {j.best && <JobBest get={j.best} />}
                  </span>
                  <span className="mp-job-go">{jobDone ? "Do it again" : "Start the job"} &rarr;</span>
                </Link>
              );
            })}
          </section>
        )}
      </main>
      {styles}
    </div>
  );
}

const subscribeStorage = (on: () => void) => {
  window.addEventListener("storage", on);
  return () => window.removeEventListener("storage", on);
};

/* ── Module 13 ── a job's best result so far ("Your best: typing 41 words a
 * minute at 97%"), read in the browser after the page has loaded. */
function JobBest({ get }: { get: () => string | null }) {
  const line = useSyncExternalStore(subscribeStorage, get, () => null);
  return line ? <span className="mp-job-best">{line}</span> : null;
}

const MODULE_CSS = `
  .mp-back { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; font-family: ${D.mono}; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${D.faint}; text-decoration: none; }
  .mp-back:hover { color: ${D.ink}; }
  .mp-hero { position: relative; margin-top: 10px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 40px; align-items: center; padding: 34px 36px; border-radius: 24px;
    background: radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, var(--acc) 26%, transparent), transparent 60%), ${D.card};
    border: 1px solid color-mix(in srgb, var(--acc) 38%, transparent); box-shadow: ${D.lift}; }
  .mp-ghost { position: absolute; right: 26px; bottom: -46px; z-index: -1; font-family: ${D.display}; font-size: 200px; font-weight: 700; line-height: 1; letter-spacing: -0.05em; color: var(--acc); opacity: 0.06; pointer-events: none; }
  .mp-h1 { margin: 12px 0 0; font-family: ${D.display}; font-size: clamp(2.2rem, 5vw, 3.4rem); line-height: 1.02; letter-spacing: -0.03em; font-weight: 500; color: ${D.ink}; }
  .mp-intro { margin: 16px 0 0; max-width: 600px; font-size: 18px; line-height: 1.6; color: ${D.muted}; }
  .mp-cta { margin-top: 24px; display: flex; flex-wrap: wrap; align-items: center; gap: 18px; }
  .mp-count { font-family: ${D.mono}; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${D.faint}; }
  .mp-bar { margin-top: 18px; max-width: 420px; height: 6px; border-radius: 99px; background: rgba(255,255,255,0.08); overflow: hidden; }
  .mp-bar span { display: block; height: 100%; border-radius: 99px; background: var(--acc); box-shadow: 0 0 12px var(--acc); transition: width .4s ease; }
  .mp-hero-art { display: flex; align-items: center; justify-content: center; }
  .mp-hero-art .dr-pv { width: 360px; transform: rotate(-3deg); }

  .mp-outcomes { margin-top: 22px; padding: 22px 26px; border-radius: 20px; background: ${D.glass}; border: 1px solid ${D.edge}; }
  .mp-outcomes ul { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 12px 26px; }
  .mp-outcomes li { display: flex; gap: 10px; align-items: flex-start; font-size: 17px; line-height: 1.5; color: ${D.body}; }

  .mp-h2 { margin: 10px 0 0; font-family: ${D.display}; font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.1; letter-spacing: -0.025em; font-weight: 500; color: ${D.ink}; }
  .mp-timeline { position: relative; list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 12px; }
  .mp-timeline::before { content: ""; position: absolute; left: 21px; top: 22px; bottom: 22px; width: 2px; background: linear-gradient(180deg, var(--acc), rgba(255,255,255,0.08)); opacity: 0.5; }
  .mp-timeline li { position: relative; display: flex; align-items: center; gap: 16px; }
  .mp-node { position: relative; z-index: 1; flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-family: ${D.mono}; font-size: 13px; font-weight: 800; color: ${D.faint}; background: ${D.ground2}; border: 1.5px solid rgba(255,255,255,0.16); }
  .mp-timeline li.done .mp-node { background: ${D.goodSoft}; border-color: ${D.good}; box-shadow: 0 0 16px -2px ${D.good}; }
  .mp-timeline li.next .mp-node { color: ${D.ink}; background: color-mix(in srgb, var(--acc) 26%, ${D.ground2}); border-color: var(--acc); box-shadow: 0 0 18px -2px var(--acc); }
  @media (prefers-reduced-motion: no-preference) { .mp-timeline li.next .mp-node { animation: mp-pulse 2.2s ease-in-out infinite; } }
  @keyframes mp-pulse { 0%, 100% { box-shadow: 0 0 18px -2px var(--acc); } 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--acc) 18%, transparent), 0 0 26px 0 var(--acc); } }
  .mp-row { flex: 1; min-width: 0; display: flex; align-items: center; gap: 14px; text-align: left; padding: 16px 20px; border-radius: 16px; cursor: pointer;
    background: ${D.card}; border: 1px solid ${D.edge}; box-shadow: ${D.lift}; font-family: ${D.sans}; transition: transform .18s ease, border-color .18s ease; }
  .mp-row:hover { transform: translateX(3px); border-color: color-mix(in srgb, var(--acc) 60%, transparent); }
  .mp-timeline li.next .mp-row { border-color: color-mix(in srgb, var(--acc) 55%, transparent); background: radial-gradient(80% 160% at 0% 50%, color-mix(in srgb, var(--acc) 14%, transparent), transparent 60%), ${D.card}; }
  .mp-row-title { display: block; font-size: 18px; font-weight: 600; line-height: 1.35; color: ${D.ink}; }
  .mp-row-meta { display: block; margin-top: 3px; font-family: ${D.mono}; font-size: 11.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${D.faint}; }
  .mp-timeline li.done .mp-row-meta { color: ${D.good}; }
  .mp-timeline li.next .mp-row-meta { color: var(--acc); }
  .mp-row-go { font-size: 20px; color: var(--acc); }

  .mp-jobs-lede { margin: 10px 0 0; max-width: 680px; font-size: 17px; line-height: 1.6; color: ${D.muted}; }
  .mp-job { margin-top: 18px; display: flex; align-items: center; gap: 18px; padding: 22px 24px; border-radius: 20px; text-decoration: none;
    background: radial-gradient(80% 160% at 0% 50%, color-mix(in srgb, var(--acc) 18%, transparent), transparent 62%), ${D.card};
    border: 1px solid color-mix(in srgb, var(--acc) 55%, transparent); box-shadow: ${D.lift}; transition: transform .18s ease, border-color .18s ease; }
  .mp-job:hover { transform: translateY(-2px); border-color: var(--acc); }
  .mp-job.done { border-color: ${D.goodEdge}; }
  .mp-job.done .mp-row-meta { color: ${D.good}; }
  .mp-job .mp-row-meta { color: var(--acc); }
  .mp-job-title { display: block; margin-top: 6px; font-family: ${D.display}; font-size: 22px; font-weight: 500; letter-spacing: -0.015em; color: ${D.ink}; }
  .mp-job-sum { display: block; margin-top: 4px; font-size: 16px; line-height: 1.5; color: ${D.muted}; }
  .mp-job-best { display: inline-block; margin-top: 10px; padding: 4px 12px; border-radius: 999px; background: ${D.goodSoft}; border: 1px solid ${D.goodEdge}; font-size: 14.5px; font-weight: 600; color: ${D.ink}; }
  .mp-job-go { flex-shrink: 0; display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; background: ${D.action}; color: ${D.onAccent}; font-family: ${D.display}; font-weight: 600; font-size: 16px; box-shadow: ${D.actionGlow}; }
  @media (max-width: 640px) { .mp-job { flex-direction: column; align-items: flex-start; } }

  @media (max-width: 860px) {
    .mp-hero { grid-template-columns: 1fr; padding: 26px 22px; }
    .mp-hero-art { display: none; }
  }
`;
