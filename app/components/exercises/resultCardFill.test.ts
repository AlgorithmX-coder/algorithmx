import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * A finished exercise must not keep a whole game's worth of height.
 *
 * Owner, 2026-10-16, on the Memory Match result: "look at the bottom of that
 * card, it's not being filled in."
 *
 * The pattern that causes it: the engine's root fills the stage so the BOARD
 * has room, and the result is then rendered as an overlay pinned across that
 * root (position: absolute, inset: 0) with its content centred. The result is
 * a title, two lines and two buttons, so it floats in the middle of a card
 * sized for a game, with a dead band beneath it.
 *
 * This asserts the shape of the fix rather than the pixels: the board is
 * hidden when the game is over, the root stops filling the stage, and the
 * result sits in normal flow so the card is as tall as the result. A pixel
 * check needs the game played to completion, which the harness cannot
 * reliably do - see audit-result-card-fill.mjs.
 */
describe("Memory Match's finished card", () => {
  const src = readFileSync("app/components/exercises/MemoryMatch.tsx", "utf8");

  it("stops filling the stage once the game is over", () => {
    expect(src).toMatch(/height:\s*finished\s*\?\s*"auto"\s*:\s*"100%"/);
  });

  it("hides the board behind the result", () => {
    expect(src).toMatch(/display:\s*finished\s*\?\s*"none"\s*:\s*undefined/);
  });

  it("puts the result in normal flow, not pinned across the board", () => {
    const i = src.indexOf("function FinishOverlay");
    expect(i).toBeGreaterThan(-1);
    /* To the NEXT top-level function, not a fixed window - a fixed window
     * ran past the end of this component and into the next one, which has
     * an inset:0 backdrop of its own and is perfectly entitled to. */
    const rest = src.slice(i + 10);
    const offset = rest.search(/\r?\nfunction /);
    const next = offset >= 0 ? i + 10 + offset : src.length;
    /* Comments stripped first: the component's own comment explains why it
     * does NOT use inset:0, and matching that is the test marking its own
     * homework. */
    const body = src.slice(i, next)
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");
    expect(body, "the result overlay is still pinned with inset: 0").not.toMatch(/inset:\s*0/);
    expect(body).toMatch(/position:\s*"relative"/);
  });
});
