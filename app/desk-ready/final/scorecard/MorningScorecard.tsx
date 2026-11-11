"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import DeskHeader from "../../DeskHeader";
import { Kicker, SHELL_CSS, Tick } from "../../learn/ui";
import { ARRIVALS, clockAt } from "../../office/jobs/monday/data";
import { morningOf, PASS_MARK, score, type JobScore, type JobStatus, type Scorecard } from "../../office/jobs/monday/morning";
import type { OfficeState } from "../../office/types";
import { D } from "../../tokens";
import { HowIcon } from "../FinalStart";
import { startFreshMorning, syncMorningRecord } from "../result";

/* The final task's scorecard: one page, kept and printable. Every job as
 * done, done late or missed (with kind, specific fix text), the criteria
 * each touched, the five habits, and the order the learner chose, with the
 * scam called out if it waited. Drawn from the office record, so it is the
 * same on any computer a signed-in learner opens it on. */

const ACC = "#ff8fe0";
const STATUS: Record<JobStatus, { word: string; colour: string; soft: string; edge: string }> = {
  done: { word: "Done", colour: D.good, soft: D.goodSoft, edge: D.goodEdge },
  late: { word: "Done late", colour: D.warn, soft: D.warnSoft, edge: D.warnEdge },
  missed: { word: "Missed", colour: D.bad, soft: D.badSoft, edge: D.badEdge },
  unreached: { word: "Not reached", colour: D.faint, soft: D.glass, edge: D.edge },
};

function jobLine(j: JobScore, card: Scorecard): string {
  const arrived = clockAt(j.at);
  switch (j.status) {
    case "done":
      return `Arrived ${arrived}, done at ${clockAt(j.doneAt ?? card.endedAt)}. In good time: ${j.job.dueText}.`;
    case "late":
      return `Arrived ${arrived}, done at ${clockAt(j.doneAt ?? card.endedAt)}: late, as ${j.job.dueText}. ${j.job.lateFix}`;
    case "missed":
      return `Arrived ${arrived}, and wasn't finished by ${clockAt(card.endedAt)}. Here's what was missing.`;
    default:
      return `It was due to arrive at ${arrived}, after you finished at ${clockAt(card.endedAt)}.`;
  }
}

export default function MorningScorecard() {
  const router = useRouter();
  const [rec, setRec] = useState<OfficeState | null | undefined>(undefined);
  useEffect(() => {
    let gone = false;
    void syncMorningRecord().then((s) => !gone && setRec(s));
    return () => {
      gone = true;
    };
  }, []);
  const m = rec ? morningOf(rec) : null;
  const card = rec && m?.endedAt !== undefined ? score(rec) : null;
  const again = () => {
    startFreshMorning();
    router.push("/desk-ready/final/morning");
  };

  return (
    <div className="dr-shell sc-shell" style={{ "--acc": ACC } as CSSProperties}>
      <DeskHeader link={{ href: "/desk-ready/final", label: "The final task" }} trail="Your scorecard" />
      <main className="sc-main">
        {rec === undefined ? (
          <div style={{ minHeight: "60vh" }} />
        ) : !card || !m ? (
          <section className="sc-empty dr-glass">
            <Kicker color={ACC}>Your scorecard</Kicker>
            <h1 className="sc-h1">No finished morning yet.</h1>
            <p className="sc-p">
              {m?.started ? `Your Monday morning is paused at ${clockAt(m.minute)}. Your scorecard appears here when the morning ends at 12:30, or when you say you're done.` : "Your scorecard appears here when you've played Monday morning at the desk."}
            </p>
            <div className="sc-actions">
              <Link href="/desk-ready/final/morning" className="sc-btn">
                {m?.started ? `Carry on from ${clockAt(m.minute)}` : "Start Monday morning"}
              </Link>
              <Link href="/desk-ready/final" className="sc-btn secondary">
                About the final task
              </Link>
            </div>
          </section>
        ) : (
          <Card card={card} rec={rec!} onAgain={again} />
        )}
      </main>
      <style>{`
        ${SHELL_CSS}
        ${CSS}
      `}</style>
    </div>
  );
}

function Card({ card, rec, onAgain }: { card: Scorecard; rec: OfficeState; onAgain: () => void }) {
  const m = morningOf(rec);
  const total = card.done + card.late;
  const playedOn = m.result ? new Date(m.result.on).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  const rules = [
    { ok: total >= PASS_MARK, text: `${PASS_MARK} of the 10 jobs done`, said: `You did ${total}${card.late ? `, ${card.late} of them late` : ""}.` },
    { ok: !card.paidScammer, text: "Nothing paid to the scammer", said: card.paidScammer ? "The scam's payment link was opened." : "The scammer got nothing." },
    { ok: card.leaked.length === 0, text: "No personal data sent to the wrong person", said: card.leaked.length ? `The overtime figures went to ${card.leaked.map((p) => p.name).join(" and ")}.` : "Everyone's pay went only to HR, or nowhere." },
  ];
  const left = card.jobs.filter((j) => j.status === "missed" || j.status === "unreached");
  const habitsMet = card.habits.filter((h) => h.of > 0 && h.met === h.of).length;

  return (
    <>
      <section className={card.passed ? "sc-head pass" : "sc-head"}>
        <div className="sc-head-top">
          <div style={{ minWidth: 0 }}>
            <Kicker color={card.passed ? D.good : ACC}>Your scorecard · Monday morning at the desk</Kicker>
            <h1 className="sc-h1">{card.passed ? "You passed Monday morning." : total >= PASS_MARK - 2 && !card.paidScammer && !card.leaked.length ? "Not a pass this time, but you're close. Here's how." : "Not a pass this time. Here's what to work on."}</h1>
            <p className="sc-p">
              Monday 16 November 2026, 08:30 to {clockAt(card.endedAt)}. {total} of 10 jobs done{card.late ? ` (${card.late} late)` : ""}, {habitsMet} of 5 habits kept every time.
              {playedOn ? ` Played on ${playedOn}.` : ""}
            </p>
          </div>
          <div className="sc-score" aria-label={`${total} of 10 jobs done`}>
            <b>{total}</b>
            <span>of 10 done</span>
          </div>
        </div>
        <ul className="sc-rules" aria-label="The pass rules">
          {rules.map((r) => (
            <li key={r.text} className={r.ok ? "ok" : "no"}>
              <span className="sc-mark" aria-label={r.ok ? "Met" : "Not met"}>
                {r.ok ? <Tick size={15} color={D.good} /> : "!"}
              </span>
              <span>
                <b>{r.text}</b>
                <span>{r.said}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="sc-actions sc-noprint">
          <button type="button" className="sc-btn" onClick={() => window.print()}>
            Save as PDF or print
          </button>
          <button type="button" className="sc-btn secondary" onClick={onAgain}>
            Try the morning again
          </button>
          <Link href="/desk-ready/course" className="sc-btn secondary">
            Back to your desk
          </Link>
        </div>
      </section>

      <section className={`sc-scam ${card.scam.tone}`} aria-label="The scam">
        <Kicker color={card.scam.tone === "good" ? D.good : card.scam.tone === "none" ? D.faint : card.scam.tone === "late" ? D.warn : D.bad}>The scam, at 08:40</Kicker>
        <p>{card.scam.note}</p>
      </section>

      {!card.passed && left.length > 0 && (
        <section className="sc-section">
          <h2 className="sc-h2">What to work on first</h2>
          <p className="sc-p">
            {card.paidScammer || card.leaked.length
              ? "One of the safety rules was broken, so this morning can't pass however much else was done. Read that job below first, then try the morning again."
              : `You need ${PASS_MARK - total} more job${PASS_MARK - total === 1 ? "" : "s"} done to pass. Each missed job below says exactly what was missing.`}
          </p>
        </section>
      )}

      <section className="sc-section" aria-labelledby="sc-jobs">
        <h2 id="sc-jobs" className="sc-h2">
          The ten jobs
        </h2>
        <ol className="sc-jobs">
          {card.jobs.map((j) => {
            const st = STATUS[j.status];
            const arrival = ARRIVALS.find((a) => a.id === j.job.arrival);
            const misses = j.checks.filter((c) => !c.ok);
            /* each fix said once: a later "do that first" hint, or the same words again, adds nothing */
            const said = new Set<string>();
            const showFix = (fix: string | undefined) => {
              if (!fix) return false;
              const first = said.size === 0;
              if (said.has(fix) || (!first && /^(Add|Save|Reply|Email|Open)[^.]{0,60}\bfirst[.:]/.test(fix))) return false;
              said.add(fix);
              return true;
            };
            return (
              <li key={j.job.id} className="sc-job" style={{ "--st": st.colour, "--st-soft": st.soft, "--st-edge": st.edge } as CSSProperties}>
                <div className="sc-job-top">
                  <span className="sc-time">
                    {arrival && <HowIcon how={arrival.how} size={15} />}
                    {clockAt(j.at)}
                  </span>
                  <h3>{j.job.title}</h3>
                  <span className="sc-pill">
                    {st.word}
                    {(j.status === "done" || j.status === "late") && j.doneAt !== undefined ? ` ${clockAt(j.doneAt)}` : ""}
                  </span>
                </div>
                <p className="sc-job-line">{jobLine(j, card)}</p>
                {j.status !== "unreached" && (
                  <ul className="sc-checks">
                    {j.checks.map((c) => (
                      <li key={c.id} className={c.ok ? "ok" : "miss"}>
                        <span className="sc-mark" aria-label={c.ok ? "Met" : "Missed"}>
                          {c.ok ? <Tick size={13} color={D.good} /> : "!"}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span className="sc-label">{c.label}</span>
                          {!c.ok && showFix(c.fix) && <span className="sc-fix">{c.fix}</span>}
                        </span>
                        <code>{c.code}</code>
                      </li>
                    ))}
                  </ul>
                )}
                {j.status === "done" && !misses.length && <p className="sc-praise">Every part of it done properly.</p>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="sc-section" aria-labelledby="sc-habits">
        <h2 id="sc-habits" className="sc-h2">
          The five habits
        </h2>
        <p className="sc-p">What managers notice, whatever the job. Each is checked everywhere it came up this morning.</p>
        <ul className="sc-habits">
          {card.habits.map((h) => {
            const met = h.of > 0 && h.met === h.of;
            return (
              <li key={h.label} className={met ? "met" : h.of === 0 ? "none" : ""}>
                <div className="sc-habit-top">
                  <span className="sc-mark">{met ? <Tick size={14} color={D.good} /> : h.of === 0 ? "·" : "!"}</span>
                  <b>{h.label}</b>
                  <span className="sc-habit-n">{h.of ? `${h.met} of ${h.of}` : "Not reached"}</span>
                </div>
                {h.misses.length > 0 && (
                  <p className="sc-habit-misses">
                    Missed in: {[...new Set(h.misses.map((x) => x.job))].join("; ")}. The jobs above say how to put each right.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sc-section" aria-labelledby="sc-criteria">
        <h2 id="sc-criteria" className="sc-h2">
          The skills it checked
        </h2>
        <ul className="sc-criteria">
          {card.criteria.map((c) => (
            <li key={c.code} className={c.met ? "met" : ""}>
              <code>{c.code}</code>
              <span>{c.label}</span>
              <b>{c.met ? "Met" : "Missed"}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className="sc-section" aria-labelledby="sc-order">
        <h2 id="sc-order" className="sc-h2">
          The order you chose
        </h2>
        <p className="sc-p">The time each job was finished, and when it arrived. Nobody told you the order: this is how you ran your morning.</p>
        {card.order.length ? (
          <ol className="sc-order">
            {card.order.map((j) => (
              <li key={j.job.id} className={j.job.id === "scam" ? `scam ${card.scam.tone}` : j.status}>
                <span className="sc-order-time">{clockAt(j.doneAt ?? card.endedAt)}</span>
                <span>
                  <b>{j.job.title}</b>
                  <span>
                    {" "}
                    (arrived {clockAt(j.at)}
                    {j.status === "late" ? `, late: ${j.job.dueText}` : ""})
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="sc-p">No job was finished this morning.</p>
        )}
        {left.length > 0 && (
          <p className="sc-p">
            <b style={{ color: D.ink }}>Not finished:</b> {left.map((j) => j.job.title).join("; ")}.
          </p>
        )}
      </section>

      {(m.history?.length ?? 0) > 0 && (
        <section className="sc-section sc-noprint" aria-labelledby="sc-earlier">
          <h2 id="sc-earlier" className="sc-h2">
            Your earlier mornings
          </h2>
          <ul className="sc-earlier">
            {m.history!.map((r, i) => (
              <li key={`${r.on}-${i}`}>
                {r.passed ? <Tick size={15} color={D.good} /> : <span aria-hidden>○</span>}
                {new Date(r.on).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}: {r.passed ? "passed" : "not passed"}, {r.done + r.late} of 10 done
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="sc-actions sc-noprint" style={{ marginTop: 40 }}>
        <button type="button" className="sc-btn" onClick={() => window.print()}>
          Save as PDF or print
        </button>
        <button type="button" className="sc-btn secondary" onClick={onAgain}>
          Try the morning again
        </button>
      </div>
      <p className="sc-keep">This scorecard is yours to keep. It&apos;s saved with your progress, and the files you made are still in the office.</p>
    </>
  );
}

const CSS = `
  .sc-main { max-width: 1000px; margin: 0 auto; padding: 36px 16px 90px; }
  .sc-h1 { margin: 10px 0 0; font-family: ${D.display}; font-size: clamp(1.9rem, 4.2vw, 2.9rem); line-height: 1.08; letter-spacing: -0.025em; font-weight: 500; color: ${D.ink}; }
  .sc-h2 { margin: 0; font-family: ${D.display}; font-size: clamp(1.4rem, 2.6vw, 1.85rem); line-height: 1.15; letter-spacing: -0.02em; font-weight: 500; color: ${D.ink}; }
  .sc-p { margin: 12px 0 0; max-width: 760px; font-size: 16.5px; line-height: 1.6; color: ${D.body}; }
  .sc-empty, .sc-head { padding: 28px 28px 26px; border-radius: 22px; background: radial-gradient(80% 140% at 100% 0%, rgba(255,143,224,0.16), transparent 60%), ${D.card}; border: 1px solid rgba(255,143,224,0.35); box-shadow: ${D.lift}; }
  .sc-head.pass { background: radial-gradient(80% 140% at 100% 0%, rgba(76,195,138,0.2), transparent 60%), ${D.card}; border-color: ${D.goodEdge}; }
  .sc-head-top { display: flex; gap: 24px; align-items: flex-start; justify-content: space-between; }
  .sc-score { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 120px; height: 120px; border-radius: 50%; border: 2px solid var(--acc); box-shadow: 0 0 30px -8px var(--acc); }
  .sc-head.pass .sc-score { border-color: ${D.good}; box-shadow: 0 0 30px -8px ${D.good}; }
  .sc-score b { font-family: ${D.display}; font-size: 46px; line-height: 1; font-weight: 600; color: ${D.ink}; }
  .sc-score span { font-family: ${D.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${D.faint}; }
  .sc-rules { list-style: none; margin: 22px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .sc-rules li { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: ${D.goodSoft}; border: 1px solid ${D.goodEdge}; }
  .sc-rules li.no { background: ${D.badSoft}; border-color: ${D.badEdge}; }
  .sc-rules li b { display: block; font-size: 15px; color: ${D.ink}; }
  .sc-rules li span span { display: block; margin-top: 2px; font-size: 14px; line-height: 1.45; color: ${D.muted}; }
  .sc-mark { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; border: 1.5px solid currentColor; color: ${D.good}; }
  .no .sc-mark, .miss .sc-mark, .sc-habits li:not(.met):not(.none) .sc-mark { color: ${D.bad}; }
  .sc-actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; }
  .sc-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 22px; border: none; border-radius: 999px; background: ${D.action}; color: ${D.onAccent}; font-family: ${D.display}; font-weight: 600; font-size: 15.5px; text-decoration: none; box-shadow: ${D.actionGlow}; cursor: pointer; }
  .sc-btn.secondary { background: ${D.glass}; box-shadow: none; border: 1px solid ${D.edgeStrong}; color: ${D.ink}; }
  .sc-btn:focus-visible { outline: 3px solid ${D.accent}; outline-offset: 3px; }
  .sc-scam { margin-top: 18px; padding: 16px 20px; border-radius: 16px; border: 1px solid ${D.edge}; background: ${D.glass}; }
  .sc-scam.good { border-color: ${D.goodEdge}; background: ${D.goodSoft}; }
  .sc-scam.late { border-color: ${D.warnEdge}; background: ${D.warnSoft}; }
  .sc-scam.bad { border-color: ${D.badEdge}; background: ${D.badSoft}; }
  .sc-scam p { margin: 6px 0 0; font-size: 16.5px; line-height: 1.55; color: ${D.ink}; }
  .sc-section { margin-top: 44px; }
  .sc-jobs { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 12px; }
  .sc-job { padding: 16px 18px 16px; border-radius: 16px; background: ${D.card}; border: 1px solid ${D.edge}; border-left: 4px solid var(--st); box-shadow: ${D.lift}; break-inside: avoid; }
  .sc-job-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .sc-job-top h3 { flex: 1; min-width: 180px; margin: 0; font-family: ${D.display}; font-size: 18px; font-weight: 600; line-height: 1.3; color: ${D.ink}; }
  .sc-time { display: inline-flex; align-items: center; gap: 6px; font-family: ${D.mono}; font-size: 13px; font-weight: 700; color: ${D.muted}; }
  .sc-pill { padding: 4px 11px; border-radius: 999px; font-family: ${D.mono}; font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--st); background: var(--st-soft); border: 1px solid var(--st-edge); white-space: nowrap; }
  .sc-job-line { margin: 8px 0 0; font-size: 15.5px; line-height: 1.55; color: ${D.muted}; }
  .sc-checks { list-style: none; margin: 10px 0 0; padding: 0; display: grid; gap: 6px; }
  .sc-checks li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.025); }
  .sc-checks li.miss { background: ${D.badSoft}; }
  .sc-checks .sc-mark { width: 20px; height: 20px; font-size: 11px; }
  .sc-label { display: block; font-size: 15px; line-height: 1.45; color: ${D.body}; }
  .sc-fix { display: block; margin-top: 3px; font-size: 14.5px; line-height: 1.5; color: ${D.ink}; }
  .sc-checks code, .sc-criteria code { flex-shrink: 0; font-family: ${D.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: ${D.faint}; padding-top: 2px; }
  .sc-praise { margin: 8px 0 0; font-size: 14.5px; color: ${D.good}; }
  .sc-habits { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; }
  .sc-habits li { padding: 12px 14px; border-radius: 14px; background: ${D.glass}; border: 1px solid ${D.warnEdge}; break-inside: avoid; }
  .sc-habits li.met { border-color: ${D.goodEdge}; background: ${D.goodSoft}; }
  .sc-habits li.none { border-color: ${D.edge}; }
  .sc-habit-top { display: flex; align-items: center; gap: 10px; }
  .sc-habit-top b { flex: 1; font-size: 16px; color: ${D.ink}; }
  .sc-habit-n { font-family: ${D.mono}; font-size: 12.5px; font-weight: 700; color: ${D.muted}; white-space: nowrap; }
  .sc-habit-misses { margin: 6px 0 0 34px; font-size: 14.5px; line-height: 1.5; color: ${D.body}; }
  .sc-criteria { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .sc-criteria li { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; background: ${D.badSoft}; border: 1px solid ${D.badEdge}; font-size: 14.5px; color: ${D.body}; break-inside: avoid; }
  .sc-criteria li.met { background: ${D.glass}; border-color: ${D.edge}; }
  .sc-criteria li span { flex: 1; min-width: 0; }
  .sc-criteria li b { font-family: ${D.mono}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: ${D.bad}; }
  .sc-criteria li.met b { color: ${D.good}; }
  .sc-order { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 0; border-left: 2px solid ${D.edgeStrong}; }
  .sc-order li { position: relative; display: flex; gap: 14px; align-items: baseline; padding: 8px 0 8px 18px; font-size: 15.5px; color: ${D.muted}; }
  .sc-order li::before { content: ""; position: absolute; left: -6px; top: 15px; width: 10px; height: 10px; border-radius: 50%; background: ${D.good}; }
  .sc-order li.late::before, .sc-order li.scam.late::before { background: ${D.warn}; }
  .sc-order li.scam.late { color: ${D.ink}; }
  .sc-order b { color: ${D.ink}; font-weight: 600; }
  .sc-order-time { flex-shrink: 0; width: 46px; font-family: ${D.mono}; font-weight: 700; font-size: 14px; color: ${D.ink}; }
  .sc-earlier { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 6px; }
  .sc-earlier li { display: flex; gap: 10px; align-items: center; font-size: 15px; color: ${D.body}; }
  .sc-keep { margin: 18px 0 0; font-size: 14.5px; color: ${D.faint}; }

  @media (max-width: 760px) {
    .sc-rules, .sc-criteria { grid-template-columns: 1fr; }
    .sc-head-top { flex-direction: column-reverse; }
    .sc-score { width: 92px; height: 92px; }
    .sc-score b { font-size: 36px; }
    .sc-empty, .sc-head { padding: 22px 18px; }
    .sc-btn { flex: 1 1 100%; }
  }

  @media print {
    @page { margin: 14mm; }
    .sc-shell, .sc-shell * { color: #111 !important; box-shadow: none !important; text-shadow: none !important; }
    .sc-shell { background: #fff !important; color-scheme: light; }
    .sc-shell::before, .sc-shell::after, .sc-shell .dr-glass::before, .sc-shell .dr-glass::after { display: none !important; }
    .sc-shell header, .sc-noprint { display: none !important; }
    .sc-main { padding: 0; max-width: none; }
    .sc-head, .sc-job, .sc-scam, .sc-habits li, .sc-criteria li, .sc-rules li, .sc-checks li { background: #fff !important; border-color: #bbb !important; }
    .sc-job { border-left-color: var(--st) !important; }
    .sc-checks li.miss, .sc-rules li.no { background: #fff4f4 !important; }
    .sc-pill { border-color: #999 !important; background: #fff !important; }
    .sc-section { margin-top: 22px; }
  }
`;
