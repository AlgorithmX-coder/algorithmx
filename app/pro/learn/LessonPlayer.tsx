"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { T } from "./tokens";
import {
  FIVE_CONTROLS,
  lessonCheckpointKey,
  type CaseCard,
  type GlossaryEntry,
  type LearnCard,
  type LessonCheckpoint,
  type LessonManifest,
  type LessonPhase,
} from "./types";

/* The engine that runs one lesson through Learn -> See -> Try -> Check.
 * Structure only; every word of content comes from the manifest.
 * Warm, spacious, adult-beginner tone. Resume via localStorage.
 *
 * A persistent outline rail (desktop) shows the four stages and the
 * learner's place, so it reads as a course, not a slideshow. */

type StageKey = Exclude<LessonPhase, "intro" | "done">;
const STAGES: { key: StageKey; label: string; sub: string; desc: string }[] = [
  { key: "learn", label: "Learn", sub: "the idea", desc: "The idea in plain English, with real examples." },
  { key: "see", label: "See", sub: "a real case", desc: "A real company it happened to, and the cost." },
  { key: "try", label: "Try", sub: "hands on", desc: "Do it yourself in a safe browser lab." },
  { key: "check", label: "Check", sub: "prove it", desc: "Explain it back, then a quick quiz." },
];
const STAGE_ORDER = STAGES.map((s) => s.key);

/* Line icons for the four stages (24x24, inherit stroke via currentColor). */
function StageIcon({ kind, size = 22 }: { kind: StageKey; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (kind === "learn") return <svg {...common}><path d="M12 6C10.6 4.9 8.8 4.3 6.7 4.3c-1 0-1.9.1-2.7.4v12.6c.8-.3 1.7-.4 2.7-.4 2.1 0 3.9.6 5.3 1.7M12 6c1.4-1.1 3.2-1.7 5.3-1.7 1 0 1.9.1 2.7.4v12.6c-.8-.3-1.7-.4-2.7-.4-2.1 0-3.9.6-5.3 1.7M12 6v12.6" /></svg>;
  if (kind === "see") return <svg {...common}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>;
  if (kind === "try") return <svg {...common}><path d="M9 3.5h6M10 4v4.7L5.5 17c-.7 1.3.2 2.9 1.7 2.9h9.6c1.5 0 2.4-1.6 1.7-2.9L14 8.7V4" /><path d="M8 14.5h8" /></svg>;
  return <svg {...common}><path d="M12 3.5l7 2.6v5.3c0 4.2-3 6.9-7 8.4-4-1.5-7-4.2-7-8.4V6.1l7-2.6z" /><path d="M9 12l2 2 4-4.4" /></svg>;
}

/* --- the outline rail --- */
function TickDot({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done") {
    return (
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid ${T.green}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3.5" aria-hidden><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  if (state === "current") {
    return <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${T.cyan}`, background: T.cyanSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.cyan }} /></span>;
  }
  return <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${T.edge}`, flexShrink: 0 }} />;
}

function Rail({ phase, learnIdx, learnCount, onGo }: { phase: LessonPhase; learnIdx: number; learnCount: number; onGo: (p: LessonPhase) => void }) {
  const idx = STAGE_ORDER.indexOf(phase as (typeof STAGE_ORDER)[number]);
  return (
    <div style={{ position: "sticky", top: 22 }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: T.faint, marginBottom: 16 }}>Your progress</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {STAGES.map((s, i) => {
          const state: "done" | "current" | "upcoming" = i < idx ? "done" : i === idx ? "current" : "upcoming";
          const reached = i <= idx;
          return (
            <div key={s.key}>
              <button onClick={() => reached && onGo(s.key)} disabled={!reached}
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "7px 0", cursor: reached ? "pointer" : "default" }}>
                <TickDot state={state} />
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: T.display, fontSize: 14.5, fontWeight: 700, color: state === "upcoming" ? T.faint : T.ink }}>{s.label}</span>
                  <span style={{ fontSize: 11.5, color: state === "current" ? T.cyan : T.faint }}>{s.sub}</span>
                </span>
              </button>
              {/* sub-steps for the multi-part Learn stage */}
              {s.key === "learn" && i === idx && learnCount > 1 && (
                <div style={{ marginLeft: 9, paddingLeft: 15, borderLeft: `1px solid ${T.edge}`, display: "flex", flexDirection: "column", gap: 5, padding: "4px 0 8px 15px" }}>
                  {Array.from({ length: learnCount }, (_, k) => (
                    <span key={k} style={{ fontSize: 12, fontFamily: T.mono, color: k === learnIdx ? T.cyan : k < learnIdx ? T.muted : T.faint }}>
                      {k < learnIdx ? "✓ " : k === learnIdx ? "→ " : "• "}Idea {k + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- inline diagrams (SVG, theme-driven) --- */
function Diagram({ kind }: { kind: NonNullable<LearnCard["diagram"]> }) {
  if (kind === "hash-oneway") {
    return (
      <svg viewBox="0 0 480 186" role="img" aria-label="Your password runs one way through a hash function into the value the website stores; there is no way back to the password" style={{ width: "100%", maxWidth: 480, height: "auto" }}>
        {/* the three boxes */}
        <rect x="8" y="26" width="134" height="46" rx="9" fill={T.primarySoft} stroke={T.primary} />
        <text x="75" y="55" fill={T.ink} fontFamily="monospace" fontSize="15" textAnchor="middle">hunter2</text>

        <rect x="173" y="26" width="134" height="46" rx="9" fill={T.panel} stroke={T.edge} />
        <text x="240" y="49" fill={T.body} fontFamily="monospace" fontSize="14" textAnchor="middle">hash( )</text>
        <text x="240" y="64" fill={T.faint} fontFamily="monospace" fontSize="10" textAnchor="middle">one-way</text>

        <rect x="338" y="26" width="134" height="46" rx="9" fill={T.cyanSoft} stroke={T.cyan} />
        <text x="405" y="55" fill={T.ink} fontFamily="monospace" fontSize="15" textAnchor="middle">f52e9a…</text>

        {/* forward arrows */}
        <path d="M142 49 H171" stroke={T.green} strokeWidth="2.5" markerEnd="url(#fg)" />
        <path d="M307 49 H336" stroke={T.green} strokeWidth="2.5" markerEnd="url(#fg)" />

        {/* plain-English labels under each box */}
        <g fontFamily={T.sans} textAnchor="middle" fontSize="11.5">
          <text x="75" y="92" fill={T.muted}>The password</text>
          <text x="75" y="107" fill={T.muted}>you type</text>
          <text x="240" y="92" fill={T.muted}>A one-way</text>
          <text x="240" y="107" fill={T.muted}>scrambler</text>
          <text x="405" y="92" fill={T.muted}>What the website</text>
          <text x="405" y="107" fill={T.muted}>actually stores</text>
        </g>

        {/* the key point: no reverse */}
        <path d="M405 146 H91" stroke={T.red} strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#rd)" />
        <g stroke={T.red} strokeWidth="2.4">
          <line x1="234" y1="140" x2="246" y2="152" />
          <line x1="246" y1="140" x2="234" y2="152" />
        </g>
        <text x="240" y="176" fill={T.red} fontFamily={T.sans} fontSize="12" fontWeight="700" textAnchor="middle">No way back to your password</text>

        <defs>
          <marker id="fg" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={T.green} /></marker>
          <marker id="rd" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={T.red} /></marker>
        </defs>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 480 150" role="img" aria-label="Changing one character of the password completely changes the fingerprint it produces" style={{ width: "100%", maxWidth: 480, height: "auto" }}>
      {/* column headers */}
      <text x="90" y="16" fill={T.faint} fontFamily={T.mono} fontSize="10" textAnchor="middle">THE PASSWORD</text>
      <text x="336" y="16" fill={T.faint} fontFamily={T.mono} fontSize="10" textAnchor="middle">THE FINGERPRINT IT PRODUCES</text>

      {/* row 1: original */}
      <rect x="20" y="28" width="140" height="36" rx="8" fill={T.primarySoft} stroke={T.primary} />
      <text x="90" y="51" fill={T.ink} fontFamily="monospace" fontSize="15" textAnchor="middle">hunter2</text>
      <path d="M166 46 H196" stroke={T.green} strokeWidth="2.5" markerEnd="url(#av)" />
      <text x="336" y="51" fill={T.body} fontFamily="monospace" fontSize="15" textAnchor="middle">f52e9a1c 4b7d…</text>

      {/* row 2: one character different */}
      <rect x="20" y="82" width="140" height="36" rx="8" fill={T.primarySoft} stroke={T.primary} />
      <text x="90" y="105" fontFamily="monospace" fontSize="15" textAnchor="middle"><tspan fill={T.ink}>hunter</tspan><tspan fill={T.amber} fontWeight="700">3</tspan></text>
      <path d="M166 100 H196" stroke={T.green} strokeWidth="2.5" markerEnd="url(#av)" />
      <text x="336" y="105" fill={T.cyan} fontFamily="monospace" fontSize="15" fontWeight="700" textAnchor="middle">9b0c74ef a1c2…</text>

      <text x="240" y="142" fill={T.muted} fontFamily={T.sans} fontSize="12" textAnchor="middle">Change one character, and the whole fingerprint changes.</text>

      <defs><marker id="av" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={T.green} /></marker></defs>
    </svg>
  );
}

function ControlTag({ control }: { control: CaseCard["control"] }) {
  return (
    <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", color: T.amber, background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 5, padding: "3px 8px" }}>
      Cyber Essentials: {FIVE_CONTROLS[control]}
    </span>
  );
}

/* --- company identity ---
 * We show each company's REAL logo, loaded by its domain from a public
 * logo service, with a favicon fallback and finally a brand-coloured
 * wordmark if neither loads. Logos are used only to identify the real
 * company a documented case is about (editorial / nominative use). */
type BrandSpec = { name: string; color: string; domain?: string; lower?: boolean };

const BRANDS: { test: RegExp; spec: BrandSpec }[] = [
  { test: /linkedin/i, spec: { name: "LinkedIn", color: "#0A66C2", domain: "linkedin.com" } },
  { test: /talktalk/i, spec: { name: "TalkTalk", color: "#E6007E", domain: "talktalk.co.uk" } },
  { test: /rockyou/i, spec: { name: "RockYou", color: "#E0524A", domain: "rockyou.com" } },
  { test: /\bdyn\b|mirai/i, spec: { name: "Dyn", color: "#F2681C", domain: "dyn.com" } },
  { test: /adobe/i, spec: { name: "Adobe", color: "#FA0F00", domain: "adobe.com" } },
  { test: /dropbox/i, spec: { name: "Dropbox", color: "#0061FF", domain: "dropbox.com" } },
  { test: /reddit/i, spec: { name: "Reddit", color: "#FF4500", domain: "reddit.com" } },
  { test: /google/i, spec: { name: "Google", color: "#4285F4", domain: "google.com" } },
  { test: /colonial/i, spec: { name: "Colonial Pipeline", color: "#D1462A", domain: "colpipe.com" } },
  { test: /equifax/i, spec: { name: "Equifax", color: "#822433", domain: "equifax.com" } },
  { test: /target/i, spec: { name: "Target", color: "#CC0000", domain: "target.com" } },
  { test: /maersk/i, spec: { name: "Maersk", color: "#42B0D5", domain: "maersk.com" } },
  { test: /solarwinds/i, spec: { name: "SolarWinds", color: "#F47B20", domain: "solarwinds.com" } },
];

function brandFor(org: string, color?: string): BrandSpec {
  const hit = BRANDS.find((b) => b.test.test(org));
  if (hit) return hit.spec;
  return { name: org, color: color ?? T.primary };
}

/* The real company logo, on a clean white tile so any brand reads well
 * on the dark ground. Tries a logo service, then a favicon, then falls
 * back to the brand-coloured wordmark if the company has no fetchable
 * mark (e.g. a long-defunct site). */
function CompanyLogo({ org, color, size = 56 }: { org: string; color?: string; size?: number }) {
  const b = brandFor(org, color);
  const sources = b.domain
    ? [`https://logo.clearbit.com/${b.domain}?size=128`, `https://www.google.com/s2/favicons?domain=${b.domain}&sz=128`]
    : [];
  const [step, setStep] = useState(0);

  if (sources.length > 0 && step < sources.length) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sources[step]}
        alt={`${b.name} logo`}
        onError={() => setStep((s) => s + 1)}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 12, background: "#fff", padding: Math.round(size * 0.14), flexShrink: 0, boxShadow: "0 1px 0 rgba(255,255,255,0.05)" }}
      />
    );
  }
  // final fallback: brand-coloured wordmark tile
  return (
    <span aria-label={`${b.name} logo`} style={{ width: size, height: size, borderRadius: 12, background: `${b.color}1f`, border: `1px solid ${b.color}55`, display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 6, flexShrink: 0, fontFamily: T.display, fontWeight: 800, fontSize: size * 0.2, lineHeight: 1.1, letterSpacing: "-0.01em", color: b.color }}>
      {b.name}
    </span>
  );
}

/* A sourced press-coverage card: the real headline, outlet and date,
 * with a link to the original. Never a copyrighted article screenshot. */
function NewsCard({ news }: { news: NonNullable<CaseCard["news"]> }) {
  const inner = (
    <>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, marginBottom: 6 }}>In the news</div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, lineHeight: 1.4 }}>&ldquo;{news.headline}&rdquo;</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 5 }}>{news.outlet} &middot; {news.date}{news.url ? " ›" : ""}</div>
    </>
  );
  const style: React.CSSProperties = { display: "block", background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 9, padding: "12px 15px", textDecoration: "none" };
  return news.url
    ? <a href={news.url} target="_blank" rel="noopener noreferrer" style={style}>{inner}</a>
    : <div style={style}>{inner}</div>;
}

/* The real case, styled like a newspaper clipping on white stock: a real
 * company logo, a masthead, a serif headline, a "by the numbers" factbox
 * of real impact figures, and a plain-text credit to the coverage. It is
 * not a link, and never reproduces the article, only cites it. */
function NewsStory({ c }: { c: CaseCard }) {
  const b = brandFor(c.org, c.brandColor);
  return (
    <article className="pns">
      <div className="pns-masthead">
        <span className="pns-kicker">In the news</span>
        <span className="pns-dateline">{c.year}</span>
      </div>
      <div className="pns-lead">
        <CompanyLogo org={c.org} color={c.brandColor} size={58} />
        <div style={{ minWidth: 0 }}>
          <div className="pns-subject" style={{ color: b.color }}>{b.name}</div>
          <h3 className="pns-headline">{c.headline}.</h3>
        </div>
      </div>
      <p className="pns-standfirst">You&apos;ll investigate exactly how it happened, and find the one measure that would have stopped it.</p>
      {c.impact && c.impact.length > 0 && (
        <div className="pns-impact">
          <span className="pns-impact-label">The damage</span>
          <div className="pns-stats">
            {c.impact.map((s, i) => <span key={i} className="pns-stat">{s}</span>)}
          </div>
        </div>
      )}
      {c.news && (
        <div className="pns-source">
          <span className="pns-outlet">{c.news.outlet}</span>
          <span className="pns-cite">&ldquo;{c.news.headline}&rdquo; &middot; {c.news.date}</span>
        </div>
      )}
    </article>
  );
}

/* A key term the learner can hover (desktop) or tap (mobile) to see a
 * plain-language meaning. */
function GlossaryTerm({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        aria-expanded={open}
        style={{ font: "inherit", color: T.cyan, background: "transparent", border: "none", padding: 0, cursor: "help", borderBottom: `1.5px dotted ${T.cyan}99` }}>
        {term}
      </button>
      {open && (
        <span role="tooltip" style={{ position: "absolute", left: 0, bottom: "calc(100% + 8px)", zIndex: 30, width: 268, maxWidth: "80vw", background: T.panel, border: `1px solid ${T.cyan}66`, borderRadius: 10, padding: "11px 13px", boxShadow: "0 10px 28px rgba(0,0,0,0.55)", fontFamily: T.sans, fontSize: 13.5, fontWeight: 400, lineHeight: 1.55, color: T.body, whiteSpace: "normal", letterSpacing: "normal", textTransform: "none" }}>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: T.cyan, marginBottom: 5 }}>{term.toUpperCase()}</span>
          {definition}
        </span>
      )}
    </span>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Wraps the first unseen occurrence of each glossary term (across the
 * shared `seen` set, so a term lights up once per card, not per line). */
function renderWithGlossary(text: string, glossary: GlossaryEntry[] | undefined, seen: Set<string>, keyPrefix: string): ReactNode {
  if (!glossary || glossary.length === 0) return text;
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(`\\b(${sorted.map((g) => escapeRegExp(g.term)).join("|")})\\b`, "gi");
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const matched = m[0];
    const key = matched.toLowerCase();
    const entry = sorted.find((g) => g.term.toLowerCase() === key);
    if (!entry || seen.has(key)) continue;
    seen.add(key);
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<GlossaryTerm key={`${keyPrefix}-${m.index}`} term={matched} definition={entry.definition} />);
    last = m.index + matched.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : text;
}

/* When a lesson runs as one topic inside a week, the player takes a few
 * extra props: a topic counter for the header, and callbacks to finish
 * the topic (advance the week) or jump back to the week overview. */
export default function LessonPlayer({ lesson, topicIndex, topicCount, weekTitle, onComplete, onExit }: {
  lesson: LessonManifest;
  topicIndex?: number; // 0-based position within the week
  topicCount?: number; // total topics in the week
  weekTitle?: string;
  onComplete?: () => void; // finished this topic; advance the week
  onExit?: () => void; // jump back to the week overview
}) {
  const embedded = typeof topicIndex === "number" && typeof topicCount === "number";
  const [phase, setPhase] = useState<LessonPhase>("intro");
  const [learnIdx, setLearnIdx] = useState(0);
  const [didTry, setDidTry] = useState(false);
  const [explainDraft, setExplainDraft] = useState("");
  const [explainRevealed, setExplainRevealed] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(() => lesson.check.quiz.map(() => null));
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(lessonCheckpointKey(lesson.id));
      if (raw) {
        const cp = JSON.parse(raw) as LessonCheckpoint;
        if (cp.id === lesson.id) {
          setPhase(cp.phase);
          setDidTry(cp.didTry);
          setExplainDraft(cp.explainDraft ?? "");
          if (Array.isArray(cp.quizAnswers) && cp.quizAnswers.length === lesson.check.quiz.length) {
            setQuizAnswers(cp.quizAnswers);
          }
        }
      }
    } catch {
      /* corrupt checkpoint: start fresh */
    }
    setRestored(true);
  }, [lesson.id, lesson.check.quiz.length]);

  useEffect(() => {
    if (!restored) return;
    const cp: LessonCheckpoint = { id: lesson.id, phase, didTry, explainDraft, quizAnswers };
    try { localStorage.setItem(lessonCheckpointKey(lesson.id), JSON.stringify(cp)); } catch { /* ignore */ }
  }, [restored, lesson.id, phase, didTry, explainDraft, quizAnswers]);

  const onDidTry = useCallback(() => setDidTry(true), []);
  const Lab = lesson.lab.component;
  const heroCase = lesson.cases[0];

  const quizDone = useMemo(() => quizAnswers.every((a) => a !== null), [quizAnswers]);
  const inLesson = phase !== "intro" && phase !== "done";

  const btn = (label: string, onClick: () => void, opts?: { disabled?: boolean; ghost?: boolean }) => (
    <button onClick={onClick} disabled={opts?.disabled}
      style={{
        fontFamily: T.display, fontSize: 14, fontWeight: 700, letterSpacing: "0.03em",
        padding: "12px 24px", borderRadius: 10, cursor: opts?.disabled ? "not-allowed" : "pointer",
        color: opts?.ghost ? T.muted : "#fff",
        background: opts?.ghost ? "transparent" : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`,
        border: opts?.ghost ? `1px solid ${T.edge}` : "none",
        opacity: opts?.disabled ? 0.5 : 1,
      }}>
      {label}
    </button>
  );

  return (
    <div className="pro-learn" style={{ minHeight: "100vh", color: T.body, fontFamily: T.sans }}>
      <style>{`
        .pro-learn {
          background:
            radial-gradient(1100px 560px at 50% -8%, rgba(139,109,255,0.13), transparent 60%),
            radial-gradient(820px 460px at 90% 2%, rgba(53,214,240,0.08), transparent 55%),
            ${T.bg};
        }
        .pro-learn :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .pro-learn ::selection { background: ${T.primary}; color: #fff; }
        .pro-learn textarea::placeholder, .pro-learn input::placeholder { color: ${T.muted}; }
        .pro-learn p { margin: 0 0 14px; }
        .pro-learn .quiz-opt:not([disabled]):hover { border-color: ${T.primary}; background: ${T.primarySoft}; }
        .pro-shell { display: flex; justify-content: center; gap: 34px; max-width: 760px; margin: 0 auto; padding: 20px 24px 90px; }
        .pro-shell.with-rail { max-width: 1000px; }
        .pro-shell--intro { max-width: 900px; }
        .pro-shell--intro .pro-main { max-width: 900px; }
        .pro-rail { display: none; }
        .pro-main { flex: 1 1 auto; min-width: 0; max-width: 720px; }
        .pro-topbar { display: flex; align-items: center; gap: 8px; }
        @media (min-width: 940px) {
          .pro-rail { display: block; width: 208px; flex-shrink: 0; }
          .pro-topbar { display: none; }
        }

        /* ---- intro ---- */
        .pro-intro { padding-top: 40px; }
        .pro-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: ${T.mono}; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.primary}; margin-bottom: 16px; }
        .pro-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.primary}; box-shadow: 0 0 10px ${T.primary}; }
        .pro-h1 { font-family: ${T.display}; font-size: 40px; font-weight: 700; line-height: 1.12; letter-spacing: -0.01em; margin: 0 0 20px; color: ${T.ink}; text-wrap: balance; }

        /* spoken introduction */
        .pro-brief { max-width: 66ch; margin: 0 0 8px; }
        .pro-brief-lead { font-size: 20px; line-height: 1.6; color: ${T.body}; margin: 0 0 18px; }
        .pro-brief-why { border-left: 3px solid ${T.cyan}; background: ${T.cyanSoft}; border-radius: 0 10px 10px 0; padding: 13px 18px; }
        .pro-brief-why-label { font-family: ${T.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${T.cyan}; margin-bottom: 6px; }
        .pro-brief-why p { font-size: 15.5px; line-height: 1.6; color: ${T.body}; margin: 0; }

        .pro-block { margin: 34px 0 0; }
        .pro-newswrap { max-width: 560px; margin-top: 4px; }

        /* clear section headings */
        .pro-section-label { display: flex; align-items: center; gap: 10px; font-family: ${T.display}; font-size: 18px; font-weight: 800; color: ${T.ink}; margin-bottom: 5px; letter-spacing: -0.01em; }
        .pro-section-num { flex-shrink: 0; width: 24px; height: 24px; border-radius: 7px; background: linear-gradient(135deg, ${T.primary}, ${T.cyan}); color: #fff; font-family: ${T.mono}; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
        .pro-section-note { font-size: 14px; line-height: 1.5; color: ${T.muted}; margin: 0 0 18px; padding-left: 34px; }
        .pro-kicker { font-family: ${T.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.muted}; margin-bottom: 14px; }

        /* horizontal step strip */
        .pro-steps-row { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 560px) { .pro-steps-row { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 820px) { .pro-steps-row { grid-template-columns: repeat(4, 1fr); } }
        .pro-stepcard { background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 12px; padding: 15px 15px 14px; }
        .pro-step-mark { width: 38px; height: 38px; flex-shrink: 0; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; color: ${T.cyan}; background: ${T.cyanSoft}; border: 1px solid ${T.cyan}44; margin-bottom: 11px; }
        .pro-step-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .pro-step-n { font-family: ${T.mono}; font-size: 11px; font-weight: 700; color: ${T.cyan}; }
        .pro-step-label { font-family: ${T.display}; font-size: 16px; font-weight: 700; color: ${T.ink}; }
        .pro-step-sub { font-size: 12px; color: ${T.muted}; }
        .pro-step-desc { font-size: 13.5px; line-height: 1.5; color: ${T.body}; margin-top: 6px; }
        .pro-facts { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid ${T.edge}; font-size: 13px; color: ${T.muted}; }
        .pro-fact b { color: ${T.ink}; font-weight: 700; }
        .pro-fact-sep { width: 3px; height: 3px; border-radius: 50%; background: ${T.muted}; }

        /* the real case, as a newspaper clipping on white stock */
        .pns { display: block; overflow: hidden; background: #fbfbf6; border: 1px solid rgba(0,0,0,0.14); border-radius: 12px; box-shadow: 0 16px 34px rgba(0,0,0,0.4); }
        .pns-masthead { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 16px; border-bottom: 2px solid #17161d; }
        .pns-kicker { font-family: ${T.mono}; font-size: 10.5px; font-weight: 800; letter-spacing: 0.17em; text-transform: uppercase; color: #b3271b; }
        .pns-dateline { font-family: ${T.mono}; font-size: 11px; font-weight: 600; color: #6c6b74; }
        .pns-lead { display: flex; gap: 14px; align-items: flex-start; padding: 15px 16px 9px; }
        .pns-subject { font-family: ${T.mono}; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 5px; }
        .pns-headline { font-family: Georgia, "Times New Roman", "Noto Serif", serif; font-size: 22px; font-weight: 700; line-height: 1.18; letter-spacing: -0.01em; color: #16151d; margin: 0; }
        .pns-standfirst { font-size: 14px; line-height: 1.55; color: #44434e; margin: 0; padding: 0 16px 14px; }
        .pns-impact { padding: 11px 16px; background: #f1f0e8; border-top: 1px solid rgba(0,0,0,0.09); border-bottom: 1px solid rgba(0,0,0,0.09); }
        .pns-impact-label { display: block; font-family: ${T.mono}; font-size: 9.5px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: #b3271b; margin-bottom: 7px; }
        .pns-stats { display: flex; flex-wrap: wrap; gap: 5px 0; }
        .pns-stat { font-size: 12.5px; font-weight: 700; color: #16151d; line-height: 1.35; padding-right: 13px; margin-right: 13px; position: relative; }
        .pns-stat:not(:last-child)::after { content: ""; position: absolute; right: 0; top: 15%; height: 70%; width: 1px; background: rgba(0,0,0,0.18); }
        .pns-source { display: flex; align-items: center; gap: 9px; padding: 10px 16px; background: #efeee6; }
        .pns-outlet { font-family: ${T.display}; font-weight: 800; font-size: 12.5px; color: #16151d; white-space: nowrap; }
        .pns-cite { flex: 1; min-width: 0; font-size: 11.5px; font-style: italic; color: #55545f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .pro-why { max-width: 66ch; font-size: 15px; line-height: 1.6; color: ${T.body}; margin: 4px 0 28px; }
        .pro-why-label { display: block; font-family: ${T.mono}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.cyan}; margin-bottom: 6px; }
        .pro-cta-row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
        .pro-cta { display: inline-flex; align-items: center; gap: 10px; font-family: ${T.display}; font-size: 16px; font-weight: 700; letter-spacing: 0.01em; color: #fff; background: linear-gradient(135deg, ${T.primary}, ${T.cyan}); border: none; border-radius: 12px; padding: 15px 28px; cursor: pointer; box-shadow: 0 8px 26px rgba(139,109,255,0.34); transition: transform 160ms ease, box-shadow 160ms ease; }
        .pro-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(139,109,255,0.44); }
        .pro-cta svg { transition: transform 160ms ease; }
        .pro-cta:hover svg { transform: translateX(3px); }
        .pro-cta-note { font-size: 13px; color: ${T.faint}; max-width: 34ch; line-height: 1.45; }
        @media (prefers-reduced-motion: reduce) { .pro-cta, .pro-cta svg { transition: none; } .pro-cta:hover { transform: none; } .pro-cta:hover svg { transform: none; } }
        @media (max-width: 520px) { .pro-h1 { font-size: 31px; } .pro-intro { padding-top: 24px; } }
      `}</style>

      <div className={`pro-shell${inLesson ? " with-rail" : phase === "intro" ? " pro-shell--intro" : ""}`}>
        {inLesson && (
          <aside className="pro-rail">
            <Rail phase={phase} learnIdx={learnIdx} learnCount={lesson.learn.length} onGo={(p) => setPhase(p)} />
          </aside>
        )}

        <div className="pro-main">
          {/* header */}
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "6px 0 18px", borderBottom: `1px solid ${T.edge}`, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
              {embedded && onExit ? (
                <button onClick={onExit} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.muted }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                  {lesson.weekLabel}
                </button>
              ) : (
                <>
                  <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                    {lesson.weekLabel}
                    {lesson.title ? (<>{" · "}<span style={{ color: T.ink }}>{lesson.title}</span></>) : null}
                  </span>
                </>
              )}
              {embedded && (
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.cyan, background: T.cyanSoft, border: `1px solid ${T.cyan}44`, borderRadius: 6, padding: "2px 9px" }}>Topic {(topicIndex as number) + 1} / {topicCount}</span>
              )}
            </div>
            {inLesson && (
              <div className="pro-topbar">
                {STAGES.map((s, i) => {
                  const idx = STAGE_ORDER.indexOf(phase as (typeof STAGE_ORDER)[number]);
                  return (
                    <span key={s.key} style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", color: i === idx ? T.cyan : i < idx ? T.green : T.faint }}>
                      {s.label.toUpperCase()}{i < STAGES.length - 1 ? " ·" : ""}
                    </span>
                  );
                })}
              </div>
            )}
          </header>

          {/* INTRO */}
          {phase === "intro" && (
            <main className="pro-intro">
              <div className="pro-eyebrow"><span className="pro-eyebrow-dot" />{lesson.act}</div>
              <h1 className="pro-h1">{lesson.title}</h1>

              {/* spoken introduction: talk directly to the learner */}
              <div className="pro-brief">
                <p className="pro-brief-lead">{lesson.brief ?? lesson.promise}</p>
                <div className="pro-brief-why">
                  <div className="pro-brief-why-label">Why this matters</div>
                  <p>{lesson.role}</p>
                </div>
              </div>

              {/* how you'll learn it: full-width horizontal step strip */}
              <section className="pro-block">
                <div className="pro-section-label"><span className="pro-section-num">1</span>How you&apos;ll learn it</div>
                <p className="pro-section-note">Every lesson follows the same four steps, so you always know where you are.</p>
                <ol className="pro-steps-row">
                  {STAGES.map((s, i) => (
                    <li key={s.key} className="pro-stepcard">
                      <span className="pro-step-mark"><StageIcon kind={s.key} /></span>
                      <div className="pro-step-head">
                        <span className="pro-step-n">{i + 1}</span>
                        <span className="pro-step-label">{s.label}</span>
                        <span className="pro-step-sub">{s.sub}</span>
                      </div>
                      <div className="pro-step-desc">{s.desc}</div>
                    </li>
                  ))}
                </ol>
                <div className="pro-facts">
                  <span className="pro-fact"><b>~{lesson.minutes} min</b> this lesson</span>
                  <span className="pro-fact-sep" />
                  <span className="pro-fact"><b>4 steps</b></span>
                  <span className="pro-fact-sep" />
                  <span className="pro-fact"><b>nothing to install</b></span>
                </div>
              </section>

              {/* the real case, as a newspaper clipping */}
              {heroCase && (
                <section className="pro-block">
                  <div className="pro-section-label"><span className="pro-section-num">2</span>The real case you&apos;ll dig into</div>
                  <p className="pro-section-note">A true story that shows why this matters, not a made-up example.</p>
                  <div className="pro-newswrap"><NewsStory c={heroCase} /></div>
                </section>
              )}

              <div className="pro-cta-row">
                <button className="pro-cta" onClick={() => setPhase("learn")}>
                  Start the lesson
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
                <span className="pro-cta-note">We start with the idea, in plain English. Your place is saved, so you can stop and pick up any time.</span>
              </div>
            </main>
          )}

          {/* LEARN */}
          {phase === "learn" && (() => {
            const card = lesson.learn[learnIdx];
            const last = learnIdx === lesson.learn.length - 1;
            const seen = new Set<string>(); // glossary terms light up once per card
            return (
              <main style={{ marginTop: 26 }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginBottom: 10 }}>Idea {learnIdx + 1} of {lesson.learn.length}</div>
                <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, lineHeight: 1.25, margin: "0 0 16px", color: T.ink }}>{card.heading}</h2>
                {card.body.map((p, i) => <p key={i} style={{ fontSize: 16.5, lineHeight: 1.75, color: T.body, maxWidth: "62ch" }}>{renderWithGlossary(p, lesson.glossary, seen, `l${learnIdx}b${i}`)}</p>)}
                {card.examples && card.examples.length > 0 && (
                  <div style={{ margin: "6px 0 6px", maxWidth: "62ch", display: "flex", flexDirection: "column", gap: 9 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.cyan }}>A few examples</div>
                    {card.examples.map((ex, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 15, color: T.body, lineHeight: 1.55 }}>
                        <span aria-hidden style={{ color: T.cyan, flexShrink: 0, fontWeight: 700 }}>&rsaquo;</span>
                        <span>{renderWithGlossary(ex, lesson.glossary, seen, `l${learnIdx}e${i}`)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {card.analogy && (
                  <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderLeft: `3px solid ${T.primary}`, borderRadius: "0 10px 10px 0", padding: "15px 18px", margin: "18px 0", maxWidth: "62ch" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.cyan, marginBottom: 8 }}>In plain terms</div>
                    <div style={{ fontSize: 16, color: T.ink, lineHeight: 1.6 }}>{card.analogy.plain}</div>
                    <div style={{ fontSize: 13.5, color: T.muted, marginTop: 10 }}>The real term is <b style={{ color: T.ink, fontFamily: T.mono, fontSize: 13 }}>{card.analogy.realTerm}</b>.</div>
                  </div>
                )}
                {card.diagram && (
                  <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "18px 20px", margin: "18px 0", maxWidth: "62ch" }}>
                    <Diagram kind={card.diagram} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                  {learnIdx > 0 && btn("Back", () => setLearnIdx((i) => i - 1), { ghost: true })}
                  {last ? btn("See it happen for real", () => setPhase("see")) : btn("Next idea", () => setLearnIdx((i) => i + 1))}
                </div>
              </main>
            );
          })()}

          {/* SEE */}
          {phase === "see" && (
            <main style={{ marginTop: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.cyan, marginBottom: 8 }}>Real cases, real record</div>
              <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, margin: "0 0 8px", color: T.ink }}>{lesson.seeHeading ?? "The real record"}</h2>
              <p style={{ fontSize: 15, color: T.muted, maxWidth: "60ch", marginBottom: 22 }}>Everything below is the documented public record. As you read, ask the question we will ask of every breach in this course: which basic measure would have stopped it?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {lesson.cases.map((c, i) => (
                  <article key={i} style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                      <CompanyLogo org={c.org} color={c.brandColor} size={46} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: T.display, fontWeight: 800, fontSize: 18, color: brandFor(c.org, c.brandColor).color }}>{brandFor(c.org, c.brandColor).name}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{c.year}</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.cyan, marginTop: 4 }}>{c.headline}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.65, color: T.body }}>{c.whatHappened}</p>
                    <div style={{ background: T.redSoft, borderRadius: 8, padding: "10px 14px", margin: "6px 0 12px" }}>
                      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.red, marginBottom: 4 }}>THE MISSED MEASURE</div>
                      <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.55 }}>{c.theMissedMeasure}</div>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.65, color: T.body }}><b style={{ color: T.ink }}>What it cost:</b> {c.theCost}</p>
                    {c.news && <div style={{ marginTop: 12 }}><NewsCard news={c.news} /></div>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                      <ControlTag control={c.control} />
                      <span style={{ fontSize: 11, color: T.faint, fontStyle: "italic" }}>{c.source}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                {btn("Back", () => setPhase("learn"), { ghost: true })}
                {btn("Now try it yourself", () => setPhase("try"))}
              </div>
            </main>
          )}

          {/* TRY */}
          {phase === "try" && (
            <main style={{ marginTop: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.green, marginBottom: 8 }}>Your turn, hands on</div>
              <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, margin: "0 0 8px", color: T.ink }}>{lesson.lab.title}</h2>
              <p style={{ fontSize: 15, color: T.muted, maxWidth: "60ch", marginBottom: 18 }}>{lesson.lab.intro ?? "This runs entirely in your own browser. Nothing you do here is sent anywhere."}</p>

              {/* prominent, numbered instructions — written for a total beginner */}
              <div style={{ background: T.panel, border: `1px solid ${T.cyan}44`, borderRadius: 12, padding: "16px 20px", marginBottom: 18 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.cyan, marginBottom: 12 }}>Follow these steps</div>
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                  {lesson.lab.prompts.map((p, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: T.cyanSoft, border: `1px solid ${T.cyan}66`, color: T.cyan, fontFamily: T.mono, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                      <span style={{ fontSize: 15, color: T.body, lineHeight: 1.55, paddingTop: 1 }}>{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
                <Lab onDidTry={onDidTry} />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 26, alignItems: "center" }}>
                {btn("I've had a go", () => setPhase("check"), { disabled: !didTry })}
                {!didTry && <span style={{ fontSize: 13, color: T.muted }}>have a go above to continue</span>}
              </div>
            </main>
          )}

          {/* CHECK */}
          {phase === "check" && (
            <main style={{ marginTop: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, marginBottom: 8 }}>Make it stick</div>
              <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, margin: "0 0 18px", color: T.ink }}>Explain it back</h2>
              <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
                <p style={{ fontSize: 15.5, color: T.body, lineHeight: 1.6 }}>{lesson.check.explain.prompt}</p>
                <textarea value={explainDraft} onChange={(e) => setExplainDraft(e.target.value)} rows={4} placeholder="In your own words..."
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 8, fontFamily: T.sans, fontSize: 15, lineHeight: 1.6, padding: "11px 13px" }} />
                {!explainRevealed ? (
                  <button onClick={() => setExplainRevealed(true)} disabled={explainDraft.trim().length < 10}
                    style={{ marginTop: 10, fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: explainDraft.trim().length < 10 ? T.faint : T.cyan, background: "transparent", border: `1px solid ${explainDraft.trim().length < 10 ? T.edge : T.cyan}66`, borderRadius: 7, padding: "8px 14px", cursor: explainDraft.trim().length < 10 ? "not-allowed" : "pointer" }}>
                    {explainDraft.trim().length < 10 ? "write a little first" : "REVEAL A MODEL ANSWER"}
                  </button>
                ) : (
                  <div style={{ marginTop: 12, background: T.greenSoft, border: `1px solid ${T.green}55`, borderRadius: 8, padding: "12px 15px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.green, marginBottom: 6 }}>A STRONG ANSWER LOOKS LIKE</div>
                    <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.6 }}>{lesson.check.explain.modelAnswer}</div>
                  </div>
                )}
              </div>

              <h3 style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, margin: "0 0 14px", color: T.ink }}>Quick checks</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {lesson.check.quiz.map((que, qi) => {
                  const chosen = quizAnswers[qi];
                  return (
                    <div key={qi} style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "16px 18px" }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, marginBottom: 12 }}>{que.q}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {que.options.map((opt, oi) => {
                          const answered = chosen !== null;
                          const isChosen = chosen === oi;
                          const isCorrect = oi === que.answer;
                          let border: string = T.edgeSoft, bg: string = T.panelSoft, fg: string = T.ink;
                          if (answered && isCorrect) { border = T.green; bg = T.greenSoft; fg = T.ink; }
                          else if (answered && isChosen && !isCorrect) { border = T.red; bg = T.redSoft; fg = T.ink; }
                          else if (answered) { fg = T.muted; }
                          return (
                            <button key={oi} className="quiz-opt" onClick={() => { if (chosen === null) setQuizAnswers((a) => a.map((v, i) => i === qi ? oi : v)); }}
                              disabled={answered}
                              style={{ textAlign: "left", fontFamily: T.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.45, color: fg, background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: "12px 15px", cursor: answered ? "default" : "pointer" }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {chosen !== null && (
                        <div style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 1.55 }}>{que.why}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 26, alignItems: "center" }}>
                {btn("Finish the lesson", () => setPhase("done"), { disabled: !quizDone })}
                {!quizDone && <span style={{ fontSize: 13, color: T.muted }}>answer the checks to finish</span>}
              </div>
            </main>
          )}

          {/* DONE */}
          {phase === "done" && (
            <main style={{ marginTop: 34 }}>
              <div style={{ background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 12, padding: "16px 20px", marginBottom: 22 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.18em", color: T.green, fontWeight: 600 }}>{embedded ? `TOPIC ${(topicIndex as number) + 1} OF ${topicCount} COMPLETE` : "LESSON COMPLETE"}</span>
                <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink, marginTop: 6 }}>{lesson.wrap.headline ?? "Lesson complete. Well done."}</div>
              </div>

              <h3 style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, margin: "0 0 12px", color: T.ink }}>What you learned</h3>
              <ul style={{ margin: "0 0 24px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {lesson.wrap.takeaways.map((t, i) => <li key={i} style={{ fontSize: 15.5, color: T.body, lineHeight: 1.6 }}>{t}</li>)}
              </ul>

              <div style={{ background: T.panel, border: `1px solid ${T.primary}44`, borderRadius: 12, padding: "18px 20px", marginBottom: 18 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.primary, marginBottom: 8 }}>Your first real project</div>
                <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{lesson.wrap.project.name}</div>
                <p style={{ fontSize: 15, color: T.body, lineHeight: 1.65 }}>{lesson.wrap.project.blurb}</p>
              </div>

              {lesson.wrap.ethicsNote && (
                <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.amber, marginBottom: 8 }}>Ground rule, from day one</div>
                  <p style={{ fontSize: 14.5, color: T.body, lineHeight: 1.65 }}>{lesson.wrap.ethicsNote}</p>
                </div>
              )}

              <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {embedded ? (
                  <>
                    {btn((topicIndex as number) + 1 >= (topicCount as number) ? "Finish the week" : "Next topic", () => onComplete?.())}
                    {btn("Week overview", () => onExit?.(), { ghost: true })}
                  </>
                ) : (
                  <>
                    <a href="/pro" style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, letterSpacing: "0.03em", padding: "12px 24px", borderRadius: 10, color: "#fff", textDecoration: "none", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})` }}>Back to the course</a>
                    {btn("Review the lesson", () => { setPhase("intro"); setLearnIdx(0); }, { ghost: true })}
                  </>
                )}
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
