"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "./tokens";

/* A real, self-contained code playground: write JavaScript, run it, see
 * the output. Code runs in a Web Worker with a timeout so a runaway loop
 * can't freeze the tab; if a Worker can't be created (CSP), it falls back
 * to a guarded main-thread run. Nothing leaves the browser. */

export type RunLine = { kind: "log" | "error" | "warn"; text: string };

const WORKER_SRC = `
self.onmessage = function (e) {
  var logs = [];
  function fmt(a){ try { return (typeof a === 'object' && a !== null) ? JSON.stringify(a) : String(a); } catch(_) { return String(a); } }
  function push(kind, args){ logs.push({ kind: kind, text: Array.prototype.map.call(args, fmt).join(' ') }); }
  self.console = { log: function(){ push('log', arguments); }, info: function(){ push('log', arguments); }, warn: function(){ push('warn', arguments); }, error: function(){ push('error', arguments); } };
  try {
    var fn = new Function(e.data);
    var ret = fn();
    if (ret !== undefined) push('log', [ret]);
    self.postMessage({ ok: true, logs: logs });
  } catch (err) {
    push('error', [String(err && err.message ? err.message : err)]);
    self.postMessage({ ok: false, logs: logs });
  }
};
`;

function runOnMainThread(code: string): { ok: boolean; logs: RunLine[] } {
  const logs: RunLine[] = [];
  const fmt = (a: unknown) => { try { return typeof a === "object" && a !== null ? JSON.stringify(a) : String(a); } catch { return String(a); } };
  const push = (kind: RunLine["kind"], args: unknown[]) => logs.push({ kind, text: args.map(fmt).join(" ") });
  const fakeConsole = { log: (...a: unknown[]) => push("log", a), info: (...a: unknown[]) => push("log", a), warn: (...a: unknown[]) => push("warn", a), error: (...a: unknown[]) => push("error", a) };
  try {
    const fn = new Function("console", code);
    const ret = fn(fakeConsole);
    if (ret !== undefined) push("log", [ret]);
    return { ok: true, logs };
  } catch (err) {
    push("error", [String(err instanceof Error ? err.message : err)]);
    return { ok: false, logs };
  }
}

export default function CodePlayground({ starter = "", onResult, minRows = 8 }: { starter?: string; onResult?: (logs: RunLine[], ok: boolean) => void; minRows?: number }) {
  const [code, setCode] = useState(starter);
  const [output, setOutput] = useState<RunLine[] | null>(null);
  const [running, setRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => () => { workerRef.current?.terminate(); }, []);

  const finish = useCallback((logs: RunLine[], ok: boolean) => {
    setOutput(logs);
    setRunning(false);
    onResult?.(logs, ok);
  }, [onResult]);

  const run = useCallback(() => {
    setRunning(true);
    setOutput(null);
    let usedWorker = false;
    try {
      const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      workerRef.current = worker;
      usedWorker = true;
      const timer = setTimeout(() => {
        worker.terminate();
        finish([{ kind: "error", text: "Your code took too long to finish (a loop that never ends?). I stopped it." }], false);
      }, 3000);
      worker.onmessage = (e: MessageEvent<{ ok: boolean; logs: RunLine[] }>) => {
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        finish(e.data.logs, e.data.ok);
      };
      worker.onerror = () => {
        clearTimeout(timer);
        worker.terminate();
        const res = runOnMainThread(code);
        finish(res.logs, res.ok);
      };
      worker.postMessage(code);
    } catch {
      if (!usedWorker) {
        const res = runOnMainThread(code);
        finish(res.logs, res.ok);
      }
    }
  }, [code, finish]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const s = ta.selectionStart, en = ta.selectionEnd;
      const next = code.slice(0, s) + "  " + code.slice(en);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); }
  };

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#0b0a16", border: `1px solid ${T.edge}`, borderBottom: "none", borderRadius: "12px 12px 0 0", padding: "8px 12px" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, marginLeft: 8 }}>script.js</span>
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.faint }}>JavaScript &middot; runs in your browser</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        rows={Math.max(minRows, code.split("\n").length + 1)}
        style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: "#0b0a16", color: "#e8e6f7", border: `1px solid ${T.edge}`, borderRadius: 0, fontFamily: T.mono, fontSize: 14, lineHeight: 1.65, padding: "12px 14px", tabSize: 2, outline: "none" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0b0a16", border: `1px solid ${T.edge}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "10px 12px" }}>
        <button onClick={run} disabled={running}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: "#fff", background: running ? T.edge : `linear-gradient(135deg, ${T.green}, ${T.cyan})`, border: "none", borderRadius: 8, padding: "9px 18px", cursor: running ? "default" : "pointer" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
          {running ? "Running..." : "Run"}
        </button>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>or press Ctrl/Cmd + Enter</span>
      </div>

      {output !== null && (
        <div style={{ marginTop: 12, background: "#07060f", border: `1px solid ${T.edge}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, padding: "8px 13px", borderBottom: `1px solid ${T.edge}` }}>Output</div>
          <div style={{ padding: "11px 13px", fontFamily: T.mono, fontSize: 13, lineHeight: 1.6, minHeight: 24 }}>
            {output.length === 0
              ? <span style={{ color: T.faint }}>(no output; use console.log to print something)</span>
              : output.map((l, i) => (
                <div key={i} style={{ color: l.kind === "error" ? T.red : l.kind === "warn" ? T.amber : "#c9f7e0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {l.kind === "error" ? "✕ " : ""}{l.text}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
