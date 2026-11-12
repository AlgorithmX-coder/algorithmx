import { describe, expect, it } from "vitest";
import type { DeskModule } from "../syllabus";
import { resumeAt } from "./resume";

const mod = (n: number, lessons: number): DeskModule => ({
  id: `m${n}`,
  number: n,
  title: `Module ${n}`,
  promise: "",
  topics: Array.from({ length: lessons }, (_, i) => `Lesson ${i + 1}`),
  ready: true,
});
const OPEN = [mod(0, 3), mod(1, 2), mod(10, 2), mod(11, 3), mod(12, 2)];
const at = (done: string[]) => {
  const r = resumeAt(OPEN, done);
  return r && `${r.module.id} lesson ${r.lesson + 1}`;
};

describe("Pick up where you left off", () => {
  it("starts at the first module when nothing is finished", () => {
    expect(at([])).toBe("m0 lesson 1");
  });
  it("carries on in the module last worked in, not the first unfinished one", () => {
    expect(at(["m11t1", "m11t2"])).toBe("m11 lesson 3");
  });
  it("moves to the next unfinished module after a finished one", () => {
    expect(at(["m11t1", "m11t2", "m11t3", "m11j1"])).toBe("m12 lesson 1");
  });
  it("wraps to the first unfinished module after the last one is finished", () => {
    expect(at(["m12t1", "m12t2"])).toBe("m0 lesson 1");
  });
  it("finds the first lesson left, even when lessons were done out of order", () => {
    expect(at(["m0t1", "m0t3"])).toBe("m0 lesson 2");
  });
  it("doesn't mistake Module 1 for Module 10 or 11", () => {
    expect(at(["m10t1"])).toBe("m10 lesson 2");
    expect(at(["m1t1"])).toBe("m1 lesson 2");
  });
  it("ignores ids that aren't lessons or jobs in an open module", () => {
    expect(at(["m11t1", "desk-final-morning", "m99t1"])).toBe("m11 lesson 2");
  });
  it("is null when every open lesson is done", () => {
    expect(resumeAt([mod(0, 1)], ["m0t1"])).toBeNull();
  });
});
