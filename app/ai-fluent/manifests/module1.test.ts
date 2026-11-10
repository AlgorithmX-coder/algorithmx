import { describe, expect, it } from "vitest";
import { DEFAULT_FIRM, fill, type LearnCard } from "@/app/ai-cleared/engine/types";
import { FLUENT_MODULE_1 } from "./module1";

/* The tracks of Cyber Secured run in any order, so a learner can open AI
 * Fluent without AI Cleared. Module 1 recaps Cleared's safety rules near
 * the start, before the first practical work: a reminder, never a gate.
 * The rules resolve for every firm, and no em-dash, emoji or backslash
 * reaches a learner. */

const learn = FLUENT_MODULE_1.learn;
const recapAt = learn.findIndex((s) => s.kind === "cards" && s.eyebrow.includes("safety rules in brief"));
const recap = learn[recapAt];
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const BACKSLASH = String.fromCharCode(92);

describe("AI Fluent module 1, the safety rules in brief", () => {
  it("comes straight after the intro, before any practical work", () => {
    expect(recapAt).toBe(1);
    expect(learn[0].kind).toBe("intro");
  });

  it("is a reminder, not a gate: static cards, nothing to open or answer", () => {
    expect(recap.kind).toBe("cards");
    if (recap.kind !== "cards") return;
    expect(recap.reveal).toBeFalsy();
    expect(recap.source).toBeUndefined();
    const cards = recap.cards as LearnCard[];
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.length).toBeLessThanOrEqual(6);
    for (const c of cards) expect(c.detail, `${c.title}: nothing hidden`).toBeUndefined();
  });

  it("points to AI Cleared for the full version, in any order", () => {
    if (recap.kind !== "cards") return;
    expect(recap.note).toContain("AI Cleared covers these in full, in any order");
  });

  it("stays under a minute to read, at a slow 200 words a minute", () => {
    if (recap.kind !== "cards") return;
    const read = [recap.heading, recap.lead, ...(recap.cards ?? []).flatMap((c) => [c.title, c.body]), recap.note];
    const words = read.join(" ").split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(200);
  });

  it("resolves every placeholder for a firm with its own names", () => {
    const firm = { ...DEFAULT_FIRM, name: "Marlow Fenwick LLP", contactName: "Priya Nair", classNames: { P: "OPEN", I: "STAFF ONLY", C: "CLIENT", R: "SECRET" } };
    const text = fill(strings(recap).join("\n"), { firm, tool: "copilot" });
    expect(text).not.toMatch(/\{\{/);
    expect(text).toContain("SECRET never goes in");
    expect(text).toContain("CLIENT goes in as placeholders");
    expect(text).toContain("Tell Priya Nair today");
    expect(text).toContain(firm.approvedTools[0]);
  });

  it("keeps the house rules in the module's learn and prove copy", () => {
    const prove = Object.values(FLUENT_MODULE_1.tracks).map((b) => b?.prove);
    const all = strings([FLUENT_MODULE_1.learn, prove]).join("\n");
    expect(all.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(all).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(all).not.toContain(BACKSLASH);
  });
});
