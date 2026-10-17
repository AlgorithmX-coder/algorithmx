"use client";

/**
 * Sticker Unlock screen.
 *
 * Fires after the Mission Debrief at the end of Week 1. Three
 * stickers drop in sequence with a big confetti unlock + audio
 * stinger per sticker. The actual server-side awarding happens at
 * the parent renderer level (DynamicLesson calls awardStickers when
 * the lesson completes) - this component is the visual celebration.
 *
 * After the third sticker has landed, two CTAs surface: "Visit Cyber
 * HQ" (deep-link to /cyberhq) and "Continue" (advance to the badge
 * ceremony / completion screen).
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import StickerArt from "@/app/components/lesson/StickerArt";
import { WorldBackdrop } from "@/app/components/game/missionWorldStyles";
import { useClosingPalette, REWARD } from "@/app/components/lesson/closingSuite";

export interface StickerData {
  id: string;
  name: string;
  icon: string;
  /** Bespoke art for weeks that have it; falls back to the PixIcon. */
  art?: string;
  description: string;
}

export interface StickerUnlockProps {
  title: string;
  stickers: StickerData[];
  onComplete: () => void;
}

const DROP_STAGGER_MS = 900;

export default function StickerUnlock({
  title,
  stickers,
  onComplete,
}: StickerUnlockProps) {
  const router = useRouter();
  const intensity = useMotionIntensity();
  /* The week's own colour, shared with the Mission Debrief and the week
   * complete screen so the closing run reads as one suite. */
  const pal = useClosingPalette();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [droppedCount, setDroppedCount] = useState(0);
  const allDropped = droppedCount >= stickers.length;

  // Sequenced drop: each sticker fires the unlock juice (confetti +
  // sound). Staggered so they feel like distinct earnings rather
  // than a single firehose.
  useEffect(() => {
    if (allDropped) return;
    const id = window.setTimeout(
      () => {
        setDroppedCount((n) => n + 1);
        // Signature sticker-drop SFX (paper-flutter + chime) layered
        // over the existing unlock chime for that "this is a real
        // sticker landing" character.
        audio.signature("sticker-drop");
        audio.unlock();
        // Confetti + chime only: the sticker's name is already on its card,
        // and the old top-centre name toast landed on the "Stickers Unlocked!"
        // title (owner screenshot 2026-09-12).
        if (intensity > 0) fx.unlock();
      },
      droppedCount === 0 ? 600 : DROP_STAGGER_MS
    );
    return () => window.clearTimeout(id);
  }, [droppedCount, allDropped, audio, fx, stickers, intensity]);

  const handleContinue = useCallback(() => {
    audio.tap();
    onComplete();
  }, [audio, onComplete]);

  const handleVisitHQ = useCallback(() => {
    audio.tap();
    router.push("/cyberhq");
  }, [audio, router]);

  return (
    <ExerciseFrame
      maxWidth={1000}
      padding={28}
      background="linear-gradient(180deg, #050a1a 0%, #1f1240 70%, #1a1f4d 100%)"
      style={{ isolation: "isolate" }}
    >
      {/* The week's world behind the sticker sheet (world weeks only) */}
      <WorldBackdrop intensity={0.36} />
      {/* Above the beams. The shafts reach 14px up out of the grid and this
          marginBottom is the only thing standing between them and the copy,
          so the two numbers are a pair: shrinking this 20 without shrinking
          the beam puts the light back inside the subtitle (UAT W16 9b). */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginBottom: 20 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#fde047",
            textTransform: "uppercase",
            fontWeight: 800,
            marginBottom: 8,
            textShadow: "0 0 12px rgba(253, 224, 71, 0.55)",
          }}
        >
          ✦ Cyber HQ
        </span>
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 30,
            fontWeight: 900,
            background: "linear-gradient(135deg, #fde047, #ff7a59, #ff5fb3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            color: "#cbd5e1",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Your first stickers are on the way to Cyber HQ.
        </p>
      </div>

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          // The row gap has to clear the light beam, which reaches 30px ABOVE
          // each card. At a 16px gap a second-row beam climbed 14px into the
          // card above and washed over its description - which is why this was
          // reported as recurring on every week: any week with more than one
          // row of stickers hits it (UAT W16 9b).
          columnGap: 16,
          rowGap: 38,
          marginBottom: 22,
          paddingBottom: 18,
        }}
      >
        {stickers.map((s, i) => {
          const visible = i < droppedCount;
          return (
            <div
              key={s.id}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              {/* The lamp cone above each card is GONE.

                  Owner, 2026-10-17, on this screen: it reads as a pale wedge
                  hanging over each card, attached to nothing. It had already
                  been shrunk twice for that same reason, W16 9b being the
                  last (the lantern over the second badge cutting into the
                  words above, reported as recurring on every week), and the
                  comments it left behind are a record of a shape fighting its
                  own layout: reach cut to 14px, base narrowed to 15%, blend
                  mode screened, all to stop it touching the copy above.

                  A decoration that has to be made smaller every time somebody
                  reviews it is not earning its place. The sticker art is the
                  reward and it carries the moment on its own. */}
              <motion.div
                initial={
                  intensity === 0
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.4, rotate: -18, y: -30 }
                }
                animate={
                  visible
                    ? intensity === 0
                      ? { opacity: 1 }
                      : { opacity: 1, scale: 1, rotate: 0, y: 0 }
                    : intensity === 0
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.4, rotate: -18, y: -30 }
                }
                transition={
                  intensity === 0
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 320, damping: 18 }
                }
                style={{
                  position: "relative",
                  // Own compositor layer: the card carries a blurred glow and
                  // springs in from above, so without a layer it re-rasterised
                  // every frame (UAT W4 6a: blocky). Damping 14 -> 18 also
                  // removes the overshoot that read as a stutter.
                  willChange: "transform, opacity",
                  // Fill the column so every card in a row is the same height
                  // whatever its description's line count (polish 2026-09-12).
                  flex: 1,
                  overflow: "hidden",
                  padding: "26px 16px 16px",
                  borderRadius: 16,
                  /* Same shape as the Mission Debrief card, so the two
                     screens a child sees seconds apart read as one design
                     rather than two. The 2.5px gold box all the way round
                     was the loudest thing on the screen and competed with
                     the sticker art, which IS the reward. */
                  background: visible
                    ? `linear-gradient(180deg, rgba(${pal.accentRGB}, 0.16), rgba(9, 13, 32, 0.92))`
                    : "rgba(9, 13, 32, 0.55)",
                  border: visible
                    ? `1px solid rgba(${pal.accentRGB}, 0.38)`
                    : "1px dashed rgba(148, 163, 184, 0.28)",
                  boxShadow: visible
                    ? "0 14px 34px -14px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)"
                    : "none",
                  textAlign: "center",
                  fontFamily:
                    "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                }}
              >
                {/* The reward rail. Gold, deliberately: the chrome around it
                    takes the week's colour but gold stays the reward colour
                    in all twenty weeks, so a child who learns that gold means
                    "you earned this" never finds it meaning something else. */}
                {visible && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: REWARD,
                    }}
                  />
                )}

                {/* Halo behind the sticker icon when visible */}
                {visible && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 18,
                      left: "50%",
                      width: 90,
                      height: 90,
                      transform: "translateX(-50%)",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(253,224,71,0.5) 0%, transparent 70%)",
                      filter: "blur(8px)",
                      animation:
                        intensity > 0
                          ? "stickerHaloPulse 3.2s ease-in-out infinite"
                          : undefined,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "relative",
                    fontSize: 64,
                    lineHeight: 1,
                    marginBottom: 8,
                    /* The art is a character, not a square glyph, and each
                     * pose is a different width - Layla with a key held high
                     * is far wider than Adam standing square. So centre it
                     * here rather than letting a block image sit left while
                     * the halo behind it stays centred, which left a glowing
                     * blank circle beside each sticker. */
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    minHeight: 104,
                    filter: visible
                      ? "drop-shadow(0 0 24px rgba(253, 224, 71, 0.7))"
                      : undefined,
                  }}
                >
                  <StickerArt icon={s.icon} art={s.art} size={104} alt={s.name} />
                </div>
                <div
                  style={{
                    position: "relative",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 900,
                    color: visible ? "#fff7e6" : "#64748b",
                    marginBottom: 6,
                    letterSpacing: "0.02em",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    position: "relative",
                    fontSize: 12,
                    color: visible ? "#cbd5e1" : "#475569",
                    lineHeight: 1.45,
                  }}
                >
                  {s.description}
                </div>
              </motion.div>
              {/* Gold pedestal disc beneath each card */}
              {/* The gold ground-pad under each card is GONE.
                  It sat OUTSIDE the card (marginTop: -6) as a blurred
                  ellipse, and against the quieter card it read as a stray
                  gold smear hanging below the row rather than as light. The
                  card carries its own shadow now, so the pad was doing no
                  work. Same species as the lamp cone removed above it. */}
            </div>
          );
        })}
      </div>

      {/* ALL EARNED stamp - lands when the third sticker is on the shelf */}
      {allDropped && (
        <motion.div
          key="all-earned-stamp"
          initial={
            intensity === 0
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.5, rotate: -6 }
          }
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={
            intensity === 0
              ? { duration: 0.16 }
              : { type: "spring", stiffness: 360, damping: 13, delay: 0.1 }
          }
          style={{
            position: "relative",
            margin: "0 auto 18px",
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 8,
            background: "rgba(253,224,71,0.95)",
            border: "3px double rgba(15,21,48,0.7)",
            color: "#1a1033",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            boxShadow: "0 8px 18px rgba(253,224,71,0.5)",
            textAlign: "center",
          }}
        >
          {/* Counts the stickers actually on the sheet. It was hardcoded to 3,
              and Week 10 awards FIVE, so the stamp contradicted the row of
              cards right above it. */}
          ✓ All {stickers.length} stickers earned
        </motion.div>
      )}

      {allDropped && (
        <motion.div
          initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <GameButton
            variant="secondary"
            size="lg"
            icon="🏠"
            onClick={handleVisitHQ}
          >
            Visit Cyber HQ
          </GameButton>
          <GameButton
            variant="primary"
            size="lg"
            onClick={handleContinue}
            icon="→"
          >
            Continue
          </GameButton>
        </motion.div>
      )}

      {fx.layer()}

      <style jsx global>{`
        @keyframes stickerHaloPulse {
          0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1);    }
          50%      { opacity: 0.95; transform: translateX(-50%) scale(1.18); }
        }
      `}</style>
    </ExerciseFrame>
  );
}
