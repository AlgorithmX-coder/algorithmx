/**
 * Cyber HQ - the reward-loop hub.
 *
 * First cut: a server component that lists earned stickers from the
 * EarnedSticker table joined against STICKER_CATALOGUE, plus the
 * stickers the child hasn't earned yet (greyed silhouettes) so the
 * future weeks feel tangible. Future iterations will add a base /
 * room with unlockable items, the Cyber Detective Notebook, and a
 * companion robot - the API in stickers.actions is built to support
 * that growth without further schema changes.
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
import { getEarnedStickers } from "@/app/lib/stickers.actions";
import { BADGE_CATALOGUE } from "@/app/lib/badges-data";
import { getEarnedBadges } from "@/app/lib/badges.actions";
import { getProgressionSnapshot } from "@/app/lib/lessonProgress.actions";
import { getRank } from "@/app/lib/progression";
import PlaySignatureOnMount from "@/app/components/lesson/PlaySignatureOnMount";
import PixIcon from "@/app/components/lesson/PixIcon";

const C = {
  pageBg: "#080a16",
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  borderEarned: "rgba(253, 224, 71, 0.7)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  gold: "#fde047",
  cyan: "#00e5ff",
  violet: "#7c5cff",
};

const FONT_STACK =
  "ui-rounded, 'Fredoka', 'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif";

export default async function CyberHQPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
  const rank = getRank(totalXp);
  const collectionsEmpty = earnedCount === 0 && badgeEarnedCount === 0;

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
        color: C.text,
        fontFamily: FONT_STACK,
        padding: "32px 18px 60px",
        overflow: "hidden",
      }}
    >
      {/* Signature SFX: gentle door-open swoosh + chamber ambience
          when the child enters Cyber HQ. Tiny client island - parent
          stays server-rendered. */}
      <PlaySignatureOnMount id="hq-entry" delayMs={150} />

      {/* Ambient particle field - subtle drifting dots so the room is
          never visually still. CSS-only; respects reduced motion via
          @media (prefers-reduced-motion). */}
      <div aria-hidden className="hq-ambient-field">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="hq-ambient-dot"
            style={{
              left: `${(i * 73) % 100}%`,
              animationDelay: `${(i * 0.6) % 5}s`,
              animationDuration: `${10 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Rich cosmic backdrop — nebulae, a constellation, a planet + the
          glowing horizon arc, matching the dashboard mockup. */}
      <div aria-hidden className="hq-cosmos">
        <span className="hq-neb hq-neb-a" />
        <span className="hq-neb hq-neb-b" />
        <span className="hq-grid" />
        <span className="hq-scan" />
      </div>

      <div style={{ position: "relative", maxWidth: 1000, margin: "0 auto", zIndex: 1 }}>
        {/* Back link */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            color: C.cyan,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 18,
            padding: "6px 14px",
            background: "rgba(0, 229, 255, 0.08)",
            border: `1px solid ${C.border}`,
            borderRadius: 999,
          }}
        >
          ← Back to dashboard
        </Link>

        {/* Header — the lab scene EMBEDDED into the page background: no card
            frame, edges feathered with a radial mask so it dissolves into the
            techy backdrop instead of sitting in a box. */}
        <div style={{ position: "relative", marginBottom: 22 }}>
          <div
            style={{
              position: "relative",
              WebkitMaskImage: "radial-gradient(ellipse 94% 96% at 50% 42%, #000 50%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 94% 96% at 50% 42%, #000 50%, transparent 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cyberhq/lab-v3.png"
              alt="Adam and Layla in the Cyber HQ lab"
              width={1500}
              height={838}
              style={{ width: "100%", height: "clamp(250px, 40vw, 420px)", objectFit: "cover", objectPosition: "center 40%", display: "block" }}
            />
            {/* Darken the lower band for the title (feathers with the mask). */}
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,10,22,0) 44%, rgba(8,10,22,0.38) 74%, rgba(8,10,22,0.85) 100%)" }} />
          </div>
          {/* Title — crisp, over the feathered lower area. */}
          <div style={{ position: "absolute", left: "clamp(18px, 4vw, 40px)", right: 24, bottom: "clamp(2px, 1.5vw, 14px)" }}>
            <span style={{ display: "inline-block", fontSize: 11, letterSpacing: "0.22em", color: C.gold, textTransform: "uppercase", fontWeight: 800, marginBottom: 6, textShadow: `0 0 14px ${C.gold}, 0 1px 6px rgba(0,0,0,0.9)` }}>
              ✦ Cyber Hero Headquarters
            </span>
            <h1 style={{ fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 900, margin: "0 0 4px", background: `linear-gradient(135deg, ${C.cyan}, ${C.violet}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.1, filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.85))" }}>
              Your Cyber HQ
            </h1>
            <p style={{ color: C.text, fontSize: 14, margin: 0, maxWidth: 460, textShadow: "0 1px 10px rgba(0,0,0,0.95)" }}>
              Badges, stickers and XP you and your heroes have earned by beating the Hacker Raccoon.
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <section
          style={{
            padding: "18px 22px",
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {/* Rank + durable total XP (summed server-side across weeks). */}
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                color: C.textMuted,
                textTransform: "uppercase",
                fontWeight: 800,
                marginBottom: 4,
              }}
            >
              Rank
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ display: "inline-flex", lineHeight: 1 }} aria-hidden>
                <PixIcon emoji={rank.current.icon} size={30} />
              </span>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: rank.current.colour,
                    lineHeight: 1.1,
                  }}
                >
                  {rank.current.name}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: C.textSoft,
                  }}
                >
                  {totalXp.toLocaleString()} XP
                  {rank.next
                    ? ` · ${rank.xpNeededForNext.toLocaleString()} to ${rank.next.name}`
                    : " · max rank"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.18em",
                color: C.textMuted,
                textTransform: "uppercase",
                fontWeight: 800,
                marginBottom: 4,
              }}
            >
              Stickers collected
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 28,
                fontWeight: 900,
                color: C.gold,
                textShadow: `0 0 14px ${C.gold}55`,
              }}
            >
              {earnedCount}
              <span style={{ opacity: 0.55, fontSize: 18, marginLeft: 4 }}>
                / {totalCount}
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                position: "relative",
                height: 14,
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: 7,
                overflow: "hidden",
              }}
            >
              <div
                className="hq-progress-fill"
                style={{
                  position: "relative",
                  height: "100%",
                  width: `${earnedPct}%`,
                  background: `linear-gradient(90deg, ${C.gold}, #ff7a59)`,
                  boxShadow: `0 0 12px ${C.gold}88`,
                  transition: "width 380ms cubic-bezier(0.16, 1, 0.3, 1)",
                  overflow: "hidden",
                }}
              >
                {/* Shimmer overlay sweeps across the filled portion */}
                <span aria-hidden className="hq-progress-shimmer" />
              </div>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: C.textSoft,
                textAlign: "right",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {earnedPct}% complete
            </div>
          </div>
        </section>

        {/* Badge case — one trophy per week (earned = completed that week). */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            margin: "0 0 4px",
            color: C.text,
            letterSpacing: "0.02em",
          }}
        >
          Badge case
        </h2>
        <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 14px" }}>
          {badgeEarnedCount} of {badgeTotalCount} week badges earned
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 34,
          }}
        >
          {BADGE_CATALOGUE.map((b) => {
            const isEarned = earnedBadgeIds.has(b.id);
            return (
              <div
                key={b.id}
                className={isEarned ? "hq-sticker-earned" : undefined}
                style={{
                  padding: "16px 12px 14px",
                  borderRadius: 16,
                  background: isEarned
                    ? "linear-gradient(180deg, rgba(255, 209, 88, 0.22), rgba(15, 21, 48, 0.85))"
                    : "rgba(15, 21, 48, 0.55)",
                  border: isEarned
                    ? `2.5px solid ${C.borderEarned}`
                    : "2px dashed rgba(148, 163, 184, 0.3)",
                  boxShadow: isEarned
                    ? "0 14px 36px rgba(253, 224, 71, 0.25), 0 0 0 1px rgba(255, 209, 88, 0.4) inset"
                    : "none",
                  textAlign: "center",
                  opacity: isEarned ? 1 : 0.5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    marginBottom: 6,
                    display: "flex",
                    justifyContent: "center",
                    filter: isEarned
                      ? "drop-shadow(0 0 14px rgba(253, 224, 71, 0.55))"
                      : "grayscale(85%) opacity(0.55)",
                  }}
                  aria-hidden
                >
                  <PixIcon emoji={isEarned ? b.icon : "🔒"} size={44} />
                </div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    color: isEarned ? C.gold : C.textMuted,
                    textTransform: "uppercase",
                    fontWeight: 800,
                    marginBottom: 3,
                  }}
                >
                  Week {b.week}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isEarned ? C.text : "#475569",
                    lineHeight: 1.2,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {b.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticker wall */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            margin: "0 0 14px",
            color: C.text,
            letterSpacing: "0.02em",
          }}
        >
          Sticker wall
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          {STICKER_CATALOGUE.map((s) => {
            const isEarned = earnedIds.has(s.id);
            return (
              <div
                key={s.id}
                className={isEarned ? "hq-sticker-earned" : undefined}
                style={{
                  padding: "20px 18px 18px",
                  borderRadius: 18,
                  background: isEarned
                    ? "linear-gradient(180deg, rgba(255, 209, 88, 0.22), rgba(15, 21, 48, 0.85))"
                    : "rgba(15, 21, 48, 0.55)",
                  border: isEarned
                    ? `2.5px solid ${C.borderEarned}`
                    : "2px dashed rgba(148, 163, 184, 0.3)",
                  boxShadow: isEarned
                    ? "0 14px 36px rgba(253, 224, 71, 0.25), 0 0 0 1px rgba(255, 209, 88, 0.4) inset"
                    : "none",
                  textAlign: "center",
                  position: "relative",
                  opacity: isEarned ? 1 : 0.55,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "center",
                    filter: isEarned
                      ? "drop-shadow(0 0 18px rgba(253, 224, 71, 0.55))"
                      : "grayscale(85%) opacity(0.55)",
                  }}
                  aria-hidden
                >
                  <PixIcon emoji={isEarned ? s.icon : "🔒"} size={60} />
                </div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    color: isEarned ? C.gold : C.textMuted,
                    textTransform: "uppercase",
                    fontWeight: 800,
                    marginBottom: 4,
                  }}
                >
                  Week {s.weekNumber}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: isEarned ? C.text : "#475569",
                    marginBottom: 6,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: isEarned ? C.textSoft : "#475569",
                    lineHeight: 1.4,
                  }}
                >
                  {isEarned ? s.description : "Complete the mission to unlock"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ambient + shimmer + breathing keyframes. Server component =
            inline <style> for the global selectors. Reduced-motion users
            get a hard stop on all of these. */}
        <style>{`
          .hq-cosmos { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
          .hq-neb { position: absolute; border-radius: 50%; filter: blur(38px); }
          .hq-neb-a { top: -14%; left: -10%; width: 54vw; height: 54vw; background: radial-gradient(circle, rgba(124,92,255,0.17), transparent 62%); }
          .hq-neb-b { bottom: -12%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(0,229,255,0.13), transparent 60%); }
          .hq-grid { position: absolute; inset: -2px; background-image: linear-gradient(rgba(0,229,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px); background-size: 46px 46px; -webkit-mask-image: radial-gradient(ellipse 92% 82% at 50% 22%, #000 26%, transparent 82%); mask-image: radial-gradient(ellipse 92% 82% at 50% 22%, #000 26%, transparent 82%); }
          .hq-scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0,229,255,0.022) 0, rgba(0,229,255,0.022) 1px, transparent 1px, transparent 3px); opacity: 0.55; }
          .hq-ambient-field {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }
          .hq-ambient-dot {
            position: absolute;
            top: -8px;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #fff8dc;
            box-shadow: 0 0 8px rgba(253, 224, 71, 0.75);
            opacity: 0;
            animation-name: hqAmbientDrift;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
          }
          @keyframes hqAmbientDrift {
            0%   { opacity: 0; transform: translateY(0)    scale(0.6); }
            15%  { opacity: 0.85; }
            85%  { opacity: 0.85; }
            100% { opacity: 0; transform: translateY(110vh) scale(1.05); }
          }
          .hq-progress-shimmer {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent 0%, rgba(255, 248, 220, 0.65) 50%, transparent 100%);
            transform: translateX(-100%);
            animation: hqShimmerSweep 2.8s ease-in-out infinite;
          }
          @keyframes hqShimmerSweep {
            0%   { transform: translateX(-100%); }
            60%  { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
          .hq-sticker-earned {
            animation: hqStickerBreathe 4.6s ease-in-out infinite;
          }
          @keyframes hqStickerBreathe {
            0%, 100% {
              box-shadow:
                0 14px 36px rgba(253, 224, 71, 0.25),
                0 0 0 1px rgba(255, 209, 88, 0.4) inset;
            }
            50% {
              box-shadow:
                0 16px 44px rgba(253, 224, 71, 0.4),
                0 0 0 1px rgba(255, 209, 88, 0.55) inset;
            }
          }
          .hq-heroes { animation: hqHeroFloat 5s ease-in-out infinite; }
          @keyframes hqHeroFloat {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-9px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .hq-ambient-dot,
            .hq-progress-shimmer,
            .hq-sticker-earned,
            .hq-heroes {
              animation: none !important;
            }
            .hq-ambient-dot { opacity: 0; }
          }
        `}</style>

        {/* Helpful CTA */}
        {collectionsEmpty && (
          <div
            style={{
              marginTop: 28,
              padding: 24,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              textAlign: "center",
            }}
          >
            <p style={{ color: C.textSoft, fontSize: 14, margin: "0 0 14px" }}>
              No stickers yet - finish Week 1 to start your collection.
            </p>
            <Link
              href="/lesson/1"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                color: "#0f1530",
                fontWeight: 900,
                borderRadius: 12,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Start Week 1 →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
