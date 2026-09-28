"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { K, CLASS_COLOUR, VERDICT_COLOUR } from "./tokens";
import {
  fill,
  resolveSituation,
  resolveTrack,
  TIER_LABEL,
  TRACK_LABEL,
  TOOL_LABEL,
  VERDICT_RANK,
  type AttachedDocument,
  type DataClass,
  type FirmView,
  type LearnCard,
  type LearnScreen,
  type ModuleManifest,
  type Phase,
  type ProveItem,
  type SandboxPractise,
  type SimRef,
  type SituationAnswer,
  type Tool,
  type Track,
  type TriageAnswer,
  type Verdict,
} from "./types";
import { classCounts, localRewrite, realDataCheck, ruleFindings, segments, verdictOf } from "./rules";
import { DEFAULT_COACH, DEFAULT_WHY, VERDICT_LINE, type GradeResult } from "./grading";
import { scriptedReply } from "./scripted";
import { VENDORS, VENDOR_TERMS_INTRO } from "../content/vendors";
import Simulator, { type SimMessage } from "../sims";
import Aurora from "../Aurora";

/* The engine that runs one module through Learn -> Practise -> Prove.
 * Structure only; every word of content comes from the manifest, the
 * firm's profile and the learner's track. Three columns: the rail (the
 * learner's place), the stage (the only thing that changes), the dock
 * (the desk and the firm's rules). One screen, one action. */

export interface CourseMapEntry {
  n: number;
  title: string;
  minutes: number;
  available: boolean;
  done: boolean;
}

export interface PlayerProps {
  manifest: ModuleManifest;
  track: Track;
  firm: FirmView;
  tool: Tool;
  learnerName: string;
  courseMap: CourseMapEntry[];
  /* Resume point from ModuleProgress. The player jumps to the start of that
   * phase, never to a screen whose gate the learner has not yet passed. */
  initialPhase?: Phase;
  /* False in the /dev preview: no API calls, rules-only grading, scripted
   * replies, nothing persisted. */
  live: boolean;
}

type Screen =
  | { kind: "learn"; i: number; phase: "learn" }
  | { kind: "desk"; phase: "practise" }
  | { kind: "picked"; phase: "practise" }
  | { kind: "build"; phase: "practise" }
  | { kind: "sandbox"; phase: "practise" }
  | { kind: "free"; phase: "practise" }
  | { kind: "sortItem"; i: number; phase: "practise" }
  | { kind: "situation"; i: number; phase: "practise" }
  | { kind: "incident"; i: number; phase: "practise" }
  | { kind: "attach"; phase: "practise" }
  | { kind: "findLine"; phase: "practise" }
  | { kind: "sources"; phase: "practise" }
  | { kind: "prove"; i: number; phase: "prove" }
  | { kind: "result"; phase: "done" };

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
  grade?: GradeResult;
}
interface SandboxState {
  messages: Msg[];
  status: string;
  busy: boolean;
}
const EMPTY_SANDBOX: SandboxState = { messages: [], status: "", busy: false };

let idSeq = 0;
const nextId = () => `m${++idSeq}`;

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true });
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* The final assessment draw: `fromTrack` from the track's own bank, the
 * rest from the shared bank spread across the modules it is tagged with. */
function drawFinal(manifest: ModuleManifest, trackProve: ProveItem[]): ProveItem[] {
  const f = manifest.final;
  if (!f) return trackProve;
  const fromTrack = shuffle(trackProve).slice(0, f.fromTrack);
  const groups = new Map<number, ProveItem[]>();
  for (const item of shuffle(f.bank)) {
    const k = item.from ?? 0;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(item);
  }
  const keys = shuffle([...groups.keys()]);
  const shared: ProveItem[] = [];
  const need = f.draw - fromTrack.length;
  let round = 0;
  while (shared.length < need && round < 20) {
    for (const k of keys) {
      const g = groups.get(k)!;
      if (g[round] && shared.length < need) shared.push(g[round]);
    }
    round++;
  }
  return shuffle([...fromTrack, ...shared]);
}

/* ---------- small pieces ---------- */

function Tag({ cls, names, small }: { cls: DataClass; names: Record<DataClass, string>; small?: boolean }) {
  const c = CLASS_COLOUR[cls];
  return (
    <span style={{ display: "inline-block", fontFamily: K.mono, fontSize: small ? 10 : 10.5, fontWeight: 600, letterSpacing: "0.08em", padding: small ? "1px 6px" : "2px 7px", borderRadius: 4, background: c.soft, color: c.ink, whiteSpace: "nowrap" }}>
      {names[cls]}
    </span>
  );
}

function Btn({ children, onClick, primary, disabled, hidden }: { children: ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={primary ? "cl-btn cl-btn-pri" : "cl-btn"}>
      {children}
    </button>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="cl-eyebrow">{children}</div>;
}

function tintColour(tint: LearnCard["tint"]): string {
  if (!tint) return K.accent;
  if (tint === "ok") return K.ok;
  if (tint === "warn") return K.warn;
  if (tint === "crit") return K.crit;
  return CLASS_COLOUR[tint].ink;
}

/* A compact simulator window with a caption, used wherever a screen shows
 * "this window" rather than a working chat. */
function Window({ sim, firm, learnerName, caption }: { sim: SimRef; firm: FirmView; learnerName: string; caption?: string }) {
  return (
    <div className="cl-window">
      <Simulator tool={sim.tool} tier={sim.tier} compact firmName={firm.name} learnerName={learnerName} messages={[]} draft="" onSend={() => {}} canSend={false} />
      {caption && <div className="cl-window-cap">{caption}</div>}
    </div>
  );
}

/* An attached document, shown as pages. With `reveal`, the planted line is
 * highlighted; with `onPick`, each paragraph is a button and the picked
 * one is marked right or wrong. */
function DocumentView({ doc, reveal, onPick, picked }: { doc: AttachedDocument; reveal?: boolean; onPick?: (id: string) => void; picked?: string | null }) {
  const plantedId = doc.sections.flatMap((s, si) => s.paragraphs.map((p, pi) => (p.planted ? `${si}:${pi}` : null))).find(Boolean) ?? null;
  return (
    <div className="cl-docview">
      <div className="cl-doc-head">
        <span className="cl-doc-icon" aria-hidden />
        <span><b>{doc.title}</b><small>{doc.kind}</small></span>
      </div>
      {doc.sections.map((s, si) => (
        <section key={si}>
          <h4>{s.heading}</h4>
          {s.paragraphs.map((p, pi) => {
            const id = `${si}:${pi}`;
            const show = reveal && p.planted;
            const state = picked === null || picked === undefined ? "" : id === plantedId ? "right" : id === picked ? "wrong" : "";
            return onPick ? (
              <button key={pi} type="button" disabled={picked !== null && picked !== undefined} className={`cl-para pickable ${state}`} onClick={() => onPick(id)}>{p.text}</button>
            ) : (
              <p key={pi} className={`cl-para ${show ? "planted" : ""}`}>{p.text}</p>
            );
          })}
        </section>
      ))}
    </div>
  );
}

/* Sources as tap-to-check rows. */
function SourceList({ sources, checked, onCheck, single, picked }: { sources: { label: string; real: boolean; note: string }[]; checked?: number[]; onCheck?: (i: number) => void; single?: boolean; picked?: number | null }) {
  return (
    <div className="cl-srcs">
      {sources.map((s, i) => {
        const isChecked = single ? picked !== null && picked !== undefined : (checked ?? []).includes(i);
        const show = single ? picked !== null && picked !== undefined : isChecked;
        const state = single ? (picked === null || picked === undefined ? "" : !s.real ? "right" : i === picked ? "wrong" : "") : isChecked ? (s.real ? "ok" : "bad") : "";
        return (
          <button key={i} type="button" className={`cl-src ${state}`} disabled={single ? picked !== null && picked !== undefined : isChecked} onClick={() => onCheck?.(i)}>
            <span className="cl-src-n">{i + 1}</span>
            <span className="cl-src-body">
              <b>{s.label}</b>
              {show && <small><span className={`cl-src-tag ${s.real ? "ok" : "bad"}`}>{s.real ? "Exists" : "Does not exist"}</span> {s.note}</small>}
              {!show && <small className="cl-src-hint">{single ? "Tap if this is the invented one" : "Tap to check"}</small>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* Three-way answer buttons with instant feedback. */
function ThreeWay<T extends string>({ options, picked, answer, onPick }: { options: { id: T; label: string; desc?: string }[]; picked: T | null; answer: T; onPick: (id: T) => void }) {
  return (
    <div className="cl-three">
      {options.map((o) => {
        const state = picked === null ? "" : o.id === answer ? "right" : o.id === picked ? "wrong" : "";
        return (
          <button key={o.id} type="button" disabled={picked !== null} className={`cl-three-btn ${state}`} onClick={() => onPick(o.id)}>
            <b>{o.label}</b>
            {o.desc && <small>{o.desc}</small>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- the grader's panel, shown under the learner's message ---------- */

function GraderPanel({ prompt, grade, names, onUseRewrite }: { prompt: string; grade: GradeResult; names: Record<DataClass, string>; onUseRewrite?: (rewrite: string) => void }) {
  const v = VERDICT_COLOUR[grade.verdict];
  const findings = useMemo(() => spansFromGrade(prompt, grade), [prompt, grade]);
  return (
    <div className="cl-grader" style={{ borderColor: v.ink }}>
      <div className="cl-grader-top">
        <span className="cl-pill" style={{ background: v.soft, color: v.ink, borderColor: v.ink }}>{v.label}</span>
        <span>{VERDICT_LINE[grade.verdict]}</span>
      </div>
      <div className="cl-echo">
        {findings.map((s, i) =>
          s.cls ? (
            <mark key={i} style={{ background: CLASS_COLOUR[s.cls].soft, color: s.cls === "C" || s.cls === "R" ? "transparent" : CLASS_COLOUR[s.cls].ink, textShadow: s.cls === "C" || s.cls === "R" ? `0 0 7px ${CLASS_COLOUR[s.cls].ink}` : "none", borderBottom: `1.5px solid ${CLASS_COLOUR[s.cls].ink}`, borderRadius: 2, padding: "0 2px" }}>
              {s.text}
            </mark>
          ) : (
            <span key={i}>{s.text}</span>
          ),
        )}
      </div>
      {grade.findings.length > 0 && (
        <div className="cl-finds">
          {grade.findings.map((f, i) => (
            <div key={i} className="cl-find">
              <Tag cls={f.cls} names={names} small />
              <span>
                <b>{f.text}</b> <span className="cl-why">{f.why}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="cl-coach">{grade.coach}</p>
      {grade.verdict !== "ok" && onUseRewrite && grade.rewrite && (
        <div className="cl-rewrite">
          <div className="cl-label">A cleared version</div>
          <div className="cl-rewrite-text">{grade.rewrite}</div>
          <button type="button" className="cl-btn cl-btn-small" onClick={() => onUseRewrite(grade.rewrite)}>Use the rewrite</button>
        </div>
      )}
    </div>
  );
}

function spansFromGrade(prompt: string, grade: GradeResult): { text: string; cls?: DataClass }[] {
  const spans: { start: number; end: number; text: string; cls: DataClass }[] = [];
  const lower = prompt.toLowerCase();
  for (const f of grade.findings) {
    const at = lower.indexOf(f.text.toLowerCase());
    if (at >= 0) spans.push({ start: at, end: at + f.text.length, text: prompt.slice(at, at + f.text.length), cls: f.cls });
  }
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: typeof spans = [];
  let last = -1;
  for (const s of spans) if (s.start >= last) { merged.push(s); last = s.end; }
  return segments(prompt, merged.map((s) => ({ ...s, label: "", placeholder: "" })));
}

/* ---------- the player ---------- */

export default function ClearedPlayer({ manifest, track, firm, tool, learnerName, courseMap, initialPhase, live }: PlayerProps) {
  const { block, track: usedTrack } = useMemo(() => resolveTrack(manifest, track), [manifest, track]);
  const practise = block.practise;
  const sandbox = practise.kind === "sandbox" ? (practise as SandboxPractise) : null;
  const pack = block.dataPack;
  const names = firm.classNames;
  const ctx = useMemo(() => ({ firm, tool }), [firm, tool]);
  const t = useCallback((s: string) => fill(s, ctx), [ctx]);
  const isFinal = !!manifest.final;

  /* the prove set: the track's bank, or a fresh draw for the final */
  const [proveSet, setProveSet] = useState<ProveItem[]>(() => drawFinal(manifest, block.prove));

  const screens = useMemo<Screen[]>(() => {
    const out: Screen[] = manifest.learn.map((_, i) => ({ kind: "learn", i, phase: "learn" }));
    if (practise.kind === "sandbox") {
      out.push({ kind: "desk", phase: "practise" }, { kind: "picked", phase: "practise" }, { kind: "build", phase: "practise" }, { kind: "sandbox", phase: "practise" }, { kind: "free", phase: "practise" });
    } else if (practise.kind === "sort") {
      practise.items.forEach((_, i) => out.push({ kind: "sortItem", i, phase: "practise" }));
    } else if (practise.kind === "situations") {
      practise.situations.forEach((_, i) => out.push({ kind: "situation", i, phase: "practise" }));
    } else if (practise.kind === "triage") {
      practise.incidents.forEach((_, i) => out.push({ kind: "incident", i, phase: "practise" }));
    } else if (practise.kind === "inspect") {
      out.push({ kind: "attach", phase: "practise" }, { kind: "findLine", phase: "practise" }, { kind: "sources", phase: "practise" });
    }
    proveSet.forEach((_, i) => out.push({ kind: "prove", i, phase: "prove" }));
    out.push({ kind: "result", phase: "done" });
    return out;
  }, [manifest, practise, proveSet]);

  const startOf = useCallback((phase: Phase) => Math.max(0, screens.findIndex((s) => s.phase === phase)), [screens]);
  const [cur, setCur] = useState(() => (initialPhase && initialPhase !== "done" ? startOf(initialPhase) : 0));
  const screen = screens[cur];

  /* learn interactions, keyed by learn index */
  const [learnState, setLearnState] = useState<Record<number, { pick?: DataClass; revealed?: number; shown?: boolean; opened?: number[]; flipped?: Record<number, boolean> }>>({});
  /* sandbox practise */
  const [deskPicks, setDeskPicks] = useState<Set<string>>(() => new Set());
  const [builder, setBuilder] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState(false);
  const [buildBox, setBuildBox] = useState<SandboxState>(EMPTY_SANDBOX);
  const [freeBox, setFreeBox] = useState<SandboxState>(EMPTY_SANDBOX);
  const [freeDraft, setFreeDraft] = useState("");
  const [freeSent, setFreeSent] = useState(false);
  const bestRank = useRef(99);
  const [bestVerdict, setBestVerdict] = useState<Verdict | undefined>(undefined);
  /* one-action practises: answer per item */
  const [picks, setPicks] = useState<Record<number, string>>({});
  /* the inspect practise: two scripted replies, typed out */
  const [inspect, setInspect] = useState<{ sent: boolean; text: string; pending: boolean; asked: boolean; srcText: string; srcPending: boolean; line: string | null; src: number | null }>({ sent: false, text: "", pending: false, asked: false, srcText: "", srcPending: false, line: null, src: null });
  const typeOut = useCallback(async (full: string, onChunk: (t: string) => void, onDone: () => void) => {
    const parts = full.split(/(?<=\n)/);
    let acc = "";
    for (const p of parts) {
      await new Promise((res) => setTimeout(res, live ? 140 : 90));
      acc += p;
      onChunk(acc);
    }
    onDone();
  }, [live]);
  /* prove */
  const [proveAnswers, setProveAnswers] = useState<(string | null)[]>(() => proveSet.map(() => null));
  const correct = proveAnswers.filter((a, i) => {
    const q = proveSet[i];
    return a !== null && (q.kind === "classify" ? a === q.answer : Number(a) === q.answer);
  }).length;
  const passed = correct >= manifest.passMark;
  /* phone dock drawer */
  const [dockOpen, setDockOpen] = useState(false);

  /* ---- persistence: scores and places only ---- */
  const persistScreen = useCallback(
    (extra?: { proveScore?: number; proveTotal?: number; completed?: boolean }) => {
      if (!live) return;
      const s = screens[cur];
      void postJson("/api/ai-cleared/progress", { type: "screen", module: manifest.n, phase: s.phase, screen: cur, bestVerdict, ...extra }).catch(() => {});
    },
    [live, screens, cur, manifest.n, bestVerdict],
  );
  useEffect(() => {
    if (screen.kind === "result") persistScreen({ proveScore: correct, proveTotal: proveSet.length, completed: passed });
    else persistScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  const go = useCallback((i: number) => {
    setCur(Math.max(0, Math.min(screens.length - 1, i)));
    setDockOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screens.length]);
  const next = () => go(cur + 1);
  const back = () => go(cur - 1);

  /* ---- the sandbox ---- */
  const runSandbox = useCallback(
    async (which: "build" | "free", prompt: string) => {
      if (!pack) return "ok" as Verdict;
      const set = which === "build" ? setBuildBox : setFreeBox;
      const findings = ruleFindings(prompt, pack);
      const v = verdictOf(findings);
      const local: GradeResult = {
        verdict: v,
        findings: findings.map((f) => ({ text: f.text, cls: f.cls, why: DEFAULT_WHY[f.cls] })),
        rewrite: localRewrite(prompt, findings, pack),
        coach: DEFAULT_COACH[v],
        counts: classCounts(findings),
        source: "rules",
      };
      const userId = nextId();
      set((s) => ({ ...s, busy: true, status: "Grading…", messages: [...s.messages, { id: userId, role: "user", text: prompt, grade: local }] }));

      if (VERDICT_RANK[v] < bestRank.current) {
        bestRank.current = VERDICT_RANK[v];
        setBestVerdict(v);
      }

      if (live) {
        try {
          const r = await postJson("/api/ai-cleared/grade", { prompt, module: manifest.n, track: usedTrack, tool, classNames: names, firmName: firm.name });
          const j = (await r.json()) as Partial<GradeResult> & { halted?: string };
          if (r.ok && j.verdict && Array.isArray(j.findings)) {
            const g = j as GradeResult;
            set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === userId ? { ...m, grade: g } : m)) }));
          }
        } catch {
          /* rules verdict stands */
        }
        void postJson("/api/ai-cleared/progress", { type: "attempt", module: manifest.n, tool, verdict: v, counts: local.counts, halted: false }).catch(() => {});
      }

      const aiId = nextId();
      set((s) => ({ ...s, status: `${TOOL_LABEL[tool]} is writing…`, messages: [...s.messages, { id: aiId, role: "assistant", text: "", pending: true }] }));
      const append = (chunk: string) => set((s) => ({ ...s, messages: s.messages.map((m) => (m.id === aiId ? { ...m, text: m.text + chunk } : m)) }));
      const finish = () => set((s) => ({ ...s, busy: false, status: "", messages: s.messages.map((m) => (m.id === aiId ? { ...m, pending: false } : m)) }));

      if (live) {
        try {
          const r = await postJson("/api/ai-cleared/reply", { prompt, module: manifest.n, track: usedTrack, tool, firmName: firm.name });
          if (!r.ok || !r.body) throw new Error("reply failed");
          const reader = r.body.getReader();
          const dec = new TextDecoder();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            append(dec.decode(value, { stream: true }));
          }
        } catch {
          append(scriptedReply(manifest.n, usedTrack, prompt));
        }
        finish();
      } else {
        const full = scriptedReply(manifest.n, usedTrack, prompt);
        const parts = full.split(/(?<=\n\n)/);
        for (const p of parts) {
          await new Promise((res) => setTimeout(res, 220));
          append(p);
        }
        finish();
      }
      return v;
    },
    [pack, live, manifest.n, usedTrack, tool, names, firm.name],
  );

  /* builder */
  const { assembledText, builderComplete } = useMemo(() => {
    if (!sandbox) return { assembledText: "", builderComplete: false };
    const complete = sandbox.builder.every((g) => builder[g.key] !== undefined);
    if (!Object.keys(builder).length) return { assembledText: "", builderComplete: false };
    let s = sandbox.assemble;
    for (const g of sandbox.builder) {
      const idx = builder[g.key];
      s = s.replace(`{${g.key}}`, idx === undefined ? `[${g.question.toLowerCase().replace(/\?$/, "")}?]` : g.choices[idx].value);
    }
    return { assembledText: s.replace(/\s+/g, " ").trim(), builderComplete: complete };
  }, [builder, sandbox]);

  const sendBuilt = async () => {
    setBuildBox(EMPTY_SANDBOX);
    setFlagged(false);
    go(cur + 1);
    await runSandbox("build", assembledText);
  };
  const fixAndResend = () => {
    setFlagged(true);
    go(startOf("practise") + 2);
  };

  const sendFree = async () => {
    const prompt = freeDraft.trim();
    if (!prompt || freeBox.busy || !pack) return;
    const real = realDataCheck(prompt, pack);
    if (real) {
      setFreeBox((s) => ({ ...s, status: `Stopped: that looks like ${real} that is not in the practice pack. Nothing was sent.` }));
      if (live) void postJson("/api/ai-cleared/progress", { type: "attempt", module: manifest.n, tool, verdict: "ok", counts: { P: 0, I: 0, C: 0, R: 0 }, halted: true }).catch(() => {});
      return;
    }
    setFreeDraft("");
    setFreeSent(true);
    const v = await runSandbox("free", prompt);
    setFreeBox((s) => ({ ...s, status: v === "ok" ? "Cleared send banked." : "Try once more with placeholders, or move on." }));
  };

  const retryProve = () => {
    const fresh = drawFinal(manifest, block.prove);
    setProveSet(fresh);
    setProveAnswers(fresh.map(() => null));
    go(startOf("prove"));
  };

  /* ---- rail data ---- */
  const pct = Math.round(((cur + 1) / screens.length) * 100);
  const phaseIdx = (["learn", "practise", "prove", "done"] as Phase[]).indexOf(screen.phase);
  const PHASES: { key: Phase; label: string; sub: string }[] = [
    { key: "learn", label: "Learn", sub: "the idea" },
    { key: "practise", label: "Practise", sub: practise.kind === "sandbox" ? "in the simulator" : practise.kind === "sort" ? "which tier is this" : practise.kind === "situations" ? "ten situations" : practise.kind === "inspect" ? "a document to check" : "six incidents" },
    { key: "prove", label: isFinal ? "Final assessment" : "Prove", sub: `${proveSet.length} items, pass at ${manifest.passMark}` },
  ];
  const toSim = (m: Msg[], onUseRewrite?: (r: string) => void): SimMessage[] =>
    m.map((x) => ({ id: x.id, role: x.role, text: x.text, pending: x.pending, panel: x.grade ? <GraderPanel prompt={x.text} grade={x.grade} names={names} onUseRewrite={onUseRewrite} /> : undefined }));

  /* cards that come from the firm or the vendor matrix */
  const cardsFor = (L: Extract<LearnScreen, { kind: "cards" }>): LearnCard[] => {
    if (L.cards) return L.cards;
    if (L.source === "firm.rules") {
      return [
        { title: "Approved", tint: "ok", tag: "Use on your work account", body: firm.approvedTools.length ? firm.approvedTools.join(" · ") : "Nothing listed yet.", detail: "Under a contract the firm signed: not used for training, kept in the firm's tenant, usage visible to your admin. INTERNAL is allowed here. CONFIDENTIAL still needs placeholders and RESTRICTED never goes in." },
        { title: "Ask first", tint: "warn", tag: `Ask ${firm.contactName}`, body: firm.askFirstTools.length ? firm.askFirstTools.join(" · ") : "Nothing listed yet.", detail: "Fine for some tasks, not for others. The firm decides case by case, so the question goes to the named contact, not to your own judgement on the day." },
        { title: "Not allowed", tint: "crit", tag: "Not on any account, any device", body: firm.bannedTools.length ? firm.bannedTools.join(" · ") : "Nothing listed yet.", detail: "No contract, no visibility, no control. This includes personal accounts of tools the firm has approved on work accounts." },
      ];
    }
    if (L.source === "vendors.terms") {
      const tools: Tool[] = ["copilot", "chatgpt", "gemini", "claude"];
      return tools.map((tl) => {
        const facts = VENDORS.filter((v) => v.tool === tl);
        const ent = facts.find((v) => v.tier === "enterprise");
        const con = facts.find((v) => v.tier === "consumer-free");
        if (!facts.length) return { title: TOOL_LABEL[tl], tag: "Being verified", body: "The vendor's page is being checked. Ask your admin for the current terms until it is.", tint: "I" as const };
        const verified = facts.map((v) => v.verifiedOn).sort().reverse()[0];
        return {
          title: TOOL_LABEL[tl],
          tag: `Checked ${verified}`,
          tint: "I" as const,
          body: `${con ? `Consumer: ${con.trains}` : ""}${con && ent ? " " : ""}${ent ? `Enterprise: ${ent.trains}` : ""}`,
          detail: `Look for: “${(ent ?? con)?.terms.find ?? ""}”`,
          link: { label: (ent ?? con)?.terms.title ?? "", href: (ent ?? con)?.terms.url ?? "" },
        };
      });
    }
    return [];
  };

  /* ---- the stage ---- */
  let stage: ReactNode = null;

  if (screen.kind === "learn") {
    const L: LearnScreen = manifest.learn[screen.i];
    const st = learnState[screen.i] ?? {};
    const setSt = (patch: Partial<typeof st>) => setLearnState((all) => ({ ...all, [screen.i]: { ...(all[screen.i] ?? {}), ...patch } }));
    if (L.kind === "intro") {
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          <p className="cl-lead">{t(L.lead)}</p>
          {L.note && <p className="cl-note">{t(L.note)}</p>}
          <div className="cl-nav">
            <span className="cl-hint">Each screen has one thing to do.</span>
            <Btn primary onClick={next}>{L.cta}</Btn>
          </div>
        </>
      );
    } else if (L.kind === "tiles") {
      const picked = st.pick;
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          <div className="cl-tiles">
            {L.tiles.map((tile) => (
              <div key={tile.cls} className="cl-tile" style={{ borderTopColor: CLASS_COLOUR[tile.cls].ink }}>
                <Tag cls={tile.cls} names={names} />
                <b>{t(tile.title)}</b>
                <small>{t(tile.body)}</small>
              </div>
            ))}
          </div>
          <div className="cl-check">
            <div className="cl-q">{L.check.question}</div>
            <div className="cl-snip">&ldquo;{L.check.snippet}&rdquo;</div>
            <div className="cl-opts">
              {L.check.options.map((o) => {
                const state = picked === undefined ? "" : o === L.check.answer ? "right" : o === picked ? "wrong" : "";
                return (
                  <button key={o} type="button" disabled={picked !== undefined} className={`cl-opt ${state}`} onClick={() => setSt({ pick: o })}>
                    {names[o]}
                  </button>
                );
              })}
            </div>
            {picked !== undefined && (
              <div className="cl-fb">
                <b>{picked === L.check.answer ? "Correct." : `It is ${names[L.check.answer]}.`}</b> {t(L.check.why)}
              </div>
            )}
          </div>
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            <Btn primary onClick={next} disabled={picked === undefined}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "reveal") {
      const shown = st.revealed ?? 1;
      const all = shown >= L.items.length;
      const more = (L.more ?? "Show question {n}").replace("{n}", String(shown + 1));
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {L.lead && <p className="cl-lead">{t(L.lead)} Tap to reveal each one.</p>}
          <div className="cl-reveal">
            {L.items.slice(0, shown).map((it, i) => (
              <div key={i} className="cl-rv">
                <span className="cl-n">{i + 1}</span>
                <div>
                  <b>{t(it.title)}</b>
                  <small>{t(it.body)}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            <Btn hidden={all} onClick={() => setSt({ revealed: shown + 1 })}>{more}</Btn>
            <Btn primary hidden={!all} onClick={next}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "compare") {
      const shown = !!st.shown;
      const Parts = ({ parts }: { parts: { text: string; mark?: "redact" | "placeholder" }[] }) => (
        <div className="cl-ex">
          {parts.map((p, i) => (p.mark === "redact" ? <span key={i} className="cl-rd">{p.text}</span> : p.mark === "placeholder" ? <span key={i} className="cl-phd">{p.text}</span> : <span key={i}>{p.text}</span>))}
        </div>
      );
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {L.lead && <p className="cl-lead">{t(L.lead)}</p>}
          <div className="cl-label">{L.before.label}</div>
          <Parts parts={L.before.parts} />
          {shown && (
            <>
              <div className="cl-label" style={{ marginTop: 16 }}>{L.after.label}</div>
              <Parts parts={L.after.parts} />
              <p className="cl-p" style={{ marginTop: 12 }}>{t(L.after.note)}</p>
            </>
          )}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            <Btn hidden={shown} onClick={() => setSt({ shown: true })}>{L.revealLabel}</Btn>
            <Btn primary hidden={!shown} onClick={next}>{L.cta}</Btn>
          </div>
        </>
      );
    } else if (L.kind === "cards") {
      const cards = cardsFor(L);
      const opened = st.opened ?? [];
      const gate = L.reveal ? cards.every((_, i) => opened.includes(i)) : true;
      const lead = L.source === "vendors.terms" ? VENDOR_TERMS_INTRO : L.lead;
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {lead && <p className="cl-lead">{t(lead)}</p>}
          <div className={`cl-cards ${L.columns === 1 || cards.length === 1 ? "one" : ""}`}>
            {cards.map((c, i) => {
              const open = !L.reveal || opened.includes(i);
              const colour = tintColour(c.tint);
              const inner = (
                <>
                  {c.sim && <Window sim={c.sim} firm={firm} learnerName={learnerName} />}
                  <div className="cl-card-head">
                    <b>{t(c.title)}</b>
                    {c.tag && <span className="cl-card-tag" style={{ color: colour, borderColor: colour }}>{t(c.tag)}</span>}
                  </div>
                  <p>{t(c.body)}</p>
                  {c.detail && open && <p className="cl-card-detail">{t(c.detail)}</p>}
                  {c.link && open && <a className="cl-card-link" href={c.link.href} target="_blank" rel="noopener noreferrer">{c.link.label} ↗</a>}
                  {c.detail && !open && <span className="cl-card-more">Tap to reveal</span>}
                </>
              );
              return L.reveal && c.detail ? (
                <button key={i} type="button" className={`cl-cardbtn ${open ? "open" : ""}`} style={{ borderTopColor: colour }} onClick={() => setSt({ opened: opened.includes(i) ? opened : [...opened, i] })}>
                  {inner}
                </button>
              ) : (
                <div key={i} className="cl-cardbtn open static" style={{ borderTopColor: colour }}>{inner}</div>
              );
            })}
          </div>
          {L.note && <p className="cl-note" style={{ marginTop: 14 }}>{t(L.note)}</p>}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            {!gate && <span className="cl-hint">{cards.length - opened.length} left to open</span>}
            <Btn primary onClick={next} disabled={!gate}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "toggles") {
      const flipped = st.flipped ?? {};
      const touched = L.toggles.every((_, i) => i in flipped);
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {L.lead && <p className="cl-lead">{t(L.lead)}</p>}
          <div className="cl-toggles">
            {L.toggles.map((tg, i) => {
              const on = !!flipped[i];
              return (
                <div key={i} className="cl-toggle">
                  <button type="button" role="switch" aria-checked={on} className={`cl-switch ${on ? "on" : ""}`} onClick={() => setSt({ flipped: { ...flipped, [i]: !on } })}>
                    <span className="cl-knob" />
                  </button>
                  <div>
                    <b>{t(tg.label)} <span className="cl-state">{on ? "On" : "Off"}</span></b>
                    <small>{t(on ? tg.on : tg.off)}</small>
                  </div>
                </div>
              );
            })}
          </div>
          {L.note && <p className="cl-note" style={{ marginTop: 14 }}>{t(L.note)}</p>}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            {!touched && <span className="cl-hint">Flip each switch once</span>}
            <Btn primary onClick={next} disabled={!touched}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "timeline") {
      const shown = !!st.shown;
      const Line = ({ label, steps, tone }: { label: string; steps: string[]; tone: "before" | "after" }) => (
        <div className={`cl-tl ${tone}`}>
          <div className="cl-label">{label}</div>
          <ol>
            {steps.map((s, i) => <li key={i}><span className="cl-tl-n">{i + 1}</span><span>{t(s)}</span></li>)}
          </ol>
        </div>
      );
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {L.lead && <p className="cl-lead">{t(L.lead)}</p>}
          <div className={`cl-tls ${shown ? "two" : ""}`}>
            <Line label={L.before.label} steps={L.before.steps} tone="before" />
            {shown && <Line label={L.after.label} steps={L.after.steps} tone="after" />}
          </div>
          {shown && <p className="cl-p" style={{ marginTop: 14 }}>{t(L.note)}</p>}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            <Btn hidden={shown} onClick={() => setSt({ shown: true })}>{L.revealLabel}</Btn>
            <Btn primary hidden={!shown} onClick={next}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "sources") {
      const checked = st.opened ?? [];
      const all = L.sources.every((_, i) => checked.includes(i));
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {L.lead && <p className="cl-lead">{t(L.lead)}</p>}
          <Simulator tool={L.sim.tool} tier={L.sim.tier} firmName={firm.name} learnerName={learnerName} messages={[{ id: "u", role: "user", text: t(L.prompt) }, { id: "a", role: "assistant", text: t(L.reply) }]} draft="" onSend={() => {}} canSend={false} composerLocked />
          <div className="cl-label" style={{ marginTop: 16 }}>The sources it gave</div>
          <SourceList sources={L.sources} checked={checked} onCheck={(i) => setSt({ opened: checked.includes(i) ? checked : [...checked, i] })} />
          {L.note && all && <p className="cl-note" style={{ marginTop: 14 }}>{t(L.note)}</p>}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            {!all && <span className="cl-hint">{L.sources.length - checked.length} left to check</span>}
            <Btn primary onClick={next} disabled={!all}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "injection") {
      const shown = !!st.shown;
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          {L.lead && <p className="cl-lead">{t(L.lead)}</p>}
          <div className="cl-attach"><span className="cl-doc-icon" aria-hidden />Attached: {L.document.title} · {L.document.kind}</div>
          <Simulator tool={L.sim.tool} tier={L.sim.tier} firmName={firm.name} learnerName={learnerName} messages={[{ id: "u", role: "user", text: t(L.prompt) }, { id: "a", role: "assistant", text: t(L.reply) }]} draft="" onSend={() => {}} canSend={false} composerLocked />
          {shown && (
            <>
              <div className="cl-label" style={{ marginTop: 16 }}>Inside the document</div>
              <DocumentView doc={L.document} reveal />
              <p className="cl-p" style={{ marginTop: 12 }}>{t(L.note)}</p>
            </>
          )}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            <Btn hidden={shown} onClick={() => setSt({ shown: true })}>{L.revealLabel}</Btn>
            <Btn primary hidden={!shown} onClick={next}>Continue</Btn>
          </div>
        </>
      );
    } else if (L.kind === "contact") {
      stage = (
        <>
          <Eyebrow>{t(L.eyebrow)}</Eyebrow>
          <h1 className="cl-h1">{t(L.heading)}</h1>
          <p className="cl-lead">{t(L.lead)}</p>
          <div className="cl-contact">
            <span className="cl-contact-avatar">{firm.contactName.slice(0, 1).toUpperCase()}</span>
            <div>
              <b>{firm.contactName}</b>
              <small>{firm.contactRole || "Data protection lead"} · {firm.name}</small>
            </div>
          </div>
          <div className="cl-label" style={{ marginTop: 18 }}>What to say</div>
          <ol className="cl-script">
            {L.script.map((s, i) => <li key={i}>{t(s)}</li>)}
          </ol>
          {L.note && <p className="cl-note" style={{ marginTop: 14 }}>{t(L.note)}</p>}
          <div className="cl-nav">
            <Btn onClick={back}>Back</Btn>
            <Btn primary onClick={next}>Continue to Practise</Btn>
          </div>
        </>
      );
    }
  } else if (screen.kind === "desk" && sandbox) {
    const n = deskPicks.size;
    stage = (
      <>
        <Eyebrow>Practise · step 1 of 4 · look at your desk</Eyebrow>
        <div className="cl-task"><span className="cl-label">Your task</span><p>{t(sandbox.task)}</p></div>
        <p className="cl-p">{t(sandbox.deskIntro)}</p>
        {sandbox.desk.map((doc, di) => (
          <div key={di} className="cl-doc">
            <div className="cl-dh"><span>Desk · {doc.title}</span><Tag cls={doc.cls} names={names} /></div>
            {doc.rows.map((row, ri) => {
              const key = `${di}:${ri}`;
              const on = deskPicks.has(key);
              return (
                <label key={ri} className={`cl-row ${on ? "picked" : ""}`}>
                  <input type="checkbox" checked={on} onChange={() => setDeskPicks((s) => { const c = new Set(s); if (c.has(key)) c.delete(key); else c.add(key); return c; })} />
                  <span className="cl-k">{row.key}</span>
                  <span className="cl-v">{row.value}</span>
                </label>
              );
            })}
          </div>
        ))}
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <span className="cl-hint">{n ? `${n} item${n > 1 ? "s" : ""} ticked` : "Nothing ticked yet"}</span>
          <Btn primary onClick={next}>Show me what I picked</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "picked" && sandbox) {
    const rows = sandbox.desk.flatMap((doc, di) => doc.rows.map((row, ri) => ({ ...row, key2: `${di}:${ri}`, picked: deskPicks.has(`${di}:${ri}`) })));
    const picked = rows.filter((r) => r.picked);
    const n = { C: 0, R: 0, I: 0, P: 0 } as Record<DataClass, number>;
    for (const r of picked) n[r.cls]++;
    const parts: string[] = [];
    if (n.R) parts.push(`${n.R} ${names.R}, which never enters a prompt`);
    if (n.C) parts.push(`${n.C} ${names.C}, which needs a placeholder`);
    if (n.I) parts.push(`${n.I} ${names.I}, which is fine in ${TOOL_LABEL[tool]}`);
    if (n.P) parts.push(`${n.P} ${names.P}, which is fine anywhere`);
    stage = (
      <>
        <Eyebrow>Practise · step 2 of 4 · what you picked</Eyebrow>
        <h1 className="cl-h1">{picked.length ? `You picked ${picked.length} item${picked.length > 1 ? "s" : ""}. Here is what each one is.` : "You ticked nothing. That is the safest start."}</h1>
        <div className="cl-doc">
          {(picked.length ? picked : rows).map((r) => (
            <div key={r.key2} className={`cl-row show ${r.picked ? "picked" : ""}`}>
              <span className="cl-k">{r.key}</span>
              <span className="cl-v">{r.value}</span>
              <Tag cls={r.cls} names={names} small />
            </div>
          ))}
        </div>
        <p className="cl-p cl-summ">
          {picked.length
            ? `Of those: ${parts.join("; ")}.${n.R || n.C ? " No harm done, nothing has been sent yet. Next you build the prompt with the safe options in front of you." : " You would have been cleared first time. Let us build it anyway."}`
            : "Here is what each item would have been. Most people tick the client and the contact without a second thought, and that is the habit we are changing."}
        </p>
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <Btn primary onClick={next}>Build the prompt</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "build" && sandbox) {
    const nPicked = sandbox.builder.filter((g) => builder[g.key] !== undefined).length;
    stage = (
      <>
        <Eyebrow>Practise · step 3 of 4 · build the prompt</Eyebrow>
        <h1 className="cl-h1">Pick one answer for each. The prompt writes itself.</h1>
        {flagged && <p className="cl-note" style={{ color: K.warn }}>The flagged answers are the ones the grader caught. Change them, then send again.</p>}
        <div className="cl-builder">
          {sandbox.builder.map((g) => (
            <div key={g.key} className="cl-grp">
              <div className="cl-q">{g.question}</div>
              <div className="cl-choices">
                {g.choices.map((c, ci) => {
                  const on = builder[g.key] === ci;
                  const flag = flagged && on && (c.cls === "C" || c.cls === "R");
                  return (
                    <button key={ci} type="button" className={`cl-choice ${on ? "on" : ""} ${flag ? "flag" : ""}`} onClick={() => setBuilder((b) => ({ ...b, [g.key]: ci }))}>
                      <span>{t(c.label)}</span>
                      <span className="cl-cl" style={{ color: c.cls === "clear" ? K.ok : CLASS_COLOUR[c.cls].ink }}>
                        {c.cls === "clear" ? "CLEAR" : names[c.cls]} · {t(c.note)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="cl-label" style={{ marginTop: 18 }}>Your prompt so far</div>
        <div className="cl-ex">{assembledText || "Pick an answer above to start."}</div>
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <span className="cl-hint">{nPicked} of {sandbox.builder.length} picked</span>
          <Btn primary disabled={!builderComplete} onClick={sendBuilt}>Send to {TOOL_LABEL[tool]}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "sandbox" && sandbox) {
    const v = buildBox.messages.find((m) => m.grade)?.grade?.verdict;
    const done = !buildBox.busy && buildBox.messages.length > 0;
    stage = (
      <>
        <Eyebrow>Practise · step 4 of 4 · the grader checks before {TOOL_LABEL[tool]} answers</Eyebrow>
        <div className="cl-banner"><span className="cl-dot" />Practice data only. Nothing you send is stored.</div>
        <Simulator tool={tool} firmName={firm.name} learnerName={learnerName} messages={toSim(buildBox.messages)} draft="" onSend={() => {}} canSend={false} composerLocked status={buildBox.status} />
        <div className="cl-nav">
          <Btn hidden={!done || v === "ok"} onClick={fixAndResend}>Fix and resend</Btn>
          <span className="cl-hint">{done ? (v === "ok" ? "Cleared send banked." : "Change the flagged answers, then resend.") : ""}</span>
          <Btn primary hidden={!done} onClick={next}>{v === "ok" ? "Continue" : "Continue anyway"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "free" && sandbox) {
    stage = (
      <>
        <Eyebrow>Practise · your turn, optional</Eyebrow>
        <h1 className="cl-h1">{t(sandbox.freeWrite.heading)}</h1>
        <p className="cl-lead">{t(sandbox.freeWrite.lead)}</p>
        <Simulator tool={tool} firmName={firm.name} learnerName={learnerName} messages={toSim(freeBox.messages, (r) => setFreeDraft(r))} draft={freeDraft} onDraftChange={setFreeDraft} onSend={sendFree} canSend={!!freeDraft.trim() && !freeBox.busy} status={freeBox.status} />
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <Btn primary onClick={next} disabled={freeBox.busy}>{freeSent ? "Continue to Prove" : "Skip to Prove"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "sortItem" && practise.kind === "sort") {
    const item = practise.items[screen.i];
    const picked = (picks[screen.i] as SimRef["tier"] | undefined) ?? null;
    const last = screen.i === practise.items.length - 1;
    stage = (
      <>
        <Eyebrow>Practise · window {screen.i + 1} of {practise.items.length}</Eyebrow>
        <h1 className="cl-h1">Which tier is this window?</h1>
        <p className="cl-p">Read it from the screen. The label is always somewhere.</p>
        <Window sim={item.sim} firm={firm} learnerName={learnerName} caption={item.caption} />
        <ThreeWay options={practise.bins} picked={picked} answer={item.sim.tier} onPick={(id) => setPicks((p) => ({ ...p, [screen.i]: id }))} />
        {picked !== null && (
          <div className="cl-fb">
            <b>{picked === item.sim.tier ? "Correct." : `It is ${TIER_LABEL[item.sim.tier].toLowerCase()}.`}</b> {t(item.tell)}
          </div>
        )}
        <div className="cl-nav">
          <Btn onClick={back} hidden={screen.i === 0}>Back</Btn>
          <span className="cl-hint">One pick. The tell appears straight away.</span>
          <Btn primary disabled={picked === null} onClick={next}>{last ? "Continue to Prove" : "Next window"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "situation" && practise.kind === "situations") {
    const s = practise.situations[screen.i];
    const resolved = resolveSituation(s, firm);
    const picked = (picks[screen.i] as SituationAnswer | undefined) ?? null;
    const last = screen.i === practise.situations.length - 1;
    const LABEL: Record<SituationAnswer, string> = { fine: "Fine", ask: "Ask first", no: "Not here" };
    stage = (
      <>
        <Eyebrow>Practise · situation {screen.i + 1} of {practise.situations.length}</Eyebrow>
        <h1 className="cl-h1">Is this fine here?</h1>
        <div className="cl-sit">
          {s.sim && <Window sim={s.sim} firm={firm} learnerName={learnerName} caption={`${TOOL_LABEL[s.sim.tool]} · ${TIER_LABEL[s.sim.tier]}`} />}
          <p className="cl-sit-text">{t(s.text)}</p>
        </div>
        <ThreeWay
          options={[
            { id: "fine" as const, label: "Fine", desc: "Approved tool, right account, right class." },
            { id: "ask" as const, label: "Ask first", desc: `Check with ${firm.contactName} before anything goes in.` },
            { id: "no" as const, label: "Not here", desc: "Not on this account, this device or this tool." },
          ]}
          picked={picked}
          answer={resolved.answer}
          onPick={(id) => setPicks((p) => ({ ...p, [screen.i]: id }))}
        />
        {picked !== null && (
          <div className="cl-fb">
            <b>{picked === resolved.answer ? "Correct." : `${LABEL[resolved.answer]}.`}</b> {t(resolved.why)}
          </div>
        )}
        <div className="cl-nav">
          <Btn onClick={back} hidden={screen.i === 0}>Back</Btn>
          <span className="cl-hint">{firm.name}&rsquo;s own list decides.</span>
          <Btn primary disabled={picked === null} onClick={next}>{last ? "Continue to Prove" : "Next situation"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "incident" && practise.kind === "triage") {
    const inc = practise.incidents[screen.i];
    const picked = (picks[screen.i] as TriageAnswer | undefined) ?? null;
    const last = screen.i === practise.incidents.length - 1;
    const label = practise.columns.find((c) => c.id === inc.answer)?.label ?? "";
    stage = (
      <>
        <Eyebrow>Practise · incident {screen.i + 1} of {practise.incidents.length}</Eyebrow>
        <h1 className="cl-h1">{t(inc.title)}</h1>
        <div className="cl-task"><p>{t(inc.body)}</p></div>
        <p className="cl-p">Which column?</p>
        <ThreeWay options={practise.columns.map((c) => ({ id: c.id, label: t(c.label), desc: t(c.desc) }))} picked={picked} answer={inc.answer} onPick={(id) => setPicks((p) => ({ ...p, [screen.i]: id }))} />
        {picked !== null && (
          <div className="cl-fb">
            <b>{picked === inc.answer ? "Correct." : `${t(label)}.`}</b> {t(inc.why)}
          </div>
        )}
        <div className="cl-nav">
          <Btn onClick={back} hidden={screen.i === 0}>Back</Btn>
          <span className="cl-hint">The reason appears as soon as you choose.</span>
          <Btn primary disabled={picked === null} onClick={next}>{last ? (isFinal ? "Start the final assessment" : "Continue to Prove") : "Next incident"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "attach" && practise.kind === "inspect") {
    const msgs: SimMessage[] = inspect.sent ? [{ id: "u", role: "user", text: t(practise.summaryPrompt) }, { id: "a", role: "assistant", text: inspect.text, pending: inspect.pending }] : [];
    const send = () => {
      if (inspect.sent) return;
      setInspect((s) => ({ ...s, sent: true, pending: true, text: "" }));
      void typeOut(t(practise.summaryReply), (txt) => setInspect((s) => ({ ...s, text: txt })), () => setInspect((s) => ({ ...s, pending: false })));
    };
    const done = inspect.sent && !inspect.pending;
    stage = (
      <>
        <Eyebrow>Practise · step 1 of 3 · ask for a summary</Eyebrow>
        <div className="cl-task"><span className="cl-label">Your task</span><p>{t(practise.task)}</p></div>
        <div className="cl-attach"><span className="cl-doc-icon" aria-hidden />Attached: {practise.document.title} · {practise.document.kind}</div>
        <Simulator tool={tool} firmName={firm.name} learnerName={learnerName} messages={msgs} draft={inspect.sent ? "" : t(practise.summaryPrompt)} onSend={send} canSend={!inspect.sent} composerLocked status={inspect.pending ? `${TOOL_LABEL[tool]} is reading the document…` : ""} />
        {done && <p className="cl-p" style={{ marginTop: 12 }}>Read the summary again. One of those points is not a summary of anything. Next, find where it came from.</p>}
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <span className="cl-hint">{inspect.sent ? "" : "Press send in the composer."}</span>
          <Btn primary disabled={!done} onClick={next}>Find where it came from</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "findLine" && practise.kind === "inspect") {
    const plantedId = practise.document.sections.flatMap((s, si) => s.paragraphs.map((p, pi) => (p.planted ? `${si}:${pi}` : null))).find(Boolean) ?? null;
    const picked = inspect.line;
    stage = (
      <>
        <Eyebrow>Practise · step 2 of 3 · find the line</Eyebrow>
        <h1 className="cl-h1">Which line in the document put that instruction in the summary?</h1>
        <p className="cl-p">Tap the paragraph. The tool read all of them; only one was written for it.</p>
        <DocumentView doc={practise.document} onPick={(id) => setInspect((s) => ({ ...s, line: id }))} picked={picked} />
        {picked !== null && (
          <div className="cl-fb">
            <b>{picked === plantedId ? "That is the one." : "Not that one; the planted line is highlighted."}</b> {t(practise.injectionWhy)}
          </div>
        )}
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <Btn primary disabled={picked === null} onClick={next}>Now ask for its sources</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "sources" && practise.kind === "inspect") {
    const msgs: SimMessage[] = inspect.asked ? [{ id: "u", role: "user", text: t(practise.sourcesPrompt) }, { id: "a", role: "assistant", text: inspect.srcText, pending: inspect.srcPending }] : [];
    const ask = () => {
      if (inspect.asked) return;
      setInspect((s) => ({ ...s, asked: true, srcPending: true, srcText: "" }));
      void typeOut(t(practise.sourcesReply), (txt) => setInspect((s) => ({ ...s, srcText: txt })), () => setInspect((s) => ({ ...s, srcPending: false })));
    };
    const replied = inspect.asked && !inspect.srcPending;
    const picked = inspect.src;
    const invented = practise.sources.findIndex((s) => !s.real);
    stage = (
      <>
        <Eyebrow>Practise · step 3 of 3 · check the sources</Eyebrow>
        <h1 className="cl-h1">Ask for its sources, then mark the one that does not exist.</h1>
        <Simulator tool={tool} firmName={firm.name} learnerName={learnerName} messages={msgs} draft={inspect.asked ? "" : t(practise.sourcesPrompt)} onSend={ask} canSend={!inspect.asked} composerLocked status={inspect.srcPending ? `${TOOL_LABEL[tool]} is writing…` : ""} />
        {replied && (
          <>
            <div className="cl-label" style={{ marginTop: 16 }}>Which one is invented?</div>
            <SourceList sources={practise.sources} single picked={picked} onCheck={(i) => setInspect((s) => ({ ...s, src: i }))} />
            {picked !== null && (
              <div className="cl-fb">
                <b>{picked === invented ? "Correct." : "Not that one."}</b> {t(practise.sources[invented].note)}
              </div>
            )}
          </>
        )}
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <span className="cl-hint">{inspect.asked ? "" : "Press send in the composer."}</span>
          <Btn primary disabled={picked === null} onClick={next}>Continue to Prove</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "prove") {
    const q = proveSet[screen.i];
    const picked = proveAnswers[screen.i];
    const last = screen.i === proveSet.length - 1;
    const setAns = (v: string) => setProveAnswers((a) => a.map((x, i) => (i === screen.i ? v : x)));
    stage = (
      <>
        <Eyebrow>{isFinal ? "Final assessment" : "Prove"} · item {screen.i + 1} of {proveSet.length} · pass at {manifest.passMark}</Eyebrow>
        <h1 className="cl-h1">{q.kind === "classify" ? "Which class is this?" : t(q.stem)}</h1>
        <div className="cl-check solid">
          {q.kind === "classify" ? (
            <>
              <div className="cl-snip">&ldquo;{t(q.stem)}&rdquo;</div>
              <div className="cl-opts">
                {q.options.map((o) => {
                  const state = picked === null ? "" : o === q.answer ? "right" : o === picked ? "wrong" : "";
                  return (
                    <button key={o} type="button" disabled={picked !== null} className={`cl-opt ${state}`} onClick={() => setAns(o)}>
                      {names[o]}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {q.sim && <Window sim={q.sim} firm={firm} learnerName={learnerName} />}
              <div className="cl-opts col">
                {q.options.map((o, oi) => {
                  const state = picked === null ? "" : oi === q.answer ? "right" : String(oi) === picked ? "wrong" : "";
                  return (
                    <button key={oi} type="button" disabled={picked !== null} className={`cl-opt text ${state}`} onClick={() => setAns(String(oi))}>
                      {t(o)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {picked !== null && (
            <div className="cl-fb">
              <b>{(q.kind === "classify" ? picked === q.answer : Number(picked) === q.answer) ? "Correct." : q.kind === "classify" ? `It is ${names[q.answer]}.` : "Not quite."}</b> {t(q.why)}
            </div>
          )}
        </div>
        <div className="cl-nav">
          <span className="cl-hint">One pick. You will see the answer straight away.</span>
          <Btn primary disabled={picked === null} onClick={next}>{last ? "See my result" : "Next item"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "result") {
    const clean = bestVerdict === "ok";
    const doneCount = courseMap.filter((m) => m.done || (m.n === manifest.n && passed)).length;
    const total = courseMap.length;
    const courseDone = passed && courseMap.filter((m) => m.available).every((m) => m.done || m.n === manifest.n);
    stage = (
      <>
        <span className="cl-stamp" style={{ color: passed ? K.ok : K.warn, borderColor: passed ? K.ok : K.warn }}>{passed ? (isFinal ? "Course cleared" : "Module cleared") : "Not yet cleared"}</span>
        <Eyebrow>Module {manifest.n} · {manifest.title}</Eyebrow>
        <h1 className="cl-h1">{passed ? "Cleared, " : "Not yet, "}{correct} of {proveSet.length}</h1>
        <p className="cl-lead">
          {passed
            ? isFinal
              ? courseDone
                ? `You passed the final assessment with ${correct} of ${proveSet.length}. Every module is cleared and your certificate is being prepared; you will find it on the course page.`
                : `You passed the final assessment with ${correct} of ${proveSet.length}. Clear the remaining modules and your certificate issues from the course page.`
              : sandbox
                ? clean
                  ? `You classified ${correct} snippets correctly and sent a cleared prompt in the sandbox. This module's score is on your record.`
                  : `You classified ${correct} snippets correctly. Your sandbox send was not fully cleared; a cleared send would lift this to full marks.`
                : `You answered ${correct} of ${proveSet.length} correctly. This module's score is on your record.`
            : `Pass mark is ${manifest.passMark} of ${proveSet.length}. ${isFinal ? "A retake draws a different set of questions." : "Go back over the Learn screens and try again."} Nothing is recorded until you pass.`}
        </p>
        <div className="cl-label" style={{ marginTop: 22 }}>Progress to your AI Cleared certificate</div>
        <div className="cl-meter"><i style={{ width: `${(doneCount / total) * 100}%` }} /></div>
        <div className="cl-hint">{doneCount} of {total} modules · {TRACK_LABEL[track]} track</div>
        <div className="cl-nav">
          {passed ? (
            <>
              <span className="cl-hint">{isFinal ? "Thank you. The habits are the point; the certificate is the receipt." : "The next module is waiting on the course page."}</span>
              <Link href="/ai-cleared" className="cl-btn cl-btn-pri">Back to your course</Link>
            </>
          ) : (
            <>
              <Btn onClick={() => go(0)}>Read the Learn screens again</Btn>
              <Btn primary onClick={retryProve}>{isFinal ? "Retake with new questions" : "Try again"}</Btn>
            </>
          )}
        </div>
      </>
    );
  }

  /* ---- the dock ---- */
  const inPractise = phaseIdx >= 1;
  const dock = (
    <>
      {inPractise && (
        <div className="cl-dock-sec">
          <div className="cl-label">Your task</div>
          <p>{t(practise.task)}</p>
        </div>
      )}
      {inPractise && sandbox && (
        <div className="cl-dock-sec">
          <div className="cl-label">On your desk</div>
          {sandbox.desk.map((doc, di) => (
            <div key={di} className="cl-dock-doc">
              <div className="cl-dh"><span>{doc.title}</span><Tag cls={doc.cls} names={names} small /></div>
              {doc.rows.map((row, ri) => (
                <div key={ri} className="cl-dock-row"><span className="cl-k">{row.key}</span><span>{row.value}</span></div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="cl-dock-sec">
        <div className="cl-label">{firm.name}&rsquo;s rules</div>
        <p><b>Approved:</b> {firm.approvedTools.join(", ") || "none listed yet"}.</p>
        {firm.askFirstTools.length > 0 && <p><b>Ask first:</b> {firm.askFirstTools.join(", ")}.</p>}
        <p><b>Not allowed:</b> {firm.bannedTools.join(", ") || "none listed yet"}.</p>
        <p><b>Ask:</b> {firm.contactName}{firm.contactRole ? `, ${firm.contactRole}` : ""}.</p>
      </div>
      <div className="cl-dock-sec">
        <div className="cl-label">The four classes</div>
        <div className="cl-classes">
          {(["P", "I", "C", "R"] as DataClass[]).map((c) => <Tag key={c} cls={c} names={names} small />)}
        </div>
      </div>
    </>
  );

  return (
    <div className="cl-shell">
      <Aurora intensity={0.55} />
      <header className="cl-top">
        <div className="cl-top-left">
          <span className="cl-word">AI CLEARED</span>
          <span className="cl-sep" />
          <span className="cl-firm">{firm.name}</span>
          <span className="cl-sep" />
          <span className="cl-where">Module {manifest.n} · {screen.phase === "done" ? "Result" : screen.phase === "prove" && isFinal ? "Final assessment" : screen.phase.charAt(0).toUpperCase() + screen.phase.slice(1)}</span>
        </div>
        <div className="cl-top-right">
          <span className="cl-chip">Practice data only</span>
          <span className="cl-learner">{learnerName}</span>
          <button type="button" className="cl-btn cl-btn-small cl-desk-btn" onClick={() => setDockOpen((o) => !o)} aria-expanded={dockOpen}>{dockOpen ? "Close desk" : "Desk"}</button>
          <Link href="/ai-cleared" className="cl-exit">Course</Link>
        </div>
      </header>
      <div className="cl-bar" aria-hidden><i style={{ width: `${pct}%` }} /></div>

      <div className="cl-body">
        <aside className="cl-rail">
          <div className="cl-label">Your course</div>
          <ol className="cl-map">
            {courseMap.map((m) => {
              const state = m.n === manifest.n ? "current" : m.done ? "done" : m.available ? "open" : "locked";
              return (
                <li key={m.n} className={`cl-map-${state}`}>
                  <span className="cl-map-n">{m.done ? "✓" : m.n}</span>
                  <span className="cl-map-t">{m.title}</span>
                </li>
              );
            })}
          </ol>
          <div className="cl-label" style={{ marginTop: 22 }}>This module</div>
          <ol className="cl-phases">
            {PHASES.map((p, i) => {
              const state = i < phaseIdx ? "done" : i === phaseIdx ? "current" : "upcoming";
              return (
                <li key={p.key} className={`cl-ph-${state}`}>
                  <span className="cl-map-n">{state === "done" ? "✓" : state === "current" ? "›" : "·"}</span>
                  <span><b>{p.label}</b><small>{p.sub}</small></span>
                </li>
              );
            })}
          </ol>
          <div className="cl-pct">{pct}% cleared</div>
        </aside>

        <main className="cl-stage" key={cur}>
          <div className="cl-card">{stage}</div>
        </main>

        <aside className={`cl-dock ${dockOpen ? "open" : ""}`}>{dock}</aside>
      </div>

      <style jsx global>{`
        .cl-shell { position: relative; min-height: 100svh; background: ${K.ground}; color: ${K.body}; font-family: ${K.sans}; font-size: 15px; line-height: 1.55; overflow-x: clip; }
        .cl-top { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 18px; min-height: 52px; box-sizing: border-box; background: ${K.headerBg}; backdrop-filter: blur(14px); border-bottom: 1px solid ${K.glassEdge}; }
        .cl-top-left, .cl-top-right { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .cl-word { display: inline-flex; align-items: center; gap: 8px; font-family: ${K.mono}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.22em; color: ${K.accentInk}; white-space: nowrap; }
        .cl-word::before { content: ""; width: 12px; height: 12px; border-radius: 3px; background: ${K.grad}; transform: rotate(45deg); box-shadow: 0 0 0 3px rgba(87,68,201,0.12); }
        .cl-sep { width: 1px; height: 14px; background: ${K.edge}; }
        .cl-firm { color: ${K.ink}; font-weight: 600; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cl-where { color: ${K.muted}; font-size: 13px; white-space: nowrap; }
        .cl-chip { font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: ${K.ok}; background: ${K.okSoft}; border: 1px solid rgba(76,195,138,0.35); border-radius: 999px; padding: 3px 9px; white-space: nowrap; }
        .cl-learner { color: ${K.muted}; font-size: 13px; white-space: nowrap; }
        .cl-exit { color: ${K.ink}; font-size: 13px; text-decoration: none; border: 1px solid ${K.edge}; border-radius: 8px; padding: 5px 10px; }
        .cl-exit:hover { border-color: ${K.accent}; }
        .cl-desk-btn { display: none; white-space: nowrap; }
        .cl-bar { position: relative; z-index: 4; height: 3px; background: ${K.edgeSoft}; }
        .cl-bar i { display: block; height: 100%; background: ${K.grad}; transition: width 300ms ease; box-shadow: 0 0 12px rgba(87,68,201,0.45); }

        .cl-body { position: relative; z-index: 1; display: grid; grid-template-columns: 224px minmax(0, 1fr) 300px; gap: 0; max-width: 1480px; margin: 0 auto; }
        .cl-rail { padding: 24px 18px; border-right: 1px solid ${K.glassEdge}; position: sticky; top: 56px; align-self: start; height: calc(100svh - 56px); overflow: auto; }
        .cl-dock { padding: 24px 18px; border-left: 1px solid ${K.glassEdge}; position: sticky; top: 56px; align-self: start; height: calc(100svh - 56px); overflow: auto; font-size: 13.5px; color: ${K.muted}; }
        .cl-dock p { margin: 0 0 6px; }
        .cl-dock b { color: ${K.body}; font-weight: 600; }
        .cl-dock-sec { margin-bottom: 22px; }
        .cl-dock-doc { border: 1px solid ${K.edge}; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: ${K.panel}; }
        .cl-dock-row { display: grid; grid-template-columns: 74px 1fr; gap: 8px; padding: 5px 10px; border-top: 1px solid ${K.edgeSoft}; color: ${K.body}; font-size: 12.5px; }
        .cl-dock-row .cl-k { color: ${K.faint}; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; padding-top: 2px; }
        .cl-classes { display: flex; flex-wrap: wrap; gap: 6px; }

        .cl-stage { padding: 28px 28px 60px; min-width: 0; animation: cl-in 250ms ease both; }
        .cl-card { max-width: 780px; margin: 0 auto; background: ${K.glass}; backdrop-filter: blur(18px); border: 1px solid ${K.glassEdge}; border-radius: 20px; padding: 30px 32px 26px; box-shadow: 0 10px 40px rgba(20,22,29,0.07); }
        @keyframes cl-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

        .cl-label { font-family: ${K.mono}; font-size: 10.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${K.faint}; margin-bottom: 8px; }
        .cl-eyebrow { font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${K.accentInk}; margin-bottom: 12px; }
        .cl-h1 { font-family: ${K.display}; font-size: 29px; line-height: 1.15; font-weight: 600; letter-spacing: -0.02em; color: ${K.ink}; margin: 0 0 12px; text-wrap: balance; }
        .cl-lead { font-size: 16.5px; line-height: 1.55; color: ${K.body}; margin: 0 0 10px; max-width: 64ch; }
        .cl-p { margin: 0 0 12px; max-width: 66ch; }
        .cl-note { font-size: 14px; color: ${K.muted}; margin: 0; }
        .cl-hint { font-size: 13px; color: ${K.muted}; }
        .cl-nav { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; margin-top: 26px; padding-top: 18px; border-top: 1px solid ${K.edgeSoft}; }
        .cl-nav .cl-hint { margin-right: auto; }
        .cl-nav > .cl-btn:first-child:not(.cl-btn-pri) { margin-right: auto; }

        .cl-btn { font: inherit; font-size: 14px; font-weight: 600; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 11px; padding: 9px 16px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease; }
        .cl-btn:hover:not(:disabled) { border-color: ${K.accent}; transform: translateY(-1px); }
        .cl-btn:disabled { opacity: 0.45; cursor: default; transform: none; }
        .cl-btn-pri { background: ${K.grad}; border-color: transparent; color: ${K.onAccent}; box-shadow: ${K.glow}; }
        .cl-btn-pri:hover:not(:disabled) { filter: brightness(1.05); }
        .cl-btn-pri:disabled { box-shadow: none; }
        .cl-btn-small { font-size: 12.5px; padding: 6px 11px; }
        .cl-shell button:focus-visible, .cl-shell a:focus-visible, .cl-shell input:focus-visible { outline: 2px solid ${K.accentInk}; outline-offset: 2px; }

        .cl-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0 18px; }
        .cl-tile { border: 1px solid ${K.edge}; border-top: 2px solid; border-radius: 10px; padding: 14px 14px 12px; background: ${K.panelRaise}; display: flex; flex-direction: column; gap: 7px; }
        .cl-tile b { color: ${K.ink}; font-size: 15px; line-height: 1.35; }
        .cl-tile small { color: ${K.muted}; font-size: 13.5px; line-height: 1.5; }
        .cl-check { border: 1px dashed ${K.edge}; border-radius: 10px; padding: 16px; }
        .cl-check.solid { border-style: solid; }
        .cl-q { font-weight: 600; color: ${K.ink}; margin-bottom: 8px; }
        .cl-snip { font-family: ${K.mono}; font-size: 14px; color: ${K.ink}; background: ${K.sunk}; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; line-height: 1.5; }
        .cl-opts { display: flex; flex-wrap: wrap; gap: 8px; }
        .cl-opts.col { flex-direction: column; }
        .cl-opt { font: inherit; font-family: ${K.mono}; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: ${K.ink}; background: transparent; border: 1px solid ${K.edge}; border-radius: 8px; padding: 8px 13px; cursor: pointer; text-align: left; }
        .cl-opt.text { font-family: ${K.sans}; font-size: 14.5px; font-weight: 500; letter-spacing: 0; padding: 11px 14px; line-height: 1.45; }
        .cl-opt:hover:not(:disabled) { border-color: ${K.accent}; }
        .cl-opt:disabled { cursor: default; }
        .cl-opt.right { border-color: ${K.ok}; background: ${K.okSoft}; color: ${K.ok}; }
        .cl-opt.wrong { border-color: ${K.crit}; background: ${K.critSoft}; color: ${K.crit}; }
        .cl-fb { margin-top: 12px; font-size: 14px; color: ${K.body}; }
        .cl-fb b { color: ${K.ink}; }

        .cl-reveal { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .cl-rv { display: flex; gap: 14px; border: 1px solid ${K.edge}; border-radius: 10px; padding: 14px; background: ${K.panelRaise}; animation: cl-in 250ms ease both; }
        .cl-n { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; border: 1px solid ${K.accent}; color: ${K.accentInk}; font-family: ${K.mono}; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; }
        .cl-rv b { display: block; color: ${K.ink}; font-size: 15.5px; margin-bottom: 3px; }
        .cl-rv small { color: ${K.muted}; font-size: 13.5px; line-height: 1.5; }

        .cl-ex { font-size: 15px; line-height: 1.6; color: ${K.ink}; background: ${K.sunk}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 14px 16px; }
        .cl-rd { background: ${K.ink}; color: ${K.ink}; border-radius: 2px; padding-inline: 2px; }
        .cl-phd { color: ${K.accentInk}; font-weight: 500; }

        .cl-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .cl-cards.one { grid-template-columns: 1fr; }
        .cl-cardbtn { font: inherit; text-align: left; display: flex; flex-direction: column; gap: 6px; color: ${K.body}; background: ${K.panelRaise}; border: 1px solid ${K.edge}; border-top: 2px solid; border-radius: 10px; padding: 14px 14px 12px; cursor: pointer; }
        .cl-cardbtn.static { cursor: default; }
        .cl-cardbtn:not(.static):hover { border-color: ${K.accent}; border-top-color: inherit; }
        .cl-cardbtn p { margin: 0; font-size: 14px; line-height: 1.5; }
        .cl-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .cl-card-head b { color: ${K.ink}; font-size: 15.5px; line-height: 1.3; }
        .cl-card-tag { flex-shrink: 0; font-family: ${K.mono}; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid; border-radius: 4px; padding: 2px 6px; white-space: nowrap; }
        .cl-card-detail { color: ${K.ink}; border-top: 1px solid ${K.edgeSoft}; padding-top: 8px; margin-top: 4px; animation: cl-in 250ms ease both; overflow-wrap: anywhere; }
        .cl-card-link { color: ${K.accentInk}; font-size: 13.5px; text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
        .cl-card-more { font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: ${K.accentInk}; margin-top: 4px; }

        .cl-toggles { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
        .cl-toggle { display: flex; gap: 14px; align-items: flex-start; border: 1px solid ${K.edge}; border-radius: 10px; padding: 14px; background: ${K.panelRaise}; }
        .cl-toggle b { display: block; color: ${K.ink}; font-size: 15px; margin-bottom: 4px; }
        .cl-toggle small { color: ${K.muted}; font-size: 13.5px; line-height: 1.5; display: block; }
        .cl-state { font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: ${K.accentInk}; margin-left: 6px; }
        .cl-switch { flex-shrink: 0; width: 44px; height: 24px; border-radius: 999px; border: 1px solid ${K.edge}; background: ${K.sunk}; position: relative; cursor: pointer; margin-top: 2px; }
        .cl-switch.on { background: ${K.accent}; border-color: ${K.accent}; }
        .cl-knob { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: ${K.ink}; transition: left 150ms ease; }
        .cl-switch.on .cl-knob { left: 22px; background: ${K.onAccent}; }

        .cl-tls { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 12px; }
        .cl-tls.two { grid-template-columns: 1fr 1fr; }
        .cl-tl { border: 1px solid ${K.edge}; border-radius: 10px; padding: 14px; background: ${K.panelRaise}; }
        .cl-tl.after { border-color: ${K.warn}; animation: cl-in 250ms ease both; }
        .cl-tl ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .cl-tl li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: ${K.body}; }
        .cl-tl-n { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; border: 1px solid ${K.edge}; font-family: ${K.mono}; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; color: ${K.muted}; }
        .cl-tl.after .cl-tl-n { border-color: ${K.warn}; color: ${K.warn}; }

        .cl-contact { display: flex; align-items: center; gap: 14px; border: 1px solid ${K.accent}; background: ${K.accentSoft}; border-radius: 12px; padding: 14px 16px; margin-top: 8px; }
        .cl-contact-avatar { width: 44px; height: 44px; border-radius: 50%; background: ${K.accent}; color: ${K.onAccent}; font-weight: 700; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; }
        .cl-contact b { display: block; color: ${K.ink}; font-size: 17px; }
        .cl-contact small { color: ${K.muted}; font-size: 13.5px; }
        .cl-script { margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 6px; color: ${K.ink}; font-size: 15px; }

        .cl-attach { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: ${K.ink}; background: ${K.panelRaise}; border: 1px solid ${K.edge}; border-radius: 8px; padding: 6px 10px; margin: 4px 0 12px; }
        .cl-doc-icon { display: inline-block; width: 12px; height: 15px; border: 1.5px solid ${K.accentInk}; border-radius: 2px 4px 2px 2px; position: relative; }
        .cl-docview { border: 1px solid ${K.edge}; border-radius: 10px; background: #f7f5ef; color: #1d2229; padding: 18px 20px; font-size: 13.5px; line-height: 1.55; }
        .cl-doc-head { display: flex; align-items: center; gap: 10px; padding-bottom: 10px; margin-bottom: 8px; border-bottom: 1px solid #d9d4c7; }
        .cl-doc-head b { display: block; font-size: 14px; }
        .cl-doc-head small { display: block; font-size: 11.5px; color: #6b7280; font-family: ${K.mono}; }
        .cl-docview .cl-doc-icon { border-color: #6b7280; }
        .cl-docview h4 { font-size: 12px; font-family: ${K.mono}; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin: 12px 0 4px; }
        .cl-para { display: block; width: 100%; margin: 0 0 6px; padding: 6px 8px; border-radius: 6px; border: 1px solid transparent; text-align: left; font: inherit; color: inherit; background: transparent; }
        .cl-para.pickable { cursor: pointer; }
        .cl-para.pickable:hover:not(:disabled) { border-color: ${K.accent}; background: rgba(70,183,191,0.08); }
        .cl-para.pickable:disabled { cursor: default; }
        .cl-para.planted, .cl-para.right { background: rgba(228,101,92,0.14); border-color: ${K.crit}; }
        .cl-para.wrong { border-color: ${K.warn}; background: rgba(224,160,64,0.12); }
        .cl-srcs { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
        .cl-src { font: inherit; text-align: left; display: flex; gap: 12px; align-items: flex-start; color: ${K.ink}; background: ${K.panelRaise}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 12px 13px; cursor: pointer; }
        .cl-src:hover:not(:disabled) { border-color: ${K.accent}; }
        .cl-src:disabled { cursor: default; }
        .cl-src.ok, .cl-src.wrong { border-color: ${K.edge}; }
        .cl-src.bad, .cl-src.right { border-color: ${K.crit}; background: ${K.critSoft}; }
        .cl-src.wrong { border-color: ${K.warn}; }
        .cl-src-n { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; border: 1px solid ${K.edge}; font-family: ${K.mono}; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; color: ${K.muted}; }
        .cl-src-body b { display: block; font-size: 14.5px; font-weight: 600; }
        .cl-src-body small { display: block; color: ${K.muted}; font-size: 13px; line-height: 1.5; margin-top: 4px; }
        .cl-src-hint { color: ${K.accentInk} !important; font-family: ${K.mono}; font-size: 11px !important; letter-spacing: 0.08em; text-transform: uppercase; }
        .cl-src-tag { font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; margin-right: 6px; }
        .cl-src-tag.ok { color: ${K.ok}; }
        .cl-src-tag.bad { color: ${K.crit}; }
        .cl-window { margin: 12px 0 14px; }
        .cl-window-cap { font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: ${K.faint}; margin-top: 6px; }
        .cl-sit { margin-bottom: 6px; }
        .cl-sit-text { font-size: 16px; line-height: 1.55; color: ${K.ink}; margin: 0 0 14px; }
        .cl-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 6px; }
        .cl-three-btn { font: inherit; text-align: left; display: flex; flex-direction: column; gap: 4px; color: ${K.ink}; background: ${K.panelRaise}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 12px 13px; cursor: pointer; }
        .cl-three-btn b { font-size: 15px; }
        .cl-three-btn small { color: ${K.muted}; font-size: 12.5px; line-height: 1.4; }
        .cl-three-btn:hover:not(:disabled) { border-color: ${K.accent}; }
        .cl-three-btn:disabled { cursor: default; }
        .cl-three-btn.right { border-color: ${K.ok}; background: ${K.okSoft}; }
        .cl-three-btn.right b { color: ${K.ok}; }
        .cl-three-btn.wrong { border-color: ${K.crit}; background: ${K.critSoft}; }
        .cl-three-btn.wrong b { color: ${K.crit}; }

        .cl-task { border-left: 3px solid ${K.accent}; background: ${K.accentSoft}; border-radius: 0 10px 10px 0; padding: 12px 14px; margin: 4px 0 14px; }
        .cl-task p { margin: 0; color: ${K.ink}; }
        .cl-doc { border: 1px solid ${K.edge}; border-radius: 10px; overflow: hidden; margin: 12px 0; background: ${K.panelRaise}; }
        .cl-dh { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: ${K.sunk}; font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: ${K.muted}; }
        .cl-row { display: grid; grid-template-columns: 22px 90px 1fr auto; align-items: center; gap: 10px; padding: 9px 14px; border-top: 1px solid ${K.edgeSoft}; cursor: pointer; color: ${K.body}; }
        .cl-row.show { grid-template-columns: 90px 1fr auto; cursor: default; }
        .cl-row.picked { background: ${K.accentSoft}; }
        .cl-row input { width: 16px; height: 16px; accent-color: ${K.accent}; margin: 0; }
        .cl-row .cl-k { font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: ${K.faint}; }
        .cl-row .cl-v { color: ${K.ink}; font-size: 14px; }
        .cl-summ { margin-top: 12px; }

        .cl-builder { display: flex; flex-direction: column; gap: 14px; margin-top: 6px; }
        .cl-choices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cl-choice { font: inherit; text-align: left; display: flex; flex-direction: column; gap: 4px; color: ${K.ink}; background: ${K.panelRaise}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 11px 13px; cursor: pointer; }
        .cl-choice:hover { border-color: ${K.accent}; }
        .cl-choice.on { border-color: ${K.accent}; background: ${K.accentSoft}; }
        .cl-choice.flag { border-color: ${K.warn}; box-shadow: 0 0 0 2px ${K.warnSoft}; }
        .cl-cl { font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.06em; }

        .cl-banner { display: flex; align-items: center; gap: 8px; font-size: 13px; color: ${K.ok}; margin-bottom: 12px; }
        .cl-dot { width: 8px; height: 8px; border-radius: 50%; background: ${K.ok}; box-shadow: 0 0 0 3px ${K.okSoft}; }

        .cl-grader { background: ${K.panel}; color: ${K.body}; border: 1px solid; border-radius: 10px; padding: 14px 16px; font-family: ${K.sans}; font-size: 14px; text-align: left; animation: cl-in 250ms ease both; }
        .cl-grader-top { display: flex; align-items: center; gap: 10px; color: ${K.ink}; font-weight: 500; margin-bottom: 10px; }
        .cl-pill { font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid; border-radius: 999px; padding: 3px 10px; }
        .cl-echo { background: ${K.sunk}; border-radius: 8px; padding: 10px 12px; line-height: 1.7; color: ${K.body}; white-space: pre-wrap; }
        .cl-finds { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
        .cl-find { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; }
        .cl-find b { color: ${K.ink}; font-weight: 600; }
        .cl-why { color: ${K.muted}; }
        .cl-coach { margin: 12px 0 0; color: ${K.ink}; font-size: 14.5px; line-height: 1.55; }
        .cl-rewrite { margin-top: 12px; padding-top: 12px; border-top: 1px solid ${K.edgeSoft}; }
        .cl-rewrite-text { color: ${K.accentInk}; font-size: 14px; line-height: 1.55; margin-bottom: 10px; }

        .cl-stamp { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; border: 1.5px solid; border-radius: 6px; padding: 5px 10px; margin-bottom: 16px; }
        .cl-meter { height: 8px; background: ${K.sunk}; border-radius: 999px; overflow: hidden; margin: 6px 0 8px; }
        .cl-meter i { display: block; height: 100%; background: ${K.accent}; transition: width 500ms ease; }

        .cl-map, .cl-phases { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .cl-map li, .cl-phases li { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; font-size: 13.5px; color: ${K.muted}; }
        .cl-map-n { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; border: 1px solid ${K.edge}; font-family: ${K.mono}; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; }
        .cl-map-current, .cl-ph-current { color: ${K.ink}; }
        .cl-map-current .cl-map-n, .cl-ph-current .cl-map-n { border-color: transparent; color: ${K.onAccent}; background: ${K.grad}; box-shadow: 0 0 0 3px rgba(87,68,201,0.12); }
        .cl-map-done .cl-map-n, .cl-ph-done .cl-map-n { border-color: ${K.ok}; color: ${K.ok}; background: ${K.okSoft}; }
        .cl-map-n, .cl-n, .cl-tl-n, .cl-src-n { background: ${K.glassStrong}; }
        .cl-meter i, .cl-contact-avatar, .cl-stamp-fill { background: ${K.grad}; }
        .cl-map-locked { color: ${K.faint}; }
        .cl-phases b { display: block; color: inherit; font-weight: 600; }
        .cl-phases small { display: block; font-size: 12px; color: ${K.faint}; }
        .cl-pct { margin-top: 18px; font-family: ${K.mono}; font-size: 12px; color: ${K.accentInk}; }

        @media (max-width: 1180px) {
          .cl-body { grid-template-columns: minmax(0, 1fr) 280px; }
          .cl-rail { display: none; }
        }
        @media (max-width: 900px) {
          .cl-body { grid-template-columns: minmax(0, 1fr); }
          .cl-dock { display: none; position: fixed; inset: 52px 0 0 0; z-index: 4; height: auto; background: ${K.ground}; border-left: none; }
          .cl-dock.open { display: block; }
          .cl-desk-btn { display: inline-flex; }
          .cl-learner, .cl-where { display: none; }
          .cl-stage { padding: 16px 16px 48px; }
          .cl-card { padding: 22px 18px 20px; }
          .cl-h1 { font-size: 23px; }
          .cl-tiles, .cl-choices, .cl-cards, .cl-tls.two { grid-template-columns: 1fr; }
          .cl-three { grid-template-columns: 1fr; }
          .cl-row { grid-template-columns: 22px 1fr; }
          .cl-row .cl-v { grid-column: 2; }
          .cl-row.show { grid-template-columns: 1fr auto; }
          .cl-row.show .cl-v { grid-column: 1; }
          .sim-copilot:not(.sim-compact), .sim-chatgpt:not(.sim-compact), .sim-gemini:not(.sim-compact), .sim-claude:not(.sim-compact) { grid-template-columns: minmax(0, 1fr) !important; }
          .sim-copilot:not(.sim-compact) .sim-copilot-rail, .sim-chatgpt:not(.sim-compact) .sim-chatgpt-rail, .sim-gemini:not(.sim-compact) .sim-gemini-rail, .sim-claude:not(.sim-compact) .sim-claude-rail { display: none !important; }
        }
        @media (max-width: 480px) {
          .cl-chip { display: none; }
          .cl-top { padding: 8px 12px; gap: 8px; }
          .cl-word { font-size: 10px; letter-spacing: 0.16em; }
          .cl-firm { font-size: 12.5px; max-width: 96px; }
          .cl-exit { padding: 5px 8px; font-size: 12.5px; }
          .cl-top-right { gap: 6px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cl-stage, .cl-rv, .cl-grader, .cl-card-detail, .cl-tl.after { animation: none; }
          .cl-bar i, .cl-meter i, .cl-knob { transition: none; }
        }
      `}</style>
    </div>
  );
}
