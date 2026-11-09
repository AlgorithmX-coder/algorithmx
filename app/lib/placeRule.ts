/**
 * What a place buys, as one function with no database in it.
 *
 * Owner, 2026-11-09: a place is one child on ONE course. It follows the
 * child, so moving them between classes of the course they are already on is
 * free, and starting them on a second course spends a second place.
 *
 * This is a commercial rule, which means it is the kind of thing that gets
 * quietly inverted by a later refactor and nobody notices until a school is
 * either billed twice or given a year free. So it lives here, on its own,
 * where a test can state all four cases in plain terms, rather than inside
 * movePupil among the queries.
 *
 * It settles a disagreement between two earlier rulings. One said a place was
 * the child outright, so moving up a course was free for ever. The other said
 * a place was the child on one course, so moving spent another. This is the
 * second, keeping the "follows the child" half of the first.
 */
export function moveSpendsAPlace(args: {
  /** The course the pupil is on now. Null if their class has somehow none. */
  fromProductId: string | null | undefined;
  /** The course of the class they are moving to. */
  toProductId: string;
  /**
   * The ledger row this pupil already has for the TARGET course, if any.
   * Two ways one exists: they were on that course before and have come back,
   * or staff credited that place back. A credited-back place has to be spent
   * again; an active one must never be charged twice.
   */
  heldForTarget?: { creditedBackAt: Date | null } | null;
}): boolean {
  if (args.fromProductId === args.toProductId) return false;
  const held = args.heldForTarget;
  if (!held) return true;
  return held.creditedBackAt !== null;
}
