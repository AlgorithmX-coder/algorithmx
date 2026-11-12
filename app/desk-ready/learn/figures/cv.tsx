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
  file: { n: 1, name: "File name", what: "Your name, then CV. Saved as a PDF, it becomes Jordan Miles CV.pdf, so a recruiter can find it among a hundred others." },
  name: { n: 2, name: "Your name", what: "Big and first, in the Title style. Just your name: no \"CV\" or \"Curriculum Vitae\" above it." },
  contact: { n: 3, name: "How to reach you", what: "Your town, a phone number and an email address. Never your home address, date of birth or a photo." },
  profile: { n: 4, name: "Profile", what: "Two or three lines: who you are, what you're good at, and the job you want." },
  headings: { n: 5, name: "Section headings", what: "Profile, Skills, Experience, Education and References, each in the Heading 1 style, so the eye can jump between them." },
  skills: { n: 6, name: "Skills", what: "Three lines a recruiter can check, in your own words, each with a doing word, the task and a number." },
  experience: { n: 7, name: "Experience", what: "Newest first: the job title and employer, the dates, then two or three lines for the newest job and one for older ones." },
  education: { n: 8, name: "Education", what: "Where you studied, what you got, and the year. Short courses count too, like an online office skills course." },
  refs: { n: 9, name: "References", what: "One line, or none: many CVs now leave it off. Have two names ready, and ask the people first." },
  pages: { n: 10, name: "Page 1 of 1", what: "The status bar shows how many pages it fills. A first CV fits on one." },
};

export const JORDAN = {
  name: "Jordan Miles",
  contact: ["Leicester", "07700 900461", "jordan.miles@email.example"],
  profile: "Organised and calm under pressure, with six years on the tills, a year caring for my mum and a week's office placement. Looking for an office administrator job in Leicester.",
  skills: ["Logged up to 30 deliveries a morning in Excel and flagged anything short", "Handled cash and card payments for up to 200 customers a day", "Wrote 6 customer letters on the company letterhead and sent them as PDFs"],
  jobs: [
    { role: "Office Administrator (placement), Northfield Supplies", dates: "November 2026", lines: ["Sorted a busy shared inbox and booked meetings in Outlook", "Worked out customer quotes with VAT in Excel, using formulas"] },
    { role: "Carer for a family member", dates: "July 2025 to October 2026", lines: ["Organised my mum's appointments and medicines, with a written log for her GP"] },
    { role: "Sales Assistant, Hilltop Convenience Store", dates: "March 2019 to June 2025", lines: ["Cashed up the till every night, with the takings right to the penny"] },
  ],
  education: ["Leicester College, Functional Skills English and Maths Level 2, 2025", "Online office skills course: Outlook, Excel and Word, 2026"],
};

/* What each part says when the CV is still the blank template. */
const BLANK_CV = {
  name: "[Your name]",
  contact: ["[Town]", "[Phone number]", "[Email address]"],
  profile: "[Who you are and the job you want]",
  skills: ["[An office skill, in your own words]", "[An office skill, in your own words]", "[An office skill, in your own words]"],
  jobs: [{ role: "[Job title], [Employer]", dates: "[Month and year] to [Month and year]", lines: ["[What you did, in office words]", "[What you did, in office words]"] }],
  education: ["[School or college, what you got, year]"],
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

/* A lit part's outline sits a few pixels clear of its words: padding
 * inside, the same taken back as margin so the words don't move. */
const pad = (top = 0): CSSProperties => ({ padding: "3px 6px", margin: `${top}px -6px 0` });

export function CvFigure({ focus, title = "A one-page CV", what, note, blank }: { focus?: CvPart[]; title?: string; what?: Partial<Record<CvPart, string>>; note?: string; blank?: boolean }) {
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
    <Part k="headings" noBadge={!badge} style={pad(14)}>
      <div style={{ ...h1, margin: 0 }}>{t}</div>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={600}>
      <div style={frame}>
        <WordTitle name={blank ? "Document1" : "Jordan Miles CV"} fileKey="file" />
        <Styles on={focus?.includes("name") ? "Title" : focus?.includes("headings") ? "Heading 1" : undefined} />
        <div style={{ background: WORD.canvas, padding: "16px 18px" }}>
          <div style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.16), 0 6px 18px -8px rgba(0,0,0,0.25)", padding: "26px 34px 28px 58px", color: "#000", fontFamily: body, fontSize: 12.5, lineHeight: 1.45, maxWidth: 620, margin: "0 auto" }}>
            <Part k="name" style={pad()}>
              <div style={{ fontFamily: display, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                <Ph t={cv.name} />
              </div>
            </Part>
            <Part k="contact" style={pad(10)}>
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
            <Part k="profile" style={pad(8)}>
              <div>
                <Ph t={cv.profile} />
              </div>
            </Part>
            {heading("Skills", true)}
            <Part k="skills" style={pad(8)}>
              <div>{cv.skills.map(bullet)}</div>
            </Part>
            {heading("Experience", false)}
            {/* each job is outlined; the number sits by the first, where the section starts */}
            {cv.jobs.map((j, ji) => (
              <Part key={j.role} k="experience" noBadge={ji > 0} style={pad(ji ? 10 : 8)}>
                <div>
                  <div style={{ fontFamily: display, fontSize: 14, color: blue }}>
                    <Ph t={j.role} />
                  </div>
                  <div style={{ color: "#404040", ...keep }}>
                    <Ph t={j.dates} />
                  </div>
                  {j.lines.map(bullet)}
                </div>
              </Part>
            ))}
            {heading("Education", false)}
            <Part k="education" style={pad(8)}>
              <div>
                {cv.education.map((e) => (
                  <div key={e}>
                    <Ph t={e} />
                  </div>
                ))}
              </div>
            </Part>
            {heading("References", false)}
            <Part k="refs" style={pad(8)}>
              <div>Available on request.</div>
            </Part>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minHeight: 34, padding: "0 14px 0 52px", background: WORD.ribbon, borderTop: `1px solid ${W.edge}`, borderRadius: "0 0 8px 8px", fontSize: 12, color: W.body }}>
          <Part k="pages" block={false} style={{ padding: "2px 6px", margin: "0 -6px" }}>
            <span style={keep}>Page 1 of 1</span>
          </Part>
          <span style={{ marginLeft: 6, ...keep }}>{blank ? "52" : "214"} words</span>
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
  verb: { n: 4, name: "A doing word", what: "Start every line with one: Handled, Kept, Checked, Organised, Logged. Never \"Responsible for\"." },
  task: { n: 5, name: "The task, in office words", what: "Name the thing an office does too: payments, records, stock, bookings, customers." },
  number: { n: 6, name: "A number", what: "How many, how often or how much. A true number makes it real." },
  result: { n: 7, name: "What it led to", what: "Why it mattered: right first time, nothing missed, money saved." },
};

export const LINE_EXAMPLES = {
  shop: { before: "Worked on the tills at a corner shop.", role: "Sales Assistant, Hilltop Convenience Store", dates: "March 2019 to June 2025", verb: "Handled", task: "cash and card payments", number: "for up to 200 customers a day,", result: "and the till was right to the penny every night." },
  caring: { before: "Looked after my mum.", role: "Carer for a family member", dates: "January 2021 to May 2025", verb: "Organised", task: "appointments, medicines and letters", number: "for four years,", result: "and not one hospital appointment was missed." },
  warehouse: { before: "Worked in a warehouse.", role: "Warehouse Operative, Midland Parcel Hub", dates: "May 2016 to February 2020", verb: "Checked", task: "deliveries against the paperwork", number: "for 40 pallets a shift,", result: "so no short delivery was ever signed for." },
} as const;

export type LineExample = keyof typeof LINE_EXAMPLES;

/* Room for the badges on a wide screen, none on a phone, where the frame's
 * own padding holds them. */
const gutter = (wide: number) => `clamp(0px, calc((100vw - 560px) * 0.25), ${wide}px)`;

export function LineFigure({ focus, title = "One line of experience, in office words", what, note, example = "shop" }: { focus?: LinePart[]; title?: string; what?: Partial<Record<LinePart, string>>; note?: string; example?: LineExample }) {
  const x = LINE_EXAMPLES[example];
  const info = { ...LINE_PARTS } as Record<LinePart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as LinePart[]) info[k] = { ...info[k], what: what![k]! };
  /* one flowing sentence: each part is a span inside it, so the line wraps
   * like text; the tall line height leaves room for a badge above a part */
  const piece = (k: LinePart, t: string, style?: CSSProperties) => (
    <Part k={k} block={false} badge="top" style={{ display: "inline", borderRadius: 3, padding: "2px 3px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", ...style }}>
      {t}
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gap: 16, overflowWrap: "normal", maxWidth: 780 }}>
        {/* the note it starts as */}
        <div style={{ paddingLeft: gutter(40) }}>
          <Part k="before" style={{ display: "inline-block", padding: 3 }}>
            <div style={{ display: "inline-block", padding: "10px 14px", background: "#fff7c2", border: "1px solid #ecd982", borderRadius: 4, boxShadow: "0 4px 10px -6px rgba(0,0,0,0.35)", fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontSize: 16, color: "#3b3b3b", transform: "rotate(-1deg)" }}>
              <span style={{ display: "block", fontFamily: W.font, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a6d00", marginBottom: 2 }}>Before</span>
              {x.before}
            </div>
          </Part>
        </div>
        <div aria-hidden style={{ paddingLeft: `calc(${gutter(40)} + 16px)`, fontSize: 13, fontWeight: 600, color: D.muted }}>
          ↓ in office words
        </div>
        {/* the same thing on the CV */}
        <div style={{ background: "#fff", borderRadius: 6, boxShadow: W.float, padding: `16px 20px 18px calc(${gutter(36)} + 18px)`, fontFamily: body, color: "#000" }}>
          <div style={{ ...h1, fontSize: 20, margin: "0 0 10px" }}>Experience</div>
          <div>
            <Part k="role" style={{ display: "inline-block", padding: "2px 5px", margin: "0 -5px" }}>
              <span style={{ fontFamily: display, fontSize: 17.5, color: blue }}>{x.role}</span>
            </Part>
          </div>
          <div style={{ marginTop: 12 }}>
            <Part k="dates" style={{ display: "inline-block", padding: "2px 5px", margin: "0 -5px" }}>
              <span style={{ color: "#404040", fontSize: 15, ...keep }}>{x.dates}</span>
            </Part>
          </div>
          <p style={{ position: "relative", margin: "18px 0 0", paddingLeft: 18, fontSize: 16.5, lineHeight: 3.3 }}>
            <span aria-hidden style={{ position: "absolute", left: 2 }}>
              •
            </span>
            {piece("verb", x.verb, { fontWeight: 600 })} {piece("task", x.task)} {piece("number", x.number)} {piece("result", x.result)}
          </p>
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
