"use client";

/**
 * InfoScene - the premium "Learn" beat (one per concept).
 *
 * "Command-center" template aiming close to the reference art: a gold
 * lock-shield emblem with sparkles, an ornate gold-rimmed console frame, a
 * warm lit background, the Adam/Layla narration, glossy 3D colour rows (each
 * with a topic icon), and a big gold button. Rich + premium, but with NO
 * rapid motion/flashing so it stays comfortable for 6-9 yr olds. Honours
 * comfort mode. An illustrated background can drop in behind via `background`.
 *
 * SCREEN-AUDIT REBUILD (user mandate: "is it interactive?"): the Learn
 * beat is no longer a read-only list. Each clue row starts dim and the
 * child TAPS it to power it up (pop + glow + ✓). The advance button is
 * NEVER disabled (gate-button regression class: a child must always
 * have a way forward) — while clues remain unlit it reads "Tap all the
 * clues!" and pressing it wobbles the unlit rows as a pointer instead
 * of advancing. Same data, same 29-screen structure, every week.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { useMotionIntensity } from "@/app/lib/gameEngine";
import { playSound } from "@/app/lib/sounds";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface InfoSceneProps {
  title: string;
  content: string;
  bullets?: string[];
  /** Optional per-bullet topic icon (emoji) shown in a badge on each row. */
  bulletIcons?: string[];
  /** Header emblem glyph (defaults to the lock brand mark). */
  emblem?: string;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  onNext: () => void;
}

const ROW_COLOURS = ["#3a93f5", "#34bd6c", "#eaa53c", "#df72c0"];
// Static decorative star dots (no twinkle) - depth without motion.
const STARS = [
  { x: "8%", y: "14%", s: 3 }, { x: "22%", y: "8%", s: 2 },
  { x: "70%", y: "10%", s: 2 }, { x: "88%", y: "20%", s: 3 },
  { x: "12%", y: "62%", s: 2 }, { x: "92%", y: "58%", s: 2 },
  { x: "84%", y: "82%", s: 3 }, { x: "16%", y: "86%", s: 2 },
];

export default function InfoScene({
  title,
  content,
  bullets,
  bulletIcons,
  emblem = "🔒",
  narration,
  onNext,
}: InfoSceneProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  // Tap-to-power-up state: which clue rows the child has lit.
  const [lit, setLit] = useState<Set<number>>(new Set());
  const [nudgeNonce, setNudgeNonce] = useState(0);
  const total = bullets?.length ?? 0;
  const allLit = total === 0 || lit.size >= total;

  const tapRow = (i: number) => {
    if (lit.has(i)) return;
    playSound("pop");
    setLit((s) => {
      const next = new Set(s);
      next.add(i);
      if (next.size >= total) playSound("streak3");
      return next;
    });
  };

  const advance = () => {
    if (allLit) {
      onNext();
    } else {
      // Never strand a child: the button always works — before the clues
      // are lit it points at them instead of advancing.
      playSound("hover");
      setNudgeNonce((n) => n + 1);
    }
  };

  return (
    <ExerciseFrame
      maxWidth={880}
      padding={0}
      background="linear-gradient(180deg, rgba(18,24,58,0.86) 0%, rgba(7,11,30,0.94) 100%), url(/cyberheroes/scenes/learn-command-center.png) center / cover no-repeat"
      style={{ color: "#fff7e6", position: "relative", overflow: "hidden" }}
    >
      {/* Warm lit glow at top + soft side glows + vignette */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "-6%", width: 460, height: 320, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,206,120,0.16) 0%, transparent 70%)", filter: "blur(8px)" }} />
        <div style={{ position: "absolute", left: "6%", top: "30%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, #2a3f7e 0%, transparent 70%)", opacity: 0.5, filter: "blur(18px)" }} />
        <div style={{ position: "absolute", right: "4%", top: "24%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, #3a2a6e 0%, transparent 70%)", opacity: 0.5, filter: "blur(18px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(4,6,18,0.55) 100%)" }} />
        {STARS.map((s, i) => (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: "50%", background: "#cfe0ff", opacity: 0.5, boxShadow: "0 0 6px rgba(207,224,255,0.7)" }} />
        ))}
      </div>

      {/* Ornate gold-rimmed console frame */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          margin: 18,
          padding: "26px 26px 28px",
          borderRadius: 22,
          background:
            "linear-gradient(180deg, rgba(18,24,58,0.72) 0%, rgba(10,14,36,0.82) 100%)",
          // gold rim via layered ring + soft outer glow + inner top highlight
          boxShadow:
            "0 0 0 1px rgba(255,212,120,0.55), 0 0 0 4px rgba(120,92,30,0.35), 0 24px 60px -28px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,233,170,0.28), inset 0 0 36px rgba(60,90,170,0.14)",
          backdropFilter: "blur(2px)",
        }}
      >
        {/* corner accent brackets */}
        {[
          { top: 8, left: 8 }, { top: 8, right: 8 },
          { bottom: 8, left: 8 }, { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <span key={i} aria-hidden style={{ position: "absolute", ...pos, width: 12, height: 12, borderRadius: 3, background: "radial-gradient(circle at 35% 35%, #ffe7a8, #b8861f)", boxShadow: "0 0 8px rgba(255,206,90,0.5)" }} />
        ))}

        {/* Emblem + sparkles + LEARN kicker + title */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span aria-hidden style={{ color: "#ffe7a8", fontSize: 14, opacity: 0.85, textShadow: "0 0 10px rgba(255,206,90,0.6)" }}>✦</span>
            <motion.div
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{
                width: 66, height: 66, borderRadius: "50%",
                display: "grid", placeItems: "center", fontSize: 30,
                background: "radial-gradient(circle at 50% 32%, #46508a 0%, #1a2150 70%)",
                border: "2px solid rgba(255,206,90,0.75)",
                boxShadow: "0 6px 20px -6px rgba(255,206,90,0.5), inset 0 2px 6px rgba(255,233,170,0.35), inset 0 -6px 12px rgba(0,0,0,0.4)",
              }}
            >
              <PixIcon emoji={emblem} size={46} />
            </motion.div>
            <span aria-hidden style={{ color: "#ffe7a8", fontSize: 14, opacity: 0.85, textShadow: "0 0 10px rgba(255,206,90,0.6)" }}>✦</span>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.24em", textTransform: "uppercase", color: "#9fe9ff", margin: "12px 0 6px" }}>
            ◇ Learn ◇
          </div>
          <h2 style={{
            margin: 0, maxWidth: 680, marginInline: "auto",
            fontSize: "clamp(1.6rem, 3.4vw, 2.2rem)", fontWeight: 900, lineHeight: 1.12,
            background: "linear-gradient(180deg, #fff4cf 0%, #ffd86b 55%, #f3b13a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 2px 6px rgba(180,120,20,0.45))",
          }}>
            {title}
          </h2>
        </div>

        {/* Narration */}
        {narration && (
          <InfoNarration lines={narration.lines} speaker={narration.speaker ?? "adam"} />
        )}

        {/* Content fallback (only when no narration) */}
        {!narration && content && (
          <p style={{ color: "#cbd5e1", fontSize: 16, lineHeight: 1.65, textAlign: "center", maxWidth: 620, margin: "14px auto 22px" }}>
            {content}
          </p>
        )}

        {/* Tap-to-power-up clue rows: dim + pulsing until the child taps
            each one; lighting all of them unlocks the advance. */}
        {bullets && (
          <>
            <div style={{ textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.18em", color: "#9fe9ff", margin: "2px 0 10px" }}>
              👆 TAP EACH CLUE TO POWER IT UP · {Math.min(lit.size, total)} / {total}
            </div>
            <div style={{ display: "grid", gap: 11, maxWidth: 600, margin: "0 auto 22px" }}>
              {bullets.map((b, i) => {
                const accent = ROW_COLOURS[i % ROW_COLOURS.length];
                const icon = bulletIcons?.[i];
                const on = lit.has(i);
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => tapRow(i)}
                    aria-pressed={on}
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={
                      on || reduce
                        ? { opacity: 1, x: 0, scale: 1 }
                        : nudgeNonce > 0
                          ? { opacity: 1, x: [0, -6, 6, -3, 0], scale: 1 }
                          : { opacity: 1, x: 0, scale: [1, 1.015, 1] }
                    }
                    // Scope the infinite pulse to SCALE only — a repeat on
                    // the whole transition loops the entry fade too and the
                    // rows flicker in and out.
                    transition={
                      on || reduce
                        ? { duration: 0.25 }
                        : nudgeNonce > 0
                          ? { duration: 0.5 }
                          : {
                              opacity: { delay: 0.14 + i * 0.07, duration: 0.3 },
                              x: { delay: 0.14 + i * 0.07, duration: 0.3 },
                              scale: { delay: 0.14 + i * 0.07, duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                            }
                    }
                    // Re-key the nudge wobble so every press replays it.
                    data-nudge={nudgeNonce}
                    style={{
                      display: "flex", alignItems: "center", gap: 13, width: "100%",
                      padding: "12px 14px 12px 13px", borderRadius: 999,
                      cursor: on ? "default" : "pointer", touchAction: "manipulation",
                      fontFamily: "inherit", textAlign: "left",
                      background: on
                        ? `linear-gradient(180deg, ${accent}42 0%, ${accent}1c 55%, ${accent}12 100%)`
                        : "linear-gradient(180deg, rgba(80,92,140,0.16) 0%, rgba(40,48,90,0.12) 100%)",
                      border: on ? `1px solid ${accent}66` : "1.5px dashed rgba(159,233,255,0.4)",
                      boxShadow: on
                        ? `inset 0 1px 0 ${accent}88, inset 0 -7px 14px -8px rgba(0,0,0,0.55), 0 6px 16px -10px ${accent}aa`
                        : "inset 0 -6px 12px -8px rgba(0,0,0,0.4)",
                      color: on ? "#f2f6ff" : "#aebadb",
                      fontSize: 15, fontWeight: 650, lineHeight: 1.3,
                      transition: "background 300ms ease, border 300ms ease, color 300ms ease",
                    }}
                  >
                    <motion.span
                      aria-hidden
                      key={on ? "on" : "off"}
                      initial={on && !reduce ? { scale: 1.6 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      style={{
                        flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        background: on
                          ? `radial-gradient(circle at 35% 30%, ${accent}, ${accent}cc)`
                          : "rgba(90,102,150,0.35)",
                        color: on ? "#06080f" : "#cfe0ff", fontWeight: 900, fontSize: 15,
                        boxShadow: on ? `inset 0 1px 2px rgba(255,255,255,0.6), 0 0 12px -2px ${accent}` : "none",
                      }}
                    >
                      {on ? "✓" : "👆"}
                    </motion.span>
                    <span style={{ flex: 1, filter: on ? "none" : "opacity(0.85)" }}>{b}</span>
                    {icon && (
                      <span aria-hidden style={{
                        flexShrink: 0, width: 34, height: 34, borderRadius: 11,
                        display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                        background: on ? `linear-gradient(180deg, ${accent}3a, ${accent}14)` : "rgba(60,70,110,0.3)",
                        border: on ? `1px solid ${accent}66` : "1px solid rgba(159,233,255,0.25)",
                        boxShadow: on ? `inset 0 1px 0 ${accent}77, 0 0 10px -3px ${accent}` : "none",
                        filter: on ? "none" : "saturate(0.4) opacity(0.7)",
                        transition: "filter 300ms ease",
                      }}><PixIcon emoji={icon} size={26} /></span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 4 }}>
          <GameButton variant={allLit ? "primary" : "secondary"} size="lg" onClick={advance}>
            {allLit ? "Next →" : "Tap all the clues!"}
          </GameButton>
        </div>
      </div>
    </ExerciseFrame>
  );
}
