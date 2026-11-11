"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../office/apps/WordParts";
import { WORD } from "../../office/word";
import { W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* Word, drawn the way it looks, with every part numbered (Module 8): the
 * whole window with a short report in it, a letter template with its
 * placeholders, a document with spelling marks, tracked changes and a
 * comment, the spelling pane, the Save as PDF box, and a filled-in form.
 * A lesson opens on one whole picture; later cards pass `focus` to light
 * only the parts they teach, and `what` to say what a part means there. */

const body = WORD.body;
const display = WORD.display;
const blue = WORD.heading;

/* ── the window around a page ─────────────────────────────────────────── */

function TitleBar({ name, status = "Saved", fileKey }: { name: string; status?: string; fileKey?: string }) {
  const text = (
    <span style={{ fontSize: 13.5 }}>
      <b style={{ fontWeight: 600 }}>{name}</b>
      <span style={{ opacity: 0.85 }}> · {status}</span>
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: W.word, color: "#fff", borderRadius: "8px 8px 0 0" }}>
      <span aria-hidden style={{ width: 20, height: 20, borderRadius: 4, background: "#fff", color: W.word, fontWeight: 800, fontSize: 12.5, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        W
      </span>
      <span style={{ display: "inline-flex", opacity: 0.9 }}>{Icon.save()}</span>
      <span style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {fileKey ? (
          <Part k={fileKey} block={false} badge="left">
            {text}
          </Part>
        ) : (
          text
        )}
      </span>
      <span style={{ fontSize: 12, opacity: 0.85 }}>AutoSave off</span>
    </div>
  );
}

function Tabs({ on, tabsKey }: { on: "Home" | "Insert" | "Review"; tabsKey?: string }) {
  const row = (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2 }}>
      {["File", "Home", "Insert", "Review"].map((t) => (
        <span key={t} style={{ padding: "6px 12px", fontSize: 13, color: t === on ? W.word : "#fff", background: t === on ? WORD.ribbon : t === "File" ? "rgba(0,0,0,0.18)" : "transparent", fontWeight: t === on || t === "File" ? 600 : 400, borderRadius: "4px 4px 0 0" }}>
          {t}
        </span>
      ))}
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "flex-end", minHeight: 30, padding: "0 10px 0 52px", background: W.word }}>
      {tabsKey ? (
        <Part k={tabsKey} block={false} badge="left" style={{ borderRadius: 4 }}>
          {row}
        </Part>
      ) : (
        row
      )}
    </div>
  );
}

const ribbonRow: CSSProperties = { display: "flex", alignItems: "stretch", gap: 44, minHeight: 66, padding: "8px 14px 6px 56px", background: WORD.ribbon, borderBottom: `1px solid ${W.edge}` };
const groupLabel = (t: string) => <span style={{ display: "block", textAlign: "center", fontSize: 11, color: W.muted, marginTop: 4 }}>{t}</span>;
const mini = (children: ReactNode, on = false, w = 28): ReactNode => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: w, height: 26, borderRadius: 3, background: on ? "#c8c6c4" : "transparent", border: on ? "1px solid #8a8886" : "1px solid transparent", fontSize: 14 }}>{children}</span>
);
const big = (icon: ReactNode, label: string, on = false) => (
  <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "3px 6px", borderRadius: 4, background: on ? "#c8c6c4" : "transparent", border: on ? "1px solid #8a8886" : "1px solid transparent", fontSize: 11.5, whiteSpace: "nowrap" }}>
    {icon}
    {label}
  </span>
);

function Canvas({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return (
    <div style={{ display: "flex", background: WORD.canvas }}>
      <div style={{ flex: 1, minWidth: 0, padding: "18px 22px 20px" }}>{children}</div>
      {side}
    </div>
  );
}

const pageStyle: CSSProperties = { background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.16), 0 6px 18px -8px rgba(0,0,0,0.25)", padding: "30px 40px 30px 58px", color: "#000", fontFamily: body, fontSize: 14, lineHeight: 1.4, maxWidth: 600, margin: "0 auto" };

function StatusBar({ words, statusKey, zoomKey, extra }: { words: number; statusKey?: string; zoomKey?: string; extra?: string }) {
  const left = (
    <span style={{ display: "inline-flex", gap: 14 }}>
      <span>Page 1 of 1</span>
      <span>{words} words</span>
    </span>
  );
  const zoom = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      − <span style={{ width: 70, height: 3, borderRadius: 2, background: "#c8c6c4", position: "relative", display: "inline-block" }}><span style={{ position: "absolute", left: 30, top: -4, width: 10, height: 10, borderRadius: "50%", background: W.word }} /></span> + 100%
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, minHeight: 30, padding: "0 14px 0 52px", background: WORD.ribbon, borderTop: `1px solid ${W.edge}`, borderRadius: "0 0 8px 8px", fontSize: 12, color: W.body }}>
      {statusKey ? (
        <Part k={statusKey} block={false} badge="left">
          {left}
        </Part>
      ) : (
        left
      )}
      <span>English (United Kingdom)</span>
      {extra && <span>{extra}</span>}
      <span style={{ marginLeft: "auto" }}>
        {zoomKey ? (
          <Part k={zoomKey} block={false} badge="left">
            {zoom}
          </Part>
        ) : (
          zoom
        )}
      </span>
    </div>
  );
}

const frame: CSSProperties = { borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, overflow: "visible", background: W.page };

/* ── 1. the whole window, with a short report ─────────────────────────── */

export type WordPart = "file" | "tabs" | "font" | "paragraph" | "styles" | "title" | "heading" | "heading2" | "bullets" | "table" | "status" | "zoom";

export const WORD_PARTS: Record<WordPart, PartInfo> = {
  file: { n: 1, name: "File name", what: "The document's name. \"Not saved\" beside it means your latest changes aren't in the file yet." },
  tabs: { n: 2, name: "Ribbon tabs", what: "Each tab shows a different set of buttons: Home for the look of the text, Insert to add a table, Review to check it. File is where you save." },
  font: { n: 3, name: "Bold and size", what: "B makes text bold, and the number is its size. Fine for one word that matters, never for a heading." },
  paragraph: { n: 4, name: "Bullets and numbering", what: "Turn lines into a list: with dots, or numbered 1, 2, 3." },
  styles: { n: 5, name: "Styles", what: "Ready-made looks with a job: Title, Heading 1, Heading 2, Normal. Click in a line, then click a style." },
  title: { n: 6, name: "Title", what: "What the whole document is, in the Title style." },
  heading: { n: 7, name: "Heading 1", what: "Starts a section. Readers skim headings to find the part they need." },
  heading2: { n: 8, name: "Heading 2", what: "A smaller heading, for a part inside a section." },
  bullets: { n: 9, name: "A bulleted list", what: "Short points, one per line, each with a dot. Easier to read than a long sentence." },
  table: { n: 10, name: "A table", what: "Rows and columns, for facts that line up: here, what was ordered and what came." },
  status: { n: 11, name: "Page and word count", what: "Which page you're on, and how many words there are." },
  zoom: { n: 12, name: "Zoom", what: "Makes the page look bigger or smaller on the screen. It doesn't change the document." },
};

const REPORT = {
  name: "2026-11-13 Deliveries this week.docx",
  title: "Deliveries: week of 9 November",
  intro: "A short report for Daniel, from the goods-in desk.",
  h1: "What came in",
  bullets: ["Harlow Packaging: 12 pallets of wrap", "Kent Flour Mills: 40 sacks of flour", "Brightwater Cups: 30 cases of cups"],
  h2: "Short deliveries",
  table: [
    ["Supplier", "Ordered", "Delivered"],
    ["Harlow Packaging", "12", "10"],
  ],
};

export function WordFigure({ focus, title = "A Word document", what, rename, note, fake }: { focus?: WordPart[]; title?: string; what?: Partial<Record<WordPart, string>>; rename?: Partial<Record<WordPart, string>>; note?: string; fake?: boolean }) {
  const info = { ...WORD_PARTS } as Record<WordPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as WordPart[]) info[k] = { ...info[k], what: what![k]! };
  for (const k of Object.keys(rename ?? {}) as WordPart[]) info[k] = { ...info[k], name: rename![k]! };
  const styleTile = (label: string, preview: ReactNode, on = false) => (
    <span style={{ display: "inline-flex", flexDirection: "column", justifyContent: "space-between", width: 74, height: 48, padding: "4px 6px", background: "#fff", border: on ? `2px solid ${W.word}` : `1px solid ${W.edge}`, borderRadius: 3, boxSizing: "border-box" }}>
      {preview}
      <span style={{ fontSize: 10.5, color: W.ink }}>{label}</span>
    </span>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={760}>
      <div style={frame}>
        <TitleBar name={REPORT.name} fileKey="file" />
        <Tabs on="Home" tabsKey="tabs" />
        <div style={ribbonRow}>
          <Part k="font" block={false} badge="left">
            <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                <span style={{ width: 96, height: 24, border: `1px solid ${W.edge}`, background: "#fff", fontSize: 12, padding: "3px 6px", boxSizing: "border-box" }}>Aptos (Body)</span>
                <span style={{ width: 36, height: 24, border: `1px solid ${W.edge}`, background: "#fff", fontSize: 12, padding: "3px 6px", boxSizing: "border-box" }}>{fake ? 16 : 12}</span>
              </span>
              <span style={{ display: "inline-flex", gap: 2 }}>
                {mini(<b style={{ fontFamily: "Georgia, serif" }}>B</b>, !!fake)}
                {mini(<i style={{ fontFamily: "Georgia, serif" }}>I</i>)}
                {mini(<u style={{ fontFamily: "Georgia, serif" }}>U</u>)}
              </span>
              {groupLabel("Font")}
            </span>
          </Part>
          <Part k="paragraph" block={false} badge="left">
            <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
              <span style={{ display: "inline-flex", gap: 2 }}>
                {mini(Icon.bullets(), true)}
                {mini(Icon.numbering())}
              </span>
              <span style={{ display: "inline-flex", gap: 2 }}>
                {mini(Icon.align("left"))}
                {mini(Icon.align("center"))}
              </span>
              {groupLabel("Paragraph")}
            </span>
          </Part>
          <Part k="styles" block={false} badge="left">
            <span style={{ display: "inline-flex", flexDirection: "column" }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {styleTile("Normal", <span style={{ fontSize: 11 }}>AaBbCc</span>, !!fake)}
                {styleTile("Title", <span style={{ fontFamily: display, fontSize: 15 }}>AaBbCc</span>)}
                {styleTile("Heading 1", <span style={{ fontFamily: display, fontSize: 13, color: blue }}>AaBbCc</span>, !fake)}
                {styleTile("Heading 2", <span style={{ fontFamily: display, fontSize: 11.5, color: blue }}>AaBbCc</span>)}
              </span>
              {groupLabel("Styles")}
            </span>
          </Part>
        </div>
        <Canvas>
          <div style={pageStyle}>
            <Part k="title">
              <div style={{ fontFamily: display, fontSize: 26, lineHeight: 1.15 }}>{REPORT.title}</div>
            </Part>
            <p style={{ margin: "8px 0 0" }}>{REPORT.intro}</p>
            <Part k="heading" style={{ marginTop: 14 }}>
              {fake ? <div style={{ fontFamily: body, fontSize: 21, fontWeight: 700 }}>{REPORT.h1}</div> : <div style={{ fontFamily: display, fontSize: 19, color: blue }}>{REPORT.h1}</div>}
            </Part>
            <Part k="bullets" style={{ marginTop: 6 }}>
              <ul style={{ margin: 0, paddingLeft: 22, listStyle: "disc" }}>
                {REPORT.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Part>
            <Part k="heading2" style={{ marginTop: 12 }}>
              <div style={{ fontFamily: display, fontSize: 16, color: blue }}>{REPORT.h2}</div>
            </Part>
            <Part k="table" style={{ marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {REPORT.table.map((r, i) => (
                    <tr key={i}>
                      {r.map((c) => (
                        <td key={c} style={{ border: "1px solid #000", padding: "4px 8px", fontWeight: i === 0 ? 700 : 400 }}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Part>
          </div>
        </Canvas>
        <StatusBar words={58} statusKey="status" zoomKey="zoom" />
      </div>
    </FigureFrame>
  );
}

/* ── 2. a letter template, with its placeholders ──────────────────────── */

export type TemplatePart = "newdoc" | "letterhead" | "date" | "reference" | "recipient" | "greeting" | "subject" | "body" | "signoff";

export const TEMPLATE_PARTS: Record<TemplatePart, PartInfo> = {
  newdoc: { n: 1, name: "A new document", what: "Opening a template makes a new, unsaved copy called Document1. The template itself never changes." },
  letterhead: { n: 2, name: "Letterhead", what: "The company's logo, address and phone number. It comes with the template, at the top of every page." },
  date: { n: 3, name: "[Date]", what: "A placeholder: grey, in square brackets. Click it once and it's all selected; type, and your words replace it." },
  reference: { n: 4, name: "Reference", what: "A short code the reader quotes back, like NS/4405, so anyone can find the order it's about." },
  recipient: { n: 5, name: "Who it's to", what: "Their name, company and address, one line each." },
  greeting: { n: 6, name: "Greeting", what: '"Dear" and their name, with a comma.' },
  subject: { n: 7, name: "Subject line", what: "What the letter is about, already set in the Heading 2 style." },
  body: { n: 8, name: "Your letter", what: "Type over it: what happened, what you'll do, and by when." },
  signoff: { n: 9, name: "Sign-off and your name", what: '"Yours sincerely," a gap to sign in, then your name and job title.' },
};

const BLANK: Record<string, string> = { date: "[Date]", reference: "[Reference]", r1: "[Recipient name]", r2: "[Company]", r3: "[Street address]", r4: "[Town and postcode]", name: "[Name]", subject: "[Subject of the letter]", body: "[Write your letter here.]", you: "[Your name]" };
export const OAK_LETTER: Record<string, string> = {
  date: "10 November 2026",
  reference: "NS/4405",
  r1: "Ms Rita Fenwick",
  r2: "Oak Street Deli",
  r3: "18 Oak Street",
  r4: "Leicester LE1 6AB",
  name: "Ms Fenwick",
  subject: "Refund for order 4405",
  body: "I'm sorry that we charged you twice for the napkins on order 4405. We have refunded the £32.50, and you should receive it within 5 working days.",
  you: "Jordan Miles",
};

function Ph({ t }: { t: string }) {
  return /^\[/.test(t) ? <span style={{ background: WORD.placeholder, color: "#595959", borderRadius: 2 }}>{t}</span> : <>{t}</>;
}

export function MiniLetterhead() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8, borderBottom: `2px solid ${blue}` }}>
      <span aria-hidden style={{ width: 28, height: 28, borderRadius: 6, background: blue, color: "#fff", fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
        N
      </span>
      <span>
        <b style={{ display: "block", fontFamily: display, fontSize: 15, letterSpacing: "0.08em", color: blue }}>NORTHFIELD SUPPLIES</b>
        <span style={{ display: "block", fontSize: 10.5, color: "#595959" }}>Unit 2, Abbey Trade Park, Leicester LE4 5AA · 01632 960 400</span>
      </span>
    </div>
  );
}

/* What each part says once the letter is filled in. */
export const FILLED_WHAT: Partial<Record<TemplatePart, string>> = {
  date: "Today's date, written in full.",
  reference: "Daniel's reference for the order: NS/4405.",
  recipient: "Copied from the bottom of Rita's email, one line each.",
  greeting: "Her name, as she signs it.",
  subject: "Typed over the placeholder, so it's still a Heading 2.",
  body: "Sorry, what we're doing about it, and by when.",
  signoff: "Your own name, under Yours sincerely.",
};

export function TemplateFigure({ focus, title = "A letter template", values, what, note, name }: { focus?: TemplatePart[]; title?: string; values?: Record<string, string>; what?: Partial<Record<TemplatePart, string>>; note?: string; name?: string }) {
  const v = { ...BLANK, ...values };
  const info = { ...TEMPLATE_PARTS } as Record<TemplatePart, PartInfo>;
  if (values?.date && !/^\[/.test(values.date)) info.date = { ...info.date, name: "The date" };
  for (const k of Object.keys(what ?? {}) as TemplatePart[]) info[k] = { ...info[k], what: what![k]! };
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={640}>
      <div style={frame}>
        <TitleBar name={name ?? "Document1"} status={values ? "Not saved" : "Not saved yet"} fileKey="newdoc" />
        <Tabs on="Home" />
        <Canvas>
          <div style={{ ...pageStyle, fontSize: 13.5, lineHeight: 1.45 }}>
            <Part k="letterhead">
              <MiniLetterhead />
            </Part>
            <div style={{ display: "grid", gap: 4, marginTop: 14, justifyItems: "start" }}>
              <Part k="date" block={false}>
                <span>
                  <Ph t={v.date} />
                </span>
              </Part>
              <Part k="reference" block={false}>
                <span>
                  Our reference: <Ph t={v.reference} />
                </span>
              </Part>
            </div>
            <div style={{ marginTop: 12 }}>
              <Part k="recipient" block={false}>
                <span style={{ display: "grid", gap: 1 }}>
                  {[v.r1, v.r2, v.r3, v.r4].map((l, i) => (
                    <span key={i}>
                      <Ph t={l} />
                    </span>
                  ))}
                </span>
              </Part>
            </div>
            <div style={{ marginTop: 12 }}>
              <Part k="greeting" block={false}>
                <span>
                  Dear <Ph t={v.name} />,
                </span>
              </Part>
            </div>
            <Part k="subject" style={{ marginTop: 8 }}>
              <div style={{ fontFamily: display, fontSize: 16, color: blue }}>
                <Ph t={v.subject} />
              </div>
            </Part>
            <Part k="body" style={{ marginTop: 6 }}>
              <div>
                <Ph t={v.body} />
              </div>
            </Part>
            <div style={{ marginTop: 12 }}>
              <Part k="signoff" block={false}>
                <span style={{ display: "grid", gap: 1 }}>
                  <span>Yours sincerely,</span>
                  <span style={{ height: 22 }} />
                  <span>
                    <Ph t={v.you} />
                  </span>
                  <span>Office Administrator</span>
                </span>
              </Part>
            </div>
          </div>
        </Canvas>
      </div>
    </FigureFrame>
  );
}

/* ── 3. a document under review: spelling marks, changes, a comment ───── */

export type ReviewPart = "review" | "spell" | "track" | "accept" | "comment" | "red" | "blue" | "ins" | "del" | "bar" | "balloon";

export const REVIEW_PARTS: Record<ReviewPart, PartInfo> = {
  review: { n: 1, name: "Review tab", what: "Everything for checking a document, yours or someone else's." },
  spell: { n: 2, name: "Spelling & Grammar", what: "Goes through every mistake Word has found, one at a time." },
  track: { n: 3, name: "Track Changes", what: "When it's on, every edit shows as a change someone can see, and accept or reject." },
  accept: { n: 4, name: "Accept and Reject", what: "Accept keeps a change. Reject undoes it. Next and Previous move between changes." },
  comment: { n: 5, name: "New Comment", what: "Adds a note in the margin beside the line you're on, without changing the text." },
  red: { n: 6, name: "Red wavy line", what: "Under a word Word thinks is spelled wrong: here, \"recieve\"." },
  blue: { n: 7, name: "Blue double line", what: "Under a grammar slip: here, \"a order\" should be \"an order\"." },
  ins: { n: 8, name: "Added words", what: "Underlined, in the colour of the person who added them: here, Sarah added \"second\"." },
  del: { n: 9, name: "Removed words", what: "Crossed through. They go for good only when someone accepts the change." },
  bar: { n: 10, name: "Change bar", what: "A line in the margin beside every line that has a change, so none get missed." },
  balloon: { n: 11, name: "Comment", what: "A note in the margin: who wrote it, when, and what they said." },
};

export function ReviewFigure({ focus, title = "A document being checked", what, note }: { focus?: ReviewPart[]; title?: string; what?: Partial<Record<ReviewPart, string>>; note?: string }) {
  const info = { ...REVIEW_PARTS } as Record<ReviewPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as ReviewPart[]) info[k] = { ...info[k], what: what![k]! };
  const step = (n: number, children: ReactNode, changed = false, barKey = false) => (
    <div style={{ position: "relative", display: "flex", gap: 10, padding: "5px 0" }}>
      {changed &&
        (barKey ? (
          <Part k="bar" style={{ position: "absolute", left: -26, top: 3, bottom: 3, width: 4, borderRadius: 1 }} badge="left">
            <span style={{ display: "block", width: 2, height: "100%", background: "#595959" }} />
          </Part>
        ) : (
          <span style={{ position: "absolute", left: -25, top: 3, bottom: 3, width: 2, background: "#595959" }} />
        ))}
      <span style={{ width: 16, flexShrink: 0 }}>{n}.</span>
      <span>{children}</span>
    </div>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={780}>
      <div style={frame}>
        <TitleBar name="Goods-in procedure.docx" status="Saved" />
        <div style={{ display: "flex", alignItems: "flex-end", minHeight: 30, padding: "0 10px 0 52px", background: W.word }}>
          <span style={{ padding: "6px 12px", fontSize: 13, color: "#fff", background: "rgba(0,0,0,0.18)", fontWeight: 600, borderRadius: "4px 4px 0 0" }}>File</span>
          <span style={{ padding: "6px 12px", fontSize: 13, color: "#fff" }}>Home</span>
          <span style={{ padding: "6px 12px", fontSize: 13, color: "#fff" }}>Insert</span>
          <Part k="review" block={false} badge="right" style={{ borderRadius: "4px 4px 0 0" }}>
            <span style={{ display: "inline-block", padding: "6px 12px", fontSize: 13, color: W.word, background: WORD.ribbon, fontWeight: 600, borderRadius: "4px 4px 0 0" }}>Review</span>
          </Part>
        </div>
        <div style={{ ...ribbonRow, gap: 40, alignItems: "center" }}>
          <Part k="spell" block={false} badge="left">
            {big(Icon.spelling(24), "Spelling & Grammar")}
          </Part>
          <Part k="comment" block={false} badge="left">
            {big(Icon.comment(24), "New Comment")}
          </Part>
          <Part k="track" block={false} badge="left">
            {big(Icon.track(24), "Track Changes: On", true)}
          </Part>
          <Part k="accept" block={false} badge="left">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {big(Icon.accept(24), "Accept")}
              {big(Icon.reject(24), "Reject")}
              <span style={{ display: "grid", fontSize: 11.5, gap: 4, color: W.body }}>
                <span>‹ Previous</span>
                <span>› Next</span>
              </span>
            </span>
          </Part>
        </div>
        <Canvas
          side={
            <div style={{ width: 210, flexShrink: 0, padding: "18px 14px 18px 40px", background: "#faf9f8", borderLeft: `1px solid ${W.edge}` }}>
              <Part k="balloon" badge="left">
                <div style={{ padding: 9, borderRadius: 6, background: "#fff", border: `1px solid ${W.edge}`, fontSize: 12.5, lineHeight: 1.4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: WORD.them, color: "#fff", fontSize: 9.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>SP</span>
                    <b>Sarah Patel</b>
                  </span>
                  <span style={{ display: "block", color: W.muted, fontSize: 11, marginTop: 3 }}>Yesterday 16:05</span>
                  <span style={{ display: "block", marginTop: 4 }}>Daniel asked for this after last month&apos;s mix-up.</span>
                </div>
              </Part>
            </div>
          }
        >
          <div style={{ ...pageStyle, padding: "26px 30px 26px 64px", maxWidth: 560 }}>
            <div style={{ fontFamily: display, fontSize: 22, lineHeight: 1.15 }}>Goods-in procedure</div>
            <div style={{ fontFamily: display, fontSize: 16, color: blue, margin: "10px 0 4px" }}>When a delivery arrives</div>
            {step(1, "Check the driver has a delivery note for us.")}
            {step(
              2,
              <Part k="ins" block={false} badge="right">
                <span>
                  Count every <span style={{ color: WORD.them, textDecoration: "underline" }}>second</span> pallet against the note.
                </span>
              </Part>,
              true,
              true,
            )}
            {step(
              3,
              <Part k="del" block={false} badge="right">
                <span style={{ color: WORD.them, textDecoration: "line-through" }}>Fax a copy of the note to the office.</span>
              </Part>,
              true,
            )}
            {step(
              4,
              <Part k="red" block={false} badge="right">
                <span>
                  Sign the note when you <span style={{ textDecoration: `underline wavy ${WORD.spelling}`, textUnderlineOffset: 3, textDecorationSkipInk: "none" }}>recieve</span> the goods.
                </span>
              </Part>,
            )}
            {step(
              5,
              <Part k="blue" block={false} badge="right">
                <span>
                  Tell Accounts about <span style={{ textDecoration: `underline double ${WORD.grammar}`, textUnderlineOffset: 3 }}>a order</span>{" "}
                  that&apos;s short.
                </span>
              </Part>,
            )}
          </div>
        </Canvas>
        <StatusBar words={44} extra="Track Changes: On" />
      </div>
    </FigureFrame>
  );
}

/* ── 4. the spelling pane ─────────────────────────────────────────────── */

export type SpellPart = "kind" | "context" | "suggestions" | "change" | "ignore" | "left" | "name";

export const SPELL_PARTS: Record<SpellPart, PartInfo> = {
  kind: { n: 1, name: "Spelling or grammar", what: "What kind of mistake it is, and why Word thinks so." },
  context: { n: 2, name: "The sentence", what: "The mistake in its sentence, so you can tell what was meant." },
  suggestions: { n: 3, name: "Suggestions", what: "Words Word thinks you meant. Click the right one." },
  change: { n: 4, name: "Change", what: "Puts the suggestion you picked in place of the mistake, then moves on to the next." },
  ignore: { n: 5, name: "Ignore", what: "Leaves it as it is. Only for a word that's really right, like a product code." },
  left: { n: 6, name: "How many are left", what: "When this reaches none, the check is done." },
  name: { n: 7, name: "A name it can't check", what: "Fenwik should be Fenwick, but Word doesn't know people's names, so it isn't marked. You have to read it back." },
};

export function SpellingFigure({ focus, title = "The spelling and grammar check", what, note }: { focus?: SpellPart[]; title?: string; what?: Partial<Record<SpellPart, string>>; note?: string }) {
  const info = { ...SPELL_PARTS } as Record<SpellPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as SpellPart[]) info[k] = { ...info[k], what: what![k]! };
  const btn = (t: string, primary = false) => (
    <span style={{ display: "inline-flex", alignItems: "center", minHeight: 30, padding: "0 14px", borderRadius: 4, background: primary ? W.word : "#fff", color: primary ? "#fff" : W.ink, border: primary ? "none" : `1px solid ${W.edge}`, fontSize: 13, fontWeight: primary ? 600 : 400 }}>{t}</span>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={720}>
      <div style={frame}>
        <TitleBar name="Document1" status="Not saved" />
        <div style={{ display: "flex", background: WORD.canvas, borderRadius: "0 0 8px 8px" }}>
          <div style={{ flex: 1, minWidth: 0, padding: "18px 20px" }}>
            <div style={{ ...pageStyle, padding: "26px 30px 26px 56px", fontSize: 13.5 }}>
              <p style={{ margin: 0 }}>
                Dear Ms{" "}
                <Part k="name" block={false} badge="top">
                  <span>Fenwik</span>
                </Part>
                ,
              </p>
              <p style={{ margin: "10px 0 0", lineHeight: 1.6 }}>
                We are very <span style={{ background: "rgba(232,17,35,0.14)", textDecoration: `underline wavy ${WORD.spelling}`, textUnderlineOffset: 3, textDecorationSkipInk: "none" }}>sory</span> that we charged you twice for the napkins on order 4405. You should{" "}
                <span style={{ textDecoration: `underline wavy ${WORD.spelling}`, textUnderlineOffset: 3, textDecorationSkipInk: "none" }}>recieve</span> the £32.50 within 5 working days.
              </p>
            </div>
          </div>
          <div style={{ width: 270, flexShrink: 0, background: "#fff", borderLeft: `1px solid ${W.edge}`, padding: "14px 16px 16px 46px", display: "grid", alignContent: "start", gap: 12, borderRadius: "0 0 8px 0" }}>
            <b style={{ fontSize: 14.5, fontWeight: 600 }}>Spelling and grammar</b>
            <Part k="kind" badge="left">
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ width: 4, borderRadius: 2, background: WORD.spelling }} />
                <span>
                  <b style={{ display: "block", fontSize: 13.5, color: WORD.spelling }}>Spelling</b>
                  <span style={{ fontSize: 12.5, color: W.muted }}>Not in the dictionary</span>
                </span>
              </div>
            </Part>
            <Part k="context" badge="left">
              <div style={{ padding: "8px 10px", borderRadius: 5, background: "#f5f5f5", fontSize: 13, lineHeight: 1.45 }}>
                We are very <b style={{ textDecoration: `underline wavy ${WORD.spelling}`, textUnderlineOffset: 3 }}>sory</b> that we charged you twice
              </div>
            </Part>
            <Part k="suggestions" badge="left">
              <div style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: W.muted }}>Suggestions</span>
                <span style={{ padding: "6px 10px", border: `1px solid ${W.word}`, borderRadius: 4, background: "#eef4fc", fontWeight: 600, fontSize: 13.5 }}>sorry</span>
                <span style={{ padding: "6px 10px", border: `1px solid ${W.edge}`, borderRadius: 4, fontWeight: 600, fontSize: 13.5 }}>sore</span>
              </div>
            </Part>
            <div style={{ display: "flex", gap: 46, paddingLeft: 0 }}>
              <Part k="change" block={false} badge="left">
                {btn("Change", true)}
              </Part>
              <Part k="ignore" block={false} badge="left">
                {btn("Ignore")}
              </Part>
            </div>
            <Part k="left" block={false} badge="left" style={{ justifySelf: "start" }}>
              <span style={{ fontSize: 12, color: W.muted }}>2 mistakes left to look at</span>
            </Part>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 5. Save as PDF ───────────────────────────────────────────────────── */

export type PdfPart = "places" | "path" | "files" | "name" | "type" | "open" | "save";

export const PDF_PARTS: Record<PdfPart, PartInfo> = {
  places: { n: 1, name: "Places", what: "Your OneDrive and the team's SharePoint sites. Pick the one the brief names." },
  path: { n: 2, name: "Where it will go", what: "The folder you're in, step by step. Click a step to go back up." },
  files: { n: 3, name: "What's already there", what: "The files in that folder. Copy the way they're named." },
  name: { n: 4, name: "File name", what: "The date first, then what it is: 2026-11-10 Letter to Oak Street Deli. Word adds .pdf." },
  type: { n: 5, name: "Save as type", what: "PDF here makes a PDF. Word Document (.docx) would save a copy you can still edit." },
  open: { n: 6, name: "Open after publishing", what: "Opens the PDF as soon as it's made, so you can check it before you send it." },
  save: { n: 7, name: "Save", what: "Makes the PDF. Your Word document stays as it was." },
};

export function SavePdfFigure({ focus, title = "Saving as a PDF", what, note }: { focus?: PdfPart[]; title?: string; what?: Partial<Record<PdfPart, string>>; note?: string }) {
  const info = { ...PDF_PARTS } as Record<PdfPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as PdfPart[]) info[k] = { ...info[k], what: what![k]! };
  const place = (t: string, on = false, site = false) => (
    <span style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 5, background: on ? W.select : "transparent", fontWeight: on ? 600 : 400, fontSize: 12.5 }}>
      <span style={{ width: 15, height: 15, borderRadius: site ? 4 : 2, background: site ? "#03787c" : W.folder, flexShrink: 0 }} />
      {t}
    </span>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={700}>
      <div style={{ ...frame, padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: `1px solid ${W.edge}` }}>
          <b style={{ fontSize: 15, fontWeight: 600 }}>Save as PDF</b>
          <span style={{ color: W.muted }}>✕</span>
        </div>
        <div style={{ padding: "16px 16px 14px 50px" }}>
          <div style={{ display: "flex", border: `1px solid ${W.edge}`, borderRadius: 6, minHeight: 190 }}>
            <Part k="places" badge="left" style={{ borderRadius: 0 }}>
              <div style={{ width: 170, height: "100%", padding: 8, background: W.chrome, boxSizing: "border-box", whiteSpace: "nowrap" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: W.muted, margin: "2px 8px 4px" }}>OneDrive - Northfield</span>
                {place("Documents")}
                {place("Downloads")}
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: W.muted, margin: "10px 8px 4px" }}>SharePoint sites</span>
                {place("Operations Team", true, true)}
                {place("Finance", false, true)}
                {place("HR", false, true)}
              </div>
            </Part>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "8px 12px 8px 46px", borderBottom: `1px solid ${W.edge}`, fontSize: 13 }}>
                <Part k="path" block={false} badge="left">
                  <span>
                    <span style={{ color: W.muted }}>Operations Team › Documents › Orders › </span>
                    <b>2026</b>
                  </span>
                </Part>
              </div>
              <div style={{ padding: "8px 12px 8px 46px", fontSize: 13 }}>
                <Part k="files" badge="left">
                  <div style={{ display: "grid", gap: 6, color: W.faint }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{Icon.pdf(18)} 2026-10-28 Letter to Bright Cafe.pdf</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 18, height: 18, background: W.excel, borderRadius: 3, opacity: 0.5 }} /> Orders November.xlsx
                    </span>
                  </div>
                </Part>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "10px 12px", alignItems: "center", marginTop: 14, fontSize: 13.5 }}>
            <span style={{ color: W.muted }}>File name</span>
            <Part k="name" badge="left">
              <span style={{ display: "block", padding: "7px 10px", border: `1px solid ${W.word}`, borderRadius: 4 }}>2026-11-10 Letter to Oak Street Deli</span>
            </Part>
            <span style={{ color: W.muted }}>Save as type</span>
            <Part k="type" badge="left">
              <span style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", border: `1px solid ${W.faint}`, borderRadius: 4 }}>
                PDF (*.pdf) <span style={{ color: W.muted }}>▾</span>
              </span>
            </Part>
            <span />
            <Part k="open" block={false} badge="left" style={{ justifySelf: "start" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 15, height: 15, borderRadius: 3, background: W.word, color: "#fff", fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>✓</span>
                Open file after publishing
              </span>
            </Part>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <span style={{ padding: "6px 14px", border: `1px solid ${W.edge}`, borderRadius: 5, fontSize: 13.5, marginRight: 34 }}>Cancel</span>
            <Part k="save" block={false} badge="left">
              <span style={{ display: "inline-block", padding: "6px 18px", background: W.word, color: "#fff", borderRadius: 5, fontSize: 13.5, fontWeight: 700 }}>Save</span>
            </Part>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 6. a filled-in form ──────────────────────────────────────────────── */

export type FormPart = "title" | "star" | "text" | "choice" | "date" | "check" | "empty" | "file";

export const FORM_PARTS: Record<FormPart, PartInfo> = {
  title: { n: 1, name: "The form's name", what: "What the form is for. Its blank copy lives in HR > Forms > Blank." },
  star: { n: 2, name: "A star", what: "A box you must fill in. The form isn't finished until every starred box has an answer." },
  text: { n: 3, name: "Text box", what: "Click the grey \"Click or tap here\" and type. The grey words go as you start." },
  choice: { n: 4, name: "Drop-down list", what: "Click the ▼ and pick one answer from the list." },
  date: { n: 5, name: "Date picker", what: "Type the date, or click the ▼ for a calendar and click the day." },
  check: { n: 6, name: "Tick box", what: "Click it to tick it: ☒. Click again to untick." },
  empty: { n: 7, name: "An empty box", what: "Still grey: nothing typed in it yet. Fine here, as it has no star." },
  file: { n: 8, name: "Its file name", what: "The date, what it is, and your name, like the forms already in HR > Forms > Completed." },
};

export function FormFigure({ focus, title = "A form, filled in", what, note }: { focus?: FormPart[]; title?: string; what?: Partial<Record<FormPart, string>>; note?: string }) {
  const info = { ...FORM_PARTS } as Record<FormPart, PartInfo>;
  for (const k of Object.keys(what ?? {}) as FormPart[]) info[k] = { ...info[k], what: what![k]! };
  const cell: CSSProperties = { border: "1px solid #bfbfbf", padding: "6px 9px", fontSize: 12.5, verticalAlign: "middle" };
  const label = (t: string, req = true, starKey = false) => (
    <td style={{ ...cell, width: "40%", background: "#f2f2f2", fontWeight: 600 }}>
      {t}
      {req &&
        (starKey ? (
          <Part k="star" block={false} badge="right">
            <span style={{ color: "#c50f1f" }}>{"\u00a0*"}</span>
          </Part>
        ) : (
          <span style={{ color: "#c50f1f" }}> *</span>
        ))}
    </td>
  );
  const val = (k: FormPart | null, children: ReactNode) => <td style={cell}>{k ? <Part k={k} badge="right" style={{ marginRight: 40 }}>{children}</Part> : children}</td>;
  const drop = (t: string) => (
    <span style={{ display: "flex", justifyContent: "space-between" }}>
      {t}
      <span style={{ color: W.muted, fontSize: 10 }}>▼</span>
    </span>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={640}>
      <div style={frame}>
        <TitleBar name="2026-11-13 Holiday request Jordan Miles.docx" status="Saved" fileKey="file" />
        <Tabs on="Home" />
        <Canvas>
          <div style={{ ...pageStyle, padding: "24px 40px 26px 56px" }}>
            <MiniLetterhead />
            <Part k="title" style={{ marginTop: 14, display: "inline-block" }}>
              <div style={{ fontFamily: display, fontSize: 24 }}>Holiday request</div>
            </Part>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontFamily: body }}>
              <tbody>
                <tr>
                  {label("Your name", true, true)}
                  {val("text", "Jordan Miles")}
                </tr>
                <tr>
                  {label("Team")}
                  {val("choice", drop("Office"))}
                </tr>
                <tr>
                  {label("First day off")}
                  {val("date", drop("21/12/2026"))}
                </tr>
                <tr>
                  {label("Last day off")}
                  {val(null, drop("23/12/2026"))}
                </tr>
                <tr>
                  {label("Working days off")}
                  {val(null, "3")}
                </tr>
                <tr>
                  {label("Anything HR should know", false)}
                  {val("empty", <span style={{ display: "block", background: WORD.placeholder, color: "#595959", padding: "1px 4px" }}>Click or tap here to enter text.</span>)}
                </tr>
                <tr>
                  {label("Approved by (your manager)")}
                  {val(null, drop("Daniel Okafor"))}
                </tr>
                <tr>
                  {label("I have checked these dates with my manager")}
                  {val("check", <span style={{ fontSize: 16, fontFamily: "Segoe UI Symbol, Segoe UI, sans-serif" }}>☒</span>)}
                </tr>
              </tbody>
            </table>
          </div>
        </Canvas>
      </div>
    </FigureFrame>
  );
}
