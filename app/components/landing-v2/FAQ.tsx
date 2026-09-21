"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "./utilities";

/**
 * FAQ — "Before you start." A drill-down accordion of the questions people
 * ask before getting started. Each row carries a number + icon; the open row
 * glows with a gradient edge and a left accent bar.
 *
 * Rewritten by the owner 2026-09-20: seven questions, addressed to every
 * learner rather than only to parents, with the AI question added.
 *
 * The owner's draft left four values in brackets to fill. None were
 * invented here: the price and the hour a week are the answers already
 * live in this file, and the school lines come from the schools page
 * (RECEIVE in app/schools/SchoolsLanding.tsx). If any of them change,
 * change them in both places.
 *
 * NOTE: this copy states the age bands as 7 to 9, 10 to 13, 14 to 16 and
 * adults, which the hero and the track chips do not yet match. Raised
 * with the owner on delivery.
 */

type FaqIcon = "ages" | "tag" | "code" | "clock" | "shield" | "bank" | "ai";

interface QA {
  q: string;
  a: string;
  icon: FaqIcon;
  /** Optional follow-on link rendered after the answer. */
  link?: { href: string; label: string };
}

const FAQS: QA[] = [
  {
    icon: "ages",
    q: "Who is AlgorithmX for?",
    a: "Anyone who wants to understand the tech shaping their world. We have pathways for ages 7 to 9, 10 to 13, 14 to 16 and adults, plus licensing for schools. Each one is pitched at the right level, so a 9-year-old and a career switcher get very different experiences.",
  },
  {
    icon: "tag",
    q: "How much does it cost?",
    a: "One clear price per course, shown up front before you pay: £99 as a one-time payment, and you keep lifetime access. Schools get a whole-school licence for their phase. No hidden fees and no surprise upgrades.",
  },
  {
    icon: "code",
    q: "Do I need any experience?",
    a: "None at all. Every pathway starts from the very beginning and builds up step by step. If you already know a bit, you can move faster through the early lessons.",
  },
  {
    icon: "clock",
    q: "How much time does it take each week?",
    a: "Most learners spend around an hour a week, but it is entirely self-paced. Lessons are short enough to fit around school, work or family life, and you can pick up exactly where you left off.",
  },
  {
    icon: "shield",
    q: "Is it safe, and what happens to my data?",
    a: "Yes. No ads, no third-party trackers and no tricks designed to keep you hooked. Your data is never sold or used to train AI models, and any AI features are set up to suit the learner's age.",
  },
  {
    icon: "ai",
    q: "How do you keep up with AI?",
    a: "We update our lessons as the technology changes. Learners work hands-on with real AI tools, and learn to spot deepfakes and AI scams, question what chatbots tell them, and use AI as a tool rather than a shortcut.",
  },
  {
    icon: "bank",
    q: "Do you offer school licensing?",
    a: "Yes. Our content is aligned with KS2 to KS4 computing, and schools get the teacher view for every class, an end-of-course class report, certificates for every pupil and the curriculum mapping sheet. Get in touch and we will put together a package for your school.",
    link: { href: "/schools", label: "See the schools page" },
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
    case "ai":
      /* A spark: the only new mark this rewrite needed. */
      return (<svg {...c}><path d="M12 3.2l1.7 4.6 4.6 1.7-4.6 1.7L12 15.8l-1.7-4.6L5.7 9.5l4.6-1.7z" /><path d="M18.4 15.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" /></svg>);
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
        color: "var(--lv2-ink)",
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
              color: "var(--lv2-ink)",
              textAlign: "center",
            }}
          >
            Before you{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#0a7085,#5744c9)",
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
              color: "rgba(17,22,38,0.61)",
              fontSize: 17,
              margin: "0 auto 44px",
              maxWidth: 540,
            }}
          >
            Everything people usually ask before getting started.
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
                      ? "rgba(255,253,250,0.9)"
                      : "rgba(255,255,255,0.52)",
                    border: isOpen
                      ? "1px solid rgba(0,229,255,0.45)"
                      : "1px solid rgba(17,22,38,0.08)",
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
                        background: "linear-gradient(180deg,#0a7085,#5744c9)",
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
                      color: "var(--lv2-ink)",
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
                        style={{ width: 1, height: 22, background: "rgba(244,239,231,0.19)", flexShrink: 0 }}
                      />
                    )}
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "var(--lv2-font-display)",
                        fontSize: "clamp(1.02rem, 1.5vw, 1.2rem)",
                        fontWeight: 700,
                        color: "var(--lv2-ink)",
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
                          : "1px solid rgba(17,22,38,0.19)",
                        background: isOpen ? "rgba(0,229,255,0.1)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        lineHeight: 1,
                        color: isOpen ? "var(--lv2-cyan)" : "rgba(17,22,38,0.63)",
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
                            color: "rgba(17,22,38,0.84)",
                            margin: 0,
                            padding: "0 24px 24px 62px",
                          }}
                        >
                          {item.a}
                          {item.link && (
                            <>
                              {" "}
                              <Link
                                href={item.link.href}
                                style={{
                                  color: "var(--lv2-cyan-soft)",
                                  textDecoration: "underline",
                                  textUnderlineOffset: 3,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {item.link.label} <span aria-hidden>→</span>
                              </Link>
                            </>
                          )}
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
