import type { Metadata } from "next";
import { requireCourse } from "@/app/lib/courseAccess";
import Link from "next/link";
import { getPortfolio, getOpsResumes } from "@/app/lib/opsPortfolio.actions";
import { HIGHEST_BUILT_MODULE } from "@/app/operators/range/modules";
import { CURRICULUM, PHASE_ORDER, PHASE_COLOR } from "@/app/operators/range/curriculum";
import { OPS_RANKS } from "@/app/lib/opsRank";
import CourseHomeShell, { CourseHomePause } from "@/app/components/course-home/CourseHomeShell";
import { CourseHomeLockup, OpsMark } from "@/app/components/course-home/marks";

export const metadata: Metadata = {
  title: "Cyber Ops · Portfolio",
  robots: { index: false, follow: false },
};

/* The Cyber Ops home (URL is legacy): "Redoubt · Operator file", landing lab
 * round 6, homes-a ops v1 DARK (owner 2026-11-23). The first screen resumes:
 * where you are, what is next, one big Resume, your standing and your latest
 * finding; the full posting and every finding filed sit below. Every number,
 * module, beat and finding is the learner's own (getPortfolio, getOpsResumes);
 * the auth redirect, links and the empty state are as before. */

/* The six beats of a module, in order (the Engagement shell's resume beats). */
const BEATS: Array<[string, string]> = [["lesson", "Lesson"], ["authorize", "Scope"], ["act", "Capture"], ["drills", "Drills"], ["challenge", "Challenge"], ["defend", "Defend"]];
const BEAT_LABEL = Object.fromEntries(BEATS) as Record<string, string>;

const SEV_COLOR: Record<string, string> = { LOW: "var(--body)", MEDIUM: "var(--amber)", HIGH: "var(--red)", CRITICAL: "var(--red)" };
const SEV_LABEL: Record<string, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" };
const pad = (n: number) => String(n).padStart(2, "0");
type V = React.CSSProperties & Record<`--${string}`, string | number>;

const Arrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Tick = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>;

export default async function OperatorsPortfolioPage() {
  /* A portfolio is this learner's own findings and rank: no more public
     than the modules that wrote it. */
  await requireCourse("cyberstart", "/operators/portfolio");

  const [p, resumes] = await Promise.all([getPortfolio(), getOpsResumes()]);
  const findings = p?.findings ?? [];
  const rank = p?.rank;
  const rankName = rank?.rank ?? "Recruit";
  const rep = p?.totalRep ?? 0;
  const callsign = p?.callsign ?? null;
  const done = new Set(findings.map((f) => f.module));
  const nextModule = CURRICULUM.find((m) => !done.has(m.no) && m.no <= HIGHEST_BUILT_MODULE)?.no ?? null;
  const titleOf = new Map(CURRICULUM.map((m) => [m.no, m] as const));

  /* "Continue where you left off": the account's in-progress modules (as the
   * old ResumeStrip listed them). The first not yet cleared leads the card;
   * any others stay one tap away under it. With nothing in progress the card
   * shows the next module to start instead. */
  const rows = resumes.filter((r) => BEAT_LABEL[r.beat] && titleOf.has(r.module));
  const lead = rows.find((r) => !done.has(r.module)) ?? rows[0] ?? null;
  const others = rows.filter((r) => r !== lead);
  const focusNo = lead?.module ?? nextModule;
  const focus = focusNo ? titleOf.get(focusNo) ?? null : null;
  const beatI = lead ? BEATS.findIndex((b) => b[0] === lead.beat) : -1;

  const tier = Math.max(0, OPS_RANKS.findIndex((r) => r.name === rankName));
  const pct = Math.round((rank?.fraction ?? 0) * 100);
  const latest = findings[findings.length - 1];
  const continueHref = `/operators/play/${Math.min(HIGHEST_BUILT_MODULE, (findings[findings.length - 1]?.module ?? 0) + 1)}`;

  return (
    <CourseHomeShell course="ops">
      <header className="ch6-chrome wrap" data-rise style={{ "--i": 0 } as V}>
        <CourseHomeLockup mark={<OpsMark />} lead="CYBER" accent="OPS" label="Cyber Ops by AlgorithmX" />
        <div className="ch6-chrome-r">
          {callsign ? <span className="ch6-who"><i className="dot" aria-hidden="true" /><b>{callsign}</b><span className="hide">&nbsp;· {rankName}</span></span> : <span className="ch6-who"><i className="dot" aria-hidden="true" /><b>{rankName}</b></span>}
          <CourseHomePause />
        </div>
      </header>
      <main className="ch6-main wrap" id="main">
        <section className="ch6-now" aria-labelledby="ch6-h1">
          <div className="ch6-console" data-rise style={{ "--i": 1 } as V}>
            <i className="ch6-corner tl" aria-hidden="true" /><i className="ch6-corner tr" aria-hidden="true" /><i className="ch6-corner bl" aria-hidden="true" /><i className="ch6-corner br" aria-hidden="true" />
            <div className="ch6-fbar"><span className="fname">Redoubt · Operator file</span>{callsign && <span>{callsign}</span>}<span className="fstat" role="status"><i aria-hidden="true" />Saved to your account</span></div>
            <div className="ch6-grid">
              <div>
                <h1 className="ch6-h1" id="ch6-h1" data-rise style={{ "--i": 2 } as V}>Your portfolio</h1>
                <p className="ch6-lede" data-rise style={{ "--i": 3 } as V}>Every module you clear files a professional-grade finding here. This is the real thing you walk away with: show a teacher, a UCAS form, or a first employer.</p>
                {focus && (
                  <div className="ch6-next" style={{ "--nx": "var(--cyan)", "--i": 4 } as V} data-rise>
                    <div className="ch6-next-head">
                      <span className="ch6-chip" style={{ color: "var(--cyan)", borderColor: "rgba(var(--cyan-rgb),.6)" }}>{lead ? "Continue where you left off" : "Start here"}</span>
                      <span className="ch6-chip c" style={{ "--c": PHASE_COLOR[focus.phase] } as V}>{focus.phase}</span>
                    </div>
                    <div className="ch6-next-body">
                      <span className="ch6-glyph" style={{ borderColor: PHASE_COLOR[focus.phase], color: PHASE_COLOR[focus.phase], boxShadow: `0 0 16px ${PHASE_COLOR[focus.phase]}55`, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15 }}>M{pad(focus.no)}</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="ch6-next-title">{focus.title}</div>
                        <div className="ch6-next-sub">M{pad(focus.no)}{lead && <> · <b style={{ color: "var(--cyan)" }}>{BEAT_LABEL[lead.beat]}</b></>} · {done.size}/{CURRICULUM.length} modules cleared</div>
                      </div>
                    </div>
                    {lead && (
                      <div className="ch6-beats" role="img" aria-label={`Six beats; you are at ${BEAT_LABEL[lead.beat]}`}>
                        {BEATS.map((b, i) => <span key={b[0]} className={i < beatI ? "done" : i === beatI ? "cur" : ""}><i />{b[1]}</span>)}
                      </div>
                    )}
                    {others.length > 0 && (
                      <div className="ch6-next-meta">{others.map((o) => <Link key={o.module} href={`/operators/play/${o.module}`}>Also in progress: <b>M{pad(o.module)} · {BEAT_LABEL[o.beat]}</b></Link>)}</div>
                    )}
                  </div>
                )}
                <div className="ch6-actions" data-rise style={{ "--i": 5 } as V}>
                  {focus && <Link className="ch6-cta" href={`/operators/play/${focus.no}`}>{lead ? "Resume" : "Start here"} <Arrow /><span className="sheen" aria-hidden="true" /></Link>}
                  <a className="ch6-ghost" href="#posting">The posting</a>
                  <a className="ch6-ghost" href="#findings">Findings filed</a>
                </div>
                <div className="ch6-rail" data-rise style={{ "--i": 6 } as V} role="img" aria-label={`${done.size} of ${CURRICULUM.length} modules cleared${nextModule ? `; next is M${pad(nextModule)}` : ""}`}>
                  {PHASE_ORDER.map((ph) => {
                    const ms = CURRICULUM.filter((m) => m.phase === ph);
                    const d = ms.filter((m) => done.has(m.no)).length;
                    return (
                      <div className="rb" key={ph} style={{ "--c": PHASE_COLOR[ph], "--n": ms.length } as V}>
                        <div className="rl">{ph} <b>{d}/{ms.length}</b></div>
                        <div className="rd">{ms.map((m) => <i key={m.no} className={done.has(m.no) ? "done" : m.no === nextModule ? "next" : ""} />)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <aside className="ch6-id" style={{ "--rank": "var(--acc)", "--p": pct, "--i": 4 } as V} data-rise aria-label="Operator standing">
                <div className="ch6-ops-rank">
                  <span className="ch6-hexbig" aria-hidden="true">
                    <svg width="60" height="66" viewBox="0 0 64 70"><polygon points="32,2 60,17 60,53 32,68 4,53 4,17" fill="rgba(139,123,255,.16)" stroke="#8b7bff" strokeWidth="1.5" /><polygon points="32,10 53,21 53,49 32,60 11,49 11,21" fill="none" stroke="rgba(95,230,255,.4)" strokeWidth="1" /></svg>
                    <span className="chev">{Array.from({ length: tier + 1 }).map((_, i) => <svg key={i} width="23" height="7" viewBox="0 0 23 7" aria-hidden="true"><path d="M2 6 L11.5 1.6 L21 6" fill="none" stroke="#c2b8ff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>)}</span>
                  </span>
                  <div><div className="rk">Current rank</div><div className="ch6-rank">{rankName}</div></div>
                </div>
                <div className="ch6-stats">
                  <div className="ch6-stat" style={{ "--sc": "var(--amber)" } as V}><b data-count={rep}>{rep}</b><span>reputation</span></div>
                  <div className="ch6-stat" style={{ "--sc": "var(--green)" } as V}><b>{findings.length}</b><span>findings filed</span></div>
                  <div className="ch6-stat" style={{ "--sc": "var(--cyan)" } as V}><b>{done.size}<small>/{CURRICULUM.length}</small></b><span>modules cleared</span></div>
                </div>
                {rank?.next ? (
                  <div className="ch6-bar">
                    <div className="bl"><b>{rankName}</b><span>{rank.label}</span></div>
                    <div className="bt" role="img" aria-label={rank.label}><i /></div>
                  </div>
                ) : null}
                {latest && (
                  <a className="ch6-latest" href="#findings" style={{ "--sv": SEV_COLOR[latest.severity] } as V} aria-label={`Latest finding filed, M-${pad(latest.module)}: ${latest.title}. Read it in your findings.`}>
                    <span className="ll">Latest finding filed <span className="m">M-{pad(latest.module)}</span></span>
                    <span className="lt">{latest.title}</span>
                    <span className="lw">{latest.location}</span>
                    <span className="lf"><span className="sev">{SEV_LABEL[latest.severity]} · CVSS {latest.cvss}</span><span className="flag">{latest.flag}</span></span>
                  </a>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section className="ch6-board ch6-posting" id="posting" aria-label="The posting">
          <div className="ch6-h2" data-reveal>The posting <span className="n">· {done.size}/{CURRICULUM.length} modules cleared</span></div>
          {PHASE_ORDER.map((ph, pi) => {
            const pc = PHASE_COLOR[ph];
            const ms = CURRICULUM.filter((m) => m.phase === ph);
            const d = ms.filter((m) => done.has(m.no)).length;
            return (
              <section className="ch6-sec" key={ph} style={{ "--c": pc, marginTop: 20 } as V} data-reveal aria-labelledby={`ch6-p${pi}`}>
                <div className="ch6-sech"><span className="sw" aria-hidden="true" /><h2 id={`ch6-p${pi}`} style={{ color: pc }}>{ph}</h2><span className="count" style={{ marginLeft: 0 }}>{d}/{ms.length}</span></div>
                <div className="ch6-tiles">
                  {ms.map((m, i) => {
                    const isDone = done.has(m.no), isNext = m.no === nextModule, playable = m.no <= HIGHEST_BUILT_MODULE;
                    const inner = (
                      <>
                        <div className="th"><span className="ch6-mno">M{pad(m.no)}</span>{isDone ? <span className="tick" aria-hidden="true"><Tick /></span> : isNext ? <span className="nx">NEXT ▸</span> : !playable ? <span className="soon">soon</span> : null}</div>
                        <span className="tt">{m.title}</span>
                        {isDone ? <span className="tf done">FINDING FILED</span> : isNext ? <span className="tf next">START HERE</span> : null}
                      </>
                    );
                    const cls = `ch6-tile${isDone ? " done" : ""}${isNext ? " next" : ""}${playable ? "" : " unbuilt"}`;
                    return playable
                      ? <Link key={m.no} className={cls} href={`/operators/play/${m.no}`} style={{ "--c": pc, "--i": i } as V} aria-label={`M${pad(m.no)}: ${m.title}.${isDone ? " Finding filed." : isNext ? " Next." : ""}`}>{inner}</Link>
                      : <div key={m.no} className={cls} style={{ "--c": pc, "--i": i } as V}>{inner}</div>;
                  })}
                </div>
              </section>
            );
          })}

          <div className="ch6-h2" id="findings" style={{ marginTop: 34 }} data-reveal>Findings filed</div>
          {findings.length === 0 ? (
            <div className="ch6-empty" data-reveal>
              <div className="et">No findings yet.</div>
              <p>Clear your first module to file your first finding. It takes about an hour, and you act for real on day one.</p>
              <Link className="ch6-cta" href="/operators/play/1">Begin Module 01 <Arrow /><span className="sheen" aria-hidden="true" /></Link>
            </div>
          ) : (
            <div className="ch6-finds">
              {findings.map((f, i) => (
                <article className="ch6-find" key={f.module} style={{ "--sv": SEV_COLOR[f.severity], "--i": i % 3 } as V} data-reveal aria-labelledby={`ch6-f${f.module}`}>
                  <div className="fh"><span className="m">M-{pad(f.module)}</span><span className="t" id={`ch6-f${f.module}`}>{f.title}</span><span className="sev">{SEV_LABEL[f.severity]} · CVSS {f.cvss}</span></div>
                  <div className="fw">{f.location}</div>
                  <p><b>Impact.</b> {f.impact}</p>
                  <p><b>Fix.</b> {f.fix}</p>
                  <div className="ff">{f.flag}</div>
                </article>
              ))}
              {HIGHEST_BUILT_MODULE > findings.length && <Link className="ch6-more" href={continueHref} data-reveal>Continue the posting <Arrow /></Link>}
            </div>
          )}
        </section>
      </main>
    </CourseHomeShell>
  );
}
