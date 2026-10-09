"use client";

/**
 * HeroDeskScene - the homepage first screen, round four (owner idea
 * 2026-10-09: "a table in the background, and the laptop positioned
 * like it's on the table, opening as you scroll").
 *
 * The REAL scroll-pinned machine (HeroCinematicV3's full lid-opening
 * ride, overlay off, ambience off) composited onto a bright
 * photographed desk (public/landing/hero-desk.webp, OpenArt): closed
 * at its familiar angle on the tabletop at scroll 0, booting into the
 * threat console as the visitor scrolls. Copy column and the four
 * accreditation plates ride inside the pinned frame, so the whole
 * composition holds while the lid opens.
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

function DeskBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/hero-desk.webp"
        alt=""
        fetchPriority="high"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 64%" }}
      />
      {/* paper veil: keeps the photo warm but quiet, and lifts the
          left column for the copy */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(248,244,236,0.96) 0%, rgba(248,244,236,0.8) 42%, rgba(248,244,236,0.16) 66%, rgba(248,244,236,0.05) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(248,244,236,0.5) 0%, rgba(248,244,236,0) 30%, rgba(248,244,236,0) 70%, rgba(248,244,236,0.65) 100%)" }} />
      {/* contact shadow on the tabletop, under the machine's spot */}
      <div
        style={{
          position: "absolute",
          left: "66%",
          top: "64%",
          width: 700,
          height: 190,
          transform: "translate(-50%, -30%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse 48% 40% at 50% 50%, rgba(70,55,35,0.3), rgba(70,55,35,0.1) 55%, transparent 72%)",
        }}
      />
    </div>
  );
}

function DeskCopy() {
  return (
    <>
      {/* copy column - pinned with the machine while the lid opens */}
      <div
        className="hds-copy"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 96,
          width: "100%",
          maxWidth: 1340,
          margin: "0 auto",
          right: 0,
          padding: "116px 24px 0 5vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <h1
          className="hds-enter"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(2.3rem, 3.9vw, 3.8rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.026em",
            fontWeight: 650,
            margin: 0,
            maxWidth: "15ch",
            color: "#14161d",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          Cyber and AI skills for{" "}
          <span className="hds-grad" style={{ textShadow: "none" }}>all ages, schools and firms.</span>
        </h1>
        <p
          className="hds-enter hds-enter-2"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(0.95rem, 1.15vw, 1.0625rem)",
            lineHeight: 1.6,
            color: "#3c4351",
            maxWidth: "40ch",
            margin: "20px 0 0",
          }}
        >
          Cyber security taught properly, from age 6 all the way through to
          adulthood. One platform that grows with the learner, built on real
          projects with the AI tools that are rewriting every industry.
        </p>
        <div
          className="hds-enter hds-enter-3"
          style={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", gap: 10, marginTop: 26, maxWidth: 500 }}
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
                background: "rgba(255,253,248,0.75)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              {a}
            </span>
          ))}
        </div>
        <p
          className="hds-enter hds-enter-3"
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "rgba(60,67,81,0.65)",
            margin: "30px 0 0",
          }}
        >
          SCROLL · THE MACHINE BOOTS ↓
        </p>
      </div>

      {/* accreditations land inside the fold, over the desk's edge */}
      <div
        className="hds-enter hds-enter-4"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5, pointerEvents: "none" }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "0 24px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "14px 34px",
            paddingTop: 20,
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
                  boxShadow: "0 4px 12px -6px rgba(20,22,29,0.3)",
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
                  color: "#4a5160",
                }}
              >
                {a.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hds-grad {
          background: linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @media (prefers-reduced-motion: no-preference) {
          .hds-enter {
            opacity: 0;
            animation: hdsRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .hds-enter-2 { animation-delay: 0.14s; }
          .hds-enter-3 { animation-delay: 0.26s; }
          .hds-enter-4 { animation-delay: 0.4s; }
        }
        @keyframes hdsRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 980px) {
          .hds-copy {
            align-items: center !important;
            text-align: center;
            padding-left: 24px !important;
          }
          .hds-copy > div { justify-content: center !important; }
        }
      `}</style>
    </>
  );
}

export default function HeroDeskScene() {
  return (
    <HeroCinematic
      overlay={false}
      ambience={false}
      backdrop={<DeskBackdrop />}
      frameChildren={<DeskCopy />}
    />
  );
}
