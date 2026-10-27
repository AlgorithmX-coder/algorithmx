"use client";

/**
 * "Your Kit" - the Agent Wardrobe panel in Cyber HQ.
 *
 * Design: docs/cyberheroes/agent-wardrobe-design.md.
 *
 *   Finish a week, and you keep that week's outfit forever.
 *
 * What this is NOT, on purpose: there are no prices, no coins, no rarity, no
 * timers and no other child's wardrobe anywhere on this screen. Week 7 of this
 * very course teaches children that game coins are "real money in a costume",
 * so the one shape this reward could not take is a shop.
 *
 * It shows what is EARNED plus exactly one line about what is next. Not twenty
 * padlocks: `economy.md` is explicit that a wall of grey placeholders is
 * demotivating, and a locked rail is the nearest thing to a price list this
 * design could accidentally grow.
 *
 * TRIAL: the choice lives in localStorage (per device). Production moves it to
 * ChildProfile with the server validating the pick against earned weeks.
 */

import { useEffect, useState } from "react";
import {
  earnedWardrobe,
  nextWardrobeItem,
  readWornWeek,
  wardrobeSpriteSrc,
  writeWornWeek,
  type WardrobeItem,
} from "@/app/lib/wardrobe";
import { fallbackToShared } from "@/app/lib/weekCharacters";

const C = {
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  borderWorn: "rgba(253, 224, 71, 0.7)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  gold: "#fde047",
  cyan: "#00e5ff",
};

export default function AgentWardrobe({
  completedWeeks,
}: {
  completedWeeks: number[];
}) {
  const earned = earnedWardrobe(completedWeeks);
  const next = nextWardrobeItem(completedWeeks);

  /* Read on mount, not during render: localStorage is not available on the
   * server and a first paint that disagrees with it would flash the wrong kit. */
  const [worn, setWorn] = useState<number>(0);
  useEffect(() => setWorn(readWornWeek()), []);

  /* If the worn kit is somehow not earned (storage edited, or a profile
   * switched), fall back rather than render a kit this child has not earned. */
  const wornIsEarned = earned.some((i) => i.week === worn);
  const effective = wornIsEarned ? worn : 0;

  function wear(item: WardrobeItem) {
    setWorn(item.week);
    writeWornWeek(item.week);
  }

  return (
    <section
      aria-labelledby="wardrobe-heading"
      style={{
        padding: "18px 22px",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        marginBottom: 28,
      }}
    >
      <div style={{ marginBottom: 4 }}>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            color: C.textMuted,
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          Your Kit
        </span>
      </div>
      <h2
        id="wardrobe-heading"
        style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 900, color: C.text }}
      >
        Dress your agent
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: C.textSoft, maxWidth: 520 }}>
        Finish a week and you keep that week&apos;s outfit forever. Tap one to wear it.
      </p>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
          gap: 12,
        }}
      >
        {earned.map((item) => {
          const isWorn = item.week === effective;
          return (
            <li key={`${item.week}-${item.outfit}`}>
              <button
                type="button"
                onClick={() => wear(item)}
                aria-pressed={isWorn}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  background: isWorn ? "rgba(253,224,71,0.10)" : "rgba(8,12,30,0.55)",
                  border: `2px solid ${isWorn ? C.borderWorn : C.border}`,
                  borderRadius: 14,
                  padding: "10px 8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  color: C.text,
                  font: "inherit",
                }}
              >
                {/* Both heroes, because the kit is a pair. Idle pose: the week
                    dirs hold idle/attack/celebrate and no head art, so the
                    trial shows the full idle sprite. See DECIDE 4. */}
                <span style={{ display: "flex", gap: 2, height: 72 }} aria-hidden>
                  {(["adam", "layla"] as const).map((who) => (
                    <img
                      key={who}
                      src={wardrobeSpriteSrc(item, who, "idle")}
                      alt=""
                      onError={fallbackToShared(who, "idle")}
                      style={{ height: 72, width: "auto", objectFit: "contain" }}
                    />
                  ))}
                </span>

                <span style={{ fontSize: 13, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>
                  {item.name}
                </span>
                <span style={{ fontSize: 10.5, color: C.textSoft, textAlign: "center", lineHeight: 1.25 }}>
                  {item.week === 0 ? item.earnedFor : `Week ${item.week} · ${item.earnedFor}`}
                </span>

                {/* Selection carried by TEXT and a shape, not colour alone -
                    child-safety accessibility item 8. */}
                <span
                  style={{
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 900,
                    color: isWorn ? C.gold : C.textMuted,
                  }}
                >
                  {isWorn ? "✓ Wearing" : "Wear"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ONE invitation, never a wall of padlocks. */}
      {next && (
        <p style={{ margin: "14px 0 0", fontSize: 12.5, color: C.textSoft }}>
          <span aria-hidden style={{ marginRight: 6 }}>🎁</span>
          Finish <strong style={{ color: C.cyan }}>Week {next.week}</strong> to earn the{" "}
          <strong style={{ color: C.cyan }}>{next.name}</strong>.
        </p>
      )}
      {!next && (
        <p style={{ margin: "14px 0 0", fontSize: 12.5, color: C.gold, fontWeight: 700 }}>
          Every kit earned, Agent. The whole wardrobe is yours.
        </p>
      )}
    </section>
  );
}
