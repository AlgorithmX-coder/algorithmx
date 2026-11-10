import { describe, it, expect } from "vitest";
import { nextWeekFor, HEROES_WEEKS } from "./nextWeek";

/**
 * A child in a classroom gets one screen and about thirty seconds of
 * patience. Everything here is about them landing on something that says
 * where to go next, so the cases that matter are the awkward ones: a fresh
 * child with no rows at all, a child who skipped ahead, and a child who has
 * finished everything.
 */
describe("the week a child opens next", () => {
  it("is week 1 for a child who has never played", () => {
    expect(nextWeekFor([])).toBe(1);
  });

  it("is the week after the ones they have finished", () => {
    const weeks = [1, 2, 3].map((week) => ({ week, completed: true }));
    expect(nextWeekFor(weeks)).toBe(4);
  });

  /* A week that is open but not finished is still the week to carry on
     with. Sending them past it would quietly abandon half a lesson. */
  it("is the week they are part way through", () => {
    expect(
      nextWeekFor([
        { week: 1, completed: true },
        { week: 2, completed: false },
      ]),
    ).toBe(2);
  });

  /* Weeks are not locked: a child can open any of them, and some do. The
     gap is still what they should go back to. */
  it("is the gap they left behind, not the furthest they reached", () => {
    expect(
      nextWeekFor([
        { week: 1, completed: true },
        { week: 2, completed: false },
        { week: 7, completed: true },
      ]),
    ).toBe(2);
  });

  it("is nothing at all once every week is finished", () => {
    const all = Array.from({ length: HEROES_WEEKS }, (_, i) => ({ week: i + 1, completed: true }));
    expect(nextWeekFor(all)).toBeNull();
  });

  /* Explorers and Ops run to their own lengths, and the screen passes the
     real number rather than assuming twenty. */
  it("respects a course that is not twenty weeks long", () => {
    const all = Array.from({ length: 6 }, (_, i) => ({ week: i + 1, completed: true }));
    expect(nextWeekFor(all, 6)).toBeNull();
    expect(nextWeekFor(all, 8)).toBe(7);
  });

  /* A row for a week beyond the course, left over from an older version of
     the content, must not make the child look finished. */
  it("ignores a finished week that is outside the course", () => {
    expect(nextWeekFor([{ week: 99, completed: true }], 3)).toBe(1);
  });
});
