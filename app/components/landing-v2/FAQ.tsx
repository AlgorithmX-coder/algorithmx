"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "./utilities";

/**
 * FAQ — "Before you start." A drill-down accordion of the questions parents
 * ask before joining. Each row carries a number + icon; the open row glows
 * with a gradient edge and a left accent bar. Sits just before the final CTA.
 */

type FaqIcon = "ages" | "tag" | "code" | "clock" | "shield" | "bank";

interface QA {
  q: string;
  a: string;
  icon: FaqIcon;
}

const FAQS: QA[] = [
  {
    icon: "ages",
    q: "What ages is AlgorithmX for?",
    a: "Everyone from age 6 to adult. AlgorithmX is a multi-track platform built for the whole journey — young children start with foundational courses like Cyber Heroes Academy, while older learners and adults work toward recognised qualification pathways. Whatever the age or stage, there's a track designed for it.",
  },
  {
    icon: "tag",
    q: "How much does it cost?",
    a: "£99 as a one-time payment per course — no subscriptions and no hidden fees. Pay once, keep lifetime access. School licensing is priced separately.",
  },
  {
    icon: "code",
    q: "What if I (or my child) have never coded before?",
    a: "That's exactly who we build for. Every track starts from the very beginning and assumes zero prior experience. Lessons build step by step, so complete beginners — whether a 6-year-old or an adult — can start with confidence and grow real skills as they go.",
  },
  {
    icon: "clock",
    q: "How much time per week is needed?",
    a: "Around one hour per week. Courses are structured into short, focused weekly lessons that fit around school, work, and family life. Every learner moves at their own pace and can revisit any lesson at any time.",
  },
  {
    icon: "shield",
    q: "Is it safe? Are there ads?",
    a: "Completely safe and 100% ad-free. AlgorithmX is a closed, distraction-free learning environment — no advertising, no external links, no strangers. For our youngest learners especially, everything is designed in-house and made purely for learning.",
  },
  {
    icon: "bank",
    q: "Do you offer school licensing?",
    a: "Yes we do. Please get in contact to discuss licensing options, classroom-ready lesson plans, teacher dashboards, and volume discounts for your school.",
  },
];

function FaqIconSvg({ name }: { name: FaqIcon }) {
  const c = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "ages":
      return (<svg {...c}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3 2.7-4.6 5.5-4.6s5 1.6 5.5 4.6" /><path d="M15.6 5.3a3 3 0 0 1 0 5.5M16.6 14.6c2.2.4 3.7 1.8 4 4.4" /></svg>);
    case "tag":
      return (<svg {...c}><path d="M20.5 13.4l-7.1 7.1a2 2 0 0 1-2.8 0l-6.1-6.1a2 2 0 0 1-.5-1.3V5.5a2 2 0 0 1 2-2h7.6a2 2 0 0 1 1.4.6l5.5 5.5a2 2 0 0 1 0 2.8z" /><circle cx="7.8" cy="7.8" r="1.3" /></svg>);
    case "code":
      return (<svg {...c}><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></svg>);
    case "clock":
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>);
    case "shield":
      return (<svg {...c}><path d="M12 3l7 3v5c0 4.4-3 7.3-7 8.5C8 18.3 5 15.4 5 11V6l7-3z" /><path d="M9 11.5l2 2 4-4" /></svg>);
    case "bank":
      return (<svg {...c}><path d="M3 10l9-6 9 6" /><path d="M4 10h16" /><path d="M6 10v8M10 10v8M14 10v8M18 10v8" /><path d="M3 21h18" /></svg>);
  }
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      style={{
        position: "relative",
        padding:
          "calc(var(--lv2-rail) * 2.2) var(--lv2-rail) calc(var(--lv2-rail) * 2.0)",
        color: "var(--lv2-paper)",
      }}
    >
      <div style={{ position: "relative", maxWidth: 880, margin: "0 auto" }}>
        <FadeUp>
          <p
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "var(--lv2-cyan)",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            // QUESTIONS
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              margin: "0 auto 14px",
              color: "var(--lv2-paper)",
              textAlign: "center",
            }}
          >
            Before you{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#36d6ff,#a98bff)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              start.
            </span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p
            style={{
              textAlign: "center",
              color: "rgba(232,237,255,0.58)",
              fontSize: 17,
              margin: "0 auto 44px",
              maxWidth: 540,
            }}
          >
            Everything parents usually ask before joining the academy.
          </p>
        </FadeUp>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={item.q} delay={0.04 * i + 0.12}>
                <div
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: isOpen
                      ? "rgba(15,18,30,0.9)"
                      : "rgba(13,15,24,0.55)",
                    border: isOpen
                      ? "1px solid rgba(0,229,255,0.45)"
                      : "1px solid rgba(232,237,255,0.08)",
                    borderRadius: 16,
                    boxShadow: isOpen
                      ? "0 0 0 1px rgba(124,92,255,0.22), 0 16px 50px rgba(0,0,0,0.4), 0 0 34px rgba(0,229,255,0.12)"
                      : "none",
                    transition:
                      "border-color .25s ease, background .25s ease, box-shadow .25s ease",
                  }}
                >
                  {/* left accent bar when open */}
                  {isOpen && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: "linear-gradient(180deg,#36d6ff,#a98bff)",
                      }}
                    />
                  )}
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "20px 22px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer",
                      color: "var(--lv2-paper)",
                      textAlign: "left",
                    }}
                  >
                    {/* icon (hidden when open, mirroring the mockup) */}
                    {!isOpen && (
                      <span
                        aria-hidden
                        style={{ color: "rgba(120,200,255,0.7)", display: "flex", flexShrink: 0 }}
                      >
                        <FaqIconSvg name={item.icon} />
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        color: isOpen ? "var(--lv2-cyan)" : "rgba(120,200,255,0.75)",
                        flexShrink: 0,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* divider when open */}
                    {isOpen && (
                      <span
                        aria-hidden
                        style={{ width: 1, height: 22, background: "rgba(232,237,255,0.18)", flexShrink: 0 }}
                      />
                    )}
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "var(--lv2-font-display)",
                        fontSize: "clamp(1.02rem, 1.5vw, 1.2rem)",
                        fontWeight: 700,
                        color: "var(--lv2-paper)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.q}
                    </span>
                    {/* circular +/- toggle */}
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: isOpen
                          ? "1px solid rgba(0,229,255,0.55)"
                          : "1px solid rgba(232,237,255,0.18)",
                        background: isOpen ? "rgba(0,229,255,0.1)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        lineHeight: 1,
                        color: isOpen ? "var(--lv2-cyan)" : "rgba(232,237,255,0.6)",
                        transition: "color .25s ease, border-color .25s ease",
                      }}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--lv2-font-display)",
                            fontSize: 15.5,
                            lineHeight: 1.65,
                            color: "rgba(232,237,255,0.8)",
                            margin: 0,
                            padding: "0 24px 24px 62px",
                          }}
                        >
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
