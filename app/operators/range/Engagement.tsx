"use client";

/* Engagement - the reusable module shell (the locked template).
 *
 * A module here is a PROPER LESSON, not a CTF with a story. The anatomy:
 *   brief -> LESSON (teach: concept -> how it works -> worked example ->
 *   comprehension check) -> authorize -> recon+act (apply it -> capture) ->
 *   DEFEND (teach the fix -> real-world -> check) -> report (finding + reward).
 *
 * The capture is where you APPLY what was taught, not a substitute for
 * learning. Each module supplies its teaching content + target as a ModuleDef;
 * the only bespoke code is the Act surface. */

import { useState, useEffect, useRef, type ReactNode } from "react";
import ModuleBackdrop from "./ModuleBackdrop";

export type LessonBlock = { h: string; body: string };
export type ExampleLine = { t: string; leak?: boolean };
export type Check = {
  q: string;
  options: { text: string; correct?: boolean; feedback: string }[];
};
/** A technical term the learner can hover (desktop) or tap (mobile) to see a
 *  plain, friendly definition. Auto-wrapped into lesson/defend text. */
export type GlossaryEntry = { term: string; definition: string; example?: string };

// A learner-facing unit is a "Module" (Module 01…16). The in-fiction activity
// you run inside one is still "the engagement". The persistence layer keys off
// `moduleNo`, which maps to the shared Progress.week column at the DB boundary.
/** Generic, topic-fitting glyphs for the engine/tool showcase (no copied logos).
 *  Pick the one that fits the module's field; see spec §1a. */
export type EngineIcon = "db" | "browser" | "tool" | "scan" | "key" | "lock" | "server" | "shield" | "doc" | "mail";
export type ModuleDef = {
  code: string;
  /** Numeric module (1-16) - the key for Progress + the portfolio finding. */
  moduleNo: number;
  title: string;
  client: string;
  brief: string;
  /** Optional industry intro - the standard opener that tells the learner what
   *  they'll learn, why it matters in the real world, what the industry looks like
   *  now, and where it's heading. Shown as the first "Industry" beat. Content must
   *  be real and current (sourced), tied to the AI-forward positioning. */
  industry?: {
    tag: string;
    learn: string[];
    realWorld: string;
    now: { stat: string; body: string; statLabel?: string };
    ahead: string;
    role: string;
    /** Attacker-framed strings default for the red-team modules; defender/foundational
     *  modules (forensics, IR, disclosure, recon) override them so the copy fits. */
    readLine?: string;      // eyebrow, default "a 2 minute read before you break in"
    enginesTitle?: string;  // engine section, default "The engines you'll be breaking (safely)"
    whyPunch?: string;      // punch line under "why it matters", default "Cheap to fix. Devastating to miss."
    /** Editorial extras for the flagship intro (owner: make it vibrant, a magazine
     *  feature, not a card stack): the database engines as a colourful showcase, a
     *  real past breach as a newspaper clipping, a recent at-scale case, careers. */
    /** Groundwork for a total beginner (owner: never throw them in cold): plain
     *  "what this even is" + a real worked example, shown near the top of the intro. */
    primer?: { term: string; what: string; example: string; returns: string };
    roles?: string[];
    engines?: { name: string; color: string; blurb: string; here?: boolean; icon?: EngineIcon }[];
    headline?: { masthead: string; dateline: string; title: string; body: string; stat: string; statLabel: string; why?: string };
    recent?: { year: string; title: string; body: string };
    /** The one-line "signature move" shown in the hero: a grey code frame with the
     *  payload highlighted and a red consequence. Per module (SQL for M5, an XSS
     *  payload for M6, etc.); the box is hidden if absent. */
    motif?: { pre?: string; hit: string; post?: string; note: string };
  };
  lesson: {
    blocks: LessonBlock[];
    example?: { caption: string; lines: ExampleLine[] };
    /** Optional hands-on teaching widget (the "depth standard"). When present,
     *  the learner must finish it AND pass the check before signing the scope.
     *  Modules without it are unchanged. */
    Interactive?: React.ComponentType<{ onDone: () => void }>;
    /** Optional end-of-lesson recap bullets, shown as a "Recap" callout. */
    summary?: string[];
    check: Check;
  };
  /** Optional glossary: technical terms get a hover/tap definition, auto-wrapped
   *  into lesson + defend text (first occurrence of each term). A teaching
   *  standard - anything a 14-17 learner wouldn't just know gets explained. */
  glossary?: GlossaryEntry[];
  /** Optional consolidation drills (scenario-based practice applying the skill
   *  to new clients). When present, a "Drills" beat runs after the capture. */
  Consolidation?: React.ComponentType<{ onDone: () => void }>;
  /** Optional capstone: a longer, unguided end-to-end challenge. When present,
   *  a "Challenge" beat runs after the drills (or after the capture). */
  Capstone?: React.ComponentType<{ onDone: () => void }>;
  scope: { target: string; inScope: string; offLimits: string; timebox: string };
  handler: string;
  hint: string;
  /** Optional capture plan - the staged objectives, shown as a visual "mission
   *  map" the learner can open from the handler (a different way in for people
   *  who don't learn from a wall of text). */
  plan?: { label: string; goal: string }[];
  Act: React.ComponentType<{ onCapture: () => void }>;
  flag: string;
  defend: {
    blocks: LessonBlock[];
    /** Optional "apply the fix" widget. When present, the learner must finish
     *  it AND pass the check before filing the report. */
    Interactive?: React.ComponentType<{ onDone: () => void }>;
    check: Check;
  };
  finding: { title: string; where: string; severity: string; cvss: string; impact: string; fix: string };
  /** One line to hold onto. Shown as a bold "take this away" strip at the very
   *  top of the debrief - the single thing to remember once the dense reading is
   *  done, for consolidation and reinforcement. */
  takeaway?: string;
  /** What the learner can now do, shown as a "Module outcome" block on the report
   *  screen. 2-4 concrete "you can now..." capabilities. */
  outcome?: string[];
  /** Optional per-module cheat sheet: a beginner-friendly quick reference the
   *  learner can open full-screen from a side tab at any time, applicable to this
   *  module (e.g. the SQL statements and what each does). Plain enough for a
   *  non-technical reader; the module itself stays more technical. */
  cheatsheet?: {
    title: string;
    blurb: string;
    /** A sample data table the examples read from, so every command has something
     *  concrete to point at (the standard: show the data, then reference it). */
    sample?: { caption: string; cols: string[]; rows: string[][] };
    groups: { heading: string; entries: { code: string; what: string; example?: string }[] }[];
  };
  rep: number;
  repRank: string;
  repTo: string;
  next: string;
};

// Palette tuned for lower eye strain: background lifted off pure-black to a
// muted slate (less halation), brightest text eased down from near-white, and
// accents kept slightly softer. Still clearly the dark Cyber Ops range.
export const C = {
  carbon: "#16181f", panel: "#1d212c", raise: "#272c3a",
  line: "rgba(139,123,255,0.20)", lineSoft: "rgba(166,178,214,0.12)",
  ink: "#dce2ee", soft: "#a8b2cc", mute: "#79839f",
  indigo: "#8b7bff", indigo2: "#b3a8ff", green: "#55d98c", red: "#f26d72", amber: "#e8a33d", cyan: "#5fe6ff",
};
// Fonts flow from the --font-* CSS variables the /operators layout sets via
// next/font (Chakra Petch + IBM Plex); the literal names + system stack are the
// fallback for the /dev harness routes, which don't set the variables.
export const DISP = "var(--font-chakra),'Chakra Petch','Segoe UI',system-ui,sans-serif";
export const MONO = "var(--font-plex-mono),'IBM Plex Mono',ui-monospace,'JetBrains Mono',Menlo,Consolas,monospace";
export const SANS = "var(--font-plex-sans),'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif";

/* ───────── glossary: hover/tap-to-explain technical terms ─────────
 * Modelled on Cyber Pro's, dialled up for the younger audience: a glowing
 * dotted term with a ✦ spark, and a popover that pops in. Teaching standard. */
export function GlossaryTerm({ term, definition, example }: { term: string; definition: string; example?: string }) {
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  // Open the popover on the side with room: above by default, but flip BELOW
  // the term when it sits near the top of the viewport, otherwise the
  // definition is clipped off the top of the screen.
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    setBelow(!!r && r.top < 240);
    setOpen(true);
  };
  // Tap support (tablets): no mouse-leave on touch, so an outside pointer-down
  // closes the popover. Tapping the term itself toggles it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        onMouseEnter={show} onMouseLeave={() => setOpen(false)}
        onFocus={show} onBlur={() => setOpen(false)}
        aria-expanded={open}
        style={{ font: "inherit", color: C.indigo2, fontWeight: 600, background: "transparent", border: "none", padding: 0, cursor: "help", borderBottom: `1.5px dotted ${C.indigo}`, textShadow: open ? `0 0 10px ${C.indigo}` : "none", transition: "text-shadow .15s" }}
      >
        {term}<span aria-hidden style={{ fontSize: ".7em", color: C.indigo2, verticalAlign: "super", marginLeft: 1 }}>✦</span>
      </button>
      {open && (
        <span role="tooltip" className="co-anim co-pop" style={{ position: "absolute", left: 0, ...(below ? { top: "calc(100% + 11px)" } : { bottom: "calc(100% + 11px)" }), zIndex: 40, width: 304, maxWidth: "86vw", background: "linear-gradient(180deg, #1b1733, #130f20)", border: `1px solid ${C.indigo}`, borderRadius: 13, padding: "13px 15px 14px", boxShadow: `0 20px 46px rgba(0,0,0,.72), 0 0 26px -6px ${C.indigo}`, fontFamily: SANS, fontSize: 13.5, fontWeight: 400, lineHeight: 1.55, color: C.ink, whiteSpace: "normal", letterSpacing: "normal", textTransform: "none" }}>
          <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: ".09em", color: C.indigo2, marginBottom: 6 }}>✦ {term.toUpperCase()}</span>
          <span style={{ display: "block", color: C.soft }}>{definition}</span>
          {example && (
            <span style={{ display: "block", marginTop: 11, paddingTop: 10, borderTop: `1px solid ${C.indigo}3a` }}>
              <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: ".1em", color: C.cyan, marginBottom: 4 }}>◆ IN THE REAL WORLD</span>
              <span style={{ display: "block", color: C.soft, fontSize: 13 }}>{example}</span>
            </span>
          )}
          <span aria-hidden style={{ position: "absolute", left: 20, ...(below ? { top: -6, borderLeft: `1px solid ${C.indigo}`, borderTop: `1px solid ${C.indigo}` } : { bottom: -6, borderRight: `1px solid ${C.indigo}`, borderBottom: `1px solid ${C.indigo}` }), width: 11, height: 11, background: "#130f20", transform: "rotate(45deg)" }} />
        </span>
      )}
    </span>
  );
}

function escapeRegExp(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/** Fisher-Yates shuffle (returns a new array). Shared so every option list can
 *  randomise its order and the correct answer is never pinned to a fixed slot. */
export function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** Wrap the first unseen occurrence of each glossary term in `text`. `seen`
 *  is shared across a block so a term lights up once, not on every mention. */
export function withGlossary(text: string, glossary: GlossaryEntry[] | undefined, seen: Set<string>, keyPrefix: string): ReactNode {
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
    out.push(<GlossaryTerm key={`${keyPrefix}-${m.index}`} term={matched} definition={entry.definition} example={entry.example} />);
    last = m.index + matched.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : text;
}

type Phase = "intro" | "brief" | "lesson" | "authorize" | "act" | "drills" | "challenge" | "defend" | "report";
const BASE_BEATS: { id: Phase; label: string }[] = [
  { id: "intro", label: "Industry" },
  { id: "brief", label: "Brief" }, { id: "lesson", label: "Lesson" }, { id: "authorize", label: "Scope" },
  { id: "act", label: "Capture" }, { id: "drills", label: "Drills" }, { id: "challenge", label: "Challenge" }, { id: "defend", label: "Defend" }, { id: "report", label: "Report" },
];

// Save/resume mid-module (UAT): the beats a learner can be dropped back into on a
// refresh or a return visit. The two start beats (intro/brief) aren't worth
// resuming to, and "report" means the module is finished, so none of those persist.
// Account-wide: the live shell persists/hydrates the beat server-side (see
// opsPortfolio.actions + LiveEngagement), so a module reopens where you left off
// on any device. The pure shell here just takes initialPhase/onPhaseChange props;
// the preview/dev routes pass neither and get no resume.
const RESUMABLE: Phase[] = ["lesson", "authorize", "act", "drills", "challenge", "defend"];
function validResume(phase: string | undefined | null, mod: ModuleDef): Phase | null {
  if (!phase || !RESUMABLE.includes(phase as Phase)) return null;
  if (phase === "drills" && !mod.Consolidation) return null;
  if (phase === "challenge" && !mod.Capstone) return null;
  return phase as Phase;
}

// Each curriculum phase is a distinct "console world" (owner: make each module
// feel like a different level). The world sets the header identity + the accent
// that flows through the beat bar, eyebrows, handler and primary buttons (via
// the --world CSS var), so a Recon module and a Defence module read as different
// consoles - while the lesson content and the per-module backdrop stay as they are.
type World = { bar: string; accent: string; soft: string };
const WORLDS: Record<string, World> = {
  foundations: { bar: "Case File", accent: "#8B7BFF", soft: "rgba(139,123,255,0.07)" },
  web: { bar: "root@range", accent: "#55D98C", soft: "rgba(85,217,140,0.07)" },
  data: { bar: "Analysis Bench", accent: "#5FE6FF", soft: "rgba(95,230,255,0.07)" },
  roleflip: { bar: "SOC · Live", accent: "#FF7BD5", soft: "rgba(255,123,213,0.08)" },
  capstone: { bar: "Mission Control", accent: "#E8A33D", soft: "rgba(232,163,61,0.08)" },
  aifrontier: { bar: "AI Frontier", accent: "#B15BFF", soft: "rgba(177,91,255,0.08)" },
};
function worldOf(n: number): World {
  return WORLDS[n <= 3 ? "foundations" : n <= 7 ? "web" : n <= 11 ? "data" : n <= 14 ? "roleflip" : n <= 16 ? "capstone" : "aifrontier"];
}

export default function Engagement({
  mod,
  onReport,
  onExit,
  liveRank,
  initialPhase,
  initialCallsign,
  onPhaseChange,
}: {
  mod: ModuleDef;
  /** Fired once when the learner reaches the report beat - the completion
   *  signal the live lesson uses to persist progress + file the finding.
   *  Omitted by the preview/dev routes, which don't persist. */
  onReport?: (callsign: string) => void;
  /** Where the post-report "next" button goes. Live flow routes to the
   *  portfolio; previews leave it as a label. */
  onExit?: () => void;
  /** The learner's REAL rank/standing after saving, from the server. When
   *  present it overrides the module's designed rank text so the celebration
   *  matches the portfolio. Previews pass nothing and show the designed text. */
  liveRank?: { rank: string; label: string; fraction: number } | null;
  /** Account-wide resume: the beat the learner was last on (hydrated from the
   *  server by the live shell), and a callback fired on every beat change so the
   *  shell can persist it. Preview/dev routes omit both and get no resume. */
  initialPhase?: string;
  initialCallsign?: string;
  onPhaseChange?: (phase: Phase, callsign: string) => void;
}) {
  const defaultPhase: Phase = mod.industry ? "intro" : "brief";
  // Resume where the learner left off. The live shell hydrates initialPhase from
  // the server and persists each beat change via onPhaseChange, so a module reopens
  // on the right section on ANY device. Preview/dev routes pass neither.
  const resumeTo = validResume(initialPhase, mod);
  const [phase, setPhase] = useState<Phase>(resumeTo ?? defaultPhase);
  const [resumed, setResumed] = useState<boolean>(resumeTo !== null);
  const [callsign, setCallsign] = useState(initialCallsign || "NIGHTJAR");
  // Persist each beat change (and the current callsign) via the shell. Refs keep
  // the effect firing only on a real beat change, not on every callsign keystroke.
  const onPhaseChangeRef = useRef(onPhaseChange);
  onPhaseChangeRef.current = onPhaseChange;
  const callsignRef = useRef(callsign);
  callsignRef.current = callsign;
  useEffect(() => {
    onPhaseChangeRef.current?.(phase, callsignRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps
  function startOver() {
    setResumed(false);
    setPhase(defaultPhase); // the beat-change effect clears the saved row server-side
  }
  const [cheatOpen, setCheatOpen] = useState(false);
  useEffect(() => {
    if (!cheatOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCheatOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cheatOpen]);
  const [lessonOk, setLessonOk] = useState(false);
  const [defendOk, setDefendOk] = useState(false);
  const [lessonLabOk, setLessonLabOk] = useState(false);
  const [defendLabOk, setDefendLabOk] = useState(false);
  const lessonReady = lessonOk && (!mod.lesson.Interactive || lessonLabOk);
  const defendReady = defendOk && (!mod.defend.Interactive || defendLabOk);
  const [hint, setHint] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const BEATS = BASE_BEATS.filter((b) => (b.id !== "intro" || !!mod.industry) && (b.id !== "drills" || !!mod.Consolidation) && (b.id !== "challenge" || !!mod.Capstone));
  const idx = BEATS.findIndex((b) => b.id === phase);
  const world = worldOf(mod.moduleNo);
  const soc = mod.moduleNo >= 12 && mod.moduleNo <= 14;
  // Themed brief + scope cards, brighter body text, and a "view as map" plan in the
  // handler. Rolled to every module (proven on M5).
  const bodyBright = "#D9E0EE";

  const afterDrills: Phase = mod.Capstone ? "challenge" : "defend";
  function afterCapture() {
    setPhase(mod.Consolidation ? "drills" : afterDrills);
  }
  function goToReport() {
    onReport?.(callsign);
    setPhase("report");
  }
  function skipBeat() {
    // Jump to the next section. Deliberately does NOT call onReport, so a skipped
    // run never files a finding - skipping is for moving fast, not completing.
    if (idx >= 0 && idx < BEATS.length - 1) setPhase(BEATS[idx + 1].id);
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "44px 20px 100px", ["--world" as string]: world.accent, ["--world-soft" as string]: world.soft }}>
      <ModuleBackdrop theme={mod.moduleNo} />
      <style>{styles}</style>
      {/* tester fast-forward: on the live module platform during the testing
          phase, so a tester can jump section to section. (Gate or remove before
          public launch; skipping never files a finding, so it can't fake a pass.) */}
      {!!onReport && idx >= 0 && idx < BEATS.length - 1 && (
        <button onClick={skipBeat} title="Tester tool: jump to the next section without completing this one" style={{ position: "fixed", left: 14, bottom: 14, zIndex: 70, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: `1px dashed ${C.amber}`, background: "rgba(13,15,22,0.94)", color: C.amber, fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: ".06em", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}>
          <span aria-hidden>skip ▸</span>
          <span style={{ fontSize: 10, color: C.mute, fontWeight: 600, letterSpacing: ".04em" }}>to {BEATS[idx + 1].label} · test</span>
        </button>
      )}
      {/* cheat sheet: a side tab, open any time, into a full-screen beginner-friendly reference */}
      {mod.cheatsheet && (
        <button onClick={() => setCheatOpen(true)} className="co-btn" style={{ position: "fixed", right: 0, top: "42%", transform: "translateY(-50%)", zIndex: 60, display: "flex", alignItems: "center", gap: 8, writingMode: "vertical-rl", padding: "16px 9px", borderRadius: "10px 0 0 10px", border: `1px solid ${world.accent}`, borderRight: "none", background: "rgba(13,15,22,0.92)", color: world.accent, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", boxShadow: `0 0 22px -6px ${world.accent}` }}>
          <span aria-hidden style={{ writingMode: "horizontal-tb" }}>▦</span>Cheat sheet
        </button>
      )}
      {mod.cheatsheet && cheatOpen && <CheatSheet cs={mod.cheatsheet} world={world} moduleNo={mod.moduleNo} onClose={() => setCheatOpen(false)} />}
      <div style={{ width: "100%", maxWidth: 720, position: "relative", zIndex: 1 }}>
        {soc ? (
          // SOC watch-floor: a live status strip, so the defence modules read as a blue-team console room.
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8, padding: "8px 13px", border: `1px solid ${world.accent}44`, borderRadius: 9, background: world.soft, fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: world.accent, boxShadow: `0 0 8px ${world.accent}`, animation: "cn-led 1.6s infinite", display: "inline-block" }} />
              <span style={{ color: world.accent }}>SOC Watch-Floor</span>
              <span style={{ color: C.mute }}>· M{String(mod.moduleNo).padStart(2, "0")} · <span style={{ color: C.soft }}>{mod.title}</span></span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 10, color: C.mute }}>
              <span style={{ color: world.accent, display: "flex", alignItems: "center", gap: 6 }}><span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: world.accent, animation: "cn-led 1.6s infinite", display: "inline-block" }} />Monitoring</span>
              <span>· {callsign || "-"}</span>
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: world.accent }}>{world.bar}</span>
              <span style={{ color: C.mute }}>· M{String(mod.moduleNo).padStart(2, "0")} · <span style={{ color: C.soft }}>{mod.title}</span></span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>operator <span style={{ color: world.accent }}>{callsign || "-"}</span></div>
          </div>
        )}
        <div style={{ display: "flex", gap: 6, marginBottom: resumed && phase !== "report" ? 12 : 22 }}>
          {BEATS.map((b, i) => (
            <div key={b.id} title={b.label} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= idx ? world.accent : "rgba(255,255,255,.08)", boxShadow: i === idx ? `0 0 8px ${world.accent}` : "none", transition: "background .3s" }} />
          ))}
        </div>
        {resumed && phase !== "report" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "8px 12px", borderRadius: 9, border: `1px solid ${world.accent}`, background: world.soft, fontFamily: MONO, fontSize: 12, color: C.soft }}>
            <span>↻ Resumed where you left off · <span style={{ color: world.accent }}>{BEATS[idx]?.label ?? ""}</span></span>
            <button onClick={startOver} style={{ background: "none", border: "none", color: world.accent, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>start over</button>
          </div>
        )}

        {/* INDUSTRY INTRO */}
        {phase === "intro" && mod.industry && (
          <IntroPage mod={mod} world={world} onContinue={() => setPhase("brief")} />
        )}

        {/* BRIEF */}
        {phase === "brief" && (
          <BriefCard mod={mod} world={world} onStart={() => setPhase("lesson")} />
        )}

        {/* LESSON */}
        {phase === "lesson" && (
          <div style={{ display: "grid", gap: 14 }}>
            <Eyebrow>◆ Lesson · learn the ground</Eyebrow>
            {mod.lesson.blocks.map((b, i) => <LessonBlock key={i} h={b.h} body={b.body} i={i} glossary={mod.glossary} keyPrefix={`lb${i}`} bodyColor={bodyBright} accent={world.accent} />)}
            {mod.lesson.example && (
              <div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.mute, marginBottom: 8 }}>Worked example</div>
                <pre style={preBox}>
                  {mod.lesson.example.lines.map((ln, i) => (
                    <span key={i} style={ln.leak ? { display: "block", color: C.amber, background: "rgba(232,163,61,.10)", borderRadius: 4, padding: "1px 4px" } : { display: "block", color: "#9fb0d8" }}>{ln.t || " "}</span>
                  ))}
                </pre>
                <p style={{ color: C.soft, fontSize: 13, lineHeight: 1.55, marginTop: 8 }}>{mod.lesson.example.caption}</p>
              </div>
            )}
            {mod.lesson.Interactive && (
              <div style={{ borderRadius: 14, padding: 6, background: "rgba(139,123,255,0.05)", border: `1.5px dashed ${C.indigo}`, boxShadow: `0 0 30px -16px ${C.indigo}` }}>
                <mod.lesson.Interactive onDone={() => setLessonLabOk(true)} />
              </div>
            )}
            {mod.lesson.summary && mod.lesson.summary.length > 0 && (
              <div style={{ padding: "15px 17px", borderRadius: 14, background: "rgba(95,230,255,0.06)", border: "1px solid rgba(95,230,255,0.38)", borderLeft: "3px solid #5FE6FF" }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.cyan, fontWeight: 700, marginBottom: 9 }}>✦ Recap</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 7 }}>
                  {mod.lesson.summary.map((s, i) => <li key={i} style={{ color: bodyBright, fontSize: 13.5, lineHeight: 1.5, display: "flex", gap: 9 }}><span aria-hidden style={{ color: C.cyan }}>✦</span><span>{s}</span></li>)}
                </ul>
              </div>
            )}
            <CheckBox check={mod.lesson.check} onPass={() => setLessonOk(true)} />
            <div style={{ marginTop: 6 }}>
              <Btn tone="i" disabled={!lessonReady} onClick={() => setPhase("authorize")}>Sign the scope →</Btn>
            </div>
          </div>
        )}

        {/* AUTHORIZE */}
        {phase === "authorize" && (
          <ScopeCard mod={mod} world={world} callsign={callsign} setCallsign={setCallsign} onAuthorize={() => setPhase("act")} />
        )}

        {/* ACT */}
        {phase === "act" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={handlerBox}>
              <span style={handlerTag}>HANDLER</span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: bodyBright }}>{mod.handler}</span>
            </div>
            {mod.plan && mod.plan.length > 0 && (
              <StuckHelp accent={world.accent} open={mapOpen} onToggle={() => setMapOpen((o) => !o)} plan={mod.plan} bodyColor={bodyBright} />
            )}
            <mod.Act onCapture={afterCapture} />
            <div>
              <button onClick={() => setHint(!hint)} className="co-btn" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(139,123,255,0.12)", border: `1px solid ${C.indigo2}`, color: C.indigo2, fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: ".02em", cursor: "pointer", padding: "8px 14px", borderRadius: 8 }}>{hint ? "Hide hint" : "Need a hint?"}</button>
              {hint && <div style={{ marginTop: 8, padding: "12px 14px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13.5, color: bodyBright, lineHeight: 1.55 }}>{mod.hint}</div>}
            </div>
          </div>
        )}

        {/* DRILLS (consolidation - apply the skill to new client scenarios) */}
        {phase === "drills" && mod.Consolidation && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={handlerBox}>
              <span style={handlerTag}>HANDLER</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>Good capture. Before we write it up, a few field jobs - new clients, same skill, less hand-holding. This is how it sticks.</span>
            </div>
            <mod.Consolidation onDone={() => setPhase(afterDrills)} />
          </div>
        )}

        {/* CHALLENGE (capstone - a longer unguided end-to-end engagement) */}
        {phase === "challenge" && mod.Capstone && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={handlerBox}>
              <span style={handlerTag}>HANDLER</span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>Last one, and it's the real test. A full engagement, start to finish, no stage-by-stage hand-holding. Everything you've learned, chained together. Take your time.</span>
            </div>
            <mod.Capstone onDone={() => setPhase("defend")} />
          </div>
        )}

        {/* DEFEND (opens with the capture celebration, then teaches the fix) */}
        {phase === "defend" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div className="co-anim co-pop" style={{ textAlign: "center", padding: "30px 20px 26px", background: "radial-gradient(120% 140% at 50% 0%, rgba(74,222,128,0.12), transparent 60%)", border: "1px solid rgba(74,222,128,0.35)", borderRadius: 18 }}>
              <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".34em", textTransform: "uppercase", color: C.green, fontWeight: 700 }}>Flag captured</div>
              <div className="co-anim co-glow" style={{ fontFamily: DISP, fontSize: "clamp(22px,5vw,34px)", fontWeight: 700, margin: "10px 0 6px" }}>Case cracked</div>
              <div style={{ fontFamily: MONO, fontSize: 14.5, color: C.green, background: "rgba(74,222,128,0.08)", display: "inline-block", padding: "7px 15px", borderRadius: 8, border: "1px solid rgba(74,222,128,0.3)" }}>{mod.flag}</div>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {mod.takeaway && <TakeawayStrip text={mod.takeaway} />}
              <Eyebrow>◆ Debrief · now defend it</Eyebrow>
              {mod.defend.blocks.map((b, i) => <LessonBlock key={i} h={b.h} body={b.body} i={i} glossary={mod.glossary} keyPrefix={`db${i}`} bodyColor={bodyBright} accent={world.accent} />)}
              {mod.defend.Interactive && (
                <div style={{ borderRadius: 14, padding: 6, background: "rgba(139,123,255,0.05)", border: `1.5px dashed ${C.indigo}`, boxShadow: `0 0 30px -16px ${C.indigo}` }}>
                  <mod.defend.Interactive onDone={() => setDefendLabOk(true)} />
                </div>
              )}
              <CheckBox check={mod.defend.check} onPass={() => setDefendOk(true)} />
              <div style={{ marginTop: 6 }}>
                <Btn tone="i" disabled={!defendReady} onClick={goToReport}>File your report →</Btn>
              </div>
            </div>
          </div>
        )}

        {/* REPORT / reward */}
        {phase === "report" && <Report mod={mod} callsign={callsign} onExit={onExit} liveRank={liveRank} />}
      </div>
    </div>
  );
}

/* ---------- comprehension check ----------
 * Options are SHUFFLED once on mount, so the correct answer is never in a
 * predictable position (no "always pick the middle one" tell). Selection is
 * tracked by the option object, not its index, so shuffling is safe. */
function CheckBox({ check, onPass }: { check: Check; onPass: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [opts] = useState(() => {
    const a = check.options.map((o, i) => ({ ...o, _i: i }));
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  });
  return (
    <div style={{ marginTop: 8, padding: "16px 18px", borderRadius: 14, border: `1px solid ${done ? C.green : C.indigo}66`, background: "rgba(139,123,255,0.06)", boxShadow: `0 0 26px -16px ${done ? C.green : C.indigo}` }}>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", fontWeight: 700, color: "#0a0a12", background: done ? C.green : C.indigo2, borderRadius: 6, padding: "3px 9px" }}>{done ? "✓ CHECK" : "CHECK"}</span>
        <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15.5, color: "#fff" }}>{check.q}</span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isPicked = picked === i;
          const border = isPicked ? (o.correct ? C.green : C.red) : C.line;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.correct) { setDone(true); onPass(); } }} className="co-opt"
                style={{ width: "100%", textAlign: "left", padding: "11px 13px", borderRadius: 9, border: `1px solid ${border}`, background: isPicked ? (o.correct ? "rgba(74,222,128,.08)" : "rgba(255,91,98,.06)") : C.carbon, color: C.ink, fontFamily: SANS, fontSize: 14, cursor: done ? "default" : "pointer" }} disabled={done}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: isPicked ? (o.correct ? C.green : C.red) : C.mute, marginRight: 9 }}>{isPicked ? (o.correct ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>
                {o.text}
              </button>
              {isPicked && <div style={{ padding: "8px 13px 2px", fontSize: 13, color: o.correct ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{o.feedback}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- report / reward ---------- */
function Report({ mod, callsign, onExit, liveRank }: { mod: ModuleDef; callsign: string; onExit?: () => void; liveRank?: { rank: string; label: string; fraction: number } | null }) {
  const [share, setShare] = useState(false);
  const f = mod.finding;
  const rankName = liveRank?.rank ?? mod.repRank;
  const rankLabel = liveRank?.label ?? mod.repTo;
  const barWidth = liveRank ? `${Math.round(liveRank.fraction * 100)}%` : undefined;

  function shareCapture() {
    const text = `🎯 ${callsign} cleared Cyber Ops Module ${String(mod.moduleNo).padStart(2, "0")}: ${mod.title}\nFinding: ${f.title} (${f.severity} · CVSS ${f.cvss})\n+${mod.rep} rep · ${mod.flag}\nReal, ethical hacking at AlgorithmX.`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    } catch {
      /* clipboard blocked (permissions/insecure context) - the label still confirms the action */
    }
    setShare(true);
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: C.amber }}>+{mod.rep} REP</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: C.mute, marginBottom: 6 }}>
            <span style={{ color: C.indigo2 }}>{rankName}</span><span>{rankLabel}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div className={liveRank ? "" : "co-anim co-bar"} style={{ height: "100%", width: barWidth, borderRadius: 999, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, boxShadow: `0 0 12px ${C.amber}`, transition: "width .8s cubic-bezier(.34,1.4,.5,1)" }} />
          </div>
        </div>
      </Panel>
      <Panel>
        <Eyebrow>◆ Finding filed · added to your portfolio</Eyebrow>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17 }}>{f.title}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.red, border: `1px solid ${C.red}55`, padding: "2px 8px", borderRadius: 6 }}>{f.severity} · CVSS {f.cvss}</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.mute, marginTop: 6 }}>{f.where}</div>
        <p style={{ fontSize: 14, color: C.soft, marginTop: 10, lineHeight: 1.55 }}><b style={{ color: C.ink }}>Impact.</b> {f.impact}</p>
        <p style={{ fontSize: 14, color: C.soft, marginTop: 6, lineHeight: 1.55 }}><b style={{ color: C.ink }}>Fix.</b> {f.fix}</p>
      </Panel>
      {mod.outcome && mod.outcome.length > 0 && (
        <div style={{ padding: "18px 18px 16px", borderRadius: 16, background: "rgba(85,217,140,0.05)", border: `1px solid ${C.green}3a` }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: C.green, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 16, height: 2, background: C.green, borderRadius: 2 }} />Module outcome · what you can now do
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 13 }}>
            {mod.outcome.map((o, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "11px 14px", borderRadius: 11, background: "rgba(13,15,22,0.5)", border: `1px solid ${C.green}2e` }}>
                <span aria-hidden style={{ color: C.green, fontFamily: MONO, fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>✓</span>
                <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ position: "relative", padding: 22, borderRadius: 16, overflow: "hidden", background: "linear-gradient(150deg, #14122e, #0d1030 55%, #0a0b16)", border: `1px solid ${C.line}`, boxShadow: `0 0 46px -18px ${C.indigo}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: C.indigo2, fontWeight: 600 }}>Capture card</div>
          <div style={{ fontFamily: DISP, fontSize: 12, fontWeight: 700, color: C.indigo2, letterSpacing: ".08em" }}>CYBER OPS</div>
        </div>
        <div style={{ fontFamily: DISP, fontSize: 30, fontWeight: 700, margin: "14px 0 2px", letterSpacing: ".04em" }}>{callsign}</div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft }}>cleared <span style={{ color: C.green }}>{mod.title}</span> · module {String(mod.moduleNo).padStart(2, "0")}</div>
        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
          <Stat n="✓" l={`module ${String(mod.moduleNo).padStart(2, "0")}`} /><Stat n={`+${mod.rep}`} l="reputation" /><Stat n={f.cvss} l={`CVSS · ${f.severity.toLowerCase()}`} />
        </div>
        <Btn tone="i" onClick={shareCapture} style={{ marginTop: 20, fontSize: 12.5 }}>{share ? "✓ copied - go flex" : "SHARE CAPTURE →"}</Btn>
      </div>
      <EthicsNote />
      <Btn tone="ghost" onClick={onExit}>{mod.next}</Btn>
    </div>
  );
}

/* ---------- primitives ---------- */
const h2: React.CSSProperties = { fontFamily: DISP, fontSize: 22, margin: 0, fontWeight: 700 };
const scopeTbl: React.CSSProperties = { display: "grid", gap: 1, background: C.lineSoft, border: `1px solid ${C.lineSoft}`, borderRadius: 10, overflow: "hidden", fontFamily: MONO, fontSize: 12.5 };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: C.mute };
const input: React.CSSProperties = { width: "100%", padding: "11px 13px", borderRadius: 9, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 14 };
const preBox: React.CSSProperties = { margin: 0, padding: "14px 16px", background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 10, fontFamily: MONO, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", overflowX: "auto" };
const handlerBox: React.CSSProperties = { display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 16px", background: "var(--world-soft, rgba(139,123,255,0.06))", border: `1px solid ${C.line}`, borderLeft: "3px solid var(--world, #8B7BFF)", borderRadius: 12 };
const handlerTag: React.CSSProperties = { fontFamily: MONO, fontSize: 10.5, color: "var(--world, #8B7BFF)", fontWeight: 700, letterSpacing: ".1em", paddingTop: 2 };

// Lesson/defend blocks keep distinct SHAPES per index (rail / framed / top-line) for
// visual variety, but all in TWO SHADES OF ONE COLOUR - the module's world accent - for
// a clean, grown-up look (owner + Abdullah: a rainbow of colours reads as childish for
// this age group). The lighter shade is mixed from the accent so it works per-world.
const LB_SHAPES: ("rail" | "framed" | "topline")[] = ["rail", "framed", "topline", "rail", "framed"];
// Each block is a collapsible section (owner: "a collapsible tab for each
// subheading"), so a dense screen reads as a tidy stack of headings the learner
// opens at their own pace. The FIRST block opens by default, so there's always
// something to read; the rest expand on click. The per-index treatment
// (rail/framed/topline) is kept - it's now the look of the section header.
function LessonBlock({ h, body, i, glossary, keyPrefix, bodyColor = "#C7CEDD", accent = C.indigo }: { h: string; body: string; i: number; glossary?: GlossaryEntry[]; keyPrefix: string; bodyColor?: string; accent?: string }) {
  const kind = LB_SHAPES[i % LB_SHAPES.length];
  const light = `color-mix(in srgb, ${accent} 52%, #ffffff)`;
  const [open, setOpen] = useState(i === 0);
  // `expanded` is the fully-open state (set once the open animation ends). While
  // collapsed or mid-animation the body is clipped with overflow:hidden for a
  // clean open/close; once fully open we switch to overflow:visible so a glossary
  // hover popover (which pops ABOVE its term) isn't clipped by the block.
  const [expanded, setExpanded] = useState(i === 0);
  const toggle = () => { setExpanded(false); setOpen((o) => !o); };
  const seen = new Set<string>();
  const hc = kind === "framed" ? light : "#ffffff";
  const trigger = (
    <button type="button" onClick={toggle} aria-expanded={open}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", font: "inherit" }}>
      <span style={{ flex: 1, fontFamily: DISP, fontWeight: 700, fontSize: 18.5, color: hc, lineHeight: 1.22, letterSpacing: ".005em" }}>{h}</span>
      <span aria-hidden style={{ flexShrink: 0, width: 25, height: 25, borderRadius: 7, border: `1px solid ${accent}66`, color: accent, display: "grid", placeItems: "center", fontSize: 10, fontFamily: MONO, lineHeight: 1, transform: open ? "rotate(90deg)" : "none", transition: "transform .25s ease" }}>▶</span>
    </button>
  );
  const panel = (
    <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .28s ease" }} onTransitionEnd={() => { if (open) setExpanded(true); }}>
      <div style={{ overflow: expanded ? "visible" : "hidden", minHeight: 0 }}>
        <p style={{ color: bodyColor, fontSize: 14.5, lineHeight: 1.64, margin: "8px 0 0" }}>{withGlossary(body, glossary, seen, keyPrefix)}</p>
      </div>
    </div>
  );
  // All three treatments share the same box sizing + horizontal padding, so the
  // caret toggles line up in one column however the accent styling differs.
  if (kind === "rail") return <div style={{ boxSizing: "border-box", padding: "14px 18px 14px 18px", borderLeft: `3px solid ${accent}` }}>{trigger}{panel}</div>;
  if (kind === "framed") return <div style={{ boxSizing: "border-box", position: "relative", padding: "15px 18px", borderRadius: 14, background: "rgba(18,20,29,0.82)", border: `1px solid ${accent}55`, overflow: expanded ? "visible" : "hidden" }}><span aria-hidden style={{ position: "absolute", top: 0, left: 22, right: 22, height: 2, background: `linear-gradient(90deg,transparent,${light},transparent)` }} />{trigger}{panel}</div>;
  return <div style={{ boxSizing: "border-box", padding: "15px 18px", borderRadius: 14, background: "rgba(18,20,29,0.82)", border: `1px solid ${C.line}`, borderTop: `3px solid ${light}` }}>{trigger}{panel}</div>;
}

// A one-line consolidation takeaway at the top of the debrief: the single thing
// to hold onto once the dense reading is done.
function TakeawayStrip({ text }: { text: string }) {
  return (
    <div style={{ padding: "14px 17px", borderRadius: 14, background: "linear-gradient(90deg, rgba(232,163,61,0.14), rgba(232,163,61,0.03))", border: `1px solid ${C.amber}55`, borderLeft: `3px solid ${C.amber}` }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: C.amber, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
        <span aria-hidden>✦</span>Take this away
      </div>
      <div style={{ fontFamily: DISP, fontSize: 16.5, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{text}</div>
    </div>
  );
}

// A short, consistent legal/ethics reminder at the very end of every module.
// The range is a walled practice world; the same moves against real systems are
// a crime. Kept identical across all 16 so it reads as a familiar closing beat.
const ETHICS_NOTE =
  "You practised this inside a walled training range built for it, on systems that exist only to be broken safely. The same move against a real computer, account or website you do not own is a criminal offence under the Computer Misuse Act 1990. These skills are legal only with the owner's written permission: here you learn to find and fix flaws so you can protect people, never harm them.";
function EthicsNote() {
  return (
    <div style={{ display: "flex", gap: 15, alignItems: "flex-start", padding: "18px 20px", borderRadius: 14, background: "rgba(232,163,61,0.09)", border: `1.5px solid ${C.amber}66`, borderLeft: `4px solid ${C.amber}`, boxShadow: `0 0 26px -14px ${C.amber}` }}>
      <span aria-hidden style={{ fontSize: 26, lineHeight: 1.1, color: C.amber, flexShrink: 0 }}>⚖</span>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: C.amber, fontWeight: 700, marginBottom: 7 }}>For the record · stay legal</div>
        <p style={{ fontSize: 15.5, color: C.ink, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{ETHICS_NOTE}</p>
      </div>
    </div>
  );
}

/* ---------- M5 design prototype (owner retest) ---------- */

// A richer "engagement dossier" brief, keyed off the module's world so it matches
// the backdrop: a terminal case file with a target line, the client as a display
// title, meta chips and better-set brief copy. Replaces the plain Panel on M5.
function BriefCard({ mod, world, onStart }: { mod: ModuleDef; world: World; onStart: () => void }) {
  const target = mod.scope.target.split(/[\s/]+/)[0];
  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "linear-gradient(160deg, rgba(23,26,36,0.97), rgba(15,17,25,0.97))", border: `1px solid ${world.accent}44`, boxShadow: `0 26px 64px -32px #000, 0 0 44px -26px ${world.accent}` }}>
      <div aria-hidden style={{ height: 3, background: `linear-gradient(90deg, transparent, ${world.accent}, transparent)` }} />
      <div style={{ padding: "22px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700 }}>
          <span style={{ color: world.accent, display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: 2, background: world.accent, boxShadow: `0 0 8px ${world.accent}` }} />Engagement brief
          </span>
          <span style={{ color: C.mute }}>M{String(mod.moduleNo).padStart(2, "0")} · {mod.title}</span>
        </div>
        <h2 style={{ fontFamily: DISP, fontSize: "clamp(24px,5.2vw,33px)", fontWeight: 700, margin: "16px 0 0", letterSpacing: ".01em" }}>{mod.client}</h2>
        <div aria-hidden style={{ width: 54, height: 3, borderRadius: 2, background: world.accent, margin: "11px 0 0", boxShadow: `0 0 10px ${world.accent}` }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "17px 0 0" }}>
          <BriefChip k="target" v={target} accent={world.accent} />
          <BriefChip k="vector" v={mod.title} accent={world.accent} />
          {mod.plan && mod.plan.length > 0 && <BriefChip k="plan" v={`${mod.plan.length} stages`} accent={world.accent} />}
        </div>
        <p style={{ color: "#D9E0EE", fontSize: 15.5, lineHeight: 1.72, margin: "18px 0 0" }}>{mod.brief}</p>
        <div aria-hidden style={{ height: 1, background: C.lineSoft, margin: "20px 0 18px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Btn tone="i" onClick={onStart}>Start the briefing →</Btn>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>read the ground, then sign the scope</span>
        </div>
      </div>
    </div>
  );
}
function BriefChip({ k, v, accent }: { k: string; v: string; accent: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 7, padding: "5px 11px", borderRadius: 999, background: `${accent}12`, border: `1px solid ${accent}30`, fontFamily: MONO, fontSize: 11.5 }}>
      <span style={{ color: accent, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 9.5 }}>{k}</span>
      <span style={{ color: C.soft }}>{v}</span>
    </span>
  );
}

// The standard module opener (owner: every module must say what it is, why it
// matters, what the industry looks like now, and where it's heading - we're an
// AI/future-forward platform). Shown as the first "Industry" beat; content from
// mod.industry. Themed to the module world.
function IntroPage({ mod, world, onContinue }: { mod: ModuleDef; world: World; onContinue: () => void }) {
  const ind = mod.industry!;
  const A = world.accent;
  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* HERO - big, vibrant, off the uniform card look */}
      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: `1px solid ${A}55`, background: `radial-gradient(130% 120% at 0% 0%, ${A}26, transparent 55%), radial-gradient(130% 130% at 100% 0%, ${C.cyan}20, transparent 52%), linear-gradient(160deg, rgba(22,25,34,0.9), #0b0d15)`, boxShadow: `0 30px 72px -34px #000, 0 0 62px -30px ${A}` }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.4, backgroundImage: `repeating-linear-gradient(90deg, ${A}12 0 1px, transparent 1px 44px)` }} />
        <div style={{ position: "relative", padding: "26px 26px 28px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700, color: A, display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: A, boxShadow: `0 0 10px ${A}`, animation: "cn-led 1.6s infinite", display: "inline-block" }} />Field feature · Module {String(mod.moduleNo).padStart(2, "0")}
            <span style={{ color: C.mute }}>· {ind.readLine ?? "a 2 minute read before you break in"}</span>
          </div>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(42px,11vw,78px)", fontWeight: 700, margin: "8px 0 0", lineHeight: 1.06, paddingBottom: "0.12em", letterSpacing: "-.01em", background: `linear-gradient(100deg, #ffffff, ${A})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{mod.title}</h1>
          <p style={{ color: "#EAF0FB", fontSize: "clamp(16px,2.6vw,20px)", lineHeight: 1.45, margin: "14px 0 0", fontWeight: 600, maxWidth: 560 }}>{ind.tag}</p>
          {ind.motif && (
            <div style={{ marginTop: 18, fontFamily: MONO, fontSize: "clamp(11px,2.3vw,13.5px)", lineHeight: 1.7, background: "rgba(0,0,0,0.38)", border: `1px solid ${A}33`, borderRadius: 10, padding: "12px 14px", overflowX: "auto", whiteSpace: "nowrap" }}>
              {ind.motif.pre && <span style={{ color: C.mute }}>{ind.motif.pre}</span>}<span style={{ color: A, background: `${A}22`, padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>{ind.motif.hit}</span>{ind.motif.post && <span style={{ color: C.mute }}>{ind.motif.post}</span>}<span style={{ color: C.red, marginLeft: 12 }}>{ind.motif.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* BASICS PRIMER - never throw a beginner in cold: what it is + a real example */}
      {ind.primer && (
        <div style={{ borderRadius: 16, padding: "18px 20px", background: `linear-gradient(150deg, ${C.cyan}16, rgba(18,20,29,0.85))`, border: `1px solid ${C.cyan}44` }}>
          <SectionLabel color={C.cyan}>New to this? Start with the basics</SectionLabel>
          <p style={{ margin: 0, fontSize: 14.5, color: "#E2E8F4", lineHeight: 1.65 }}><b style={{ color: "#fff" }}>{ind.primer.term}.</b> {ind.primer.what}</p>
          <div style={{ marginTop: 13, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.cyan}33`, background: "rgba(0,0,0,0.38)" }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.cyan, fontWeight: 700, padding: "8px 13px", borderBottom: `1px solid ${C.cyan}22` }}>A real example</div>
            <div style={{ padding: "12px 13px" }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: "#9fe8c6", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{ind.primer.example}</div>
              <div style={{ display: "flex", gap: 9, marginTop: 10 }}>
                <span aria-hidden style={{ color: C.cyan, fontFamily: MONO, fontWeight: 700 }}>&rarr;</span>
                <span style={{ fontSize: 13, color: "#C7CEDD", lineHeight: 1.55 }}>{ind.primer.returns}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHAT YOU'LL LEARN - compact numbered grid */}
      <div>
        <SectionLabel color={A}>In this module you will</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {ind.learn.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 14px", borderRadius: 12, background: "rgba(18,20,29,0.82)", border: `1px solid ${C.line}`, borderTop: `2px solid ${A}` }}>
              <span aria-hidden style={{ fontFamily: DISP, fontWeight: 700, color: A, fontSize: 15 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 13.5, color: "#D9E0EE", lineHeight: 1.45 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ENGINE SHOWCASE - colourful */}
      {ind.engines && ind.engines.length > 0 && (
        <div>
          <SectionLabel color={C.cyan}>{ind.enginesTitle ?? "The engines you'll be breaking (safely)"}</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {ind.engines.map((e) => <EngineCard key={e.name} {...e} />)}
          </div>
        </div>
      )}

      {/* SPLIT - why it matters (left) + newspaper clipping (right) */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 280px", minWidth: 258 }}>
          <SectionLabel color={A}>Why it matters</SectionLabel>
          <p style={{ margin: 0, fontSize: 15, color: "#E2E8F4", lineHeight: 1.7 }}>{ind.realWorld}</p>
          <div style={{ marginTop: 16, paddingLeft: 16, borderLeft: `3px solid ${A}`, fontFamily: DISP, fontWeight: 700, fontSize: 19, color: "#fff", lineHeight: 1.3 }}>{ind.whyPunch ?? "Cheap to fix. Devastating to miss."}</div>
        </div>
        {ind.headline && <div style={{ flex: "1 1 280px", minWidth: 258 }}><Newspaper h={ind.headline} /></div>}
      </div>

      {/* STAT BAND + recent case */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px", minWidth: 220, borderRadius: 16, padding: "20px 22px", background: `linear-gradient(145deg, ${C.cyan}1e, rgba(12,14,21,0.6))`, border: `1px solid ${C.cyan}44` }}>
          <SectionLabel color={C.cyan}>Right now in the industry</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 11 }}>
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: "clamp(46px,11vw,66px)", color: C.cyan, lineHeight: 0.9 }}>{ind.now.stat}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.soft, lineHeight: 1.35, whiteSpace: "pre-line" }}>{ind.now.statLabel ?? "on the OWASP\nTop 10, 2025"}</span>
          </div>
          <p style={{ margin: "13px 0 0", fontSize: 13.5, color: "#D9E0EE", lineHeight: 1.6 }}>{ind.now.body}</p>
        </div>
        {ind.recent && (
          <div style={{ flex: "1 1 220px", minWidth: 220, borderRadius: 16, padding: "20px 22px", background: "rgba(18,20,29,0.82)", border: `1px solid ${C.line}` }}>
            <span style={{ display: "inline-block", fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: "#0f0c26", background: C.red, padding: "3px 11px", borderRadius: 999, letterSpacing: ".06em" }}>{ind.recent.year}</span>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: "#fff", margin: "11px 0 0", lineHeight: 1.25 }}>{ind.recent.title}</div>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#D9E0EE", lineHeight: 1.6 }}>{ind.recent.body}</p>
          </div>
        )}
      </div>

      {/* FUTURE / AI twist - vibrant */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, padding: "22px 24px", background: `radial-gradient(130% 150% at 100% 0%, ${C.amber}26, transparent 55%), linear-gradient(150deg, #1b1630, #0d0b18)`, border: `1px solid ${C.amber}55` }}>
        <SectionLabel color={C.amber}>Where it&apos;s heading · the AI twist</SectionLabel>
        <p style={{ margin: 0, fontSize: 15, color: "#EAF0FB", lineHeight: 1.7, maxWidth: 620 }}>{ind.ahead}</p>
      </div>

      {/* CAREERS */}
      <div>
        <SectionLabel color={A}>Where it takes you</SectionLabel>
        <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "#D9E0EE", lineHeight: 1.6 }}>{ind.role}</p>
        {ind.roles && ind.roles.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ind.roles.map((r) => <span key={r} style={{ fontFamily: MONO, fontSize: 12, color: A, border: `1px solid ${A}55`, background: `${A}16`, padding: "6px 12px", borderRadius: 999 }}>{r}</span>)}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 2 }}>
        <Btn tone="i" onClick={onContinue} style={{ fontSize: 14, padding: "13px 26px" }}>Start the engagement →</Btn>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>then meet the client and learn the ground</span>
      </div>
    </div>
  );
}
function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span aria-hidden style={{ width: 20, height: 2, background: color, borderRadius: 2 }} />
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700, color }}>{children}</span>
    </div>
  );
}
function DbCyl({ color }: { color: string }) {
  return (
    <svg width="30" height="34" viewBox="0 0 34 40" aria-hidden style={{ display: "block" }}>
      <path d="M4 7 V33 C4 35.6 10 37.7 17 37.7 C24 37.7 30 35.6 30 33 V7" fill={color} opacity="0.32" />
      <path d="M4 7 V20 C4 22.6 10 24.7 17 24.7 C24 24.7 30 22.6 30 20 V7" fill={color} opacity="0.55" />
      <ellipse cx="17" cy="7" rx="13" ry="4.8" fill={color} />
      <ellipse cx="17" cy="7" rx="13" ry="4.8" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}
function BrowserGlyph({ color }: { color: string }) {
  return (
    <svg width="34" height="30" viewBox="0 0 40 34" aria-hidden style={{ display: "block" }}>
      <rect x="2" y="2" width="36" height="30" rx="4.5" fill={color} opacity="0.26" stroke={color} strokeOpacity="0.8" strokeWidth="1.2" />
      <path d="M2 6.5 C2 4 3.8 2 6.5 2 H33.5 C36.2 2 38 4 38 6.5 V10 H2 Z" fill={color} opacity="0.9" />
      <circle cx="7.5" cy="6" r="1.5" fill="#0f0c26" />
      <circle cx="12.5" cy="6" r="1.5" fill="#0f0c26" />
      <circle cx="17.5" cy="6" r="1.5" fill="#0f0c26" />
      <rect x="7" y="16" width="26" height="2.6" rx="1.3" fill={color} opacity="0.75" />
      <rect x="7" y="22" width="17" height="2.6" rx="1.3" fill={color} opacity="0.5" />
    </svg>
  );
}
/** Topic-fitting generic glyph for an engine/tool card (spec §1a). No copied logos. */
function EngineGlyph({ icon, color }: { icon?: EngineIcon; color: string }) {
  const sw = { display: "block" as const };
  switch (icon) {
    case "browser":
      return <BrowserGlyph color={color} />;
    case "tool":
      return (
        <svg width="30" height="32" viewBox="0 0 36 36" aria-hidden style={sw}>
          <rect x="15.5" y="1" width="5" height="8" rx="1.5" fill={color} opacity="0.8" />
          <rect x="15.5" y="27" width="5" height="8" rx="1.5" fill={color} opacity="0.8" />
          <rect x="1" y="15.5" width="8" height="5" rx="1.5" fill={color} opacity="0.8" />
          <rect x="27" y="15.5" width="8" height="5" rx="1.5" fill={color} opacity="0.8" />
          <circle cx="18" cy="18" r="11" fill={color} opacity="0.34" />
          <circle cx="18" cy="18" r="11" fill="none" stroke={color} strokeOpacity="0.8" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="4.5" fill="#0f0c26" />
        </svg>
      );
    case "scan":
      return (
        <svg width="30" height="32" viewBox="0 0 36 36" aria-hidden style={sw}>
          <circle cx="15" cy="15" r="10" fill={color} opacity="0.3" />
          <circle cx="15" cy="15" r="10" fill="none" stroke={color} strokeOpacity="0.85" strokeWidth="2.2" />
          <line x1="22" y1="22" x2="32" y2="32" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "key":
      return (
        <svg width="32" height="32" viewBox="0 0 36 36" aria-hidden style={sw}>
          <circle cx="11" cy="18" r="8" fill={color} opacity="0.35" />
          <circle cx="11" cy="18" r="8" fill="none" stroke={color} strokeOpacity="0.85" strokeWidth="2.2" />
          <circle cx="11" cy="18" r="3" fill="#0f0c26" />
          <rect x="18" y="16" width="15" height="4" rx="1.5" fill={color} />
          <rect x="22" y="20" width="3.5" height="4" rx="1" fill={color} opacity="0.85" />
          <rect x="28.5" y="20" width="3.5" height="5" rx="1" fill={color} />
        </svg>
      );
    case "lock":
      return (
        <svg width="28" height="32" viewBox="0 0 36 40" aria-hidden style={sw}>
          <path d="M11 17 V12 a7 7 0 0 1 14 0 V17" fill="none" stroke={color} strokeOpacity="0.85" strokeWidth="3" />
          <rect x="7" y="16" width="22" height="18" rx="3" fill={color} opacity="0.4" />
          <rect x="7" y="16" width="22" height="18" rx="3" fill="none" stroke={color} strokeOpacity="0.8" strokeWidth="1.3" />
          <circle cx="18" cy="24" r="2.6" fill="#0f0c26" />
          <rect x="16.8" y="24" width="2.4" height="5" rx="1" fill="#0f0c26" />
        </svg>
      );
    case "server":
      return (
        <svg width="30" height="32" viewBox="0 0 36 36" aria-hidden style={sw}>
          {[5, 15, 25].map((y) => (
            <g key={y}>
              <rect x="5" y={y} width="26" height="8" rx="2" fill={color} opacity="0.4" stroke={color} strokeOpacity="0.7" strokeWidth="1" />
              <circle cx="10" cy={y + 4} r="1.5" fill={color} />
            </g>
          ))}
        </svg>
      );
    case "shield":
      return (
        <svg width="28" height="32" viewBox="0 0 34 38" aria-hidden style={sw}>
          <path d="M17 2 L30 7 V18 C30 27 24 33 17 36 C10 33 4 27 4 18 V7 Z" fill={color} opacity="0.34" stroke={color} strokeOpacity="0.8" strokeWidth="1.4" />
          <path d="M11 18 l4 4 l8 -9" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "doc":
      return (
        <svg width="26" height="32" viewBox="0 0 30 38" aria-hidden style={sw}>
          <path d="M5 3 H19 L25 9 V35 H5 Z" fill={color} opacity="0.34" stroke={color} strokeOpacity="0.8" strokeWidth="1.3" />
          <path d="M19 3 V9 H25" fill="none" stroke={color} strokeOpacity="0.8" strokeWidth="1.3" />
          <rect x="9" y="16" width="12" height="2.3" rx="1" fill={color} opacity="0.85" />
          <rect x="9" y="22" width="12" height="2.3" rx="1" fill={color} opacity="0.6" />
          <rect x="9" y="28" width="8" height="2.3" rx="1" fill={color} opacity="0.5" />
        </svg>
      );
    case "mail":
      return (
        <svg width="32" height="30" viewBox="0 0 36 30" aria-hidden style={sw}>
          <rect x="3" y="4" width="30" height="22" rx="3" fill={color} opacity="0.34" stroke={color} strokeOpacity="0.8" strokeWidth="1.3" />
          <path d="M4 6 L18 17 L32 6" fill="none" stroke={color} strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return <DbCyl color={color} />;
  }
}
function EngineCard({ name, color, blurb, here, icon }: { name: string; color: string; blurb: string; here?: boolean; icon?: EngineIcon }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, padding: "15px 15px 16px", background: `linear-gradient(160deg, ${color}22, rgba(12,14,21,0.72))`, border: `1px solid ${color}${here ? "aa" : "40"}`, boxShadow: here ? `0 0 26px -10px ${color}` : "none" }}>
      {here && <span style={{ position: "absolute", top: 10, right: 10, fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".08em", color: "#0f0c26", background: color, padding: "3px 7px", borderRadius: 999 }}>YOU&apos;RE HERE</span>}
      <EngineGlyph icon={icon} color={color} />
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: "#fff", marginTop: 10 }}>{name}</div>
      <div style={{ fontSize: 12, color: "#C2CADA", lineHeight: 1.45, marginTop: 4 }}>{blurb}</div>
    </div>
  );
}
function Newspaper({ h }: { h: { masthead: string; dateline: string; title: string; body: string; stat: string; statLabel: string; why?: string } }) {
  return (
    <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "#efe9db", border: "1px solid #c9bda4", boxShadow: "0 20px 44px -22px #000", transform: "rotate(-0.7deg)", fontFamily: "Georgia, 'Times New Roman', serif", color: "#20201c" }}>
      <div style={{ padding: "13px 16px 15px" }}>
        <div style={{ textAlign: "center", borderBottom: "2px solid #20201c", paddingBottom: 7 }}>
          <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: ".02em" }}>{h.masthead}</div>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: "#5a5445", marginTop: 3 }}>{h.dateline}</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9a2b23", marginTop: 8 }}>★ This really happened</div>
        <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.15, margin: "5px 0 8px" }}>{h.title}</div>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#33322b" }}>{h.body}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 11, paddingTop: 9, borderTop: "1px solid #c9bda4" }}>
          <span style={{ fontWeight: 700, fontSize: 23, color: "#9a2b23" }}>{h.stat}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: ".08em", color: "#5a5445" }}>{h.statLabel}</span>
        </div>
        {h.why && <p style={{ margin: "11px 0 0", paddingTop: 9, borderTop: "1px solid #c9bda4", fontSize: 11.5, lineHeight: 1.5, color: "#44423a", fontStyle: "italic" }}>{h.why}</p>}
      </div>
    </div>
  );
}

// The scope / authorization screen, reworded so it reads as the real thing it is
// (owner: it looked like gibberish learners skip). Plain-English labels + a "why"
// on every row, framed as Rules of Engagement - the agreement that makes the work
// legal. The technical target values are kept.
function ScopeCard({ mod, world, callsign, setCallsign, onAuthorize }: { mod: ModuleDef; world: World; callsign: string; setCallsign: (v: string) => void; onAuthorize: () => void }) {
  return (
    <div style={{ display: "grid", gap: 13 }}>
      <div style={{ borderRadius: 16, padding: "20px 22px", background: "rgba(85,217,140,0.05)", border: `1px solid ${C.green}44`, borderLeft: `3px solid ${C.green}` }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700, color: C.green, marginBottom: 11 }}>◆ Rules of engagement</div>
        <h2 style={{ fontFamily: DISP, fontSize: 22, fontWeight: 700, margin: 0 }}>Sign before you touch anything</h2>
        <p style={{ color: "#D9E0EE", fontSize: 14.5, lineHeight: 1.65, margin: "10px 0 0" }}>This is the part that makes it legal. Before any real test, a hacker signs a scope: a written agreement that says exactly what they are allowed to touch. Stay inside it and you are a professional doing a job. Step outside it, even once, and you have broken the law, not just the rules.</p>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <ScopeRow label="Where you're working" value={mod.scope.target} why="The systems this job is about." accent={world.accent} />
        <ScopeRow label="Cleared to touch" value={mod.scope.inScope} why="Fair game. Everything here is yours to test." accent={C.green} mark="✓" />
        <ScopeRow label="Hands off" value={mod.scope.offLimits} why="Off the table. In the real world these are destructive, out of bounds, or real people's data, and touching any of them ends the engagement." accent={C.red} mark="✗" />
        <ScopeRow label="Time you have" value={mod.scope.timebox} why="Your window for this engagement." accent={world.accent} />
      </div>
      <div style={{ borderRadius: 16, padding: "18px 20px", background: C.panel, border: `1px solid ${C.line}` }}>
        <label style={lbl}>Sign as</label>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={callsign} onChange={(e) => setCallsign(e.target.value.toUpperCase().slice(0, 14))} placeholder="YOUR CALLSIGN" style={{ ...input, flex: "1 1 200px", letterSpacing: ".08em" }} />
          <Btn tone="g" disabled={!callsign.trim()} onClick={onAuthorize}>SIGN &amp; AUTHORIZE →</Btn>
        </div>
        <p style={{ fontSize: 12.5, color: C.soft, margin: "11px 0 0", lineHeight: 1.5 }}>By signing, you agree to stay inside this scope. This is exactly how a real engagement starts.</p>
      </div>
    </div>
  );
}
function ScopeRow({ label, value, why, accent, mark }: { label: string; value: string; why: string; accent: string; mark?: string }) {
  return (
    <div style={{ borderRadius: 12, padding: "13px 15px", background: "rgba(18,20,29,0.82)", border: `1px solid ${C.line}`, borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        {mark && <span aria-hidden style={{ color: accent, fontWeight: 700, fontFamily: MONO }}>{mark}</span>}
        <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700, color: accent }}>{label}</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 13, color: "#D9E0EE", lineHeight: 1.5 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.45, marginTop: 5 }}>{why}</div>
    </div>
  );
}

// "Not clicking yet?" - a warm, caring nudge under the handler. If the wall of
// text isn't landing, the learner clicks and gets the same mission a DIFFERENT
// way: a visual step-by-step map (dual-coding, for people who don't learn by
// reading). The map is revealed by the link, not shown by default.
function StuckHelp({ accent, open, onToggle, plan, bodyColor }: { accent: string; open: boolean; onToggle: () => void; plan: { label: string; goal: string }[]; bodyColor: string }) {
  return (
    <div>
      <div style={{ padding: "14px 16px", borderRadius: 14, background: `${accent}0d`, border: `1px dashed ${accent}59` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220, flex: 1 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}><span aria-hidden style={{ color: accent }}>✦</span>Not clicking yet? We&rsquo;ve got you.</div>
            <div style={{ fontSize: 13.5, color: bodyColor, lineHeight: 1.55, marginTop: 5 }}>This is proper tradecraft and everyone finds it fiddly at first, so no stress. Here&rsquo;s the whole mission a different way, one simple step at a time.</div>
          </div>
          <button onClick={onToggle} className="co-btn" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#0f0c26", border: "none", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: ".03em", padding: "10px 16px", borderRadius: 9, cursor: "pointer" }}>{open ? "Hide it" : "Show me a simpler way →"}</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .3s ease" }}>
        <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div style={{ marginTop: 12 }}><PlanMap plan={plan} accent={accent} bodyColor={bodyColor} /></div>
        </div>
      </div>
    </div>
  );
}

// The visual "mission map": the capture plan as a numbered, connected roadmap -
// a scannable, different-way-in to the same objectives the handler describes.
function PlanMap({ plan, accent, bodyColor }: { plan: { label: string; goal: string }[]; accent: string; bodyColor: string }) {
  return (
    <div style={{ borderRadius: 14, padding: "17px 19px", background: "rgba(12,14,21,0.72)", border: `1px solid ${accent}44` }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: accent, fontWeight: 700, marginBottom: 15, display: "flex", alignItems: "center", gap: 8 }}><span aria-hidden>▦</span>The mission, as a map · {plan.length} stages</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {plan.map((s, i) => (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, paddingBottom: i < plan.length - 1 ? 15 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", border: `1.5px solid ${accent}`, color: accent, display: "grid", placeItems: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700, background: "rgba(12,14,21,0.95)" }}>{i + 1}</span>
              {i < plan.length - 1 && <span aria-hidden style={{ width: 2, flex: 1, background: `${accent}3a`, marginTop: 4 }} />}
            </div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, color: "#fff" }}>{s.label}</div>
              <div style={{ fontSize: 13, color: bodyColor, lineHeight: 1.5, marginTop: 3 }}>{s.goal}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The cheat sheet: a full-screen, beginner-friendly quick reference the learner can
// open from the side tab and minimise. Plain-English, applicable to the module.
function CsEntry({ e, accent, pinned, onToggle }: { e: { code: string; what: string; example?: string }; accent: string; pinned: boolean; onToggle: () => void }) {
  return (
    <div style={{ position: "relative", borderRadius: 13, padding: "14px 15px", background: "rgba(18,20,29,0.9)", border: `1px solid ${pinned ? accent + "66" : C.line}` }}>
      <button onClick={onToggle} aria-label={pinned ? "Unpin" : "Pin to top"} title={pinned ? "Unpin" : "Pin to top"} className="co-btn" style={{ position: "absolute", top: 9, right: 10, background: "transparent", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, color: pinned ? accent : C.mute, padding: 2 }}>{pinned ? "★" : "☆"}</button>
      <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: accent, paddingRight: 24 }}>{e.code}</div>
      <div style={{ fontSize: 13.5, color: "#D9E0EE", lineHeight: 1.55, marginTop: 6 }}>{e.what}</div>
      {e.example && <div style={{ fontFamily: MONO, fontSize: 12, color: "#9fb0d8", lineHeight: 1.5, marginTop: 9, padding: "8px 11px", borderRadius: 8, background: "rgba(0,0,0,0.4)", border: `1px solid ${C.lineSoft}`, whiteSpace: "pre-wrap", overflowX: "auto" }}>{e.example}</div>}
    </div>
  );
}
function CheatSheet({ cs, world, moduleNo, onClose }: { cs: NonNullable<ModuleDef["cheatsheet"]>; world: World; moduleNo: number; onClose: () => void }) {
  const A = world.accent;
  const storeKey = `ops-cheat-pins-${moduleNo}`;
  const [pins, setPins] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(storeKey) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(storeKey, JSON.stringify(pins)); } catch { /* storage blocked */ } }, [pins, storeKey]);
  const toggle = (code: string) => setPins((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  const allEntries = cs.groups.flatMap((g) => g.entries);
  const pinned = pins.map((code) => allEntries.find((e) => e.code === code)).filter((e): e is NonNullable<typeof e> => !!e);
  return (
    <div role="dialog" aria-modal="true" onClick={onClose} className="co-anim co-pop" style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(6,8,14,0.82)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "sticky", top: 0, zIndex: 2, background: `linear-gradient(180deg, rgba(10,12,19,0.98), rgba(10,12,19,0.88))`, borderBottom: `1px solid ${A}44`, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700, color: A, display: "flex", alignItems: "center", gap: 8 }}><span aria-hidden>▦</span>Cheat sheet · M{String(moduleNo).padStart(2, "0")}</div>
            <div style={{ fontFamily: DISP, fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, color: "#fff", marginTop: 4 }}>{cs.title}</div>
          </div>
          <button onClick={onClose} className="co-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: A, color: "#0f0c26", border: "none", fontFamily: MONO, fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", padding: "11px 18px", borderRadius: 9, cursor: "pointer" }}>Minimise ✕</button>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 880, margin: "0 auto", padding: "22px 22px 60px" }}>
        <p style={{ color: "#D9E0EE", fontSize: 15, lineHeight: 1.65, margin: "0 0 8px", maxWidth: 640 }}>{cs.blurb}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 11, margin: "2px 0 24px", padding: "10px 15px", borderRadius: 11, background: `${A}16`, border: `1px solid ${A}66`, boxShadow: `0 0 20px ${A}1f` }}>
          <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, textTransform: "uppercase", color: "#0A0C12", background: A, borderRadius: 999, padding: "3px 10px" }}>★ Tip</span>
          <span style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.45, fontWeight: 500 }}>Tap the <span style={{ color: A, fontWeight: 700 }}>☆</span> on any card to pin it to the top for quick access.</span>
        </div>
        {pinned.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
              <span style={{ width: 20, height: 2, background: A, borderRadius: 2 }} />
              <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: A }}>★ Your pins</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(262px, 1fr))", gap: 11 }}>
              {pinned.map((e, ei) => <CsEntry key={ei} e={e} accent={A} pinned onToggle={() => toggle(e.code)} />)}
            </div>
          </div>
        )}
        {cs.sample && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
              <span style={{ width: 20, height: 2, background: A, borderRadius: 2 }} />
              <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: A }}>A sample table to picture</span>
            </div>
            <p style={{ color: "#C7CEDD", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 12px", maxWidth: 640 }}>{cs.sample.caption}</p>
            <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${A}3a`, background: "rgba(0,0,0,0.38)" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: MONO, fontSize: 13 }}>
                <thead>
                  <tr>{cs.sample.cols.map((c, ci) => <th key={ci} style={{ textAlign: "left", padding: "10px 14px", color: A, fontWeight: 700, letterSpacing: ".04em", borderBottom: `1px solid ${A}44`, background: `${A}12`, whiteSpace: "nowrap" }}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {cs.sample.rows.map((r, ri) => (
                    <tr key={ri}>{r.map((cell, cj) => <td key={cj} style={{ padding: "10px 14px", color: "#D9E0EE", borderBottom: ri < cs.sample!.rows.length - 1 ? `1px solid ${C.lineSoft}` : "none", whiteSpace: "nowrap" }}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {cs.groups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
              <span style={{ width: 20, height: 2, background: A, borderRadius: 2 }} />
              <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, color: A }}>{g.heading}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(262px, 1fr))", gap: 11 }}>
              {g.entries.map((e, ei) => <CsEntry key={ei} e={e} accent={A} pinned={pins.includes(e.code)} onToggle={() => toggle(e.code)} />)}
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", paddingTop: 4 }}>
          <button onClick={onClose} className="co-btn" style={{ background: "transparent", color: C.indigo2, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 12.5, fontWeight: 600, padding: "11px 22px", borderRadius: 9, cursor: "pointer" }}>Back to the module →</button>
        </div>
      </div>
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>{children}</div>;
}
function Eyebrow({ children, tone = "var(--world, #8B7BFF)" }: { children: React.ReactNode; tone?: string }) {
  return <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: tone, fontWeight: 600, marginBottom: 14 }}>{children}</div>;
}
function SRow({ k, v, tone = C.soft }: { k: string; v: string; tone?: string }) {
  return <div style={{ background: C.panel, padding: "10px 13px", display: "flex", gap: 12 }}><span style={{ color: C.mute, minWidth: 78 }}>{k}</span><span style={{ color: tone }}>{v}</span></div>;
}
function Stat({ n, l }: { n: string; l: string }) {
  return <div><div style={{ fontFamily: DISP, fontSize: 22, fontWeight: 700 }}>{n}</div><div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, letterSpacing: ".08em", textTransform: "uppercase" }}>{l}</div></div>;
}
export function Btn({ children, onClick, tone = "i", disabled, style }: { children: React.ReactNode; onClick?: () => void; tone?: "i" | "g" | "ghost"; disabled?: boolean; style?: React.CSSProperties }) {
  const base: React.CSSProperties = { padding: "11px 22px", borderRadius: 9, border: "none", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", cursor: disabled ? "default" : "pointer" };
  const tones: Record<string, React.CSSProperties> = {
    i: { background: "var(--world, #8B7BFF)", color: "#0f0c26" }, g: { background: C.green, color: "#07130c" },
    ghost: { background: "transparent", color: C.indigo2, border: `1px solid ${C.line}`, fontWeight: 600 },
  };
  return <button className="co-btn" onClick={onClick} disabled={disabled} style={{ ...base, ...tones[tone], opacity: disabled ? 0.45 : 1, ...style }}>{children}</button>;
}

const styles = `
  .co-btn{transition:transform .15s ease, filter .15s ease}
  .co-btn:not(:disabled):hover{transform:translateY(-1px);filter:brightness(1.08)}
  .co-opt:not(:disabled):hover{border-color:${C.indigo}!important}
  input:focus{outline:2px solid ${C.indigo};outline-offset:1px}
  .co-pop{animation:coPop .5s cubic-bezier(.2,1.2,.3,1)}
  .co-glow{animation:coGlow 1.4s ease-in-out infinite alternate}
  .co-bar{width:0;animation:coBar 1s cubic-bezier(.34,1.4,.5,1) .15s forwards}
  @keyframes coPop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
  @keyframes coGlow{to{text-shadow:0 0 26px rgba(139,123,255,.5)}}
  @keyframes coBar{to{width:26%}}
  @keyframes cn-led{0%,100%{opacity:1}50%{opacity:.4}}
  @media (prefers-reduced-motion: reduce){.co-pop,.co-glow{animation:none}.co-bar{width:26%;animation:none}*{animation-duration:0s!important}}
`;
