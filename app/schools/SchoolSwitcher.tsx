import type { SchoolChoice } from "@/app/lib/schoolChoice";
import { chooseSchool } from "./schoolChoice.actions";

/**
 * "You are looking at X. Switch to Y."
 *
 * Renders nothing at all for the ordinary case of one school, so a teacher
 * who will never see a second one is never shown a control about it.
 *
 * It matters most on the screens that BLOCK: a trial that has ended or an
 * account staff have closed takes over the whole page, and without this a
 * person whose other school is working would be stuck looking at the dead
 * one with no way out. So the switcher is rendered there too, which is the
 * one place it is not decoration.
 *
 * A plain form post, like every other control in this portal: one press,
 * no JavaScript needed, and the page comes back as the other school.
 */
export default function SchoolSwitcher({
  schools,
  currentOrgId,
}: {
  schools: SchoolChoice[];
  currentOrgId: string;
}) {
  const others = schools.filter((s) => s.orgId !== currentOrgId);
  if (others.length === 0) return null;

  return (
    <div className="switcher">
      <span>You are in {schools.find((s) => s.orgId === currentOrgId)?.name}.</span>{" "}
      {others.map((s) => (
        <form key={s.orgId} action={chooseSchool}>
          <input type="hidden" name="orgId" value={s.orgId} />
          <button type="submit" className="axbtn">
            Switch to {s.name}
            {s.live ? "" : " (lapsed)"}
          </button>
        </form>
      ))}
    </div>
  );
}
