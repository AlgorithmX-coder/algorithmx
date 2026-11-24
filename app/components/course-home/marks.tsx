/* Course marks for the Night Console course homes: the Explorers reticle, the
 * Ops scope and the "by AlgorithmX" byline cube (as the course auth pages). */

export function ByCube() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="#5f8dff" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 2.5 21 7.25v9.5L12 21.5 3 16.75v-9.5z" /><path d="M3 7.25 12 12l9-4.75M12 12v9.5" /></g><text x="12" y="10.4" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="5.2" fontWeight="700" fill="#5f8dff">&lt;/&gt;</text></svg>
  );
}

export function ExplorersMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.8" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="6.4" /><path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" /><circle cx="12" cy="12" r="1.6" fill="var(--acc)" stroke="none" />
    </svg>
  );
}

export function OpsMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M3.4 7.4 V3.4 H7.4 M16.6 3.4 H20.6 V7.4 M20.6 16.6 V20.6 H16.6 M7.4 20.6 H3.4 V16.6" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.4" /><circle cx="12" cy="12" r="2.9" strokeWidth="1" opacity="0.5" />
      <path d="M12 4.8 V7 M12 17 V19.2 M4.8 12 H7 M17 12 H19.2" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.2" fill="var(--acc)" stroke="none" />
    </svg>
  );
}

/** The course lockup as a mark, not a link: these homes are the learner's own
 * screens, so the mark does not send a child to a sales page. */
export function CourseHomeLockup({ mark, lead, accent, label }: { mark: React.ReactNode; lead: string; accent: string; label: string }) {
  return (
    <span className="ch6-lockup" role="img" aria-label={label}>
      {mark}
      <span className="lk-col" aria-hidden="true"><span className="lk-name">{lead} <b>{accent}</b></span><span className="lk-by"><span className="dim">by</span><ByCube /><span className="dim">AlgorithmX</span></span></span>
    </span>
  );
}
