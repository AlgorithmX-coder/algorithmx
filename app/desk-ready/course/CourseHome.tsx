"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import DeskHeader from "../DeskHeader";
import PartPreview, { PREVIEW_CSS, type PreviewKind } from "../PartPreview";
import { doneIn, useDone } from "../learn/progress";
import { resumeAt } from "./resume";
import { Kicker, SHELL_CSS, Tick } from "../learn/ui";
import { FINAL, PARTS, type DeskModule } from "../syllabus";
import { D, PART_ACCENT } from "../tokens";

/* "Your desk": where a learner lands after signing in. A progress ring and
 * honest stats, a "pick up where you left off" card showing the app the
 * next lesson uses, then the six parts as the landing's bento cards with
 * each module's own status. Progress comes from this browser (desk:done). */

const PART_PREVIEW: ReadonlyArray<PreviewKind> = ["desktop", "outlook", "excel", "sharepoint", "copilot", "word"];
/* the landing's bento: width of 12 columns, module tiles across */
const PART_LAYOUT: ReadonlyArray<{ span: number; cols: number }> = [
  { span: 4, cols: 1 },
  { span: 8, cols: 3 },
  { span: 7, cols: 2 },
  { span: 5, cols: 1 },
  { span: 8, cols: 3 },
  { span: 4, cols: 1 },
];

const lessonsOf = (m: DeskModule) => m.topics.length;

function Ring({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden style={{ display: "block" }}>
      <defs>
        <linearGradient id="drRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fb2ff" />
          <stop offset="0.55" stopColor="#5fd0d8" />
          <stop offset="1" stopColor="#9d8cff" />
        </linearGradient>
      </defs>
      <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle
        className="cs-ring-arc"
        cx="66"
        cy="66"
        r={r}
        fill="none"
        stroke="url(#drRing)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`}
        transform="rotate(-90 66 66)"
        style={{ filter: "drop-shadow(0 0 8px rgba(127,178,255,0.6))" }}
      />
    </svg>
  );
}

export default function CourseHome() {
  const done = useDone();
  const open = PARTS.flatMap((p) => p.modules).filter((m) => m.ready);
  const openLessons = open.reduce((n, m) => n + lessonsOf(m), 0);
  const doneLessons = open.reduce((n, m) => n + Math.min(doneIn(done, m.id), lessonsOf(m)), 0);
  const finishedModules = open.filter((m) => doneIn(done, m.id) >= lessonsOf(m)).length;
  const pct = openLessons ? doneLessons / openLessons : 0;

  /* the next lesson: where the learner last worked (see ./resume) */
  const resume = resumeAt(open, done);
  const nextModule = resume?.module;
  const nextPart = nextModule ? PARTS.findIndex((p) => p.modules.includes(nextModule)) : -1;
  const nextLesson = resume?.lesson ?? 0;

  return (
    <div className="dr-shell">
      <DeskHeader link={{ href: "/desk-ready", label: "About the course" }} trail="Your desk" />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 16px 90px" }}>
        {/* hero: welcome + progress */}
        <section className="cs-hero">
          <div>
            <Kicker>Your desk</Kicker>
            <h1 className="cs-h1">{doneLessons ? "Welcome back." : "Welcome to your desk."}</h1>
            <p className="cs-lede">
              {doneLessons
                ? "Pick up where you left off. Every lesson ends with the real thing, in a pretend office where nothing breaks."
                : "Short lessons, one idea at a time, each one ending with the real thing in a pretend office. Start wherever suits you."}
            </p>
          </div>
          <div className="cs-progress dr-glass">
            <div style={{ position: "relative", width: 132, height: 132, flexShrink: 0 }}>
              <Ring value={pct} />
              <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <b style={{ fontFamily: D.display, fontSize: 30, fontWeight: 600, color: D.ink, letterSpacing: "-0.02em" }}>{Math.round(pct * 100)}%</b>
                <span style={{ fontFamily: D.mono, fontSize: 10, letterSpacing: "0.16em", color: D.faint, textTransform: "uppercase" }}>done</span>
              </span>
            </div>
            <dl className="cs-stats">
              <div>
                <dt>Lessons done</dt>
                <dd>
                  {doneLessons} <span>of {openLessons}</span>
                </dd>
              </div>
              <div>
                <dt>Modules finished</dt>
                <dd>
                  {finishedModules} <span>of {open.length}</span>
                </dd>
              </div>
              <div>
                <dt>Open now</dt>
                <dd>
                  {open.length} <span>modules</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* pick up where you left off */}
        {nextModule ? (
          <Link href={`/desk-ready/${nextModule.id}`} className="cs-next dr-glass" style={{ "--acc": PART_ACCENT[nextPart], "--dr-accent": PART_ACCENT[nextPart] } as CSSProperties}>
            <div style={{ minWidth: 0 }}>
              <Kicker color={PART_ACCENT[nextPart]}>{doneLessons ? "Pick up where you left off" : "Start here"}</Kicker>
              <h2 className="cs-next-title">
                Module {nextModule.number}: {nextModule.title}
              </h2>
              <p className="cs-next-sub">
                Lesson {nextLesson + 1} of {lessonsOf(nextModule)}: {nextModule.topics[nextLesson]}
              </p>
              <span className="cs-next-cta">
                {doneIn(done, nextModule.id) ? "Carry on" : "Start the module"}
                <span aria-hidden>&rarr;</span>
              </span>
            </div>
            <span className="cs-next-art">
              <PartPreview kind={PART_PREVIEW[nextPart]} />
            </span>
          </Link>
        ) : (
          <div className="cs-next dr-glass" style={{ "--acc": D.good } as CSSProperties}>
            <div>
              <Kicker color={D.good}>All caught up</Kicker>
              <h2 className="cs-next-title">You have finished every module open so far.</h2>
              <p className="cs-next-sub">New modules are on the way. Any lesson can be done again from its module.</p>
            </div>
          </div>
        )}

        {/* the course */}
        <section aria-labelledby="cs-course-h" style={{ marginTop: 56 }}>
          <Kicker color={D.faint}>The course</Kicker>
          <h2 id="cs-course-h" className="cs-h2">
            Six parts, fourteen modules.
          </h2>
          <div className="cs-parts">
            {PARTS.map((p, i) => {
              const acc = PART_ACCENT[i];
              return (
                <article
                  key={p.id}
                  className={PART_LAYOUT[i].span < 7 ? "cs-part narrow" : "cs-part"}
                  style={{ "--span": PART_LAYOUT[i].span, "--cols": PART_LAYOUT[i].cols, "--acc": acc, "--dr-accent": acc } as CSSProperties}
                >
                  <span className="cs-ghost" aria-hidden>
                    {String(i).padStart(2, "0")}
                  </span>
                  <span className="cs-part-titles">
                    <Kicker color={acc}>{p.label}</Kicker>
                    <h3>{p.title}</h3>
                  </span>
                  <PartPreview kind={PART_PREVIEW[i]} />
                  <ol className="cs-mods">
                    {p.modules.map((m) => {
                      const n = doneIn(done, m.id);
                      const total = lessonsOf(m);
                      const finished = m.ready && n >= total;
                      const body = (
                        <>
                          <span className="cs-mod-top">
                            <span className="cs-mod-n">Module {m.number}</span>
                            {!m.ready ? (
                              <span className="cs-pill soon">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden style={{ display: "inline-block" }}>
                                  <rect x="5" y="11" width="14" height="10" rx="2" />
                                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                </svg>
                                Coming soon
                              </span>
                            ) : finished ? (
                              <span className="cs-pill done">
                                <Tick size={11} color={D.good} /> Finished
                              </span>
                            ) : (
                              <span className="cs-pill open">{n ? "In progress" : "Open"}</span>
                            )}
                          </span>
                          <b>{m.title}</b>
                          <span className="cs-mod-p">{m.promise}</span>
                          {m.ready && (
                            <span className="cs-bar" aria-label={`${Math.min(n, total)} of ${total} lessons done`}>
                              <span style={{ width: `${(Math.min(n, total) / total) * 100}%` }} />
                            </span>
                          )}
                        </>
                      );
                      return (
                        <li key={m.id}>
                          {m.ready ? (
                            <Link href={`/desk-ready/${m.id}`} className={finished ? "cs-mod ready finished" : "cs-mod ready"}>
                              {body}
                            </Link>
                          ) : (
                            <span className="cs-mod">{body}</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </article>
              );
            })}
          </div>
          {(() => {
            /* ── Final task ── it links like a module once it's open, with its own status */
            const passedFinal = done.includes("finalj1");
            const inner = (
              <>
            <span className="cs-final-glyph" aria-hidden>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                <path d="M6 3h12v4a6 6 0 0 1-12 0z" />
                <path d="M6 5H3v1a4 4 0 0 0 4 4M18 5h3v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4v4h-4z" />
              </svg>
            </span>
            <span>
              <Kicker color="#ff8fe0">The final task</Kicker>
              <h3>{FINAL.title}</h3>
              <p>{FINAL.promise}</p>
            </span>
            {!FINAL.ready ? (
              <span className="cs-pill soon cs-final-pill">Coming soon</span>
            ) : passedFinal ? (
              <span className="cs-pill done cs-final-pill">
                <Tick size={11} color={D.good} /> Passed
              </span>
            ) : (
              <span className="cs-pill open cs-final-pill">Open</span>
            )}
              </>
            );
            return FINAL.ready ? (
              <Link href={`/desk-ready/${FINAL.id}`} className="cs-final dr-glass ready" style={{ "--acc": "#ff8fe0" } as CSSProperties}>
                {inner}
              </Link>
            ) : (
              <article className="cs-final dr-glass" style={{ "--acc": "#ff8fe0" } as CSSProperties}>
                {inner}
              </article>
            );
          })()}
        </section>
      </main>

      <style>{`
        ${SHELL_CSS}
        ${PREVIEW_CSS}
        .cs-hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 32px; align-items: center; }
        .cs-h1 { margin: 12px 0 0; font-family: ${D.display}; font-size: clamp(2.3rem, 5vw, 3.6rem); line-height: 1.02; letter-spacing: -0.03em; font-weight: 500; color: ${D.ink}; }
        .cs-lede { margin: 16px 0 0; max-width: 560px; font-size: 18px; line-height: 1.6; color: ${D.muted}; }
        .cs-progress { position: relative; display: flex; align-items: center; gap: 24px; padding: 22px 26px; border-radius: 22px; background: ${D.card}; border: 1px solid ${D.edge}; box-shadow: ${D.lift}; }
        .cs-stats { margin: 0; display: grid; gap: 12px; }
        .cs-stats div { display: flex; flex-direction: column; gap: 2px; }
        .cs-stats dt { font-family: ${D.mono}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${D.faint}; }
        .cs-stats dd { margin: 0; font-family: ${D.display}; font-size: 22px; font-weight: 600; color: ${D.ink}; }
        .cs-stats dd span { font-size: 14px; font-weight: 500; color: ${D.faint}; }
        @media (prefers-reduced-motion: no-preference) { .cs-ring-arc { animation: cs-ring 1.2s cubic-bezier(.16,1,.3,1) both; } }
        @keyframes cs-ring { from { stroke-dasharray: 0 400; } }

        .cs-next { position: relative; margin-top: 30px; display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: 28px 30px; border-radius: 22px; text-decoration: none;
          background: radial-gradient(80% 140% at 100% 0%, color-mix(in srgb, var(--acc) 22%, transparent), transparent 60%), ${D.card};
          border: 1px solid color-mix(in srgb, var(--acc) 40%, transparent); box-shadow: ${D.lift}; transition: transform .2s ease, box-shadow .2s ease; }
        a.cs-next:hover { transform: translateY(-3px); box-shadow: 0 34px 64px -30px color-mix(in srgb, var(--acc) 55%, rgba(0,0,0,0.9)); }
        .cs-next-title { margin: 10px 0 0; font-family: ${D.display}; font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.12; letter-spacing: -0.02em; font-weight: 500; color: ${D.ink}; }
        .cs-next-sub { margin: 10px 0 0; font-size: 17px; line-height: 1.5; color: ${D.muted}; }
        .cs-next-cta { margin-top: 20px; display: inline-flex; align-items: center; gap: 10px; min-height: 50px; padding: 0 26px; border-radius: 999px; background: ${D.action}; color: ${D.onAccent}; font-family: ${D.display}; font-weight: 600; font-size: 16.5px; box-shadow: ${D.actionGlow}; }
        .cs-next-art { flex-shrink: 0; margin: 0 10px 0 20px; }
        .cs-next-art .dr-pv { width: 340px; transform: rotate(-3deg); }

        .cs-h2 { margin: 10px 0 0; font-family: ${D.display}; font-size: clamp(1.8rem, 3.2vw, 2.5rem); line-height: 1.08; letter-spacing: -0.025em; font-weight: 500; color: ${D.ink}; }
        .cs-parts { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 18px; margin-top: 26px; }
        .cs-part { grid-column: span var(--span); position: relative; overflow: hidden; isolation: isolate; box-sizing: border-box;
          display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto 1fr; grid-template-areas: "titles pv" "mods mods"; column-gap: 16px; row-gap: 14px; padding: 22px 22px 20px; border-radius: 20px;
          background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--acc) 20%, transparent), transparent 60%), ${D.card};
          border: 1px solid color-mix(in srgb, var(--acc) 30%, rgba(255,255,255,0.06)); box-shadow: ${D.lift}; }
        .cs-part::after { content: ""; position: absolute; left: 20px; right: 20px; top: 0; height: 2px; border-radius: 2px; background: linear-gradient(90deg, transparent, var(--acc), transparent); box-shadow: 0 0 14px var(--acc); }
        .cs-ghost { position: absolute; right: 14px; bottom: -22px; z-index: -1; font-family: ${D.display}; font-size: 120px; font-weight: 700; line-height: 1; letter-spacing: -0.05em; color: var(--acc); opacity: 0.07; pointer-events: none; }
        .cs-part-titles { grid-area: titles; padding-top: 6px; min-width: 0; }
        .cs-part h3 { margin: 6px 0 0; font-family: ${D.display}; font-size: clamp(1.3rem, 1.9vw, 1.55rem); line-height: 1.1; letter-spacing: -0.02em; font-weight: 500; color: ${D.ink}; }
        .cs-part .dr-pv { grid-area: pv; align-self: start; width: 230px; }
        .cs-part.narrow .dr-pv { width: 136px; }
        .cs-part.narrow h3 { font-size: clamp(1.2rem, 1.6vw, 1.4rem); }
        .cs-mods { grid-area: mods; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: 10px; align-content: start; }
        .cs-mods li { display: flex; }
        .cs-mod { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 13px 14px 14px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); color: ${D.muted}; text-decoration: none; opacity: 0.75; }
        .cs-mod.ready { opacity: 1; border-style: solid; background: color-mix(in srgb, var(--acc) 9%, rgba(255,255,255,0.04)); border-color: color-mix(in srgb, var(--acc) 50%, transparent); box-shadow: 0 0 22px -12px var(--acc); transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
        .cs-mod.ready:hover { transform: translateY(-2px); border-color: var(--acc); box-shadow: 0 10px 30px -14px var(--acc); }
        .cs-mod.finished { border-color: ${D.goodEdge}; }
        .cs-mod-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .cs-mod-n { font-family: ${D.mono}; font-size: 10.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--acc); }
        .cs-mod b { font-family: ${D.display}; font-size: 15px; font-weight: 600; line-height: 1.3; color: ${D.ink}; }
        .cs-mod-p { font-size: 13.5px; line-height: 1.45; color: ${D.faint}; }
        .cs-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px; font-family: ${D.mono}; font-size: 9.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }
        .cs-pill.soon { color: ${D.faint}; border: 1px solid rgba(255,255,255,0.14); }
        .cs-pill.open { color: ${D.ink}; background: color-mix(in srgb, var(--acc) 30%, transparent); border: 1px solid var(--acc); }
        .cs-pill.done { color: ${D.good}; background: ${D.goodSoft}; border: 1px solid ${D.goodEdge}; }
        .cs-bar { margin-top: 8px; height: 5px; border-radius: 99px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .cs-bar span { display: block; height: 100%; border-radius: 99px; background: var(--acc); box-shadow: 0 0 10px var(--acc); }

        .cs-final { position: relative; margin-top: 18px; display: flex; align-items: center; gap: 20px; padding: 24px 26px; border-radius: 20px;
          background: radial-gradient(80% 140% at 0% 0%, rgba(127,178,255,0.2), transparent 60%), radial-gradient(70% 140% at 100% 100%, rgba(255,143,224,0.16), transparent 60%), ${D.card};
          border: 1px solid rgba(157,140,255,0.38); box-shadow: ${D.lift}; }
        .cs-final h3 { margin: 6px 0 0; font-family: ${D.display}; font-size: clamp(1.3rem, 2vw, 1.55rem); font-weight: 500; letter-spacing: -0.02em; color: ${D.ink}; }
        .cs-final p { margin: 6px 0 0; max-width: 720px; font-size: 15.5px; line-height: 1.6; color: ${D.muted}; }
        .cs-final-glyph { flex-shrink: 0; width: 56px; height: 56px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: ${D.warn}; background: ${D.warnSoft}; border: 1px solid ${D.warnEdge}; box-shadow: 0 0 26px -6px ${D.warn}; }
        .cs-final-pill { margin-left: auto; align-self: flex-start; }
        a.cs-final { text-decoration: none; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        a.cs-final:hover { transform: translateY(-2px); border-color: var(--acc); box-shadow: 0 26px 54px -28px var(--acc); }
        a.cs-final:focus-visible { outline: 3px solid ${D.accent}; outline-offset: 3px; }

        @media (max-width: 980px) {
          .cs-hero { grid-template-columns: 1fr; }
          .cs-part { grid-column: span 12; }
          .cs-part.narrow .dr-pv { width: 230px; }
          .cs-mods { grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
          .cs-next-art { display: none; }
        }
        @media (max-width: 560px) {
          .cs-progress { flex-direction: column; align-items: flex-start; }
          .cs-next { padding: 22px 20px; }
          .cs-final { flex-direction: column; align-items: flex-start; }
          .cs-final-pill { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}
