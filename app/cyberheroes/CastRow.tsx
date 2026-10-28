"use client";

/**
 * CAST ROW - the three characters, on one line.
 *
 * Owner, 28 October 2026: "This part over here needs to be condensed a lot
 * more. Like, it needs to be a complete mini version. Maybe on one row",
 * under the governing note for the whole pass: "I don't want for parents to
 * be scrolling a lot. So I want to give in as much information as we can at
 * the top."
 *
 * What this replaces: three full-height portrait cards that between them
 * filled more than a whole screen to say "there are two heroes and a
 * villain", followed by a separate full-width panel headed "Who is the
 * Hacker Raccoon?".
 *
 * THE RACCOON'S PARAGRAPH IS NOT LOST. That panel was the only place on the
 * page that told a PARENT what the course actually defends against, which is
 * the most persuasive copy here. It is folded into the villain's own tile,
 * shortened but intact, so the page gets shorter without getting thinner.
 * The villain also keeps his red treatment against the heroes' blue, because
 * that contrast tells you who is who before you read a word.
 */

import Image from "next/image";

interface Member {
  name: string;
  img: string;
  alt: string;
  blurb: string;
  accent: string;
  glow: string;
  villain?: boolean;
}

const CAST: Member[] = [
  {
    name: "Adam",
    img: "/characters/adam.png",
    alt: "Adam, curious and brave Cyber Hero",
    blurb: "Curious and brave. A gamer who wants to keep his digital world safe.",
    accent: "#7c5cff",
    glow: "rgba(124,92,255,0.45)",
  },
  {
    name: "Layla",
    img: "/characters/layla.png",
    alt: "Layla, smart and fearless Cyber Hero",
    blurb: "Smart and fearless. She knows staying safe online is a superpower.",
    accent: "#36d6ff",
    glow: "rgba(54,214,255,0.4)",
  },
  {
    name: "The Hacker Raccoon",
    img: "/characters/raccoon.png",
    alt: "The Hacker Raccoon, the villain",
    /* The condensed form of the old spotlight panel. Keeps the four real
     * tactics, because naming them is what makes a parent believe this is
     * about their child and not a cartoon. */
    blurb:
      "Not just a cartoon villain. He runs the real attacks: phishing dressed up as game rewards, chat-room tricks, fake apps and password cracking. A new tactic every week, and your child learns to block every one.",
    accent: "#ff5f6d",
    glow: "rgba(255,95,109,0.38)",
    villain: true,
  },
];

export default function CastRow({ accentText }: { accentText: React.CSSProperties }) {
  return (
    <section id="heroes" className="max-w-[1100px] mx-auto px-6 md:px-10 py-12 sm:py-14">
      <div className="text-center mb-7" data-scroll>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Meet the <span style={accentText}>Characters</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-scroll>
        {CAST.map((m) => (
          <div
            key={m.name}
            style={{
              display: "flex",
              /* The villain's blurb is the longest, so the grid stretches the
               * other two to match. Centre their content rather than letting
               * it hang from the top over a pool of dead space. */
              alignItems: "center",
              gap: 14,
              padding: 14,
              borderRadius: 18,
              background: m.villain ? "rgba(32,12,18,0.5)" : "rgba(13,19,44,0.45)",
              border: `1px solid ${m.accent}${m.villain ? "4d" : "33"}`,
              boxShadow: m.villain ? `0 0 26px -16px ${m.accent}` : "none",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: 14,
                overflow: "hidden",
                background: "rgba(5,8,22,0.6)",
                border: `1px solid ${m.accent}44`,
                filter: `drop-shadow(0 0 16px ${m.glow})`,
              }}
            >
              <Image
                src={m.img}
                alt={m.alt}
                fill
                sizes="72px"
                style={{ objectFit: "cover", objectPosition: "center 18%" }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <h3
                className="display-font"
                style={{ color: m.villain ? m.accent : "#fff", fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}
              >
                {m.name}
              </h3>
              <p style={{ color: "#c5cdf0", fontSize: 12.5, lineHeight: 1.5, marginTop: 4 }}>{m.blurb}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
