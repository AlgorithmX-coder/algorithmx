import { beforeEach, describe, expect, it, vi } from "vitest";

/* With Module 8 out, every Cyber Awareness module is released, so a
 * learner who finishes all eight must have their enrolment marked
 * complete. completeIfFinished (app/lib/aiCleared.ts) refuses a course
 * that still has unreleased modules; this checks that, with the real
 * module list, it now completes Cyber Awareness at eight of eight and not
 * before. The database is stubbed: these check what the function does with
 * the rows it reads and what it writes. */

const db = vi.hoisted(() => ({
  enrolment: { findUnique: vi.fn(), update: vi.fn() },
  moduleProgress: { findMany: vi.fn() },
}));
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));

import { completeIfFinished, saveScreen } from "@/app/lib/aiCleared";
import { AWARENESS_MODULE_LIST } from "./manifests";

const done = (n: number, score = 5) => ({ module: n, completedAt: new Date("2026-11-09T10:00:00Z"), proveScore: score, proveTotal: 5 });

describe("Cyber Awareness course completion", () => {
  beforeEach(() => {
    db.enrolment.findUnique.mockReset().mockResolvedValue({ product: { slug: "cyber-awareness" } });
    db.enrolment.update.mockReset().mockResolvedValue({});
    db.moduleProgress.findMany.mockReset();
  });

  it("has every module released", () => {
    expect(AWARENESS_MODULE_LIST.map((m) => m.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(AWARENESS_MODULE_LIST.every((m) => m.available)).toBe(true);
  });

  it("marks the enrolment complete once Modules 1 to 8 are all done", async () => {
    db.moduleProgress.findMany.mockResolvedValue([1, 2, 3, 4, 5, 6, 7].map((n) => done(n)).concat(done(8, 4)));
    expect(await completeIfFinished("e1")).toBe(true);
    expect(db.enrolment.update).toHaveBeenCalledTimes(1);
    const arg = db.enrolment.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "e1" });
    expect(arg.data.completedAt).toBeInstanceOf(Date);
    /* The course's "final" module is Module 8: its score is the one recorded. */
    expect(arg.data.finalScore).toBe(80);
  });

  it("does not complete with any one module still to do", async () => {
    for (const missing of [1, 4, 8]) {
      db.enrolment.update.mockClear();
      db.moduleProgress.findMany.mockResolvedValue([1, 2, 3, 4, 5, 6, 7, 8].filter((n) => n !== missing).map((n) => done(n)));
      expect(await completeIfFinished("e1"), `module ${missing} missing`).toBe(false);
      expect(db.enrolment.update).not.toHaveBeenCalled();
    }
  });

  it("does not complete on a module that was started but not passed", async () => {
    db.moduleProgress.findMany.mockResolvedValue([1, 2, 3, 4, 5, 6, 7].map((n) => done(n)).concat({ module: 8, completedAt: null, proveScore: 2, proveTotal: 5 } as never));
    expect(await completeIfFinished("e1")).toBe(false);
    expect(db.enrolment.update).not.toHaveBeenCalled();
  });

  it("passing Module 8 last, through the progress save, completes the course", async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const findUnique = vi.fn().mockResolvedValue(null);
    Object.assign(db.moduleProgress, { upsert, findUnique });
    db.moduleProgress.findMany.mockResolvedValue([1, 2, 3, 4, 5, 6, 7].map((n) => done(n)).concat(done(8)));
    await saveScreen({ enrolmentId: "e1", module: 8, phase: "done", screen: 20, proveScore: 5, proveTotal: 5, completed: true });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][0].create.completedAt).toBeInstanceOf(Date);
    expect(db.enrolment.update).toHaveBeenCalledTimes(1);
    expect(db.enrolment.update.mock.calls[0][0].data.completedAt).toBeInstanceOf(Date);
  });
});
