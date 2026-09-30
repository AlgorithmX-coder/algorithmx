import SimPreview from "./SimPreview";
import { COURSES, type CourseSlug } from "./engine/courses";
import { moduleListFor } from "@/app/lib/courseModules";

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/* The right-hand context on the outer pages: the firm, the course's
 * modules with their minutes, and (on the invite page) a look at the
 * simulator they will practise in. */
export default function CourseAside({
  firmName,
  contactName,
  contactRole,
  learnerName,
  done,
  showWindow,
  showModules = true,
  course = "ai-cleared",
}: {
  firmName: string;
  contactName?: string | null;
  contactRole?: string | null;
  learnerName?: string;
  /* Module numbers already cleared. */
  done?: number[];
  showWindow?: boolean;
  /* Off on the course home, where the modules are the main content. */
  showModules?: boolean;
  course?: CourseSlug;
}) {
  const list = moduleListFor(course);
  const total = list.reduce((a, m) => a + m.minutes, 0);
  const c = COURSES[course];
  return (
    <>
      <div className="cf-card cf-firmcard">
        <span className="cf-avatar">{firmName.slice(0, 1).toUpperCase()}</span>
        <span>
          <b>{firmName}</b>
          <small>{contactName ? `Ask ${contactName}${contactRole ? `, ${contactRole}` : ""}` : `Your firm's ${c.name} programme`}</small>
        </span>
      </div>
      {showModules && (
      <div className="cf-card">
        <div className="cf-label">{WORDS[list.length] ?? list.length} modules · about {total} minutes</div>
        <ol className="cf-modules">
          {list.map((m) => {
            const isDone = done?.includes(m.n);
            return (
              <li key={m.n}>
                <span className={`cf-mod-n ${isDone ? "done" : ""}`}>{isDone ? "✓" : m.n}</span>
                <span className="cf-mod-t">{m.title}</span>
                <span className="cf-mod-m">{m.minutes} min</span>
              </li>
            );
          })}
        </ol>
      </div>
      )}
      {showWindow && (
        <div>
          <div className="cf-window">
            <SimPreview firmName={firmName} learnerName={learnerName ?? "you"} />
          </div>
          <div className="cf-window-cap">Where you practise: a copy of your firm&rsquo;s tool, on practice data</div>
        </div>
      )}
    </>
  );
}
