import Link from "next/link";
import { Icon } from "@/app/components/heroes-portal/HeroesShell";

/**
 * "Carry on with Week N", and every week within reach.
 *
 * WHY THIS EXISTS. A school pupil signing in lands on Cyber HQ, which is
 * the reward wall: badges, stickers, certificates, the wardrobe. All of it
 * is about what they have already done, and none of it was a way back into
 * a lesson. The only link to one appeared when a child had no stickers at
 * all, so the moment they finished week one it vanished, and a child in a
 * classroom was left on a trophy cabinet with nowhere to go.
 *
 * It sits directly under the title, above everything they have won, because
 * a lesson is forty minutes and the first thing on the screen should be the
 * thing they came to do.
 *
 * The weeks are not locked and never have been: a child can open any of
 * them, and a teacher sometimes sets one out of order. So every week is a
 * link, the finished ones are marked, and the next one is the one that
 * stands out.
 *
 * Drawn in the Cyber Heroes portal skin ("Lit Map", landing lab round 6):
 * the classes live in heroes-portal.css, under the page's HeroesShell.
 */
export default function CarryOn({
  nextWeek,
  completedWeeks,
  totalWeeks,
}: {
  /** Null once every week is finished. */
  nextWeek: number | null;
  completedWeeks: number[];
  totalWeeks: number;
}) {
  const done = new Set(completedWeeks);
  const fresh = done.size === 0;

  return (
    <section className="hlm-card lit hq-carry" aria-labelledby="hq-carry-h" data-rise>
      <div className="top">
        <div>
          <h2 id="hq-carry-h">
            {nextWeek === null
              ? "You have finished all " + totalWeeks + " weeks"
              : fresh
                ? "Ready to start?"
                : "Pick up where you left off"}
          </h2>
          <p>
            {nextWeek === null
              ? "Every mission is done. Go back to any week whenever you want to play it again."
              : `You have finished ${done.size} of ${totalWeeks} weeks.`}
          </p>
        </div>
        {nextWeek !== null && (
          <Link className="hlm-btn" href={`/lesson/${nextWeek}`}>
            {fresh ? `Start Week ${nextWeek}` : `Carry on with Week ${nextWeek}`} <Icon name="arr" />
          </Link>
        )}
      </div>

      <ol className="hq-weeks" aria-label="All weeks">
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
          const finished = done.has(week);
          const isNext = week === nextWeek;
          return (
            <li key={week}>
              <Link
                href={`/lesson/${week}`}
                data-s={isNext ? "here" : finished ? "done" : "todo"}
                aria-label={`Week ${week}${finished ? ", finished" : isNext ? ", carry on here" : ""}`}
              >
                {week}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
