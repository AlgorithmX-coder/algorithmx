"use client";

import { useMemo, useState } from "react";

/**
 * The paste test, live on the landing page.
 *
 * This is the course's signature mechanic in miniature: a prompt a finance
 * assistant would really type, graded before any AI sees it. The rules layer
 * is the same shape the course uses (every named item in an invented data
 * pack, plus the patterns a bank detail or NI number always follows); the
 * model layer that explains and rewrites lives in the course, not here.
 *
 * Nothing typed here leaves the browser. There is no request: the grading
 * is a handful of regular expressions.
 */

type Cls = "P" | "I" | "C" | "R";

const CLASS: Record<Cls, string> = {
  P: "PUBLIC",
  I: "INTERNAL",
  C: "CONFIDENTIAL",
  R: "RESTRICTED",
};
/* the sand accent ramp, all 4.5:1 or better on the ground */
const COLOUR: Record<Cls, string> = {
  P: "#0e7a45",
  I: "#0a7085",
  C: "#8a5400",
  R: "#a63a08",
};
const RANK: Record<Cls, number> = { P: 0, I: 1, C: 2, R: 3 };

/* The invented data pack. Marlow Fenwick LLP and Ashcombe Building Supplies
   do not exist; the bank details are the UK test ranges. */
const PACK: ReadonlyArray<{ re: string; cls: Cls; label: string }> = [
  { re: "ashcombe(\\s+building(\\s+supplies)?(\\s+ltd)?)?", cls: "C", label: "client name" },
  { re: "daniel\\s+okafor|okafor|\\bdaniel\\b", cls: "C", label: "client contact" },
  { re: "d\\.okafor@ashcombe-bs\\.co\\.uk", cls: "C", label: "client email" },
  { re: "07700\\s?900\\s?123", cls: "C", label: "client phone" },
  { re: "(sort\\s*code\\s*)?20-45-77(\\s*[·,]?\\s*(account\\s*)?31190046)?|31190046", cls: "R", label: "bank details" },
  { re: "QQ\\s?12\\s?34\\s?56\\s?C", cls: "R", label: "NI number" },
  { re: "hannah(\\s+price)?", cls: "I", label: "colleague name" },
  { re: "INV[-\\s]?2041", cls: "I", label: "invoice reference" },
  { re: "£\\s?18,?450(\\.00)?|\\b18,?450\\b", cls: "I", label: "invoice amount" },
];

type Finding = { start: number; end: number; text: string; cls: Cls; label: string };

function grade(text: string): Finding[] {
  const out: Finding[] = [];
  for (const e of PACK) {
    const re = new RegExp(e.re, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m[0].trim().length < 3) continue;
      out.push({ start: m.index, end: m.index + m[0].length, text: m[0], cls: e.cls, label: e.label });
    }
  }
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Finding[] = [];
  let last = -1;
  for (const f of out) {
    if (f.start >= last) {
      merged.push(f);
      last = f.end;
    }
  }
  return merged;
}

type Verdict = "ok" | "warn" | "crit";
const VERDICT: Record<Verdict, { label: string; colour: string; line: string }> = {
  ok: { label: "Cleared", colour: "#0e7a45", line: "Nothing above INTERNAL left the building. INTERNAL is allowed in the firm's enterprise tool." },
  warn: { label: "Over-shared", colour: "#8a5400", line: "A client could be identified. A placeholder would have written the same email." },
  crit: { label: "Leaked", colour: "#a63a08", line: "RESTRICTED data was in the prompt. At a real firm this is the moment you tell the DPO." },
};

const REFLEX =
  "Write a firm but polite email to Daniel Okafor at Ashcombe Building Supplies chasing invoice INV-2041 for £18,450, 40 days overdue. Our account is 20-45-77 31190046 if they need it.";
const CLEARED =
  "Write a firm but polite email to a supplier contact chasing invoice INV-2041 for £18,450, 40 days overdue. Leave a placeholder for [contact name]. Say payment details are on the original invoice.";

export default function PasteTest() {
  const [draft, setDraft] = useState(REFLEX);
  const [graded, setGraded] = useState(REFLEX);

  const findings = useMemo(() => grade(graded), [graded]);
  const verdict: Verdict = useMemo(() => {
    const top = findings.reduce((a, f) => Math.max(a, RANK[f.cls]), -1);
    return top >= 3 ? "crit" : top === 2 ? "warn" : "ok";
  }, [findings]);
  const v = VERDICT[verdict];

  /* the prompt shown back with the leaks blacked out; INTERNAL stays legible */
  const echo: React.ReactNode[] = [];
  let i = 0;
  findings.forEach((f, k) => {
    echo.push(graded.slice(i, f.start));
    echo.push(
      f.cls === "I" ? (
        <span key={k} className="corp-pt-int">{f.text}</span>
      ) : (
        <span key={k} className="corp-pt-rd" aria-label={`${CLASS[f.cls]}, redacted`}>{f.text}</span>
      ),
    );
    i = f.end;
  });
  echo.push(graded.slice(i));

  const dirty = draft !== graded;

  return (
    <div className="corp-pt" aria-label="The paste test, a live example from the course">
      <div className="corp-pt-bar">
        <span className="corp-pt-dots" aria-hidden><i /><i /><i /></span>
        <span className="corp-pt-url">copilot · marlow fenwick llp · practice tenant</span>
        <span className="corp-pt-chip">Module 2</span>
      </div>

      <div className="corp-pt-body">
        <p className="corp-pt-task">
          <span>Your task</span>
          A partner says: &ldquo;Chase Ashcombe for that overdue invoice, polite but firm.&rdquo; The invoice is on your desk. What do you type?
        </p>

        <label className="corp-pt-lab" htmlFor="corp-pt-prompt">Your prompt</label>
        <textarea
          id="corp-pt-prompt"
          className="corp-pt-ta"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          spellCheck={false}
        />
        <div className="corp-pt-row">
          <button type="button" className="corp-pt-run" onClick={() => setGraded(draft)} disabled={!dirty}>
            Run the paste test
          </button>
          <button
            type="button"
            className="corp-pt-alt"
            onClick={() => {
              const next = graded === CLEARED ? REFLEX : CLEARED;
              setDraft(next);
              setGraded(next);
            }}
          >
            {graded === CLEARED ? "Back to the reflex" : "Show me the cleared version"}
          </button>
        </div>

        <div className="corp-pt-verdict" style={{ ["--pt" as string]: v.colour }} role="status">
          <div className="corp-pt-top">
            <span className="corp-pt-pill">{v.label}</span>
            <span>{v.line}</span>
          </div>
          <p className="corp-pt-echo">{echo}</p>
          {findings.length > 0 && (
            <ul className="corp-pt-finds">
              {findings.map((f, k) => (
                <li key={k}>
                  <span className="corp-pt-tag" style={{ color: COLOUR[f.cls] }}>{CLASS[f.cls]}</span>
                  <span className="corp-pt-txt">{f.text}</span>
                  <span className="corp-pt-why">{f.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="corp-pt-note">Practice data. Everyone named here is invented, and nothing you type leaves your browser.</p>
      </div>
    </div>
  );
}
