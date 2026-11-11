import { describe, expect, it } from "vitest";
import { BRIEFS, COMPLAINTS_TEXT, complaintPersonalLeft, describePersonal, explainFormula, findPersonal, markPrompt, respond, topicsIn } from "./copilot";
import { display, evaluate } from "./formula";

/* Module 12: the scripted Copilot and the whole-column ranges its formula
 * job needs. */

describe("whole-column ranges (F:F)", () => {
  const g = [
    ["Date", "Status", "Value", '=COUNTIF(B:B,"Late")'],
    ["02/11", "Late", "£10.00", '=SUMIF(B:B,"Late",C:C)'],
    ["03/11", "On time", "£5.00", "=SUM(C:C)"],
    ["04/11", "late", "£2.50", '=countif(b:b, "On time")'],
    ["", "", "", ""],
    ["", "", "", ""],
  ];
  it("counts and adds up every row of a column", () => {
    expect(evaluate(g, 0, 3)).toBe(2);
    expect(evaluate(g, 1, 3)).toBe(12.5);
    expect(evaluate(g, 2, 3)).toBe(17.5);
    expect(evaluate(g, 3, 3)).toBe(1);
  });
  it("shows a SUM of a money column as money", () => {
    expect(display(g, 2, 3)).toBe("£17.50");
  });
  it("still reads two-corner ranges", () => {
    expect(evaluate([["Late"], ["Late"], ['=COUNTIF(A1:A2,"Late")']], 2, 0)).toBe(2);
  });
  it("flags a whole-column formula inside its own column as a loop", () => {
    expect(evaluate([["Late"], ['=COUNTIF(A:A,"Late")']], 1, 0)).toBe("#REF!");
  });
});

describe("marking a prompt for a draft (AI-1)", () => {
  const kent = BRIEFS["kent-flour"];
  it("passes the facts, the reader and the tone", () => {
    const m = markPrompt("Write a friendly reply to Imran at Kent Bakery confirming 30 sacks of flour on Thursday 12 November before 10:00", kent);
    expect([m.facts, m.reader, m.tone]).toEqual([true, true, true]);
  });
  it("forgives typos and other ways of saying it", () => {
    const m = markPrompt("pls draft a freindly email to the customer, thirty sacks thrusday by 10am", kent);
    expect([m.facts, m.reader, m.tone]).toEqual([true, true, true]);
    expect(markPrompt("polite reply to Mr Ahmed: 30 bags, 12th Nov, 10 o'clock", kent).facts).toBe(true);
  });
  it("names what's missing", () => {
    const m = markPrompt("Reply to Kent Bakery and confirm the change", kent);
    expect(m.facts).toBe(false);
    expect(m.missing).toHaveLength(3);
    expect(m.tone).toBe(false);
    expect(m.reader).toBe(true);
  });
  it("catches the wrong day in the prompt", () => {
    const m = markPrompt("Friendly reply to Kent Bakery: 30 sacks on Friday before 10:00", kent);
    expect(m.facts).toBe(false);
    expect(m.wrongTip).toMatch(/Thursday/);
  });
});

describe("Copilot's answers", () => {
  it("gives a vague draft and a tip to a weak prompt, and an example after two", () => {
    const one = respond("reply to this email", { host: "outlook", brief: "kent-flour", weakSoFar: 0 });
    expect(one.kind).toBe("vague");
    expect(one.tip).toBeTruthy();
    expect(one.example).toBeUndefined();
    const two = respond("reply to this email please", { host: "outlook", brief: "kent-flour", weakSoFar: 1 });
    expect(two.example).toMatch(/30 sacks/);
  });
  it("gives a good draft that still carries the planted mistakes", () => {
    for (const tone of ["friendly", "formal", "short", "polite"]) {
      for (const variant of [0, 1]) {
        const a = respond(`Write a ${tone} reply to Imran Ahmed at Kent Bakery: 30 sacks, Thursday 12 November, before 10:00`, { host: "outlook", brief: "kent-flour", variant });
        expect(a.kind).toBe("draft");
        expect(a.reply).toMatch(/Friday 13 November/);
        expect(a.reply).toMatch(/10%/);
        expect(a.reply).toMatch(/30 sacks/);
      }
    }
  });
  it("explains =COUNTIF(F:F,\"Late\") in plain words, using the column's heading", () => {
    const grid = [["Date", "DN", "Supplier", "Goods", "Arrived", "Status"]];
    const a = respond('What does =COUNTIF(F:F,"Late") do?', { host: "excel", grid, fileName: "2026-11 Delivery log.xlsx" });
    expect(a.kind).toBe("explain");
    expect(a.reply).toMatch(/whole of column F, the Status column/);
    expect(a.reply).toMatch(/"Late"/);
    expect(a.refs).toEqual(["2026-11 Delivery log.xlsx"]);
    expect(explainFormula("=SUM(E2:E9)")).toMatch(/adds up/);
    expect(explainFormula('=SUMIF(B:B,"Kent Bakery",E:E)')).toMatch(/only on the rows/);
  });
  it("explains the selected cell's formula when asked", () => {
    const a = respond("explain this formula", { host: "excel", cell: { name: "I2", raw: '=COUNTIF(F:F,"Late")' } });
    expect(a.kind).toBe("explain");
  });
  it("counts loosely, and wrongly, when asked how many", () => {
    const grid = [
      ["Date", "Status", "Notes"],
      ["1", "Late", ""],
      ["2", "On time", "Driver rang to say he'd be late, but made it"],
      ["3", "Late", ""],
    ];
    const a = respond("How many deliveries were late?", { host: "excel", grid });
    expect(a.kind).toBe("count");
    expect(a.reply).toMatch(/3/);
  });
  it("summarises pasted complaints without refusing, personal details or not", () => {
    const a = respond(`Summarise these complaints:\n${COMPLAINTS_TEXT}`, { host: "app" });
    expect(a.kind).toBe("summary");
    expect(a.reply).toMatch(/5 complaints/);
  });
});

describe("personal details (AI-4)", () => {
  it("finds the names, phone numbers and card digits in the complaint list", () => {
    const found = findPersonal(COMPLAINTS_TEXT);
    const kinds = found.map((p) => p.kind);
    expect(kinds.filter((k) => k === "name")).toHaveLength(5);
    expect(kinds.filter((k) => k === "phone")).toHaveLength(5);
    expect(found.find((p) => p.kind === "card")?.text).toBe("4417");
    expect(describePersonal(found)).toBe("5 names, 5 phone numbers and card digits");
  });
  it("leaves business names, dates and order numbers alone", () => {
    expect(findPersonal("Bright Cafe, Kent Bakery and Oak Street Deli. Order 4429 on 10/11/2026 for £11.40.")).toEqual([]);
  });
  it("finds emails, addresses, postcodes and passwords", () => {
    const kinds = findPersonal("Mr Ahmed, 9 Mill Road, Leicester LE2 7QT, imran.ahmed@kentbakery.example, password: Bread123").map((p) => p.kind);
    expect(kinds).toEqual(["name", "address", "address", "email", "password"]);
  });
  it("knows when a cleaned list still makes sense", () => {
    const clean = COMPLAINTS_TEXT.replace(/Leah Moss, 07700 900214/g, "Customer A").replace(/Imran Ahmed, 0116 496 0738/g, "Customer B").replace(/Rita Fenwick, 0116 496 0583/g, "Customer C").replace("Card ending 4417", "A card");
    expect(complaintPersonalLeft(clean)).toEqual([]);
    expect(topicsIn(clean)).toHaveLength(5);
    expect(complaintPersonalLeft(COMPLAINTS_TEXT).length).toBeGreaterThanOrEqual(7);
  });
});
