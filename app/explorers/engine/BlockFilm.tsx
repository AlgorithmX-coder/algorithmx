"use client";

/**
 * Block films: the cinematic bookends that top and tail each block.
 * An INTRO plays the first time a kid opens a block's opening case; an
 * OUTRO plays when they close the block's final case. Both are skippable
 * and each plays once (remembered in localStorage), so replays stay fast.
 *
 * Block 4's films don't exist yet, so its config carries no src and the
 * runtime simply shows nothing, gracefully.
 */

import { useEffect, useRef, useState } from "react";
import { MONO, T } from "./tokens";

type Film = { src: string; title: string };

type BlockFilmConfig = {
  label: string;
  openerId: string;
  closerId: string;
  intro?: Film;
  outro?: Film;
};

/** One entry per block. openerId/closerId are the first/last case of the block. */
export const BLOCK_FILMS: Record<number, BlockFilmConfig> = {
  1: {
    label: "BLOCK 1 · SIGNALS",
    openerId: "explorers-m01",
    closerId: "explorers-m05",
    intro: { src: "/explorers/block1-intro_the-wave.mp4", title: "The Wave" },
    outro: { src: "/explorers/block1-outro_reeled-in.mp4", title: "Reeled In" },
  },
  2: {
    label: "BLOCK 2 · THE HUMAN FACTOR",
    openerId: "explorers-m06",
    closerId: "explorers-m10",
    intro: { src: "/explorers/block2-intro_the-voice.mp4", title: "The Voice" },
    outro: { src: "/explorers/block2-outro_called-out.mp4", title: "Called Out" },
  },
  3: {
    label: "BLOCK 3 · SYSTEMS",
    openerId: "explorers-m11",
    closerId: "explorers-m15",
    intro: { src: "/explorers/block3-intro_not-me.mp4", title: "Not Me" },
    outro: { src: "/explorers/block3-outro_face-off.mp4", title: "Face-Off" },
  },
  4: {
    // Films for The Long Game aren't made yet: no src means nothing plays.
    label: "BLOCK 4 · THE LONG GAME",
    openerId: "explorers-m16",
    closerId: "explorers-m20",
  },
};

const SEEN_KEY = "explorers:films-seen";

/** Stable id for a given film, e.g. "block1-intro". */
export function filmId(block: number, kind: "intro" | "outro"): string {
  return `block${block}-${kind}`;
}

export function filmSeen(id: string): boolean {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as string[]).includes(id);
  } catch {
    return false;
  }
}

export function markFilmSeen(id: string): void {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
    }
  } catch {
    /* private mode / storage full: the film just replays next time */
  }
}

/**
 * Full-screen, skippable film overlay. Tries to autoplay (unless the kid
 * prefers reduced motion, where we wait for a tap); a Play button covers
 * the case where the browser blocks autoplay with sound.
 */
export function BlockFilm({
  film,
  label,
  kind,
  block,
  reduced,
  onDone,
}: {
  film: Film;
  label: string;
  kind: "intro" | "outro";
  block: number;
  reduced: boolean;
  onDone: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (reduced) return; // respect reduced-motion: wait for an explicit tap
    videoRef.current
      ?.play()
      .then(() => setStarted(true))
      .catch(() => {
        /* autoplay blocked: the center Play button handles it */
      });
  }, [reduced]);

  const play = () => {
    videoRef.current
      ?.play()
      .then(() => setStarted(true))
      .catch(() => {});
  };

  const eyebrow = kind === "intro" ? `${label} · BEGINS` : `${label} · CASE CLOSED`;

  return (
    <div
      role="dialog"
      aria-label={`${label} ${kind === "intro" ? "intro" : "outro"} film: ${film.title}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* top bar: what this is, and the always-available Skip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          zIndex: 2,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0))",
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: T.actionAmber }}>
          {eyebrow}
        </span>
        <button
          onClick={onDone}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: T.textSecondary,
            background: "rgba(0,0,0,0.4)",
            border: `1px solid ${T.hairline}`,
            borderRadius: 3,
            padding: "7px 14px",
            cursor: "pointer",
          }}
        >
          SKIP ▸
        </button>
      </div>

      <video
        ref={videoRef}
        src={film.src}
        playsInline
        onEnded={onDone}
        onPlay={() => setStarted(true)}
        style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", display: "block" }}
      />

      {/* center Play: shown until playback actually starts (covers blocked autoplay + reduced-motion) */}
      {!started && (
        <button
          onClick={play}
          aria-label={`Play ${film.title}`}
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: 96,
            height: 96,
            borderRadius: "50%",
            border: `2px solid ${T.actionAmber}`,
            background: "rgba(0,0,0,0.45)",
            color: T.actionAmber,
            fontSize: 34,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ▶
        </button>
      )}

      {/* film title caption */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "0.08em",
          color: T.textSecondary,
          pointerEvents: "none",
        }}
      >
        &ldquo;{film.title}&rdquo;
      </div>
    </div>
  );
}
