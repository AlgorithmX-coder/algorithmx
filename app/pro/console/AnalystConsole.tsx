"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { T } from "./tokens";
import {
  CLASSIFICATION_LABELS,
  PORTFOLIO_KEY,
  caseCheckpointKey,
  type CaseCheckpoint,
  type CaseEntity,
  type CaseManifest,
  type ConsolePhase,
  type LogLine,
  type PortfolioEntry,
  type Severity,
  type TicketDraft,
  type TriageClassification,
} from "./types";
import case01 from "../cases/case01";

/* The Cyber Pro analyst console: walking skeleton. One case (case-01)
 * runs the whole loop end to end: queue -> investigate -> ticket ->
 * review -> portfolio. Structure here, content in app/pro/cases/.
 * Fiction-free by canon (docs/pro/cyber-pro-design.md §10). */

const ACTIVE_CASE: CaseManifest = case01;

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

const SEVERITY_COLOR: Record<Severity, string> = {
  low: T.muted,
  medium: T.amber,
  high: T.red,
  critical: T.red,
};

const EMPTY_TICKET: TicketDraft = { classification: null, severity: null, escalate: false, notes: "" };

/* ---------------- small chrome ---------------- */

function Eyebrow({ text, color = T.faint }: { text: string; color?: string }) {
  return (
    <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color }}>
      {text}
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, ...style }}>
      {children}
    </div>
  );
}

const BEATS: { key: ConsolePhase | "ticket"; label: string }[] = [
  { key: "briefing", label: "BRIEF" },
  { key: "console", label: "INVESTIGATE" },
  { key: "ticket", label: "TICKET" },
  { key: "review", label: "REVIEW" },
];

function PhasePips({ phase, ticketStarted }: { phase: ConsolePhase; ticketStarted: boolean }) {
  const activeIndex = phase === "briefing" ? 0 : phase === "review" ? 3 : ticketStarted ? 2 : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {BEATS.map((b, i) => (
        <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: T.mono, fontSize: 10, letterSpacing: "0.16em", fontWeight: 600,
            color: i === activeIndex ? T.cyan : i < activeIndex ? T.green : T.faint,
          }}>
            {b.label}
          </span>
          {i < BEATS.length - 1 && <span aria-hidden style={{ width: 18, height: 1, background: i < activeIndex ? T.green : T.edge }} />}
        </div>
      ))}
    </div>
  );
}

/* ---------------- log viewer ---------------- */

function LogText({ line, onEntity }: { line: LogLine; onEntity: (id: string) => void }) {
  const parts = useMemo(() => {
    const ents = (line.entities ?? [])
      .map((id) => ACTIVE_CASE.entities.find((e) => e.id === id))
      .filter((e): e is CaseEntity => Boolean(e));
    if (!ents.length) return [<span key="t">{line.text}</span>];
    const pattern = new RegExp(`(${ents.map((e) => e.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
    return line.text.split(pattern).map((chunk, i) => {
      const ent = ents.find((e) => e.label === chunk);
      if (!ent) return <span key={i}>{chunk}</span>;
      return (
        <button
          key={i}
          onClick={() => onEntity(ent.id)}
          title={`Pivot to ${ent.label}`}
          style={{
            background: T.primarySoft, color: T.ink, border: `1px solid ${T.edge}`,
            borderRadius: 4, padding: "0 5px", margin: "0 1px", cursor: "pointer",
            font: "inherit", fontWeight: 600,
          }}>
          {chunk}
        </button>
      );
    });
  }, [line, onEntity]);

  return <>{parts}</>;
}

function LogViewer({ onEntity }: { onEntity: (id: string) => void }) {
  return (
    <div style={{ fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.9, overflowX: "auto", padding: "14px 16px" }}>
      {ACTIVE_CASE.logs.map((line, i) => (
        <div key={i} style={{ display: "flex", gap: 12, whiteSpace: "nowrap" }}>
          <span style={{ color: T.faint }}>{line.t}</span>
          <span style={{ color: T.faint, minWidth: 104 }}>{line.source}</span>
          {line.eventId !== undefined && (
            <span style={{ color: line.eventId === 4625 ? T.red : line.eventId === 4624 ? T.green : T.amber, fontWeight: 600, minWidth: 38 }}>
              {line.eventId}
            </span>
          )}
          <span style={{ color: T.ink }}><LogText line={line} onEntity={onEntity} /></span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- entity cards ---------------- */

function EntityPane({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const entity = ACTIVE_CASE.entities.find((e) => e.id === selected) ?? null;
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ACTIVE_CASE.entities.map((e) => (
          <button key={e.id} onClick={() => onSelect(e.id)}
            style={{
              fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
              padding: "5px 10px", borderRadius: 6,
              background: e.id === selected ? T.primarySoft : "transparent",
              border: `1px solid ${e.id === selected ? T.primary : T.edge}`,
              color: e.id === selected ? T.ink : T.muted,
            }}>
            {e.kind.toUpperCase()} · {e.label}
          </button>
        ))}
      </div>
      {entity ? (
        <Panel style={{ background: T.bgRaise, padding: "14px 16px" }}>
          <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink, marginBottom: 10 }}>{entity.title}</div>
          <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "6px 18px", fontSize: 13 }}>
            {entity.rows.map((r, i) => (
              <div key={i} style={{ display: "contents" }}>
                <span style={{ color: T.faint, fontFamily: T.mono, fontSize: 11.5 }}>{r.k}</span>
                <span style={{ color: T.ink }}>{r.v}</span>
              </div>
            ))}
          </div>
          {entity.note && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: T.cyan, borderLeft: `2px solid ${T.cyan}`, paddingLeft: 10 }}>
              {entity.note}
            </p>
          )}
        </Panel>
      ) : (
        <p style={{ color: T.faint, fontSize: 13, margin: 0 }}>
          Select an entity above, or click any highlighted value inside the logs to pivot to it.
        </p>
      )}
    </div>
  );
}

/* ---------------- markdown export ---------------- */

function buildMarkdown(ticket: TicketDraft): string {
  const c = ACTIVE_CASE;
  return [
    `# Investigation write-up · ${c.alertId}`,
    ``,
    `**Case:** ${c.title}`,
    `**Classification:** ${ticket.classification ? CLASSIFICATION_LABELS[ticket.classification] : "-"}`,
    `**Severity:** ${ticket.severity ?? "-"} · **Escalated:** ${ticket.escalate ? "Yes" : "No"}`,
    `**ATT&CK:** ${c.attack.techniqueId} ${c.attack.techniqueName}`,
    ``,
    `## Notes`,
    ticket.notes.trim() || "_(none)_",
    ``,
    `_Produced in the Cyber Pro analyst console (training simulation)._`,
  ].join("\n");
}

/* ---------------- the console ---------------- */

export default function AnalystConsole() {
  const [phase, setPhase] = useState<ConsolePhase>("briefing");
  const [tab, setTab] = useState<"logs" | "entities">("logs");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketDraft>(EMPTY_TICKET);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  /* resume: hydrate from localStorage once, client-side only */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(caseCheckpointKey(ACTIVE_CASE.id));
      if (raw) {
        const cp = JSON.parse(raw) as CaseCheckpoint;
        if (cp.caseId === ACTIVE_CASE.id) {
          setPhase(cp.phase);
          setTicket({ ...EMPTY_TICKET, ...cp.ticket });
          setWrongAttempts(cp.hintsUsed ?? 0);
        }
      }
      const pf = localStorage.getItem(PORTFOLIO_KEY);
      if (pf) setPortfolio(JSON.parse(pf) as PortfolioEntry[]);
    } catch {
      /* corrupt checkpoint: start fresh */
    }
    setRestored(true);
  }, []);

  /* persist checkpoint on every meaningful change */
  useEffect(() => {
    if (!restored) return;
    const cp: CaseCheckpoint = { caseId: ACTIVE_CASE.id, phase, ticket, hintsUsed: wrongAttempts };
    try { localStorage.setItem(caseCheckpointKey(ACTIVE_CASE.id), JSON.stringify(cp)); } catch { /* storage full/blocked */ }
  }, [restored, phase, ticket, wrongAttempts]);

  const pivotToEntity = useCallback((id: string) => {
    setTab("entities");
    setSelectedEntity(id);
  }, []);

  const evidenceHits = useMemo(() => {
    const notes = ticket.notes.toLowerCase();
    return ACTIVE_CASE.evidenceKeywords.filter((k) => notes.includes(k.toLowerCase()));
  }, [ticket.notes]);

  const submit = () => {
    if (!ticket.classification || !ticket.severity) return;
    if (ticket.classification !== ACTIVE_CASE.correct.classification) {
      setWrongAttempts((n) => n + 1);
      setHintOpen(true);
      return;
    }
    setHintOpen(false);
    setPhase("review");
    const entry: PortfolioEntry = {
      id: ACTIVE_CASE.id,
      title: `Investigation write-up · ${ACTIVE_CASE.alertId} ${ACTIVE_CASE.title}`,
      markdown: buildMarkdown(ticket),
      savedAt: new Date().toISOString(),
    };
    setPortfolio((prev) => {
      const next = [...prev.filter((p) => p.id !== entry.id), entry];
      try { localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const restartCase = () => {
    setTicket(EMPTY_TICKET);
    setWrongAttempts(0);
    setHintOpen(false);
    setSelectedEntity(null);
    setTab("logs");
    setPhase("console");
  };

  const copyMarkdown = async (md: string) => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked; download still works */ }
  };

  const downloadMarkdown = (md: string) => {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyber-pro-${ACTIVE_CASE.id}-writeup.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hint = wrongAttempts > 0 ? ACTIVE_CASE.hints[Math.min(wrongAttempts - 1, ACTIVE_CASE.hints.length - 1)] : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: T.sans }}>
      <style>{`
        .pro-console :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .pro-console ::selection { background: ${T.primary}; color: #fff; }
        .pro-console textarea::placeholder { color: ${T.faint}; }
      `}</style>

      <div className="pro-console" style={{ maxWidth: 1360, margin: "0 auto", padding: "18px 22px 60px" }}>
        {/* header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "6px 2px 16px", borderBottom: `1px solid ${T.edge}`, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
            <Eyebrow text="Analyst console · training queue" color={T.muted} />
          </div>
          <PhasePips phase={phase} ticketStarted={Boolean(ticket.classification || ticket.notes)} />
          <button onClick={() => setDrawerOpen(true)}
            style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: T.green, background: T.greenSoft, border: `1px solid ${T.green}55`, borderRadius: 7, padding: "7px 13px", cursor: "pointer" }}>
            PORTFOLIO ({portfolio.length})
          </button>
        </header>

        {/* briefing */}
        {phase === "briefing" && (
          <main style={{ maxWidth: 640, margin: "9vh auto 0" }}>
            <Eyebrow text="Week 4 preview · the triage loop" color={T.primary} />
            <h1 style={{ fontFamily: T.display, fontSize: 30, fontWeight: 700, margin: "12px 0 14px", lineHeight: 1.25 }}>
              An alert just fired. Work it like an analyst.
            </h1>
            <p style={{ color: T.muted, fontSize: 15.5, lineHeight: 1.7, margin: "0 0 10px" }}>
              This is the loop that defines the job: read the alert, read the logs, enrich what you find, decide what happened, and write it up so the next person can act. In a real security operations centre you would see 20 to 100 of these per shift, and most are noise. The skill is telling which ones are not.
            </p>
            <p style={{ color: T.muted, fontSize: 15.5, lineHeight: 1.7, margin: "0 0 26px" }}>
              Everything here is offline training data. Nothing you do leaves the page, and the write-up you produce is yours to keep: it becomes the first artifact in your portfolio.
            </p>
            <button onClick={() => setPhase("console")}
              style={{ fontFamily: T.display, fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 10, padding: "13px 26px", cursor: "pointer" }}>
              Open the queue
            </button>
          </main>
        )}

        {/* console */}
        {phase === "console" && (
          <main style={{ display: "grid", gridTemplateColumns: "252px minmax(430px, 1fr) 330px", gap: 14, marginTop: 16, alignItems: "start" }}>
            {/* queue */}
            <Panel style={{ padding: 12 }}>
              <Eyebrow text="Alert queue" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <div style={{ border: `1px solid ${T.primary}`, background: T.primarySoft, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 10.5 }}>
                    <span style={{ color: T.cyan, fontWeight: 600 }}>{ACTIVE_CASE.alertId}</span>
                    <span style={{ color: SEVERITY_COLOR[ACTIVE_CASE.severityAuto], fontWeight: 600, textTransform: "uppercase" }}>{ACTIVE_CASE.severityAuto}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, margin: "6px 0 4px" }}>{ACTIVE_CASE.title}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint }}>{ACTIVE_CASE.firedAt} · {ACTIVE_CASE.source}</div>
                </div>
                {["Suspicious inbox rule created", "PowerShell spawned from Office app"].map((t, i) => (
                  <div key={i} style={{ border: `1px dashed ${T.edge}`, borderRadius: 8, padding: "10px 12px", opacity: 0.55 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: T.muted }}>{t}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, marginTop: 4 }}>Arrives with the full course</div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* investigation */}
            <Panel>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.edge}` }}>
                <Eyebrow text="Alert summary" />
                <p style={{ margin: "8px 0 0", fontSize: 13.5, color: T.ink, lineHeight: 1.6 }}>{ACTIVE_CASE.summary}</p>
              </div>
              <div style={{ display: "flex", gap: 2, padding: "10px 16px 0" }}>
                {(["logs", "entities"] as const).map((k) => (
                  <button key={k} onClick={() => setTab(k)}
                    style={{
                      fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: tab === k ? T.cyan : T.faint, background: "transparent", cursor: "pointer",
                      border: "none", borderBottom: `2px solid ${tab === k ? T.cyan : "transparent"}`, padding: "6px 12px 8px",
                    }}>
                    {k}
                  </button>
                ))}
              </div>
              {tab === "logs" ? <LogViewer onEntity={pivotToEntity} /> : <EntityPane selected={selectedEntity} onSelect={setSelectedEntity} />}
            </Panel>

            {/* ticket */}
            <Panel style={{ padding: 14 }}>
              <Eyebrow text="Triage ticket" />

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6 }}>Classification</div>
                {(Object.keys(CLASSIFICATION_LABELS) as TriageClassification[]).map((k) => (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0", cursor: "pointer" }}>
                    <input type="radio" name="classification" checked={ticket.classification === k}
                      onChange={() => setTicket((t) => ({ ...t, classification: k }))} />
                    {CLASSIFICATION_LABELS[k]}
                  </label>
                ))}
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6 }}>Severity</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {SEVERITIES.map((s) => (
                    <button key={s} onClick={() => setTicket((t) => ({ ...t, severity: s }))}
                      style={{
                        fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                        padding: "6px 9px", borderRadius: 6, cursor: "pointer",
                        background: ticket.severity === s ? T.primarySoft : "transparent",
                        border: `1px solid ${ticket.severity === s ? T.primary : T.edge}`,
                        color: ticket.severity === s ? T.ink : T.muted,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, margin: "14px 0 0", cursor: "pointer" }}>
                <input type="checkbox" checked={ticket.escalate}
                  onChange={(e) => setTicket((t) => ({ ...t, escalate: e.target.checked }))} />
                Escalate to Tier 2 / incident response
              </label>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6 }}>
                  Write-up <span style={{ fontWeight: 400, color: T.faint }}>(cite your evidence: event ids, addresses, accounts)</span>
                </div>
                <textarea value={ticket.notes}
                  onChange={(e) => setTicket((t) => ({ ...t, notes: e.target.value }))}
                  placeholder={"What happened:\n\nEvidence:\n\nRecommended action:"}
                  rows={9}
                  style={{
                    width: "100%", resize: "vertical", boxSizing: "border-box",
                    background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 8,
                    fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.6, padding: "10px 12px",
                  }} />
                <div style={{ fontFamily: T.mono, fontSize: 10.5, color: evidenceHits.length >= 3 ? T.green : T.faint, marginTop: 5 }}>
                  Evidence cited: {evidenceHits.length} / {ACTIVE_CASE.evidenceKeywords.length}
                </div>
              </div>

              {hintOpen && hint && (
                <div style={{ marginTop: 12, background: T.amberSoft, border: `1px solid ${T.amber}66`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: T.ink, lineHeight: 1.55 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.16em", color: T.amber, display: "block", marginBottom: 4 }}>
                    NOT QUITE · HINT {Math.min(wrongAttempts, ACTIVE_CASE.hints.length)}
                  </span>
                  {hint}
                </div>
              )}

              <button onClick={submit} disabled={!ticket.classification || !ticket.severity}
                style={{
                  marginTop: 14, width: "100%", padding: "12px 0", borderRadius: 9, cursor: ticket.classification && ticket.severity ? "pointer" : "not-allowed",
                  fontFamily: T.display, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em",
                  color: "#fff", border: "none",
                  background: ticket.classification && ticket.severity ? `linear-gradient(135deg, ${T.primary}, ${T.cyan})` : T.edge,
                  opacity: ticket.classification && ticket.severity ? 1 : 0.6,
                }}>
                SUBMIT TICKET
              </button>
            </Panel>
          </main>
        )}

        {/* review */}
        {phase === "review" && (
          <main style={{ maxWidth: 720, margin: "40px auto 0" }}>
            <div style={{ background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.18em", color: T.green, fontWeight: 600 }}>CASE CLOSED · CORRECT CALL</span>
              <div style={{ fontSize: 14.5, marginTop: 6 }}>
                {CLASSIFICATION_LABELS[ACTIVE_CASE.correct.classification]}. {ACTIVE_CASE.attack.techniqueId} {ACTIVE_CASE.attack.techniqueName} leading to a compromised account.
              </div>
            </div>

            <Panel style={{ padding: "16px 20px", marginBottom: 16 }}>
              <Eyebrow text="Your ticket, reviewed" />
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12, fontSize: 13.5 }}>
                <div>
                  <span style={{ color: T.green, fontWeight: 700 }}>&#10003; Classification</span>
                  <span style={{ color: T.muted }}> · exactly right{wrongAttempts > 0 ? ` (after ${wrongAttempts} ${wrongAttempts === 1 ? "hint" : "hints"}, which is how learning works)` : ", first try"}.</span>
                </div>
                <div>
                  {ticket.escalate === ACTIVE_CASE.correct.escalate ? (
                    <><span style={{ color: T.green, fontWeight: 700 }}>&#10003; Escalation</span><span style={{ color: T.muted }}> · a compromised account needs containment beyond Tier 1: reset, revoke, investigate.</span></>
                  ) : (
                    <><span style={{ color: T.amber, fontWeight: 700 }}>&#8226; Escalation</span><span style={{ color: T.muted }}> · this one needed escalating: the account is compromised and containment (reset, revoke, investigate) is beyond Tier 1.</span></>
                  )}
                </div>
                <div>
                  {ticket.severity === ACTIVE_CASE.correct.severity ? (
                    <><span style={{ color: T.green, fontWeight: 700 }}>&#10003; Severity</span><span style={{ color: T.muted }}> · high is the right call for a successful compromise of an unprotected account.</span></>
                  ) : (
                    <><span style={{ color: T.amber, fontWeight: 700 }}>&#8226; Severity</span><span style={{ color: T.muted }}> · you set {ticket.severity}; a successful sign-in by an attacker warrants high. The auto-severity on the alert was only medium: detections guess, analysts decide.</span></>
                  )}
                </div>
                <div>
                  {evidenceHits.length >= 3 ? (
                    <><span style={{ color: T.green, fontWeight: 700 }}>&#10003; Evidence</span><span style={{ color: T.muted }}> · you cited {evidenceHits.length} concrete indicators ({evidenceHits.join(", ")}). This is what makes a ticket actionable.</span></>
                  ) : (
                    <><span style={{ color: T.amber, fontWeight: 700 }}>&#8226; Evidence</span><span style={{ color: T.muted }}> · only {evidenceHits.length || "none"} of the concrete indicators made it into your write-up. A ticket that cites 4625, 4624, the source address, and the account lets the next person act without re-doing your work.</span></>
                  )}
                </div>
              </div>
            </Panel>

            <Panel style={{ padding: "16px 20px", marginBottom: 16 }}>
              <Eyebrow text="How a working analyst reads this case" />
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                {ACTIVE_CASE.debrief.map((d, i) => (
                  <li key={i} style={{ fontSize: 13.5, lineHeight: 1.65, color: T.ink }}>{d}</li>
                ))}
              </ul>
            </Panel>

            <Panel style={{ padding: "16px 20px", borderColor: `${T.green}55` }}>
              <Eyebrow text="Saved to your portfolio" color={T.green} />
              <p style={{ fontSize: 13.5, color: T.muted, margin: "10px 0 14px", lineHeight: 1.6 }}>
                Your write-up is portfolio artifact #1: a real investigation, documented. Export it, improve it, publish it. Five of these plus a capstone is what you leave the course with.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => copyMarkdown(buildMarkdown(ticket))}
                  style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, padding: "9px 14px", borderRadius: 8, cursor: "pointer", background: T.greenSoft, color: T.green, border: `1px solid ${T.green}66` }}>
                  {copied ? "COPIED" : "COPY MARKDOWN"}
                </button>
                <button onClick={() => downloadMarkdown(buildMarkdown(ticket))}
                  style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, padding: "9px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", color: T.muted, border: `1px solid ${T.edge}` }}>
                  DOWNLOAD .MD
                </button>
                <button onClick={restartCase}
                  style={{ fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, padding: "9px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", color: T.faint, border: `1px solid ${T.edge}` }}>
                  RESTART CASE
                </button>
              </div>
            </Panel>
          </main>
        )}
      </div>

      {/* portfolio drawer */}
      {drawerOpen && (
        <div role="dialog" aria-label="Portfolio" style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div onClick={() => setDrawerOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(420px, 92vw)", background: T.bgRaise, borderLeft: `1px solid ${T.edge}`, padding: "20px 22px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16 }}>Portfolio</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close portfolio"
                style={{ background: "transparent", border: `1px solid ${T.edge}`, color: T.muted, borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: T.mono, fontSize: 11 }}>
                CLOSE
              </button>
            </div>
            {portfolio.length === 0 ? (
              <p style={{ color: T.faint, fontSize: 13.5, lineHeight: 1.6 }}>
                Empty so far. Close your first case and the write-up lands here: real artifacts you keep, not badges.
              </p>
            ) : portfolio.map((p) => (
              <Panel key={p.id} style={{ padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint, marginBottom: 10 }}>
                  Saved {new Date(p.savedAt).toLocaleString("en-GB")}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => copyMarkdown(p.markdown)}
                    style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: T.greenSoft, color: T.green, border: `1px solid ${T.green}66` }}>
                    COPY
                  </button>
                  <button onClick={() => downloadMarkdown(p.markdown)}
                    style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", color: T.muted, border: `1px solid ${T.edge}` }}>
                    DOWNLOAD
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
