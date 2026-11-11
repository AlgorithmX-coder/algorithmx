"use client";

import { useState, type CSSProperties } from "react";
import { ShareIcon } from "../office/apps/Share";
import { FileGlyph } from "../office/ui";
import type { FileKind } from "../office/types";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, StepBar, Tick, Workspace } from "./ui";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * SendLab: link or attachment? (criteria SP-6). Each task is an email to
 * someone, in an Outlook look-alike. The learner presses Insert link or
 * Attach file, picks the file, and presses Send. Only one way is right:
 * a link to the team's file for a colleague, a PDF attached for someone
 * outside. The answer explains why, and a wrong pick can be put right. */

export interface SendFile {
  name: string;
  kind: FileKind;
  where: string;
}

export interface SendTask {
  /* who the email is to, and what they asked */
  to: string;
  org: string;
  outside?: boolean;
  ask: string;
  subject: string;
  files: SendFile[];
  /* the right way: how, and which file (by index) */
  how: "link" | "attach";
  file: number;
  /* why, for each wrong way and the right one */
  right: string;
  wrongHow: string;
  wrongFile: string;
}

type Pick = { how: "link" | "attach"; file: number };

export function SendLab({ tasks, onDone }: LabProps & { tasks: SendTask[] }) {
  const [at, setAt] = useState(0);
  const [how, setHow] = useState<"link" | "attach" | null>(null);
  const [chosen, setChosen] = useState<Pick | null>(null);
  const [sent, setSent] = useState<Pick | null>(null);
  const [tries, setTries] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);
  const t = tasks[at];
  const ok = !!sent && sent.how === t.how && sent.file === t.file;

  const send = () => {
    if (!chosen) return;
    if (tries === 0 && chosen.how === t.how && chosen.file === t.file) setFirstTry((n) => n + 1);
    setTries((n) => n + 1);
    setSent(chosen);
  };
  const next = () => {
    if (at + 1 < tasks.length) {
      setAt(at + 1);
      setHow(null);
      setChosen(null);
      setSent(null);
      setTries(0);
    } else {
      setFinished(true);
      onDone({ correct: firstTry, total: tasks.length });
    }
  };

  if (finished) {
    return (
      <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: D.goodSoft, border: `1px solid ${D.goodEdge}`, fontSize: 16.5, lineHeight: 1.55, color: D.body }}>
        <Tick />
        <span>
          All sent the right way. You got <b>{firstTry} of {tasks.length}</b> right first time.
        </span>
      </div>
    );
  }

  const btn: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "6px 14px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page, color: W.ink, fontFamily: W.font, fontSize: 15.5, cursor: "pointer" };
  const chosenFile = chosen ? t.files[chosen.file] : null;

  return (
    <div>
      <StepBar at={at + 1} of={tasks.length} label="Email" />
      <div style={{ marginTop: 14, background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body }}>
        <b style={{ color: D.ink }}>{t.to}</b> ({t.org}) asks: &ldquo;{t.ask}&rdquo;
        <span style={{ display: "block", marginTop: 4, color: D.muted }}>Insert a link or attach a file, pick the file, then press Send.</span>
      </div>
      <Workspace style={{ marginTop: 14, padding: 10 }}>
        <div style={{ borderRadius: 10, overflow: "hidden", background: W.page, color: W.ink, fontFamily: W.font, boxShadow: W.float, colorScheme: "light" }}>
          <div style={{ background: W.outlook, color: "#fff", padding: "8px 14px", fontSize: 14, fontWeight: 700 }}>New message</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 14px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
            <button type="button" onClick={send} disabled={!chosen || ok} style={{ ...btn, border: "none", background: W.outlook, color: "#fff", fontWeight: 700, opacity: !chosen || ok ? 0.5 : 1, cursor: !chosen || ok ? "not-allowed" : "pointer" }}>
              ➤ Send
            </button>
            <button type="button" aria-pressed={how === "link"} onClick={() => !ok && (setHow("link"), setSent(null))} style={{ ...btn, background: how === "link" ? W.select : W.page, borderColor: how === "link" ? W.outlook : W.edge }}>
              {ShareIcon.link(17, W.outlook)} Insert link
            </button>
            <button type="button" aria-pressed={how === "attach"} onClick={() => !ok && (setHow("attach"), setSent(null))} style={{ ...btn, background: how === "attach" ? W.select : W.page, borderColor: how === "attach" ? W.outlook : W.edge }}>
              📎 Attach file
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, minHeight: 46, padding: "4px 14px", borderBottom: `1px solid ${W.edge}`, fontSize: 15.5 }}>
            <span style={{ width: 64, color: W.muted }}>To</span>
            <span style={{ padding: "3px 12px", borderRadius: 14, background: t.outside ? "#fde7d9" : W.select }}>{t.to}</span>
            {t.outside && <span style={{ fontSize: 13.5, fontWeight: 600, color: "#8a3c00" }}>Outside Northfield Supplies</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 46, padding: "4px 14px", borderBottom: `1px solid ${W.edge}`, fontSize: 15.5 }}>
            <span style={{ width: 64, color: W.muted }}>Subject</span>
            {t.subject}
          </div>
          {chosen && chosenFile && (
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${W.edge}` }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "4px 12px", borderRadius: 6, border: `1px solid ${W.edge}`, fontSize: 15, color: chosen.how === "link" ? W.outlook : W.ink }}>
                {chosen.how === "link" ? ShareIcon.link(16, W.outlook) : "📎"} <FileGlyph kind={chosenFile.kind} size={18} /> {chosenFile.name}
              </span>
            </div>
          )}
          {how && !ok && (
            <div role="listbox" aria-label={how === "link" ? "Insert a link to" : "Attach a copy of"} style={{ margin: "12px 14px", border: `1px solid ${W.edge}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", background: W.chrome, fontSize: 14, fontWeight: 600 }}>{how === "link" ? "Insert a link to a file" : "Attach a copy of a file"}</div>
              {t.files.map((f, i) => {
                const on = chosen?.how === how && chosen.file === i;
                return (
                  <button
                    key={f.name}
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      setChosen({ how, file: i });
                      setSent(null);
                    }}
                    className="of-row"
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "6px 12px", border: "none", borderTop: `1px solid ${W.edge}`, background: on ? W.select : W.page, textAlign: "left", fontFamily: W.font, color: W.ink, cursor: "pointer" }}
                  >
                    <FileGlyph kind={f.kind} />
                    <span style={{ minWidth: 0 }}>
                      <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{f.name}</b>
                      <span style={{ fontSize: 13, color: W.muted }}>{f.where}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ padding: "12px 16px 18px", fontSize: 15.5, lineHeight: 1.6, color: W.body, whiteSpace: "pre-wrap" }}>{`Hi ${t.to.split(" ")[0]},\n\n${chosen ? (chosen.how === "link" ? "Here's the link." : "It's attached.") : ""}\n\nThanks`}</div>
        </div>
      </Workspace>
      {sent && (
        <div role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
          {ok ? <Tick /> : <Cross />}
          <div>
            <b>{ok ? "Right. " : "Not quite. "}</b>
            {ok ? t.right : sent.how !== t.how ? t.wrongHow : t.wrongFile}
            {!ok && " Change it and press Send again."}
          </div>
        </div>
      )}
      {ok && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={next}>{at + 1 < tasks.length ? "Next email" : "Finish"}</Button>
        </div>
      )}
    </div>
  );
}
