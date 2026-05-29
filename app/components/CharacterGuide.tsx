"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";

export type CharacterMood =
  | "idle"
  | "curious"
  | "excited"
  | "worried"
  | "thinking"
  | "thumbsup";

export interface CharacterGuideProps {
  character: "adam" | "layla";
  mood: CharacterMood;
  message: string;
  position?: "left" | "right";
  onMessageComplete?: () => void;
}

/* Animation timing - must stay in sync with the CSS keyframes below. */
const TYPE_MS = 30;
const TYPE_SOUND_INTERVAL_MS = 260;
const EXIT_MS = 250;
const PAUSE_MS = 200;
const ENTER_MS = 400;
const BUBBLE_DELAY_AFTER_ENTER = 300;

type Phase = "visible" | "exiting" | "hidden";

export default function CharacterGuide({
  character,
  mood,
  message,
  position = "left",
  onMessageComplete,
}: CharacterGuideProps) {
  // `displayed*` lag behind the props so the exit animation shows the OLD
  // mood and message; they only update while the character is hidden.
  const [displayedMood, setDisplayedMood] = useState<CharacterMood>(mood);
  const [displayedMessage, setDisplayedMessage] = useState<string>(message);
  const [phase, setPhase] = useState<Phase>("visible");
  const [enterKey, setEnterKey] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const typingIntervalRef = useRef<number | null>(null);
  const soundIntervalRef = useRef<number | null>(null);
  const completeCalledRef = useRef(false);
  const onCompleteRef = useRef(onMessageComplete);
  useEffect(() => {
    onCompleteRef.current = onMessageComplete;
  }, [onMessageComplete]);

  const clearTimers = () => {
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (soundIntervalRef.current) {
      window.clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  };

  const startTypewriter = (text: string) => {
    clearTimers();
    let i = 0;
    setTypedText("");
    playSound("typing");
    soundIntervalRef.current = window.setInterval(
      () => playSound("typing"),
      TYPE_SOUND_INTERVAL_MS
    );
    typingIntervalRef.current = window.setInterval(() => {
      i += 1;
      setTypedText(text.slice(0, i));
      if (i >= text.length) {
        clearTimers();
        if (!completeCalledRef.current) {
          completeCalledRef.current = true;
          onCompleteRef.current?.();
        }
      }
    }, TYPE_MS);
  };

  const isFirstRunRef = useRef(true);
  const prevPropsRef = useRef({ message, mood });

  // Orchestrates: exit (old mood) → hidden → enter (new mood) → bubble + typewriter.
  // Empty `message` → mood-only mode (no bubble, no typewriter).
  useEffect(() => {
    const hasMessage = message.length > 0;

    // First render - just play the enter + bubble once, no exit dance.
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      if (!hasMessage) return;
      const t = window.setTimeout(() => {
        setBubbleVisible(true);
        completeCalledRef.current = false;
        startTypewriter(message);
      }, ENTER_MS + BUBBLE_DELAY_AFTER_ENTER);
      return () => {
        window.clearTimeout(t);
        clearTimers();
      };
    }

    // No real change - skip.
    if (
      prevPropsRef.current.message === message &&
      prevPropsRef.current.mood === mood
    ) {
      return;
    }
    prevPropsRef.current = { message, mood };

    setDismissed(false);
    completeCalledRef.current = false;
    clearTimers();

    // 1) Exit - hide bubble + animate character down/fade
    setBubbleVisible(false);
    setTypedText("");
    setPhase("exiting");

    // 2) After exit (0.25s), briefly hide (0.2s). During `hidden` the mood
    //    & message are swapped, then the character enters with new mood.
    const t1 = window.setTimeout(() => setPhase("hidden"), EXIT_MS);

    const t2 = window.setTimeout(() => {
      setDisplayedMood(mood);
      setDisplayedMessage(message);
      setEnterKey((k) => k + 1);
      setPhase("visible");
    }, EXIT_MS + PAUSE_MS);

    // 3) 0.3s after the character settles, show bubble + typewriter (only if
    //    there's a message to show).
    let t3: number | null = null;
    if (hasMessage) {
      t3 = window.setTimeout(() => {
        setBubbleVisible(true);
        startTypewriter(message);
      }, EXIT_MS + PAUSE_MS + ENTER_MS + BUBBLE_DELAY_AFTER_ENTER);
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (t3 !== null) window.clearTimeout(t3);
      clearTimers();
    };
  }, [message, mood]);

  const imgSrc = `/game/characters/${character}-${displayedMood}.png`;
  const fallbackSrc = `/game/characters/${character}-idle.png`;
  const isRight = position === "right";
  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 20,
    zIndex: 40,
    pointerEvents: "none",
    ...(isRight ? { right: 20 } : { left: 20 }),
  };
  const bubbleSide: React.CSSProperties = isRight ? { right: 130 } : { left: 130 };

  return (
    <div style={wrapperStyle}>
      {bubbleVisible && !dismissed && (
        <div
          className="cg-bubble"
          style={{
            position: "absolute",
            bottom: 170,
            ...bubbleSide,
            pointerEvents: "auto",
            background: "rgba(15, 21, 48, 0.92)",
            border: "1px solid rgba(0, 229, 255, 0.45)",
            borderRadius: 16,
            padding: "14px 36px 14px 18px",
            maxWidth: 300,
            minWidth: 180,
            color: "#e8edff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            lineHeight: 1.6,
            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.65), 0 0 24px rgba(0, 229, 255, 0.32)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss message"
            style={{
              position: "absolute",
              top: 4,
              right: 6,
              background: "transparent",
              border: "none",
              color: "rgba(255,233,200,0.55)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
              fontFamily: "sans-serif",
            }}
          >
            ×
          </button>
          <span>
            {typedText}
            {typedText.length < displayedMessage.length && (
              <span style={{ opacity: 0.5 }}>▎</span>
            )}
          </span>
          <div
            className={
              isRight ? "cg-pointer cg-pointer-right" : "cg-pointer cg-pointer-left"
            }
            aria-hidden="true"
          />
        </div>
      )}

      {/* SVG filter that erodes the image's alpha channel by ~1.2px to
          kill the dark matting fringe around Layla's neck/shoulders.
          The PNG cutouts have semi-transparent edge pixels that read as
          a halo against the dark dusk backdrop; eroding the alpha
          shrinks the silhouette inward by exactly enough to drop those
          fringe pixels off the edge. Definition lives once at the top
          of the guide so the same filter id is reused for both Adam
          and Layla. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <filter id="cgEdgeClean" x="-5%" y="-5%" width="110%" height="110%">
            {/* Was radius="1.2" - but at smaller render sizes that ate
                hair tips, fingers and silhouette detail (testers
                reported characters looking "distorted" / "chunky").
                0.4 still kills semi-transparent edge fringe but
                preserves features. */}
            <feMorphology in="SourceGraphic" operator="erode" radius="0.4" />
          </filter>
        </defs>
      </svg>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${phase}-${enterKey}`}
        src={imgSrc}
        alt={character}
        className={`cg-char cg-char-${phase}`}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== window.location.origin + fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
      />

      <style>{`
        @keyframes cgExit {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(30px); }
        }
        @keyframes cgEnter {
          0%   { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cgIdleBounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes cgBubbleIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .cg-char {
          height: 200px;
          width: auto;
          display: block;
          pointer-events: none;
          /* Filter chain (order matters - filters apply left-to-right):
             1. url(#cgEdgeClean) erodes the alpha channel by ~1.2px so
                the semi-transparent matting fringe around the
                silhouette is dropped before the drop-shadows compute.
             2. drop-shadow grounds the character with a deep shadow.
             3. drop-shadow #2 adds the cyan rim-light (the cyber
                command-centre glow). */
          filter:
            url(#cgEdgeClean)
            drop-shadow(0 10px 14px rgba(0, 0, 0, 0.65))
            drop-shadow(0 0 22px rgba(0, 229, 255, 0.32));
          /* Soft fade on the very bottom - defensive backup for shoes/
             feet area. Tightened from 92% → 96% now that the lighter
             erode no longer compounds with the mask. */
          -webkit-mask-image: linear-gradient(180deg, black 0%, black 96%, transparent 100%);
                  mask-image: linear-gradient(180deg, black 0%, black 96%, transparent 100%);
        }
        /* Static state while hidden between exit and enter. */
        .cg-char-hidden { opacity: 0; transform: translateY(30px); }
        /* Exit animation - fill forwards so final frame persists. */
        .cg-char-exiting {
          animation: cgExit ${EXIT_MS}ms ease-in forwards;
        }
        /* Enter animation (easeOutBack for the little bounce) then settle into
           the infinite idle bounce. */
        .cg-char-visible {
          animation:
            cgEnter ${ENTER_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
            cgIdleBounce 3s ease-in-out infinite ${ENTER_MS}ms;
        }

        .cg-bubble { animation: cgBubbleIn 0.3s ease-out; }
        .cg-pointer {
          position: absolute;
          bottom: -9px;
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid rgba(15, 21, 48, 0.92);
        }
        .cg-pointer-left  { left:  36px }
        .cg-pointer-right { right: 36px }

        @media (max-width: 768px) {
          .cg-char { height: 120px !important; }
          .cg-bubble {
            max-width: 220px !important;
            font-size: 13px !important;
            padding: 10px 30px 10px 14px !important;
            bottom: 110px !important;
          }
        }
        /* On viewports too narrow OR too short to safely overlay the
           lesson content, hide the character guide entirely. The
           playable area takes priority. Threshold matches the
           breakpoints where Adam + Layla + bubble would crowd the
           exercise frame (max 760px + 24px padding either side =
           ~810px clear width needed). */
        @media (max-width: 860px), (max-height: 640px) {
          .cg-char { display: none !important; }
          .cg-bubble { display: none !important; }
        }
      `}</style>
    </div>
  );
}
