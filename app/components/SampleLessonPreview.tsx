"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SampleLessonPreview — interactive 60-second mini-lesson on the
 * /cyberheroes landing page.
 *
 * Goal: prove the product is fun BEFORE the £99 ask. Visitors see
 * screenshots and a video higher up on the page; this gives them
 * something to actually play. Three phases: intro → MCQ → reveal+CTA.
 *
 * Self-contained. No auth, no analytics, no persistence. Pure demo.
 * Reuses the cosmic palette so it sits inside the existing landing
 * page without a visual seam.
 */

type Phase = "intro" | "question" | "reveal";

const OPTIONS = [
  {
    id: "weak1",
    label: "password123",
    correct: false,
    feedback:
      "Hackers crack 'password123' in 0.02 seconds — it's on every leaked-password list ever.",
  },
  {
    id: "strong",
    label: "MyDog!Loves2Run🐕",
    correct: true,
    feedback:
      "Yes! Length + a mix of letters, numbers, and symbols makes this nearly uncrackable.",
  },
  {
    id: "weak2",
    label: "qwerty",
    correct: false,
    feedback:
      "It's literally the top-left of the keyboard — the second-most-common password ever leaked.",
  },
];

const COSMIC = "#7c5cff";
const CYAN = "#00e5ff";
const PINK = "#ff5fb3";
const GOLD = "#ffd158";
const GRAD = `linear-gradient(135deg, ${CYAN}, ${COSMIC}, ${PINK})`;

export default function SampleLessonPreview() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [chosen, setChosen] = useState<string | null>(null);

  const chosenOption = OPTIONS.find((o) => o.id === chosen);
  const wasCorrect = chosenOption?.correct ?? false;

  const reset = () => {
    setChosen(null);
    setPhase("intro");
  };

  const onPick = (id: string) => {
    setChosen(id);
    setTimeout(() => setPhase("reveal"), 800);
  };

  return (
    <section className="max-w-[1100px] mx-auto px-6 md:px-10 py-16 sm:py-24">
      <div className="text-center mb-10 sm:mb-12" data-scroll>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,209,88,0.12)",
            border: "1px solid rgba(255,209,88,0.35)",
            color: GOLD,
            borderRadius: 999,
            padding: "5px 14px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          ▸ Try it · 60 seconds
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Play a <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>real mission</span> right now
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "#cbd5e1" }}>
          One question. No signup. The actual question language and feel from Week 1, Case 3.
        </p>
      </div>

      <div className="relative max-w-[720px] mx-auto" data-scroll data-scroll-delay="0.1">
        {/* Big cosmic glow behind the demo card */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-8%",
            borderRadius: 60,
            background:
              "radial-gradient(ellipse at center, rgba(124,92,255,0.32) 0%, rgba(0,229,255,0.18) 45%, rgba(255,95,179,0.12) 70%, transparent 90%)",
            filter: "blur(54px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(15, 21, 48, 0.86)",
            border: `1.5px solid ${COSMIC}55`,
            boxShadow:
              "0 30px 60px -20px rgba(8, 10, 22, 0.7), 0 0 0 1px rgba(0, 229, 255, 0.05) inset",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 1,
            minHeight: 460,
          }}
        >
          {/* Top accent strip */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: GRAD,
              boxShadow: `0 0 18px ${COSMIC}aa`,
            }}
          />

          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="p-7 sm:p-10 flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CharBadge src="/characters/heroic.png" alt="Adam" ring={CYAN} />
                  <CharBadge src="/characters/celebrating.png" alt="Layla" ring={PINK} />
                </div>
                <p
                  className="text-lg sm:text-xl mb-2"
                  style={{ color: "#e8edff", fontWeight: 600, lineHeight: 1.5 }}
                >
                  Hey hero! We&rsquo;re Adam &amp; Layla.
                </p>
                <p
                  className="text-base sm:text-lg mb-8 max-w-md"
                  style={{ color: "#cbd5e1", lineHeight: 1.6 }}
                >
                  Ready to try one of the questions kids face in Week 1?
                  Tap below — it takes 30 seconds.
                </p>
                <motion.button
                  type="button"
                  onClick={() => setPhase("question")}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full font-black"
                  style={{
                    padding: "14px 32px",
                    fontSize: 16,
                    background: GRAD,
                    color: "#0a0e22",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    boxShadow: `0 14px 28px -8px ${COSMIC}88, 0 0 0 1px rgba(255,235,200,0.35) inset`,
                  }}
                >
                  Try a Mission →
                </motion.button>
              </motion.div>
            )}

            {phase === "question" && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="p-7 sm:p-10"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.2em",
                      color: CYAN,
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                    }}
                  >
                    Week 1 · Case 3 · CyberScanner
                  </span>
                </div>
                <h3
                  className="text-2xl sm:text-3xl font-black mb-7 leading-snug"
                  style={{ color: "#fff" }}
                >
                  Which password is the <span style={{ color: GOLD }}>strongest</span>?
                </h3>
                <div className="flex flex-col gap-3">
                  {OPTIONS.map((o) => {
                    const picked = chosen === o.id;
                    return (
                      <motion.button
                        key={o.id}
                        type="button"
                        onClick={() => onPick(o.id)}
                        disabled={chosen !== null}
                        whileHover={chosen === null ? { scale: 1.02, x: 2 } : {}}
                        whileTap={chosen === null ? { scale: 0.98 } : {}}
                        className="rounded-2xl flex items-center gap-4 transition-colors text-left"
                        style={{
                          padding: "16px 20px",
                          background: picked
                            ? o.correct
                              ? "rgba(126, 255, 151, 0.18)"
                              : "rgba(255, 122, 89, 0.18)"
                            : "rgba(8, 10, 22, 0.6)",
                          border: `1.5px solid ${
                            picked
                              ? o.correct
                                ? "rgba(126, 255, 151, 0.7)"
                                : "rgba(255, 122, 89, 0.7)"
                              : `${CYAN}33`
                          }`,
                          color: "#e8edff",
                          fontSize: 17,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          cursor: chosen === null ? "pointer" : "default",
                          opacity: chosen !== null && !picked ? 0.45 : 1,
                          boxShadow: picked
                            ? o.correct
                              ? "0 0 24px rgba(126, 255, 151, 0.4)"
                              : "0 0 24px rgba(255, 122, 89, 0.4)"
                            : "none",
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: picked
                              ? o.correct
                                ? "rgba(126, 255, 151, 0.3)"
                                : "rgba(255, 122, 89, 0.3)"
                              : `${CYAN}22`,
                            color: picked
                              ? o.correct
                                ? "#7eff97"
                                : "#ff7a59"
                              : CYAN,
                            fontSize: 16,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {picked ? (o.correct ? "✓" : "✕") : ""}
                        </span>
                        <span style={{ flex: 1 }}>{o.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === "reveal" && chosenOption && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="p-7 sm:p-10 text-center flex flex-col items-center"
              >
                {/* Badge / outcome */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.05 }}
                  className="mb-5 flex items-center justify-center"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 999,
                    background: wasCorrect
                      ? "linear-gradient(135deg, #7eff97, #00e5ff)"
                      : "linear-gradient(135deg, #ff7a59, #ff5fb3)",
                    boxShadow: wasCorrect
                      ? "0 0 40px rgba(126, 255, 151, 0.55)"
                      : "0 0 40px rgba(255, 122, 89, 0.55)",
                    fontSize: 44,
                  }}
                >
                  {wasCorrect ? "🏆" : "🤔"}
                </motion.div>
                <h3
                  className="text-2xl sm:text-3xl font-black mb-3"
                  style={{ color: wasCorrect ? "#7eff97" : "#ff9bcb" }}
                >
                  {wasCorrect ? "Correct! Cyber Hero badge earned." : "Close — but not quite."}
                </h3>
                <p
                  className="text-base sm:text-lg max-w-md mb-2"
                  style={{ color: "#e8edff", lineHeight: 1.6 }}
                >
                  {chosenOption.feedback}
                </p>
                {!wasCorrect && (
                  <p className="text-sm mb-2" style={{ color: "#7df0ff" }}>
                    The strongest answer was{" "}
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                      MyDog!Loves2Run🐕
                    </span>
                    .
                  </p>
                )}

                {/* CTA */}
                <div
                  className="mt-7 w-full max-w-md rounded-2xl"
                  style={{
                    padding: "18px 22px",
                    background: "rgba(8, 10, 22, 0.55)",
                    border: `1px solid ${COSMIC}44`,
                  }}
                >
                  <p
                    className="text-sm font-bold mb-3"
                    style={{ color: "#cbd5e1", lineHeight: 1.5 }}
                  >
                    That&rsquo;s 1 of <span style={{ color: GOLD, fontWeight: 900 }}>100+</span> interactive missions.
                    Adam &amp; Layla guide your child through 20 weeks of adventures like this — one-time £99, lifetime access.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.a
                      href="/signup"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center justify-center rounded-full font-black"
                      style={{
                        padding: "13px 28px",
                        fontSize: 15,
                        background: GRAD,
                        color: "#0a0e22",
                        textDecoration: "none",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        boxShadow: `0 14px 28px -8px ${COSMIC}88, 0 0 0 1px rgba(255,235,200,0.35) inset`,
                      }}
                    >
                      Enrol — £99 →
                    </motion.a>
                    <button
                      type="button"
                      onClick={reset}
                      className="rounded-full font-bold"
                      style={{
                        padding: "13px 22px",
                        fontSize: 14,
                        background: "rgba(0, 229, 255, 0.08)",
                        color: "#7df0ff",
                        border: `1px solid ${CYAN}44`,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function CharBadge({ src, alt, ring }: { src: string; alt: string; ring: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: 64,
        height: 64,
        borderRadius: 999,
        overflow: "hidden",
        border: `2.5px solid ${ring}`,
        boxShadow: `0 0 22px ${ring}66`,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={64}
        height={64}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
      />
    </div>
  );
}
