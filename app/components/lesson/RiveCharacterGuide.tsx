"use client";

/**
 * Drop-in replacement for the legacy <CharacterGuide> with a Rive
 * runtime path and a PNG fallback.
 *
 * Why: today CharacterGuide is a static PNG that swaps on `mood`. A
 * Be Internet Awesome / Khan Academy Kids comparison reads "image"
 * not "person" - the single biggest perceived-quality gap in the
 * build.
 *
 * Design contract:
 *   1. Same prop API as <CharacterGuide> (character, mood, message,
 *      position) so call sites in DynamicLesson don't change.
 *   2. If a Rive asset for the character is configured AND loads,
 *      uses the Rive runtime + state machine for breathing, blink,
 *      lip-sync (when narrating), and one-shot reactions.
 *   3. If no Rive asset OR if it fails to load, falls back to the
 *      same PNG swap behaviour as the legacy component (so we ship
 *      this wiring BEFORE the art arrives).
 *   4. Honours useMotionIntensity: reduced-motion users get the
 *      static PNG fallback even if Rive is available.
 *
 * Rive asset wiring is intentionally not configured yet (no .riv
 * files in /public/game/characters/). Once an artist commits e.g.
 * `/public/game/characters/adam.riv` + the canonical state-machine
 * name, swap RIVE_ASSETS in this file (or read from env/config).
 */

import { useEffect, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";

export type CharacterMood =
  | "idle"
  | "curious"
  | "excited"
  | "worried"
  | "thinking"
  | "thumbsup";

export interface RiveCharacterGuideProps {
  character: "adam" | "layla";
  mood: CharacterMood;
  message: string;
  position?: "left" | "right";
  onMessageComplete?: () => void;
}

/**
 * Asset registry. Populate when Rive files exist.
 * Setting any entry to a real path will switch that character to the
 * Rive renderer; null keeps the PNG fallback active.
 */
const RIVE_ASSETS: Record<"adam" | "layla", string | null> = {
  adam: null,   // e.g. "/game/characters/adam.riv"
  layla: null,
};

/**
 * Numeric state-machine input mapping (matches the spec in the plan).
 * 0=idle 1=curious 2=excited 3=worried 4=thinking 5=thumbsup
 * Kept here so the Rive editor and code agree.
 */
const MOOD_INDEX: Record<CharacterMood, number> = {
  idle: 0,
  curious: 1,
  excited: 2,
  worried: 3,
  thinking: 4,
  thumbsup: 5,
};

const TYPE_MS = 30;
const TYPE_SOUND_INTERVAL_MS = 260;

/* ─────────────── PUBLIC COMPONENT ─────────────── */

export default function RiveCharacterGuide(props: RiveCharacterGuideProps) {
  const intensity = useMotionIntensity();
  const riveAsset = RIVE_ASSETS[props.character];
  // Strict reduced-motion = always use PNG fallback (no animation budget).
  // No Rive asset = also use PNG. Both paths converge on the same component.
  const useRive = riveAsset !== null && intensity > 0;

  if (useRive) {
    // Forward-compatible mount point. Once a Rive asset is added, swap
    // this to <RiveRuntimeMount asset={riveAsset} stateMachine="..." />.
    // For now: no .riv file exists, so this branch is unreachable.
    return <RiveRuntimeMount {...props} riveAsset={riveAsset} />;
  }
  return <PngFallback {...props} />;
}

/* ─────────────── RIVE BRANCH (placeholder) ─────────────── */

/**
 * Real Rive integration goes here. Kept as a stub so the API is
 * fixed but no Rive runtime is loaded until an asset is committed.
 *
 * When implementing:
 *   - import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
 *   - load src=riveAsset, stateMachines="Default"
 *   - bind a "mood" number input → MOOD_INDEX[props.mood]
 *   - bind a "talking" bool input that pulses true while typewriter runs
 *   - bind a "react" trigger for one-shot celebrate/worried beats
 *   - keep the same speech bubble JSX from PngFallback (extract to a
 *     shared SpeechBubble component when this branch becomes live)
 *
 * Until then, render the PNG fallback so the contract still holds.
 */
function RiveRuntimeMount(props: RiveCharacterGuideProps & { riveAsset: string }) {
  // eslint-disable-next-line no-console
  console.warn(
    "[RiveCharacterGuide] Rive asset configured but runtime not yet implemented; falling back to PNG."
  );
  return <PngFallback {...props} />;
}

/* ─────────────── PNG FALLBACK ─────────────── */

/**
 * Functionally identical to the legacy CharacterGuide: PNG swap on
 * mood, typewriter speech bubble. Lives here so we can ship the Rive
 * API now and switch the renderer later without changing any call
 * site.
 */
function PngFallback({
  character,
  mood,
  message,
  position = "left",
  onMessageComplete,
}: RiveCharacterGuideProps) {
  const [typedText, setTypedText] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const soundIntervalRef = useRef<number | null>(null);
  const completeCalledRef = useRef(false);

  // Typewriter on message change.
  useEffect(() => {
    completeCalledRef.current = false;
    setDismissed(false);
    if (!message) {
      setBubbleVisible(false);
      setTypedText("");
      return;
    }
    setBubbleVisible(true);
    let i = 0;
    setTypedText("");
    playSound("typing");
    soundIntervalRef.current = window.setInterval(
      () => playSound("typing"),
      TYPE_SOUND_INTERVAL_MS
    );
    typingIntervalRef.current = window.setInterval(() => {
      i += 1;
      setTypedText(message.slice(0, i));
      if (i >= message.length) {
        if (typingIntervalRef.current) {
          window.clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        if (soundIntervalRef.current) {
          window.clearInterval(soundIntervalRef.current);
          soundIntervalRef.current = null;
        }
        if (!completeCalledRef.current) {
          completeCalledRef.current = true;
          onMessageComplete?.();
        }
      }
    }, TYPE_MS);
    return () => {
      if (typingIntervalRef.current) {
        window.clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (soundIntervalRef.current) {
        window.clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    };
  }, [message, onMessageComplete]);

  const imgSrc = `/game/characters/${character}-${mood}.png`;
  const fallbackSrc = `/game/characters/${character}-idle.png`;
  const isRight = position === "right";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        zIndex: 40,
        pointerEvents: "none",
        ...(isRight ? { right: 20 } : { left: 20 }),
      }}
    >
      {bubbleVisible && !dismissed && (
        <div
          className="rcg-bubble"
          style={{
            position: "absolute",
            bottom: 170,
            ...(isRight ? { right: 130 } : { left: 130 }),
            pointerEvents: "auto",
            background: "rgba(15, 21, 48, 0.92)",
            border: "1px solid rgba(0, 229, 255, 0.45)",
            borderRadius: 16,
            padding: "14px 36px 14px 18px",
            maxWidth: 300,
            minWidth: 180,
            color: "#e8edff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {typedText}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            style={{
              position: "absolute",
              top: 4,
              right: 6,
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
      <img
        className="rcg-char"
        src={imgSrc}
        alt={character === "adam" ? "Adam" : "Layla"}
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (el.src !== window.location.origin + fallbackSrc) {
            el.src = fallbackSrc;
          }
        }}
        style={{
          height: 200,
          width: "auto",
          display: "block",
          pointerEvents: "none",
          filter:
            "drop-shadow(0 10px 14px rgba(0, 0, 0, 0.65)) drop-shadow(0 0 22px rgba(0, 229, 255, 0.32))",
          WebkitMaskImage:
            "linear-gradient(180deg, black 0%, black 96%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, black 0%, black 96%, transparent 100%)",
        }}
      />
      <style>{`
        @media (max-width: 768px) {
          .rcg-char { height: 120px !important; }
          .rcg-bubble {
            max-width: 220px !important;
            font-size: 13px !important;
            padding: 10px 30px 10px 14px !important;
            bottom: 110px !important;
          }
        }
        @media (max-width: 860px), (max-height: 640px) {
          .rcg-char { display: none !important; }
          .rcg-bubble { display: none !important; }
        }
      `}</style>
    </div>
  );
}
