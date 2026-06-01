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
                background: "#0a0f1c",
                borderRadius: 24,
                padding: "60px 40px",
                textAlign: "center",
              }}
            >
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
                Ready to start?
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
  background: "#00e5ff",
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
  boxShadow: "0 8px 28px rgba(0,229,255,0.34)",
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
