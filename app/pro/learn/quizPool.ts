import type { QuizQuestion, WeekManifest } from "./types";

/* The "Test me" question pool.
 *
 * Questions live inside the lesson manifests, which also pull in the heavy
 * interactive lab components, so we never import them all up front. Instead
 * we dynamically import only the modules the learner has actually covered,
 * when they open Test Me, and collect those topics' quiz questions.
 *
 * Module 3's content lives in week01; Module 18 is the Code Lab and has no
 * quiz, so it has no loader. */

const LOADERS: Record<number, () => Promise<{ default: WeekManifest }>> = {
  1: () => import("../lessons/module01"),
  2: () => import("../lessons/module02"),
  3: () => import("../lessons/week01"),
  4: () => import("../lessons/module04"),
  5: () => import("../lessons/module05"),
  6: () => import("../lessons/module06"),
  7: () => import("../lessons/module07"),
  8: () => import("../lessons/module08"),
  9: () => import("../lessons/module09"),
  10: () => import("../lessons/module10"),
  11: () => import("../lessons/module11"),
  12: () => import("../lessons/module12"),
  13: () => import("../lessons/module13"),
  14: () => import("../lessons/module14"),
  15: () => import("../lessons/module15"),
  16: () => import("../lessons/module16"),
  17: () => import("../lessons/module17"),
  19: () => import("../lessons/module19"),
  20: () => import("../lessons/module20"),
  21: () => import("../lessons/module21"),
};

export type PoolQuestion = QuizQuestion & {
  moduleN: number;
  moduleTitle: string;
  topicTitle: string;
  topicId: string;
  /* Display order for this question's options (indices into `options`). */
  order: number[];
};

/* Which module a topic id belongs to: "m7t3" -> 7, "w1t2" -> 3 (Module 3). */
export function moduleOfTopic(id: string): number | null {
  if (/^w1t\d+$/.test(id)) return 3;
  const m = id.match(/^m(\d+)t\d+$/);
  return m && LOADERS[Number(m[1])] ? Number(m[1]) : null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Build a shuffled test from the topics the learner has finished. With none
 * finished yet, fall back to Module 1 so a new learner can still try (flagged
 * `starter`). `count` caps how many questions the test holds. */
export async function buildTest(doneTopicIds: string[], count = 10): Promise<{ questions: PoolQuestion[]; starter: boolean }> {
  const doneSet = new Set(doneTopicIds);
  let moduleNs = [...new Set(doneTopicIds.map(moduleOfTopic).filter((n): n is number => n !== null))];
  const starter = moduleNs.length === 0;
  if (starter) moduleNs = [1];

  const mods = await Promise.all(
    moduleNs.map(async (n) => ({ n, m: (await LOADERS[n]()).default })),
  );

  const pool: PoolQuestion[] = [];
  for (const { n, m } of mods) {
    for (const t of m.topics) {
      if (!starter && !doneSet.has(t.id)) continue;
      for (const q of t.check.quiz) {
        pool.push({ ...q, moduleN: n, moduleTitle: m.title, topicTitle: t.title, topicId: t.id, order: shuffle(q.options.map((_, i) => i)) });
      }
    }
  }
  return { questions: shuffle(pool).slice(0, count), starter };
}
