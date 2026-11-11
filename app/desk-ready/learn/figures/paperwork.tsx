"use client";

import type { CSSProperties, ReactNode } from "react";
import { CREDIT_HPC118, DN_77812, INVOICE_HP2291, PO_3307, TRAIN_RECEIPT } from "../../office/admin";
import { HopwellMark } from "../../office/apps/courier";
import { EdgeLogo, Padlock } from "../../office/apps/Edge";
import { DocSheet, PEN, ReceiptPhoto, type DocPart } from "../../office/paperwork";
import type { BizDoc } from "../../office/types";
import { W } from "../../tokens";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Module 10's figures (owner 2026-11-11: show the whole thing, every part
 * numbered, then light one part at a time). The paperwork figures draw the
 * very page the office shows (office/paperwork), so the purchase order in
 * a lesson is the one the learner later finds in Orders > 2026. The rest
 * are drawn here: the three-way match, the timesheet, the expense claim,
 * the holiday form, the courier's booking page, and a phone message on
 * its pad and as an email. */

/* Anything drawn that isn't a numbered part: dimmed with the rest of the
 * picture when a card lights one part, so the lit part reads clearly. */
function Rest({ children, style, block = true }: { children: ReactNode; style?: CSSProperties; block?: boolean }) {
  return (
    <Part k="_rest" noBadge style={style} block={block}>
      {children}
    </Part>
  );
}

/* Keep a number with its unit, a date with its day, or a menu path in one
 * piece, so a phone never breaks "12 kg" or "Insert > Pictures" across a line. */
const nb = (s: string) => s.split(" ").join("\u00a0");

/* `what` overrides a part's key line for one card; `omit` leaves parts out. */
function infoOf<K extends string>(parts: Record<K, PartInfo>, what: Partial<Record<K, string>> = {}): Record<K, PartInfo> {
  return Object.fromEntries((Object.entries(parts) as [K, PartInfo][]).map(([k, p]) => [k, what[k] ? { ...p, what: what[k] } : p])) as Record<K, PartInfo>;
}

/* ── a purchase order, an invoice, a delivery note ───────────────────── */

export const PO_PARTS: Partial<Record<DocPart, PartInfo>> = {
  buyer: { n: 1, name: "Who is buying", what: "Us. A purchase order (a PO) is the order we send a supplier, on our own paper." },
  number: { n: 2, name: "PO number", what: "Our number for this order. The supplier must quote it on the delivery note and the invoice, so the three can be matched." },
  date: { n: 3, name: "Date", what: "When we placed the order." },
  supplier: { n: 4, name: "Supplier", what: "Who we are buying from." },
  shipTo: { n: 5, name: "Deliver to", what: "Where the goods should go. Here, Goods in, at the back of the building." },
  lines: { n: 6, name: "What we ordered", what: "One line per thing: its code, what it is, how many (quantity), and the price of one (unit price)." },
  total: { n: 7, name: "Total before VAT", what: "Quantity times unit price, added up. VAT is added later, on the invoice." },
  signed: { n: 8, name: "Authorised by", what: "The manager who agreed to spend the money. An order with no signature hasn't been agreed." },
};

export const INVOICE_PARTS: Partial<Record<DocPart, PartInfo>> = {
  supplier: { n: 1, name: "Supplier", what: "Who is asking to be paid, with their address, phone and VAT number." },
  number: { n: 2, name: "Invoice number", what: "The supplier's own number for this bill. Quote it when you ask about it, or pay it." },
  date: { n: 3, name: "Invoice date", what: "When the bill was made. The days to pay count from here." },
  poRef: { n: 4, name: "Your order (PO number)", what: "Our PO number, so you can find the order it bills for." },
  dnRef: { n: 5, name: "Delivery note", what: "The delivery this invoice is for. Find it, and check what really arrived." },
  billTo: { n: 6, name: "Invoice to", what: "Who has to pay: us, at our accounts address." },
  lines: { n: 7, name: "What we are charged for", what: "Each line: quantity, unit, unit price, and the line's total before VAT (the net)." },
  net: { n: 8, name: "Net total", what: "Everything added up, before VAT." },
  vat: { n: 9, name: "VAT", what: "Tax added on top, usually 20%. Some things, like most food, have none." },
  total: { n: 10, name: "Total due", what: "What we would pay: the net total plus the VAT." },
  due: { n: 11, name: "Payment terms", what: "How long we have to pay, and the date to pay by." },
  bank: { n: 12, name: "Bank details", what: "Where the money goes. These must match the details we already hold for the supplier." },
};

export const DN_PARTS: Partial<Record<DocPart, PartInfo>> = {
  supplier: { n: 1, name: "Supplier", what: "Who sent the goods." },
  number: { n: 2, name: "Delivery note number", what: "The number of this delivery. The invoice should quote it." },
  date: { n: 3, name: "Date", what: "The day the van came." },
  poRef: { n: 4, name: "Your order (PO number)", what: "Which of our orders this delivery is for." },
  shipTo: { n: 5, name: "Deliver to", what: "Where it was dropped off." },
  lines: { n: 6, name: "Ordered and delivered", what: "How many we ordered, and how many came off the van. Here they are different, and goods-in have ringed it." },
  signed: { n: 7, name: "Received by", what: "The person at goods-in who counted it and signed for it." },
  note: { n: 8, name: "The handwritten note", what: "What goods-in found. Always read the handwriting: the problems are written there." },
};

export function DocFigure({ doc, parts, focus, title, what, note }: { doc: BizDoc; parts: Partial<Record<DocPart, PartInfo>>; focus?: DocPart[]; title: string; what?: Partial<Record<DocPart, string>>; note?: string }) {
  return (
    <FigureFrame info={infoOf(parts as Record<DocPart, PartInfo>, what)} focus={focus} title={title} note={note} minWidth={640}>
      <div style={{ padding: "0 10px", maxWidth: 720, margin: "0 auto" }}>
        <DocSheet doc={doc} />
      </div>
    </FigureFrame>
  );
}

export const PoFigure = (p: { focus?: DocPart[]; title?: string; what?: Partial<Record<DocPart, string>>; note?: string; doc?: BizDoc }) => <DocFigure doc={p.doc ?? PO_3307} parts={PO_PARTS} title={p.title ?? "A purchase order"} {...p} />;
export const InvoiceFigure = (p: { focus?: DocPart[]; title?: string; what?: Partial<Record<DocPart, string>>; note?: string; doc?: BizDoc }) => <DocFigure doc={p.doc ?? INVOICE_HP2291} parts={INVOICE_PARTS} title={p.title ?? "A supplier's invoice"} {...p} />;
export const DeliveryFigure = (p: { focus?: DocPart[]; title?: string; what?: Partial<Record<DocPart, string>>; note?: string; doc?: BizDoc }) => <DocFigure doc={p.doc ?? DN_77812} parts={DN_PARTS} title={p.title ?? "A delivery note"} {...p} />;

export const CREDIT_PARTS: Partial<Record<DocPart, PartInfo>> = {
  supplier: { n: 1, name: "Supplier", what: "Who owes us the money back." },
  number: { n: 2, name: "Credit note number", what: "The supplier's number for the credit. Accounts take it off what we owe." },
  poRef: { n: 3, name: "Your order", what: "The PO it belongs to. The row under it names the invoice it reduces, HP20112291." },
  lines: { n: 4, name: "What is credited", what: "Only what didn't come: here the 2 missing pallets, at the same price." },
  total: { n: 5, name: "Total credit", what: "With VAT, so it cancels exactly what was overcharged: £115.20." },
};

export const CreditFigure = (p: { focus?: DocPart[]; title?: string; note?: string }) => <DocFigure doc={CREDIT_HPC118} parts={CREDIT_PARTS} title={p.title ?? "A credit note"} {...p} />;

/* ── the three-way match ─────────────────────────────────────────────── */

export type MatchPart = "po" | "dn" | "inv" | "ref" | "qty" | "price" | "total" | "verdict";

export const MATCH_PARTS: Record<MatchPart, PartInfo> = {
  po: { n: 1, name: "The purchase order", what: "What we asked for, and the price we agreed." },
  dn: { n: 2, name: "The delivery note", what: "What actually arrived, counted and signed for at goods-in." },
  inv: { n: 3, name: "The invoice", what: "What the supplier wants paying for." },
  ref: { n: 4, name: "Order number", what: "All three should name the same PO. If one doesn't, it may be someone else's order." },
  qty: { n: 5, name: "Quantity", what: "Ordered, delivered and billed should be the same number. Here only 10 of the 12 pallets came, but all 12 are billed." },
  price: { n: 6, name: "Unit price", what: "The invoice's price should be the one on the PO. The delivery note has no prices." },
  total: { n: 7, name: "Total", what: "Work it out yourself from the lines. Don't trust the bottom line just because it's printed." },
  verdict: { n: 8, name: "What you decide", what: "All three match: approve it. Anything differs: hold it and tell Accounts what's wrong and how much." },
};

export interface MatchRow {
  key: "ref" | "qty" | "price" | "total";
  label: string;
  cells: [string, string, string];
  /* Which of the three is the odd one out, if any. */
  odd?: 0 | 1 | 2;
}

export const HP2291_MATCH: { heads: [string, string, string]; rows: MatchRow[]; verdict: string; good: boolean } = {
  heads: ["PO 3307", "DN-77812", "HP-2291"],
  rows: [
    { key: "ref", label: "Order number", cells: ["PO 3307", "PO 3307", "PO 3307"] },
    { key: "qty", label: "Quantity (pallets)", cells: ["12 ordered", "10 delivered", "12 billed"], odd: 1 },
    { key: "price", label: "Unit price", cells: ["£48.00", "no prices", "£48.00"] },
    { key: "total", label: "Total", cells: ["£576.00 + VAT", "", "£691.20 with VAT"] },
  ],
  verdict: "Hold it. 2 of the 12 pallets of pallet wrap never came: 2 × £48.00 = £96.00, plus VAT £19.20, so hold back £115.20 and ask Harlow for a credit note.",
  good: false,
};

const MATCH_HEAD = ["Purchase order", "Delivery note", "Invoice"];
const MATCH_KEYS: MatchPart[] = ["po", "dn", "inv"];

/* `bare`: no numbers or key, for a practice question. */
export function MatchFigure({ focus, title = "Three pieces of paper, side by side", note, data = HP2291_MATCH, bare }: { focus?: MatchPart[]; title?: string; note?: string; data?: typeof HP2291_MATCH; bare?: boolean }) {
  const info = (bare ? {} : MATCH_PARTS) as Record<MatchPart, PartInfo>;
  const col = "150px repeat(3, minmax(130px, 1fr))";
  const cellStyle = (odd: boolean) => ({ padding: "10px 12px", borderTop: `1px solid ${W.edge}`, fontSize: 14.5, fontWeight: odd ? 700 : 500, color: odd ? "#a4262c" : W.ink, background: odd ? "#fde7e9" : "transparent", display: "flex", alignItems: "center", gap: 6 }) as const;
  return (
    <FigureFrame info={info} focus={focus} title={bare ? undefined : title} note={note} minWidth={660}>
      <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, padding: "40px 44px 18px 48px" }}>
        {/* the three papers' heads */}
        <div style={{ display: "grid", gridTemplateColumns: col, gap: 0, alignItems: "end" }}>
          <span />
          {data.heads.map((h, i) => (
            <Part key={h} k={MATCH_KEYS[i]} badge="top" style={{ margin: "0 6px" }}>
              <div style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${W.edge}`, background: i === 1 ? W.paper : W.chrome, textAlign: "center" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: W.muted }}>{MATCH_HEAD[i]}</div>
                <div style={{ fontSize: 15.5, fontWeight: 700 }}>{h}</div>
              </div>
            </Part>
          ))}
        </div>
        {/* the rows */}
        <div style={{ marginTop: 10 }}>
          {data.rows.map((r) => (
            <Part key={r.key} k={r.key} badge="left">
              <div style={{ display: "grid", gridTemplateColumns: col }}>
                <span style={{ ...cellStyle(false), color: W.muted, fontWeight: 600, fontSize: 13.5 }}>{r.label}</span>
                {r.cells.map((c, i) => (
                  <span key={i} style={cellStyle(!bare && r.odd === i)}>
                    {!bare && r.odd === i && <span aria-hidden>✗</span>}
                    {c || <span style={{ color: W.faint }}>-</span>}
                  </span>
                ))}
              </div>
            </Part>
          ))}
        </div>
        {!bare && (
        <Part k="verdict" badge="left" style={{ marginTop: 14 }}>
          <div style={{ padding: "10px 14px", borderRadius: 6, background: data.good ? "#dff6dd" : "#fff4ce", border: `1px solid ${data.good ? "#9fd89f" : "#f2d27a"}`, fontSize: 15, lineHeight: 1.5 }}>
            <b>{data.good ? "Approve. " : ""}</b>
            {data.verdict}
          </div>
        </Part>
        )}
      </div>
    </FigureFrame>
  );
}

/* ── a timesheet and an expense claim, in Excel ──────────────────────── */

const ROW = 30;
const NUM = 34;
/* How far a part's outline sits inside its cells, so two lit parts side
 * by side never touch, and an outline never sits on a number. */
const INSET = 7;

interface Box {
  k: string;
  r: number; // first row, from 0 (row 1); -1 starts on the column letters
  c: number;
  rows?: number;
  cols?: number;
  badge?: "left" | "right" | "top" | "corner";
}

/* A small drawn sheet: the cells, then each part as an outline over them.
 * When a card lights some parts (`focus`), every cell outside them fades,
 * as the rest of any figure does. */
function MiniSheet({ grid, widths, boxes, file, place, tab, money = [], picture, odd = [], focus = [], pad = 42, gap = 44 }: { grid: string[][]; widths: number[]; boxes: Box[]; file: string; place: string; tab: string; money?: number[]; picture?: ReactNode; odd?: [number, number][]; focus?: readonly string[]; pad?: number; gap?: number }) {
  const left = (c: number) => NUM + widths.slice(0, c).reduce((a, b) => a + b, 0);
  const width = left(widths.length);
  const lit = boxes.filter((b) => focus.includes(b.k));
  const inLit = (r: number, c: number) => lit.some((b) => r >= b.r && r < b.r + (b.rows ?? 1) && c >= b.c && c < b.c + (b.cols ?? 1));
  const fade = (on: boolean) => (focus.length === 0 || on ? 1 : 0.32);
  return (
    <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, overflow: "visible", width: "max-content", minWidth: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: `0 12px 0 ${pad}px`, background: W.excel, color: "#fff", fontSize: 13.5, borderRadius: "8px 8px 0 0" }}>
        <Part k="file" block={false} badge="right" style={{ padding: "2px 6px" }}>
          <span>
            <b>Excel</b> &nbsp;{file} · Saved
          </span>
        </Part>
      </div>
      <div style={{ display: "flex", gap, padding: `38px ${pad}px 14px`, alignItems: "flex-start" }}>
        <div style={{ position: "relative", width, height: (grid.length + 1) * ROW, fontSize: 13, flexShrink: 0 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width, height: ROW, background: W.sunk, borderBottom: `1px solid ${W.edge}`, opacity: fade(false), transition: "opacity .2s ease" }}>
            {widths.map((w, c) => (
              <span key={c} style={{ position: "absolute", left: left(c), width: w, height: ROW, display: "flex", alignItems: "center", justifyContent: "center", color: W.muted, fontSize: 12, borderRight: `1px solid ${W.edge}` }}>
                {String.fromCharCode(65 + c)}
              </span>
            ))}
          </div>
          {grid.map((row, r) => (
            <span key={`n${r}`} style={{ position: "absolute", left: 0, top: (r + 1) * ROW, width: NUM, height: ROW, display: "flex", alignItems: "center", justifyContent: "center", background: W.sunk, color: W.muted, fontSize: 12, borderBottom: `1px solid ${W.edge}`, borderRight: `1px solid ${W.edge}`, opacity: fade(inLit(r, 0) && lit.some((b) => b.c === 0)), transition: "opacity .2s ease" }}>
              {r + 1}
            </span>
          ))}
          {grid.map((row, r) =>
            row.map((v, c) => {
              const num = r > 0 && /^-?£?[0-9][0-9,.]*$/.test(v) && c > 0;
              const bad = odd.some(([rr, cc]) => rr === r && cc === c);
              return (
                <span
                  key={`${r}-${c}`}
                  style={{ position: "absolute", left: left(c), top: (r + 1) * ROW, width: widths[c], height: ROW, boxSizing: "border-box", padding: "0 12px", display: "flex", alignItems: "center", justifyContent: num ? "flex-end" : "flex-start", borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, background: r === 0 ? "#e6f2ea" : bad ? "#fde7e9" : W.page, color: bad ? "#a4262c" : W.ink, fontWeight: r === 0 || bad ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", opacity: fade(inLit(r, c)), transition: "opacity .2s ease" }}
                >
                  {money.includes(c) && num && !v.startsWith("£") ? `£${Number(v).toFixed(2)}` : v}
                </span>
              );
            }),
          )}
          {boxes.map((b) => {
            /* a part on column A takes in the row numbers, so its badge sits in the margin, not on them */
            const x = b.c === 0 ? 0 : left(b.c);
            return (
              <Part key={b.k} k={b.k} badge={b.badge ?? "left"} style={{ position: "absolute", left: x + INSET, top: (b.r + 1) * ROW + INSET, width: left(b.c + (b.cols ?? 1)) - x - 2 * INSET, height: (b.rows ?? 1) * ROW - 2 * INSET, pointerEvents: "none", zIndex: 2 }}>
                <span />
              </Part>
            );
          })}
        </div>
        {picture}
      </div>
      <div style={{ display: "flex", alignItems: "center", minHeight: 32, padding: `0 14px 0 ${pad + NUM}px`, background: W.chrome, borderTop: `1px solid ${W.edge}`, borderRadius: "0 0 8px 8px", fontSize: 13, opacity: fade(focus.includes("file")), transition: "opacity .2s ease" }}>
        <span style={{ padding: "6px 12px", background: W.page, color: W.excel, fontWeight: 700, borderBottom: `3px solid ${W.excel}` }}>{tab}</span>
        {/* the folder it's saved in is part of "the file" */}
        <Part k="file" noBadge block={false} style={{ marginLeft: "auto", padding: "2px 6px" }}>
          <span style={{ color: W.muted, whiteSpace: "nowrap" }}>{place}</span>
        </Part>
      </div>
    </div>
  );
}

export type TimesheetPart = "file" | "days" | "times" | "lunch" | "hours" | "overtime" | "total" | "who";

export const TIMESHEET_PARTS: Record<TimesheetPart, PartInfo> = {
  file: { n: 1, name: "The file", what: "Your own copy of the team's timesheet template, named date first and saved where HR asked." },
  days: { n: 2, name: "Day and date", what: "One row per working day, already filled in by the template." },
  times: { n: 3, name: "Start and finish", what: "When you really started and stopped, written like the form: 09:00, 17:30." },
  lunch: { n: 4, name: "Lunch", what: "Your unpaid break, in hours: half an hour is 0.5." },
  hours: { n: 5, name: "Hours worked", what: "Finish take away start, then take away lunch. 09:00 to 17:30 is 8.5 hours, less 0.5 for lunch: 8." },
  overtime: { n: 6, name: "Overtime", what: "Hours over your normal day (8 here). Only the extra goes in: Wednesday's 8.5 hours is 0.5 overtime." },
  total: { n: 7, name: "Total", what: "The week added up by a formula, =SUM(F2:F6). Check it against your own sum." },
  who: { n: 8, name: "Your name and the week", what: "Whose hours these are, and which week. Payroll can't pay a timesheet with no name." },
};

export const MY_WEEK: string[][] = [
  ["Day", "Date", "Start", "Finish", "Lunch", "Hours worked", "Overtime"],
  ["Monday", "02/11/2026", "09:00", "17:30", "0.5", "8", ""],
  ["Tuesday", "03/11/2026", "09:00", "17:30", "0.5", "8", ""],
  ["Wednesday", "04/11/2026", "09:00", "18:00", "0.5", "8.5", "0.5"],
  ["Thursday", "05/11/2026", "09:00", "17:30", "0.5", "8", ""],
  ["Friday", "06/11/2026", "09:00", "17:30", "0.5", "8", ""],
  ["Total", "", "", "", "", "40.5", "0.5"],
  ["Name", "Jordan Miles", "", "", "", "", ""],
  ["Week ending", "06/11/2026", "", "", "", "", ""],
];

export function TimesheetFigure({ focus, title = "A timesheet, filled in", what, note, grid = MY_WEEK, odd }: { focus?: TimesheetPart[]; title?: string; what?: Partial<Record<TimesheetPart, string>>; note?: string; grid?: string[][]; odd?: [number, number][] }) {
  return (
    <FigureFrame info={infoOf(TIMESHEET_PARTS, what)} focus={focus} title={title} note={note} minWidth={770}>
      <MiniSheet
        focus={focus}
        pad={40}
        grid={grid}
        widths={[104, 100, 70, 70, 66, 112, 92]}
        file="2026-11-06 Timesheet Jordan Miles.xlsx"
        place="HR > Forms > Completed"
        tab="Timesheet"
        odd={odd}
        boxes={[
          { k: "days", r: 1, c: 0, rows: 5, cols: 2 },
          { k: "times", r: -1, c: 2, rows: 7, cols: 2, badge: "top" },
          { k: "lunch", r: -1, c: 4, rows: 7, badge: "top" },
          { k: "hours", r: -1, c: 5, rows: 7, badge: "top" },
          { k: "overtime", r: -1, c: 6, rows: 7, badge: "top" },
          { k: "total", r: 6, c: 0, cols: 7, badge: "right" },
          { k: "who", r: 7, c: 0, rows: 2, cols: 2 },
        ]}
      />
    </FigureFrame>
  );
}

export type ClaimPart = "file" | "date" | "what" | "category" | "amount" | "total" | "receipt" | "who";

export const CLAIM_PARTS: Record<ClaimPart, PartInfo> = {
  file: { n: 1, name: "The file", what: `The claim, named date first, saved in ${nb("Finance > Expenses > 2026")}, where Accounts pay from.` },
  date: { n: 2, name: "Date spent", what: "The day you spent the money, not the day you fill in the form." },
  what: { n: 3, name: "What it was for", what: "Enough for a manager to approve it at a glance: what, where, and why it was for work." },
  category: { n: 4, name: "Category", what: "The kind of cost, from the list on the form: Travel, Meals, Postage or Other." },
  amount: { n: 5, name: "Amount", what: "Exactly what the receipt says, pence and all." },
  total: { n: 6, name: "Total", what: "Every line added up: what you will be paid back." },
  receipt: { n: 7, name: "The receipt", what: `A photo of the receipt, put on the claim (${nb("Insert > Pictures")}). No receipt, no money back.` },
  who: { n: 8, name: "Your name and the date", what: "Who to pay, and when you claimed. Your manager approves it next." },
};

export const MY_CLAIM: string[][] = [
  ["Date", "What it was for", "Category", "Amount"],
  ["10/11/2026", "Return train to Nottingham", "Travel", "14.60"],
  ["", "", "", ""],
  ["Total", "", "", "14.60"],
  ["Name", "Jordan Miles", "", ""],
  ["Date of claim", "13/11/2026", "", ""],
];

export function ClaimFigure({ focus, title = "An expense claim, with its receipt", what, note }: { focus?: ClaimPart[]; title?: string; what?: Partial<Record<ClaimPart, string>>; note?: string }) {
  return (
    <FigureFrame info={infoOf(CLAIM_PARTS, what)} focus={focus} title={title} note={note} minWidth={780}>
      <MiniSheet
        focus={focus}
        pad={36}
        gap={28}
        grid={MY_CLAIM}
        widths={[92, 196, 80, 76]}
        file="2026-11-13 Expense claim Jordan Miles.xlsx"
        place="Finance > Expenses > 2026"
        tab="Expense claim"
        money={[3]}
        boxes={[
          { k: "date", r: 1, c: 0, badge: "left" },
          { k: "what", r: -1, c: 1, rows: 3, badge: "top" },
          { k: "category", r: -1, c: 2, rows: 3, badge: "top" },
          { k: "amount", r: -1, c: 3, rows: 3, badge: "top" },
          { k: "total", r: 3, c: 3, badge: "left" },
          { k: "who", r: 4, c: 0, rows: 2, cols: 2 },
        ]}
        picture={
          <Part k="receipt" badge="right" style={{ flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
            <ReceiptPhoto doc={TRAIN_RECEIPT} scale={0.76} />
          </Part>
        }
      />
    </FigureFrame>
  );
}

/* ── a holiday request ───────────────────────────────────────────────── */

export type HolidayPart = "who" | "from" | "to" | "days" | "type" | "approver";

export const HOLIDAY_PARTS: Record<HolidayPart, PartInfo> = {
  who: { n: 1, name: "Your name and team", what: "Who is asking, so HR know whose leave to take off." },
  from: { n: 2, name: "First day off", what: "The first day you are not at work." },
  to: { n: 3, name: "Last day off", what: "The last day you are not at work. Not the day you come back." },
  days: { n: 4, name: "Working days", what: `Count only days you'd normally work. ${nb("Monday 21")} to ${nb("Wednesday 23 December")} is 3.` },
  type: { n: 5, name: "Kind of leave", what: "Holiday (annual leave), unpaid, or something else your company lists." },
  approver: { n: 6, name: "Approved by", what: "Your manager signs it. It isn't booked until they do." },
};

function FormRow({ label, children, k, badge = "left" }: { label: string; children: ReactNode; k: HolidayPart; badge?: "left" | "right" }) {
  return (
    <Part k={k} badge={badge} style={{ padding: "0 8px", marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: 12, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${W.edge}` }}>
        <span style={{ fontSize: 13.5, color: W.muted }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#1f3a6e", whiteSpace: "nowrap" }}>{children}</span>
      </div>
    </Part>
  );
}

export function HolidayFigure({ focus, title = "A holiday request form", what, note }: { focus?: HolidayPart[]; title?: string; what?: Partial<Record<HolidayPart, string>>; note?: string }) {
  return (
    <FigureFrame info={infoOf(HOLIDAY_PARTS, what)} focus={focus} title={title} note={note} minWidth={540}>
      <AppWindow app="Word" colour={W.word} title="2026-11-13 Holiday request Jordan Miles.docx">
        <div style={{ background: W.sunk, padding: "18px 22px" }}>
          <div style={{ background: W.page, padding: "22px 44px 26px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", maxWidth: 560, margin: "0 auto" }}>
            <Rest style={{ padding: "0 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: W.muted, textTransform: "uppercase" }}>Northfield Supplies · HR</div>
              <div style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 10px" }}>Holiday request</div>
            </Rest>
            <FormRow k="who" label="Name and team">
              Jordan Miles, Office
            </FormRow>
            <FormRow k="from" label="First day off" badge="right">
              Monday 21/12/2026
            </FormRow>
            <FormRow k="to" label="Last day off" badge="right">
              Wednesday 23/12/2026
            </FormRow>
            <FormRow k="days" label="Working days">
              3
            </FormRow>
            <FormRow k="type" label="Kind of leave" badge="right">
              Annual leave
            </FormRow>
            <FormRow k="approver" label="Approved by">
              <span style={{ fontFamily: PEN, fontWeight: 400, fontSize: 18, color: "#1d4fb8" }}>D Okafor</span>
            </FormRow>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── a booking website ───────────────────────────────────────────────── */

export type BookingPart = "address" | "method" | "from" | "to" | "parcels" | "day" | "time" | "price" | "book";

export const BOOKING_PARTS: Record<BookingPart, PartInfo> = {
  address: { n: 1, name: "The web address", what: "The site you're on, and the padlock: the connection is private. Check it's the company your office really uses." },
  method: { n: 2, name: "Collect or drop off", what: "Whether they come to you, or you take it to them. Get this wrong and nobody turns up." },
  from: { n: 3, name: "Collect from", what: "Which address, and which door. Goods-in and reception are different places." },
  to: { n: 4, name: "Deliver to", what: "Where it is going. Pick from the address book carefully: names can be alike." },
  parcels: { n: 5, name: "Parcels and weights", what: `One line per box, each with its own weight: two boxes of ${nb("12 kg")} are two lines of ${nb("12 kg.")}` },
  day: { n: 6, name: "Day", what: "Check the date, not just the day name. \"Friday\" means the coming Friday." },
  time: { n: 7, name: "Time window", what: "When the driver can come. The afternoon is 13:00 to 17:00." },
  price: { n: 8, name: "Summary and price", what: "Everything you chose, in one place. Read it back against the request before you book." },
  book: { n: 9, name: "Book", what: "Commits it, and charges the account. You get a reference straight after." },
};

const choice = (on: boolean) => ({ padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${on ? "#0d5c46" : "#d9dfd3"}`, background: on ? "#eef8dc" : W.page, fontSize: 12.5, lineHeight: 1.35 }) as const;
const sec = { background: W.page, border: "1px solid #d9dfd3", borderRadius: 10, padding: "10px 12px" } as const;
const h = { fontSize: 13.5, fontWeight: 700, marginBottom: 6 } as const;

export function BookingFigure({ focus, title = "A booking website", what, note }: { focus?: BookingPart[]; title?: string; what?: Partial<Record<BookingPart, string>>; note?: string }) {
  return (
    <FigureFrame info={infoOf(BOOKING_PARTS, what)} focus={focus} title={title} note={note} minWidth={760}>
      <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}` }}>
        {/* the browser */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#e9e9eb", borderRadius: "8px 8px 0 0" }}>
          <EdgeLogo size={18} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: "8px 8px 0 0", background: W.page, fontSize: 12.5 }}>
            <HopwellMark size={14} /> Book a collection | Hopwell
          </span>
        </div>
        <div style={{ padding: "6px 44px", borderBottom: `1px solid ${W.edge}` }}>
          <Part k="address" badge="left">
            <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, padding: "0 12px", borderRadius: 16, background: "#f1f1f3", fontSize: 13.5 }}>
              <Padlock />
              https://www.hopwellcouriers.example/book
            </div>
          </Part>
        </div>
        {/* the page */}
        <div style={{ background: "#f4f6ef", padding: "12px 44px 16px", color: "#14231d", borderRadius: "0 0 8px 8px" }}>
          <Rest>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <HopwellMark size={22} />
              <b style={{ color: "#0d5c46", fontSize: 17 }}>hopwell</b>
              <b style={{ marginLeft: 14, fontSize: 16 }}>Book a collection</b>
            </div>
          </Rest>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 180px", gap: 12, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 14 }}>
              <Part k="method" badge="left">
                <div style={sec}>
                  <div style={h}>1 How should we get your parcels?</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <span style={choice(true)}>
                      <b>We collect from you</b>
                    </span>
                    <span style={choice(false)}>You drop off at a Hopwell Point</span>
                  </div>
                </div>
              </Part>
              <div style={{ display: "grid", gap: 14 }}>
                <Part k="from" badge="left">
                  <div style={sec}>
                    <div style={h}>2 Collect from</div>
                    <span style={{ ...choice(true), display: "block" }}>
                      <b>Northfield Supplies, Goods in</b>
                      <br />
                      Unit 2, Abbey Trade Park, LE4 5AQ
                    </span>
                  </div>
                </Part>
                <Part k="to" badge="left">
                  <div style={sec}>
                    <div style={h}>3 Deliver to</div>
                    <span style={{ ...choice(true), display: "block" }}>
                      <b>Brightwater Cups Ltd</b>
                      <br />
                      14 Station Road, Derby, DE1 2QY
                    </span>
                  </div>
                </Part>
              </div>
              <Part k="parcels" badge="left">
                <div style={sec}>
                  <div style={h}>4 Your parcels</div>
                  {[1, 2].map((n) => (
                    <div key={n} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12.5, padding: "3px 0" }}>
                      <b style={{ width: 60 }}>Parcel {n}</b>
                      Weight <span style={{ padding: "2px 8px", border: "1.5px solid #d9dfd3", borderRadius: 6, background: W.page }}>12</span> kg
                      <span style={{ color: "#5b6b63" }}>Size: Medium</span>
                    </div>
                  ))}
                </div>
              </Part>
              <div style={sec}>
                <Rest>
                  <div style={h}>5 Collection day and time</div>
                </Rest>
                <Part k="day" badge="left">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Thu 12 Nov", "Fri 13 Nov", "Mon 16 Nov", "Tue 17 Nov"].map((d, i) => (
                      <span key={d} style={{ ...choice(i === 1), opacity: i === 0 ? 0.5 : 1 }}>
                        <b>{d}</b>
                      </span>
                    ))}
                  </div>
                </Part>
                <Part k="time" badge="left" style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Morning, 09:00 to 13:00", "Afternoon, 13:00 to 17:00", "Any time"].map((d, i) => (
                      <span key={d} style={choice(i === 1)}>
                        {d}
                      </span>
                    ))}
                  </div>
                </Part>
              </div>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <Part k="price" badge="right">
                <div style={{ ...sec, fontSize: 12.5, lineHeight: 1.5 }}>
                  <b style={{ fontSize: 14 }}>Your booking</b>
                  <div style={{ color: "#5b6b63", marginTop: 4 }}>Collect from</div>
                  <div>Goods in, LE4 5AQ</div>
                  <div style={{ color: "#5b6b63" }}>Deliver to</div>
                  <div>Brightwater Cups, DE1 2QY</div>
                  <div style={{ color: "#5b6b63" }}>Collection</div>
                  <div>Fri 13 Nov, 13:00 to 17:00</div>
                  <div style={{ borderTop: "1px solid #d9dfd3", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
                    <b>Total</b>
                    <b>£28.68</b>
                  </div>
                </div>
              </Part>
              <Part k="book" badge="right">
                <div style={{ textAlign: "center", padding: "9px 0", borderRadius: 999, background: "#0d5c46", color: "#fff", fontWeight: 800, fontSize: 14 }}>Book collection</div>
              </Part>
            </div>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

export type ConfirmPart = "ref" | "details" | "list";

export const CONFIRM_PARTS: Record<ConfirmPart, PartInfo> = {
  ref: { n: 1, name: "Booking reference", what: "The one thing everybody needs afterwards: to track it, change it, label the boxes. Copy it exactly." },
  details: { n: 2, name: "What you booked", what: "Read it once more against the request. If it's wrong, cancel it now and book again." },
  list: { n: 3, name: "My bookings", what: "Every booking on the account, where you can cancel one. One job, one booking." },
};

export function ConfirmFigure({ focus, title = "After you book", note }: { focus?: ConfirmPart[]; title?: string; note?: string }) {
  return (
    <FigureFrame info={CONFIRM_PARTS} focus={focus} title={title} note={note} minWidth={380}>
      <div style={{ background: "#f4f6ef", borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, padding: "18px 44px 20px", color: "#14231d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Rest block={false}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
              <span aria-hidden style={{ width: 34, height: 34, borderRadius: "50%", background: "#0d5c46", color: "#c8f169", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                ✓
              </span>
              <b style={{ fontSize: 21 }}>Collection booked</b>
            </span>
          </Rest>
          <span style={{ marginLeft: "auto" }}>
            <Part k="list" block={false} badge="right">
              <FakeButton>My bookings</FakeButton>
            </Part>
          </span>
        </div>
        <Part k="ref" badge="left" style={{ marginTop: 12 }}>
          <div style={{ padding: "10px 14px", borderRadius: 10, background: W.page, border: "2px solid #0d5c46", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#5b6b63" }}>Your booking reference</span>
            <b style={{ fontFamily: "Consolas, ui-monospace, monospace", fontSize: 22, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>HW-4QJ7TC</b>
          </div>
        </Part>
        <Part k="details" badge="left" style={{ marginTop: 10 }}>
          <div style={{ padding: "10px 14px", borderRadius: 10, background: W.page, border: "1px solid #d9dfd3", fontSize: 13.5, lineHeight: 1.6 }}>
            <b style={{ whiteSpace: "nowrap" }}>Fri 13 Nov, 13:00 to 17:00</b>
            <br />
            Northfield Supplies, Goods in to Brightwater Cups Ltd, Derby
            <br />
            <span style={{ whiteSpace: "nowrap" }}>2 parcels: 12 kg, 12 kg</span> · Next day
          </div>
        </Part>
      </div>
    </FigureFrame>
  );
}

/* ── a phone message: on the pad, and as an email ────────────────────── */

export type MessagePart = "for" | "caller" | "phone" | "when" | "message" | "callback" | "taken" | "subject";

export const MESSAGE_PARTS: Record<MessagePart, PartInfo> = {
  for: { n: 1, name: "For", what: "Who the message is for: the person they asked for." },
  caller: { n: 2, name: "Who rang", what: "Their name and their company. Ask them to spell it if you're not sure." },
  phone: { n: 3, name: "Their number", what: "Read it back to them, digit by digit, before they hang up." },
  when: { n: 4, name: "When", what: "The time they rang, so the message's age is clear." },
  message: { n: 5, name: "What they want", what: "In their words, with the numbers: what is changing, from what, to what." },
  callback: { n: 6, name: "Call back by", what: "Their deadline. A message that misses it is no use at all." },
  taken: { n: 7, name: "Taken by", what: "You, so the person can ask you about it." },
  subject: { n: 8, name: "Subject", what: '"Phone message:" then who wants what, and when. They know what it is about before they open it.' },
};

export interface PhoneNote {
  for: string;
  caller: string;
  company: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  callback: string;
  taken: string;
  subject: string;
}

export const TOM_MESSAGE: PhoneNote = {
  for: "Sarah Patel",
  caller: "Tom Hale",
  company: "Harlow Packaging",
  phone: "01632 960 552",
  date: "Tue 10/11",
  time: "11:05",
  message: "The 2 missing pallets from PO\u00a03307 can come on Wednesday morning instead of Friday. He needs to know someone can sign for them.",
  callback: "Before 3pm today",
  taken: "Jordan",
  subject: "Phone message: Harlow can bring the 2 missing pallets on Wednesday",
};

function Line({ label, children, k, badge = "left" }: { label: string; children: ReactNode; k: MessagePart; badge?: "left" | "right" }) {
  return (
    <Part k={k} badge={badge} style={{ padding: "0 8px", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "4px 0", borderBottom: "1px solid #e7c9a5" }}>
        <span style={{ flexShrink: 0, width: 78, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8a5a2b", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontFamily: PEN, fontSize: 16, color: "#1d4fb8", lineHeight: 1.35 }}>{children}</span>
      </div>
    </Part>
  );
}

export function MessagePadFigure({ focus, title = "A phone message, on the pad", what, note, m = TOM_MESSAGE }: { focus?: MessagePart[]; title?: string; what?: Partial<Record<MessagePart, string>>; note?: string; m?: PhoneNote }) {
  const info = infoOf(MESSAGE_PARTS, what);
  delete (info as Partial<Record<MessagePart, PartInfo>>).subject;
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={460}>
      <div style={{ maxWidth: 460, margin: "0 auto", background: "#fff7e8", borderRadius: 4, boxShadow: "0 18px 40px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.08)", padding: "16px 40px 18px", backgroundImage: "linear-gradient(#f4c98f 0 6px, transparent 6px)" }}>
        <Rest>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8a5a2b", marginTop: 4 }}>Telephone message</div>
        </Rest>
        <div style={{ marginTop: 8 }}>
          <Line k="for" label="For">
            {m.for}
          </Line>
          <Line k="caller" label="From">
            {m.caller}, {m.company}
          </Line>
          <Line k="phone" label="Phone" badge="right">
            <span style={{ whiteSpace: "nowrap" }}>{m.phone}</span>
          </Line>
          <Line k="when" label="When" badge="right">
            <span style={{ whiteSpace: "nowrap" }}>
              {m.date} at {m.time}
            </span>
          </Line>
          <Line k="message" label="Message">
            {m.message}
          </Line>
          <Line k="callback" label="Call back" badge="right">
            {m.callback}
          </Line>
          <Line k="taken" label="Taken by">
            {m.taken}
          </Line>
        </div>
        <Rest style={{ marginTop: 10, padding: "0 8px" }}>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#8a5a2b", flexWrap: "wrap" }}>
            <span>☑ Please call back</span>
            <span>☐ Will call again</span>
            <span>☑ Urgent</span>
          </div>
        </Rest>
      </div>
    </FigureFrame>
  );
}

export function MessageEmailFigure({ focus, title = "The same message, as an email", what, note, m = TOM_MESSAGE }: { focus?: MessagePart[]; title?: string; what?: Partial<Record<MessagePart, string>>; note?: string; m?: PhoneNote }) {
  const first = m.for.split(" ")[0];
  return (
    <FigureFrame info={infoOf(MESSAGE_PARTS, what)} focus={focus} title={title} note={note} minWidth={640}>
      <AppWindow app="Outlook" colour={W.outlook} title="New message">
        <Rest>
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 14px 8px 52px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
            <FakeButton primary>➤ Send</FakeButton>
          </div>
        </Rest>
        <div style={{ padding: "12px 20px 0 52px" }}>
          <Part k="for" style={{ padding: "0 6px", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 34, borderBottom: `1px solid ${W.edge}`, fontSize: 14 }}>
              <span style={{ width: 52, color: W.muted }}>To</span>
              <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>{m.for}</span>
            </div>
          </Part>
          <Part k="subject" style={{ padding: "0 6px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 34, borderBottom: `1px solid ${W.edge}`, fontSize: 14 }}>
              <span style={{ width: 52, color: W.muted, flexShrink: 0 }}>Subject</span>
              <b style={{ fontWeight: 600 }}>{m.subject}</b>
            </div>
          </Part>
        </div>
        <div style={{ padding: "14px 26px 18px 56px", display: "grid", gap: 14, fontSize: 14.5, lineHeight: 1.55 }}>
          <Rest style={{ padding: "2px 6px" }}>
            <div>Hi {first},</div>
          </Rest>
          <Rest style={{ padding: "2px 6px" }}>
            <div>You had a call while you were away from your desk.</div>
          </Rest>
          <Part k="caller" style={{ padding: "2px 6px" }}>
            <div>
              <b>Who:</b> {m.caller}, {m.company}
            </div>
          </Part>
          <Part k="when" style={{ padding: "2px 6px" }}>
            <div>
              <b>When:</b> <span style={{ whiteSpace: "nowrap" }}>{m.date} at {m.time}</span>
            </div>
          </Part>
          <Part k="message" style={{ padding: "2px 6px" }}>
            <div>
              <b>Message:</b> {m.message}
            </div>
          </Part>
          <Part k="phone" style={{ padding: "2px 6px" }}>
            <div>
              <b>Number:</b> <span style={{ whiteSpace: "nowrap" }}>{m.phone}</span>
            </div>
          </Part>
          <Part k="callback" style={{ padding: "2px 6px" }}>
            <div>
              <b>Call back:</b> <span style={{ whiteSpace: "nowrap" }}>{m.callback.toLowerCase()}</span>
            </div>
          </Part>
          <Part k="taken" style={{ justifySelf: "start", padding: "4px 12px 4px 6px" }}>
            <div>
              Thanks,
              <br />
              {m.taken}
            </div>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}
