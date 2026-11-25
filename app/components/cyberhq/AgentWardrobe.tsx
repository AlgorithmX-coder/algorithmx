"use client";
/* eslint-disable @next/next/no-img-element */

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
import { Icon } from "@/app/components/heroes-portal/HeroesShell";

/* Drawn in the Cyber Heroes portal skin ("Lit Map", landing lab round 6):
 * the classes live in heroes-portal.css, under the page's HeroesShell. The
 * choice, the storage and the one-invitation rule are unchanged. */
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
  // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is read after mount on purpose (see above); unchanged behaviour
  useEffect(() => setWorn(readWornWeek()), []);

  /* If the worn kit is somehow not earned (storage edited, or a profile
   * switched), fall back rather than render a kit this child has not earned. */
  const wornIsEarned = earned.some((i) => i.week === worn);
  const effective = wornIsEarned ? worn : 0;
  const [said, setSaid] = useState("");

  function wear(item: WardrobeItem) {
    setWorn(item.week);
    writeWornWeek(item.week);
    setSaid(`Now wearing the ${item.name}`);
  }

  return (
    <section className="hq-sec" aria-labelledby="wardrobe-heading">
      <div className="hlm-sec-h" data-rise>
        <div>
          <span className="hlm-eyebrow">Your Kit</span>
          <h2 id="wardrobe-heading">Dress your agent</h2>
          <p>Finish a week and you keep that week&apos;s outfit forever. Tap one to wear it.</p>
        </div>
      </div>
      <ul className="hq-kits">
        {earned.map((item) => {
          const isWorn = item.week === effective;
          return (
            <li key={`${item.week}-${item.outfit}`}>
              {/* Selection carried by TEXT and a shape, not colour alone -
                  child-safety accessibility item 8. */}
              <button className="hq-kit" type="button" onClick={() => wear(item)} aria-pressed={isWorn} data-rise>
                {/* Both heroes, because the kit is a pair. Idle pose: the week
                    dirs hold idle/attack/celebrate and no head art, so the
                    trial shows the full idle sprite. See DECIDE 4. */}
                <span className="fig" aria-hidden="true">
                  {(["adam", "layla"] as const).map((who) => (
                    <img key={who} src={wardrobeSpriteSrc(item, who, "idle")} alt="" onError={fallbackToShared(who, "idle")} />
                  ))}
                </span>
                <b>{item.name}</b>
                <small>{item.week === 0 ? item.earnedFor : `Week ${item.week} · ${item.earnedFor}`}</small>
                <span className="wear">{isWorn ? <><Icon name="tick" /> Wearing</> : "Wear"}</span>
              </button>
            </li>
          );
        })}
        {/* ONE invitation, never a wall of padlocks. */}
        {next ? (
          <li className="hq-invite" data-rise>
            <b>Next kit</b>
            <p>Finish <strong>Week {next.week}</strong> to earn the <strong>{next.name}</strong>.</p>
          </li>
        ) : (
          <li className="hq-invite" data-rise>
            <b>Every kit earned</b>
            <p>Every kit earned, Agent. The whole wardrobe is yours.</p>
          </li>
        )}
      </ul>
      <p className="hlm-sr" role="status">{said}</p>
    </section>
  );
}
