"use client";

/**
 * BossBattle — raw PixiJS quiz-battle for ages 6-10.
 * Manual Application.init() + canvas append; no framework wrappers.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export interface Question {
  question: string;
  answers: string[];
  correctIndex: number;
  explanation?: string;
}

export interface BossBattleProps {
  questions?: Question[];
  bossName?: string;
  onEnd?: (
    won: boolean,
    stats: { combo: number; accuracy: number; xp: number }
  ) => void;
}

const EASY_QUESTIONS: Question[] = [
  { question: "What makes a strong password?", answers: ["Mix of letters, numbers & symbols", "Your name", "123456", "password"], correctIndex: 0, explanation: "A strong password mixes letters, numbers and symbols — making it super hard to guess!" },
  { question: "Should you share your password?", answers: ["Only with friends", "Write it on paper", "Never share it", "Tell everyone"], correctIndex: 2, explanation: "Your password is YOUR secret — never share it with anyone except your parents!" },
  { question: "A stranger online asks your name. What do you do?", answers: ["Tell them", "Don't tell them", "Ask their name first", "Give a nickname"], correctIndex: 1, explanation: "Never give personal information to strangers online — you don't know who they really are!" },
  { question: "What is a password for?", answers: ["Showing off", "Keeping accounts safe", "Sharing with friends", "Nothing important"], correctIndex: 1, explanation: "Passwords keep your accounts safe from people who shouldn't be in them!" },
  { question: "Who should know your password?", answers: ["Your best friend", "Only you and your parents", "Your teacher", "Everyone"], correctIndex: 1, explanation: "Only you and your parents should know your password — nobody else!" },
  { question: "Someone says they'll give you free V-Bucks. Is this real?", answers: ["Yes click the link", "Maybe", "No it's a scam", "Ask for proof"], correctIndex: 2, explanation: "Free V-Bucks offers are almost always scams trying to steal your account!" },
  { question: "What should your password NOT be?", answers: ["Random letters and numbers", "Your birthday", "Something hard to guess", "A mix of symbols"], correctIndex: 1, explanation: "Birthdays are easy to guess — never use personal dates as passwords!" },
  { question: "Your friend wants to use your tablet. What do you do?", answers: ["Give them your password", "Log out of your accounts first", "Leave everything open", "Say no"], correctIndex: 1, explanation: "Always log out before letting someone else use your device!" },
  { question: "A website asks for your home address. What do you do?", answers: ["Type it in", "Tell a parent before typing anything", "Make one up", "Give your school address"], correctIndex: 1, explanation: "Always check with a parent before entering personal information online!" },
  { question: "Why do we lock devices with a passcode?", answers: ["Because it looks cool", "To stop others getting in", "Because mum said so", "No reason"], correctIndex: 1, explanation: "Passcodes stop other people from accessing your private information!" },
];

const MEDIUM_QUESTIONS: Question[] = [
  { question: "Which password is the strongest?", answers: ["Sunshine2024", "Tr0pic4l$unR1se!", "ilovecats", "MyName123"], correctIndex: 1, explanation: "Tr0pic4l$unR1se! uses uppercase, lowercase, numbers AND symbols — maximum strength!" },
  { question: "An email says 'Your account will be deleted! Click here!' What is this?", answers: ["A real warning", "A phishing scam", "A helpful reminder", "A software update"], correctIndex: 1, explanation: "Urgent scary emails trying to make you click are almost always phishing scams!" },
  { question: "What is two-factor authentication?", answers: ["Having two passwords", "A second check to prove it's you", "Logging in twice", "Using two devices"], correctIndex: 1, explanation: "Two-factor adds a second check — like a code sent to your phone — so even if someone has your password, they can't get in!" },
  { question: "A game asks you to create an account. What email should you use?", answers: ["Use mum's email without asking", "Ask a parent to help set one up", "Make up a fake email", "Use your school email"], correctIndex: 1, explanation: "Always ask a parent to help you set up accounts — they can make sure it's safe!" },
  { question: "Which of these is private information?", answers: ["Your favourite colour", "Your home address", "Your favourite food", "The weather"], correctIndex: 1, explanation: "Your home address is private — never share it with people you don't trust!" },
  { question: "A pop-up says 'Your computer has a virus! Call this number!' What do you do?", answers: ["Call the number", "Close it and tell an adult", "Download their fix", "Turn off the computer forever"], correctIndex: 1, explanation: "Fake virus warnings are scams — close them and tell a trusted adult!" },
  { question: "Why use a DIFFERENT password for each account?", answers: ["It's more fun", "If one is stolen the others stay safe", "Websites make you", "It doesn't matter"], correctIndex: 1, explanation: "If a hacker steals one password, they can't get into your other accounts if they're all different!" },
  { question: "What does a padlock icon in the browser mean?", answers: ["The website is locked", "The connection is encrypted", "You can't visit it", "The website is dangerous"], correctIndex: 1, explanation: "The padlock means your connection to that website is encrypted — your data is protected!" },
  { question: "Someone at school says they know a game cheat and asks for your login. What do you do?", answers: ["Give it to them", "Say no and don't share your login", "Ask a teacher first", "Share it but change password later"], correctIndex: 1, explanation: "Never share your login with anyone — real cheats don't need your password!" },
  { question: "What is the safest way to remember lots of passwords?", answers: ["Write them on a sticky note", "Use a password manager app", "Use the same password everywhere", "Memorise them all"], correctIndex: 1, explanation: "Password managers safely store all your passwords so you only need to remember one master password!" },
];

const HARD_QUESTIONS: Question[] = [
  { question: "You want to check email on a friend's computer. What's safest?", answers: ["Just log in normally", "Use private/incognito window and log out after", "Don't check email at all", "Ask your friend to look away"], correctIndex: 1, explanation: "Incognito mode doesn't save your login — and always log out when you're done on someone else's device!" },
  { question: "A free game download asks you to disable your antivirus first. What should you do?", answers: ["Disable it temporarily", "Don't download it — that's a red flag", "Only if a friend recommended it", "Download to a USB instead"], correctIndex: 1, explanation: "Any download that asks you to turn off protection is almost certainly malware!" },
  { question: "Your account was logged into from a city you've never visited. What's the FIRST thing to do?", answers: ["Ignore it", "Change your password immediately", "Wait and see", "Delete the account"], correctIndex: 1, explanation: "If someone else logged into your account, change your password RIGHT AWAY before they do more damage!" },
  { question: "Which is the BEST security question answer?", answers: ["Your real mother's maiden name", "A made-up answer only you know", "Your pet's real name", "Your birthday"], correctIndex: 1, explanation: "Made-up answers that only you know can't be guessed or found on social media!" },
  { question: "Your friend sends a link that looks like YouTube but the URL says 'y0utube.com'. What is this?", answers: ["YouTube's new address", "A fake website trying to steal your info", "A YouTube for kids", "A YouTube shortcut"], correctIndex: 1, explanation: "Fake URLs that look similar to real ones are used to trick people — always check the spelling!" },
  { question: "You made a strong password. When should you change it?", answers: ["Every single day", "If you think someone might have seen it", "Never — strong passwords last forever", "Only when the website asks"], correctIndex: 1, explanation: "Change your password whenever you suspect someone else might know it!" },
  { question: "A game asks permission for your photos, contacts, and location. What should you do?", answers: ["Allow everything", "Question why a game needs all that access", "Only allow photos", "Ask a friend what they did"], correctIndex: 1, explanation: "A game doesn't need your photos or contacts — be suspicious when apps ask for too many permissions!" },
  { question: "What makes public Wi-Fi (like at a cafe) risky?", answers: ["The Wi-Fi is slower", "Others on the network could see what you're doing", "The cafe might charge you", "Public Wi-Fi has more ads"], correctIndex: 1, explanation: "On public Wi-Fi, hackers can spy on what you're sending — avoid logging into important accounts!" },
  { question: "You get a message from 'your bank' asking to verify your account. You're 10 years old. What's wrong?", answers: ["Banks always send these", "You don't have a bank account so it's a scam", "Click to check just in case", "Forward it to parents to click"], correctIndex: 1, explanation: "If you don't have a bank account, any message from 'your bank' is definitely a scam!" },
  { question: "A site says your password was leaked and offers to check your email. Should you?", answers: ["Enter your email anywhere that checks", "Only use official sites like HaveIBeenPwned", "Never check", "Change your email instead"], correctIndex: 1, explanation: "Only use trusted official sites to check for breaches — random sites might be stealing your email!" },
];

const HP_MAX = 100;
const HERO_HEIGHT = 300;
const BOSS_HEIGHT = 350;

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
  heroAlpha: number;           // hero sprite alpha — for intro fade-in
  bossAlpha: number;           // boss sprite alpha — for intro reveal
  bossYOffset: number;         // vertical offset for intro drop-in
  hitStopUntil: number;        // timestamp (g.time + N) when hit-stop ends
  // 3D-ish stagecraft
  heroShadow: Graphics | null;
  bossShadow: Graphics | null;
  heroReflection: Sprite | null;
  bossReflection: Sprite | null;
  heroGlow: Graphics | null;
  bossGlow: Graphics | null;
  heroShadowAlpha: number;
  bossShadowAlpha: number;
  heroGlowAlpha: number;       // default 0.06, flashes to 0.15 on correct
  bossGlowAlpha: number;       // default 0.07, flashes on wrong
  bossGlowColor: number;       // phase-dependent
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

function spawnParticles(
  g: GameState,
  x: number,
  y: number,
  count: number,
  colors: number[]
) {
  if (!g.stage) return;
  for (let i = 0; i < count; i++) {
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
  // hero-hits-boss — tiered by damage
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
  g.shakeIntensity = Math.max(g.shakeIntensity, intensity);
  g.shakeDuration = Math.max(g.shakeDuration, duration);
  if (intensity >= 6) playSound("screenShake");
}

/** Pause rendering for N ms ("hit-stop" freeze). */
function triggerHitStop(g: GameState, ms: number) {
  if (!g.app) return;
  g.app.ticker.speed = 0;
  window.setTimeout(() => {
    if (g.app) g.app.ticker.speed = 1;
  }, ms);
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
    particles = 12; shake = 3; zoom = 1.00; hitStop = 0;
  } else if (damage <= 20) {
    particles = 20; shake = 6; zoom = 1.06; hitStop = 0;
  } else {
    particles = 30; shake = 8; zoom = 1.10; hitStop = 50;
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
    // Celebrate frames have raised hands — shrink target height + shift anchor
    // down + lift the sprite so the head and hands stay on-screen.
    const celebrating = g.heroAnim === "celebrate";
    g.hero.anchor.set(0.5, celebrating ? 0.65 : 0.5);
    const effectiveHeight = celebrating ? 250 : HERO_HEIGHT;
    const baseScale = effectiveHeight / (g.hero.texture.height || 1);
    const hBreatheX = 1 + Math.sin(g.time / 800) * 0.015;
    const hBreatheY = 1 + Math.sin(g.time / 800) * 0.025;
    g.hero.scale.x = baseScale * g.heroScaleMul * g.heroSquashX * hBreatheX;
    g.hero.scale.y = baseScale * g.heroScaleMul * g.heroSquashY * hBreatheY;
    const heroSwayX = Math.sin(g.time / 2000) * 3;
    const heroBob = Math.sin(g.time / 500) * 4 + Math.sin(g.time / 1200) * 2;
    const celebrateLift = celebrating ? -60 : 0;
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
    // Breathing — slower + deeper; in phase 3, pants faster
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

  // Rim-light glows
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

  // Hero / boss alpha (intro fade-in) — apply directly to sprites
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
    const s = g.cameraScale;
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
  bossName = "HACKER RACCOON",
  onEnd,
}: BossBattleProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);

  // When custom questions are passed in, we use them verbatim and skip the
  // adaptive 3-pool system (backwards-compatible with older callers).
  const customQuestions = useMemo(
    () => (questions && questions.length > 0 ? questions : null),
    [questions]
  );

  // Per-pool advance pointers — "next index to pick".
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
  const [questionIdx, setQuestionIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ index: number; correct: boolean } | null>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<null | "won" | "lost">(null);
  const [stats, setStats] = useState({ totalAsked: 0, correct: 0, maxCombo: 0 });
  const [gameKey, setGameKey] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedHero, setSelectedHero] = useState<HeroId | null>(null);
  const [selecting, setSelecting] = useState<HeroId | null>(null);

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

  // Timer — initial budget follows adaptive difficulty level.
  // 0 = easy (18s), 1 = medium (14s), 2 = hard (11s).
  const difficultyTimerMs = (level: 0 | 1 | 2): number =>
    level === 0 ? 18000 : level === 1 ? 14000 : 11000;
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

  // Pre-question countdown (3, 2, 1, GO!) — null = not active
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
  const [centerFeedback, setCenterFeedback] = useState<"correct" | "wrong" | null>(null);
  const centerFeedbackTimerRef = useRef<number | null>(null);
  const showCenterFeedback = useCallback((kind: "correct" | "wrong") => {
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
    heroShadow: null, bossShadow: null,
    heroReflection: null, bossReflection: null,
    heroGlow: null, bossGlow: null,
    heroShadowAlpha: 0.3, bossShadowAlpha: 0.35,
    heroGlowAlpha: 0.06, bossGlowAlpha: 0.07, bossGlowColor: 0x7c3aed,
    heroSquashX: 1, heroSquashY: 1, bossSquashX: 1, bossSquashY: 1,
    heroTintFlashColor: 0xffffff, heroTintFlashMs: 0,
    bossTintFlashColor: 0xffffff, bossTintFlashMs: 0,
    bossHpPct: 1,
    mouseOffsetX: 0, mouseOffsetY: 0,
    difficultyLevel: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
  });

  const chooseHero = (h: HeroId) => {
    if (selecting || selectedHero) return;
    playSound("select");
    setSelecting(h);
    window.setTimeout(() => setSelectedHero(h), 500);
  };

  // Preload SFX + play intro cue when the selection screen appears
  useEffect(() => {
    SoundManager.getInstance().preloadSFX();
    playSound("lessonStart");
  }, []);

  // Start battle BGM once a hero is locked in — quiet during intro, full at gameplay
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

  // Intro choreography — fires once the Pixi scene reports `ready`
  useEffect(() => {
    if (!ready || !selectedHero) return;
    setIntroStage("dark");
    const timers: number[] = [];
    const g = gameRef.current;

    // 0ms: dark — hero/boss hidden, boss offset -300
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

    // 4100ms: Boss lands — shake + particles + roar
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
      g.baseHeroX = w * 0.22;
      g.baseHeroY = h * 0.55;
      g.baseBossX = w * 0.72;
      g.baseBossY = h * 0.52;
      g.cameraFocusX = w / 2;
      g.cameraFocusY = h / 2;
    };

    (async () => {
      try {
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });
        if (cancelled) {
          app.destroy(true);
          return;
        }

        const canvas = app.canvas;
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.display = "block";
        canvas.style.zIndex = "0";

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

        const bgSprite = new Sprite(textures.bg);
        bgSprite.anchor.set(0, 0);
        bgSprite.x = 0;
        bgSprite.y = 0;
        bgSprite.width = W;
        bgSprite.height = H;
        app.stage.addChild(bgSprite);

        // Reactive background overlay — above bg, below characters
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

        // Reflections — flipped character sprites tinted down
        const heroSet = textures[selectedHero];
        const heroReflection = new Sprite(heroSet.idle);
        heroReflection.anchor.set(0.5, 1);
        heroReflection.alpha = 0.1;
        app.stage.addChild(heroReflection);

        const bossReflection = new Sprite(textures.boss.idle);
        bossReflection.anchor.set(0.5, 1);
        bossReflection.alpha = 0.1;
        app.stage.addChild(bossReflection);

        // Rim-light glows (above reflections, below characters)
        const heroGlow = new Graphics();
        heroGlow.circle(0, 0, 100).fill({ color: 0x3b82f6, alpha: 1 });
        heroGlow.alpha = 0.06;
        app.stage.addChild(heroGlow);

        const bossGlow = new Graphics();
        bossGlow.circle(0, 0, 120).fill({ color: 0x7c3aed, alpha: 1 });
        bossGlow.alpha = 0.07;
        app.stage.addChild(bossGlow);

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
        g.bg = bgSprite;
        g.bgOverlay = bgOverlay;
        g.heroShadow = heroShadow;
        g.bossShadow = bossShadow;
        g.heroReflection = heroReflection;
        g.bossReflection = bossReflection;
        g.heroGlow = heroGlow;
        g.bossGlow = bossGlow;
        g.baseHeroX = W * 0.22;
        g.baseHeroY = H * 0.55;
        g.baseBossX = W * 0.72;
        g.baseBossY = H * 0.52;
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

        // Adaptive difficulty — 3 correct in a row bumps level up (max 2).
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
        } else {
          const cry = HERO_CRIES[Math.floor(Math.random() * HERO_CRIES.length)];
          showAnnouncement(cry, "blue");
          playerAttack(g, damage);
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

        // Phase transition — boss HP crossed 75%, 50%, or 25%
        const prevPct = bossHp / HP_MAX;
        const newPct = newBossHp / HP_MAX;
        const crossed = (t: number) => prevPct > t && newPct <= t;
        if (crossed(0.75)) {
          playSound("phaseChange"); playSound("bossRoar");
          showPhaseAnnouncement("angry");
        } else if (crossed(0.5)) {
          playSound("phaseChange"); playSound("bossRoar");
          showPhaseAnnouncement("phase2");
        } else if (crossed(0.25)) {
          playSound("phaseChange"); playSound("bossRoar");
          showPhaseAnnouncement("final");
        }

        if (newBossHp <= 0) {
          window.setTimeout(() => triggerVictory(g), 300);
          window.setTimeout(() => setResult("won"), 2200);
          return;
        }
      } else {
        const damage = difficultyDamage(g.difficultyLevel);
        const newHeroHp = Math.max(0, heroHp - damage);
        setHeroHp(newHeroHp);
        setCombo(0);
        setSuperReady(false);
        setStats((s) => ({ ...s, totalAsked: s.totalAsked + 1 }));
        playSound("wrong");
        showCenterFeedback("wrong");
        showBossTaunt();

        // Adaptive difficulty — 2 wrong in a row drops level (min 0).
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

        // Post-wrong — reveal correct answer + explanation for ~1.7s before advancing
        setExplanationVisible(true);

        if (newHeroHp <= 0) {
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
        // New question — difficulty may have shifted; rebuild timer budget.
        const nextBudget = difficultyTimerMs(g.difficultyLevel);
        setCurrentQuestionMs(nextBudget);
        questionStartTsRef.current = performance.now();
        setTimerMs(nextBudget);
        lastTickSecondRef.current = Math.ceil(nextBudget / 1000);
        timerRunningRef.current = true;
      }, advanceDelay);
    },
    [
      currentQ, combo, bossHp, heroHp, superReady,
      HERO_CRIES, BOSS_CRIES, HERO_LINES_3, HERO_LINES_5, HERO_LINES_7,
      showAnnouncement, showCenterFeedback, showBossTaunt, showHeroSpeech,
      showPhaseAnnouncement, advanceQuestion,
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

  // Phase-based bg tint — soft red as the boss nears death.
  // Also mirror HP-pct into gameRef so the tick can read it without props.
  useEffect(() => {
    const g = gameRef.current;
    const pct = bossHp / HP_MAX;
    g.bossHpPct = pct;
    if (pct <= 0.25) {
      g.bgOverlayColor = 0xef4444;
      g.bgOverlayPulseAlpha = 0.06;
    } else if (pct <= 0.5) {
      g.bgOverlayColor = 0xef4444;
      g.bgOverlayPulseAlpha = 0.03;
    } else {
      g.bgOverlayPulseAlpha = 0;
    }
  }, [bossHp]);

  // Parallax mouse tracking — disable on narrow screens + touch
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

  // Timer countdown — only during active gameplay (not intro, countdown, or phase transitions)
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
        // Time up — treat as wrong answer, no index
        timerRunningRef.current = false;
        setLocked(true);
        setFeedback({ index: -1, correct: false });
        resolveAnswer(-1, true);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [introStage, result, locked, countdownPhase, phaseAnnouncement, resolveAnswer]);

  // Auto-fire onEnd only on defeat — victory waits for "Continue →" click.
  useEffect(() => {
    if (result !== "lost" || !onEnd) return;
    const accuracy =
      stats.totalAsked > 0 ? Math.round((stats.correct / stats.totalAsked) * 100) : 0;
    const xp = 100 + stats.correct * 15 + stats.maxCombo * 25;
    onEnd(false, { combo: stats.maxCombo, accuracy, xp });
  }, [result, stats, onEnd]);

  // Pending level-up info — shown between "Continue →" click and onEnd.
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
    onEnd(true, { combo: stats.maxCombo, accuracy, xp });
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

  // Victory stats stagger — reveal one stat line every ~0.5s, then stars + button.
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
          {/* Background layers */}
          <div className="bb-sel-mesh bb-sel-mesh-blue" />
          <div className="bb-sel-mesh bb-sel-mesh-purple" />
          <div className="bb-sel-beam" />
          <div className="bb-sel-particles" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="bb-sel-particle"
                style={{
                  left: `${(i * 5.4 + (i % 3) * 3) % 100}%`,
                  width: `${3 + (i % 3)}px`,
                  height: `${3 + (i % 3)}px`,
                  background: ["#60a5fa", "#a78bfa", "#34d399", "#fde047"][i % 4],
                  animationDelay: `${(i * 1.3) % 12}s`,
                  animationDuration: `${14 + (i % 6) * 2.5}s`,
                }}
              />
            ))}
          </div>

          {/* Title block */}
          <h1 className="bb-sel-title">CHOOSE YOUR HERO</h1>
          <p className="bb-sel-subtitle">
            Who will face <span className="bb-sel-subtitle-boss">{bossName}</span>?
          </p>
          <div className="bb-sel-rule" aria-hidden="true" />

          {/* Cards */}
          <div className="bb-sel-cards">
            {(
              [
                {
                  id: "adam" as const,
                  label: "ADAM",
                  title: "The Shield Bearer",
                  image: ASSET_PATHS.adamSelect,
                  colour: "#60a5fa",
                  description:
                    "Brave and strong. Uses his Cyber Shield to block attacks and protect the digital world.",
                  stats: { attack: 80, defence: 100, speed: 60 },
                  btnGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  shimmerDelay: "0s",
                },
                {
                  id: "layla" as const,
                  label: "LAYLA",
                  title: "The Tech Prodigy",
                  image: ASSET_PATHS.laylaSelect,
                  colour: "#34d399",
                  description:
                    "Smart and quick. Uses her Tech Tablet to blast through firewalls and decode secrets.",
                  stats: { attack: 60, defence: 60, speed: 100 },
                  btnGradient: "linear-gradient(135deg, #34d399, #10b981)",
                  shimmerDelay: "1.5s",
                },
              ] as const
            ).map((c, idx) => {
              const chosen = selecting === c.id;
              const faded = selecting !== null && selecting !== c.id;
              return (
                <div
                  key={c.id}
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
                  onMouseEnter={() => { if (!selecting) playSound("hover"); }}
                >
                  <div className="bb-sel-spot">
                    <div className="bb-sel-spot-glow" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.label} className="bb-sel-img" />
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
                      ).map(([label, value], si) => (
                        <div key={label} className="bb-sel-stat-row">
                          <span className="bb-sel-stat-label">{label}</span>
                          <div className="bb-sel-stat-track">
                            <div
                              className="bb-sel-stat-fill"
                              style={{
                                width: `${value}%`,
                                background: c.colour,
                                transitionDelay: `${0.7 + idx * 0.15 + si * 0.12}s`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="bb-sel-btn"
                      onClick={() => chooseHero(c.id)}
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
            })}

            <div className="bb-sel-or" aria-hidden="true">
              <span className="bb-sel-or-line" />
              <span className="bb-sel-or-text">OR</span>
              <span className="bb-sel-or-line" />
            </div>
          </div>

          <p className="bb-sel-footer">
            Both heroes have the same powers — pick your favourite!
          </p>
        </div>
      )}

      {selectedHero && (
        <div
          ref={canvasHostRef}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
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

      {/* Centre correct/wrong flash */}
      {centerFeedback && (
        <div
          key={`cf-${centerFeedback}-${stats.totalAsked}`}
          className={`bb-center-fb bb-center-fb-${centerFeedback}`}
          aria-live="polite"
        >
          {centerFeedback === "correct" ? "✓ CORRECT!" : "✗ WRONG"}
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
                ? "PHASE 2 — DANGER RISING!"
                : "FINAL PHASE — FINISH HIM!"}
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
          top: 14,
          left: 20,
          right: 20,
          display: "flex",
          gap: 24,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #60a5fa",
              boxShadow: "0 0 10px rgba(59,130,246,0.5)",
              flexShrink: 0, fontSize: 14,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700 }}>H</span>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.08em",
                marginBottom: 4,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              <span>{selectedHero === "layla" ? "LAYLA" : "ADAM"}</span>
              <span>{heroHp} / {HP_MAX}</span>
            </div>
            <div
              className={
                "bb-hp-bar" +
                (heroPct < 0.25 ? " bb-hp-low bb-hp-low-hero" : "")
              }
              style={{
                position: "relative",
                height: 20,
                background: "rgba(15,23,42,0.8)",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              {/* Ghost (delayed) fill — drains slowly after a hit */}
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
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px), ${
                    heroPct > 0.3
                      ? "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)"
                      : "linear-gradient(90deg, #f97316 0%, #ef4444 100%)"
                  }`,
                  backgroundSize: "24px 24px, 100% 100%",
                  transition: "width 0.2s ease-out",
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
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.08em",
                marginBottom: 4,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }}
            >
              <span>{bossName}</span>
              <span>{bossHp} / {HP_MAX}</span>
            </div>
            <div
              className={
                "bb-hp-bar" +
                (bossPct < 0.25 ? " bb-hp-low bb-hp-shake" : "")
              }
              style={{
                position: "relative",
                height: 20,
                background: "rgba(15,23,42,0.8)",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
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
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.08) 6px, rgba(255,255,255,0.08) 12px), linear-gradient(90deg, #ef4444 0%, #f97316 100%)",
                  backgroundSize: "24px 24px, 100% 100%",
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
          </div>
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid #a78bfa",
              boxShadow: "0 0 10px rgba(139,92,246,0.5)",
              flexShrink: 0, fontSize: 14,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700 }}>R</span>
          </div>
        </div>
      </div>
      )}

      {/* Combo counter */}
      {selectedHero && combo > 1 && (
        <div
          key={combo}
          style={{
            position: "absolute",
            top: 70,
            right: 20,
            pointerEvents: "none",
            animation: "bbComboPop 0.45s ease-out",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: Math.min(48, 24 + combo * 4),
            fontWeight: 700,
            color: "#fde047",
            textShadow: "0 0 14px rgba(250,204,21,0.7), 2px 2px 0 rgba(0,0,0,0.6)",
            letterSpacing: "-0.02em",
            zIndex: 2,
          }}
        >
          {combo}× COMBO
        </div>
      )}

      {/* Question panel */}
      {selectedHero && !result && q && introStage === "done" && countdownPhase === null && phaseAnnouncement === null && (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,27,75,0.96))",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(99,102,241,0.25)",
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: "0 -10px 40px rgba(59,130,246,0.1)",
            zIndex: 2,
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

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
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
      )}

      {/* End screen — defeat (kept simple, auto-ends to parent) */}
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

      {/* Victory overlay — celebration screen with staggered stats */}
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
                    { n: 4, label: "Fastest Answer", value: fastestMs !== null ? `${(fastestMs / 1000).toFixed(1)}s` : "—", accent: "#f97316" },
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

      {/* Level-up celebration — shown between victory screen and onEnd */}
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

        /* — Character selection screen — AAA redesign — */
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
          background: #0a0e1a;
          padding: 40px 24px;
          z-index: 5;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        /* Animated gradient mesh — two drifting radials */
        .bb-sel-mesh {
          position: absolute;
          width: 80vmax; height: 80vmax;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(20px);
        }
        .bb-sel-mesh-blue {
          top: -20vmax; left: -20vmax;
          background: radial-gradient(circle, rgba(59,130,246,0.08), transparent 65%);
          animation: bbSelMeshBlue 20s ease-in-out infinite;
        }
        .bb-sel-mesh-purple {
          bottom: -20vmax; right: -20vmax;
          background: radial-gradient(circle, rgba(124,58,237,0.06), transparent 65%);
          animation: bbSelMeshPurple 20s ease-in-out infinite;
        }
        /* Horizontal light beam */
        .bb-sel-beam {
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          box-shadow: 0 0 24px rgba(255,255,255,0.04);
          pointer-events: none;
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

        /* Title */
        .bb-sel-title {
          position: relative;
          z-index: 1;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 48px; font-weight: 800;
          letter-spacing: 0.08em;
          color: #fff;
          text-transform: uppercase;
          text-shadow: 0 0 30px rgba(96,165,250,0.3);
          margin: 0 0 8px;
          text-align: center;
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .bb-sel-subtitle {
          position: relative;
          z-index: 1;
          color: #64748b;
          font-size: 16px;
          font-weight: 400;
          margin: 0;
          text-align: center;
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .bb-sel-subtitle-boss {
          color: #a78bfa;
          font-weight: 700;
        }
        .bb-sel-rule {
          position: relative;
          z-index: 1;
          width: 120px; height: 2px;
          margin: 24px auto;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        /* Cards wrapper */
        .bb-sel-cards {
          position: relative;
          z-index: 1;
          display: flex; align-items: stretch; justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        /* Card */
        .bb-sel-card {
          position: relative;
          width: 320px;
          min-height: 480px;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          border: 2px solid transparent;
          border-radius: 24px;
          overflow: hidden;
          cursor: pointer;
          color: #e2e8f0;
          display: flex; flex-direction: column;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.35s ease,
                      box-shadow 0.35s ease,
                      opacity 0.4s ease;
        }
        .bb-sel-card-left { animation: bbSelLeftIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both }
        .bb-sel-card-right { animation: bbSelRightIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both }
        .bb-sel-card:hover {
          border-color: color-mix(in oklab, var(--c-colour) 50%, transparent);
          transform: translateY(-12px);
          box-shadow: 0 20px 60px color-mix(in oklab, var(--c-colour) 15%, transparent);
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
          min-height: 288px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 0;
          overflow: hidden;
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
          height: 320px;
          width: auto;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 10px 18px rgba(0,0,0,0.55));
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

        /* Stat bars */
        .bb-sel-stats {
          width: 100%;
          display: flex; flex-direction: column; gap: 6px;
          margin-bottom: 16px;
        }
        .bb-sel-stat-row { display: flex; align-items: center; gap: 10px }
        .bb-sel-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          min-width: 56px;
          text-align: left;
        }
        .bb-sel-stat-track {
          flex: 1;
          height: 4px;
          background: #1e293b;
          border-radius: 2px;
          overflow: hidden;
        }
        .bb-sel-stat-fill {
          height: 100%;
          width: 0;
          border-radius: 2px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Select button */
        .bb-sel-btn {
          position: relative;
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.25s ease;
        }
        .bb-sel-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .bb-sel-btn:disabled { cursor: default }
        .bb-sel-btn-label { position: relative; z-index: 1 }
        .bb-sel-btn-shimmer {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: bbSelShimmer 3s linear infinite;
          pointer-events: none;
        }

        /* OR divider — vertical between cards */
        .bb-sel-or {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          animation: bbSelOrIn 0.4s ease-out 0.5s both;
        }
        .bb-sel-or-line {
          width: 1px;
          flex: 1;
          max-height: 130px;
          background: rgba(255,255,255,0.06);
        }
        .bb-sel-or-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #475569;
          background: #0a0e1a;
          padding: 8px 12px;
          border-radius: 6px;
        }

        .bb-sel-footer {
          position: relative;
          z-index: 1;
          color: #475569;
          font-size: 12px;
          margin: 32px 0 0;
          text-align: center;
          animation: bbSelTitleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        @media (max-width: 740px) {
          .bb-sel-title { font-size: 36px }
          .bb-sel-cards {
            flex-direction: column;
            gap: 20px;
          }
          .bb-sel-card { width: 90%; max-width: 340px; min-height: 0 }
          .bb-sel-spot { min-height: 248px }
          .bb-sel-img { height: 240px }
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

        /* — HP bar juice — */
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

        /* — Timer bar — */
        @keyframes bbTimerPulse {
          0%,100% { filter: brightness(1) }
          50% { filter: brightness(1.5) }
        }
        .bb-timer-pulse { animation: bbTimerPulse 0.35s ease-in-out infinite }

        /* — Super attack ready banner — */
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

        /* — Attack announcement strip — */
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

        /* — Intro banners — */
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

        /* — Victory stats — */
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

        /* — Pre-question countdown — */
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

        /* — Speech bubbles — */
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

        /* — Centre correct/wrong flash — */
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

        /* — Phase transition banner — */
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

        /* — Victory overhaul — */
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
          width: 200px;
          height: 240px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          flex-shrink: 0;
        }
        .bb-victory-hero-glow {
          position: absolute;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.15) 45%, transparent 70%);
          animation: bbTrophyPulse 2s ease-in-out infinite;
          filter: none;
        }
        .bb-victory-hero img {
          position: relative;
          height: 240px;
          width: auto;
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
          .bb-victory-hero, .bb-victory-hero img { height: 200px; width: auto }
          .bb-victory-hero { width: 180px; height: 200px }
          .bb-victory-stats { min-width: 280px }
          .bb-victory-title { font-size: 44px }
        }
      `}</style>
    </div>
  );
}
