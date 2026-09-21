"use client";

import { FadeUp } from "./landing-v2/utilities";

/**
 * ProofBand — the four accreditations, given a section of their own.
 *
 * Used by the homepage and by /schools (owner 2026-09-21: "the same way
 * on the schools page"). One component, so the wording and the artwork
 * rules cannot drift between the two.
 *
 * Chosen by the owner from a board of twenty presentations (2026-09-20,
 * option 19). The marks used to sit under the hero CTA, where four full
 * size pills plus the hero above them would not fit a laptop window: the
 * bottom ones kept landing below the fold, which the owner reported three
 * times. Here they are the first thing past the hero, at a size that does
 * not depend on the window height, and each one has room for a line
 * saying what it actually means.
 *
 * Two rules constrain the artwork. Cyber Essentials, Microsoft and ASDAN
 * are dark marks and need a light plate. The NCSC crest is white artwork
 * and cannot sit on one, and neither that crest nor the Microsoft logo
 * may be recoloured to match, so the NCSC keeps a dark field. Every line
 * of copy states a benefit and carries no figure.
 */

interface Mark {
  name: string;
  copy: string;
  src: string;
  alt: string;
  /* Each logo is a different shape, so the width is set per mark and the
     height follows. The plates share a height instead. */
  width: number;
  dark?: boolean;
}

const MARKS: Mark[] = [
  {
    name: "Cyber Essentials certified",
    copy: "The UK government backed standard for cyber security practice.",
    src: "/logos/cyber-essentials.png",
    alt: "Cyber Essentials",
    width: 96,
  },
  {
    name: "Aligned with the NCSC",
    copy: "Course content follows National Cyber Security Centre guidance.",
    src: "/logos/ncsc.svg",
    alt: "National Cyber Security Centre",
    width: 132,
    dark: true,
  },
  {
    name: "Partnered with Microsoft",
    copy: "AlgorithmX is part of the Microsoft for Startups programme.",
    src: "/logos/microsoft-for-startups.webp",
    alt: "Microsoft for Startups",
    width: 140,
  },
  {
    name: "ASDAN accredited courses",
    copy: "Courses carry accreditation that schools already recognise.",
    src: "/logos/asdan.jpg",
    alt: "ASDAN",
    width: 96,
  },
];

export default function ProofBand() {
  return (
    <section
      id="accreditations"
      aria-label="Accreditations"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 1.1) var(--lv2-rail) calc(var(--lv2-rail) * 0.6)",
        color: "var(--lv2-paper)",
      }}
    >
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <FadeUp>
          <div className="lv2-proof">
            <p className="lv2-proof-kicker">{"// Accredited, certified and backed"}</p>
            <ul className="lv2-proof-cols">
              {MARKS.map((m) => (
                <li key={m.name} className="lv2-proof-col">
                  <span className={m.dark ? "lv2-proof-plate lv2-proof-plate-dark" : "lv2-proof-plate"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.src}
                      alt={m.alt}
                      style={{ width: m.width, height: "auto", display: "block" }}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <b className="lv2-proof-name">{m.name}</b>
                  <span className="lv2-proof-copy">{m.copy}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeUp>
      </div>

      <style jsx>{`
        .lv2-proof {
          border-radius: 18px;
          border: 1px solid rgba(159, 245, 255, 0.14);
          background:
            linear-gradient(180deg, rgba(14, 26, 58, 0.72) 0%, rgba(6, 11, 28, 0.72) 100%);
          box-shadow: 0 0 90px -50px rgba(159, 245, 255, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 26px 26px 28px;
        }
        .lv2-proof-kicker {
          font-family: var(--lv2-font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--lv2-cyan-soft);
          margin: 0 0 22px;
        }
        .lv2-proof-cols {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 26px;
        }
        .lv2-proof-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        /* The plates share a height so four differently shaped logos still
           sit on one line across the row. */
        .lv2-proof-plate {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 8px 14px;
          border-radius: 10px;
          background: #fff;
        }
        .lv2-proof-plate-dark {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(159, 245, 255, 0.18);
        }
        .lv2-proof-name {
          font-family: var(--lv2-font-display);
          font-size: 0.9375rem;
          font-weight: 600;
          letter-spacing: -0.005em;
          line-height: 1.3;
          color: var(--lv2-paper);
        }
        .lv2-proof-copy {
          font-family: var(--lv2-font-display);
          font-size: 0.8125rem;
          line-height: 1.55;
          color: rgba(232, 237, 255, 0.62);
        }
        @media (max-width: 900px) {
          .lv2-proof { padding: 22px 20px 24px; }
          .lv2-proof-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
        }
        @media (max-width: 520px) {
          .lv2-proof-cols { grid-template-columns: minmax(0, 1fr); gap: 20px; }
          .lv2-proof-kicker { font-size: 10px; letter-spacing: 0.2em; margin-bottom: 18px; }
        }
      `}</style>
    </section>
  );
}
