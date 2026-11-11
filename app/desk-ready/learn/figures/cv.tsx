"use client";

import type { CSSProperties, ReactNode } from "react";
import { WORD } from "../../office/word";
import { D, W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* A CV, drawn the way it looks in Word, with every part numbered (Module
 * 13): the whole one-page CV, and one line of experience before and after
 * it is put into office words. A lesson opens on the whole picture; later
 * cards pass `focus` to light only the parts they teach, and `what` to say
 * what a part means there. */

const body = WORD.body;
const display = WORD.display;
const blue = WORD.heading;

/* Words and figures that must never break across lines on a phone. */
const keep: CSSProperties = { whiteSpace: "nowrap" };

const frame: CSSProperties = { borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, background: W.page, overflowWrap: "normal" };

function WordTitle({ name, fileKey }: { name: string; fileKey?: string }) {
  const text = (
    <span style={{ fontSize: 13.5 }}>
      <b style={{ fontWeight: 600 }}>{name}</b>
      <span style={{ opacity: 0.85 }}> · Saved</span>
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: W.word, color: "#fff", borderRadius: "8px 8px 0 0" }}>
      <span aria-hidden style={{ width: 20, height: 20, borderRadius: 4, background: "#fff", color: W.word, fontWeight: 800, fontSize: 12.5, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        W
      </span>
      <span style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {fileKey ? (
          <Part k={fileKey} block={false}>
            {text}
          </Part>
        ) : (
          text
        )}
      </span>
      <span style={{ fontSize: 12, opacity: 0.85, ...keep }}>AutoSave off</span>
    </div>
  );
}

/* The Styles box, so a learner sees where Title and Heading 1 come from. */
function Styles({ on }: { on?: "Title" | "Heading 1" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 50, padding: "6px 14px 6px 56px", background: WORD.ribbon, borderBottom: `1px solid ${W.edge}`, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11.5, color: W.muted, marginRight: 4 }}>Styles</span>
      {(["Normal", "Title", "Heading 1", "Heading 2"] as const).map((s) => (
        <span key={s} style={{ minWidth: 70, padding: "3px 8px", borderRadius: 3, border: `1px solid ${s === on ? W.word : W.edge}`, background: "#fff", fontSize: 11, color: s.startsWith("Heading") ? blue : W.ink, ...keep }}>
          <span style={{ display: "block", fontFamily: s === "Normal" ? body : display, fontSize: s === "Title" ? 15 : 13, lineHeight: 1.2 }}>AaBbCc</span>
          {s}
        </span>
      ))}
    </div>
  );
}

const h1: CSSProperties = { fontFamily: display, fontSize: 17, color: blue, margin: "12px 0 4px", lineHeight: 1.2 };

/* ── 1. the whole one-page CV ──────────────────────────────────────────── */

export type CvPart = "file" | "name" | "contact" | "profile" | "headings" | "skills" | "experience" | "education" | "refs" | "pages";

export const CV_PARTS: Record<CvPart, PartInfo> = {
  file: { n: 1, name: "File name", what: "Your name, then CV. Saved as a PDF it becomes Jordan Miles CV.pdf, so a recruiter can find it among a hundred others." },
  name: { n: 2, name: "Your name", what: "Big and first, in the Title style. Just your name: no \"CV\" or \"Curriculum Vitae\" above it." },
  contact: { n: 3, name: "How to reach you", what: "Your town, a phone number and an email address. Never your home address, date of birth or a photo." },
  profile: { n: 4, name: "Profile", what: "Two or three lines: who you are, what you're good at, and the job you want." },
  headings: { n: 5, name: "Section headings", what: "Profile, Skills, Experience and Education, each in the Heading 1 style, so the eye can jump between them." },
  skills: { n: 6, name: "Skills", what: "Three lines a recruiter can check, in your own words, each starting with a doing word." },
  experience: { n: 7, name: "Experience", what: "Newest first: the job title and employer, the dates, then two or three lines on what you did." },
  education: { n: 8, name: "Education", what: "Where you studied, what you got, and the year. Courses count, like this one." },
  refs: { n: 9, name: "References", what: "One line is enough. Have the names ready, and ask the people first." },
  pages: { n: 10, name: "Page 1 of 1", what: "The status bar shows how many pages it fills. A first CV fits on one." },
};

export const JORDAN = {
  name: "Jordan Miles",
  contact: ["Leicester", "07700 900461", "jordan.miles@email.example"],
  profile: "Organised and calm under pressure, with six years on the tills and a week's office placement. Looking for an office administrator job in Leicester.",
  skills: ["Logged each morning's deliveries in Excel and flagged anything short", "Wrote customer letters on the company letterhead and sent them as PDFs", "Handled cash and card payments for up to 200 customers a day"],
  jobs: [
    { role: "Office Administrator (placement), Northfield Supplies", dates: "November 2026", lines: ["Sorted a busy shared inbox and booked meetings in Outlook"] },
    { role: "Sales Assistant, Hilltop Convenience Store", dates: "March 2019 to June 2025", lines: ["Cashed up the till at close, with the takings right every night", "Trained four new starters on the till and the stock count"] },
  ],
  education: "Leicester College, Functional Skills English and Maths Level 2, 2025",
};

/* What each part says when the CV is still the blank template. */
const BLANK_CV = {
  name: "[Your name]",
  contact: ["[Town]", "[Phone number]", "[Email address]"],
  profile: "[Who you are and the job you want]",
  skills: ["[An office skill, in your own words]", "[An office skill, in your own words]", "[An office skill, in your own words]"],
  jobs: [{ role: "[Job title], [Employer]", dates: "[Month and year] to [Month and year]", lines: ["[What you did, in office words]", "[What you did, in office words]"] }],
  education: "[School or college, what you got, year]",
};

function Ph({ t }: { t: string }) {
  if (!/\[/.test(t)) return <>{t}</>;
  return (
    <>
      {t.split(/(\[[^\]]+\])/).map((s, i) =>
        /^\[/.test(s) ? (
          <span key={i} style={{ background: WORD.placeholder, color: "#595959", borderRadius: 2 }}>
            {s}
          </span>
        ) : (
          s
        ),
      )}
    </>
  );
}

export function CvFigure({ focus, title = "A one-page CV", what, note, blank, fileName }: { focus?: CvPart[]; title?: string; what?: Partial<Record<CvPart, string>>; note?: string; blank?: boolean; fileName?: string }) {
  const cv = blank ? BLANK_CV : JORDAN;
  const info = { ...CV_PARTS } as Record<CvPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as CvPart[]) info[k] = { ...info[k], what: what![k]! };
  const bullet = (t: string, i: number) => (
    <div key={i} style={{ position: "relative", paddingLeft: 16, marginTop: 2 }}>
      <span style={{ position: "absolute", left: 3 }}>•</span>
      <Ph t={t} />
    </div>
  );
  const heading = (t: string, badge: boolean) => (
    <Part k="headings" noBadge={!badge} style={{ marginTop: 12 }}>
      <div style={{ ...h1, margin: 0 }}>{t}</div>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={600}>
      <div style={frame}>
        <WordTitle name={fileName ?? (blank ? "Document1" : "Jordan Miles CV")} fileKey="file" />
        <Styles on={focus?.includes("name") ? "Title" : focus?.includes("headings") ? "Heading 1" : undefined} />
        <div style={{ background: WORD.canvas, padding: "16px 18px" }}>
          <div style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.16), 0 6px 18px -8px rgba(0,0,0,0.25)", padding: "26px 34px 28px 58px", color: "#000", fontFamily: body, fontSize: 12.5, lineHeight: 1.45, maxWidth: 620, margin: "0 auto" }}>
            <Part k="name">
              <div style={{ fontFamily: display, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                <Ph t={cv.name} />
              </div>
            </Part>
            <Part k="contact" style={{ marginTop: 6 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0 6px", color: "#262626" }}>
                {cv.contact.map((c, i) => (
                  <span key={i} style={keep}>
                    {i > 0 && <span style={{ marginRight: 6 }}>·</span>}
                    <Ph t={c} />
                  </span>
                ))}
              </div>
            </Part>
            {heading("Profile", false)}
            <Part k="profile" style={{ marginTop: 4 }}>
              <div>
                <Ph t={cv.profile} />
              </div>
            </Part>
            {heading("Skills", true)}
            <Part k="skills" style={{ marginTop: 4 }}>
              <div>{cv.skills.map(bullet)}</div>
            </Part>
            {heading("Experience", false)}
            <Part k="experience" style={{ marginTop: 4 }}>
              <div style={{ display: "grid", gap: 8 }}>
                {cv.jobs.map((j) => (
                  <div key={j.role}>
                    <div style={{ fontFamily: display, fontSize: 14, color: blue }}>
                      <Ph t={j.role} />
                    </div>
                    <div style={{ color: "#404040", ...keep }}>
                      <Ph t={j.dates} />
                    </div>
                    {j.lines.map(bullet)}
                  </div>
                ))}
              </div>
            </Part>
            {heading("Education", false)}
            <Part k="education" style={{ marginTop: 4 }}>
              <div>
                <Ph t={cv.education} />
              </div>
            </Part>
            <Part k="refs" style={{ marginTop: 10 }}>
              <div>References available on request.</div>
            </Part>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minHeight: 30, padding: "0 14px 0 52px", background: WORD.ribbon, borderTop: `1px solid ${W.edge}`, borderRadius: "0 0 8px 8px", fontSize: 12, color: W.body }}>
          <Part k="pages" block={false}>
            <span style={keep}>Page 1 of 1</span>
          </Part>
          <span style={keep}>{blank ? "52" : "176"} words</span>
          <span style={{ marginLeft: "auto", ...keep }}>English (United Kingdom)</span>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 2. one line of experience, before and after ───────────────────────── */

export type LinePart = "before" | "role" | "dates" | "verb" | "task" | "number" | "result";

export const LINE_PARTS: Record<LinePart, PartInfo> = {
  before: { n: 1, name: "The plain version", what: "How most people first write it. True, but it doesn't say what you can do." },
  role: { n: 2, name: "Job title and employer", what: "What you were, and where. For something unpaid, say what it was: carer, volunteer, parent." },
  dates: { n: 3, name: "Dates", what: "Month and year to month and year. A gap is fine: say what you were doing." },
  verb: { n: 4, name: "A doing word", what: "Start every line with one: Handled, Kept, Organised, Logged. Never \"Responsible for\"." },
  task: { n: 5, name: "The task, in office words", what: "Name the thing an office does too: payments, records, stock, bookings, customers." },
  number: { n: 6, name: "A number", what: "How many, how often or how much. A true number makes it real." },
  result: { n: 7, name: "What it led to", what: "Why it mattered: right first time, nothing missed, money saved." },
};

export const LINE_EXAMPLES = {
  shop: { before: "Worked on the tills at a corner shop.", role: "Sales Assistant, Hilltop Convenience Store", dates: "March 2019 to June 2025", verb: "Handled", task: "cash and card payments", number: "for up to 200 customers a day,", result: "and cashed up with the takings right every night" },
  caring: { before: "Looked after my mum.", role: "Carer for a family member", dates: "January 2021 to May 2025", verb: "Organised", task: "appointments, medicines and letters", number: "for four years,", result: "keeping a written log the GP and the nurses relied on" },
  warehouse: { before: "Worked in a warehouse.", role: "Warehouse Operative, Midland Parcel Hub", dates: "May 2016 to February 2020", verb: "Checked", task: "deliveries against the paperwork", number: "for 40 pallets a shift,", result: "and reported any shortages before they were signed for" },
} as const;

export type LineExample = keyof typeof LINE_EXAMPLES;

export function LineFigure({ focus, title = "One line of experience, in office words", what, note, example = "shop" }: { focus?: LinePart[]; title?: string; what?: Partial<Record<LinePart, string>>; note?: string; example?: LineExample }) {
  const x = LINE_EXAMPLES[example];
  const info = { ...LINE_PARTS } as Record<LinePart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as LinePart[]) info[k] = { ...info[k], what: what![k]! };
  const piece = (k: LinePart, t: string, style?: CSSProperties) => (
    <Part k={k} block={false} badge="top" style={{ borderRadius: 4 }}>
      <span style={{ display: "inline-block", padding: "1px 3px", ...style }}>{t}</span>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gap: 16, overflowWrap: "normal", maxWidth: 780 }}>
        {/* the note it starts as */}
        <div style={{ paddingLeft: 40 }}>
          <Part k="before" style={{ display: "inline-block" }}>
            <div style={{ display: "inline-block", padding: "10px 14px", background: "#fff7c2", border: "1px solid #ecd982", borderRadius: 4, boxShadow: "0 4px 10px -6px rgba(0,0,0,0.35)", fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontSize: 16, color: "#3b3b3b", transform: "rotate(-1deg)" }}>
              <span style={{ display: "block", fontFamily: W.font, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a6d00", marginBottom: 2 }}>Before</span>
              {x.before}
            </div>
          </Part>
        </div>
        <div aria-hidden style={{ paddingLeft: 56, fontSize: 13, fontWeight: 600, color: D.muted }}>
          ↓ in office words
        </div>
        {/* the same thing on the CV */}
        <div style={{ background: "#fff", borderRadius: 6, boxShadow: W.float, padding: "16px 20px 18px 54px", fontFamily: body, color: "#000" }}>
          <div style={{ ...h1, fontSize: 20, margin: "0 0 8px" }}>Experience</div>
          <div>
            <Part k="role" style={{ display: "inline-block" }}>
              <span style={{ fontFamily: display, fontSize: 17.5, color: blue }}>{x.role}</span>
            </Part>
          </div>
          <Part k="dates" style={{ marginTop: 6, display: "inline-block" }}>
            <span style={{ color: "#404040", fontSize: 15, ...keep }}>{x.dates}</span>
          </Part>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 36 }}>
            <span aria-hidden style={{ fontSize: 16 }}>•</span>
            <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "38px 12px", fontSize: 16.5, lineHeight: 1.4 }}>
              {piece("verb", x.verb, { fontWeight: 600 })}
              {piece("task", x.task)}
              {piece("number", x.number)}
              {piece("result", x.result)}
            </span>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* A small drawn line, for a Try lab's "before" and the learner's answer. */
export function CvLine({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 6, padding: "12px 16px", fontFamily: body, color: "#000", boxShadow: W.float }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: W.muted }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15.5, lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}
