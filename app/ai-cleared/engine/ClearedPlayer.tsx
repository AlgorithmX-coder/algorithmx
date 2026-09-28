"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { K, CLASS_COLOUR, VERDICT_COLOUR } from "./tokens";
import {
  fill,
  resolveTrack,
  TRACK_LABEL,
  TOOL_LABEL,
  VERDICT_RANK,
  type DataClass,
  type FirmView,
  type LearnScreen,
  type ModuleManifest,
  type Phase,
  type ProveItem,
  type Tool,
  type Track,
  type Verdict,
} from "./types";
import { classCounts, localRewrite, realDataCheck, ruleFindings, segments, verdictOf } from "./rules";
import { DEFAULT_COACH, DEFAULT_WHY, VERDICT_LINE, type GradeResult } from "./grading";
import { scriptedReply } from "./scripted";
import CopilotSim, { type SimMessage } from "../sims/Copilot";

/* The engine that runs one module through Learn -> Practise -> Prove.
 * Structure only; every word of content comes from the manifest, the
 * firm's profile and the learner's track. Three columns: the rail (the
 * learner's place), the stage (the only thing that changes), the dock
 * (the desk and the firm's rules). */

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
  lastVerdict?: Verdict;
}
const EMPTY_SANDBOX: SandboxState = { messages: [], status: "", busy: false };

let idSeq = 0;
const nextId = () => `m${++idSeq}`;

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true });
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

function Btn({ children, onClick, primary, disabled, hidden, ariaLabel }: { children: ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean; hidden?: boolean; ariaLabel?: string }) {
  if (hidden) return null;
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={primary ? "cl-btn cl-btn-pri" : "cl-btn"}>
      {children}
    </button>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="cl-eyebrow">{children}</div>;
}

/* ---------- the grader's panel, shown under the learner's message ---------- */

function GraderPanel({ prompt, grade, names, onUseRewrite }: { prompt: string; grade: GradeResult; names: Record<DataClass, string>; onUseRewrite?: (rewrite: string) => void }) {
  const v = VERDICT_COLOUR[grade.verdict];
  const findings = useMemo(() => ruleFindingsFromGrade(prompt, grade), [prompt, grade]);
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

/* The echo is built from the grade's findings (which may include one the
 * model added), located in the prompt text. */
function ruleFindingsFromGrade(prompt: string, grade: GradeResult): { text: string; cls?: DataClass }[] {
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
  const pack = block.dataPack;
  const practise = block.practise;
  const names = firm.classNames;
  const ctx = useMemo(() => ({ firm, tool }), [firm, tool]);
  const t = useCallback((s: string) => fill(s, ctx), [ctx]);

  const screens = useMemo<Screen[]>(() => {
    const out: Screen[] = manifest.learn.map((_, i) => ({ kind: "learn", i, phase: "learn" }));
    out.push({ kind: "desk", phase: "practise" }, { kind: "picked", phase: "practise" }, { kind: "build", phase: "practise" }, { kind: "sandbox", phase: "practise" }, { kind: "free", phase: "practise" });
    block.prove.forEach((_, i) => out.push({ kind: "prove", i, phase: "prove" }));
    out.push({ kind: "result", phase: "done" });
    return out;
  }, [manifest, block]);

  const startOf = useCallback((phase: Phase) => Math.max(0, screens.findIndex((s) => s.phase === phase)), [screens]);
  const [cur, setCur] = useState(() => (initialPhase && initialPhase !== "done" ? startOf(initialPhase) : 0));
  const screen = screens[cur];

  /* learn interactions, keyed by learn index */
  const [learnState, setLearnState] = useState<Record<number, { pick?: DataClass; revealed?: number; shown?: boolean }>>({});
  /* practise */
  const [deskPicks, setDeskPicks] = useState<Set<string>>(() => new Set());
  const [builder, setBuilder] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState(false);
  const [buildBox, setBuildBox] = useState<SandboxState>(EMPTY_SANDBOX);
  const [freeBox, setFreeBox] = useState<SandboxState>(EMPTY_SANDBOX);
  const [freeDraft, setFreeDraft] = useState("");
  const [freeSent, setFreeSent] = useState(false);
  const bestRank = useRef(99);
  const [bestVerdict, setBestVerdict] = useState<Verdict | undefined>(undefined);
  /* prove */
  const [proveAnswers, setProveAnswers] = useState<(DataClass | null)[]>(() => block.prove.map(() => null));
  const correct = proveAnswers.filter((a, i) => a !== null && a === block.prove[i].answer).length;
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
    if (screen.kind === "result") persistScreen({ proveScore: correct, proveTotal: block.prove.length, completed: passed });
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
        /* offline: type the scripted reply in a few beats */
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
    const complete = practise.builder.every((g) => builder[g.key] !== undefined);
    if (!Object.keys(builder).length) return { assembledText: "", builderComplete: false };
    let s = practise.assemble;
    for (const g of practise.builder) {
      const idx = builder[g.key];
      s = s.replace(`{${g.key}}`, idx === undefined ? `[${g.question.toLowerCase().replace(/\?$/, "")}?]` : g.choices[idx].value);
    }
    return { assembledText: s.replace(/\s+/g, " ").trim(), builderComplete: complete };
  }, [builder, practise]);

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
    if (!prompt || freeBox.busy) return;
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
    setProveAnswers(block.prove.map(() => null));
    go(startOf("prove"));
  };

  /* ---- rail data ---- */
  const pct = Math.round(((cur + 1) / screens.length) * 100);
  const phaseIdx = (["learn", "practise", "prove", "done"] as Phase[]).indexOf(screen.phase);
  const PHASES: { key: Phase; label: string; sub: string }[] = [
    { key: "learn", label: "Learn", sub: "the idea" },
    { key: "practise", label: "Practise", sub: "in the simulator" },
    { key: "prove", label: "Prove", sub: `${block.prove.length} snippets, pass at ${manifest.passMark}` },
  ];
  const toSim = (m: Msg[], onUseRewrite?: (r: string) => void): SimMessage[] =>
    m.map((x) => ({ id: x.id, role: x.role, text: x.text, pending: x.pending, panel: x.grade ? <GraderPanel prompt={x.text} grade={x.grade} names={names} onUseRewrite={onUseRewrite} /> : undefined }));

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
            <Btn hidden={all} onClick={() => setSt({ revealed: shown + 1 })}>Show question {shown + 1}</Btn>
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
    }
  } else if (screen.kind === "desk") {
    const n = deskPicks.size;
    stage = (
      <>
        <Eyebrow>Practise · step 1 of 4 · look at your desk</Eyebrow>
        <div className="cl-task"><span className="cl-label">Your task</span><p>{t(practise.task)}</p></div>
        <p className="cl-p">{t(practise.deskIntro)}</p>
        {practise.desk.map((doc, di) => (
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
  } else if (screen.kind === "picked") {
    const rows = practise.desk.flatMap((doc, di) => doc.rows.map((row, ri) => ({ ...row, key2: `${di}:${ri}`, picked: deskPicks.has(`${di}:${ri}`) })));
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
  } else if (screen.kind === "build") {
    const nPicked = practise.builder.filter((g) => builder[g.key] !== undefined).length;
    stage = (
      <>
        <Eyebrow>Practise · step 3 of 4 · build the prompt</Eyebrow>
        <h1 className="cl-h1">Pick one answer for each. The prompt writes itself.</h1>
        {flagged && <p className="cl-note" style={{ color: K.warn }}>The flagged answers are the ones the grader caught. Change them, then send again.</p>}
        <div className="cl-builder">
          {practise.builder.map((g) => (
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
          <span className="cl-hint">{nPicked} of {practise.builder.length} picked</span>
          <Btn primary disabled={!builderComplete} onClick={sendBuilt}>Send to {TOOL_LABEL[tool]}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "sandbox") {
    const v = buildBox.lastVerdict ?? buildBox.messages.find((m) => m.grade)?.grade?.verdict;
    const done = !buildBox.busy && buildBox.messages.length > 0;
    stage = (
      <>
        <Eyebrow>Practise · step 4 of 4 · the grader checks before {TOOL_LABEL[tool]} answers</Eyebrow>
        <div className="cl-banner"><span className="cl-dot" />Practice data only. Nothing you send is stored.</div>
        <CopilotSim firmName={firm.name} learnerName={learnerName} messages={toSim(buildBox.messages)} draft="" onSend={() => {}} canSend={false} composerLocked status={buildBox.status} />
        <div className="cl-nav">
          <Btn hidden={!done || v === "ok"} onClick={fixAndResend}>Fix and resend</Btn>
          <span className="cl-hint">{done ? (v === "ok" ? "Cleared send banked." : "Change the flagged answers, then resend.") : ""}</span>
          <Btn primary hidden={!done} onClick={next}>{v === "ok" ? "Continue" : "Continue anyway"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "free") {
    stage = (
      <>
        <Eyebrow>Practise · your turn, optional</Eyebrow>
        <h1 className="cl-h1">{t(practise.freeWrite.heading)}</h1>
        <p className="cl-lead">{t(practise.freeWrite.lead)}</p>
        <CopilotSim firmName={firm.name} learnerName={learnerName} messages={toSim(freeBox.messages, (r) => setFreeDraft(r))} draft={freeDraft} onDraftChange={setFreeDraft} onSend={sendFree} canSend={!!freeDraft.trim() && !freeBox.busy} status={freeBox.status} />
        <div className="cl-nav">
          <Btn onClick={back}>Back</Btn>
          <Btn primary onClick={next} disabled={freeBox.busy}>{freeSent ? "Continue to Prove" : "Skip to Prove"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "prove") {
    const q: ProveItem = block.prove[screen.i];
    const picked = proveAnswers[screen.i];
    const last = screen.i === block.prove.length - 1;
    stage = (
      <>
        <Eyebrow>Prove · snippet {screen.i + 1} of {block.prove.length} · pass at {manifest.passMark}</Eyebrow>
        <h1 className="cl-h1">Which class is this?</h1>
        <div className="cl-check solid">
          <div className="cl-snip">&ldquo;{t(q.stem)}&rdquo;</div>
          <div className="cl-opts">
            {q.options.map((o) => {
              const state = picked === null ? "" : o === q.answer ? "right" : o === picked ? "wrong" : "";
              return (
                <button key={o} type="button" disabled={picked !== null} className={`cl-opt ${state}`} onClick={() => setProveAnswers((a) => a.map((x, i) => (i === screen.i ? o : x)))}>
                  {names[o]}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="cl-fb">
              <b>{picked === q.answer ? "Correct." : `It is ${names[q.answer]}.`}</b> {t(q.why)}
            </div>
          )}
        </div>
        <div className="cl-nav">
          <span className="cl-hint">One pick. You will see the answer straight away.</span>
          <Btn primary disabled={picked === null} onClick={next}>{last ? "See my result" : "Next snippet"}</Btn>
        </div>
      </>
    );
  } else if (screen.kind === "result") {
    const clean = bestVerdict === "ok";
    const doneCount = courseMap.filter((m) => m.done || m.n === manifest.n).length;
    stage = (
      <>
        <span className="cl-stamp" style={{ color: passed ? K.ok : K.warn, borderColor: passed ? K.ok : K.warn }}>{passed ? "Module cleared" : "Not yet cleared"}</span>
        <Eyebrow>Module {manifest.n} · {manifest.title}</Eyebrow>
        <h1 className="cl-h1">{passed ? "Cleared, " : "Not yet, "}{correct} of {block.prove.length}</h1>
        <p className="cl-lead">
          {passed
            ? clean
              ? `You classified ${correct} snippets correctly and sent a cleared prompt in the sandbox. This module's score is on your record.`
              : `You classified ${correct} snippets correctly. Your sandbox send was not fully cleared; a cleared send would lift this to full marks.`
            : `Pass mark is ${manifest.passMark} of ${block.prove.length}. Go back over the three questions and try the snippets again. Nothing is recorded until you pass.`}
        </p>
        <div className="cl-label" style={{ marginTop: 22 }}>Progress to your AI Cleared certificate</div>
        <div className="cl-meter"><i style={{ width: `${(doneCount / courseMap.length) * 100}%` }} /></div>
        <div className="cl-hint">{doneCount} of {courseMap.length} modules · {TRACK_LABEL[track]} track</div>
        <div className="cl-nav">
          {passed ? (
            <>
              <span className="cl-hint">The next module reads {firm.name}&rsquo;s own approved tool list.</span>
              <Link href="/ai-cleared" className="cl-btn cl-btn-pri">Back to your course</Link>
            </>
          ) : (
            <>
              <Btn onClick={() => go(startOf("learn") + 3)}>Read the three questions again</Btn>
              <Btn primary onClick={retryProve}>Try the snippets again</Btn>
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
      {inPractise && (
        <div className="cl-dock-sec">
          <div className="cl-label">On your desk</div>
          {practise.desk.map((doc, di) => (
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
      <header className="cl-top">
        <div className="cl-top-left">
          <span className="cl-word">AI CLEARED</span>
          <span className="cl-sep" />
          <span className="cl-firm">{firm.name}</span>
          <span className="cl-sep" />
          <span className="cl-where">Module {manifest.n} · {screen.phase === "done" ? "Result" : screen.phase.charAt(0).toUpperCase() + screen.phase.slice(1)}</span>
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
        .cl-shell { min-height: 100svh; background: ${K.ground}; color: ${K.body}; font-family: ${K.sans}; font-size: 15px; line-height: 1.55; }
        .cl-top { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 18px; min-height: 52px; box-sizing: border-box; background: rgba(11,17,23,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid ${K.edge}; }
        .cl-top-left, .cl-top-right { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .cl-word { font-family: ${K.mono}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.22em; color: ${K.accentInk}; white-space: nowrap; }
        .cl-sep { width: 1px; height: 14px; background: ${K.edge}; }
        .cl-firm { color: ${K.ink}; font-weight: 600; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cl-where { color: ${K.muted}; font-size: 13px; white-space: nowrap; }
        .cl-chip { font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: ${K.ok}; background: ${K.okSoft}; border: 1px solid rgba(76,195,138,0.35); border-radius: 999px; padding: 3px 9px; white-space: nowrap; }
        .cl-learner { color: ${K.muted}; font-size: 13px; white-space: nowrap; }
        .cl-exit { color: ${K.ink}; font-size: 13px; text-decoration: none; border: 1px solid ${K.edge}; border-radius: 8px; padding: 5px 10px; }
        .cl-exit:hover { border-color: ${K.accent}; }
        .cl-desk-btn { display: none; white-space: nowrap; }
        .cl-bar { height: 2px; background: ${K.edge}; }
        .cl-bar i { display: block; height: 100%; background: ${K.accent}; transition: width 300ms ease; }

        .cl-body { display: grid; grid-template-columns: 224px minmax(0, 1fr) 300px; gap: 0; max-width: 1480px; margin: 0 auto; }
        .cl-rail { padding: 24px 18px; border-right: 1px solid ${K.edge}; position: sticky; top: 56px; align-self: start; height: calc(100svh - 56px); overflow: auto; }
        .cl-dock { padding: 24px 18px; border-left: 1px solid ${K.edge}; position: sticky; top: 56px; align-self: start; height: calc(100svh - 56px); overflow: auto; font-size: 13.5px; color: ${K.muted}; }
        .cl-dock p { margin: 0 0 6px; }
        .cl-dock b { color: ${K.body}; font-weight: 600; }
        .cl-dock-sec { margin-bottom: 22px; }
        .cl-dock-doc { border: 1px solid ${K.edge}; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: ${K.panel}; }
        .cl-dock-row { display: grid; grid-template-columns: 74px 1fr; gap: 8px; padding: 5px 10px; border-top: 1px solid ${K.edgeSoft}; color: ${K.body}; font-size: 12.5px; }
        .cl-dock-row .cl-k { color: ${K.faint}; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase; padding-top: 2px; }
        .cl-classes { display: flex; flex-wrap: wrap; gap: 6px; }

        .cl-stage { padding: 28px 28px 60px; min-width: 0; animation: cl-in 250ms ease both; }
        .cl-card { max-width: 780px; margin: 0 auto; background: ${K.panel}; border: 1px solid ${K.edge}; border-radius: 14px; padding: 30px 32px 26px; }
        @keyframes cl-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

        .cl-label { font-family: ${K.mono}; font-size: 10.5px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${K.faint}; margin-bottom: 8px; }
        .cl-eyebrow { font-family: ${K.mono}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${K.accentInk}; margin-bottom: 12px; }
        .cl-h1 { font-size: 27px; line-height: 1.2; font-weight: 600; letter-spacing: -0.015em; color: ${K.ink}; margin: 0 0 12px; text-wrap: balance; }
        .cl-lead { font-size: 16.5px; line-height: 1.55; color: ${K.body}; margin: 0 0 10px; max-width: 64ch; }
        .cl-p { margin: 0 0 12px; max-width: 66ch; }
        .cl-note { font-size: 14px; color: ${K.muted}; margin: 0; }
        .cl-hint { font-size: 13px; color: ${K.muted}; }
        .cl-nav { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; margin-top: 26px; padding-top: 18px; border-top: 1px solid ${K.edgeSoft}; }
        .cl-nav .cl-hint { margin-right: auto; }
        .cl-nav > .cl-btn:first-child:not(.cl-btn-pri) { margin-right: auto; }

        .cl-shell .cl-btn { font: inherit; font-size: 14px; font-weight: 600; color: ${K.ink}; background: transparent; border: 1px solid ${K.edge}; border-radius: 9px; padding: 9px 16px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
        .cl-shell .cl-btn:hover:not(:disabled) { border-color: ${K.accent}; }
        .cl-shell .cl-btn:disabled { opacity: 0.45; cursor: default; }
        .cl-shell .cl-btn-pri { background: ${K.accent}; border-color: ${K.accent}; color: ${K.onAccent}; }
        .cl-shell .cl-btn-pri:hover:not(:disabled) { filter: brightness(1.08); }
        .cl-shell .cl-btn-small { font-size: 12.5px; padding: 6px 11px; }
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
        .cl-opt { font: inherit; font-family: ${K.mono}; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: ${K.ink}; background: transparent; border: 1px solid ${K.edge}; border-radius: 8px; padding: 8px 13px; cursor: pointer; }
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

        .cl-shell .cl-grader { background: ${K.panel}; color: ${K.body}; border: 1px solid; border-radius: 10px; padding: 14px 16px; font-family: ${K.sans}; font-size: 14px; text-align: left; animation: cl-in 250ms ease both; }
        .cl-shell .cl-grader-top { display: flex; align-items: center; gap: 10px; color: ${K.ink}; font-weight: 500; margin-bottom: 10px; }
        .cl-shell .cl-pill { font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid; border-radius: 999px; padding: 3px 10px; }
        .cl-shell .cl-echo { background: ${K.sunk}; border-radius: 8px; padding: 10px 12px; line-height: 1.7; color: ${K.body}; white-space: pre-wrap; }
        .cl-shell .cl-finds { display: flex; flex-direction: column; gap: 7px; margin-top: 10px; }
        .cl-shell .cl-find { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; }
        .cl-shell .cl-find b { color: ${K.ink}; font-weight: 600; }
        .cl-shell .cl-why { color: ${K.muted}; }
        .cl-shell .cl-coach { margin: 12px 0 0; color: ${K.ink}; font-size: 14.5px; line-height: 1.55; }
        .cl-shell .cl-rewrite { margin-top: 12px; padding-top: 12px; border-top: 1px solid ${K.edgeSoft}; }
        .cl-shell .cl-rewrite-text { color: ${K.accentInk}; font-size: 14px; line-height: 1.55; margin-bottom: 10px; }

        .cl-stamp { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; border: 1.5px solid; border-radius: 6px; padding: 5px 10px; margin-bottom: 16px; }
        .cl-meter { height: 8px; background: ${K.sunk}; border-radius: 999px; overflow: hidden; margin: 6px 0 8px; }
        .cl-meter i { display: block; height: 100%; background: ${K.accent}; transition: width 500ms ease; }

        .cl-map, .cl-phases { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .cl-map li, .cl-phases li { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; font-size: 13.5px; color: ${K.muted}; }
        .cl-map-n { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; border: 1px solid ${K.edge}; font-family: ${K.mono}; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; }
        .cl-map-current, .cl-ph-current { color: ${K.ink}; }
        .cl-map-current .cl-map-n, .cl-ph-current .cl-map-n { border-color: ${K.accent}; color: ${K.accentInk}; background: ${K.accentSoft}; }
        .cl-map-done .cl-map-n, .cl-ph-done .cl-map-n { border-color: ${K.ok}; color: ${K.ok}; background: ${K.okSoft}; }
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
          .cl-tiles, .cl-choices { grid-template-columns: 1fr; }
          .cl-row { grid-template-columns: 22px 1fr; }
          .cl-row .cl-v { grid-column: 2; }
          .cl-row.show { grid-template-columns: 1fr auto; }
          .cl-row.show .cl-v { grid-column: 1; }
          .cl-shell .sim-copilot { grid-template-columns: minmax(0, 1fr) !important; }
          .cl-shell .sim-copilot-rail { display: none !important; }
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
          .cl-stage, .cl-rv, .cl-shell .cl-grader { animation: none; }
          .cl-bar i, .cl-meter i { transition: none; }
        }
      `}</style>
    </div>
  );
}
