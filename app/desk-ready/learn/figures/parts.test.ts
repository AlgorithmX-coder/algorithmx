import { describe, expect, it } from "vitest";
import { bestScroll } from "./parts";

/* A phone shows 300px of a figure 800px wide, so it can scroll 0 to 500.
 * The cases come from the Module 10 review at 390px (2026-11-11). */
const view = 300;
const max = 500;
const shows = (x: number, sp: { left: number; right: number }) => sp.left >= x && sp.right <= x + view;

describe("bestScroll: where a wide figure opens on a phone", () => {
  it("centres on one narrow lit part, clear of the edge", () => {
    const part = { left: 400, right: 460 };
    const x = bestScroll([part], view, max);
    expect(shows(x, part)).toBe(true);
  });

  it("shows two lit parts together when they fit", () => {
    const a = { left: 300, right: 360 };
    const b = { left: 420, right: 480 };
    const x = bestScroll([a, b], view, max);
    expect(shows(x, a) && shows(x, b)).toBe(true);
  });

  it("prefers the right-hand part when two cannot fit (the PO number, not the supplier)", () => {
    const supplier = { left: 40, right: 200 };
    const poNumber = { left: 640, right: 760 };
    const x = bestScroll([supplier, poNumber], view, max);
    expect(shows(x, poNumber)).toBe(true);
  });

  it("lets a narrow column win over a full-width total row (Overtime, not the row's label)", () => {
    const totalRow = { left: 20, right: 780 };
    const overtime = { left: 660, right: 740 };
    const x = bestScroll([totalRow, overtime], view, max);
    expect(shows(x, overtime)).toBe(true);
  });

  it("opens at the start of a lit part wider than the screen, where its badge and label are", () => {
    const addressBar = { left: 120, right: 760 };
    expect(bestScroll([addressBar], view, max)).toBe(120 - 44);
  });

  it("opens at the first of several lit parts that are each too wide to show whole", () => {
    const from = { left: 100, right: 700 };
    const phone = { left: 100, right: 700 };
    const deliverTo = { left: 140, right: 760 };
    expect(bestScroll([from, phone, deliverTo], view, max)).toBe(100 - 44);
  });

  it("never scrolls past either end", () => {
    const x = bestScroll([{ left: 0, right: 10 }], view, max);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(bestScroll([{ left: 790, right: 800 }], view, max)).toBeLessThanOrEqual(max);
  });
});
