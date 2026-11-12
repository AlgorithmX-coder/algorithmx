import type { DeskModule } from "../syllabus";

/* Where "Pick up where you left off" sends a learner. The finished list is
 * kept in the order things were finished, so its last lesson or job says
 * where they really were: carry on in that module, or, once it's finished,
 * in the next unfinished module after it. A learner who jumps straight to
 * Module 11 is sent back to Module 11, not to Module 0. With nothing
 * finished yet, it's the first module. Null when every open lesson is done. */

const MODULE_OF = /^(m\d+)[tj]\d+$/;

/* The first lesson in a module that isn't finished, or -1. */
export function firstLeft(m: DeskModule, done: readonly string[]): number {
  return m.topics.findIndex((_, i) => !done.includes(`${m.id}t${i + 1}`));
}

export function resumeAt(open: readonly DeskModule[], done: readonly string[]): { module: DeskModule; lesson: number } | null {
  const unfinished = open.filter((m) => firstLeft(m, done) >= 0);
  if (!unfinished.length) return null;
  const last = [...done]
    .reverse()
    .map((id) => MODULE_OF.exec(id)?.[1])
    .find((id) => !!id && open.some((m) => m.id === id));
  const at = last ? open.findIndex((m) => m.id === last) : -1;
  const pick = (at >= 0 ? open.slice(at).find((m) => firstLeft(m, done) >= 0) : undefined) ?? unfinished[0];
  return { module: pick, lesson: firstLeft(pick, done) };
}
