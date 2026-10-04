"use client";

/**
 * Per-case visual identity for the Signal Room runtime.
 *
 * Every case in a block wears a DIFFERENT theme so no two cases look alike
 * (owner mandate): a distinct identity accent, an animated backdrop "world", and
 * a re-skinned captured-device frame. The LEARNING is untouched — only the
 * surface changes. Threaded via React context so the shared primitives
 * (DeviceFrame, Bubble, Face) and every mechanic pick it up with no prop drilling.
 */

import { createContext, useContext } from "react";
import type { BackdropVariant } from "../BlockBackdrop";
import type { CaseThemeKey } from "./types";
import { MONO, BODY } from "./tokens";

export interface CaseTheme {
  key: CaseThemeKey;
  /** Identity accent — replaces the runtime's default cyan, per case. */
  accent: string;
  accentHi: string;
  /** "r, g, b" for rgba() glows. */
  accentRGB: string;
  /** The animated background world for this case. */
  backdrop: BackdropVariant;
  /** Backdrop palette (2–3 tints). */
  matrix: string[];
  /** Re-skins the captured-screen DeviceFrame so it reads as a different device. */
  device: { viewer: string; tag: string; radius: number };
  /** Exercise-card SURFACE SKIN, exposed as CSS custom properties on the runtime
   *  wrapper. Every mechanic paints its cards from these vars, so each case's
   *  activities wear a different surface (paper / neon / terminal / cork / ops).
   *  Contract: --sf-card (primary fill), --sf-card2 (inset/header fill),
   *  --sf-ink (text on card), --sf-dim (secondary text), --sf-edge (border),
   *  --sf-radius, --sf-font, --sf-shadow, --sf-accent (on-card accent). */
  surface: Record<string, string>;
}

export const CASE_THEMES: Record<CaseThemeKey, CaseTheme> = {
  // Case 1 — Phishing / PHANTOM HOOK — the first contact, signal waves.
  signals: {
    key: "signals",
    accent: "#34E1FF", accentHi: "#7FF0FF", accentRGB: "52, 225, 255",
    backdrop: "signals", matrix: ["#34E1FF", "#7FF0FF", "#3BF57E"],
    device: { viewer: "ARC EVIDENCE VIEWER", tag: "CAPTURED SCREEN", radius: 18 },
    surface: {
      "--sf-card": "#ECE6D4", "--sf-card2": "#E0D9C2", "--sf-ink": "#22262C",
      "--sf-dim": "#6B6650", "--sf-edge": "#D1C9B0", "--sf-radius": "3px",
      "--sf-font": BODY, "--sf-shadow": "0 14px 30px -14px rgba(0,0,0,0.7)", "--sf-accent": "#9A5B2C",
    },
  },
  // Case 2 — Too Good To Be True / SIREN — gaudy prize shower.
  prize: {
    key: "prize",
    accent: "#FF3DA6", accentHi: "#FFCC4D", accentRGB: "255, 61, 166",
    backdrop: "prize", matrix: ["#FF3DA6", "#FFCC4D", "#B85CFF"],
    device: { viewer: "SCAM CAPTURE", tag: "POP-UP AD", radius: 14 },
    surface: {
      "--sf-card": "linear-gradient(160deg,#2C0C20,#160A1E)", "--sf-card2": "rgba(255,61,166,0.12)",
      "--sf-ink": "#FFFFFF", "--sf-dim": "#FFB6DC", "--sf-edge": "#FF3DA6", "--sf-radius": "13px",
      "--sf-font": BODY, "--sf-shadow": "0 0 26px rgba(255,61,166,0.4), inset 0 0 20px rgba(255,61,166,0.12)", "--sf-accent": "#FFCC4D",
    },
  },
  // Case 3 — The Guessing Game / SKELETON KEY — the cracking rig.
  crack: {
    key: "crack",
    accent: "#3BF57E", accentHi: "#B9FFD0", accentRGB: "59, 245, 126",
    backdrop: "crack", matrix: ["#3BF57E", "#8Cff9f", "#1FB45A"],
    device: { viewer: "CRACK RIG // KEYLOG", tag: "root@rig", radius: 6 },
    surface: {
      "--sf-card": "#04140A", "--sf-card2": "#06180E", "--sf-ink": "#8FF5AA",
      "--sf-dim": "#3F9F5C", "--sf-edge": "#1F7A44", "--sf-radius": "6px",
      "--sf-font": MONO, "--sf-shadow": "0 0 18px rgba(59,245,126,0.16)", "--sf-accent": "#B9FFD0",
    },
  },
  // Case 4 — The Puzzle You Posted / PACKRAT — the evidence pinboard.
  pinboard: {
    key: "pinboard",
    accent: "#FFB23E", accentHi: "#FFD98A", accentRGB: "255, 178, 62",
    backdrop: "pinboard", matrix: ["#FF6B57", "#FFB23E", "#FFD98A"],
    device: { viewer: "EVIDENCE BOARD", tag: "METADATA", radius: 10 },
    surface: {
      "--sf-card": "#ECE1C6", "--sf-card2": "#E0D3B0", "--sf-ink": "#2A2114",
      "--sf-dim": "#8A6D3F", "--sf-edge": "#CBB98D", "--sf-radius": "2px",
      "--sf-font": BODY, "--sf-shadow": "0 12px 24px -12px rgba(0,0,0,0.75)", "--sf-accent": "#C0392B",
    },
  },
  // Case 5 — Signal Storm / PHANTOM HOOK — the incoming storm, aimed at you.
  storm: {
    key: "storm",
    accent: "#FF5A5F", accentHi: "#FF9AA0", accentRGB: "255, 90, 95",
    backdrop: "storm", matrix: ["#FF5A5F", "#B85CFF", "#FF9AA0"],
    device: { viewer: "CHANNEL MONITOR", tag: "ARC INTERCEPTS", radius: 6 },
    surface: {
      "--sf-card": "linear-gradient(180deg,#1C1013,#0F0B11)", "--sf-card2": "rgba(255,90,95,0.08)",
      "--sf-ink": "#E7EDF5", "--sf-dim": "#FF9AA0", "--sf-edge": "rgba(255,90,95,0.42)", "--sf-radius": "4px",
      "--sf-font": BODY, "--sf-shadow": "0 0 20px rgba(255,90,95,0.16)", "--sf-accent": "#FF5A5F",
    },
  },
};

/** Resolve a manifest to its theme. Falls back to the block's opener look. */
export function resolveCaseTheme(theme: CaseThemeKey | undefined): CaseTheme {
  return (theme && CASE_THEMES[theme]) || CASE_THEMES.signals;
}

const CaseThemeContext = createContext<CaseTheme>(CASE_THEMES.signals);
export const CaseThemeProvider = CaseThemeContext.Provider;
export function useCaseTheme(): CaseTheme {
  return useContext(CaseThemeContext);
}
