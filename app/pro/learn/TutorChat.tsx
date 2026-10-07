"use client";

import { useRef, useState } from "react";
import { T } from "./tokens";

/* The Cyber Pro AI tutor, shown in the Check phase under "Explain it back".
 *
 * The learner writes their explanation, then asks the tutor for feedback;
 * the tutor replies warmly and specifically (grounded in this lesson), and
 * they can keep asking follow-ups ("explain that more simply", "why does
 * that matter?"). Replies stream in from /api/pro/tutor.
 *
 * Everything degrades gracefully: not signed in, allowance spent, or the
 * model unavailable all surface a gentle message, and the static model
 * answer stays one tap away, so the tutor never blocks finishing a lesson. */

type Msg = { role: "user" | "assistant"; content: string };

export default function TutorChat({
  lesson,
  getDraft,
  modelAnswer,
}: {
  lesson: { title: string; teaching: string };
  getDraft: () => string;
  modelAnswer: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<{ text: string; signIn?: boolean } | null>(null);
  const [showModel, setShowModel] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const started = messages.length > 0;

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || streaming) return;
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch("/api/pro/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lesson, messages: next }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setMessages(next); // drop the empty assistant bubble
        setError({ text: data?.error ?? "The tutor is unavailable right now.", signIn: res.status === 401 });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
        requestAnimationFrame(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; });
      }
      if (!acc.trim()) {
        setMessages(next);
        setError({ text: "The tutor had nothing to add there. Try asking in another way." });
      }
    } catch {
      setMessages(next);
      setError({ text: "The tutor is having a moment. Try again shortly." });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      {!started && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => { const d = getDraft().trim(); if (d.length >= 10) send(`Here is my explanation, could you give me feedback?\n\n${d}`); }}
            disabled={getDraft().trim().length < 10 || streaming}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", background: getDraft().trim().length < 10 ? T.edge : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 10, padding: "11px 18px", cursor: getDraft().trim().length < 10 ? "not-allowed" : "pointer", opacity: getDraft().trim().length < 10 ? 0.6 : 1 }}>
            <TutorGlyph /> Ask your tutor for feedback
          </button>
          <button onClick={() => setShowModel((s) => !s)}
            style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.faint, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            or just show a model answer
          </button>
        </div>
      )}

      {(started || streaming) && (
        <div ref={scroller} style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "4px 2px 2px" }}>
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} style={{ alignSelf: "flex-end", maxWidth: "88%", background: T.primarySoft, border: `1px solid ${T.primary}44`, borderRadius: "12px 12px 3px 12px", padding: "10px 13px", fontSize: 14.5, lineHeight: 1.55, color: T.body, whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            ) : (
              <div key={i} style={{ alignSelf: "flex-start", maxWidth: "92%", display: "flex", gap: 9 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}><TutorGlyph /></div>
                <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: "12px 12px 12px 3px", padding: "10px 13px", fontSize: 14.5, lineHeight: 1.6, color: T.body, whiteSpace: "pre-wrap" }}>
                  {m.content || <span style={{ color: T.faint }}>thinking&hellip;</span>}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 10, background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 8, padding: "10px 13px", fontSize: 13.5, color: T.body, lineHeight: 1.5 }}>
          {error.text}
          {error.signIn && (
            <>{" "}<a href={`/login?callbackUrl=${encodeURIComponent("/pro/course")}`} style={{ color: T.cyan, fontWeight: 700 }}>Sign in</a> to use the tutor.</>
          )}
        </div>
      )}

      {started && (
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this lesson..."
            aria-label="Ask the tutor about this lesson"
            disabled={streaming}
            style={{ flex: 1, minWidth: 0, background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 9, fontFamily: T.sans, fontSize: 14.5, padding: "11px 13px", outline: "none" }}
          />
          <button type="submit" disabled={streaming || !input.trim()}
            style={{ flexShrink: 0, fontFamily: T.display, fontWeight: 700, fontSize: 14, color: "#fff", background: streaming || !input.trim() ? T.edge : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "0 18px", cursor: streaming || !input.trim() ? "not-allowed" : "pointer" }}>
            {streaming ? "…" : "Send"}
          </button>
        </form>
      )}

      {showModel && (
        <div style={{ marginTop: 12, background: T.greenSoft, border: `1px solid ${T.green}55`, borderRadius: 8, padding: "12px 15px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.green, marginBottom: 6 }}>A STRONG ANSWER LOOKS LIKE</div>
          <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.6 }}>{modelAnswer}</div>
        </div>
      )}

      {started && !showModel && (
        <button onClick={() => setShowModel(true)}
          style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11.5, fontWeight: 600, color: T.faint, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>
          show a model answer
        </button>
      )}
    </div>
  );
}

function TutorGlyph() {
  return (
    <span aria-hidden style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 7, background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, color: "#fff", fontFamily: T.mono, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
      ai
    </span>
  );
}
