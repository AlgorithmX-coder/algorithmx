import { describe, expect, it } from "vitest";
import { COFFEE_RECEIPT, DN_77812, INVOICE_HP2291, paperOf, PO_3307, totals, TRAIN_RECEIPT, ADDRESS_BOOK } from "../admin";
import { PEOPLE, YOU } from "../northfield";
import type { CourierBooking, Email, Grid, OfficeFile, OfficeState } from "../types";
import { courierBooking } from "./courierBooking";
import { APPROVED, invoiceCheck, INVOICE_ID } from "./invoiceCheck";
import { KENT_CALL, phoneMessage } from "./phoneMessage";
import { COMPLETED, EXPENSES, goodClaim, goodTimesheet, timesheetExpense, TRAIN_ID } from "./timesheet";

/* Module 10's office jobs: a fresh office fails, a job done as the brief
 * asks passes every check, and each classic mistake fails the right one. */

const sent = (to: { name: string; address: string }, subject: string, body: string, over: Partial<Email> = {}): Email => ({
  id: `mail-${Math.random()}`,
  folder: "sent",
  from: YOU,
  to: [to],
  cc: [],
  subject,
  body,
  time: "Just now",
  attachments: [],
  links: [],
  ...over,
});
const failing = (job: { check: (s: OfficeState) => { id: string; ok: boolean }[] }, s: OfficeState) =>
  job
    .check(s)
    .filter((c) => !c.ok)
    .map((c) => c.id);

describe("the paperwork adds up", () => {
  it("bills 12 pallets at £48.00: £576.00 + VAT £115.20 = £691.20", () => {
    expect(totals(INVOICE_HP2291)).toEqual({ net: 576, vat: 115.2, gross: 691.2 });
    expect(PO_3307.lines[0].qty).toBe(12);
    expect(PO_3307.lines[0].price).toBe(48);
    expect(DN_77812.lines[0].delivered).toBe(10);
    expect(INVOICE_HP2291.refs).toContainEqual(["Your order", "PO 3307"]);
  });
});

/* ── E10.1 ────────────────────────────────────────────────────────────── */

describe("E10.1 Check the invoice before it gets paid", () => {
  const good = "Hi Priya,\n\nPlease don't pay HP-2291 in full. Harlow have billed 12 pallets, but delivery note DN-77812 shows only 10 of the 12 arrived. Please hold back £115.20 including VAT. I've asked Harlow for a credit note for the 2 missing pallets.\n\nThanks";
  const solved = (body = good, edit: (s: OfficeState) => OfficeState = (s) => s) => {
    const s = invoiceCheck.seed();
    return edit({ ...s, emails: [...s.emails, sent(PEOPLE.priya, "Re: Invoice HP-2291 from Harlow", body)] });
  };
  it("fails a fresh office", () => {
    expect(failing(invoiceCheck, invoiceCheck.seed())).toEqual(expect.arrayContaining(["told", "short", "amount", "credit"]));
  });
  it("passes when the invoice is held and Priya is told", () => {
    expect(failing(invoiceCheck, solved())).toEqual([]);
  });
  it("fails when the invoice is approved anyway", () => {
    const approved = solved(good, (s) => ({ ...s, files: s.files.map((f) => (f.id === INVOICE_ID ? { ...f, path: APPROVED } : f)) }));
    expect(failing(invoiceCheck, approved)).toEqual(["held"]);
  });
  it("fails when the invoice is deleted", () => {
    expect(failing(invoiceCheck, solved(good, (s) => ({ ...s, files: s.files.filter((f) => f.id !== INVOICE_ID) })))).toEqual(["held"]);
  });
  it("fails a hold figure without the VAT, and says why", () => {
    const r = invoiceCheck.check(solved(good.replace("£115.20", "£96.00")));
    const amount = r.find((c) => c.id === "amount");
    expect(amount?.ok).toBe(false);
    expect(amount?.fix).toMatch(/VAT/);
  });
  it("fails without the credit note, or without the shortage", () => {
    expect(failing(invoiceCheck, solved(good.replace("I've asked Harlow for a credit note for the 2 missing pallets.", "")))).toEqual(["credit"]);
    expect(failing(invoiceCheck, solved("Hi Priya, please hold back £115.20 on HP-2291 and ask for a credit note. Thanks"))).toEqual(["short"]);
  });
  it("accepts other words for two missing", () => {
    expect(failing(invoiceCheck, solved("Hi Priya, HP-2291: two pallets are missing from the delivery. Hold £115.20 with VAT until Harlow send a credit note."))).toEqual([]);
  });
});

/* ── E10.2 ────────────────────────────────────────────────────────────── */

describe("E10.2 Your timesheet and an expense", () => {
  const ts = (g: Grid, over: Partial<OfficeFile> = {}): OfficeFile => ({ id: "ts", path: COMPLETED, name: "2026-11-13 Timesheet Sam Reid.xlsx", kind: "xlsx", modified: "Today", by: "You", sheet: g, tabs: [{ name: "Timesheet", grid: g }], ...over });
  const claim = (g: Grid, pics = [{ fileId: TRAIN_ID, name: "IMG_4471.jpg", paper: paperOf(TRAIN_RECEIPT) }], over: Partial<OfficeFile> = {}): OfficeFile => ({
    id: "claim",
    path: EXPENSES,
    name: "2026-11-13 Expense claim Sam Reid.xlsx",
    kind: "xlsx",
    modified: "Today",
    by: "You",
    sheet: g,
    tabs: [{ name: "Expense claim", grid: g, pictures: pics }],
    ...over,
  });
  const solved = (files: OfficeFile[] = [ts(goodTimesheet()), claim(goodClaim())]) => {
    const s = timesheetExpense.seed();
    return { ...s, files: [...s.files, ...files] };
  };
  it("fails a fresh office", () => {
    expect(failing(timesheetExpense, timesheetExpense.seed()).length).toBeGreaterThan(8);
  });
  it("passes a timesheet of 41.5 hours and a £14.60 claim with its receipt", () => {
    expect(failing(timesheetExpense, solved())).toEqual([]);
  });
  it("fails when Thursday's overtime is left out", () => {
    const g = goodTimesheet();
    g[4][3] = "17:00";
    g[4][5] = "8";
    g[4][6] = "";
    expect(failing(timesheetExpense, solved([ts(g), claim(goodClaim())]))).toEqual(["ts-days", "ts-thu", "ts-over", "ts-total"]);
  });
  it("fails a day that forgot to take lunch off", () => {
    const g = goodTimesheet();
    g[1][5] = "8.5";
    expect(failing(timesheetExpense, solved([ts(g), claim(goodClaim())]))).toEqual(["ts-days", "ts-total"]);
  });
  it("fails a claim with no receipt, or the coffee receipt", () => {
    expect(failing(timesheetExpense, solved([ts(goodTimesheet()), claim(goodClaim(), [])]))).toEqual(["ex-receipt"]);
    expect(failing(timesheetExpense, solved([ts(goodTimesheet()), claim(goodClaim(), [{ fileId: "seed-img-4469", name: "IMG_4469.jpg", paper: paperOf(COFFEE_RECEIPT) }])]))).toEqual(["ex-receipt"]);
  });
  it("fails a claim that adds the coffee", () => {
    const g = goodClaim();
    g[2] = ["10/11/2026", "Coffee", "Meals", "3.10"];
    expect(failing(timesheetExpense, solved([ts(goodTimesheet()), claim(g)]))).toEqual(["ex-amount"]);
  });
  it("fails the claim saved in the wrong place, or badly named", () => {
    expect(failing(timesheetExpense, solved([ts(goodTimesheet()), claim(goodClaim(), undefined, { path: ["OneDrive", "Documents"] })]))).toEqual(["ex-saved"]);
    expect(failing(timesheetExpense, solved([ts(goodTimesheet(), { name: "Timesheet1.xlsx" }), claim(goodClaim())]))).toEqual(["ts-name"]);
  });
  it("fails a claim dated the day it was filled in, not the day of the journey", () => {
    const g = goodClaim();
    g[1][0] = "13/11/2026";
    expect(failing(timesheetExpense, solved([ts(goodTimesheet()), claim(g)]))).toEqual(["ex-line"]);
  });
  it("fails a second copy", () => {
    expect(failing(timesheetExpense, solved([ts(goodTimesheet()), ts(goodTimesheet(), { id: "ts2", path: ["OneDrive", "Documents"] }), claim(goodClaim())]))).toEqual(["one"]);
  });
});

/* ── E10.3 ────────────────────────────────────────────────────────────── */

describe("E10.3 Take a phone message", () => {
  const SUBJECT = "Phone message: Kent Bakery wants 30 sacks on Thursday";
  const good = "Hi Sarah,\n\nMr Ahmed from Kent Bakery rang at 14:20. He wants Thursday's flour changed from 20 sacks to 30.\n\nPlease call him back on 0116 496 0738 before 4pm to confirm.\n\nThanks";
  const solved = (body = good, subject = SUBJECT) => {
    const s = phoneMessage.seed();
    return { ...s, emails: [...s.emails, sent(PEOPLE.sarah, subject, body)] };
  };
  it("rings with the call from Kent Bakery, and its words are in time order", () => {
    expect(KENT_CALL.ringing).toBe(true);
    const at = (KENT_CALL.lines ?? []).map((l) => l.at);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(KENT_CALL.seconds).toBeGreaterThan(at[at.length - 1]);
  });
  it("fails a fresh office", () => {
    expect(failing(phoneMessage, phoneMessage.seed())).toEqual(["sent", "subject", "who", "when", "change", "number", "deadline"]);
  });
  it("passes a message with who, when, the change, the number and the deadline", () => {
    expect(failing(phoneMessage, solved())).toEqual([]);
    expect(failing(phoneMessage, solved("Sarah, Mr Ahmed (Kent Bakery) called at 2.20pm. Thursday: 30 sacks of flour, not 20. Ring him on 01164960738 by 16:00."))).toEqual([]);
  });
  it("fails a number with two digits swapped, and shows the number written", () => {
    const r = phoneMessage.check(solved(good.replace("0116 496 0738", "0116 496 0783")));
    expect(r.filter((c) => !c.ok).map((c) => c.id)).toEqual(["number"]);
    expect(r.find((c) => c.id === "number")?.fix).toMatch(/0116 496 0783/);
  });
  it("fails without the deadline, the time or the old amount", () => {
    expect(failing(phoneMessage, solved(good.replace(" before 4pm", "")))).toEqual(["deadline"]);
    expect(failing(phoneMessage, solved(good.replace(" at 14:20", "")))).toEqual(["when"]);
    expect(failing(phoneMessage, solved(good.replace("from 20 sacks to 30", "to 30 sacks")))).toEqual(["change"]);
  });
  it("fails a vague subject", () => {
    expect(failing(phoneMessage, solved(good, "Message"))).toEqual(["subject"]);
  });
});

/* ── E10.4 ────────────────────────────────────────────────────────────── */

describe("E10.4 Book a courier", () => {
  const goodsIn = ADDRESS_BOOK.find((a) => /goods in/i.test(a.name))!;
  const brightwater = ADDRESS_BOOK.find((a) => /brightwater/i.test(a.name))!;
  const booking = (over: Partial<CourierBooking> = {}): CourierBooking => ({
    ref: "HW-ABC234",
    status: "booked",
    method: "collect",
    from: goodsIn,
    to: brightwater,
    date: "2026-11-13",
    window: "13:00 to 17:00",
    parcels: [
      { kg: 12, cm: "Medium" },
      { kg: 12, cm: "Medium" },
    ],
    service: "Next day",
    price: 23.9,
    booked: "15:14",
    ...over,
  });
  const solved = (bookings: CourierBooking[] = [booking()], body = "Hi Sarah,\n\nBooked for Friday 13:00 to 17:00. The reference is HW-ABC234.\n\nThanks") => {
    const s = courierBooking.seed();
    return { ...s, courier: { bookings: [...(s.courier?.bookings ?? []), ...bookings] }, emails: [...s.emails, sent(PEOPLE.sarah, "Re: Returned cups to Brightwater", body)] };
  };
  it("fails a fresh office, and ignores the old booking already in the account", () => {
    expect(failing(courierBooking, courierBooking.seed())).toEqual(["booked", "method", "from", "to", "date", "time", "parcels", "told", "ref"]);
  });
  it("passes the right booking with its reference sent to Sarah", () => {
    expect(failing(courierBooking, solved())).toEqual([]);
  });
  it("fails the wrong door, the wrong Bright, the wrong day or the wrong time", () => {
    expect(failing(courierBooking, solved([booking({ from: ADDRESS_BOOK[0] })]))).toEqual(["from"]);
    expect(failing(courierBooking, solved([booking({ to: ADDRESS_BOOK.find((a) => a.name === "Bright Cafe")! })]))).toEqual(["to"]);
    expect(failing(courierBooking, solved([booking({ date: "2026-11-16" })]))).toEqual(["date"]);
    expect(failing(courierBooking, solved([booking({ window: "09:00 to 13:00" })]))).toEqual(["time"]);
  });
  it("fails one parcel of 24 kg", () => {
    expect(failing(courierBooking, solved([booking({ parcels: [{ kg: 24 }] })]))).toEqual(["parcels"]);
  });
  it("fails two live bookings, and passes once the wrong one is cancelled", () => {
    const wrong = booking({ ref: "HW-WRONG2", date: "2026-11-16" });
    expect(failing(courierBooking, solved([wrong, booking()]))).toEqual(["booked"]);
    expect(failing(courierBooking, solved([{ ...wrong, status: "cancelled" }, booking()]))).toEqual([]);
  });
  it("fails an email without the reference", () => {
    expect(failing(courierBooking, solved([booking()], "Hi Sarah, it's booked."))).toEqual(["ref"]);
  });
  it("accepts a typed-in address that is the same place", () => {
    const typed = { name: "Brightwater Cups", lines: ["14 Station Rd", "Derby"], postcode: "de1 2qy" };
    expect(failing(courierBooking, solved([booking({ to: typed })]))).toEqual([]);
  });
});
