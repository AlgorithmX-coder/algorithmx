"use client";

import { TESTIMONIALS, TRUST_LOGOS } from "./data";
import { FadeUp, Marquee, Ico } from "./utilities";

/**
 * Credibility section - testimonials marquee + trust logos.
 *
 * Bright theme. Cards are white with accent-coloured left rails.
 * Marquee accelerates 45% on hover instead of pausing - reactive.
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
            // FIELD REPORTS
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
            Trusted by parents, teachers &amp; learners.
          </h2>
        </FadeUp>
      </div>

      <div style={{ marginBottom: 72 }}>
        <Marquee
          items={TESTIMONIALS}
          speed={70}
          itemKey={(t) => t.name}
          renderItem={(t) => (
            <div
              style={{
                width: 360,
                background: "rgba(13,15,24,0.72)",
                backdropFilter: "blur(14px) saturate(1.4)",
                WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                border: "1px solid rgba(232,237,255,0.08)",
                borderLeft: `4px solid ${t.accent}`,
                borderRadius: 16,
                padding: 26,
                position: "relative",
                overflow: "hidden",
                height: 240,
                display: "flex",
                flexDirection: "column",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.4), 0 14px 36px rgba(0,0,0,0.25)",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 12,
                  left: 18,
                  opacity: 0.14,
                }}
              >
                <Ico name="quote" size={42} color={t.accent} sw={1.4} />
              </div>
              <p
                style={{
                  color: "rgba(232,237,255,0.84)",
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  marginBottom: 14,
                  position: "relative",
                  flex: 1,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <p
                style={{
                  color: "var(--lv2-paper)",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "var(--lv2-font-display)",
                }}
              >
                {t.name}
              </p>
              <p
                style={{
                  color: "rgba(232,237,255,0.52)",
                  fontSize: 12,
                  fontFamily: "var(--lv2-font-mono)",
                  letterSpacing: "0.06em",
                  marginTop: 2,
                }}
              >
                {t.title}
              </p>
            </div>
          )}
        />
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
          Trusted &amp; aligned with
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
              padding: "0 22px",
              opacity: 0.9,
            }}
          >
            {l.src ? (
              <img
                src={l.src}
                alt={l.name}
                width={48}
                height={48}
                loading="lazy"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(232,237,255,0.78)",
                  padding: "10px 18px",
                  border: "1px solid rgba(232,237,255,0.12)",
                  borderRadius: 8,
                  background: "rgba(13,15,24,0.6)",
                  backdropFilter: "blur(10px)",
                  whiteSpace: "nowrap",
                }}
              >
                {l.name}
              </span>
            )}
          </div>
        )}
      />
    </section>
  );
}
