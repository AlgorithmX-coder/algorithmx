"use client";

/**
 * BossBattle - raw PixiJS quiz-battle for ages 6-9.
 * Manual Application.init() + canvas append; no framework wrappers.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Application,
  Assets,
  BlurFilter,
  type Container,
  Graphics,
  Sprite,
  Text,
  type Texture,
  type Ticker,
} from "pixi.js";
import { playSound, playBGM, stopBGM, SoundManager } from "@/app/lib/sounds";
import { addXP, earnBadge, type RankInfo } from "@/app/lib/progression";
import LevelUpCelebration from "@/app/components/LevelUpCelebration";

// Three.js arena environment - dynamically imported so SSR doesn't try to
// execute WebGL code. Renders behind the transparent PixiJS canvas.
const Arena3D = dynamic(() => import("./Arena3D"), { ssr: false });

// CosmicRealmBackdrop import removed - was a third WebGL context running
// alongside Arena3D + PixiJS, contributing to the perceived jank. The
// Arena3D scene itself already carries the cosmic theme via its palette,
// so the separate realm canvas is overkill. File kept on disk for
// possible reuse.

// Live R3F backdrop for the CHOOSE YOUR HERO screen - calmer cousin of
// BossEnergyCore, sets a "preparation" mood before the boss reactor.
const HeroSelectAtmosphere = dynamic(
  () => import("@/app/components/HeroSelectAtmosphere"),
  { ssr: false },
);

import { useIsMobile } from "@/app/lib/useIsMobile";
import { useComfortMode } from "@/app/lib/comfortMode";
import {
  getQualitySettings,
  scaledParticleCount,
  playSoftWrong,
} from "@/app/lib/gameEngine";

export interface Question {
  question: string;
  answers: string[];
  correctIndex: number;
  explanation?: string;
  /**
   * Stable identifier passed back to onQuestionAnswered so the parent
   * can persist per-question outcomes without storing question text.
   * If omitted, defaults to "boss-<index>" inside the component.
   */
  key?: string;
}

/** Per-question outcome emitted from BossBattle to the parent. */
export interface BossQuestionOutcome {
  /** Stable key, falls back to "boss-<index>". */
  key: string;
  selectedIndex: number; // -1 if timed out
  correctIndex: number;
  wasCorrect: boolean;
  /** 1-based position in the boss run. */
  position: number;
  /** Phase id this question belonged to. Empty string when phases are
   *  not used (legacy flat-question mode). */
  phaseId?: string;
}

/**
 * Multi-phase boss support.
 *
 * The boss is currently a single sustained 15-question run. The Week 1
 * plan restructures it into 5 concept-tagged acts: Strength, Secrecy,
 * Uniqueness, Phishing, Final Showdown. Each phase contains its own
 * curated questions. Phases are an optional prop - boss falls back to
 * the flat `questions` list when `phases` is absent, so older callers
 * are unaffected.
 *
 * The `kind: "mcq"` discriminator is the only kind implemented today.
 * `"miniHospital" | "miniRescue" | "miniInspector"` are reserved for
 * the upcoming mini-mechanic phases (Hospital-in-boss, Account-rescue-
 * in-boss, Phish-Inspector-in-boss). The renderer will branch on kind
 * when those land.
 */
export type BossPhase =
  | {
      kind: "mcq";
      /** Stable id like "phase-strength". Persisted to analytics. */
      id: string;
      /** Display label, e.g. "Strength" - shown in the phase badge. */
      label: string;
      /** Short tagline shown in the phase-change announcement, e.g. "Round 1 - The Strength Test!" */
      announceText: string;
      /** Announcement colour tone. Must be one of the existing toast tones. */
      announceTone: "blue" | "red" | "gold" | "cyan";
      questions: Question[];
    };

/** Per-phase result included in the boss end stats. */
export interface BossPhaseResult {
  phaseId: string;
  label: string;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
}

/** Final stats emitted on boss end - enriched beyond the legacy
 * combo/accuracy/xp triple so callers can persist proper analytics. */
export interface BossEndStats {
  combo: number;
  accuracy: number;
  xp: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  durationMs: number;
  /** Per-phase breakdown when phased mode was used. Empty otherwise. */
  phaseResults: BossPhaseResult[];
}

export interface BossBattleProps {
  /** Legacy flat question list. Used when `phases` is absent. */
  questions?: Question[];
  /** New phased mode. When set, supersedes `questions`. */
  phases?: BossPhase[];
  bossName?: string;
  onEnd?: (won: boolean, stats: BossEndStats) => void;
  /**
   * Optional per-question hook fired the moment each answer resolves
   * (correct, wrong, or timed out). Used by the lesson to write a
   * QuestionResponse row + emit the wrong_answer analytics event.
   */
  onQuestionAnswered?: (outcome: BossQuestionOutcome) => void;
}

const EASY_QUESTIONS: Question[] = [
  { question: "What makes a strong password?", answers: ["Mix of letters, numbers & symbols", "Your name", "123456", "password"], correctIndex: 0, explanation: "A strong password mixes letters, numbers and symbols - making it super hard to guess!" },
  { question: "Should you share your password?", answers: ["Only with friends", "Write it on paper", "Never share it", "Tell everyone"], correctIndex: 2, explanation: "Your password is YOUR secret - never share it with anyone except your parents!" },
  { question: "A stranger online asks your name. What do you do?", answers: ["Tell them", "Don't tell them", "Ask their name first", "Give a nickname"], correctIndex: 1, explanation: "Never give personal information to strangers online - you don't know who they really are!" },
  { question: "What is a password for?", answers: ["Showing off", "Keeping accounts safe", "Sharing with friends", "Nothing important"], correctIndex: 1, explanation: "Passwords keep your accounts safe from people who shouldn't be in them!" },
  { question: "Who should know your password?", answers: ["Your best friend", "Only you and your parents", "Your teacher", "Everyone"], correctIndex: 1, explanation: "Only you and your parents should know your password - nobody else!" },
  { question: "Someone says they'll give you free V-Bucks. Is this real?", answers: ["Yes click the link", "Maybe", "No it's a scam", "Ask for proof"], correctIndex: 2, explanation: "Free V-Bucks offers are almost always scams trying to steal your account!" },
  { question: "What should your password NOT be?", answers: ["Random letters and numbers", "Your birthday", "Something hard to guess", "A mix of symbols"], correctIndex: 1, explanation: "Birthdays are easy to guess - never use personal dates as passwords!" },
  { question: "Your friend wants to use your tablet. What do you do?", answers: ["Give them your password", "Log out of your accounts first", "Leave everything open", "Say no"], correctIndex: 1, explanation: "Always log out before letting someone else use your device!" },
  { question: "A website asks for your home address. What do you do?", answers: ["Type it in", "Tell a parent before typing anything", "Make one up", "Give your school address"], correctIndex: 1, explanation: "Always check with a parent before entering personal information online!" },
  { question: "Why do we lock devices with a passcode?", answers: ["Because it looks cool", "To stop others getting in", "Because mum said so", "No reason"], correctIndex: 1, explanation: "Passcodes stop other people from accessing your private information!" },
];

const MEDIUM_QUESTIONS: Question[] = [
  { question: "Which password is the strongest?", answers: ["Sunshine2024", "Tr0pic4l$unR1se!", "ilovecats", "MyName123"], correctIndex: 1, explanation: "Tr0pic4l$unR1se! uses uppercase, lowercase, numbers AND symbols - maximum strength!" },
  { question: "An email says 'Your account will be deleted! Click here!' What is this?", answers: ["A real warning", "A phishing scam", "A helpful reminder", "A software update"], correctIndex: 1, explanation: "Urgent scary emails trying to make you click are almost always phishing scams!" },
  { question: "What is two-factor authentication?", answers: ["Having two passwords", "A second check to prove it's you", "Logging in twice", "Using two devices"], correctIndex: 1, explanation: "Two-factor adds a second check - like a code sent to your phone - so even if someone has your password, they can't get in!" },
  { question: "A game asks you to create an account. What email should you use?", answers: ["Use mum's email without asking", "Ask a parent to help set one up", "Make up a fake email", "Use your school email"], correctIndex: 1, explanation: "Always ask a parent to help you set up accounts - they can make sure it's safe!" },
  { question: "Which of these is private information?", answers: ["Your favourite colour", "Your home address", "Your favourite food", "The weather"], correctIndex: 1, explanation: "Your home address is private - never share it with people you don't trust!" },
  { question: "A pop-up says 'Your computer has a virus! Call this number!' What do you do?", answers: ["Call the number", "Close it and tell an adult", "Download their fix", "Turn off the computer forever"], correctIndex: 1, explanation: "Fake virus warnings are scams - close them and tell a trusted adult!" },
  { question: "Why use a DIFFERENT password for each account?", answers: ["It's more fun", "If one is stolen the others stay safe", "Websites make you", "It doesn't matter"], correctIndex: 1, explanation: "If a hacker steals one password, they can't get into your other accounts if they're all different!" },
  { question: "What does a padlock icon in the browser mean?", answers: ["The website is locked", "The connection is encrypted", "You can't visit it", "The website is dangerous"], correctIndex: 1, explanation: "The padlock means your connection to that website is encrypted - your data is protected!" },
  { question: "Someone at school says they know a game cheat and asks for your login. What do you do?", answers: ["Give it to them", "Say no and don't share your login", "Ask a teacher first", "Share it but change password later"], correctIndex: 1, explanation: "Never share your login with anyone - real cheats don't need your password!" },
  { question: "What is the safest way to remember lots of passwords?", answers: ["Write them on a sticky note", "Use a password manager app", "Use the same password everywhere", "Memorise them all"], correctIndex: 1, explanation: "Password managers safely store all your passwords so you only need to remember one master password!" },
];

const HARD_QUESTIONS: Question[] = [
  { question: "You want to check email on a friend's computer. What's safest?", answers: ["Just log in normally", "Use private/incognito window and log out after", "Don't check email at all", "Ask your friend to look away"], correctIndex: 1, explanation: "Incognito mode doesn't save your login - and always log out when you're done on someone else's device!" },
  { question: "A free game download asks you to disable your antivirus first. What should you do?", answers: ["Disable it temporarily", "Don't download it - that's a red flag", "Only if a friend recommended it", "Download to a USB instead"], correctIndex: 1, explanation: "Any download that asks you to turn off protection is almost certainly malware!" },
  { question: "Your account was logged into from a city you've never visited. What's the FIRST thing to do?", answers: ["Ignore it", "Change your password immediately", "Wait and see", "Delete the account"], correctIndex: 1, explanation: "If someone else logged into your account, change your password RIGHT AWAY before they do more damage!" },
  { question: "Which is the BEST security question answer?", answers: ["Your real mother's maiden name", "A made-up answer only you know", "Your pet's real name", "Your birthday"], correctIndex: 1, explanation: "Made-up answers that only you know can't be guessed or found on social media!" },
  { question: "Your friend sends a link that looks like YouTube but the URL says 'y0utube.com'. What is this?", answers: ["YouTube's new address", "A fake website trying to steal your info", "A YouTube for kids", "A YouTube shortcut"], correctIndex: 1, explanation: "Fake URLs that look similar to real ones are used to trick people - always check the spelling!" },
  { question: "You made a strong password. When should you change it?", answers: ["Every single day", "If you think someone might have seen it", "Never - strong passwords last forever", "Only when the website asks"], correctIndex: 1, explanation: "Change your password whenever you suspect someone else might know it!" },
  { question: "A game asks permission for your photos, contacts, and location. What should you do?", answers: ["Allow everything", "Question why a game needs all that access", "Only allow photos", "Ask a friend what they did"], correctIndex: 1, explanation: "A game doesn't need your photos or contacts - be suspicious when apps ask for too many permissions!" },
  { question: "What makes public Wi-Fi (like at a cafe) risky?", answers: ["The Wi-Fi is slower", "Others on the network could see what you're doing", "The cafe might charge you", "Public Wi-Fi has more ads"], correctIndex: 1, explanation: "On public Wi-Fi, hackers can spy on what you're sending - avoid logging into important accounts!" },
  { question: "You get a message from 'your bank' asking to verify your account. You're 10 years old. What's wrong?", answers: ["Banks always send these", "You don't have a bank account so it's a scam", "Click to check just in case", "Forward it to parents to click"], correctIndex: 1, explanation: "If you don't have a bank account, any message from 'your bank' is definitely a scam!" },
  { question: "A site says your password was leaked and offers to check your email. Should you?", answers: ["Enter your email anywhere that checks", "Only use official sites like HaveIBeenPwned", "Never check", "Change your email instead"], correctIndex: 1, explanation: "Only use trusted official sites to check for breaches - random sites might be stealing your email!" },
];

// Children kept noticing the right answer was always in the same slot in
// the boss-battle quiz - the source data lists `correctIndex: 1` for most
// rows. Fisher-Yates shuffle each question's answers in place at module
// load and remap correctIndex so the right answer lands in a fresh slot
// every page load. Stable within a session so re-renders don't reshuffle.
function shuffleBossQuestions(arr: Question[]) {
  for (const q of arr) {
    const order = q.answers.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    q.answers = order.map((i) => q.answers[i]);
    q.correctIndex = order.indexOf(q.correctIndex);
  }
}
shuffleBossQuestions(EASY_QUESTIONS);
shuffleBossQuestions(MEDIUM_QUESTIONS);
shuffleBossQuestions(HARD_QUESTIONS);

const HP_MAX = 100;

// Achievement system - cumulative badge unlocks persisted to
// localStorage. Computed at end-of-fight and surfaced on the victory
// overlay. Pure end-of-run reward; no in-fight effect.
type AchievementDef = {
  id: string;
  icon: string;
  label: string;
  desc: string;
  accent: string;
};

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first-win",     icon: "🥇", label: "First Win",        desc: "Beat the Hacker Raccoon",   accent: "#fbbf24" },
  { id: "flawless",      icon: "💎", label: "Flawless",          desc: "Won without losing HP",     accent: "#7df0ff" },
  { id: "perfect",       icon: "🎯", label: "Pixel Perfect",     desc: "100% accuracy",             accent: "#10b981" },
  { id: "shield-save",   icon: "🛡",  label: "Shield Saved Me!",  desc: "Used your shield charge",   accent: "#60a5fa" },
  { id: "triple-strike", icon: "⚡", label: "Triple Strike",     desc: "Hit a 5+ combo",            accent: "#fde047" },
];

const BB_ACH_KEY = "bb-achievements";

function loadEarnedAchievements(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(BB_ACH_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveEarnedAchievements(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BB_ACH_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function computeAchievementsForRun(input: {
  heroHp: number;
  correct: number;
  totalAsked: number;
  maxCombo: number;
  usedShield: boolean;
  hasPriorWin: boolean;
}): string[] {
  const out: string[] = [];
  if (!input.hasPriorWin) out.push("first-win");
  if (input.heroHp >= HP_MAX) out.push("flawless");
  if (input.totalAsked > 0 && input.correct === input.totalAsked) out.push("perfect");
  if (input.usedShield) out.push("shield-save");
  if (input.maxCombo >= 5) out.push("triple-strike");
  return out;
}

// Three telegraphed boss-attack types - cycled per question. Pure
// visual/narrative variation; the answer logic doesn't change.
const ATTACK_META = [
  { name: "PHISHING LURE",   icon: "🪤", color: "#ff5fb3", glow: "rgba(255, 95, 179, 0.55)", tag: "Don't take the bait",     emblemColor: 0xff5fb3 },
  { name: "BRUTE FORCE",     icon: "🔨", color: "#ffb347", glow: "rgba(255, 179, 71, 0.55)", tag: "Hold your ground",        emblemColor: 0xffb347 },
  { name: "TRICK QUESTION",  icon: "🌀", color: "#7c5cff", glow: "rgba(124, 92, 255, 0.55)", tag: "Don't get fooled",        emblemColor: 0x7c5cff },
] as const;
const HERO_HEIGHT = 260;
const BOSS_HEIGHT = 300;

const ASSET_PATHS = {
  bg: "/game/backgrounds/cyber-classroom.png",
  adamIdle: "/game/characters/adam-idle.png",
  adamAttack: "/game/characters/adam-attack.png",
  adamHurt: "/game/characters/adam-hurt.png",
  adamCelebrate: "/game/characters/adam-celebrate.png",
  adamSelect: "/game/characters/adam-select.png",
  laylaIdle: "/game/characters/layla-idle.png",
  laylaAttack: "/game/characters/layla-attack.png",
  laylaHurt: "/game/characters/layla-hurt.png",
  laylaCelebrate: "/game/characters/layla-celebrate.png",
  laylaSelect: "/game/characters/layla-select.png",
  bossIdle: "/game/characters/raccoon-idle.png",
  bossAttack: "/game/characters/raccoon-attack.png",
  bossHurt: "/game/characters/raccoon-hurt.png",
  bossTaunt: "/game/characters/raccoon-taunt.png",
  bossDefeated: "/game/characters/raccoon-defeated.png",
} as const;

type HeroId = "adam" | "layla";

type HeroAnim = "idle" | "attack" | "hurt" | "celebrate";
type BossAnim = "idle" | "attack" | "hurt" | "taunt" | "defeated";

interface HeroTexSet {
  idle: Texture;
  attack: Texture;
  hurt: Texture;
  celebrate: Texture;
}

interface BossTexSet {
  idle: Texture;
  attack: Texture;
  hurt: Texture;
  taunt: Texture;
  defeated: Texture;
}

interface TextureBundle {
  bg: Texture;
  adam: HeroTexSet;
  layla: HeroTexSet;
  boss: BossTexSet;
}

interface Particle {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  gfx: Graphics;
}

interface FloatText {
  text: Text;
  vy: number;
  life: number;
  maxLife: number;
}

interface Tween {
  from: number;
  to: number;
  duration: number;
  elapsed: number;
  delay: number;
  onUpdate: (v: number) => void;
  onComplete?: () => void;
  ease?: (t: number) => number;
}

interface Timer {
  delay: number;
  fn: () => void;
}

interface GameState {
  app: Application | null;
  stage: Container | null;
  textures: TextureBundle | null;
  selectedHero: HeroId;
  hero: Sprite | null;
  boss: Sprite | null;
  bg: Sprite | null;
  baseHeroX: number;
  baseHeroY: number;
  baseBossX: number;
  baseBossY: number;
  heroAnim: HeroAnim;
  bossAnim: BossAnim;
  heroAnimTimer: number;
  bossAnimTimer: number;
  heroLocked: boolean;
  bossLocked: boolean;
  heroOffsetX: number;
  bossOffsetX: number;
  heroScaleMul: number;
  bossScaleMul: number;
  bossRotation: number;
  shakeIntensity: number;
  shakeDuration: number;
  particles: Particle[];
  floatTexts: FloatText[];
  tweens: Tween[];
  timers: Timer[];
  time: number;
  // Dynamic camera (zoom around focus point + pan)
  cameraScale: number;
  cameraFocusX: number;
  cameraFocusY: number;
  cameraPanX: number;
  cameraPanY: number;
  // Reactive background overlay (colour rect above bg, below characters)
  bgOverlay: Graphics | null;
  bgOverlayAlpha: number;
  bgOverlayColor: number;
  bgOverlayPulseAlpha: number; // phase-3 slow pulse (0..1 lerps between min/max)
  // Intro / VFX
  heroAlpha: number;           // hero sprite alpha - for intro fade-in
  bossAlpha: number;           // boss sprite alpha - for intro reveal
  bossYOffset: number;         // vertical offset for intro drop-in
  hitStopUntil: number;        // timestamp (g.time + N) when hit-stop ends
  /**
   * Comfort-mode flag mirrored from the React `comfort.enabled` hook.
   * When true the helper functions soften effects: shorter hit-stop,
   * lower-intensity shake, no overlay flashes above a threshold.
   * Set from the component via a useEffect so module-level helpers
   * (playerAttack, bossAttack, triggerHitStop) can react without
   * needing direct access to the hook.
   */
  comfortReduceMotion: boolean;
  // 3D-ish stagecraft
  heroShadow: Graphics | null;
  bossShadow: Graphics | null;
  heroReflection: Sprite | null;
  bossReflection: Sprite | null;
  heroGlow: Graphics | null;
  bossGlow: Graphics | null;
  // Tighter rim-light layer in front of the wide glow - same colour but
  // smaller radius and brighter alpha, so the silhouette pops harder.
  heroRim: Graphics | null;
  bossRim: Graphics | null;
  // Floor energy rings under each fighter (stance circles). Scale +
  // alpha are HP-driven so the kid sees the stakes physically.
  heroFloorRing: Graphics | null;
  bossFloorRing: Graphics | null;
  heroShadowAlpha: number;
  bossShadowAlpha: number;
  heroGlowAlpha: number;       // default 0.06, flashes to 0.15 on correct
  bossGlowAlpha: number;       // default 0.07, flashes on wrong
  bossGlowColor: number;       // phase-dependent
  // HP-mirror for the floor ring scaling (lerped each tick toward HP %).
  heroHpPct: number;
  // Sustained super-ready zoom - when superReady is true, lerp toward
  // 1.08 multiplier on cameraScale; releases back to 1.0 when used.
  superZoomActive: boolean;
  superZoomMul: number;
  // Squash & stretch multipliers (per axis, on top of heroScaleMul)
  heroSquashX: number;
  heroSquashY: number;
  bossSquashX: number;
  bossSquashY: number;
  // Tint flashes (per-character brief colour flashes)
  heroTintFlashColor: number;
  heroTintFlashMs: number;
  bossTintFlashColor: number;
  bossTintFlashMs: number;
  // Phase-linked boss HP percentage, mirrored from React for tick access
  bossHpPct: number;
  // Parallax mouse offsets in normalized -0.5..0.5 space
  mouseOffsetX: number;
  mouseOffsetY: number;
  // Adaptive difficulty (invisible)
  difficultyLevel: 0 | 1 | 2;
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}
function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeInQuad(t: number) {
  return t * t;
}
function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
  if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
  t -= 2.625 / d1; return n1 * t * t + 0.984375;
}
function easeOutElastic(t: number) {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function addTween(g: GameState, t: Omit<Tween, "elapsed">) {
  g.tweens.push({ ...t, elapsed: 0 });
}
function schedule(g: GameState, delay: number, fn: () => void) {
  g.timers.push({ delay, fn });
}

// Hard cap on simultaneous Pixi particles so long sessions never
// accumulate enough to tank framerate on mobile. When the cap is hit
// new spawns are silently skipped - the oldest particles will fade
// out within ~1s and free up slots.
const BB_PARTICLE_CAP = 220;

function spawnParticles(
  g: GameState,
  x: number,
  y: number,
  count: number,
  colors: number[]
) {
  if (!g.stage) return;
  // Adaptive quality: low-tier devices render fewer particles. This
  // single wrap covers every spawnParticles call in the file
  // (player attacks, boss attacks, victory burst, defeat dust, intro
  // dust) without touching each call site.
  const scaled = scaledParticleCount(count);
  for (let i = 0; i < scaled; i++) {
    if (g.particles.length >= BB_PARTICLE_CAP) break;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 2 + Math.random() * 4;
    const gfx = new Graphics();
    gfx.circle(0, 0, size).fill(color);
    gfx.x = x;
    gfx.y = y;
    g.stage.addChild(gfx);
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    g.particles.push({
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 1,
      maxLife: 1,
      gfx,
    });
  }
}

function spawnFloatText(
  g: GameState,
  x: number,
  y: number,
  text: string,
  color: number
) {
  if (!g.stage) return;
  const t = new Text({
    text,
    style: {
      fontFamily: "Space Grotesk, Arial, sans-serif",
      fontSize: 36,
      fontWeight: "700",
      fill: color,
      stroke: { color: 0x0f172a, width: 4 },
    },
  });
  t.anchor.set(0.5, 0.5);
  t.x = x;
  t.y = y;
  g.stage.addChild(t);
  g.floatTexts.push({ text: t, vy: -2, life: 0, maxLife: 800 });
  playSound("xpGain");
}

/** Spawn a scaled damage text appropriate for the damage tier. */
function spawnDamageFx(
  g: GameState,
  x: number,
  y: number,
  damage: number,
  kind: "hero-hits-boss" | "boss-hits-hero" | "super"
) {
  if (!g.stage) return;
  const makeText = (text: string, color: number, fontSize: number, bold = true) => {
    const t = new Text({
      text,
      style: {
        fontFamily: "Space Grotesk, Arial, sans-serif",
        fontSize,
        fontWeight: bold ? "700" : "500",
        fill: color,
        stroke: { color: 0x0f172a, width: 4 },
      },
    });
    t.anchor.set(0.5, 0.5);
    return t;
  };
  if (kind === "super") {
    const main = makeText(`-${damage} SUPER!`, 0xfde047, 54);
    main.x = x; main.y = y - 60;
    g.stage.addChild(main);
    g.floatTexts.push({ text: main, vy: -2.5, life: 0, maxLife: 1000 });
    return;
  }
  if (kind === "boss-hits-hero") {
    const main = makeText(`-${damage}`, 0xef4444, 40);
    main.x = x; main.y = y - 60;
    g.stage.addChild(main);
    g.floatTexts.push({ text: main, vy: -2, life: 0, maxLife: 900 });
    if (Math.random() < 0.3) {
      const ouch = makeText("OUCH!", 0xef4444, 26);
      ouch.x = x; ouch.y = y - 30;
      g.stage.addChild(ouch);
      g.floatTexts.push({ text: ouch, vy: -1.6, life: 0, maxLife: 900 });
    }
    return;
  }
  // hero-hits-boss - tiered by damage
  if (damage <= 10) {
    const main = makeText(`-${damage}`, 0x10b981, 36);
    main.x = x; main.y = y - 60;
    g.stage.addChild(main);
    g.floatTexts.push({ text: main, vy: -2, life: 0, maxLife: 900 });
  } else if (damage <= 20) {
    const main = makeText(`-${damage}`, 0x22d3ee, 44);
    main.x = x; main.y = y - 60;
    g.stage.addChild(main);
    g.floatTexts.push({ text: main, vy: -2, life: 0, maxLife: 950 });
    const sub = makeText("STRONG!", 0x22d3ee, 22);
    sub.x = x; sub.y = y - 28;
    g.stage.addChild(sub);
    g.floatTexts.push({ text: sub, vy: -1.7, life: 0, maxLife: 900 });
  } else {
    const main = makeText(`-${damage} CRITICAL!`, 0xfde047, 48);
    main.x = x; main.y = y - 60;
    g.stage.addChild(main);
    g.floatTexts.push({ text: main, vy: -2.2, life: 0, maxLife: 1000 });
  }
}

function triggerShake(g: GameState, intensity: number, duration: number) {
  // Comfort mode caps shake at ~40% intensity so vestibular-sensitive
  // children get the visual cue without the punch.
  const scaled = g.comfortReduceMotion ? intensity * 0.4 : intensity;
  g.shakeIntensity = Math.max(g.shakeIntensity, scaled);
  g.shakeDuration = Math.max(g.shakeDuration, duration);
  if (intensity >= 6 && !g.comfortReduceMotion) playSound("screenShake");
}

/** Pause rendering for N ms ("hit-stop" freeze). */
function triggerHitStop(g: GameState, ms: number) {
  if (!g.app) return;
  // Comfort mode shortens hit-stop dramatically so the freeze doesn't
  // feel like the game is broken. We keep a minimum of 16ms (1 frame
  // at 60Hz) so the impact still registers physically.
  const effective = g.comfortReduceMotion ? Math.min(ms, 16) : ms;
  if (effective <= 0) return;
  g.app.ticker.speed = 0;
  window.setTimeout(() => {
    if (g.app) g.app.ticker.speed = 1;
  }, effective);
}

/**
 * Slow-motion: ramps `ticker.speed` down to `factor` (e.g. 0.4) and
 * holds for `duration` ms, then snaps back to 1. Used for the final
 * blow + defeat moments so the climax reads as cinematic instead of
 * abrupt. Skipped entirely under comfort mode (the time dilation
 * feels broken when motion is supposed to be reduced).
 */
function triggerSlowMo(g: GameState, factor: number, duration: number) {
  if (!g.app) return;
  if (g.comfortReduceMotion) return;
  g.app.ticker.speed = factor;
  window.setTimeout(() => {
    if (g.app) g.app.ticker.speed = 1;
  }, duration);
}

/**
 * Zoom the stage toward a focal point over 200ms, then ease back to 1.0 over 300ms.
 * Existing camera tweens are flushed first so pulses don't stack awkwardly.
 */
function cameraPulse(
  g: GameState,
  toScale: number,
  focusX: number,
  focusY: number,
  panX: number = 0
) {
  g.cameraFocusX = focusX;
  g.cameraFocusY = focusY;
  addTween(g, {
    from: 1, to: toScale, duration: 200, delay: 0,
    onUpdate: (v) => { g.cameraScale = v; },
    ease: easeOutQuad,
  });
  addTween(g, {
    from: toScale, to: 1, duration: 300, delay: 200,
    onUpdate: (v) => { g.cameraScale = v; },
    ease: easeOutQuad,
  });
  if (panX !== 0) {
    addTween(g, {
      from: 0, to: panX, duration: 200, delay: 0,
      onUpdate: (v) => { g.cameraPanX = v; },
      ease: easeOutQuad,
    });
    addTween(g, {
      from: panX, to: 0, duration: 300, delay: 200,
      onUpdate: (v) => { g.cameraPanX = v; },
      ease: easeOutQuad,
    });
  }
}

function flashHeroTint(g: GameState, color: number, ms: number) {
  g.heroTintFlashColor = color;
  g.heroTintFlashMs = Math.max(g.heroTintFlashMs, ms);
}
function flashBossTint(g: GameState, color: number, ms: number) {
  g.bossTintFlashColor = color;
  g.bossTintFlashMs = Math.max(g.bossTintFlashMs, ms);
}
function flashGlow(
  g: GameState,
  which: "hero" | "boss",
  peakAlpha: number,
  baseAlpha: number,
  upMs: number,
  downMs: number
) {
  const assign = which === "hero"
    ? (v: number) => { g.heroGlowAlpha = v; }
    : (v: number) => { g.bossGlowAlpha = v; };
  addTween(g, {
    from: baseAlpha, to: peakAlpha, duration: upMs, delay: 0,
    onUpdate: assign, ease: easeOutQuad,
  });
  addTween(g, {
    from: peakAlpha, to: baseAlpha, duration: downMs, delay: upMs,
    onUpdate: assign, ease: easeOutQuad,
  });
}
function squashStretch(
  g: GameState,
  which: "hero" | "boss",
  targetX: number,
  targetY: number,
  outMs: number,
  backMs: number,
  backEase: (t: number) => number = easeOutQuad
) {
  const xKey = which === "hero" ? "heroSquashX" : "bossSquashX";
  const yKey = which === "hero" ? "heroSquashY" : "bossSquashY";
  addTween(g, {
    from: 1, to: targetX, duration: outMs, delay: 0,
    onUpdate: (v) => { (g as unknown as Record<string, number>)[xKey] = v; },
    ease: easeOutQuad,
  });
  addTween(g, {
    from: 1, to: targetY, duration: outMs, delay: 0,
    onUpdate: (v) => { (g as unknown as Record<string, number>)[yKey] = v; },
    ease: easeOutQuad,
  });
  addTween(g, {
    from: targetX, to: 1, duration: backMs, delay: outMs,
    onUpdate: (v) => { (g as unknown as Record<string, number>)[xKey] = v; },
    ease: backEase,
  });
  addTween(g, {
    from: targetY, to: 1, duration: backMs, delay: outMs,
    onUpdate: (v) => { (g as unknown as Record<string, number>)[yKey] = v; },
    ease: backEase,
  });
}

/** Brief colour wash across the stage via the bg-overlay Graphics. */
function flashOverlay(g: GameState, color: number, peakAlpha: number, fadeMs: number) {
  g.bgOverlayColor = color;
  g.bgOverlayAlpha = peakAlpha;
  addTween(g, {
    from: peakAlpha, to: 0, duration: fadeMs, delay: 0,
    onUpdate: (v) => { g.bgOverlayAlpha = v; },
    ease: easeOutQuad,
  });
}

function playerAttack(
  g: GameState,
  damage: number,
  opts: { isSuper?: boolean } = {}
) {
  if (!g.hero || !g.boss) return;

  // Damage-scaled FX tiers
  let particles = 22;
  let shake = 5;
  let zoom = 1.08;
  let hitStop = 0;
  let lunge = 60;
  const colors: number[] = [0x3b82f6, 0x10b981, 0xffffff, 0x60a5fa];

  if (opts.isSuper) {
    particles = 45; shake = 12; zoom = 1.14; hitStop = 100; lunge = 80;
    colors.push(0xfde047, 0xf97316);
  } else if (damage <= 10) {
    // Even the smallest hit gets some hit-stop so EVERY answer feels
    // physical - no "soft" hits that read as a number tick.
    particles = 12; shake = 3; zoom = 1.02; hitStop = 30;
  } else if (damage <= 20) {
    particles = 20; shake = 6; zoom = 1.06; hitStop = 40;
  } else {
    particles = 30; shake = 8; zoom = 1.10; hitStop = 60;
  }

  g.heroAnim = "attack";
  g.heroAnimTimer = 500;
  playSound("heroAttack");

  addTween(g, {
    from: 0, to: lunge, duration: 150, delay: 0,
    onUpdate: (v) => { g.heroOffsetX = v; },
    ease: easeOutBack,
  });
  addTween(g, {
    from: lunge, to: 0, duration: 200, delay: 150,
    onUpdate: (v) => { g.heroOffsetX = v; },
    ease: easeOutQuad,
  });

  // Hero stretch forward (horizontal momentum) then settle
  squashStretch(g, "hero", 1.15, 0.88, 100, 200);
  // White tint flash during the swing, then a brief glow flare
  flashHeroTint(g, 0xffffff, 100);
  flashGlow(g, "hero", 0.15, 0.06, 100, 200);

  if (zoom > 1) cameraPulse(g, zoom, g.boss.x, g.boss.y, -20);

  schedule(g, 150, () => {
    if (!g.boss) return;
    g.bossAnim = "hurt";
    g.bossAnimTimer = 500;
    addTween(g, {
      from: 0, to: 20, duration: 100, delay: 0,
      onUpdate: (v) => { g.bossOffsetX = v; },
      ease: easeOutQuad,
    });
    addTween(g, {
      from: 20, to: 0, duration: 200, delay: 100,
      onUpdate: (v) => { g.bossOffsetX = v; },
      ease: easeOutQuad,
    });
    playSound("hitImpact");
    playSound("bossHurt");
    spawnParticles(g, g.boss.x, g.boss.y, particles, colors);
    spawnDamageFx(g, g.boss.x, g.boss.y, damage, opts.isSuper ? "super" : "hero-hits-boss");
    flashOverlay(g, 0x10b981, opts.isSuper ? 0.12 : 0.06, 200);
    flashBossTint(g, 0xff8888, 150);
    // Boss squash on recoil, elastic bounce-back
    squashStretch(g, "boss", 0.85, 1.18, 80, 200, easeOutElastic);
    triggerShake(g, shake, 200);
    if (hitStop > 0) triggerHitStop(g, hitStop);
    if (opts.isSuper) {
      flashOverlay(g, 0xffffff, 0.15, 100);
      playSound("confetti");
    }
  });
}

function bossAttack(g: GameState, damage: number) {
  if (!g.hero || !g.boss) return;
  // Hard mode: brief red tell right before the swing
  if (g.difficultyLevel === 2) {
    flashOverlay(g, 0xef4444, 0.12, 200);
  }
  g.bossAnim = "attack";
  g.bossAnimTimer = 500;
  playSound("bossAttack");
  playSound("projectile");

  addTween(g, {
    from: 0, to: -60, duration: 150, delay: 0,
    onUpdate: (v) => { g.bossOffsetX = v; },
    ease: easeOutBack,
  });
  addTween(g, {
    from: -60, to: 0, duration: 200, delay: 150,
    onUpdate: (v) => { g.bossOffsetX = v; },
    ease: easeOutQuad,
  });

  // Boss stretch forward (mirrored) + glow flash
  squashStretch(g, "boss", 1.15, 0.88, 100, 200);
  flashGlow(g, "boss", 0.15, 0.07, 100, 200);

  cameraPulse(g, 1.05, g.hero.x, g.hero.y, 20);

  schedule(g, 150, () => {
    if (!g.hero) return;
    g.heroAnim = "hurt";
    g.heroAnimTimer = 500;
    addTween(g, {
      from: 0, to: -15, duration: 100, delay: 0,
      onUpdate: (v) => { g.heroOffsetX = v; },
      ease: easeOutQuad,
    });
    addTween(g, {
      from: -15, to: 0, duration: 200, delay: 100,
      onUpdate: (v) => { g.heroOffsetX = v; },
      ease: easeOutQuad,
    });
    playSound("hitImpact");
    spawnParticles(g, g.hero.x, g.hero.y, 18, [0xef4444, 0xf97316, 0xfde047]);
    spawnDamageFx(g, g.hero.x, g.hero.y, damage, "boss-hits-hero");
    flashOverlay(g, 0xef4444, 0.08, 300);
    flashHeroTint(g, 0xff6666, 150);
    // Hero squash on recoil, elastic bounce-back
    squashStretch(g, "hero", 0.85, 1.18, 80, 200, easeOutElastic);
    triggerShake(g, 6, 250);
  });
}

function triggerVictory(g: GameState) {
  if (!g.hero || !g.boss) return;
  g.heroAnim = "celebrate";
  g.heroLocked = true;
  g.bossAnim = "defeated";
  g.bossLocked = true;
  stopBGM(400);
  playSound("bossDefeated");
  window.setTimeout(() => {
    playSound("victory");
    playBGM("bgmVictory");
  }, 500);

  // Slow zoom onto the hero + golden overlay wash
  g.cameraFocusX = g.hero.x;
  g.cameraFocusY = g.hero.y;
  addTween(g, {
    from: 1, to: 1.15, duration: 1400, delay: 0,
    onUpdate: (v) => { g.cameraScale = v; },
    ease: easeOutQuad,
  });
  flashOverlay(g, 0xfde047, 0.05, 1200);

  // Final boss squash hold, then the shadow fades out in parallel with the sprite shrink.
  addTween(g, {
    from: 1, to: 1.3, duration: 120, delay: 0,
    onUpdate: (v) => { g.bossSquashX = v; }, ease: easeOutQuad,
  });
  addTween(g, {
    from: 1, to: 0.6, duration: 120, delay: 0,
    onUpdate: (v) => { g.bossSquashY = v; }, ease: easeOutQuad,
  });
  addTween(g, {
    from: 0.35, to: 0, duration: 800, delay: 200,
    onUpdate: (v) => { g.bossShadowAlpha = v; }, ease: easeOutQuad,
  });

  addTween(g, {
    from: 0, to: Math.PI * 2, duration: 1000, delay: 0,
    onUpdate: (v) => { g.bossRotation = v; },
  });
  addTween(g, {
    from: 1, to: 0, duration: 1000, delay: 0,
    onUpdate: (v) => { g.bossScaleMul = v; },
    ease: easeInQuad,
  });

  spawnParticles(g, g.boss.x, g.boss.y, 60, [0xfde047, 0x10b981, 0x3b82f6, 0xf97316, 0xffffff, 0xec4899]);
  triggerShake(g, 8, 500);

  for (let i = 0; i < 3; i++) {
    const base = i * 250;
    addTween(g, {
      from: 1, to: 1.2, duration: 120, delay: base,
      onUpdate: (v) => { g.heroScaleMul = v; },
      ease: easeOutBack,
    });
    addTween(g, {
      from: 1.2, to: 1, duration: 120, delay: base + 120,
      onUpdate: (v) => { g.heroScaleMul = v; },
      ease: easeOutQuad,
    });
  }
}

function triggerDefeat(g: GameState) {
  if (!g.hero || !g.boss) return;
  g.heroAnim = "hurt";
  g.heroLocked = true;
  g.bossAnim = "taunt";
  g.bossLocked = true;
  stopBGM(400);
  playSound("defeat");

  // Slow zoom onto the boss
  g.cameraFocusX = g.boss.x;
  g.cameraFocusY = g.boss.y;
  addTween(g, {
    from: 1, to: 1.10, duration: 1000, delay: 0,
    onUpdate: (v) => { g.cameraScale = v; },
    ease: easeOutQuad,
  });

  addTween(g, {
    from: 1, to: 0.8, duration: 500, delay: 0,
    onUpdate: (v) => { g.heroScaleMul = v; },
    ease: easeInQuad,
  });
  spawnParticles(g, g.hero.x, g.hero.y, 20, [0xef4444, 0x94a3b8, 0x475569]);
  triggerShake(g, 10, 400);
}

function tickFrame(g: GameState, dt: number) {
  g.time += dt;

  // Timers
  for (let i = g.timers.length - 1; i >= 0; i--) {
    const t = g.timers[i];
    t.delay -= dt;
    if (t.delay <= 0) {
      t.fn();
      g.timers.splice(i, 1);
    }
  }

  // Tweens
  for (let i = g.tweens.length - 1; i >= 0; i--) {
    const tw = g.tweens[i];
    if (tw.delay > 0) {
      tw.delay -= dt;
      if (tw.delay > 0) continue;
    }
    tw.elapsed += dt;
    const raw = Math.min(1, tw.elapsed / tw.duration);
    const eased = tw.ease ? tw.ease(raw) : raw;
    tw.onUpdate(tw.from + (tw.to - tw.from) * eased);
    if (raw >= 1) {
      tw.onComplete?.();
      g.tweens.splice(i, 1);
    }
  }

  // Animation state decay
  if (!g.heroLocked && g.heroAnimTimer > 0) {
    g.heroAnimTimer -= dt;
    if (g.heroAnimTimer <= 0) {
      g.heroAnim = "idle";
      g.heroAnimTimer = 0;
    }
  }
  if (!g.bossLocked && g.bossAnimTimer > 0) {
    g.bossAnimTimer -= dt;
    if (g.bossAnimTimer <= 0) {
      g.bossAnim = "idle";
      g.bossAnimTimer = 0;
    }
  }

  // Phase driven by mirrored bossHpPct (0..1)
  const phase: 0 | 1 | 2 | 3 =
    g.bossHpPct < 0.25 ? 3 : g.bossHpPct < 0.5 ? 2 : g.bossHpPct < 0.75 ? 1 : 0;

  // Tint flash timers decay
  if (g.heroTintFlashMs > 0) g.heroTintFlashMs = Math.max(0, g.heroTintFlashMs - dt);
  if (g.bossTintFlashMs > 0) g.bossTintFlashMs = Math.max(0, g.bossTintFlashMs - dt);

  // Hero transform + texture
  if (g.hero && g.textures) {
    const heroSet = g.textures[g.selectedHero];
    const next = heroSet[g.heroAnim];
    if (g.hero.texture !== next) g.hero.texture = next;
    // Celebrate frames have raised hands - shrink target height + shift anchor
    // down + lift the sprite so the head and hands stay on-screen.
    const celebrating = g.heroAnim === "celebrate";
    g.hero.anchor.set(0.5, celebrating ? 0.75 : 0.5);
    const effectiveHeight = celebrating ? HERO_HEIGHT * 0.8 : HERO_HEIGHT;
    const baseScale = effectiveHeight / (g.hero.texture.height || 1);
    const hBreatheX = 1 + Math.sin(g.time / 800) * 0.015;
    const hBreatheY = 1 + Math.sin(g.time / 800) * 0.025;
    g.hero.scale.x = baseScale * g.heroScaleMul * g.heroSquashX * hBreatheX;
    g.hero.scale.y = baseScale * g.heroScaleMul * g.heroSquashY * hBreatheY;
    const heroSwayX = Math.sin(g.time / 2000) * 3;
    const heroBob = Math.sin(g.time / 500) * 4 + Math.sin(g.time / 1200) * 2;
    const celebrateLift = celebrating ? -80 : 0;
    g.hero.x = g.baseHeroX + g.heroOffsetX + heroSwayX + g.mouseOffsetX * 4;
    g.hero.y = g.baseHeroY + heroBob + g.mouseOffsetY * 2 + celebrateLift;
    // Dynamic tint (default blue/purple + phase + event flash + victory gold)
    const heroDefaultTint = g.heroLocked && g.heroAnim === "celebrate"
      ? 0xfffff0
      : 0xe8e0ff;
    g.hero.tint = g.heroTintFlashMs > 0 ? g.heroTintFlashColor : heroDefaultTint;
  }

  // Boss transform + texture
  if (g.boss && g.textures) {
    const next = g.textures.boss[g.bossAnim];
    if (g.boss.texture !== next) g.boss.texture = next;
    g.boss.anchor.set(0.5, 0.5);
    const baseScale = BOSS_HEIGHT / (g.boss.texture.height || 1);
    // Breathing - slower + deeper; in phase 3, pants faster
    const bDiv = phase === 3 ? 550 : 1100;
    const bBreatheX = 1 + Math.sin(g.time / bDiv) * 0.018;
    const bBreatheY = 1 + Math.sin(g.time / bDiv) * 0.028;
    g.boss.scale.x = baseScale * g.bossScaleMul * g.bossSquashX * bBreatheX;
    g.boss.scale.y = baseScale * g.bossScaleMul * g.bossSquashY * bBreatheY;
    g.boss.rotation = g.bossRotation;
    // Menacing idle: compound sway + slow drift + vertical bob
    const bossSwayX = Math.sin(g.time / 700) * 6 + Math.sin(g.time / 3000) * 3;
    const bossBobY = Math.sin(g.time / 600) * 3;
    const rageJitterX = phase === 3 ? (Math.random() - 0.5) * 3 : 0;
    const rageJitterY = phase === 3 ? (Math.random() - 0.5) * 2 : 0;
    g.boss.x = g.baseBossX + g.bossOffsetX + bossSwayX + rageJitterX + g.mouseOffsetX * 5;
    g.boss.y = g.baseBossY + bossBobY + g.bossYOffset + rageJitterY + g.mouseOffsetY * 3;
    const bossPhaseTint = phase === 3 ? 0xffb0b0 : phase === 2 ? 0xffd0d0 : 0xf0e0ff;
    g.boss.tint = g.bossTintFlashMs > 0 ? g.bossTintFlashColor : bossPhaseTint;
  }

  // Ground shadows (follow the character's foot position)
  if (g.heroShadow && g.hero) {
    g.heroShadow.x = g.hero.x;
    g.heroShadow.y = g.baseHeroY + HERO_HEIGHT * 0.45;
    // Scale shadow to match the ellipse dimensions 120x25 (doubled from the 60x12 base)
    g.heroShadow.scale.set(2, 2);
    g.heroShadow.alpha = g.heroShadowAlpha;
  }
  if (g.bossShadow && g.boss) {
    g.bossShadow.x = g.boss.x;
    g.bossShadow.y = g.baseBossY + BOSS_HEIGHT * 0.45;
    g.bossShadow.scale.set(2, 2);
    g.bossShadow.alpha = g.bossShadowAlpha;
  }

  // Reflections (mirror character texture + position)
  if (g.heroReflection && g.hero) {
    if (g.heroReflection.texture !== g.hero.texture) {
      g.heroReflection.texture = g.hero.texture;
    }
    g.heroReflection.x = g.hero.x;
    g.heroReflection.y = g.baseHeroY + HERO_HEIGHT * 0.45;
    g.heroReflection.scale.x = g.hero.scale.x;
    g.heroReflection.scale.y = -g.hero.scale.y * 0.3;
    g.heroReflection.tint = g.hero.tint;
  }
  if (g.bossReflection && g.boss) {
    if (g.bossReflection.texture !== g.boss.texture) {
      g.bossReflection.texture = g.boss.texture;
    }
    g.bossReflection.x = g.boss.x;
    g.bossReflection.y = g.baseBossY + BOSS_HEIGHT * 0.45;
    g.bossReflection.scale.x = g.boss.scale.x;
    g.bossReflection.scale.y = -g.boss.scale.y * 0.3;
    g.bossReflection.tint = g.boss.tint;
    g.bossReflection.alpha = 0.1 * g.bossAlpha;
  }

  // Rim-light glows (wide outer haze)
  if (g.heroGlow && g.hero) {
    g.heroGlow.x = g.hero.x;
    g.heroGlow.y = g.hero.y;
    g.heroGlow.alpha = g.heroGlowAlpha;
  }
  if (g.bossGlow && g.boss) {
    // Re-draw if the phase changed the colour
    const targetBossGlow = phase === 3 ? 0xef4444 : phase === 2 ? 0xf97316 : 0x7c3aed;
    if (targetBossGlow !== g.bossGlowColor) {
      g.bossGlowColor = targetBossGlow;
      g.bossGlow.clear();
      g.bossGlow.circle(0, 0, 120).fill({ color: targetBossGlow, alpha: 1 });
    }
    g.bossGlow.x = g.boss.x;
    g.bossGlow.y = g.boss.y;
    g.bossGlow.alpha = g.bossGlowAlpha;
  }

  // Tighter RIM layer - bright silhouette pop, follows the wide glow's
  // hit flash but with a higher baseline + peak so the character body
  // visually separates from the dark arena background.
  if (g.heroRim && g.hero) {
    g.heroRim.x = g.hero.x;
    g.heroRim.y = g.hero.y;
    // Map heroGlowAlpha (0.06 idle → 0.15 hit) to rim alpha (0.22 → 0.55)
    const t = (g.heroGlowAlpha - 0.06) / 0.09; // 0..1
    const rimA = 0.22 + Math.max(0, Math.min(1, t)) * 0.33;
    g.heroRim.alpha = rimA;
  }
  if (g.bossRim && g.boss) {
    g.bossRim.x = g.boss.x;
    g.bossRim.y = g.boss.y;
    const t = (g.bossGlowAlpha - 0.07) / 0.13;
    const rimA = 0.22 + Math.max(0, Math.min(1, t)) * 0.36;
    g.bossRim.alpha = rimA;
  }

  // Floor energy rings - under each fighter, HP-driven. Outer ring is
  // sized down + dimmed as that fighter loses HP, so the kid sees the
  // stakes without reading numbers.
  if (g.heroFloorRing && g.hero) {
    const pct = Math.max(0.15, g.heroHpPct);
    const baseR = 92;
    const r = baseR * (0.6 + pct * 0.4);
    const heroRingColor = pct < 0.3 ? 0xef4444 : pct < 0.55 ? 0xf97316 : 0x3b82f6;
    g.heroFloorRing.clear();
    g.heroFloorRing.circle(0, 0, r).stroke({ color: heroRingColor, width: 3, alpha: 0.7 });
    g.heroFloorRing.circle(0, 0, r * 0.78).stroke({ color: heroRingColor, width: 1.5, alpha: 0.45 });
    g.heroFloorRing.circle(0, 0, r * 0.55).stroke({ color: heroRingColor, width: 1, alpha: 0.3 });
    g.heroFloorRing.x = g.hero.x;
    g.heroFloorRing.y = g.baseHeroY + HERO_HEIGHT * 0.46;
    g.heroFloorRing.scale.set(1, 0.32);
    g.heroFloorRing.alpha = 0.55 + pct * 0.3;
  }
  if (g.bossFloorRing && g.boss) {
    const pct = Math.max(0.15, g.bossHpPct);
    const baseR = 100;
    const r = baseR * (0.6 + pct * 0.4);
    const bossRingColor = pct < 0.3 ? 0xef4444 : pct < 0.55 ? 0xf97316 : 0xff5fb3;
    g.bossFloorRing.clear();
    g.bossFloorRing.circle(0, 0, r).stroke({ color: bossRingColor, width: 3, alpha: 0.7 });
    g.bossFloorRing.circle(0, 0, r * 0.78).stroke({ color: bossRingColor, width: 1.5, alpha: 0.45 });
    g.bossFloorRing.circle(0, 0, r * 0.55).stroke({ color: bossRingColor, width: 1, alpha: 0.3 });
    g.bossFloorRing.x = g.boss.x;
    g.bossFloorRing.y = g.baseBossY + BOSS_HEIGHT * 0.46;
    g.bossFloorRing.scale.set(1, 0.32);
    g.bossFloorRing.alpha = 0.55 + pct * 0.3;
  }

  // Parallax the background slightly against mouse motion
  if (g.bg) {
    g.bg.x = g.mouseOffsetX * -8;
    g.bg.y = g.mouseOffsetY * -5;
  }

  // Particles
  for (let i = g.particles.length - 1; i >= 0; i--) {
    const p = g.particles[i];
    p.gfx.x += p.vx;
    p.gfx.y += p.vy;
    p.vy += 0.2;
    p.life -= dt / 1000;
    p.gfx.alpha = Math.max(0, p.life);
    if (p.life <= 0) {
      if (g.stage) g.stage.removeChild(p.gfx);
      if (!p.gfx.destroyed) p.gfx.destroy();
      g.particles.splice(i, 1);
    }
  }

  // Float texts
  for (let i = g.floatTexts.length - 1; i >= 0; i--) {
    const ft = g.floatTexts[i];
    ft.life += dt;
    ft.text.y += ft.vy;
    ft.text.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
    if (ft.life >= ft.maxLife) {
      if (g.stage) g.stage.removeChild(ft.text);
      if (!ft.text.destroyed) ft.text.destroy();
      g.floatTexts.splice(i, 1);
    }
  }

  // Hero / boss alpha (intro fade-in) - apply directly to sprites
  if (g.hero) g.hero.alpha = g.heroAlpha;
  if (g.boss) g.boss.alpha = g.bossAlpha;

  // Background overlay (reactive tint)
  if (g.bgOverlay && g.app) {
    const ov = g.bgOverlay;
    ov.clear();
    const w = g.app.renderer.width / (g.app.renderer.resolution || 1);
    const h = g.app.renderer.height / (g.app.renderer.resolution || 1);
    const combined = Math.min(1, g.bgOverlayAlpha + g.bgOverlayPulseAlpha);
    if (combined > 0.001) {
      ov.rect(0, 0, w, h);
      ov.fill({ color: g.bgOverlayColor, alpha: combined });
    }
  }

  // Shake + camera transform (applied together)
  if (g.stage) {
    let shakeX = 0;
    let shakeY = 0;
    if (g.shakeDuration > 0) {
      shakeX = (Math.random() - 0.5) * g.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * g.shakeIntensity * 2;
      g.shakeDuration -= dt;
      g.shakeIntensity *= 0.95;
    } else {
      g.shakeIntensity = 0;
    }
    // Smoothly lerp the super-zoom multiplier toward its target each
    // tick (1.08 while super-ready, 1.00 otherwise).
    const superTarget = g.superZoomActive ? 1.08 : 1.0;
    g.superZoomMul += (superTarget - g.superZoomMul) * 0.08;
    const s = g.cameraScale * g.superZoomMul;
    g.stage.scale.set(s);
    g.stage.x = shakeX + g.cameraFocusX * (1 - s) + g.cameraPanX;
    g.stage.y = shakeY + g.cameraFocusY * (1 - s) + g.cameraPanY;
  }
}

function CountUp({
  target,
  duration = 1000,
  prefix = "",
  suffix = "",
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return (
    <>
      {prefix}
      {value}
      {suffix}
    </>
  );
}

export default function BossBattle({
  questions,
  phases,
  bossName = "HACKER RACCOON",
  onEnd,
  onQuestionAnswered,
}: BossBattleProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  // Mobile detection - used to gate the HeroSelectAtmosphere R3F
  // canvas so phones don't run it alongside Arena3D + PixiJS.
  const isMobile = useIsMobile();

  /**
   * Question source resolution:
   *   1. If `phases` is set → flatten into a single list, remember which
   *      phase each question belongs to, and feed the existing
   *      sequential customQuestions advance logic with the flat list.
   *      This keeps the entire combat / answer / damage layer untouched
   *      and adds phasing as a derived layer on top.
   *   2. Else if `questions` is set → use that flat list (legacy path).
   *   3. Else → fall back to the local EASY/MEDIUM/HARD pools with the
   *      adaptive difficulty system.
   *
   * `phaseOfQuestion[i]` returns the BossPhase metadata for the
   * question at flat index `i`. Used by phase-badge UI + phase-change
   * announcements + per-phase stats tracking.
   */
  const customQuestions = useMemo<Question[] | null>(() => {
    if (phases && phases.length > 0) {
      const flat: Question[] = [];
      for (const p of phases) {
        for (const q of p.questions) flat.push(q);
      }
      return flat;
    }
    if (questions && questions.length > 0) return questions;
    return null;
  }, [phases, questions]);

  const phaseOfQuestion = useMemo<BossPhase[] | null>(() => {
    if (!phases || phases.length === 0) return null;
    const out: BossPhase[] = [];
    for (const p of phases) {
      for (let i = 0; i < p.questions.length; i++) out.push(p);
    }
    return out;
  }, [phases]);

  /**
   * Per-phase running totals. Updated inside resolveAnswer when a
   * phased question resolves. Survives across renders via ref so
   * setState pressure isn't an issue. Emitted via onEnd as
   * `phaseResults` so the parent can persist + analytics it.
   */
  const phaseStatsRef = useRef<Map<string, BossPhaseResult>>(new Map());
  useEffect(() => {
    if (!phases) {
      phaseStatsRef.current.clear();
      return;
    }
    const m = new Map<string, BossPhaseResult>();
    for (const p of phases) {
      m.set(p.id, {
        phaseId: p.id,
        label: p.label,
        correctCount: 0,
        wrongCount: 0,
        totalQuestions: p.questions.length,
      });
    }
    phaseStatsRef.current = m;
  }, [phases]);

  // Per-pool advance pointers - "next index to pick".
  const easyIdxRef = useRef(1);
  const medIdxRef = useRef(0);
  const hardIdxRef = useRef(0);

  // The question currently on screen. First pick is locked in via lazy init
  // so we don't re-pick every render.
  const [currentQ, setCurrentQ] = useState<Question>(() =>
    customQuestions ? customQuestions[0] : EASY_QUESTIONS[0]
  );

  const [heroHp, setHeroHp] = useState(HP_MAX);
  const [bossHp, setBossHp] = useState(HP_MAX);
  const [combo, setCombo] = useState(0);
  // SHIELD power-up - single charge per fight, auto-armed at start.
  // Wrong-answer handler consumes it instead of taking damage.
  const [shieldArmed, setShieldArmed] = useState(true);
  const [shieldConsumedKey, setShieldConsumedKey] = useState(0);
  // Tracks whether the kid spent their shield this run - drives the
  // "Shield Saved Me!" achievement.
  const [usedShield, setUsedShield] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ index: number; correct: boolean } | null>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<null | "won" | "lost">(null);
  const [stats, setStats] = useState({ totalAsked: 0, correct: 0, maxCombo: 0 });
  /**
   * Boss-start timestamp for duration analytics. Captured on mount;
   * close enough to gameplay start (~2-3s intro overhead is OK for
   * "how long did this fight take" telemetry).
   */
  const bossStartedAtRef = useRef<number>(0);
  useEffect(() => {
    bossStartedAtRef.current = performance.now();
  }, []);
  const [gameKey, setGameKey] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroId | null>(null);
  const [selecting, setSelecting] = useState<HeroId | null>(null);

  // ── Arena3D (Three.js scene) wiring ──
  const [arenaMood, setArenaMood] = useState<"normal" | "danger" | "victory">(
    "normal"
  );
  const [arenaShake, setArenaShake] = useState<{ mag: number; key: number }>({
    mag: 0,
    key: 0,
  });
  const arenaMoodTimerRef = useRef<number | null>(null);
  const bumpArenaShake = useCallback((mag: number) => {
    setArenaShake((prev) => ({ mag, key: prev.key + 1 }));
  }, []);
  const pulseArenaDanger = useCallback((ms = 500) => {
    setArenaMood("danger");
    if (arenaMoodTimerRef.current)
      window.clearTimeout(arenaMoodTimerRef.current);
    arenaMoodTimerRef.current = window.setTimeout(() => {
      setArenaMood("normal");
      arenaMoodTimerRef.current = null;
    }, ms);
  }, []);
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => {
    if (typeof window === "undefined") return { w: 1280, h: 720 };
    return { w: window.innerWidth, h: window.innerHeight };
  });
  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Derive boss phase (0-3) from HP - matches the PixiJS internal mapping.
  const arenaPhase: 0 | 1 | 2 | 3 = useMemo(() => {
    const pct = bossHp / HP_MAX;
    if (pct <= 0.25) return 3;
    if (pct <= 0.5) return 2;
    if (pct <= 0.75) return 1;
    return 0;
  }, [bossHp]);

  // Victory mood override - once result is "won", lock arena to victory lighting.
  useEffect(() => {
    if (result === "won") {
      if (arenaMoodTimerRef.current) {
        window.clearTimeout(arenaMoodTimerRef.current);
        arenaMoodTimerRef.current = null;
      }
      setArenaMood("victory");
    } else if (result === null) {
      setArenaMood("normal");
    }
  }, [result]);

  useEffect(() => () => {
    if (arenaMoodTimerRef.current) window.clearTimeout(arenaMoodTimerRef.current);
  }, []);

  /** Advance to the next question, reading from the current-difficulty pool. */
  const advanceQuestion = useCallback(() => {
    if (customQuestions) {
      setQuestionIdx((i) => {
        const nextIdx = i + 1;
        setCurrentQ(customQuestions[nextIdx % customQuestions.length]);
        return nextIdx;
      });
      return;
    }
    const g = gameRef.current;
    const lvl = g.difficultyLevel;
    const pool =
      lvl === 2 ? HARD_QUESTIONS : lvl === 1 ? MEDIUM_QUESTIONS : EASY_QUESTIONS;
    const idxRef = lvl === 2 ? hardIdxRef : lvl === 1 ? medIdxRef : easyIdxRef;
    const pick = pool[idxRef.current % pool.length];
    idxRef.current = (idxRef.current + 1) % pool.length;
    setCurrentQ(pick);
    setQuestionIdx((i) => i + 1);
  }, [customQuestions]);

  // Intro + announcement UI state
  type IntroStage = "dark" | "hero" | "stage1" | "vs" | "bossName" | "bossDrop" | "impact" | "done";
  const [introStage, setIntroStage] = useState<IntroStage>("dark");
  const [announcement, setAnnouncement] = useState<
    { text: string; tone: "blue" | "red" | "gold" | "cyan" } | null
  >(null);
  const announcementTimerRef = useRef<number | null>(null);
  const showAnnouncement = useCallback(
    (text: string, tone: "blue" | "red" | "gold" | "cyan") => {
      setAnnouncement({ text, tone });
      if (announcementTimerRef.current) window.clearTimeout(announcementTimerRef.current);
      announcementTimerRef.current = window.setTimeout(() => setAnnouncement(null), 1000);
    },
    []
  );
  useEffect(() => () => {
    if (announcementTimerRef.current) window.clearTimeout(announcementTimerRef.current);
  }, []);
  const HERO_CRIES = useMemo(
    () => ["CYBER SHIELD BASH!", "DIGITAL DEFENCE!", "FIREWALL STRIKE!", "CODE BREAKER!"],
    []
  );
  const BOSS_CRIES = useMemo(
    () => ["DARK HACK!", "VIRUS BLAST!", "PHISHING STRIKE!", "MALWARE SURGE!"],
    []
  );

  // Super attack power-up
  const [superReady, setSuperReady] = useState(false);

  // Timer - initial budget follows adaptive difficulty level.
  // 0 = easy (18s), 1 = medium (14s), 2 = hard (11s).
  const comfort = useComfortMode();
  // Sync comfort flag into the GameState ref so module-level helpers
  // (triggerHitStop, triggerShake, triggerSlowMo, playerAttack,
  // bossAttack) can read it without going through the React hook.
  useEffect(() => {
    gameRef.current.comfortReduceMotion =
      comfort.enabled || comfort.prefersReducedMotion;
  }, [comfort.enabled, comfort.prefersReducedMotion]);
  // Comfort mode extends per-question budget by 60% so slow readers
  // and motor-delayed children aren't penalised for thinking time.
  // Reads via closure - any difficultyTimerMs call after comfort
  // toggles will pick up the new value on the NEXT question.
  const difficultyTimerMs = (level: 0 | 1 | 2): number => {
    const base = level === 0 ? 18000 : level === 1 ? 14000 : 11000;
    return Math.round(base * (comfort.enabled ? 1.6 : 1));
  };
  const difficultyDamage = (level: 0 | 1 | 2): number =>
    level === 0 ? 10 : level === 1 ? 13 : 16;
  const [currentQuestionMs, setCurrentQuestionMs] = useState(18000);
  const [timerMs, setTimerMs] = useState(18000);
  const timerRunningRef = useRef(false);
  const questionStartTsRef = useRef<number | null>(null);
  const lastTickSecondRef = useRef<number>(18);
  const [fastestMs, setFastestMs] = useState<number | null>(null);

  // Ghost (delayed) HP fills for the damage-lag bar effect
  const [ghostHeroHp, setGhostHeroHp] = useState(HP_MAX);
  const [ghostBossHp, setGhostBossHp] = useState(HP_MAX);
  useEffect(() => {
    const t = window.setTimeout(() => setGhostHeroHp(heroHp), 80);
    return () => window.clearTimeout(t);
  }, [heroHp]);
  useEffect(() => {
    const t = window.setTimeout(() => setGhostBossHp(bossHp), 80);
    return () => window.clearTimeout(t);
  }, [bossHp]);

  // Victory stats stagger
  const [statsStage, setStatsStage] = useState(0);

  // Pre-question countdown (3, 2, 1, GO!) - null = not active
  const [countdownPhase, setCountdownPhase] = useState<3 | 2 | 1 | "GO" | null>(null);

  // Speech bubbles
  const [bossTaunt, setBossTaunt] = useState<string | null>(null);
  const [heroSpeech, setHeroSpeech] = useState<string | null>(null);
  const bossTauntTimerRef = useRef<number | null>(null);
  const heroSpeechTimerRef = useRef<number | null>(null);
  const BOSS_TAUNTS = useMemo(
    () => ["You can't stop me!", "Is that all you've got?", "Too slow!", "I'm unstoppable!", "Give up now!", "Pathetic!"],
    []
  );
  const HERO_LINES_3 = useMemo(() => ["I'm on fire!", "Let's go!", "Keep it up!"], []);
  const HERO_LINES_5 = useMemo(() => ["Unstoppable!", "We've got this!", "Power up!"], []);
  const HERO_LINES_7 = useMemo(() => ["LEGENDARY!", "Nothing can stop us!", "Maximum power!"], []);
  const showBossTaunt = useCallback(() => {
    const t = BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)];
    setBossTaunt(t);
    if (bossTauntTimerRef.current) window.clearTimeout(bossTauntTimerRef.current);
    bossTauntTimerRef.current = window.setTimeout(() => setBossTaunt(null), 1500);
  }, [BOSS_TAUNTS]);
  const showHeroSpeech = useCallback((line: string) => {
    setHeroSpeech(line);
    if (heroSpeechTimerRef.current) window.clearTimeout(heroSpeechTimerRef.current);
    heroSpeechTimerRef.current = window.setTimeout(() => setHeroSpeech(null), 1500);
  }, []);

  // Centre screen correct/wrong flash
  const [centerFeedback, setCenterFeedback] = useState<"correct" | "wrong" | "shielded" | null>(null);
  const centerFeedbackTimerRef = useRef<number | null>(null);
  const showCenterFeedback = useCallback((kind: "correct" | "wrong" | "shielded") => {
    setCenterFeedback(kind);
    if (centerFeedbackTimerRef.current) window.clearTimeout(centerFeedbackTimerRef.current);
    centerFeedbackTimerRef.current = window.setTimeout(() => setCenterFeedback(null), 600);
  }, []);

  // Phase transition announcement
  const [phaseAnnouncement, setPhaseAnnouncement] = useState<"angry" | "phase2" | "final" | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const showPhaseAnnouncement = useCallback((kind: "angry" | "phase2" | "final") => {
    setPhaseAnnouncement(kind);
    if (phaseTimerRef.current) window.clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = window.setTimeout(() => setPhaseAnnouncement(null), 1800);
  }, []);

  // Post-wrong explanation hold (highlighted correct answer + yellow explanation line)
  const [explanationVisible, setExplanationVisible] = useState(false);

  const gameRef = useRef<GameState>({
    app: null, stage: null, textures: null,
    selectedHero: "adam",
    hero: null, boss: null, bg: null,
    baseHeroX: 0, baseHeroY: 0, baseBossX: 0, baseBossY: 0,
    heroAnim: "idle", bossAnim: "idle",
    heroAnimTimer: 0, bossAnimTimer: 0,
    heroLocked: false, bossLocked: false,
    heroOffsetX: 0, bossOffsetX: 0,
    heroScaleMul: 1, bossScaleMul: 1,
    bossRotation: 0,
    shakeIntensity: 0, shakeDuration: 0,
    particles: [], floatTexts: [],
    tweens: [], timers: [],
    time: 0,
    cameraScale: 1,
    cameraFocusX: 0, cameraFocusY: 0,
    cameraPanX: 0, cameraPanY: 0,
    bgOverlay: null,
    bgOverlayAlpha: 0, bgOverlayColor: 0x000000, bgOverlayPulseAlpha: 0,
    heroAlpha: 1, bossAlpha: 1, bossYOffset: 0,
    hitStopUntil: 0,
    comfortReduceMotion: false,
    heroShadow: null, bossShadow: null,
    heroReflection: null, bossReflection: null,
    heroGlow: null, bossGlow: null,
    heroRim: null, bossRim: null,
    heroFloorRing: null, bossFloorRing: null,
    heroShadowAlpha: 0.3, bossShadowAlpha: 0.35,
    heroGlowAlpha: 0.06, bossGlowAlpha: 0.07, bossGlowColor: 0x7c3aed,
    heroSquashX: 1, heroSquashY: 1, bossSquashX: 1, bossSquashY: 1,
    heroTintFlashColor: 0xffffff, heroTintFlashMs: 0,
    bossTintFlashColor: 0xffffff, bossTintFlashMs: 0,
    bossHpPct: 1, heroHpPct: 1,
    superZoomActive: false, superZoomMul: 1,
    mouseOffsetX: 0, mouseOffsetY: 0,
    difficultyLevel: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  });

  const chooseHero = (h: HeroId) => {
    if (selecting || selectedHero) {
      console.log("[BossBattle] chooseHero blocked", { requested: h, selecting, selectedHero });
      return;
    }
    console.log("[BossBattle] chooseHero start →", h);
    playSound("select");
    setSelecting(h);
    window.setTimeout(() => {
      console.log("[BossBattle] chooseHero commit →", h);
      setSelectedHero(h);
    }, 600);
  };

  // Preload SFX + play intro cue when the selection screen appears
  useEffect(() => {
    SoundManager.getInstance().preloadSFX();
    playSound("lessonStart");
  }, []);

  // Start battle BGM once a hero is locked in - quiet during intro, full at gameplay
  useEffect(() => {
    if (!selectedHero) return;
    SoundManager.getInstance().setVolume("music", 0.5); // 0.5 × 0.10 base = 0.05
    playBGM("bgmBattle");
    return () => {
      // Reset music volume before unmount; clean up BGM.
      SoundManager.getInstance().setVolume("music", 1);
      stopBGM(400);
    };
  }, [selectedHero, gameKey]);

  // Intro choreography - fires once the Pixi scene reports `ready`
  useEffect(() => {
    if (!ready || !selectedHero) return;
    setIntroStage("dark");
    const timers: number[] = [];
    const g = gameRef.current;

    // 0ms: dark - hero/boss hidden, boss offset -300
    g.heroAlpha = 0;
    g.bossAlpha = 0;
    g.bossYOffset = -300;

    // 500ms: hero fades in
    timers.push(window.setTimeout(() => {
      setIntroStage("hero");
      addTween(g, {
        from: 0, to: 1, duration: 500, delay: 0,
        onUpdate: (v) => { g.heroAlpha = v; },
        ease: easeOutQuad,
      });
    }, 500));

    // 1000ms: STAGE 1 banner
    timers.push(window.setTimeout(() => {
      setIntroStage("stage1");
    }, 1000));

    // 2000ms: VS flash
    timers.push(window.setTimeout(() => {
      setIntroStage("vs");
    }, 2000));

    // 2500ms: Boss name reveal + boss sprite alpha on
    timers.push(window.setTimeout(() => {
      setIntroStage("bossName");
      g.bossAlpha = 1;
    }, 2500));

    // 3300ms: Boss drops in from above with easeOutBounce
    timers.push(window.setTimeout(() => {
      setIntroStage("bossDrop");
      addTween(g, {
        from: -300, to: 0, duration: 800, delay: 0,
        onUpdate: (v) => { g.bossYOffset = v; },
        ease: easeOutBounce,
      });
    }, 3300));

    // 4100ms: Boss lands - shake + particles + roar
    timers.push(window.setTimeout(() => {
      setIntroStage("impact");
      if (g.boss) {
        spawnParticles(g, g.boss.x, g.boss.y + 120, 15, [0x94a3b8, 0x7c3aed, 0xef4444, 0xffffff]);
      }
      triggerShake(g, 8, 350);
      playSound("bossRoar");
      // Gameplay volume
      SoundManager.getInstance().setVolume("music", 1);
    }, 4100));

    // 4600ms: Intro done → run 3-2-1-GO! countdown
    timers.push(window.setTimeout(() => {
      setIntroStage("done");
      setCountdownPhase(3);
      playSound("timerTick");
    }, 4600));
    timers.push(window.setTimeout(() => { setCountdownPhase(2); playSound("timerTick"); }, 4600 + 700));
    timers.push(window.setTimeout(() => { setCountdownPhase(1); playSound("timerTick"); }, 4600 + 1400));
    timers.push(window.setTimeout(() => { setCountdownPhase("GO"); playSound("lessonStart"); }, 4600 + 2100));
    timers.push(window.setTimeout(() => {
      setCountdownPhase(null);
      // Timer starts the moment the question panel appears.
      const initialBudget = difficultyTimerMs(gameRef.current.difficultyLevel);
      setCurrentQuestionMs(initialBudget);
      setTimerMs(initialBudget);
      lastTickSecondRef.current = Math.ceil(initialBudget / 1000);
      questionStartTsRef.current = performance.now();
      timerRunningRef.current = true;
    }, 4600 + 2600));

    return () => {
      for (const id of timers) window.clearTimeout(id);
      timerRunningRef.current = false;
    };
  }, [ready, selectedHero, gameKey]);

  useEffect(() => {
    if (!selectedHero) return;
    let cancelled = false;
    const app = new Application();
    let tickerFn: ((ticker: Ticker) => void) | null = null;

    const resizeHandler = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const g = gameRef.current;
      if (g.app) g.app.renderer.resize(w, h);
      if (g.bg) {
        g.bg.width = w;
        g.bg.height = h;
        g.bg.x = 0;
        g.bg.y = 0;
      }
      // Centred, lifted so both characters are fully visible between the HP
      // bar (top) and the question panel (bottom).
      g.baseHeroX = w * 0.28;
      g.baseHeroY = h * 0.42;
      g.baseBossX = w * 0.68;
      g.baseBossY = h * 0.40;
      g.cameraFocusX = w / 2;
      g.cameraFocusY = h / 2;
    };

    (async () => {
      try {
        // Cap renderer resolution at the adaptive-quality dpr cap
        // (default 2). 3x phones were paying for 9x the pixel work
        // with no visible gain on small screens.
        const dprCap = getQualitySettings().dprCap;
        const effectiveDpr = Math.min(window.devicePixelRatio || 1, dprCap);
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: effectiveDpr,
        });
        if (cancelled) {
          app.destroy(true);
          return;
        }

        const canvas = app.canvas;
        // NOTE: position:absolute (not fixed) so the canvas stacks cleanly
        // inside its zIndex:1 wrapper, above the 3D arena underneath.
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.style.background = "transparent";
        canvas.style.pointerEvents = "none";

        if (!canvasHostRef.current) {
          app.destroy(true);
          return;
        }
        canvasHostRef.current.appendChild(canvas);

        console.log("[BossBattle] loading assets", ASSET_PATHS);
        const [
          bg,
          adamIdle, adamAttack, adamHurt, adamCelebrate, /* adamSelect */,
          laylaIdle, laylaAttack, laylaHurt, laylaCelebrate, /* laylaSelect */,
          bossIdle, bossAttack, bossHurt, bossTaunt, bossDefeated,
        ] = await Promise.all([
          Assets.load<Texture>(ASSET_PATHS.bg),
          Assets.load<Texture>(ASSET_PATHS.adamIdle),
          Assets.load<Texture>(ASSET_PATHS.adamAttack),
          Assets.load<Texture>(ASSET_PATHS.adamHurt),
          Assets.load<Texture>(ASSET_PATHS.adamCelebrate),
          Assets.load<Texture>(ASSET_PATHS.adamSelect),
          Assets.load<Texture>(ASSET_PATHS.laylaIdle),
          Assets.load<Texture>(ASSET_PATHS.laylaAttack),
          Assets.load<Texture>(ASSET_PATHS.laylaHurt),
          Assets.load<Texture>(ASSET_PATHS.laylaCelebrate),
          Assets.load<Texture>(ASSET_PATHS.laylaSelect),
          Assets.load<Texture>(ASSET_PATHS.bossIdle),
          Assets.load<Texture>(ASSET_PATHS.bossAttack),
          Assets.load<Texture>(ASSET_PATHS.bossHurt),
          Assets.load<Texture>(ASSET_PATHS.bossTaunt),
          Assets.load<Texture>(ASSET_PATHS.bossDefeated),
        ]);
        if (cancelled) {
          app.destroy(true);
          return;
        }

        const textures: TextureBundle = {
          bg,
          adam: { idle: adamIdle, attack: adamAttack, hurt: adamHurt, celebrate: adamCelebrate },
          layla: { idle: laylaIdle, attack: laylaAttack, hurt: laylaHurt, celebrate: laylaCelebrate },
          boss: { idle: bossIdle, attack: bossAttack, hurt: bossHurt, taunt: bossTaunt, defeated: bossDefeated },
        };

        const W = window.innerWidth;
        const H = window.innerHeight;

        // NOTE: the static background sprite was removed - the 3D Arena
        // (Three.js) renders behind the transparent PixiJS canvas now.
        // We keep `textures.bg` loaded only so existing type contracts hold.
        void W; void H;

        // Reactive background overlay stays - it paints event flashes
        // (hit / super / victory tints) over the 3D scene through the
        // transparent Pixi canvas.
        const bgOverlay = new Graphics();
        app.stage.addChild(bgOverlay);

        // Ground shadows (above overlay, below everything else)
        const heroShadow = new Graphics();
        heroShadow.ellipse(0, 0, 60, 12).fill({ color: 0x000000, alpha: 1 });
        heroShadow.alpha = 0.3;
        try { heroShadow.filters = [new BlurFilter({ strength: 8 })]; } catch { /* filter unsupported */ }
        app.stage.addChild(heroShadow);

        const bossShadow = new Graphics();
        bossShadow.ellipse(0, 0, 75, 15).fill({ color: 0x000000, alpha: 1 });
        bossShadow.alpha = 0.35;
        try { bossShadow.filters = [new BlurFilter({ strength: 8 })]; } catch { /* filter unsupported */ }
        app.stage.addChild(bossShadow);

        // Reflections - flipped character sprites tinted down
        const heroSet = textures[selectedHero];
        const heroReflection = new Sprite(heroSet.idle);
        heroReflection.anchor.set(0.5, 1);
        heroReflection.alpha = 0.1;
        app.stage.addChild(heroReflection);

        const bossReflection = new Sprite(textures.boss.idle);
        bossReflection.anchor.set(0.5, 1);
        bossReflection.alpha = 0.1;
        app.stage.addChild(bossReflection);

        // Floor energy rings - concentric arcs beneath each fighter,
        // HP-driven scale + alpha. Drawn first so they sit on the floor
        // BELOW everything else.
        const heroFloorRing = new Graphics();
        heroFloorRing.alpha = 0;
        app.stage.addChild(heroFloorRing);

        const bossFloorRing = new Graphics();
        bossFloorRing.alpha = 0;
        app.stage.addChild(bossFloorRing);

        // Rim-light glows (above reflections, below characters)
        const heroGlow = new Graphics();
        heroGlow.circle(0, 0, 100).fill({ color: 0x3b82f6, alpha: 1 });
        heroGlow.alpha = 0.06;
        app.stage.addChild(heroGlow);

        const bossGlow = new Graphics();
        bossGlow.circle(0, 0, 120).fill({ color: 0x7c3aed, alpha: 1 });
        bossGlow.alpha = 0.07;
        app.stage.addChild(bossGlow);

        // Tighter rim layer in front of the wide glow - same colour,
        // smaller radius, brighter alpha. Brings the silhouette out from
        // the dark Arena3D background.
        const heroRim = new Graphics();
        heroRim.circle(0, 0, 70).fill({ color: 0x60a5fa, alpha: 1 });
        heroRim.alpha = 0;
        app.stage.addChild(heroRim);

        const bossRim = new Graphics();
        bossRim.circle(0, 0, 84).fill({ color: 0xff5fb3, alpha: 1 });
        bossRim.alpha = 0;
        app.stage.addChild(bossRim);

        const hero = new Sprite(heroSet.idle);
        hero.anchor.set(0.5, 0.5);
        hero.x = W * 0.22;
        hero.y = H * 0.55;
        hero.scale.set(HERO_HEIGHT / hero.texture.height);
        hero.alpha = 0; // faded in during intro sequence
        app.stage.addChild(hero);

        const boss = new Sprite(textures.boss.idle);
        boss.anchor.set(0.5, 0.5);
        boss.x = W * 0.72;
        boss.y = H * 0.52;
        boss.scale.set(BOSS_HEIGHT / boss.texture.height);
        boss.alpha = 0; // revealed when the boss drops in
        app.stage.addChild(boss);

        const g = gameRef.current;
        g.app = app;
        g.stage = app.stage;
        g.textures = textures;
        g.selectedHero = selectedHero;
        g.hero = hero;
        g.boss = boss;
        g.bg = null; // 3D arena replaces the PixiJS background sprite
        g.bgOverlay = bgOverlay;
        g.heroShadow = heroShadow;
        g.bossShadow = bossShadow;
        g.heroReflection = heroReflection;
        g.bossReflection = bossReflection;
        g.heroGlow = heroGlow;
        g.bossGlow = bossGlow;
        g.heroRim = heroRim;
        g.bossRim = bossRim;
        g.heroFloorRing = heroFloorRing;
        g.bossFloorRing = bossFloorRing;
        g.baseHeroX = W * 0.28;
        g.baseHeroY = H * 0.42;
        g.baseBossX = W * 0.68;
        g.baseBossY = H * 0.40;
        g.cameraFocusX = W / 2;
        g.cameraFocusY = H / 2;
        g.cameraScale = 1;
        g.cameraPanX = 0;
        g.cameraPanY = 0;
        g.heroAlpha = 0;
        g.bossAlpha = 0;
        g.bossYOffset = -300;
        g.bgOverlayAlpha = 0;
        g.bgOverlayPulseAlpha = 0;

        window.addEventListener("resize", resizeHandler);

        tickerFn = (ticker: Ticker) => {
          const dt = Math.min(ticker.deltaMS, 50);
          tickFrame(g, dt);
        };
        app.ticker.add(tickerFn);

        console.log("[BossBattle] ready", {
          W, H, selectedHero,
          canvas: { cssW: canvas.clientWidth, cssH: canvas.clientHeight, bufW: canvas.width, bufH: canvas.height },
          bossIdle: { w: textures.boss.idle.width, h: textures.boss.idle.height },
        });
        setReady(true);
      } catch (err) {
        console.error("[BossBattle] init failed", err);
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeHandler);
      try {
        if (tickerFn && app.ticker) app.ticker.remove(tickerFn);
        app.ticker?.stop();
        app.destroy(true, { children: true, texture: false });
      } catch (e) {
        console.warn("[BossBattle] cleanup error", e);
      }
      const g = gameRef.current;
      g.app = null;
      g.stage = null;
      g.textures = null;
      g.hero = null;
      g.boss = null;
      g.bg = null;
      g.bgOverlay = null;
      g.heroShadow = null;
      g.bossShadow = null;
      g.heroReflection = null;
      g.bossReflection = null;
      g.heroGlow = null;
      g.bossGlow = null;
      g.heroShadowAlpha = 0.3;
      g.bossShadowAlpha = 0.35;
      g.heroGlowAlpha = 0.06;
      g.bossGlowAlpha = 0.07;
      g.bossGlowColor = 0x7c3aed;
      g.heroSquashX = 1; g.heroSquashY = 1;
      g.bossSquashX = 1; g.bossSquashY = 1;
      g.heroTintFlashMs = 0; g.bossTintFlashMs = 0;
      g.bossHpPct = 1;
      g.mouseOffsetX = 0; g.mouseOffsetY = 0;
      g.particles.length = 0;
      g.floatTexts.length = 0;
      g.tweens.length = 0;
      g.timers.length = 0;
      g.heroLocked = false;
      g.bossLocked = false;
      g.heroAnim = "idle";
      g.bossAnim = "idle";
      g.heroAnimTimer = 0;
      g.bossAnimTimer = 0;
      g.heroOffsetX = 0;
      g.bossOffsetX = 0;
      g.heroScaleMul = 1;
      g.bossScaleMul = 1;
      g.bossRotation = 0;
      g.shakeIntensity = 0;
      g.shakeDuration = 0;
      g.cameraScale = 1;
      g.cameraFocusX = 0;
      g.cameraFocusY = 0;
      g.cameraPanX = 0;
      g.cameraPanY = 0;
      g.heroAlpha = 1;
      g.bossAlpha = 1;
      g.bossYOffset = 0;
      g.bgOverlayAlpha = 0;
      g.bgOverlayColor = 0x000000;
      g.bgOverlayPulseAlpha = 0;
      g.hitStopUntil = 0;
      g.time = 0;
    };
  }, [gameKey, selectedHero]);

  const q = currentQ;
  const bossPct = bossHp / HP_MAX;
  const heroPct = heroHp / HP_MAX;

  const resolveAnswer = useCallback(
    (idx: number, timedOut: boolean) => {
      const g = gameRef.current;
      const cq = currentQ;
      const correct = !timedOut && idx === cq.correctIndex;

      // Phase context for this answer (only present in phased mode).
      // We look up the phase via the flat-index map built at mount;
      // this is decoupled from the question advance logic so phases
      // never touch the combat path.
      const currentPhase =
        phaseOfQuestion ? phaseOfQuestion[stats.totalAsked] : null;

      // Emit a per-question outcome BEFORE state mutations so the
      // parent can persist a QuestionResponse row + analytics event
      // even if downstream effects later fail. The questionKey falls
      // back to a position-based id when the data file didn't supply
      // a stable one. When phased, phaseId travels with the outcome
      // so the parent dashboard can attribute wrong-answers to acts.
      onQuestionAnswered?.({
        key: cq.key ?? `boss-${stats.totalAsked}`,
        selectedIndex: timedOut ? -1 : idx,
        correctIndex: cq.correctIndex,
        wasCorrect: correct,
        position: stats.totalAsked + 1,
        phaseId: currentPhase?.id,
      });

      // Tally per-phase totals + detect phase boundary crossing.
      // Phase boundary cross = (current question index is the last in
      // its phase) AND there's a next phase. Fire an announcement
      // with the next phase's announce text so the child knows the
      // mood is changing.
      if (currentPhase && phaseOfQuestion && phases) {
        const stat = phaseStatsRef.current.get(currentPhase.id);
        if (stat) {
          if (correct) stat.correctCount += 1;
          else stat.wrongCount += 1;
        }
        const nextIndex = stats.totalAsked + 1;
        const nextPhase =
          nextIndex < phaseOfQuestion.length ? phaseOfQuestion[nextIndex] : null;
        const isLastQuestionOverall = nextIndex >= phaseOfQuestion.length;
        // Only announce when we actually cross into a new phase AND
        // the hero isn't about to win/lose. The end-of-fight
        // animations get their own cinematic - don't pile on.
        if (
          nextPhase &&
          nextPhase.id !== currentPhase.id &&
          !isLastQuestionOverall
        ) {
          // Schedule the announcement AFTER the existing answer
          // feedback + advance delay (current code waits ~1.3s on
          // correct, 2.5s on wrong before advancing). 200ms earlier
          // than the advance feels like the announcement led the
          // question swap.
          window.setTimeout(() => {
            showAnnouncement(nextPhase.announceText, nextPhase.announceTone);
          }, correct ? 1100 : 2300);
        }
      }

      // Pause the timer and record speed for this question.
      timerRunningRef.current = false;
      const answerMs =
        questionStartTsRef.current !== null
          ? performance.now() - questionStartTsRef.current
          : currentQuestionMs;
      const elapsedForBonus = Math.min(answerMs, currentQuestionMs);
      setFastestMs((prev) => (prev === null || answerMs < prev ? answerMs : prev));

      if (correct) {
        const newCombo = combo + 1;
        const quickBonus = elapsedForBonus < 5000 ? 3 : 0;
        const isSuper = superReady;
        const baseDamage = isSuper ? 40 : Math.min(30, 8 + combo * 3);
        const damage = baseDamage + quickBonus;
        const newBossHp = Math.max(0, bossHp - damage);
        setCombo(newCombo);
        setBossHp(newBossHp);
        setStats((s) => ({
          totalAsked: s.totalAsked + 1,
          correct: s.correct + 1,
          maxCombo: Math.max(s.maxCombo, newCombo),
        }));
        playSound("correct");
        showCenterFeedback("correct");

        // Adaptive difficulty - 3 correct in a row bumps level up (max 2).
        g.consecutiveWrong = 0;
        g.consecutiveCorrect += 1;
        if (g.consecutiveCorrect >= 3 && g.difficultyLevel < 2) {
          g.difficultyLevel = ((g.difficultyLevel + 1) as 0 | 1 | 2);
          g.consecutiveCorrect = 0;
        }

        if (isSuper) {
          setSuperReady(false);
          showAnnouncement("SUPER CYBER BLAST!", "gold");
          playerAttack(g, damage, { isSuper: true });
          bumpArenaShake(12);
        } else {
          const cry = HERO_CRIES[Math.floor(Math.random() * HERO_CRIES.length)];
          showAnnouncement(cry, "blue");
          playerAttack(g, damage);
          bumpArenaShake(damage >= 25 ? 8 : damage >= 15 ? 6 : 4);
        }

        if (quickBonus > 0) {
          window.setTimeout(() => showAnnouncement("QUICK!", "cyan"), 420);
        }

        if (newCombo > 0 && newCombo % 5 === 0 && !isSuper) {
          setSuperReady(true);
          playSound("streak5");
        } else if (newCombo === 3) {
          playSound("streak3");
        } else if (newCombo >= 7 && newCombo % 2 === 1) {
          playSound("streak7");
        }

        // Hero encouragement speech at combo milestones
        if (newCombo === 3) {
          showHeroSpeech(HERO_LINES_3[Math.floor(Math.random() * HERO_LINES_3.length)]);
        } else if (newCombo === 5) {
          showHeroSpeech(HERO_LINES_5[Math.floor(Math.random() * HERO_LINES_5.length)]);
        } else if (newCombo >= 7) {
          showHeroSpeech(HERO_LINES_7[Math.floor(Math.random() * HERO_LINES_7.length)]);
        }

        // Phase transition - boss HP crossed 75%, 50%, or 25%. Each
        // threshold escalates the visceral payoff (rage mode kicks in
        // at the lower crossings).
        const prevPct = bossHp / HP_MAX;
        const newPct = newBossHp / HP_MAX;
        const crossed = (t: number) => prevPct > t && newPct <= t;
        if (crossed(0.75)) {
          playSound("phaseChange"); playSound("bossRoar");
          showPhaseAnnouncement("angry");
        } else if (crossed(0.5)) {
          playSound("phaseChange"); playSound("bossRoar");
          showPhaseAnnouncement("phase2");
          // Rage mode kicks in - extra arena shake + danger pulse
          // beyond the standard phase announcement.
          bumpArenaShake(10);
          pulseArenaDanger(700);
          triggerHitStop(g, 80);
          flashOverlay(g, 0xef4444, 0.18, 350);
        } else if (crossed(0.25)) {
          playSound("phaseChange"); playSound("bossRoar");
          showPhaseAnnouncement("final");
          // Desperate phase - heavier shake, longer danger pulse,
          // bigger overlay flash.
          bumpArenaShake(13);
          pulseArenaDanger(900);
          triggerHitStop(g, 120);
          flashOverlay(g, 0xef4444, 0.25, 500);
        }

        if (newBossHp <= 0) {
          // FINAL-BLOW SEQUENCE - freeze frame, zoom, white flash, then
          // a slow-motion beat carries the win-burst before snapping
          // back to normal and revealing the results card.
          triggerHitStop(g, 280);
          // Slow-mo holds AFTER the freeze, through the triggerVictory
          // burst (which fires at 380ms below). 600ms at 0.4× speed
          // = the explosion + golden flash play in dramatic slow-mo.
          window.setTimeout(() => triggerSlowMo(g, 0.4, 600), 280);
          if (g.boss) cameraPulse(g, 1.22, g.boss.x, g.boss.y, -25);
          // Stronger flash on the final blow - reads as the moment of
          // triumph rather than just another particle burst.
          flashOverlay(g, 0xffffff, 0.55, 600);
          bumpArenaShake(14);
          window.setTimeout(() => triggerVictory(g), 380);
          window.setTimeout(() => setResult("won"), 2200);
          return;
        }
      } else {
        // SHIELD: if armed, the kid's defensive charge absorbs this hit
        // entirely - no damage, no combo break, no super-disarm. Single
        // charge per fight. Plays a softer "block" feedback then advances
        // the question.
        if (shieldArmed) {
          setShieldArmed(false);
          setShieldConsumedKey((k) => k + 1);
          setUsedShield(true);
          setStats((s) => ({ ...s, totalAsked: s.totalAsked + 1 }));
          playSound("hitImpact");
          showCenterFeedback("shielded");
          // Hero stays defiant - quick block animation via existing taunt.
          g.heroAnim = "celebrate";
          g.heroAnimTimer = 350;
          setExplanationVisible(true);
          const advanceDelay = 1500;
          window.setTimeout(() => {
            setExplanationVisible(false);
            advanceQuestion();
            setFeedback(null);
            setLocked(false);
            const nextBudget = difficultyTimerMs(g.difficultyLevel);
            setCurrentQuestionMs(nextBudget);
            questionStartTsRef.current = performance.now();
            setTimerMs(nextBudget);
            lastTickSecondRef.current = Math.ceil(nextBudget / 1000);
            timerRunningRef.current = true;
          }, advanceDelay);
          return;
        }

        const damage = difficultyDamage(g.difficultyLevel);
        const newHeroHp = Math.max(0, heroHp - damage);
        setHeroHp(newHeroHp);
        setCombo(0);
        setSuperReady(false);
        setStats((s) => ({ ...s, totalAsked: s.totalAsked + 1 }));
        // Softer "no, try again" cue instead of the sharp buzzer.
        // The wrong path already plays bossAttack SFX a moment later
        // which carries the impact; this just signals "incorrect".
        playSoftWrong();
        showCenterFeedback("wrong");
        showBossTaunt();

        // Adaptive difficulty - 2 wrong in a row drops level (min 0).
        g.consecutiveCorrect = 0;
        g.consecutiveWrong += 1;
        if (g.consecutiveWrong >= 2 && g.difficultyLevel > 0) {
          g.difficultyLevel = ((g.difficultyLevel - 1) as 0 | 1 | 2);
          g.consecutiveWrong = 0;
        }

        const cry = BOSS_CRIES[Math.floor(Math.random() * BOSS_CRIES.length)];
        showAnnouncement(cry, "red");
        bossAttack(g, damage);
        setShakeWrong(true);
        window.setTimeout(() => setShakeWrong(false), 400);
        bumpArenaShake(7);
        pulseArenaDanger(500);

        // Post-wrong - reveal correct answer + explanation for ~1.7s before advancing
        setExplanationVisible(true);

        if (newHeroHp <= 0) {
          // DEFEAT SEQUENCE - small hit-stop, then a brief red-tinted
          // slow-mo carries the boss's victory taunt before the
          // results card appears.
          triggerHitStop(g, 180);
          window.setTimeout(() => triggerSlowMo(g, 0.45, 500), 180);
          flashOverlay(g, 0xef4444, 0.35, 500);
          window.setTimeout(() => triggerDefeat(g), 300);
          window.setTimeout(() => setResult("lost"), 1800);
          return;
        }
      }

      const advanceDelay = correct ? 1300 : 2500;
      window.setTimeout(() => {
        setExplanationVisible(false);
        advanceQuestion();
        setFeedback(null);
        setLocked(false);
        // New question - difficulty may have shifted; rebuild timer budget.
        const nextBudget = difficultyTimerMs(g.difficultyLevel);
        setCurrentQuestionMs(nextBudget);
        questionStartTsRef.current = performance.now();
        setTimerMs(nextBudget);
        lastTickSecondRef.current = Math.ceil(nextBudget / 1000);
        timerRunningRef.current = true;
      }, advanceDelay);
    },
    [
      currentQ, combo, bossHp, heroHp, superReady, shieldArmed,
      HERO_CRIES, BOSS_CRIES, HERO_LINES_3, HERO_LINES_5, HERO_LINES_7,
      showAnnouncement, showCenterFeedback, showBossTaunt, showHeroSpeech,
      showPhaseAnnouncement, advanceQuestion,
      bumpArenaShake, pulseArenaDanger,
      onQuestionAnswered, stats.totalAsked,
      phaseOfQuestion, phases, showAnnouncement,
    ]
  );

  const handleAnswer = useCallback(
    (idx: number) => {
      if (locked || result || !ready || introStage !== "done") return;
      if (countdownPhase !== null || phaseAnnouncement !== null) return;
      playSound("click");
      setLocked(true);
      setFeedback({ index: idx, correct: idx === currentQ.correctIndex });
      resolveAnswer(idx, false);
    },
    [locked, result, ready, introStage, countdownPhase, phaseAnnouncement, currentQ, resolveAnswer]
  );

  // Phase-based bg tint - soft red as the boss nears death.
  // Also mirror HP-pct into gameRef so the tick can read it without props.
  useEffect(() => {
    const g = gameRef.current;
    const pct = bossHp / HP_MAX;
    g.bossHpPct = pct;
    g.heroHpPct = heroHp / HP_MAX;
    if (pct <= 0.25) {
      g.bgOverlayColor = 0xef4444;
      g.bgOverlayPulseAlpha = 0.06;
    } else if (pct <= 0.5) {
      g.bgOverlayColor = 0xef4444;
      g.bgOverlayPulseAlpha = 0.03;
    } else {
      g.bgOverlayPulseAlpha = 0;
    }
  }, [bossHp, heroHp]);

  // Mirror SUPER-READY into the gameRef so the camera tick can latch
  // a sustained dolly-in zoom while the kid has super armed.
  useEffect(() => {
    gameRef.current.superZoomActive = superReady;
  }, [superReady]);

  // Parallax mouse tracking - disable on narrow screens + touch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = "ontouchstart" in window || window.innerWidth < 768;
    if (isTouch) return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      gameRef.current.mouseOffsetX = (e.clientX - w / 2) / w;
      gameRef.current.mouseOffsetY = (e.clientY - h / 2) / h;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Timer countdown - only during active gameplay (not intro, countdown, or phase transitions)
  useEffect(() => {
    if (introStage !== "done" || result || countdownPhase !== null || phaseAnnouncement !== null) return;
    const id = window.setInterval(() => {
      if (!timerRunningRef.current) return;
      if (questionStartTsRef.current === null) return;
      const elapsed = performance.now() - questionStartTsRef.current;
      const remaining = Math.max(0, currentQuestionMs - elapsed);
      setTimerMs(remaining);
      const secLeft = Math.ceil(remaining / 1000);
      if (secLeft !== lastTickSecondRef.current) {
        if (secLeft > 0 && secLeft <= 3) playSound("timerTick");
        lastTickSecondRef.current = secLeft;
      }
      if (remaining <= 0 && !locked) {
        // Time up - treat as wrong answer, no index
        timerRunningRef.current = false;
        setLocked(true);
        setFeedback({ index: -1, correct: false });
        resolveAnswer(-1, true);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [introStage, result, locked, countdownPhase, phaseAnnouncement, resolveAnswer]);

  // Auto-fire onEnd only on defeat - victory waits for "Continue →" click.
  useEffect(() => {
    if (result !== "lost" || !onEnd) return;
    const accuracy =
      stats.totalAsked > 0 ? Math.round((stats.correct / stats.totalAsked) * 100) : 0;
    const xp = 100 + stats.correct * 15 + stats.maxCombo * 25;
    const durationMs = Math.max(0, performance.now() - bossStartedAtRef.current);
    onEnd(false, {
      combo: stats.maxCombo,
      accuracy,
      xp,
      totalQuestions: stats.totalAsked,
      correctCount: stats.correct,
      wrongCount: Math.max(0, stats.totalAsked - stats.correct),
      durationMs: Math.round(durationMs),
      // Snapshot of per-phase totals; empty array in legacy (non-phased) mode.
      phaseResults: Array.from(phaseStatsRef.current.values()),
    });
  }, [result, stats, onEnd]);

  // Pending level-up info - shown between "Continue →" click and onEnd.
  const [pendingLevelUp, setPendingLevelUp] = useState<
    { oldRank: RankInfo; newRank: RankInfo; totalXP: number } | null
  >(null);
  // Has XP already been persisted for this victory? Guard against double-add.
  const xpPersistedRef = useRef(false);

  useEffect(() => {
    if (result !== "won" || xpPersistedRef.current) return;
    xpPersistedRef.current = true;
    const accuracy =
      stats.totalAsked > 0
        ? Math.round((stats.correct / stats.totalAsked) * 100)
        : 0;
    const xp = 100 + stats.correct * 15 + stats.maxCombo * 25;
    const xpResult = addXP(xp, "boss-battle-week-1");
    earnBadge("week-1");
    if (xpResult.leveledUp) {
      setPendingLevelUp({
        oldRank: xpResult.oldRank,
        newRank: xpResult.newRank,
        totalXP: xpResult.newTotal,
      });
    }
    void accuracy;
  }, [result, stats]);

  const finishToParent = useCallback(() => {
    if (!onEnd) return;
    const accuracy =
      stats.totalAsked > 0
        ? Math.round((stats.correct / stats.totalAsked) * 100)
        : 0;
    const xp = 100 + stats.correct * 15 + stats.maxCombo * 25;
    const durationMs = Math.max(0, performance.now() - bossStartedAtRef.current);
    onEnd(true, {
      combo: stats.maxCombo,
      accuracy,
      xp,
      totalQuestions: stats.totalAsked,
      correctCount: stats.correct,
      wrongCount: Math.max(0, stats.totalAsked - stats.correct),
      durationMs: Math.round(durationMs),
      phaseResults: Array.from(phaseStatsRef.current.values()),
    });
  }, [onEnd, stats]);

  const handleContinue = useCallback(() => {
    playSound("select");
    if (pendingLevelUp) {
      // Show level-up overlay first; onEnd fires once it's dismissed.
      return;
    }
    finishToParent();
  }, [pendingLevelUp, finishToParent]);

  const dismissLevelUp = useCallback(() => {
    setPendingLevelUp(null);
    finishToParent();
  }, [finishToParent]);

  const restart = () => {
    playSound("select");
    setHeroHp(HP_MAX);
    setBossHp(HP_MAX);
    setGhostHeroHp(HP_MAX);
    setGhostBossHp(HP_MAX);
    setCombo(0);
    setSuperReady(false);
    // Re-arm the shield charge for the next attempt.
    setShieldArmed(true);
    setShieldConsumedKey(0);
    setUsedShield(false);
    setQuestionIdx(0);
    // Reset the pool pointers and start from the first easy question.
    easyIdxRef.current = 1;
    medIdxRef.current = 0;
    hardIdxRef.current = 0;
    setCurrentQ(customQuestions ? customQuestions[0] : EASY_QUESTIONS[0]);
    setFeedback(null);
    setLocked(false);
    setResult(null);
    setStats({ totalAsked: 0, correct: 0, maxCombo: 0 });
    setFastestMs(null);
    setAnnouncement(null);
    setIntroStage("dark");
    setStatsStage(0);
    setCountdownPhase(null);
    setBossTaunt(null);
    setHeroSpeech(null);
    setCenterFeedback(null);
    setPhaseAnnouncement(null);
    setExplanationVisible(false);
    const g = gameRef.current;
    g.difficultyLevel = 0;
    g.consecutiveCorrect = 0;
    g.consecutiveWrong = 0;
    const resetBudget = difficultyTimerMs(0);
    setCurrentQuestionMs(resetBudget);
    setTimerMs(resetBudget);
    timerRunningRef.current = false;
    questionStartTsRef.current = null;
    setReady(false);
    setGameKey((k) => k + 1);
  };

  // Victory stats stagger - reveal one stat line every ~0.5s, then stars + button.
  // Stage meanings:
  //  0 = heading only, 1 = accuracy, 2 = combo, 3 = questions, 4 = fastest,
  //  5 = XP, 6 = stars revealing, 7 = stars done + Play Again button
  const [starsRevealed, setStarsRevealed] = useState(0);
  useEffect(() => {
    if (result !== "won") {
      setStatsStage(0);
      setStarsRevealed(0);
      return;
    }
    const acc = stats.totalAsked > 0 ? (stats.correct / stats.totalAsked) : 0;
    const starCount = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    const schedule: number[] = [];
    schedule.push(window.setTimeout(() => setStatsStage(1), 1500));
    schedule.push(window.setTimeout(() => setStatsStage(2), 2000));
    schedule.push(window.setTimeout(() => setStatsStage(3), 2500));
    schedule.push(window.setTimeout(() => setStatsStage(4), 3000));
    schedule.push(window.setTimeout(() => setStatsStage(5), 3500));
    schedule.push(window.setTimeout(() => setStatsStage(6), 4000));
    // Stars pop in one at a time (300ms apart), each playing starEarned
    for (let i = 0; i < starCount; i++) {
      schedule.push(window.setTimeout(() => {
        setStarsRevealed(i + 1);
        playSound("starEarned");
      }, 4000 + i * 300));
    }
    schedule.push(window.setTimeout(() => setStatsStage(7), 4000 + starCount * 300 + 400));
    return () => {
      for (const id of schedule) window.clearTimeout(id);
    };
  }, [result, stats.totalAsked, stats.correct]);

  const finalAccuracy =
    stats.totalAsked > 0 ? Math.round((stats.correct / stats.totalAsked) * 100) : 0;
  const finalXp = 100 + stats.correct * 15 + stats.maxCombo * 25;

  // Compute end-of-run achievements once we hit "won". `freshlyEarned`
  // is the IDs unlocked *this run* (highlighted with a "NEW!" tag);
  // `earnedAllTime` includes prior unlocks so the kid sees their
  // collection-to-date.
  const achievementResult = useMemo(() => {
    if (result !== "won") return null;
    const prior = loadEarnedAchievements();
    const freshlyEarned = computeAchievementsForRun({
      heroHp,
      correct: stats.correct,
      totalAsked: stats.totalAsked,
      maxCombo: stats.maxCombo,
      usedShield,
      hasPriorWin: prior.has("first-win"),
    });
    const merged = new Set(prior);
    freshlyEarned.forEach((id) => merged.add(id));
    return { freshlyEarned, earnedAllTime: merged };
  }, [result, heroHp, stats.correct, stats.totalAsked, stats.maxCombo, usedShield]);

  useEffect(() => {
    if (achievementResult) {
      saveEarnedAchievements(achievementResult.earnedAllTime);
    }
  }, [achievementResult]);

  // Edge-glow arena lighting - picks the highest-priority game state and
  // applies a coloured inset box-shadow across the play area. Smooth
  // transitions on state changes via CSS `transition: box-shadow`.
  const edgeGlow = useMemo(() => {
    if (result) return null;
    if (introStage !== "done") return null;
    if (superReady) return { color: "rgba(125, 240, 255, 0.7)", spread: 36, blur: 90 };
    const bossPctNow = bossHp / HP_MAX;
    if (bossPctNow > 0 && bossPctNow <= 0.25) return { color: "rgba(239, 68, 68, 0.7)", spread: 40, blur: 100 };
    if (bossPctNow > 0 && bossPctNow <= 0.5)  return { color: "rgba(249, 115, 22, 0.55)", spread: 30, blur: 80 };
    if (combo >= 5) return { color: "rgba(253, 224, 71, 0.55)", spread: 28, blur: 75 };
    return null;
  }, [result, introStage, superReady, bossHp, combo]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#080c18",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {!selectedHero && (
        <div className="bb-sel-screen">
          {/* Live R3F atmosphere - cosmic atrium, sits behind the CSS
              decoration layers and the cards. */}
          <div className="bb-sel-canvas" aria-hidden="true">
            {!isMobile && <HeroSelectAtmosphere />}
          </div>

          {/* Background layers - cosmic blobs + bottom horizon haze */}
          <div className="bb-sel-mesh bb-sel-mesh-blue" />
          <div className="bb-sel-mesh bb-sel-mesh-purple" />
          <div className="bb-sel-haze" />
          <div className="bb-sel-beam" />

          {/* Subtle full-bleed vignette + ultra-fine grain overlay -
              focuses attention to the centre and adds the "filmic"
              quality high-end games tend to have. */}
          <div className="bb-sel-vignette" aria-hidden="true" />
          <div className="bb-sel-grain" aria-hidden="true" />

          {/* Lightning streaks scattered across the screen - was 6,
              trimmed to 3 to ease GPU paint while the R3F atmosphere
              runs behind. */}
          {[
            { left: "12%", h: 240, dur: 7,   delay: 0 },
            { left: "55%", h: 280, dur: 9,   delay: 3 },
            { left: "88%", h: 200, dur: 8.5, delay: 5 },
          ].map((b, i) => (
            <span
              key={`bolt-${i}`}
              className="bb-sel-bolt"
              aria-hidden="true"
              style={{
                left: b.left,
                height: b.h,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}

          {/* Drifting particles - warm cosmic palette to match the
              lock screen (gold / coral / pink / cosmic / cyan). */}
          <div className="bb-sel-particles" aria-hidden="true">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="bb-sel-particle"
                style={{
                  left: `${(i * 4.17 + (i % 3) * 2.5) % 100}%`,
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`,
                  background: ["#ffd158", "#ffb347", "#ff5fb3", "#7c5cff", "#7df0ff"][i % 5],
                  animationDelay: `${(i * 0.95) % 12}s`,
                  animationDuration: `${14 + (i % 6) * 2.5}s`,
                }}
              />
            ))}
          </div>

          {/* Tesla arc across the centre - fires every ~2.6s. Two zigzag
              SVG paths (cyan + bright white core) for proper electric
              bolt look. Sits between the hero cards. */}
          <svg
            className="bb-sel-tesla"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,15 L8,8 L16,20 L24,10 L32,18 L40,7 L48,16 L56,12 L64,22 L72,9 L80,17 L88,11 L100,15"
              stroke="#7df0ff"
              style={{ color: "#7df0ff" }}
            />
            <path
              d="M0,15 L8,8 L16,20 L24,10 L32,18 L40,7 L48,16 L56,12 L64,22 L72,9 L80,17 L88,11 L100,15"
              stroke="#ffffff"
              style={{ strokeWidth: 0.3, opacity: 0.9 }}
            />
          </svg>

          {/* Title block */}
          <h1 className="bb-sel-title">CHOOSE YOUR HERO</h1>
          <p className="bb-sel-subtitle">
            Who will face <span className="bb-sel-subtitle-boss">{bossName}</span>?
          </p>
          <div className="bb-sel-rule" aria-hidden="true" />

          {/* Cards */}
          {(() => {
            type CardConfig = {
              id: HeroId;
              label: string;
              title: string;
              image: string;
              colour: string;
              description: string;
              stats: { attack: number; defence: number; speed: number };
              btnGradient: string;
              shimmerDelay: string;
            };
            const cardConfigs: CardConfig[] = [
              {
                id: "adam",
                label: "ADAM",
                title: "The Shield Bearer",
                image: ASSET_PATHS.adamSelect,
                colour: "#00e5ff",
                description:
                  "Brave and strong. Uses his Cyber Shield to block attacks and protect the digital world.",
                stats: { attack: 80, defence: 100, speed: 60 },
                btnGradient: "linear-gradient(135deg, #00e5ff, #7c5cff)",
                shimmerDelay: "0s",
              },
              {
                id: "layla",
                label: "LAYLA",
                title: "The Tech Prodigy",
                image: ASSET_PATHS.laylaSelect,
                colour: "#7eff97",
                description:
                  "Smart and quick. Uses her Tech Tablet to blast through firewalls and decode secrets.",
                stats: { attack: 60, defence: 60, speed: 100 },
                btnGradient: "linear-gradient(135deg, #7eff97, #00e5ff)",
                shimmerDelay: "1.5s",
              },
            ];
            const renderCard = (c: CardConfig, idx: number) => {
              const chosen = selecting === c.id;
              const faded = selecting !== null && selecting !== c.id;
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${c.label}`}
                  className={
                    "bb-sel-card " +
                    (idx === 0 ? "bb-sel-card-left" : "bb-sel-card-right") +
                    (chosen ? " bb-sel-chosen" : "") +
                    (faded ? " bb-sel-dim" : "")
                  }
                  style={
                    {
                      "--c-colour": c.colour,
                    } as React.CSSProperties
                  }
                  onMouseEnter={() => { if (!selecting) playSound("whoosh"); }}
                  onClick={() => chooseHero(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      chooseHero(c.id);
                    }
                  }}
                >
                  <div className="bb-sel-spot">
                    <div className="bb-sel-spot-glow" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.label}
                      className="bb-sel-img"
                      style={{
                        width: "auto",
                        maxWidth: "100%",
                        maxHeight: "320px",
                        height: "auto",
                        objectFit: "contain",
                        objectPosition: "center center",
                      }}
                    />
                    <div className="bb-sel-platform" />
                  </div>

                  <div className="bb-sel-info">
                    <h2 className="bb-sel-name" style={{ color: c.colour }}>
                      {c.label}
                    </h2>
                    <p className="bb-sel-role">{c.title}</p>
                    <div className="bb-sel-divider" />
                    <p className="bb-sel-desc">{c.description}</p>

                    <div className="bb-sel-stats">
                      {(
                        [
                          ["ATTACK", c.stats.attack],
                          ["DEFENCE", c.stats.defence],
                          ["SPEED", c.stats.speed],
                        ] as const
                      ).map(([label, value], si) => {
                        const filledCount = Math.round(value / 10);
                        return (
                          <div key={label} className="bb-sel-stat-row">
                            <span className="bb-sel-stat-label">{label}</span>
                            <div className="bb-sel-stat-track">
                              {Array.from({ length: 10 }, (_, ti) => {
                                const filled = ti < filledCount;
                                const lead = ti === filledCount - 1;
                                return (
                                  <span
                                    key={ti}
                                    className={
                                      "bb-sel-tick" +
                                      (filled ? " bb-sel-tick-on" : "") +
                                      (lead ? " bb-sel-tick-lead" : "")
                                    }
                                    style={{
                                      animationDelay: `${0.7 + idx * 0.15 + si * 0.12 + ti * 0.05}s`,
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <span className="bb-sel-stat-value" style={{ color: c.colour }}>
                              {filledCount}
                              <span className="bb-sel-stat-value-max">/10</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="bb-sel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        chooseHero(c.id);
                      }}
                      disabled={!!selecting}
                      style={{
                        background: c.btnGradient,
                        boxShadow: `0 6px 22px ${c.colour}55`,
                      }}
                    >
                      <span className="bb-sel-btn-label">SELECT</span>
                      <span
                        className="bb-sel-btn-shimmer"
                        style={{ animationDelay: c.shimmerDelay }}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              );
            };
            return (
              <div className="bb-sel-cards">
                {renderCard(cardConfigs[0], 0)}
                <div className="bb-sel-or" aria-hidden="true">
                  <span className="bb-sel-or-line" />
                  <span className="bb-sel-or-text">OR</span>
                  <span className="bb-sel-or-line" />
                </div>
                {renderCard(cardConfigs[1], 1)}
              </div>
            );
          })()}

          <p className="bb-sel-footer">
            Both heroes have the same powers - pick your favourite!
          </p>
        </div>
      )}

      {/* 3D Arena - sits BEHIND the PixiJS canvas. */}
      {selectedHero && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            // Adam = cool tech-blue; Layla = cosmic violet/pink. The
            // hue-rotate is a global filter on the rendered Arena3D
            // canvas so every inline-coloured mesh inside (wireframe
            // globe, conduits, hex nodes, arcs) shifts together -
            // way cheaper than threading heroId through every color
            // literal in the 2800-line scene.
            filter: selectedHero === "adam" ? "hue-rotate(-70deg) saturate(0.95)" : "none",
            background: selectedHero === "adam"
              ? "radial-gradient(ellipse at 50% 60%, #08243a 0%, #08142e 35%, #04050d 100%)"
              : "radial-gradient(ellipse at 50% 60%, #1a0e22 0%, #0f1530 35%, #04050d 100%)",
          }}
        >
          <Arena3D
            width={viewport.w}
            height={viewport.h}
            phase={arenaPhase}
            shakeIntensity={arenaShake.mag}
            shakeKey={arenaShake.key}
            mood={arenaMood}
            heroId={selectedHero ?? "adam"}
          />
        </div>
      )}

      {/* PixiJS canvas - transparent, sits above the 3D arena. */}
      {selectedHero && (
        <div
          ref={canvasHostRef}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
      )}

      {/* Intro: dark letterbox during the opening 500ms */}
      {selectedHero && ready && introStage === "dark" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Intro banners: STAGE 1 / VS / HACKER RACCOON */}
      {selectedHero && ready && introStage === "stage1" && (
        <div className="bb-intro-banner bb-intro-stage1">STAGE 1</div>
      )}
      {selectedHero && ready && introStage === "vs" && (
        <div className="bb-intro-banner bb-intro-vs">VS</div>
      )}
      {selectedHero && ready && (introStage === "bossName" || introStage === "bossDrop") && (
        <div className="bb-intro-banner bb-intro-bossname">{bossName}</div>
      )}

      {/* Attack announcement strip */}
      {announcement && (
        <div
          className={`bb-announcement bb-announce-${announcement.tone}`}
          aria-live="polite"
        >
          {announcement.text}
        </div>
      )}

      {/* Pre-question countdown (3 → 2 → 1 → GO!) */}
      {countdownPhase !== null && (
        <div
          key={`cd-${countdownPhase}`}
          className={`bb-countdown ${countdownPhase === "GO" ? "bb-countdown-go" : ""}`}
          aria-live="assertive"
        >
          {countdownPhase === "GO" ? "GO!" : countdownPhase}
        </div>
      )}

      {/* Boss speech bubble (taunt on wrong answer) */}
      {bossTaunt && (
        <div
          className="bb-speech bb-speech-boss"
          style={{ left: `${72}%`, top: `calc(52vh - 180px)` }}
        >
          <div className="bb-speech-text">{bossTaunt}</div>
          <div className="bb-speech-tail bb-speech-tail-boss" />
        </div>
      )}

      {/* Hero speech bubble (encouragement on combo milestones) */}
      {heroSpeech && (
        <div
          className="bb-speech bb-speech-hero"
          style={{ left: `${22}%`, top: `calc(55vh - 180px)` }}
        >
          <div className="bb-speech-text">{heroSpeech}</div>
          <div className="bb-speech-tail bb-speech-tail-hero" />
        </div>
      )}

      {/* Edge-glow arena lighting - single inset shadow whose colour /
          spread / blur change with game state (super armed → cyan,
          boss rage → orange/red, combo 5+ → gold). Smooth box-shadow
          transition + a gentle pulse keep it alive. */}
      <div
        aria-hidden
        className={edgeGlow ? "bb-edge-glow bb-edge-glow-on" : "bb-edge-glow"}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          transition: "box-shadow 0.5s ease, opacity 0.4s ease",
          opacity: edgeGlow ? 1 : 0,
          boxShadow: edgeGlow
            ? `inset 0 0 ${edgeGlow.blur}px ${edgeGlow.spread}px ${edgeGlow.color}`
            : "none",
        }}
      />

      {/* Centre correct/wrong flash */}
      {centerFeedback && (
        <div
          key={`cf-${centerFeedback}-${stats.totalAsked}`}
          className={`bb-center-fb bb-center-fb-${centerFeedback}`}
          aria-live="polite"
        >
          {centerFeedback === "correct" ? "✓ CORRECT!" : centerFeedback === "shielded" ? "🛡 SHIELDED!" : "✗ WRONG"}
        </div>
      )}

      {/* Phase transition announcement (with screen darken) */}
      {phaseAnnouncement && (
        <>
          <div className="bb-phase-darken" />
          <div
            className={`bb-phase-banner bb-phase-${phaseAnnouncement}`}
            aria-live="assertive"
          >
            {phaseAnnouncement === "angry"
              ? "HACKER RACCOON IS GETTING ANGRY!"
              : phaseAnnouncement === "phase2"
                ? "PHASE 2 - DANGER RISING!"
                : "FINAL PHASE - FINISH HIM!"}
          </div>
        </>
      )}

      {selectedHero && !ready && !loadError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cbd5e1",
            fontSize: 14,
            letterSpacing: "0.08em",
            zIndex: 2,
          }}
        >
          Loading arena…
        </div>
      )}

      {selectedHero && loadError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fca5a5",
            fontSize: 14,
            padding: 24,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          Failed to load game: {loadError}
        </div>
      )}

      {/* HP bars */}
      {selectedHero && (
      <div
        style={{
          position: "absolute",
          // Respect iOS safe-area-inset-top so the bars don't slide
          // behind a notch / Dynamic Island. Falls back to 14px.
          top: "max(14px, env(safe-area-inset-top, 0px))",
          left: "max(20px, env(safe-area-inset-left, 0px))",
          right: "max(20px, env(safe-area-inset-right, 0px))",
          display: "flex",
          gap: 24,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #60a5fa",
              boxShadow: "0 0 10px rgba(59,130,246,0.5)",
              flexShrink: 0, fontSize: 14,
            }}
          >
            <span style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))" }}>🛡</span>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#cbd5e1",
                letterSpacing: "0.12em",
                marginBottom: 3,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              <span style={{ fontWeight: 800, color: "#bfdbfe" }}>{selectedHero === "layla" ? "LAYLA" : "ADAM"}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 11, fontWeight: 700, color: heroPct > 0.3 ? "#cbd5e1" : "#fca5a5" }}>{heroHp}<span style={{ opacity: 0.55 }}> / {HP_MAX}</span></span>
            </div>
            <div
              className={
                "bb-hp-bar" +
                (heroPct < 0.25 ? " bb-hp-low bb-hp-low-hero" : "")
              }
              style={{
                position: "relative",
                height: 12,
                background: "rgba(15,23,42,0.85)",
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.3)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {/* Ghost (delayed) fill - drains slowly after a hit */}
              <div
                className="bb-hp-ghost"
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  height: "100%",
                  width: `${(ghostHeroHp / HP_MAX) * 100}%`,
                  background: "rgba(250,204,21,0.55)",
                  transition: "width 0.8s ease-out",
                }}
              />
              <div
                className="bb-hp-fill"
                style={{
                  position: "relative",
                  height: "100%",
                  width: `${heroPct * 100}%`,
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px), ${
                    heroPct > 0.3
                      ? "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)"
                      : "linear-gradient(90deg, #f97316 0%, #ef4444 100%)"
                  }`,
                  backgroundSize: "20px 20px, 100% 100%",
                  // Punchy easeOutExpo for the bar drain - fast first
                  // 60% then settles. Pairs with the ghost-bar trailing
                  // yellow underneath (already eased at 0.8s) so each
                  // hit reads as: bar snaps down → yellow drains after.
                  transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#cbd5e1",
                letterSpacing: "0.12em",
                marginBottom: 3,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 11, fontWeight: 700, color: bossPct > 0.3 ? "#cbd5e1" : "#fca5a5" }}>{bossHp}<span style={{ opacity: 0.55 }}> / {HP_MAX}</span></span>
              <span style={{ fontWeight: 800, color: "#fca5a5" }}>{bossName}</span>
            </div>
            <div
              className={
                "bb-hp-bar" +
                (bossPct < 0.25 ? " bb-hp-low bb-hp-shake" : "")
              }
              style={{
                position: "relative",
                height: 12,
                background: "rgba(15,23,42,0.85)",
                borderRadius: 6,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.3)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="bb-hp-ghost"
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  height: "100%",
                  width: `${(ghostBossHp / HP_MAX) * 100}%`,
                  background: "rgba(250,204,21,0.55)",
                  transition: "width 0.8s ease-out",
                }}
              />
              <div
                className="bb-hp-fill"
                style={{
                  position: "relative",
                  height: "100%",
                  width: `${bossPct * 100}%`,
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px), linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                  backgroundSize: "20px 20px, 100% 100%",
                  // Match hero bar - punchy drain, ghost trails.
                  transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #a78bfa",
              boxShadow: "0 0 10px rgba(139,92,246,0.5)",
              flexShrink: 0, fontSize: 14,
            }}
          >
            <span style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))" }}>💀</span>
          </div>
        </div>
      </div>
      )}

      {/* Combo counter - scales harder with combo size: bigger font,
          colour shifts yellow → orange → magenta, glow ramps up, and
          a screen-edge accent vignette kicks in at combo 5+. */}
      {selectedHero && combo > 1 && (() => {
        // Tiered visual escalation by combo size.
        const tier = combo >= 7 ? 3 : combo >= 5 ? 2 : combo >= 3 ? 1 : 0;
        const fontSize = Math.min(72, 24 + combo * 5);
        const palette: Array<{ text: string; glow: string; shadow: string; chip: string }> = [
          { text: "#fde047", glow: "rgba(250,204,21,0.7)", shadow: "rgba(250,204,21,0.5)", chip: "linear-gradient(90deg, #fde047, #f97316)" },
          { text: "#fde047", glow: "rgba(250,204,21,0.85)", shadow: "rgba(250,204,21,0.7)", chip: "linear-gradient(90deg, #fde047, #f97316)" },
          { text: "#fb923c", glow: "rgba(249,115,22,0.95)", shadow: "rgba(249,115,22,0.8)", chip: "linear-gradient(90deg, #fb923c, #ef4444)" },
          { text: "#f472b6", glow: "rgba(244,114,182,1)", shadow: "rgba(244,114,182,0.85)", chip: "linear-gradient(90deg, #f472b6, #a855f7)" },
        ];
        const p = palette[tier];
        const label = combo >= 7 ? "MEGA STRIKE" : combo >= 5 ? "TRIPLE STRIKE" : "DOUBLE STRIKE";
        return (
          <>
            <div
              key={combo}
              style={{
                position: "absolute",
                top: 70,
                right: 20,
                pointerEvents: "none",
                animation: `bbComboPop ${0.45 + tier * 0.05}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                fontFamily: "'Space Grotesk', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontSize,
                  fontWeight: 900,
                  color: p.text,
                  textShadow: `0 0 ${14 + tier * 8}px ${p.glow}, 0 0 ${24 + tier * 12}px ${p.shadow}, 2px 2px 0 rgba(0,0,0,0.6)`,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  filter: tier >= 2 ? `drop-shadow(0 0 ${4 + tier * 2}px ${p.glow})` : undefined,
                }}
              >
                {combo}× COMBO
              </div>
              {combo >= 3 && (
                <div
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    background: p.chip,
                    color: "#1a0612",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: `0 0 ${14 + tier * 8}px ${p.glow}`,
                    textTransform: "uppercase",
                  }}
                >
                  ⚡ {label}
                </div>
              )}
            </div>
            {/* Screen-edge vignette at high combo - subtle but signals
                "you are on fire". Pulses while the combo is live. */}
            {tier >= 2 && (
              <div
                aria-hidden
                key={`combo-vignette-${tier}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 1,
                  background: `radial-gradient(ellipse at center, transparent 55%, ${p.glow} 100%)`,
                  opacity: tier === 3 ? 0.4 : 0.22,
                  animation: "bbComboVignettePulse 1.6s ease-in-out infinite",
                  mixBlendMode: "screen",
                }}
              />
            )}
          </>
        );
      })()}

      {/* SHIELD power-up HUD chip - top-left, below HP bars. Pulsing
          cyan when armed; dimmed when consumed. Single charge per fight. */}
      {selectedHero && !result && introStage === "done" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 70,
            left: 20,
            zIndex: 2,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          title={shieldArmed ? "Shield charge ready - absorbs next wrong answer" : "Shield charge already used"}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: shieldArmed
                ? "radial-gradient(circle at 35% 30%, rgba(125, 240, 255, 0.95), rgba(0, 229, 255, 0.55) 60%, rgba(124, 92, 255, 0.55))"
                : "radial-gradient(circle at 35% 30%, rgba(60, 80, 120, 0.7), rgba(20, 28, 60, 0.7))",
              border: shieldArmed ? "2px solid rgba(125, 240, 255, 0.9)" : "2px solid rgba(80, 100, 140, 0.5)",
              boxShadow: shieldArmed
                ? "0 0 14px rgba(125, 240, 255, 0.55), 0 0 30px rgba(125, 240, 255, 0.25)"
                : "none",
              animation: shieldArmed ? "bbShieldIdlePulse 1.6s ease-in-out infinite" : undefined,
              opacity: shieldArmed ? 1 : 0.5,
              transition: "opacity 0.3s ease",
              fontSize: 18,
              filter: shieldArmed ? "none" : "grayscale(70%)",
            }}
          >
            🛡
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: shieldArmed ? "#7df0ff" : "rgba(199, 207, 240, 0.45)",
              textShadow: shieldArmed ? "0 0 8px rgba(125, 240, 255, 0.6)" : "none",
              textTransform: "uppercase",
            }}
          >
            {shieldArmed ? "Shield · Ready" : "Shield · Used"}
          </div>
        </div>
      )}

      {/* Boss-attack TELEGRAPH EMBLEM - a brief icon (🪤/🔨/🌀) floats
          above the raccoon when each new question reveals, colour-glowing
          to match the attack-type banner. Pure visual punctuation. */}
      {selectedHero && !result && q && introStage === "done" && countdownPhase === null && phaseAnnouncement === null && (() => {
        const currentAttack = ATTACK_META[stats.totalAsked % 3];
        return (
          <div
            key={`atk-emblem-${stats.totalAsked}`}
            aria-hidden
            style={{
              position: "absolute",
              top: "16vh",
              left: "75%",
              transform: "translateX(-50%)",
              zIndex: 3,
              pointerEvents: "none",
              animation: "bbEmblemFloat 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 78,
                height: 78,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${currentAttack.color}cc 0%, ${currentAttack.color}55 60%, transparent 85%)`,
                border: `2px solid ${currentAttack.color}`,
                boxShadow: `0 0 28px ${currentAttack.glow}, 0 0 64px ${currentAttack.glow}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                filter: `drop-shadow(0 4px 8px ${currentAttack.glow})`,
              }}
            >
              {currentAttack.icon}
            </div>
            <div
              style={{
                marginTop: 6,
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: currentAttack.color,
                textShadow: `0 0 8px ${currentAttack.glow}`,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              ▸ {currentAttack.name} ◂
            </div>
          </div>
        );
      })()}

      {/* SHIELDED! pop - fires when the shield absorbs a wrong answer.
          Centred ring + label, auto-fades. */}
      {shieldConsumedKey > 0 && (
        <div
          key={`sh-${shieldConsumedKey}`}
          aria-hidden
          style={{
            position: "absolute",
            top: "42%",
            left: "50%",
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "3px solid rgba(125, 240, 255, 0.9)",
              boxShadow: "0 0 32px rgba(125, 240, 255, 0.7)",
              animation: "bbShieldRingExpand 0.9s ease-out both",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}

      {/* Phase badge - only renders in phased mode. Compact pill that
          sits near the top centre, above the boss sprite zone, below
          the HP bars + safe-area inset. Surfaces "Phase 2 of 5 -
          Secrecy" so the child reads progression as acts, not as a
          flat 14-question march. */}
      {selectedHero &&
        !result &&
        introStage === "done" &&
        countdownPhase === null &&
        phaseAnnouncement === null &&
        phaseOfQuestion &&
        phases && phases.length > 0 &&
        (() => {
          const currentPhase = phaseOfQuestion[stats.totalAsked] ?? phaseOfQuestion[phaseOfQuestion.length - 1];
          if (!currentPhase) return null;
          const phaseIndex = phases.findIndex((p) => p.id === currentPhase.id);
          if (phaseIndex < 0) return null;
          const toneBg: Record<typeof currentPhase.announceTone, string> = {
            blue: "linear-gradient(90deg, rgba(59,130,246,0.22), rgba(124,92,255,0.18))",
            red: "linear-gradient(90deg, rgba(239,68,68,0.22), rgba(255,95,179,0.18))",
            gold: "linear-gradient(90deg, rgba(251,191,36,0.22), rgba(249,115,22,0.18))",
            cyan: "linear-gradient(90deg, rgba(0,229,255,0.22), rgba(125,240,255,0.16))",
          };
          const toneText: Record<typeof currentPhase.announceTone, string> = {
            blue: "#93c5fd",
            red: "#fca5a5",
            gold: "#fde047",
            cyan: "#7df0ff",
          };
          const toneBorder: Record<typeof currentPhase.announceTone, string> = {
            blue: "rgba(59,130,246,0.55)",
            red: "rgba(239,68,68,0.5)",
            gold: "rgba(251,191,36,0.55)",
            cyan: "rgba(0,229,255,0.5)",
          };
          return (
            <div
              key={`phase-badge-${currentPhase.id}`}
              aria-live="polite"
              style={{
                position: "absolute",
                top: "calc(max(56px, env(safe-area-inset-top, 0px) + 42px))",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 3,
                pointerEvents: "none",
                padding: "5px 14px",
                borderRadius: 999,
                background: toneBg[currentPhase.announceTone],
                border: `1px solid ${toneBorder[currentPhase.announceTone]}`,
                color: toneText[currentPhase.announceTone],
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                boxShadow: `0 4px 14px rgba(8,10,22,0.4), 0 0 16px ${toneBorder[currentPhase.announceTone]}`,
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                animation: "bbPhaseBadgeIn 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <span style={{ opacity: 0.7 }}>
                Phase {phaseIndex + 1} of {phases.length}
              </span>
              <span aria-hidden style={{ opacity: 0.45, margin: "0 6px" }}>·</span>
              <span>{currentPhase.label}</span>
            </div>
          );
        })()}

      {/* Question panel */}
      {selectedHero && !result && q && introStage === "done" && countdownPhase === null && phaseAnnouncement === null && (() => {
        const currentAttack = ATTACK_META[stats.totalAsked % 3];
        return (
        <div
          // Re-key on every question advance so the animation fires
          // each time. Previously the card mutated in place which
          // read as a hard swap.
          key={`qcard-${stats.totalAsked}`}
          style={{
            position: "absolute",
            // Respect iOS safe-area-inset on every edge. On phones
            // with a home indicator the bottom inset is ~34px, so
            // without this the question card would sit under it.
            left: "max(16px, env(safe-area-inset-left, 0px))",
            right: "max(16px, env(safe-area-inset-right, 0px))",
            bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
            // On short browser windows (e.g. 700px tall) the card
            // could grow tall enough to cover the boss sprite. Cap
            // it at ~45% of the viewport so the combat layer stays
            // visible above. Internal scroll inside the card kicks
            // in if its content (question + 4 answers + explanation)
            // exceeds this height.
            maxHeight: "calc(45dvh - env(safe-area-inset-bottom, 0px))",
            overflowY: "auto",
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,27,75,0.96))",
            backdropFilter: "blur(10px)",
            border: `2px solid ${currentAttack.color}66`,
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: `0 -10px 40px ${currentAttack.glow}, 0 0 0 1px ${currentAttack.color}33`,
            zIndex: 2,
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            // Slide-fade in from below for every new question. Skipped
            // under comfort-mode/reduced-motion via the CSS class on
            // the parent. Pairs with the eased HP drain that fires
            // simultaneously so the whole screen reads as "next round".
            animation: "bbQuestionIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {/* Timer bar */}
          {(() => {
            const pct = Math.max(0, Math.min(1, timerMs / currentQuestionMs));
            const secLeft = Math.ceil(timerMs / 1000);
            const isWarning = secLeft <= 5 && secLeft > 3;
            const isDanger = secLeft <= 3;
            const barColor = isDanger
              ? "linear-gradient(90deg, #ef4444, #f87171)"
              : isWarning
                ? "linear-gradient(90deg, #f97316, #fb923c)"
                : "linear-gradient(90deg, #3b82f6, #10b981)";
            return (
              <div
                style={{
                  width: "100%",
                  height: 4,
                  background: "rgba(15,23,42,0.6)",
                  borderRadius: 2,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  className={isDanger ? "bb-timer-pulse" : undefined}
                  style={{
                    height: "100%",
                    width: `${pct * 100}%`,
                    background: barColor,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>
            );
          })()}

          {superReady && (
            <div className="bb-super-ready" aria-live="polite">
              ⚡ SUPER ATTACK READY!
            </div>
          )}

          {/* ATTACK-TYPE BANNER - uses the hoisted ATTACK_META so the
              card border, the banner, and the boss-emblem float all
              share the same colour/icon/tag for the current attack. */}
          {(() => {
            const meta = currentAttack;
            return (
              <div
                key={`atk-${stats.totalAsked}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "6px 14px 8px",
                  marginBottom: 10,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${meta.color}26, ${meta.color}10)`,
                  border: `1.5px solid ${meta.color}88`,
                  boxShadow: `0 0 18px ${meta.glow}`,
                  animation: "bbFadeIn 0.35s ease-out both",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.25em",
                    color: meta.color,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    opacity: 0.9,
                  }}
                >
                  ⚡ Boss Attack - {meta.tag}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#f1f5f9",
                    letterSpacing: "0.05em",
                    textShadow: `0 0 10px ${meta.glow}`,
                  }}
                >
                  {meta.icon} {meta.name}
                </div>
              </div>
            );
          })()}

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#64748b",
              letterSpacing: "0.1em",
              textAlign: "center",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Question {stats.totalAsked + 1}
          </div>

          <p
            style={{
              color: "#f1f5f9",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 19,
              fontWeight: 700,
              marginBottom: explanationVisible && q.explanation ? 8 : 16,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            {q.question}
          </p>

          {explanationVisible && q.explanation && (
            <p
              style={{
                color: "#fde047",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                marginBottom: 16,
                lineHeight: 1.4,
                textAlign: "center",
                animation: "bbFadeIn 0.25s ease-out",
              }}
            >
              {q.explanation}
            </p>
          )}
          <div
            className="bb-answer-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {q.answers.map((a, i) => {
              const isSelected = feedback?.index === i;
              const isCorrect = locked && i === q.correctIndex;
              const wrongHere = isSelected && !feedback?.correct;
              const classes =
                "bb-answer" +
                (isCorrect ? " bb-answer-correct" : "") +
                (wrongHere ? " bb-answer-wrong" : "") +
                (shakeWrong && wrongHere ? " bb-answer-shake" : "");
              const letter = ["A", "B", "C", "D"][i];
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  onMouseEnter={() => {
                    if (!locked && ready && introStage === "done") playSound("whoosh");
                  }}
                  disabled={locked || !ready || introStage !== "done"}
                  className={classes}
                >
                  <span className="bb-answer-letter">{letter}</span>
                  <span className="bb-answer-text">{a}</span>
                </button>
              );
            })}
          </div>
        </div>
        );
      })()}

      {/* End screen - defeat (kept simple, auto-ends to parent) */}
      {selectedHero && result === "lost" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(ellipse at center, rgba(10,14,26,0.86), rgba(10,14,26,0.96))",
            backdropFilter: "blur(6px)",
            animation: "bbFadeIn 0.5s ease-out",
            padding: 24,
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 58, fontWeight: 700,
              color: "#ef4444",
              marginBottom: 8,
              letterSpacing: "-0.02em",
              textShadow: "0 0 30px rgba(239,68,68,0.6)",
            }}
          >
            DEFEATED
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: 16, marginBottom: 32 }}>
            {bossName} got the better of you. Try again!
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginBottom: 36,
              minWidth: 300,
            }}
          >
            {[
              { value: finalXp, label: "XP EARNED", color: "#3b82f6" },
              { value: `${finalAccuracy}%`, label: "ACCURACY", color: "#10b981" },
              { value: `${stats.maxCombo}×`, label: "MAX COMBO", color: "#fde047" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36, fontWeight: 700,
                    color: s.color,
                    textShadow: `0 0 12px ${s.color}55`,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 11, letterSpacing: "0.06em" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={restart}
            className="bb-play-again"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", border: "none", padding: "14px 36px",
              borderRadius: 100, fontSize: 15, fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(59,130,246,0.4)",
              letterSpacing: "0.02em",
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Victory overlay - celebration screen with staggered stats */}
      {selectedHero && result === "won" && (() => {
        const heroCelebrateSrc = selectedHero === "layla"
          ? ASSET_PATHS.laylaCelebrate
          : ASSET_PATHS.adamCelebrate;
        const xpAccBonus = stats.correct * 15;
        const xpComboBonus = stats.maxCombo * 25;
        return (
          <div className="bb-victory">
            {/* Falling confetti + golden rain */}
            <div className="bb-confetti-bg" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={`c-${i}`}
                  className="bb-confetti-piece"
                  style={{
                    left: `${(i * 4.17 + (i % 3) * 1.3) % 100}%`,
                    background: ["#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f97316", "#ef4444"][i % 6],
                    animationDelay: `${(i * 0.17) % 3}s`,
                    animationDuration: `${3.5 + (i % 4) * 0.6}s`,
                  }}
                />
              ))}
            </div>
            <div className="bb-gold-rain" aria-hidden="true">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={`g-${i}`}
                  className="bb-gold-drop"
                  style={{
                    left: `${(i * 3.1 + (i % 5) * 2) % 100}%`,
                    animationDelay: `${(i * 0.11) % 4}s`,
                    animationDuration: `${4 + (i % 3) * 0.8}s`,
                  }}
                />
              ))}
            </div>

            <div className="bb-victory-content">
              {/* Trophy SVG */}
              <svg
                className="bb-trophy"
                viewBox="0 0 64 64"
                width="80"
                height="80"
                aria-hidden="true"
              >
                <path
                  d="M16 8h32v10a16 16 0 0 1-16 16A16 16 0 0 1 16 18V8z"
                  fill="#fbbf24" stroke="#92400e" strokeWidth="2" strokeLinejoin="round"
                />
                <path d="M12 12h4v6a10 10 0 0 0 4 8c-5 0-10-4-10-10v-4zm36 0h4v4c0 6-5 10-10 10a10 10 0 0 0 4-8h2z"
                  fill="#fbbf24" stroke="#92400e" strokeWidth="2" strokeLinejoin="round"
                />
                <rect x="26" y="34" width="12" height="10" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
                <rect x="18" y="44" width="28" height="6" rx="2" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
                <rect x="14" y="50" width="36" height="6" rx="2" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
              </svg>

              <h2 className="bb-victory-title">VICTORY!</h2>
              <p className="bb-victory-subtitle">You beat {bossName}!</p>

              <div className="bb-victory-body">
                {/* Celebrating hero on the left */}
                <div className="bb-victory-hero">
                  <div className="bb-victory-hero-glow" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroCelebrateSrc}
                    alt={selectedHero === "layla" ? "Layla celebrating" : "Adam celebrating"}
                  />
                </div>

                {/* Stats column */}
                <div className="bb-victory-stats">
                  {[
                    { n: 1, label: "Accuracy", value: <CountUp target={finalAccuracy} suffix="%" />, accent: "#60a5fa" },
                    { n: 2, label: "Best Combo", value: <CountUp target={stats.maxCombo} suffix="×" />, accent: "#34d399" },
                    { n: 3, label: "Questions", value: <CountUp target={stats.totalAsked} />, accent: "#a78bfa" },
                    { n: 4, label: "Fastest Answer", value: fastestMs !== null ? `${(fastestMs / 1000).toFixed(1)}s` : "-", accent: "#f97316" },
                    { n: 5, label: "XP Earned", value: <CountUp target={finalXp} />, accent: "#fbbf24", big: true },
                  ].map((row) => (
                    statsStage >= row.n && (
                      <div
                        key={row.label}
                        className={row.big ? "bb-vstat-card bb-vstat-big" : "bb-vstat-card"}
                        style={{ borderLeftColor: row.accent }}
                      >
                        <span className="bb-vstat-label">{row.label}</span>
                        <span className="bb-vstat-value" style={{ color: row.accent }}>
                          {row.value}
                        </span>
                      </div>
                    )
                  ))}

                  {statsStage >= 5 && (
                    <div className="bb-xp-breakdown">
                      Base: 100 + Accuracy: +{xpAccBonus} + Combo: +{xpComboBonus} = Total
                    </div>
                  )}
                </div>
              </div>

              {/* Stars */}
              {statsStage >= 6 && (
                <div className="bb-victory-stars">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={starsRevealed > i ? "bb-vstar bb-vstar-earned" : "bb-vstar"}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}

              {/* Achievement badge row - only renders the badges earned
                  this run, with a "NEW!" pip if it's a first-time unlock. */}
              {statsStage >= 6 && achievementResult && achievementResult.freshlyEarned.length > 0 && (
                <div className="bb-victory-badges">
                  <div className="bb-victory-badges-label">BADGES EARNED</div>
                  <div className="bb-victory-badges-row">
                    {ACHIEVEMENT_DEFS.filter((a) => achievementResult.freshlyEarned.includes(a.id)).map((a, i) => (
                      <div
                        key={a.id}
                        className="bb-badge-chip"
                        style={{
                          animationDelay: `${0.2 + i * 0.18}s`,
                          borderColor: a.accent + "99",
                          boxShadow: `0 0 18px ${a.accent}66, inset 0 0 0 1px ${a.accent}33`,
                        }}
                        title={a.desc}
                      >
                        <span className="bb-badge-icon" style={{ filter: `drop-shadow(0 0 8px ${a.accent})` }}>{a.icon}</span>
                        <div className="bb-badge-text">
                          <span className="bb-badge-label" style={{ color: a.accent }}>{a.label}</span>
                          <span className="bb-badge-desc">{a.desc}</span>
                        </div>
                        <span className="bb-badge-new">NEW!</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              {statsStage >= 7 && (
                <div className="bb-victory-buttons">
                  <button
                    onClick={restart}
                    className="bb-vbtn bb-vbtn-play"
                    type="button"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleContinue}
                    className="bb-vbtn bb-vbtn-continue"
                    type="button"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Level-up celebration - shown between victory screen and onEnd */}
      {pendingLevelUp && (
        <LevelUpCelebration
          oldRank={pendingLevelUp.oldRank}
          newRank={pendingLevelUp.newRank}
          totalXP={pendingLevelUp.totalXP}
          onDismiss={dismissLevelUp}
        />
      )}

      <style>{`
        @keyframes bbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bbComboPop {
          0% { transform: scale(0.6); opacity: 0 }
          60% { transform: scale(1.15); opacity: 1 }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes bbComboVignettePulse {
          0%,100% { opacity: 0.18 }
          50% { opacity: 0.45 }
        }
        @keyframes bbQuestionIn {
          0% { opacity: 0; transform: translateY(14px) scale(0.97) }
          60% { opacity: 1; transform: translateY(-2px) scale(1.01) }
          100% { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes bbPhaseBadgeIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-6px) scale(0.9) }
          60% { opacity: 1; transform: translateX(-50%) translateY(1px) scale(1.04) }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) }
        }
        @keyframes bbQuestionOut {
          0% { opacity: 1; transform: translateY(0) scale(1) }
          100% { opacity: 0; transform: translateY(-12px) scale(0.98) }
        }
        @keyframes bbShieldIdlePulse {
          0%,100% {
            box-shadow: 0 0 14px rgba(125, 240, 255, 0.45), 0 0 30px rgba(125, 240, 255, 0.25);
            transform: translateY(0);
          }
          50% {
            box-shadow: 0 0 22px rgba(125, 240, 255, 0.75), 0 0 48px rgba(125, 240, 255, 0.4);
            transform: translateY(-1px);
          }
        }
        @keyframes bbShieldRingExpand {
          0%   { opacity: 0.85; transform: translate(-50%, -50%) scale(0.4); }
          100% { opacity: 0;    transform: translate(-50%, -50%) scale(2.4); }
        }
        @keyframes bbRageFlash {
          0%   { opacity: 0; }
          15%  { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes bbFinalBlowFreeze {
          0%   { transform: scale(1); filter: brightness(1) saturate(1); }
          40%  { transform: scale(1.06); filter: brightness(1.6) saturate(1.4); }
          100% { transform: scale(1); filter: brightness(1) saturate(1); }
        }
        @keyframes bbEmblemFloat {
          0%   { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.4); }
          18%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.15); }
          30%  { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          75%  { opacity: 1; transform: translateX(-50%) translateY(-6px) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.85); }
        }
        @keyframes bbPulseLow {
          0%,100% { box-shadow: inset 0 1px 3px rgba(0,0,0,0.4) }
          50% { box-shadow: inset 0 1px 3px rgba(0,0,0,0.4), 0 0 14px rgba(239,68,68,0.7) }
        }
        @keyframes bbShakeWrong {
          0%,100% { transform: translateX(0) }
          20% { transform: translateX(-6px) }
          40% { transform: translateX(5px) }
          60% { transform: translateX(-4px) }
          80% { transform: translateX(3px) }
        }
        @keyframes bbCorrectPop {
          0% { transform: scale(1) }
          50% { transform: scale(1.04) }
          100% { transform: scale(1) }
        }
        .bb-hp-bar.bb-hp-low { animation: bbPulseLow 0.9s ease-in-out infinite }
        @media (max-width: 640px) {
          /* Phone: stack the four answers in a single column so each
             answer button is a full-width touch target. */
          .bb-answer-grid { grid-template-columns: 1fr !important; }
          .bb-answer { font-size: 15px; padding: 16px 14px; min-height: 52px; }
          .bb-answer-letter { width: 32px; height: 32px; font-size: 14px; }
        }
        .bb-answer {
          display: flex; align-items: center; gap: 12px;
          background: rgba(15,23,42,0.95);
          color: #e2e8f0;
          border: 2px solid rgba(71,85,105,0.6);
          border-radius: 16px; padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer; text-align: left; line-height: 1.35;
          transition: background .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease;
        }
        .bb-answer:hover:not(:disabled) {
          border-color: #3b82f6;
          box-shadow: 0 0 18px rgba(59,130,246,0.35);
          transform: translateY(-1px);
        }
        .bb-answer:disabled { cursor: default }
        .bb-answer-letter {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(59,130,246,0.18);
          border: 1px solid rgba(96,165,250,0.4);
          color: #60a5fa;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 14px; flex-shrink: 0;
        }
        .bb-answer-text { flex: 1 }
        .bb-answer-correct {
          background: #10b981 !important; color: #fff !important;
          border-color: #34d399 !important;
          box-shadow: 0 0 24px rgba(16,185,129,0.55) !important;
          animation: bbCorrectPop .3s ease-out !important;
        }
        .bb-answer-correct .bb-answer-letter {
          background: rgba(255,255,255,0.25);
          border-color: #fff; color: #fff;
        }
        .bb-answer-wrong {
          background: #ef4444 !important; color: #fff !important;
          border-color: #fca5a5 !important;
          box-shadow: 0 0 24px rgba(239,68,68,0.55) !important;
        }
        .bb-answer-wrong .bb-answer-letter {
          background: rgba(255,255,255,0.25);
          border-color: #fff; color: #fff;
        }
        .bb-answer-shake { animation: bbShakeWrong .4s ease-in-out !important }

        /* - Character selection screen - AAA redesign - */
        @keyframes bbSelMeshBlue {
          0%,100% { transform: translate(-10%, -10%) scale(1) }
          50% { transform: translate(10%, 8%) scale(1.1) }
        }
        @keyframes bbSelMeshPurple {
          0%,100% { transform: translate(10%, 12%) scale(1) }
          50% { transform: translate(-12%, -8%) scale(1.1) }
        }
        @keyframes bbSelFloat {
          0% { transform: translateY(0); opacity: 0 }
          15% { opacity: 0.22 }
          85% { opacity: 0.22 }
          100% { transform: translateY(-105vh); opacity: 0 }
        }
        @keyframes bbSelTitleIn {
          0% { opacity: 0; transform: translateY(-20px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        @keyframes bbSelLeftIn {
          0% { opacity: 0; transform: translateX(-80px) }
          100% { opacity: 1; transform: translateX(0) }
        }
        @keyframes bbSelRightIn {
          0% { opacity: 0; transform: translateX(80px) }
          100% { opacity: 1; transform: translateX(0) }
        }
        @keyframes bbSelOrIn {
          0% { opacity: 0 }
          100% { opacity: 1 }
        }
        @keyframes bbSelShimmer {
          0% { transform: translateX(-120%) }
          50% { transform: translateX(120%) }
          100% { transform: translateX(120%) }
        }
        @keyframes bbSelChosenPulse {
          0%,100% { box-shadow: 0 0 40px var(--c-colour) }
          50% { box-shadow: 0 0 80px var(--c-colour) }
        }

        .bb-sel-screen {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          /* Cinematic radial - same lineage as the FINAL SHOWDOWN
             lock screen. Cosmic-violet warmth bleeding through navy. */
          background: radial-gradient(ellipse at 50% 70%, #2a0d2e 0%, #1a1f4d 35%, #0f1530 70%, #04050d 100%);
          padding: 40px 24px;
          z-index: 5;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        /* Live R3F canvas - sits behind every other decoration so the
           CSS blobs / lightning / particles / Tesla layer over it. */
        .bb-sel-canvas {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .bb-sel-canvas > * {
          width: 100%;
          height: 100%;
        }
        /* Filmic vignette - soft dark halo at the edges that focuses
           attention to the centre. Uses a transparent radial so the
           R3F atmosphere still reads through. */
        .bb-sel-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.55) 100%);
          pointer-events: none;
          z-index: 0;
          /* pulse animation removed - was constant repaint */
        }
        /* Ultra-fine grain - SVG noise as a base64 data URI so we don't
           need to ship an asset. Adds the subtle "filmic" texture top-
           tier games have. Very low opacity so it never reads as noise,
           only as material warmth. */
        .bb-sel-grain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>");
          opacity: 0.06;
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes bbSelVignettePulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1.0; }
        }

        /* Cosmic cloud blobs - top-left violet, top-right pink, bottom
           coral horizon haze. Same blobs as the lock screen. */
        .bb-sel-mesh {
          position: absolute;
          width: 80vmax; height: 80vmax;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(60px);
        }
        .bb-sel-mesh-blue {
          top: -28vmax; left: -22vmax;
          background: radial-gradient(circle, rgba(124,92,255,0.38), transparent 65%);
          animation: bbSelMeshBlue 22s ease-in-out infinite;
        }
        .bb-sel-mesh-purple {
          top: -24vmax; right: -22vmax;
          background: radial-gradient(circle, rgba(255,95,179,0.30), transparent 65%);
          animation: bbSelMeshPurple 26s ease-in-out infinite reverse;
        }
        .bb-sel-haze {
          position: absolute;
          bottom: -10%;
          left: 30%;
          width: 560px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 122, 89, 0.28), transparent 65%);
          filter: blur(70px);
          pointer-events: none;
        }
        /* Lightning streak (warm gold) - used inline in the JSX. */
        .bb-sel-bolt {
          position: absolute;
          top: 0;
          width: 2px;
          background: linear-gradient(180deg, rgba(255, 215, 138, 0.85), transparent);
          filter: drop-shadow(0 0 12px rgba(255, 215, 138, 0.55));
          pointer-events: none;
          animation: bbSelBoltStrike ease-in-out infinite;
        }
        /* Horizontal light beam - kept as a subtle horizon line. */
        .bb-sel-beam {
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 138, 0.18), transparent);
          box-shadow: 0 0 24px rgba(255, 215, 138, 0.12);
          pointer-events: none;
        }
        /* Tesla arc - flickers across the centre OR badge. */
        .bb-sel-tesla {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 360px;
          height: 60px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          overflow: visible;
          z-index: 0;
          animation: bbSelTeslaArc 2.6s ease-in-out infinite;
        }
        .bb-sel-tesla path {
          fill: none;
          stroke-width: 0.8;
          filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 12px currentColor);
        }
        @keyframes bbSelBoltStrike {
          0%, 93%, 100% { opacity: 0; }
          94% { opacity: 0.75; }
          96% { opacity: 0.2; }
          98% { opacity: 0.55; }
        }
        @keyframes bbSelTeslaArc {
          0%, 100% { opacity: 0; }
          8%       { opacity: 1; }
          12%      { opacity: 0; }
          22%      { opacity: 0.9; }
          28%      { opacity: 0; }
          60%      { opacity: 0; }
          64%      { opacity: 1; }
          70%      { opacity: 0; }
        }
        /* Floating particles */
        .bb-sel-particles {
          position: absolute; inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .bb-sel-particle {
          position: absolute;
          bottom: -6px;
          border-radius: 50%;
          filter: blur(0.5px);
          box-shadow: 0 0 6px currentColor;
          animation: bbSelFloat linear infinite;
          opacity: 0;
        }

        /* Title - shimmering cosmic gradient with chromatic glitch jumps,
           same lineage as the FINAL SHOWDOWN lock-screen title. */
        .bb-sel-title {
          position: relative;
          z-index: 1;
          font-family: 'Fredoka', 'Space Grotesk', 'Nunito', system-ui, sans-serif;
          font-size: 56px; font-weight: 900;
          letter-spacing: 0.08em;
          background: linear-gradient(135deg, #ffd158 0%, #ff7a59 35%, #ff5fb3 70%, #7c5cff 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          filter: drop-shadow(0 0 30px rgba(255, 95, 179, 0.35));
          margin: 0 0 8px;
          text-align: center;
          animation:
            bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both,
            bbSelTitleShimmer 6s ease-in-out infinite;
        }
        .bb-sel-subtitle {
          position: relative;
          z-index: 1;
          color: rgba(199, 207, 240, 0.78);
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          text-align: center;
          letter-spacing: 0.03em;
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .bb-sel-subtitle-boss {
          color: #ff7a59;
          font-weight: 800;
          text-shadow: 0 0 12px rgba(255, 95, 179, 0.5);
        }
        .bb-sel-rule {
          position: relative;
          z-index: 1;
          width: 160px; height: 2px;
          margin: 24px auto;
          background: linear-gradient(90deg, transparent, #ff7a59 30%, #ff5fb3 50%, #7c5cff 70%, transparent);
          box-shadow: 0 0 14px rgba(255, 95, 179, 0.45);
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        @keyframes bbSelTitleShimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes bbSelTitleGlitch {
          0%, 88%, 100% { transform: translate(0,0); }
          90% { transform: translate(1px, -1px); filter: drop-shadow(-3px 0 0 #00e5ff) drop-shadow(3px 0 0 #ff5fb3) drop-shadow(0 0 30px rgba(255, 95, 179, 0.45)); }
          92% { transform: translate(-1px, 1px); filter: drop-shadow(4px 0 0 #ffd158) drop-shadow(-4px 0 0 #7c5cff) drop-shadow(0 0 30px rgba(255, 95, 179, 0.45)); }
          94% { transform: translate(0, 0); filter: drop-shadow(-2px 0 0 #00e5ff) drop-shadow(2px 0 0 #ff5fb3) drop-shadow(0 0 30px rgba(255, 95, 179, 0.45)); }
        }

        /* Cards wrapper - card ▸ OR ▸ card, all centred */
        .bb-sel-cards {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: nowrap;
          width: 100%;
        }

        /* Card - premium holographic glass panel. Frosted-glass body,
           edge bevel via layered inset highlights, animated gradient
           top accent in the hero's colour, plus a slow holographic
           scanline that sweeps top-to-bottom. */
        .bb-sel-card {
          position: relative;
          width: 320px;
          flex: 0 0 320px;
          flex-shrink: 0;
          min-height: 480px;
          background:
            radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--c-colour) 14%, transparent) 0%, transparent 55%),
            linear-gradient(180deg, rgba(15, 21, 48, 0.82) 0%, rgba(8, 10, 22, 0.86) 100%);
          border: 1px solid rgba(255, 215, 138, 0.22);
          border-radius: 22px;
          overflow: hidden;
          cursor: pointer;
          color: #e8edff;
          display: flex; flex-direction: column;
          backdrop-filter: blur(8px) saturate(1.1);
          -webkit-backdrop-filter: blur(8px) saturate(1.1);
          /* Layered shadow: outer drop, top-edge highlight, bottom-edge
             shadow, hero-colour ambient, full-frame inner pinstripe. */
          box-shadow:
            0 30px 70px -20px rgba(0, 0, 0, 0.7),
            0 8px 28px -8px color-mix(in oklab, var(--c-colour) 22%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.10),
            inset 0 -1px 0 rgba(0, 0, 0, 0.55),
            inset 0 0 0 1px rgba(255, 255, 255, 0.04),
            0 0 60px rgba(124, 92, 255, 0.16);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease,
                      box-shadow 0.35s ease,
                      opacity 0.4s ease;
        }
        /* Static top accent strip - was animated cycling, now static
           to ease repaint cost. Same hero-colour glow read. */
        .bb-sel-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            color-mix(in oklab, var(--c-colour) 80%, transparent) 50%,
            transparent 100%);
          box-shadow: 0 0 14px color-mix(in oklab, var(--c-colour) 60%, transparent);
          z-index: 3;
          pointer-events: none;
        }
        /* Card scanline removed - was running per-card on infinite
           loop alongside the R3F atmosphere; perceptible jank during
           heavy frames. */
        @keyframes bbSelAccentSlide {
          from { background-position: -100% 50%; }
          to   { background-position: 200% 50%; }
        }
        @keyframes bbSelCardScan {
          0%   { top: -28px; }
          100% { top: 100%; }
        }
        .bb-sel-card-left { animation: bbSelLeftIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both }
        .bb-sel-card-right { animation: bbSelRightIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both }
        .bb-sel-card:hover {
          border-color: color-mix(in oklab, var(--c-colour) 60%, transparent);
          transform: translateY(-14px);
          box-shadow:
            0 36px 80px -20px rgba(0, 0, 0, 0.75),
            0 14px 50px -8px color-mix(in oklab, var(--c-colour) 32%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            inset 0 -1px 0 rgba(0, 0, 0, 0.55),
            inset 0 0 0 1px rgba(255, 255, 255, 0.06),
            0 0 80px color-mix(in oklab, var(--c-colour) 22%, transparent);
        }
        .bb-sel-card:hover .bb-sel-img { transform: scale(1.05) }
        .bb-sel-card:hover .bb-sel-platform {
          opacity: 1;
          box-shadow: 0 0 60px color-mix(in oklab, var(--c-colour) 35%, transparent);
        }
        .bb-sel-card:hover .bb-sel-spot-glow { opacity: 1 }

        .bb-sel-chosen {
          border-color: var(--c-colour) !important;
          transform: scale(1.03);
          animation: bbSelChosenPulse 0.8s ease-in-out infinite;
        }
        .bb-sel-dim { opacity: 0.3; filter: saturate(0.5) }

        /* Spotlight area */
        .bb-sel-spot {
          position: relative;
          flex: 0 0 auto;
          height: 60%;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 0;
          overflow: visible;
        }
        .bb-sel-spot-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--c-colour) 8%, transparent), transparent 65%);
          opacity: 0.75;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .bb-sel-img {
          position: relative;
          width: auto;
          max-width: 100%;
          max-height: 320px;
          height: auto;
          object-fit: contain;
          object-position: center center;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          /* Two stacked shadows: the dark grounding drop + a cyan rim-
             light that lifts the character off the navy backdrop so
             Adam's shield and Layla's dress don't disappear. */
          filter:
            drop-shadow(0 10px 18px rgba(0,0,0,0.55))
            drop-shadow(0 0 14px color-mix(in oklab, var(--c-colour) 50%, transparent));
          pointer-events: none;
          z-index: 1;
        }
        .bb-sel-platform {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 20px;
          border-radius: 50%;
          background: color-mix(in oklab, var(--c-colour) 15%, transparent);
          box-shadow: 0 0 40px color-mix(in oklab, var(--c-colour) 20%, transparent);
          opacity: 0.8;
          transition: opacity 0.35s ease, box-shadow 0.35s ease;
          pointer-events: none;
        }

        /* Info area */
        .bb-sel-info {
          position: relative;
          padding: 16px 22px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .bb-sel-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin: 0;
          text-shadow: 0 0 16px color-mix(in oklab, currentColor 40%, transparent);
        }
        .bb-sel-role {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 2px 0 0;
        }
        .bb-sel-divider {
          width: 60px; height: 1px;
          background: color-mix(in oklab, var(--c-colour) 30%, transparent);
          margin: 12px auto;
        }
        .bb-sel-desc {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
          max-width: 260px;
          margin: 0 0 14px;
        }

        /* Stats - tick-mark style. 10 segments per bar, filled count
           = round(value/10), leading filled tick pulses subtly. Each
           tick reveals with a staggered cascade. */
        .bb-sel-stats {
          width: 100%;
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 16px;
        }
        .bb-sel-stat-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bb-sel-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          min-width: 50px;
          text-align: left;
          font-weight: 700;
        }
        .bb-sel-stat-track {
          flex: 1;
          display: flex;
          gap: 3px;
          height: 8px;
        }
        .bb-sel-tick {
          flex: 1;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          opacity: 0;
          transform: scaleY(0.45);
          animation: bbSelTickReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }
        .bb-sel-tick-on {
          background: var(--c-colour);
          box-shadow:
            0 0 8px color-mix(in oklab, var(--c-colour) 70%, transparent),
            inset 0 0 0 1px color-mix(in oklab, var(--c-colour) 50%, white);
        }
        .bb-sel-tick-lead {
          animation:
            bbSelTickReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both,
            bbSelTickPulse 1.4s ease-in-out infinite 1s;
        }
        @keyframes bbSelTickReveal {
          0%   { opacity: 0; transform: scaleY(0.45); }
          100% { opacity: 1; transform: scaleY(1); }
        }
        @keyframes bbSelTickPulse {
          0%, 100% { box-shadow: 0 0 8px color-mix(in oklab, var(--c-colour) 70%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--c-colour) 50%, white); transform: scaleY(1); }
          50%      { box-shadow: 0 0 14px color-mix(in oklab, var(--c-colour) 95%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--c-colour) 70%, white); transform: scaleY(1.18); }
        }
        .bb-sel-stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.04em;
          min-width: 32px;
          text-align: right;
          text-shadow: 0 0 8px color-mix(in oklab, currentColor 50%, transparent);
        }
        .bb-sel-stat-value-max {
          color: #64748b;
          font-weight: 600;
          margin-left: 1px;
          text-shadow: none;
        }

        /* Select button - premium feel: layered inset highlights for
           a beveled 3D edge, sustained shimmer sweep, hover lift. */
        .bb-sel-btn {
          position: relative;
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 14px;
          color: #fff;
          font-family: 'Fredoka', 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          /* Top-edge highlight + bottom-edge shadow + inner stroke +
             outer drop - gives it a tactile 3D button feel. */
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.28),
            inset 0 -1px 0 rgba(0, 0, 0, 0.45),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08),
            0 6px 18px -4px rgba(0, 0, 0, 0.55),
            0 0 24px color-mix(in oklab, var(--c-colour) 25%, transparent);
          transition:
            transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
            filter 0.2s ease,
            box-shadow 0.25s ease;
        }
        .bb-sel-btn::before {
          /* Subtle top sheen - flat highlight band on the top half so
             it reads as a beveled glass surface. */
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.15), transparent);
          border-radius: 14px 14px 0 0;
          pointer-events: none;
        }
        .bb-sel-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.01);
          filter: brightness(1.12);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.36),
            inset 0 -1px 0 rgba(0, 0, 0, 0.45),
            inset 0 0 0 1px rgba(255, 255, 255, 0.12),
            0 12px 28px -4px rgba(0, 0, 0, 0.65),
            0 0 36px color-mix(in oklab, var(--c-colour) 45%, transparent);
        }
        .bb-sel-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(0.99);
          box-shadow:
            inset 0 2px 6px rgba(0, 0, 0, 0.45),
            inset 0 -1px 0 rgba(255, 255, 255, 0.06),
            0 4px 10px -4px rgba(0, 0, 0, 0.55),
            0 0 24px color-mix(in oklab, var(--c-colour) 35%, transparent);
        }
        .bb-sel-btn:disabled { cursor: default }
        .bb-sel-btn-label {
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
        }
        .bb-sel-btn-shimmer {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
          animation: bbSelShimmer 3.5s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* OR divider - vertical between cards. Cosmic gold→pink chip
           with a soft halo, matching the VS chip on the lock screen. */
        .bb-sel-or {
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          flex-shrink: 0;
          flex-basis: auto;
          align-self: center;
          z-index: 1;
          animation: bbSelOrIn 0.4s ease-out 0.5s both;
        }
        .bb-sel-or-line {
          width: 1px;
          flex: 1;
          max-height: 130px;
          background: linear-gradient(180deg, transparent, rgba(255, 215, 138, 0.35), transparent);
          box-shadow: 0 0 8px rgba(255, 215, 138, 0.4);
        }
        .bb-sel-or-text {
          position: relative;
          font-family: 'Fredoka', 'Space Grotesk', sans-serif;
          font-size: 18px; font-weight: 900;
          letter-spacing: 0.08em;
          color: #1a0612;
          background: linear-gradient(135deg, #ffd158 0%, #ff7a59 50%, #ff5fb3 100%);
          padding: 10px 16px;
          border-radius: 999px;
          border: 2px solid rgba(255, 215, 138, 0.85);
          box-shadow:
            0 8px 20px rgba(255, 95, 179, 0.45),
            inset 0 2px 8px rgba(255, 255, 255, 0.5),
            0 0 28px rgba(255, 95, 179, 0.4);
        }
        .bb-sel-or-text::before {
          content: "";
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 95, 179, 0.5), transparent 70%);
          filter: blur(10px);
          z-index: -1;
        }

        .bb-sel-footer {
          position: relative;
          z-index: 1;
          color: rgba(199, 207, 240, 0.55);
          font-size: 12px;
          margin: 32px 0 0;
          text-align: center;
          letter-spacing: 0.04em;
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        @media (max-width: 740px) {
          .bb-sel-title { font-size: 36px }
          .bb-sel-cards {
            flex-direction: column;
            flex-wrap: wrap;
            gap: 20px;
          }
          .bb-sel-card {
            width: 90%;
            max-width: 340px;
            flex: 0 0 auto;
            min-height: 0;
          }
          .bb-sel-spot { min-height: 260px }
          .bb-sel-img { max-height: 240px !important; height: auto !important; }
          .bb-sel-or {
            flex-direction: row;
            width: 100%;
          }
          .bb-sel-or-line {
            width: auto;
            height: 1px;
            max-height: none;
            flex: 1;
          }
        }

        /* - HP bar juice - */
        .bb-hp-fill { animation: bbStripeMove 0.6s linear infinite }
        @keyframes bbStripeMove { to { background-position: 24px 0, 0 0 } }
        @keyframes bbHpLowHero {
          0%,100% { border-color: rgba(148,163,184,0.25) }
          50% { border-color: #ef4444; box-shadow: inset 0 1px 3px rgba(0,0,0,0.4), 0 0 12px rgba(239,68,68,0.6) }
        }
        .bb-hp-low-hero { animation: bbHpLowHero 0.5s ease-in-out infinite !important }
        @keyframes bbHpShake {
          0%,100% { transform: translateX(0) }
          25% { transform: translateX(-2px) }
          75% { transform: translateX(2px) }
        }
        .bb-hp-shake { animation: bbHpShake 0.28s ease-in-out infinite !important }

        /* - Timer bar - */
        @keyframes bbTimerPulse {
          0%,100% { filter: brightness(1) }
          50% { filter: brightness(1.5) }
        }
        .bb-timer-pulse { animation: bbTimerPulse 0.35s ease-in-out infinite }

        /* - Super attack ready banner - */
        @keyframes bbSuperPulse {
          0%,100% { transform: scale(1) }
          50% { transform: scale(1.08) }
        }
        .bb-super-ready {
          display: inline-block;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #fde047;
          letter-spacing: 0.08em;
          text-shadow: 0 0 10px rgba(250,204,21,0.7), 0 0 18px rgba(250,204,21,0.35);
          padding: 4px 10px;
          margin-bottom: 10px;
          border: 1px solid rgba(250,204,21,0.4);
          border-radius: 6px;
          background: rgba(250,204,21,0.08);
          animation: bbSuperPulse 0.9s ease-in-out infinite;
        }

        /* - Attack announcement strip - */
        @keyframes bbAnnounceSlide {
          0% { opacity: 0; transform: translate(-100px, 0) }
          30% { opacity: 1; transform: translate(0, 0) }
          70% { opacity: 1; transform: translate(0, 0) }
          100% { opacity: 0; transform: translate(100px, 0) }
        }
        .bb-announcement {
          position: absolute;
          top: 12%;
          left: 0; right: 0;
          margin: 0 auto;
          text-align: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #fff;
          pointer-events: none;
          z-index: 6;
          animation: bbAnnounceSlide 1s ease-out forwards;
        }
        .bb-announce-blue { text-shadow: 0 0 16px rgba(59,130,246,0.9), 0 0 32px rgba(59,130,246,0.5), 2px 2px 0 rgba(0,0,0,0.6) }
        .bb-announce-red  { text-shadow: 0 0 16px rgba(239,68,68,0.9), 0 0 32px rgba(147,51,234,0.5), 2px 2px 0 rgba(0,0,0,0.6) }
        .bb-announce-gold { text-shadow: 0 0 18px rgba(250,204,21,0.95), 0 0 36px rgba(249,115,22,0.55), 2px 2px 0 rgba(0,0,0,0.6); color: #fde047 }
        .bb-announce-cyan { text-shadow: 0 0 14px rgba(34,211,238,0.9), 0 0 28px rgba(14,165,233,0.5), 2px 2px 0 rgba(0,0,0,0.6); color: #22d3ee; font-size: 28px }

        /* - Intro banners - */
        @keyframes bbIntroFade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.05) }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95) }
        }
        @keyframes bbIntroVs {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1.15) }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) }
        }
        .bb-intro-banner {
          position: absolute;
          top: 44%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 900;
          letter-spacing: 0.06em;
          pointer-events: none;
          z-index: 5;
          white-space: nowrap;
        }
        .bb-intro-stage1 {
          font-size: 88px;
          color: #fde047;
          text-shadow: 0 0 32px rgba(250,204,21,0.9), 0 0 64px rgba(249,115,22,0.4), 4px 4px 0 rgba(0,0,0,0.7);
          animation: bbIntroFade 1s ease-out forwards;
        }
        .bb-intro-vs {
          font-size: 140px;
          color: #fff;
          text-shadow: 0 0 40px rgba(255,255,255,0.9), 0 0 80px rgba(59,130,246,0.5), 6px 6px 0 rgba(0,0,0,0.7);
          animation: bbIntroVs 0.5s ease-out forwards;
        }
        .bb-intro-bossname {
          font-size: 68px;
          color: #ef4444;
          text-shadow: 0 0 28px rgba(239,68,68,0.9), 0 0 56px rgba(124,58,237,0.5), 4px 4px 0 rgba(0,0,0,0.7);
          animation: bbIntroFade 1.3s ease-out forwards;
        }

        /* - Victory stats - */
        @keyframes bbStatSlideIn {
          0% { opacity: 0; transform: translateY(20px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .bb-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: rgba(15,23,42,0.55);
          border: 1px solid rgba(148,163,184,0.12);
          border-radius: 10px;
          animation: bbStatSlideIn 0.4s ease-out both;
        }
        .bb-stat-label {
          font-family: 'DM Sans', sans-serif;
          color: #94a3b8;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .bb-stat-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        @keyframes bbStarPop {
          0% { opacity: 0; transform: scale(0.3) rotate(-15deg) }
          60% { opacity: 1; transform: scale(1.25) rotate(5deg) }
          100% { opacity: 1; transform: scale(1) rotate(0) }
        }
        .bb-star {
          font-size: 36px;
          color: rgba(148,163,184,0.25);
          transition: color 0.2s ease;
        }
        .bb-star-earned {
          color: #fde047;
          text-shadow: 0 0 16px rgba(250,204,21,0.8), 0 0 32px rgba(249,115,22,0.4);
          animation: bbStarPop 0.4s ease-out both;
        }
        .bb-play-again { animation: bbStatSlideIn 0.5s ease-out both }

        /* - Pre-question countdown - */
        @keyframes bbCountdownIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(1.6) }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) }
        }
        .bb-countdown {
          position: absolute;
          top: 45%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 80px;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(59,130,246,0.4), 6px 6px 0 rgba(0,0,0,0.6);
          letter-spacing: -0.02em;
          pointer-events: none;
          z-index: 6;
          animation: bbCountdownIn 0.7s ease-out forwards;
        }
        .bb-countdown.bb-countdown-go {
          color: #10b981;
          text-shadow: 0 0 40px rgba(16,185,129,0.8), 0 0 80px rgba(16,185,129,0.4), 6px 6px 0 rgba(0,0,0,0.6);
          animation-duration: 0.5s;
        }

        /* - Speech bubbles - */
        @keyframes bbSpeechIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.85) }
          25% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) }
          80% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) }
          100% { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(0.95) }
        }
        .bb-speech {
          position: absolute;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 5;
          animation: bbSpeechIn 1.5s ease-out forwards;
          max-width: 200px;
        }
        .bb-speech-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          padding: 10px 16px;
          border-radius: 12px;
          text-align: center;
          line-height: 1.3;
          box-shadow: 0 6px 18px rgba(0,0,0,0.4);
        }
        .bb-speech-boss .bb-speech-text { background: #2d1b69; border: 1px solid rgba(167,139,250,0.4) }
        .bb-speech-hero .bb-speech-text { background: #1e3a5f; border: 1px solid rgba(96,165,250,0.4) }
        .bb-speech-tail {
          width: 0; height: 0;
          margin: 0 auto;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top-width: 10px;
          border-top-style: solid;
        }
        .bb-speech-tail-boss { border-top-color: #2d1b69 }
        .bb-speech-tail-hero { border-top-color: #1e3a5f }

        /* - Centre correct/wrong flash - */
        @keyframes bbCenterFbIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9) }
        }
        .bb-center-fb {
          position: absolute;
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 0.04em;
          pointer-events: none;
          z-index: 6;
          animation: bbCenterFbIn 0.6s ease-out forwards;
          text-shadow: 0 0 20px currentColor, 2px 2px 0 rgba(0,0,0,0.6);
        }
        .bb-center-fb-correct { color: #10b981 }
        .bb-center-fb-wrong { color: #ef4444 }

        /* - Phase transition banner - */
        @keyframes bbPhaseDarken {
          0% { opacity: 0 }
          15% { opacity: 0.4 }
          85% { opacity: 0.4 }
          100% { opacity: 0 }
        }
        @keyframes bbPhaseBanner {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7) }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.05) }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95) }
        }
        @keyframes bbPhasePulse {
          0%,100% { text-shadow: 0 0 30px rgba(239,68,68,0.8), 4px 4px 0 rgba(0,0,0,0.7) }
          50% { text-shadow: 0 0 50px rgba(239,68,68,1), 0 0 80px rgba(239,68,68,0.6), 4px 4px 0 rgba(0,0,0,0.7) }
        }
        .bb-phase-darken {
          position: absolute; inset: 0;
          background: #000;
          z-index: 5;
          pointer-events: none;
          animation: bbPhaseDarken 1.8s ease-out forwards;
        }
        .bb-phase-banner {
          position: absolute;
          top: 45%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 48px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-align: center;
          white-space: nowrap;
          pointer-events: none;
          z-index: 6;
          animation: bbPhaseBanner 1.8s ease-out forwards;
        }
        .bb-phase-angry { color: #f97316; text-shadow: 0 0 30px rgba(249,115,22,0.8), 4px 4px 0 rgba(0,0,0,0.7) }
        .bb-phase-phase2 { color: #ef4444; text-shadow: 0 0 30px rgba(239,68,68,0.8), 4px 4px 0 rgba(0,0,0,0.7) }
        .bb-phase-final {
          color: #ef4444;
          animation: bbPhaseBanner 1.8s ease-out forwards, bbPhasePulse 0.6s ease-in-out infinite;
        }

        /* - Victory overhaul - */
        @keyframes bbFallConfetti {
          0% { transform: translate3d(0, -30px, 0) rotate(0deg); opacity: 0 }
          10% { opacity: 1 }
          100% { transform: translate3d(-30px, 110vh, 0) rotate(720deg); opacity: 1 }
        }
        @keyframes bbFallGold {
          0% { transform: translateY(-20px); opacity: 0 }
          15% { opacity: 1 }
          100% { transform: translateY(105vh); opacity: 0.9 }
        }
        @keyframes bbTrophyPulse {
          0%,100% { filter: drop-shadow(0 0 12px rgba(250,204,21,0.6)) drop-shadow(0 0 24px rgba(249,115,22,0.4)) }
          50% { filter: drop-shadow(0 0 22px rgba(250,204,21,0.95)) drop-shadow(0 0 44px rgba(249,115,22,0.7)) }
        }
        @keyframes bbVictoryTitlePulse {
          0%,100% { text-shadow: 0 0 20px rgba(250,204,21,0.8), 0 0 40px rgba(249,115,22,0.4) }
          50% { text-shadow: 0 0 40px rgba(250,204,21,1), 0 0 80px rgba(249,115,22,0.7) }
        }
        @keyframes bbVCardSlideIn {
          0% { opacity: 0; transform: translateY(20px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        @keyframes bbVStarPop {
          0% { opacity: 0; transform: scale(0) rotate(-15deg) }
          60% { opacity: 1; transform: scale(1.2) rotate(6deg) }
          100% { opacity: 1; transform: scale(1) rotate(0) }
        }

        .bb-victory {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(ellipse at center, rgba(40,20,10,0.78), rgba(10,10,20,0.95));
          backdrop-filter: blur(6px);
          animation: bbFadeIn 0.6s ease-out;
          padding: 20px;
          z-index: 4;
          overflow: hidden;
        }
        .bb-confetti-bg, .bb-gold-rain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .bb-confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px; height: 14px;
          border-radius: 2px;
          animation: bbFallConfetti linear infinite;
          opacity: 0.85;
        }
        .bb-gold-drop {
          position: absolute;
          top: -16px;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 8px rgba(251,191,36,0.7);
          animation: bbFallGold linear infinite;
        }

        .bb-victory-content {
          position: relative;
          max-width: 880px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 1;
        }
        .bb-trophy {
          animation: bbTrophyPulse 1.8s ease-in-out infinite;
          margin-bottom: 8px;
        }
        .bb-victory-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 56px;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 4px;
          background: linear-gradient(180deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: bbVictoryTitlePulse 2s ease-in-out infinite;
        }
        .bb-victory-subtitle {
          color: #cbd5e1; font-size: 16px;
          margin: 0 0 20px;
          font-family: 'DM Sans', sans-serif;
        }
        .bb-victory-body {
          display: flex;
          gap: 32px;
          align-items: center;
          justify-content: center;
          width: 100%;
          flex-wrap: wrap;
        }
        .bb-victory-hero {
          position: relative;
          width: 260px;
          height: 400px;
          padding-top: 60px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          flex-shrink: 0;
          overflow: visible;
        }
        .bb-victory-hero-glow {
          position: absolute;
          left: 50%;
          bottom: 30px;
          transform: translateX(-50%);
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.15) 45%, transparent 70%);
          animation: bbTrophyPulse 2s ease-in-out infinite;
          filter: none;
          pointer-events: none;
        }
        /* Hand-clipping fix: the celebrate.png art has the raised arm
           reaching very near the top edge of the source. With object-fit:
           contain + height: 100% the image fills the box vertically and
           the fingertips end up flush with the top of the picture frame,
           so any tiny clip in the source asset reads as "missing hands".
           Solution: cap the image height to less than 100% so there's a
           clear gap above the head/hands, and let the padding-top above
           absorb the rest. */
        .bb-victory-hero img {
          position: relative;
          height: calc(100% - 24px);
          max-height: 320px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          object-position: center bottom;
          filter: drop-shadow(0 8px 24px rgba(251,191,36,0.4));
        }
        .bb-victory-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 340px;
          max-width: 480px;
          width: 100%;
        }
        .bb-vstat-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: rgba(15,23,42,0.72);
          border: 1px solid rgba(148,163,184,0.14);
          border-left: 4px solid #60a5fa;
          border-radius: 10px;
          animation: bbVCardSlideIn 0.35s ease-out both;
        }
        .bb-vstat-big {
          padding: 16px 20px;
        }
        .bb-vstat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .bb-vstat-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .bb-vstat-big .bb-vstat-value { font-size: 28px }
        .bb-xp-breakdown {
          margin-top: 4px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #64748b;
          letter-spacing: 0.04em;
          animation: bbVCardSlideIn 0.35s ease-out both;
        }
        .bb-victory-stars {
          display: flex; gap: 16px;
          margin: 18px 0 4px;
          justify-content: center;
        }
        .bb-vstar {
          font-size: 40px;
          color: #374151;
          transition: color 0.2s ease;
        }
        .bb-vstar-earned {
          color: #fbbf24;
          text-shadow: 0 0 18px rgba(251,191,36,0.9), 0 0 36px rgba(249,115,22,0.5);
          animation: bbVStarPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .bb-victory-badges {
          margin-top: 18px;
          width: 100%;
          max-width: 540px;
        }
        .bb-victory-badges-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .bb-victory-badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .bb-badge-chip {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px 8px 10px;
          background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,27,75,0.95));
          border: 1.5px solid;
          border-radius: 12px;
          opacity: 0;
          transform: translateY(8px) scale(0.92);
          animation: bbBadgePop 0.55s cubic-bezier(0.22, 1.4, 0.42, 1) forwards;
          min-width: 0;
        }
        .bb-badge-icon {
          font-size: 22px;
          line-height: 1;
          flex-shrink: 0;
        }
        .bb-badge-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .bb-badge-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .bb-badge-desc {
          font-size: 10px;
          color: rgba(199, 207, 240, 0.65);
          letter-spacing: 0.02em;
        }
        .bb-badge-new {
          position: absolute;
          top: -7px;
          right: -7px;
          padding: 1px 6px;
          background: linear-gradient(135deg, #fbbf24, #ef4444);
          color: #1a0612;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
          border-radius: 999px;
          box-shadow: 0 0 10px rgba(251,191,36,0.7);
          animation: bbBadgeNewBlink 1.1s ease-in-out infinite;
        }
        @keyframes bbBadgePop {
          0%   { opacity: 0; transform: translateY(12px) scale(0.85); }
          70%  { opacity: 1; transform: translateY(-2px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes bbBadgeNewBlink {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 10px rgba(251,191,36,0.7); }
          50%      { transform: scale(1.12); box-shadow: 0 0 16px rgba(251,191,36,0.95); }
        }
        @keyframes bbEdgeGlowPulse {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.18); }
        }
        .bb-edge-glow-on {
          animation: bbEdgeGlowPulse 2.4s ease-in-out infinite;
        }
        .bb-victory-buttons {
          display: flex;
          gap: 14px;
          margin-top: 18px;
          flex-wrap: wrap;
          justify-content: center;
          animation: bbVCardSlideIn 0.5s ease-out both;
        }
        .bb-vbtn {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          border: none;
          cursor: pointer;
          letter-spacing: 0.02em;
          color: #fff;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }
        .bb-vbtn:hover { transform: translateY(-2px) }
        .bb-vbtn-play {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          padding: 12px 28px;
          border-radius: 100px;
          font-size: 14px;
          box-shadow: 0 6px 20px rgba(59,130,246,0.4);
        }
        .bb-vbtn-continue {
          background: linear-gradient(135deg, #f97316, #ea580c);
          padding: 14px 36px;
          border-radius: 100px;
          font-size: 16px;
          box-shadow: 0 6px 22px rgba(249,115,22,0.5);
        }
        @media (max-width: 720px) {
          .bb-victory-hero { width: 220px; height: 340px; padding-top: 50px; overflow: visible }
          .bb-victory-hero img { height: calc(100% - 24px); max-height: 280px; width: auto; max-width: 100%; object-fit: contain; object-position: center bottom }
          .bb-victory-stats { min-width: 280px }
          .bb-victory-title { font-size: 44px }
        }
      `}</style>
    </div>
  );
}
