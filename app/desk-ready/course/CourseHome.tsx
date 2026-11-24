"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import NightHomeShell, { ByCube, NightHomePause } from "@/app/components/course-home/NightHomeShell";
import PartPreview, { PREVIEW_CSS, type PreviewKind } from "../PartPreview";
import { doneIn, useDone } from "../learn/progress";
import type { ModuleManifest } from "../learn/types";
import { resumeAt } from "./resume";
import { FINAL, PARTS, type DeskModule } from "../syllabus";
import { PART_ACCENT } from "../tokens";

/* "Your desk": where a learner lands after signing in.
 *
 * Round 6 (landing lab homes-b desk v1, owner 2026-11-23): the Night Console
 * look, sky blue on deep navy. The first screen answers "where am I and what
 * do I do next": the welcome, the progress ring and a map of the six parts on
 * the left; "pick up where you left off" on the right, opening (the owner's
 * "whole picture first" rule) with the next lesson's own numbered drawing of
 * the real thing, then Carry on. Below: every part and module with its own
 * status, then the final task. Progress is the learner's own (desk:done,
 * synced), exactly as before. */

const PART_PREVIEW: ReadonlyArray<PreviewKind> = ["desktop", "outlook", "excel", "sharepoint", "copilot", "word"];
const PART_RGB = ["240,180,80", "127,178,255", "76,195,138", "95,208,216", "157,140,255", "255,143,224"] as const;
const partVars = (i: number) => ({ "--acc": PART_ACCENT[i], "--acc-rgb": PART_RGB[i], "--acc-text": `var(--hb6-p${i}-text)` }) as CSSProperties;

const lessonsOf = (m: DeskModule) => m.topics.length;

/* Each module's lessons, loaded only for the one the learner is about to do,
 * so the course home can open with that lesson's own drawing. */
const LESSONS: Record<string, () => Promise<{ default: ModuleManifest }>> = {
  m0: () => import("../lessons/m0"), m1: () => import("../lessons/m1"), m2: () => import("../lessons/m2"), m3: () => import("../lessons/m3"),
  m4: () => import("../lessons/m4"), m5: () => import("../lessons/m5"), m6: () => import("../lessons/m6"), m7: () => import("../lessons/m7"),
  m8: () => import("../lessons/m8"), m9: () => import("../lessons/m9"), m10: () => import("../lessons/m10"), m11: () => import("../lessons/m11"),
  m12: () => import("../lessons/m12"), m13: () => import("../lessons/m13"),
};

/* The next lesson's first drawing (every lesson opens with the whole picture,
 * its parts numbered). Until it loads, or if a lesson has none, the part's
 * own app preview stands in. */
function NextLessonDrawing({ moduleId, lesson, part }: { moduleId: string; lesson: number; part: number }) {
  const [fig, setFig] = useState<{ key: string; node: ReactNode } | null>(null);
  const key = `${moduleId}:${lesson}`;
  useEffect(() => {
    let alive = true;
    const load = LESSONS[moduleId];
    if (!load) return;
    load().then((mod) => {
      if (!alive) return;
      const node = mod.default?.topics?.[lesson]?.learn?.find((c) => c.figure)?.figure;
      if (node) setFig({ key, node });
    }).catch(() => {});
    return () => { alive = false; };
  }, [moduleId, lesson, key]);
  /* the lesson draws its figure at lesson width; scale it to the card so the whole picture shows */
  const boxRef = useRef<HTMLDivElement>(null);
  const ready = !!fig && fig.key === key;
  useEffect(() => {
    const box = boxRef.current, inner = box?.firstElementChild as HTMLElement | null;
    if (!box || !inner) return;
    const fit = () => { inner.style.zoom = "1"; const w = inner.scrollWidth; inner.style.zoom = String(w > box.clientWidth ? box.clientWidth / w : 1); };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(box);
    return () => ro.disconnect();
  }, [ready]);
  if (ready) return <div ref={boxRef} className="hb6-draw real" tabIndex={0} role="region" aria-label={`The whole picture for lesson ${lesson + 1}`}><div>{fig.node}</div></div>;
  return <div className="hb6-draw art"><PartPreview kind={PART_PREVIEW[part]} /></div>;
}

const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Tick = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>;

function Ring({ value }: { value: number }) {
  const r = 40, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 104 104" aria-hidden="true">
      <defs><linearGradient id="hb6Ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7fb2ff" /><stop offset=".55" stopColor="#5fd0d8" /><stop offset="1" stopColor="#9d8cff" /></linearGradient></defs>
      <circle cx="52" cy="52" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
      <circle className="arc" cx="52" cy="52" r={r} fill="none" stroke="url(#hb6Ring)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(c * value).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 52 52)" />
    </svg>
  );
}

export default function CourseHome() {
  const done = useDone();
  const all = PARTS.flatMap((p) => p.modules);
  const open = all.filter((m) => m.ready);
  const openLessons = open.reduce((n, m) => n + lessonsOf(m), 0);
  const doneLessons = open.reduce((n, m) => n + Math.min(doneIn(done, m.id), lessonsOf(m)), 0);
  const finishedModules = open.filter((m) => doneIn(done, m.id) >= lessonsOf(m)).length;
  const pct = openLessons ? doneLessons / openLessons : 0;

  /* the next lesson: where the learner last worked (see ./resume) */
  const resume = resumeAt(open, done);
  const nextModule = resume?.module;
  const nextPart = nextModule ? PARTS.findIndex((p) => p.modules.includes(nextModule)) : -1;
  const nextLesson = resume?.lesson ?? 0;
  const passedFinal = done.includes("finalj1");

  return (
    <NightHomeShell course="desk">
      <style>{PREVIEW_CSS}</style>
      <header className="hb6-chrome">
        <div className="hb6-chrome-in">
          <div className="hb6-chrome-l">
            <Link className="hb6-lockup" href="/desk-ready/course" aria-label="Desk Ready: your desk">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(95,141,255,.55))" }}><rect x="3" y="4" width="18" height="12" rx="2" fill="rgba(95,141,255,0.14)" stroke="#5f8dff" strokeWidth="1.8" /><path d="M9 20 H15 M12 16 V20" stroke="#5f8dff" strokeWidth="1.8" strokeLinecap="round" /><path d="M7.5 10 L10.2 12.6 L15.8 7.4" stroke="#8fd3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="lk-col" aria-hidden="true"><span className="lk-name">DESK <b>READY</b></span><span className="lk-by"><span className="dim">by</span><ByCube /><span className="dim">AlgorithmX</span></span></span>
            </Link>
            <span className="hb6-trail">Your desk</span>
          </div>
          <div className="hb6-chrome-r">
            <Link className="hb6-pillbtn" href="/desk-ready">About the course</Link>
            <NightHomePause />
          </div>
        </div>
      </header>

      <main className="hb6-main" id="main">
        <section className="hb6-hero" aria-labelledby="hb6-h1">
          <div className="hb6-hero-l">
            <p className="hb6-kicker hb6-rise" style={{ "--i": 0 } as CSSProperties}>Your desk</p>
            <h1 id="hb6-h1" className="hb6-h1 hb6-rise" style={{ "--i": 1 } as CSSProperties}>{doneLessons ? "Welcome back." : "Welcome to your desk."}</h1>
            <p className="hb6-lede hb6-rise" style={{ "--i": 2 } as CSSProperties}>
              {doneLessons
                ? "Pick up where you left off. Every lesson ends with the real thing, in a pretend office where nothing breaks."
                : "Short lessons, one idea at a time, each one ending with the real thing in a pretend office. Start wherever suits you."}
            </p>
            <div className="hb6-prog hb6-rise" style={{ "--i": 3 } as CSSProperties}>
              <div className="hb6-ring"><Ring value={pct} /><span><b>{Math.round(pct * 100)}%</b><small>done</small></span></div>
              <dl className="hb6-stats">
                <div><dt>Lessons done</dt><dd>{doneLessons} <span>of {openLessons}</span></dd></div>
                <div><dt>Modules finished</dt><dd>{finishedModules} <span>of {open.length}</span></dd></div>
                <div><dt>Open now</dt><dd>{open.length} <span>modules</span></dd></div>
              </dl>
            </div>
            <ol className="hb6-partmap hb6-rise" style={{ "--i": 4 } as CSSProperties} aria-label="The six parts">
              {PARTS.map((p, i) => {
                const ready = p.modules.filter((m) => m.ready);
                const fin = ready.filter((m) => doneIn(done, m.id) >= lessonsOf(m)).length;
                const st = ready.length > 0 && fin === ready.length ? "done" : i === nextPart ? "current" : "todo";
                return (
                  <li key={p.id} data-state={st} style={partVars(i)}>
                    <span className="k">{p.label}</span>
                    <span className="t">{p.title}</span>
                    <span className="s">{st === "done" ? <><Tick /> Finished</> : st === "current" ? `${fin} of ${p.modules.length}` : `${p.modules.length} module${p.modules.length > 1 ? "s" : ""}`}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {nextModule ? (
            <aside className="hb6-console hb6-rise" style={{ "--i": 2, "--hb6-acc": PART_ACCENT[nextPart], "--hb6-acc-rgb": PART_RGB[nextPart], "--hb6-acc-text": `var(--hb6-p${nextPart}-text)` } as CSSProperties} aria-label={doneLessons ? "Pick up where you left off" : "Start here"}>
              <i className="hb6-corner tl" aria-hidden="true" /><i className="hb6-corner tr" aria-hidden="true" /><i className="hb6-corner bl" aria-hidden="true" /><i className="hb6-corner br" aria-hidden="true" />
              <span className="hb6-con-kicker">{doneLessons ? "Pick up where you left off" : "Start here"}</span>
              <h2 className="hb6-con-title">Module {nextModule.number}: {nextModule.title}</h2>
              <p className="hb6-con-sub">Lesson {nextLesson + 1} of {lessonsOf(nextModule)}: <b>{nextModule.topics[nextLesson]}</b></p>
              <NextLessonDrawing moduleId={nextModule.id} lesson={nextLesson} part={nextPart} />
              <Link className="hb6-cta" href={`/desk-ready/${nextModule.id}`}>{doneIn(done, nextModule.id) ? "Carry on" : "Start the module"} <Arrow /></Link>
              <div className="hb6-con-foot"><span>{PARTS[nextPart].label} &middot; {PARTS[nextPart].title}</span><span>{Math.min(doneIn(done, nextModule.id), lessonsOf(nextModule))} of {lessonsOf(nextModule)} lessons done</span></div>
            </aside>
          ) : (
            <aside className="hb6-console hb6-rise" style={{ "--i": 2, "--hb6-acc": "#4cc38a", "--hb6-acc-rgb": "76,195,138", "--hb6-acc-text": "var(--hb6-ok-text)" } as CSSProperties} aria-label="All caught up">
              <i className="hb6-corner tl" aria-hidden="true" /><i className="hb6-corner tr" aria-hidden="true" /><i className="hb6-corner bl" aria-hidden="true" /><i className="hb6-corner br" aria-hidden="true" />
              <span className="hb6-con-kicker">All caught up</span>
              <h2 className="hb6-con-title">You have finished every module open so far.</h2>
              <p className="hb6-con-sub">New modules are on the way. Any lesson can be done again from its module.</p>
            </aside>
          )}
        </section>

        <section className="hb6-course" aria-labelledby="hb6-course-h">
          <p className="hb6-kicker plain" data-reveal>The course</p>
          <h2 id="hb6-course-h" className="hb6-h2" data-reveal>Six parts, fourteen modules.</h2>
          <div className="hb6-parts">
            {PARTS.map((p, i) => (
              <article key={p.id} className="hb6-part" style={partVars(i)} aria-labelledby={`hb6-${p.id}-h`} data-reveal>
                <span className="hb6-ghost" aria-hidden="true">{String(i).padStart(2, "0")}</span>
                <p className="hb6-kicker">{p.label}</p>
                <h3 id={`hb6-${p.id}-h`}>{p.title}</h3>
                <p className="hb6-part-blurb">{p.blurb}</p>
                <ol className="hb6-dms">
                  {p.modules.map((m) => {
                    const n = doneIn(done, m.id), total = lessonsOf(m);
                    const finished = m.ready && n >= total;
                    const current = m.ready && !finished && nextModule?.id === m.id;
                    const state = finished ? "finished" : current ? "current" : "open";
                    const shown = Math.min(n, total);
                    const body = (
                      <>
                        <span className="hb6-dm-top">
                          <span className="hb6-dm-n">Module {m.number}</span>
                          {!m.ready ? (
                            <span className="hb6-pill soon">Coming soon</span>
                          ) : finished ? (
                            <span className="hb6-pill done"><Tick /> Finished</span>
                          ) : (
                            <span className="hb6-pill open">{n ? "In progress" : "Open"}</span>
                          )}
                        </span>
                        <b>{m.title}</b>
                        <span className="hb6-dm-p">{m.promise}</span>
                        {current && <span className="hb6-dm-meta">Lesson {nextLesson + 1} of {total} next: {m.topics[nextLesson]}</span>}
                        {m.ready && (
                          <span className="hb6-bar sm" role="progressbar" aria-valuenow={shown} aria-valuemin={0} aria-valuemax={total} aria-label={`${shown} of ${total} lessons done`}><i style={{ "--w": `${(shown / total) * 100}%` } as CSSProperties} /></span>
                        )}
                      </>
                    );
                    return (
                      <li key={m.id}>
                        {m.ready
                          ? <Link className="hb6-dm" data-state={state} href={`/desk-ready/${m.id}`}>{body}</Link>
                          : <span className="hb6-dm soon" data-state="open">{body}</span>}
                      </li>
                    );
                  })}
                </ol>
              </article>
            ))}
          </div>
          {(() => {
            /* ── Final task ── it links like a module once it's open, with its own status */
            const inner = (
              <>
                <span className="hb6-final-glyph" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M6 3h12v4a6 6 0 0 1-12 0z" /><path d="M6 5H3v1a4 4 0 0 0 4 4M18 5h3v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4v4h-4z" /></svg>
                </span>
                <span><span className="hb6-kicker">The final task</span><h3>{FINAL.title}</h3><p>{FINAL.promise}</p></span>
                {!FINAL.ready ? (
                  <span className="hb6-pill soon">Coming soon</span>
                ) : passedFinal ? (
                  <span className="hb6-pill done"><Tick /> Passed</span>
                ) : (
                  <span className="hb6-pill open" style={{ "--acc": "#ff8fe0", "--acc-rgb": "255,143,224" } as CSSProperties}>Open</span>
                )}
              </>
            );
            return FINAL.ready
              ? <Link className="hb6-final" href={`/desk-ready/${FINAL.id}`} data-reveal>{inner}</Link>
              : <article className="hb6-final locked" data-reveal>{inner}</article>;
          })()}
        </section>
      </main>
    </NightHomeShell>
  );
}
