"use client";

import { CSSProperties, useEffect, useMemo } from "react";
import RiveCharacter, { type CharacterName } from "@/app/components/RiveCharacter";
import { SoundManager } from "@/app/lib/sounds";

type Mood = "happy" | "talking" | "celebrating" | "worried" | "idle";
type Size = "small" | "medium" | "large";
type Position = "left" | "right" | "center";

type CharacterSceneProps = {
  character: CharacterName;
  mood: Mood;
  speech?: string;
  voiceLine?: string;
  size?: Size;
  position?: Position;
};

const CHARACTER_COLORS: Record<CharacterName, string> = {
  adam: "#60a5fa",
  layla: "#34d399",
  robo: "#f59e0b",
  raccoon: "#ef4444",
};

const MOOD_TO_STATE: Record<Mood, string> = {
  idle: "0",
  happy: "1",
  talking: "2",
  celebrating: "3",
  worried: "4",
};

const SIZE_PX: Record<Size, number> = {
  small: 120,
  medium: 200,
  large: 300,
};

const REVEAL_KEYFRAMES_ID = "ax-character-reveal-keyframes";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(REVEAL_KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = REVEAL_KEYFRAMES_ID;
  style.textContent = `
@keyframes axSceneReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes axScenePop { from { opacity: 0; transform: translateY(6px) scale(0.96); } to { opacity: 1; transform: none; } }
`;
  document.head.appendChild(style);
}

function SpeechBubble({
  text,
  color,
  side,
}: {
  text: string;
  color: string;
  side: Position;
}) {
  // Pointer position & direction depend on which side the character is on
  const isRight = side === "right";
  const isCenter = side === "center";

  const bubbleStyle: CSSProperties = {
    position: "relative",
    maxWidth: 320,
    background: "#111827",
    border: `1px solid ${color}33`,
    borderRadius: 16,
    padding: "14px 18px",
    color: "#f1f5f9",
    fontFamily: "'Nunito', sans-serif",
    fontSize: 16,
    lineHeight: 1.5,
    boxShadow: `0 6px 24px rgba(0,0,0,0.35), 0 0 18px ${color}22`,
    animation: "axScenePop 0.35s cubic-bezier(0.16,1,0.3,1) both",
  };

  const revealStyle: CSSProperties = {
    display: "inline-block",
    animation: "axSceneReveal 1s steps(30, end) both",
  };

  // Tail — small coloured triangle pointing back toward the character
  const tailCommon: CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
  };

  let tailStyle: CSSProperties;
  if (isCenter) {
    tailStyle = {
      ...tailCommon,
      bottom: -10,
      left: "50%",
      transform: "translateX(-50%)",
      borderWidth: "10px 8px 0 8px",
      borderColor: `#111827 transparent transparent transparent`,
      filter: `drop-shadow(0 1px 0 ${color}33)`,
    };
  } else if (isRight) {
    tailStyle = {
      ...tailCommon,
      right: -9,
      top: 22,
      borderWidth: "8px 0 8px 10px",
      borderColor: `transparent transparent transparent #111827`,
      filter: `drop-shadow(1px 0 0 ${color}33)`,
    };
  } else {
    tailStyle = {
      ...tailCommon,
      left: -9,
      top: 22,
      borderWidth: "8px 10px 8px 0",
      borderColor: `transparent #111827 transparent transparent`,
      filter: `drop-shadow(-1px 0 0 ${color}33)`,
    };
  }

  return (
    <div style={bubbleStyle} role="note">
      <span style={revealStyle}>{text}</span>
      <span aria-hidden style={tailStyle} />
    </div>
  );
}

export default function CharacterScene({
  character,
  mood,
  speech,
  voiceLine,
  size = "medium",
  position = "left",
}: CharacterSceneProps) {
  const px = SIZE_PX[size];
  const color = CHARACTER_COLORS[character];
  const state = MOOD_TO_STATE[mood];

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    if (!voiceLine) return;
    void SoundManager.getInstance().playVoice(voiceLine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceLine]);

  const justify = useMemo<CSSProperties["justifyContent"]>(() => {
    if (position === "right") return "flex-end";
    if (position === "center") return "center";
    return "flex-start";
  }, [position]);

  const rowDirection: CSSProperties["flexDirection"] =
    position === "right" ? "row-reverse" : "row";

  const layout: CSSProperties = {
    display: "flex",
    flexDirection: position === "center" ? "column" : rowDirection,
    alignItems: position === "center" ? "center" : "flex-start",
    justifyContent: justify,
    gap: 18,
    width: "100%",
  };

  return (
    <div style={layout}>
      <div
        style={{
          flexShrink: 0,
          filter: `drop-shadow(0 6px 18px ${color}33)`,
          animation: "axScenePop 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <RiveCharacter character={character} state={state} width={px} height={px} />
      </div>
      {speech && (
        <div style={{ paddingTop: position === "center" ? 0 : 8 }}>
          <SpeechBubble text={speech} color={color} side={position} />
        </div>
      )}
    </div>
  );
}

export type { CharacterSceneProps, Mood };
