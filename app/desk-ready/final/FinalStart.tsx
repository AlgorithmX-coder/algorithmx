"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import DeskHeader from "../DeskHeader";
import { doneIn, useDone } from "../learn/progress";
import { Kicker, SHELL_CSS, Tick } from "../learn/ui";
import { ARRIVALS, clockAt, LENGTH } from "../office/jobs/monday/data";
import { morningOf, PASS_MARK } from "../office/jobs/monday/morning";
import type { OfficeState } from "../office/types";
import { PARTS } from "../syllabus";
import { D } from "../tokens";
import { capstoneResultOf, startFreshMorning, syncMorningRecord } from "./result";

/* The final task's start page: what Monday morning at the desk is, how long
 * it takes, that the clock runs fast and can be paused, how it's marked and
 * that the scorecard is the learner's to keep. One button starts it (or
 * carries on a morning in progress, or shows the scorecard). Finishing the
 * modules first is recommended, never required. */

const ACC = "#ff8fe0";

export function HowIcon({ how, size = 16 }: { how: "email" | "teams" | "phone"; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, style: { display: "block" } };
  if (how === "email")
    return (
      <svg {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  if (how === "teams")
    return (
      <svg {...p}>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z" />
    </svg>
  );
}

const HOW_WORD = { email: "An email", teams: "A Teams message", phone: "A phone call" } as const;

export default function FinalStart() {
  const router = useRouter();
  const done = useDone();
  const [rec, setRec] = useState<OfficeState | null | undefined>(undefined);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    let gone = false;
    void syncMorningRecord().then((s) => !gone && setRec(s));
    return () => {
      gone = true;
    };
  }, []);

  const open = PARTS.flatMap((p) => p.modules).filter((m) => m.ready);
  const finishedModules = open.filter((m) => doneIn(done, m.id) >= m.topics.length).length;
  const m = rec ? morningOf(rec) : null;
  const over = m?.endedAt !== undefined;
  const inProgress = !!m && m.started && !over;
  const best = capstoneResultOf(rec ?? null);
  const tries = (m?.history?.length ?? 0) + (m?.result ? 1 : 0);

  const again = () => {
    startFreshMorning();
    router.push("/desk-ready/final/morning");
  };

  return (
    <div className="dr-shell" style={{ "--acc": ACC } as CSSProperties}>
      <DeskHeader link={{ href: "/desk-ready/course", label: "Your desk" }} trail="The final task" />
      <main className="fs-main">
        <section className="fs-hero">
          <div style={{ minWidth: 0 }}>
            <Kicker color={ACC}>The final task</Kicker>
            <h1 className="fs-h1">
              Monday morning <span style={{ whiteSpace: "nowrap" }}>at the desk.</span>
            </h1>
            <p className="fs-lede">
              It&apos;s Monday 16 November at Northfield Supplies, and the desk is yours. From 08:30, work lands the way it does on a real Monday: emails, a Teams message, a phone call. Nobody tells you which app to use or what to do first. You decide, and you do it.
            </p>
            <div className="fs-cta">
              {rec === undefined ? (
                <span className="fs-btn ghost" aria-hidden>
                  &nbsp;
                </span>
              ) : over ? (
                <>
                  <Link href="/desk-ready/final/scorecard" className="fs-btn">
                    See your scorecard <span aria-hidden>&rarr;</span>
                  </Link>
                  <button type="button" className="fs-btn secondary" onClick={again}>
                    Try the morning again
                  </button>
                </>
              ) : inProgress ? (
                <>
                  <Link href="/desk-ready/final/morning" className="fs-btn">
                    Carry on from {clockAt(m.minute)} <span aria-hidden>&rarr;</span>
                  </Link>
                  {confirm ? (
                    <span className="fs-confirm">
                      Start again from 08:30? What you&apos;ve done this morning is cleared.
                      <button type="button" className="fs-link" onClick={again}>
                        Yes, start again
                      </button>
                      <button type="button" className="fs-link" onClick={() => setConfirm(false)}>
                        No
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="fs-btn secondary" onClick={() => setConfirm(true)}>
                      Start again from 08:30
                    </button>
                  )}
                </>
              ) : (
                <Link href="/desk-ready/final/morning" className="fs-btn">
                  Start Monday morning <span aria-hidden>&rarr;</span>
                </Link>
              )}
            </div>
            {rec !== undefined && (
              <p className="fs-status">
                {over && best
                  ? `${best.passed ? "You've passed." : "Not passed yet."} Your best morning: ${best.score} of ${best.outOf} jobs done${best.late ? `, ${best.late} late` : ""}.${tries > 1 ? ` You've played it ${tries} times.` : ""}`
                  : inProgress
                    ? `Your morning is paused at ${clockAt(m.minute)}. The clock waits for you.`
                    : "The clock starts when you press Start the clock in the office, not before."}
              </p>
            )}
          </div>
          <div className="fs-clockface dr-glass" aria-hidden>
            <span className="fs-cf-day">Monday 16 November 2026</span>
            <b className="fs-cf-time">{m && m.started ? clockAt(m.endedAt ?? m.minute) : "08:30"}</b>
            <span className="fs-cf-bar">
              <span style={{ width: `${m ? ((m.endedAt ?? m.minute) / LENGTH) * 100 : 0}%` }} />
            </span>
            <span className="fs-cf-ends">
              <span>08:30</span>
              <span>12:30</span>
            </span>
          </div>
        </section>

        <section className="fs-facts" aria-label="What to expect">
          {[
            ["Four office hours", "08:30 to 12:30 on Monday 16 November, the week after your first week at Northfield."],
            ["About an hour of your time", "The clock runs four times faster than real time, so an office hour takes 15 minutes."],
            ["Stop and come back", "Pause the clock whenever you like. Leave the page and it stops. Come back and carry on from where you were."],
            ["A scorecard to keep", "Every job marked done, done late or missed, with how to put right what you missed. Print it, save it as a PDF, use it on your CV."],
          ].map(([h, p]) => (
            <article key={h} className="fs-fact dr-glass">
              <h2>{h}</h2>
              <p>{p}</p>
            </article>
          ))}
        </section>

        <section className="fs-section" aria-labelledby="fs-morning">
          <Kicker color={D.faint}>The morning</Kicker>
          <h2 id="fs-morning" className="fs-h2">
            Ten things land on your desk, each at its own time.
          </h2>
          <p className="fs-p">Eight emails, a Teams message and a phone call. Some say when they&apos;re needed by. Some can wait. One is a scam, and it won&apos;t say so.</p>
          <div className="fs-line" role="img" aria-label="A timeline from 08:30 to 12:30 with ten arrivals: eight emails, a Teams message at 08:55 and a phone call at 09:50">
            <span className="fs-line-rule" />
            {ARRIVALS.map((a, i) => (
              <span key={a.id} className={`fs-dot ${a.how}${i % 2 ? "" : " up"}`} style={{ left: `${(a.at / LENGTH) * 100}%`, top: i % 2 ? 25 : 8 }} title={`${clockAt(a.at)}: ${HOW_WORD[a.how]}`}>
                <HowIcon how={a.how} size={15} />
                <i>{clockAt(a.at)}</i>
              </span>
            ))}
            <span className="fs-line-end" style={{ left: 0 }}>
              08:30
            </span>
            <span className="fs-line-end" style={{ right: 0 }}>
              12:30
            </span>
          </div>
          <ul className="fs-key">
            <li className="email">
              <HowIcon how="email" /> An email
            </li>
            <li className="teams">
              <HowIcon how="teams" /> A Teams message
            </li>
            <li className="phone">
              <HowIcon how="phone" /> The phone rings
            </li>
          </ul>
          {/* on a phone, the same morning as a list */}
          <ol className="fs-list" aria-label="When things land">
            {ARRIVALS.map((a) => (
              <li key={a.id} className={a.how}>
                <b>{clockAt(a.at)}</b>
                <HowIcon how={a.how} size={15} />
                <span>{HOW_WORD[a.how]}</span>
              </li>
            ))}
            <li className="end">
              <b>12:30</b>
              <span>The morning ends</span>
            </li>
          </ol>
        </section>

        <section className="fs-section" aria-labelledby="fs-pass">
          <Kicker color={D.faint}>How it&apos;s marked</Kicker>
          <h2 id="fs-pass" className="fs-h2">
            Marked on what you leave behind, like a real morning.
          </h2>
          <p className="fs-p">At 12:30 (or sooner, if you say you&apos;re done), every job is checked: the files, the emails, the calendar. Each one is done, done late or missed. To pass, you need all three of these:</p>
          <ol className="fs-rules">
            <li>
              <b>{PASS_MARK} of the 10 jobs done.</b> Late still counts as done, but the scorecard says so.
            </li>
            <li>
              <b>Nothing paid to a scammer.</b> One wrong click can cost a business thousands.
            </li>
            <li>
              <b>No personal data sent to the wrong person.</b> People&apos;s names and pay go only to the people who need them.
            </li>
          </ol>
          <p className="fs-p">The scorecard also shows the five office habits, and the order you chose to work in.</p>
        </section>

        <section className="fs-advice dr-glass" aria-labelledby="fs-ready">
          <div>
            <Kicker color={D.accent}>Before you start</Kicker>
            <h2 id="fs-ready" className="fs-h3">
              It&apos;s best after the modules.
            </h2>
            <p className="fs-p" style={{ marginTop: 8 }}>
              The morning uses what the modules teach, from email and Excel to spotting a scam. You&apos;ve finished {finishedModules} of the {open.length} modules open so far.{" "}
              {finishedModules >= open.length ? "You're ready." : "You can start any time, though: it's your morning."}
            </p>
          </div>
          <Link href="/desk-ready/course" className="fs-link-btn">
            Back to your desk
          </Link>
        </section>

        {best && m && (m.history?.length ?? 0) > 0 && (
          <section className="fs-section" aria-labelledby="fs-tries">
            <Kicker color={D.faint}>Your mornings</Kicker>
            <h2 id="fs-tries" className="fs-h3">
              Every morning you&apos;ve finished
            </h2>
            <ul className="fs-tries">
              {[...(m.history ?? []), ...(m.result ? [m.result] : [])].map((r, i) => (
                <li key={`${r.on}-${i}`}>
                  {r.passed ? <Tick size={16} color={D.good} /> : <span aria-hidden>○</span>}
                  <span>
                    {new Date(r.on).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}: {r.passed ? "passed" : "not passed"}, {r.done + r.late} of 10 jobs done{r.late ? ` (${r.late} late)` : ""}, finished at {clockAt(r.endedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <style>{`
        ${SHELL_CSS}
        .fs-main { max-width: 1180px; margin: 0 auto; padding: 40px 16px 90px; }
        .fs-hero { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 40px; align-items: center; }
        .fs-h1 { margin: 12px 0 0; font-family: ${D.display}; font-size: clamp(2.3rem, 5.4vw, 3.9rem); line-height: 1.02; letter-spacing: -0.03em; font-weight: 500; color: ${D.ink}; }
        .fs-lede { margin: 18px 0 0; max-width: 640px; font-size: 18.5px; line-height: 1.6; color: ${D.muted}; }
        .fs-cta { margin-top: 26px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
        .fs-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 54px; padding: 0 28px; border: none; border-radius: 999px; background: ${D.action}; color: ${D.onAccent}; font-family: ${D.display}; font-weight: 600; font-size: 17px; text-decoration: none; box-shadow: ${D.actionGlow}; cursor: pointer; }
        .fs-btn:hover { filter: brightness(1.08); }
        .fs-btn:focus-visible, .fs-link:focus-visible, .fs-link-btn:focus-visible { outline: 3px solid ${D.accent}; outline-offset: 3px; }
        .fs-btn.secondary { background: ${D.glass}; box-shadow: none; border: 1px solid ${D.edgeStrong}; color: ${D.ink}; }
        .fs-btn.ghost { width: 230px; background: ${D.glass}; box-shadow: none; }
        .fs-confirm { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; font-size: 15px; color: ${D.body}; }
        .fs-link { min-height: 40px; padding: 0; border: none; background: none; color: ${D.accent}; font-family: ${D.sans}; font-size: 15px; font-weight: 600; text-decoration: underline; cursor: pointer; }
        .fs-status { margin: 14px 0 0; font-size: 15.5px; line-height: 1.5; color: ${D.faint}; }
        .fs-clockface { display: grid; gap: 8px; padding: 26px 28px 24px; border-radius: 24px; background: radial-gradient(90% 120% at 100% 0%, rgba(255,143,224,0.18), transparent 60%), ${D.card}; border: 1px solid rgba(255,143,224,0.35); box-shadow: ${D.lift}; }
        .fs-cf-day { font-family: ${D.mono}; font-size: 11.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${D.faint}; }
        .fs-cf-time { font-family: ${D.display}; font-size: 86px; line-height: 1; font-weight: 600; letter-spacing: -0.03em; color: ${D.ink}; font-variant-numeric: tabular-nums; }
        .fs-cf-bar { margin-top: 8px; height: 7px; border-radius: 99px; background: rgba(255,255,255,0.09); overflow: hidden; }
        .fs-cf-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, ${D.accent}, ${ACC}); }
        .fs-cf-ends { display: flex; justify-content: space-between; font-family: ${D.mono}; font-size: 12px; color: ${D.faint}; }

        .fs-facts { margin-top: 48px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .fs-fact { padding: 20px 20px 22px; border-radius: 18px; background: ${D.card}; border: 1px solid ${D.edge}; box-shadow: ${D.lift}; }
        .fs-fact h2 { margin: 0; font-family: ${D.display}; font-size: 18.5px; font-weight: 600; line-height: 1.25; color: ${D.ink}; }
        .fs-fact p { margin: 8px 0 0; font-size: 15.5px; line-height: 1.55; color: ${D.muted}; }

        .fs-section { margin-top: 56px; }
        .fs-h2 { margin: 10px 0 0; font-family: ${D.display}; font-size: clamp(1.6rem, 3vw, 2.3rem); line-height: 1.1; letter-spacing: -0.02em; font-weight: 500; color: ${D.ink}; }
        .fs-h3 { margin: 8px 0 0; font-family: ${D.display}; font-size: 1.45rem; line-height: 1.2; font-weight: 500; color: ${D.ink}; }
        .fs-p { margin: 14px 0 0; max-width: 760px; font-size: 17px; line-height: 1.6; color: ${D.body}; }
        .fs-line { position: relative; margin: 30px 22px 0; height: 104px; }
        .fs-line-rule { position: absolute; left: 0; right: 0; top: 41px; height: 2px; background: linear-gradient(90deg, ${D.accent}, ${ACC}); border-radius: 2px; box-shadow: 0 0 12px rgba(127,178,255,0.5); }
        .fs-dot { position: absolute; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .fs-dot > svg { box-sizing: content-box; padding: 7px; border-radius: 50%; background: ${D.panel}; border: 1.5px solid currentColor; }
        .fs-dot i { font-style: normal; font-family: ${D.mono}; font-size: 11px; color: ${D.faint}; }
        .fs-dot.email, .fs-key .email { color: ${D.accent}; }
        .fs-dot.teams, .fs-key .teams { color: #9d8cff; }
        .fs-dot.phone, .fs-key .phone { color: ${D.good}; }
        .fs-dot.up i { order: -1; }
        .fs-line-end { position: absolute; bottom: -22px; font-family: ${D.mono}; font-size: 12px; font-weight: 700; color: ${D.muted}; }
        .fs-key { list-style: none; margin: 34px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 15px; }
        .fs-key li { display: inline-flex; align-items: center; gap: 8px; }
        .fs-rules { margin: 16px 0 0; padding: 0; list-style: none; counter-reset: r; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .fs-rules li { counter-increment: r; position: relative; padding: 18px 18px 18px 58px; border-radius: 16px; background: ${D.glass}; border: 1px solid ${D.edge}; font-size: 15.5px; line-height: 1.55; color: ${D.muted}; }
        .fs-rules li::before { content: counter(r); position: absolute; left: 16px; top: 16px; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: ${D.mono}; font-weight: 800; font-size: 13px; color: ${D.ink}; background: rgba(255,143,224,0.18); border: 1px solid rgba(255,143,224,0.5); }
        .fs-rules b { display: block; color: ${D.ink}; font-size: 16.5px; margin-bottom: 4px; }
        .fs-advice { margin-top: 56px; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 24px 26px; border-radius: 20px; background: ${D.card}; border: 1px solid ${D.accentEdge}; box-shadow: ${D.lift}; }
        .fs-link-btn { flex-shrink: 0; display: inline-flex; align-items: center; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 1px solid ${D.edgeStrong}; color: ${D.ink}; text-decoration: none; font-family: ${D.display}; font-weight: 600; font-size: 15.5px; }
        .fs-tries { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
        .fs-tries li { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; background: ${D.glass}; border: 1px solid ${D.edge}; font-size: 15.5px; color: ${D.body}; }
        .fs-list { display: none; list-style: none; margin: 20px 0 0; padding: 0 0 0 14px; border-left: 2px solid rgba(127,178,255,0.45); }
        .fs-list li { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 15.5px; color: ${D.body}; }
        .fs-list li b { width: 46px; font-family: ${D.mono}; font-size: 13.5px; color: ${D.ink}; }
        .fs-list li.email svg { color: ${D.accent}; }
        .fs-list li.teams svg { color: #9d8cff; }
        .fs-list li.phone svg { color: ${D.good}; }
        .fs-list li.end span { color: ${D.faint}; }

        @media (max-width: 980px) {
          .fs-hero { grid-template-columns: 1fr; gap: 28px; }
          .fs-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .fs-rules { grid-template-columns: 1fr; }
        }
        @media (max-width: 620px) {
          .fs-facts { grid-template-columns: 1fr; }
          .fs-advice { flex-direction: column; align-items: flex-start; }
          .fs-cf-time { font-size: 68px; }
          .fs-line { margin: 26px 8px 0; }
          .fs-dot > svg { padding: 5px; }
          .fs-dot i { font-size: 9.5px; }
          .fs-btn { width: 100%; justify-content: center; }
          .fs-line, .fs-key { display: none; }
          .fs-list { display: block; }
        }
      `}</style>
    </div>
  );
}
