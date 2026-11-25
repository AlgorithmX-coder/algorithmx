/* eslint-disable @next/next/no-img-element */

/**
 * The Cyber Heroes mission map (/dashboard), "Lit Map" skin from landing
 * lab round 6, v1 (owner, 2026-11-23). The first screen answers "what do I
 * do now?": the greeting, the four-rank ladder and a big Up next card for
 * the week to play. Then the progress band, the twenty weeks as a lit road
 * in four rows of five (one row per rank, each ending in its certificate),
 * and the Hacker Raccoon with his power bar.
 *
 * Everything shown comes from page.tsx, which reads it exactly as before:
 * the weeks and their progress, stars and screen, the counts, the Raccoon's
 * power and the course facts. Nothing here is sample data, and there is no
 * streak tile because no streak is stored.
 */

import Link from "next/link";
import HeroesShell, { CertIcon, Chevrons, Icon, KidChip, OutIcon, StarIcon, TrophyIcon } from "@/app/components/heroes-portal/HeroesShell";
import { WEEK_THEMES } from "@/app/lesson/weekContent/weekThemes";
import { WEEK_ART_WEEKS, weekArtPosition, weekArtSrc } from "@/app/lesson/weekContent/weekArt";

export type WeekState = "completed" | "inProgress" | "current" | "available";

export interface WeekItem {
  id: string;
  week: number;
  title: string;
  description: string;
  state: WeekState;
  stars: number;
  screen: number | null;
  href: string;
}

interface DashboardViewProps {
  userName: string;
  childAge: number | null;
  /** The child's colour, already resolved to a hex and its ink (the dev preview leaves it out). */
  kid?: { hex: string; ink: string };
  completedCount: number;
  totalWeeks: number;
  progressPct: number;
  remaining: number;
  raccoonPower: number;
  product: { name: string; ageRange: string; weeksCount: number; duration: string } | null;
  weeks: WeekItem[];
  /** Medal art for the most recent badges earned (up to three). */
  medals?: { src: string; alt: string }[];
  heroCtaHref: string;
  onLogout?: () => void | Promise<void>;
}

const RANKS = ["Cyber Cadet", "Cyber Guardian", "Cyber Defender", "Certified Cyber Hero"];

function Stars({ n }: { n: number }) {
  const c = Math.max(0, Math.min(3, n));
  return <span className="stars" aria-label={`${c} of 3 stars`}>{[0, 1, 2].map((i) => <StarIcon key={i} off={i >= c} />)}</span>;
}

function Tile({ w, here }: { w: WeekItem; here: boolean }) {
  const a = WEEK_THEMES[w.week]?.accent ?? "#ffb347";
  const done = w.state === "completed";
  const s = done ? "done" : here ? "here" : "todo";
  const label = done ? "Replay" : w.state === "inProgress" ? "Continue" : "Start Lesson";
  return (
    <li>
      <Link className="db-tile" data-s={s} href={w.href} style={{ "--a": a } as React.CSSProperties}>
        {WEEK_ART_WEEKS.has(w.week) ? <img src={weekArtSrc(w.week)} alt="" loading={w.week > 10 ? "lazy" : "eager"} style={{ objectPosition: weekArtPosition(w.week) }} /> : <span className="noart" aria-hidden="true" />}
        <span className="num" aria-hidden="true">{String(w.week).padStart(2, "0")}</span>
        {done ? <span className="st" aria-hidden="true"><Icon name="tick" /></span> : here ? <span className="here" aria-hidden="true">You are here</span> : null}
        <span className="body">
          <span className="k">
            <span>Week {w.week}{w.state === "inProgress" && w.screen != null ? ` · screen ${w.screen}` : ""}</span>
            {done && w.stars > 0 ? <Stars n={w.stars} /> : null}
          </span>
          <h4>{w.title}</h4>
          <p>{w.description}</p>
          <span className="go">{label} <Icon name="arr" /></span>
        </span>
      </Link>
    </li>
  );
}

export default function DashboardView({
  userName,
  childAge,
  kid = { hex: "#7c5cff", ink: "#ffffff" },
  completedCount,
  totalWeeks,
  progressPct,
  remaining,
  raccoonPower,
  product,
  weeks,
  medals = [],
  heroCtaHref,
  onLogout,
}: DashboardViewProps) {
  const allDone = completedCount >= totalWeeks && totalWeeks > 0;
  const heroSub =
    completedCount === 0
      ? "Your first mission is ready. Tap below to begin."
      : allDone
        ? "Every mission complete. The Hacker Raccoon is defeated!"
        : `${completedCount} of ${totalWeeks} weeks done. Keep the momentum going.`;
  const heroCtaLabel =
    completedCount === 0 ? "Start Your First Mission" : allDone ? "Revisit Week 1" : "Continue Mission";

  /* The four-phase ladder from the course: five weeks earns the next rank. */
  const ranksEarned = Math.min(RANKS.length, Math.floor(completedCount / 5));
  const intoPhase = completedCount % 5;
  const toNextRank = ranksEarned >= RANKS.length ? 0 : 5 - intoPhase;
  const nextRank = ranksEarned >= RANKS.length ? null : RANKS[ranksEarned];

  /* The next week a child will actually open, so "Remaining" names what is
   * coming rather than only counting it. */
  const nextWeek =
    weeks.find((w) => w.state === "current" || w.state === "inProgress") ??
    weeks.find((w) => w.state === "available");
  const upWeek = nextWeek ?? weeks[0];
  const upAccent = upWeek ? WEEK_THEMES[upWeek.week]?.accent ?? "#ffb347" : "#ffb347";
  const upKicker = !upWeek
    ? ""
    : allDone
      ? `Every week done · Week ${upWeek.week}`
      : upWeek.state === "inProgress" && upWeek.screen != null
        ? `Up next · Week ${upWeek.week} · screen ${upWeek.screen}`
        : `Up next · Week ${upWeek.week}`;

  const pct = Math.round(progressPct);
  const ringLen = ((2 * Math.PI * 27 * progressPct) / 100).toFixed(1);
  const phases = Math.ceil(weeks.length / 5);

  const navRight = (
    <>
      <KidChip name={userName} age={childAge} hex={kid.hex} ink={kid.ink} />
      <Link className="hlm-pill acc" href="/cyberhq"><TrophyIcon /><span className="t">Cyber HQ</span></Link>
      {onLogout ? (
        <form action={onLogout}>
          <button className="hlm-pill" type="submit"><OutIcon /><span className="t">Log Out</span></button>
        </form>
      ) : null}
    </>
  );

  return (
    <HeroesShell brandHref="/dashboard" brandLabel="Cyber Heroes by AlgorithmX, your mission map" navRight={navRight}>
      <div className="hlm-wrap db-main">
        <section className="db-hero" aria-labelledby="db-h1">
          <div className="db-hi">
            <span data-rise><span className="hlm-chip ok"><span className="dot" aria-hidden="true" />Mission Active</span></span>
            <h1 id="db-h1" data-rise>Welcome back, <span className="hlm-grad">{userName}</span>!</h1>
            <p className="hlm-lead" data-rise>{heroSub}</p>
            <div data-rise>
              <ol className="db-ranks" aria-label="Your rank ladder">
                {RANKS.map((r, i) => (
                  <li key={r} data-s={i < ranksEarned ? "done" : i === ranksEarned ? "next" : "todo"}>
                    <span className="m"><Chevrons n={Math.min(3, i + 1)} /></span>{r}
                  </li>
                ))}
              </ol>
              <p className="db-ranks-cap">
                {nextRank ? (
                  <><b>{toNextRank} more week{toNextRank === 1 ? "" : "s"}</b> to {nextRank}, and {ranksEarned === 0 ? "your first certificate" : "your next certificate"}.</>
                ) : (
                  <b>Every rank earned.</b>
                )}
              </p>
            </div>
          </div>

          {upWeek ? (
            <article className="hlm-card db-up" aria-labelledby="db-up-h" data-rise data-delay="240" style={{ "--a": upAccent } as React.CSSProperties}>
              <div className="art">
                {WEEK_ART_WEEKS.has(upWeek.week) ? <img data-rise src={weekArtSrc(upWeek.week)} alt="" style={{ objectPosition: weekArtPosition(upWeek.week) }} /> : null}
                <span className="wk" aria-hidden="true">{String(upWeek.week).padStart(2, "0")}</span>
              </div>
              <div className="txt">
                <span className="k">{upKicker}</span>
                <h2 id="db-up-h">{upWeek.title}</h2>
                <p>{upWeek.description}</p>
                {upWeek.state === "inProgress" && !allDone ? <span className="meta">You left off part way through. Pick up right where you were.</span> : null}
                <Link className="hlm-btn big" href={heroCtaHref}>{heroCtaLabel} <Icon name="arr" /></Link>
              </div>
            </article>
          ) : null}
        </section>

        <section className="db-stats" aria-label="Your progress">
          <div className="hlm-card db-stat" data-rise>
            <div className="lab">Weeks Done</div>
            <div className="val">{completedCount}<small>of {totalWeeks}</small></div>
            <div className="db-pips" role="img" aria-label={`${completedCount} of ${totalWeeks} weeks done`}>
              {weeks.map((w) => <i key={w.week} data-s={w.state === "completed" ? "done" : w === nextWeek ? "here" : "todo"} />)}
            </div>
          </div>
          <div className="hlm-card db-stat" data-rise>
            <div className="lab">Remaining</div>
            <div className="val">{remaining}</div>
            {nextWeek ? <div className="foot">Next: <b>{nextWeek.title.split(":")[0]}</b></div> : null}
          </div>
          <div className="hlm-card db-stat" data-rise>
            <div className="lab">Badges Earned</div>
            <div className="val">{completedCount}{medals.length ? <span className="db-medals" aria-hidden="true">{medals.map((m) => <img key={m.src} src={m.src} alt="" />)}</span> : null}</div>
            <div className="foot">{nextRank ? <><b>{toNextRank}</b> more to {nextRank.replace("Cyber ", "")}</> : "Every rank earned"}</div>
          </div>
          <div className="hlm-card db-stat coon" data-rise>
            <div className="lab">Raccoon Power</div>
            <div className="val">{raccoonPower}%</div>
            <div className="db-bar coon" role="img" aria-label={`Raccoon Power ${raccoonPower}%`}><i style={{ "--w": `${raccoonPower}%` } as React.CSSProperties} /></div>
          </div>
        </section>

        {weeks.length > 0 ? (
          <section className="db-map" aria-labelledby="db-map-h">
            <div className="hlm-sec-h" data-rise>
              <div>
                <h2 id="db-map-h">Your mission map</h2>
                <p>Every week is open. Play them in order, or go back to any week you love.</p>
              </div>
              <div className="db-course">
                {product ? (
                  <ul aria-label="Course details">
                    {/* The Product row still says "Cyber Heroes Academy"; the course is Cyber Heroes. */}
                    <li>Cyber Heroes</li>
                    <li>Ages {product.ageRange}</li>
                    <li>{product.weeksCount} Weeks</li>
                    <li>{product.duration}</li>
                  </ul>
                ) : null}
                <div className="db-ring" role="img" aria-label={`${pct}% of the course done`}>
                  <svg viewBox="0 0 66 66" aria-hidden="true"><circle cx="33" cy="33" r="27" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="7" /><circle className="arc" cx="33" cy="33" r="27" fill="none" stroke="var(--hlm-acc)" strokeWidth="7" strokeLinecap="round" style={{ "--len": ringLen } as React.CSSProperties} /></svg>
                  <b>{pct}%</b>
                </div>
              </div>
            </div>

            {Array.from({ length: phases }, (_, p) => {
              const row = weeks.slice(p * 5, p * 5 + 5);
              const from = row[0].week, to = row[row.length - 1].week;
              const rank = RANKS[p];
              const doneInRow = row.filter((w) => w.state === "completed").length;
              const left = Math.max(0, to - completedCount);
              const near = rank && completedCount < to && completedCount >= to - 5;
              const lit = doneInRow > 0 || (nextWeek && row.includes(nextWeek)) ? Math.min(1, (doneInRow + (doneInRow < row.length ? 0.5 : 0)) / row.length) : 0;
              return (
                <section className="db-phase" aria-labelledby={`ph-${p}`} data-rise key={p}>
                  <div className="db-phase-h">
                    <h3 id={`ph-${p}`}><span className="n">Weeks {from} to {to}</span>{rank ?? ""}</h3>
                    {rank ? (
                      <span className="db-cert" data-s={near ? "near" : "far"}>
                        <CertIcon />
                        {completedCount >= to ? `Certificate at week ${to}, earned` : `Certificate at week ${to}${near ? `, ${left} more week${left === 1 ? "" : "s"}` : ""}`}
                      </span>
                    ) : null}
                  </div>
                  <div className="db-road" aria-hidden="true" data-rise style={{ "--w": `${(lit * 100).toFixed(1)}%` } as React.CSSProperties}><i />{lit > 0 && lit < 1 ? <b /> : null}</div>
                  <ol className="db-tiles">{row.map((w) => <Tile key={w.id} w={w} here={w === nextWeek} />)}</ol>
                </section>
              );
            })}

            <aside className="hlm-card db-coon" aria-labelledby="db-coon-h" data-rise>
              <img src="/characters/raccoon-sneaking.png" alt="The Hacker Raccoon" width={348} height={260} />
              <div>
                <h3 id="db-coon-h">{allDone ? "You defeated the Hacker Raccoon!" : "The Hacker Raccoon is still out there…"}</h3>
                <p>{allDone ? "Amazing work, Cyber Hero! You've completed every lesson and saved the day." : `Complete all ${totalWeeks} weeks to defeat him. Each lesson weakens his power.`}</p>
              </div>
              <div className="pw">
                <div className="row"><span>Raccoon Power</span><span>{raccoonPower}%</span></div>
                <div className="db-bar coon"><i style={{ "--w": `${raccoonPower}%` } as React.CSSProperties} /></div>
                <small>{completedCount === 0 ? "Start your first lesson to begin weakening the raccoon." : allDone ? "The raccoon's power has been fully drained." : `${completedCount} lesson${completedCount !== 1 ? "s" : ""} down. Keep going!`}</small>
              </div>
            </aside>
          </section>
        ) : (
          <div className="hlm-card db-empty" data-rise>
            <p>Cyber Heroes content is not yet available. Please run the seed script.</p>
          </div>
        )}
      </div>
    </HeroesShell>
  );
}
