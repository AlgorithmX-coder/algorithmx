"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import DeskHeader from "../DeskHeader";
import { markDone, useDone } from "../learn/progress";
import { Button, Kicker, SHELL_CSS, Tick } from "../learn/ui";
import { D, W } from "../tokens";
import Excel, { type ExcelDoc } from "./apps/Excel";
import Explorer from "./apps/Explorer";
import Outlook from "./apps/Outlook";
import Viewer from "./apps/Viewer";
import { PlacePicker } from "./places";
import { newId, useOffice } from "./store";
import { samePath, type Check, type Grid, type Job, type OfficeFile, type Paper, type Path } from "./types";
import { AppButton, Dialog, OFFICE_CSS } from "./ui";

/* The pretend office for one job: a task panel on the left (the brief,
 * hints, Check my work), and a desktop on the right with Outlook, File
 * Explorer and Excel on a taskbar. The apps stay mounted while you switch,
 * like windows on a real taskbar, and all of them read and write the one
 * office record (./store). Check my work runs the job's checks on that
 * record and shows a scorecard: every criterion and the five habits, with
 * how to put right anything missed. */

type AppId = "outlook" | "explorer" | "excel";

export default function Office({ job }: { job: Job }) {
  const { state, dispatch, reset } = useOffice(job);
  const done = useDone();
  const [app, setApp] = useState<AppId>("outlook");
  const [doc, setDoc] = useState<ExcelDoc | null>(null);
  const [viewer, setViewer] = useState<{ title: string; paper?: Paper; key: number } | null>(null);
  const [saveAs, setSaveAs] = useState(false);
  /* An action waiting on "Save changes?": close Excel, or open another file. */
  const [unsaved, setUnsaved] = useState<{ then: () => void } | null>(null);
  const [results, setResults] = useState<Check[] | null>(null);
  const [hints, setHints] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const finished = done.includes(job.id);
  const unread = state.emails.filter((e) => e.folder === "inbox" && e.unread).length;
  /* An open workbook follows its file if it is renamed or moved. */
  const docFile = doc?.fileId ? state.files.find((f) => f.id === doc.fileId) : undefined;
  const liveDoc: ExcelDoc | null = doc && (docFile ? { ...doc, name: docFile.name, path: docFile.path } : doc.fileId ? { ...doc, fileId: null, path: null } : doc);

  const guard = (then: () => void) => (doc?.dirty ? setUnsaved({ then }) : then());

  const openFile = (f: OfficeFile) => {
    if ((f.kind === "xlsx" || f.kind === "xltx") && f.sheet) {
      const sheet = f.sheet.map((r) => [...r]);
      const widths = f.widths ?? Array(sheet[0]?.length ?? 8).fill(100);
      guard(() => {
        setDoc(f.kind === "xltx" ? { fileId: null, name: `${f.name.replace(/\.xltx$/i, "")}1`, path: null, sheet, widths, dirty: false } : { fileId: f.id, name: f.name, path: f.path, sheet, widths, dirty: false });
        setApp("excel");
      });
    } else {
      setViewer({ title: f.name, paper: f.paper, key: Date.now() });
    }
  };

  const openLink = (path: Path, fileName: string) => {
    const f = state.files.find((x) => samePath(x.path, path) && x.name === fileName);
    if (f) openFile(f);
    else setViewer({ title: fileName, key: Date.now() });
  };

  const save = () => {
    if (!liveDoc) return;
    if (!liveDoc.fileId || !docFile) return setSaveAs(true);
    dispatch({ type: "saveFile", file: { ...docFile, sheet: liveDoc.sheet, modified: "Today, just now", by: "You" } });
    setDoc({ ...liveDoc, dirty: false });
  };

  const savedAs = (path: Path, name: string, replaceId?: string) => {
    if (!liveDoc) return;
    const replacing = replaceId ? state.files.find((f) => f.id === replaceId) : undefined;
    const id = replaceId ?? newId("file");
    const file: OfficeFile = { id, path, name, kind: "xlsx", modified: "Today, just now", by: "You", sheet: liveDoc.sheet, widths: liveDoc.widths, seeded: replacing?.seeded };
    dispatch({ type: "saveFile", file });
    setDoc({ ...liveDoc, fileId: id, name, path, dirty: false });
    setSaveAs(false);
  };

  const runCheck = () => {
    const r = job.check(state);
    setResults(r);
    if (r.every((c) => c.ok)) markDone(job.id);
  };

  const startAgain = () => {
    reset();
    setDoc(null);
    setViewer(null);
    setResults(null);
    setApp("outlook");
    setConfirmReset(false);
  };

  const shell = { "--acc": D.accent } as CSSProperties;
  const taskbar: { id: AppId; label: string; colour: string; badge?: number; on?: boolean }[] = [
    { id: "outlook", label: "Outlook", colour: W.outlook, badge: unread },
    { id: "explorer", label: "File Explorer", colour: W.folder },
    { id: "excel", label: liveDoc ? `Excel · ${liveDoc.name}` : "Excel", colour: W.excel, on: !!liveDoc },
  ];

  return (
    <div className="dr-shell" style={shell}>
      <DeskHeader link={{ href: `/desk-ready/${job.moduleId}`, label: "Back to the module" }} trail={`On the job · ${job.moduleLabel}`} />
      <main className="of-main">
        {/* the task panel */}
        <aside className="of-panel dr-glass">
          <Kicker>On the job</Kicker>
          <h1 className="of-h1">{job.title}</h1>
          <p className="of-clock">
            <span>Office time {job.clock}</span>
            <span>{job.deadline}</span>
          </p>
          <p className="of-brief">{job.brief}</p>
          <p className="of-small">Office work happens on a computer, so this job is built for a laptop or desktop screen. On a phone, slide the desktop sideways.</p>
          {finished && (
            <p className="of-finished">
              <Tick color={D.good} /> You have finished this job. You can do it again any time.
            </p>
          )}
          <div className="of-actions">
            <Button onClick={runCheck}>Check my work</Button>
            <Button kind="secondary" onClick={() => setHints((h) => !h)}>
              {hints ? "Hide the hints" : "Need a hint?"}
            </Button>
          </div>
          {hints && (
            <ol className="of-hints">
              {job.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ol>
          )}
          <button type="button" className="of-reset" onClick={() => setConfirmReset(true)}>
            Start the job again
          </button>
          <p className="of-note">Nothing here is sent anywhere. It is a pretend office, so you can&apos;t break anything.</p>
        </aside>

        {/* the desktop */}
        <div className="of-scroll">
          <section className="of-screen of-office" aria-label="Your desktop" style={{ colorScheme: "light" }}>
            <div className="of-window">
              <div style={{ display: app === "outlook" ? "block" : "none", height: "100%" }}>
                <Outlook state={state} dispatch={dispatch} onAttachment={(a) => (a.sheet ? openFile({ id: "attachment", path: [], name: a.name, kind: "xlsx", modified: "", by: "", sheet: a.sheet }) : setViewer({ title: a.name, paper: a.paper, key: Date.now() }))} onLink={(l) => openLink(l.path, l.fileName)} />
              </div>
              <div style={{ display: app === "explorer" ? "block" : "none", height: "100%" }}>
                <Explorer state={state} dispatch={dispatch} onOpen={openFile} />
              </div>
              <div style={{ display: app === "excel" ? "block" : "none", height: "100%" }}>
                <Excel
                  doc={liveDoc}
                  onEdit={(g: Grid) => liveDoc && setDoc({ ...liveDoc, sheet: g, dirty: true })}
                  onSave={save}
                  onSaveAs={() => setSaveAs(true)}
                  onClose={() => guard(() => setDoc(null))}
                />
              </div>
            </div>
            {viewer && <Viewer key={viewer.key} title={viewer.title} paper={viewer.paper} onClose={() => setViewer(null)} />}

            <nav className="of-taskbar" aria-label="Taskbar">
              {taskbar.map((t) => (
                <button key={t.id} type="button" onClick={() => setApp(t.id)} aria-pressed={app === t.id} className={app === t.id ? "of-task on" : "of-task"}>
                  <span className="of-task-ico" style={{ background: t.colour }} aria-hidden />
                  <span className="of-task-label">{t.label}</span>
                  {!!t.badge && <b className="of-badge">{t.badge}</b>}
                  {t.on && app !== t.id && <i className="of-dot" aria-hidden />}
                </button>
              ))}
              <span className="of-time">{job.clock}</span>
            </nav>

            {saveAs && liveDoc && (
              <PlacePicker
                state={state}
                mode={{ kind: "saveAs", name: liveDoc.fileId ? liveDoc.name : `${liveDoc.name}.xlsx`, at: liveDoc.path ?? ["OneDrive", "Documents"] }}
                onCancel={() => setSaveAs(false)}
                onSave={savedAs}
              />
            )}
            {unsaved && liveDoc && (
              <Dialog title="Excel" onClose={() => setUnsaved(null)} width={480}>
                <p style={{ margin: 0, fontSize: 16 }}>Do you want to save your changes to &ldquo;{liveDoc.name}&rdquo;?</p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                  <AppButton onClick={() => setUnsaved(null)}>Cancel</AppButton>
                  <AppButton
                    onClick={() => {
                      const then = unsaved.then;
                      setUnsaved(null);
                      setDoc(null);
                      then();
                    }}
                  >
                    Don&apos;t save
                  </AppButton>
                  <AppButton
                    primary
                    colour={W.excel}
                    onClick={() => {
                      const then = unsaved.then;
                      setUnsaved(null);
                      /* a workbook with a home saves and carries on; a new one asks where first */
                      if (liveDoc.fileId && docFile) {
                        save();
                        then();
                      } else setSaveAs(true);
                    }}
                  >
                    Save
                  </AppButton>
                </div>
              </Dialog>
            )}
          </section>
        </div>
      </main>

      {results && <Scorecard job={job} results={results} onClose={() => setResults(null)} onAgain={startAgain} />}
      {confirmReset && (
        <div className="of-overlay" role="dialog" aria-modal="true" aria-label="Start again">
          <div className="of-card dr-glass">
            <h2 className="of-h2">Start the job again?</h2>
            <p className="of-brief">Your inbox and files go back to how they were at {job.clock}. Anything you saved or sent in this job is cleared.</p>
            <div className="of-actions">
              <Button onClick={startAgain}>Start again</Button>
              <Button kind="secondary" onClick={() => setConfirmReset(false)}>
                Keep going
              </Button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        ${SHELL_CSS}
        ${OFFICE_CSS}
        ${OFFICE_SHELL_CSS}
      `}</style>
    </div>
  );
}

function Scorecard({ job, results, onClose, onAgain }: { job: Job; results: Check[]; onClose: () => void; onAgain: () => void }) {
  const passed = results.filter((c) => c.ok).length;
  const all = passed === results.length;
  const groups = [...new Set(results.map((c) => c.group))];
  const ok = (id: string) => results.find((c) => c.id === id)?.ok ?? false;
  return (
    <div className="of-overlay" role="dialog" aria-modal="true" aria-label="Your scorecard">
      <div className="of-card of-score dr-glass" style={{ "--acc": all ? D.good : D.accent } as CSSProperties}>
        <Kicker>{all ? "Job done" : "Not quite yet"}</Kicker>
        <h2 className="of-h2">{all ? "Sarah has her report, and you did it the way an office does." : `${passed} of ${results.length} done. Here is what's left.`}</h2>
        <div className="of-habits" aria-label="The five habits">
          {job.habits.map((h) => {
            const met = h.checks.every(ok);
            return (
              <span key={h.label} className={met ? "of-habit met" : "of-habit"}>
                {met ? <Tick size={15} color={D.good} /> : <span aria-hidden>○</span>}
                {h.label}
              </span>
            );
          })}
        </div>
        {groups.map((g) => (
          <section key={g} className="of-group">
            <h3>{g}</h3>
            <ul>
              {results
                .filter((c) => c.group === g)
                .map((c) => (
                  <li key={c.id} className={c.ok ? "ok" : "miss"}>
                    <span className="of-mark" aria-label={c.ok ? "Done" : "Not done"}>
                      {c.ok ? <Tick size={16} color={D.good} /> : "!"}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="of-label">{c.label}</span>
                      {c.fix && <span className="of-fix">{c.fix}</span>}
                    </span>
                    <code className="of-code">{c.code}</code>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        <div className="of-actions">
          {all ? (
            <>
              <Link href={`/desk-ready/${job.moduleId}`} className="of-link-btn">
                Back to the module
              </Link>
              <Button kind="secondary" onClick={onAgain}>
                Do the job again
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Back to the office to fix it</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const OFFICE_SHELL_CSS = `
  .of-main { max-width: 1520px; margin: 0 auto; padding: 18px 16px 40px; display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 18px; align-items: start; }
  .of-panel { position: sticky; top: 82px; padding: 22px 22px 20px; border-radius: 20px; background: ${D.card}; border: 1px solid ${D.edge}; box-shadow: ${D.lift}; }
  .of-h1 { margin: 10px 0 0; font-family: ${D.display}; font-size: 26px; line-height: 1.12; letter-spacing: -0.02em; font-weight: 500; color: ${D.ink}; }
  .of-h2 { margin: 10px 0 0; font-family: ${D.display}; font-size: 24px; line-height: 1.2; letter-spacing: -0.015em; font-weight: 500; color: ${D.ink}; }
  .of-clock { margin: 14px 0 0; display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 12px; background: ${D.warnSoft}; border: 1px solid ${D.warnEdge}; font-family: ${D.mono}; font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; color: ${D.warn}; }
  .of-brief { margin: 14px 0 0; font-size: 16.5px; line-height: 1.55; color: ${D.body}; }
  .of-finished { margin: 14px 0 0; display: flex; gap: 8px; font-size: 15px; line-height: 1.5; color: ${D.good}; }
  .of-actions { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .of-hints { margin: 16px 0 0; padding: 14px 14px 14px 32px; border-radius: 12px; background: ${D.glass}; border: 1px solid ${D.edge}; font-size: 15px; line-height: 1.5; color: ${D.body}; display: grid; gap: 8px; }
  .of-reset { margin-top: 18px; min-height: 40px; padding: 0; border: none; background: none; color: ${D.faint}; font-family: ${D.sans}; font-size: 14.5px; text-decoration: underline; cursor: pointer; }
  .of-reset:hover { color: ${D.ink}; }
  .of-note { margin: 6px 0 0; font-size: 13.5px; line-height: 1.5; color: ${D.faint}; }
  .of-scroll { min-width: 0; overflow-x: auto; }
  .of-screen { position: relative; min-width: 940px; height: clamp(620px, calc(100svh - 110px), 900px); border-radius: 16px; overflow: hidden; background: ${W.desktop}; box-shadow: 0 30px 70px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.12); }
  .of-window { position: absolute; left: 10px; right: 10px; top: 10px; bottom: 58px; border-radius: 8px; overflow: hidden; background: ${W.page}; box-shadow: ${W.float}; }
  .of-taskbar { position: absolute; left: 0; right: 0; bottom: 0; height: 50px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 12px; background: rgba(238,242,250,0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(255,255,255,0.6); }
  .of-task { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 12px; border: none; border-radius: 6px; background: transparent; font-family: ${W.font}; font-size: 14px; color: ${W.ink}; cursor: pointer; max-width: 280px; }
  .of-task:hover { background: rgba(255,255,255,0.6); }
  .of-task.on { background: rgba(255,255,255,0.85); box-shadow: inset 0 -3px 0 ${W.outlook}; font-weight: 600; }
  .of-task-ico { width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; }
  .of-task-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .of-badge { min-width: 20px; height: 20px; padding: 0 5px; border-radius: 10px; background: ${W.outlook}; color: #fff; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; }
  .of-dot { position: absolute; bottom: 3px; left: 50%; width: 6px; height: 3px; border-radius: 2px; background: ${W.muted}; transform: translateX(-50%); }
  .of-time { position: absolute; right: 16px; font-family: ${W.font}; font-size: 13px; color: ${W.ink}; }
  .of-overlay { position: fixed; inset: 0; z-index: 60; display: flex; align-items: flex-start; justify-content: center; padding: 6vh 16px 24px; background: rgba(3,6,14,0.72); backdrop-filter: blur(6px); overflow-y: auto; }
  .of-card { position: relative; width: 100%; max-width: 760px; padding: 26px 26px 24px; border-radius: 22px; background: ${D.card}; border: 1px solid ${D.edgeStrong}; box-shadow: ${D.lift}; }
  .of-habits { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 8px; }
  .of-habit { display: inline-flex; align-items: center; gap: 7px; min-height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid ${D.edge}; background: ${D.glass}; font-size: 14px; color: ${D.muted}; }
  .of-habit.met { color: ${D.ink}; border-color: ${D.goodEdge}; background: ${D.goodSoft}; }
  .of-group { margin-top: 20px; }
  .of-group h3 { margin: 0; font-family: ${D.mono}; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${D.faint}; }
  .of-group ul { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 8px; }
  .of-group li { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 14px; background: ${D.glass}; border: 1px solid ${D.edge}; }
  .of-group li.miss { border-color: ${D.warnEdge}; background: ${D.warnSoft}; }
  .of-mark { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: ${D.warn}; border: 1.5px solid currentColor; }
  .of-group li.ok .of-mark { color: ${D.good}; }
  .of-label { display: block; font-size: 16px; line-height: 1.45; color: ${D.ink}; }
  .of-fix { display: block; margin-top: 4px; font-size: 15px; line-height: 1.5; color: ${D.body}; }
  .of-code { flex-shrink: 0; font-family: ${D.mono}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.08em; color: ${D.faint}; padding-top: 4px; }
  .of-link-btn { display: inline-flex; align-items: center; min-height: 50px; padding: 0 24px; border-radius: 999px; background: ${D.action}; color: ${D.onAccent}; font-family: ${D.display}; font-weight: 600; font-size: 16.5px; text-decoration: none; box-shadow: ${D.actionGlow}; }
  .of-small { display: none; margin: 12px 0 0; padding: 10px 12px; border-radius: 12px; background: ${D.accentSoft}; border: 1px solid ${D.accentEdge}; font-size: 15px; line-height: 1.5; color: ${D.body}; }
  @media (max-width: 980px) { .of-small { display: block; } }
  @media (max-width: 1180px) {
    .of-main { grid-template-columns: 1fr; }
    .of-panel { position: static; }
  }
`;
