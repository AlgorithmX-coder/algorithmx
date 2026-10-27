"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { T } from "./tokens";

/* Cyber Pro note-taking (AI-summarise mode).
 *
 * The learner highlights any passage in the lesson; a floating "Summarise to
 * notes" pill appears by the selection, and tapping it sends the passage to
 * /api/pro/summarise, which condenses it into a short revision note that
 * streams into a side drawer. Notes are kept per module in localStorage, so
 * they build up across the module's five topics and survive a reload.
 *
 * Everything degrades gracefully: not signed in prompts a sign-in, the daily
 * AI limit keeps the raw highlight as the note, and a model hiccup falls back
 * to the highlight too, so a note is never lost. */

type Note = { id: string; text: string; ts: number };

const MIN_SELECTION = 12; // characters, so a stray click never offers a note

function tidy(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 400 ? clean.slice(0, 397).trimEnd() + "..." : clean;
}

export default function LessonNotes({ notebookKey, title, leftSlot }: { notebookKey: string; title: string; leftSlot?: ReactNode }) {
  const storeKey = `pro:notes:${notebookKey}`;
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ text: string; x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; signIn?: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // Load this module's notes once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const arr = JSON.parse(raw) as Note[];
        if (Array.isArray(arr)) setNotes(arr.filter((n) => n && typeof n.text === "string" && n.text.trim()));
      }
    } catch { /* no stored notes */ }
    setLoaded(true);
  }, [storeKey]);

  // Persist (skip notes still streaming in, i.e. empty text).
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(storeKey, JSON.stringify(notes.filter((n) => n.text.trim()))); } catch { /* ignore */ }
  }, [notes, loaded, storeKey]);

  // Watch for a text selection inside the lesson body and place the pill.
  useEffect(() => {
    const root = document.querySelector(".pro-main");
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setPill(null); return; }
      const text = sel.toString().trim();
      if (text.length < MIN_SELECTION) { setPill(null); return; }
      const node = sel.anchorNode;
      if (!root || !node || !root.contains(node)) { setPill(null); return; }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) { setPill(null); return; }
      const x = Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90);
      const y = Math.max(rect.top - 10, 48);
      setPill({ text, x, y });
    };
    document.addEventListener("mouseup", update);
    document.addEventListener("keyup", update);
    return () => { document.removeEventListener("mouseup", update); document.removeEventListener("keyup", update); };
  }, []);

  const clearSelection = () => { try { window.getSelection()?.removeAllRanges(); } catch { /* ignore */ } setPill(null); };

  const summarise = useCallback(async (text: string) => {
    if (busy) return;
    setBusy(true); setError(null); setOpen(true); clearSelection();
    const id = (crypto as Crypto).randomUUID ? crypto.randomUUID() : String(Date.now());
    setNotes((p) => [{ id, text: "", ts: Date.now() }, ...p]);
    const drop = () => setNotes((p) => p.filter((n) => n.id !== id));
    const keepRaw = () => setNotes((p) => p.map((n) => (n.id === id ? { ...n, text: tidy(text) } : n)));
    try {
      const res = await fetch("/api/pro/summarise", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, text: text.slice(0, 6000) }) });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (res.status === 401) { drop(); setError({ text: "Sign in to make notes.", signIn: true }); return; }
        if (res.status === 429) { keepRaw(); setError({ text: "Daily AI limit reached, so I kept your highlight as the note." }); return; }
        drop(); setError({ text: data?.error ?? "Could not make that note. Try again shortly." }); return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setNotes((p) => p.map((n) => (n.id === id ? { ...n, text: acc } : n)));
      }
      if (!acc.trim()) keepRaw();
    } catch {
      keepRaw();
      setError({ text: "The note maker had a moment, so I kept your highlight." });
    } finally {
      setBusy(false);
    }
  }, [busy, title]);

  const remove = (id: string) => setNotes((p) => p.filter((n) => n.id !== id));

  return (
    <>
      {/* floating "summarise" pill by the current selection */}
      {pill && !busy && (
        <div ref={pillRef} style={{ position: "fixed", left: pill.x, top: pill.y, transform: "translate(-50%, -100%)", zIndex: 60 }}>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => summarise(pill.text)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.display, fontSize: 13, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 9, padding: "9px 14px", cursor: "pointer", boxShadow: "0 8px 22px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
            <Sparkle /> Summarise to notes
          </button>
        </div>
      )}

      {/* floating action dock: an optional sibling action (e.g. Test me) sits
          to the left of the notes open/close toggle */}
      <div style={{ position: "fixed", right: 18, bottom: 18, zIndex: 55, display: "flex", alignItems: "center", gap: 10 }}>
        {leftSlot}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close your notes" : "Open your notes"}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: open ? T.ink : "#fff", background: open ? T.panel : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: open ? `1px solid ${T.edge}` : "none", borderRadius: 999, padding: "11px 17px", cursor: "pointer", boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>
          <Sparkle /> Notes{notes.length > 0 ? ` (${notes.length})` : ""}
        </button>
      </div>

      {/* notes drawer */}
      {open && (
        <aside aria-label="Your notes" style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 58, width: "min(360px, 92vw)", background: T.bgRaise, borderLeft: `1px solid ${T.edge}`, boxShadow: "-18px 0 44px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", borderBottom: `1px solid ${T.edge}` }}>
            <div>
              <div style={{ fontFamily: T.display, fontSize: 16, fontWeight: 800, color: T.ink }}>Your notes</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.08em", color: T.faint, marginTop: 2 }}>THIS MODULE &middot; SAVED ON THIS DEVICE</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close notes" style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", padding: 4, lineHeight: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </header>

          {error && (
            <div style={{ margin: "12px 14px 0", background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 8, padding: "10px 13px", fontSize: 13, color: T.body, lineHeight: 1.5 }}>
              {error.text}
              {error.signIn && <>{" "}<a href={`/login?callbackUrl=${encodeURIComponent("/pro/course")}`} style={{ color: T.cyan, fontWeight: 700 }}>Sign in</a>.</>}
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.length === 0 && !busy ? (
              <div style={{ margin: "auto", textAlign: "center", padding: "24px 10px", color: T.faint }}>
                <div style={{ marginBottom: 10 }}><Sparkle big /></div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>Highlight any part of the lesson, then tap <b style={{ color: T.body }}>Summarise to notes</b>. Your notes build up here as you go.</p>
              </div>
            ) : (
              notes.map((n) => (
                <div key={n.id} style={{ position: "relative", background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 11, padding: "12px 34px 12px 14px" }}>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: T.body, whiteSpace: "pre-wrap" }}>
                    {n.text.trim() ? n.text : <span style={{ color: T.faint }}>summarising&hellip;</span>}
                  </div>
                  {n.text.trim() && (
                    <button onClick={() => remove(n.id)} aria-label="Delete note" style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", color: T.faint, cursor: "pointer", padding: 4, lineHeight: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </>
  );
}

function Sparkle({ big = false }: { big?: boolean }) {
  const s = big ? 30 : 15;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l1.8 4.9L18.7 9.7 13.8 11.5 12 16.4 10.2 11.5 5.3 9.7 10.2 7.9z" />
      <path d="M18.5 15.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
    </svg>
  );
}
