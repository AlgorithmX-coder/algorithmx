"use client";

/**
 * HeroPowerLab - the homepage first screen, round three (owner
 * 2026-10-09: "back to being light, and I like the whole laptop thing
 * - give me something new").
 *
 * A bright lab bench: the warm paper ground the owner likes, with the
 * techie energy kept from the threat-map round - PCB-style circuit
 * traces run across the page carrying glowing power pulses, and every
 * trace feeds the 3D laptop sitting open on the right with the dark
 * threat console lit (HeroCinematicV3 staticOpen; the dark screen is
 * the frame's focal pop against the paper).
 *
 * Kept from the dark round, restated for light: bold headline with the
 * sand-safe gradient accent, the age strip including SCHOOLS, and all
 * four accreditations on plates inside the fold.
 *
 * Motion: SMIL pulses on the traces (hidden under reduced motion via
 * .hpl-anim) and a one-time entrance stagger. No scroll pinning.
 */

import HeroCinematic from "./HeroCinematicV3";

const AGES = ["AGES 6-9", "10-13", "14-17", "18+", "SCHOOLS", "WORKPLACE"];

const ACCREDITATIONS: Array<{
  src: string;
  alt: string;
  label: string;
  dark?: boolean;
  h: number;
}> = [
  { src: "/logos/cyber-essentials.png", alt: "Cyber Essentials", label: "Certified", h: 20 },
  { src: "/logos/ncsc.svg", alt: "National Cyber Security Centre", label: "Aligned", dark: true, h: 19 },
  { src: "/logos/microsoft-for-startups.webp", alt: "Microsoft for Startups", label: "Collaborating", h: 15 },
  { src: "/logos/asdan.jpg", alt: "ASDAN", label: "Accredited", h: 20 },
];

/* Traces route left-to-right into the machine's corner; pulses ride
 * them. Orthogonal PCB runs, drawn once, animated by SMIL only. */
/* Routes stay clear of the copy zone (x < 620 between y 150 and 600)
 * so no hairline ever runs under the headline, subline or chips. */
const TRACES: Array<{ d: string; dur: string; begin: string; c: string }> = [
  { d: "M-20,115 H640 V300 H1030", dur: "6.5s", begin: "0s", c: "#0a7085" },
  { d: "M-20,640 H300 V690 H760 V520 H1040", dur: "5.6s", begin: "1.4s", c: "#5744c9" },
  { d: "M240,830 V720 H860 V580 H1060", dur: "7.2s", begin: "0.7s", c: "#a5117f" },
  { d: "M1460,170 H1180 V330 H1050", dur: "4.8s", begin: "2.2s", c: "#0a7085" },
];

export default function HeroPowerLab() {
  return (
    <section
      className="hpl-root"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8f4ec 0%, #f6f1e9 55%, #f1e9dc 100%)",
      }}
    >
      {/* warm key light over the copy, cool breath behind the machine */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 44% at 22% 24%, rgba(255,253,248,0.9), transparent 70%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 34% 40% at 76% 46%, rgba(10,112,133,0.08), transparent 72%)" }} />

      {/* circuit board: traces, pads, and power pulses riding them */}
      <svg
        aria-hidden
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <g stroke="rgba(10,112,133,0.2)" fill="none" strokeWidth={1.4}>
          {TRACES.map((t, i) => (
            <path key={i} d={t.d} />
          ))}
        </g>
        <g fill="rgba(10,112,133,0.4)">
          <circle cx={640} cy={115} r={3.2} />
          <circle cx={300} cy={640} r={3.2} />
          <circle cx={760} cy={690} r={3.2} />
          <circle cx={240} cy={720} r={3.2} />
          <circle cx={860} cy={720} r={3.2} />
          <circle cx={1180} cy={170} r={3.2} />
          <circle cx={1180} cy={330} r={3.2} />
        </g>
        {/* power flowing into the machine (owner loved the pulses) */}
        <g className="hpl-anim">
          {TRACES.map((t, i) => (
            <g key={i}>
              <circle r={3.4} fill={t.c} opacity={0.9}>
                <animateMotion dur={t.dur} begin={t.begin} repeatCount="indefinite" path={t.d} />
              </circle>
              <circle r={5.4} fill="none" stroke={t.c} strokeWidth={0.9} opacity={0.3}>
                <animateMotion dur={t.dur} begin={t.begin} repeatCount="indefinite" path={t.d} />
              </circle>
              <circle r={2} fill={t.c} opacity={0.4}>
                <animateMotion dur={t.dur} begin={`${parseFloat(t.begin) + 0.25}s`} repeatCount="indefinite" path={t.d} />
              </circle>
            </g>
          ))}
        </g>
      </svg>

      {/* THE MACHINE - open on the dark threat console, the frame's
          focal contrast against the paper. staticOpen: no scroll rail,
          dark-round ambience suppressed; its course links stay live. */}
      <div
        className="hpl-stage"
        style={{
          position: "absolute",
          right: "-1vw",
          top: 86,
          bottom: 132,
          width: "56%",
          zIndex: 2,
          transform: "scale(0.94)",
          transformOrigin: "60% 32%",
        }}
      >
        {/* contact shadow so the machine sits on the bench */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "66%",
            width: 640,
            height: 170,
            transform: "translate(-50%, 0)",
            borderRadius: "50%",
            background: "radial-gradient(ellipse 50% 42% at 50% 50%, rgba(60,50,35,0.26), rgba(60,50,35,0.08) 55%, transparent 72%)",
          }}
        />
        <HeroCinematic overlay={false} staticOpen />
      </div>

      {/* copy column */}
      <div
        className="hpl-copy"
        style={{
          position: "relative",
          zIndex: 3,
          flex: 1,
          width: "100%",
          maxWidth: 1340,
          margin: "0 auto",
          padding: "116px 24px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          pointerEvents: "none",
        }}
      >
        <h1
          className="hpl-enter"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(2.3rem, 3.9vw, 3.8rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.026em",
            fontWeight: 650,
            margin: 0,
            maxWidth: "15ch",
            color: "#14161d",
          }}
        >
          Cyber and AI skills for{" "}
          <span className="hpl-grad">all ages, schools and firms.</span>
        </h1>
        <p
          className="hpl-enter hpl-enter-2"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(0.95rem, 1.15vw, 1.0625rem)",
            lineHeight: 1.6,
            color: "#3c4351",
            maxWidth: "42ch",
            margin: "20px 0 0",
          }}
        >
          Cyber security taught properly, from age 6 all the way through to
          adulthood. One platform that grows with the learner, built on real
          projects with the AI tools that are rewriting every industry.
        </p>

        {/* the children-to-adults promise, stated outright */}
        <div
          className="hpl-enter hpl-enter-3"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 26,
            maxWidth: 500,
          }}
        >
          {AGES.map((a) => (
            <span
              key={a}
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#075a6b",
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid rgba(10,112,133,0.4)",
                background: "rgba(10,112,133,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* accreditations land inside the fold */}
      <div
        className="hpl-enter hpl-enter-4"
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "26px 24px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "14px 34px",
            paddingTop: 22,
            borderTop: "1px solid rgba(20,22,29,0.14)",
          }}
        >
          {ACCREDITATIONS.map((a) => (
            <span key={a.alt} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 8,
                  background: a.dark ? "#14161d" : "#fff",
                  border: a.dark ? "none" : "1px solid rgba(20,22,29,0.12)",
                  boxShadow: "0 4px 12px -6px rgba(20,22,29,0.25)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.src} alt={a.alt} style={{ display: "block", height: a.h, width: "auto" }} />
              </span>
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#5d6472",
                }}
              >
                {a.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hpl-grad {
          background: linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @media (prefers-reduced-motion: no-preference) {
          .hpl-enter {
            opacity: 0;
            animation: hplRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .hpl-enter-2 { animation-delay: 0.14s; }
          .hpl-enter-3 { animation-delay: 0.26s; }
          .hpl-enter-4 { animation-delay: 0.4s; }
        }
        @keyframes hplRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* SMIL ignores the motion query, so the pulses hide outright
           for reduced-motion users; the traces still draw the board. */
        @media (prefers-reduced-motion: reduce) {
          .hpl-anim { display: none; }
        }
        /* Narrow screens: the machine bows out and the copy re-centres. */
        @media (max-width: 980px) {
          .hpl-stage { display: none; }
          .hpl-copy {
            align-items: center !important;
            text-align: center;
          }
          .hpl-copy > div { justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}
