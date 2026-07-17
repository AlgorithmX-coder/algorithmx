"use client";

import { TRUST_LOGOS } from "./data";
import { FadeUp, Marquee } from "./utilities";

/**
 * Credibility section — the industry-technology strip.
 *
 * HONESTY PASS (2026-07-17): the testimonial marquee was removed. The
 * quotes were placeholder personas, and publishing invented consumer
 * reviews is a banned practice under the UK DMCC Act 2024 — restore a
 * testimonial wall ONLY with genuinely collected, consented, dated
 * quotes. The logo strip stays but is reframed from "Trusted & aligned
 * with" (implied endorsement) to the factual claim: these are the
 * technologies the curriculum teaches with. Institutional marks that
 * read as endorsements (NCSC, King's Trust, CompTIA) were removed.
 */
export default function Testimonials() {
  return (
    <section
      id="testimonials"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 2.2) 0",
        color: "var(--lv2-paper)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,255,0.32), transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          padding: "0 var(--lv2-rail)",
          textAlign: "center",
          marginBottom: 56,
        }}
      >
        <FadeUp>
          <p
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(232,237,255,0.55)",
              marginBottom: 12,
            }}
          >
            {"// THE REAL TOOLKIT"}
          </p>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h2
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--lv2-paper)",
              margin: 0,
            }}
          >
            Learn the technology the industry runs on.
          </h2>
        </FadeUp>
      </div>

      <div style={{ textAlign: "center", padding: "0 var(--lv2-rail)" }}>
        <p
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            /* Alpha 0.5 -> 0.7 so the label meets WCAG AA contrast on
             * the dark backdrop (was the only remaining Lighthouse
             * accessibility issue). */
            color: "rgba(232,237,255,0.7)",
            marginBottom: 28,
          }}
        >
          Curriculum built around tools from
        </p>
      </div>
      <Marquee
        items={TRUST_LOGOS}
        speed={48}
        itemKey={(l) => l.name}
        renderItem={(l) => (
          <div
            title={l.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              padding: "0 30px",
            }}
          >
            {/* Each SVG carries its official brand color baked into the
             *  file (Microsoft = its four real square colors; Apple and
             *  Unity stay white — that IS their correct dark-background
             *  treatment). Resting slightly
             *  dimmed so the row doesn't outshine the content, full
             *  color on hover. */}
            <img
              src={l.src}
              alt={l.name}
              loading="lazy"
              style={{
                height: 30,
                width: "auto",
                maxWidth: 150,
                objectFit: "contain",
                opacity: 0.85,
                transition: "opacity .3s ease",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "1";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.85";
              }}
            />
          </div>
        )}
      />
    </section>
  );
}
