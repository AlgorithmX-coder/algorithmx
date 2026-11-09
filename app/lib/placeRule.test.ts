import { describe, it, expect } from "vitest";
import { moveSpendsAPlace } from "./placeRule";

/**
 * Owner, 2026-11-09: "Follows the child but the seat can only be redeemed
 * for 1 course. If they finish that the school needs to use up another seat."
 *
 * Both halves matter and they pull in opposite directions, which is why they
 * are tested together. Lose the first and a school is charged for shuffling
 * form groups. Lose the second and a school teaches four courses on one
 * payment.
 */
describe("whether moving a pupil spends another place", () => {
  const HEROES = "prod_heroes";
  const EXPLORERS = "prod_explorers";

  it("is free between classes on the same course", () => {
    expect(moveSpendsAPlace({ fromProductId: HEROES, toProductId: HEROES })).toBe(false);
  });

  it("costs a place when the course changes", () => {
    expect(moveSpendsAPlace({ fromProductId: HEROES, toProductId: EXPLORERS })).toBe(true);
  });

  it("does not charge twice for a course they already hold", () => {
    expect(
      moveSpendsAPlace({
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: { creditedBackAt: null },
      }),
    ).toBe(false);
  });

  /**
   * A place staff credited back went into the pool and somebody else may
   * have spent it. Coming back to that course is therefore a fresh spend,
   * not a free ride on a row that happens to still be in the table.
   */
  it("charges again for a place that was credited back", () => {
    expect(
      moveSpendsAPlace({
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: { creditedBackAt: new Date("2026-07-20") },
      }),
    ).toBe(true);
  });

  it("treats a pupil with no current course as moving onto a course", () => {
    expect(moveSpendsAPlace({ fromProductId: null, toProductId: HEROES })).toBe(true);
    expect(moveSpendsAPlace({ fromProductId: undefined, toProductId: HEROES })).toBe(true);
  });

  /**
   * The September case the whole rule exists for: a year group moving up
   * from Heroes to Explorers costs one place each, and shuffling the same
   * year group between two Heroes classes costs nothing.
   */
  it("prices a September the way the owner described it", () => {
    const yearGroup = Array.from({ length: 30 }, () => HEROES);
    const movingUp = yearGroup.filter((from) =>
      moveSpendsAPlace({ fromProductId: from, toProductId: EXPLORERS }),
    ).length;
    const shuffling = yearGroup.filter((from) =>
      moveSpendsAPlace({ fromProductId: from, toProductId: HEROES }),
    ).length;
    expect(movingUp).toBe(30);
    expect(shuffling).toBe(0);
  });
});
