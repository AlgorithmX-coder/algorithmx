import { describe, expect, it } from "vitest";
import { classifyTurns, detectElements, rulesGrade, similarity, verdictFrom } from "./rubric";

/* The rules half of the Fluent grader: element presence, repeated turns
 * and the verdict arithmetic from the design document. */

const WEAK = "Summarise the aged debtors report";
const FLUENT = "You are writing for the finance director, who has to tell the board on Thursday what to decide about debtors. From the attached export, give me a one-paragraph position, then the two items that need a decision, as two bullets with the amount and the days overdue. Under 120 words, plain English, no jargon.";

describe("detectElements", () => {
  it("finds only the task in the weak prompt", () => {
    const e = detectElements(WEAK);
    expect(e.task).toBe(true);
    expect(e.reader).toBe(false);
    expect(e.format).toBe(false);
    expect(e.length).toBe(false);
    expect(e.constraints).toBe(false);
    expect(e.scope).toBe(true);
  });

  it("finds every element in the fluent prompt", () => {
    const e = detectElements(FLUENT);
    expect(e.role).toBe(true);
    expect(e.reader).toBe(true);
    expect(e.task).toBe(true);
    expect(e.format).toBe(true);
    expect(e.length).toBe(true);
    expect(e.constraints).toBe(true);
    expect(e.material).toBe(true);
    expect(e.scope).toBe(true);
  });

  it("flags two requests in one prompt as a scope problem", () => {
    expect(detectElements("Summarise the report and then draft an email to the client about it").scope).toBe(false);
    expect(detectElements("What is the total? And which client is oldest?").scope).toBe(false);
  });
});

describe("turns", () => {
  it("marks a near-identical resend as repeated", () => {
    expect(similarity(WEAK, "Please summarise the aged debtors report")).toBeGreaterThanOrEqual(0.7);
    expect(classifyTurns([WEAK, "Please summarise the aged debtors report"])).toEqual(["moved", "repeated"]);
  });

  it("treats a follow-up that adds the reader as moved", () => {
    expect(classifyTurns([WEAK, "Too long, and it is for the finance director who needs the two decisions as bullets"])).toEqual(["moved", "moved"]);
  });
});

describe("verdictFrom", () => {
  const t = [{ i: 0, move: "moved" as const, why: "" }];
  it("is fluent when every required element is apt or one is weak", () => {
    expect(verdictFrom(["task", "reader", "format"], [{ key: "task", score: 2, why: "" }, { key: "reader", score: 2, why: "" }, { key: "format", score: 1, why: "" }], t)).toBe("fluent");
  });
  it("is nearly with one missing element", () => {
    expect(verdictFrom(["task", "reader", "format"], [{ key: "task", score: 2, why: "" }, { key: "reader", score: 2, why: "" }, { key: "format", score: 0, why: "" }], t)).toBe("nearly");
  });
  it("is not yet with two missing elements", () => {
    expect(verdictFrom(["task", "reader", "format"], [{ key: "task", score: 2, why: "" }, { key: "reader", score: 0, why: "" }, { key: "format", score: 0, why: "" }], t)).toBe("notyet");
  });
  it("lets a repeated turn drag a good prompt down to nearly", () => {
    expect(verdictFrom(["task"], [{ key: "task", score: 2, why: "" }], [...t, { i: 1, move: "repeated", why: "" }])).toBe("nearly");
  });
});

describe("rulesGrade", () => {
  it("grades the weak prompt not yet against the full rubric and fluent against task alone", () => {
    expect(rulesGrade({ turns: [WEAK], rubric: { requires: ["task", "reader", "format", "length", "constraints"], goal: "" }, followUp: true }).verdict).toBe("notyet");
    expect(rulesGrade({ turns: [WEAK], rubric: { requires: ["task"], goal: "" }, followUp: true }).verdict).toBe("fluent");
    expect(rulesGrade({ turns: [FLUENT], rubric: { requires: ["task", "reader", "format", "length", "constraints"], goal: "" }, followUp: true }).verdict).toBe("fluent");
  });
});
