import type { PupilProgress } from "@/app/lib/classProgress";

/**
 * One pupil, one line: where they are across the whole course.
 *
 * The same twenty-dot strip the parent view uses, because it reads at a
 * glance and a teacher scanning thirty of these needs exactly that. Colour
 * carries the state and so does the shape of the row, so the strip still
 * works for somebody who cannot tell the greens from the ambers.
 */
export default function ClassStrip({ pupil, weeksCount }: { pupil: PupilProgress; weeksCount: number }) {
  return (
    <div className="strip" aria-label={`${pupil.name}: ${pupil.weeksComplete} of ${weeksCount} weeks complete`}>
      {pupil.weeks.map((w) => (
        <span
          key={w.week}
          className={"pip " + w.state}
          /* a title is enough here: the row's own aria-label already carries
             the summary, and thirty pupils times twenty announced dots would
             make the page unusable with a screen reader */
          title={`Week ${w.week}: ${w.state === "done" ? `done, ${w.stars} stars` : w.state === "in_progress" ? "started" : "not started"}`}
        />
      ))}
    </div>
  );
}
