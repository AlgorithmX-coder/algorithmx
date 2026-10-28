"use client";

/**
 * MISSION SHOWCASE - the week cards, on the sales page.
 *
 * Owner, 28 October 2026: "These cards ... now want to put them on the main
 * landing page of Cyber Heroes. So pick a few and then like fuzz out the
 * rest. Say purchase now or sign up now, to unlock, but pick out the good
 * ones, ones that are different ... pick a few different ones that hit
 * different kind of target markets."
 *
 * WHY THESE FIVE. Each one answers a different worry a parent arrives with,
 * so whichever one brought them to the page, one card speaks to it:
 *
 *   1  Passwords ............ the parent who wants the basics done properly
 *   3  Stranger Danger ...... the parent frightened of who is talking to them
 *   6  Gaming Safety ........ the Roblox / Minecraft / Fortnite household
 *   7  In-Game Spending ..... the parent who found a Robux charge on the card
 *  13  Screen Time .......... the parent arguing about the tablet every night
 *
 * They are also five visually different pictures, which is the other half of
 * the job: the row has to look like a course with range, not five variations
 * of one scene.
 *
 * The locked strip behind them is deliberately a TEASE, not a secret: every
 * week's title is still listed in full further down the page. What is blurred
 * is the artwork, which is the thing you only get by enrolling.
 */

import Image from "next/image";
import { WEEK_THEMES } from "@/app/lesson/weekContent/weekThemes";
import { weekArtSrc, weekArtPosition } from "@/app/lesson/weekContent/weekArt";

interface Wk {
  w: number;
  title: string;
  sub: string;
}

/** The five shown in full, in week order. */
const FEATURED = [1, 3, 6, 7, 13];
/** A handful blurred behind the unlock panel. Enough to read as "there is
 *  much more here", few enough that the page does not carry twenty images. */
const TEASED = Array.from({ length: 20 }, (_, i) => i + 1).filter((n) => !FEATURED.includes(n));

const accent = (w: number) => WEEK_THEMES[w]?.accent ?? "#36d6ff";
const art = weekArtSrc;

function Card({ wk, locked = false, small = false }: { wk: Wk; locked?: boolean; small?: boolean }) {
  const a = accent(wk.w);
  return (
    <div
      aria-hidden={locked || undefined}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        minHeight: small ? 168 : 300,
        padding: small ? 11 : 18,
        display: "flex",
        flexDirection: "column",
        background: "#0a0e1e",
        border: `1px solid ${a}${locked ? "22" : "4d"}`,
        boxShadow: locked ? "none" : `0 18px 40px -26px ${a}`,
        /* The blur goes on the whole card, art and words together, so a
         * locked week reads as "something is there" without giving it away. */
        filter: locked ? (small ? "blur(3.2px) saturate(0.92)" : "blur(7px) saturate(0.75)") : "none",
        opacity: locked ? (small ? 0.95 : 0.55) : 1,
        pointerEvents: locked ? "none" : undefined,
        userSelect: locked ? "none" : undefined,
      }}
    >
      <Image
        src={art(wk.w)}
        alt={locked ? "" : `${wk.title} mission artwork`}
        fill
        sizes={small ? "(max-width: 640px) 45vw, 180px" : "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"}
        style={{ objectFit: "cover", objectPosition: weekArtPosition(wk.w), zIndex: 0 }}
      />
      {/* The scrim is what lets the words sit on a picture and still read. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(8,12,28,0.38) 0%, rgba(8,12,28,0) 24%, rgba(8,12,28,0) 54%, rgba(8,12,28,0.74) 72%, rgba(8,12,28,0.94) 88%, rgba(8,12,28,0.97) 100%)",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `linear-gradient(90deg, rgba(8,12,28,0.42) 0%, rgba(8,12,28,0.04) 52%, transparent 78%)`,
        }}
      />

      <span
        className="display-font"
        style={{ position: "relative", zIndex: 2, fontSize: small ? 22 : 40, fontWeight: 800, lineHeight: 1, color: a }}
      >
        {String(wk.w).padStart(2, "0")}
      </span>

      <div style={{ position: "relative", zIndex: 2, marginTop: "auto" }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: small ? 8 : 9.5,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: a,
            marginBottom: 5,
          }}
        >
          Week {wk.w}
        </div>
        <h3
          className="display-font"
          style={{
            color: "#fff",
            fontSize: small ? 11.5 : 16.5,
            fontWeight: 700,
            lineHeight: 1.25,
            textShadow: "0 2px 10px rgba(5,8,20,0.95)",
          }}
        >
          {wk.title}
        </h3>
        <p
          style={{
            color: "#c5cdf0",
            fontSize: 12.5,
            lineHeight: 1.5,
            marginTop: 4,
            textShadow: "0 2px 9px rgba(5,8,20,0.95)",
            display: small ? "none" : undefined,
          }}
        >
          {wk.sub}
        </p>
      </div>
    </div>
  );
}

export default function MissionShowcase({
  weeks,
  accentText,
  btnGrad,
  btnGlow,
}: {
  weeks: Wk[];
  accentText: React.CSSProperties;
  btnGrad: string;
  btnGlow: string;
}) {
  const byWeek = new Map(weeks.map((w) => [w.w, w]));
  const featured = FEATURED.map((n) => byWeek.get(n)).filter(Boolean) as Wk[];
  const teased = TEASED.map((n) => byWeek.get(n)).filter(Boolean) as Wk[];
  const locked = weeks.length - featured.length;

  return (
    <section id="curriculum" className="max-w-[1100px] mx-auto px-6 md:px-10 py-16 sm:py-24">
      <div className="text-center mb-10" data-scroll>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
          A Look <span style={accentText}>Inside</span>
        </h2>
        <p className="ch-sub text-base sm:text-lg max-w-2xl mx-auto">
          Every week is its own story, with its own artwork and its own villain to outwit. Here
          are five of the twenty.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-scroll>
        {featured.map((wk) => (
          <Card key={wk.w} wk={wk} />
        ))}
      </div>

      {/* ── the locked strip ───────────────────────────────────────────── */}
      <div id="unlock" style={{ position: "relative", marginTop: 16, scrollMarginTop: 110 }} data-scroll>
        <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-5" style={{ pointerEvents: "none" }}>
          {teased.map((wk) => (
            <Card key={wk.w} wk={wk} locked small />
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            textAlign: "center",
            padding: 20,
            /* Dark enough to read the words over, light enough that the
             * blurred cards still show through. If you cannot tell there is
             * something behind this panel, the tease has done nothing. */
            background:
              "radial-gradient(62% 80% at 50% 50%, rgba(10,14,30,0.80) 0%, rgba(10,14,30,0.62) 55%, rgba(10,14,30,0.28) 100%)",
            borderRadius: 22,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,209,88,0.12)",
              border: "1px solid rgba(255,209,88,0.45)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffd158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>

          <p className="display-font" style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>
            {locked} more weeks locked
          </p>
          <p className="ch-sub" style={{ fontSize: 14, maxWidth: 440 }}>
            Scams, cyberbullying, YouTube, smart speakers, chatbots, social media and the final
            mission. Enrol once and your child keeps all twenty.
          </p>

          {/* Carried over from the pricing section this pass deletes. Those
              lines were the only place the page said what you actually get,
              and "no subscriptions, no renewals" is the strongest
              objection-handler on a page aimed at parents. */}
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: "center", listStyle: "none", padding: 0, margin: "0 0 4px" }}>
            {["All 20 weeks, missions and boss battles", "4 milestone certificates", "Parent progress dashboard", "One-time payment, no subscriptions"].map((t) => (
              <li key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#c5cdf0", fontSize: 12.5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7eff97" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4.5 4.5L19 7" /></svg>
                {t}
              </li>
            ))}
          </ul>

          <a
            href="/cyberheroes/signup"
            className="inline-flex items-center gap-2 font-black px-7 py-3.5 rounded-full text-[15px] transition-all"
            style={{ background: btnGrad, boxShadow: btnGlow, color: "#fff", textDecoration: "none", textShadow: "0 1px 6px rgba(80,20,0,0.45)" }}
          >
            Enrol Now to Unlock · £99
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
