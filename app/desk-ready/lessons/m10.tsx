"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ExcelLab, sheetOf } from "../learn/excelLab";
import { ChoiceLab, ComposeLab } from "../learn/labs";
import { ClaimFigure, ConfirmFigure, CreditFigure, DeliveryFigure, HolidayFigure, InvoiceFigure, MatchFigure, MessageEmailFigure, MessagePadFigure, PoFigure, TimesheetFigure, BookingFigure, HP2291_MATCH } from "../learn/figures/paperwork";
import type { LabProps, ModuleManifest } from "../learn/types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace } from "../learn/ui";
import { fold, INVOICE_HP2291, PO_3307, sameAddress, timed } from "../office/admin";
import { CallPlayer } from "../office/apps/Phone";
import { Browser } from "../office/apps/Edge";
import { HOPWELL } from "../office/apps/courier";
import { numeric } from "../office/formula";
import { DocSheet, PAPERWORK_CSS, type DocPart } from "../office/paperwork";
import type { BizDoc, CourierBooking, Grid, PhoneCall } from "../office/types";
import { OFFICE_CSS } from "../office/ui";
import { D, W } from "../tokens";

/* Module 10: Admin in practice (criteria ADM-1 to ADM-5). The routine
 * paperwork that keeps money and people moving: purchase orders and
 * invoices, checking an invoice against what arrived, timesheets, holidays
 * and expenses, booking systems, and phone messages. Every lesson opens
 * on the whole real thing with its parts numbered (learn/figures/
 * paperwork), and every Try runs on the same look-alikes as the office:
 * the real invoice to click on, the office's Excel, the courier website in
 * Edge, the desk phone. Four office jobs follow on the module page.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest. */

/* Keep a number with its unit, a date with its day, or a menu path in one
 * piece, so a phone never breaks "12 kg" or "Insert > Pictures" across a line. */
const nb = (s: string) => s.split(" ").join("\u00a0");

/* ── shared bits for this module's own labs ──────────────────────────── */

function Job({ children }: { children: ReactNode }) {
  return (
    <div style={{ whiteSpace: "pre-wrap", background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body }}>
      <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
      <div>{children}</div>
    </div>
  );
}

function Said({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
      {ok ? <Tick /> : <Cross />}
      <div>{children}</div>
    </div>
  );
}

interface Rule<T> {
  label: string;
  test: (x: T) => boolean;
  hint: string;
}

/* The ticks and crosses after "Check", as the other labs show them. */
function Results<T>({ rules, result, onNext, last }: { rules: Rule<T>[]; result: boolean[]; onNext: () => void; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const all = result.every(Boolean);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);
  return (
    <div ref={ref} role="status" className="dr-glass" style={{ marginTop: 16, position: "relative", background: all ? D.goodSoft : D.warnSoft, border: `1px solid ${all ? D.goodEdge : D.warnEdge}`, borderRadius: 16, padding: "18px 18px 20px", color: D.body, ["--acc" as string]: all ? D.good : D.warn } as CSSProperties}>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>{all ? "That's exactly right." : "Nearly there. Fix these, then check again:"}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
        {rules.map((rule, i) => (
          <li key={rule.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
            {result[i] ? <Tick /> : <Cross />}
            <span>
              <b style={{ color: D.ink }}>{rule.label}</b>
              {!result[i] && <span style={{ display: "block", color: D.muted }}>{rule.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16 }}>
        {all ? (
          <Button onClick={onNext}>{last ? "Finish" : "Next"}</Button>
        ) : (
          <Button kind="plain" onClick={onNext}>
            Skip this one for now
          </Button>
        )}
      </div>
    </div>
  );
}

/* ---------- Lesson 1: reading a purchase order and an invoice ---------- */

const withLine = (doc: BizDoc, patch: Partial<BizDoc["lines"][number]>): BizDoc => ({ ...doc, lines: doc.lines.map((l) => ({ ...l, ...patch })) });
const withRef = (doc: BizDoc, po: string): BizDoc => ({ ...doc, refs: doc.refs.map(([k, v]) => [k, k === "Your order" ? po : v] as [string, string]) });

interface SpotRound {
  scenario: string;
  invoice: BizDoc;
  answer: DocPart | "match";
  right: string;
  /* What a wrong pick is told, by part, and a fallback. */
  wrong: Partial<Record<DocPart | "match", string>> & { other: string };
}

const SPOT: SpotRound[] = [
  {
    scenario: "Harlow have sent an invoice for our order. Compare it with PO 3307 above it. Click the part of the invoice that doesn't match, or press It all matches.",
    invoice: withRef({ ...INVOICE_HP2291, number: "HP-2304" }, "PO 3370"),
    answer: "poRef",
    right: "The invoice says PO 3370, but our order was PO 3307. It may be someone else's order, or a typing slip. Either way, query it before anyone pays.",
    wrong: { match: "Look at the order number on the invoice, beside Your order. Is it 3307?", lines: "The pallets, the quantity and the price all match the PO. Look at the numbers in the top right.", other: "That part is fine. Check the invoice's order number against the PO number." },
  },
  {
    scenario: "Another invoice from Harlow for the same order. Click the part that doesn't match the PO, or press It all matches.",
    invoice: withLine({ ...INVOICE_HP2291, number: "HP-2317" }, { price: 52 }),
    answer: "lines",
    right: "The unit price is £52.00, but the PO agreed £48.00. That's £48.00 too much over 12 pallets, before VAT. Query the price.",
    wrong: { match: "Look at the unit price on the invoice's line, and on the PO's line.", poRef: "The order number matches: PO 3307 on both.", other: "That part is fine. Compare the line: quantity, and the price of one." },
  },
  {
    scenario: "One more from Harlow. Compare it with the PO. Click the part that doesn't match, or press It all matches.",
    invoice: { ...INVOICE_HP2291, number: "HP-2331" },
    answer: "match",
    right: "PO number, item, quantity and unit price all match the PO. The invoice agrees with the order. Next, it still has to be checked against the delivery note, in the next lesson.",
    wrong: { other: "Look again: the order number, the quantity and the unit price are all the same as on the PO." },
  },
];

const docBox: CSSProperties = { borderRadius: 8, overflowX: "auto", boxShadow: W.float, colorScheme: "light" };

function SpotLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [picks, setPicks] = useState<(DocPart | "match")[]>([]);
  const [first, setFirst] = useState(0);
  const [finished, setFinished] = useState(false);
  const round = SPOT[at];
  const solved = picks.includes(round.answer);
  const last = picks[picks.length - 1];
  const pick = (k: DocPart | "match") => {
    if (solved) return;
    if (picks.length === 0 && k === round.answer) setFirst((n) => n + 1);
    setPicks((p) => [...p, k]);
  };
  const next = () => {
    if (at + 1 < SPOT.length) {
      setAt(at + 1);
      setPicks([]);
    } else {
      setFinished(true);
      onDone({ correct: first, total: SPOT.length });
    }
  };
  if (finished)
    return (
      <Said ok>
        Done. You spotted <b>{first} of {SPOT.length}</b> first time. In the office, this is the check before any invoice is paid.
      </Said>
    );
  const marks = Object.fromEntries(picks.filter((k) => k !== "match").map((k) => [k, k === round.answer ? "right" : "wrong"]));
  return (
    <div>
      <StepBar at={at + 1} of={SPOT.length} label="Invoice" />
      <div style={{ marginTop: 14 }}>
        <Job>{round.scenario}</Job>
      </div>
      <Workspace style={{ marginTop: 14, display: "grid", gap: 14 }}>
        <style>{PAPERWORK_CSS}</style>
        <div>
          <Kicker color={D.faint} style={{ marginBottom: 8 }}>
            Our order: PO 3307
          </Kicker>
          <div style={docBox}>
            <div style={{ minWidth: 560 }}>
              <DocSheet doc={PO_3307} />
            </div>
          </div>
        </div>
        <div>
          <Kicker color={D.faint} style={{ marginBottom: 8 }}>
            Their invoice: {round.invoice.number} (click a part)
          </Kicker>
          <div style={docBox}>
            <div style={{ minWidth: 560 }}>
              <DocSheet doc={round.invoice} pick={pick} marks={marks} />
            </div>
          </div>
        </div>
      </Workspace>
      <div style={{ marginTop: 14 }}>
        <Button kind="secondary" onClick={() => pick("match")} disabled={solved}>
          It all matches
        </Button>
      </div>
      {last && (
        <Said ok={last === round.answer}>
          <b>{last === round.answer ? "Right. " : "Not quite. "}</b>
          {last === round.answer ? round.right : (round.wrong[last] ?? round.wrong.other)}
          {last !== round.answer && " Have another go."}
        </Said>
      )}
      {solved && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={next}>{at + 1 < SPOT.length ? "Next invoice" : "Finish"}</Button>
        </div>
      )}
    </div>
  );
}

/* ---------- Lesson 2: checking an invoice against a delivery ---------- */

const KF_MATCH = {
  heads: ["PO 3305", "DN-40877", "KF-1175"] as [string, string, string],
  rows: [
    { key: "ref" as const, label: "Order number", cells: ["PO 3305", "PO 3305", "PO 3305"] as [string, string, string] },
    { key: "qty" as const, label: "Sacks of flour", cells: ["40 ordered", "40 delivered", "40 billed"] as [string, string, string] },
    { key: "price" as const, label: "Unit price", cells: ["£14.20", "no prices", "£14.20"] as [string, string, string] },
    { key: "total" as const, label: "Total", cells: ["£568.00", "", "£568.00 (no VAT)"] as [string, string, string] },
  ],
  verdict: "All three match. Approve it.",
  good: true,
};
const BW_MATCH = {
  heads: ["PO 3310", "DN-11640", "BW-5561"] as [string, string, string],
  rows: [
    { key: "ref" as const, label: "Order number", cells: ["PO 3310", "PO 3310", "PO 3310"] as [string, string, string] },
    { key: "qty" as const, label: "Cases of cups", cells: ["30 ordered", "30 delivered", "30 billed"] as [string, string, string] },
    { key: "price" as const, label: "Unit price", cells: ["£18.00", "no prices", "£18.50"] as [string, string, string], odd: 2 as const },
    { key: "total" as const, label: "Total", cells: ["£540.00 + VAT", "", "£666.00 with VAT"] as [string, string, string] },
  ],
  verdict: "Hold it: the price is wrong.",
  good: false,
};

function MatchLab(p: LabProps) {
  return (
    <ChoiceLab
      {...p}
      steps={[
        {
          prompt: "Kent Flour Mills' invoice, with its PO and delivery note. What do you do?",
          figure: <MatchFigure data={KF_MATCH} bare />,
          options: [
            { text: "Approve it: all three match", correct: true, why: "Same PO, 40 ordered, 40 delivered, 40 billed, at the agreed price. Flour has no VAT, so £568.00 is right." },
            { text: "Hold it: there's no VAT on it", why: "Flour is food, and most food carries no VAT. That isn't a mistake." },
            { text: "Hold it: the delivery note has no prices", why: "Delivery notes never have prices. They show what arrived." },
          ],
        },
        {
          prompt: "Harlow's invoice HP-2291, with its PO and delivery note. What do you do?",
          figure: <MatchFigure data={HP2291_MATCH} bare />,
          options: [
            { text: "Hold it: only 10 of the 12 arrived", correct: true, why: "We'd be paying for 2 pallets we never got. Hold the difference and ask for a credit note." },
            { text: "Approve it: it matches the order", why: "It matches the PO, but not what came off the van. Check the delivery note too." },
            { text: "Hold it: the unit price is wrong", why: "The price is £48.00 on both. Look at the quantities." },
          ],
        },
        {
          prompt: "So how much of HP-2291 should Priya hold back? VAT is 20%.",
          figure: <MatchFigure data={HP2291_MATCH} bare />,
          options: [
            { text: "£115.20: two pallets, with VAT", correct: true, why: "2 × £48.00 = £96.00, plus 20% VAT of £19.20: £115.20." },
            { text: "£96.00: two pallets at £48.00", why: "That's before VAT. The invoice charges VAT on them too, so hold that as well." },
            { text: "£691.20: the whole invoice", why: "10 pallets did arrive, and Harlow should be paid for those." },
          ],
        },
        {
          prompt: "Brightwater's invoice, with its PO and delivery note. What do you do?",
          figure: <MatchFigure data={BW_MATCH} bare />,
          options: [
            { text: "Hold it: the price is higher than agreed", correct: true, why: "£18.50 a case against £18.00 on the PO. Query the price before it's paid." },
            { text: "Approve it: everything arrived", why: "Everything arrived, but at a price we never agreed. Compare the prices too." },
            { text: "Approve it, then tell them next time", why: "Once it's paid, getting money back is much harder. Query it first." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: timesheets, holidays and expenses ---------- */

const MY_TIMESHEET: Grid = sheetOf(
  [
    ["Day", "Start", "Finish", "Lunch", "Hours worked", "Overtime"],
    ["Monday", "09:00", "17:30", "0.5", "", ""],
    ["Tuesday", "09:00", "19:00", "0.5", "", ""],
    ["Wednesday", "09:00", "17:30", "0.5", "", ""],
    ["Thursday", "09:00", "17:30", "0.5", "", ""],
    ["Friday", "09:00", "13:00", "0", "", ""],
    ["Total", "", "", "", "=SUM(E2:E6)", "=SUM(F2:F6)"],
  ],
  6,
  12,
);
const WANT = [8, 9.5, 8, 8, 4];
const near = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 0.001;

function TimesheetLab(p: LabProps) {
  return (
    <ExcelLab
      {...p}
      tasks={[
        {
          scenario: "Your week is on the timesheet: start, finish and lunch. Fill in Hours worked for each day (finish take away start, then take away lunch), and Overtime for any day over 8 hours. On Friday you had the afternoon off. The totals add themselves up.",
          file: "Timesheet.xlsx",
          grid: MY_TIMESHEET,
          widths: [110, 70, 70, 70, 120, 100],
          rules: [
            { label: "Monday, Wednesday and Thursday: 8 hours", test: (g) => [1, 3, 4].every((r) => near(numeric(g, r, 4), 8)), hint: "09:00 to 17:30 is 8.5 hours. Take away half an hour for lunch: 8." },
            { label: "Tuesday: 9.5 hours", test: (g) => near(numeric(g, 2, 4), 9.5), hint: "09:00 to 19:00 is 10 hours. Take away 0.5 for lunch: 9.5." },
            { label: "Friday: 4 hours", test: (g) => near(numeric(g, 5, 4), 4), hint: "09:00 to 13:00 is 4 hours, with no lunch to take off." },
            { label: "Overtime: 1.5 on Tuesday only", test: (g) => near(numeric(g, 2, 5), 1.5) && [1, 3, 4, 5].every((r) => (numeric(g, r, 5) ?? 0) === 0), hint: "Only Tuesday went over 8 hours: 9.5 take away 8 is 1.5. A short Friday doesn't make overtime negative: leave it empty." },
            { label: "The week adds up to 37.5 hours", test: (g) => near(numeric(g, 6, 4), 37.5) && WANT.every((h, i) => near(numeric(g, i + 1, 4), h)), hint: "Fix the days above and the total follows: 8 + 9.5 + 8 + 8 + 4 = 37.5." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: booking systems ---------- */

interface Booked {
  b?: CourierBooking;
  live: number;
}

const COURIER_RULES: Rule<Booked>[] = [
  { label: "One booking, not two", test: ({ live }) => live === 1, hint: "Open My bookings and cancel the ones you don't need: the courier would come for each one." },
  { label: "Collected from goods-in", test: ({ b }) => !!b && b.method === "collect" && sameAddress(b.from, "LE4 5AQ", /goods/i), hint: 'Choose "We collect from you", then Northfield Supplies, Goods in. Reception is the front door.' },
  { label: "Going to Harlow Packaging in Leicester", test: ({ b }) => sameAddress(b?.to, "LE4 0XA", /harlow/i), hint: "Deliver to Harlow Packaging Ltd, LE4 0XA." },
  { label: "1 parcel of 8 kg", test: ({ b }) => !!b && b.parcels.length === 1 && Math.abs(b.parcels[0].kg - 8) < 0.01, hint: "One box, so one parcel line, with 8 in the weight." },
  { label: "Monday 16 November, any time", test: ({ b }) => !!b && b.date === "2026-11-16" && b.window === "09:00 to 17:00", hint: 'Pick Mon 16 Nov, then "Any time": 09:00 to 17:00.' },
];

function CourierLab({ onDone }: LabProps) {
  const [bookings, setBookings] = useState<CourierBooking[]>([]);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [finished, setFinished] = useState(false);
  const live = bookings.filter((b) => b.status === "booked");
  const b = live[live.length - 1];
  const check = () => setResult(COURIER_RULES.map((r) => r.test({ b, live: live.length })));
  if (finished) return <Said ok>Done. The booking was pretend: nothing will be collected.</Said>;
  return (
    <div>
      <Job>{"Tom at Harlow wants a box of their samples back. Book a collection on the Hopwell site: 1 box of 8 kg, from our goods-in, to Harlow Packaging in Leicester, on Monday 16 November, any time of day. Then press Check my booking."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ height: 600, borderRadius: 8, overflow: "hidden", boxShadow: W.float, colorScheme: "light" }}>
          <Browser start={`${HOPWELL}/`} now="Practice" bookings={bookings} onBook={(x) => setBookings((bs) => [...bs, x])} onCancel={(ref) => setBookings((bs) => bs.map((x) => (x.ref === ref ? { ...x, status: "cancelled" } : x)))} />
        </div>
        <style>{OFFICE_CSS}</style>
      </Workspace>
      <div style={{ marginTop: 14 }}>
        <Button onClick={check}>Check my booking</Button>
      </div>
      {result && !b && <Said ok={false}>Nothing is booked yet. Work down the form and press Book collection at the end.</Said>}
      {result && b && (
        <Results
          rules={COURIER_RULES}
          result={result}
          last
          onNext={() => {
            setFinished(true);
            onDone({ correct: result.filter(Boolean).length, total: COURIER_RULES.length });
          }}
        />
      )}
    </div>
  );
}

/* ---------- Lesson 5: turning a phone message into an email ---------- */

const BRIGHT_CALL: PhoneCall = {
  id: "practice-bright",
  name: "Jo Marsh",
  company: "Bright Cafe",
  number: "07700 900 318",
  time: "10:40",
  way: "in",
  ...timed([
    { who: "you", text: "Good morning, Northfield Supplies, how can I help?" },
    { who: "them", text: "Hi, it's Jo Marsh at Bright Cafe. Is Sarah about?" },
    { who: "you", text: "She's in a meeting until twelve. Can I take a message?" },
    { who: "them", text: "Please. Our cup order for Friday is 6 cases. Can she make it 8? We've got a market stall on Saturday." },
    { who: "you", text: "So Friday's cups go from 6 cases to 8." },
    { who: "them", text: "Yes. And can she ring me before 12 noon to say yes? Then I can sort the van." },
    { who: "you", text: "Of course. What number is best?" },
    { who: "them", text: "My mobile, 07700 900 318." },
    { who: "you", text: "That's 07700 900 318. Thanks, Jo, I'll pass it on." },
  ]),
};

/* Take out times like 10:40 and the phone number, so "rang at 10:40" is
 * never read as a quantity. */
const quantities = (t: string) => t.replace(/\b\d{1,2}[:.]\d{2}\b/g, " ").replace(/0[\d\s]{9,14}\d/g, " ");

function PhoneLab(p: LabProps) {
  const [heard, setHeard] = useState(false);
  return (
    <div>
      <Job>{"The phone rang while Sarah was in a meeting, and the call was recorded. Play it (or show all the words), then email the message to Sarah."}</Job>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ background: W.page, borderRadius: 8, padding: "16px 18px", boxShadow: W.float, colorScheme: "light", color: W.ink, fontFamily: W.font }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span aria-hidden style={{ width: 44, height: 44, borderRadius: "50%", background: "#00698f", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              JM
            </span>
            <span style={{ fontSize: 14.5, lineHeight: 1.4 }}>
              <b style={{ fontSize: 16.5 }}>Jo Marsh</b>, Bright Cafe
              <br />
              <span style={{ color: W.muted }}>07700 900 318 · rang at 10:40</span>
            </span>
          </div>
          <CallPlayer call={BRIGHT_CALL} onEnd={() => setHeard(true)} />
        </div>
        <style>{OFFICE_CSS}</style>
      </Workspace>
      {!heard && <p style={{ margin: "12px 0 0", fontSize: 15, color: D.muted }}>The email box below is ready when you are.</p>}
      <div style={{ marginTop: 16 }}>
        <ComposeLab
          {...p}
          tasks={[
            {
              scenario: "Now write the message to Sarah: a subject that starts \"Phone message:\", then who rang, when, what they want, the number and the deadline.",
              to: "Sarah Patel",
              write: ["subject", "body"],
              rules: [
                { label: "The subject starts \"Phone message:\" and names Bright Cafe", test: (d) => /^\s*phone message/i.test(d.subject) && /bright cafe/i.test(d.subject), hint: 'Try: "Phone message: Bright Cafe wants 8 cases of cups on Friday".' },
                { label: "Who rang: Jo Marsh at Bright Cafe", test: (d) => /jo marsh/i.test(d.body) && /bright cafe/i.test(d.body), hint: "Put her full name and her company in the email." },
                { label: "When: 10:40", test: (d) => /\b10[:.]40(?!\d)/.test(d.body), hint: "Say what time she rang: 10:40." },
                { label: "The change: Friday's cups from 6 cases to 8", test: (d) => /\b6\b[^.\n]{0,60}\b8\b|\b8\b[^.\n]{0,60}\b6\b/.test(quantities(d.body)) && /friday/i.test(d.body), hint: "Give the old and the new: Friday's cups, from 6 cases to 8." },
                { label: "Her number: 07700 900 318", test: (d) => fold(d.body).includes("07700900318"), hint: "Copy the number carefully, then read it back against the call." },
                { label: "The deadline: before 12 noon", test: (d) => /(before|by)\s*(12|twelve|noon|midday)|\bnoon\b|\bmidday\b|\b12[:.]00\b/i.test(d.body), hint: "She needs a call back before 12 noon. Say so." },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}

/* ---------- the manifest ---------- */

const m10: ModuleManifest = {
  id: "m10",
  number: 10,
  title: "Admin in practice",
  intro: "The routine paperwork that keeps money and people moving: orders and invoices, timesheets and expenses, bookings and phone messages. It's where most new office starters spend their first month, and where careful people save their company real money.",
  outcomes: [
    "Read a purchase order and an invoice, and match them",
    "Check an invoice against what actually arrived, and say how much to hold back",
    "Fill in a timesheet, an expense claim and a holiday request that add up",
    "Book something on a website and check it before you press Book",
    "Take a phone message and turn it into a clear email",
  ],
  topics: [
    {
      id: "m10t1",
      title: "Reading a purchase order and an invoice",
      minutes: 9,
      brief: "Every time Northfield buys something, two pieces of paper travel: our order, and the supplier's bill. In this lesson you will read both, part by part, and learn the three things that must match before anyone pays.",
      learn: [
        {
          heading: "Here is a purchase order",
          figure: <PoFigure />,
          body: [
            "Before Northfield buys anything, it sends the supplier a purchase order, called a PO for short. It says what we want, how many, and the price we agreed.",
            `This one is PO 3307 (2). It asks Harlow Packaging (4) for 12 pallets of pallet wrap at ${nb("£48.00 each")} (6), delivered to Goods in (5), and Daniel has signed it (8).`,
          ],
        },
        {
          heading: "The PO number ties it all together",
          figure: <PoFigure focus={["number", "supplier"]} title="The PO number, and who it's to" />,
          body: ["The supplier must quote our PO number (2) on everything they send back: the delivery note and the invoice.", "That's how a pile of paper from many suppliers (4) gets matched to the right order."],
          tip: "Keep POs where everyone can find them. At Northfield they live in Operations Team > Documents > Orders > 2026.",
        },
        {
          heading: "What we ordered, line by line",
          figure: <PoFigure focus={["lines", "total"]} title="The order lines and the total" />,
          body: ["Each line (6) says what, how many (the quantity) and the price of one (the unit price).", "Quantity times unit price is the line's total, at the end of the line (6): 12 × £48.00 = £576.00. With only one line, the Total before VAT (7) is the same. VAT isn't on a PO: it is added on the invoice."],
        },
        {
          heading: "Here is the invoice",
          figure: <InvoiceFigure />,
          body: [
            "An invoice is the supplier's bill. This is Harlow's invoice HP-2291 (2) for that same order. Every part is numbered.",
            "It names our PO (4) and the delivery it's for (5), lists what it charges for (7), adds VAT (9) and says when and where to pay (11, 12).",
          ],
        },
        {
          heading: "Find what it belongs to",
          figure: <InvoiceFigure focus={["poRef", "dnRef"]} title="The PO number and delivery note on the invoice" />,
          body: ["Your order (4) tells you which PO to get out. Delivery note (5) tells you which delivery to check.", "No PO number on an invoice? Ask the supplier for it before anything else happens."],
        },
        {
          heading: "Net, VAT and the total",
          figure: <InvoiceFigure focus={["net", "vat", "total"]} title="Net total, VAT and the total due" />,
          body: ["The net total (8) is the lines added up before tax: £576.00.", "VAT (9) is usually 20% of the net: £576.00 × 20% = £115.20. Add them for the total due (10): £691.20. Work it out yourself; don't just trust the print."],
          good: [{ text: "£576.00 + £115.20 = £691.20", note: "Net plus VAT is the total" }],
        },
        {
          heading: "When to pay, and where",
          figure: <InvoiceFigure focus={["due", "bank"]} title="Payment terms and bank details" />,
          body: ["The terms (11) say how long we have: here 30 days, so pay by 10/12/2026.", "The bank details (12) must match the ones we already hold for Harlow. If they've changed, stop: that's how invoice scams work. Module 11 shows you what to do."],
        },
        {
          heading: "Check it against the PO",
          figure: <InvoiceFigure focus={["poRef", "lines"]} title="What to compare with the PO" />,
          body: ["Before an invoice can be paid, compare it with the PO: the PO number (4), and the quantity and unit price on each line (7).", "If any of them is different, it isn't approved. You find out why first."],
          good: [{ text: "PO 3307 on both · 12 pallets on both · £48.00 on both", note: "Everything agrees: it can go on to the next check" }],
          bad: [{ text: `Invoice says ${nb("PO 3370")} · ${nb("14 pallets")} · ${nb("£52.00 each")}`, note: "Any one of these means: query it" }],
        },
      ],
      tryIt: { title: "Spot what doesn't match", intro: "Three invoices from Harlow for PO 3307. On each, click the part that doesn't match the order, or say it all matches.", Lab: SpotLab },
      check: [
        {
          q: "What is a purchase order?",
          options: ["The order we send a supplier", "The bill a supplier sends us", "The note that comes on the van"],
          answer: 0,
          reasons: ["Right: what we want, how many, and the price.", "That's an invoice: their bill, sent after.", "That's a delivery note: what came off the van."],
        },
        {
          q: "An invoice's net total is £576.00 and VAT is 20%. What is the total due?",
          options: ["£691.20", "£576.00", "£595.20"],
          answer: 0,
          reasons: ["£576.00 × 20% is £115.20, and £576.00 + £115.20 = £691.20.", "That's before VAT. The total adds the VAT on top.", "That adds £19.20, which is VAT on only two pallets."],
        },
        {
          q: "The invoice quotes PO 3370. Our order was PO 3307. What do you do?",
          options: ["Query it before it's paid", "Pay it: the numbers are close", "Correct the number on it yourself"],
          answer: 0,
          reasons: ["It might be another order, or a slip. Find out before money moves.", "Close isn't the same. It may be someone else's order.", "Never change a supplier's invoice. Ask them to correct it."],
        },
      ],
      takeaways: ["A PO is what we asked for. An invoice is what they want paying.", "Match the PO number, the quantity and the unit price.", "Work out the VAT yourself: the net x 20%."],
    },
    {
      id: "m10t2",
      title: "Checking an invoice against a delivery",
      minutes: 9,
      brief: "An invoice can match the order perfectly and still be wrong, because what arrived was different. In this lesson you will read a delivery note, put three pieces of paper side by side, and work out exactly how much to hold back.",
      learn: [
        {
          heading: "Here is a delivery note",
          figure: <DeliveryFigure />,
          body: [
            "A delivery note comes with the van. Goods-in count what arrives, sign it, and write down anything wrong. Every part is numbered.",
            "This is DN-77812 (2) from Harlow, for PO 3307 (4). Look at the handwriting (8): it matters more than anything printed.",
          ],
        },
        {
          heading: "Ordered against delivered",
          figure: <DeliveryFigure focus={["lines"]} title="Ordered and delivered" />,
          body: ["The line (6) shows how many we ordered, 12, and how many came off the van, 10.", "Sarah has ringed the 10, so nobody misses it."],
        },
        {
          heading: "Read the signature and the note",
          figure: <DeliveryFigure focus={["signed", "note"]} title="Who signed for it, and what they wrote" />,
          body: ["Sarah signed for it (7), and wrote what she found (8): \"Only 10 on the van. 2 short.\"", "A signature with no note means it all came in good order. A note means something didn't."],
        },
        {
          heading: "Three pieces of paper, side by side",
          figure: <MatchFigure />,
          body: [
            "Checking an invoice properly means putting three things side by side: the PO (1), the delivery note (2) and the invoice (3). Accounts call it a three-way match.",
            "Go along each row: the order number (4), the quantity (5), the unit price (6) and the total (7).",
          ],
        },
        {
          heading: "The quantity doesn't match",
          figure: <MatchFigure focus={["qty"]} title="The quantity row" />,
          body: ["12 ordered, 10 delivered, 12 billed (5). Harlow are charging for all 12 pallets of pallet wrap, but 2 of them never came.", "The invoice matches the PO, which is why checking only the PO isn't enough."],
        },
        {
          heading: "Hold it, and say how much",
          figure: <MatchFigure focus={["verdict"]} title="What you decide" />,
          body: ["Don't approve it. Tell Accounts what's wrong and how much to hold back (8).", "The 2 missing pallets of pallet wrap cost £48.00 each: 2 × £48.00 = £96.00. Add VAT at 20%, £19.20: hold back £115.20."],
          good: [{ text: "Only 10 of the 12 pallets of pallet wrap arrived, so please hold back £115.20 including VAT.", note: "What's wrong, and exactly how much" }],
          bad: [{ text: "There's a problem with the Harlow invoice.", note: "Which problem? How much?" }],
        },
        {
          heading: "Ask for a credit note",
          figure: <CreditFigure />,
          body: [
            "The supplier puts it right with a credit note: a bill in reverse, for what they charged and didn't send. Every part is numbered.",
            "This one, HP-C118 (2), credits the 2 missing pallets (4): £115.20 with VAT (5). Accounts take it off what we owe.",
          ],
          tip: "Say in your email that a credit note is needed, so Accounts know to wait for it.",
        },
      ],
      tryIt: { title: "Approve or hold?", intro: "Three suppliers' invoices, each beside its PO and delivery note. Decide what to do, and how much to hold back.", Lab: MatchLab },
      check: [
        {
          q: "Goods-in signed for 10 pallets, but the invoice charges for 12. What should happen?",
          options: ["Hold it and ask for a credit note", "Pay it, the 2 missing may come later", "Send all 10 pallets back to Harlow"],
          answer: 0,
          reasons: ["We pay for what came, and the supplier credits the rest.", "If they come later, they can be invoiced then.", "The 10 are fine. Only the bill is wrong."],
        },
        {
          q: "Where do you find out what really arrived?",
          options: ["The delivery note", "The invoice", "The purchase order"],
          answer: 0,
          reasons: ["Goods-in count it and sign it there.", "The invoice says what they want paying for.", "The PO says what we asked for."],
        },
        {
          q: "2 pallets at £48.00 are missing. VAT is 20%. How much do you hold back?",
          options: ["£115.20", "£96.00", "£19.20"],
          answer: 0,
          reasons: ["£96.00 plus £19.20 VAT.", "That's before VAT. Hold the VAT on them too.", "That's only the VAT on them."],
        },
      ],
      takeaways: ["Check the invoice against the PO and the delivery note.", "Read the handwriting on the delivery note.", "Say what's wrong, how much to hold with VAT, and ask for a credit note."],
    },
    {
      id: "m10t3",
      title: "Timesheets, holidays and expenses",
      minutes: 10,
      brief: "Three forms decide whether you are paid right: your timesheet, your expense claims and your holiday requests. In this lesson you will fill them in so they add up, carry the proof, and land where the people who pay you will find them.",
      learn: [
        {
          heading: "Here is a timesheet",
          figure: <TimesheetFigure />,
          body: [
            "A timesheet records the hours you worked, day by day. Many offices use an Excel template like this one. Every part is numbered.",
            "For each day (2): when you started and finished (3), your lunch (4), the hours worked (5) and any overtime (6). The total (7) adds itself up.",
          ],
        },
        {
          heading: "Working out a day's hours",
          figure: <TimesheetFigure focus={["times", "lunch", "hours"]} title="Start, finish, lunch and hours worked" />,
          body: ["Finish take away start, then take away lunch. 09:00 to 17:30 is 8.5 hours; less 0.5 for lunch is 8 (5).", "Write half an hour as 0.5 and a quarter of an hour as 0.25, so the formula can add them up."],
          good: [{ text: "09:00 to 17:30, 30 minutes lunch: 8" }, { text: "09:00 to 18:00, 30 minutes lunch: 8.5" }],
        },
        {
          heading: "Overtime is only the extra",
          figure: <TimesheetFigure focus={["overtime", "total"]} title="Overtime and the total" />,
          body: ["If your normal day is 8 hours, only the hours over 8 are overtime (6). Wednesday's 8.5 hours is 0.5 overtime, not 8.5.", "Then check the total (7) against your own sum. If they disagree, one of the days is wrong."],
          bad: [{ text: "Overtime: 8.5 on Wednesday", note: "That's the whole day, not the extra" }],
        },
        {
          heading: "Here is an expense claim",
          figure: <ClaimFigure />,
          body: [
            "When you spend your own money for work, like a train fare to a supplier, you claim it back. Every part is numbered.",
            "One line per cost: the date (2), what it was for (3), its category (4) and the amount (5), with a photo of the receipt on the claim (7).",
          ],
        },
        {
          heading: "No receipt, no money back",
          figure: <ClaimFigure focus={["date", "amount", "receipt"]} title="The date, the amount and the receipt" />,
          body: ["The date is the day you spent it (2), and the amount is exactly what the receipt says (5).", `Photograph the receipt the same day and put it on the claim (7). In Excel: ${nb("Insert > Pictures")}.`],
          tip: "Only claim what was for work. A coffee on the way is yours to pay, unless your company says otherwise.",
        },
        {
          heading: "Here is a holiday request",
          figure: <HolidayFigure />,
          body: ["Holidays are booked on a form like this, before you go. Every part is numbered.", `Count working days only (4): ${nb("Monday 21")} to ${nb("Wednesday 23 December")} is 3. It isn't booked until your manager approves it (6).`],
        },
        {
          heading: "Where they go, and what they're called",
          figure: <ClaimFigure focus={["file", "who"]} title="The file name, the folder and your name" />,
          body: ["Name each form the house way, date first (1): 2026-11-13 Expense claim Jordan Miles.xlsx.", `Save it exactly where you were told, here ${nb("Finance > Expenses > 2026")} (1), and put your name on it (8). A claim in the wrong folder doesn't get paid.`],
        },
      ],
      tryIt: { title: "Fill in your timesheet", intro: "A week's start and finish times are filled in. Work out the hours and the overtime, in the office's own Excel.", Lab: TimesheetLab },
      check: [
        {
          q: "You worked 08:00 to 16:30, with 30 minutes for lunch. How many hours go on your timesheet?",
          options: ["8", "8.5", "7.5"],
          answer: 0,
          reasons: ["8.5 hours, less 0.5 for lunch.", "That forgets to take off lunch.", "That takes off an hour for lunch, not half an hour."],
        },
        {
          q: "Your normal day is 8 hours. On Thursday you worked 9.5. What goes in Overtime?",
          options: ["1.5", "9.5", "8"],
          answer: 0,
          reasons: ["Only the hours over 8.", "That's the whole day.", "That's the normal day, not the extra."],
        },
        {
          q: "What must go with an expense claim?",
          options: ["The receipt", "A colleague's signature", "Your bank statement"],
          answer: 0,
          reasons: ["It's the proof of what you spent.", "Your manager approves it, not a colleague.", "Your bank statement is private. The receipt is the proof."],
        },
      ],
      takeaways: ["Hours worked = finish, less start, less lunch.", "Overtime is only the hours over your normal day.", "Receipt on the claim, named date first, saved where asked."],
    },
    {
      id: "m10t4",
      title: "Booking systems",
      minutes: 8,
      brief: "Couriers, meeting rooms, train tickets, a table for a team lunch: offices book things on websites all day. In this lesson you will work down a booking form, check it against what was asked, and keep the reference.",
      learn: [
        {
          heading: "Here is a booking website",
          figure: <BookingFigure />,
          body: [
            "This is Hopwell Couriers, the company Northfield uses to collect parcels, in Microsoft Edge. Every part is numbered.",
            "Most booking sites work the same way: what, from where, to where, how many, when, then a summary and a Book button.",
          ],
        },
        {
          heading: "Check where you are",
          figure: <BookingFigure focus={["address"]} title="The web address" />,
          body: ["The address (1) should be the site your office really uses. Use the link in the Favourites bar rather than a search.", "The padlock means the connection is private. It doesn't prove the site is honest, so check the address too."],
          bad: [{ text: "hopwell\u2011parcels.example", note: "Not the real address: a look-alike" }],
        },
        {
          heading: "Who, from where, to where",
          figure: <BookingFigure focus={["method", "from", "to"]} title="Collect or drop off, from and to" />,
          body: ["Collect or drop off (2) decides whether a driver comes at all.", "Pick the addresses (3, 4) carefully. Goods-in is round the back; reception is the front door. Bright Cafe is not Brightwater Cups."],
        },
        {
          heading: "What, when, and how many",
          figure: <BookingFigure focus={["parcels", "day", "time"]} title="Parcels, day and time" />,
          body: [`One parcel line per box, each with its own weight (5): ${nb("2 boxes")} at ${nb("12 kg")} are two lines of ${nb("12 kg")}, not one line of ${nb("24 kg.")}`, `Check the date, not just the day (6). "Friday afternoon" on a Thursday means tomorrow, ${nb("13:00 to 17:00 (7).")}`],
          tip: "Booking a room or a table? The same goes for the number of people: count them twice.",
        },
        {
          heading: "Read it back, then book",
          figure: <BookingFigure focus={["price", "book"]} title="The summary and the Book button" />,
          body: ["The summary (8) puts everything in one place. Read it against the request, line by line.", "Only then press Book (9). It costs real money the moment you do."],
        },
        {
          heading: "Here is what you get",
          figure: <ConfirmFigure />,
          body: ["After booking you get a reference (1) and a summary (2). Every part is numbered.", "Copy the reference exactly and send it to whoever asked. They need it to label, track or change the booking."],
        },
        {
          heading: "Booked it wrong? Cancel it",
          figure: <ConfirmFigure focus={["list"]} title="My bookings" />,
          body: ["Mistakes happen. Open My bookings (3), cancel the wrong one, and book it again.", "Never leave two live bookings for one job: the courier comes twice, and you pay twice."],
        },
      ],
      tryIt: { title: "Book a collection", intro: "The Hopwell site, in Edge. Book exactly what Tom asks for, then check it.", Lab: CourierLab },
      check: [
        {
          q: "It's Thursday 12 November. Sarah asks for a collection \"Friday afternoon\". What do you book?",
          options: ["Fri 13 Nov, 13:00 to 17:00", "Fri 13 Nov, 09:00 to 17:00", "Fri 20 Nov, 13:00 to 17:00"],
          answer: 0,
          reasons: ["Tomorrow, in the afternoon window.", "That's any time, and she said afternoon.", "That's next week's Friday."],
        },
        {
          q: "You have 2 boxes of 12 kg each. How do you enter them?",
          options: ["Two parcels, 12 kg each", "One parcel of 24 kg", "One parcel of 12 kg"],
          answer: 0,
          reasons: ["One line per box, each with its weight.", "It's two boxes: the driver needs two labels.", "That leaves a box behind."],
        },
        {
          q: "You booked the wrong day. What now?",
          options: ["Cancel it, and book the right one", "Book the right one, keep both", "Leave it, and tell the driver on the day"],
          answer: 0,
          reasons: ["One job, one booking, and the right one.", "Two bookings means two trips and two bills.", "The driver goes by the booking, not by you."],
        },
      ],
      takeaways: ["Use the site your office uses, from the Favourites bar.", "Check the addresses, the boxes, the date and the time.", "Send the reference on, and cancel any mistake."],
    },
    {
      id: "m10t5",
      title: "Turning a phone message into an email",
      minutes: 8,
      brief: "When the phone rings for someone who isn't there, you are the only link between the caller and them. In this lesson you will take a message that misses nothing, and send it as an email they can act on at once.",
      learn: [
        {
          heading: "Here is a phone message",
          figure: <MessagePadFigure />,
          body: [
            "Offices still keep pads like this by the phone, because a good message always has the same seven things. Every part is numbered.",
            "Who it's for (1), who rang (2), their number (3), when (4), what they want (5), by when (6), and who took it (7).",
          ],
        },
        {
          heading: "Get the name and number right",
          figure: <MessagePadFigure focus={["caller", "phone"]} title="Who rang, and their number" />,
          body: ["Ask for their name and company (2), and the spelling if you're unsure.", "Read the number back to them, digit by digit (3). One digit wrong and nobody can call back."],
          good: [{ text: "\"That's 01632 960 552. Is that right?\"" }],
        },
        {
          heading: "What, and by when",
          figure: <MessagePadFigure focus={["message", "callback"]} title="What they want, and by when" />,
          body: ["Write down what they want, with every number they give you (5): what is changing, from what, to what.", "And the deadline (6). \"Before 3pm\" turns a message into something that gets done in time."],
        },
        {
          heading: "Here is the same message as an email",
          figure: <MessageEmailFigure />,
          body: ["Most offices pass messages on by email, so the person sees it on their phone wherever they are. Every part is numbered.", "The same facts carry the same numbers as on the pad, with a subject (8) on top."],
        },
        {
          heading: "A subject that says it all",
          figure: <MessageEmailFigure focus={["subject"]} title="The subject" />,
          body: ["Start with \"Phone message:\", then who wants what, and when (8).", "Sarah can see from her inbox who rang and what they want, before she opens it."],
          good: [{ text: "Phone message: Harlow can bring the 2 missing pallets on Wednesday" }],
          bad: [{ text: "Message" }, { text: "Call for you!!" }],
        },
        {
          heading: "Send it straight away",
          figure: <MessageEmailFigure focus={["for", "taken"]} title="Who it's to, and who it's from" />,
          body: ["Send it to the person they asked for (1), as soon as you put the phone down, while it's fresh.", "Sign it (7), so they can ask you about it. If it's urgent and they're away, tell someone who can act."],
        },
      ],
      tryIt: { title: "Take the message", intro: "Listen to a recorded call from Bright Cafe, then email the message to Sarah.", Lab: PhoneLab },
      check: [
        {
          q: "A caller reads out their number quickly. What do you do?",
          options: ["Read it back to them, digit by digit", "Ask them to send an email instead", "Write down what you think you heard"],
          answer: 0,
          reasons: ["They'll correct you before they hang up.", "They rang because they wanted to talk.", "One wrong digit and the message is useless."],
        },
        {
          q: "Which subject is best for a phone message?",
          options: ["Phone message: Oak Street Deli wants napkins on Wednesday", "Phone message for you from one of our customers", "Urgent!! Please read this as soon as you can"],
          answer: 0,
          reasons: ["Who, what and when, before it's even opened.", "Says it's a message, but not who or what.", "Says nothing, and shouts."],
        },
        {
          q: "Mr Ahmed needs a call back before 4pm. Where does that go?",
          options: ["In the email, as the deadline", "Nowhere: she'll ring when she can", "Only in your own notebook"],
          answer: 0,
          reasons: ["Then she knows to call in time.", "She might ring tomorrow: too late.", "She needs it, not you."],
        },
      ],
      takeaways: ["Seven things: for, who, number, when, what, by when, from.", "Read the number back.", "Subject: \"Phone message:\" then who wants what, and when."],
    },
  ],
};

export default m10;
