import type { CSSProperties, ReactNode } from "react";
import { moduleListFor } from "@/app/lib/courseModules";
import CampusShell, { BackLink } from "@/app/components/campus-console/CampusShell";
import CorporateBrand from "@/app/corporate/CorporateBrand";
import { COURSES, type CourseSlug } from "../../engine/courses";
import SimPreview from "../../SimPreview";

/* The pieces both join pages share, the personal invite and the firm's
 * team link: the room (the Campus Console firm family), the right-hand
 * context, the rise-in helper and the arrow. */

export const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });
export const GO = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/* The room: the Cyber Secured lockup, the firm in the chrome, and the two
 * footer lines the old Frame carried. */
export function Room({ firmName, meta, two, children }: { firmName?: string; meta?: ReactNode; two?: boolean; children: ReactNode }) {
  return (
    <CampusShell
      family="firm"
      page="firm-join"
      lockup={<span className="r6-brand"><CorporateBrand /></span>}
      lockupHref="/corporate"
      lockupLabel="Cyber Secured by AlgorithmX"
      right={
        <>
          {meta}
          {firmName && <span className="r6-chip"><span className="dot" aria-hidden="true" />{firmName}</span>}
          <BackLink href="/corporate">Cyber Secured</BackLink>
        </>
      }
      width={two ? 1040 : 500}
      foot={
        <>
          <span>Nothing in the course is real data, and practice chats are never stored.</span>
          <span>Questions about your seat: <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a></span>
        </>
      }
    >
      {children}
    </CampusShell>
  );
}

/* The right-hand context, as the old CourseAside drew it: the firm and who
 * to ask, the course's modules with their minutes, and the live simulator
 * window they will practise in. */
export function Aside({ course, firmName, contactName, contactRole, learnerName }: { course: CourseSlug; firmName: string; contactName?: string | null; contactRole?: string | null; learnerName?: string }) {
  const list = moduleListFor(course);
  const total = list.reduce((a, m) => a + m.minutes, 0);
  return (
    <aside className="r6-aside" aria-label="Your firm and the course" {...rise(4)}>
      <div className="r6-card r6-firmcard">
        <span className="r6-avatar" aria-hidden="true">{firmName.slice(0, 1).toUpperCase()}</span>
        <span>
          <b>{firmName}</b>
          <small>{contactName ? `Ask ${contactName}${contactRole ? `, ${contactRole}` : ""}` : `Your firm's ${COURSES[course].name} programme`}</small>
        </span>
      </div>
      <div className="r6-card">
        <div className="r6-cardlabel">{WORDS[list.length] ?? list.length} modules · about {total} minutes</div>
        <ol className="r6-modules">
          {list.map((m) => (
            <li key={m.n}>
              <span className="r6-modn">{m.n}</span>
              <span className="r6-modt">{m.title}</span>
              <span className="r6-modm">{m.minutes} min</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <div className="r6-window sim" inert>
          <div className="r6-simscale"><SimPreview firmName={firmName} learnerName={learnerName ?? "you"} /></div>
        </div>
        <div className="r6-wcap">Where you practise: a copy of your firm&rsquo;s tool, on practice data</div>
      </div>
    </aside>
  );
}
