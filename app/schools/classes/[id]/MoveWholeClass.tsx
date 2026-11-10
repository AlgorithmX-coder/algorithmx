import { courseName } from "@/app/lib/schoolPlaces";
import type { WholeClassPlan } from "@/app/lib/schoolClasses";
import type { SchoolWords } from "../../words";
import { moveWholeClassAction } from "../class.actions";

/**
 * Move a whole class up, with the price on the option before it is chosen.
 *
 * SEPTEMBER. A year group finishing Cyber Heroes and starting Cyber
 * Explorers is one decision about thirty children, and the only tool for it
 * was a dropdown on every pupil row: thirty separate moves, any of which can
 * be refused when the licence runs out. A teacher doing that finds out what
 * the twenty-ninth child costs twenty-eight moves in.
 *
 * So every destination carries its own price, worked out before the page was
 * drawn, and one that the licence cannot cover is disabled rather than
 * offered and then refused.
 *
 * Props-in and markup-only, so it can be rendered with a made-up plan and
 * LOOKED at without a school, a licence or a database behind it.
 */
export default function MoveWholeClass({
  classId,
  plan,
  w,
}: {
  classId: string;
  plan: WholeClassPlan;
  w: SchoolWords;
}) {
  if (plan.pupils === 0 || plan.options.length === 0) return null;

  return (
    <div className="moveall">
      <h4>Move this whole {w.group} up</h4>
      <p>
        Moves all {plan.pupils} {plan.pupils === 1 ? w.person : w.people} into another {w.group} in
        one go, keeping their names, their pictures and everything they have finished. A {w.group}{" "}
        on the <b>same</b> course is free. A {w.group} on a <b>different</b> course uses one more
        place each, and the list below says how many before you choose. It is all or nothing: if
        the licence cannot cover it, nobody moves.
      </p>
      <form action={moveWholeClassAction}>
        <input type="hidden" name="classId" value={classId} />
        <select
          name="toClassId"
          defaultValue=""
          required
          aria-label={`Move the whole ${w.group} to`}
        >
          {/* The space before "to" is explicit. JSX drops the whitespace
              between an expression and the next line's text, and the first
              render of this read "Move all 28to...". */}
          <option value="" disabled>
            Move all {plan.pupils}
            {" to…"}
          </option>
          {plan.options.map((o) => (
            <option key={o.toClassId} value={o.toClassId} disabled={!o.affordable}>
              {o.toClassName} &middot; {courseName(o.toCourseSlug, o.toCourseName)}
              {o.placesNeeded === 0
                ? ", no extra places"
                : `, uses ${o.placesNeeded} place${o.placesNeeded === 1 ? "" : "s"}`}
              {o.affordable ? "" : " (not enough places left)"}
            </option>
          ))}
        </select>
        <button type="submit" className="axbtn">
          Move everyone
        </button>
      </form>
      <small>
        {plan.placesLeft} place{plan.placesLeft === 1 ? "" : "s"} left on your licence.
      </small>
    </div>
  );
}
