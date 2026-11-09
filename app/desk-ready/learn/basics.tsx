"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, StepBar, Tick, Workspace, darkInput } from "./ui";

/* Module 0 practice: the mouse, the keyboard, windows, copy and paste,
 * saving and finding files, and typing. For an adult who has mostly used
 * a phone. Everything is forgiving: a miss is never a fail, it just
 * shows what to try. Pointer events throughout, so a finger on a tablet
 * works as well as a mouse. */

/* The mouse practice area: a dark grid stage (class dr-workspace supplies
 * the background, border and grid), so the targets can glow on it. */
const stage: CSSProperties = { position: "relative", height: 280, borderRadius: 16, overflow: "hidden", touchAction: "none", userSelect: "none" };

/* A typing box in the course's own dark glass. */
const typeBox: CSSProperties = { ...darkInput, width: "100%", minHeight: 56, padding: "12px 16px", fontSize: 20 };

/* How a light app window floats on the dark desk. */
const appWindow: CSSProperties = { border: `1px solid ${W.edge}`, borderRadius: 12, overflow: "hidden", background: W.page, color: W.ink, fontFamily: W.font, boxShadow: W.float, colorScheme: "light" };

function Done({ children }: { children: ReactNode }) {
  return (
    <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: D.goodSoft, border: `1px solid ${D.goodEdge}`, fontSize: 16.5, lineHeight: 1.55, color: D.body }}>
      <Tick />
      <span>{children}</span>
    </div>
  );
}

function Instruction({ children }: { children: ReactNode }) {
  return <p style={{ margin: "14px 0 12px", fontSize: 18.5, fontWeight: 700, lineHeight: 1.45, color: D.ink }}>{children}</p>;
}

function FolderIcon({ size = 56, open = false }: { size?: number; open?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ display: "inline-block" }}>
      <path d="M4 12 h14 l4 4 h22 v24 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z" fill={W.folder} />
      <path d={open ? "M4 20 h40 l-4 20 H8 Z" : "M4 18 h40 v22 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z"} fill={W.folderLight} />
    </svg>
  );
}

function FileIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ display: "inline-block" }}>
      <path d="M10 4 h20 l10 10 v30 H10 Z" fill={W.page} stroke={W.faint} strokeWidth="2" />
      <path d="M30 4 v10 h10" fill="none" stroke={W.faint} strokeWidth="2" />
      <path d="M16 24 h18 M16 30 h18 M16 36 h12" stroke={W.outlook} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mouse: click the targets, double-click to open, drag into a folder. */
/* ------------------------------------------------------------------ */

const SPOTS = [
  { x: 18, y: 30 },
  { x: 72, y: 22 },
  { x: 45, y: 68 },
  { x: 82, y: 70 },
  { x: 12, y: 74 },
];

export function MouseLab({ onDone }: LabProps) {
  const [part, setPart] = useState<"click" | "double" | "drag" | "done">("click");
  const [hits, setHits] = useState(0);
  const [opens, setOpens] = useState(0);
  const [singleTip, setSingleTip] = useState(false);
  const [pos, setPos] = useState({ x: 8, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dropped, setDropped] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });

  const parts = ["click", "double", "drag"] as const;

  function hit() {
    if (hits + 1 >= SPOTS.length) setPart("double");
    setHits((h) => h + 1);
  }

  function opened() {
    setSingleTip(false);
    if (opens + 1 >= 3) setPart("drag");
    setOpens((o) => o + 1);
  }

  function down(e: RPointerEvent<HTMLDivElement>) {
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { dx: e.clientX - box.left - (pos.x / 100) * box.width, dy: e.clientY - box.top - (pos.y / 100) * box.height };
    setDragging(true);
  }

  function moveTo(e: RPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left - grab.current.dx) / box.width) * 100;
    const y = ((e.clientY - box.top - grab.current.dy) / box.height) * 100;
    setPos({ x: Math.max(0, Math.min(88, x)), y: Math.max(0, Math.min(80, y)) });
  }

  function up() {
    setDragging(false);
    /* Dropped when the middle of the invoice is over the folder, with some
     * slack all round: a near miss by a nervous hand still counts. */
    const f = folderRef.current?.getBoundingClientRect();
    const i = itemRef.current?.getBoundingClientRect();
    if (!f || !i) return;
    const cx = i.left + i.width / 2;
    const cy = i.top + i.height / 2;
    if (cx > f.left - 30 && cx < f.right + 30 && cy > f.top - 40 && cy < f.bottom + 30) {
      setDropped(true);
      setPart("done");
      onDone({ correct: 3, total: 3 });
    }
  }

  return (
    <div>
      <StepBar at={part === "done" ? 3 : parts.indexOf(part) + 1} of={3} label="Part" />
      {part === "click" && (
        <>
          <Instruction>Click each blue circle as it appears. ({hits} of {SPOTS.length})</Instruction>
          <div className="dr-workspace" style={stage}>
            <button
              type="button"
              aria-label="Click me"
              onClick={hit}
              style={{ position: "absolute", left: `${SPOTS[hits].x}%`, top: `${SPOTS[hits].y}%`, width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: "50%", border: `2px solid ${D.ink}`, background: D.accent, boxShadow: `0 0 0 9px ${D.accentSoft}, 0 0 30px 4px ${D.accent}`, cursor: "pointer" }}
            />
          </div>
        </>
      )}
      {part === "double" && (
        <>
          <Instruction>Double-click the folder to open it: click twice, quickly, without moving. ({opens} of 3)</Instruction>
          <div className="dr-workspace" style={{ ...stage, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setSingleTip(true)}
              onDoubleClick={opened}
              style={{ background: singleTip ? D.accentSoft : "transparent", border: `1px solid ${singleTip ? D.accentEdge : "transparent"}`, boxShadow: singleTip ? `0 0 24px -6px ${D.accent}` : "none", cursor: "pointer", display: "grid", justifyItems: "center", gap: 4, fontFamily: D.sans, fontSize: 16, color: D.ink, padding: 12, borderRadius: 12 }}
            >
              <FolderIcon size={72} open={opens > 0} />
              Rotas
            </button>
          </div>
          {singleTip && <p style={{ margin: "10px 0 0", fontSize: 16, color: D.muted }}>That was one click: it selects the folder. Click twice, quickly, to open it.</p>}
          {opens > 0 && <p style={{ margin: "10px 0 0", fontSize: 16, color: D.good, fontWeight: 700 }}>Opened! Close it and do it again.</p>}
        </>
      )}
      {(part === "drag" || part === "done") && (
        <>
          <Instruction>Drag the invoice into the Finance folder: press and hold on it, move it over the folder, then let go.</Instruction>
          <div ref={area} className="dr-workspace" style={stage}>
            <div ref={folderRef} style={{ position: "absolute", right: "6%", top: "28%", display: "grid", justifyItems: "center", gap: 4, fontSize: 16, color: D.ink, padding: 10, borderRadius: 12, background: dropped ? D.goodSoft : dragging ? D.accentSoft : "transparent", border: `1px dashed ${dropped ? D.goodEdge : dragging ? D.accentEdge : "transparent"}`, boxShadow: dragging ? `0 0 30px -6px ${D.accent}` : "none" }}>
              <FolderIcon size={80} open={dropped} />
              Finance
            </div>
            {!dropped && (
              <div
                ref={itemRef}
                role="button"
                aria-label="Invoice 4417, drag me"
                onPointerDown={down}
                onPointerMove={moveTo}
                onPointerUp={up}
                style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, display: "grid", justifyItems: "center", gap: 2, fontSize: 15, color: D.ink, padding: 8, borderRadius: 10, background: dragging ? D.accentSoft : D.glassStrong, border: `1px solid ${dragging ? D.accent : D.accentEdge}`, cursor: dragging ? "grabbing" : "grab", boxShadow: dragging ? `${D.lift}, 0 0 26px -4px ${D.accent}` : `0 0 18px -6px ${D.accent}` }}
              >
                <FileIcon />
                Invoice 4417
              </div>
            )}
          </div>
          {dropped && (
            <div style={{ marginTop: 12 }}>
              <Done>Filed. You can click, double-click and drag.</Done>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Typing tasks: type or fix a line, checked as you go.                */
/* ------------------------------------------------------------------ */

export interface TypeTask {
  prompt: string;
  /* Text already in the box, e.g. a typo to fix. */
  start?: string;
  /* What a correct answer looks like, shown as a hint. */
  hint: string;
  ok: (value: string) => boolean;
}

export function TypeTasksLab({ tasks, onDone }: LabProps & { tasks: TypeTask[] }) {
  const [at, setAt] = useState(0);
  const [value, setValue] = useState(tasks[0].start ?? "");
  const [finished, setFinished] = useState(false);
  const task = tasks[at];
  const right = task.ok(value);

  function next() {
    if (at + 1 < tasks.length) {
      setAt(at + 1);
      setValue(tasks[at + 1].start ?? "");
    } else {
      setFinished(true);
      onDone({ correct: tasks.length, total: tasks.length });
    }
  }

  if (finished) return <Done>All done. Your keyboard is starting to feel familiar.</Done>;

  return (
    <div>
      <StepBar at={at + 1} of={tasks.length} label="Task" />
      <Instruction>{task.prompt}</Instruction>
      <input
        key={at}
        aria-label="Type here"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && right) next();
        }}
        autoComplete="off"
        spellCheck={false}
        style={{ ...typeBox, border: `1px solid ${right ? D.good : D.edgeStrong}`, boxShadow: right ? `0 0 0 3px ${D.goodSoft}` : "none" }}
      />
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: right ? D.good : D.muted, fontWeight: right ? 700 : 400 }}>
        {right ? <Tick /> : null}
        {right ? "That is right. Press Enter or the button to carry on." : task.hint}
      </div>
      <div style={{ marginTop: 14 }}>
        <Button onClick={next} disabled={!right}>
          {at + 1 < tasks.length ? "Next" : "Finish"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Windows: a pretend desktop with a taskbar.                          */
/* ------------------------------------------------------------------ */

type AppId = "outlook" | "excel" | "files";
const APPS: Record<AppId, { name: string; colour: string }> = {
  outlook: { name: "Outlook", colour: W.outlook },
  excel: { name: "Excel", colour: W.excel },
  files: { name: "File Explorer", colour: W.files },
};
type WinState = "closed" | "open" | "min" | "max";
type Action = { app: AppId; to: WinState | "front" };

const WINDOW_STEPS: { say: string; want: Action }[] = [
  { say: "Open Excel: click its button on the taskbar at the bottom.", want: { app: "excel", to: "open" } },
  { say: "Open Outlook as well, from the taskbar.", want: { app: "outlook", to: "open" } },
  { say: "Switch back to Excel: click Excel on the taskbar.", want: { app: "excel", to: "front" } },
  { say: "Make Excel fill the screen: click the square at its top right.", want: { app: "excel", to: "max" } },
  { say: "Hide Excel for now: click the line (minimise) at its top right.", want: { app: "excel", to: "min" } },
  { say: "Close Outlook: click the X at its top right.", want: { app: "outlook", to: "closed" } },
];

export function WindowsLab({ onDone }: LabProps) {
  const [wins, setWins] = useState<Record<AppId, WinState>>({ outlook: "closed", excel: "closed", files: "closed" });
  const [front, setFront] = useState<AppId | null>(null);
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const finished = step >= WINDOW_STEPS.length;

  function act(a: Action, apply: () => void) {
    if (finished) return;
    const want = WINDOW_STEPS[step].want;
    /* Only the asked-for action happens. A wrong click changes nothing, so
     * no step can ever become impossible (opening Outlook early would
     * otherwise leave "Open Outlook" with nothing to do). */
    if (want.app === a.app && want.to === a.to) {
      apply();
      setWrong(null);
      const next = step + 1;
      setStep(next);
      if (next >= WINDOW_STEPS.length) onDone({ correct: Math.max(0, WINDOW_STEPS.length - misses), total: WINDOW_STEPS.length });
    } else {
      setMisses((m) => m + 1);
      setWrong("Not that one yet. Read the instruction again and look for the button it names.");
    }
  }

  function taskbar(app: AppId) {
    const s = wins[app];
    const show = () => {
      setWins((w) => ({ ...w, [app]: "open" }));
      setFront(app);
    };
    if (s === "closed") act({ app, to: "open" }, show);
    else if (s === "min") act({ app, to: "front" }, show);
    else act({ app, to: "front" }, () => setFront(app));
  }

  const order = (Object.keys(APPS) as AppId[]).filter((a) => wins[a] === "open" || wins[a] === "max");

  return (
    <div>
      <StepBar at={Math.min(step + 1, WINDOW_STEPS.length)} of={WINDOW_STEPS.length} label="Step" />
      {finished ? <div style={{ margin: "14px 0" }}><Done>You can open, switch, resize and close windows.</Done></div> : <Instruction>{WINDOW_STEPS[step].say}</Instruction>}
      <Workspace>
        <div style={{ position: "relative", height: 330, borderRadius: 12, overflow: "hidden", background: W.desktop, border: `1px solid ${D.edgeStrong}`, boxShadow: W.float, fontFamily: W.font, colorScheme: "light" }}>
          {order.map((app, i) => {
            const s = wins[app];
            const max = s === "max";
            return (
              <div
                key={app}
                onPointerDown={() => setFront(app)}
                style={{ position: "absolute", left: max ? 0 : `${8 + i * 10}%`, top: max ? 0 : `${8 + i * 9}%`, width: max ? "100%" : "max(62%, 240px)", height: max ? "calc(100% - 52px)" : "58%", background: W.page, border: max ? "none" : `1px solid ${W.edge}`, borderRadius: max ? 0 : 10, boxShadow: `0 14px 34px -6px color-mix(in srgb, ${D.ground} 55%, transparent)`, overflow: "hidden", zIndex: app === front ? 3 : 1 + i }}
              >
                <div style={{ display: "flex", alignItems: "center", background: APPS[app].colour, color: D.onAccent, fontSize: 14, fontWeight: 700 }}>
                  <span style={{ padding: "0 12px", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{APPS[app].name}</span>
                  {(
                    [
                      ["min", "Minimise", "M6 12 H18"],
                      ["max", max ? "Restore" : "Maximise", "M7 7 H17 V17 H7 Z"],
                      ["closed", "Close", "M7 7 L17 17 M17 7 L7 17"],
                    ] as const
                  ).map(([to, label, path]) => (
                    <button
                      key={to}
                      type="button"
                      aria-label={`${label} ${APPS[app].name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const target: WinState = to === "max" && max ? "open" : to;
                        act({ app, to: target }, () => setWins((w) => ({ ...w, [app]: target })));
                      }}
                      style={{ width: 46, height: 38, border: "none", background: "transparent", color: D.onAccent, fontSize: 16, cursor: "pointer" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden style={{ display: "inline-block" }}>
                        <path d={path} strokeLinecap="round" />
                      </svg>
                    </button>
                  ))}
                </div>
                <div style={{ padding: 14, fontSize: 15, color: W.muted }}>{app === "excel" ? "Rota.xlsx" : app === "outlook" ? "Inbox (3)" : "Documents"}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 52, background: `color-mix(in srgb, ${W.chrome} 92%, transparent)`, borderTop: `1px solid ${W.edge}`, backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 5 }}>
            {(Object.keys(APPS) as AppId[]).map((app) => (
              <button
                key={app}
                type="button"
                onClick={() => taskbar(app)}
                aria-label={`${APPS[app].name} on the taskbar`}
                style={{ minHeight: 40, padding: "6px 12px", borderRadius: 8, border: "none", background: wins[app] !== "closed" ? W.select : "transparent", borderBottom: wins[app] !== "closed" ? `3px solid ${APPS[app].colour}` : "3px solid transparent", fontFamily: W.font, fontSize: 15, fontWeight: 700, color: W.ink, cursor: "pointer" }}
              >
                {APPS[app].name}
              </button>
            ))}
          </div>
        </div>
      </Workspace>
      {wrong && (
        <p role="status" style={{ margin: "12px 0 0", display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 14, background: D.badSoft, border: `1px solid ${D.badEdge}`, fontSize: 16, lineHeight: 1.5, color: D.body }}>
          <Cross /> {wrong}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy, paste and undo: checked for real, from the browser's events.  */
/* ------------------------------------------------------------------ */

export function CopyPasteLab({ onDone }: LabProps) {
  const [part, setPart] = useState(0);
  const [pasted, setPasted] = useState("");
  const [box, setBox] = useState("");
  const [undone, setUndone] = useState(false);
  const SOURCE = "Order 5520";

  const pasteOk = pasted.includes(SOURCE);

  return (
    <div>
      <StepBar at={Math.min(part + 1, 2)} of={2} label="Part" />
      {part === 0 && (
        <>
          <Instruction>Copy the order number from the email and paste it into the box below.</Instruction>
          <Workspace>
            <div style={{ ...appWindow, padding: "14px 16px", fontSize: 17, lineHeight: 1.6, color: W.body }}>
              Hi Dave, the pallets for <b style={{ background: W.select, color: W.ink, padding: "1px 4px", borderRadius: 4 }}>{SOURCE}</b> arrive on Friday.
            </div>
          </Workspace>
          <ol style={{ margin: "12px 0", paddingLeft: 22, fontSize: 16.5, lineHeight: 1.7, color: D.body }}>
            <li>Select it: press and hold just before &ldquo;Order&rdquo;, drag to the end of &ldquo;5520&rdquo;, let go.</li>
            <li>Copy: press Ctrl and C together. Or right-click it and choose Copy.</li>
            <li>Click in the box, then paste: Ctrl and V together. Or right-click and choose Paste.</li>
          </ol>
          <input
            aria-label="Paste here"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder="Paste here"
            style={{ ...typeBox, minHeight: 52, fontSize: 18, border: `1px solid ${pasteOk ? D.good : D.edgeStrong}`, boxShadow: pasteOk ? `0 0 0 3px ${D.goodSoft}` : "none" }}
          />
          {pasteOk && (
            <div style={{ marginTop: 12 }}>
              <Done>Pasted. Copy and paste saves typing, and saves typos.</Done>
              <div style={{ marginTop: 12 }}>
                <Button onClick={() => setPart(1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
      {part >= 1 && (
        <>
          <Instruction>Type the word oops in the box. Then undo it: press Ctrl and Z together.</Instruction>
          <input
            aria-label="Undo practice box"
            value={box}
            onChange={(e) => {
              const native = e.nativeEvent as InputEvent;
              setBox(e.target.value);
              if (native.inputType === "historyUndo" && !undone) {
                setUndone(true);
                onDone({ correct: 2, total: 2 });
              }
            }}
            style={{ ...typeBox, minHeight: 52, fontSize: 18, border: `1px solid ${undone ? D.good : D.edgeStrong}`, boxShadow: undone ? `0 0 0 3px ${D.goodSoft}` : "none" }}
          />
          {!undone && (
            <p style={{ margin: "10px 0 0", fontSize: 15.5, color: D.muted }}>
              No keyboard, or on a phone? Use the button instead: <button type="button" onClick={() => { setBox(""); setUndone(true); onDone({ correct: 2, total: 2 }); }} style={{ background: "none", border: "none", padding: 0, color: D.accent, fontWeight: 700, fontSize: 15.5, cursor: "pointer", fontFamily: D.sans }}>Undo</button>
            </p>
          )}
          {undone && (
            <div style={{ marginTop: 12 }}>
              <Done>Undone. Ctrl and Z takes back your last change in almost every program.</Done>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Save As, then find the file again.                                  */
/* ------------------------------------------------------------------ */

const FOLDERS: Record<string, string[]> = {
  Deliveries: ["Delivery log November.xlsx", "Brightline notes.pdf"],
  Invoices: ["Invoice 4417.pdf", "Invoice 4420.pdf"],
  Timesheets: ["Timesheet 07-11-2026.xlsx"],
};

export function SaveFindLab({ onDone }: LabProps) {
  const [part, setPart] = useState(0);
  const [folder, setFolder] = useState<string | null>(null);
  const [name, setName] = useState("Book1");
  const [saveTried, setSaveTried] = useState(false);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [found, setFound] = useState(false);
  const [wrongFile, setWrongFile] = useState(false);

  const nameOk = /timesheet/i.test(name) && /14/.test(name);
  const saveOk = folder === "Timesheets" && nameOk;

  const folderButton = (f: string, selected: boolean, onClick: () => void) => (
    <button key={f} type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", minHeight: 48, padding: "6px 10px", borderRadius: 6, border: "none", background: selected ? W.select : "transparent", boxShadow: selected ? `inset 3px 0 0 ${W.outlook}` : "none", fontFamily: W.font, fontSize: 16.5, color: W.ink, cursor: "pointer" }}>
      <FolderIcon size={28} open={selected} />
      {f}
    </button>
  );

  return (
    <div>
      <StepBar at={part + 1} of={2} label="Part" />
      {part === 0 && (
        <>
          <Instruction>Save this week&apos;s timesheet in the Timesheets folder, named so you can find it again: Timesheet 14-11-2026.</Instruction>
          <Workspace>
            <div style={appWindow}>
              <div style={{ background: W.sunk, padding: "8px 14px", fontWeight: 700, fontSize: 15, color: W.ink, borderBottom: `1px solid ${W.edge}` }}>Save As</div>
              <div style={{ padding: 12, display: "grid", gap: 4 }}>
                <p style={{ margin: "0 0 4px", fontSize: 15, color: W.muted }}>Documents</p>
                {Object.keys(FOLDERS).map((f) => folderButton(f, folder === f, () => setFolder(f)))}
              </div>
              <label style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px", borderTop: `1px solid ${W.edge}`, background: W.chrome }}>
                <span style={{ fontSize: 16, color: W.body }}>File name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} onFocus={(e) => e.target.select()} style={{ flex: 1, minWidth: 180, minHeight: 44, padding: "6px 10px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page, fontFamily: W.font, fontSize: 17, color: W.ink }} />
                <Button onClick={() => { setSaveTried(true); if (saveOk) setPart(1); }} style={{ minHeight: 44, padding: "8px 18px" }}>
                  Save
                </Button>
              </label>
            </div>
          </Workspace>
          {saveTried && !saveOk && (
            <ul role="status" style={{ listStyle: "none", margin: "14px 0 0", padding: "14px 16px", display: "grid", gap: 8, fontSize: 16.5, lineHeight: 1.5, color: D.body, background: D.warnSoft, border: `1px solid ${D.warnEdge}`, borderRadius: 14 }}>
              <li style={{ display: "flex", gap: 8 }}>{folder === "Timesheets" ? <Tick /> : <Cross />} {folder === "Timesheets" ? "Right folder." : "Click the Timesheets folder first, so it is highlighted."}</li>
              <li style={{ display: "flex", gap: 8 }}>{nameOk ? <Tick /> : <Cross />} {nameOk ? "Good file name." : "Replace Book1 with a name that says what it is and when: Timesheet 14-11-2026."}</li>
            </ul>
          )}
        </>
      )}
      {part === 1 && (
        <>
          <Done>Saved in Timesheets as &ldquo;{name.trim()}&rdquo;.</Done>
          <Instruction>A week later your manager asks for Invoice 4420. Find it: open folders by double-clicking, then double-click the file.</Instruction>
          <Workspace>
            <div style={{ ...appWindow, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
              <div style={{ padding: 12, borderRight: `1px solid ${W.edge}`, background: W.chrome }}>
                <p style={{ margin: "0 0 4px", fontSize: 15, color: W.muted }}>Documents</p>
                {Object.keys(FOLDERS).map((f) => (
                  <div key={f} onDoubleClick={() => setOpenFolder(f)}>
                    {folderButton(f, openFolder === f, () => setOpenFolder(f))}
                  </div>
                ))}
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ margin: "0 0 4px", fontSize: 15, color: W.muted }}>{openFolder ?? "Open a folder to see what is inside"}</p>
                {openFolder &&
                  [...FOLDERS[openFolder], ...(openFolder === "Timesheets" ? [`${name.trim()}.xlsx`] : [])].map((file) => (
                    <button
                      key={file}
                      type="button"
                      onDoubleClick={() => {
                        if (file === "Invoice 4420.pdf") {
                          setFound(true);
                          setWrongFile(false);
                          onDone({ correct: 2, total: 2 });
                        } else setWrongFile(true);
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", minHeight: 48, padding: "6px 10px", borderRadius: 6, border: "none", background: found && file === "Invoice 4420.pdf" ? `color-mix(in srgb, ${D.good} 22%, ${W.page})` : "transparent", fontFamily: W.font, fontSize: 16.5, color: W.ink, cursor: "pointer" }}
                    >
                      <FileIcon size={28} />
                      {file}
                    </button>
                  ))}
              </div>
            </div>
          </Workspace>
          {wrongFile && !found && <p style={{ margin: "10px 0 0", fontSize: 16, color: D.muted }}>That is a different file. Invoices live in the Invoices folder.</p>}
          {found && (
            <div style={{ marginTop: 12 }}>
              <Done>Found it. Good folders and clear names make that quick.</Done>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Typing practice: three work sentences, speed and accuracy shown.    */
/* ------------------------------------------------------------------ */

const LINES = ["Please find the timesheet attached.", "Order 5520 will arrive on Friday morning.", "Could you call me back on 01632 960 418?"];

function accuracy(target: string, typed: string) {
  let same = 0;
  for (let i = 0; i < Math.min(target.length, typed.length); i++) if (target[i] === typed[i]) same++;
  return target.length ? same / Math.max(target.length, typed.length) : 0;
}

export function TypingLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState<number | null>(null);
  const [results, setResults] = useState<{ wpm: number; acc: number }[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const target = LINES[at];
  const finished = results.length === LINES.length;

  useEffect(() => {
    input.current?.focus();
  }, [at]);

  function submit() {
    if (!started || typed.length < target.length * 0.6) return;
    const minutes = Math.max((Date.now() - started) / 60000, 1 / 60);
    const wpm = Math.round(typed.length / 5 / minutes);
    const acc = accuracy(target, typed);
    const next = [...results, { wpm, acc }];
    setResults(next);
    if (next.length === LINES.length) {
      onDone({ correct: next.filter((r) => r.acc >= 0.9).length, total: LINES.length });
    } else {
      setAt(at + 1);
      setTyped("");
      setStarted(null);
    }
  }

  if (finished) {
    const avg = Math.round(results.reduce((n, r) => n + r.wpm, 0) / results.length);
    const acc = Math.round((results.reduce((n, r) => n + r.acc, 0) / results.length) * 100);
    return (
      <div>
        <Done>
          Your speed: <b>{avg} words a minute</b> at <b>{acc}%</b> accuracy.
        </Done>
        <p style={{ margin: "12px 0 0", fontSize: 16.5, lineHeight: 1.55, color: D.body }}>Many office jobs ask for about 30 to 40 words a minute. A few minutes of practice a day gets most people there in a few weeks. Accuracy matters more than speed.</p>
      </div>
    );
  }

  return (
    <div>
      <StepBar at={at + 1} of={LINES.length} label="Sentence" />
      <Instruction>Type this sentence exactly, then press Enter.</Instruction>
      <p aria-label="Sentence to type" className="dr-glass" style={{ position: "relative", margin: "0 0 12px", padding: "16px 18px", borderRadius: 14, background: D.card, border: `1px solid ${D.edgeStrong}`, boxShadow: D.lift, fontSize: 21, lineHeight: 1.5, letterSpacing: "0.01em", color: D.ink }}>
        {target.split("").map((ch, i) => {
          const t = typed[i];
          const colour = t === undefined ? D.ink : t === ch ? D.good : D.bad;
          return (
            <span key={i} style={{ color: colour, background: t !== undefined && t !== ch ? D.badSoft : "transparent", textDecoration: i === typed.length ? "underline" : "none" }}>
              {ch}
            </span>
          );
        })}
      </p>
      <input
        ref={input}
        aria-label="Type the sentence here"
        value={typed}
        onChange={(e) => {
          if (started === null) setStarted(Date.now());
          setTyped(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        onPaste={(e) => e.preventDefault()}
        autoComplete="off"
        spellCheck={false}
        style={typeBox}
      />
      <p style={{ margin: "10px 0 0", fontSize: 15.5, color: D.muted }}>Green letters are right, red ones are wrong. Fix a mistake with Backspace.</p>
      <div style={{ marginTop: 12 }}>
        <Button onClick={submit} disabled={typed.length < target.length * 0.6}>
          Done with this sentence
        </Button>
      </div>
    </div>
  );
}
