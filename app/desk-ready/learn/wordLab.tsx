"use client";

import { useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import WordApp, { type OpenDoc } from "../office/apps/Word";
import Viewer from "../office/apps/Viewer";
import { officeFolders } from "../office/northfield";
import type { Action } from "../office/store";
import type { OfficeFile, OfficeState, WordDoc } from "../office/types";
import { OFFICE_CSS } from "../office/ui";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace } from "./ui";

/* WordLab: a lesson task in the office's own Word (office/apps/Word), so
 * styles, placeholders, the spelling check, tracked changes, form fields
 * and Save as PDF all behave exactly as they will in the office jobs. Each
 * task gets a small pretend office of its own (the usual OneDrive and
 * SharePoint folders plus the task's files), so File > Save As and Save as
 * PDF have somewhere real to put things. "Check my document" runs the
 * lesson's rules on the open document and on what was saved. Nothing is
 * kept: it's practice. */

export interface WordRule {
  label: string;
  /* `doc` is the document open in Word now (saved or not); `state` holds
   * what has been saved, PDFs included. */
  test: (doc: WordDoc | null, state: OfficeState, open: OpenDoc | null) => boolean;
  hint: string;
}

export interface WordTask {
  scenario: string;
  /* Extra files in the pretend office: a template, an older letter. */
  files?: OfficeFile[];
  /* The file Word opens on, by id, or nothing for Word's start screen. */
  open?: string;
  rules: WordRule[];
}

/* The bits of the office's record a practice Word needs. */
function reducer(s: OfficeState, a: Action): OfficeState {
  if (a.type === "saveFile") return { ...s, files: [...s.files.filter((f) => f.id !== a.file.id), a.file] };
  if (a.type === "update") return a.fn(s);
  return s;
}

function TaskWord({ task, onDoc }: { task: WordTask; onDoc: (d: OpenDoc | null, s: OfficeState) => void }) {
  /* the task's own files take the place of any standard file of the same name */
  const [state, dispatch] = useReducer(reducer, task, (t) => {
    const mine = t.files ?? [];
    const standard = officeFolders().filter((f) => !mine.some((m) => m.name === f.name && m.path.join("/") === f.path.join("/")));
    return { version: 1, files: [...standard, ...mine], emails: [] };
  });
  const [viewer, setViewer] = useState<OfficeFile | null>(null);
  const open = useRef<OpenDoc | null>(null);
  const request = task.open ? { fileId: task.open, key: 1 } : null;
  useEffect(() => onDoc(open.current, state), [state, onDoc]);
  return (
    <div className="of-office" style={{ position: "relative", height: 560, borderRadius: 8, overflow: "hidden", boxShadow: W.float, colorScheme: "light" }}>
      <WordApp
        practice
        state={state}
        dispatch={dispatch}
        request={request}
        show={() => {}}
        openFile={(f) => setViewer(f)}
        onDoc={(d) => {
          open.current = d;
          onDoc(d, state);
        }}
      />
      {viewer && <Viewer title={viewer.name} doc={viewer.doc} onClose={() => setViewer(null)} />}
      <style>{OFFICE_CSS}</style>
    </div>
  );
}

export function WordLab({ tasks, onDone }: LabProps & { tasks: WordTask[] }) {
  const [at, setAt] = useState(0);
  const [results, setResults] = useState<(boolean[] | null)[]>(() => tasks.map(() => null));
  const [finished, setFinished] = useState(false);
  const live = useRef<{ doc: OpenDoc | null; state: OfficeState | null }>({ doc: null, state: null });
  const resultRef = useRef<HTMLDivElement>(null);
  const task = tasks[at];
  const result = results[at];
  const allPass = !!result && result.every(Boolean);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  function check() {
    const { doc, state } = live.current;
    const r = task.rules.map((rule) => {
      try {
        return rule.test(doc?.doc ?? null, state ?? { version: 1, files: [], emails: [] }, doc);
      } catch {
        return false;
      }
    });
    setResults((rs) => rs.map((x, i) => (i === at ? r : x)));
  }

  function next() {
    if (at + 1 < tasks.length) {
      live.current = { doc: null, state: null };
      setAt(at + 1);
      return;
    }
    const total = tasks.reduce((n, t) => n + t.rules.length, 0);
    const correct = results.reduce((n, r) => n + (r ? r.filter(Boolean).length : 0), 0);
    setFinished(true);
    onDone({ correct, total });
  }

  if (finished) {
    return (
      <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: D.goodSoft, border: `1px solid ${D.goodEdge}`, fontSize: 16.5, lineHeight: 1.55, color: D.body }}>
        <Tick />
        <span>Done. Nothing in these documents is saved anywhere: it was practice.</span>
      </div>
    );
  }

  return (
    <div>
      {tasks.length > 1 && <StepBar at={at + 1} of={tasks.length} label="Task" />}
      <div style={{ marginTop: tasks.length > 1 ? 14 : 0, whiteSpace: "pre-wrap", background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body }}>
        <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
        <div>{task.scenario}</div>
      </div>

      <Workspace style={{ marginTop: 14, padding: 10 }}>
        <TaskWord
          key={at}
          task={task}
          onDoc={(doc, state) => {
            live.current = { doc, state };
          }}
        />
      </Workspace>

      <div style={{ marginTop: 14 }}>
        <Button onClick={check}>Check my document</Button>
      </div>

      {result && (
        <div
          ref={resultRef}
          role="status"
          className="dr-glass"
          style={{ marginTop: 16, position: "relative", background: allPass ? D.goodSoft : D.warnSoft, border: `1px solid ${allPass ? D.goodEdge : D.warnEdge}`, borderRadius: 16, padding: "18px 18px 20px", color: D.body, ["--acc" as string]: allPass ? D.good : D.warn } as CSSProperties}
        >
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>{allPass ? "That document is spot on." : "Nearly there. Fix these, then check again:"}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
            {task.rules.map((rule, i) => (
              <li key={rule.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
                {result[i] ? <Tick /> : <Cross />}
                <span>
                  <b style={{ color: D.ink }}>{rule.label}</b>
                  {!result[i] && <span style={{ display: "block", color: D.muted }}>{rule.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16 }}>
            {allPass ? (
              <Button onClick={next}>{at + 1 < tasks.length ? "Next task" : "Finish"}</Button>
            ) : (
              <Button kind="plain" onClick={next}>
                Skip this one for now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
