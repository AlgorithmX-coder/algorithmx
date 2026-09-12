"use client";

/**
 * Materials for the per-week mission stage worlds (missionWorlds.ts):
 * floor textures, beam motes and card materials. Every kind is a small
 * CSS recipe; MissionBriefScene mounts them only for weeks with a world.
 */

import { useMemo, type CSSProperties } from "react";
import { MISSION_WORLDS, type MissionWorld, type MissionFloor, type MissionMotes, type MissionCardMaterial } from "@/app/lesson/weekContent/missionWorlds";
import { useLessonWeek } from "@/app/components/lesson/LessonWeekContext";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import WeekIntroBackdrop from "@/app/components/lesson/WeekIntroBackdrop";

/* ───────────────────────── FLOORS ───────────────────────── */

export interface FloorStyle {
  /** The plate itself (radial ellipse, near edge at the top). */
  base: string;
  /** A texture layer over the plate (screen/normal blend, masked to fade out). */
  texture: string;
  textureSize?: string;
  textureOpacity: number;
  blend: CSSProperties["mixBlendMode"];
  /** Rim + inner shadow. */
  rim: string;
}

const hLines = (a: string, w = 2, gap = 5) => `repeating-linear-gradient(0deg, ${a} 0 ${w}px, transparent ${w}px ${gap}px)`;
const vLines = (a: string, w = 2, gap = 5) => `repeating-linear-gradient(90deg, ${a} 0 ${w}px, transparent ${w}px ${gap}px)`;

export const WORLD_FLOORS: Record<MissionFloor, FloorStyle> = {
  steel: {
    base: "radial-gradient(ellipse at 50% 30%, #3a4150 0%, #262b35 40%, #171b22 75%, #0c0f15 100%)",
    texture: vLines("rgba(255,255,255,0.05)", 2, 5) + ", repeating-conic-gradient(from 0deg at 50% 30%, rgba(227,179,65,0.45) 0deg 1deg, transparent 1deg 10deg)",
    textureOpacity: 0.5, blend: "screen",
    rim: "inset 0 0 0 4px rgba(227,179,65,0.35), inset 0 0 90px rgba(0,0,0,0.65), 0 -8px 40px rgba(227,179,65,0.12)",
  },
  concrete: {
    base: "radial-gradient(ellipse at 50% 30%, #1f5a60 0%, #123f45 40%, #0a2a2e 75%, #041518 100%)",
    texture: "repeating-linear-gradient(-45deg, rgba(255,214,0,0.35) 0 14px, rgba(0,0,0,0.5) 14px 28px)",
    textureOpacity: 0.35, blend: "normal",
    rim: "inset 0 0 0 3px rgba(157,123,255,0.35), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  cobbles: {
    base: "radial-gradient(ellipse at 50% 25%, #3a3160 0%, #2b2444 35%, #1d1836 70%, #120e24 100%)",
    texture: "repeating-radial-gradient(ellipse at 50% 110%, rgba(255,255,255,0.09) 0 12px, rgba(0,0,0,0.25) 12px 15px), " + vLines("rgba(0,0,0,0.28)", 3, 29),
    textureOpacity: 0.9, blend: "normal",
    rim: "inset 0 0 0 3px rgba(245,166,35,0.22), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  boardwalk: {
    base: "radial-gradient(ellipse at 50% 25%, #5a1a4a 0%, #3d1136 45%, #260a22 75%, #140512 100%)",
    texture: "repeating-linear-gradient(90deg, rgba(255,220,120,0.35) 0 22px, rgba(232,77,255,0.25) 22px 44px), " + hLines("rgba(0,0,0,0.35)", 2, 18),
    textureOpacity: 0.6, blend: "normal",
    rim: "inset 0 0 0 3px rgba(255,220,120,0.4), inset 0 0 90px rgba(0,0,0,0.6), 0 -10px 50px rgba(232,77,255,0.15)",
  },
  moss: {
    base: "radial-gradient(ellipse at 50% 30%, #2f4a2a 0%, #1f3320 40%, #142214 75%, #0a120a 100%)",
    texture: "radial-gradient(circle, rgba(180,220,120,0.5) 0 2px, transparent 3px), repeating-radial-gradient(circle at 50% 30%, transparent 0 46px, rgba(120,80,40,0.55) 46px 52px, transparent 52px 400px)",
    textureSize: "26px 26px, auto", textureOpacity: 0.6, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,142,110,0.3), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  grid: {
    base: "radial-gradient(ellipse at 50% 20%, #2a0f4d 0%, #1b0d33 45%, #0c0518 100%)",
    texture: vLines("rgba(0,229,255,0.35)", 2, 40) + ", " + hLines("rgba(255,60,180,0.32)", 2, 32),
    textureOpacity: 0.75, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,60,180,0.45), inset 0 0 90px rgba(0,0,0,0.65), 0 -10px 50px rgba(255,60,180,0.18)",
  },
  velvet: {
    base: "radial-gradient(ellipse at 50% 30%, #6a1a2e 0%, #4a1122 40%, #2e0a16 75%, #16050b 100%)",
    texture: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 3px, transparent 3px 9px), radial-gradient(ellipse at 50% 30%, rgba(255,209,88,0.25), transparent 60%)",
    textureOpacity: 0.7, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,209,88,0.4), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  tile: {
    base: "radial-gradient(ellipse at 50% 30%, #3a2216 0%, #26150e 45%, #170c08 75%, #0a0504 100%)",
    texture: vLines("rgba(255,120,60,0.28)", 2, 44) + ", " + hLines("rgba(255,120,60,0.28)", 2, 44) + ", radial-gradient(ellipse at 50% 30%, rgba(255,107,61,0.3), transparent 55%)",
    textureOpacity: 0.8, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,107,61,0.35), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  belt: {
    base: "radial-gradient(ellipse at 50% 30%, #1c2a4a 0%, #121c34 45%, #0b1222 75%, #050912 100%)",
    texture: hLines("rgba(43,127,255,0.35)", 3, 26) + ", " + vLines("rgba(255,255,255,0.05)", 1, 8),
    textureOpacity: 0.8, blend: "screen",
    rim: "inset 0 0 0 3px rgba(43,127,255,0.4), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  earth: {
    base: "radial-gradient(ellipse at 50% 30%, #3a2a4a 0%, #261a36 45%, #170f24 75%, #0b0712 100%)",
    texture: "radial-gradient(circle, rgba(184,227,75,0.45) 0 2px, transparent 3px), repeating-linear-gradient(35deg, rgba(120,80,140,0.35) 0 4px, transparent 4px 40px)",
    textureSize: "38px 38px, auto", textureOpacity: 0.6, blend: "screen",
    rim: "inset 0 0 0 3px rgba(184,227,75,0.3), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  grating: {
    base: "radial-gradient(ellipse at 50% 30%, #4a2a26 0%, #331c1a 45%, #1f100f 75%, #0d0605 100%)",
    texture: vLines("rgba(255,149,40,0.3)", 2, 18) + ", " + hLines("rgba(255,149,40,0.3)", 2, 18),
    textureOpacity: 0.7, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,149,40,0.4), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  snow: {
    base: "radial-gradient(ellipse at 50% 30%, #dbeeff 0%, #a9cbe8 40%, #6d90b4 75%, #2f4a6a 100%)",
    texture: "radial-gradient(circle, rgba(255,255,255,0.9) 0 1px, transparent 2px)",
    textureSize: "14px 14px", textureOpacity: 0.5, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,255,255,0.5), inset 0 0 90px rgba(20,40,70,0.55)",
  },
  grass: {
    base: "radial-gradient(ellipse at 50% 30%, #2f6a5a 0%, #1f4a40 45%, #14302a 75%, #0a1814 100%)",
    texture: "repeating-linear-gradient(80deg, rgba(120,220,180,0.35) 0 1px, transparent 1px 6px), radial-gradient(ellipse at 50% 30%, rgba(255,214,150,0.3), transparent 60%)",
    textureOpacity: 0.7, blend: "screen",
    rim: "inset 0 0 0 3px rgba(46,196,182,0.35), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  rug: {
    base: "radial-gradient(ellipse at 50% 30%, #4a3222 0%, #34231a 45%, #1f1410 75%, #0d0806 100%)",
    texture: "repeating-radial-gradient(ellipse at 50% 30%, rgba(69,227,255,0.25) 0 6px, transparent 6px 30px)",
    textureOpacity: 0.55, blend: "screen",
    rim: "inset 0 0 0 3px rgba(69,227,255,0.3), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  circuit: {
    base: "radial-gradient(ellipse at 50% 25%, #0f3a31 0%, #0b2a24 45%, #06211b 75%, #04110f 100%)",
    texture: vLines("rgba(61,255,196,0.28)", 1, 34) + ", " + hLines("rgba(61,255,196,0.2)", 1, 34) + ", radial-gradient(circle, rgba(61,255,196,0.75) 0 2px, transparent 3px)",
    textureSize: "auto, auto, 33px 33px", textureOpacity: 0.7, blend: "screen",
    rim: "inset 0 0 0 3px rgba(61,255,196,0.3), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  checker: {
    base: "radial-gradient(ellipse at 50% 30%, #3a1a5a 0%, #26113d 45%, #170a26 75%, #0a0412 100%)",
    texture: "repeating-conic-gradient(rgba(180,77,255,0.35) 0 25%, transparent 0 50%)",
    textureSize: "44px 44px", textureOpacity: 0.55, blend: "screen",
    rim: "inset 0 0 0 3px rgba(180,77,255,0.4), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  glass: {
    base: "radial-gradient(ellipse at 50% 30%, #1c3a5a 0%, #12273f 45%, #0b1828 75%, #050b14 100%)",
    texture: "linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0) 60%), " + hLines("rgba(56,182,255,0.25)", 1, 24),
    textureOpacity: 0.8, blend: "screen",
    rim: "inset 0 0 0 3px rgba(56,182,255,0.4), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  lockerTile: {
    base: "radial-gradient(ellipse at 50% 30%, #2c3a44 0%, #1e2a32 45%, #131b21 75%, #080c10 100%)",
    texture: vLines("rgba(98,182,203,0.3)", 2, 30) + ", " + hLines("rgba(98,182,203,0.3)", 2, 30),
    textureOpacity: 0.7, blend: "screen",
    rim: "inset 0 0 0 3px rgba(98,182,203,0.35), inset 0 0 90px rgba(0,0,0,0.65)",
  },
  hearth: {
    base: "radial-gradient(ellipse at 50% 30%, #6a3a22 0%, #4a2718 45%, #2e1810 75%, #150a06 100%)",
    texture: "repeating-radial-gradient(ellipse at 50% 30%, rgba(255,178,107,0.3) 0 5px, transparent 5px 26px), " + hLines("rgba(0,0,0,0.25)", 2, 12),
    textureOpacity: 0.6, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,178,107,0.4), inset 0 0 90px rgba(0,0,0,0.6)",
  },
  stage: {
    base: "radial-gradient(ellipse at 50% 30%, #2a3570 0%, #1a2350 45%, #0f1533 75%, #060a1c 100%)",
    texture: "linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 65%), " + vLines("rgba(255,215,120,0.18)", 2, 60),
    textureOpacity: 0.85, blend: "screen",
    rim: "inset 0 0 0 3px rgba(255,215,120,0.45), inset 0 0 90px rgba(0,0,0,0.6), 0 -10px 50px rgba(91,118,255,0.2)",
  },
};

/* ───────────────────────── MOTES ───────────────────────── */

export interface MoteStyle {
  count: number;
  /** null = round dots; strings = characters (the "coding animation" kinds). */
  chars: string[] | null;
  colours: string[];
  glows: string[];
  sizes: [number, number];
  twinkle: boolean;
}

export const WORLD_MOTES: Record<MissionMotes, MoteStyle> = {
  sparks: { count: 30, chars: null, colours: ["#ffd58a", "#ff9b3d", "#fff1c9"], glows: ["rgba(255,213,138,0.8)", "rgba(255,155,61,0.7)", "rgba(255,241,201,0.8)"], sizes: [2, 4], twinkle: false },
  dust: { count: 26, chars: null, colours: ["#c9b8ff", "#9d7bff", "#e8e0ff"], glows: ["rgba(157,123,255,0.7)", "rgba(157,123,255,0.6)", "rgba(232,224,255,0.6)"], sizes: [2, 4], twinkle: false },
  fireflies: { count: 20, chars: null, colours: ["#ffcf6b", "#ffe6a8"], glows: ["rgba(245,166,35,0.9)", "rgba(255,230,168,0.8)"], sizes: [3, 5], twinkle: true },
  bulbs: { count: 22, chars: null, colours: ["#ffe27a", "#ff7ad9", "#7df0ff"], glows: ["rgba(255,226,122,0.9)", "rgba(255,122,217,0.8)", "rgba(125,240,255,0.8)"], sizes: [3, 6], twinkle: true },
  embers: { count: 26, chars: null, colours: ["#ff9b3d", "#ffcf6b", "#ff6b3d"], glows: ["rgba(255,155,61,0.85)", "rgba(255,207,107,0.8)", "rgba(255,107,61,0.8)"], sizes: [2, 5], twinkle: true },
  glyphs: { count: 24, chars: ["01", "<>", "★", "▲", "◆", "10"], colours: ["#ff3cb4", "#7df0ff", "#ffd158"], glows: ["rgba(255,60,180,0.8)", "rgba(0,229,255,0.8)", "rgba(255,209,88,0.7)"], sizes: [9, 15], twinkle: false },
  glints: { count: 22, chars: null, colours: ["#ffd158", "#fff1c9", "#ff4e6a"], glows: ["rgba(255,209,88,0.9)", "rgba(255,241,201,0.8)", "rgba(255,78,106,0.7)"], sizes: [2, 5], twinkle: true },
  amber: { count: 26, chars: null, colours: ["#ffb27a", "#ff6b3d", "#ffe0c0"], glows: ["rgba(255,178,122,0.7)", "rgba(255,107,61,0.6)", "rgba(255,224,192,0.6)"], sizes: [2, 4], twinkle: false },
  code: { count: 30, chars: ["0", "1", "{ }", "</>", "01", "10", "#", "//"], colours: ["#3dffc4", "#7df0ff", "#a0ffb0"], glows: ["rgba(61,255,196,0.8)", "rgba(0,229,255,0.7)", "rgba(160,255,176,0.7)"], sizes: [8, 16], twinkle: false },
  spores: { count: 26, chars: null, colours: ["#b8e34b", "#e2ff9a", "#7ac943"], glows: ["rgba(184,227,75,0.8)", "rgba(226,255,154,0.7)", "rgba(122,201,67,0.7)"], sizes: [2, 5], twinkle: true },
  blips: { count: 20, chars: ["•", "◦", "▪"], colours: ["#ff9528", "#ffd58a", "#ffb26b"], glows: ["rgba(255,149,40,0.9)", "rgba(255,213,138,0.8)", "rgba(255,178,107,0.8)"], sizes: [8, 14], twinkle: true },
  snow: { count: 34, chars: ["❄", "•", "❅"], colours: ["#ffffff", "#dff3ff", "#a8e4ff"], glows: ["rgba(255,255,255,0.8)", "rgba(223,243,255,0.7)", "rgba(168,228,255,0.7)"], sizes: [7, 14], twinkle: false },
  pollen: { count: 24, chars: null, colours: ["#ffe6a8", "#ffd77a", "#c9f5e8"], glows: ["rgba(255,230,168,0.8)", "rgba(255,215,122,0.7)", "rgba(201,245,232,0.7)"], sizes: [2, 4], twinkle: true },
  pulses: { count: 22, chars: ["◉", "◎", "•"], colours: ["#45e3ff", "#9ff0ff", "#ffffff"], glows: ["rgba(69,227,255,0.9)", "rgba(159,240,255,0.8)", "rgba(255,255,255,0.7)"], sizes: [7, 13], twinkle: true },
  orchid: { count: 24, chars: null, colours: ["#b44dff", "#e0b3ff", "#ff9bff"], glows: ["rgba(180,77,255,0.8)", "rgba(224,179,255,0.7)", "rgba(255,155,255,0.7)"], sizes: [2, 5], twinkle: true },
  likes: { count: 22, chars: ["♥", "★", "+1"], colours: ["#38b6ff", "#ff5fb3", "#ffffff"], glows: ["rgba(56,182,255,0.8)", "rgba(255,95,179,0.8)", "rgba(255,255,255,0.7)"], sizes: [9, 15], twinkle: false },
  scan: { count: 18, chars: ["▬", "▪", "—"], colours: ["#62b6cb", "#bfe9f2", "#ffffff"], glows: ["rgba(98,182,203,0.8)", "rgba(191,233,242,0.7)", "rgba(255,255,255,0.6)"], sizes: [8, 14], twinkle: false },
  confetti: { count: 34, chars: ["▮", "▬", "●", "▲"], colours: ["#ffd158", "#ff5fb3", "#7df0ff", "#5b76ff", "#7eff97"], glows: ["rgba(255,209,88,0.7)", "rgba(255,95,179,0.7)", "rgba(125,240,255,0.7)", "rgba(91,118,255,0.7)", "rgba(126,255,151,0.7)"], sizes: [7, 13], twinkle: false },
};

/* ───────────────────────── CARD MATERIALS ───────────────────────── */

export type CardDeco =
  | "rivets" | "bolts" | "tab" | "perforation" | "grain" | "marquee" | "string" | "peg" | "none" | "moss"
  | "bezel" | "frost" | "grille" | "traces" | "plaque" | "post" | "vents" | "stitches" | "foil";

export interface CardMaterial {
  up: string;
  down: string;
  edge: string;
  text: string;
  label: string;
  deco: CardDeco;
}

export const CARD_MATERIALS: Record<MissionCardMaterial, CardMaterial> = {
  steel: { up: "linear-gradient(180deg, #3d434f 0%, #262b34 100%)", down: "linear-gradient(180deg, #343a45 0%, #1f232b 100%)", edge: "#e3b341", text: "#f2f6ff", label: "#ffd77a", deco: "rivets" },
  glass: { up: "linear-gradient(180deg, rgba(20,80,90,0.9) 0%, rgba(8,40,48,0.95) 100%)", down: "linear-gradient(180deg, rgba(16,66,74,0.9) 0%, rgba(6,32,38,0.95) 100%)", edge: "#9d7bff", text: "#eef7ff", label: "#c9b8ff", deco: "bolts" },
  manila: { up: "linear-gradient(180deg, #f0dcae 0%, #d7bc84 100%)", down: "linear-gradient(180deg, #e9d3a4 0%, #cfb47e 100%)", edge: "#b8945a", text: "#3a2a08", label: "#8a5a12", deco: "tab" },
  ticket: { up: "linear-gradient(180deg, #ffe9a8 0%, #f5c96b 100%)", down: "linear-gradient(180deg, #f7dd98 0%, #e9b95a 100%)", edge: "#e84dff", text: "#3a1a34", label: "#9a1a8a", deco: "perforation" },
  wood: { up: "linear-gradient(180deg, #8a5a32 0%, #5c3a1e 100%)", down: "linear-gradient(180deg, #7a4e2a 0%, #4e3018 100%)", edge: "#ff8e6e", text: "#fff3e6", label: "#ffc9b3", deco: "grain" },
  cabinet: { up: "linear-gradient(180deg, #2a1450 0%, #140826 100%)", down: "linear-gradient(180deg, #22103f 0%, #120722 100%)", edge: "#ff3cb4", text: "#f2f6ff", label: "#7df0ff", deco: "marquee" },
  tag: { up: "linear-gradient(180deg, #fff6e0 0%, #f2dfb0 100%)", down: "linear-gradient(180deg, #f8ecd0 0%, #e8d29e 100%)", edge: "#ffd158", text: "#4a1122", label: "#b3262e", deco: "string" },
  photo: { up: "linear-gradient(180deg, #f4efe4 0%, #e6dccb 100%)", down: "linear-gradient(180deg, #3a2216 0%, #26150e 100%)", edge: "#ff6b3d", text: "#2a1a10", label: "#b34a2a", deco: "peg" },
  tile: { up: "linear-gradient(180deg, #2f5cff 0%, #1a3fb8 100%)", down: "linear-gradient(180deg, #274ed8 0%, #16359a 100%)", edge: "#9fd8ff", text: "#ffffff", label: "#dff0ff", deco: "none" },
  stone: { up: "linear-gradient(180deg, #4a3a5e 0%, #2e2340 100%)", down: "linear-gradient(180deg, #403252 0%, #261c36 100%)", edge: "#b8e34b", text: "#f2ffe0", label: "#d8ff8a", deco: "moss" },
  monitor: { up: "linear-gradient(180deg, #1a0f0e 0%, #0d0605 100%)", down: "linear-gradient(180deg, #221412 0%, #100807 100%)", edge: "#ff9528", text: "#ffe6cc", label: "#ff9528", deco: "bezel" },
  frost: { up: "linear-gradient(180deg, rgba(230,244,255,0.95) 0%, rgba(190,222,245,0.95) 100%)", down: "linear-gradient(180deg, rgba(214,236,255,0.95) 0%, rgba(170,208,238,0.95) 100%)", edge: "#ffffff", text: "#1b2f4a", label: "#2f5f8f", deco: "frost" },
  paper: { up: "linear-gradient(180deg, #fff8e8 0%, #ffe9c4 100%)", down: "linear-gradient(180deg, #fff2d8 0%, #ffdfb0 100%)", edge: "#2ec4b6", text: "#2a2a1a", label: "#1f8f84", deco: "none" },
  speaker: { up: "linear-gradient(180deg, #2c3038 0%, #1a1d22 100%)", down: "linear-gradient(180deg, #262a31 0%, #15181c 100%)", edge: "#45e3ff", text: "#f2f6ff", label: "#45e3ff", deco: "grille" },
  module: { up: "linear-gradient(180deg, #0f3a31 0%, #082019 100%)", down: "linear-gradient(180deg, #0d3129 0%, #071a15 100%)", edge: "#3dffc4", text: "#e8fff7", label: "#3dffc4", deco: "traces" },
  door: { up: "linear-gradient(180deg, #3a2160 0%, #22133a 100%)", down: "linear-gradient(180deg, #321c54 0%, #1c1030 100%)", edge: "#b44dff", text: "#f6efff", label: "#e0b3ff", deco: "plaque" },
  post: { up: "linear-gradient(180deg, #ffffff 0%, #eef4fb 100%)", down: "linear-gradient(180deg, #f6f9fd 0%, #e2ecf7 100%)", edge: "#38b6ff", text: "#12253a", label: "#1f7fc4", deco: "post" },
  locker: { up: "linear-gradient(180deg, #3f5560 0%, #263640 100%)", down: "linear-gradient(180deg, #364a54 0%, #1f2d35 100%)", edge: "#62b6cb", text: "#f2f8fa", label: "#bfe9f2", deco: "vents" },
  quilt: { up: "linear-gradient(135deg, #f6d9b8 0%, #f2c39a 50%, #f6d9b8 100%)", down: "linear-gradient(135deg, #f2cfa8 0%, #e9b784 50%, #f2cfa8 100%)", edge: "#ffb26b", text: "#4a2a12", label: "#b35a1f", deco: "stitches" },
  certificate: { up: "linear-gradient(180deg, #fffaf0 0%, #f6ecd2 100%)", down: "linear-gradient(180deg, #fbf3e0 0%, #efe1c2 100%)", edge: "#ffd158", text: "#1c2450", label: "#5b76ff", deco: "foil" },
};

/** Small material details drawn inside a card face as real nodes. */
export function CardDecoration({ deco, edge, tone = "card" }: { deco: CardDeco; edge: string; tone?: "card" | "chrome" }) {
  // "chrome" = the detail sits on a DARK translucent console (Learn, Spot the
  // Danger intro) instead of the briefing card's own light face, so the bright
  // paper/frost/photo details soften to accents. Owner polish pass 2026-09-12:
  // the frost flares became ~500px white washes on W12's console, W8 got a
  // stark white photo frame, W19 a hatch over all its copy, W20 a seal ribbon
  // hanging off the card edge.
  const chrome = tone === "chrome";
  const dot = (extra: CSSProperties, size = 8, fill = `radial-gradient(circle at 35% 35%, #fff1c9, ${edge} 55%, rgba(0,0,0,0.6))`): CSSProperties => ({
    position: "absolute", width: size, height: size, borderRadius: "50%", background: fill, boxShadow: "0 1px 2px rgba(0,0,0,0.7)", ...extra,
  });
  switch (deco) {
    case "rivets":
      return (<>
        <span aria-hidden style={dot({ top: 8, left: 8 })} /><span aria-hidden style={dot({ top: 8, right: 8 })} />
        <span aria-hidden style={dot({ bottom: 8, left: 8 })} /><span aria-hidden style={dot({ bottom: 8, right: 8 })} />
      </>);
    case "bolts":
      return (<>
        <span aria-hidden style={dot({ top: 7, left: 7 }, 7, "radial-gradient(circle at 40% 40%, #e8e0ff, #6b5aa8 60%, #2a2050)")} />
        <span aria-hidden style={dot({ top: 7, right: 7 }, 7, "radial-gradient(circle at 40% 40%, #e8e0ff, #6b5aa8 60%, #2a2050)")} />
        <span aria-hidden style={dot({ bottom: 7, left: 7 }, 7, "radial-gradient(circle at 40% 40%, #e8e0ff, #6b5aa8 60%, #2a2050)")} />
        <span aria-hidden style={dot({ bottom: 7, right: 7 }, 7, "radial-gradient(circle at 40% 40%, #e8e0ff, #6b5aa8 60%, #2a2050)")} />
        <span aria-hidden style={{ position: "absolute", inset: 4, borderRadius: 14, background: "linear-gradient(115deg, rgba(255,255,255,0) 45%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 55%)", pointerEvents: "none" }} />
      </>);
    case "tab":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 0, left: 14, width: 64, height: 13, borderRadius: "0 0 8px 8px", background: "#c9a86a", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
        <span aria-hidden style={{ position: "absolute", top: 10, right: 12, width: 12, height: 12, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #ff8a8a, #b3261e 60%, #6d1410)", boxShadow: "0 1px 3px rgba(0,0,0,0.5)" }} />
        <span aria-hidden style={{ position: "absolute", top: 15, right: 17, width: 2, height: 42, background: "rgba(179,38,30,0.55)", transform: "rotate(18deg)", transformOrigin: "top" }} />
      </>);
    case "perforation":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 22, borderLeft: "2px dashed rgba(58,26,52,0.45)" }} />
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `repeating-linear-gradient(90deg, ${edge} 0 10px, #ffd158 10px 20px)` }} />
        <span aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: `repeating-linear-gradient(90deg, ${edge} 0 10px, #ffd158 10px 20px)` }} />
      </>);
    case "grain":
      return (<>
        <span aria-hidden style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 9px)", pointerEvents: "none" }} />
        <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 14, border: "2px solid rgba(255,142,110,0.35)" }} />
      </>);
    case "marquee":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 9, background: `linear-gradient(90deg, ${edge}, #7df0ff, ${edge})`, boxShadow: `0 0 12px ${edge}` }} />
        <span aria-hidden style={{ position: "absolute", top: 12, bottom: 10, left: 5, width: 2, background: "rgba(0,229,255,0.55)", boxShadow: "0 0 8px rgba(0,229,255,0.8)" }} />
        <span aria-hidden style={{ position: "absolute", top: 12, bottom: 10, right: 5, width: 2, background: "rgba(0,229,255,0.55)", boxShadow: "0 0 8px rgba(0,229,255,0.8)" }} />
      </>);
    case "string":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", border: "3px solid #c9a86a", background: "rgba(0,0,0,0.25)" }} />
        <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 14, border: `2px solid ${edge}` }} />
      </>);
    case "peg":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", width: 18, height: 14, borderRadius: "0 0 4px 4px", background: "linear-gradient(180deg, #d9a878, #8a5a32)", boxShadow: "0 2px 3px rgba(0,0,0,0.5)" }} />
        <span aria-hidden style={{ position: "absolute", inset: 8, border: chrome ? "4px solid rgba(244,239,228,0.38)" : "6px solid rgba(255,255,255,0.85)", borderBottomWidth: chrome ? 9 : 14, borderRadius: 4, pointerEvents: "none" }} />
      </>);
    case "moss":
      return (<>
        <span aria-hidden style={dot({ top: 10, left: 10 }, 6, edge)} /><span aria-hidden style={dot({ bottom: 14, right: 12 }, 5, edge)} />
        <span aria-hidden style={dot({ top: 22, right: 18 }, 4, edge)} />
        <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 18, boxShadow: `inset 0 0 22px ${edge}44`, pointerEvents: "none" }} />
      </>);
    case "bezel":
      return (<>
        <span aria-hidden style={{ position: "absolute", inset: 6, borderRadius: 10, border: `2px solid ${edge}66`, boxShadow: `inset 0 0 18px ${edge}33` }} />
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: `linear-gradient(90deg, transparent, ${edge}, transparent)`, opacity: 0.9 }} />
        <span aria-hidden style={{ position: "absolute", bottom: 6, right: 12, width: 6, height: 6, borderRadius: "50%", background: "#ff4e4e", boxShadow: "0 0 8px #ff4e4e" }} />
      </>);
    case "frost":
      return (<>
        <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 18, background: chrome
          // fixed-size frost in the two corners (a percentage stop scales with the console and washed it out)
          ? "radial-gradient(circle 200px at 0% 0%, rgba(255,255,255,0.2), transparent 100%), radial-gradient(circle 170px at 100% 100%, rgba(255,255,255,0.14), transparent 100%)"
          : "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.9), transparent 45%), radial-gradient(circle at 90% 90%, rgba(255,255,255,0.8), transparent 40%)", pointerEvents: "none" }} />
        <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 14, border: chrome ? "2px solid rgba(255,255,255,0.32)" : "2px solid rgba(255,255,255,0.7)" }} />
      </>);
    case "grille":
      return (<>
        <span aria-hidden style={{ position: "absolute", bottom: 6, left: 14, right: 14, height: 14, background: "radial-gradient(circle, rgba(69,227,255,0.55) 0 1.5px, transparent 2px)", backgroundSize: "7px 7px" }} />
        <span aria-hidden style={{ position: "absolute", top: 8, right: 10, width: 8, height: 8, borderRadius: "50%", background: edge, boxShadow: `0 0 10px ${edge}` }} />
      </>);
    case "traces":
      return (<>
        <span aria-hidden style={{ position: "absolute", inset: 7, borderRadius: 12, border: `1px dashed ${edge}66` }} />
        <span aria-hidden style={dot({ top: 12, left: 12 }, 7, edge)} /><span aria-hidden style={dot({ bottom: 12, right: 12 }, 7, edge)} />
      </>);
    case "plaque":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 74, height: 12, borderRadius: 4, background: `linear-gradient(180deg, ${edge}, #6a2aa0)`, boxShadow: `0 0 10px ${edge}88` }} />
        <span aria-hidden style={{ position: "absolute", right: 14, top: "50%", width: 8, height: 8, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fff1c9, #e3b341 55%, #6b4d12)" }} />
        <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 14, border: "2px solid rgba(180,77,255,0.35)" }} />
      </>);
    case "post":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 8, left: 10, width: 14, height: 14, borderRadius: "50%", background: `linear-gradient(135deg, ${edge}, #ff5fb3)` }} />
        <span aria-hidden style={{ position: "absolute", top: 11, left: 28, width: 40, height: 4, borderRadius: 2, background: "rgba(18,37,58,0.25)" }} />
        <span aria-hidden style={{ position: "absolute", top: 17, left: 28, width: 24, height: 3, borderRadius: 2, background: "rgba(18,37,58,0.18)" }} />
        <span aria-hidden style={{ position: "absolute", bottom: 6, left: 0, right: 0, height: 1, background: "rgba(18,37,58,0.15)" }} />
      </>);
    case "vents":
      return (<>
        <span aria-hidden style={{ position: "absolute", top: 8, left: 14, right: 14, height: 12, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 2px, transparent 2px 5px)" }} />
        <span aria-hidden style={{ position: "absolute", right: 10, top: "52%", width: 8, height: 8, borderRadius: "50%", background: edge, boxShadow: `0 0 8px ${edge}` }} />
        <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 14, border: `2px solid ${edge}55` }} />
      </>);
    case "stitches":
      return (<>
        <span aria-hidden style={{ position: "absolute", inset: 6, borderRadius: 12, border: `2px dashed ${edge}` }} />
        <span aria-hidden style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(45deg, rgba(255,255,255,${chrome ? 0.04 : 0.12}) 0 8px, transparent 8px 16px)`, pointerEvents: "none" }} />
      </>);
    case "foil":
      return (<>
        <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 14, border: `2px double ${edge}` }} />
        <span aria-hidden style={{ position: "absolute", bottom: chrome ? 10 : 6, right: 12, width: chrome ? 15 : 18, height: chrome ? 15 : 18, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, #fff6d0, ${edge} 55%, #a9781a)`, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
        {!chrome && <span aria-hidden style={{ position: "absolute", bottom: -4, right: 16, width: 4, height: 14, background: "#5b76ff", transform: "rotate(15deg)" }} />}
      </>);
    default:
      return null;
  }
}

/* ───────────────────────── SHARED WORLD LAYERS ─────────────────────────
 * Owner 2026-09-12: every shared screen (Learn, Spot the Danger intro,
 * Prove-it, Concept recap, debrief, stickers, alert) keeps its structure and
 * gets the week's world around it, like the mission briefing. These layers
 * read the world from the lesson context, so a host only mounts
 * <WorldBackdrop /> as its first child (with `isolation: isolate` on its
 * container so the negative z-index sits above the background but under the
 * content) and, where it has a frame, borrows `useWeekWorld()` for a rim.
 * A week without a world renders nothing here. */

export function useWeekWorld(): MissionWorld | null {
  const week = useLessonWeek();
  return week != null ? MISSION_WORLDS[week] ?? null : null;
}

const MOTE_KEYFRAMES = `
@keyframes wmFloat { 0% { transform: translate(0, 0); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translate(var(--wmDrift, 0px), -60px); opacity: 0; } }
@keyframes wmTwinkle { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
`;

/** What drifts in the world: dots for physical worlds, characters for the
 *  tech worlds (bigger = nearer and brighter). Self-contained keyframes. */
export function WorldMotes({ kind, count }: { kind: MissionMotes; count?: number }) {
  const cfg = WORLD_MOTES[kind];
  const n = count ?? cfg.count;
  const motes = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const depth = ((i * 7) % 5) / 4; // 0 = far, 1 = near
        return {
          left: (i * 41 + 17) % 100,
          top: 20 + ((i * 23) % 70),
          size: cfg.sizes[0] + depth * (cfg.sizes[1] - cfg.sizes[0]),
          duration: 14 - depth * 6 + ((i * 5) % 4),
          delay: (i * 0.43) % 8,
          drift: ((i * 13) % 30) - 15,
          colour: cfg.colours[i % cfg.colours.length],
          glow: cfg.glows[i % cfg.glows.length],
          char: cfg.chars ? cfg.chars[i % cfg.chars.length] : null,
          opacity: 0.35 + depth * 0.6,
          blur: depth < 0.3 ? 0.6 : 0,
        };
      }),
    [cfg, n],
  );
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{MOTE_KEYFRAMES}</style>
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.char ? "auto" : m.size,
            height: m.char ? "auto" : m.size,
            borderRadius: m.char ? 0 : "50%",
            background: m.char ? "transparent" : m.colour,
            color: m.colour,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: m.char ? m.size : undefined,
            fontWeight: 700,
            lineHeight: 1,
            opacity: m.opacity,
            filter: m.blur ? `blur(${m.blur}px)` : undefined,
            textShadow: m.char ? `0 0 ${m.size}px ${m.glow}` : undefined,
            boxShadow: m.char ? undefined : `0 0 ${m.size * 4}px ${m.glow}`,
            animation: `wmFloat ${m.duration}s ease-in-out ${m.delay}s infinite${cfg.twinkle ? `, wmTwinkle ${2 + (i % 3)}s ease-in-out ${m.delay}s infinite` : ""}`,
            ["--wmDrift" as string]: `${m.drift}px`,
          } as CSSProperties}
        >
          {m.char}
        </span>
      ))}
    </div>
  );
}

const GUTTER_MASK = "linear-gradient(90deg, #000 0%, #000 9%, transparent 19%, transparent 81%, #000 91%, #000 100%)";

/** The week's live scene behind a shared screen, dimmed to keep copy legible.
 *  Mount as the FIRST child of a container that has `isolation: isolate`. */
export function WorldBackdrop({
  intensity = 0.4,
  motes = false,
  moteCount,
  fade = true,
  zIndex = -1,
  moteOpacity = 0.85,
  moteMask = "none",
}: {
  /** 0..1 opacity of the live scene. */
  intensity?: number;
  /** Also drift the world's motes over the scene. */
  motes?: boolean;
  moteCount?: number;
  /** Radial vignette so the edges stay calm behind text. */
  fade?: boolean;
  zIndex?: number;
  /** Motes layer opacity: lower on text-heavy screens so glyph motes never
   *  read as stray characters inside the copy (polish pass 2026-09-12). */
  moteOpacity?: number;
  /** "gutters" keeps the motes in the side margins of a narrow-column host
   *  (the concept recap) and out of its text panels. */
  moteMask?: "none" | "gutters";
}) {
  const week = useLessonWeek();
  const theme = useLessonTheme();
  const world = useWeekWorld();
  if (!world || week == null) return null;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, zIndex, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
      <div style={{ position: "absolute", inset: 0, opacity: intensity }}>
        <WeekIntroBackdrop weekNumber={week} accent={theme?.accent ?? "#e3b341"} />
      </div>
      {motes && (
        <div style={{ position: "absolute", inset: 0, opacity: moteOpacity, ...(moteMask === "gutters" ? { maskImage: GUTTER_MASK, WebkitMaskImage: GUTTER_MASK } : null) }}>
          <WorldMotes kind={world.motes} count={moteCount} />
        </div>
      )}
      {fade && (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 45%, rgba(4,6,18,0) 38%, rgba(4,6,18,0.62) 100%)" }} />
      )}
    </div>
  );
}
