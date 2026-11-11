import { describe, expect, it } from "vitest";
import { PEOPLE, YOU } from "../northfield";
import type { Check, Email, OfficeFile, OfficeState, WordDoc } from "../types";
import { canSaveIn, committed, diff, followsHouseRule, fromTemplate, isFakeHeading, issues, issuesIn, parseDate, placeholdersIn, revisions, settleAll, settleIn, withText } from "../word";
import { holidayForm, holidayFormDoc } from "./holidayForm";
import { letterhead, letterheadDoc } from "./letterhead";
import { procedureDoc, procedureReview } from "./procedureReview";

/* Module 8's Word model and its three office jobs: a fresh office fails,
 * a job done the way the brief asks passes every check, and each planted
 * mistake fails the check that names it. */

const ids = (cs: Check[]) => cs.filter((c) => !c.ok).map((c) => c.id);

describe("the Word model", () => {
  it("finds the planted spelling and grammar slips, and leaves good words alone", () => {
    const found = issuesIn("We are very sory. You should recieve it on Monday, a order in the the box.");
    expect(found.map((i) => i.word.trim())).toEqual(["sory", "recieve", "a", "the"]);
    expect(issuesIn("Dear Ms Fenwick, I'm sorry. Refund on Wednesday 11 November.")).toEqual([]);
    expect(issuesIn("Ms Fenwik")).toEqual([]); // names are never on the list: read them back
  });
  it("reads tracked changes as Word shows them, one change each", () => {
    const r = revisions(procedureDoc());
    expect(r).toHaveLength(4);
    expect(r.map((x) => x.kind)).toEqual(["insert", "insert", "delete", "change"]);
    expect(r[1].ins.trim()).toBe("second");
    expect(r[3].del.trim()).toBe("within 5 days,");
    expect(r[3].ins.trim()).toBe("on the same day,");
  });
  it("accepts and rejects one change at a time, and all at once", () => {
    const doc = procedureDoc();
    const pallet = revisions(doc).find((x) => x.blockId === "gp-pallet")!;
    const rejected = settleIn(doc, pallet, false);
    expect(rejected.blocks.find((b) => b.id === "gp-pallet")?.text).toBe("Count every pallet against the delivery note.");
    expect(rejected.blocks.find((b) => b.id === "gp-pallet")?.base).toBeUndefined();
    const fax = revisions(doc).find((x) => x.blockId === "gp-fax")!;
    expect(settleIn(doc, fax, true).blocks.some((b) => b.id === "gp-fax")).toBe(false);
    expect(settleIn(doc, fax, false).blocks.find((b) => b.id === "gp-fax")?.text).toBe("Fax a copy of the delivery note to the office.");
    expect(revisions(settleAll(doc, true))).toHaveLength(0);
    expect(settleAll(doc, false).blocks.some((b) => b.id === "gp-po")).toBe(false);
  });
  it("tracks your own edits when Track Changes is on, and not when it's off", () => {
    const b = { id: "x", style: "normal" as const, text: "Count every pallet." };
    const on = withText(b, "Count each pallet.", "You");
    expect(on.base).toBe("Count every pallet.");
    expect(committed(on)).toBe("Count every pallet.");
    expect(withText(b, "Count each pallet.").base).toBeUndefined();
    expect(diff("a b c", "a x c").filter((o) => o.t !== "eq")).toHaveLength(2);
  });
  it("reads dates the ways people type them", () => {
    for (const s of ["21/12/2026", "21/12/26", "21 December 2026", "Monday 21 December", "21st Dec", "21.12.2026"]) expect(parseDate(s)).toEqual({ d: 21, m: 12, y: 2026 });
    expect(parseDate("31/09/2026")).toBeNull();
    expect(parseDate("next Monday")).toBeNull();
  });
  it("knows where you can save, a fake heading, and the house rule", () => {
    expect(canSaveIn(["HR", "Templates"])).toBe(false);
    expect(canSaveIn(["HR", "Forms", "Completed"])).toBe(true);
    expect(canSaveIn(["Operations Team", "Documents", "Health and safety"])).toBe(false);
    expect(canSaveIn(["OneDrive", "Documents"])).toBe(true);
    expect(isFakeHeading({ id: "h", style: "normal", text: "Refund for order 4405", bold: true, size: 16 })).toBe(true);
    expect(isFakeHeading({ id: "h", style: "h2", text: "Refund for order 4405" })).toBe(false);
    expect(followsHouseRule("2026-11-10 Letter to Oak Street Deli.pdf")).toBe(true);
    expect(followsHouseRule("letter final v2.pdf")).toBe(false);
  });
  it("starts a new document from a template without touching the template", () => {
    const t = letterheadDoc();
    const d = fromTemplate(t, "Letterhead.dotx");
    d.blocks[0].text = "10 November 2026";
    expect(t.blocks[0].text).toBe("[Date]");
    expect(d.template).toBe("Letterhead.dotx");
    expect(placeholdersIn(t).length).toBeGreaterThan(5);
  });
});

/* ── E8.1 A letter on the letterhead ─────────────────────────────────── */

const ORDERS = ["Operations Team", "Documents", "Orders", "2026"];
const LETTER_NAME = "2026-11-10 Letter to Oak Street Deli.pdf";

function letter(over: Record<string, string> = {}): WordDoc {
  const fill: Record<string, string> = {
    "[Date]": "10 November 2026",
    "[Reference]": "NS/4405",
    "[Recipient name]": "Ms Rita Fenwick",
    "[Company]": "Oak Street Deli",
    "[Street address]": "18 Oak Street",
    "[Town and postcode]": "Leicester LE1 6AB",
    "[Name]": "Ms Fenwick",
    "[Subject of the letter]": "Refund for order 4405",
    "[Write your letter here.]": "I'm very sorry that we charged you twice for the napkins on order 4405. We have refunded the £32.50, and you should receive it within 5 working days.",
    "[Your name]": "Jordan Miles",
    ...over,
  };
  const d = fromTemplate(letterheadDoc(), "Letterhead.dotx");
  d.blocks = d.blocks.map((b) => ({ ...b, text: b.text.replace(/\[[^\]]+\]/g, (m) => fill[m] ?? m) }));
  return d;
}

const pdf = (doc: WordDoc, over: Partial<OfficeFile> = {}): OfficeFile => ({ id: "my-pdf", path: ORDERS, name: LETTER_NAME, kind: "pdf", modified: "Today", by: "You", doc, ...over });

function mailTo(to: { name: string; address: string }[], over: Partial<Email> = {}): Email {
  return { id: `sent-${Math.random()}`, folder: "sent", from: YOU, to, cc: [], subject: "Refund for order 4405", body: "Dear Ms Fenwick,\n\nPlease find our letter attached.\n\nKind regards", time: "Just now", attachments: [], links: [], ...over };
}

function letterDone(doc = letter(), file: Partial<OfficeFile> = {}, mail: Partial<Email> = {}): OfficeState {
  const s = letterhead.seed();
  const p = pdf(doc, file);
  return { ...s, files: [...s.files, p], emails: [...s.emails, mailTo([PEOPLE.rita], { cc: [PEOPLE.daniel], attachments: [{ name: p.name, doc: p.doc }], ...mail })] };
}

describe("E8.1 A letter on the letterhead", () => {
  it("a fresh office fails", () => {
    expect(letterhead.check(letterhead.seed()).every((c) => !c.ok)).toBe(true);
  });
  it("passes when the letter is done the way Daniel asked", () => {
    const r = letterhead.check(letterDone());
    expect(ids(r)).toEqual([]);
  });
  it("catches a spelling slip, and the misspelt name the spell check can't see", () => {
    expect(ids(letterhead.check(letterDone(letter({ "[Write your letter here.]": "I'm very sorry. You should recieve the £32.50 refund within 5 working days." }))))).toEqual(["spelling"]);
    expect(ids(letterhead.check(letterDone(letter({ "[Recipient name]": "Ms Rita Fenwik", "[Name]": "Ms Fenwik" }))))).toEqual(["rita"]);
  });
  it("catches a placeholder left in, and a missing reference", () => {
    expect(ids(letterhead.check(letterDone(letter({ "[Your name]": "[Your name]" }))))).toEqual(["placeholders"]);
    expect(ids(letterhead.check(letterDone(letter({ "[Reference]": "4405" }))))).toEqual(["dateref"]);
  });
  it("catches a heading made with bold and a bigger size", () => {
    const d = letter();
    d.blocks = d.blocks.map((b) => (b.style === "h2" ? { ...b, style: "normal", bold: true, size: 16 } : b));
    expect(ids(letterhead.check(letterDone(d)))).toEqual(["heading"]);
  });
  it("catches a letter not started from the template", () => {
    const d = { ...letter(), template: undefined, header: undefined };
    expect(ids(letterhead.check(letterDone(d)))).toEqual(["template"]);
  });
  it("catches the wrong place, the wrong name and a second copy", () => {
    expect(ids(letterhead.check(letterDone(letter(), { path: ["OneDrive", "Documents"] })))).toEqual(["place"]);
    expect(ids(letterhead.check(letterDone(letter(), { name: "letter final.pdf" })))).toEqual(["name"]);
    const twice = letterDone();
    twice.files.push(pdf(letter(), { id: "second", path: ["OneDrive", "Documents"], name: "Letter.pdf" }));
    expect(ids(letterhead.check(twice))).toEqual(["one"]);
  });
  it("wants the PDF attached for an outside reader, not a link or the Word file", () => {
    const link = letterDone(letter(), {}, { attachments: [], links: [{ name: LETTER_NAME, path: ORDERS, fileName: LETTER_NAME }] });
    expect(ids(letterhead.check(link))).toEqual(["attached"]);
    expect(letterhead.check(link).find((c) => c.id === "attached")?.fix).toMatch(/outside the company/);
    const word = letterDone(letter(), {}, { attachments: [{ name: "Document1.docx", doc: letter() }] });
    expect(ids(letterhead.check(word))).toEqual(["attached"]);
  });
  it("wants Daniel told", () => {
    expect(ids(letterhead.check(letterDone(letter(), {}, { cc: [] })))).toEqual(["loop"]);
  });
});

/* ── E8.2 Book your holiday ──────────────────────────────────────────── */

const COMPLETED = ["HR", "Forms", "Completed"];
const FILLED = { name: "Jordan Miles", job: "Office Administrator", team: "Office", start: "21/12/2026", end: "23/12/2026", days: "3", approver: "Daniel Okafor", signed: "Jordan Miles", dated: "13/11/2026", agreed: "yes" };

function holidayDone(fields: Record<string, string> = FILLED, file: Partial<OfficeFile> = {}, tellEmma = true): OfficeState {
  const s = holidayForm.seed();
  const doc = fromTemplate(holidayFormDoc(fields), "Holiday request.dotx");
  const f: OfficeFile = { id: "my-form", path: COMPLETED, name: `2026-11-13 Holiday request ${fields.name}.docx`, kind: "docx", modified: "Today", by: "You", doc, ...file };
  return { ...s, files: [...s.files, f], emails: tellEmma ? [...s.emails, mailTo([PEOPLE.emma], { subject: "Re: Christmas holidays: forms by Friday", body: "Hi Emma, my form is in Forms > Completed. Thanks" })] : s.emails };
}

describe("E8.2 Book your holiday", () => {
  it("a fresh office fails", () => {
    expect(holidayForm.check(holidayForm.seed()).every((c) => !c.ok)).toBe(true);
  });
  it("passes when the form is filled in and filed the way Emma asked", () => {
    expect(ids(holidayForm.check(holidayDone()))).toEqual([]);
    expect(ids(holidayForm.check(holidayDone({ ...FILLED, start: "Monday 21 December", end: "23 Dec 2026", days: "3 days" })))).toEqual([]);
  });
  it("catches each wrong answer", () => {
    expect(ids(holidayForm.check(holidayDone({ ...FILLED, days: "4" })))).toEqual(["days"]);
    expect(ids(holidayForm.check(holidayDone({ ...FILLED, end: "24/12/2026" })))).toEqual(["end"]);
    expect(ids(holidayForm.check(holidayDone({ ...FILLED, start: "22/12/2026" })))).toEqual(["start"]);
    expect(ids(holidayForm.check(holidayDone({ ...FILLED, approver: "Emma Clarke" })))).toEqual(["approver"]);
    expect(ids(holidayForm.check(holidayDone({ ...FILLED, agreed: "" })))).toEqual(["filled"]);
  });
  it("catches the wrong folder, the wrong name, and no word to Emma", () => {
    expect(ids(holidayForm.check(holidayDone(FILLED, { path: ["OneDrive", "Documents"] })))).toEqual(["place"]);
    expect(ids(holidayForm.check(holidayDone(FILLED, { name: "Holiday form.docx" })))).toEqual(["name"]);
    expect(ids(holidayForm.check(holidayDone(FILLED, {}, false)))).toEqual(["loop"]);
  });
});

/* ── E8.3 Review the delivery procedure ──────────────────────────────── */

function reviewed(doc: WordDoc, tellSarah = true): OfficeState {
  const s = procedureReview.seed();
  return {
    ...s,
    files: s.files.map((f) => (f.id === "seed-procedure" ? { ...f, doc, modified: "Today", by: "You" } : f)),
    emails: tellSarah ? [...s.emails, mailTo([PEOPLE.sarah], { subject: "Re: Goods-in procedure", body: "Done. I rejected every second pallet." })] : s.emails,
  };
}

function rightReview(): WordDoc {
  let d = procedureDoc();
  for (const id of ["gp-po", "gp-fax", "gp-tell"]) d = settleIn(d, revisions(d).find((r) => r.blockId === id)!, true);
  d = settleIn(d, revisions(d).find((r) => r.blockId === "gp-pallet")!, false);
  return { ...d, comments: [...(d.comments ?? []), { id: "c", blockId: "gp-pallet", by: "You", time: "Just now", text: "We must count every pallet, or we'll miss a short delivery." }] };
}

describe("E8.3 Review the delivery procedure", () => {
  it("a fresh office fails", () => {
    expect(procedureReview.check(procedureReview.seed()).every((c) => !c.ok)).toBe(true);
  });
  it("passes when the right changes are accepted, the wrong one rejected with a reason, and it's saved", () => {
    expect(ids(procedureReview.check(reviewed(rightReview())))).toEqual([]);
  });
  it("catches the wrong change accepted, and a right one rejected", () => {
    let d = rightReview();
    d = { ...d, blocks: d.blocks.map((b) => (b.id === "gp-pallet" ? { ...b, text: "Count every second pallet against the delivery note." } : b)) };
    expect(ids(procedureReview.check(reviewed(d)))).toEqual(["pallet"]);
    let all = settleAll(procedureDoc(), true);
    all = { ...all, comments: rightReview().comments };
    expect(ids(procedureReview.check(reviewed(all)))).toEqual(["pallet"]);
    let rej = procedureDoc();
    rej = settleIn(rej, revisions(rej).find((r) => r.blockId === "gp-po")!, false);
    for (const id of ["gp-fax", "gp-tell"]) rej = settleIn(rej, revisions(rej).find((r) => r.blockId === id)!, true);
    rej = settleIn(rej, revisions(rej).find((r) => r.blockId === "gp-pallet")!, false);
    rej = { ...rej, comments: rightReview().comments };
    expect(ids(procedureReview.check(reviewed(rej)))).toEqual(["po"]);
  });
  it("catches a change left waiting, and no comment", () => {
    const d = rightReview();
    expect(ids(procedureReview.check(reviewed({ ...d, comments: d.comments!.filter((c) => c.by !== "You") })))).toEqual(["why"]);
    let half = procedureDoc();
    half = settleIn(half, revisions(half).find((r) => r.blockId === "gp-pallet")!, false);
    half = { ...half, comments: rightReview().comments };
    expect(ids(procedureReview.check(reviewed(half)))).toEqual(["po", "fax", "sameday"]);
  });
  it("catches an edit made with Track Changes off, but not one made with it on", () => {
    const d = rightReview();
    const quiet = { ...d, blocks: d.blocks.map((b) => (b.id === "gp-short" ? { ...b, text: "Write anything short on the note." } : b)) };
    expect(ids(procedureReview.check(reviewed(quiet)))).toEqual(["tracked"]);
    const tracked = { ...d, blocks: d.blocks.map((b) => (b.id === "gp-short" ? withText(b, "Write anything short on the note.", "You") : b)) };
    expect(ids(procedureReview.check(reviewed(tracked)))).toEqual([]);
  });
  it("catches it not saved, a copy, and no word to Sarah", () => {
    const s = procedureReview.seed();
    expect(ids(procedureReview.check(s))).toContain("saved");
    const copy = reviewed(rightReview());
    copy.files.push({ id: "copy", path: ["OneDrive", "Documents"], name: "Goods-in procedure.docx", kind: "docx", modified: "Today", by: "You", doc: rightReview() });
    expect(ids(procedureReview.check(copy))).toEqual(["saved"]);
    expect(ids(procedureReview.check(reviewed(rightReview(), false)))).toEqual(["loop"]);
  });
  it("the procedure's spelling is clean, so only the review is being tested", () => {
    expect(issues(procedureDoc())).toEqual([]);
  });
});
