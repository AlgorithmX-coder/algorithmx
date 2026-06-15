"use client";

import Link from "next/link";
import { useRef } from "react";
import { FadeUp, Ico, useMagnetic } from "./utilities";

/**
 * Final CTA - bright section background, dark "brand card" as focal
 * point with rotating-gradient ring. CTAs are magnetic on cursor.
 */
export default function FinalCTA() {
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const secondaryRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(primaryRef, { strength: 0.32, radius: 110 });
  useMagnetic(secondaryRef, { strength: 0.32, radius: 110 });
  return (
    <section
      id="final-cta"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 2.4) var(--lv2-rail)",
      }}
    >
      {/* Top divider hairline removed — it drew a faint horizontal seam
       * across the section. FAQ above and this section are both
       * transparent over the fixed cosmic backdrop, so with the line
       * gone they flow as one continuous space into the CTA card. */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <FadeUp>
          <div
            style={{
              borderRadius: 26,
              padding: 2,
              background:
                "conic-gradient(from var(--angle, 0deg), #00b8d4, #7c5cff, #d97f1a, #ff3ad6, #16a34a, #00b8d4)",
              animation: "lv2RotGrad 7s linear infinite",
              boxShadow: "0 30px 80px rgba(0,184,212,0.18)",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background:
                  "radial-gradient(125% 90% at 50% -10%, #141b30 0%, #0a0f1c 52%, #06080f 100%)",
                borderRadius: 24,
                padding: "60px 40px",
                textAlign: "center",
              }}
            >
              {/* cosmic glow + faint stars inside the card */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(55% 45% at 50% 26%, rgba(70,150,255,0.16), transparent 70%), radial-gradient(45% 40% at 82% 86%, rgba(168,139,255,0.14), transparent 72%)",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: 0.55,
                  backgroundImage:
                    "radial-gradient(1px 1px at 18% 28%, rgba(200,220,255,0.7), transparent), radial-gradient(1px 1px at 72% 18%, rgba(200,220,255,0.55), transparent), radial-gradient(1.4px 1.4px at 86% 58%, rgba(180,210,255,0.6), transparent), radial-gradient(1px 1px at 33% 74%, rgba(200,220,255,0.45), transparent), radial-gradient(1px 1px at 58% 46%, rgba(200,220,255,0.4), transparent), radial-gradient(1.3px 1.3px at 12% 62%, rgba(180,210,255,0.55), transparent), radial-gradient(1px 1px at 90% 32%, rgba(200,220,255,0.45), transparent)",
                }}
              />
              <div style={{ position: "relative" }}>
              <p
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "#7df0ff",
                  marginBottom: 14,
                }}
              >
                // BEGIN TRANSMISSION
              </p>
              <h2
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: "clamp(32px, 4.2vw, 48px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.05,
                }}
              >
                Ready to{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg,#36d6ff,#a98bff)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  start?
                </span>
              </h2>
              <p
                style={{
                  color: "rgba(232,237,255,0.74)",
                  fontSize: 17,
                  lineHeight: 1.7,
                  maxWidth: 440,
                  margin: "20px auto 32px",
                }}
              >
                Choose a subject, pick your level, and begin today.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 22,
                }}
              >
                <a
                  ref={primaryRef}
                  href="#subjects"
                  style={ctaPrimary}
                  data-plausible="landing-v2-final-primary"
                >
                  Find a Course
                  <Ico name="arrow" size={14} sw={2.2} />
                </a>
                <Link
                  ref={secondaryRef as unknown as React.Ref<HTMLAnchorElement>}
                  href="/signup"
                  style={ctaSecondary}
                  data-plausible="landing-v2-final-secondary"
                >
                  Create Account
                </Link>
              </div>

              <p
                style={{
                  color: "rgba(232,237,255,0.55)",
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                One-time payment · Lifetime access
              </p>
              <p style={{ marginTop: 10, fontSize: 12 }}>
                <a
                  href="mailto:support@algorithmx.co.uk"
                  style={{
                    color: "rgba(232,237,255,0.55)",
                    textDecoration: "none",
                  }}
                >
                  Questions? support@algorithmx.co.uk
                </a>
              </p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>

      <style jsx global>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes lv2RotGrad {
          to {
            --angle: 360deg;
          }
        }
      `}</style>
    </section>
  );
}

const ctaPrimary: React.CSSProperties = {
  background: "linear-gradient(135deg, #3ee0ff 0%, #6f8cff 55%, #a98bff 100%)",
  color: "#04050d",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 26px",
  borderRadius: 999,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow:
    "0 10px 30px rgba(90,150,255,0.45), inset 0 0 0 1px rgba(255,255,255,0.08)",
  willChange: "transform",
};

const ctaSecondary: React.CSSProperties = {
  background: "rgba(232,237,255,0.05)",
  color: "#ffffff",
  border: "1px solid rgba(232,237,255,0.22)",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 26px",
  borderRadius: 999,
  textDecoration: "none",
  backdropFilter: "blur(6px)",
  willChange: "transform",
};
