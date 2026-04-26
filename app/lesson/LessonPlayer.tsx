"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import * as THREE from "three";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Player } from "@lottiefiles/react-lottie-player";
import { MILESTONES, getCertificateUrl } from "@/app/lib/certificates";
import { playSound as playSFX, playBGM, stopBGM } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
  bossDefeatedExplosion,
  milestoneFireworks,
} from "@/app/lib/celebrations";
import { ExerciseFrame } from "@/app/components/scene";
import MuteToggle from "@/app/components/MuteToggle";
import LessonHUD from "@/app/components/LessonHUD";
import XPPopup from "@/app/components/XPPopup";
import LevelUpCelebration from "@/app/components/LevelUpCelebration";
import CharacterGuide from "@/app/components/CharacterGuide";
import { WEEK1_REACTIONS, CORRECT_QUIPS, WRONG_QUIPS, type CharacterLine } from "@/app/lesson/characterReactions";
import StoryCutscene from "@/app/components/StoryCutscene";
import { WEEK1_INTRO } from "@/app/lesson/storyContent";
import ButtonJuice from "@/app/components/ButtonJuice";
import ParticleBurst from "@/app/components/ParticleBurst";
import FloatingText from "@/app/components/FloatingText";
import ScreenShake from "@/app/components/ScreenShake";
// ContentBackdrop has been superseded by the LessonArena3D 3D backdrop
// rendered behind all lesson content. Kept as a no-op import removal.
const LessonArena3D = dynamic(
  () => import("@/app/components/game/LessonArena3D"),
  { ssr: false }
);
import ScreenTransition, { type TransitionType } from "@/app/components/ScreenTransition";
import { InventoryProvider, useInventory } from "@/app/components/lesson/InventoryProvider";
import { InventoryBar } from "@/app/components/lesson/InventoryBar";
import { EarnItemEffect } from "@/app/components/lesson/EarnItemEffect";
import { RevealOverlay } from "@/app/components/lesson/RevealOverlay";
import { getItemForScreen } from "@/app/lib/inventory";
import ExerciseErrorBoundary from "@/app/components/ExerciseErrorBoundary";
import { addXP, type RankInfo } from "@/app/lib/progression";
import LessonAmbience from "@/app/components/LessonAmbience";
const BossBattle = dynamic(
  () => import("@/app/components/game/BossBattle"),
  { ssr: false }
);
const MissionBriefScene = dynamic(
  () => import("@/app/components/game/MissionBriefScene"),
  { ssr: false }
);
const WelcomeScene = dynamic(
  () => import("@/app/components/game/WelcomeScene"),
  { ssr: false }
);
const VictoryScene = dynamic(
  () => import("@/app/components/game/VictoryScene"),
  { ssr: false }
);
const GraduationScene = dynamic(
  () => import("@/app/components/game/GraduationScene"),
  { ssr: false }
);
const OutroScene = dynamic(
  () => import("@/app/components/game/OutroScene"),
  { ssr: false }
);
import VaultLock from "@/app/components/exercises/VaultLock";
import InboxSimulator from "@/app/components/exercises/InboxSimulator";
import SortingStation from "@/app/components/exercises/SortingStation";
import PasswordLab from "@/app/components/exercises/PasswordLab";
import ConveyorBelt from "@/app/components/exercises/ConveyorBelt";
import CrackTheCode from "@/app/components/exercises/CrackTheCode";
import ProtectTheData from "@/app/components/exercises/ProtectTheData";
import SpamBlaster from "@/app/components/exercises/SpamBlaster";
import ChooseYourPath from "@/app/components/exercises/ChooseYourPath";
import CyberScanner from "@/app/components/exercises/CyberScanner";
import MemoryMatch from "@/app/components/exercises/MemoryMatch";
import CyberMaze from "@/app/components/exercises/CyberMaze";
import FirewallBuilder from "@/app/components/exercises/FirewallBuilder";

// Shared data for the new exercise templates.
const PROTECT_DATA_ITEMS: { text: string; isPrivate: boolean }[] = [
  { text: "Your home address", isPrivate: true },
  { text: "Your password", isPrivate: true },
  { text: "Your phone number", isPrivate: true },
  { text: "Your school name", isPrivate: true },
  { text: "Your full name", isPrivate: true },
  { text: "Your birthday", isPrivate: true },
  { text: "Your favourite colour", isPrivate: false },
  { text: "Your favourite food", isPrivate: false },
  { text: "Your favourite game", isPrivate: false },
  { text: "Your age (I'm a kid)", isPrivate: false },
  { text: "Your favourite animal", isPrivate: false },
  { text: "Your favourite subject", isPrivate: false },
];

const MAZE_QUESTIONS: { question: string; answers: string[]; correctIndex: number }[] = [
  { question: "What makes a password STRONG?", answers: ["Mix of letters, numbers, symbols", "Your name and birthday", "The word 'password'", "Just lowercase letters"], correctIndex: 0 },
  { question: "Where should you KEEP your passwords?", answers: ["In a password manager", "On a sticky note", "In a text to a friend", "The same note for every account"], correctIndex: 0 },
  { question: "Two-factor authentication adds...", answers: ["A second verification step", "A longer password", "Two usernames", "Double-clicking login"], correctIndex: 0 },
  { question: "If a site looks suspicious...", answers: ["Close it and tell an adult", "Enter your password anyway", "Click every link to check", "Share it with friends"], correctIndex: 0 },
  { question: "A strong password has AT LEAST...", answers: ["8 characters with mixed types", "3 letters", "Only numbers", "Just your pet's name"], correctIndex: 0 },
];

const CURRENT_WEEK: number = 1;

/** Pick the ScreenTransition type for a given target screen + nav direction. */
function screenTransitionType(screen: number, direction: "forward" | "back"): TransitionType {
  if (screen === 15) return "wipeDown"; // Boss battle — dramatic
  // Exercise screens get fade-scale for a slight "lens change" feel.
  const EXERCISE_SCREENS = [2, 6, 7, 9, 10, 13, 14];
  if (EXERCISE_SCREENS.includes(screen)) return "fadeScale";
  return direction === "back" ? "slideLeft" : "slideRight";
}
const IS_MILESTONE_WEEK = MILESTONES.some((m) => m.week === CURRENT_WEEK);

gsap.registerPlugin(SplitText, MorphSVGPlugin);

/* ───────────────────────── GSAP HELPERS ────────────────────── */
const celebrateCorrect = (el: HTMLElement) => {
  playSFX("correct");
  void correctAnswerBurst();
  const tl = gsap.timeline();
  tl.to(el, { scale: 1.15, duration: 0.15, ease: "power2.out" })
    .to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" })
    .to(el, { boxShadow: "0 0 40px rgba(124,200,154,0.6), 0 0 80px rgba(124,200,154,0.2)", duration: 0.2 }, 0)
    .to(el, { boxShadow: "0 0 10px rgba(124,200,154,0.2)", duration: 0.6 }, 0.4);
  const rect = el.getBoundingClientRect();
  const colors = ["#5fb37a", "#ffd58a", "#ff9b4a", "#f59e0b"];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:fixed;width:${size}px;height:${size}px;border-radius:50%;background:${colors[Math.floor(Math.random() * 4)]};pointer-events:none;z-index:9999;`;
    p.style.left = rect.left + rect.width / 2 + "px";
    p.style.top = rect.top + rect.height / 2 + "px";
    document.body.appendChild(p);
    gsap.to(p, {
      x: (Math.random() - 0.5) * 250,
      y: (Math.random() - 0.5) * 250 - 80,
      opacity: 0, scale: 0, rotation: Math.random() * 360,
      duration: 0.8 + Math.random() * 0.5,
      ease: "power2.out",
      onComplete: () => p.remove(),
    });
  }
};

const shakeWrong = (el: HTMLElement) => {
  playSFX("wrong");
  wrongAnswerShake();
  gsap.timeline()
    .to(el, { x: -15, rotation: -2, duration: 0.06 })
    .to(el, { x: 15, rotation: 2, duration: 0.06 })
    .to(el, { x: -10, rotation: -1, duration: 0.06 })
    .to(el, { x: 10, rotation: 1, duration: 0.06 })
    .to(el, { x: 0, rotation: 0, duration: 0.06 })
    .to(el, { boxShadow: "0 0 30px rgba(239,68,68,0.6)", duration: 0.1 }, 0)
    .to(el, { boxShadow: "0 0 0 rgba(239,68,68,0)", duration: 0.5 }, 0.3);
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const p = document.createElement("div");
    p.style.cssText = `position:fixed;width:4px;height:4px;border-radius:50%;background:#ef4444;pointer-events:none;z-index:9999;`;
    p.style.left = rect.left + rect.width / 2 + "px";
    p.style.top = rect.top + rect.height / 2 + "px";
    document.body.appendChild(p);
    gsap.to(p, {
      x: (Math.random() - 0.5) * 100,
      y: Math.random() * 50 + 20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => p.remove(),
    });
  }
};

const animateCoins = () => {
  const el = document.querySelector("[data-coin-counter]") as HTMLElement | null;
  if (!el) return;
  gsap.timeline()
    .to(el, { scale: 1.5, color: "#f59e0b", textShadow: "0 0 20px rgba(245,158,11,0.6)", duration: 0.2 })
    .to(el, { scale: 1, textShadow: "0 0 5px rgba(245,158,11,0.2)", duration: 0.5, ease: "elastic.out(1, 0.3)" });
};

const btnHoverIn = (e: React.MouseEvent<HTMLElement>) => {
  gsap.to(e.currentTarget, { boxShadow: "0 0 35px rgba(249,115,22,0.6)", scale: 1.06, duration: 0.25 });
};
const btnHoverOut = (e: React.MouseEvent<HTMLElement>) => {
  gsap.to(e.currentTarget, { boxShadow: "0 0 15px rgba(249,115,22,0.3)", scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
};

/* ───────────────────────── TILT CARD ───────────────────────── */
const TiltCard = ({ children, style, className, onClick }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; onClick?: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: x * 15,
      rotateX: -y * 15,
      scale: 1.03,
      boxShadow: "0 25px 50px rgba(0,0,0,0.3), 0 0 25px rgba(255,178,110,0.3)",
      duration: 0.3,
      ease: "power2.out",
    });
  };
  const handleLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0, rotateX: 0, scale: 1,
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      duration: 0.6, ease: "elastic.out(1, 0.4)",
    });
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchEnd={handleLeave}
      onClick={onClick}
      className={className}
      style={{ perspective: 1000, transformStyle: "preserve-3d", cursor: "pointer", transition: "none", ...style }}
    >
      {children}
    </div>
  );
};

/* ───────────────────────── FULL-SCREEN SCENE WRAPPER ───────── */
const FullScene = ({ children, bg, glow }: { children: React.ReactNode; bg: string; glow?: string }) => (
  <div style={{ minHeight: "calc(100vh - 120px)", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflow: "hidden" }}>
    {glow && <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: glow, filter: "blur(120px)", opacity: 0.3, pointerEvents: "none" }} />}
    <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>{children}</div>
  </div>
);

/* ───────────────────────── SVG ICONS ──────────────────────── */

const IconShield = ({ size = 24, color = "#ff9b4a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconLock = ({ size = 24, color = "#ff9b4a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconUnlock = ({ size = 24, color = "#ef4444" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

const IconGamepad = ({ size = 24, color = "#ff9b4a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
  </svg>
);

const IconKey = ({ size = 24, color = "#f59e0b" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const IconUsers = ({ size = 24, color = "#ec4899" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconMessageCircle = ({ size = 24, color = "#ff9b4a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const IconTablet = ({ size = 24, color = "#ff9b4a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

const IconSchool = ({ size = 24, color = "#5fb37a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 10l10-7 10 7-10 7z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>
  </svg>
);

const IconRuler = ({ size = 24, color = "#5fb37a" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 2l6 6-14 14-6-6z"/><path d="M10 10l2 2"/><path d="M14 6l2 2"/><path d="M6 14l2 2"/>
  </svg>
);

/* Rich illustrated devices for the "What is a Password?" cards. Each takes
   two accent colours so the card's gradient palette flows into the artwork.
   Inline SVG (not emoji) so they look like proper illustrations and don't
   ship as the OS-default emoji glyphs. */
const DeviceIllustration = ({
  kind,
  c1,
  c2,
  locked,
}: {
  kind: "gaming" | "tablet" | "school";
  c1: string;
  c2: string;
  locked: boolean;
}) => {
  const gradId = `dev-grad-${kind}-${c1.replace(/[^a-z0-9]/gi, "")}`;
  const shineId = `dev-shine-${kind}`;
  const common = (
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={c1} />
        <stop offset="100%" stopColor={c2} />
      </linearGradient>
      <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
      <filter id="dev-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
  );
  if (kind === "gaming") {
    return (
      <svg width={120} height={96} viewBox="0 0 120 96" style={{ filter: `drop-shadow(0 8px 16px ${c1}55)` }}>
        {common}
        {/* Controller body */}
        <ellipse cx="60" cy="78" rx="46" ry="6" fill="rgba(0,0,0,0.45)" />
        <path
          d="M22 30 Q 60 12 98 30 Q 110 38 102 60 Q 96 76 82 76 Q 72 76 60 70 Q 48 76 38 76 Q 24 76 18 60 Q 10 38 22 30 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.4"
        />
        {/* Top shine */}
        <path d="M28 30 Q60 18 92 30 Q92 36 60 32 Q28 36 28 30 Z" fill={`url(#${shineId})`} opacity="0.7" />
        {/* D-pad */}
        <rect x="28" y="44" width="6" height="20" rx="1.5" fill="#0b0f1a" />
        <rect x="22" y="50" width="20" height="8" rx="1.5" fill="#0b0f1a" />
        {/* Buttons */}
        <circle cx="82" cy="48" r="4.2" fill="#fbbf24" stroke="#fff" strokeWidth="0.6" />
        <circle cx="92" cy="56" r="4.2" fill="#ef4444" stroke="#fff" strokeWidth="0.6" />
        <circle cx="82" cy="64" r="4.2" fill="#7cc89a" stroke="#fff" strokeWidth="0.6" />
        <circle cx="72" cy="56" r="4.2" fill="#ff9b4a" stroke="#fff" strokeWidth="0.6" />
        {/* Start/Select */}
        <rect x="52" y="50" width="6" height="2.4" rx="1.2" fill="rgba(255,255,255,0.7)" />
        <rect x="60" y="50" width="6" height="2.4" rx="1.2" fill="rgba(255,255,255,0.7)" />
        {/* Glowing dot when locked */}
        {locked && <circle cx="60" cy="60" r="3" fill="#5fb37a"><animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" /></circle>}
      </svg>
    );
  }
  if (kind === "tablet") {
    return (
      <svg width={96} height={120} viewBox="0 0 96 120" style={{ filter: `drop-shadow(0 8px 16px ${c1}55)` }}>
        {common}
        <ellipse cx="48" cy="110" rx="36" ry="4" fill="rgba(0,0,0,0.45)" />
        {/* Tablet body */}
        <rect x="14" y="6" width="68" height="100" rx="10" fill="#0f172a" stroke={c1} strokeWidth="1.6" />
        <rect x="14" y="6" width="68" height="100" rx="10" fill={`url(#${shineId})`} opacity="0.18" />
        {/* Screen */}
        <rect x="20" y="14" width="56" height="78" rx="3" fill="#020617" />
        {/* Screen content — gradient + lines */}
        <rect x="20" y="14" width="56" height="78" rx="3" fill={`url(#${gradId})`} opacity="0.85" />
        <rect x="24" y="22" width="34" height="3" rx="1.2" fill="rgba(255,255,255,0.85)" />
        <rect x="24" y="30" width="48" height="2" rx="1" fill="rgba(255,255,255,0.55)" />
        <rect x="24" y="36" width="42" height="2" rx="1" fill="rgba(255,255,255,0.45)" />
        <rect x="24" y="44" width="48" height="14" rx="2" fill="rgba(255,255,255,0.18)" />
        <rect x="24" y="62" width="48" height="2" rx="1" fill="rgba(255,255,255,0.45)" />
        <rect x="24" y="68" width="36" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
        <rect x="24" y="78" width="22" height="8" rx="2" fill="#ffd58a" />
        {/* Camera & home */}
        <circle cx="48" cy="10.5" r="1.4" fill="#475569" />
        <circle cx="48" cy="99.5" r="3.2" fill="none" stroke="#475569" strokeWidth="1" />
        {locked && (
          <g transform="translate(60 80)">
            <circle r="6" fill="#5fb37a" />
            <path d="M-2 -1 v 2 m 0 0 h 0" stroke="#fff" strokeWidth="1.6" />
            <rect x="-2" y="-1" width="4" height="3.6" fill="#fff" rx="0.6" />
            <path d="M-1.5 -1 v -1.4 a 1.5 1.5 0 0 1 3 0 v 1.4" stroke="#fff" strokeWidth="1" fill="none" />
          </g>
        )}
      </svg>
    );
  }
  // school
  return (
    <svg width={120} height={104} viewBox="0 0 120 104" style={{ filter: `drop-shadow(0 8px 16px ${c1}55)` }}>
      {common}
      <ellipse cx="60" cy="92" rx="44" ry="5" fill="rgba(0,0,0,0.45)" />
      {/* Building base */}
      <rect x="20" y="44" width="80" height="42" rx="4" fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" />
      {/* Roof */}
      <path d="M14 44 L60 18 L106 44 Z" fill="#1e293b" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" />
      <path d="M14 44 L60 18 L106 44 Z" fill={`url(#${shineId})`} opacity="0.45" />
      {/* Bell tower */}
      <rect x="56" y="22" width="8" height="14" rx="1" fill="#ffd58a" />
      <circle cx="60" cy="20" r="3" fill="#ffd58a" />
      {/* Door */}
      <rect x="52" y="62" width="16" height="24" rx="2" fill="#0b0f1a" />
      <circle cx="64" cy="74" r="0.9" fill="#ffd58a" />
      {/* Windows */}
      <rect x="28" y="54" width="14" height="14" rx="1.5" fill="#dbeafe" stroke="#0b0f1a" strokeWidth="0.8" />
      <line x1="35" y1="54" x2="35" y2="68" stroke="#0b0f1a" strokeWidth="0.8" />
      <line x1="28" y1="61" x2="42" y2="61" stroke="#0b0f1a" strokeWidth="0.8" />
      <rect x="78" y="54" width="14" height="14" rx="1.5" fill="#dbeafe" stroke="#0b0f1a" strokeWidth="0.8" />
      <line x1="85" y1="54" x2="85" y2="68" stroke="#0b0f1a" strokeWidth="0.8" />
      <line x1="78" y1="61" x2="92" y2="61" stroke="#0b0f1a" strokeWidth="0.8" />
      {/* Flag */}
      <line x1="14" y1="44" x2="14" y2="32" stroke="#fff" strokeWidth="1.2" />
      <path d="M14 32 L24 35 L14 38 Z" fill="#ef4444" />
      {locked && (
        <g transform="translate(60 70)">
          <circle r="6" fill="#5fb37a" opacity="0.95" />
          <rect x="-2" y="-1" width="4" height="3.6" fill="#fff" rx="0.6" />
          <path d="M-1.5 -1 v -1.4 a 1.5 1.5 0 0 1 3 0 v 1.4" stroke="#fff" strokeWidth="1" fill="none" />
        </g>
      )}
    </svg>
  );
};

/* Animated SVG burst used in place of the 🎉 / 🌟 emojis.  Two-tone gradient,
   spinning rays, and a centre core — looks like a proper celebration mark. */
const SuccessBurst = ({
  size = 28,
  colourA = "#ffd58a",
  colourB = "#5fb37a",
}: { size?: number; colourA?: string; colourB?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <defs>
      <radialGradient id={`burst-core-${colourA.replace(/[^a-z0-9]/gi, "")}`}>
        <stop offset="0%" stopColor="#fff" />
        <stop offset="60%" stopColor={colourA} />
        <stop offset="100%" stopColor={colourB} />
      </radialGradient>
    </defs>
    <g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect
          key={a}
          x="19"
          y="2"
          width="2"
          height="9"
          rx="1"
          fill={colourA}
          opacity="0.9"
          transform={`rotate(${a} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="8" fill={`url(#burst-core-${colourA.replace(/[^a-z0-9]/gi, "")})`} />
      <circle cx="20" cy="20" r="3" fill="#fff" opacity="0.85" />
    </g>
  </svg>
);

/* Big illustrated weekly badge — used on the end-of-week screen for
   non-milestone weeks (1-4, 6-9, etc.) so kids feel rewarded each week
   even when there's no certificate yet. Inline SVG with depth, ribbons
   and a centred week number. */
function WeekBadge({ weekNumber, size = 96 }: { weekNumber: number; size?: number }) {
  const id = `wb-${weekNumber}`;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{ filter: "drop-shadow(0 8px 18px rgba(245,158,11,0.55))" }}>
      <defs>
        <linearGradient id={`${id}-medal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={`${id}-ribbon-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9b4a" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id={`${id}-ribbon-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Ribbons */}
      <polygon points="32,40 14,108 30,98 36,84" fill={`url(#${id}-ribbon-l)`} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
      <polygon points="68,40 86,108 70,98 64,84" fill={`url(#${id}-ribbon-r)`} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
      {/* Outer ring */}
      <circle cx="50" cy="48" r="34" fill={`url(#${id}-medal)`} stroke="#92400e" strokeWidth="1.5" />
      {/* Inner star burst */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 50 + Math.cos(a) * 20;
        const y1 = 48 + Math.sin(a) * 20;
        const x2 = 50 + Math.cos(a) * 28;
        const y2 = 48 + Math.sin(a) * 28;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1" opacity="0.6" />;
      })}
      {/* Inner medal */}
      <circle cx="50" cy="48" r="22" fill="#fef3c7" stroke="#b45309" strokeWidth="1.4" />
      <circle cx="50" cy="48" r="22" fill={`url(#${id}-core)`} />
      {/* Week number */}
      <text x="50" y="44" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="10" fill="#92400e" letterSpacing="1.5">WEEK</text>
      <text x="50" y="62" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="22" fill="#92400e">{weekNumber}</text>
      {/* Tiny shield in corner */}
      <path d="M 70 32 L 76 30 L 76 36 Q 76 40 73 42 Q 70 40 70 36 Z" fill="#ffd58a" stroke="#d4733a" strokeWidth="0.6" />
      <path d="M 71.5 35 L 73 36.6 L 75 33.8" fill="none" stroke="#fff" strokeWidth="0.8" />
    </svg>
  );
}

/* Mini progress strip showing "X of 5 weeks" toward the next certificate. */
function CertificateProgress({ currentWeek }: { currentWeek: number }) {
  // Find the next milestone week (5/10/15/20) that hasn't been reached.
  const nextMilestone = MILESTONES.find((m) => m.week >= currentWeek)?.week ?? 5;
  const prevMilestone = MILESTONES.filter((m) => m.week < currentWeek).pop()?.week ?? 0;
  const progress = (currentWeek - prevMilestone) / (nextMilestone - prevMilestone);
  const remaining = nextMilestone - currentWeek;
  return (
    <div style={{ margin: "8px auto 6px", maxWidth: 320 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "#94a3b8", letterSpacing: 1.5,
        fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
        marginBottom: 4,
      }}>
        <span>WEEK {currentWeek}</span>
        <span style={{ color: "#ffd58a", fontWeight: 800 }}>
          🏅 {remaining === 0 ? "CERTIFICATE READY" : `${remaining} WEEK${remaining === 1 ? "" : "S"} TO CERTIFICATE`}
        </span>
        <span>WEEK {nextMilestone}</span>
      </div>
      <div style={{
        height: 6, borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,213,138,0.3)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${Math.max(8, Math.min(100, progress * 100))}%`,
          background: "linear-gradient(90deg, #ffd58a, #a06aff, #fbbf24)",
          boxShadow: "0 0 10px rgba(160,106,255,0.7)",
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

/* ───────────────────────── CONSTANTS ───────────────────────── */

const TOTAL = 19;
// Warm Pixar gradient — used by progress bar, step dots' completed glow,
// celebration confetti, and various inline UIs. Was a cyber blue→cyan blend.
const GRAD = "linear-gradient(135deg, #ff9b4a, #ffd58a)";

/* ───────────────────────── DATA ────────────────────────────── */

const PASSWORDS_8 = [
  { id: "q1", text: "Tr0phy$tar99", isStrong: true, bg: "rgba(255,213,138,0.1)", border: "#ffd58a", color: "#ffd58a" },
  { id: "q2", text: "MyD0g&Runs!", isStrong: true, bg: "rgba(255,178,110,0.1)", border: "#ffd58a", color: "#c08aff" },
  { id: "q3", text: "C@tLov3r2024", isStrong: true, bg: "rgba(244,114,182,0.1)", border: "#f472b6", color: "#f9a8d4" },
  { id: "q4", text: "Sup3r$h!eld7", isStrong: true, bg: "rgba(168,227,187,0.1)", border: "#7cc89a", color: "#a8e3bb" },
  { id: "q5", text: "password", isStrong: false, bg: "rgba(251,146,60,0.1)", border: "#fb923c", color: "#fdba74" },
  { id: "q6", text: "123456", isStrong: false, bg: "rgba(248,113,113,0.1)", border: "#f87171", color: "#fca5a5" },
  { id: "q7", text: "abcabc", isStrong: false, bg: "rgba(255,213,138,0.1)", border: "#ffd58a", color: "#ffd58a" },
  { id: "q8", text: "iloveyou", isStrong: false, bg: "rgba(192,132,252,0.1)", border: "#c084fc", color: "#d8b4fe" },
];

const SWIPE_DATA = [
  { pw: "password", isStrong: false, why: "This is the #1 most guessed password in the world!" },
  { pw: "Tr0phy$tar99", isStrong: true, why: "Capital letter, numbers, symbol, fortress! 💪" },
  { pw: "123456", isStrong: false, why: "Just counting up, a hacker cracks this in under a second!" },
  { pw: "MyD0g&Runs!", isStrong: true, why: "Easy to remember but almost impossible to guess! 💪" },
  { pw: "iloveyou", isStrong: false, why: "Too common, it's on every hacker's list!" },
  { pw: "Sup3r$h!eld7", isStrong: true, why: "Long, mixed, and super strong! 💪" },
];

const BUILDER_OPTIONS = [
  ["A", "B", "C", "D", "E", "F", "G", "H"],
  ["cat", "dog", "sun", "star", "moon", "fish", "bird", "hero"],
  ["1", "7", "3", "9", "42", "99", "007", "2024"],
  ["@", "#", "$", "!", "&", "*", "?", "%"],
];
const BUILDER_LABELS = ["Pick a CAPITAL LETTER", "Pick a SECRET WORD", "Pick a NUMBER", "Pick a SYMBOL"];
const BUILDER_COLORS = ["#ff9b4a", "#ff9b4a", "#ec4899", "#f59e0b"];

const RECIPE = [
  { label: "CAPITAL LETTERS", example: "A, B, C, the big ones!", icon: "🅰️", color: "#ff9b4a" },
  { label: "lowercase letters", example: "a, b, c, the small ones!", icon: "🔡", color: "#ff9b4a" },
  { label: "Numbers", example: "1, 2, 3!", icon: "🔢", color: "#ec4899" },
  { label: "Special Symbols", example: "@ # $ and !", icon: "✨", color: "#f59e0b" },
  { label: "Make it LONG", example: "At least 8 characters!", icon: "📏", color: "#5fb37a" },
];

const Q1_QUIZ = [
  { q: "What is a password?", opts: ["A type of computer game", "A secret code that only you know", "Your name", "A picture on your computer"], correct: 1, explain: "A password is YOUR secret code, like a key only you have!" },
  { q: "What happened to Adam and Layla?", opts: ["They won a real prize", "Their computer broke", "They got tricked and hacked by the Raccoon", "Nothing happened"], correct: 2, explain: "The Hacker Raccoon tricked them because they didn't know about password safety!" },
  { q: "A password is like a _____ for your digital stuff", opts: ["A picture", "A special key", "A game", "A song"], correct: 1, explain: "Just like a key locks your door, a password locks your digital stuff!" },
];

const Q2_QUIZ = [
  { q: "Why are passwords important?", opts: ["They make your computer look cool", "They keep your digital stuff safe", "Teachers say you need them", "They make the internet faster"], correct: 1, explain: "Passwords protect everything you care about online!" },
  { q: "What could happen WITHOUT a password on your games?", opts: ["You get more coins", "Nothing", "Someone could steal your progress", "Games get faster"], correct: 2, explain: "Without a password, anyone could take your coins and saved games!" },
  { q: "What happened when we added a password?", opts: ["The Raccoon got stronger", "Nothing changed", "The Raccoon bounced off and couldn't get in", "The computer broke"], correct: 2, explain: "The password stopped the Raccoon in its tracks!" },
];

const Q3_QUIZ = [
  { q: "Your best friend asks for your password. You should...", opts: ["Share it, they're your best friend!", "Politely say no, passwords are private", "Write it on a note for them", "Shout it out loud"], correct: 1, explain: "Even best friends should keep passwords private. It's YOUR secret code!" },
  { q: "Should you use the same password for everything?", opts: ["Yes, it's easier to remember", "Only for games", "No, use different passwords!", "It doesn't matter"], correct: 2, explain: "If someone cracks one password, they'd have ALL your passwords!" },
  { q: "Which should you NEVER use as a password?", opts: ["A mix of letters and numbers", "Your birthday", "A long made-up phrase", "Something with symbols"], correct: 1, explain: "Hackers check birthdays first, they're way too easy to guess!" },
  { q: "How long should a good password be?", opts: ["2 characters", "4 characters", "At least 8 characters!", "1 character"], correct: 2, explain: "The longer the password, the harder it is to crack!" },
  { q: "Something weird happens online. You should...", opts: ["Ignore it", "Tell all your friends", "Try to fix it yourself", "Tell a trusted grown-up"], correct: 3, explain: "A parent, teacher, or carer can always help keep you safe!" },
];

const PHISH = [
  { title: "🎉 YOU WON A FREE iPHONE!", text: "Click here and enter your password to claim your prize NOW!", isScam: true, explain: "Real prizes NEVER ask for your password! This is exactly how Adam and Layla got tricked! 🦝" },
  { title: "⚠️ URGENT: Your account has been hacked!", text: "Enter your password RIGHT NOW to fix it!", isScam: true, explain: "Real websites don't send scary pop-ups! They want to make you panic so you give away your code." },
  { title: "💬 Hi! Your friend Sam sent you a funny video 😂", text: "Click to watch!", isScam: false, explain: "This looks normal, no password needed! But always check with a grown-up if you're not sure." },
  { title: "🏫 Your school needs your password!", text: "Enter it in this form to update the system.", isScam: true, explain: "Your school would NEVER ask for your password in a message! Always ask your teacher in person." },
  { title: "🎮 FREE V-BUCKS! Get 10,000 V-Bucks FREE!", text: "Just enter your username and password to claim your free V-Bucks now! Limited time only!", isScam: true, explain: "Free V-Bucks don't exist! This is a scam to steal your gaming account. Only buy V-Bucks from the official store." },
  { title: "📚 Reminder from School", text: "Don't forget to bring your PE kit tomorrow! - Mrs Johnson", isScam: false, explain: "This looks like a normal school reminder. No password or personal information is being asked for." },
  { title: "🏆 CONGRATULATIONS! You are our 1,000,000th visitor!", text: "Click NOW to claim your prize! Enter your details before time runs out! ⏰", isScam: true, explain: "Websites can't tell which number visitor you are! This is one of the oldest tricks online. Never click these." },
];

const WYD = [
  { emoji: "🤝", situation: "Your friend says: 'Tell me your game password and I'll help you level up!'", opts: ["Share it, they're being helpful!", "Say 'No thanks, my password is private'", "Tell a grown-up"], correct: 1, why: "It's kind of them to offer, but your password should always stay private. You could play together instead!" },
  { emoji: "📝", situation: "You find a piece of paper at school with someone's password written on it.", opts: ["Leave it there", "Pick it up and throw it away safely", "Try the password yourself"], correct: 1, why: "Written passwords can be found by anyone! The kindest thing is to throw it away safely." },
  { emoji: "🌐", situation: "A website asks you to create a new password.", opts: ["Type 'password123'", "Use your birthday", "Create a strong one with the recipe!"], correct: 2, why: "Use the password recipe! Mix capitals, lowercase, numbers, and symbols. Make it at least 8 characters!" },
  { emoji: "😨", situation: "You think someone at school might know your password.", opts: ["Don't worry about it", "Change it straight away and tell a grown-up!", "Keep using the same one"], correct: 1, why: "If you think someone knows your password, change it IMMEDIATELY and tell a trusted adult!" },
];

const BOSS_QUIZ = [
  { q: "What is a password?", opts: ["A type of game", "A secret code only you know", "Your pet's name", "A picture"], correct: 1 },
  { q: "What happened to Adam and Layla?", opts: ["They won a prize", "Their computer broke", "They got tricked by the Raccoon", "Nothing"], correct: 2 },
  { q: "Which is the STRONGEST password?", opts: ["password123", "abcabc", "R@inb0w$2024!", "111111"], correct: 2 },
  { q: "Strong passwords need...", opts: ["Just numbers", "Just your name", "Capitals, lowercase, numbers, symbols & length!", "Just one letter"], correct: 2 },
  { q: "Should you share your password with friends?", opts: ["Yes, always!", "Only best friends", "No, passwords are private!", "Only on weekends"], correct: 2 },
  { q: "How long should a good password be?", opts: ["2 characters", "5 characters", "At least 8 characters!", "1 character"], correct: 2 },
  { q: "You should NEVER use ___ as a password", opts: ["Random symbols", "A long phrase", "Your birthday or real name", "Mixed characters"], correct: 2 },
  { q: "A pop-up says 'You won! Enter your password!' You should...", opts: ["Enter it quickly!", "Click the link", "Ignore it and tell a grown-up!", "Share it with friends"], correct: 2 },
  { q: "You think someone knows your password. What do you do?", opts: ["Nothing", "Change it straight away!", "Tell nobody", "Use the same one"], correct: 1 },
  { q: "If something feels wrong online, tell...", opts: ["Nobody", "Your pet", "A trusted grown-up", "The internet"], correct: 2 },
];

const RULES = [
  { icon: "lock", title: "NEVER share your password", desc: "Not even with your best friend, it's YOUR secret code!", question: "Your friend asks for your password to help you. What do you say?", opts: ["Sure, here it is!", "Sorry, passwords are private!"], correct: 1 },
  { icon: "key", title: "Use DIFFERENT passwords", desc: "One for your games, one for your tablet, one for school!", question: "Should you use the same password everywhere?", opts: ["Yes, it's easier!", "No, use different ones!"], correct: 1 },
  { icon: "unlock", title: "NEVER use your real name or birthday", desc: "Hackers try names and birthdays first, they're too easy to guess!", question: "Which is safer to use in a password?", opts: ["Your birthday", "Random letters and symbols"], correct: 1 },
  { icon: "ruler", title: "Make it at LEAST 8 characters long", desc: "The longer the password, the harder to crack!", question: "How long should a good password be?", opts: ["3 characters", "At least 8 characters!"], correct: 1 },
  { icon: "users", title: "If something feels wrong, tell a grown-up", desc: "A parent, teacher, or carer, they're always there to help!", question: "Something weird happens online. What do you do?", opts: ["Ignore it", "Tell a trusted grown-up"], correct: 1 },
];

// ── MCQ shuffle ──
// Children kept noticing that the correct answer was almost always in the
// same spot (the source data lists it predictably as index 1 or 2).
// Naive Fisher-Yates per question is random but with only 4 slots it can
// still produce streaks of "right answer is always C". Instead we
// **balance** the distribution: pre-assign each question a target
// position cycling through 0..N-1 (then shuffle that assignment), and
// place the correct answer at its target — wrong answers shuffled around
// it. Result: across any set of N questions, A/B/C/D each hold the right
// answer roughly N/4 times, with no streaks longer than 1.
// Stable within a session (one-shot at module load) so rendering during a
// lesson doesn't reshuffle and confuse the learner.
function balanceMcqList<T>(arr: T[], optsKey: keyof T, correctKey: keyof T) {
  if (arr.length === 0) return;
  const firstOpts = arr[0][optsKey] as unknown as unknown[];
  const optsLen = Array.isArray(firstOpts) ? firstOpts.length : 0;
  if (optsLen <= 1) return;
  // Build target positions cycling through 0..optsLen-1, then shuffle.
  const positions: number[] = arr.map((_, i) => i % optsLen);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  arr.forEach((q, i) => {
    const opts = q[optsKey] as unknown as unknown[];
    const correctIdx = q[correctKey] as unknown as number;
    if (!Array.isArray(opts) || typeof correctIdx !== "number") return;
    const target = positions[i] ?? 0;
    const correctVal = opts[correctIdx];
    const wrong = opts.filter((_, j) => j !== correctIdx);
    for (let k = wrong.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [wrong[k], wrong[j]] = [wrong[j], wrong[k]];
    }
    const newOpts = [...wrong];
    newOpts.splice(target, 0, correctVal);
    (q as unknown as Record<string, unknown>)[optsKey as string] = newOpts;
    (q as unknown as Record<string, unknown>)[correctKey as string] = target;
  });
}
balanceMcqList(MAZE_QUESTIONS, "answers", "correctIndex");
balanceMcqList(Q1_QUIZ, "opts", "correct");
balanceMcqList(Q2_QUIZ, "opts", "correct");
balanceMcqList(Q3_QUIZ, "opts", "correct");
balanceMcqList(WYD, "opts", "correct");
balanceMcqList(BOSS_QUIZ, "opts", "correct");
balanceMcqList(RULES, "opts", "correct");

const ACHIEVEMENTS = [
  "You know what a password is",
  "You know WHY passwords matter",
  "You can build a super strong password",
  "You can spot weak passwords",
  "You know the 5 golden rules",
  "You can spot phishing tricks",
  "You know what to do in real situations",
  "You defeated the Hacker Raccoon!",
];

const OPT_COLORS = [
  { bg: "rgba(255,213,138,0.08)", border: "rgba(255,213,138,0.3)", color: "#ffd58a" },
  { bg: "rgba(255,178,110,0.08)", border: "rgba(255,178,110,0.3)", color: "#c08aff" },
  { bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.3)", color: "#f9a8d4" },
  { bg: "rgba(255,213,138,0.08)", border: "rgba(255,213,138,0.3)", color: "#ffd58a" },
];

const BUBBLE_COLORS = ["#ff9b4a", "#ff9b4a", "#ec4899", "#f59e0b"];

const WHY_SCENARIOS = [
  { icon: "gamepad", label: "Gaming", item: "Your saved games & trophies", problem: "The Raccoon stole all your coins and deleted your save files!", success: "Your games are safe behind a strong password!" },
  { icon: "users", label: "Family Photos", item: "Your family photos & memories", problem: "The Raccoon deleted your family holiday photos!", success: "Your photos are locked and safe!" },
  { icon: "message", label: "Messages", item: "Your private messages", problem: "The Raccoon read all your messages and sent mean ones!", success: "Your messages are private and protected!" },
];

const LOCK_ITEMS = [
  { id: "gaming", icon: "🎮", label: "Gaming", message: "Your games are locked and safe!" },
  { id: "tablet", icon: "📝", label: "Tablet", message: "Your tablet is protected!" },
  { id: "school", icon: "🏫", label: "School", message: "Your school account is secure!" },
];

const RECIPE_CHARS: Record<number, string[]> = {
  0: ["A", "B", "C", "X", "Z", "M"],
  1: ["a", "b", "c", "x", "z", "m"],
  2: ["1", "2", "3", "7", "9", "0"],
  3: ["@", "#", "$", "!", "&", "*"],
  4: ["8", "+", "L", "o", "n", "g"],
};

/* ───────────────────────── CSS (only what Framer can't replace) ── */

const CSS = `
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.shimmer-card {
  background-image: linear-gradient(135deg, rgba(255,178,110,0.08) 0%, rgba(255,213,138,0.05) 25%, rgba(124,200,154,0.05) 50%, rgba(255,178,110,0.08) 75%, rgba(160,106,255,0.05) 100%);
  background-size: 200% 200%;
  animation: shimmer 3s ease infinite;
}
@media print {
  body { background: white !important; }
  header, nav, .step-dots-wrap, .progress-wrap, .floating-orbs-wrap, .score-cards, .dash-link, .print-hide { display: none !important; }
  main { padding: 0 !important; }
  .certificate-card {
    border: 3px solid #ff9b4a !important;
    background: white !important;
    color: black !important;
    box-shadow: none !important;
    max-width: 100% !important;
    backdrop-filter: none !important;
  }
  .certificate-card * { color: black !important; -webkit-text-fill-color: black !important; }
  .certificate-card .gradient-text { -webkit-text-fill-color: #ff9b4a !important; color: #ff9b4a !important; }
}
`;

/* ───────────────────────── MOTION VARIANTS ────────────────────── */

const springTransition = { type: "spring" as const, stiffness: 400, damping: 25 };

const screenVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const slideUpVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const popInVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const fadeZoomVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: "easeIn" as const } },
};

const bounceInVariants = {
  initial: { opacity: 0, y: 40, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 18 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 40, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 18 } },
};

const achieveStaggerContainer = {
  animate: { transition: { staggerChildren: 0.5 } },
};

const achieveStaggerItem = {
  initial: { opacity: 0, y: 40, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 18 } },
};

const shakeAnimation = {
  x: [0, -8, 8, -6, 6, 0],
  transition: { duration: 0.5 },
};

const confettiFallVariant = (_i: number) => ({
  initial: { y: -20, opacity: 1, rotate: 0 },
  animate: {
    y: "100vh",
    rotate: 720,
    opacity: 0,
    transition: {
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
});

/* ───────────────────────── SUB-COMPONENTS ──────────────────── */

function FloatingOrbs() {
  // Warm Pixar dust backdrop — replaces the old cyber-grid + hex code rain.
  // Layered: faint warm grid, drifting gold/coral motes rising from below,
  // soft-glow lock icons in warm Pixar amber, and a few pulsing fireflies.
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <style>{`
        @keyframes lpMoteRise {
          0%   { transform: translate(0, 0); opacity: 0; }
          12%  { opacity: 0.85; }
          88%  { opacity: 0.85; }
          100% { transform: translate(var(--mx, 0), -110vh); opacity: 0; }
        }
        @keyframes lpLockFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-22px) rotate(5deg); }
        }
        @keyframes lpFireflyTwinkle {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%     { opacity: 0.85; transform: scale(1.35); }
        }
      `}</style>

      {/* Layer 1: faint warm grid (cream lines, much softer than the cyber one) */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,220,180,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,220,180,0.045) 1px, transparent 1px)`,
        backgroundSize: "100px 100px",
      }} />

      {/* Layer 2: drifting gold/coral motes rising from below */}
      {Array.from({ length: 28 }, (_, i) => {
        const left = (i * 41 + 7) % 100;
        const size = 2 + ((i * 5) % 4);
        const drift = ((i * 11) % 30) - 15;
        const dur = 14 + ((i * 3) % 10);
        const delay = (i * 0.41) % 9;
        const color = i % 3 === 0 ? "rgba(255,213,138,0.85)" : i % 3 === 1 ? "rgba(247,193,138,0.7)" : "rgba(240,142,126,0.55)";
        return (
          <span
            key={`mote-${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: -10,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${size * 5}px ${color}`,
              animation: `lpMoteRise ${dur}s ease-in-out ${delay}s infinite`,
              ["--mx" as string]: `${drift}px`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Layer 3: warm soft-glow lock icons (low opacity, decorative) */}
      {[
        { icon: "🔒", left: "5%", top: "15%", size: 40, dur: 36 },
        { icon: "🔑", left: "85%", top: "25%", size: 35, dur: 44 },
        { icon: "🛡️", left: "15%", top: "55%", size: 50, dur: 32 },
        { icon: "🔒", left: "75%", top: "65%", size: 30, dur: 50 },
        { icon: "🔑", left: "45%", top: "80%", size: 45, dur: 40 },
        { icon: "🛡️", left: "60%", top: "10%", size: 35, dur: 46 },
        { icon: "🔒", left: "30%", top: "40%", size: 55, dur: 38 },
        { icon: "🔑", left: "90%", top: "50%", size: 30, dur: 42 },
      ].map((ic, i) => (
        <div key={`lock-${i}`} style={{
          position: "absolute",
          left: ic.left,
          top: ic.top,
          fontSize: ic.size,
          opacity: 0.07,
          filter: "drop-shadow(0 0 12px rgba(255,200,110,0.55))",
          animation: `lpLockFloat ${ic.dur}s ease-in-out infinite`,
          animationDelay: `${i * -3}s`,
        }}>{ic.icon}</div>
      ))}

      {/* Layer 4: warm fireflies — tiny pulsing gold dots that twinkle in
          place rather than slide horizontally (the old cyber particles). */}
      {[
        { left: "20%", top: "30%", delay: 0 },
        { left: "70%", top: "20%", delay: 2 },
        { left: "40%", top: "70%", delay: 4 },
        { left: "80%", top: "55%", delay: 1 },
        { left: "10%", top: "80%", delay: 3 },
        { left: "55%", top: "40%", delay: 5 },
      ].map((p, i) => (
        <span
          key={`firefly-${i}`}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#ffd58a",
            boxShadow: "0 0 18px rgba(255,213,138,0.85), 0 0 36px rgba(255,178,110,0.4)",
            animation: `lpFireflyTwinkle ${3 + (i % 3)}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / TOTAL) * 100;
  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "0 auto 8px", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,233,200,0.65)", marginBottom: 4, fontFamily: "Fredoka, Nunito, sans-serif", letterSpacing: 0.5, fontWeight: 600 }}>
        <span>Step {step + 1} of {TOTAL}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,220,180,0.10)" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 999, background: GRAD, boxShadow: "0 0 12px rgba(255,200,110,0.55)" }}
        />
      </div>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "8px 0 16px", flexWrap: "wrap" }}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === step ? 12 : 8,
            height: i === step ? 12 : 8,
            background: i < step ? "#ff9b4a" : i === step ? "#ffd58a" : "rgba(255,220,180,0.18)",
            scale: i === step ? [1, 1.4, 1] : 1,
            boxShadow: i === step ? "0 0 14px rgba(255,213,138,0.7)" : i < step ? "0 0 8px rgba(255,200,110,0.45)" : "none",
          }}
          transition={i === step ? { scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }, ...springTransition } : springTransition}
          style={{ borderRadius: "50%" }}
        />
      ))}
    </div>
  );
}

function Confetti({ duration = 3000 }: { duration?: number }) {
  const shapes = ["●", "■", "▲", "⭐", "♥"];
  const colors = ["#ff9b4a", "#ffd58a", "#f59e0b", "#5fb37a", "#f97316", "#ffd58a"];
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {Array.from({ length: 90 }, (_, i) => {
        const v = confettiFallVariant(i);
        return (
          <motion.div
            key={i}
            initial={v.initial}
            animate={v.animate}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              fontSize: 10 + Math.random() * 14,
              color: colors[i % colors.length],
            }}
          >
            {shapes[i % shapes.length]}
          </motion.div>
        );
      })}
    </div>
  );
}

function SparkleBurst({ x, y, big }: { x: number; y: number; big?: boolean }) {
  const emojis = big ? ["✨", "⭐", "🌟", "💫", "✨", "⭐", "🌟", "💫"] : ["✨", "⭐", "🌟", "💫"];
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 99 }}>
      {emojis.map((e, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, scale: 1, rotate: 0 }}
          animate={{ opacity: 0, scale: big ? 2 : 0, rotate: 180 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: (i % 2 === 0 ? -1 : 1) * (10 + i * (big ? 12 : 8)),
            top: (i < emojis.length / 2 ? -1 : 1) * (10 + i * (big ? 10 : 6)),
            fontSize: big ? 26 : 20,
          }}
        >
          {e}
        </motion.span>
      ))}
    </div>
  );
}

function CoinCounter({ coins, animKey }: { coins: number; animKey: number }) {
  return (
    <motion.div
      key={animKey}
      data-coin-counter
      animate={animKey > 0 ? { scale: [1, 1.4, 1] } : {}}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 12, padding: "4px 12px",
        boxShadow: "0 0 10px rgba(245,158,11,0.3)",
      }}
    >
      <span style={{ fontSize: 18 }}>🪙</span>
      <span style={{ color: "#f59e0b", fontWeight: 900, fontSize: 16 }}>{coins}</span>
    </motion.div>
  );
}

function MiniConfetti({ x, y }: { x: number; y: number }) {
  const colors = ["#ff9b4a", "#ff9b4a", "#f59e0b", "#5fb37a", "#ef4444", "#ec4899"];
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 99 }}>
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              fontSize: 8 + Math.random() * 6,
              color: colors[i % colors.length],
            }}
          >
            ●
          </motion.span>
        );
      })}
    </div>
  );
}

/* ───────────────────────── HELPERS ─────────────────────────── */

function btn(label: string, onClick: () => void, extra?: React.CSSProperties): React.ReactElement {
  return (
    <ButtonJuice
      onClick={onClick}
      sound="click"
      style={{
        background: "linear-gradient(135deg, #f97316, #f59e0b)",
        color: "#fff",
        fontWeight: 700,
        borderRadius: 14,
        padding: "13px 34px",
        fontSize: 16,
        boxShadow: "0 0 15px rgba(249,115,22,0.4)",
        minHeight: 48,
        ...extra,
      }}
    >
      {label}
    </ButtonJuice>
  );
}

function card(children: React.ReactNode, extra?: React.CSSProperties): React.ReactElement {
  return (
    <div data-animate style={{
      position: "relative",
      overflow: "hidden",
      // Semi-transparent with backdrop blur so the 3D arena shows through.
      background: "rgba(17,24,39,0.72)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, ...extra,
    }}>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function strengthMeter(pct: number) {
  const c = pct < 40 ? "#ef4444" : pct < 80 ? "#f59e0b" : "#5fb37a";
  const label = pct < 40 ? "Weak" : pct < 80 ? "Getting there..." : pct >= 100 ? "SUPER STRONG!" : "Strong";
  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>
        <span>Strength</span><span style={{ color: c, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          animate={{ width: `${Math.min(pct, 100)}%`, background: c }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 999 }}
        />
      </div>
    </div>
  );
}

function stars(n: number) {
  return <span style={{ fontSize: 28, letterSpacing: 4 }}>{"⭐".repeat(n)}{"☆".repeat(3 - n)}</span>;
}

/* ───────────────────────── FLOATING BUBBLES QUIZ ─────────── */

const bubbleFloatAnimations = [
  { y: [0, -15, 0] },
  { x: [0, 12, 0] },
  { x: [0, 10, 0], y: [0, -10, 0] },
  { y: [0, 13, 0] },
];

const bubbleFloatDurations = [3, 3.5, 4, 2.8];

function FloatingBubbleQuiz({ question, opts, correct, explain, onCorrect, onWrong, playSound }: {
  question: string;
  opts: string[];
  correct: number;
  explain: string;
  onCorrect: () => void;
  onWrong: () => void;
  playSound: (src: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongTapped, setWrongTapped] = useState<Set<number>>(new Set());
  const [popped, setPopped] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    if (selected !== null) return;
    if (i === correct) {
      setSelected(i);
      setPopped(true);
      setShowFeedback(true);
      setShowNext(true);
      celebrateCorrect(e.currentTarget);
      playSFX("correct");
      setTimeout(() => playSFX("xpGain"), 500);
    } else {
      setWrongTapped((prev) => { const n = new Set(prev); n.add(i); return n; });
      shakeWrong(e.currentTarget);
      playSFX("wrong");
      onWrong();
      setTimeout(() => setWrongTapped((prev) => { const n = new Set(prev); n.delete(i); return n; }), 600);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 data-split style={{ color: "#fff", fontSize: 20, margin: "0 0 24px" }}>{question}</h2>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
        maxWidth: 400, margin: "0 auto 20px", minHeight: 260,
        alignItems: "center", justifyItems: "center",
      }}>
        {opts.map((opt, i) => {
          const isCorrectOpt = i === correct;
          const isWrong = wrongTapped.has(i);
          const isPopped = popped && isCorrectOpt;
          const isFading = popped && !isCorrectOpt;
          return (
            <motion.button
              key={i}
              className="shimmer-card"
              onClick={(e) => handleTap(e, i)}
              disabled={selected !== null}
              animate={
                isPopped ? { scale: [1, 1.3, 0], opacity: [1, 0.6, 0] }
                : isWrong ? { x: [0, -6, 6, -6, 6, 0], rotate: [0, -5, 5, -5, 5, 0] }
                : isFading ? { opacity: 0, scale: 0.5 }
                : bubbleFloatAnimations[i]
              }
              transition={
                isPopped ? { duration: 0.5 }
                : isWrong ? { duration: 0.5 }
                : isFading ? { duration: 0.5 }
                : { duration: bubbleFloatDurations[i], repeat: Infinity, ease: "easeInOut" }
              }
              whileHover={selected === null ? { scale: 1.1 } : {}}
              whileTap={selected === null ? { scale: 0.95 } : {}}
              style={{
                width: 120, height: 120, borderRadius: "50%",
                background: `rgba(${i === 0 ? "59,130,246" : i === 1 ? "6,182,212" : i === 2 ? "236,72,153" : "245,158,11"},0.15)`,
                border: `3px solid ${BUBBLE_COLORS[i]}`,
                color: BUBBLE_COLORS[i], fontWeight: 700, fontSize: 13,
                cursor: selected !== null ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: 8,
                boxShadow: `0 0 15px rgba(${i === 0 ? "59,130,246" : i === 1 ? "6,182,212" : i === 2 ? "236,72,153" : "245,158,11"},0.2)`,
              }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginTop: 8 }}
          >
            <p style={{ color: "#5fb37a", fontSize: 20, fontWeight: 700 }}>🎉 Correct!</p>
            <p style={{ color: "#e5e7eb", fontSize: 16, lineHeight: 1.5 }}>{explain}</p>
            {showNext && (
              <div style={{ marginTop: 12 }}>
                {btn("Continue →", () => onCorrect())}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── SWIPE CARD SUB-COMPONENT ─────────── */

function SwipeCard({
  pw,
  onSwipeEnd,
}: {
  pw: string;
  onSwipeEnd: (isStrong: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const borderColor = useTransform(x, [-100, -50, 0, 50, 100], [
    "#ef4444", "#ef4444", "rgba(255,255,255,0.1)", "#5fb37a", "#5fb37a",
  ]);
  const bgColor = useTransform(x, [-100, -50, 0, 50, 100], [
    "rgba(239,68,68,0.05)", "rgba(239,68,68,0.05)", "rgba(255,255,255,0.04)", "rgba(124,200,154,0.05)", "rgba(124,200,154,0.05)",
  ]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipeEnd(info.offset.x > 0);
        }
      }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 300 }}
      style={{
        x,
        rotate,
        touchAction: "none",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <motion.div
        style={{
          background: bgColor,
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderColor,
          borderWidth: 2,
          borderStyle: "solid",
          borderRadius: 24,
          padding: 24,
          maxWidth: 400,
          margin: "0 auto 24px",
        }}
      >
        <p style={{ color: "#f59e0b", fontFamily: "monospace", fontSize: 24, fontWeight: 900, margin: 0 }}>{pw}</p>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── INSTRUCTION & SUMMARY OVERLAYS ── */

/* ───────────────────────── 3D ARENA BACKGROUND ──────────────── */
function ArenaBg3D({ effect }: { effect: "hit" | "miss" | "super" | null }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a0612, emissive: 0xff9b4a, emissiveIntensity: 0.08 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5; scene.add(floor);
    const grid = new THREE.GridHelper(12, 24, 0xff9b4a, 0xff9b4a);
    grid.position.y = -0.49; (grid.material as THREE.Material).opacity = 0.15; (grid.material as THREE.Material).transparent = true; scene.add(grid);
    const ambient = new THREE.AmbientLight(0xff9b4a, 0.2); scene.add(ambient);
    const mainLight = new THREE.PointLight(0xff9b4a, 1, 20); mainLight.position.set(0, 4, 2); scene.add(mainLight);
    const blueLight = new THREE.PointLight(0xff9b4a, 0.4, 15); blueLight.position.set(-4, 2, 0); scene.add(blueLight);
    const redLight = new THREE.PointLight(0xef4444, 0.4, 15); redLight.position.set(4, 2, 0); scene.add(redLight);
    const particles: THREE.Mesh[] = [];
    for (let i = 0; i < 40; i++) {
      const pMat = new THREE.MeshBasicMaterial({ color: 0xff9b4a, transparent: true, opacity: 0.5 });
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), pMat);
      p.position.set((Math.random() - 0.5) * 8, Math.random() * 3, (Math.random() - 0.5) * 4);
      p.userData.speed = 0.001 + Math.random() * 0.003; scene.add(p); particles.push(p);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.015, 8, 64), new THREE.MeshBasicMaterial({ color: 0xff9b4a, transparent: true, opacity: 0.2 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = -0.4; scene.add(ring);
    [[-4,1.5,-3],[4,1.5,-3],[-4,1.5,3],[4,1.5,3]].forEach(pos => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 0.08), new THREE.MeshStandardMaterial({ emissive: 0xff9b4a, emissiveIntensity: 1, transparent: true, opacity: 0.25 }));
      pillar.position.set(pos[0], pos[1], pos[2]); scene.add(pillar);
    });
    sceneRef.current = { renderer, scene, camera, mainLight, redLight, blueLight, floorMat, grid, ring, particles, triggerShake: (_i: number, _d: number) => {} };
    let animId: number;
    const origCam = { x: 0, y: 2, z: 6 };
    let shakeTime = 0, shakeIntensity = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      (grid.material as THREE.Material).opacity = 0.1 + Math.sin(t) * 0.05;
      ring.rotation.z = t * 0.3;
      particles.forEach(p => { p.position.y += p.userData.speed; if (p.position.y > 3) p.position.y = 0; (p.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(t * 2 + p.position.x) * 0.3; });
      if (shakeTime > 0) { camera.position.x = origCam.x + (Math.random() - 0.5) * shakeIntensity; camera.position.y = origCam.y + (Math.random() - 0.5) * shakeIntensity; shakeTime -= 0.016; } else { camera.position.set(origCam.x, origCam.y, origCam.z); }
      renderer.render(scene, camera);
    };
    animate();
    sceneRef.current.triggerShake = (intensity: number, duration: number) => { shakeIntensity = intensity; shakeTime = duration; };
    const onResize = () => { const w = container.clientWidth, h = container.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(animId); renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); };
  }, []);

  useEffect(() => {
    const s = sceneRef.current as Record<string, any>;
    if (!effect || !s.mainLight) return;
    if (effect === "hit") { s.mainLight.intensity = 3; s.mainLight.color.set(0x5fb37a); s.triggerShake(0.15, 0.3); setTimeout(() => { s.mainLight.intensity = 1; s.mainLight.color.set(0xff9b4a); }, 300); }
    else if (effect === "miss") { s.redLight.intensity = 2; s.floorMat.emissive.set(0xef4444); s.triggerShake(0.2, 0.3); setTimeout(() => { s.redLight.intensity = 0.4; s.floorMat.emissive.set(0xff9b4a); }, 400); }
    else if (effect === "super") { s.mainLight.intensity = 5; s.blueLight.intensity = 3; s.mainLight.color.set(0xf59e0b); s.floorMat.emissive.set(0xf59e0b); s.triggerShake(0.3, 0.5); setTimeout(() => { s.mainLight.intensity = 1; s.blueLight.intensity = 0.4; s.mainLight.color.set(0xff9b4a); s.floorMat.emissive.set(0xff9b4a); }, 500); }
  }, [effect]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0, borderRadius: 20, overflow: "hidden" }} />;
}

function InstructionOverlay({ icon, story, instructions, onReady }: { icon: string; story: string; instructions: string; onReady: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
      <div data-animate style={{ background: "rgba(40,18,38,0.82)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,220,180,0.35)", boxShadow: "0 0 30px rgba(255,178,110,0.22), 0 30px 60px -20px rgba(20,6,12,0.7)", borderRadius: 24, padding: 32, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: "rgba(255,178,110,0.16)", border: "1px solid rgba(255,220,180,0.32)", borderRadius: 20, filter: "drop-shadow(0 0 18px rgba(255,200,110,0.45))" }}>{icon}</div>
        <p style={{ color: "#ffe9c8", fontSize: 14, fontStyle: "italic", marginBottom: 8, opacity: 0.92 }}>{story}</p>
        <h2 data-split style={{ color: "#fff7e6", fontSize: 22, fontWeight: 900, marginBottom: 8, fontFamily: "Fredoka, Nunito, sans-serif" }}>Here&apos;s what to do!</h2>
        <p style={{ color: "#ffe9c8", fontSize: 16, lineHeight: 1.6, marginBottom: 20, opacity: 0.85 }}>{instructions}</p>
        <motion.button onClick={onReady} whileHover={{ scale: 1.05, y: -2, boxShadow: "0 18px 36px -10px rgba(255,120,40,0.7), 0 0 0 1px rgba(255,235,200,0.55) inset" }} whileTap={{ scale: 0.95 }}
          style={{ background: "linear-gradient(135deg, #ffd58a, #ff9b4a)", color: "#3a1a06", fontWeight: 800, borderRadius: 999, padding: "13px 34px", border: "none", cursor: "pointer", fontSize: 16, fontFamily: "Fredoka, Nunito, sans-serif", letterSpacing: 0.5, boxShadow: "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset" }}>
          I&apos;m Ready! &rarr;
        </motion.button>
      </div>
    </motion.div>
  );
}

function LearnSummary({ message, starCount, onNext }: { message: string; starCount: number; onNext: () => void }) {
  // Trophy SVG with depth, gradient, shine. Stars are SVG with rotating
  // halo, popping in sequence. Card sits on a 3D rotateX perspective with
  // an orbiting light streak around it.
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ textAlign: "center", perspective: "1400px" }}
    >
      <style>{`
        @keyframes lsTrophyFloat { 0%,100% { transform: translateY(0) rotateZ(-2deg); } 50% { transform: translateY(-6px) rotateZ(2deg); } }
        @keyframes lsHaloSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lsRayPulse { 0%,100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.75; transform: scale(1.15); } }
        @keyframes lsShimmerSweep { 0% { transform: translateX(-160%) skewX(-18deg); } 100% { transform: translateX(260%) skewX(-18deg); } }
        @keyframes lsConfetti { 0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate3d(var(--cx), var(--cy), 0) rotate(540deg); opacity: 0; } }
      `}</style>
      <div
        data-animate
        style={{
          position: "relative",
          background: "linear-gradient(160deg, rgba(20,32,55,0.92) 0%, rgba(15,40,30,0.88) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(168,227,187,0.45)",
          boxShadow:
            "0 40px 80px -25px rgba(124,200,154,0.45), " +
            "0 0 60px rgba(124,200,154,0.18), " +
            "inset 0 0 0 1px rgba(255,255,255,0.06)",
          borderRadius: 24,
          padding: "32px 28px 26px",
          maxWidth: 520,
          margin: "0 auto",
          overflow: "hidden",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Diagonal shimmer sweep */}
        <span aria-hidden style={{
          position: "absolute", top: 0, left: 0, height: "100%", width: "60%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
          animation: "lsShimmerSweep 4.5s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        {/* Confetti bits floating up behind the trophy */}
        {Array.from({ length: 14 }).map((_, i) => {
          const cx = (i * 53) % 280 - 140;
          const cy = -120 - (i % 5) * 14;
          const colour = ["#ffd58a", "#7cc89a", "#ffd58a", "#a06aff", "#f472b6"][i % 5];
          return (
            <span key={i} aria-hidden style={{
              position: "absolute",
              left: "50%",
              top: "60%",
              width: 6, height: 10,
              borderRadius: 2,
              background: colour,
              ["--cx" as string]: `${cx}px`,
              ["--cy" as string]: `${cy}px`,
              animation: `lsConfetti ${2.4 + (i % 4) * 0.4}s ease-out ${i * 0.18}s infinite`,
              pointerEvents: "none",
            } as React.CSSProperties} />
          );
        })}

        {/* Trophy + halo */}
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 14px" }}>
          {/* Spinning halo of rays */}
          <span aria-hidden style={{
            position: "absolute", inset: -8,
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.6) 30deg, transparent 60deg, rgba(255,213,138,0.5) 150deg, transparent 200deg, rgba(160,106,255,0.5) 280deg, transparent 320deg)",
            borderRadius: "50%",
            filter: "blur(10px)",
            animation: "lsHaloSpin 8s linear infinite",
          }} />
          {/* Pulsing glow ring */}
          <span aria-hidden style={{
            position: "absolute", inset: 6,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,227,187,0.6), rgba(168,227,187,0) 70%)",
            animation: "lsRayPulse 2.4s ease-in-out infinite",
          }} />
          {/* Trophy SVG */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "lsTrophyFloat 3.6s ease-in-out infinite", transformStyle: "preserve-3d" }}>
            <svg width={88} height={88} viewBox="0 0 88 88">
              <defs>
                <linearGradient id="ls-cup" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="ls-base" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <linearGradient id="ls-shine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              {/* shadow */}
              <ellipse cx="44" cy="80" rx="22" ry="3" fill="rgba(0,0,0,0.45)" />
              {/* base */}
              <rect x="34" y="70" width="20" height="6" rx="1.5" fill="url(#ls-base)" />
              <rect x="28" y="74" width="32" height="5" rx="2" fill="url(#ls-base)" />
              {/* stem */}
              <rect x="40" y="58" width="8" height="14" fill="url(#ls-base)" />
              {/* handles */}
              <path d="M22 30 Q 12 36 16 50 Q 22 58 32 56" fill="none" stroke="url(#ls-cup)" strokeWidth="5" strokeLinecap="round" />
              <path d="M66 30 Q 76 36 72 50 Q 66 58 56 56" fill="none" stroke="url(#ls-cup)" strokeWidth="5" strokeLinecap="round" />
              {/* cup body */}
              <path d="M22 16 L66 16 L62 50 Q 56 60 44 60 Q 32 60 26 50 Z" fill="url(#ls-cup)" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
              {/* shine highlight */}
              <path d="M28 18 L40 18 L36 44 Q 32 50 28 46 Z" fill="url(#ls-shine)" opacity="0.85" />
              {/* check inside cup */}
              <path d="M34 30 L42 38 L56 24" fill="none" stroke="#0b3a2a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {/* sparkles */}
              <circle cx="14" cy="20" r="1.6" fill="#ffd58a" />
              <circle cx="74" cy="22" r="2" fill="#ffd58a" />
              <circle cx="78" cy="44" r="1.4" fill="#ffd58a" />
              <circle cx="10" cy="44" r="1.4" fill="#ffd58a" />
            </svg>
          </div>
        </div>

        <h2 data-split style={{
          color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 4px",
          letterSpacing: 1,
          background: "linear-gradient(135deg, #fde68a, #f59e0b, #7cc89a)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          textShadow: "0 0 30px rgba(245,158,11,0.4)",
        }}>Great job!</h2>

        {/* Stars row — SVG with sequenced pop-in + glow */}
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "8px 0 14px" }}>
          {[0, 1, 2].map((i) => {
            const earned = i < starCount;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.25 + i * 0.18, type: "spring", stiffness: 260, damping: 16 }}
                style={{ position: "relative", width: 44, height: 44 }}
              >
                {earned && (
                  <span aria-hidden style={{
                    position: "absolute", inset: -4, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(253,224,71,0.6), transparent 70%)",
                    animation: "lsRayPulse 1.8s ease-in-out infinite",
                  }} />
                )}
                <svg width={44} height={44} viewBox="0 0 44 44" style={{ position: "relative", filter: earned ? "drop-shadow(0 4px 10px rgba(253,224,71,0.65))" : "none" }}>
                  <defs>
                    <linearGradient id={`ls-star-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={earned ? "#fef3c7" : "#334155"} />
                      <stop offset="50%" stopColor={earned ? "#fbbf24" : "#1f2937"} />
                      <stop offset="100%" stopColor={earned ? "#b45309" : "#0f172a"} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M22 4 L26.7 16.5 L40 17.7 L29.8 26.3 L33 39 L22 32 L11 39 L14.2 26.3 L4 17.7 L17.3 16.5 Z"
                    fill={`url(#ls-star-${i})`}
                    stroke={earned ? "#fde68a" : "#475569"}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  {earned && <path d="M16 14 L20 20 L18 22" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />}
                </svg>
              </motion.div>
            );
          })}
        </div>

        <p style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.6, margin: "0 0 22px", position: "relative", zIndex: 1 }}>{message}</p>

        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ["0 0 20px rgba(249,115,22,0.45)", "0 0 38px rgba(249,115,22,0.85)", "0 0 20px rgba(249,115,22,0.45)"] }}
          transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
          style={{
            position: "relative",
            background: "linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #ffd58a 100%)",
            color: "#1f1300", fontWeight: 900,
            borderRadius: 14, padding: "13px 34px",
            border: "none", cursor: "pointer", fontSize: 16,
            letterSpacing: 1,
            transformStyle: "preserve-3d",
          }}
        >
          Next &rarr;
        </motion.button>
      </div>
    </motion.div>
  );
}

const SpeechBubble = ({ character, message, side = "left", delayMs = 500 }: { character: "adam" | "layla" | "raccoon"; message: string; side?: "left" | "right"; delayMs?: number }) => {
  const img = character === "adam" ? "/characters/adam-layla-happy.png" : character === "layla" ? "/characters/adam-layla-happy.png" : "/characters/raccoon.png";
  const name = character === "adam" ? "Adam" : character === "layla" ? "Layla" : "Raccoon";
  const bubbleColor = character === "raccoon" ? "rgba(239,68,68,0.15)" : "rgba(255,178,110,0.15)";
  const borderColor = character === "raccoon" ? "rgba(239,68,68,0.3)" : "rgba(255,178,110,0.3)";

  // Reveal the bubble 500ms after the screen transition, then play "pop" SFX.
  const [visible, setVisible] = useState(delayMs <= 0);
  useEffect(() => {
    if (delayMs <= 0) {
      playSFX("pop");
      return;
    }
    const id = window.setTimeout(() => {
      setVisible(true);
      playSFX("pop");
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);
  if (!visible) return null;

  return (
    <motion.div
      data-animate
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: side === "right" ? "row-reverse" : "row", margin: "12px 0" }}
    >
      <img src={img} alt={name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: `2px solid ${borderColor}` }} />
      <div style={{ background: bubbleColor, border: `1px solid ${borderColor}`, borderRadius: 16, padding: "10px 16px", maxWidth: 320, fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: character === "raccoon" ? "#ef4444" : "#ff9b4a", display: "block", marginBottom: 4 }}>{name}</span>
        {message}
      </div>
    </motion.div>
  );
};

/* ───────────────────────── MAIN COMPONENT ─────────────────── */

// Save/resume helpers ------------------------------------------------------
// Persist lesson progress in localStorage so a child can quit mid-lesson
// (close the tab, accidentally hit back, etc.) and resume from the same
// screen with their coins/XP/scores intact. We deliberately use
// localStorage rather than a DB write because:
//   1. It works on every page change without an API round-trip.
//   2. Kids share one device per lesson; cross-device sync isn't needed.
//   3. No prisma migration required.
// Keyed per week so future weeks have independent saves.
type SavedLessonState = {
  screen: number;
  coins: number;
  lessonXp: number;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  swipeScore: number;
  phishScore: number;
  wydScore: number;
  bossScore: number;
  bossDone: boolean;
  achievePhase: number;
  revealedRules: number[];
  answeredRules: number[];
  ruleAnswers: Record<number, number | null | undefined>;
  lockedItems: string[];
  savedAt: number;
};
const SAVE_KEY = `algorithmx:lesson:week-${CURRENT_WEEK}:state`;
function loadSavedLesson(): SavedLessonState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedLessonState;
    if (typeof parsed.screen !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
function clearSavedLesson() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(SAVE_KEY); } catch {}
}

export default function LessonPlayer(props: { userName: string; moduleId: string; childName: string }) {
  // The inventory context needs to wrap the whole player so the bar,
  // fly effect, and reveal overlay all share state with the case
  // renderers that fire earn(). The week key is the localStorage
  // namespace for persisted progress.
  return (
    <InventoryProvider weekKey="week-1">
      <LessonPlayerInner {...props} />
    </InventoryProvider>
  );
}

function LessonPlayerInner({ userName, moduleId, childName }: { userName: string; moduleId: string; childName: string }) {
  /* ---------- state ---------- */
  // We only consult the saved state ONCE on mount. The "Save & Exit"
  // button writes to localStorage and navigates away; on next mount the
  // screen below sees the saved state and offers a resume prompt.
  // Read saved state post-hydration to avoid SSR/client mismatch (localStorage doesn't exist server-side)
  const [savedState, setSavedState] = useState<SavedLessonState | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  useEffect(() => {
    const s = loadSavedLesson();
    if (s) {
      setSavedState(s);
      if (s.screen > 0 && s.screen < 18) setShowResumePrompt(true);
    }
  }, []);
  const [screen, setScreen] = useState(0);
  // Dev: jump to a specific case via ?case=N (post-hydration so SSR matches)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("case");
    const n = c ? parseInt(c, 10) : NaN;
    if (Number.isFinite(n)) setScreen(n);
  }, []);

  // Intro cutscene disabled — lesson lands directly on screen 0. The state
  // machine and StoryCutscene render path are kept in case we want to
  // re-enable later; just flip this initial value back to "intro".
  const [cutscene, setCutscene] = useState<"intro" | null>(null);
  const cutsceneSlides = cutscene === "intro" ? WEEK1_INTRO : null;
  const cutsceneTitle: string | undefined = cutscene === "intro"
    ? "WEEK 1: PASSWORDS"
    : undefined;
  const [coins, setCoins] = useState(0);
  const [coinAnimKey, setCoinAnimKey] = useState(0);

  // Dual-character guide state. Each character carries its own line; empty
  // `message` means the character is present with that mood but silent.
  const IDLE_LINE: CharacterLine = { mood: "idle", message: "" };
  const initialReaction = WEEK1_REACTIONS[0];
  const [adamReaction, setAdamReaction] = useState<CharacterLine>(
    initialReaction?.adam ?? IDLE_LINE
  );
  const [laylaReaction, setLaylaReaction] = useState<CharacterLine>(
    initialReaction?.layla ?? IDLE_LINE
  );
  const reactionRestoreRef = useRef<number | null>(null);

  const pickQuip = (list: readonly string[]): string =>
    list[Math.floor(Math.random() * list.length)];

  // Exercise screens: the exercise itself gives feedback (sounds, flashes,
  // particles), so the character guide stays silent — no speech bubble on
  // every correct/wrong. Kids get cluttered otherwise.
  const EXERCISE_SILENT_SCREENS = [3, 4, 5, 6, 7, 8, 9, 11, 13, 14];
  const isExerciseActive = EXERCISE_SILENT_SCREENS.includes(screen);

  /** Briefly override one character's reaction (and give the other a matching
   *  mood) with a correct/wrong quip, then restore the per-screen reaction.
   *  During active exercises the mood still shifts but speech is suppressed. */
  const flashReaction = useCallback(
    (kind: "correct" | "wrong") => {
      // During exercises, skip ENTIRELY — the exercise owns its own feedback
      // (particles, sounds, floating text). Mood flips were causing Adam to
      // re-animate every correct/wrong answer, which read as "Adam keeps
      // coming in and out too frequently". Leave him in his idle pose.
      if (EXERCISE_SILENT_SCREENS.includes(screen)) return;
      if (kind === "correct") {
        const quip = pickQuip(CORRECT_QUIPS);
        // Coin-flip which character speaks; the other shows thumbsup.
        if (Math.random() < 0.5) {
          setAdamReaction({ mood: "thumbsup", message: quip });
          setLaylaReaction({ mood: "thumbsup", message: "" });
        } else {
          setAdamReaction({ mood: "thumbsup", message: "" });
          setLaylaReaction({ mood: "thumbsup", message: quip });
        }
      } else {
        // Spec: Layla speaks the thinking quip, Adam shows thinking mood.
        setAdamReaction({ mood: "thinking", message: "" });
        setLaylaReaction({ mood: "thinking", message: pickQuip(WRONG_QUIPS) });
      }
      if (reactionRestoreRef.current) window.clearTimeout(reactionRestoreRef.current);
      reactionRestoreRef.current = window.setTimeout(() => {
        const fallback = WEEK1_REACTIONS[screen];
        setAdamReaction(fallback?.adam ?? IDLE_LINE);
        // Slight stagger on restore so the two don't animate in lock-step.
        window.setTimeout(
          () => setLaylaReaction(fallback?.layla ?? IDLE_LINE),
          100
        );
      }, 2000);
    },
    [screen]
  );

  // XP / progression state
  const [lessonXp, setLessonXp] = useState(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);
  const xpPopupIdRef = useRef(0);
  const [pendingLevelUp, setPendingLevelUp] = useState<
    { oldRank: RankInfo; newRank: RankInfo; totalXP: number } | null
  >(null);

  // Micro-feedback — particles, floating texts, screen shake, combo counter.
  const [burstList, setBurstList] = useState<
    { id: number; x: number; y: number; colour: string; count: number }[]
  >([]);
  const [floatList, setFloatList] = useState<
    { id: number; text: string; x: number; y: number; colour: string; size: number }[]
  >([]);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [lessonCombo, setLessonCombo] = useState(0);
  const [comboPulseKey, setComboPulseKey] = useState(0);
  const burstIdRef = useRef(0);
  const floatIdRef = useRef(0);

  const spawnParticles = useCallback(
    (x: number, y: number, colour: string = "#7cc89a", count: number = 12) => {
      const id = ++burstIdRef.current;
      setBurstList((prev) => [...prev, { id, x, y, colour, count }]);
    },
    []
  );
  const spawnFloatingText = useCallback(
    (text: string, x: number, y: number, colour: string = "#7cc89a", size: number = 20) => {
      const id = ++floatIdRef.current;
      setFloatList((prev) => [...prev, { id, text, x, y, colour, size }]);
    },
    []
  );
  const triggerShake = useCallback(() => setShakeTrigger((n) => n + 1), []);

  // ── 3D lesson arena backdrop ──
  const [arena3DMood, setArena3DMood] =
    useState<"normal" | "correct" | "wrong" | "celebration">("normal");
  const [arena3DPulseKey, setArena3DPulseKey] = useState(0);
  const arenaMoodTimerRef = useRef<number | null>(null);
  const setArenaMoodBrief = useCallback(
    (m: "correct" | "wrong" | "celebration") => {
      const duration = m === "celebration" ? 2000 : m === "correct" ? 500 : 400;
      setArena3DMood(m);
      if (arenaMoodTimerRef.current)
        window.clearTimeout(arenaMoodTimerRef.current);
      arenaMoodTimerRef.current = window.setTimeout(() => {
        setArena3DMood("normal");
        arenaMoodTimerRef.current = null;
      }, duration);
    },
    []
  );
  useEffect(() => () => {
    if (arenaMoodTimerRef.current)
      window.clearTimeout(arenaMoodTimerRef.current);
  }, []);

  const [windowDim, setWindowDim] = useState<{ w: number; h: number }>(() =>
    typeof window === "undefined"
      ? { w: 1280, h: 720 }
      : { w: window.innerWidth, h: window.innerHeight }
  );
  useEffect(() => {
    const onResize = () =>
      setWindowDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Award XP + particles + floating text + combo tracking + rank-up check. */
  const awardXp = useCallback(
    (amount: number, source: string, element?: HTMLElement | null) => {
      const result = addXP(amount, source);
      setLessonXp((v) => v + amount);
      let x = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
      let y = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
      if (element) {
        const r = element.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      }
      const id = ++xpPopupIdRef.current;
      setXpPopups((prev) => [...prev, { id, x, y, amount }]);
      if (result.leveledUp) {
        setPendingLevelUp({
          oldRank: result.oldRank,
          newRank: result.newRank,
          totalXP: result.newTotal,
        });
      }
      flashReaction("correct");
      setArenaMoodBrief("correct");
      setArena3DPulseKey((k) => k + 1);

      // Micro-feedback: green burst + floating "+N XP" + combo.
      spawnParticles(x, y, "#7cc89a", 12);
      spawnFloatingText(`+${amount} XP`, x, y - 24, "#fbbf24", 20);
      setLessonCombo((prev) => {
        const next = prev + 1;
        setComboPulseKey((k) => k + 1);
        if (next === 3) {
          spawnParticles(x, y, "#fbbf24", 20);
          spawnFloatingText("3x COMBO!", x, y - 60, "#fbbf24", 26);
          playSFX("streak3");
        } else if (next === 5) {
          spawnParticles(x, y, "#fbbf24", 28);
          spawnFloatingText("5x COMBO!", x, y - 60, "#fbbf24", 30);
          playSFX("streak5");
        } else if (next === 7) {
          spawnParticles(x, y, "#fbbf24", 40);
          spawnFloatingText("UNSTOPPABLE!", x, y - 60, "#f97316", 34);
          playSFX("streak7");
        }
        return next;
      });
    },
    [flashReaction, spawnParticles, spawnFloatingText, setArenaMoodBrief]
  );
  const removeXpPopup = useCallback((id: number) => {
    setXpPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCoins = useCallback((n: number) => {
    setCoins((c) => c + n);
    setCoinAnimKey((k) => k + 1);
    animateCoins();
  }, []);

  // Boss-battle entry + defeat sound cues
  const bossAppearFiredRef = useRef(false);
  const bossDefeatedFiredRef = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-animate]", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "back.out(1.7)",
        clearProps: "all",
      });
      document.querySelectorAll("[data-split]").forEach((el) => {
        try {
          const split = SplitText.create(el, { type: "chars,words" });
          gsap.from(split.chars, {
            opacity: 0,
            y: 20,
            rotateX: -90,
            stagger: 0.03,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: 0.2,
          });
        } catch { /* SplitText plugin may be unavailable */ }
      });
    });
    return () => ctx.revert();
  }, [screen]);


  const playSound = useCallback((src: string) => {
    try {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const playTone = useCallback((type: "powerup" | "zap" | "bubble") => {
    try {
      const ctx = new AudioContext();
      if (type === "powerup") {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "sine"; osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
        const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
        osc2.type = "sine"; osc2.frequency.value = 1000;
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.3);
        gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.32);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.45);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.3); osc2.stop(ctx.currentTime + 0.45);
      } else if (type === "zap") {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "square"; osc.frequency.setValueAtTime(900, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else if (type === "bubble") {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = "triangle"; osc.frequency.value = 400;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
        const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
        osc2.type = "triangle"; osc2.frequency.value = 600;
        gain2.gain.setValueAtTime(0, ctx.currentTime + 0.05);
        gain2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.05); osc2.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  }, []);

  // Screen 0, Video welcome
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaMuted, setMediaMuted] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Screen 1, Mission
  const [missionPhase, setMissionPhase] = useState(0);

  // Screen 2, Lock game
  const [lockedItems, setLockedItems] = useState<Set<string>>(new Set());
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number } | null>(null);
  const [lockFlipping, setLockFlipping] = useState<string | null>(null);
  const [lockCelebration, setLockCelebration] = useState(false);
  const [miniConfettiPos, setMiniConfettiPos] = useState<{ x: number; y: number } | null>(null);

  // Screen 3, Quiz 1 (bubble)
  const [q1Idx, setQ1Idx] = useState(0);
  const [q1Score, setQ1Score] = useState(0);

  // Screen 4, Raccoon shield
  const [whyIdx, setWhyIdx] = useState(0);
  const [shieldPos, setShieldPos] = useState<{ x: number; y: number } | null>(null);
  const [shieldDragging, setShieldDragging] = useState(false);
  const [shieldPlaced, setShieldPlaced] = useState(false);
  const [raccoonHitShield, setRaccoonHitShield] = useState(false);
  const [raccoonReaching, setRaccoonReaching] = useState(false);
  const shieldOffset = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const raccoonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Screen 5, Quiz 2 (bubble)
  const [q2Idx, setQ2Idx] = useState(0);
  const [q2Score, setQ2Score] = useState(0);

  // Screen 6, Recipe
  const [addedIngredients, setAddedIngredients] = useState<Set<number>>(new Set());
  const [pouringIdx, setPouringIdx] = useState<number | null>(null);
  const [pourChars, setPourChars] = useState<{ char: string; x: number; delay: number }[]>([]);

  // Screen 7, Builder
  const [builderSlots, setBuilderSlots] = useState<[number, number, number, number]>([-1, -1, -1, -1]);
  const [builderActive, setBuilderActive] = useState(0);
  const [builderPowerUp, setBuilderPowerUp] = useState(false);

  // Screen 8, Swipe
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [swipeScore, setSwipeScore] = useState(0);
  const [swipeFeedback, setSwipeFeedback] = useState<"correct" | "wrong" | null>(null);
  const [swipeFlyDir, setSwipeFlyDir] = useState<"left" | "right" | null>(null);

  // Screen 9, Drag & drop
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragStarted, setDragStarted] = useState(false);
  const [dragTime, setDragTime] = useState(60);
  const [dragDone, setDragDone] = useState(false);
  const [sortStars, setSortStars] = useState(0);
  const [dragFlash, setDragFlash] = useState<"strong" | "weak" | null>(null);
  const strongRef = useRef<HTMLDivElement>(null);
  const weakRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(60);

  // Screen 10, Rules (tap to reveal)
  const [revealedRules, setRevealedRules] = useState<Set<number>>(new Set());
  const [flippingRule, setFlippingRule] = useState<number | null>(null);
  const [answeredRules, setAnsweredRules] = useState<Set<number>>(new Set());
  const [ruleAnswers, setRuleAnswers] = useState<Record<number, number | null>>({});

  // Screen 11, Quiz 3 (bubble)
  const [q3Idx, setQ3Idx] = useState(0);
  const [q3Score, setQ3Score] = useState(0);

  // Screen 12, Phishing (tablet)
  const [phishIdx, setPhishIdx] = useState(0);
  const [phishAnswer, setPhishAnswer] = useState<boolean | null>(null);
  const [phishScore, setPhishScore] = useState(0);
  const [phishStamped, setPhishStamped] = useState(false);
  const [phishExiting, setPhishExiting] = useState(false);

  // Screen 13, WWYD (comic bubbles)
  const [wydIdx, setWydIdx] = useState(0);
  const [wydSel, setWydSel] = useState<number | null>(null);
  const [wydScore, setWydScore] = useState(0);

  // Screen 14, Boss
  const [bossIdx, setBossIdx] = useState(0);
  const [bossSel, setBossSel] = useState<number | null>(null);
  const [bossFeedback, setBossFeedback] = useState<boolean | null>(null);
  const [bossScore, setBossScore] = useState(0);
  const [raccoonHealth, setRaccoonHealth] = useState(100);
  const [bossDone, setBossDone] = useState(false);
  const [showBossBattle, setShowBossBattle] = useState(false);
  const [bossAttackPhase, setBossAttackPhase] = useState(false);
  const [arenaHits, setArenaHits] = useState(0);
  const [arenaRaccoonPos, setArenaRaccoonPos] = useState({ left: 50, top: 30 });
  const [arenaProjectiles, setArenaProjectiles] = useState<{ id: number; tx: number; ty: number; hit: boolean }[]>([]);
  const [arenaShowResult, setArenaShowResult] = useState(false);
  const [arenaRaccoonAnim, setArenaRaccoonAnim] = useState<"idle" | "hit" | "taunt" | "defeat">("idle");
  const [arenaTimeLeft, setArenaTimeLeft] = useState(12);
  const [arenaEffect, setArenaEffect] = useState<"hit" | "miss" | "super" | null>(null);
  const arenaProjectileId = useRef(0);
  const arenaLastShot = useRef(0);
  const arenaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const arenaMoveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Screen 15, Achievements
  const [achievePhase, setAchievePhase] = useState(0);

  // Screen 16, Certificate
  const progressPosted = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Screen 12, Phishing explainer
  const [trickCard, setTrickCard] = useState(0);

  // Screen 18, Outro video
  const [outroFailed, setOutroFailed] = useState(false);

  // Global instruction/summary states
  const [showInstr, setShowInstr] = useState<Record<number, boolean>>({});
  const [showSummary, setShowSummary] = useState<Record<number, boolean>>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, number>>({});

  // Fire boss-appear once when the boss battle actually begins (not instr/summary/done)
  useEffect(() => {
    if (screen !== 15) {
      bossAppearFiredRef.current = false;
      return;
    }
    if (showInstr[15] || showSummary[15] || bossDone) return;
    if (bossAppearFiredRef.current) return;
    bossAppearFiredRef.current = true;
    playSFX("boss-appear");
  }, [screen, showInstr, showSummary, bossDone]);

  // Fire boss-defeated + celebratory cascade once when the boss is defeated
  useEffect(() => {
    if (!bossDone) {
      bossDefeatedFiredRef.current = false;
      return;
    }
    if (bossDefeatedFiredRef.current) return;
    bossDefeatedFiredRef.current = true;
    playSFX("boss-defeated");
    void bossDefeatedExplosion();
  }, [bossDone]);

  // Lesson intro: lesson-start cue on first mount. BGM is deferred until the
  // learner advances past the intro video (screen >= 2) so music doesn't
  // compete with the video audio.
  useEffect(() => {
    playSFX("lessonStart");
    return () => {
      stopBGM(400);
    };
  }, []);

  const bgmStartedRef = useRef(false);
  useEffect(() => {
    if (cutscene) return; // cutscenes have their own audio
    if (!bgmStartedRef.current && screen >= 2) {
      bgmStartedRef.current = true;
      playBGM("bgmLesson");
    }
  }, [screen, cutscene]);

  // Pause BGM during the intro cutscene. Resumes after it ends and the
  // learner is past the video intro (screen >= 2).
  useEffect(() => {
    if (cutscene) {
      stopBGM(300);
      bgmStartedRef.current = false;
    }
  }, [cutscene]);

  // Reveal chime on screen change. SpeechBubble instances fire their own
  // "pop" SFX 500ms after they mount, so this effect doesn't need to.
  const prevScreenRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevScreenRef.current !== null && prevScreenRef.current !== screen) {
      playSFX("reveal");
    }
    prevScreenRef.current = screen;
  }, [screen]);

  // Per-screen character guide reaction: wait 500ms after transition, then set.
  // Layla is delayed another 100ms so Adam and Layla stagger their exit/enter.
  useEffect(() => {
    if (reactionRestoreRef.current) {
      window.clearTimeout(reactionRestoreRef.current);
      reactionRestoreRef.current = null;
    }
    const next = WEEK1_REACTIONS[screen];
    if (!next) return;
    const delay = next.delay ?? 500;
    const idAdam = window.setTimeout(
      () => setAdamReaction(next.adam ?? IDLE_LINE),
      delay
    );
    const idLayla = window.setTimeout(
      () => setLaylaReaction(next.layla ?? IDLE_LINE),
      delay + 100
    );
    return () => {
      window.clearTimeout(idAdam);
      window.clearTimeout(idLayla);
    };
  }, [screen]);

  // Lesson complete: screen 17 is the certificate screen. Stop the lesson BGM
  // and fire the completion cue exactly once per entry.
  const lessonCompleteFiredRef = useRef(false);
  useEffect(() => {
    if (screen !== 17) {
      lessonCompleteFiredRef.current = false;
      return;
    }
    if (lessonCompleteFiredRef.current) return;
    lessonCompleteFiredRef.current = true;
    stopBGM(600);
    playSFX("lessonComplete");
  }, [screen]);

  // Victory (case 16) + Certificate/Graduation (case 17) cues — fire once per entry
  const victoryFiredRef = useRef(false);
  const certFiredRef = useRef(false);
  useEffect(() => {
    if (screen !== 16) victoryFiredRef.current = false;
    if (screen !== 17) certFiredRef.current = false;
    if (screen === 16 && !victoryFiredRef.current) {
      victoryFiredRef.current = true;
      playSFX("level-up");
    }
    if (screen === 17 && !certFiredRef.current) {
      certFiredRef.current = true;
      playSFX("celebration");
      void badgeEarnedCelebration();
      void milestoneFireworks();
    }
  }, [screen]);

  /* ---------- navigation ---------- */
  const navigate = useCallback((to: number) => {
    playSFX("transition");
    switch (to) {
      case 0:
        setVideoEnded(false); setVideoFailed(false); setShowSkip(false);
        setIsPlaying(false); setMediaProgress(0);
        break;
      case 1:
        setMissionPhase(0);
        break;
      case 2:
        setLockedItems(new Set()); setSparklePos(null); setLockFlipping(null); setLockCelebration(false); setMiniConfettiPos(null);
        break;
      case 3:
        setQ1Idx(0); setQ1Score(0);
        break;
      case 4:
        setWhyIdx(0); setShieldPos(null); setShieldDragging(false); setShieldPlaced(false); setRaccoonHitShield(false); setRaccoonReaching(false);
        break;
      case 5:
        setQ2Idx(0); setQ2Score(0);
        break;
      case 6:
        setAddedIngredients(new Set()); setPouringIdx(null); setPourChars([]);
        break;
      case 7:
        setBuilderSlots([-1, -1, -1, -1]); setBuilderActive(0); setBuilderPowerUp(false);
        break;
      case 8:
        setSwipeIdx(0); setSwipeScore(0); setSwipeFlyDir(null); setSwipeFeedback(null);
        break;
      case 9:
        setPlaced(new Set()); setDragging(null); setDragStarted(false);
        setDragTime(60); timeRef.current = 60; setDragDone(false); setSortStars(0); setDragFlash(null);
        break;
      case 10:
        setRevealedRules(new Set()); setFlippingRule(null); setAnsweredRules(new Set()); setRuleAnswers({});
        break;
      case 11:
        setQ3Idx(0); setQ3Score(0);
        break;
      case 12:
        setTrickCard(0);
        break;
      case 13:
        setPhishIdx(0); setPhishAnswer(null); setPhishScore(0); setPhishStamped(false); setPhishExiting(false);
        break;
      case 14:
        setWydIdx(0); setWydSel(null); setWydScore(0);
        break;
      case 15:
        setBossIdx(0); setBossSel(null); setBossFeedback(null);
        setBossScore(0); setRaccoonHealth(100); setBossDone(false);
        setShowBossBattle(false);
        setBossAttackPhase(false); setArenaHits(0);
        setArenaRaccoonPos({ left: 50, top: 30 }); setArenaProjectiles([]);
        setArenaShowResult(false); setArenaRaccoonAnim("idle"); setArenaTimeLeft(12);
        break;
      case 16:
        setAchievePhase(0);
        break;
      case 17:
        setShowConfetti(true);
        break;
    }
    playSFX("transition");
    // Track direction for slide transitions.
    setScreen((prev) => {
      navDirectionRef.current = to < prev ? "back" : "forward";
      return to;
    });
    if ([2,3,4,5,6,7,8,9,10,11,13,14,15].includes(to)) {
      setShowInstr((prev) => ({ ...prev, [to]: true }));
    }
  }, []);

  // Direction ref for ScreenTransition — set by navigate() before screen change.
  const navDirectionRef = useRef<"forward" | "back">("forward");

  // Keyboard navigation: Right Arrow = next, Left Arrow = back.
  // Keyboard arrow navigation between lesson screens is intentionally
  // DISABLED. Exercises (ProtectTheData shield, CyberMaze movement,
  // CrackTheCode dials, FirewallBuilder paddle, etc.) use arrow keys for
  // gameplay, and the global lesson navigator was hijacking those
  // presses and skipping the player out of the active exercise. The
  // lesson is meant to progress in order via the on-screen buttons —
  // there's no scenario where jumping forward by keyboard is correct.
  // Re-introduce only behind a modifier (e.g. Shift+Arrow) if you ever
  // need a debug-style shortcut, never bare arrow keys.

  const dismissInstr = useCallback((scr: number) => {
    setShowInstr((prev) => ({ ...prev, [scr]: false }));
  }, []);

  const { earn: earnInventoryItem } = useInventory();

  /** Trigger the Reveal-Then-Earn beat for a screen — flies the
   *  earned item from viewport-centre into its inventory slot, then
   *  pops the Adam/Layla "did you know" line. Safe to call multiple
   *  times for the same screen (no-op if already earned). */
  const triggerEarnForScreen = useCallback(
    (scr: number) => {
      const item = getItemForScreen(scr);
      if (!item) return;
      const cx = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
      const cy = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
      earnInventoryItem(item.id, cx, cy);
    },
    [earnInventoryItem]
  );

  const showLearnSummary = useCallback((scr: number) => {
    setShowSummary((prev) => ({ ...prev, [scr]: true }));
    // Trigger the inventory earn beat slightly after the LearnSummary
    // card pops so the fly visibly originates from the celebration.
    window.setTimeout(() => triggerEarnForScreen(scr), 320);
  }, [triggerEarnForScreen]);

  const dismissSummary = useCallback((scr: number, nextStep: number) => {
    setShowSummary((prev) => ({ ...prev, [scr]: false }));
    // Exercise complete — flash the arena into celebration mode briefly.
    setArenaMoodBrief("celebration");
    navigate(nextStep);
  }, [navigate, setArenaMoodBrief]);

  const addWrong = useCallback((scr: number) => {
    setWrongAttempts((prev) => ({ ...prev, [scr]: (prev[scr] || 0) + 1 }));
    flashReaction("wrong");
    setArenaMoodBrief("wrong");
    // Reset combo + shake on any wrong answer.
    setLessonCombo(0);
    triggerShake();
  }, [flashReaction, triggerShake, setArenaMoodBrief]);

  const getStars = useCallback((scr: number) => {
    const w = wrongAttempts[scr] || 0;
    return w === 0 ? 3 : w <= 2 ? 2 : 1;
  }, [wrongAttempts]);

  /* ---------- effects ---------- */

  // Screen 0: auto-play video & show skip after 10s.
  // Must NOT run while a cutscene is active, otherwise the intro video
  // plays under the cutscene (audible but unseen).
  useEffect(() => {
    if (screen !== 0) return;
    if (cutscene !== null) return;
    const v = videoRef.current;
    if (v) {
      v.play().then(() => setIsPlaying(true)).catch(() => { /* blocked */ });
    }
    const t = setTimeout(() => setShowSkip(true), 10000);
    return () => clearTimeout(t);
  }, [screen, cutscene]);

  // Pause any playing video whenever a cutscene takes over the screen.
  useEffect(() => {
    if (cutscene === null) return;
    const v = videoRef.current;
    if (v && !v.paused) {
      v.pause();
      setIsPlaying(false);
    }
  }, [cutscene]);

  // Screen 1: mission phases with bounce timing
  useEffect(() => {
    if (screen !== 1) return;
    if (missionPhase >= 3) return;
    const t = setTimeout(() => setMissionPhase((p) => p + 1), 600);
    return () => clearTimeout(t);
  }, [screen, missionPhase]);

  // Screen 4: raccoon timer, reset when scenario changes
  useEffect(() => {
    if (screen !== 4) return;
    if (shieldPlaced || raccoonHitShield) return;
    setRaccoonReaching(false);
    const speed = [3000, 2500, 2000][whyIdx] || 2000;
    raccoonTimerRef.current = setTimeout(() => {
      if (!shieldPlaced) setRaccoonReaching(true);
    }, speed);
    return () => { if (raccoonTimerRef.current) clearTimeout(raccoonTimerRef.current); };
  }, [screen, whyIdx, shieldPlaced, raccoonHitShield]);

  // Screen 4: raccoon reaching, reset
  useEffect(() => {
    if (!raccoonReaching) return;
    const t = setTimeout(() => {
      setRaccoonReaching(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [raccoonReaching]);

  // Screen 4: shield pointer events
  useEffect(() => {
    if (!shieldDragging) return;
    const onMove = (e: PointerEvent) => {
      setShieldPos({ x: e.clientX - shieldOffset.current.x, y: e.clientY - shieldOffset.current.y });
    };
    const onUp = (e: PointerEvent) => {
      setShieldDragging(false);
      const itemEl = itemRef.current;
      if (!itemEl) return;
      const rect = itemEl.getBoundingClientRect();
      const cx = e.clientX, cy = e.clientY;
      if (cx >= rect.left - 30 && cx <= rect.right + 30 && cy >= rect.top - 30 && cy <= rect.bottom + 30) {
        if (raccoonTimerRef.current) clearTimeout(raccoonTimerRef.current);
        setShieldPlaced(true);
        playSFX("correct");
        addCoins(10);
        awardXp(50, "lesson-week-1");
        setTimeout(() => playSFX("xpGain"), 500);
        setTimeout(() => {
          setRaccoonHitShield(true);
        }, 500);
      } else {
        setShieldPos(null);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [shieldDragging, whyIdx, addCoins, playSound]);

  // Screen 9: drag listeners
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      setDragX(e.clientX - dragOffset.current.x);
      setDragY(e.clientY - dragOffset.current.y);
    };
    const onUp = (e: PointerEvent) => {
      const pw = PASSWORDS_8.find((p) => p.id === dragging);
      if (!pw) { setDragging(null); return; }
      const sRect = strongRef.current?.getBoundingClientRect();
      const wRect = weakRef.current?.getBoundingClientRect();
      const cx = e.clientX, cy = e.clientY;
      let correct = false;
      if (sRect && cx >= sRect.left && cx <= sRect.right && cy >= sRect.top && cy <= sRect.bottom) {
        correct = pw.isStrong;
        if (correct) { setDragFlash("strong"); setTimeout(() => setDragFlash(null), 500); }
      } else if (wRect && cx >= wRect.left && cx <= wRect.right && cy >= wRect.top && cy <= wRect.bottom) {
        correct = !pw.isStrong;
        if (correct) { setDragFlash("weak"); setTimeout(() => setDragFlash(null), 500); }
      }
      if (correct) {
        setPlaced((prev) => { const n = new Set(prev); n.add(pw.id); return n; });
        playSFX("correct");
        awardXp(50, "lesson-week-1");
      } else if (sRect && cx >= sRect.left && cx <= sRect.right && cy >= sRect.top && cy <= sRect.bottom ||
                 wRect && cx >= wRect.left && cx <= wRect.right && cy >= wRect.top && cy <= wRect.bottom) {
        playSFX("wrong");
      }
      setDragging(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, playSound]);

  // Screen 9: timer
  useEffect(() => {
    if (screen !== 9 || !dragStarted || dragDone) return;
    timerRef.current = setInterval(() => {
      timeRef.current -= 1;
      setDragTime(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current!);
        setDragDone(true);
        addCoins(25);
        const elapsed = 60 - timeRef.current;
        setSortStars(elapsed < 30 ? 3 : elapsed < 45 ? 2 : 1);
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, dragStarted, dragDone, addCoins]);

  // Screen 9: check completion
  useEffect(() => {
    if (screen !== 9) return;
    if (placed.size === 8 && !dragDone) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDragDone(true);
      addCoins(25);
      const elapsed = 60 - timeRef.current;
      setSortStars(elapsed < 30 ? 3 : elapsed < 45 ? 2 : 1);
    }
  }, [placed, screen, dragDone, addCoins]);

  // Screen 16 ("You Did It!"): staggered achievement reveal. Was guarded by
  // `screen !== 15` which never fires on screen 16 — so the list stayed
  // hidden and the Next button (gated on achievePhase >= 8) never showed.
  useEffect(() => {
    if (screen !== 16) return;
    if (achievePhase >= 8) return;
    const t = setTimeout(() => setAchievePhase((p) => p + 1), 450);
    return () => clearTimeout(t);
  }, [screen, achievePhase]);

  // Screen 16: post progress
  useEffect(() => {
    if (screen !== 16 || progressPosted.current) return;
    progressPosted.current = true;
    playSFX("xpGain");
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    }).catch(() => { /* ignore */ });
  }, [screen, moduleId, playSound]);

  // Autosave the lesson state to localStorage on every change. We
  // serialise Set/object state to JSON-friendly arrays. Once the player
  // reaches the certificate/outro screen (17/18) we wipe the save so a
  // fresh visit starts clean. While we're still mid-lesson, every step
  // gets persisted so closing the tab loses no progress.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (showResumePrompt) return; // don't overwrite the saved state until user decides
    if (screen >= 17) {
      clearSavedLesson();
      return;
    }
    const data: SavedLessonState = {
      screen,
      coins,
      lessonXp,
      q1Score,
      q2Score,
      q3Score,
      swipeScore,
      phishScore,
      wydScore,
      bossScore,
      bossDone,
      achievePhase,
      revealedRules: Array.from(revealedRules),
      answeredRules: Array.from(answeredRules),
      ruleAnswers,
      lockedItems: Array.from(lockedItems),
      savedAt: Date.now(),
    };
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch { /* quota — ignore */ }
  }, [
    showResumePrompt,
    screen, coins, lessonXp,
    q1Score, q2Score, q3Score, swipeScore, phishScore, wydScore, bossScore,
    bossDone, achievePhase,
    revealedRules, answeredRules, ruleAnswers, lockedItems,
  ]);

  const resumeFromSaved = useCallback(() => {
    if (!savedState) return;
    setScreen(savedState.screen);
    setCoins(savedState.coins);
    setLessonXp(savedState.lessonXp);
    setQ1Score(savedState.q1Score);
    setQ2Score(savedState.q2Score);
    setQ3Score(savedState.q3Score);
    setSwipeScore(savedState.swipeScore);
    setPhishScore(savedState.phishScore);
    setWydScore(savedState.wydScore);
    setBossScore(savedState.bossScore);
    setBossDone(savedState.bossDone);
    setAchievePhase(savedState.achievePhase);
    setRevealedRules(new Set(savedState.revealedRules));
    setAnsweredRules(new Set(savedState.answeredRules));
    setRuleAnswers(savedState.ruleAnswers as Record<number, number | null>);
    setLockedItems(new Set(savedState.lockedItems));
    setShowResumePrompt(false);
  }, [savedState]);

  const startFreshFromSaved = useCallback(() => {
    clearSavedLesson();
    setShowResumePrompt(false);
  }, []);

  const saveAndExit = useCallback(() => {
    // The autosave already wrote the latest state. Just navigate home.
    if (typeof window !== "undefined") window.location.href = "/dashboard";
  }, []);

  /* ---------- arena boss battle handler ---------- */
  const randomRaccoonPos = useCallback(() => ({
    left: 15 + Math.random() * 70,
    top: 10 + Math.random() * 45,
  }), []);

  const MAX_ARENA_HITS = 15;
  const getArenaDamage = (hits: number) => {
    return Math.min(15, Math.round((hits / MAX_ARENA_HITS) * 15));
  };

  const handleArenaFire = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (arenaShowResult) return;
    const now = Date.now();
    if (now - arenaLastShot.current < 300) return;
    arenaLastShot.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;
    const raccoonX = (arenaRaccoonPos.left / 100) * rect.width;
    const raccoonY = (arenaRaccoonPos.top / 100) * rect.height;
    const dist = Math.sqrt((tapX - raccoonX) ** 2 + (tapY - raccoonY) ** 2);
    const isHit = dist < 90;
    const id = arenaProjectileId.current++;
    const tx = tapX - rect.width / 2;
    const ty = tapY - rect.height;

    setArenaProjectiles((prev) => [...prev, { id, tx, ty, hit: isHit }]);
    setTimeout(() => setArenaProjectiles((prev) => prev.filter((p) => p.id !== id)), 500);

    if (isHit) {
      setArenaHits((h) => h + 1);
      setArenaRaccoonAnim("hit");
      playTone("zap");
      addCoins(2);
      setTimeout(() => setArenaRaccoonAnim("idle"), 400);
    }
  }, [arenaShowResult, arenaRaccoonPos, playSound, addCoins]);

  // Arena: init + timer + raccoon movement
  useEffect(() => {
    if (!bossAttackPhase) return;
    setArenaHits(0);
    setArenaRaccoonPos(randomRaccoonPos());
    setArenaProjectiles([]);
    setArenaShowResult(false);
    setArenaRaccoonAnim("idle");
    setArenaTimeLeft(12);
    arenaLastShot.current = 0;

    // Countdown timer
    arenaTimerRef.current = setInterval(() => {
      setArenaTimeLeft((t) => {
        if (t <= 1) {
          if (arenaTimerRef.current) clearInterval(arenaTimerRef.current);
          if (arenaMoveRef.current) clearInterval(arenaMoveRef.current);
          setTimeout(() => setArenaShowResult(true), 300);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Raccoon moves every 1.5s (pauses 1s at each spot)
    arenaMoveRef.current = setInterval(() => {
      setArenaRaccoonPos({ left: 15 + Math.random() * 70, top: 10 + Math.random() * 45 });
    }, 1500);

    return () => {
      if (arenaTimerRef.current) clearInterval(arenaTimerRef.current);
      if (arenaMoveRef.current) clearInterval(arenaMoveRef.current);
    };
  }, [bossAttackPhase, randomRaccoonPos]);

  const finishArenaRound = useCallback(() => {
    const damage = getArenaDamage(arenaHits);
    setRaccoonHealth((h) => Math.max(0, h - damage));
    setBossAttackPhase(false);
    setArenaShowResult(false);
    const newHealth = raccoonHealth - damage;
    if (newHealth <= 0 || bossIdx >= BOSS_QUIZ.length - 1) {
      setTimeout(() => setBossDone(true), 500);
    } else {
      setTimeout(() => {
        setBossSel(null);
        setBossFeedback(null);
        setBossIdx((i) => i + 1);
      }, 500);
    }
  }, [arenaHits, raccoonHealth, bossIdx]);

  /* ---------- getScreenVariants ---------- */
  const getScreenVariants = (s: number) => {
    if (s === 15 || s === 16) return popInVariants;
    if (s === 14) return fadeZoomVariants;
    if ([3, 5, 11].includes(s)) return slideUpVariants;
    return screenVariants;
  };

  /* ---------- renderScreen ---------- */
  const renderScreen = () => {
    switch (screen) {

      /* ──── CASE 0: VIDEO WELCOME ──── */
      case 0:
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a1a 0%, #1a0612 100%)">
          <div style={{ textAlign: "center" }}>
            {!videoEnded ? (
              <>
                {!videoFailed ? (
                  <motion.div
                    animate={{ boxShadow: ["0 0 20px rgba(255,178,110,0.3)", "0 0 40px rgba(255,178,110,0.6)", "0 0 20px rgba(255,178,110,0.3)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "2px solid rgba(255,178,110,0.4)", maxWidth: 640, margin: "0 auto" }}
                  >
                    <video
                      ref={videoRef}
                      src="/videos/module-01-intro.mp4"
                      muted={mediaMuted}
                      onError={() => setVideoFailed(true)}
                      onEnded={() => setVideoEnded(true)}
                      onTimeUpdate={() => {
                        const v = videoRef.current;
                        if (v) { setMediaProgress(v.currentTime); setMediaDuration(v.duration || 0); }
                      }}
                      onLoadedMetadata={() => {
                        const v = videoRef.current;
                        if (v) setMediaDuration(v.duration);
                      }}
                      style={{ width: "100%", display: "block", borderRadius: 24 }}
                      playsInline
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => {
                        const v = videoRef.current;
                        if (v) { if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); } }
                      }} style={{
                        width: 44, height: 44, borderRadius: "50%", background: GRAD, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18,
                      }}>
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                      <input
                        type="range" min={0} max={mediaDuration || 1} step={0.1} value={mediaProgress}
                        onChange={(e) => { const v = videoRef.current; if (v) v.currentTime = Number(e.target.value); }}
                        style={{ flex: 1, accentColor: "#ff9b4a", height: 6 }}
                      />
                      <button onClick={() => setMediaMuted((m) => !m)} style={{
                        width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", fontSize: 16,
                      }}>
                        {mediaMuted ? "🔇" : "🔊"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <motion.img
                      src="/characters/adam-layla-hacked.png"
                      alt="Adam and Layla"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        maxWidth: "90%",
                        width: "100%",
                        height: "auto",
                        maxHeight: "50vh",
                        margin: "0 auto",
                        display: "block",
                        borderRadius: 24,
                      }}
                    />
                    <p style={{ color: "#9ca3af", marginTop: 12, fontSize: 18 }}>Video coming soon!</p>
                  </div>
                )}
                {showSkip && !videoEnded && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 16 }}
                  >
                    {btn("Skip video →", () => setVideoEnded(true))}
                  </motion.div>
                )}
              </>
            ) : (
              <WelcomeScene onContinue={() => { triggerEarnForScreen(0); navigate(1); }} />
            )}
          </div>
          </FullScene>
        );

      /* ──── CASE 1: THE MISSION ──── */
      case 1: {
        const missions = [
          { icon: "🔐", text: "Learn what passwords are", colour: "#ffd58a", glow: "rgba(255,213,138,0.55)" },
          { icon: "🛡️", text: "Build a super strong password", colour: "#a06aff", glow: "rgba(160,106,255,0.55)" },
          { icon: "🦝", text: "Defeat the Hacker Raccoon", colour: "#f59e0b", glow: "rgba(245,158,11,0.6)" },
        ];
        return (
          <FullScene bg="linear-gradient(180deg, #1a0a0a 0%, #1a0612 100%)" glow="radial-gradient(circle, rgba(239,68,68,0.3), transparent)">
            <MissionBriefScene
              phase={missionPhase}
              missions={missions}
              onAccept={() => { playTone("powerup"); triggerEarnForScreen(1); navigate(2); }}
            />
          </FullScene>
        );
      }

      /* ──── CASE 2: INTERACTIVE LOCK GAME ──── */
      case 2:
        if (showInstr[2]) return <InstructionOverlay icon="🔒" story="The Raccoon is trying to get into Adam and Layla's stuff!" instructions="Tap each item to lock it with a password! Can you lock all three?" onReady={() => dismissInstr(2)} />;
        if (showSummary[2]) return <LearnSummary message="You learned that passwords LOCK your stuff! Just like a key locks a door, a password keeps your games and photos safe." starCount={getStars(2)} onNext={() => dismissSummary(2, 3)} />;
        return (
          <ExerciseFrame variant="dusk" plate={false}>
          <style>{`
            @keyframes lockCardShimmer { 0% { transform: translateX(-150%) skewX(-18deg); } 100% { transform: translateX(250%) skewX(-18deg); } }
            @keyframes lockCardFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes lockBurstSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <div style={{ textAlign: "center", perspective: "1400px", fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif" }}>
            <div style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: 5,
              color: "#ffd58a",
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "5px 16px",
              background: "rgba(40, 18, 38, 0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: 999,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "rgba(255, 220, 180, 0.4)",
              marginBottom: 8,
            }}>
              ✦ Lesson 1 of 3 ✦
            </div>
            <h1 data-split style={{
              fontSize: 40,
              fontWeight: 900,
              margin: "4px 0 6px",
              background: "linear-gradient(135deg, #ffd58a, #ff9b4a, #d4733a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 0.5,
              textShadow: "0 4px 18px rgba(80, 30, 10, 0.55)",
            }}>What is a Password?</h1>
            <p style={{ color: "#ffe9c8", marginBottom: 8, fontSize: 16, opacity: 0.9, fontWeight: 500 }}>Tap each item to lock it with a password!</p>
            <p style={{
              color: "#ffd58a",
              fontSize: 18,
              fontWeight: 800,
              marginBottom: 16,
              letterSpacing: 1,
              filter: "drop-shadow(0 0 12px rgba(255, 200, 110, 0.5))",
            }}>🔒 {lockedItems.size}/3</p>
            <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap", marginBottom: 24, perspective: "1400px" }}>
              {LOCK_ITEMS.map((item, idx) => {
                const locked = lockedItems.has(item.id);
                const flipping = lockFlipping === item.id;
                const accent = item.id === "gaming" ? { c1: "#ff9b4a", c2: "#d4733a", glow: "rgba(255, 155, 74, 0.5)" }
                  : item.id === "tablet" ? { c1: "#a06aff", c2: "#7a3a52", glow: "rgba(160, 106, 255, 0.5)" }
                  : { c1: "#ffd158", c2: "#d48a18", glow: "rgba(255, 209, 88, 0.55)" };
                const baseTilt = idx === 0 ? -3 : idx === 2 ? 3 : 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 40, rotateX: 12 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: idx * 0.12, type: "spring", stiffness: 220, damping: 22 }}
                    whileHover={!locked && !flipping ? { scale: 1.06, rotateY: 6, rotateX: -3, z: 30 } : {}}
                    whileTap={!locked && !flipping ? { scale: 0.96 } : {}}
                    style={{ transformStyle: "preserve-3d", transform: `rotateY(${baseTilt}deg)` }}
                    onClick={(e) => {
                      if (locked || flipping) return;
                      setLockFlipping(item.id);
                      playSFX("lock");
                      setTimeout(() => {
                        setLockedItems((prev) => {
                          const n = new Set(prev);
                          n.add(item.id);
                          if (n.size === 3) {
                            setTimeout(() => {
                              setLockCelebration(true);
                              setMiniConfettiPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                              addCoins(25);
                              playSFX("xpGain");
                              setTimeout(() => setMiniConfettiPos(null), 1000);
                            }, 400);
                          }
                          return n;
                        });
                        setLockFlipping(null);
                        setSparklePos({ x: e.clientX, y: e.clientY });
                        setTimeout(() => setSparklePos(null), 700);
                      }, 600);
                    }}
                  >
                    <motion.div
                      animate={flipping ? { rotateY: [0, 180, 360] } : {}}
                      transition={{ duration: 0.6 }}
                      style={{
                        position: "relative",
                        width: 200, minHeight: 270,
                        borderRadius: 24,
                        padding: "22px 18px",
                        cursor: locked ? "default" : "pointer",
                        background: locked
                          ? "linear-gradient(160deg, rgba(124, 200, 154, 0.18) 0%, rgba(40, 18, 38, 0.78) 50%, rgba(74, 154, 106, 0.18) 100%)"
                          : `linear-gradient(160deg, ${accent.c1}22 0%, rgba(40, 18, 38, 0.82) 50%, ${accent.c2}22 100%)`,
                        borderStyle: "solid",
                        borderWidth: 2,
                        borderColor: locked ? "rgba(124, 200, 154, 0.6)" : `${accent.c1}66`,
                        boxShadow: locked
                          ? "0 30px 60px -20px rgba(74, 154, 106, 0.55), inset 0 0 0 1px rgba(124, 200, 154, 0.3), 0 0 40px rgba(124, 200, 154, 0.3)"
                          : `0 30px 60px -20px ${accent.glow}, inset 0 0 0 1px ${accent.c1}33, 0 0 36px ${accent.glow}`,
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        overflow: "hidden",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Shimmer light streak */}
                      {!locked && (
                        <span aria-hidden style={{
                          position: "absolute", top: 0, left: 0, width: "60%", height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                          animation: "lockCardShimmer 4.5s ease-in-out infinite",
                          pointerEvents: "none",
                        }} />
                      )}

                      {/* Big device illustration */}
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, transform: "translateZ(20px)" }}>
                        <DeviceIllustration kind={item.id as "gaming" | "tablet" | "school"} c1={accent.c1} c2={accent.c2} locked={locked} />
                      </div>

                      <div style={{ fontSize: 18, color: "#fff7e6", fontWeight: 900, marginBottom: 6, letterSpacing: 0.5 }}>{item.label}</div>

                      {/* Lock pill */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 999,
                        background: locked ? "rgba(124, 200, 154, 0.22)" : "rgba(196, 81, 58, 0.18)",
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderColor: locked ? "rgba(124, 200, 154, 0.6)" : "rgba(196, 81, 58, 0.55)",
                        marginBottom: 8,
                      }}>
                        <motion.div
                          animate={flipping ? { rotate: 360, scale: [1, 1.4, 1] } : {}}
                          transition={{ duration: 0.6 }}
                          style={{ display: "inline-flex" }}
                        >
                          {locked ? <IconLock size={16} color="#7cc89a" /> : <IconUnlock size={16} color="#f08e7e" />}
                        </motion.div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: locked ? "#a8e3bb" : "#f4a89a", letterSpacing: 1, textTransform: "uppercase" }}>
                          {locked ? "Secure" : "Unlocked"}
                        </span>
                      </div>

                      {!locked && !flipping && (
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          color: "#ffd58a", fontSize: 12, fontWeight: 800, letterSpacing: 1,
                          animation: "lockCardFloat 1.6s ease-in-out infinite",
                          textShadow: `0 0 10px ${accent.glow}`,
                        }}>
                          <span style={{ fontSize: 18 }}>▾</span> TAP TO LOCK
                        </div>
                      )}
                      {locked && (
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ color: "#a8e3bb", fontSize: 12, fontWeight: 600, margin: 0, lineHeight: 1.4 }}
                        >
                          {item.message}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
            {sparklePos && <SparkleBurst x={sparklePos.x} y={sparklePos.y} big />}
            {miniConfettiPos && <MiniConfetti x={miniConfettiPos.x} y={miniConfettiPos.y} />}
            <AnimatePresence>
              {lockedItems.size === 3 && lockCelebration && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <div style={{
                    maxWidth: 460,
                    margin: "0 auto",
                    padding: "22px 26px",
                    background: "rgba(40, 18, 38, 0.72)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "rgba(255, 220, 180, 0.4)",
                    borderRadius: 22,
                    boxShadow: "0 30px 60px -20px rgba(20, 6, 12, 0.7)",
                    color: "#fff7e6",
                    textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: 11,
                      letterSpacing: 5,
                      color: "#ffd58a",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}>
                      ✦ All Locked ✦
                    </div>
                    <h2 style={{
                      fontSize: 26,
                      margin: "0 0 10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "linear-gradient(135deg, #ffd58a, #ff9b4a, #d4733a)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 900,
                    }}>
                      <SuccessBurst size={28} colourA="#ffd158" colourB="#ff9b4a" />
                      You did it!
                    </h2>
                    <p style={{ color: "#ffe9c8", marginBottom: 14, fontSize: 15, opacity: 0.92, lineHeight: 1.45 }}>
                      A password is like a key that locks your digital stuff so only YOU can open it!
                    </p>
                    <div style={{
                      borderStyle: "solid",
                      borderWidth: 1,
                      borderColor: "rgba(255, 215, 138, 0.55)",
                      borderRadius: 14,
                      padding: "10px 14px",
                      marginBottom: 18,
                      background: "rgba(255, 215, 138, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      justifyContent: "center",
                    }}>
                      <SuccessBurst size={20} colourA="#ffd158" colourB="#ff9b4a" />
                      <p style={{ color: "#ffd58a", fontSize: 13, margin: 0, fontWeight: 600 }}>
                        Fun fact — the first computer password was created in 1961!
                      </p>
                    </div>
                    {btn("Got it! Quiz time! →", () => showLearnSummary(2))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </ExerciseFrame>
        );

      /* ──── CASE 3: CYBER SCANNER (strong vs weak passwords) ──── */
      case 3: {
        if (showSummary[3]) return <LearnSummary message="You can spot a strong password in a flash! Mixed characters beat easy guesses." starCount={getStars(3)} onNext={() => dismissSummary(3, 4)} />;
        return (
          <ExerciseFrame variant="dusk">
            <CyberScanner
              onComplete={() => showLearnSummary(3)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(3)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 4: PROTECT THE DATA (was Shield Simulator) ──── */
      case 4: {
        if (showSummary[4]) return <LearnSummary message="You know what to keep private and what is safe to share!" starCount={getStars(4)} onNext={() => dismissSummary(4, 5)} />;
        return (
          <ExerciseFrame variant="dusk">
            <ProtectTheData
              items={PROTECT_DATA_ITEMS}
              onComplete={() => showLearnSummary(4)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(4)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 5: CYBER MAZE ──── */
      case 5: {
        if (showSummary[5]) return <LearnSummary message="You thought your way through every gate. Keep using that critical thinking online!" starCount={getStars(5)} onNext={() => dismissSummary(5, 6)} />;
        return (
          <ExerciseFrame variant="dusk">
            <CyberMaze
              questions={MAZE_QUESTIONS}
              onComplete={() => showLearnSummary(5)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(5)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 6: PASSWORD LAB (cauldron ingredients) ──── */
      case 6: {
        if (showSummary[6]) return <LearnSummary message="You mixed uppercase, lowercase, numbers, symbols AND length — that's a super-strong recipe!" starCount={getStars(6)} onNext={() => dismissSummary(6, 7)} />;
        return (
          <ExerciseFrame variant="dusk">
            <PasswordLab
              onComplete={() => showLearnSummary(6)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(6)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 7: CRACK THE CODE (was password builder) ──── */
      case 7: {
        if (showSummary[7]) return <LearnSummary message="You cracked the code! Long, random passwords in a password manager are the way." starCount={getStars(7)} onNext={() => dismissSummary(7, 8)} />;
        return (
          <ExerciseFrame variant="dusk">
            <CrackTheCode
              onComplete={() => showLearnSummary(7)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(7)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 8: MEMORY MATCH (cybersecurity term pairs) ──── */
      case 8: {
        if (showSummary[8]) return <LearnSummary message="You matched every term to its meaning — that's real cyber knowledge!" starCount={getStars(8)} onNext={() => dismissSummary(8, 9)} />;
        return (
          <ExerciseFrame variant="dusk">
            <MemoryMatch
              onComplete={() => showLearnSummary(8)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(8)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 9: CONVEYOR BELT (was drag & drop sort) ──── */
      case 9: {
        if (showSummary[9]) return <LearnSummary message="You sorted strong from weak at full factory speed — great reflexes!" starCount={getStars(9)} onNext={() => dismissSummary(9, 10)} />;
        return (
          <ExerciseFrame variant="dusk">
            <ConveyorBelt
              items={SWIPE_DATA.map((d) => ({
                text: d.pw,
                category: d.isStrong ? "strong" : "weak",
              }))}
              onComplete={() => showLearnSummary(9)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(9)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 10: 5 GOLDEN RULES (TAP TO REVEAL) ──── */
      case 10:
        if (showInstr[10]) return <InstructionOverlay icon="⭐" story="Before you finish, learn the 5 most important rules about passwords!" instructions="Tap each golden card to reveal a rule, then answer the question!" onReady={() => dismissInstr(10)} />;
        if (showSummary[10]) return <LearnSummary message="You know the 5 Golden Rules of passwords! Follow them and the Raccoon can never get in." starCount={getStars(10)} onNext={() => dismissSummary(10, 11)} />;
        return (
          <ExerciseFrame variant="golden" plate={false}>
          <style>{`
            @keyframes grCoinRise { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 12% { opacity: 0.85; } 88% { opacity: 0.85; } 100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; } }
            @keyframes grTwinkle { 0%,100% { opacity: 0.25; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.3); } }
            @keyframes grCoinShine { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes grSparkle { 0%,100% { opacity: 0.3; transform: scale(0.6); } 50% { opacity: 1; transform: scale(1.4); } }
            @keyframes grBeamSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes grRuneDrift { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(18px, -22px) rotate(8deg); } }
            @keyframes grVaultPulse { 0%,100% { opacity: 0.18; } 50% { opacity: 0.4; } }
            @keyframes grSparkleStreak { 0% { transform: translateX(-200%) skewX(-12deg); } 100% { transform: translateX(220%) skewX(-12deg); } }
          `}</style>
          <div style={{ textAlign: "center", position: "relative" }}>
            {/* Treasure-vault animated backdrop — drifting coins, runes,
                twinkling gold dust, sweeping beam-of-light. Sits at z 0 so
                the rule grid lands cleanly on top. */}
            <div aria-hidden style={{ position: "absolute", inset: -40, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
              {/* Pulsing vault-door arc behind the grid */}
              <div style={{
                position: "absolute",
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                width: 720, height: 720,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(245,158,11,0.18), rgba(245,158,11,0) 60%)",
                animation: "grVaultPulse 4.6s ease-in-out infinite",
                filter: "blur(8px)",
              }} />
              {/* Rotating gold rays */}
              <div style={{
                position: "absolute",
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                width: 760, height: 760,
                background: "conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.16) 14deg, transparent 28deg, rgba(253,224,71,0.16) 60deg, transparent 80deg, rgba(253,224,71,0.16) 110deg, transparent 130deg, rgba(253,224,71,0.16) 170deg, transparent 200deg, rgba(253,224,71,0.16) 240deg, transparent 270deg, rgba(253,224,71,0.16) 310deg, transparent 340deg)",
                animation: "grBeamSweep 22s linear infinite",
                filter: "blur(2px)",
                opacity: 0.9,
              }} />
              {/* Drifting gold coins */}
              {Array.from({ length: 22 }).map((_, i) => {
                const left = (i * 9.4) % 100;
                const dur = 8 + (i % 6);
                const delay = (i * 0.7) % 12;
                return (
                  <span key={`coin-${i}`} style={{
                    position: "absolute",
                    left: `${left}%`,
                    bottom: -30,
                    fontSize: 14 + (i % 4) * 6,
                    opacity: 0,
                    filter: `drop-shadow(0 0 ${6 + (i % 3) * 2}px rgba(253,224,71,0.6))`,
                    animation: `grCoinRise ${dur}s linear ${delay}s infinite`,
                  }}>🪙</span>
                );
              })}
              {/* Twinkling gold dust */}
              {Array.from({ length: 32 }).map((_, i) => {
                const left = (i * 13.7) % 100;
                const top = (i * 17.3) % 100;
                const dur = 1.5 + (i % 4) * 0.6;
                const delay = (i * 0.18) % 4;
                const c = i % 4 === 0 ? "#ffd58a" : i % 4 === 1 ? "#fbbf24" : i % 4 === 2 ? "#f59e0b" : "#fff";
                return (
                  <span key={`d-${i}`} style={{
                    position: "absolute",
                    left: `${left}%`,
                    top: `${top}%`,
                    width: 3, height: 3, borderRadius: "50%",
                    background: c,
                    boxShadow: `0 0 6px ${c}`,
                    animation: `grTwinkle ${dur}s ease-in-out ${delay}s infinite`,
                  }} />
                );
              })}
              {/* Drifting runes (lock / key / shield / star glyphs) */}
              {["🗝️", "⚔️", "🛡️", "✨", "🔱", "💎", "👑"].map((g, i) => (
                <span key={`r-${i}`} style={{
                  position: "absolute",
                  left: `${(i * 14 + 6) % 100}%`,
                  top: `${(i * 21) % 80 + 8}%`,
                  fontSize: 22 + (i % 3) * 8,
                  opacity: 0.16,
                  filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))",
                  animation: `grRuneDrift ${20 + (i % 4) * 4}s ease-in-out ${i * 1.6}s infinite`,
                }}>{g}</span>
              ))}
              {/* Sweeping diagonal sparkle band */}
              <span style={{
                position: "absolute",
                top: "20%", left: 0, right: 0, height: 80,
                background: "linear-gradient(90deg, transparent, rgba(253,224,71,0.18), transparent)",
                animation: "grSparkleStreak 7s ease-in-out infinite",
                pointerEvents: "none",
              }} />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <h1 data-split style={{
                color: "#fff", fontSize: 40, fontWeight: 900, marginBottom: 6,
                background: "linear-gradient(135deg, #fde68a, #f59e0b, #b45309)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 20px rgba(245,158,11,0.4)",
                letterSpacing: 1,
              }}>⭐ The 5 Golden Rules!</h1>
              <p style={{
                color: "#fbbf24", fontSize: 12, fontWeight: 800, letterSpacing: 4,
                textTransform: "uppercase", marginBottom: 14,
                fontFamily: "ui-monospace, monospace",
              }}>
                ▸ TREASURE VAULT // TAP A COIN TO UNLOCK
              </p>
            </div>
            <div style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 14,
              maxWidth: 900,
              margin: "0 auto 24px",
            }}>
              {RULES.map((rule, i) => {
                const isRevealed = revealedRules.has(i);
                const isFlipping = flippingRule === i;
                const isDone = answeredRules.has(i);
                return (
                  <div key={i} style={{ gridColumn: isRevealed ? "1 / -1" : "span 1" }}>
                    <motion.div
                      style={{
                        position: "relative",
                        borderRadius: 18,
                        padding: isRevealed ? 18 : 14,
                        minHeight: isRevealed ? 120 : 150,
                        background: !isRevealed
                          ? "radial-gradient(circle at 30% 25%, #fef3c7 0%, #fbbf24 22%, #f59e0b 55%, #92400e 100%)"
                          : "rgba(255,255,255,0.04)",
                        backdropFilter: isRevealed ? "blur(12px)" : undefined,
                        border: !isRevealed ? "3px solid #fde68a"
                          : isDone ? "2px solid #f59e0b"
                          : "1px solid rgba(255,255,255,0.1)",
                        borderLeft: isRevealed ? (isDone ? "4px solid #f59e0b" : "4px solid rgba(245,158,11,0.3)") : undefined,
                        overflow: "hidden",
                        cursor: !isRevealed ? "pointer" : "default",
                        boxShadow: !isRevealed
                          ? "0 16px 32px -10px rgba(180,83,9,0.7), 0 0 24px rgba(253,224,71,0.45), inset 0 2px 8px rgba(255,255,255,0.55), inset 0 -8px 14px rgba(120,53,15,0.4)"
                          : undefined,
                      }}
                      animate={!isRevealed ? (isFlipping ? { rotateY: [0, 90, 0] } : { rotate: [0, -2, 0, 2, 0], y: [0, -3, 0] }) : {}}
                      transition={!isRevealed ? (isFlipping ? { duration: 0.6 } : { duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }) : { duration: 0.3 }}
                      whileHover={!isRevealed ? { scale: 1.06, y: -4, rotate: 0 } : {}}
                      whileTap={!isRevealed ? { scale: 0.94 } : {}}
                      onClick={() => {
                        if (isRevealed || isFlipping) return;
                        setFlippingRule(i);
                        setTimeout(() => {
                          setRevealedRules((prev) => { const n = new Set(prev); n.add(i); return n; });
                          setFlippingRule(null);
                        }, 600);
                      }}
                    >
                      {!isRevealed ? (
                        <>
                          {/* Rotating shine inside the coin */}
                          <span aria-hidden style={{
                            position: "absolute", inset: 0, borderRadius: 16,
                            background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.55) 30deg, transparent 80deg, rgba(255,255,255,0) 360deg)",
                            mixBlendMode: "screen",
                            animation: `grCoinShine ${4 + (i % 3)}s linear ${i * 0.4}s infinite`,
                            pointerEvents: "none",
                          }} />
                          {/* Sparkle dots */}
                          {[
                            { top: 8, left: 14, delay: 0 },
                            { top: 26, right: 10, delay: 0.6 },
                            { bottom: 28, left: 18, delay: 1.2 },
                            { bottom: 12, right: 22, delay: 1.8 },
                          ].map((s, k) => (
                            <span key={k} aria-hidden style={{
                              position: "absolute",
                              ...s,
                              fontSize: 10,
                              color: "#fff",
                              filter: "drop-shadow(0 0 4px #ffd58a)",
                              animation: `grSparkle 1.6s ease-in-out ${s.delay}s infinite`,
                              pointerEvents: "none",
                            }}>✦</span>
                          ))}
                          <div style={{
                            position: "relative", zIndex: 1,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            minHeight: 116, gap: 4,
                          }}>
                            {/* Big embossed Roman numeral medal-style */}
                            <div style={{
                              width: 64, height: 64, borderRadius: "50%",
                              background: "radial-gradient(circle at 35% 30%, #fef3c7, #f59e0b 60%, #92400e)",
                              border: "2px solid #fde68a",
                              boxShadow: "inset 0 2px 6px rgba(255,255,255,0.6), inset 0 -4px 10px rgba(120,53,15,0.6), 0 6px 14px rgba(120,53,15,0.5)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontFamily: "'Space Grotesk', serif",
                              fontWeight: 900,
                              fontSize: 24,
                              color: "#7c2d12",
                              textShadow: "0 1px 1px rgba(255,255,255,0.7)",
                              marginBottom: 4,
                            }}>
                              {["I", "II", "III", "IV", "V"][i] ?? `${i + 1}`}
                            </div>
                            <span style={{
                              fontSize: 12, fontWeight: 900,
                              color: "#451a03",
                              letterSpacing: 2,
                              textTransform: "uppercase",
                              fontFamily: "ui-monospace, monospace",
                            }}>
                              GOLDEN RULE
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: "#7c2d12",
                              textAlign: "center",
                              opacity: 0.9,
                            }}>
                              Tap to claim ✨
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{rule.icon === "lock" ? <IconLock size={28} color="#ffd58a" /> : rule.icon === "key" ? <IconKey size={28} color="#ffd158" /> : rule.icon === "unlock" ? <IconUnlock size={28} color="#f08e7e" /> : rule.icon === "ruler" ? <IconRuler size={28} color="#a8e3bb" /> : <IconUsers size={28} color="#f7c1d6" />}</span>
                            <span style={{ color: "#fff7e6", fontWeight: 800, fontSize: 16, flex: 1, textAlign: "left" }}>{rule.title}</span>
                            {isDone && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                style={{ color: "#ffd158", fontSize: 22 }}
                              >✅</motion.span>
                            )}
                          </div>
                          {!isDone && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
                              <p style={{ color: "#ffe9c8", fontSize: 14, textAlign: "left", opacity: 0.9, lineHeight: 1.45 }}>{rule.desc}</p>
                              <p style={{ color: "#ffd58a", fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{rule.question}</p>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {rule.opts.map((opt: string, oi: number) => (
                                  <motion.button key={oi}
                                    className="shimmer-card"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRuleAnswers((prev) => ({ ...prev, [i]: oi }));
                                      if (oi === rule.correct) {
                                        celebrateCorrect(e.currentTarget as HTMLElement);
                                        setAnsweredRules((prev) => { const n = new Set(prev); n.add(i); return n; });
                                        playSFX("correct");
                                        addCoins(5);
                                        awardXp(50, "lesson-week-1", e.currentTarget as HTMLElement);
                                        setTimeout(() => playSFX("xpGain"), 500);
                                      } else {
                                        shakeWrong(e.currentTarget as HTMLElement);
                                        playSFX("wrong");
                                      }
                                    }}
                                    animate={ruleAnswers[i] === oi && oi !== rule.correct ? shakeAnimation : {}}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{
                                      background: ruleAnswers[i] === oi
                                        ? (oi === rule.correct ? "rgba(124, 200, 154, 0.22)" : "rgba(196, 81, 58, 0.22)")
                                        : "rgba(255, 245, 220, 0.12)",
                                      borderStyle: "solid",
                                      borderWidth: 2,
                                      borderColor: ruleAnswers[i] === oi
                                        ? (oi === rule.correct ? "#7cc89a" : "#c4513a")
                                        : "rgba(255, 220, 180, 0.45)",
                                      borderRadius: 14,
                                      padding: "16px 24px",
                                      color: ruleAnswers[i] === oi
                                        ? (oi === rule.correct ? "#a8e3bb" : "#f4a89a")
                                        : "#fff7e6",
                                      fontSize: 16, fontWeight: 800, cursor: "pointer", minHeight: 56, flex: 1,
                                      opacity: ruleAnswers[i] !== null && ruleAnswers[i] !== undefined && ruleAnswers[i] !== oi && ruleAnswers[i] !== rule.correct ? 0.4 : 1,
                                      fontFamily: "inherit",
                                    }}
                                  >{opt}</motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          {isDone && <p style={{ color: "#a8e3bb", fontSize: 13, marginTop: 8, textAlign: "left", lineHeight: 1.45 }}>{rule.desc}</p>}
                        </>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
            {/* Continue button appears as soon as the player answers their
                first rule, so they're never blocked waiting on rules they
                might not have noticed/scrolled to. The full ⭐⭐⭐⭐⭐ message
                still rewards finishing all 5. */}
            <AnimatePresence>
              {answeredRules.size >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ position: "relative", zIndex: 1 }}
                >
                  {answeredRules.size === 5 ? (
                    <p style={{ color: "#f59e0b", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                      You know ALL 5 golden rules! ⭐⭐⭐⭐⭐
                    </p>
                  ) : (
                    <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, marginBottom: 10, opacity: 0.85 }}>
                      {answeredRules.size}/5 unlocked — answer the rest for the full bonus!
                    </p>
                  )}
                  {btn(answeredRules.size === 5 ? "Continue →" : "Continue anyway →", () => { addCoins(answeredRules.size === 5 ? 25 : 5); showLearnSummary(10); })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </ExerciseFrame>
        );

      /* ──── CASE 11: FIREWALL BUILDER (was Q3 bubble quiz) ──── */
      case 11: {
        if (showSummary[11]) return <LearnSummary message="Your firewall is tall and tough — keep practising good habits every day!" starCount={getStars(11)} onNext={() => dismissSummary(11, 12)} />;
        return (
          <ExerciseFrame variant="dusk">
            <FirewallBuilder
              onComplete={() => showLearnSummary(11)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(11)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 12: PHISHING EXPLAINER ──── */
      case 12: {
        if (showSummary[12]) return <LearnSummary message="You learned the 4 signs of a trick, too good to be true, scary warnings, spelling mistakes, and asking for secrets!" starCount={3} onNext={() => dismissSummary(12, 13)} />;
        const tricks = [
          { title: "TOO GOOD TO BE TRUE", fake: "YOU WON A FREE iPAD!!! CLICK NOW!!!", explain: "If it sounds too good to be true... it probably is! Real prizes don't pop up on your screen.", color: "#ffd158", icon: "🎁", glyph: "%" },
          { title: "SCARY WARNINGS", fake: "WARNING! YOUR TABLET HAS A VIRUS! CALL THIS NUMBER NOW!", explain: "Scary messages try to make you panic. Real warnings don't ask you to call a number. Tell a grown-up!", color: "#f08e7e", icon: "⚠️", glyph: "!" },
          { title: "SPELLING MISTAKES", fake: "Dear Costumer, Youre acount has ben comprimised. Clik here to fix.", explain: "Real companies don't make spelling mistakes! If it looks wrong, it IS wrong.", color: "#a06aff", icon: "🅰️", glyph: "?" },
          { title: "ASKING FOR SECRETS", fake: "Enter your password to win free V-Bucks!", explain: "NO real website will EVER ask for your password in a message. NEVER type your password into a popup.", color: "#f7c1d6", icon: "🔐", glyph: "@" },
        ];
        const t = tricks[trickCard] || tricks[0];
        return (
          <ExerciseFrame variant="dusk" plate={false}>
          <style>{`
            @keyframes phEvidenceTape { 0% { background-position: 0 0; } 100% { background-position: 36px 0; } }
            @keyframes phStampPunch { 0% { transform: scale(2.6) rotate(-30deg); opacity: 0; } 60% { transform: scale(0.95) rotate(-14deg); opacity: 0.95; } 80% { transform: scale(1.05) rotate(-14deg); } 100% { transform: scale(1) rotate(-14deg); opacity: 0.95; } }
            @keyframes phRedlineDraw { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }
            @keyframes phMagFloat { 0%,100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-8px) rotate(-4deg); } }
            @keyframes phGlitch { 0%,100% { transform: translate(0,0); } 20% { transform: translate(-1px,1px); } 40% { transform: translate(1px,-1px); } 60% { transform: translate(-1px,0); } 80% { transform: translate(0,1px); } }
            @keyframes phGlyphFloat { 0% { transform: translateY(0) rotate(0); opacity: 0; } 12% { opacity: 0.18; } 80% { opacity: 0.18; } 100% { transform: translateY(-160px) rotate(20deg); opacity: 0; } }
          `}</style>
          <div style={{ textAlign: "center", position: "relative" }}>
            {/* Drifting cipher glyphs in the background — subtle "case file" texture */}
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
              {Array.from({ length: 14 }).map((_, i) => {
                const ch = ["@", "$", "#", "?", "%", "&", "!", "*"][i % 8];
                const left = (i * 13) % 100;
                const dur = 9 + (i % 5) * 1.7;
                const delay = (i * 0.7) % 8;
                return (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      bottom: -20,
                      fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
                      fontSize: 22 + (i % 3) * 8,
                      color: "rgba(249,115,22,0.85)",
                      animation: `phGlyphFloat ${dur}s ease-in-out ${delay}s infinite`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>

            <div style={{ position: "relative", zIndex: 1, fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif" }}>
              <h1 data-split style={{
                fontSize: 38,
                fontWeight: 900,
                marginBottom: 4,
                background: "linear-gradient(135deg, #ffd58a, #ff9b4a, #d4733a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 0.5,
                textShadow: "0 4px 18px rgba(80, 30, 10, 0.55)",
              }}>🔍 Spot the Tricks!</h1>
              <p style={{ color: "#ffd58a", marginBottom: 4, fontSize: 12, letterSpacing: 4, textTransform: "uppercase", fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace", fontWeight: 800 }}>
                ▸ EVIDENCE FILE {String(Math.min(trickCard + 1, tricks.length)).padStart(2, "0")} / {String(tricks.length).padStart(2, "0")}
              </p>
              <p style={{ color: "#ffe9c8", marginBottom: 16, fontSize: 16, opacity: 0.9, fontWeight: 500 }}>The Raccoon sends FAKE messages to trick people. Here&apos;s how to spot them!</p>
            </div>
            {trickCard < 4 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={trickCard}
                  initial={{ opacity: 0, y: 24, rotateX: 12 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  style={{ position: "relative", maxWidth: 560, margin: "0 auto", perspective: "1400px", zIndex: 1 }}
                >
                  {/* Detective case-file card */}
                  <div
                    style={{
                      position: "relative",
                      background: "linear-gradient(160deg, rgba(40, 18, 38, 0.92) 0%, rgba(20, 8, 24, 0.94) 100%)",
                      borderStyle: "solid",
                      borderWidth: 1,
                      borderColor: `${t.color}66`,
                      borderRadius: 20,
                      padding: "28px 24px 22px",
                      boxShadow: `0 30px 60px -20px ${t.color}55, 0 0 36px ${t.color}33, inset 0 0 0 1px rgba(255, 220, 180, 0.05)`,
                      transformStyle: "preserve-3d",
                      overflow: "hidden",
                    }}
                  >
                    {/* Hazard tape ribbon */}
                    <div aria-hidden style={{
                      position: "absolute", left: 0, right: 0, top: 0, height: 8,
                      backgroundImage: `repeating-linear-gradient(45deg, ${t.color} 0 12px, rgba(0,0,0,0.85) 12px 24px)`,
                      animation: "phEvidenceTape 1.4s linear infinite",
                      opacity: 0.85,
                    }} />
                    {/* Floating magnifier */}
                    <div aria-hidden style={{ position: "absolute", top: 18, right: 18, fontSize: 36, animation: "phMagFloat 3.2s ease-in-out infinite", filter: `drop-shadow(0 6px 12px ${t.color}88)` }}>
                      🔍
                    </div>
                    {/* Title chip */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, marginBottom: 14, padding: "5px 12px", borderRadius: 999, background: `${t.color}1a`, border: `1px solid ${t.color}66` }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <span style={{ color: t.color, fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>{t.title}</span>
                    </div>

                    {/* Fake message — styled like a real popup with glitch + REJECTED stamp */}
                    <div style={{ position: "relative", marginBottom: 18 }}>
                      <div style={{
                        background: "linear-gradient(180deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.08) 100%)",
                        border: "2px solid rgba(239,68,68,0.55)",
                        borderRadius: 14,
                        padding: "22px 18px",
                        boxShadow: "0 0 24px rgba(239,68,68,0.25), inset 0 0 0 1px rgba(255,255,255,0.04)",
                      }}>
                        {/* Pseudo browser bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, opacity: 0.8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7cc89a" }} />
                          <span style={{ flex: 1, fontFamily: "ui-monospace, monospace", fontSize: 11, color: "rgba(252,165,165,0.7)", textAlign: "left", marginLeft: 8 }}>
                            ⚠ unsafe-link.notreal/{t.glyph}
                          </span>
                        </div>
                        <p style={{
                          color: "#fca5a5", fontSize: 17, fontWeight: 800, fontStyle: "italic",
                          margin: 0, lineHeight: 1.4,
                          textShadow: "0 0 8px rgba(239,68,68,0.5)",
                          animation: "phGlitch 1.6s ease-in-out infinite",
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                        }}>
                          &ldquo;{t.fake}&rdquo;
                        </p>
                        {/* Diagonal redline animated stroke. preserveAspectRatio="none"
                            so the line stretches across the full popup width
                            regardless of viewBox vs container ratio. The
                            dasharray is set to the full path length (~600)
                            so the line fully draws across the message. */}
                        <svg
                          viewBox="0 0 600 60"
                          preserveAspectRatio="none"
                          style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 60, pointerEvents: "none" }}
                        >
                          <line
                            x1="10" y1="52" x2="590" y2="8"
                            stroke="#ef4444" strokeWidth="3"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            strokeDasharray="600"
                            strokeDashoffset="600"
                            style={{ animation: "phRedlineDraw 1.2s ease-out 0.3s forwards", filter: "drop-shadow(0 0 8px #ef4444)" }}
                          />
                        </svg>
                      </div>
                      {/* REJECTED stamp — moved to the top-right corner so
                          the actual fake-message text remains readable.
                          The user needs to be able to read the trick in
                          order to learn from it. */}
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -10,
                          padding: "4px 14px",
                          border: "3px solid #ef4444",
                          color: "#ef4444",
                          fontFamily: "ui-monospace, monospace",
                          fontWeight: 900,
                          fontSize: 14,
                          letterSpacing: 3,
                          background: "rgba(239,68,68,0.12)",
                          textShadow: "0 0 6px rgba(239,68,68,0.65)",
                          boxShadow: "inset 0 0 0 2px rgba(239,68,68,0.3), 0 0 18px rgba(239,68,68,0.55)",
                          transformOrigin: "center",
                          animation: "phStampPunch 0.9s cubic-bezier(0.4,1.4,0.5,1) 0.4s both",
                          pointerEvents: "none",
                        }}
                      >
                        REJECTED
                      </div>
                    </div>

                    {/* Detective explanation */}
                    <div style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      textAlign: "left",
                      padding: "12px 14px",
                      background: "rgba(124, 200, 154, 0.12)",
                      borderStyle: "solid",
                      borderWidth: 1,
                      borderColor: "rgba(124, 200, 154, 0.5)",
                      borderRadius: 14,
                    }}>
                      <span style={{
                        flexShrink: 0,
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg, #ffd158, #ff9b4a)",
                        color: "#3a1a06",
                        fontWeight: 900,
                        fontSize: 18,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 14px rgba(255, 200, 110, 0.55)",
                      }}>✓</span>
                      <p style={{ color: "#ffe9c8", fontSize: 15, lineHeight: 1.55, margin: 0 }}>
                        <span style={{ color: "#a8e3bb", fontWeight: 800, marginRight: 4 }}>The clue:</span>
                        {t.explain}
                      </p>
                    </div>

                    <div style={{ marginTop: 18 }}>
                      {btn(trickCard < 3 ? "Next Trick →" : "I see the pattern! →", () => setTrickCard((c) => c + 1))}
                    </div>

                    {/* Progress dots */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
                      {tricks.map((_, idx) => (
                        <span key={idx} style={{
                          width: idx === trickCard ? 22 : 8, height: 8, borderRadius: 4,
                          background: idx < trickCard ? "#7cc89a" : idx === trickCard ? t.color : "rgba(255, 220, 180, 0.2)",
                          boxShadow: idx === trickCard ? `0 0 12px ${t.color}` : "none",
                          transition: "width 0.3s ease, background 0.3s ease",
                        }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  maxWidth: 540,
                  margin: "0 auto",
                  padding: "26px 28px 22px",
                  background: "rgba(40, 18, 38, 0.78)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderStyle: "solid",
                  borderWidth: 1,
                  borderColor: "rgba(255, 220, 180, 0.4)",
                  borderRadius: 22,
                  boxShadow: "0 30px 60px -20px rgba(20, 6, 12, 0.7)",
                  color: "#fff7e6",
                  fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 11,
                    letterSpacing: 5,
                    color: "#ffd58a",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}>
                    ✦ Detective Briefing ✦
                  </div>
                  <h2 data-split style={{
                    fontSize: 24,
                    fontWeight: 900,
                    marginBottom: 14,
                    background: "linear-gradient(135deg, #ffd58a, #ff9b4a, #d4733a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>Remember the 4 signs of a trick:</h2>
                  <div style={{ textAlign: "left", maxWidth: 400, margin: "0 auto 16px" }}>
                    {["Too good to be true", "Scary warnings", "Spelling mistakes", "Asking for your secrets"].map((sign, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #ffd58a, #ff9b4a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#3a1a06",
                          fontWeight: 900,
                          fontSize: 13,
                          flexShrink: 0,
                          boxShadow: "0 0 12px rgba(255, 200, 110, 0.5)",
                        }}>{i + 1}</span>
                        <span style={{ color: "#fff7e6", fontSize: 15, fontWeight: 600 }}>{sign}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p style={{ color: "#ffe9c8", fontSize: 14, marginBottom: 16, opacity: 0.85 }}>Now let&apos;s see if YOU can spot the Raccoon&apos;s tricks!</p>
                  {btn("I'm Ready! →", () => showLearnSummary(12))}
                </div>
              </motion.div>
            )}
          </div>
          </ExerciseFrame>
        );
      }

      /* ──── CASE 13: SPAM BLASTER (was phishing tablet) ──── */
      case 13: {
        if (showSummary[13]) return <LearnSummary message="You spotted every trick! Real friends don't need your password — ever." starCount={getStars(13)} onNext={() => dismissSummary(13, 14)} />;
        return (
          <ExerciseFrame variant="dusk">
            <SpamBlaster
              onComplete={() => showLearnSummary(13)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(13)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 14: CHOOSE YOUR PATH ──── */
      case 14: {
        if (showSummary[14]) return <LearnSummary message="You chose safely every time — that judgement is your best cyber tool." starCount={getStars(14)} onNext={() => dismissSummary(14, 15)} />;
        return (
          <ExerciseFrame variant="dusk">
            <ChooseYourPath
              onComplete={() => showLearnSummary(14)}
              onCorrect={() => awardXp(25, "lesson-week-1")}
              onWrong={() => addWrong(14)}
            />
          </ExerciseFrame>
        );
      }

      /* ──── CASE 15: BOSS BATTLE (ARENA WITH 3D BG) ──── */
      case 15: {
        if (showInstr[15]) return <InstructionOverlay icon="⚔️" story="This is it, the Raccoon's final attack! Everything you've learned is needed now!" instructions="Answer questions to fight the Raccoon! Get as many hits as you can!" onReady={() => dismissInstr(15)} />;
        if (showSummary[15]) return <LearnSummary message="You battled the Hacker Raccoon! Your password knowledge is your strongest weapon." starCount={getStars(15)} onNext={() => dismissSummary(15, 16)} />;

        if (bossDone) {
          return (
            <FullScene bg="linear-gradient(180deg, #0a0505 0%, #1a0612 100%)" glow="radial-gradient(circle, rgba(245,158,11,0.3), transparent)">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{ textAlign: "center" }}>
              <Confetti duration={5000} />
              {card(
                <>
                  <motion.img src="/characters/raccoon-defeated.png" alt="Raccoon defeated" initial={{ scale: 1.2 }}
                    animate={{ rotate: 720, scale: 0, y: -120, opacity: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ width: 160, margin: "0 auto 12px", display: "block", filter: "drop-shadow(0 0 12px rgba(239,68,68,0.4))" }} />
                  <motion.h2 animate={{ textShadow: ["0 0 20px rgba(245,158,11,0.3)", "0 0 40px rgba(245,158,11,0.6)", "0 0 20px rgba(245,158,11,0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: 32, margin: "0 0 12px", fontWeight: 900, background: "linear-gradient(135deg, #f59e0b, #ef4444, #ff9b4a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    You defeated the Hacker Raccoon!</motion.h2>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                    {stars(bossScore >= 8 ? 3 : bossScore >= 6 ? 2 : 1)}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: [0, -8, 0] }}
                    transition={{ y: { duration: 2, repeat: Infinity }, opacity: { delay: 0.5, duration: 0.5 } }}
                    style={{ display: "inline-block", padding: "12px 12px 6px", margin: "16px auto", borderRadius: 20, border: "3px solid #f59e0b", boxShadow: "0 0 30px rgba(245,158,11,0.4)", background: "rgba(0,0,0,0.2)", overflow: "visible" }}
                  >
                    <img src="/characters/celebrating.png" alt="Celebrating" style={{ width: 180, display: "block", objectFit: "contain" }} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
                    style={{ background: "rgba(245,158,11,0.15)", border: "2px solid rgba(245,158,11,0.4)", borderRadius: 16, padding: "8px 20px", display: "inline-block", marginBottom: 16 }}>
                    <span style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700 }}>+50 bonus coins!</span>
                  </motion.div>
                  <div>{btn("Save Adam & Layla! →", () => { addCoins(50); playSFX("xpGain"); navigate(16); })}</div>
                </>
              )}
            </motion.div>
            </FullScene>
          );
        }

        return (
          <FullScene bg="linear-gradient(180deg, #1a0505 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(239,68,68,0.35), transparent)">
            <style>{`
              @keyframes bbSweepLight { 0% { transform: translateX(-150%) skewX(-18deg); } 100% { transform: translateX(250%) skewX(-18deg); } }
              @keyframes bbWarnPulse { 0%,100% { opacity: 0.35; box-shadow: 0 0 6px currentColor; } 50% { opacity: 1; box-shadow: 0 0 22px currentColor; } }
              @keyframes bbVsClash { 0% { transform: translate(-50%, -50%) scale(0.4) rotate(-30deg); opacity: 0; } 50% { transform: translate(-50%, -50%) scale(1.4) rotate(0deg); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; } }
              @keyframes bbLightningStrike { 0%,92%,100% { opacity: 0; } 94% { opacity: 0.85; } 96% { opacity: 0.2; } 98% { opacity: 0.7; } }
              @keyframes bbFloatHero { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
              @keyframes bbFloatVillain { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
              @keyframes bbHazardSlide { 0% { background-position: 0 0; } 100% { background-position: 60px 0; } }
              @keyframes bbScanFloor { 0% { transform: translateY(-100%); } 100% { transform: translateY(120%); } }
              @keyframes bbEmberRise { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: 0.85; } 88% { opacity: 0.85; } 100% { transform: translateY(-220px); opacity: 0; } }
            `}</style>

            <div style={{ position: "relative", width: "100%", maxWidth: 900, margin: "0 auto" }}>
              {/* Hazard tape ribbons top + bottom */}
              <div aria-hidden style={{
                position: "absolute", left: 0, right: 0, top: -10, height: 8,
                backgroundImage: "repeating-linear-gradient(45deg, #fbbf24 0 12px, #1a0505 12px 24px)",
                animation: "bbHazardSlide 1.4s linear infinite",
                opacity: 0.85,
                borderRadius: 4,
              }} />
              <div aria-hidden style={{
                position: "absolute", left: 0, right: 0, bottom: -10, height: 8,
                backgroundImage: "repeating-linear-gradient(-45deg, #ef4444 0 12px, #1a0505 12px 24px)",
                animation: "bbHazardSlide 1.4s linear infinite reverse",
                opacity: 0.85,
                borderRadius: 4,
              }} />

              {/* Lightning flashes */}
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={`bolt-${i}`} aria-hidden style={{
                  position: "absolute",
                  left: `${15 + i * 30}%`,
                  top: 0,
                  width: 2,
                  height: 240,
                  background: "linear-gradient(180deg, #ffd58a, transparent)",
                  filter: "drop-shadow(0 0 8px #fbbf24)",
                  animation: `bbLightningStrike ${5 + i * 1.4}s ease-in-out ${i * 1.7}s infinite`,
                  pointerEvents: "none",
                }} />
              ))}

              {/* Drifting embers */}
              {Array.from({ length: 14 }).map((_, i) => {
                const left = (i * 47) % 100;
                const dur = 4 + (i % 4);
                const delay = (i * 0.5) % 6;
                const c = ["#ffd58a", "#f97316", "#fb923c", "#ef4444"][i % 4];
                return (
                  <span key={`ember-${i}`} aria-hidden style={{
                    position: "absolute",
                    left: `${left}%`,
                    bottom: 0,
                    width: 3, height: 3, borderRadius: "50%",
                    background: c,
                    boxShadow: `0 0 6px ${c}`,
                    animation: `bbEmberRise ${dur}s linear ${delay}s infinite`,
                  }} />
                );
              })}

              {/* HUD warning row */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 14px", marginTop: 6, marginBottom: 14,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 10,
                fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 800,
                letterSpacing: 2, textTransform: "uppercase",
              }}>
                <span style={{ color: "#fca5a5", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", color: "#ef4444", animation: "bbWarnPulse 1.2s ease-in-out infinite" }} />
                  THREAT_DETECTED // FINAL_BOSS
                </span>
                <span style={{ color: "#fbbf24" }}>
                  ARENA: SECURE_VAULT_07
                </span>
                <span style={{ color: "#fca5a5", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  PROTOCOL: ENGAGE
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", color: "#ef4444", animation: "bbWarnPulse 1.2s ease-in-out 0.6s infinite" }} />
                </span>
              </div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: -10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                style={{
                  position: "relative",
                  fontSize: 64,
                  fontWeight: 900,
                  margin: "0 0 4px",
                  background: "linear-gradient(135deg, #ef4444, #f97316, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: 3,
                  textShadow: "0 0 40px rgba(239,68,68,0.35)",
                  textAlign: "center",
                }}
              >
                BOSS BATTLE
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ color: "#fca5a5", fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", marginBottom: 18, textAlign: "center", fontFamily: "ui-monospace, monospace" }}
              >
                ▸ Hacker Raccoon is locked &amp; loaded
              </motion.p>

              {/* VS face-off */}
              <div style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 18,
                alignItems: "center",
                padding: "18px 14px",
                marginBottom: 18,
                background: "linear-gradient(180deg, rgba(20,8,12,0.85), rgba(8,4,16,0.85))",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 18,
                boxShadow: "0 30px 60px -20px rgba(239,68,68,0.45), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(239,68,68,0.18)",
                overflow: "hidden",
              }}>
                {/* Sweeping light */}
                <span aria-hidden style={{
                  position: "absolute", top: 0, left: 0, height: "100%", width: "60%",
                  background: "linear-gradient(90deg, transparent, rgba(253,224,71,0.18), transparent)",
                  animation: "bbSweepLight 5s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
                {/* Vertical scan line */}
                <span aria-hidden style={{
                  position: "absolute", left: 0, right: 0, height: 60,
                  background: "linear-gradient(180deg, transparent, rgba(255,213,138,0.18), transparent)",
                  animation: "bbScanFloor 4s linear infinite",
                  pointerEvents: "none",
                  mixBlendMode: "screen",
                }} />

                {/* Hero side */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 22 }}
                  style={{ position: "relative", textAlign: "center", padding: "10px 8px" }}
                >
                  <div style={{ position: "relative", display: "inline-block", animation: "bbFloatHero 3s ease-in-out infinite" }}>
                    <span aria-hidden style={{
                      position: "absolute", inset: -10, borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(255,213,138,0.45), transparent 70%)",
                      filter: "blur(10px)",
                    }} />
                    <img src="/characters/heroic.png" alt="Adam &amp; Layla" style={{
                      position: "relative",
                      width: 130, maxWidth: "100%", height: "auto",
                      filter: "drop-shadow(0 12px 22px rgba(255,213,138,0.55))",
                    }} />
                  </div>
                  <div style={{ marginTop: 8, color: "#bfdbfe", fontWeight: 900, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", fontFamily: "ui-monospace, monospace" }}>
                    Adam &amp; Layla
                  </div>
                  {/* HP bar */}
                  <div style={{ marginTop: 6, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,213,138,0.4)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: "linear-gradient(90deg, #7cc89a, #7cc89a, #a8e3bb)", boxShadow: "0 0 10px #7cc89a" }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: "#a8e3bb", fontFamily: "ui-monospace, monospace", letterSpacing: 1 }}>
                    HP 100/100 ▸ READY
                  </div>
                </motion.div>

                {/* VS chip */}
                <div style={{ position: "relative", width: 64, height: 64 }}>
                  <span aria-hidden style={{
                    position: "absolute", inset: -10, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(253,224,71,0.6), transparent 70%)",
                    filter: "blur(8px)",
                  }} />
                  <div style={{
                    position: "absolute", left: "50%", top: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 64, height: 64, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 60%, #b45309)",
                    border: "3px solid #fbbf24",
                    color: "#1a0505",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 900, fontSize: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 18px rgba(180,83,9,0.55), inset 0 2px 6px rgba(255,255,255,0.4)",
                    animation: "bbVsClash 0.9s cubic-bezier(0.4,1.4,0.5,1) 0.5s both",
                  }}>VS</div>
                </div>

                {/* Villain side */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 22 }}
                  style={{ position: "relative", textAlign: "center", padding: "10px 8px" }}
                >
                  <div style={{ position: "relative", display: "inline-block", animation: "bbFloatVillain 3.4s ease-in-out infinite" }}>
                    <span aria-hidden style={{
                      position: "absolute", inset: -10, borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(239,68,68,0.55), transparent 70%)",
                      filter: "blur(12px)",
                    }} />
                    <img src="/characters/raccoon.png" alt="Hacker Raccoon" style={{
                      position: "relative",
                      width: 130, maxWidth: "100%", height: "auto",
                      filter: "drop-shadow(0 12px 22px rgba(239,68,68,0.65))",
                    }} />
                  </div>
                  <div style={{ marginTop: 8, color: "#fca5a5", fontWeight: 900, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", fontFamily: "ui-monospace, monospace" }}>
                    Hacker Raccoon
                  </div>
                  {/* HP bar */}
                  <div style={{ marginTop: 6, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(239,68,68,0.45)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: "linear-gradient(90deg, #ef4444, #f97316, #fbbf24)", boxShadow: "0 0 10px #ef4444" }}
                    />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: "#fca5a5", fontFamily: "ui-monospace, monospace", letterSpacing: 1 }}>
                    HP 100/100 ▸ HOSTILE
                  </div>
                </motion.div>
              </div>

              {/* Stat panel */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginBottom: 18,
              }}>
                {[
                  { l: "ROUNDS", v: "10", c: "#ffd58a" },
                  { l: "WEAPON", v: "KNOWLEDGE", c: "#a06aff" },
                  { l: "REWARD", v: "+50 COINS", c: "#fbbf24" },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: "8px 10px",
                    background: `${s.c}10`,
                    border: `1px solid ${s.c}55`,
                    borderRadius: 10,
                    textAlign: "center",
                    fontFamily: "ui-monospace, monospace",
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#94a3b8" }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: s.c, marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Start button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 300, damping: 20 }}
                style={{ textAlign: "center" }}
              >
                {btn("⚔ START BATTLE →", () => {
                  playSFX("transition");
                  setShowBossBattle(true);
                }, {
                  fontSize: 22,
                  padding: "16px 44px",
                  borderRadius: 18,
                  boxShadow: "0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(239,68,68,0.3)",
                  letterSpacing: 2,
                })}
              </motion.div>
            </div>
          </FullScene>
        );

      }

      /* ──── CASE 16: ADAM AND LAYLA ARE SAFE ──── */
      case 16:
        return (
          <FullScene bg="linear-gradient(180deg, #1a1508 0%, #0a0a1a 100%)">
            <VictoryScene
              onContinue={() => { triggerEarnForScreen(16); navigate(17); }}
            />
          </FullScene>
        );


      /* ──── CASE 17: CERTIFICATE + GRADUATION ──── */
      case 17: {
        const totalScore = q1Score + q2Score + q3Score + bossScore + swipeScore + phishScore + wydScore;
        const totalPossible = Q1_QUIZ.length + Q2_QUIZ.length + Q3_QUIZ.length + BOSS_QUIZ.length + SWIPE_DATA.length + PHISH.length + WYD.length;
        const finalStars: 1 | 2 | 3 = totalScore >= totalPossible * 0.8 ? 3 : totalScore >= totalPossible * 0.5 ? 2 : 1;
        return (
          <FullScene bg="linear-gradient(180deg, #1a0a20 0%, #0a0a1a 100%)">
            <GraduationScene
              childName={childName}
              weekNumber={CURRENT_WEEK}
              weekTitle="Passwords — The Secret Code"
              starsCount={finalStars}
              totalCoins={coins}
              isMilestoneWeek={IS_MILESTONE_WEEK}
              onContinue={() => { triggerEarnForScreen(17); navigate(18); }}
              onDownloadCertificate={
                IS_MILESTONE_WEEK
                  ? () => window.open(getCertificateUrl(childName, CURRENT_WEEK), "_blank")
                  : undefined
              }
            />
          </FullScene>
        );
      }


      /* ──── CASE 18: OUTRO VIDEO ──── */
      case 18:
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a1a 0%, #1a0612 100%)">
            <OutroScene
              childName={childName}
              totalCoins={coins}
              nextWeekTitle="Private Info: Guard Your Secrets"
              videoSrc={outroFailed ? null : "/videos/module-01-outro.mp4"}
              fallbackImageSrc="/characters/celebrating.png"
              onBackToDashboard={() => { window.location.href = "/dashboard"; }}
              onPlayAgain={() => { window.location.reload(); }}
            />
          </FullScene>
        );

      default:
        return null;
    }
  };

  /* ---------- render ---------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, #1a0612 70%, #0a0410 100%)",
      }}
    >
      {/* Warm dusk backdrop — replaces the cyber LessonArena3D 3D scene
          so the warm Pixar exercises sit on a tonally-matching page chrome
          instead of a cold navy arena. The pulse / mood reactivity from
          the old arena is sacrificed for visual cohesion. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(255, 178, 110, 0.18) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 20% 90%, rgba(196, 60, 106, 0.14) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 50% 50%, rgba(255, 220, 168, 0.05) 0%, transparent 70%)",
        }}
      />
      {/* Reference the mood/pulse vars so they don't trigger unused-var
          warnings now that the arena is no longer rendered. */}
      <span style={{ display: "none" }}>
        {arena3DMood}-{arena3DPulseKey}
      </span>
      <style>{CSS}</style>
      <LessonAmbience />

      {cutsceneSlides && (
        <StoryCutscene
          slides={cutsceneSlides}
          title={cutsceneTitle}
          onComplete={() => setCutscene(null)}
        />
      )}

      {!cutscene && (
        <>
          <LessonHUD
            characterName="ADAM"
            characterImage="/game/characters/adam-idle.png"
            weekNumber={CURRENT_WEEK}
            weekTitle="Passwords: The Secret Code"
            currentScreen={screen}
            totalScreens={18}
            xpEarned={lessonXp}
          />

          {/* Inventory bar — earn-tracking strip below the HUD. The
              bar is fixed-positioned so it sits over the lesson body
              without consuming layout space. */}
          <InventoryBar currentScreen={screen} />

          {/* Earn-flight overlay — animates icons from action point
              into their slot. Mounted once; watches provider state. */}
          <EarnItemEffect />

          {/* Did-you-know reveal — pops the speech bubble after the
              fly lands. Auto-dismisses after 5s; tap to dismiss. */}
          <RevealOverlay />

          {/* Save & Exit button — kids can quit and resume later. The
              autosave effect persists every state change to localStorage,
              so this button just navigates home; the resume prompt
              picks them back up next mount. */}
          {screen > 0 && screen < 17 && (
            <button
              type="button"
              onClick={saveAndExit}
              title="Save your progress and come back later"
              style={{
                position: "fixed",
                top: 16,
                right: 16,
                zIndex: 100,
                background: "linear-gradient(135deg, rgba(255,213,138,0.22), rgba(255,155,74,0.18))",
                border: "1px solid rgba(255,220,180,0.55)",
                color: "#fff7e6",
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "8px 14px",
                borderRadius: 999,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 18px rgba(255,178,110,0.32)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(255,178,110,0.55)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 18px rgba(255,178,110,0.32)"; }}
            >
              💾 Save &amp; Exit
            </button>
          )}

          {/* Resume prompt — appears once on mount if a saved state for
              this week exists. Offers "Resume" or "Start fresh". */}
          {showResumePrompt && savedState && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(5,8,18,0.85)",
                backdropFilter: "blur(8px)",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <div style={{
                width: "100%", maxWidth: 460,
                background: "linear-gradient(160deg, rgba(20,30,55,0.95) 0%, rgba(15,40,30,0.92) 100%)",
                border: "1px solid rgba(255,213,138,0.45)",
                borderRadius: 22,
                padding: "30px 26px",
                textAlign: "center",
                boxShadow: "0 30px 60px -20px rgba(255,213,138,0.5)",
              }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>💾</div>
                <h2 style={{
                  color: "#fff", fontSize: 24, fontWeight: 900, margin: "0 0 6px",
                  background: "linear-gradient(135deg, #ffd58a, #a06aff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  Welcome back!
                </h2>
                <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.5, margin: "0 0 18px" }}>
                  You were in the middle of <strong style={{ color: "#fff" }}>Week {CURRENT_WEEK}</strong>.
                  Pick up where you left off, or start the week again from the beginning?
                </p>
                <div style={{
                  display: "flex", gap: 10, justifyContent: "center",
                  fontFamily: "ui-monospace, monospace", fontSize: 11,
                  color: "#94a3b8", letterSpacing: 1, marginBottom: 18,
                  flexWrap: "wrap",
                }}>
                  <span>SCREEN {savedState.screen + 1} / 18</span>
                  <span>·</span>
                  <span>{savedState.coins} 🪙</span>
                  <span>·</span>
                  <span>{savedState.lessonXp} XP</span>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={resumeFromSaved}
                    style={{
                      background: "linear-gradient(135deg, #f97316, #f59e0b)",
                      color: "#fff", fontWeight: 900, fontSize: 15,
                      borderRadius: 14, padding: "12px 28px",
                      border: "none", cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(249,115,22,0.4)",
                    }}
                  >
                    Resume →
                  </button>
                  <button
                    type="button"
                    onClick={startFreshFromSaved}
                    style={{
                      background: "transparent",
                      color: "#cbd5e1", fontWeight: 700, fontSize: 14,
                      borderRadius: 14, padding: "12px 22px",
                      border: "1px solid rgba(255,255,255,0.25)",
                      cursor: "pointer",
                    }}
                  >
                    Start fresh
                  </button>
                </div>
              </div>
            </div>
          )}

          <CharacterGuide
            character="adam"
            position="left"
            mood={adamReaction.mood}
            message={adamReaction.message}
          />
          <CharacterGuide
            character="layla"
            position="right"
            mood={laylaReaction.mood}
            message={laylaReaction.message}
          />
        </>
      )}

      {xpPopups.map((p) => (
        <XPPopup
          key={p.id}
          amount={p.amount}
          x={p.x}
          y={p.y}
          onComplete={() => removeXpPopup(p.id)}
        />
      ))}

      {pendingLevelUp && (
        <LevelUpCelebration
          oldRank={pendingLevelUp.oldRank}
          newRank={pendingLevelUp.newRank}
          totalXP={pendingLevelUp.totalXP}
          onDismiss={() => setPendingLevelUp(null)}
        />
      )}

      <MuteToggle />

      {/* Combo counter — visible when combo > 0 */}
      {lessonCombo > 0 && !cutscene && (
        <div
          key={comboPulseKey}
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            zIndex: 45,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: Math.min(40, 20 + lessonCombo * 3),
            fontWeight: 800,
            color: "#ffd58a",
            letterSpacing: "-0.01em",
            textShadow: "0 0 14px rgba(255,213,138,0.8), 2px 2px 0 rgba(0,0,0,0.6)",
            pointerEvents: "none",
            animation: "juiceComboPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {lessonCombo}× COMBO!
        </div>
      )}

      {/* Particle bursts (one per event) */}
      {burstList.map((b) => (
        <ParticleBurst
          key={b.id}
          x={b.x}
          y={b.y}
          colour={b.colour}
          count={b.count}
          onComplete={() => setBurstList((prev) => prev.filter((pp) => pp.id !== b.id))}
        />
      ))}

      {/* Floating feedback texts */}
      {floatList.map((f) => (
        <FloatingText
          key={f.id}
          text={f.text}
          x={f.x}
          y={f.y}
          colour={f.colour}
          size={f.size}
          onComplete={() => setFloatList((prev) => prev.filter((ff) => ff.id !== f.id))}
        />
      ))}

      <style>{`
        @keyframes juiceComboPop {
          0% { opacity: 0; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}</style>
      <div className="floating-orbs-wrap"><FloatingOrbs /></div>
      {/* Sticky header */}
      <header className="print-hide" style={{
        position: "sticky", top: 0, zIndex: 40, padding: "12px 20px",
        background: "rgba(26,16,51,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/dashboard" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 600, minWidth: 48, minHeight: 48, display: "flex", alignItems: "center", borderRadius: 12, padding: "4px 12px" }}>
          ← Dashboard
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(255,178,110,0.4)" }}>
            <span style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>AX</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>Week 1 · Passwords: The Secret Code</span>
        </div>
        <CoinCounter coins={coins} animKey={coinAnimKey} />
      </header>
      <div className="progress-wrap print-hide"><ProgressBar step={screen} /></div>
      <div className="step-dots-wrap print-hide"><StepDots step={screen} /></div>
      <main style={{ maxWidth: 850, margin: "0 auto", padding: "16px 24px 80px", position: "relative", zIndex: 1 }}>
        <ScreenTransition
          transitionKey={screen}
          type={screenTransitionType(screen, navDirectionRef.current)}
          duration={500}
          onTransitionStart={() => playSFX("transition")}
        >
          <ScreenShake trigger={shakeTrigger}>
            <ExerciseErrorBoundary
              key={screen}
              onSkip={() => navigate(Math.min(18, screen + 1))}
            >
              {renderScreen()}
            </ExerciseErrorBoundary>
          </ScreenShake>
        </ScreenTransition>
      </main>

      {/* ── Boss battle full-screen overlay (outside <main> so it fills the viewport) ── */}
      {showBossBattle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
          <BossBattle
            bossName="HACKER RACCOON"
            questions={BOSS_QUIZ.map((q) => ({
              question: q.q,
              answers: q.opts,
              correctIndex: q.correct,
            }))}
            onEnd={(won, stats) => {
              setShowBossBattle(false);
              setBossScore(won ? stats.combo : 0);
              setBossDone(true);
              if (won) navigate(16);
            }}
          />
        </div>
      )}

      {/* ── DRAG GHOSTS (rendered outside overflow:hidden main) ── */}
      {shieldDragging && shieldPos && (
        <div style={{
          position: "fixed", left: shieldPos.x, top: shieldPos.y, pointerEvents: "none", zIndex: 9999,
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(124,200,154,0.2)", border: "3px solid #5fb37a",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          boxShadow: "0 0 30px rgba(124,200,154,0.5)",
        }}>
          🛡️
        </div>
      )}
      {dragging && (() => {
        const pw = PASSWORDS_8.find((p) => p.id === dragging);
        if (!pw) return null;
        return (
          <div style={{
            position: "fixed", left: dragX, top: dragY, pointerEvents: "none", zIndex: 9999,
            background: pw.bg, border: `2px solid ${pw.border}`, borderRadius: 12, padding: "10px 16px",
            color: pw.color, fontFamily: "monospace", fontWeight: 700, fontSize: 14,
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          }}>
            {pw.text}
          </div>
        );
      })()}
    </div>
  );
}
