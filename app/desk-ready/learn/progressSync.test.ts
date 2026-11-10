import { describe, expect, it } from "vitest";
import { morningReport } from "../office/jobs/morningReport";
import { newerCopy } from "../office/store";
import { mergeDone } from "./progress";

/* The two decisions behind keeping Desk Ready on the learner's account:
 * which finished ids come down and which go up, and which copy of a job's
 * office wins when this browser and the account disagree. */

describe("syncing finished lessons and jobs", () => {
  it("keeps everything finished anywhere, and sends up only what the account lacks", () => {
    expect(mergeDone(["m0t1", "m2t1"], ["m2t1", "m5j1"])).toEqual({ here: ["m0t1", "m2t1", "m5j1"], up: ["m0t1"] });
  });
  it("does nothing when they already agree", () => {
    expect(mergeDone(["m1t1"], ["m1t1"])).toEqual({ here: ["m1t1"], up: [] });
  });
  it("brings a new computer up to date", () => {
    expect(mergeDone([], ["m1t1", "m1t2"])).toEqual({ here: ["m1t1", "m1t2"], up: [] });
  });
});

describe("which office copy wins", () => {
  const seed = { ...morningReport.seed(), version: 1 };
  it("takes the account's copy when it is newer", () => {
    expect(newerCopy({ ...seed, savedAt: 100 }, { ...seed, savedAt: 200 }, true)).toBe("down");
    expect(newerCopy(seed, { ...seed, savedAt: 5 }, true)).toBe("down");
  });
  it("sends this browser's copy up when it is newer and signed in", () => {
    expect(newerCopy({ ...seed, savedAt: 300 }, { ...seed, savedAt: 200 }, true)).toBe("up");
    expect(newerCopy({ ...seed, savedAt: 300 }, null, true)).toBe("up");
  });
  it("leaves things alone when signed out, untouched, or the account's copy is damaged", () => {
    expect(newerCopy({ ...seed, savedAt: 300 }, null, false)).toBe(null);
    expect(newerCopy(seed, null, true)).toBe(null);
    expect(newerCopy({ ...seed, savedAt: 300 }, { savedAt: 999, files: "nope" }, true)).toBe("up");
  });
});
