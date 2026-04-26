"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Player } from "@lottiefiles/react-lottie-player";
import { MILESTONES, getCertificateUrl } from "@/app/lib/certificates";
import { playSound as playSFX } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
  bossDefeatedExplosion,
  milestoneFireworks,
} from "@/app/lib/celebrations";
import MuteToggle from "@/app/components/MuteToggle";
import LessonHUD from "@/app/components/LessonHUD";
import XPPopup from "@/app/components/XPPopup";
import LevelUpCelebration from "@/app/components/LevelUpCelebration";
import CharacterGuide from "@/app/components/CharacterGuide";
import { WEEK2_REACTIONS, CORRECT_QUIPS, WRONG_QUIPS, type CharacterLine } from "@/app/lesson/characterReactions";
import StoryCutscene from "@/app/components/StoryCutscene";
import { WEEK2_INTRO } from "@/app/lesson/storyContent";
import ParticleBurst from "@/app/components/ParticleBurst";
import FloatingText from "@/app/components/FloatingText";
import ScreenShake from "@/app/components/ScreenShake";
import ButtonJuice from "@/app/components/ButtonJuice";
// ContentBackdrop replaced by the LessonArena3D Three.js backdrop.
const LessonArena3D = dynamic(
  () => import("@/app/components/game/LessonArena3D"),
  { ssr: false }
);
import ScreenTransition, { type TransitionType } from "@/app/components/ScreenTransition";
import ExerciseErrorBoundary from "@/app/components/ExerciseErrorBoundary";
import { addXP as addXpProgress, type RankInfo } from "@/app/lib/progression";
import LessonAmbience from "@/app/components/LessonAmbience";
import SortingStation from "@/app/components/exercises/SortingStation";
import ChatSimulator from "@/app/components/exercises/ChatSimulator";
import BattleArena from "@/app/components/exercises/BattleArena";
import ProtectTheData from "@/app/components/exercises/ProtectTheData";
import MemoryMatch from "@/app/components/exercises/MemoryMatch";
import ChooseYourPath from "@/app/components/exercises/ChooseYourPath";
import CyberMaze from "@/app/components/exercises/CyberMaze";

const W2_PRIVATE_INFO_PAIRS = [
  { term: "Home Address", match: "Private — never share online", colour: "#ef4444" },
  { term: "Full Name", match: "Private — don't give to strangers", colour: "#f97316" },
  { term: "Password", match: "Only for YOU and parents", colour: "#7c5cff" },
  { term: "Favourite Colour", match: "Safe to share", colour: "#7eff97" },
  { term: "Age Range", match: '"I\'m a kid" is OK', colour: "#7df0ff" },
  { term: "School Name", match: "Private — helps strangers find you", colour: "#ff5fb3" },
];

const W2_PROTECT_ITEMS: { text: string; isPrivate: boolean }[] = [
  { text: "Your full name", isPrivate: true },
  { text: "Your home address", isPrivate: true },
  { text: "Your school name", isPrivate: true },
  { text: "Your phone number", isPrivate: true },
  { text: "Your password", isPrivate: true },
  { text: "Your birthday", isPrivate: true },
  { text: "Favourite colour", isPrivate: false },
  { text: "Favourite game", isPrivate: false },
  { text: "Favourite animal", isPrivate: false },
  { text: '"I\'m a kid"', isPrivate: false },
  { text: "Favourite food", isPrivate: false },
  { text: "Favourite subject", isPrivate: false },
];

const W2_MAZE_QUESTIONS = [
  { question: "Someone asks your full name online. You...", answers: ["Don't share it; tell an adult", "Tell them your full name", "Give a fake name then chat", "Share it if they seem nice"], correctIndex: 0 },
  { question: "Private information includes:", answers: ["Address, phone, school, password", "Favourite colour", "Favourite food", "Your avatar"], correctIndex: 0 },
  { question: "A pop-up asks for your birthday for a 'prize'. You...", answers: ["Close the pop-up and tell a parent", "Enter your real birthday", "Enter a fake birthday and claim it", "Share with a friend"], correctIndex: 0 },
  { question: "The safest way to share your age online is...", answers: ["\"I'm a kid\"", "Your exact birthday", "The year you were born", "Your school grade"], correctIndex: 0 },
  { question: "A stranger wants to video chat. You...", answers: ["Say no and tell an adult", "Say yes for just a minute", "Turn off the camera and talk", "Let them call you"], correctIndex: 0 },
];

const W2_PATH_SCENARIOS = [
  {
    setup: "Someone on a game chat says: \"What school do you go to? I live near there!\"",
    choices: [
      { text: "Tell them the school name", isSafe: false, consequence: "Now the stranger knows where to find you in person. That's unsafe." },
      { text: "Don't share and leave the chat", isSafe: true, consequence: "Smart move! Never share your school with strangers online." },
    ],
  },
  {
    setup: "A form on a game site asks for your full address for a \"free\" gift.",
    choices: [
      { text: "Fill it in to get the gift", isSafe: false, consequence: "The 'gift' was a scam. Now strangers know where you live." },
      { text: "Close the form and tell a parent", isSafe: true, consequence: "Perfect! Real gifts never need your home address from a pop-up." },
    ],
  },
  {
    setup: "A new online friend asks for a photo of you in your school uniform.",
    choices: [
      { text: "Send it — they're friendly", isSafe: false, consequence: "The photo shows your school badge. A stranger could find you now." },
      { text: "Politely say no and tell an adult", isSafe: true, consequence: "Great! Photos can give away way more than you'd expect." },
    ],
  },
  {
    setup: "Someone messages saying: \"I'm from your school, what's your phone number?\"",
    choices: [
      { text: "Share it — they go to your school", isSafe: false, consequence: "They might not really go to your school. Now they can contact you directly." },
      { text: "Ask them in person at school instead", isSafe: true, consequence: "Smart! If they really go to your school, they can ask in person." },
    ],
  },
];

gsap.registerPlugin(SplitText);

const CURRENT_WEEK: number = 2;

/** Pick the ScreenTransition type for a given target step + nav direction. */
function stepTransitionType(step: number, direction: "forward" | "back"): TransitionType {
  if (step === 15) return "wipeDown"; // Boss moment
  const EXERCISE_STEPS = [2, 4, 5, 7, 9, 11, 13];
  if (EXERCISE_STEPS.includes(step)) return "fadeScale";
  return direction === "back" ? "slideLeft" : "slideRight";
}
const IS_MILESTONE_WEEK = MILESTONES.some((m) => m.week === CURRENT_WEEK);

/* ───────────────────────── CONSTANTS ───────────────────────── */
const TOTAL = 17;
const GRAD = "linear-gradient(135deg, #3a7bff, #00e5ff)";

/* ───────────────────────── GSAP HELPERS ────────────────────── */
const celebrateCorrect = (el: HTMLElement) => {
  playSFX("correct");
  void correctAnswerBurst();
  const tl = gsap.timeline();
  tl.to(el, { scale: 1.15, duration: 0.15, ease: "power2.out" })
    .to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" })
    .to(el, { boxShadow: "0 0 40px rgba(16,185,129,0.6), 0 0 80px rgba(16,185,129,0.2)", duration: 0.2 }, 0)
    .to(el, { boxShadow: "0 0 10px rgba(16,185,129,0.2)", duration: 0.6 }, 0.4);
  const rect = el.getBoundingClientRect();
  const colors = ["#7eff97", "#00e5ff", "#3a7bff", "#f59e0b"];
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
      boxShadow: "0 25px 50px rgba(0,0,0,0.3), 0 0 25px rgba(59,130,246,0.3)",
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
// Player is imported for potential Lottie usage
void Player;

/* ───────────────────────── FULL-SCREEN SCENE WRAPPER ───────── */
type SceneTheme = "domino" | "lair" | "factory" | "callscreen" | "forge" | "warroom" | "vault" | "ceremony";
const SCENE_BG: Record<SceneTheme, React.CSSProperties> = {
  domino: {
    background: "radial-gradient(ellipse at center top, rgba(59,130,246,0.12), transparent 60%), linear-gradient(180deg, #080a16 0%, #0f1530 100%)",
  },
  lair: {
    background: "radial-gradient(ellipse at center, rgba(239,68,68,0.08), transparent 65%), linear-gradient(180deg, #0a0612 0%, #0f1530 100%)",
  },
  factory: {
    background: "linear-gradient(180deg, #0d1424 0%, #0f1530 100%), repeating-linear-gradient(90deg, transparent 0 60px, rgba(245,158,11,0.04) 60px 62px)",
  },
  callscreen: {
    background: "radial-gradient(ellipse at center, rgba(34,197,94,0.08), transparent 70%), linear-gradient(180deg, #0a0a14 0%, #0f1530 100%)",
  },
  forge: {
    background: "radial-gradient(ellipse at center, rgba(249,115,22,0.10), transparent 55%), radial-gradient(ellipse at center, rgba(59,130,246,0.10), transparent 70%), linear-gradient(180deg, #0a0612 0%, #0f1530 100%)",
  },
  warroom: {
    background: "radial-gradient(ellipse at center top, rgba(245,158,11,0.10), transparent 50%), linear-gradient(180deg, #0a0612 0%, #14091e 100%)",
  },
  vault: {
    background: "radial-gradient(ellipse at center, rgba(59,130,246,0.15), transparent 60%), linear-gradient(180deg, #0a1024 0%, #0f1530 100%)",
  },
  ceremony: {
    background: "radial-gradient(ellipse at top, rgba(245,158,11,0.18), transparent 55%), linear-gradient(180deg, #0c0820 0%, #0f1530 100%)",
  },
};
const ThemedScene = ({ theme, children }: { theme: SceneTheme; children: React.ReactNode }) => (
  <div style={{
    minHeight: "calc(100vh - 120px)",
    width: "100%",
    position: "relative",
    padding: "24px 16px 80px",
    ...SCENE_BG[theme],
  }}>
    <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
      {children}
    </div>
  </div>
);

const FullScene = ({ children, bg, glow }: { children: React.ReactNode; bg: string; glow?: string }) => (
  <div style={{ minHeight: "calc(100vh - 120px)", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflow: "hidden" }}>
    {glow && <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: glow, filter: "blur(120px)", opacity: 0.3, pointerEvents: "none" }} />}
    <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>{children}</div>
  </div>
);

/* ───────────────────────── DATA ────────────────────────────── */
const TILE_DATA = [
  { label: "Your Full Name", icon: "👤", color: "#22c55e", level: "safe" },
  { label: "Your Home Address", icon: "🏠", color: "#ef4444", level: "private" },
  { label: "Your Phone Number", icon: "📱", color: "#ef4444", level: "private" },
  { label: "Your School Name", icon: "🏫", color: "#ef4444", level: "private" },
  { label: "Your Birthday", icon: "🎂", color: "#f59e0b", level: "careful" },
  { label: "Your Favourite Colour", icon: "🎨", color: "#22c55e", level: "safe" },
  { label: "Your Pet's Name", icon: "🐾", color: "#22c55e", level: "safe" },
  { label: "Your Password", icon: "🔒", color: "#ef4444", level: "private" },
];

const POSTER_ITEMS = [
  { id: "name", text: "Adam Johnson", danger: true, what: "Full name with surname" },
  { id: "age", text: "Age: 8", danger: false, what: "" },
  { id: "school", text: "School: St Mary's Primary, 14 Oak Lane", danger: true, what: "School name and address" },
  { id: "photo", text: "📸 Photo of house with door number visible", danger: true, what: "Photo showing home location" },
  { id: "phone", text: "Phone: 07712 345678", danger: true, what: "Phone number" },
  { id: "hobbies", text: "I love gaming and football!", danger: false, what: "" },
  { id: "pet", text: "My dog is called Buddy", danger: false, what: "" },
  { id: "address", text: "My address: 42 Elm Street, London", danger: true, what: "Home address" },
];
const POSTER_DANGER_COUNT = POSTER_ITEMS.filter((p) => p.danger).length;

const CLASSIFY_QS = [
  { info: "Your favourite colour", answer: "safe" },
  { info: "Your home address", answer: "private" },
  { info: "Your mum's phone number", answer: "private" },
  { info: "What games you like playing", answer: "safe" },
  { info: "Your password for school", answer: "private" },
];

const CHAT_ROUNDS = [
  {
    msg: "Hey! You seem cool! What's your name? 😊",
    opts: [
      { text: "I'm Adam!", danger: 0, reply: "Nice to meet you Adam!" },
      { text: "I'm Adam Johnson from London!", danger: 2, reply: "Oh cool, London! What area?" },
      { text: "I don't share my name with strangers", danger: 0, reply: "Aw come on, don't be like that..." },
    ],
  },
  {
    msg: "What school do you go to? Maybe we go to the same one!",
    opts: [
      { text: "St Mary's Primary on Oak Lane!", danger: 2, reply: "Oh I know that school!" },
      { text: "I'd rather not say", danger: 0, reply: "Fine... 😤" },
      { text: "A school in England", danger: 0, reply: "Haha very helpful... 🙄" },
    ],
  },
  {
    msg: "Want to meet up after school? We could play football! ⚽",
    opts: [
      { text: "Sure! I finish at 3:30!", danger: 2, reply: "Great! See you at the gate!" },
      { text: "I need to ask my parents first", danger: 0, reply: "Oh... your parents don't need to know" },
      { text: "I never meet people from the internet", danger: 0, reply: "You're no fun..." },
    ],
  },
  {
    msg: "Can you send me a photo? I want to see what you look like!",
    opts: [
      { text: "Sure, here's a selfie!", danger: 2, reply: "Thanks! You look cool!" },
      { text: "No, I don't send photos to people online", danger: 0, reply: "Why not? Everyone does it..." },
      { text: "Maybe later", danger: 1, reply: "Promise? 😁" },
    ],
  },
  {
    msg: "What's your address? I'll send you a gaming code! 🎮",
    opts: [
      { text: "42 Elm Street, London", danger: 2, reply: "Perfect! I'll send it right away!" },
      { text: "I can't share that", danger: 0, reply: "Come onnnn..." },
      { text: "I'm going to block you now", danger: 0, reply: "Wait! Don't..." },
    ],
  },
];

const PROFILE_DANGERS = [
  { id: "username", zone: "username", label: "Birth year in username", tip: "Birth year helps strangers guess your passwords!" },
  { id: "fullname", zone: "bio", label: "Full name in bio", tip: "Your surname should stay private online!" },
  { id: "school", zone: "bio", label: "School name in bio", tip: "Strangers could find you at school!" },
  { id: "address", zone: "bio", label: "Home address in bio", tip: "NEVER share your home address publicly!" },
  { id: "uniform", zone: "photo1", label: "School uniform visible", tip: "School logos on uniforms reveal where you go!" },
  { id: "house", zone: "photo3", label: "House number visible", tip: "Door numbers help people find your home!" },
  { id: "public", zone: "privacy", label: "Account is PUBLIC", tip: "Private accounts mean only approved people can see your posts!" },
];

const CONTEXT_ROUNDS = [
  { info: "Your Full Name", a: { text: "Your teacher asks on the first day of school", ok: true }, b: { text: "A stranger in an online game asks", ok: false }, why: "Teachers need your name, strangers don't!" },
  { info: "Your Home Address", a: { text: "A delivery person asks while your parent is there", ok: true }, b: { text: "Someone in a chatroom asks", ok: false }, why: "Only share addresses with trusted adults present!" },
  { info: "Your Birthday", a: { text: "Your friend asks to invite you to a party", ok: true }, b: { text: "A website popup asks to 'verify your age'", ok: false }, why: "Friends are fine, random websites are not!" },
  { info: "A Photo of You", a: { text: "Your parent takes a family photo", ok: true }, b: { text: "An online friend you've never met asks for one", ok: false }, why: "Photos should only go to people you actually know in real life!" },
  { info: "Your Password", a: { text: "Your parent asks", ok: true }, b: { text: "Your best friend asks", ok: false }, why: "Only parents should know your password, even best friends shouldn't!" },
];

const DOMINO_CHAIN_1 = [
  "You told someone your SCHOOL NAME online",
  "Now a stranger knows WHERE you go every day",
  "They can FIND your school on a map",
  "They know WHEN you arrive and leave",
  "A stranger could FIND YOU in real life!",
];
const DOMINO_CHAIN_2 = [
  "You told someone WHERE YOU LIVE",
  "Now a stranger knows YOUR ADDRESS",
  "They could come to YOUR FRONT DOOR!",
];

const RACCOON_BOARD = [
  { label: "Home Address", msg: "You never shared it!" },
  { label: "School Name", msg: "You kept it secret!" },
  { label: "Phone Number", msg: "The Raccoon has no idea!" },
  { label: "Password", msg: "Not a chance!" },
  { label: "Photo", msg: "Nothing to see here!" },
];

const SPEED_SORT_ITEMS = [
  { info: "Your favourite food", answer: "safe" },
  { info: "Your home address", answer: "private" },
  { info: "Your favourite game", answer: "safe" },
  { info: "Your mum's phone number", answer: "private" },
  { info: "Your pet's name", answer: "safe" },
  { info: "Your password", answer: "private" },
  { info: "Your favourite colour", answer: "safe" },
  { info: "Your school name", answer: "private" },
  { info: "What music you like", answer: "safe" },
  { info: "Your dad's email address", answer: "private" },
  { info: "Your favourite YouTuber", answer: "safe" },
  { info: "Your house door number", answer: "private" },
  { info: "Your favourite sport", answer: "safe" },
  { info: "Your birthday and year", answer: "private" },
  { info: "What you had for lunch", answer: "safe" },
];

const PHONE_ROUNDS = [
  { caller: "Unknown Number", says: "Hi! I'm from your internet company. Can you tell me your mum's full name and home address so I can fix a problem with your WiFi?",
    opts: [
      { text: "Sure! Her name is...", danger: true, fb: "Never give info to unknown callers!" },
      { text: "I need to check with my parent first", danger: false, fb: "Great thinking! Always check with a grown-up" },
      { text: "No. I'm hanging up now.", danger: false, fb: "Perfect! You don't owe strangers any information" },
    ] },
  { caller: "Competition Hotline", says: "Congratulations! You've won a FREE PlayStation! We just need your full name, age, and address to send it to you!",
    opts: [
      { text: "Wow! My name is Adam and I live at...", danger: true, fb: "Real prizes don't ask for personal info!" },
      { text: "This sounds like a scam", danger: false, fb: "Exactly! Real prizes don't call asking for info" },
      { text: "Can you call my parent instead?", danger: false, fb: "Good, let an adult handle it" },
    ] },
  { caller: "School Office", says: "Hello, this is the school office. We need to update your emergency contact details. Can you give us your parent's phone number?",
    opts: [
      { text: "It's 07712...", danger: true, fb: "Even real-sounding callers could be fake!" },
      { text: "I'll ask my parent to call you back", danger: false, fb: "Smart! Always verify through parents" },
      { text: "Which school?", danger: false, fb: "Testing if they're real, clever!" },
    ] },
  { caller: "Your Friend Jake", says: "Hey it's Jake! I got a new phone. What's your address? I want to come round to play!",
    opts: [
      { text: "Sure it's 42 Elm Street!", danger: true, fb: "How do you know it's really Jake?" },
      { text: "I'll ask my mum to call your mum", danger: false, fb: "Perfect! Verify through parents" },
      { text: "What's our secret password?", danger: false, fb: "Verifying identity, great thinking!" },
    ] },
];

const SHIELD_QS = [
  { q: "A stranger online asks where you live. You should...", opts: ["Tell them your city only", "Ignore or block them", "Give them your address"], correct: 1 },
  { q: "Your friend wants to post a photo of you online. You should...", opts: ["Let them post anything", "Ask them not to", "Make sure you're both happy with it first"], correct: 2 },
  { q: "A website asks for your real name to play a free game. You should...", opts: ["Use a nickname instead", "Type your full real name", "Use your parent's name"], correct: 0 },
  { q: "You get an email saying you won a prize. You should...", opts: ["Click the link to claim it", "Tell a parent and don't click", "Forward it to friends"], correct: 1 },
  { q: "Someone at school asks for your password to help you. You should...", opts: ["Share it, they're being nice", "Only share if they're your best friend", "Never share except with parents"], correct: 2 },
  { q: "You want to sign up for a new app. You should...", opts: ["Use a fake birthday and no real info", "Ask a parent to help you sign up safely", "Fill in everything quickly"], correct: 1 },
  { q: "The Raccoon disguised as a kid asks for your school name. You should...", opts: ["Tell them, it's just a school name", "Say nothing and report them", "Give a fake school name"], correct: 1 },
];

const MASTERPLAN_CARDS = [
  { label: "Full Name", result: "They only shared first names!" },
  { label: "Home Address", result: "They never told anyone!" },
  { label: "School", result: "They kept it secret!" },
  { label: "Phone Number", result: "Not a single digit!" },
  { label: "Password", result: "Triple locked!" },
  { label: "Photos", result: "Nothing useful shared!" },
];

const VAULT_ATTACKS = [
  { data: "Your Password", block: true },
  { data: "Your Favourite Food", block: false },
  { data: "Your Home Address", block: true },
  { data: "Your Favourite Colour", block: false },
  { data: "Your School Name", block: true },
  { data: "Your Phone Number", block: true },
  { data: "Your Pet's Name", block: false },
  { data: "Your Parent's Email", block: true },
  { data: "What Games You Play", block: false },
  { data: "Your Birthday & Year", block: true },
];

/* ───────────────────────── STYLE ─────────────────────────── */
const CSS = `
@media print {
  body { background: white !important; }
  header, .progress-wrap, .step-dots-wrap, .floating-bg { display: none !important; }
}
`;

/* ───────────────────────── SUB-COMPONENTS ──────────────────── */
function FloatingBg() {
  const stamps = [
    { text: "TOP SECRET", left: "8%", top: "12%", rotate: -12, dur: 44, size: 22 },
    { text: "CLASSIFIED", left: "78%", top: "18%", rotate: 8, dur: 52, size: 24 },
    { text: "PRIVATE", left: "15%", top: "65%", rotate: -6, dur: 40, size: 20 },
    { text: "CONFIDENTIAL", left: "70%", top: "72%", rotate: 10, dur: 56, size: 22 },
    { text: "EYES ONLY", left: "45%", top: "88%", rotate: -15, dur: 48, size: 20 },
    { text: "RESTRICTED", left: "55%", top: "35%", rotate: 5, dur: 60, size: 22 },
    { text: "INTEL", left: "5%", top: "40%", rotate: -8, dur: 46, size: 24 },
    { text: "DECODED", left: "85%", top: "50%", rotate: 12, dur: 54, size: 20 },
    { text: "ENCRYPTED", left: "30%", top: "25%", rotate: -10, dur: 50, size: 22 },
    { text: "AGENT ONLY", left: "60%", top: "10%", rotate: 6, dur: 58, size: 18 },
    { text: "TOP SECRET", left: "25%", top: "78%", rotate: 14, dur: 42, size: 20 },
    { text: "CLASSIFIED", left: "82%", top: "85%", rotate: -9, dur: 52, size: 22 },
  ];
  const binaryCols = [8, 25, 42, 58, 75, 92];
  const beams = [
    { top: "15%", width: 200, dur: 6, delay: 0 },
    { top: "40%", width: 180, dur: 7, delay: 4 },
    { top: "65%", width: 250, dur: 8, delay: 10 },
    { top: "85%", width: 150, dur: 6, delay: 16 },
  ];
  const morse = "· · — · — — · · · — — — ".repeat(40);
  return (
    <div className="floating-bg" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <style>{`
        @keyframes radarSweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes stampFloat { 0%,100% { transform: translateY(-25px) rotate(var(--rot)); } 50% { transform: translateY(25px) rotate(var(--rot)); } }
        @keyframes fpSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scanDown { 0% { top: -2px; } 100% { top: 100%; } }
        @keyframes scanUp { 0% { top: 100%; } 100% { top: -2px; } }
        @keyframes scanRight { 0% { left: -2px; } 100% { left: 100%; } }
        @keyframes binRain { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes beamShoot { 0% { left: -300px; } 30%,100% { left: 110vw; } }
        @keyframes crossSpin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes crossPulse { 0%,100% { opacity: 0.04; } 50% { opacity: 0.1; } }
        @keyframes morseScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>

      {/* Layer 4: Crosshair dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(59,130,246,0.08) 2px, transparent 2px)",
        backgroundSize: "100px 100px",
      }} />

      {/* Layer 1a: Main radar sweep */}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div style={{ position: "absolute", inset: "33%", borderRadius: "50%", border: "1px solid rgba(59,130,246,0.1)" }} />
        <div style={{ position: "absolute", inset: "16%", borderRadius: "50%", border: "1px solid rgba(59,130,246,0.08)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 2, transformOrigin: "left center", background: "linear-gradient(to right, transparent, rgba(59,130,246,0.25))", boxShadow: "0 0 12px rgba(59,130,246,0.4)", animation: "radarSweep 12s linear infinite" }} />
      </div>
      {/* Layer 1b: Secondary radar */}
      <div style={{ position: "absolute", right: 40, top: 40, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.15)" }}>
        <div style={{ position: "absolute", inset: "33%", borderRadius: "50%", border: "1px solid rgba(59,130,246,0.1)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 2, transformOrigin: "left center", background: "linear-gradient(to right, transparent, rgba(59,130,246,0.25))", boxShadow: "0 0 8px rgba(59,130,246,0.4)", animation: "radarSweep 10s linear infinite" }} />
      </div>

      {/* Layer 2: Floating classified stamps */}
      {stamps.map((s, i) => (
        <div key={`stamp-${i}`} style={{
          position: "absolute", left: s.left, top: s.top,
          ["--rot" as string]: `${s.rotate}deg`,
          fontWeight: 900, fontSize: s.size, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "rgba(59,130,246,0.12)", animation: `stampFloat ${s.dur}s ease-in-out infinite`,
          animationDelay: `${i * -3}s`,
        } as React.CSSProperties}>{s.text}</div>
      ))}

      {/* Layer 3a: Fingerprint (bottom-right) */}
      <div style={{ position: "absolute", right: -120, bottom: -120, transform: "scale(1.5)", transformOrigin: "bottom right", animation: "fpSpin 60s linear infinite" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`fp-${i}`} style={{
            position: "absolute", right: 0, bottom: 0,
            width: 120 + i * 30, height: 160 + i * 40,
            borderRadius: "50%", border: "1px solid rgba(59,130,246,0.12)",
            transform: `translate(${i * 2}px, ${i * 3}px)`,
          }} />
        ))}
      </div>
      {/* Layer 3b: Fingerprint (top-left) */}
      <div style={{ position: "absolute", left: -120, top: -120, transform: "scale(1.5)", transformOrigin: "top left", animation: "fpSpin 60s linear infinite reverse" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`fp2-${i}`} style={{
            position: "absolute", left: 0, top: 0,
            width: 120 + i * 30, height: 160 + i * 40,
            borderRadius: "50%", border: "1px solid rgba(59,130,246,0.12)",
            transform: `translate(${-i * 2}px, ${-i * 3}px)`,
          }} />
        ))}
      </div>

      {/* Layer 5: Drifting particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div key={`spy-p-${i}`}
          animate={{ x: [-25, 25, -25], y: [-20, 20, -20], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 28 + i * 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          style={{ position: "absolute", left: `${5 + i * 6.3}%`, top: `${10 + (i * 7) % 80}%`, width: 3 + (i % 4), height: 3 + (i % 4), borderRadius: "50%", background: "rgba(59,130,246,0.35)", filter: "blur(1.5px)" }}
        />
      ))}

      {/* Layer 6: Scanning lines */}
      <div style={{ position: "absolute", left: 0, width: "100%", height: 2, background: "linear-gradient(to right, transparent, rgba(59,130,246,0.3), transparent)", boxShadow: "0 0 8px rgba(59,130,246,0.3)", animation: "scanDown 16s linear infinite" }} />
      <div style={{ position: "absolute", left: 0, width: "100%", height: 2, background: "linear-gradient(to right, transparent, rgba(59,130,246,0.3), transparent)", boxShadow: "0 0 8px rgba(59,130,246,0.3)", animation: "scanUp 24s linear infinite" }} />
      <div style={{ position: "absolute", top: 0, width: 2, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(59,130,246,0.3), transparent)", boxShadow: "0 0 8px rgba(59,130,246,0.3)", animation: "scanRight 20s linear infinite" }} />

      {/* Layer 7: Binary code rain */}
      {binaryCols.map((xPct, i) => (
        <div key={`bin-${i}`} style={{
          position: "absolute", left: `${xPct}%`, top: 0, height: "100%",
          fontFamily: "monospace", fontSize: 16, fontWeight: "bold",
          color: "rgba(59,130,246,0.1)", lineHeight: 1.3,
          animation: `binRain ${25 + i * 2.5}s linear infinite`,
          animationDelay: `${-i * 2.3}s`,
          whiteSpace: "pre",
        }}>
          {Array.from({ length: 40 }, (_, j) => ((i + j) % 2 === 0 ? "0" : "1")).join("\n")}
        </div>
      ))}

      {/* Layer 8: Data stream beams */}
      {beams.map((b, i) => (
        <div key={`beam-${i}`} style={{
          position: "absolute", top: b.top, left: -300, width: b.width, height: 2,
          background: "linear-gradient(to right, transparent, rgba(59,130,246,0.4), rgba(59,130,246,0.4), transparent)",
          animation: `beamShoot ${20 + b.dur}s linear infinite`,
          animationDelay: `${b.delay}s`,
        }} />
      ))}

      {/* Layer 9: Spy crosshair (center) */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 200, height: 200, animation: "crossSpin 60s linear infinite, crossPulse 12s ease-in-out infinite" }}>
        <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: 1, background: "rgba(59,130,246,0.06)" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", width: 1, height: "100%", background: "rgba(59,130,246,0.06)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(59,130,246,0.06)" }} />
      </div>

      {/* Layer 10: Morse code ticker */}
      <div style={{ position: "absolute", bottom: "5%", left: 0, width: "200%", fontFamily: "monospace", fontSize: 20, letterSpacing: "8px", color: "rgba(59,130,246,0.08)", whiteSpace: "nowrap", animation: "morseScroll 60s linear infinite" }}>
        {morse}{morse}
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const pct = ((step + 1) / TOTAL) * 100;
  return (
    <div className="progress-wrap" style={{ width: "100%", maxWidth: 600, margin: "0 auto 8px", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
        <span>Step {step + 1} of {TOTAL}</span><span>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          style={{ height: "100%", borderRadius: 999, background: GRAD, boxShadow: "0 0 10px rgba(59,130,246,0.4)" }} />
      </div>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="step-dots-wrap" style={{ display: "flex", justifyContent: "center", gap: 6, margin: "8px 0 16px", flexWrap: "wrap" }}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <motion.div key={i} animate={{ scale: i === step ? [1, 1.4, 1] : 1 }}
          transition={i === step ? { duration: 1.5, repeat: Infinity } : {}}
          style={{
            width: i === step ? 12 : 8, height: i === step ? 12 : 8, borderRadius: "50%",
            background: i < step ? "#3a7bff" : i === step ? "#f59e0b" : "rgba(255,255,255,0.15)",
            boxShadow: i === step ? "0 0 12px rgba(245,158,11,0.5)" : i < step ? "0 0 8px rgba(59,130,246,0.4)" : "none",
            transition: "all 0.3s ease",
          }} />
      ))}
    </div>
  );
}

function CoinCounter({ coins }: { coins: number }) {
  return (
    <motion.div key={coins}
      data-coin-counter
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 12, padding: "4px 12px",
        boxShadow: "0 0 10px rgba(245,158,11,0.3)",
      }}>
      <span style={{ fontSize: 18 }}>🪙</span>
      <span style={{ color: "#f59e0b", fontWeight: 900, fontSize: 16 }}>{coins}</span>
    </motion.div>
  );
}

/* ───────────────────────── HELPERS ─────────────────────────── */
function btn(label: string, onClick: () => void, extra?: React.CSSProperties) {
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

function card(children: React.ReactNode, extra?: React.CSSProperties) {
  return (
    <div data-animate style={{
      position: "relative",
      overflow: "hidden",
      background: "rgba(17,24,39,0.72)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, ...extra,
    }}>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function playSound(src: string) {
  try { const a = new Audio(src); a.volume = 0.5; a.play().catch(() => {}); } catch {}
}

function InstructionOverlay({ icon, story, instructions, onReady }: { icon: string; story: string; instructions: string; onReady: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
      <div data-animate style={{ background: "rgba(15,10,40,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 20px rgba(59,130,246,0.2)", borderRadius: 24, padding: 32, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: "rgba(59,130,246,0.15)", borderRadius: 20 }}>{icon}</div>
        <p style={{ color: "#7df0ff", fontSize: 14, fontStyle: "italic", marginBottom: 8 }}>{story}</p>
        <h2 data-split style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Here&apos;s what to do!</h2>
        <p style={{ color: "#d1d5db", fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>{instructions}</p>
        <motion.button onClick={onReady} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut} whileTap={{ scale: 0.95 }}
          style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "#fff", fontWeight: 700, borderRadius: 14, padding: "13px 34px", border: "none", cursor: "pointer", fontSize: 16, boxShadow: "0 0 15px rgba(249,115,22,0.4)" }}>
          I&apos;m Ready! →
        </motion.button>
      </div>
    </motion.div>
  );
}

function LearnSummary({ message, starCount, onNext }: { message: string; starCount: number; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center" }}>
      <div data-animate style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 0 15px rgba(16,185,129,0.2)", borderRadius: 20, padding: 28, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: "rgba(16,185,129,0.1)", borderRadius: 20, boxShadow: "0 0 15px rgba(16,185,129,0.4)" }}>✅</div>
        <h2 data-split style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>Great job!</h2>
        <div style={{ marginBottom: 8 }}><span style={{ fontSize: 28, letterSpacing: 4 }}>{"⭐".repeat(starCount)}{"☆".repeat(3 - starCount)}</span></div>
        <p style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <motion.button onClick={onNext} onMouseEnter={btnHoverIn} onMouseLeave={btnHoverOut} whileTap={{ scale: 0.95 }}
          style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "#fff", fontWeight: 700, borderRadius: 14, padding: "13px 34px", border: "none", cursor: "pointer", fontSize: 16, boxShadow: "0 0 15px rgba(249,115,22,0.4)" }}>
          Next →
        </motion.button>
      </div>
    </motion.div>
  );
}

// Dialogue has moved to the CharacterGuide side panels. This inline bubble is
// now a no-op so existing call sites stay compiling while they get migrated.
const SpeechBubble = (_props: { character: "adam" | "layla" | "raccoon"; message: string; side?: "left" | "right" }) => {
  void _props;
  return null;
};
const _SpeechBubbleLegacy = ({ character, message, side = "left" }: { character: "adam" | "layla" | "raccoon"; message: string; side?: "left" | "right" }) => {
  const img = character === "adam" ? "/characters/adam-layla-happy.png" : character === "layla" ? "/characters/adam-layla-happy.png" : "/characters/raccoon.png";
  const name = character === "adam" ? "Adam" : character === "layla" ? "Layla" : "Raccoon";
  const bubbleColor = character === "raccoon" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)";
  const borderColor = character === "raccoon" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)";
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
        <span style={{ fontWeight: 700, fontSize: 12, color: character === "raccoon" ? "#ef4444" : "#3a7bff", display: "block", marginBottom: 4 }}>{name}</span>
        {message}
      </div>
    </motion.div>
  );
};

/* ───────────────────────── MAIN COMPONENT ─────────────────── */
export default function Week2Player({ userName, moduleId, childName }: { userName: string; moduleId: string; childName: string }) {
  const [step, setStep] = useState(0);

  // Intro cutscene disabled — lesson lands directly on screen 0. State + render path kept in case we re-enable.
  const [cutscene, setCutscene] = useState<"intro" | null>(null);
  const cutsceneSlides = cutscene === "intro" ? WEEK2_INTRO : null;
  const cutsceneTitle: string | undefined = cutscene === "intro"
    ? "WEEK 2: PRIVATE INFORMATION"
    : undefined;
  const [coins, setCoins] = useState(0);

  // Character guide reaction
  const IDLE_LINE: CharacterLine = { mood: "idle", message: "" };
  const initialReactionW2 = WEEK2_REACTIONS[0];
  const [adamReaction, setAdamReaction] = useState<CharacterLine>(
    initialReactionW2?.adam ?? IDLE_LINE
  );
  const [laylaReaction, setLaylaReaction] = useState<CharacterLine>(
    initialReactionW2?.layla ?? IDLE_LINE
  );
  const reactionRestoreRef = useRef<number | null>(null);
  const pickQuip = (list: readonly string[]): string =>
    list[Math.floor(Math.random() * list.length)];
  const flashReaction = useCallback(
    (kind: "correct" | "wrong") => {
      if (kind === "correct") {
        const quip = pickQuip(CORRECT_QUIPS);
        if (Math.random() < 0.5) {
          setAdamReaction({ mood: "thumbsup", message: quip });
          setLaylaReaction({ mood: "thumbsup", message: "" });
        } else {
          setAdamReaction({ mood: "thumbsup", message: "" });
          setLaylaReaction({ mood: "thumbsup", message: quip });
        }
      } else {
        setAdamReaction({ mood: "thinking", message: "" });
        setLaylaReaction({ mood: "thinking", message: pickQuip(WRONG_QUIPS) });
      }
      if (reactionRestoreRef.current) window.clearTimeout(reactionRestoreRef.current);
      reactionRestoreRef.current = window.setTimeout(() => {
        const fallback = WEEK2_REACTIONS[step];
        setAdamReaction(fallback?.adam ?? IDLE_LINE);
        window.setTimeout(
          () => setLaylaReaction(fallback?.layla ?? IDLE_LINE),
          100
        );
      }, 2000);
    },
    [step]
  );
  useEffect(() => {
    if (reactionRestoreRef.current) {
      window.clearTimeout(reactionRestoreRef.current);
      reactionRestoreRef.current = null;
    }
    const next = WEEK2_REACTIONS[step];
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
  }, [step]);

  // XP / progression
  const [lessonXp, setLessonXp] = useState(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);
  const xpPopupIdRef = useRef(0);
  const [pendingLevelUp, setPendingLevelUp] = useState<
    { oldRank: RankInfo; newRank: RankInfo; totalXP: number } | null
  >(null);
  // Micro-feedback state
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
    (x: number, y: number, colour = "#7eff97", count = 12) => {
      const id = ++burstIdRef.current;
      setBurstList((prev) => [...prev, { id, x, y, colour, count }]);
    },
    []
  );
  const spawnFloatingText = useCallback(
    (text: string, x: number, y: number, colour = "#7eff97", size = 20) => {
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

  const awardXp = useCallback(
    (amount: number, element?: HTMLElement | null) => {
      const result = addXpProgress(amount, "lesson-week-2");
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

      spawnParticles(x, y, "#7eff97", 12);
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

  // Step 0, Video
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Step 1, Mission briefing
  const [briefingLine, setBriefingLine] = useState(0);
  const [missionAccepted, setMissionAccepted] = useState(false);

  // Step 2, Flip tiles
  const [flippedTiles, setFlippedTiles] = useState<Set<number>>(new Set());

  // Step 3, Poster fix
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());
  const [safeTaps, setSafeTaps] = useState(0);
  const [posterDone, setPosterDone] = useState(false);

  // Step 4, Classify quiz
  const [classifyIdx, setClassifyIdx] = useState(0);
  const [classifyScore, setClassifyScore] = useState(0);
  const [classifyFeedback, setClassifyFeedback] = useState<"correct" | "wrong" | null>(null);

  // Step 5, Chat simulation
  const [chatRound, setChatRound] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ from: "them" | "me"; text: string }[]>([]);
  const [dangerLevel, setDangerLevel] = useState(0);
  const [chatTyping, setChatTyping] = useState(false);
  const [chatRevealed, setChatRevealed] = useState(false);
  const [chatChoiceMade, setChatChoiceMade] = useState(false);

  // Step 6, Intel report
  const [intelReady, setIntelReady] = useState(false);

  // Step 7, Profile detective
  const [foundDangers, setFoundDangers] = useState<Set<string>>(new Set());
  const [profileTimer, setProfileTimer] = useState(90);
  const [profileDone, setProfileDone] = useState(false);
  const profileTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 8, Context sorting
  const [contextIdx, setContextIdx] = useState(0);
  const [contextScore, setContextScore] = useState(0);
  const [contextFeedback, setContextFeedback] = useState<string | null>(null);

  // Step 9, Information chain
  const [chainRevealed, setChainRevealed] = useState(0);
  const [chainBroken, setChainBroken] = useState(false);
  const [chain2Phase, setChain2Phase] = useState(false);
  const [chain2Revealed, setChain2Revealed] = useState(0);
  const [chain2Broken, setChain2Broken] = useState(false);
  const [chainDone, setChainDone] = useState(false);

  // Step 10, Raccoon frustration
  const [boardRevealed, setBoardRevealed] = useState<Set<number>>(new Set());

  // Step 11, Speed sort
  const [speedIdx, setSpeedIdx] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedStreak, setSpeedStreak] = useState(0);
  const [speedBestStreak, setSpeedBestStreak] = useState(0);
  const [speedFeedback, setSpeedFeedback] = useState<"correct" | "wrong" | "slow" | null>(null);
  const [speedDone, setSpeedDone] = useState(false);
  const speedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 12, Phone call
  const [phoneRound, setPhoneRound] = useState(0);
  const [phoneScore, setPhoneScore] = useState(0);
  const [phoneAnswered, setPhoneAnswered] = useState(false);
  const [phoneFeedback, setPhoneFeedback] = useState<string | null>(null);

  // Step 13, Shield builder
  const [shieldIdx, setShieldIdx] = useState(0);
  const [shieldFilled, setShieldFilled] = useState(0);
  const [shieldRetry, setShieldRetry] = useState(false);
  const [shieldPerfect, setShieldPerfect] = useState(0);

  // Step 14, Masterplan
  const [masterRevealed, setMasterRevealed] = useState<Set<number>>(new Set());

  // Step 15, Vault battle
  const [vaultRound, setVaultRound] = useState(0);
  const [vaultHP, setVaultHP] = useState(100);
  const [vaultScore, setVaultScore] = useState(0);
  const [vaultFeedback, setVaultFeedback] = useState<"correct" | "wrong" | null>(null);
  const [vaultDone, setVaultDone] = useState(false);

  // Step 16, Victory (no extra state needed beyond coins)

  const addCoins = useCallback((n: number) => {
    setCoins((c) => c + n);
    playSound("/sounds/coin.mp3");
    animateCoins();
  }, []);

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
  }, [step]);

  const [showInstr, setShowInstr] = useState<Record<number, boolean>>({});
  const [showSummary, setShowSummary] = useState<Record<number, boolean>>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, number>>({});

  // Vault-battle entry + defeat + victory cues (Week 2 boss = step 15)
  const vaultAppearFiredRef = useRef(false);
  const vaultDefeatedFiredRef = useRef(false);
  const victoryFiredRef = useRef(false);

  useEffect(() => {
    if (step !== 15) {
      vaultAppearFiredRef.current = false;
      return;
    }
    if (showInstr[15] || showSummary[15] || vaultDone) return;
    if (vaultAppearFiredRef.current) return;
    vaultAppearFiredRef.current = true;
    playSFX("boss-appear");
  }, [step, showInstr, showSummary, vaultDone]);

  useEffect(() => {
    if (!vaultDone) {
      vaultDefeatedFiredRef.current = false;
      return;
    }
    if (vaultDefeatedFiredRef.current) return;
    vaultDefeatedFiredRef.current = true;
    playSFX("boss-defeated");
    void bossDefeatedExplosion();
  }, [vaultDone]);

  useEffect(() => {
    if (step !== 16) {
      victoryFiredRef.current = false;
      return;
    }
    if (victoryFiredRef.current) return;
    victoryFiredRef.current = true;
    playSFX("level-up");
    playSFX("celebration");
    void badgeEarnedCelebration();
    void milestoneFireworks();
  }, [step]);

  const navDirectionRef = useRef<"forward" | "back">("forward");
  const navigate = useCallback((to: number) => {
    playSFX("transition");
    setStep((prev) => {
      navDirectionRef.current = to < prev ? "back" : "forward";
      return to;
    });
    if ([2,3,4,5,7,8,9,11,12,13,15].includes(to)) {
      setShowInstr((p) => ({ ...p, [to]: true }));
    }
  }, []);

  // Keyboard navigation — Right Arrow = next, Left Arrow = back (skips while cutscene active).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (cutscene) return;
      if (e.key === "ArrowRight" && step < 17) { e.preventDefault(); navigate(step + 1); }
      else if (e.key === "ArrowLeft" && step > 0) { e.preventDefault(); navigate(step - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, cutscene, navigate]);

  const dismissInstr = useCallback((s: number) => setShowInstr((p) => ({ ...p, [s]: false })), []);
  const triggerSummary = useCallback((s: number) => setShowSummary((p) => ({ ...p, [s]: true })), []);
  const dismissSummary = useCallback((s: number, next: number) => {
    setShowSummary((p) => ({ ...p, [s]: false }));
    setArenaMoodBrief("celebration");
    navigate(next);
  }, [navigate, setArenaMoodBrief]);
  const addWrong = useCallback((s: number) => {
    setWrongAttempts((p) => ({ ...p, [s]: (p[s] || 0) + 1 }));
    flashReaction("wrong");
    setArenaMoodBrief("wrong");
    setLessonCombo(0);
    triggerShake();
  }, [flashReaction, triggerShake, setArenaMoodBrief]);
  const getStars = useCallback((s: number) => { const w = wrongAttempts[s] || 0; return w === 0 ? 3 : w <= 2 ? 2 : 1; }, [wrongAttempts]);

  // Step 0: video skip timer
  useEffect(() => {
    if (step !== 0) return;
    const v = videoRef.current;
    if (v) v.play().catch(() => setVideoFailed(true));
    const t = setTimeout(() => setShowSkip(true), 10000);
    return () => clearTimeout(t);
  }, [step]);

  // Step 1: briefing typewriter
  useEffect(() => {
    if (step !== 1 || missionAccepted) return;
    if (briefingLine >= 9) return;
    const t = setTimeout(() => setBriefingLine((l) => l + 1), 600);
    return () => clearTimeout(t);
  }, [step, briefingLine, missionAccepted]);

  // Step 5: initial raccoon message
  useEffect(() => {
    if (step !== 5 || chatRound > 0 || chatMessages.length > 0) return;
    setChatTyping(true);
    const t = setTimeout(() => {
      setChatTyping(false);
      setChatMessages([{ from: "them", text: CHAT_ROUNDS[0].msg }]);
    }, 1500);
    return () => clearTimeout(t);
  }, [step, chatRound, chatMessages.length]);

  // Step 6: intel report reveal
  useEffect(() => {
    if (step !== 6) return;
    const t = setTimeout(() => setIntelReady(true), 2000);
    return () => clearTimeout(t);
  }, [step]);

  // Step 7: profile timer
  useEffect(() => {
    if (step !== 7 || profileDone) return;
    setProfileTimer(90);
    profileTimerRef.current = setInterval(() => {
      setProfileTimer((t) => {
        if (t <= 1) { if (profileTimerRef.current) clearInterval(profileTimerRef.current); setProfileDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (profileTimerRef.current) clearInterval(profileTimerRef.current); };
  }, [step, profileDone]);

  // Step 7: check all found
  useEffect(() => {
    if (step !== 7 || profileDone) return;
    if (foundDangers.size >= PROFILE_DANGERS.length) {
      if (profileTimerRef.current) clearInterval(profileTimerRef.current);
      setProfileDone(true);
    }
  }, [step, foundDangers.size, profileDone]);

  // Step 11: speed sort timer per item
  useEffect(() => {
    if (step !== 11 || speedDone || speedIdx >= SPEED_SORT_ITEMS.length) return;
    const timeout = speedIdx < 5 ? 5000 : speedIdx < 10 ? 3500 : 2500;
    speedTimerRef.current = setTimeout(() => {
      setSpeedFeedback("slow");
      setSpeedStreak(0);
      setTimeout(() => { setSpeedFeedback(null); setSpeedIdx((i) => i + 1); }, 800);
    }, timeout);
    return () => { if (speedTimerRef.current) clearTimeout(speedTimerRef.current); };
  }, [step, speedIdx, speedDone]);

  // Step 11: check completion
  useEffect(() => {
    if (step !== 11 && speedIdx >= SPEED_SORT_ITEMS.length && !speedDone) {
      setSpeedDone(true);
    }
  }, [step, speedIdx, speedDone]);

  // Post progress on victory screen
  const progressPosted = useRef(false);
  useEffect(() => {
    if (step !== 16 || progressPosted.current) return;
    progressPosted.current = true;
    fetch("/api/progress", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    }).catch(() => {});
  }, [step, moduleId]);

  /* ───────── RENDER SCREEN ───────── */
  const renderScreen = () => {
    switch (step) {

      /* ──── STEP 0: INTRO VIDEO ──── */
      case 0:
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a1a 0%, #0a1628 100%)">
          <div style={{ textAlign: "center" }}>
            {!videoEnded ? (
              <>
                {!videoFailed ? (
                  <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid rgba(59,130,246,0.3)", boxShadow: "0 0 30px rgba(59,130,246,0.2)", maxWidth: 640, margin: "0 auto" }}>
                    <video ref={videoRef} src="/videos/week2-intro.mp4"
                      onError={() => setVideoFailed(true)} onEnded={() => setVideoEnded(true)}
                      style={{ width: "100%", display: "block" }} playsInline controls />
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {card(
                      <>
                        <img src="/characters/adam-layla-happy.png" alt="Adam and Layla" style={{ width: 180, borderRadius: 20, margin: "0 auto 16px", display: "block" }} />
                        <p style={{ color: "#9ca3af", fontSize: 16 }}>Video coming soon!</p>
                      </>,
                      { maxWidth: 400, margin: "0 auto" }
                    )}
                  </motion.div>
                )}
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 12 }}>Week 2 · Mission: Guard Your Secrets</p>
                {showSkip && !videoEnded && (
                  <div style={{ marginTop: 16 }}>{btn("Skip Intro →", () => setVideoEnded(true))}</div>
                )}
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                {card(
                  <>
                    <img src="/characters/heroic.png" alt="Adam and Layla" style={{ width: 160, borderRadius: 20, margin: "0 auto 16px", display: "block" }} />
                    <h2 data-split style={{ color: "#fff", fontSize: 36, fontWeight: 900, margin: "0 0 8px", textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>Mission: Guard Your Secrets!</h2>
                    <p style={{ color: "#d1d5db", marginBottom: 20, fontSize: 16 }}>Adam and Layla need your help to learn about private information!</p>
                    {btn("Start Mission →", () => navigate(1))}
                  </>,
                  { maxWidth: 800, margin: "0 auto", padding: 32 }
                )}
              </motion.div>
            )}
          </div>
          </FullScene>
        );

      /* ──── STEP 1: MISSION BRIEFING ──── */
      case 1: {
        const lines = [
          "CLASSIFIED, INFORMATION AGENT BRIEFING",
          `Agent: ${childName}`,
          "Mission: Help Adam & Layla protect their personal information",
          "Threat Level: HIGH, The Hacker Raccoon has been spotted collecting data",
          "Your Objectives:",
          "1. Learn what personal information is",
          "2. Identify what's safe to share and what's private",
          "3. Stop the Raccoon from stealing any data",
          "4. Build an unbreakable Privacy Shield",
        ];
        return (
          <FullScene bg="linear-gradient(180deg, #0a1020 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(59,130,246,0.25), transparent)">
          <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 40, fontWeight: 900, marginBottom: 16, textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>🔐 Agent Assignment</h1>
            <SpeechBubble character="layla" message="This is a top secret mission. We need to protect our personal information!" />
            {/* Folder */}
            <motion.div
              initial={{ rotateX: -30 }}
              animate={{ rotateX: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ maxWidth: 800, margin: "0 auto" }}>
              {card(
                <div style={{ textAlign: "left" }}>
                  {/* TOP SECRET stamp */}
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <motion.div initial={{ scale: 2, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: -8 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      style={{ display: "inline-block", padding: "4px 16px", border: "3px solid #ef4444", borderRadius: 8, color: "#ef4444", fontWeight: 900, fontSize: 18 }}>
                      TOP SECRET
                    </motion.div>
                  </div>
                  {/* Typewriter lines */}
                  {lines.map((line, i) => (
                    briefingLine > i ? (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        {i >= 5 && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                            style={{ color: "#7eff97", fontSize: 16, flexShrink: 0 }}>✅</motion.span>
                        )}
                        <p style={{
                          color: i === 0 ? "#f59e0b" : i === 3 ? "#ef4444" : "#d1d5db",
                          fontSize: i === 0 ? 16 : 14,
                          fontWeight: i === 0 || i === 4 ? 800 : 500,
                          fontFamily: "monospace", margin: 0,
                        }}>{line}</p>
                      </motion.div>
                    ) : null
                  ))}
                  {/* Raccoon peeking */}
                  <motion.img src="/characters/raccoon-sneaking.png" alt="Raccoon"
                    initial={{ x: "120%" }} animate={{ x: "95%" }}
                    transition={{ delay: 2, duration: 1, ease: "easeOut" }}
                    style={{ position: "absolute", right: 0, bottom: 20, width: 60, borderRadius: 12 }} />
                </div>,
                { background: "rgba(245,158,11,0.06)", border: "2px solid rgba(245,158,11,0.2)", position: "relative", overflow: "hidden" }
              )}
              {/* Accept button */}
              {briefingLine >= 9 && !missionAccepted && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  style={{ marginTop: 20, textAlign: "center" }}>
                  <motion.button onClick={() => { setMissionAccepted(true); addCoins(10); navigate(2); }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "#fff", fontWeight: 700, borderRadius: 14, padding: "16px 40px", border: "none", cursor: "pointer", fontSize: 18, boxShadow: "0 0 15px rgba(249,115,22,0.4)" }}>
                    🔐 ACCEPT MISSION
                  </motion.button>
                </motion.div>
              )}
              {missionAccepted && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", marginTop: 16 }}>
                  <p style={{ color: "#7eff97", fontWeight: 900, fontSize: 18 }}>IDENTITY CONFIRMED ✅</p>
                </motion.div>
              )}
            </motion.div>
          </div>
          </FullScene>
        );
      }

      /* ──── STEP 2: FLIP TILES ──── */
      case 2:
        if (showInstr[2]) return <InstructionOverlay icon="🔍" story="The Raccoon is snooping!" instructions="Tap each tile to flip it. Red means PRIVATE, green means SAFE!" onReady={() => dismissInstr(2)} />;
        if (showSummary[2]) return <LearnSummary message="You learned that some information is PRIVATE and some is SAFE. Private things like addresses and passwords should NEVER be shared with strangers!" starCount={getStars(2)} onNext={() => dismissSummary(2, 3)} />;
        return (
          <FullScene bg="linear-gradient(180deg, #0a0f1a 0%, #0f1530 100%)" glow="radial-gradient(circle, rgba(59,130,246,0.15), transparent)">
          <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 38, fontWeight: 900, marginBottom: 4, textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>📁 What IS Personal Information?</h1>
            <SpeechBubble character="adam" message="Some of this stuff is private and some is safe to share. Let's find out which!" />
            <p style={{ color: "#9ca3af", marginBottom: 20, fontSize: 16 }}>Tap each tile to discover what&apos;s inside</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, maxWidth: 800, margin: "0 auto 20px" }}>
              {TILE_DATA.map((tile, i) => {
                const flipped = flippedTiles.has(i);
                return (
                  <motion.div key={i}
                    onClick={(e) => {
                      if (flipped) return;
                      setFlippedTiles((prev) => { const n = new Set(prev); n.add(i); return n; });
                      playSound("/sounds/correct.mp3");
                      awardXp(30, e.currentTarget as HTMLElement);
                    }}
                    animate={flipped ? { rotateY: [0, 90, 0] } : {}}
                    transition={{ duration: 0.6 }}
                    whileHover={!flipped ? { scale: 1.05, y: -4 } : {}}
                    style={{
                      minHeight: 120, borderRadius: 16, cursor: flipped ? "default" : "pointer",
                      background: flipped ? `${tile.color}15` : "rgba(255,255,255,0.04)",
                      border: `2px solid ${flipped ? `${tile.color}50` : "rgba(255,255,255,0.1)"}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: 16, gap: 8,
                    }}>
                    {flipped ? (
                      <>
                        <span style={{ fontSize: 32 }}>{tile.icon}</span>
                        <span style={{ color: tile.color, fontWeight: 800, fontSize: 13, textAlign: "center" }}>{tile.label}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                          background: tile.level === "private" ? "rgba(239,68,68,0.2)" : tile.level === "careful" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
                          color: tile.color,
                        }}>
                          {tile.level === "private" ? "PRIVATE" : tile.level === "careful" ? "BE CAREFUL" : "SAFE"}
                        </span>
                      </>
                    ) : (
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: 36, color: "#6b7280" }}>?</motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <AnimatePresence>
              {flippedTiles.size === 8 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {card(
                    <>
                      <p style={{ color: "#ef4444", fontWeight: 800, marginBottom: 4 }}>🔴 RED = PRIVATE, never share with strangers</p>
                      <p style={{ color: "#22c55e", fontWeight: 800, marginBottom: 4 }}>🟢 GREEN = SAFE, okay to share</p>
                      <p style={{ color: "#f59e0b", fontWeight: 800, marginBottom: 12 }}>🟡 AMBER = CAREFUL, depends who&apos;s asking!</p>
                      {btn("Got it! Next →", () => { addCoins(10); triggerSummary(2); })}
                    </>,
                    { maxWidth: 500, margin: "0 auto" }
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </FullScene>
        );

      /* ──── STEP 3: POSTER FIX ──── */
      case 3:
        if (showInstr[3]) return <InstructionOverlay icon="📋" story="Adam made a poster with TOO MUCH info!" instructions="Tap on the dangerous things to REMOVE them from the poster." onReady={() => dismissInstr(3)} />;
        if (showSummary[3]) return <LearnSummary message="You spotted dangerous information on a poster. Always check before sharing, remove addresses, phone numbers, and school names!" starCount={getStars(3)} onNext={() => dismissSummary(3, 4)} />;
        return (
          <FullScene bg="linear-gradient(180deg, #1a1508 0%, #0f1530 100%)" glow="radial-gradient(circle, rgba(245,158,11,0.2), transparent)">
          <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 38, fontWeight: 900, marginBottom: 4, textShadow: "0 0 20px rgba(245,158,11,0.3)" }}>📋 Fix Adam&apos;s Poster!</h1>
            <SpeechBubble character="layla" message="Oh no, Adam put WAY too much information on this poster!" />
            <SpeechBubble character="raccoon" message="Hehehe, keep going Adam... tell me more!" side="right" />
            <p style={{ color: "#9ca3af", marginBottom: 8, fontSize: 16 }}>Tap on things that should be REMOVED to keep Adam safe</p>
            <p style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 16 }}>
              Dangers found: {removedItems.size}/{POSTER_DANGER_COUNT}
            </p>
            {!posterDone ? (
              <div style={{ maxWidth: 500, margin: "0 auto" }}>
                {card(
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b" }}>📋 Adam&apos;s Poster</span>
                    </div>
                    {POSTER_ITEMS.map((item) => {
                      const removed = removedItems.has(item.id);
                      if (removed) return null;
                      return (
                        <motion.button key={item.id}
                          onClick={(e) => {
                            if (item.danger) {
                              setRemovedItems((prev) => { const n = new Set(prev); n.add(item.id); return n; });
                              playSound("/sounds/correct.mp3");
                              awardXp(50, e.currentTarget as HTMLElement);
                              if (removedItems.size + 1 >= POSTER_DANGER_COUNT) {
                                setTimeout(() => setPosterDone(true), 600);
                              }
                            } else {
                              setSafeTaps((s) => s + 1);
                              playSound("/sounds/wrong.mp3");
                            }
                          }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          animate={!item.danger && safeTaps > 0 ? {} : {}}
                          style={{
                            background: item.danger ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 12, padding: "12px 16px", textAlign: "left",
                            color: "#d1d5db", fontSize: 14, fontWeight: 500, cursor: "pointer",
                          }}>
                          {item.text}
                        </motion.button>
                      );
                    })}
                  </div>,
                  { background: "rgba(245,158,11,0.04)", border: "2px solid rgba(245,158,11,0.2)" }
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                {card(
                  <>
                    <h2 style={{ color: "#7eff97", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
                      Perfect! The poster is safe now! ✅
                    </h2>
                    <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                      <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 4 }}>Safe poster now shows:</p>
                      <p style={{ color: "#fff", fontWeight: 700 }}>Adam · Age 8 · Loves gaming and football! · Dog: Buddy</p>
                    </div>
                    {btn("Continue →", () => {
                      const bonus = safeTaps === 0 ? 5 : 0;
                      addCoins(15 + bonus);
                      triggerSummary(3);
                    })}
                  </>,
                  { maxWidth: 500, margin: "0 auto" }
                )}
              </motion.div>
            )}
          </div>
          </FullScene>
        );

      /* ──── STEP 4: PROTECT THE DATA (was classify quiz) ──── */
      case 4: {
        if (showSummary[4]) return <LearnSummary message="You can tell private from safe-to-share in an instant!" starCount={getStars(4)} onNext={() => dismissSummary(4, 5)} />;
        return (
          <FullScene bg="linear-gradient(180deg, #0a1020 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(239,68,68,0.2), transparent)">
            <ProtectTheData
              items={W2_PROTECT_ITEMS}
              onComplete={() => triggerSummary(4)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(4)}
            />
          </FullScene>
        );
      }

      /* ──── STEP 5: CHAT SIMULATION ──── */
      case 5: {
        if (showInstr[5]) return <InstructionOverlay icon="💬" story="Someone called CoolKid99 is messaging you..." instructions="Choose how to reply. Be careful what you share!" onReady={() => dismissInstr(5)} />;
        if (showSummary[5]) return <LearnSummary message="Strangers online might not be who they say they are. Never share private info in messages!" starCount={getStars(5)} onNext={() => dismissSummary(5, 6)} />;
        if (chatRevealed) {
          const maxDanger = CHAT_ROUNDS.length * 2;
          const dangerPct = Math.round((dangerLevel / maxDanger) * 100);
          return (
            <FullScene bg="linear-gradient(180deg, #0a0a1a 0%, #0f0a1a 100%)" glow="radial-gradient(circle, rgba(239,68,68,0.15), transparent)">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
              {card(
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <img src="/characters/raccoon-defeated.png" alt="Raccoon revealed" style={{ width: 120, borderRadius: 20, margin: "0 auto 12px", display: "block" }} />
                  </motion.div>
                  <h2 style={{ color: "#ef4444", fontSize: 36, fontWeight: 900, marginBottom: 8, textShadow: "0 0 20px rgba(239,68,68,0.4)" }}>
                    It was the RACCOON all along!
                  </h2>
                  <SpeechBubble character="layla" message="I KNEW it! It was the Raccoon all along!" />
                  <SpeechBubble character="raccoon" message="Grrrr! I almost had you!" side="right" />
                  <p style={{ color: "#d1d5db", marginBottom: 4 }}>Danger Meter: {dangerPct}%</p>
                  {dangerPct <= 20 ? (
                    <p style={{ color: "#7eff97", fontWeight: 700, marginBottom: 16 }}>Amazing! The Raccoon got NOTHING from you!</p>
                  ) : (
                    <p style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 16 }}>The Raccoon got some info, but now you know what to watch for next time!</p>
                  )}
                  <p style={{ color: "#f59e0b", fontSize: 14, marginBottom: 16 }}>🪙 +20 coins earned!</p>
                  {btn("Continue Mission →", () => triggerSummary(5))}
                </>,
                { maxWidth: 520, margin: "0 auto" }
              )}
            </motion.div>
            </FullScene>
          );
        }

        const currentRound = chatRound < CHAT_ROUNDS.length ? CHAT_ROUNDS[chatRound] : null;
        const maxDanger = CHAT_ROUNDS.length * 2;
        const dangerPct = Math.round((dangerLevel / maxDanger) * 100);

        return (
          <FullScene bg="linear-gradient(180deg, #0a0a1a 0%, #0f0a1a 100%)" glow="radial-gradient(circle, rgba(239,68,68,0.15), transparent)">
          <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 38, fontWeight: 900, marginBottom: 12, textShadow: "0 0 20px rgba(239,68,68,0.3)" }}>💬 INCOMING MESSAGE</h1>
            <SpeechBubble character="adam" message="Someone called CoolKid99 is messaging me. They seem nice..." />
            <SpeechBubble character="layla" message="Be careful! Remember, not everyone online is who they say they are!" />

            {/* Chat window */}
            <div style={{
              maxWidth: 500, margin: "0 auto", borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)",
            }}>
              {/* Chat header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3a7bff, #00e5ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>😎</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>CoolKid99</p>
                  <p style={{ color: "#22c55e", fontSize: 11, margin: 0 }}>Online</p>
                </div>
                {/* Danger meter */}
                <div style={{ width: 80 }}>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 2, textAlign: "right" }}>DANGER</div>
                  <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                    <motion.div animate={{ width: `${dangerPct}%` }} transition={{ duration: 0.5 }}
                      style={{ height: "100%", borderRadius: 99, background: dangerPct > 60 ? "#ef4444" : dangerPct > 30 ? "#f59e0b" : "#22c55e" }} />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ padding: 16, minHeight: 200, maxHeight: 350, overflowY: "auto" }}>
                {chatMessages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", marginBottom: 10,
                    }}>
                    <div style={{
                      maxWidth: "75%", padding: "10px 14px", borderRadius: 16,
                      background: m.from === "me" ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)",
                      borderBottomRightRadius: m.from === "me" ? 4 : 16,
                      borderBottomLeftRadius: m.from === "me" ? 16 : 4,
                    }}>
                      <p style={{ color: "#d1d5db", fontSize: 14, margin: 0, textAlign: "left" }}>{m.text}</p>
                    </div>
                  </motion.div>
                ))}
                {chatTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                    <div style={{ padding: "10px 14px", borderRadius: 16, background: "rgba(255,255,255,0.06)" }}>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                        style={{ color: "#9ca3af", fontSize: 14 }}>typing...</motion.span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Response options */}
              {currentRound && !chatChoiceMade && !chatTyping && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].from === "them" && (
                <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {currentRound.opts.map((opt, oi) => (
                    <motion.button key={oi}
                      onClick={() => {
                        setChatChoiceMade(true);
                        setDangerLevel((d) => d + opt.danger);
                        setChatMessages((msgs) => [...msgs, { from: "me", text: opt.text }]);
                        if (opt.danger === 0) { playSound("/sounds/correct.mp3"); awardXp(50); }
                        else { playSound("/sounds/wrong.mp3"); addWrong(5); }

                        // Raccoon replies
                        setTimeout(() => {
                          setChatTyping(true);
                          setTimeout(() => {
                            setChatTyping(false);
                            setChatMessages((msgs) => [...msgs, { from: "them", text: opt.reply }]);
                            const nextRound = chatRound + 1;
                            if (nextRound >= CHAT_ROUNDS.length) {
                              // Reveal
                              setTimeout(() => { addCoins(20); setChatRevealed(true); }, 2000);
                            } else {
                              // Next round
                              setTimeout(() => {
                                setChatChoiceMade(false);
                                setChatRound(nextRound);
                                setChatTyping(true);
                                setTimeout(() => {
                                  setChatTyping(false);
                                  setChatMessages((msgs) => [...msgs, { from: "them", text: CHAT_ROUNDS[nextRound].msg }]);
                                }, 1500);
                              }, 1500);
                            }
                          }, 1200);
                        }, 500);
                      }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{
                        background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                        borderRadius: 12, padding: "10px 14px", cursor: "pointer",
                        color: "#d1d5db", fontSize: 14, textAlign: "left", fontWeight: 600,
                      }}>
                      {opt.text}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
          </FullScene>
        );
      }

      /* ──── STEP 6: INTEL REPORT ──── */
      case 6: {
        const reportLines = [
          "INTEL REPORT, MISSION UPDATE",
          "The Hacker Raccoon attempted to extract personal data through social engineering.",
          "Result: FAILED ❌",
          "Agent, your quick thinking kept Adam & Layla's information secure.",
          "But the Raccoon isn't done yet. He's changing tactics...",
        ];
        return (
          <FullScene bg="linear-gradient(180deg, #0a1628 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(59,130,246,0.2), transparent)">
          <div style={{ textAlign: "center" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <p style={{ color: "#f59e0b", fontWeight: 900, fontSize: 16, letterSpacing: "0.2em", marginBottom: 12 }}>◉ TRANSMISSION INCOMING ◉</p>
            </motion.div>
            <h1 data-split style={{ color: "#fff", fontSize: 38, fontWeight: 900, marginBottom: 12, textShadow: "0 0 20px rgba(59,130,246,0.4)" }}>📡 Intel Report</h1>
            <SpeechBubble character="adam" message="The Raccoon got NOTHING from us. We're too smart for him!" />
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
              {card(
                <>
                  <motion.img src="/characters/raccoon-defeated.png" alt="Frustrated Raccoon"
                    animate={{ x: [-3, 3, -3] }} transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ width: 100, borderRadius: 16, margin: "0 auto 16px", display: "block" }} />
                  {reportLines.map((line, i) => (
                    <motion.p key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={intelReady || i === 0 ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: i * 0.4 }}
                      style={{ color: i === 2 ? "#ef4444" : i === 0 ? "#f59e0b" : "#d1d5db", fontSize: i === 0 ? 16 : 14, fontWeight: i === 0 ? 900 : 500, fontFamily: "monospace", marginBottom: 8, textAlign: "left" }}>
                      {line}
                    </motion.p>
                  ))}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Mission Progress: 35%</div>
                    <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: "35%" }} transition={{ delay: 2, duration: 1 }}
                        style={{ height: "100%", borderRadius: 99, background: GRAD }} />
                    </div>
                  </div>
                  {intelReady && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20 }}>
                      {btn("Continue Mission →", () => { addCoins(5); navigate(7); })}
                    </motion.div>
                  )}
                </>,
                { maxWidth: 560, margin: "0 auto" }
              )}
            </motion.div>
          </div>
          </FullScene>
        );
      }

      /* ──── STEP 7: PROFILE DETECTIVE ──── */
      case 7: {
        if (showInstr[7]) return <InstructionOverlay icon="🔍" story="This profile has DANGERS hidden in it!" instructions="Find and tap ALL 7 dangerous things in the profile." onReady={() => dismissInstr(7)} />;
        if (showSummary[7]) return <LearnSummary message="You spotted dangers in a social media profile. Keep your account PRIVATE!" starCount={getStars(7)} onNext={() => dismissSummary(7, 8)} />;
        const allFound = foundDangers.size >= PROFILE_DANGERS.length;
        return (
          <FullScene bg="linear-gradient(180deg, #0a0f1a 0%, #0f1530 100%)" glow="radial-gradient(circle, rgba(6,182,212,0.2), transparent)">
          <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 38, fontWeight: 900, marginBottom: 4, textShadow: "0 0 20px rgba(6,182,212,0.3)" }}>🔎 PROFILE DETECTIVE</h1>
            <SpeechBubble character="layla" message="This profile has so many dangers. Can you spot them all?" />
            <p style={{ color: "#9ca3af", marginBottom: 4, fontSize: 16 }}>Find ALL the dangers hidden in this profile</p>
            <p style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>Dangers found: {foundDangers.size}/{PROFILE_DANGERS.length} | Time: {profileTimer}s</p>

            {!profileDone ? (
              <div style={{ maxWidth: 440, margin: "0 auto", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                {/* Profile header */}
                <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #ff5fb3, #3a7bff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👧</div>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div onClick={() => { if (!foundDangers.has("username")) { setFoundDangers((s) => { const n = new Set(s); n.add("username"); return n; }); playSound("/sounds/correct.mp3"); } }}
                      style={{ cursor: "pointer", color: foundDangers.has("username") ? "#ef4444" : "#fff", fontWeight: 700, fontSize: 14, textDecoration: foundDangers.has("username") ? "line-through" : "none" }}>
                      Layla_Dancer_2018
                    </div>
                    <div onClick={() => { if (!foundDangers.has("public")) { setFoundDangers((s) => { const n = new Set(s); n.add("public"); return n; }); playSound("/sounds/correct.mp3"); } }}
                      style={{ cursor: "pointer", color: foundDangers.has("public") ? "#ef4444" : "#9ca3af", fontSize: 11, textDecoration: foundDangers.has("public") ? "line-through" : "none" }}>
                      Account: {foundDangers.has("public") ? "PRIVATE 🔒" : "PUBLIC 🌍"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: "#6b7280" }}>
                    <div>847 followers</div><div>234 following</div>
                  </div>
                </div>
                {/* Bio */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "left" }}>
                  {["fullname", "school", "address"].map((did) => {
                    const found = foundDangers.has(did);
                    const texts: Record<string, string> = { fullname: "Layla Johnson", school: "St Mary's Primary School", address: "42 Elm Street London" };
                    return (
                      <span key={did} onClick={() => { if (!found) { setFoundDangers((s) => { const n = new Set(s); n.add(did); return n; }); playSound("/sounds/correct.mp3"); } }}
                        style={{ cursor: "pointer", color: found ? "#ef4444" : "#d1d5db", fontSize: 13, textDecoration: found ? "line-through" : "none", marginRight: 4 }}>
                        {texts[did]} |{" "}
                      </span>
                    );
                  })}
                  <span style={{ color: "#d1d5db", fontSize: 13 }}>Age 8 | DM me! 💕</span>
                </div>
                {/* Photos grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: 2 }}>
                  <div onClick={() => { if (!foundDangers.has("uniform")) { setFoundDangers((s) => { const n = new Set(s); n.add("uniform"); return n; }); playSound("/sounds/correct.mp3"); } }}
                    style={{ cursor: "pointer", height: 100, background: foundDangers.has("uniform") ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, border: foundDangers.has("uniform") ? "2px solid #ef4444" : "none" }}>
                    <span style={{ fontSize: 10, color: foundDangers.has("uniform") ? "#ef4444" : "#9ca3af", textAlign: "center" }}>Selfie in school uniform with logo</span>
                  </div>
                  <div style={{ height: 100, background: "rgba(34,197,94,0.08)", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                    <span style={{ fontSize: 10, color: "#6b7280", textAlign: "center" }}>Painting at home</span>
                  </div>
                  <div onClick={() => { if (!foundDangers.has("house")) { setFoundDangers((s) => { const n = new Set(s); n.add("house"); return n; }); playSound("/sounds/correct.mp3"); } }}
                    style={{ cursor: "pointer", height: 100, background: foundDangers.has("house") ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: 8, border: foundDangers.has("house") ? "2px solid #ef4444" : "none" }}>
                    <span style={{ fontSize: 10, color: foundDangers.has("house") ? "#ef4444" : "#9ca3af", textAlign: "center" }}>Photo outside house with #42 visible</span>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                {card(
                  <>
                    <h2 style={{ color: "#7eff97", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>PROFILE SECURED!</h2>
                    <p style={{ color: "#d1d5db", marginBottom: 16 }}>
                      {allFound ? `All ${PROFILE_DANGERS.length} dangers eliminated!` : `You found ${foundDangers.size}/${PROFILE_DANGERS.length} dangers.`}
                    </p>
                    {btn("Continue →", () => { addCoins(profileTimer > 30 ? 20 : 15); triggerSummary(7); })}
                  </>,
                  { maxWidth: 480, margin: "0 auto" }
                )}
              </motion.div>
            )}
          </div>
          </FullScene>
        );
      }

      /* ──── STEP 8: CONTEXT SORTING ──── */
      case 8: {
        if (showInstr[8]) return <InstructionOverlay icon="🤔" story="The same info can be safe OR dangerous!" instructions="Read both situations and tap where it IS okay to share." onReady={() => dismissInstr(8)} />;
        if (showSummary[8]) return <LearnSummary message="WHO is asking matters as much as WHAT they're asking!" starCount={getStars(8)} onNext={() => dismissSummary(8, 9)} />;
        if (contextIdx >= CONTEXT_ROUNDS.length) {
          return (
            <FullScene bg="linear-gradient(180deg, #1a1508 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(245,158,11,0.2), transparent)">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
              {card(
                <>
                  <h2 data-split style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 8, textShadow: "0 0 20px rgba(245,158,11,0.3)" }}>Context Matters!</h2>
                  <p style={{ color: "#d1d5db", marginBottom: 16 }}>{contextScore}/{CONTEXT_ROUNDS.length} correct! It&apos;s not just WHAT you share, it&apos;s WHO you share it with!</p>
                  {btn("Continue →", () => { addCoins(contextScore === CONTEXT_ROUNDS.length ? 15 : 10); triggerSummary(8); })}
                </>,
                { maxWidth: 480, margin: "0 auto" }
              )}
            </motion.div>
            </FullScene>
          );
        }
        const cr = CONTEXT_ROUNDS[contextIdx];
        return (
          <FullScene bg="linear-gradient(180deg, #1a1508 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(245,158,11,0.2), transparent)">
          <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 38, fontWeight: 900, marginBottom: 4, textShadow: "0 0 20px rgba(245,158,11,0.3)" }}>⚖️ Who&apos;s Asking?</h1>
            <p style={{ color: "#9ca3af", marginBottom: 16, fontSize: 16 }}>Round {contextIdx + 1}/{CONTEXT_ROUNDS.length}</p>
            <AnimatePresence mode="wait">
              <motion.div key={contextIdx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                {/* Info card */}
                <div style={{ background: "rgba(59,130,246,0.1)", border: "2px solid rgba(59,130,246,0.3)", borderRadius: 16, padding: 20, marginBottom: 16, maxWidth: 500, margin: "0 auto 16px" }}>
                  <p style={{ color: "#fff", fontSize: 24, fontWeight: 900 }}>&quot;{cr.info}&quot;</p>
                </div>
                {/* Scenario cards */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 600, margin: "0 auto" }}>
                  {[cr.a, cr.b].map((sc, si) => (
                    <motion.button key={si}
                      className="shimmer-card"
                      onClick={(e) => {
                        if (contextFeedback) return;
                        if (sc.ok) {
                          celebrateCorrect(e.currentTarget as HTMLElement);
                          setContextScore((s) => s + 1);
                          setContextFeedback(cr.why);
                          playSound("/sounds/correct.mp3");
                          setTimeout(() => { setContextFeedback(null); setContextIdx((i) => i + 1); }, 2500);
                        } else {
                          shakeWrong(e.currentTarget as HTMLElement);
                          setContextFeedback("wrong");
                          playSound("/sounds/wrong.mp3");
                          addWrong(8);
                          setTimeout(() => setContextFeedback(null), 1500);
                        }
                      }}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      animate={contextFeedback === "wrong" && !sc.ok ? { x: [-5, 5, -5, 5, 0] } : {}}
                      style={{
                        flex: 1, minWidth: 200, padding: 24, borderRadius: 16, cursor: "pointer",
                        background: contextFeedback && sc.ok ? "rgba(16,185,129,0.15)" : contextFeedback === "wrong" && !sc.ok ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                        border: `2px solid ${contextFeedback && sc.ok ? "#7eff97" : "rgba(255,255,255,0.1)"}`,
                        color: "#d1d5db", fontSize: 18, fontWeight: 600, textAlign: "left", minHeight: 120,
                      }}>
                      {sc.text}
                    </motion.button>
                  ))}
                </div>
                {contextFeedback && contextFeedback !== "wrong" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: "#7eff97", fontWeight: 700, fontSize: 14, marginTop: 12 }}>
                    {contextFeedback}
                  </motion.p>
                )}
                {contextFeedback === "wrong" && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: "#ef4444", fontWeight: 700, fontSize: 14, marginTop: 12 }}>
                    Think about WHO is asking!
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          </FullScene>
        );
      }

      /* ──── STEP 9: INFORMATION CHAIN ──── */
      case 9: {
        if (showInstr[9]) return <InstructionOverlay icon="🔗" story="Watch what happens when you share just ONE thing..." instructions="Tap each card to see the chain reaction, then BREAK it!" onReady={() => dismissInstr(9)} />;
        if (showSummary[9]) return <LearnSummary message="Sharing just ONE thing can lead to BIG problems. Keep the first piece private and the chain breaks!" starCount={getStars(9)} onNext={() => dismissSummary(9, 10)} />;
        const activeChain = chain2Phase ? DOMINO_CHAIN_2 : DOMINO_CHAIN_1;
        const revealed = chain2Phase ? chain2Revealed : chainRevealed;
        const broken = chain2Phase ? chain2Broken : chainBroken;
        return (
          <ThemedScene theme="domino">
            <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 8, textShadow: "0 0 20px rgba(59,130,246,0.5)" }}>The Information Chain</h1>
            <SpeechBubble character="adam" message="Wait... sharing just ONE thing can cause ALL of this?" />
            <p style={{ color: "#9ca3af", marginBottom: 16, fontSize: 16 }}>
              {broken ? "You broke the chain!" : "Tap each domino to see what happens next..."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 500, margin: "0 auto 16px" }}>
              {activeChain.map((text, i) => (
                <div key={i}>
                  <motion.div
                    onClick={() => {
                      if (broken || i !== revealed) return;
                      if (chain2Phase) setChain2Revealed((r) => r + 1);
                      else setChainRevealed((r) => r + 1);
                      playSound("/sounds/wrong.mp3");
                    }}
                    animate={broken ? { opacity: 0.2, scale: 0.9 } : i < revealed ? { backgroundColor: "rgba(239,68,68,0.15)" } : {}}
                    style={{
                      padding: 16, borderRadius: 12, cursor: i === revealed && !broken ? "pointer" : "default",
                      background: i < revealed ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${i < revealed ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
                      color: i < revealed ? "#fca5a5" : "#6b7280",
                      fontWeight: 700, fontSize: 14, textAlign: "left",
                    }}>
                    {i < revealed ? text : `Domino ${i + 1}, Tap to reveal`}
                  </motion.div>
                  {i < activeChain.length - 1 && i < revealed && (
                    <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: broken ? 0 : 1 }}
                      style={{ width: 2, height: 20, background: "#ef4444", margin: "0 auto", transformOrigin: "top" }} />
                  )}
                </div>
              ))}
            </div>
            {/* Break the chain button */}
            {revealed >= activeChain.length && !broken && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.button onClick={() => {
                  if (chain2Phase) setChain2Broken(true);
                  else setChainBroken(true);
                  playSound("/sounds/correct.mp3");
                }}
                  animate={{ boxShadow: ["0 0 10px rgba(249,115,22,0.4)", "0 0 25px rgba(249,115,22,0.6)", "0 0 10px rgba(249,115,22,0.4)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", color: "#fff", fontWeight: 700, borderRadius: 14, padding: "16px 40px", border: "none", cursor: "pointer", fontSize: 18 }}>
                  BREAK THE CHAIN!
                </motion.button>
              </motion.div>
            )}
            {broken && !chain2Phase && !chainDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
                <p style={{ color: "#7eff97", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>By keeping just ONE thing private, you broke the entire chain!</p>
                {btn("See Another Chain →", () => { setChain2Phase(true); })}
              </motion.div>
            )}
            {chain2Phase && chain2Broken && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12 }}>
                <p style={{ color: "#7eff97", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Every chain has a first link. Keep that link private, and the whole chain breaks!</p>
                {btn("Continue →", () => { addCoins(10); triggerSummary(9); })}
              </motion.div>
            )}
            </div>
          </ThemedScene>
        );
      }

      /* ──── STEP 10: RACCOON FRUSTRATION ──── */
      case 10:
        return (
          <ThemedScene theme="lair">
            <div style={{ textAlign: "center" }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 1 }}
              style={{ color: "#f59e0b", fontWeight: 900, fontSize: 14, letterSpacing: "0.2em", marginBottom: 12 }}>
              ◉ TRANSMISSION INCOMING ◉
            </motion.p>
            <h1 data-split style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 16, textShadow: "0 0 20px rgba(239,68,68,0.4)" }}>Raccoon&apos;s Investigation Board</h1>
            <SpeechBubble character="raccoon" message="This is impossible! My investigation board is EMPTY!" side="right" />
            <SpeechBubble character="layla" message="That's what happens when you keep your info private!" />
            {/* Board */}
            <div style={{ maxWidth: 500, margin: "0 auto 16px", background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
              <motion.img src="/characters/raccoon-defeated.png" alt="Frustrated Raccoon"
                animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 0.3, repeat: Infinity }}
                style={{ width: 80, borderRadius: 16, margin: "0 auto 16px", display: "block" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {RACCOON_BOARD.map((item, i) => {
                  const revealed = boardRevealed.has(i);
                  return (
                    <motion.div key={i}
                      onClick={() => { if (!revealed) { setBoardRevealed((s) => { const n = new Set(s); n.add(i); return n; }); playSound("/sounds/correct.mp3"); } }}
                      whileHover={!revealed ? { scale: 1.05 } : {}}
                      style={{
                        padding: 14, borderRadius: 12, cursor: revealed ? "default" : "pointer",
                        background: revealed ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${revealed ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                        textAlign: "center",
                      }}>
                      <p style={{ color: revealed ? "#7eff97" : "#6b7280", fontWeight: 700, fontSize: 13 }}>
                        {item.label}: {revealed ? "" : "???"}
                      </p>
                      {revealed && <p style={{ color: "#7eff97", fontSize: 12, marginTop: 4 }}>{item.msg}</p>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            {boardRevealed.size >= RACCOON_BOARD.length && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {card(
                  <>
                    <p style={{ color: "#7eff97", fontWeight: 800, marginBottom: 4 }}>The Raccoon&apos;s board is EMPTY.</p>
                    <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 8 }}>He has NOTHING on Adam &amp; Layla. But he&apos;s not giving up!</p>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Mission Progress: 65%</div>
                      <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1 }}
                          style={{ height: "100%", borderRadius: 99, background: GRAD }} />
                      </div>
                    </div>
                    {btn("Prepare for Phase 2 →", () => { addCoins(5); navigate(11); })}
                  </>,
                  { maxWidth: 480, margin: "0 auto" }
                )}
              </motion.div>
            )}
            </div>
          </ThemedScene>
        );

      /* ──── STEP 11: MEMORY MATCH (was speed sort) ──── */
      case 11: {
        if (showSummary[11]) return <LearnSummary message="You matched every rule — you know exactly what to keep private!" starCount={getStars(11)} onNext={() => dismissSummary(11, 12)} />;
        return (
          <ThemedScene theme="factory">
            <MemoryMatch
              pairs={W2_PRIVATE_INFO_PAIRS}
              onComplete={() => triggerSummary(11)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(11)}
            />
          </ThemedScene>
        );
      }

      /* ──── STEP 12: CHOOSE YOUR PATH (was phone call) ──── */
      case 12: {
        if (showSummary[12]) return <LearnSummary message="You made safe choices every time — your private info is protected!" starCount={getStars(12)} onNext={() => dismissSummary(12, 13)} />;
        return (
          <ThemedScene theme="callscreen">
            <ChooseYourPath
              scenarios={W2_PATH_SCENARIOS}
              onComplete={() => triggerSummary(12)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(12)}
            />
          </ThemedScene>
        );
      }

      /* ──── STEP 13: CYBER MAZE (was shield builder) ──── */
      case 13: {
        if (showSummary[13]) return <LearnSummary message="You found the exit and answered every gate — knowledge is the key!" starCount={getStars(13)} onNext={() => dismissSummary(13, 14)} />;
        return (
          <ThemedScene theme="forge">
            <CyberMaze
              questions={W2_MAZE_QUESTIONS}
              onComplete={() => triggerSummary(13)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(13)}
            />
          </ThemedScene>
        );
      }

      /* ──── LEGACY STEP 13 (shield builder) ──── */
      /* ──── STEP 14: MASTERPLAN ──── */
      case 14: {
        const allRevealed = masterRevealed.size >= MASTERPLAN_CARDS.length;
        return (
          <ThemedScene theme="warroom">
            <div style={{ textAlign: "center" }}>
            <h1 data-split style={{ color: "#fff", fontSize: 36, fontWeight: 900, marginBottom: 16, textShadow: "0 0 18px rgba(245,158,11,0.5)" }}>The Raccoon&apos;s Masterplan... FAILED</h1>
            <div style={{ maxWidth: 520, margin: "0 auto 16px", background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
              <img src="/characters/raccoon-defeated.png" alt="Raccoon" style={{ width: 60, borderRadius: 12, margin: "0 auto 12px", display: "block" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {MASTERPLAN_CARDS.map((mc, i) => {
                  const rev = masterRevealed.has(i);
                  return (
                    <motion.div key={i}
                      onClick={() => { if (!rev) { setMasterRevealed((s) => { const n = new Set(s); n.add(i); return n; }); playSound("/sounds/correct.mp3"); } }}
                      animate={rev ? { rotateY: [0, 90, 0] } : {}}
                      transition={{ duration: 0.5 }}
                      whileHover={!rev ? { scale: 1.05 } : {}}
                      style={{ padding: 14, borderRadius: 12, cursor: rev ? "default" : "pointer", background: rev ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${rev ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`, textAlign: "center", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ color: rev ? "#ef4444" : "#6b7280", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>{mc.label}</p>
                      {rev ? (
                        <>
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "block", color: "#ef4444", fontWeight: 900, fontSize: 11 }}>FAILED</motion.span>
                          <p style={{ color: "#7eff97", fontSize: 10, marginTop: 4 }}>{mc.result}</p>
                        </>
                      ) : (
                        <span style={{ color: "#6b7280", fontSize: 18 }}>???</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            {allRevealed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {card(
                  <>
                    <p style={{ color: "#7eff97", fontWeight: 800, marginBottom: 4 }}>His masterplan is in RUINS!</p>
                    <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 12 }}>Every lead was a dead end because YOU protected Adam &amp; Layla&apos;s information!</p>
                    <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Now it&apos;s time for the FINAL BATTLE...</p>
                    {btn("Defend the Vault! →", () => { addCoins(10); navigate(15); })}
                  </>,
                  { maxWidth: 480, margin: "0 auto" }
                )}
              </motion.div>
            )}
            </div>
          </ThemedScene>
        );
      }

      /* ──── STEP 15: VAULT BATTLE ──── */
      case 15: {
        if (showInstr[15]) return <InstructionOverlay icon="🏦" story="The Raccoon's FINAL ATTACK!" instructions="Block PRIVATE info, let SAFE info through!" onReady={() => dismissInstr(15)} />;
        if (vaultDone) {
          const won = vaultHP > 0;
          return (
            <ThemedScene theme="vault">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center" }}>
              {card(
                <>
                  {won ? (
                    <>
                      <motion.div animate={{ boxShadow: ["0 0 20px rgba(245,158,11,0.3)", "0 0 40px rgba(245,158,11,0.6)", "0 0 20px rgba(245,158,11,0.3)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏦</motion.div>
                      <h2 style={{ color: "#f59e0b", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>THE VAULT HELD!</h2>
                      <p style={{ color: "#d1d5db", marginBottom: 4 }}>You blocked {vaultScore}/{VAULT_ATTACKS.length} attacks!</p>
                      <div style={{ display: "inline-block", padding: "10px 10px 4px", margin: "12px auto", borderRadius: 18, border: "2px solid rgba(245,158,11,0.5)", background: "rgba(0,0,0,0.2)", overflow: "visible" }}>
                        <img src="/characters/celebrating.png" alt="Adam and Layla safe" style={{ width: 140, display: "block", objectFit: "contain" }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 style={{ color: "#f59e0b", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>The vault cracked...</h2>
                      <p style={{ color: "#d1d5db", marginBottom: 16 }}>But Adam &amp; Layla fought back! You&apos;ll do even better next time!</p>
                    </>
                  )}
                  {btn("Continue →", () => { addCoins(won ? 20 : 10); navigate(16); })}
                </>,
                { maxWidth: 480, margin: "0 auto" }
              )}
            </motion.div>
            </ThemedScene>
          );
        }
        return (
          <ThemedScene theme="vault">
            <BattleArena
              bossName="Hacker Raccoon"
              bossImage="/characters/raccoon.png"
              questions={VAULT_ATTACKS.map((va, i) => ({
                question: `The Raccoon is stealing: ${va.data}!`,
                options: ["🛡️ BLOCK IT!", "✅ Let it through"],
                correctIndex: va.block ? 0 : 1,
                attackName: i % 3 === 0 ? "Data Harvest!" : i % 3 === 1 ? "Privacy Breach!" : "Info Leak!",
              }))}
              onComplete={(sc) => {
                setVaultScore(sc);
                setVaultDone(true);
              }}
            />
          </ThemedScene>
        );
      }

      /* ──── STEP 16: VICTORY ──── */
      case 16:
        return (
          <ThemedScene theme="ceremony">
            <div style={{ textAlign: "center" }}>
            {/* Gold particle background */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
              {Array.from({ length: 30 }, (_, i) => (
                <motion.div key={i}
                  animate={{ y: [600, -20], opacity: [0, 1, 0] }}
                  transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
                  style={{ position: "absolute", left: `${Math.random() * 100}%`, bottom: 0, width: 4, height: 4, borderRadius: "50%", background: "#f59e0b" }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              style={{ position: "relative", zIndex: 1 }}>
              {card(
                <>
                  <p style={{ color: "#f59e0b", fontWeight: 900, fontSize: 12, letterSpacing: "0.15em", marginBottom: 8 }}>MISSION COMPLETE, CLASSIFIED</p>
                  <p style={{ color: "#d1d5db", marginBottom: 12 }}>Agent Status:</p>
                  {/* Badge */}
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 150, damping: 12 }}
                    style={{ width: 120, height: 120, margin: "0 auto 16px", borderRadius: "50%", background: "linear-gradient(135deg, #3a7bff, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#0f1530", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 32 }}>🔒</span>
                      <span style={{ color: "#f59e0b", fontWeight: 900, fontSize: 8, letterSpacing: "0.1em" }}>INFORMATION AGENT</span>
                    </div>
                  </motion.div>
                  <h2 data-split style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 16 }}>Information Agent Certified!</h2>
                  <SpeechBubble character="adam" message="WE DID IT! The vault is safe!" />
                  <SpeechBubble character="layla" message="The Raccoon's plan is totally destroyed. We're Information Agents now!" />
                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[
                      { label: "Vault Attacks Blocked", val: `${vaultScore}/10` },
                      { label: "Profile Dangers Found", val: `${foundDangers.size}/7` },
                      { label: "Speed Sort Accuracy", val: `${speedScore}/15` },
                      { label: "Total Coins", val: `${coins + 10}` },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                        style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 12 }}>
                        <p style={{ color: "#9ca3af", fontSize: 11 }}>{s.label}</p>
                        <p style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{s.val}</p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ display: "inline-block", padding: "12px 12px 6px", margin: "0 auto 16px", borderRadius: 20, border: "3px solid #f59e0b", boxShadow: "0 0 30px rgba(245,158,11,0.3)", background: "rgba(0,0,0,0.2)", overflow: "visible" }}>
                    <img src="/characters/celebrating.png" alt="Adam and Layla celebrating" style={{ width: 140, display: "block", objectFit: "contain" }} />
                  </motion.div>
                  <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
                    You&apos;ve completed Mission 2! Adam and Layla&apos;s personal information is SAFE. The Raccoon&apos;s masterplan is destroyed!
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    {IS_MILESTONE_WEEK && (
                      <a
                        href={getCertificateUrl(childName, CURRENT_WEEK)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          background: "linear-gradient(135deg, #f97316, #f59e0b)",
                          color: "#fff",
                          fontWeight: 900,
                          borderRadius: 100,
                          padding: "13px 28px",
                          textDecoration: "none",
                          fontSize: 15,
                          boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
                        }}
                      >
                        Download My Certificate ↓
                      </a>
                    )}
                    <a href="/dashboard" style={{ display: "inline-block", background: GRAD, color: "#fff", fontWeight: 900, borderRadius: 16, padding: "13px 34px", textDecoration: "none", fontSize: 16, boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}>
                      Back to Dashboard 🚀
                    </a>
                  </div>
                </>,
                { maxWidth: 520, margin: "0 auto", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(245,158,11,0.3)" }
              )}
            </motion.div>
            </div>
          </ThemedScene>
        );

      default:
        return null;
    }
  };

  /* ───────── RENDER ───────── */
  return (
    <div style={{ minHeight: "100vh", background: "#05061a", position: "relative", overflow: "hidden" }}>
      {/* 3D arena backdrop — behind everything. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <LessonArena3D
          width={windowDim.w}
          height={windowDim.h}
          mood={arena3DMood}
          pulseKey={arena3DPulseKey}
        />
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } } .shimmer-card { background-image: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.05) 25%, rgba(16,185,129,0.05) 50%, rgba(59,130,246,0.08) 75%, rgba(139,92,246,0.05) 100%); background-size: 200% 200%; animation: shimmer 3s ease infinite; }`}</style>
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
            weekNumber={2}
            weekTitle="Privacy Guardian"
            currentScreen={step}
            totalScreens={18}
            xpEarned={lessonXp}
          />

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
            color: "#ffb347",
            letterSpacing: "-0.01em",
            textShadow: "0 0 14px rgba(250,204,21,0.8), 2px 2px 0 rgba(0,0,0,0.6)",
            pointerEvents: "none",
            animation: "w2ComboPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {lessonCombo}× COMBO!
        </div>
      )}

      {/* Particle bursts */}
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
        @keyframes w2ComboPop {
          0% { opacity: 0; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <FloatingBg />
      <header className="print-hide" style={{
        position: "sticky", top: 0, zIndex: 40, padding: "12px 20px",
        background: "rgba(26,16,51,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/dashboard" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 600, minHeight: 48, display: "flex", alignItems: "center", borderRadius: 12, padding: "4px 12px" }}>
          ← Dashboard
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(59,130,246,0.4)" }}>
            <span style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>AX</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 13, fontWeight: 600 }}>Week 2 · Private Info: Guard Your Secrets</span>
        </div>
        <CoinCounter coins={coins} />
      </header>
      <ProgressBar step={step} />
      <StepDots step={step} />
      <main style={{ maxWidth: 850, margin: "0 auto", padding: "16px 24px 80px", position: "relative", zIndex: 1 }}>
        <ScreenTransition
          transitionKey={step}
          type={stepTransitionType(step, navDirectionRef.current)}
          duration={500}
          onTransitionStart={() => playSFX("transition")}
        >
          <ScreenShake trigger={shakeTrigger}>
            <ExerciseErrorBoundary
              key={step}
              onSkip={() => navigate(Math.min(16, step + 1))}
            >
              {renderScreen()}
            </ExerciseErrorBoundary>
          </ScreenShake>
        </ScreenTransition>
      </main>
    </div>
  );
}
