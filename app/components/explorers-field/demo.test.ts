import { describe, expect, it } from "vitest";
import { demoStatus, findTell, isDone, remainingTells, TELL_COUNT, TELL_IDS } from "./demo";

describe("the tap-the-three-tells demo", () => {
  it("has exactly three tells", () => {
    expect(TELL_COUNT).toBe(3);
    expect(new Set(TELL_IDS).size).toBe(3);
  });

  it("counts found tells and closes the case on the third", () => {
    let found: ReadonlyArray<string> = [];
    expect(demoStatus(found)).toBe("0 of 3 found");
    found = findTell(found, "pressure");
    expect(demoStatus(found)).toBe("1 of 3 found");
    found = findTell(found, "link");
    expect(isDone(found)).toBe(false);
    found = findTell(found, "sender");
    expect(isDone(found)).toBe(true);
    expect(demoStatus(found)).toBe("Case closed. Reported.");
  });

  it("ignores a repeat tap and an unknown id", () => {
    const once = findTell([], "sender");
    expect(findTell(once, "sender")).toBe(once);
    expect(findTell(once, "nope")).toBe(once);
  });

  it("reveals the remaining tells in reading order", () => {
    expect(remainingTells([])).toEqual(["sender", "pressure", "link"]);
    expect(remainingTells(["pressure"])).toEqual(["sender", "link"]);
    expect(remainingTells(TELL_IDS)).toEqual([]);
  });
});
