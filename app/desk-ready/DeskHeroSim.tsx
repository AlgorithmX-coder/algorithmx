"use client";

import { useState } from "react";

/**
 * The Desk Ready hero's proof: a real taste of Module 2, lesson 1, on dark
 * glass over the photograph (the Corporate paste-test pattern). The visitor
 * writes a subject line for a short delivery and the checks tick as they
 * type, exactly as the lesson marks it. Nothing is sent and nothing leaves
 * the page.
 */

const CHECKS: { label: string; ok: (s: string) => boolean }[] = [
  { label: "Says which order", ok: (s) => /4417/.test(s) },
  { label: "Says what is wrong", ok: (s) => /short|missing|pallet|damag/i.test(s) },
  { label: "Short enough to read at a glance", ok: (s) => { const n = s.trim().split(/\s+/).filter(Boolean).length; return n >= 3 && n <= 10; } },
  { label: "Calm, with no shouting", ok: (s) => s.trim() !== "" && !/\b[A-Z]{4,}\b|!!/.test(s) },
];

const EXAMPLE = "Order 4417 arrived two pallets short";

export default function DeskHeroSim() {
  const [subject, setSubject] = useState("");
  const results = CHECKS.map((c) => c.ok(subject));
  const passed = results.filter(Boolean).length;
  const done = passed === CHECKS.length;

  return (
    <div className="dr-sim" role="group" aria-label="Try it: write a subject line">
      <div className="dr-sim-bar">
        <span className="dr-sim-dots" aria-hidden><i /><i /><i /></span>
        <span className="dr-sim-app">Outlook <span>· practice inbox</span></span>
        <span className="dr-sim-chip">Module 2</span>
      </div>
      <div className="dr-sim-body">
        <p className="dr-sim-task">
          <span>The job</span>
          Delivery 4417 has just arrived two pallets short. Write the subject line for your email to the supplier.
        </p>
        <div className="dr-sim-mail">
          <div className="dr-sim-row">
            <span className="dr-sim-lab">To</span>
            <span className="dr-sim-to">orders@brightlinesupplies.co.uk</span>
          </div>
          <label className="dr-sim-row">
            <span className="dr-sim-lab">Subject</span>
            <input
              className="dr-sim-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Type a subject line"
              autoComplete="off"
              spellCheck
            />
          </label>
        </div>
        <ul className="dr-sim-checks" aria-live="polite">
          {CHECKS.map((c, i) => (
            <li key={c.label} className={results[i] ? "on" : ""}>
              <span className="dr-sim-tick" aria-hidden>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5 L10 17.5 L19 7" />
                </svg>
              </span>
              {c.label}
              <span className="dr-sr">{results[i] ? ": done" : ": not yet"}</span>
            </li>
          ))}
        </ul>
        <div className="dr-sim-foot">
          {done ? (
            <p className="dr-sim-done">Ready to send. That is lesson one of Module 2, and you have just done it.</p>
          ) : (
            <>
              <p className="dr-sim-note">{passed} of {CHECKS.length} checks. Nothing is sent: practice only.</p>
              {subject === "" && (
                <button type="button" className="dr-sim-alt" onClick={() => setSubject(EXAMPLE)}>
                  Show me one
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
