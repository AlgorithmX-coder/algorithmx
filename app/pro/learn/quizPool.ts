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

/* The topic ids the learner has finished: localStorage checkpoints merged
 * with the server record, read exactly the way the course hub reads them.
 * Client-only (touches localStorage and fetch); call it at runtime, not at
 * import. Shared by the full-page Test Me and the in-lesson one. */
export async function collectDoneTopicIds(): Promise<string[]> {
  const ids = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("pro:lesson:")) continue;
      try {
        const cp = JSON.parse(localStorage.getItem(k) || "null");
        if (cp && cp.phase === "done" && cp.id) ids.add(cp.id);
      } catch { /* skip a corrupt checkpoint */ }
    }
  } catch { /* localStorage unavailable */ }
  try {
    const res = await fetch("/api/pro/progress", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { done?: string[] };
      if (Array.isArray(data.done)) for (const id of data.done) ids.add(id);
    }
  } catch { /* local set stands */ }
  return [...ids];
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

/* Build a shuffled self-test for ONE module, for the in-lesson "Test me"
 * button that sits beside Notes. It pulls from the topics the learner has
 * finished in this module; if they have finished none yet, it falls back to
 * the whole module so the test is useful from the very first topic. Module 18
 * (Code Lab) has no quiz and no loader, so it yields an empty test. */
export async function buildModuleTest(
  moduleN: number,
  doneTopicIds: string[],
  count = 8,
): Promise<{ questions: PoolQuestion[]; moduleTitle: string; finishedOnly: boolean }> {
  const loader = LOADERS[moduleN];
  if (!loader) return { questions: [], moduleTitle: "", finishedOnly: false };
  const m = (await loader()).default;
  const doneSet = new Set(doneTopicIds);
  const finished = m.topics.filter((t) => doneSet.has(t.id));
  const finishedOnly = finished.length > 0;
  const topics = finishedOnly ? finished : m.topics;

  const pool: PoolQuestion[] = [];
  for (const t of topics) {
    for (const q of t.check.quiz) {
      pool.push({ ...q, moduleN, moduleTitle: m.title, topicTitle: t.title, topicId: t.id, order: shuffle(q.options.map((_, i) => i)) });
    }
  }
  return { questions: shuffle(pool).slice(0, count), moduleTitle: m.title, finishedOnly };
}
