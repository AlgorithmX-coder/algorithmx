import { describe, it, expect } from "vitest";
import { STICKER_CATALOGUE } from "./stickers-data";
import { WEEK_CONTENT } from "@/app/lesson/weekContent";

/**
 * Cyber HQ shows what the catalogue says a child owns. The lesson shows what
 * the week file says they just earned. When those were two hand-written
 * lists they disagreed: week 1 awarded Password Protector, Key Master and
 * Secret Keeper, and the collection showed Password Master, Secret Keeper
 * and Phish Spotter - a week 4 sticker. These tests are what keeps them the
 * same list.
 */
describe("the sticker catalogue", () => {
  it("contains every sticker every week awards", () => {
    const authored = new Set<string>();
    for (const week of Object.values(WEEK_CONTENT)) {
      for (const screen of week.screens) {
        if (screen.type === "stickerUnlock") for (const s of screen.stickers) authored.add(s.id);
      }
    }
    const known = new Set(STICKER_CATALOGUE.map((s) => s.id));
    const missing = [...authored].filter((id) => !known.has(id));
    expect(missing, "a week awards these but Cyber HQ has never heard of them").toEqual([]);
  });

  it("invents nothing a week does not award", () => {
    const authored = new Set<string>();
    for (const week of Object.values(WEEK_CONTENT)) {
      for (const screen of week.screens) {
        if (screen.type === "stickerUnlock") for (const s of screen.stickers) authored.add(s.id);
      }
    }
    const extra = STICKER_CATALOGUE.filter((s) => !authored.has(s.id)).map((s) => s.id);
    expect(extra, "Cyber HQ offers these but no week awards them").toEqual([]);
  });

  it("gives every sticker the week that actually awards it", () => {
    for (const s of STICKER_CATALOGUE) {
      const week = WEEK_CONTENT[s.weekNumber];
      const awarded = week?.screens.some(
        (screen) => screen.type === "stickerUnlock" && screen.stickers.some((x) => x.id === s.id),
      );
      expect(awarded, `${s.id} is tagged week ${s.weekNumber}, which does not award it`).toBe(true);
    }
  });

  it("covers more than one week, so the collection is not stubbed", () => {
    const weeks = new Set(STICKER_CATALOGUE.map((s) => s.weekNumber));
    expect(weeks.size).toBeGreaterThan(1);
  });

  it("week 1's stickers all have their bespoke art", () => {
    const w1 = STICKER_CATALOGUE.filter((s) => s.weekNumber === 1);
    expect(w1.length).toBe(3);
    for (const s of w1) expect(s.art, `${s.id} has no art`).toMatch(/^\/cyberheroes\/stickers\/w01\/.+\.png$/);
  });
});
