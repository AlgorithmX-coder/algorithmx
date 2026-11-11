"use client";

import type { CSSProperties } from "react";
import { W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* A video interview, drawn with every part numbered (Module 13): the call
 * window as Teams shows it, with the interviewer, your own picture and the
 * buttons, and beside it a side view of a good set-up (camera at eye
 * level, light in front). Then an answer to "Tell me about a time..."
 * split into its four STAR parts. */

const keep: CSSProperties = { whiteSpace: "nowrap" };

/* ── 1. the call ──────────────────────────────────────────────────────── */

export type CallPart = "join" | "them" | "you" | "eyelevel" | "light" | "background" | "mute" | "camera" | "leave";

export const CALL_PARTS: Record<CallPart, PartInfo> = {
  join: { n: 1, name: "The interview and its link", what: "Who, when, and the Join button from the invite. Test the link the day before, and join five minutes early." },
  them: { n: 2, name: "The interviewer", what: "Look at the camera when you speak, not at their face: to them, that's eye contact." },
  you: { n: 3, name: "Your picture", what: "Head and shoulders, centred, a little space above your head. Check it before you join." },
  eyelevel: { n: 4, name: "Camera at eye level", what: "Raise the laptop on books or a box so the camera is level with your eyes, about an arm's length away." },
  light: { n: 5, name: "Light in front of you", what: "Face a window or a lamp. A window behind you turns you into a dark shape." },
  background: { n: 6, name: "Your background", what: "A plain, tidy wall is best. Or turn on background blur. Nothing personal on show." },
  mute: { n: 7, name: "Microphone", what: "On while you talk. If a dog barks or a door goes, mute, then unmute to answer." },
  camera: { n: 8, name: "Camera", what: "Keep it on for the whole interview, unless they say otherwise." },
  leave: { n: 9, name: "Leave", what: "Only when they've said goodbye. Thank them first." },
};

function Person({ shirt, hair, skin, size = 120 }: { shirt: string; hair: string; skin: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 160 120" aria-hidden style={{ display: "block" }}>
      <path d="M30 120 C34 92 56 82 80 82 C104 82 126 92 130 120 Z" fill={shirt} />
      <rect x="71" y="66" width="18" height="20" rx="6" fill={skin} />
      <circle cx="80" cy="50" r="24" fill={skin} />
      <path d="M56 50 C55 30 68 22 80 22 C94 22 106 30 104 50 C100 38 92 34 80 34 C68 34 60 38 56 50 Z" fill={hair} />
    </svg>
  );
}

const btn = (label: string, on: boolean, red?: boolean) => (
  <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 48, padding: "4px 6px", borderRadius: 6, background: red ? "#c4314b" : on ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff", fontSize: 11, ...keep }}>
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden style={{ display: "block" }} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {label === "Mic" ? (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11 a7 7 0 0 0 14 0 M12 18 v3" />
        </>
      ) : label === "Camera" ? (
        <>
          <rect x="3" y="7" width="12" height="10" rx="2" />
          <path d="M15 11 l6 -3 v8 l-6 -3" />
        </>
      ) : label === "Leave" ? (
        <path d="M4 14 c4 -4 12 -4 16 0 l-2 3 l-3 -1 v-2 c-2 -1 -4 -1 -6 0 v2 l-3 1 z" fill="#fff" />
      ) : (
        <path d="M4 5 h16 v11 h-9 l-4 3 v-3 h-3 z" />
      )}
    </svg>
    {label}
  </span>
);

export function InterviewFigure({ focus, title = "A video interview", what, note }: { focus?: CallPart[]; title?: string; what?: Partial<Record<CallPart, string>>; note?: string }) {
  const info = { ...CALL_PARTS } as Record<CallPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as CallPart[]) info[k] = { ...info[k], what: what![k]! };
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={660}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(190px, 1fr)", gap: 46, alignItems: "start", overflowWrap: "normal" }}>
        {/* the call window */}
        <div style={{ borderRadius: 8, boxShadow: W.float, background: W.call, color: "#fff", overflow: "visible" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: W.teams, borderRadius: "8px 8px 0 0", fontSize: 13 }}>
            <b>Teams</b>
          </div>
          <div style={{ padding: "10px 14px 0 48px" }}>
            <Part k="join">
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.08)", fontSize: 12.5, lineHeight: 1.35 }}>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 13.5 }}>Interview: Office Administrator</b>
                  <span style={{ opacity: 0.8 }}>Castlegate Builders Merchants · Thursday 10:00</span>
                </span>
                <span style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 4, background: W.teams, fontWeight: 700, ...keep }}>Join</span>
              </div>
            </Part>
          </div>
          <div style={{ position: "relative", padding: "12px 14px 10px 48px" }}>
            <Part k="them">
              <div style={{ height: 176, borderRadius: 6, background: "linear-gradient(180deg, #50606e, #3a4752)", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
                <Person shirt="#1f3b57" hair="#2b2b2b" skin="#c58c6a" size={170} />
                <span style={{ position: "absolute", left: 8, bottom: 6, fontSize: 11.5, padding: "1px 6px", borderRadius: 3, background: "rgba(0,0,0,0.5)", ...keep }}>Helen Wright, Office Manager</span>
              </div>
            </Part>
            {/* your own picture, in the corner */}
            <div style={{ position: "absolute", right: 22, bottom: 18 }}>
              <Part k="you" holds={["background"]} badge="left">
                <div style={{ position: "relative", width: 132, height: 92, borderRadius: 6, overflow: "hidden", background: "#e9e4dc", border: "2px solid #fff" }}>
                  <Part k="background" noBadge style={{ position: "absolute", left: 3, right: 3, top: 3, height: 40, borderRadius: 4 }}>
                    <span />
                  </Part>
                  <span aria-hidden style={{ position: "absolute", right: 10, top: 14, width: 14, height: 22, borderRadius: "40% 40% 4px 4px", background: "#6d9b6a" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: -2, display: "flex", justifyContent: "center" }}>
                    <Person shirt="#7a4b8c" hair="#5a3825" skin="#e8b896" size={110} />
                  </div>
                  <span style={{ position: "absolute", left: 4, bottom: 3, fontSize: 10, color: "#fff", padding: "0 4px", borderRadius: 2, background: "rgba(0,0,0,0.45)" }}>You</span>
                </div>
              </Part>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 30, padding: "8px 10px 12px 48px", borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
            {btn("Chat", false)}
            <Part k="mute" block={false} badge="top">
              {btn("Mic", true)}
            </Part>
            <Part k="camera" block={false} badge="top">
              {btn("Camera", true)}
            </Part>
            <Part k="leave" block={false} badge="top">
              {btn("Leave", false, true)}
            </Part>
          </div>
        </div>

        {/* the set-up, from the side */}
        <div style={{ borderRadius: 8, boxShadow: W.float, background: W.page, color: W.ink, padding: "10px 12px 12px 12px" }}>
          <b style={{ display: "block", fontSize: 13.5 }}>Your set-up, from the side</b>
          <div style={{ position: "relative", marginTop: 8 }}>
            <svg width="100%" viewBox="0 0 220 170" aria-hidden style={{ display: "block" }}>
              {/* window in front of you, behind the laptop */}
              <rect x="176" y="14" width="38" height="70" rx="2" fill="#dbeafe" stroke="#93b4d8" />
              <line x1="195" y1="14" x2="195" y2="84" stroke="#93b4d8" />
              <path d="M174 50 L120 62 M174 40 L120 46 M174 62 L122 78" stroke="#f5c542" strokeWidth="2" strokeDasharray="3 3" />
              {/* desk */}
              <rect x="70" y="120" width="140" height="6" fill="#a47148" />
              <rect x="80" y="126" width="6" height="40" fill="#a47148" />
              <rect x="194" y="126" width="6" height="40" fill="#a47148" />
              {/* books, laptop on top */}
              <rect x="128" y="104" width="44" height="7" fill="#c0504d" />
              <rect x="126" y="111" width="48" height="9" fill="#4f81bd" />
              <rect x="128" y="100" width="44" height="4" fill="#7f7f7f" />
              <rect x="166" y="60" width="5" height="42" fill="#595959" transform="rotate(8 168 80)" />
              <circle cx="166" cy="62" r="2.2" fill="#111" />
              {/* you */}
              <circle cx="52" cy="62" r="15" fill="#e8b896" />
              <path d="M38 58 C38 44 66 44 66 58 C60 52 44 52 38 58 Z" fill="#5a3825" />
              <path d="M30 120 C30 92 40 80 52 80 C64 80 72 92 74 120 Z" fill="#7a4b8c" />
              <rect x="30" y="120" width="44" height="46" fill="#7a4b8c" opacity="0.4" />
              {/* eye line */}
              <line x1="62" y1="60" x2="164" y2="62" stroke={W.teams} strokeWidth="1.6" strokeDasharray="5 4" />
            </svg>
            <Part k="eyelevel" style={{ position: "absolute", left: "26%", top: "30%", width: "52%", height: "12%", borderRadius: 4 }}>
              <span />
            </Part>
            <Part k="light" badge="right" style={{ position: "absolute", right: "1%", top: "6%", width: "19%", height: "44%", borderRadius: 4 }}>
              <span />
            </Part>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.45, color: W.muted }}>Laptop on two books, camera level with your eyes, window in front of you.</p>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 2. a STAR answer ─────────────────────────────────────────────────── */

export type StarPart = "question" | "situation" | "task" | "action" | "result";

export const STAR_PARTS: Record<StarPart, PartInfo> = {
  question: { n: 1, name: "\"Tell me about a time...\"", what: "They want one true story, not \"I always...\". Pick a real moment before the interview." },
  situation: { n: 2, name: "S: Situation", what: "Where you were and what was going on. One sentence." },
  task: { n: 3, name: "T: Task", what: "What you had to do, or the problem to solve. One sentence." },
  action: { n: 4, name: "A: Action", what: "What YOU did, step by step. The longest part: say \"I\", not \"we\"." },
  result: { n: 5, name: "R: Result", what: "How it ended, with a number or a fact if you have one, and what you learned." },
};

const STAR = {
  question: "Tell me about a time you spotted a mistake.",
  situation: "On my placement at a wholesaler, the weekly sales summary said one café had spent over a thousand pounds. They never spend that much.",
  task: "I had to find out why before the sheet went to the manager.",
  action: "I coloured every order over £500 so it stood out, found one typed as 1080 instead of £108.00, checked it against the order form and put it right.",
  result: "The total was right again, and I told the manager in one line what had gone wrong. Now I always check the big numbers first.",
};

export function StarFigure({ focus, title = "An answer, the STAR way", what, note }: { focus?: StarPart[]; title?: string; what?: Partial<Record<StarPart, string>>; note?: string }) {
  const info = { ...STAR_PARTS } as Record<StarPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as StarPart[]) info[k] = { ...info[k], what: what![k]! };
  const row = (k: Exclude<StarPart, "question">, letter: string, colour: string) => (
    <Part k={k}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: W.page, borderLeft: `5px solid ${colour}` }}>
        <b aria-hidden style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 6, background: colour, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{letter}</b>
        <span style={{ fontSize: 15, lineHeight: 1.5, color: W.ink }}>{STAR[k]}</span>
      </div>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gap: 10, paddingLeft: 40, maxWidth: 700, overflowWrap: "normal" }}>
        <Part k="question">
          <div style={{ padding: "10px 14px", borderRadius: 8, background: W.teamsSoft, color: W.ink, fontSize: 16, fontWeight: 600 }}>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: W.teams }}>Helen asks</span>
            {STAR.question}
          </div>
        </Part>
        {row("situation", "S", W.teams)}
        {row("task", "T", W.outlook)}
        {row("action", "A", W.excel)}
        {row("result", "R", W.files)}
      </div>
    </FigureFrame>
  );
}
