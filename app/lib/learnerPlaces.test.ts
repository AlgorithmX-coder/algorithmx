import { describe, it, expect } from "vitest";
import {
  BLOCK_FIRST_PENCE,
  BLOCK_FURTHER_PENCE,
  MAX_BLOCKS,
  PLACES_PER_BLOCK,
  placesPricePence,
  validateBlocks,
} from "./learnerPlaces";

/* The published ladder (owner, settled 2026-10-13): £2,500 for the first
   fifty places, £2,250 for every further fifty. These are the numbers a rep
   quotes out loud and the numbers on the proposal PDF, so they are pinned
   here rather than left to be re-derived. */

describe("placesPricePence", () => {
  it("charges the published ladder", () => {
    expect(placesPricePence(1)).toBe(250_000); //  50 places, £2,500
    expect(placesPricePence(2)).toBe(475_000); // 100 places, £4,750
    expect(placesPricePence(3)).toBe(700_000); // 150 places, £7,000
    expect(placesPricePence(4)).toBe(925_000); // 200 places, £9,250
  });

  it("only the FIRST block costs the higher rate", () => {
    for (let b = 2; b <= MAX_BLOCKS; b++) {
      expect(placesPricePence(b) - placesPricePence(b - 1)).toBe(BLOCK_FURTHER_PENCE);
    }
    expect(placesPricePence(1)).toBe(BLOCK_FIRST_PENCE);
  });

  /* Buying more must never cost less. The corporate side shipped exactly
     this bug: AI Fluent at 40 seats cost more than at 50. */
  it("never gets cheaper as you buy more", () => {
    for (let b = 2; b <= MAX_BLOCKS; b++) {
      expect(placesPricePence(b)).toBeGreaterThan(placesPricePence(b - 1));
    }
  });

  it("gives nothing away for a nonsense count", () => {
    expect(placesPricePence(0)).toBe(0);
    expect(placesPricePence(-3)).toBe(0);
    expect(placesPricePence(1.5)).toBe(0);
  });
});

describe("validateBlocks", () => {
  it("accepts one block up to the ceiling", () => {
    expect(validateBlocks(1)).toBeNull();
    expect(validateBlocks(MAX_BLOCKS)).toBeNull();
  });

  it("refuses less than a block, a fraction, and past the ceiling", () => {
    expect(validateBlocks(0)).toContain(`${PLACES_PER_BLOCK} places`);
    expect(validateBlocks(2.5)).not.toBeNull();
    expect(validateBlocks(MAX_BLOCKS + 1)).toContain("quote");
  });
});
