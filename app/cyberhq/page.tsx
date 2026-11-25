/* eslint-disable @next/next/no-img-element */
/**
 * Cyber HQ - the reward-loop hub.
 *
 * Lists earned stickers from the EarnedSticker table joined against
 * STICKER_CATALOGUE, the badge case, the milestone certificates, the agent
 * wardrobe and the child's rank and XP, under a way straight back into a
 * lesson.
 *
 * Skin: "Lit Map" (landing lab round 6, v1, owner 2026-11-23). The lab
 * painting feathered into the sky as a banner, the rank card beside the
 * title, then the live order. Locked things are one invitation, never a
 * wall of padlocks: the badge case shows what is earned, the next badge as a
 * silhouette and the numbers of the rest; the sticker wall shows what is
 * earned and the next week's stickers to find. Every figure is the child's
 * own, read exactly as before.
 *
 * Auth-gated only; not paywall-gated (matches /parent's posture).
 */
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
// STICKER_CATALOGUE moved to a plain data module (Next.js 16 forbids
// non-async exports from "use server" files). Actions stay in
// stickers.actions.ts.
import { STICKER_CATALOGUE } from "@/app/lib/stickers-data";
import StickerArt from "@/app/components/lesson/StickerArt";
import { getEarnedStickers } from "@/app/lib/stickers.actions";
import { BADGE_CATALOGUE } from "@/app/lib/badges-data";
import { getEarnedBadges } from "@/app/lib/badges.actions";
import { getProgressionSnapshot } from "@/app/lib/lessonProgress.actions";
import { getRank } from "@/app/lib/progression";
import AgentWardrobe from "@/app/components/cyberhq/AgentWardrobe";
import PlaySignatureOnMount from "@/app/components/lesson/PlaySignatureOnMount";
import PlayHubAmbientOnMount from "@/app/components/PlayHubAmbientOnMount";
import PixIcon from "@/app/components/lesson/PixIcon";
import PupilSignOut from "@/app/components/PupilSignOut";
import CarryOn from "@/app/components/cyberhq/CarryOn";
import HeroesShell, { CertIcon, Icon, KidChip } from "@/app/components/heroes-portal/HeroesShell";
import { prisma } from "@/app/lib/prisma";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";
import { getAge } from "@/app/lib/entitlements";
import { heroColour, inkOn } from "@/app/lib/heroColours";
import { getAchievedMilestones, getCertificateUrl } from "@/app/lib/certificates";
import { nextWeekFor, HEROES_WEEKS } from "@/app/lib/nextWeek";
import { isSchoolPupil } from "@/app/lib/pupilAuth";

export default async function CyberHQPage() {
  const session = await auth();
  /* The id, not just the user: everything below needs it, and the page used
     to carry a guard that did not promise one. */
  if (!session?.user?.id) redirect("/login");

  const [earned, earnedBadges, snapshot] = await Promise.all([
    getEarnedStickers(),
    getEarnedBadges(),
    getProgressionSnapshot(),
  ]);
  const earnedIds = new Set(earned.map((s) => s.id));
  const earnedCount = earned.length;
  const totalCount = STICKER_CATALOGUE.length;
  const earnedPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Badges — derived from completed weeks, same as stickers.
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.id));
  const badgeEarnedCount = earnedBadges.length;
  const badgeTotalCount = BADGE_CATALOGUE.length;

  // Durable XP / rank, summed server-side across the child's weeks.
  const totalXp = snapshot.totalXp;
  // No floor here, deliberately: the floor is the player's saved rank, and
  // that lives in local progression, which a server component cannot read.
  // So HQ shows the true current-ladder rank. The only way this differs from
  // the lesson HUD is a save that was already past the OLD 8,000 XP top rank
  // before the ladder was re-scaled; to close that, the rank would have to be
  // persisted server-side alongside totalXp.
  const rank = getRank(totalXp);

  /* Milestone certificates, against the same completed-week count the
     badge case already derives from. */
  const certificates = getAchievedMilestones(snapshot.weeks.filter((w) => w.completed).length);
  const collectionsEmpty = earnedCount === 0 && badgeEarnedCount === 0;

  /* The way back into a lesson. This page is the reward wall, and until now
     every part of it was about what a child had already done: the only link
     to an actual week appeared when they had no stickers at all, so it
     vanished the moment they finished week one. A school pupil signs in and
     lands here, so that left a child in a classroom standing in a trophy
     cabinet with nowhere to go. */
  const completedWeeks = snapshot.weeks.filter((w) => w.completed).map((w) => w.week);
  const nextWeek = nextWeekFor(snapshot.weeks, HEROES_WEEKS);

  /* Whose screen the back link belongs to. "Back to dashboard" is the
     family account's screen, which is the right answer for a child playing
     at home on a parent's account and the wrong one for a pupil on a
     classroom machine: they did not come from there, cannot do anything
     with it, and have their own sign-out on this page already. */
  const pupil = await isSchoolPupil(session.user.id);

  /* The child's chip in the nav: the same active profile every reward on
     this page is read for. */
  const childId = await resolveActiveChildProfileId(session.user.id);
  const child = childId
    ? await prisma.childProfile.findUnique({ where: { id: childId }, select: { name: true, dateOfBirth: true, favouriteColour: true } })
    : null;
  const kid = child ? heroColour(child.favouriteColour) : null;

  /* One invitation each, never a wall of padlocks: the next badge to win,
     and the next week's stickers to find. */
  const badgesEarned = BADGE_CATALOGUE.filter((b) => earnedBadgeIds.has(b.id));
  const badgesLeft = BADGE_CATALOGUE.filter((b) => !earnedBadgeIds.has(b.id));
  const nextBadge = badgesLeft.find((b) => b.week === nextWeek) ?? badgesLeft[0] ?? null;
  const restBadges = badgesLeft.filter((b) => b !== nextBadge);
  const stickersEarned = STICKER_CATALOGUE.filter((s) => earnedIds.has(s.id));
  const stickersLeft = STICKER_CATALOGUE.filter((s) => !earnedIds.has(s.id));
  const stickerWeek = stickersLeft.some((s) => s.weekNumber === nextWeek) ? nextWeek : stickersLeft[0]?.weekNumber ?? null;
  const stickersNext = stickersLeft.filter((s) => s.weekNumber === stickerWeek);
  const stickersRest = stickersLeft.length - stickersNext.length;
  const firstOpen = certificates.find((c) => !c.achieved);

  return (
    <HeroesShell
      brandHref={pupil ? undefined : "/dashboard"}
      brandLabel={pupil ? "Cyber Heroes by AlgorithmX" : "Cyber Heroes by AlgorithmX, your mission map"}
      navRight={
        <>
          {child && kid ? <KidChip name={child.name} age={getAge(child.dateOfBirth)} hex={kid.hex} ink={inkOn(kid.hex)} /> : null}
          {!pupil ? <Link className="hlm-pill acc" href="/dashboard"><Icon name="back" /><span className="t">Back to dashboard</span></Link> : null}
        </>
      }
    >
      {/* Signature SFX: gentle door-open swoosh + chamber ambience
          when the child enters Cyber HQ. Tiny client island - parent
          stays server-rendered. */}
      <PlaySignatureOnMount id="hq-entry" delayMs={150} />
      {/* Looping ambient bed ("Guardian Calm") while the child is in the
          hub. Client island; fades out on leave and honors the global
          mute. Only the hub gets BGM (see BGM_ALLOWLIST in sounds.ts). */}
      <PlayHubAmbientOnMount />
      {/* Only for a school pupil on a shared machine; renders nothing
          for a parent's child. */}
      <PupilSignOut />

      <div className="hlm-wrap hq-main">
        <section className="hq-head" aria-labelledby="hq-h1">
          <div className="hq-art" data-rise><img src="/cyberhq/lab-v3.png" alt="Adam and Layla in the Cyber HQ lab" width={1500} height={838} /></div>
          <div className="hq-title">
            <span className="hlm-eyebrow" data-rise>Cyber Hero Headquarters</span>
            <h1 id="hq-h1" data-rise>Your <span className="hlm-grad">Cyber HQ</span></h1>
            <p data-rise>Badges, stickers and XP you and your heroes have earned by beating the Hacker Raccoon.</p>
          </div>
          {/* Rank + durable total XP (summed server-side across weeks). */}
          <div className="hlm-card hq-rank" data-pop data-delay="420" style={{ "--rk": rank.current.colour } as React.CSSProperties}>
            <span className="m" aria-hidden="true"><PixIcon emoji={rank.current.icon} size={30} /></span>
            <div>
              <div className="lab">Rank</div>
              <b>{rank.current.name}</b>
              <div className="xp">
                {totalXp.toLocaleString("en-GB")} XP
                {rank.next ? ` · ${rank.xpNeededForNext.toLocaleString("en-GB")} to ${rank.next.name}` : " · max rank"}
              </div>
            </div>
          </div>
        </section>

        {/* The lesson, before the trophies. A child has forty minutes and
            the first thing on the screen should be the thing they came to
            do, not the things they did last week. */}
        <CarryOn nextWeek={nextWeek} completedWeeks={completedWeeks} totalWeeks={HEROES_WEEKS} />

        <section className="hlm-card hq-sum" aria-label="Stickers collected" data-rise>
          <div>
            <div className="lab">Stickers collected</div>
            <div className="big">{earnedCount}<small> / {totalCount}</small></div>
          </div>
          <div>
            <div className="hq-bar" data-rise role="img" aria-label={`${earnedPct}% of stickers collected`}><i style={{ "--w": `${earnedPct}%` } as React.CSSProperties} /></div>
            <div className="pct"><span>Every week has stickers to find</span><span>{earnedPct}% complete</span></div>
          </div>
        </section>

        {/* Certificates. They live here, which is where a child comes back
            to look at what they have won, and can be printed again. */}
        <section className="hq-sec" aria-labelledby="hq-cert-h">
          <div className="hlm-sec-h" data-rise><div><h2 id="hq-cert-h">Certificates</h2><p>One at week 5, 10, 15 and 20. Yours to keep and print.</p></div></div>
          <ol className="hq-certs">
            {certificates.map((m) => (
              <li key={m.week} className="hq-cert" data-s={m.achieved ? "earned" : m === firstOpen ? "near" : "far"} data-rise>
                <CertIcon className="seal" />
                <div className="wk">Week {m.week}</div>
                <b>{m.title}</b>
                {m.achieved ? (
                  <a className="hlm-btn get" href={getCertificateUrl(m.week)} target="_blank" rel="noopener noreferrer">Get it</a>
                ) : (
                  <>
                    <div className="meter" role="img" aria-label={`${m.progress}% of the way`}><i style={{ width: `${m.progress}%` }} /></div>
                    <div className="left">{m.weeksRemaining} more {m.weeksRemaining === 1 ? "week" : "weeks"}</div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* The Agent Wardrobe - "Your Kit".
            TRIAL, 27 October 2026: docs/cyberheroes/agent-wardrobe-design.md.
            Unlocks derive from the SAME `completedAt` the badge case below
            already uses, so there is no new query and nothing new stored. */}
        <AgentWardrobe completedWeeks={completedWeeks} />

        {/* Badge case — one trophy per week (earned = completed that week). */}
        <section className="hq-sec" aria-labelledby="hq-badge-h">
          <div className="hlm-sec-h" data-rise><div><h2 id="hq-badge-h">Badge case</h2><p>{badgeEarnedCount} of {badgeTotalCount} week badges earned</p></div></div>
          <ul className="hq-shelf">
            {badgesEarned.map((b) => (
              <li key={b.id} className="hq-medal" data-s="earned" data-rise>
                <StickerArt icon={b.icon} art={b.art} size={92} alt={`${b.name} badge`} />
                <span className="wk">Week {b.week}</span>
                <b>{b.name}</b>
              </li>
            ))}
            {nextBadge ? (
              <li className="hq-medal" data-s="next" data-rise>
                {nextBadge.art ? <img src={nextBadge.art} alt="" /> : <span className="q" aria-hidden="true">?</span>}
                <span className="wk">Week {nextBadge.week} · up next</span>
                <b>{nextBadge.name}</b>
              </li>
            ) : null}
            {restBadges.length ? (
              <li className="hq-rest" data-rise>
                <p>Each of the other {restBadges.length} week{restBadges.length === 1 ? "" : "s"} adds a badge to your case.</p>
                <ol aria-hidden="true">{restBadges.map((b) => <li key={b.id}>{b.week}</li>)}</ol>
              </li>
            ) : null}
          </ul>
        </section>

        {/* Sticker wall */}
        <section className="hq-sec" aria-labelledby="hq-st-h">
          <div className="hlm-sec-h" data-rise>
            <div>
              <h2 id="hq-st-h">Sticker wall</h2>
              {stickersRest > 0 ? <p>{stickersRest} more stickers to find in the weeks still to play.</p> : null}
            </div>
          </div>
          {collectionsEmpty ? <p className="hq-empty" data-rise>No stickers yet. Finish Week 1 to start your collection.</p> : null}
          <ul className="hq-stickers">
            {stickersEarned.map((s) => (
              <li key={s.id} className="hq-st" data-rise>
                <StickerArt icon={s.icon} art={s.art} size={76} />
                <span className="wk">Week {s.weekNumber}</span>
                <b>{s.name}</b>
                <small>{s.description}</small>
              </li>
            ))}
            {stickersNext.map((s) => (
              <li key={s.id} className="hq-st" data-s="next" data-rise>
                <span className="q" aria-hidden="true">?</span>
                <span className="wk">Week {s.weekNumber}</span>
                <b>{s.name}</b>
                <small>Complete the mission to unlock</small>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </HeroesShell>
  );
}
