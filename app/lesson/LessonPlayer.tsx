"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

/* ───────────────────────── CONSTANTS ───────────────────────── */

const TOTAL = 17;
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

/* ───────────────────────── DATA ────────────────────────────── */

const PASSWORDS_8 = [
  { id: "q1", text: "Tr0phy$tar99", isStrong: true, bg: "rgba(96,165,250,0.1)", border: "#60a5fa", color: "#93c5fd" },
  { id: "q2", text: "MyD0g&Runs!", isStrong: true, bg: "rgba(167,139,250,0.1)", border: "#a78bfa", color: "#c4b5fd" },
  { id: "q3", text: "C@tLov3r2024", isStrong: true, bg: "rgba(244,114,182,0.1)", border: "#f472b6", color: "#f9a8d4" },
  { id: "q4", text: "Sup3r$h!eld7", isStrong: true, bg: "rgba(52,211,153,0.1)", border: "#34d399", color: "#6ee7b7" },
  { id: "q5", text: "password", isStrong: false, bg: "rgba(251,146,60,0.1)", border: "#fb923c", color: "#fdba74" },
  { id: "q6", text: "123456", isStrong: false, bg: "rgba(248,113,113,0.1)", border: "#f87171", color: "#fca5a5" },
  { id: "q7", text: "abcabc", isStrong: false, bg: "rgba(250,204,21,0.1)", border: "#facc15", color: "#fde047" },
  { id: "q8", text: "iloveyou", isStrong: false, bg: "rgba(192,132,252,0.1)", border: "#c084fc", color: "#d8b4fe" },
];

const SWIPE_DATA = [
  { pw: "password", isStrong: false, why: "This is the #1 most guessed password in the world!" },
  { pw: "Tr0phy$tar99", isStrong: true, why: "Capital letter, numbers, symbol — fortress! 💪" },
  { pw: "123456", isStrong: false, why: "Just counting up — a hacker cracks this in under a second!" },
  { pw: "MyD0g&Runs!", isStrong: true, why: "Easy to remember but almost impossible to guess! 💪" },
  { pw: "iloveyou", isStrong: false, why: "Too common — it's on every hacker's list!" },
  { pw: "Sup3r$h!eld7", isStrong: true, why: "Long, mixed, and super strong! 💪" },
];

const BUILDER_OPTIONS = [
  ["A", "B", "C", "D", "E", "F", "G", "H"],
  ["cat", "dog", "sun", "star", "moon", "fish", "bird", "hero"],
  ["1", "7", "3", "9", "42", "99", "007", "2024"],
  ["@", "#", "$", "!", "&", "*", "?", "%"],
];
const BUILDER_LABELS = ["Pick a CAPITAL LETTER", "Pick a SECRET WORD", "Pick a NUMBER", "Pick a SYMBOL"];
const BUILDER_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

const RECIPE = [
  { label: "CAPITAL LETTERS", example: "A, B, C — the big ones!", icon: "🅰️", color: "#3b82f6" },
  { label: "lowercase letters", example: "a, b, c — the small ones!", icon: "🔡", color: "#8b5cf6" },
  { label: "Numbers", example: "1, 2, 3!", icon: "🔢", color: "#ec4899" },
  { label: "Special Symbols", example: "@ # $ and !", icon: "✨", color: "#f59e0b" },
  { label: "Make it LONG", example: "At least 8 characters!", icon: "📏", color: "#10b981" },
];

const Q1_QUIZ = [
  { q: "What is a password?", opts: ["A type of computer game", "A secret code that only you know", "Your name", "A picture on your computer"], correct: 1, explain: "A password is YOUR secret code — like a key only you have!" },
  { q: "What happened to Adam and Layla?", opts: ["They won a real prize", "Their computer broke", "They got tricked and hacked by the Raccoon", "Nothing happened"], correct: 2, explain: "The Hacker Raccoon tricked them because they didn't know about password safety!" },
  { q: "A password is like a _____ for your digital stuff", opts: ["A picture", "A special key", "A game", "A song"], correct: 1, explain: "Just like a key locks your door, a password locks your digital stuff!" },
];

const Q2_QUIZ = [
  { q: "Why are passwords important?", opts: ["They make your computer look cool", "They keep your digital stuff safe", "Teachers say you need them", "They make the internet faster"], correct: 1, explain: "Passwords protect everything you care about online!" },
  { q: "What could happen WITHOUT a password on your games?", opts: ["You get more coins", "Nothing", "Someone could steal your progress", "Games get faster"], correct: 2, explain: "Without a password, anyone could take your coins and saved games!" },
  { q: "What happened when we added a password?", opts: ["The Raccoon got stronger", "Nothing changed", "The Raccoon bounced off and couldn't get in", "The computer broke"], correct: 2, explain: "The password stopped the Raccoon in its tracks!" },
];

const Q3_QUIZ = [
  { q: "Your best friend asks for your password. You should...", opts: ["Share it — they're your best friend!", "Politely say no — passwords are private", "Write it on a note for them", "Shout it out loud"], correct: 1, explain: "Even best friends should keep passwords private. It's YOUR secret code!" },
  { q: "Should you use the same password for everything?", opts: ["Yes, it's easier to remember", "Only for games", "No, use different passwords!", "It doesn't matter"], correct: 2, explain: "If someone cracks one password, they'd have ALL your passwords!" },
  { q: "Which should you NEVER use as a password?", opts: ["A mix of letters and numbers", "Your birthday", "A long made-up phrase", "Something with symbols"], correct: 1, explain: "Hackers check birthdays first — they're way too easy to guess!" },
  { q: "How long should a good password be?", opts: ["2 characters", "4 characters", "At least 8 characters!", "1 character"], correct: 2, explain: "The longer the password, the harder it is to crack!" },
  { q: "Something weird happens online. You should...", opts: ["Ignore it", "Tell all your friends", "Try to fix it yourself", "Tell a trusted grown-up"], correct: 3, explain: "A parent, teacher, or carer can always help keep you safe!" },
];

const PHISH = [
  { title: "🎉 YOU WON A FREE iPHONE!", text: "Click here and enter your password to claim your prize NOW!", isScam: true, explain: "Real prizes NEVER ask for your password! This is exactly how Adam and Layla got tricked! 🦝" },
  { title: "⚠️ URGENT: Your account has been hacked!", text: "Enter your password RIGHT NOW to fix it!", isScam: true, explain: "Real websites don't send scary pop-ups! They want to make you panic so you give away your code." },
  { title: "💬 Hi! Your friend Sam sent you a funny video 😂", text: "Click to watch!", isScam: false, explain: "This looks normal — no password needed! But always check with a grown-up if you're not sure." },
  { title: "🏫 Your school needs your password!", text: "Enter it in this form to update the system.", isScam: true, explain: "Your school would NEVER ask for your password in a message! Always ask your teacher in person." },
  { title: "🎮 FREE V-BUCKS! Get 10,000 V-Bucks FREE!", text: "Just enter your username and password to claim your free V-Bucks now! Limited time only!", isScam: true, explain: "Free V-Bucks don't exist! This is a scam to steal your gaming account. Only buy V-Bucks from the official store." },
  { title: "📚 Reminder from School", text: "Don't forget to bring your PE kit tomorrow! - Mrs Johnson", isScam: false, explain: "This looks like a normal school reminder. No password or personal information is being asked for." },
  { title: "🏆 CONGRATULATIONS! You are our 1,000,000th visitor!", text: "Click NOW to claim your prize! Enter your details before time runs out! ⏰", isScam: true, explain: "Websites can't tell which number visitor you are! This is one of the oldest tricks online. Never click these." },
];

const WYD = [
  { emoji: "🤝", situation: "Your friend says: 'Tell me your game password and I'll help you level up!'", opts: ["Share it — they're being helpful!", "Say 'No thanks, my password is private'", "Tell a grown-up"], correct: 1, why: "It's kind of them to offer, but your password should always stay private. You could play together instead!" },
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
  { icon: "🔒", title: "NEVER share your password", desc: "Not even with your best friend — it's YOUR secret code!", question: "Your friend asks for your password to help you. What do you say?", opts: ["Sure, here it is!", "Sorry, passwords are private!"], correct: 1 },
  { icon: "🔑", title: "Use DIFFERENT passwords", desc: "One for your games, one for your tablet, one for school!", question: "Should you use the same password everywhere?", opts: ["Yes, it's easier!", "No, use different ones!"], correct: 1 },
  { icon: "🔓", title: "NEVER use your real name or birthday", desc: "Hackers try names and birthdays first — they're too easy to guess!", question: "Which is safer to use in a password?", opts: ["Your birthday", "Random letters and symbols"], correct: 1 },
  { icon: "📏", title: "Make it at LEAST 8 characters long", desc: "The longer the password, the harder to crack!", question: "How long should a good password be?", opts: ["3 characters", "At least 8 characters!"], correct: 1 },
  { icon: "👨‍👩‍👧", title: "If something feels wrong, tell a grown-up", desc: "A parent, teacher, or carer — they're always there to help!", question: "Something weird happens online. What do you do?", opts: ["Ignore it", "Tell a trusted grown-up"], correct: 1 },
];

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
  { bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.3)", color: "#93c5fd" },
  { bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)", color: "#c4b5fd" },
  { bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.3)", color: "#f9a8d4" },
  { bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.3)", color: "#fde047" },
];

const BUBBLE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

const WHY_SCENARIOS = [
  { icon: "🎮", label: "Gaming", item: "Your saved games & trophies", problem: "The Raccoon stole all your coins and deleted your save files!", success: "Your games are safe behind a strong password!" },
  { icon: "👨‍👩‍👧", label: "Family Photos", item: "Your family photos & memories", problem: "The Raccoon deleted your family holiday photos!", success: "Your photos are locked and safe!" },
  { icon: "💬", label: "Messages", item: "Your private messages", problem: "The Raccoon read all your messages and sent mean ones!", success: "Your messages are private and protected!" },
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
@media print {
  body { background: white !important; }
  header, nav, .step-dots-wrap, .progress-wrap, .floating-orbs-wrap, .score-cards, .dash-link, .print-hide { display: none !important; }
  main { padding: 0 !important; }
  .certificate-card {
    border: 3px solid #8b5cf6 !important;
    background: white !important;
    color: black !important;
    box-shadow: none !important;
    max-width: 100% !important;
    backdrop-filter: none !important;
  }
  .certificate-card * { color: black !important; -webkit-text-fill-color: black !important; }
  .certificate-card .gradient-text { -webkit-text-fill-color: #8b5cf6 !important; color: #8b5cf6 !important; }
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
  const orbs = [
    { size: 80, left: "10%", top: "20%", delay: 0, color: "rgba(245,158,11,0.15)" },
    { size: 120, left: "80%", top: "10%", delay: 2, color: "rgba(139,92,246,0.12)" },
    { size: 60, left: "60%", top: "70%", delay: 4, color: "rgba(245,158,11,0.1)" },
    { size: 100, left: "25%", top: "80%", delay: 1, color: "rgba(139,92,246,0.1)" },
    { size: 50, left: "90%", top: "50%", delay: 3, color: "rgba(245,158,11,0.12)" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-15, 15, -15],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
            delay: o.delay,
          }}
          style={{
            position: "absolute",
            width: o.size,
            height: o.size,
            left: o.left,
            top: o.top,
            borderRadius: "50%",
            background: o.color,
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
        <span>Step {step + 1} of {TOTAL}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 999, background: GRAD }}
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
            background: i < step ? "#8b5cf6" : i === step ? "#f59e0b" : "rgba(255,255,255,0.15)",
            scale: i === step ? [1, 1.4, 1] : 1,
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
  const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#f97316"];
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
      animate={animKey > 0 ? { scale: [1, 1.4, 1] } : {}}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 12, padding: "4px 12px",
      }}
    >
      <span style={{ fontSize: 18 }}>🪙</span>
      <span style={{ color: "#f59e0b", fontWeight: 900, fontSize: 16 }}>{coins}</span>
    </motion.div>
  );
}

function MiniConfetti({ x, y }: { x: number; y: number }) {
  const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
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
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: GRAD, color: "#fff", fontWeight: 900, borderRadius: 16,
        padding: "13px 34px", border: "none", cursor: "pointer", fontSize: 16,
        boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
        minHeight: 48, ...extra,
      }}
    >
      {label}
    </motion.button>
  );
}

function card(children: React.ReactNode, extra?: React.CSSProperties): React.ReactElement {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 24, ...extra,
    }}>
      {children}
    </div>
  );
}

function strengthMeter(pct: number) {
  const c = pct < 40 ? "#ef4444" : pct < 80 ? "#f59e0b" : "#10b981";
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

  const handleTap = (i: number) => {
    if (selected !== null) return;
    if (i === correct) {
      setSelected(i);
      setPopped(true);
      setShowFeedback(true);
      setShowNext(true);
      playSound("/sounds/correct.mp3");
      setTimeout(() => playSound("/sounds/coin.mp3"), 500);
    } else {
      setWrongTapped((prev) => { const n = new Set(prev); n.add(i); return n; });
      playSound("/sounds/wrong.mp3");
      onWrong();
      setTimeout(() => setWrongTapped((prev) => { const n = new Set(prev); n.delete(i); return n; }), 600);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "#fff", fontSize: 20, margin: "0 0 24px" }}>{question}</h2>
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
              onClick={() => handleTap(i)}
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
                background: `rgba(${i === 0 ? "59,130,246" : i === 1 ? "139,92,246" : i === 2 ? "236,72,153" : "245,158,11"},0.15)`,
                border: `3px solid ${BUBBLE_COLORS[i]}`,
                color: BUBBLE_COLORS[i], fontWeight: 700, fontSize: 13,
                cursor: selected !== null ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: 8,
                boxShadow: `0 0 15px rgba(${i === 0 ? "59,130,246" : i === 1 ? "139,92,246" : i === 2 ? "236,72,153" : "245,158,11"},0.2)`,
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
            <p style={{ color: "#10b981", fontSize: 20, fontWeight: 700 }}>🎉 Correct!</p>
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
    "#ef4444", "#ef4444", "rgba(255,255,255,0.1)", "#10b981", "#10b981",
  ]);
  const bgColor = useTransform(x, [-100, -50, 0, 50, 100], [
    "rgba(239,68,68,0.05)", "rgba(239,68,68,0.05)", "rgba(255,255,255,0.04)", "rgba(16,185,129,0.05)", "rgba(16,185,129,0.05)",
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

/* ───────────────────────── MAIN COMPONENT ─────────────────── */

export default function LessonPlayer({ userName, moduleId, childName }: { userName: string; moduleId: string; childName: string }) {
  /* ---------- state ---------- */
  const [screen, setScreen] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinAnimKey, setCoinAnimKey] = useState(0);

  const addCoins = useCallback((n: number) => {
    setCoins((c) => c + n);
    setCoinAnimKey((k) => k + 1);
  }, []);

  const playSound = useCallback((src: string) => {
    try {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  // Screen 0 — Video welcome
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaMuted, setMediaMuted] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Screen 1 — Mission
  const [missionPhase, setMissionPhase] = useState(0);

  // Screen 2 — Lock game
  const [lockedItems, setLockedItems] = useState<Set<string>>(new Set());
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number } | null>(null);
  const [lockFlipping, setLockFlipping] = useState<string | null>(null);
  const [lockCelebration, setLockCelebration] = useState(false);
  const [miniConfettiPos, setMiniConfettiPos] = useState<{ x: number; y: number } | null>(null);

  // Screen 3 — Quiz 1 (bubble)
  const [q1Idx, setQ1Idx] = useState(0);
  const [q1Score, setQ1Score] = useState(0);

  // Screen 4 — Raccoon shield
  const [whyIdx, setWhyIdx] = useState(0);
  const [shieldPos, setShieldPos] = useState<{ x: number; y: number } | null>(null);
  const [shieldDragging, setShieldDragging] = useState(false);
  const [shieldPlaced, setShieldPlaced] = useState(false);
  const [raccoonHitShield, setRaccoonHitShield] = useState(false);
  const [raccoonReaching, setRaccoonReaching] = useState(false);
  const shieldOffset = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const raccoonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Screen 5 — Quiz 2 (bubble)
  const [q2Idx, setQ2Idx] = useState(0);
  const [q2Score, setQ2Score] = useState(0);

  // Screen 6 — Recipe
  const [addedIngredients, setAddedIngredients] = useState<Set<number>>(new Set());
  const [pouringIdx, setPouringIdx] = useState<number | null>(null);
  const [pourChars, setPourChars] = useState<{ char: string; x: number; delay: number }[]>([]);

  // Screen 7 — Builder
  const [builderSlots, setBuilderSlots] = useState<[number, number, number, number]>([-1, -1, -1, -1]);
  const [builderActive, setBuilderActive] = useState(0);
  const [builderPowerUp, setBuilderPowerUp] = useState(false);

  // Screen 8 — Swipe
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [swipeScore, setSwipeScore] = useState(0);
  const [swipeFeedback, setSwipeFeedback] = useState<"correct" | "wrong" | null>(null);
  const [swipeFlyDir, setSwipeFlyDir] = useState<"left" | "right" | null>(null);

  // Screen 9 — Drag & drop
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

  // Screen 10 — Rules (tap to reveal)
  const [revealedRules, setRevealedRules] = useState<Set<number>>(new Set());
  const [flippingRule, setFlippingRule] = useState<number | null>(null);
  const [answeredRules, setAnsweredRules] = useState<Set<number>>(new Set());
  const [ruleAnswers, setRuleAnswers] = useState<Record<number, number | null>>({});

  // Screen 11 — Quiz 3 (bubble)
  const [q3Idx, setQ3Idx] = useState(0);
  const [q3Score, setQ3Score] = useState(0);

  // Screen 12 — Phishing (tablet)
  const [phishIdx, setPhishIdx] = useState(0);
  const [phishAnswer, setPhishAnswer] = useState<boolean | null>(null);
  const [phishScore, setPhishScore] = useState(0);
  const [phishStamped, setPhishStamped] = useState(false);
  const [phishExiting, setPhishExiting] = useState(false);

  // Screen 13 — WWYD (comic bubbles)
  const [wydIdx, setWydIdx] = useState(0);
  const [wydSel, setWydSel] = useState<number | null>(null);
  const [wydScore, setWydScore] = useState(0);

  // Screen 14 — Boss
  const [bossIdx, setBossIdx] = useState(0);
  const [bossSel, setBossSel] = useState<number | null>(null);
  const [bossFeedback, setBossFeedback] = useState<boolean | null>(null);
  const [bossScore, setBossScore] = useState(0);
  const [raccoonHealth, setRaccoonHealth] = useState(100);
  const [bossDone, setBossDone] = useState(false);
  const [bossAttackPhase, setBossAttackPhase] = useState(false);
  const [arenaHits, setArenaHits] = useState(0);
  const [arenaRaccoonPos, setArenaRaccoonPos] = useState({ left: 50, top: 30 });
  const [arenaProjectiles, setArenaProjectiles] = useState<{ id: number; tx: number; ty: number; hit: boolean }[]>([]);
  const [arenaShowResult, setArenaShowResult] = useState(false);
  const [arenaRaccoonAnim, setArenaRaccoonAnim] = useState<"idle" | "hit" | "taunt" | "defeat">("idle");
  const [arenaTimeLeft, setArenaTimeLeft] = useState(12);
  const arenaProjectileId = useRef(0);
  const arenaLastShot = useRef(0);
  const arenaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const arenaMoveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Screen 15 — Achievements
  const [achievePhase, setAchievePhase] = useState(0);

  // Screen 16 — Certificate
  const progressPosted = useRef(false);
  const [showConfetti, setShowConfetti] = useState(false);

  /* ---------- navigation ---------- */
  const navigate = useCallback((to: number) => {
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
        setPhishIdx(0); setPhishAnswer(null); setPhishScore(0); setPhishStamped(false); setPhishExiting(false);
        break;
      case 13:
        setWydIdx(0); setWydSel(null); setWydScore(0);
        break;
      case 14:
        setBossIdx(0); setBossSel(null); setBossFeedback(null);
        setBossScore(0); setRaccoonHealth(100); setBossDone(false);
        setBossAttackPhase(false); setArenaHits(0);
        setArenaRaccoonPos({ left: 50, top: 30 }); setArenaProjectiles([]);
        setArenaShowResult(false); setArenaRaccoonAnim("idle"); setArenaTimeLeft(12);
        break;
      case 15:
        setAchievePhase(0);
        break;
      case 16:
        setShowConfetti(true);
        break;
    }
    setScreen(to);
  }, []);

  /* ---------- effects ---------- */

  // Screen 0: auto-play video & show skip after 10s
  useEffect(() => {
    if (screen !== 0) return;
    const v = videoRef.current;
    if (v) {
      v.play().then(() => setIsPlaying(true)).catch(() => { /* blocked */ });
    }
    const t = setTimeout(() => setShowSkip(true), 10000);
    return () => clearTimeout(t);
  }, [screen]);

  // Screen 1: mission phases with bounce timing
  useEffect(() => {
    if (screen !== 1) return;
    if (missionPhase >= 3) return;
    const t = setTimeout(() => setMissionPhase((p) => p + 1), 600);
    return () => clearTimeout(t);
  }, [screen, missionPhase]);

  // Screen 4: raccoon timer — reset when scenario changes
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

  // Screen 4: raccoon reaching — reset
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
        playSound("/sounds/correct.mp3");
        addCoins(10);
        setTimeout(() => playSound("/sounds/coin.mp3"), 500);
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
        playSound("/sounds/correct.mp3");
      } else if (sRect && cx >= sRect.left && cx <= sRect.right && cy >= sRect.top && cy <= sRect.bottom ||
                 wRect && cx >= wRect.left && cx <= wRect.right && cy >= wRect.top && cy <= wRect.bottom) {
        playSound("/sounds/wrong.mp3");
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

  // Screen 15: staggered achievements
  useEffect(() => {
    if (screen !== 15) return;
    if (achievePhase >= 8) return;
    const t = setTimeout(() => setAchievePhase((p) => p + 1), 500);
    return () => clearTimeout(t);
  }, [screen, achievePhase]);

  // Screen 16: post progress
  useEffect(() => {
    if (screen !== 16 || progressPosted.current) return;
    progressPosted.current = true;
    playSound("/sounds/coin.mp3");
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    }).catch(() => { /* ignore */ });
  }, [screen, moduleId, playSound]);

  /* ---------- arena boss battle handler ---------- */
  const randomRaccoonPos = useCallback(() => ({
    left: 15 + Math.random() * 70,
    top: 10 + Math.random() * 45,
  }), []);

  const getArenaDamage = (hits: number) => {
    if (hits >= 9) return 18;
    if (hits >= 6) return 14;
    if (hits >= 3) return 10;
    return 6;
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
      playSound("/sounds/correct.mp3");
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
          <div style={{ textAlign: "center" }}>
            {!videoEnded ? (
              <>
                {!videoFailed ? (
                  <motion.div
                    animate={{ boxShadow: ["0 0 20px rgba(139,92,246,0.3)", "0 0 40px rgba(139,92,246,0.6)", "0 0 20px rgba(139,92,246,0.3)"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "2px solid rgba(139,92,246,0.4)", maxWidth: 640, margin: "0 auto" }}
                  >
                    <video
                      ref={videoRef}
                      src="/videos/01-welcome.mp4"
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
                        style={{ flex: 1, accentColor: "#8b5cf6", height: 6 }}
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
                      style={{ width: 200, borderRadius: 24 }}
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
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {card(
                  <>
                    <img src="/characters/adam-layla-hacked.png" alt="Adam and Layla hacked" style={{ width: 100, borderRadius: 16, margin: "0 auto 12px", display: "block" }} />
                    <h2 style={{ color: "#fff", fontSize: 22, margin: "0 0 8px" }}>Oh no! Adam and Layla got hacked by the Raccoon! 🦝</h2>
                    <p style={{ color: "#d1d5db", marginBottom: 16 }}>They need YOUR help to learn about password safety!</p>
                    {btn("I'll help them! Let's go! 🚀", () => navigate(1))}
                  </>
                )}
              </motion.div>
            )}
          </div>
        );

      /* ──── CASE 1: THE MISSION ──── */
      case 1: {
        const missions = [
          { icon: "🔐", text: "Learn what passwords are" },
          { icon: "🛡️", text: "Build a super strong password" },
          { icon: "🦝", text: "Defeat the Hacker Raccoon" },
        ];
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{
              fontSize: 36, fontWeight: 900, background: GRAD, WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", marginBottom: 24,
            }}>YOUR MISSION</h1>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500, margin: "0 auto 24px" }}
            >
              {missions.map((m, i) => (
                missionPhase > i ? (
                  <motion.div key={i} variants={staggerItem}>
                    {card(
                      <div style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
                        <span style={{ fontSize: 32 }}>{m.icon}</span>
                        <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{m.text}</span>
                      </div>,
                      { borderLeft: "4px solid #8b5cf6" }
                    )}
                  </motion.div>
                ) : <div key={i} style={{ height: 80 }} />
              ))}
            </motion.div>
            <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)" }}>
              <motion.img
                src="/characters/adam-layla-happy.png"
                alt="Adam and Layla"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 120 }}
              />
            </div>
            {missionPhase >= 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                {btn("Accept Mission →", () => navigate(2))}
              </motion.div>
            )}
          </div>
        );
      }

      /* ──── CASE 2: INTERACTIVE LOCK GAME ──── */
      case 2:
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>What is a Password?</h1>
            <p style={{ color: "#9ca3af", marginBottom: 8 }}>Tap each item to lock it with a password!</p>
            <p style={{ color: "#f59e0b", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🔒 {lockedItems.size}/3</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              {LOCK_ITEMS.map((item) => {
                const locked = lockedItems.has(item.id);
                const flipping = lockFlipping === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={!locked && !flipping ? { scale: 1.05 } : {}}
                    whileTap={!locked && !flipping ? { scale: 0.95 } : {}}
                    onClick={(e) => {
                      if (locked || flipping) return;
                      setLockFlipping(item.id);
                      playSound("/sounds/lock.mp3");
                      setTimeout(() => {
                        setLockedItems((prev) => {
                          const n = new Set(prev);
                          n.add(item.id);
                          if (n.size === 3) {
                            setTimeout(() => {
                              setLockCelebration(true);
                              setMiniConfettiPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                              addCoins(25);
                              playSound("/sounds/coin.mp3");
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
                    {card(
                      <div style={{
                        textAlign: "center", cursor: locked ? "default" : "pointer", minWidth: 140,
                      }}>
                        <motion.div
                          animate={flipping ? { rotateY: [0, 90, 0] } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          <div style={{ fontSize: 48, marginBottom: 8 }}>{item.icon}</div>
                          <div style={{ fontSize: 16, color: "#fff", fontWeight: 700, marginBottom: 8 }}>{item.label}</div>
                          <motion.div
                            animate={flipping ? { rotate: 360 } : {}}
                            transition={{ duration: 0.6 }}
                            style={{ fontSize: 32 }}
                          >
                            {locked ? "🔒" : "🔓"}
                          </motion.div>
                        </motion.div>
                        {!locked && !flipping && (
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            style={{ fontSize: 24, marginTop: 4 }}
                          >
                            👆
                          </motion.div>
                        )}
                        {locked && (
                          <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ color: "#10b981", fontSize: 13, marginTop: 8 }}
                          >
                            {item.message}
                          </motion.p>
                        )}
                      </div>,
                      { border: `2px solid ${locked ? "#10b981" : "#ef4444"}`, transition: "border-color 0.3s ease" }
                    )}
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
                  {card(
                    <>
                      <h2 style={{ color: "#10b981", fontSize: 22, margin: "0 0 8px" }}>🎉 All Locked!</h2>
                      <p style={{ color: "#d1d5db", marginBottom: 12 }}>A password is like a key that locks your digital stuff so only YOU can open it!</p>
                      <div style={{ border: "2px solid #f59e0b", borderRadius: 16, padding: 12, marginBottom: 16, background: "rgba(245,158,11,0.05)" }}>
                        <p style={{ color: "#f59e0b", fontSize: 14, margin: 0 }}>🌟 Fun Fact: The first computer password was created in 1961!</p>
                      </div>
                      {btn("Got it! Quiz time! →", () => navigate(3))}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      /* ──── CASE 3: QUIZ 1 (FLOATING BUBBLES) ──── */
      case 3: {
        if (q1Idx >= Q1_QUIZ.length) {
          const s = q1Score === 3 ? 3 : q1Score >= 2 ? 2 : 1;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Quiz Complete!</h2>
                  {stars(s)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>You got {q1Score}/{Q1_QUIZ.length} correct!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{q1Score * 10} coins earned!</p>
                  {btn("Next lesson! →", () => navigate(4))}
                </>
              )}
            </motion.div>
          );
        }
        const qq = Q1_QUIZ[q1Idx];
        return (
          <motion.div
            key={`q1-${q1Idx}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 4, textAlign: "center" }}>Quick Quiz!<img src="/characters/adam-layla-happy.png" width={40} height={40} alt="" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 8, borderRadius: 999 }} /></h1>
            <p style={{ color: "#9ca3af", marginBottom: 12, textAlign: "center" }}>Question {q1Idx + 1}/{Q1_QUIZ.length}</p>
            <FloatingBubbleQuiz
              question={qq.q}
              opts={qq.opts}
              correct={qq.correct}
              explain={qq.explain}
              playSound={playSound}
              onCorrect={() => {
                setQ1Score((s) => s + 1);
                addCoins(10);
                setTimeout(() => setQ1Idx((i) => i + 1), 0);
              }}
              onWrong={() => {}}
            />
          </motion.div>
        );
      }

      /* ──── CASE 4: RACCOON SHIELD SIMULATOR ──── */
      case 4: {
        if (whyIdx >= WHY_SCENARIOS.length) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Passwords protect EVERYTHING! 🛡️</h2>
                  <p style={{ color: "#d1d5db", marginBottom: 16 }}>Now you know why every digital thing needs a password.</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +30 coins earned!</p>
                  {btn("Quiz time! →", () => navigate(5))}
                </>
              )}
            </motion.div>
          );
        }
        const sc = WHY_SCENARIOS[whyIdx];
        const raccoonSpeed = [3, 2.5, 2][whyIdx] || 2;
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Why Do Passwords Matter?</h1>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>Scenario {whyIdx + 1}/3: {sc.label} {sc.icon}</p>
            {card(
              <div style={{ position: "relative", minHeight: 200, overflow: "hidden" }}>
                {/* Item on the left */}
                <motion.div
                  ref={itemRef}
                  animate={shieldPlaced ? {
                    boxShadow: ["0 0 10px rgba(16,185,129,0.3)", "0 0 25px rgba(16,185,129,0.6)", "0 0 10px rgba(16,185,129,0.3)"],
                  } : {}}
                  transition={shieldPlaced ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
                  style={{
                    position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                    textAlign: "center",
                    border: shieldPlaced ? "3px solid #10b981" : "2px solid rgba(255,255,255,0.2)",
                    borderRadius: 16, padding: 16, background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: 48 }}>{sc.icon}</span>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: "4px 0 0" }}>{sc.item}</p>
                  {shieldPlaced && (
                    <motion.span
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      style={{ fontSize: 28, display: "inline-block" }}
                    >
                      🛡️
                    </motion.span>
                  )}
                </motion.div>

                {/* Raccoon on the right, approaching */}
                {!raccoonHitShield && !shieldPlaced && (
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "calc(-100% - 60px)" }}
                    transition={{ duration: raccoonSpeed, ease: "linear" }}
                    style={{
                      position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
                    }}
                  >
                    <motion.img
                      src="/characters/raccoon.png"
                      alt="Raccoon"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{ width: 60 }}
                    />
                  </motion.div>
                )}

                {/* Raccoon bouncing back */}
                {raccoonHitShield && (
                  <motion.div
                    initial={{ x: 0, rotate: 0, scaleX: 1, opacity: 1 }}
                    animate={{ x: 300, rotate: 30, scaleX: 1, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      position: "absolute", left: 150, top: "50%", transform: "translateY(-50%)",
                    }}
                  >
                    <img src="/characters/raccoon.png" alt="Raccoon" style={{ width: 60 }} />
                  </motion.div>
                )}

                {/* Reaching warning */}
                {raccoonReaching && !shieldPlaced && (
                  <motion.div
                    animate={shakeAnimation}
                    style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)" }}
                  >
                    <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>Quick! Drag the shield! 🛡️</p>
                  </motion.div>
                )}
              </div>,
              { border: `2px solid ${shieldPlaced ? "#10b981" : "#ef4444"}`, padding: 16, marginBottom: 16 }
            )}

            {/* Next scenario button after raccoon bounces */}
            {raccoonHitShield && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", marginTop: 12 }}
              >
                <p style={{ color: "#10b981", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Protected! The Raccoon bounced off!</p>
                {btn(whyIdx < WHY_SCENARIOS.length - 1 ? "Next Scenario →" : "All done! →", () => {
                  if (whyIdx < WHY_SCENARIOS.length - 1) {
                    setWhyIdx((i) => i + 1);
                    setShieldPos(null); setShieldPlaced(false); setRaccoonHitShield(false);
                  } else {
                    setWhyIdx(WHY_SCENARIOS.length);
                  }
                })}
              </motion.div>
            )}

            {/* Draggable shield */}
            {!shieldPlaced && !raccoonHitShield && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 8 }}>Drag the shield to protect it!</p>
                <motion.div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setShieldDragging(true);
                    const rect = e.currentTarget.getBoundingClientRect();
                    shieldOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                    setShieldPos({ x: rect.left, y: rect.top });
                  }}
                  animate={{
                    boxShadow: ["0 0 15px rgba(16,185,129,0.4)", "0 0 30px rgba(16,185,129,0.8)", "0 0 15px rgba(16,185,129,0.4)"],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.1 }}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(16,185,129,0.15)", border: "3px solid #10b981",
                    cursor: "grab", touchAction: "none", userSelect: "none", fontSize: 32,
                  }}
                >
                  🛡️
                </motion.div>
              </div>
            )}
          </div>
        );
      }

      /* ──── CASE 5: QUIZ 2 (FLOATING BUBBLES) ──── */
      case 5: {
        if (q2Idx >= Q2_QUIZ.length) {
          const s = q2Score === 3 ? 3 : q2Score >= 2 ? 2 : 1;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Quiz Complete!</h2>
                  {stars(s)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>You got {q2Score}/{Q2_QUIZ.length} correct!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{q2Score * 10} coins earned!</p>
                  {btn("Next lesson! →", () => navigate(6))}
                </>
              )}
            </motion.div>
          );
        }
        const qq = Q2_QUIZ[q2Idx];
        return (
          <motion.div
            key={`q2-${q2Idx}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 4, textAlign: "center" }}>Quick Quiz!<img src="/characters/adam-layla-happy.png" width={40} height={40} alt="" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 8, borderRadius: 999 }} /></h1>
            <p style={{ color: "#9ca3af", marginBottom: 12, textAlign: "center" }}>Question {q2Idx + 1}/{Q2_QUIZ.length}</p>
            <FloatingBubbleQuiz
              question={qq.q}
              opts={qq.opts}
              correct={qq.correct}
              explain={qq.explain}
              playSound={playSound}
              onCorrect={() => {
                setQ2Score((s) => s + 1);
                addCoins(10);
                setTimeout(() => setQ2Idx((i) => i + 1), 0);
              }}
              onWrong={() => {}}
            />
          </motion.div>
        );
      }

      /* ──── CASE 6: PASSWORD RECIPE (POURING) ──── */
      case 6:
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>The Password Recipe!</h1>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>Tap each bottle to pour it into the mix!</p>

            {/* Bottles in arc */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 16 }}>
              {RECIPE.map((r, i) => {
                const added = addedIngredients.has(i);
                const pouring = pouringIdx === i;
                return (
                  <motion.button
                    key={i}
                    onClick={() => {
                      if (added || pouringIdx !== null) return;
                      setPouringIdx(i);
                      playSound("/sounds/pour.mp3");
                      const chars = RECIPE_CHARS[i] || ["?"];
                      const newChars = chars.map((c, ci) => ({
                        char: c, x: (Math.random() - 0.5) * 30, delay: ci * 50,
                      }));
                      setPourChars(newChars);
                      setTimeout(() => {
                        setAddedIngredients((prev) => { const n = new Set(prev); n.add(i); return n; });
                        setPouringIdx(null);
                        setPourChars([]);
                        if (addedIngredients.size === 4) {
                          addCoins(25);
                          playSound("/sounds/coin.mp3");
                        }
                      }, 1200);
                    }}
                    animate={pouring ? { rotate: -45 } : { rotate: 0 }}
                    whileHover={!added && pouringIdx === null ? { scale: 1.05 } : {}}
                    whileTap={!added && pouringIdx === null ? { scale: 0.95 } : {}}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: added ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${added ? "#10b981" : r.color}`,
                      borderRadius: 16, padding: 16, cursor: added || pouringIdx !== null ? "default" : "pointer",
                      opacity: added ? 0.5 : 1, minWidth: 120, minHeight: 48,
                      transformOrigin: "bottom center",
                    }}
                  >
                    <div style={{ fontSize: 28 }}>{r.icon}</div>
                    <div style={{ color: r.color, fontWeight: 700, fontSize: 13 }}>{r.label}</div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>{r.example}</div>
                    {added && <div style={{ color: "#10b981", fontSize: 12, marginTop: 4 }}>✓ Poured!</div>}
                  </motion.button>
                );
              })}
            </div>

            {/* Pouring characters */}
            {pouringIdx !== null && (
              <div style={{ position: "relative", height: 60, margin: "0 auto", maxWidth: 200 }}>
                {pourChars.map((c, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: 50, opacity: 0.6 }}
                    transition={{ duration: 0.8, ease: "easeIn", delay: c.delay / 1000 }}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${c.x}px)`,
                      top: 0,
                      color: RECIPE[pouringIdx]?.color || "#fff",
                      fontWeight: 900, fontSize: 18, fontFamily: "monospace",
                    }}
                  >
                    {c.char}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Bowl */}
            <motion.div
              animate={addedIngredients.size === 5 ? {
                boxShadow: [
                  "0 0 20px rgba(139,92,246,0.5)",
                  "0 0 25px rgba(59,130,246,0.5)",
                  "0 0 30px rgba(236,72,153,0.5)",
                  "0 0 25px rgba(245,158,11,0.5)",
                  "0 0 20px rgba(16,185,129,0.5)",
                ],
              } : {}}
              transition={addedIngredients.size === 5 ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
              style={{
                width: 220, height: 140, margin: "0 auto 16px", borderRadius: "0 0 50% 50%",
                background: `linear-gradient(135deg, rgba(139,92,246,${0.15 + addedIngredients.size * 0.07}), rgba(59,130,246,${0.15 + addedIngredients.size * 0.07}))`,
                border: "3px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 36, transition: "all 0.5s ease",
              }}
            >
              {addedIngredients.size === 5 ? "🌟" : "🔑"}
            </motion.div>
            {strengthMeter((addedIngredients.size / 5) * 100)}
            <AnimatePresence>
              {addedIngredients.size === 5 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <p style={{ color: "#10b981", fontSize: 22, fontWeight: 700 }}>SUPER STRONG! 🔥</p>
                  {btn("Build a password! →", () => navigate(7))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      /* ──── CASE 7: PASSWORD BUILDER ──── */
      case 7: {
        const builtPw = builderSlots.map((s: number, i: number) => s >= 0 ? BUILDER_OPTIONS[i][s] : "").join("");
        const filledCount = builderSlots.filter((s: number) => s >= 0).length;
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Build Your Password!</h1>
            {/* Display */}
            <motion.div
              animate={builderPowerUp ? {
                scale: [1, 1.08, 1],
                boxShadow: ["0 0 0 rgba(245,158,11,0)", "0 0 30px rgba(245,158,11,0.6)", "0 0 15px rgba(245,158,11,0.3)"],
              } : {}}
              transition={{ duration: 1 }}
              style={{
                background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: "12px 20px", margin: "0 auto 16px",
                maxWidth: 400, fontFamily: "monospace", fontSize: 24, color: "#f59e0b", fontWeight: 900,
                letterSpacing: 3, minHeight: 48, border: "2px solid rgba(139,92,246,0.3)",
              }}
            >
              {builtPw || "••••••••"}
            </motion.div>
            {strengthMeter((filledCount / 4) * 100)}
            {builderActive < 4 ? (
              <motion.div
                key={`builder-${builderActive}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p style={{ color: BUILDER_COLORS[builderActive], fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  {BUILDER_LABELS[builderActive]}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {BUILDER_OPTIONS[builderActive].map((opt: string, i: number) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        const newSlots: [number, number, number, number] = [...builderSlots];
                        newSlots[builderActive] = i;
                        setBuilderSlots(newSlots);
                        playSound("/sounds/correct.mp3");
                        if (builderActive === 3) {
                          addCoins(25);
                          setTimeout(() => { setBuilderPowerUp(true); playSound("/sounds/coin.mp3"); }, 100);
                        }
                        setBuilderActive((a) => a + 1);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: "rgba(255,255,255,0.04)", border: `2px solid ${BUILDER_COLORS[builderActive]}`,
                        borderRadius: 12, padding: "12px 18px", color: BUILDER_COLORS[builderActive],
                        fontSize: 18, fontWeight: 700, cursor: "pointer", minWidth: 48, minHeight: 48,
                      }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <p style={{ color: "#10b981", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>🎉 Password built!</p>
                <p style={{ color: "#d1d5db", marginBottom: 16 }}>Your password: <strong style={{ color: "#f59e0b" }}>{builtPw}</strong></p>
                {btn("Now spot the good ones! →", () => navigate(8))}
              </motion.div>
            )}
          </div>
        );
      }

      /* ──── CASE 8: GOOD VS BAD SWIPE ──── */
      case 8: {
        if (swipeIdx >= SWIPE_DATA.length) {
          const s = swipeScore >= 5 ? 3 : swipeScore >= 3 ? 2 : 1;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Round Complete!</h2>
                  {stars(s)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>{swipeScore}/{SWIPE_DATA.length} correct!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{swipeScore * 10} coins earned!</p>
                  {btn("Now sort them all! →", () => navigate(9))}
                </>
              )}
            </motion.div>
          );
        }
        const sw = SWIPE_DATA[swipeIdx];

        const handleSwipeEnd = (isStrong: boolean) => {
          const correct = isStrong === sw.isStrong;
          if (correct) {
            setSwipeFlyDir(isStrong ? "right" : "left");
            setSwipeFeedback("correct");
            setSwipeScore((s) => s + 1);
            addCoins(10);
            playSound("/sounds/correct.mp3");
            setTimeout(() => playSound("/sounds/coin.mp3"), 500);
          } else {
            setSwipeFeedback("wrong");
            playSound("/sounds/wrong.mp3");
          }
        };

        const advanceSwipe = () => {
          setSwipeFlyDir(null);
          setSwipeFeedback(null);
          setSwipeIdx((i) => i + 1);
        };

        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Good or Bad?</h1>
            <p style={{ color: "#9ca3af", marginBottom: 8 }}>{swipeIdx + 1}/{SWIPE_DATA.length} — Swipe or tap!</p>

            {/* Weak/Strong indicators */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px", marginBottom: 12 }}>
              <span style={{ color: "#ef4444", fontSize: 24, fontWeight: 900, opacity: swipeFeedback === "wrong" || swipeFlyDir === "left" ? 1 : 0, transition: "opacity 0.1s" }}>WEAK</span>
              <span style={{ color: "#10b981", fontSize: 24, fontWeight: 900, opacity: swipeFlyDir === "right" ? 1 : 0, transition: "opacity 0.1s" }}>STRONG</span>
            </div>

            {/* Swipeable card */}
            <AnimatePresence mode="wait">
              {!swipeFlyDir && (
                <SwipeCard
                  key={`swipe-${swipeIdx}`}
                  pw={sw.pw}
                  onSwipeEnd={handleSwipeEnd}
                />
              )}
            </AnimatePresence>

            {swipeFlyDir && (
              <motion.div
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity: 0, x: swipeFlyDir === "left" ? -500 : 500, rotate: swipeFlyDir === "left" ? -30 : 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {card(
                  <p style={{ color: "#f59e0b", fontFamily: "monospace", fontSize: 24, fontWeight: 900, margin: 0 }}>{sw.pw}</p>,
                  { maxWidth: 400, margin: "0 auto 24px" }
                )}
              </motion.div>
            )}

            {/* Fallback buttons */}
            {!swipeFlyDir && !swipeFeedback && (
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <motion.button
                  onClick={() => handleSwipeEnd(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(239,68,68,0.1)", border: "2px solid #ef4444", borderRadius: 16,
                    padding: "16px 28px", color: "#ef4444", fontSize: 18, fontWeight: 700, cursor: "pointer", minHeight: 60,
                  }}
                >
                  Weak 👎
                </motion.button>
                <motion.button
                  onClick={() => handleSwipeEnd(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", borderRadius: 16,
                    padding: "16px 28px", color: "#10b981", fontSize: 18, fontWeight: 700, cursor: "pointer", minHeight: 60,
                  }}
                >
                  Strong 💪
                </motion.button>
              </div>
            )}

            {swipeFeedback === "correct" && swipeFlyDir && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 8 }}
              >
                <p style={{ color: "#10b981", fontSize: 20, fontWeight: 700 }}>🎉 Correct!</p>
                <p style={{ color: "#e5e7eb", fontSize: 16, lineHeight: 1.5 }}>{sw.why}</p>
                <div style={{ marginTop: 12 }}>
                  {btn("Next Card →", advanceSwipe)}
                </div>
              </motion.div>
            )}
            {swipeFeedback === "wrong" && !swipeFlyDir && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 8 }}
              >
                <p style={{ color: "#ef4444", fontSize: 20, fontWeight: 700 }}>❌ Not quite!</p>
                <p style={{ color: "#e5e7eb", fontSize: 16, lineHeight: 1.5 }}>{sw.why}</p>
                <div style={{ marginTop: 12 }}>
                  {btn("Next Card →", () => { setSwipeFeedback(null); })}
                </div>
              </motion.div>
            )}
          </div>
        );
      }

      /* ──── CASE 9: DRAG & DROP SORT ──── */
      case 9: {
        if (dragDone) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Sorting Complete!</h2>
                  {stars(sortStars)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>{placed.size}/8 sorted correctly!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +25 coins earned!</p>
                  {btn("Learn the golden rules! →", () => navigate(10))}
                </>
              )}
            </motion.div>
          );
        }
        return (
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Sort the Passwords!</h1>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#9ca3af" }}>{placed.size}/8 sorted</span>
              <span style={{ color: dragTime <= 10 ? "#ef4444" : "#f59e0b", fontWeight: 700, fontSize: 18 }}>
                ⏱ {dragTime}s
              </span>
            </div>
            {/* Buckets */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24 }}>
              <motion.div
                ref={strongRef}
                animate={dragFlash === "strong" ? {
                  boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.5)", "0 0 0 rgba(16,185,129,0)"],
                } : {}}
                transition={{ duration: 0.5 }}
                style={{
                  flex: 1, maxWidth: 220, minHeight: 120, borderRadius: 20,
                  border: "3px dashed #10b981", background: "rgba(16,185,129,0.05)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12,
                }}
              >
                <span style={{ fontSize: 28 }}>💪</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>Strong</span>
                {PASSWORDS_8.filter((p) => p.isStrong && placed.has(p.id)).map((p) => (
                  <span key={p.id} style={{ color: p.color, fontSize: 11, fontFamily: "monospace" }}>{p.text}</span>
                ))}
              </motion.div>
              <motion.div
                ref={weakRef}
                animate={dragFlash === "weak" ? {
                  boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 20px rgba(16,185,129,0.5)", "0 0 0 rgba(16,185,129,0)"],
                } : {}}
                transition={{ duration: 0.5 }}
                style={{
                  flex: 1, maxWidth: 220, minHeight: 120, borderRadius: 20,
                  border: "3px dashed #ef4444", background: "rgba(239,68,68,0.05)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12,
                }}
              >
                <span style={{ fontSize: 28 }}>👎</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>Weak</span>
                {PASSWORDS_8.filter((p) => !p.isStrong && placed.has(p.id)).map((p) => (
                  <span key={p.id} style={{ color: p.color, fontSize: 11, fontFamily: "monospace" }}>{p.text}</span>
                ))}
              </motion.div>
            </div>
            {/* Cards */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {PASSWORDS_8.filter((p) => !placed.has(p.id)).map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: dragging === p.id ? 0.3 : 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (!dragStarted) setDragStarted(true);
                    const rect = e.currentTarget.getBoundingClientRect();
                    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                    setDragX(rect.left);
                    setDragY(rect.top);
                    setDragging(p.id);
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  style={{
                    background: p.bg, border: `2px solid ${p.border}`, borderRadius: 12, padding: "10px 16px",
                    color: p.color, fontFamily: "monospace", fontWeight: 700, fontSize: 14, cursor: "grab",
                    touchAction: "none", minHeight: 48, display: "flex", alignItems: "center",
                  }}
                >
                  {p.text}
                </motion.div>
              ))}
            </div>
          </div>
        );
      }

      /* ──── CASE 10: 5 GOLDEN RULES (TAP TO REVEAL) ──── */
      case 10:
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 16 }}>The 5 Golden Rules!</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 540, margin: "0 auto 24px" }}>
              {RULES.map((rule, i) => {
                const isRevealed = revealedRules.has(i);
                const isFlipping = flippingRule === i;
                const isDone = answeredRules.has(i);
                return (
                  <div key={i}>
                    <motion.div
                      style={{
                        borderRadius: 24, padding: 20, minHeight: 120,
                        background: !isRevealed
                          ? "linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)"
                          : "rgba(255,255,255,0.04)",
                        backdropFilter: isRevealed ? "blur(12px)" : undefined,
                        border: !isRevealed ? "2px solid rgba(245,158,11,0.5)"
                          : isDone ? "2px solid #f59e0b"
                          : "1px solid rgba(255,255,255,0.1)",
                        borderLeft: isRevealed ? (isDone ? "4px solid #f59e0b" : "4px solid rgba(245,158,11,0.3)") : undefined,
                        position: "relative", overflow: "hidden",
                        cursor: !isRevealed ? "pointer" : "default",
                      }}
                      animate={!isRevealed ? (isFlipping ? { rotateY: [0, 90, 0] } : { rotate: [0, -1.5, 0, 1.5, 0] }) : {}}
                      transition={!isRevealed ? (isFlipping ? { duration: 0.6 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }) : { duration: 0.3 }}
                      whileHover={!isRevealed ? { scale: 1.02 } : {}}
                      whileTap={!isRevealed ? { scale: 0.98 } : {}}
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: "#1a1033", position: "relative", zIndex: 1 }}>
                            Tap to reveal Rule {i + 1}! ✨
                          </span>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 28 }}>{rule.icon}</span>
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, flex: 1, textAlign: "left" }}>{rule.title}</span>
                            {isDone && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                style={{ color: "#f59e0b", fontSize: 22 }}
                              >✅</motion.span>
                            )}
                          </div>
                          {!isDone && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
                              <p style={{ color: "#d1d5db", fontSize: 14, textAlign: "left" }}>{rule.desc}</p>
                              <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{rule.question}</p>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {rule.opts.map((opt: string, oi: number) => (
                                  <motion.button key={oi}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRuleAnswers((prev) => ({ ...prev, [i]: oi }));
                                      if (oi === rule.correct) {
                                        setAnsweredRules((prev) => { const n = new Set(prev); n.add(i); return n; });
                                        playSound("/sounds/correct.mp3");
                                        addCoins(5);
                                        setTimeout(() => playSound("/sounds/coin.mp3"), 500);
                                      } else {
                                        playSound("/sounds/wrong.mp3");
                                      }
                                    }}
                                    animate={ruleAnswers[i] === oi && oi !== rule.correct ? shakeAnimation : {}}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    style={{
                                      background: ruleAnswers[i] === oi ? (oi === rule.correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "rgba(255,255,255,0.12)",
                                      border: `2px solid ${ruleAnswers[i] === oi ? (oi === rule.correct ? "#10b981" : "#ef4444") : "rgba(255,255,255,0.35)"}`,
                                      borderRadius: 12, padding: "16px 24px",
                                      color: ruleAnswers[i] === oi ? (oi === rule.correct ? "#10b981" : "#ef4444") : "#ffffff",
                                      fontSize: 16, fontWeight: 800, cursor: "pointer", minHeight: 56, flex: 1,
                                      opacity: ruleAnswers[i] !== null && ruleAnswers[i] !== undefined && ruleAnswers[i] !== oi && ruleAnswers[i] !== rule.correct ? 0.4 : 1,
                                    }}
                                  >{opt}</motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          {isDone && <p style={{ color: "#10b981", fontSize: 13, marginTop: 8, textAlign: "left" }}>{rule.desc}</p>}
                        </>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <AnimatePresence>
              {answeredRules.size === 5 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <p style={{ color: "#f59e0b", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
                    You know ALL 5 golden rules! ⭐⭐⭐⭐⭐
                  </p>
                  {btn("Continue →", () => { addCoins(25); navigate(11); })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      /* ──── CASE 11: QUIZ 3 (FLOATING BUBBLES) ──── */
      case 11: {
        if (q3Idx >= Q3_QUIZ.length) {
          const s = q3Score >= 4 ? 3 : q3Score >= 3 ? 2 : 1;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Quiz Complete!</h2>
                  {stars(s)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>You got {q3Score}/{Q3_QUIZ.length} correct!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{q3Score * 10} coins earned!</p>
                  {btn("Next lesson! →", () => navigate(12))}
                </>
              )}
            </motion.div>
          );
        }
        const qq = Q3_QUIZ[q3Idx];
        return (
          <motion.div
            key={`q3-${q3Idx}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 4, textAlign: "center" }}>Quick Quiz!<img src="/characters/adam-layla-happy.png" width={40} height={40} alt="" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 8, borderRadius: 999 }} /></h1>
            <p style={{ color: "#9ca3af", marginBottom: 12, textAlign: "center" }}>Question {q3Idx + 1}/{Q3_QUIZ.length}</p>
            <FloatingBubbleQuiz
              question={qq.q}
              opts={qq.opts}
              correct={qq.correct}
              explain={qq.explain}
              playSound={playSound}
              onCorrect={() => {
                setQ3Score((s) => s + 1);
                addCoins(10);
                setTimeout(() => setQ3Idx((i) => i + 1), 0);
              }}
              onWrong={() => {}}
            />
          </motion.div>
        );
      }

      /* ──── CASE 12: PHISHING (TABLET FRAME) ──── */
      case 12: {
        if (phishIdx >= PHISH.length) {
          const s = phishScore >= 3 ? 3 : phishScore >= 2 ? 2 : 1;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Phishing Expert!</h2>
                  {stars(s)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>{phishScore}/{PHISH.length} spotted correctly!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{phishScore * 15} coins earned!</p>
                  {btn("Real life scenarios! →", () => navigate(13))}
                </>
              )}
            </motion.div>
          );
        }
        const ph = PHISH[phishIdx];
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Spot the Tricks!<img src="/characters/raccoon.png" width={40} height={40} alt="" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 8, borderRadius: 999 }} /></h1>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>Message {phishIdx + 1}/{PHISH.length}</p>

            {/* Tablet frame */}
            <div style={{
              maxWidth: 420, margin: "0 auto 20px",
              borderRadius: 32, border: "8px solid #374151",
              background: "#111827", padding: 16, position: "relative",
              minHeight: 200,
            }}>
              {/* Camera dot */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: "#4b5563",
                margin: "0 auto 12px",
              }} />

              {/* Notification message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`phish-${phishIdx}`}
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                >
                  <h3 style={{ color: "#fff", fontSize: 16, margin: "0 0 8px", textAlign: "left" }}>{ph.title}</h3>
                  <p style={{ color: "#d1d5db", margin: 0, fontSize: 14, textAlign: "left" }}>{ph.text}</p>

                  {/* Scam stamp */}
                  {phishStamped && ph.isScam && (
                    <motion.div
                      initial={{ opacity: 0, scale: 3, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      style={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        color: "#ef4444", fontSize: 20, fontWeight: 900, border: "3px solid #ef4444",
                        borderRadius: 8, padding: "4px 12px",
                        background: "rgba(239,68,68,0.15)",
                      }}
                    >
                      SCAM BLOCKED
                    </motion.div>
                  )}

                  {/* Safe checkmark */}
                  {phishStamped && !ph.isScam && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        color: "#10b981", fontSize: 28,
                      }}
                    >
                      ✅
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Answer buttons */}
            {phishAnswer === null ? (
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <motion.button
                  onClick={() => {
                    const correct = ph.isScam;
                    setPhishAnswer(correct);
                    if (correct) { setPhishScore((s) => s + 1); addCoins(15); playSound("/sounds/correct.mp3"); setTimeout(() => playSound("/sounds/coin.mp3"), 500); }
                    else { playSound("/sounds/wrong.mp3"); }
                    setPhishStamped(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(239,68,68,0.1)", border: "3px solid #ef4444", borderRadius: 20,
                    padding: "16px 24px", color: "#ef4444", fontSize: 18, fontWeight: 700, cursor: "pointer", minHeight: 60,
                  }}
                >
                  🚨 It&apos;s a SCAM!
                </motion.button>
                <motion.button
                  onClick={() => {
                    const correct = !ph.isScam;
                    setPhishAnswer(correct);
                    if (correct) { setPhishScore((s) => s + 1); addCoins(15); playSound("/sounds/correct.mp3"); setTimeout(() => playSound("/sounds/coin.mp3"), 500); }
                    else { playSound("/sounds/wrong.mp3"); }
                    setPhishStamped(true);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(16,185,129,0.1)", border: "3px solid #10b981", borderRadius: 20,
                    padding: "16px 24px", color: "#10b981", fontSize: 18, fontWeight: 700, cursor: "pointer", minHeight: 60,
                  }}
                >
                  ✅ It&apos;s SAFE!
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 8 }}
              >
                <p style={{ color: phishAnswer ? "#10b981" : "#ef4444", fontSize: 20, fontWeight: 700 }}>
                  {phishAnswer ? "🎉 Correct!" : "❌ Not quite!"}
                </p>
                <p style={{ color: "#e5e7eb", fontSize: 16, lineHeight: 1.5 }}>{ph.explain}</p>
                <div style={{ marginTop: 12 }}>
                  {btn("Continue →", () => {
                    setPhishExiting(true);
                    setTimeout(() => {
                      setPhishIdx((i) => i + 1);
                      setPhishAnswer(null);
                      setPhishStamped(false);
                      setPhishExiting(false);
                    }, 500);
                  })}
                </div>
              </motion.div>
            )}
          </div>
        );
      }

      /* ──── CASE 13: WHAT WOULD YOU DO (COMIC BUBBLES) ──── */
      case 13: {
        if (wydIdx >= WYD.length) {
          const s = wydScore >= 3 ? 3 : wydScore >= 2 ? 2 : 1;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 12px" }}>Great decisions!</h2>
                  {stars(s)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>{wydScore}/{WYD.length} perfect choices!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{wydScore * 15} coins earned!</p>
                  {btn("Face the Raccoon! →", () => navigate(14))}
                </>
              )}
            </motion.div>
          );
        }
        const w = WYD[wydIdx];
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>What Would YOU Do?</h1>
            <p style={{ color: "#9ca3af", marginBottom: 16 }}>Scenario {wydIdx + 1}/{WYD.length}</p>
            <motion.div
              key={`wyd-${wydIdx}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, maxWidth: 500, margin: "0 auto 16px" }}>
                {/* Character */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: 48, flexShrink: 0 }}
                >
                  {w.emoji}
                </motion.div>
                {/* Speech bubble */}
                <div style={{
                  position: "relative", background: "rgba(255,255,255,0.06)",
                  border: "2px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: 16,
                  flex: 1, textAlign: "left",
                }}>
                  {/* Triangle tail */}
                  <div style={{
                    position: "absolute", left: -10, top: 20,
                    width: 0, height: 0,
                    borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
                    borderRight: "10px solid rgba(139,92,246,0.3)",
                  }} />
                  <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>{w.situation}</p>
                </div>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 500, margin: "0 auto" }}>
                {w.opts.map((opt: string, i: number) => {
                  const c = OPT_COLORS[i % OPT_COLORS.length];
                  const selected = wydSel === i;
                  const answered = wydSel !== null;
                  const isCorrect = i === w.correct;
                  let bg = c.bg;
                  let border = c.border;
                  if (answered && isCorrect) { bg = "rgba(16,185,129,0.15)"; border = "#10b981"; }
                  if (selected && !isCorrect) { bg = "rgba(245,158,11,0.15)"; border = "#f59e0b"; }
                  return (
                    <motion.button
                      key={i}
                      onClick={() => {
                        if (wydSel !== null) return;
                        setWydSel(i);
                        if (i === w.correct) { setWydScore((s) => s + 1); addCoins(15); playSound("/sounds/correct.mp3"); setTimeout(() => playSound("/sounds/coin.mp3"), 500); }
                        else { playSound("/sounds/wrong.mp3"); }
                      }}
                      disabled={answered}
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      style={{
                        background: bg, border: `2px solid ${border}`, borderRadius: 16, padding: "14px 18px",
                        color: answered && isCorrect ? "#10b981" : selected && !isCorrect ? "#f59e0b" : c.color,
                        fontSize: 15, fontWeight: 700, cursor: answered ? "default" : "pointer", textAlign: "left",
                        minHeight: 60, transition: "all 0.3s ease",
                      }}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
              {wydSel !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 12 }}
                >
                  <p style={{ color: wydSel === w.correct ? "#10b981" : "#f59e0b", fontSize: 20, fontWeight: 700 }}>
                    {wydSel === w.correct ? "🌟 Perfect Cyber Hero choice!" : "🤔 Good try! Here's a better approach:"}
                  </p>
                  <p style={{ color: "#e5e7eb", fontSize: 16, lineHeight: 1.5 }}>{w.why}</p>
                  <div style={{ marginTop: 12 }}>
                    {btn("Continue →", () => { setWydSel(null); setWydIdx((idx) => idx + 1); })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        );
      }

      /* ──── CASE 14: BOSS BATTLE (TAP TO ATTACK) ──── */
      case 14: {
        if (bossDone) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {card(
                <>
                  <motion.img
                    src="/characters/raccoon.png"
                    alt="Raccoon"
                    animate={{ rotate: 720, scale: 0, y: -100, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ width: 80, margin: "0 auto 12px", display: "block" }}
                  />
                  <h2 style={{
                    fontSize: 28, margin: "0 0 12px", fontWeight: 900,
                    background: "linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>YOU DEFEATED THE HACKER RACCOON! 🎉🎉🎉</h2>
                  {stars(bossScore >= 8 ? 3 : bossScore >= 6 ? 2 : 1)}
                  <p style={{ color: "#d1d5db", margin: "12px 0" }}>{bossScore}/{BOSS_QUIZ.length} correct hits!</p>
                  <p style={{ color: "#f59e0b", fontSize: 14 }}>🪙 +{bossScore * 20 + 50} coins (including 50 bonus!)</p>
                  {btn("Save Adam & Layla! →", () => { addCoins(50); playSound("/sounds/coin.mp3"); navigate(15); })}
                </>
              )}
            </motion.div>
          );
        }

        if (bossAttackPhase) {
          const raccoonScale = 0.6 + (arenaRaccoonPos.top / 100) * 0.6;
          const timerPct = (arenaTimeLeft / 12) * 100;
          return (
            <div style={{ textAlign: "center" }}>
              <h1 style={{ color: "#f59e0b", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
                FIRE AT THE RACCOON!
              </h1>
              <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 4 }}>Tap anywhere to fire!</p>
              <p style={{ color: "#f59e0b", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>HITS: {arenaHits}</p>

              {/* Arena */}
              <div
                onClick={handleArenaFire}
                style={{
                  position: "relative", width: "100%", maxWidth: 500, height: 350,
                  margin: "0 auto 12px", perspective: 800, overflow: "hidden",
                  borderRadius: 24, cursor: !arenaShowResult ? "crosshair" : "default",
                  background: "radial-gradient(ellipse at center bottom, rgba(139,92,246,0.15), transparent 70%)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                {/* Timer bar at top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, zIndex: 5, background: "rgba(0,0,0,0.3)", borderRadius: "24px 24px 0 0" }}>
                  <motion.div
                    animate={{ width: `${timerPct}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                      height: "100%", borderRadius: "24px 24px 0 0",
                      background: timerPct > 50 ? "linear-gradient(90deg, #22c55e, #4ade80)" : timerPct > 25 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #ef4444, #f87171)",
                    }}
                  />
                </div>
                <div style={{ position: "absolute", top: 10, right: 14, zIndex: 6, color: arenaTimeLeft <= 3 ? "#ef4444" : "#9ca3af", fontWeight: 900, fontSize: 18 }}>
                  {arenaTimeLeft}s
                </div>

                {/* Arena floor */}
                <div style={{
                  position: "absolute", bottom: 0, left: "-50%", width: "200%", height: "60%",
                  transform: "rotateX(60deg)", transformOrigin: "bottom center",
                  background: `
                    repeating-linear-gradient(90deg, rgba(139,92,246,0.2) 0px, rgba(139,92,246,0.2) 1px, transparent 1px, transparent 40px),
                    repeating-linear-gradient(0deg, rgba(59,130,246,0.15) 0px, rgba(59,130,246,0.15) 1px, transparent 1px, transparent 40px)
                  `,
                }} />

                {/* Raccoon */}
                <motion.div
                  animate={{
                    left: `${arenaRaccoonPos.left}%`,
                    top: `${arenaRaccoonPos.top}%`,
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  style={{
                    position: "absolute",
                    transform: `translate(-50%, -50%) scale(${raccoonScale})`,
                    zIndex: 2,
                  }}
                >
                  <motion.img
                    src="/characters/raccoon.png"
                    alt="Raccoon"
                    animate={
                      arenaRaccoonAnim === "hit" ? { filter: ["brightness(1)", "brightness(3)", "brightness(1)"], scaleX: [1, 1.2, 1], scaleY: [1, 0.8, 1] }
                      : arenaRaccoonAnim === "defeat" ? { rotate: 1440, scale: 0, y: -100, opacity: 0 }
                      : { y: [0, -6, 0] }
                    }
                    transition={
                      arenaRaccoonAnim === "hit" ? { duration: 0.4 }
                      : arenaRaccoonAnim === "defeat" ? { duration: 1.5 }
                      : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }
                    style={{ width: 80, height: 80, borderRadius: 16 }}
                  />
                </motion.div>

                {/* Projectiles */}
                {arenaProjectiles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{ x: p.tx, y: p.ty, scale: 0.5, opacity: 0.6 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      position: "absolute", bottom: 10, left: "50%",
                      width: 14, height: 14, borderRadius: "50%",
                      background: "radial-gradient(circle, #a78bfa, #7c3aed)",
                      boxShadow: "0 0 12px #8b5cf6",
                      pointerEvents: "none", zIndex: 3,
                    }}
                  />
                ))}

                {/* Impact effects */}
                {arenaProjectiles.map((p) => (
                  <motion.span
                    key={`fx-${p.id}`}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${p.tx}px)`, top: `calc(100% + ${p.ty}px)`,
                      color: p.hit ? "#f59e0b" : "#6b7280",
                      fontWeight: 900, fontSize: p.hit ? 24 : 14,
                      pointerEvents: "none", zIndex: 4,
                    }}
                  >
                    {p.hit ? "POW!" : ""}
                  </motion.span>
                ))}

                {/* Result overlay */}
                <AnimatePresence>
                  {arenaShowResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: "absolute", inset: 0, background: "rgba(26,16,51,0.9)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        zIndex: 10,
                      }}
                    >
                      <p style={{ color: "#f59e0b", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
                        {arenaHits} hits!
                      </p>
                      <p style={{ color: "#d1d5db", fontSize: 16, marginBottom: 16 }}>
                        {getArenaDamage(arenaHits)}% damage dealt!
                      </p>
                      {btn("Continue →", finishArenaRound)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Health bar */}
              <div style={{ width: 220, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                  <span>Raccoon HP</span><span>{raccoonHealth}%</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
                  <motion.div
                    animate={{ width: `${raccoonHealth}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                      height: "100%", borderRadius: 999,
                      background: raccoonHealth > 50 ? "#ef4444" : raccoonHealth > 20 ? "#f59e0b" : "#10b981",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        }

        const bq = BOSS_QUIZ[bossIdx];
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>FINAL CHALLENGE!<img src="/characters/raccoon.png" width={40} height={40} alt="" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 8, borderRadius: 999 }} /></h1>
            {/* Raccoon + health bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
              <motion.img
                src="/characters/raccoon.png"
                alt="Raccoon"
                animate={
                  bossFeedback === true ? { x: [0, -10, 10, -10, 10, 0], rotate: [0, -10, 10, -10, 10, 0] }
                  : { y: [0, -6, 0] }
                }
                transition={
                  bossFeedback === true ? { duration: 0.5 }
                  : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }
                style={{ width: 100 }}
              />
              <div style={{ width: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                  <span>Raccoon HP</span><span>{raccoonHealth}%</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.08)" }}>
                  <motion.div
                    animate={{ width: `${raccoonHealth}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                      height: "100%", borderRadius: 999,
                      background: raccoonHealth > 50 ? "#ef4444" : raccoonHealth > 20 ? "#f59e0b" : "#10b981",
                    }}
                  />
                </div>
              </div>
            </div>
            <p style={{ color: "#9ca3af", marginBottom: 8 }}>Question {bossIdx + 1}/{BOSS_QUIZ.length}</p>
            <motion.div
              key={`boss-${bossIdx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 style={{ color: "#fff", fontSize: 18, margin: "0 0 16px" }}>{bq.q}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 500, margin: "0 auto" }}>
                {bq.opts.map((opt: string, i: number) => {
                  const c = OPT_COLORS[i];
                  const isCorrect = i === bq.correct;
                  const selected = bossSel === i;
                  const answered = bossSel !== null;
                  let bg = c.bg;
                  let border = c.border;
                  if (answered && isCorrect) { bg = "rgba(16,185,129,0.15)"; border = "#10b981"; }
                  if (selected && !isCorrect) { bg = "rgba(239,68,68,0.15)"; border = "#ef4444"; }
                  return (
                    <motion.button
                      key={i}
                      onClick={() => {
                        if (bossSel !== null) return;
                        setBossSel(i);
                        const correct = i === bq.correct;
                        setBossFeedback(correct);
                        if (correct) {
                          setBossScore((s) => s + 1);
                          addCoins(20);
                          playSound("/sounds/correct.mp3");
                          setTimeout(() => playSound("/sounds/coin.mp3"), 500);
                          setTimeout(() => setBossAttackPhase(true), 500);
                        } else {
                          playSound("/sounds/wrong.mp3");
                        }
                      }}
                      disabled={answered}
                      animate={selected && !isCorrect ? shakeAnimation : {}}
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      style={{
                        background: bg, border: `2px solid ${border}`, borderRadius: 16, padding: "14px 18px",
                        color: answered && isCorrect ? "#10b981" : selected && !isCorrect ? "#ef4444" : c.color,
                        fontSize: 15, fontWeight: 700, cursor: answered ? "default" : "pointer", textAlign: "left",
                        minHeight: 60, transition: "all 0.3s ease",
                      }}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
            {bossFeedback !== null && !bossAttackPhase && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 12 }}
              >
                <p style={{ color: bossFeedback ? "#10b981" : "#f59e0b", fontSize: 18, fontWeight: 700 }}>
                  {bossFeedback ? "🎉 Hit! Tap the Raccoon!" : "The Raccoon dodged! Keep trying! 💪"}
                </p>
                {!bossFeedback && (
                  <div style={{ marginTop: 12 }}>
                    {btn("Next Question →", () => {
                      if (bossIdx >= BOSS_QUIZ.length - 1) {
                        setBossDone(true);
                      } else {
                        setBossSel(null);
                        setBossFeedback(null);
                        setBossIdx((idx) => idx + 1);
                      }
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        );
      }

      /* ──── CASE 15: ADAM AND LAYLA ARE SAFE ──── */
      case 15: {
        const achieveCoins = [25, 30, 25, 0, 25, 0, 0, 0];
        return (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 900, marginBottom: 16 }}>You Did It!<img src="/characters/adam-layla-happy.png" width={44} height={44} alt="" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 8, borderRadius: 999 }} /></h1>
            <motion.img
              src="/characters/adam-layla-happy.png"
              alt="Adam and Layla safe"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 200, borderRadius: 24, margin: "0 auto 16px", display: "block",
                boxShadow: "0 0 40px rgba(245,158,11,0.4)",
                border: "3px solid #f59e0b",
              }}
            />
            <p style={{ color: "#d1d5db", fontSize: 18, marginBottom: 24 }}>
              Thanks to YOU, Adam and Layla now know how to stay safe!
            </p>
            <motion.div
              variants={achieveStaggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 440, margin: "0 auto 24px" }}
            >
              {ACHIEVEMENTS.map((a: string, i: number) => (
                achievePhase > i ? (
                  <motion.div key={i} variants={achieveStaggerItem}>
                    {card(
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <motion.span
                          initial={{ opacity: 0, scale: 0, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          style={{ color: "#10b981", fontSize: 20 }}
                        >
                          ✅
                        </motion.span>
                        <span style={{ color: "#d1d5db", fontSize: 14, flex: 1 }}>{a}</span>
                        {achieveCoins[i] > 0 && (
                          <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>🪙 +{achieveCoins[i]}</span>
                        )}
                      </div>,
                      { padding: "10px 16px" }
                    )}
                  </motion.div>
                ) : <div key={i} style={{ height: 44 }} />
              ))}
            </motion.div>
            {achievePhase >= 8 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {btn("Get your certificate! 🏆 →", () => navigate(16))}
              </motion.div>
            )}
          </div>
        );
      }

      /* ──── CASE 16: CERTIFICATE + GRADUATION ──── */
      case 16: {
        const totalScore = q1Score + q2Score + q3Score + bossScore + swipeScore + phishScore + wydScore;
        const totalPossible = Q1_QUIZ.length + Q2_QUIZ.length + Q3_QUIZ.length + BOSS_QUIZ.length + SWIPE_DATA.length + PHISH.length + WYD.length;
        const finalStars = totalScore >= totalPossible * 0.8 ? 3 : totalScore >= totalPossible * 0.5 ? 2 : 1;
        const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        return (
          <div style={{ textAlign: "center" }}>
            {showConfetti && <Confetti duration={5000} />}
            {/* Certificate */}
            <motion.div
              className="certificate-card"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }}
              style={{
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)",
                border: "3px solid rgba(139,92,246,0.5)", borderRadius: 24, padding: 32,
                maxWidth: 520, margin: "0 auto 24px",
                boxShadow: "0 0 40px rgba(245,158,11,0.2)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, color: "#9ca3af", letterSpacing: 2, marginBottom: 8 }}>ALGORITHMX</div>
                <div style={{ fontSize: 40, marginBottom: 4 }}>🛡️</div>
                <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Certificate of Achievement</h1>
                <div style={{ width: 60, height: 3, background: GRAD, borderRadius: 999, margin: "8px auto 16px" }} />
                <p style={{ color: "#d1d5db", marginBottom: 4 }}>Presented to</p>
                <h2 className="gradient-text" style={{
                  fontSize: 28, fontWeight: 900, margin: "0 0 8px",
                  background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{childName}</h2>
                <p style={{ color: "#f59e0b", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>CYBER HERO</p>
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 4 }}>Week 1 — Passwords: The Secret Code</p>
                <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>{today}</p>
                {stars(finalStars)}
                <div style={{
                  marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "rgba(245,158,11,0.1)", borderRadius: 12, padding: "8px 16px", border: "1px solid rgba(245,158,11,0.3)",
                }}>
                  <span style={{ fontSize: 24 }}>🪙</span>
                  <span style={{ color: "#f59e0b", fontWeight: 900, fontSize: 22 }}>Total Coins: {coins}</span>
                </div>
              </div>
            </motion.div>
            {/* Score summary */}
            <div className="score-cards" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", maxWidth: 520, margin: "0 auto 24px" }}>
              {[
                { label: "Password Basics", score: q1Score, total: Q1_QUIZ.length },
                { label: "Why Passwords Matter", score: q2Score, total: Q2_QUIZ.length },
                { label: "Good vs Bad", score: swipeScore, total: SWIPE_DATA.length },
                { label: "Golden Rules", score: q3Score, total: Q3_QUIZ.length },
                { label: "Spot the Tricks", score: phishScore, total: PHISH.length },
                { label: "Real Life Choices", score: wydScore, total: WYD.length },
                { label: "Final Challenge", score: bossScore, total: BOSS_QUIZ.length },
              ].map((item: { label: string; score: number; total: number }, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  {card(
                    <div style={{ textAlign: "center", minWidth: 90 }}>
                      <div style={{ color: "#9ca3af", fontSize: 11 }}>{item.label}</div>
                      <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{item.score}/{item.total}</div>
                    </div>,
                    { padding: "8px 14px" }
                  )}
                </motion.div>
              ))}
            </div>
            <div className="print-hide" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/dashboard" style={{
                display: "inline-block", background: GRAD, color: "#fff", fontWeight: 900, borderRadius: 16,
                padding: "13px 34px", textDecoration: "none", fontSize: 16,
                boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
              }}>
                Back to Dashboard 🚀
              </a>
              <motion.button
                onClick={() => window.print()}
                whileHover={{ scale: 1.05, borderColor: "#fff", background: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent", color: "#fff", fontWeight: 900, borderRadius: 16,
                  padding: "13px 34px", fontSize: 16, cursor: "pointer",
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              >
                Print Certificate 🖨️
              </motion.button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  /* ---------- render ---------- */
  return (
    <div style={{ minHeight: "100vh", background: "#1a1033", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>
      <div className="floating-orbs-wrap"><FloatingOrbs /></div>
      {/* Sticky header */}
      <header className="print-hide" style={{
        position: "sticky", top: 0, zIndex: 40, padding: "12px 16px",
        background: "rgba(26,16,51,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/dashboard" style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14, fontWeight: 600, minWidth: 48, minHeight: 48, display: "flex", alignItems: "center" }}>
          ← Dashboard
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontWeight: 900, fontSize: 18, background: GRAD,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>AX</span>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Week 1 · Passwords: The Secret Code</span>
        </div>
        <CoinCounter coins={coins} animKey={coinAnimKey} />
      </header>
      <div className="progress-wrap print-hide"><ProgressBar step={screen} /></div>
      <div className="step-dots-wrap print-hide"><StepDots step={screen} /></div>
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "16px 16px 80px", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={getScreenVariants(screen)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── DRAG GHOSTS (rendered outside overflow:hidden main) ── */}
      {shieldDragging && shieldPos && (
        <div style={{
          position: "fixed", left: shieldPos.x, top: shieldPos.y, pointerEvents: "none", zIndex: 9999,
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(16,185,129,0.2)", border: "3px solid #10b981",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          boxShadow: "0 0 30px rgba(16,185,129,0.5)",
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
