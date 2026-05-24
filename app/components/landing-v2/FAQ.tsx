"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "./utilities";

/**
 * FAQ. Collapsible accordion answering the most common pre-purchase
 * questions. Lives just before the final CTA so any last objection gets
 * resolved before the buy moment.
 */

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "What ages is AlgorithmX for?",
    a: "Six to adult. The curriculum is staged for ages 6-8, 9-12, 13-16, and 17+. Cyber Heroes Academy (live today) sits in the 9-14 sweet spot; other streams are arriving 2026-2027 across all age bands.",
  },
  {
    q: "How much does it cost?",
    a: "Cyber Heroes Academy is £99 for lifetime access. One payment, no subscription, all 8 missions and future updates included. School and family pricing available on request.",
  },
  {
    q: "What if my child has never coded before?",
    a: "Cyber Heroes is designed for total beginners. There's no coding pre-requisite at all. Later streams (Game Dev, AI, App Dev) introduce code gradually with no prior knowledge assumed.",
  },
  {
    q: "How much time per week is needed?",
    a: "Each Cyber Heroes mission takes 30-45 minutes. Kids can finish the 8-mission programme in a weekend or stretch it across two months. There's no schedule — it's self-paced.",
  },
  {
    q: "Is it safe? Are there ads?",
    a: "No ads, no in-app purchases, no third-party trackers, no chat features that connect children to strangers. The platform is closed by design and content is reviewed by educators.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. If your family doesn't get value from Cyber Heroes in the first 30 days, email us and we'll refund the full £99. No forms, no friction.",
  },
  {
    q: "Do you offer school licensing?",
    a: "Yes — KS2-KS4 packages with classroom-ready lesson plans, teacher dashboards, and volume discounts. We're piloting with a small number of UK schools for autumn 2026. Book a demo via the school path above.",
  },
  {
    q: "What happens when other streams launch?",
    a: "Existing Cyber Heroes families get early access pricing on each new stream as it launches. Game Dev and AI are on the 2026 roadmap; App Dev, Entrepreneurship, and Robotics in 2027.",
  },
];

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
      <div
        style={{
          position: "relative",
          maxWidth: 880,
          margin: "0 auto",
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
              marginBottom: 18,
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
              fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              fontWeight: 400,
              margin: "0 auto 48px",
              maxWidth: 720,
              color: "var(--lv2-paper)",
              textAlign: "center",
            }}
          >
            Before you start.
          </h2>
        </FadeUp>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={item.q} delay={0.04 * i + 0.12}>
                <div
                  style={{
                    background: isOpen
                      ? "rgba(13,15,24,0.82)"
                      : "rgba(13,15,24,0.62)",
                    backdropFilter: "blur(12px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(12px) saturate(1.3)",
                    border: isOpen
                      ? "1px solid rgba(0,229,255,0.32)"
                      : "1px solid rgba(232,237,255,0.08)",
                    borderRadius: 14,
                    transition: "border-color .25s ease, background .25s ease",
                  }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      cursor: "pointer",
                      color: "var(--lv2-paper)",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        color: isOpen
                          ? "var(--lv2-cyan)"
                          : "rgba(232,237,255,0.4)",
                        minWidth: 28,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "var(--lv2-font-display)",
                        fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                        fontWeight: 500,
                        color: "var(--lv2-paper)",
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 22,
                        lineHeight: 1,
                        color: isOpen
                          ? "var(--lv2-cyan)"
                          : "rgba(232,237,255,0.55)",
                        transition: "transform .25s ease, color .25s ease",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      +
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
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: "rgba(232,237,255,0.78)",
                            margin: 0,
                            padding: "0 24px 22px 70px",
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
