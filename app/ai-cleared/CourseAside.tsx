import SimPreview from "./SimPreview";
import { COURSES, type CourseSlug } from "./engine/courses";
import { K } from "./engine/tokens";
import { moduleListFor } from "@/app/lib/courseModules";

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/* The right-hand context on the outer pages: the firm, the course's
 * modules with their minutes, a look at the simulator they will practise
 * in, or (Cyber Awareness home) who to tell when something goes wrong. */
export default function CourseAside({
  firmName,
  contactName,
  contactRole,
  learnerName,
  done,
  showWindow,
  showModules = true,
  showReport,
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
  /* The internal reporting route, in Module 8's words: on the home of a
   * course with no desk practice (Cyber Awareness), in place of the tool. */
  showReport?: boolean;
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
      {showReport && (
        <div className="cf-card">
          <div className="cf-label">If something goes wrong</div>
          <p style={{ margin: "0 0 8px", fontSize: 15, lineHeight: 1.5, color: K.ink }}>
            Tell {contactName ? <b>{contactName}</b> : "your firm's named contact"} straight away, by phone or in person.
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: K.muted }}>Nobody is blamed for reporting, even a false alarm.</p>
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
