import { describe, expect, it } from "vitest";
import { COMPLAINTS_TEXT, respond } from "../copilot";
import { PEOPLE, YOU } from "../northfield";
import type { CopilotHost, Email, OfficeState, Person } from "../types";
import { copilotDraft, explainFormula, whatNotToPaste } from "./copilotJobs";

/* Module 12's three jobs, marked on the end state: what went into Copilot
 * and what went out by email. */

const ask = (s: OfficeState, prompt: string, host: CopilotHost, extra: Parameters<typeof respond>[1] = { host }): OfficeState => {
  const a = respond(prompt, { ...extra, host, state: s });
  return { ...s, copilot: { ...(s.copilot ?? { turns: [] }), turns: [...(s.copilot?.turns ?? []), { ...a, id: `t${s.copilot?.turns.length ?? 0}` }] } };
};
const send = (s: OfficeState, to: Person, body: string, subject = "Re: hello"): OfficeState => {
  const e: Email = { id: `sent-${s.emails.length}`, folder: "sent", from: YOU, to: [to], cc: [], subject, body, time: "Just now", attachments: [], links: [] };
  return { ...s, emails: [...s.emails, e] };
};
const failing = (job: typeof copilotDraft, s: OfficeState) => job.check(s).filter((c) => !c.ok).map((c) => c.id);

const GOOD_PROMPT = "Write a friendly reply to Imran Ahmed at Kent Bakery. Confirm his flour is now 30 sacks, delivered Thursday 12 November before 10:00.";

describe("E12.1 Let Copilot draft it, then check it", () => {
  const start = copilotDraft.seed();
  it("fails every check as seeded", () => {
    expect(copilotDraft.check(start).every((c) => !c.ok)).toBe(true);
  });
  it("passes with a good prompt and both mistakes fixed", () => {
    let s = ask(start, GOOD_PROMPT, "outlook");
    const draft = s.copilot!.turns[0].reply;
    expect(draft).toMatch(/Friday 13 November/);
    const fixed = draft.replace("Friday 13 November", "Thursday 12 November").replace(/\n\nWe'd also like to give you 10% off this order, as a thank you\./, "");
    s = send(s, PEOPLE.imran, fixed, "Re: Thursday's flour");
    expect(failing(copilotDraft, s)).toEqual([]);
  });
  it("catches the draft sent as Copilot wrote it", () => {
    let s = ask(start, GOOD_PROMPT, "outlook");
    s = send(s, PEOPLE.imran, s.copilot!.turns[0].reply);
    expect(failing(copilotDraft, s)).toEqual(["day", "discount"]);
  });
  it("catches each mistake on its own", () => {
    let s = ask(start, GOOD_PROMPT, "outlook");
    const draft = s.copilot!.turns[0].reply;
    expect(failing(copilotDraft, send(s, PEOPLE.imran, draft.replace("Friday 13 November", "Thursday 12 November")))).toEqual(["discount"]);
    expect(failing(copilotDraft, send(s, PEOPLE.imran, draft.replace(/\n\nWe'd also.*\./, "")))).toEqual(["day"]);
    /* Thursday, but still Copilot's date */
    const thirteenth = draft.replace("Friday 13 November", "Thursday 13 November").replace(/\n\nWe'd also.*\./, "");
    const c = copilotDraft.check((s = send(s, PEOPLE.imran, thirteenth))).find((x) => x.id === "day");
    expect(c?.ok).toBe(false);
    expect(c?.fix).toMatch(/13th/);
  });
  it("marks a weak prompt, even when the email itself is right", () => {
    let s = ask(start, "reply to kent bakery", "outlook");
    s = send(s, PEOPLE.imran, "Hi Imran,\n\nConfirmed: 30 sacks on Thursday 12 November, before 10:00.\n\nThanks");
    expect(failing(copilotDraft, s)).toEqual(["prompt"]);
    expect(copilotDraft.check(s).find((c) => c.id === "prompt")?.fix).toMatch(/facts.*tone/);
  });
});

const CLEAN = COMPLAINTS_TEXT.replace(/Leah Moss, 07700 900214/g, "Customer A").replace(/Imran Ahmed, 0116 496 0738/g, "Customer B").replace(/Rita Fenwick, 0116 496 0583/g, "Customer C").replace("Card ending 4417", "Their card");

describe("E12.2 What not to paste", () => {
  const start = whatNotToPaste.seed();
  it("fails every check as seeded", () => {
    expect(whatNotToPaste.check(start).every((c) => !c.ok)).toBe(true);
  });
  it("passes with the details taken out and the summary sent to Daniel", () => {
    let s = ask(start, `Summarise these complaints:\n${CLEAN}`, "app");
    expect(s.copilot!.turns[0].kind).toBe("summary");
    s = send(s, PEOPLE.daniel, s.copilot!.turns[0].reply, "Re: This week's complaints");
    expect(failing(whatNotToPaste, s)).toEqual([]);
  });
  it("catches the list pasted as it was, even if a clean one follows", () => {
    let s = ask(start, `Summarise these complaints:\n${COMPLAINTS_TEXT}`, "app");
    s = ask(s, `Summarise these complaints:\n${CLEAN}`, "app");
    s = send(s, PEOPLE.daniel, s.copilot!.turns[1].reply);
    expect(failing(whatNotToPaste, s)).toEqual(["private"]);
    expect(whatNotToPaste.check(s)[0].fix).toMatch(/Leah Moss.*4417/);
  });
  it("catches a single card number left in", () => {
    let s = ask(start, `Summarise these complaints:\n${CLEAN.replace("Their card", "Card ending 4417")}`, "app");
    s = send(s, PEOPLE.daniel, s.copilot!.turns[0].reply);
    expect(failing(whatNotToPaste, s)).toEqual(["private"]);
  });
  it("catches a summary that lost the complaints with the details", () => {
    let s = ask(start, "Summarise these complaints: cups split, flour damp", "app");
    s = send(s, PEOPLE.daniel, "Cups, flour, napkins.");
    expect(failing(whatNotToPaste, s)).toEqual(["summary"]);
  });
  it("wants the summary sent to Daniel", () => {
    const s = ask(start, `Summarise these complaints:\n${CLEAN}`, "app");
    expect(failing(whatNotToPaste, s)).toEqual(["daniel"]);
  });
});

describe("E12.3 Explain this formula", () => {
  const start = explainFormula.seed();
  const log = (s: OfficeState) => s.files.find((f) => f.id === "seed-log-nov")!;
  const write = (s: OfficeState, r: number, c: number, v: string): OfficeState => {
    const f = log(s);
    const sheet = f.sheet!.map((row) => [...row]);
    sheet[r][c] = v;
    return { ...s, files: s.files.map((x) => (x.id === f.id ? { ...f, sheet, by: "You", modified: "Today, just now" } : x)) };
  };
  const asked = (s: OfficeState) => ask(s, 'What does =COUNTIF(F:F,"Late") do?', "excel", { host: "excel", grid: log(s).sheet, fileName: "2026-11 Delivery log.xlsx" });
  it("fails every check as seeded", () => {
    expect(explainFormula.check(start).every((c) => !c.ok)).toBe(true);
  });
  it("passes when asked, written, saved and told", () => {
    let s = asked(start);
    s = write(s, 14, 3, '=COUNTIF(F:F,"Late")');
    s = send(s, PEOPLE.priya, "Hi Priya,\n\n3 deliveries were late in November. The formula counts the cells in column F that say Late.\n\nThanks");
    expect(failing(explainFormula, s)).toEqual([]);
  });
  it("Copilot's own count is 4, and sending it fails", () => {
    const s0 = ask(start, "How many deliveries were late?", "excel", { host: "excel", grid: log(start).sheet });
    expect(s0.copilot!.turns[0].reply).toMatch(/\b4\b/);
    let s = asked(s0);
    s = write(s, 14, 3, '=COUNTIF(F:F,"Late")');
    s = send(s, PEOPLE.priya, "There were 4 late.");
    expect(failing(explainFormula, s)).toEqual(["priya"]);
  });
  it("wants a formula, not a typed number", () => {
    let s = asked(start);
    s = write(s, 14, 3, "3");
    s = send(s, PEOPLE.priya, "3 were late.");
    expect(failing(explainFormula, s)).toEqual(["formula"]);
  });
  it("catches a formula inside column F, which counts itself", () => {
    let s = asked(start);
    s = write(s, 14, 5, '=COUNTIF(F:F,"Late")');
    s = send(s, PEOPLE.priya, "3 were late.");
    expect(failing(explainFormula, s)).toEqual(["formula"]);
  });
  it("wants Copilot asked first", () => {
    let s = write(start, 14, 3, '=COUNTIF(F2:F13,"Late")');
    s = send(s, PEOPLE.priya, "3 were late.");
    expect(failing(explainFormula, s)).toEqual(["asked"]);
  });
});
