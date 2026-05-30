"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { STEPS } from "./data";
import { FadeUp } from "./utilities";

/**
 * 5-step "How It Works" - Choose / Pick / Enrol / Learn & Build /
 * Earn a Qualification.
 *
 * Bright theme. Animated gradient progress line draws across as the
 * section comes into view. Steps pop in with cascading scale-in. The
 * 5th step communicates the qualification route honestly: "working
 * toward CyberFirst & ASDAN recognition" (not yet accredited).
 */
export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section
      id="how"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 2.2) var(--lv2-rail)",
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
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
              // SEQUENCE
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
              How it works.
            </h2>
          </FadeUp>
        </div>

        <div
          ref={ref}
          className="lv2-steps"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            position: "relative",
            gap: 12,
          }}
        >
          {/* Animated progress line */}
          <div
            aria-hidden
            className="lv2-steps-line"
            style={{
              position: "absolute",
              top: 28,
              left: 28,
              right: 28,
              height: 2,
              zIndex: 0,
              background: "rgba(232,237,255,0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(90deg, #00f5ff, #5fffa3, #ff7a3d, #ffc94a, #a667ff)",
                boxShadow: "0 0 16px rgba(0,229,255,0.6)",
                width: inView ? "100%" : "0%",
                transition: "width 1.8s cubic-bezier(0.16,1,0.3,1)",
                borderRadius: 2,
              }}
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.55,
                delay: 0.25 + i * 0.2,
                type: "spring",
                stiffness: 180,
                damping: 17,
              }}
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                flex: 1,
                minWidth: 0,
                cursor: "default",
              }}
              whileHover={{ scale: 1.06 }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(13,15,24,0.85)",
                  backdropFilter: "blur(10px)",
                  border: `2.5px solid ${step.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 28px ${step.accent}55`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: step.accent,
                  }}
                >
                  {step.n}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--lv2-paper)",
                  marginTop: 18,
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "rgba(232,237,255,0.65)",
                  fontSize: 13.5,
                  marginTop: 6,
                  lineHeight: 1.5,
                  maxWidth: 200,
                }}
              >
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          .lv2-steps {
            flex-direction: column;
            gap: 32px !important;
          }
          .lv2-steps-line {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
