"use client";

/**
 * CAST ROW - the three characters, on one line.
 *
 * Owner, 28 October 2026: "it needs to be a complete mini version. Maybe on
 * one row", under the governing note "I don't want for parents to be
 * scrolling a lot."
 *
 * THEN, on my first attempt: "that looks terrible ... why is there a card
 * outside of it? Just have it big enough for them to see it. Again, it's just
 * too small. And the card is just unnecessary the out rectangle thing. So
 * yeah, make it look proportionate."
 *
 * Fair. Condensing the section was the ask; shrinking each character to a
 * 72px stamp inside a bordered box was my own addition and it made the row
 * look like a settings list. So:
 *
 *  - NO card. No border, no panel. The characters stand on the page's own
 *    cosmic backdrop, which is how the original full-size version read, and
 *    the ambient glow does the separating that a rectangle was doing badly.
 *  - The portrait is the biggest thing in each column, not an afterthought.
 *  - Still ONE ROW, still far shorter than the three full-height cards it
 *    replaced.
 *
 * The villain keeps his red treatment against the heroes' blue, and keeps the
 * condensed threat copy from the deleted "Who is the Hacker Raccoon?" panel:
 * that was the only place the page told a PARENT what the course defends
 * against, so it travels with him.
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
    img: "/characters/cast-adam.webp",
    alt: "Adam, curious and brave Cyber Hero",
    blurb: "Curious and brave. A gamer who wants to keep his digital world safe.",
    accent: "#7c5cff",
    glow: "rgba(124,92,255,0.5)",
  },
  {
    name: "Layla",
    img: "/characters/cast-layla.webp",
    alt: "Layla, smart and fearless Cyber Hero",
    blurb: "Smart and fearless. She knows staying safe online is a superpower.",
    accent: "#36d6ff",
    glow: "rgba(54,214,255,0.45)",
  },
  {
    name: "The Hacker Raccoon",
    img: "/characters/cast-raccoon.webp",
    alt: "The Hacker Raccoon, the villain",
    blurb:
      "Not just a cartoon villain. He runs the real attacks: phishing dressed up as game rewards, chat-room tricks, fake apps and password cracking. A new tactic every week, and your child learns to block every one.",
    accent: "#ff5f6d",
    glow: "rgba(255,95,109,0.42)",
    villain: true,
  },
];

export default function CastRow({ accentText }: { accentText: React.CSSProperties }) {
  return (
    <section id="heroes" className="max-w-[1150px] mx-auto px-6 md:px-10 py-10 sm:py-14">
      <div className="text-center mb-6" data-scroll>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Meet the <span style={accentText}>Characters</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8" data-scroll>
        {CAST.map((m) => (
          <div key={m.name} style={{ textAlign: "center" }}>
            {/* The portrait leads. No frame: it emerges from the backdrop with
              * its own glow, which is what made the original read well. */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 290,
                margin: "0 auto 12px",
                filter: `drop-shadow(0 0 28px ${m.glow}) drop-shadow(0 0 60px ${m.glow.replace(/[\d.]+\)$/, "0.16)")})`,
              }}
            >
              <Image
                src={m.img}
                alt={m.alt}
                fill
                sizes="(max-width: 640px) 60vw, 300px"
                style={{ objectFit: "contain", objectPosition: "center bottom" }}
              />
            </div>

            <h3
              className="display-font"
              style={{
                color: m.villain ? m.accent : "#fff",
                fontSize: 18,
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 5,
              }}
            >
              {m.name}
            </h3>
            <p
              style={{
                color: "#c5cdf0",
                fontSize: 13,
                lineHeight: 1.55,
                maxWidth: 320,
                margin: "0 auto",
              }}
            >
              {m.blurb}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
