"use client";

import { useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import Explorer from "../office/apps/Explorer";
import Viewer from "../office/apps/Viewer";
import { officeFolders } from "../office/northfield";
import { apply } from "../office/store";
import { tabsOf, type OfficeFile, type OfficeState, type Path } from "../office/types";
import { OFFICE_CSS } from "../office/ui";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace } from "./ui";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * FilesLab: a lesson task in the office's own File Explorer (office/apps/
 * Explorer), so New folder, Rename, Move to, dragging onto a folder, the
 * Recycle bin, Version history and the Share box all behave exactly as
 * they will in the office jobs. Each task gets a small pretend office of
 * its own: the usual OneDrive and SharePoint folders plus the task's files.
 * "Check my files" runs the lesson's rules on what the folders hold now.
 * Nothing is kept: it's practice. */

export interface FilesRule {
  label: string;
  test: (s: OfficeState) => boolean;
  hint: string;
}

export interface FilesTask {
  scenario: string;
  files: OfficeFile[];
  /* The folder File Explorer opens on. */
  start?: Path;
  rules: FilesRule[];
}

/* The standard folders, plus a Drafts folder in your OneDrive. */
export function practiceOffice(files: OfficeFile[]): OfficeState {
  const standard = officeFolders();
  standard.push({ id: "lab-dir-drafts", path: ["OneDrive", "Documents"], name: "Drafts", kind: "folder", modified: "02/11/2026", by: "You", seeded: true });
  const kept = standard.filter((f) => !files.some((m) => m.name === f.name && m.path.join("/") === f.path.join("/")));
  return { version: 1, files: [...kept, ...files], emails: [] };
}

function TaskExplorer({ task, onState }: { task: FilesTask; onState: (s: OfficeState) => void }) {
  const [state, dispatch] = useReducer(apply, task, (t) => practiceOffice(t.files));
  const [viewer, setViewer] = useState<OfficeFile | null>(null);
  useEffect(() => onState(state), [state, onState]);
  return (
    <div style={{ overflowX: "auto", borderRadius: 8 }}>
      <div className="of-office" style={{ position: "relative", minWidth: 820, height: 540, borderRadius: 8, overflow: "hidden", boxShadow: W.float, colorScheme: "light" }}>
        <Explorer state={state} dispatch={dispatch} onOpen={setViewer} start={task.start} />
        {viewer && <Viewer key={viewer.id} title={viewer.name} paper={viewer.paper} doc={viewer.doc} sheet={tabsOf(viewer)[0]?.grid} label={viewer.kind === "docx" ? "Word" : undefined} onClose={() => setViewer(null)} />}
        <style>{OFFICE_CSS}</style>
      </div>
    </div>
  );
}

export function FilesLab({ tasks, onDone }: LabProps & { tasks: FilesTask[] }) {
  const [at, setAt] = useState(0);
  const [results, setResults] = useState<(boolean[] | null)[]>(() => tasks.map(() => null));
  const [finished, setFinished] = useState(false);
  const live = useRef<OfficeState | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const task = tasks[at];
  const result = results[at];
  const allPass = !!result && result.every(Boolean);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  function check() {
    const s = live.current ?? practiceOffice(task.files);
    const r = task.rules.map((rule) => {
      try {
        return rule.test(s);
      } catch {
        return false;
      }
    });
    setResults((rs) => rs.map((x, i) => (i === at ? r : x)));
  }

  function next() {
    if (at + 1 < tasks.length) {
      live.current = null;
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
        <span>Done. Nothing in these folders is kept anywhere: it was practice.</span>
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
        <TaskExplorer
          key={at}
          task={task}
          onState={(s) => {
            live.current = s;
          }}
        />
      </Workspace>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, color: D.faint }}>On a phone, slide File Explorer sideways to see all of it.</p>

      <div style={{ marginTop: 14 }}>
        <Button onClick={check}>Check my files</Button>
      </div>

      {result && (
        <div
          ref={resultRef}
          role="status"
          className="dr-glass"
          style={{ marginTop: 16, position: "relative", background: allPass ? D.goodSoft : D.warnSoft, border: `1px solid ${allPass ? D.goodEdge : D.warnEdge}`, borderRadius: 16, padding: "18px 18px 20px", color: D.body, ["--acc" as string]: allPass ? D.good : D.warn } as CSSProperties}
        >
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>{allPass ? "Spot on. Anyone could find those." : "Nearly there. Fix these, then check again:"}</p>
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
