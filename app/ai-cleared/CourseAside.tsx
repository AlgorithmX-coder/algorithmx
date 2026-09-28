import SimPreview from "./SimPreview";
import { MODULE_LIST } from "./manifests";

/* The right-hand context on the outer pages: the firm, the five modules
 * with their minutes, and (on the invite page) a look at the simulator
 * they will practise in. */
export default function CourseAside({
  firmName,
  contactName,
  contactRole,
  learnerName,
  done,
  showWindow,
  showModules = true,
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
}) {
  const total = MODULE_LIST.reduce((a, m) => a + m.minutes, 0);
  return (
    <>
      <div className="cf-card cf-firmcard">
        <span className="cf-avatar">{firmName.slice(0, 1).toUpperCase()}</span>
        <span>
          <b>{firmName}</b>
          <small>{contactName ? `Ask ${contactName}${contactRole ? `, ${contactRole}` : ""}` : "Your firm's AI Cleared programme"}</small>
        </span>
      </div>
      {showModules && (
      <div className="cf-card">
        <div className="cf-label">Five modules · about {total} minutes</div>
        <ol className="cf-modules">
          {MODULE_LIST.map((m) => {
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
