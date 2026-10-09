"use client";

/**
 * HeroThreatMap - the homepage's first screen (owner pick 2026-10-09,
 * concept "04 Threat Map" from the 20-concept round; replaces the
 * laptop cinematic, which stays on disk).
 *
 * One full-viewport frame over a cinematic London-at-dusk render
 * (OpenArt, public/landing/hero-london.webp) with a live defence
 * network drawn over the city: nodes, arcs and pulsing intercepts.
 *
 * Owner requirements baked in:
 *  - headline audience widened: "people" -> "all ages" so children,
 *    teenagers and adults all read themselves into it, backed by an
 *    explicit age-range strip under the subline;
 *  - ALL accreditations land inside the fold: Cyber Essentials, NCSC,
 *    Microsoft for Startups and ASDAN on their own plates along the
 *    bottom of the frame (Microsoft wording is COLLABORATING, per
 *    their guidance - never "partner");
 *  - the Courses / Schools / Corporate tabs stay in the Nav, which the
 *    page switches to night tone so the chips glow against the image.
 *
 * Motion: SVG pings + a drifting glow, CSS/SMIL only, all behind
 * prefers-reduced-motion guards. No scroll pinning - the frame is one
 * viewport and the page simply continues below.
 */

const AGES = ["AGES 6-9", "10-13", "14-17", "18+", "WORKPLACE"];

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

export default function HeroThreatMap() {
  return (
    <section
      className="htm-root"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        overflow: "hidden",
        background: "#0b1120",
      }}
    >
      {/* city at dusk */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/hero-london.webp"
        alt=""
        fetchPriority="high"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 38%" }}
      />
      {/* navy grade: legible nav at the top, anchored copy and plates at the bottom */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11,17,32,0.62) 0%, rgba(11,17,32,0.3) 26%, rgba(11,17,32,0.44) 55%, rgba(11,17,32,0.88) 82%, rgba(11,17,32,0.97) 100%)",
        }}
      />
      {/* slow aurora drift so the frame never sits perfectly still */}
      <div
        aria-hidden
        className="htm-glow"
        style={{
          position: "absolute",
          width: "58vw",
          height: "40vw",
          left: "18vw",
          top: "-8vw",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(63,208,255,0.12), transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* defence network over the city */}
      <svg
        aria-hidden
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.8 }}
      >
        <g fill="rgba(125,231,255,0.75)">
          {[
            [196, 258], [340, 206], [472, 264], [608, 196], [742, 238],
            [872, 198], [1012, 252], [1148, 214], [1278, 262], [548, 330],
            [930, 330], [702, 352],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.4} />
          ))}
        </g>
        <g stroke="rgba(63,208,255,0.35)" fill="none" strokeWidth={1.1}>
          <path d="M340,206 Q470,96 608,196" />
          <path d="M608,196 Q740,110 872,198" />
          <path d="M872,198 Q1010,120 1148,214" />
          <path d="M472,264 Q590,180 742,238" opacity={0.6} />
          <path d="M742,238 Q900,170 1012,252" opacity={0.6} />
          <path d="M196,258 Q360,150 548,330" opacity={0.45} />
          <path d="M1148,214 Q1240,230 1278,262" opacity={0.5} />
        </g>
        {/* intercept pings - green for held, red for the one being blocked */}
        <circle className="htm-anim" cx={608} cy={196} r={6} fill="none" stroke="#ff5d73" strokeWidth={1.4}>
          <animate attributeName="r" values="3;22" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle className="htm-anim" cx={872} cy={198} r={6} fill="none" stroke="#2fe28a" strokeWidth={1.4}>
          <animate attributeName="r" values="3;22" dur="2.6s" begin="0.9s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0" dur="2.6s" begin="0.9s" repeatCount="indefinite" />
        </circle>
        <circle className="htm-anim" cx={472} cy={264} r={6} fill="none" stroke="#2fe28a" strokeWidth={1.4}>
          <animate attributeName="r" values="3;20" dur="2.6s" begin="1.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0" dur="2.6s" begin="1.7s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* copy block */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "140px 24px 0",
          textAlign: "center",
        }}
      >
        <h1
          className="htm-enter"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(2.4rem, 5.4vw, 5rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.028em",
            fontWeight: 500,
            margin: "0 auto",
            color: "#f2f6ff",
            textShadow: "0 2px 30px rgba(4,8,18,0.55)",
          }}
        >
          Cyber and AI skills for
          <br />
          <span className="htm-grad">all ages, schools and firms.</span>
        </h1>
        <p
          className="htm-enter htm-enter-2"
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "clamp(0.95rem, 1.2vw, 1.0625rem)",
            lineHeight: 1.6,
            color: "rgba(225,233,250,0.88)",
            maxWidth: "56ch",
            margin: "20px auto 0",
            textShadow: "0 1px 14px rgba(4,8,18,0.6)",
          }}
        >
          Cyber security taught properly, from age 6 all the way through to
          adulthood. One platform that grows with the learner, built on real
          projects with the AI tools that are rewriting every industry.
        </p>

        {/* the children-to-adults promise, stated outright */}
        <div
          className="htm-enter htm-enter-3"
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 26,
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
                color: "#9feaff",
                padding: "7px 14px",
                borderRadius: 999,
                border: "1px solid rgba(125,231,255,0.32)",
                background: "rgba(63,208,255,0.1)",
              }}
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* accreditations land inside the fold */}
      <div
        className="htm-enter htm-enter-4"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "40px 24px 34px",
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
            borderTop: "1px solid rgba(159,234,255,0.2)",
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
                  border: a.dark ? "1px solid rgba(159,245,255,0.3)" : "none",
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
                  color: "rgba(205,228,250,0.78)",
                }}
              >
                {a.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .htm-grad {
          background: linear-gradient(92deg, #22d3ee 0%, #8b7bff 55%, #f472b6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        @media (prefers-reduced-motion: no-preference) {
          .htm-glow {
            animation: htmDrift 18s ease-in-out infinite alternate;
          }
          .htm-enter {
            opacity: 0;
            animation: htmRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .htm-enter-2 { animation-delay: 0.14s; }
          .htm-enter-3 { animation-delay: 0.26s; }
          .htm-enter-4 { animation-delay: 0.4s; }
        }
        @keyframes htmDrift {
          to { transform: translate3d(8vw, 3vh, 0); }
        }
        @keyframes htmRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .htm-root { justify-content: flex-end; }
        }
        /* SMIL ignores the motion query, so the pinging circles are
           hidden outright for reduced-motion users; the static nodes
           and arcs still draw the network. */
        @media (prefers-reduced-motion: reduce) {
          .htm-anim { display: none; }
        }
      `}</style>
    </section>
  );
}
