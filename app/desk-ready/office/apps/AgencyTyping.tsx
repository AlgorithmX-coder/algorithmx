"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { W } from "../../tokens";
import { AGENCY, PASS, PASSAGE, clock, scoreTyping, typingPassed, type TypingScore } from "../agency";
import { AppButton } from "../ui";

/* The agency's typing test (Module 13, E13.2): a business letter to copy,
 * a box to type in, and a live readout of the time left, the speed and the
 * accuracy, as UK recruitment agencies run it. The clock starts with the
 * first letter typed and the test ends by itself when it runs out (or the
 * whole letter is typed). Pasting is blocked. Marking is office/agency's
 * scoreTyping, word by word, so the live figures and the result agree.
 *
 * Used by the agency's test centre in the office and by the lesson's short
 * practice, with `seconds` set to fit. */

export const BAD = "#a4262c";

export function TypingTest({ seconds, practice, passage = PASSAGE, onFinish, height = 190 }: { seconds: number; practice: boolean; passage?: readonly string[]; onFinish: (r: TypingScore) => void; height?: number }) {
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const finished = useRef(false);

  const paras = useMemo(() => passage.map((p) => p.split(/\s+/).filter(Boolean)), [passage]);
  const all = useMemo(() => paras.flat(), [paras]);
  const elapsed = start === null ? 0 : Math.min(seconds, (now - start) / 1000);
  const left = Math.max(0, seconds - elapsed);
  const live = scoreTyping(typed, Math.max(elapsed, 1), all);
  const got = typed.split(/\s+/).filter(Boolean);
  const current = /\s$/.test(typed) || !typed ? got.length : got.length - 1;
  const wrong = new Set(live.wrongAt);

  const finish = (secs: number, text = typed) => {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    const r = scoreTyping(text, secs, all);
    const { wrongAt: _w, ...rest } = r;
    void _w;
    onFinish(rest);
  };

  useEffect(() => {
    if (start === null || done) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [start, done]);

  useEffect(() => {
    if (start !== null && !done && elapsed >= seconds) finish(seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, start, done]);

  /* keep the word being typed in view inside the letter, never the page */
  useLayoutEffect(() => {
    const box = boxRef.current;
    const cur = curRef.current;
    if (!box || !cur) return;
    const top = cur.offsetTop - box.offsetTop;
    if (top - box.scrollTop > box.clientHeight - 48 || top < box.scrollTop) box.scrollTop = Math.max(0, top - 36);
  }, [current]);

  const onType = (v: string) => {
    if (done) return;
    const t = start ?? Date.now();
    if (start === null) {
      setStart(t);
      setNow(t);
    }
    setTyped(v);
    /* the whole letter typed: stop the clock there */
    const words = v.split(/\s+/).filter(Boolean);
    if (words.length >= all.length && (words[all.length - 1] === all[all.length - 1] || /\s$/.test(v))) {
      finish(Math.max(1, (Date.now() - t) / 1000), v);
    }
  };

  const restart = () => {
    finished.current = false;
    setTyped("");
    setStart(null);
    setNow(0);
    setDone(false);
    if (boxRef.current) boxRef.current.scrollTop = 0;
    inputRef.current?.focus();
  };

  let index = 0;
  const shownSpeed = start === null || elapsed < 3 ? "–" : String(live.net);
  const shownAcc = start === null || !typed.trim() ? "–" : `${Math.floor(live.accuracy)}%`;
  const accOk = live.accuracy >= PASS.accuracy;
  const speedOk = live.net >= PASS.wpm;

  return (
    <div style={{ display: "grid", gap: 12, fontFamily: W.font, color: W.ink }}>
      {/* the live readout */}
      <div role="group" aria-label="How you're doing" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        <Stat label={practice ? "Practice: time left" : "Time left"} value={clock(Math.ceil(left))} strong={start !== null && left <= 15 && !done} />
        <Stat label="Speed (words a minute)" value={shownSpeed} tone={start === null || elapsed < 3 ? undefined : speedOk ? "good" : undefined} />
        <Stat label="Accuracy" value={shownAcc} tone={shownAcc === "–" ? undefined : accOk ? "good" : "bad"} />
      </div>

      {/* the letter to copy */}
      <div ref={boxRef} aria-label="The text to type" style={{ position: "relative", height, overflowY: "auto", padding: "12px 16px", border: `1px solid ${W.edge}`, borderRadius: 6, background: W.page, fontSize: 17, lineHeight: 1.75, overflowWrap: "normal" }}>
        {paras.map((p, pi) => (
          <p key={pi} style={{ margin: pi ? "10px 0 0" : 0 }}>
            {p.map((w) => {
              const i = index++;
              const isCur = i === current && !done;
              const typedWord = got[i];
              const isWrong = wrong.has(i) && typedWord !== undefined;
              const isDone = i < current;
              const style: CSSProperties = isCur
                ? { background: "#fff1b8", boxShadow: "0 0 0 2px #fff1b8", borderRadius: 3, color: isWrong ? BAD : W.ink }
                : isWrong
                  ? { color: BAD, textDecoration: "underline wavy", textDecorationColor: BAD }
                  : isDone
                    ? { color: W.excel }
                    : { color: W.body };
              return (
                <span key={i}>
                  <span ref={isCur ? curRef : undefined} style={style}>
                    {w}
                  </span>{" "}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {/* where to type */}
      <textarea
        ref={inputRef}
        aria-label="Type the text here"
        value={typed}
        disabled={done}
        onChange={(e) => onType(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        rows={4}
        placeholder="Click here and start typing. The clock starts with your first letter."
        style={{ width: "100%", boxSizing: "border-box", resize: "none", padding: "10px 12px", border: `2px solid ${done ? W.edge : AGENCY.colour}`, borderRadius: 6, fontFamily: W.font, fontSize: 17, lineHeight: 1.5, color: W.ink, background: done ? W.chrome : W.page, outline: "none" }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        {practice && start !== null && !done && (
          <AppButton onClick={() => finish(Math.max(1, elapsed))} style={{ minHeight: 40 }}>
            Stop and see my score
          </AppButton>
        )}
        {practice && start !== null && !done && <AppButton onClick={restart}>Start again</AppButton>}
        <span style={{ fontSize: 14, color: W.muted }}>
          {done ? "Time is up." : start === null ? "Type every word as it's written, capitals and full stops too. Press Space between words." : practice ? "Green words are right. A red word needs fixing: Backspace to it and type it again." : `The test stops by itself after ${Math.round(seconds / 60)} minutes.`}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone, strong }: { label: string; value: string; tone?: "good" | "bad"; strong?: boolean }) {
  return (
    <div style={{ padding: "8px 12px", borderRadius: 6, background: strong ? "#fde7e9" : W.chrome, border: `1px solid ${W.edge}`, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 12.5, color: W.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      <b style={{ display: "block", fontSize: 26, fontWeight: 600, lineHeight: 1.2, fontVariantNumeric: "tabular-nums", color: tone === "good" ? W.excel : tone === "bad" ? BAD : W.ink }}>{value}</b>
    </div>
  );
}

/* The result, the way agencies show it: gross and net speed, accuracy and
 * mistakes, against what their clients ask for. */
export function TypingResultCard({ r, practice }: { r: TypingScore; practice: boolean }) {
  const pass = typingPassed(r);
  const cells: [string, string, string][] = [
    ["Gross speed", `${r.gross} wpm`, "Every word you typed, right or wrong"],
    ["Mistakes", String(r.errors), r.errors === 1 ? "One word left wrong" : "Words left wrong"],
    ["Net speed", `${r.net} wpm`, "Gross speed, less one word a minute for each mistake"],
    ["Accuracy", `${Math.floor(r.accuracy)}%`, "Letters typed right"],
  ];
  return (
    <div style={{ display: "grid", gap: 12, fontFamily: W.font, color: W.ink }}>
      <div role="status" style={{ padding: "12px 16px", borderRadius: 6, background: pass ? "#dff6dd" : "#fff4ce", border: `1px solid ${pass ? "#9fd89f" : "#f2d48a"}`, fontSize: 16, lineHeight: 1.5 }}>
        <b>{pass ? "Pass." : "Not a pass yet."}</b> {pass ? `That meets what most office clients ask for: ${PASS.wpm} words a minute at ${PASS.accuracy}% accuracy.` : `Most office clients ask for ${PASS.wpm} words a minute (net) at ${PASS.accuracy}% accuracy. ${r.net < PASS.wpm && r.accuracy >= PASS.accuracy ? "Your accuracy is there; speed comes with practice." : r.accuracy < PASS.accuracy ? "Slow down a little and fix slips as you go: accuracy counts first." : ""}`}
        {practice && <span style={{ display: "block", marginTop: 4, color: W.muted, fontSize: 14 }}>This was a practice run. It isn&apos;t sent to anyone.</span>}
      </div>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {cells.map(([k, v, note]) => (
          <div key={k} style={{ padding: "10px 12px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page }}>
            <dt style={{ fontSize: 13, color: W.muted }}>{k}</dt>
            <dd style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</dd>
            <dd style={{ margin: "2px 0 0", fontSize: 12.5, lineHeight: 1.4, color: W.muted }}>{note}</dd>
          </div>
        ))}
      </dl>
      <p style={{ margin: 0, fontSize: 13.5, color: W.muted }}>
        {r.words} words typed in {clock(r.seconds)}.
      </p>
    </div>
  );
}
