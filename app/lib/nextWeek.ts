/**
 * Which week a child opens next.
 *
 * The lowest week they have not finished. Weeks they have never touched do
 * not exist in the progress table at all, so "not in the list" and "not
 * finished" have to mean the same thing here, which is why this counts up
 * from week one rather than looking at what came back from the database.
 *
 * A pure function on purpose: it is the one piece of "where does this child
 * go next" that can be tested without a session, a child profile or a
 * database, and it is used by the screens a child lands on.
 */
export interface WeekDone {
  week: number;
  completed: boolean;
}

/** The default length of Cyber Heroes. Passed in where the caller knows it. */
export const HEROES_WEEKS = 20;

/**
 * The lowest unfinished week from 1 to `totalWeeks`, or null when every
 * week is finished. Null means "nothing left to carry on with", which the
 * screen says in words rather than sending the child round again.
 */
export function nextWeekFor(weeks: WeekDone[], totalWeeks: number = HEROES_WEEKS): number | null {
  const done = new Set(weeks.filter((w) => w.completed).map((w) => w.week));
  for (let week = 1; week <= totalWeeks; week++) {
    if (!done.has(week)) return week;
  }
  return null;
}
