import { describe, it, expect } from "vitest";
import { moveSpendsAPlace, placesNeededForWholeClass } from "./placeRule";

/**
 * Owner, 2026-11-09: "Follows the child but the seat can only be redeemed
 * for 1 course. If they finish that the school needs to use up another seat."
 *
 * Both halves matter and they pull in opposite directions, which is why they
 * are tested together. Lose the first and a school is charged for shuffling
 * form groups. Lose the second and a school teaches four courses on one
 * payment.
 */
/* Shared by both suites below: the per-child rule and the whole-class one
   have to be stated against the same two courses to be comparable. */
const HEROES = "prod_heroes";
const EXPLORERS = "prod_explorers";

describe("whether moving a pupil spends another place", () => {

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

/**
 * The same rule at class scale. This is the number a teacher sees before
 * they move a year group, and the number the licence check is made against,
 * so the two must be the same arithmetic. They are: one function.
 */
describe("what moving a whole class costs", () => {
  const classOf = (n: number) => Array.from({ length: n }, (_, i) => `child-${i}`);
  const nobodyHolds = () => null;

  it("costs nothing to move a year group between classes on the same course", () => {
    expect(
      placesNeededForWholeClass({
        pupilIds: classOf(30),
        fromProductId: HEROES,
        toProductId: HEROES,
        heldForTarget: nobodyHolds,
      }),
    ).toBe(0);
  });

  it("costs one place each to move a year group up a course", () => {
    expect(
      placesNeededForWholeClass({
        pupilIds: classOf(30),
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: nobodyHolds,
      }),
    ).toBe(30);
  });

  /* Children who did Explorers before and have come back already hold a
     place for it. Charging them again would bill the school twice for the
     same child on the same course. */
  it("does not charge for children who already hold a place on that course", () => {
    const already = new Set(["child-0", "child-1", "child-2"]);
    expect(
      placesNeededForWholeClass({
        pupilIds: classOf(10),
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: (id) => (already.has(id) ? { creditedBackAt: null } : null),
      }),
    ).toBe(7);
  });

  /* A place staff credited back has to be spent again, otherwise crediting
     one back would hand the school a free move for ever. */
  it("charges again for a place that was credited back", () => {
    expect(
      placesNeededForWholeClass({
        pupilIds: classOf(4),
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: () => ({ creditedBackAt: new Date("2026-07-01") }),
      }),
    ).toBe(4);
  });

  it("costs nothing to move an empty class anywhere", () => {
    expect(
      placesNeededForWholeClass({
        pupilIds: [],
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: nobodyHolds,
      }),
    ).toBe(0);
  });

  /* The whole-class number must be the per-child rule counted up, with no
     bulk discount and no rounding. If these two ever disagree, one of the
     screens is lying about money. */
  it("is exactly the per-child rule, counted", () => {
    const pupils = classOf(17);
    const held = (id: string) => (id === "child-5" ? { creditedBackAt: null } : null);
    const oneAtATime = pupils.filter((id) =>
      moveSpendsAPlace({
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: held(id),
      }),
    ).length;
    expect(
      placesNeededForWholeClass({
        pupilIds: pupils,
        fromProductId: HEROES,
        toProductId: EXPLORERS,
        heldForTarget: held,
      }),
    ).toBe(oneAtATime);
  });
});
