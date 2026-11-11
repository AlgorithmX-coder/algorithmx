import { describe, expect, it } from "vitest";
import { DESK_ITEM, moduleOfItem } from "./deskProgress";

/* The id rules that guard /api/desk/progress and /api/desk/office: only
 * Desk Ready's own lesson ("m2t1") and job ("m5j1") ids get stored, so a
 * client can't write anything else into the tables. */

describe("Desk Ready progress ids", () => {
  it("accepts lessons and jobs in modules 0 to 13", () => {
    for (const id of ["m0t1", "m2t5", "m5j1", "m10t3", "m13t12", "m6j3"]) expect(DESK_ITEM.test(id)).toBe(true);
  });
  it("accepts the final task's job", () => {
    expect(DESK_ITEM.test("finalj1")).toBe(true);
    for (const id of ["final", "finalj", "finalx1", "xfinalj1", "finalj123"]) expect(DESK_ITEM.test(id)).toBe(false);
  });
  it("refuses anything else", () => {
    for (const id of ["m14t1", "x2t1", "m2", "m2t", "m2t123", "module-06", "m2t1; drop", "", "m1t1 "]) expect(DESK_ITEM.test(id)).toBe(false);
  });
  it("finds the module an id belongs to", () => {
    expect(moduleOfItem("m5j1")).toBe("m5");
    expect(moduleOfItem("m10t3")).toBe("m10");
    expect(moduleOfItem("m1t12")).toBe("m1");
    expect(moduleOfItem("finalj1")).toBe("final");
  });
});
