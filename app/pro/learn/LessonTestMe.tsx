"use client";

import { useCallback, useEffect, useState } from "react";
import { T } from "./tokens";
import TestRunner from "./TestRunner";
import { buildModuleTest, collectDoneTopicIds } from "./quizPool";

/* The in-lesson "Test me" button, sitting beside Notes on every module.
 *
 * It opens a quick self-test on the CURRENT module in a modal, using the
 * shared TestRunner so it matches the full-page Test Me exactly. Questions
 * come from the topics the learner has finished in this module, or the whole
 * module if none are finished yet, so it is useful from the first topic.
 * Nothing is blocked and nothing is saved; it is purely a self-check. */

export default function LessonTestMe({ moduleN }: { moduleN: number }) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock the background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const load = useCallback(async () => {
    const { questions, finishedOnly } = await buildModuleTest(moduleN, await collectDoneTopicIds(), 8);
    const note = finishedOnly
      ? "Pulled from the topics you have finished in this module. One attempt each, then the answer is explained."
      : "A quick check across this module. One attempt each, then the answer is explained.";
    return { questions, note };
  }, [moduleN]);

  return (
    <>
      {/* the floating button, placed to the left of Notes in the shared dock */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Test me on this module"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: T.ink, background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 999, padding: "11px 17px", cursor: "pointer", boxShadow: "0 10px 26px rgba(0,0,0,0.45)" }}>
        <Shield /> Test me
      </button>

      {/* the test, in a modal over the lesson */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Test me"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(5,4,12,0.72)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 16px 24px", overflowY: "auto" }}>
          <div style={{ width: "min(640px, 100%)", background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "15px 20px", borderBottom: `1px solid ${T.edge}` }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.primary }}><Shield /> Test me</span>
              <button onClick={() => setOpen(false)} aria-label="Close test" style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", padding: 4, lineHeight: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </header>
            <div style={{ padding: "18px 20px 24px" }}>
              <TestRunner
                load={load}
                emptyNode={<p style={{ fontSize: 15, color: T.body, lineHeight: 1.6, margin: 0 }}>There are no questions to pull for this module yet. Finish a topic first, then test yourself on it.</p>}
                secondaryAction={<button onClick={() => setOpen(false)} style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: T.ink, background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 10, padding: "12px 22px", cursor: "pointer" }}>Close</button>}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* A shield with a tick, matching the course's "Check / prove it" stage. */
function Shield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3.5l7 2.6v5.3c0 4.2-3 6.9-7 8.4-4-1.5-7-4.2-7-8.4V6.1l7-2.6z" />
      <path d="M9 12l2 2 4-4.4" />
    </svg>
  );
}
