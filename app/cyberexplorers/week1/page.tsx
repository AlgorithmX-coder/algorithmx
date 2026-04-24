"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { playSound as playSFX, playBGM, stopBGM } from "@/app/lib/sounds";
import { addXP, type RankInfo } from "@/app/lib/progression";
import { correctAnswerBurst, badgeEarnedCelebration } from "@/app/lib/celebrations";
import ExerciseErrorBoundary from "@/app/components/ExerciseErrorBoundary";
import CyberScanner from "@/app/components/exercises/CyberScanner";
import ProtectTheData from "@/app/components/exercises/ProtectTheData";
import MemoryMatch from "@/app/components/exercises/MemoryMatch";
import ChooseYourPath from "@/app/components/exercises/ChooseYourPath";
import CyberMaze from "@/app/components/exercises/CyberMaze";
import FirewallBuilder from "@/app/components/exercises/FirewallBuilder";

const BossBattle = dynamic(
  () => import("@/app/components/game/BossBattle"),
  { ssr: false }
);

/* ─────────────── TOKENS ─────────────── */
const BG = "#080c14";
const CARD = "#0f1525";
const CYAN = "#22d3ee";
const PURPLE = "#8b5cf6";
const EMERALD = "#10b981";
const GOLD = "#fbbf24";
const MUTED = "#94a3b8";
const DIM = "#64748b";
const MONO = "'JetBrains Mono', 'Fira Code', 'Consolas', monospace";
const HEAD = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'DM Sans', system-ui, sans-serif";
const TOTAL_SCREENS = 16;

/* ─────────────── EXERCISE DATA ─────────────── */

type ScanItem = { text: string; isStrong: boolean; explanation: string };
const SCAN_ITEMS: ScanItem[] = [
  { text: "Your Instagram post", isStrong: true, explanation: "Active — you chose to share this" },
  { text: "A Google search", isStrong: false, explanation: "Passive — recorded in your history without a prompt" },
  { text: "Your school login", isStrong: true, explanation: "Active — you entered credentials deliberately" },
  { text: "A YouTube comment", isStrong: true, explanation: "Active — you chose to publish it" },
  { text: "GPS data from your phone", isStrong: false, explanation: "Passive — collected in the background" },
  { text: "Browser cookies", isStrong: false, explanation: "Passive — stored as you browse" },
  { text: "Your email to a friend", isStrong: true, explanation: "Active — you composed and sent it" },
  { text: "WiFi network you connected to", isStrong: false, explanation: "Passive — logged by the router automatically" },
];
// Re-purposes CyberScanner's STRONG button as "ACTIVE" and WEAK as "PASSIVE".

type ProtectItem = { text: string; isPrivate: boolean };
const PROTECT_ITEMS: ProtectItem[] = [
  { text: "Your exact location", isPrivate: true },
  { text: "Your home address", isPrivate: true },
  { text: "Your school name", isPrivate: true },
  { text: "Your full name", isPrivate: true },
  { text: "Your phone number", isPrivate: true },
  { text: "Your passwords", isPrivate: true },
  { text: "Favourite colour", isPrivate: false },
  { text: "Favourite game", isPrivate: false },
  { text: 'Age range "I\'m a teen"', isPrivate: false },
  { text: "Your hobbies", isPrivate: false },
  { text: "Lunch you had", isPrivate: false },
  { text: "Favourite subject", isPrivate: false },
];

const MATCH_PAIRS = [
  { term: "Cookie", match: "Tracks your browsing habits", colour: CYAN },
  { term: "IP Address", match: "Reveals your location", colour: PURPLE },
  { term: "Active Footprint", match: "Data you choose to share", colour: EMERALD },
  { term: "Passive Footprint", match: "Data collected without you knowing", colour: "#f472b6" },
  { term: "Browser History", match: "Record of every site you visit", colour: GOLD },
  { term: "Metadata", match: "Hidden data in photos (location, time, device)", colour: "#f97316" },
];

const PATH_SCENARIOS = [
  {
    setup: "You take a selfie at school with your uniform showing. Should you post it?",
    choices: [
      { text: "Post it — it's just a photo", isSafe: false, consequence: "Your uniform and the background give away where you go every weekday. Strangers can use that." },
      { text: "Don't post it online", isSafe: true, consequence: "Smart. Uniforms + landmarks = your real-world location is now public." },
    ],
  },
  {
    setup: "A website pops up and asks you to accept cookies. What do you do?",
    choices: [
      { text: "Click Accept All — everyone does it", isSafe: false, consequence: "You just handed over tracking permissions to dozens of third-party companies." },
      { text: "Check what data they collect — only accept necessary", isSafe: true, consequence: "Exactly right. Necessary cookies are fine. Third-party trackers aren't." },
    ],
  },
  {
    setup: "A \"fun quiz\" asks for your full name, birthday, and pet's name. Should you fill it in?",
    choices: [
      { text: "Yes — it's just a quiz", isSafe: false, consequence: "Those are classic security-question answers. Quizzes are often data-harvesting scams." },
      { text: "No — those are security-question answers", isSafe: true, consequence: "Perfect. Any quiz asking for info banks and apps use to verify you is a red flag." },
    ],
  },
  {
    setup: "A calculator app asks for your camera, microphone, contacts AND location. Install?",
    choices: [
      { text: "Allow — it probably needs them to work", isSafe: false, consequence: "A calculator needs none of those. Those permissions make the app a surveillance tool." },
      { text: "Deny — a calculator doesn't need those permissions", isSafe: true, consequence: "Yes. When permissions don't match the app's job, walk away." },
    ],
  },
];

const MAZE_QUESTIONS = [
  { question: "What is a PASSIVE digital footprint?", answers: ["Data collected about you without your knowledge", "Things you post yourself", "Photos you like", "Videos you watch on mute"], correctIndex: 0 },
  { question: "Where is your IP address visible?", answers: ["Every website you visit can see it", "Only to your friends", "Only when you're logged in", "Nowhere — it's private"], correctIndex: 0 },
  { question: "What hidden data do photos often contain?", answers: ["Metadata — location, time, device", "The photographer's name", "Your phone's battery level", "Nothing hidden"], correctIndex: 0 },
  { question: "Before posting online you should ask...", answers: ["Who might see this in the future", "How many likes will I get", "Is it funny", "Is it trending"], correctIndex: 0 },
  { question: "Why check app permissions?", answers: ["Some apps collect more data than they need", "To make apps load faster", "Apps won't work without every permission", "Permissions are decorative"], correctIndex: 0 },
];

// Full 30-question boss pool, themed around digital identity & footprints.
const BOSS_QUESTIONS = [
  // EASY
  { question: "Your digital footprint is...", answers: ["The trail of data you leave online", "Your shoe size", "A deleted Instagram photo", "A website's logo"], correctIndex: 0 },
  { question: "An ACTIVE footprint is...", answers: ["Something you chose to post", "Something collected in secret", "A virus", "A cookie"], correctIndex: 0 },
  { question: "A PASSIVE footprint is...", answers: ["Data gathered without you posting", "A photo you shared", "A post you liked", "A username"], correctIndex: 0 },
  { question: "Which is PRIVATE info?", answers: ["Your home address", "Your favourite colour", "Your favourite game", "Your hobby"], correctIndex: 0 },
  { question: "A cookie is...", answers: ["A file that tracks your browsing", "A website design", "A kind of password", "An email"], correctIndex: 0 },
  { question: "Which of these is SAFE to share online?", answers: ["Your favourite band", "Your full address", "Your school name", "Your phone number"], correctIndex: 0 },
  { question: "Should you accept EVERY cookie on a site?", answers: ["No — only the necessary ones", "Yes — always", "Only on Mondays", "Only if you're in a hurry"], correctIndex: 0 },
  { question: "Your online posts are...", answers: ["Hard to fully delete", "Gone forever when you tap delete", "Only visible to friends", "Private by default"], correctIndex: 0 },
  { question: "Metadata in a photo can include...", answers: ["GPS location and timestamp", "The photo's caption", "The number of likes", "The photo's filter"], correctIndex: 0 },
  { question: "A calculator app should NOT ask for...", answers: ["Your location and contacts", "The maths operator you want", "A number to calculate", "Your preferred colour"], correctIndex: 0 },
  // MEDIUM
  { question: "Which HIDES your IP address?", answers: ["A VPN", "A cookie", "A selfie", "A GIF"], correctIndex: 0 },
  { question: "What is OSINT?", answers: ["Open-source intelligence — info gathered from public sources", "A type of virus", "A social media platform", "An antivirus brand"], correctIndex: 0 },
  { question: "Private browsing mode does NOT...", answers: ["Hide you from your internet provider", "Delete local browsing history", "Clear cookies when you close it", "Hide search history on your device"], correctIndex: 0 },
  { question: "Someone finds your name, school and birthday online. They can...", answers: ["Guess security questions and impersonate you", "Only send you a birthday card", "Nothing at all", "Only subscribe to your channel"], correctIndex: 0 },
  { question: "An app that sells your location data is...", answers: ["A privacy risk — check permissions", "Harmless — it's anonymous", "Illegal everywhere", "Only a problem for adults"], correctIndex: 0 },
  { question: "A good privacy habit is to...", answers: ["Google yourself and see what's public", "Post as much as possible", "Share your password with friends", "Accept all DMs from strangers"], correctIndex: 0 },
  { question: "A photo tagged with your location...", answers: ["Tells anyone where you were", "Makes the photo higher quality", "Hides the photo from strangers", "Deletes itself after a week"], correctIndex: 0 },
  { question: "Which is the STRONGEST password?", answers: ["Tr0pic4l$unR1se!", "password123", "qwerty", "your name"], correctIndex: 0 },
  { question: "Your digital footprint can affect...", answers: ["Jobs, universities, and friendships years later", "Nothing — teens are exempt", "Only your gaming rank", "Only your email inbox"], correctIndex: 0 },
  { question: "You see a new follower request from a stranger asking personal questions. You...", answers: ["Block and tell a trusted adult", "Answer to be polite", "Accept and share your school", "Give them your number"], correctIndex: 0 },
  // HARD
  { question: "Deleting a post from your account means...", answers: ["Copies may still exist on servers, screenshots and archives", "It's gone from the entire internet", "Only the caption is deleted", "Only the photo is deleted"], correctIndex: 0 },
  { question: "A \"zero-click\" tracker is...", answers: ["Something that tracks you without any action from you", "A tracker that needs one click", "A click counter", "An anti-tracker"], correctIndex: 0 },
  { question: "Which item is most risky to post publicly?", answers: ["A dated photo of you in school uniform", "A plain sunset photo", "A meme", "A photo of food"], correctIndex: 0 },
  { question: "The safest way to give your age online is usually...", answers: ["\"I'm a teen\" or an age range", "Your exact birthday", "Your year of birth and month", "Your full birth certificate"], correctIndex: 0 },
  { question: "You can reduce your passive footprint by...", answers: ["Auditing app permissions and using tracker-blockers", "Posting more memes", "Accepting all cookies", "Clicking every ad"], correctIndex: 0 },
  { question: "Which data is OFTEN harvested from a \"fun personality quiz\"?", answers: ["Security-question answers like pet's name + birthday", "Your favourite number only", "Nothing — they're charities", "Only your quiz score"], correctIndex: 0 },
  { question: "A \"digital twin\" profile built from your data can be used to...", answers: ["Impersonate you or guess your answers", "Make your Wi-Fi faster", "Delete your posts automatically", "Speed up your downloads"], correctIndex: 0 },
  { question: "An ETHICAL hacker's first rule is...", answers: ["Only test systems you have permission to test", "Post passwords they find", "Keep every vulnerability secret", "Sell data to the highest bidder"], correctIndex: 0 },
  { question: "A dating-app breach leaks photo metadata. Attackers can...", answers: ["Pinpoint where photos were taken", "Only see the app's logo", "See the battery level only", "Only see the filter used"], correctIndex: 0 },
  { question: "Strong identity protection online is about...", answers: ["Layers — mindset, settings, tools, and habits", "One perfect password", "Always being offline", "Trusting everyone"], correctIndex: 0 },
];

/* ─────────────── ANIMATIONS ─────────────── */
const STYLES = `
@keyframes cxeBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes cxeFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes cxeFootstep {
  0% { opacity: 0; transform: translateX(-40px) scale(0.6); }
  20% { opacity: 0.9; }
  100% { opacity: 0; transform: translateX(340px) scale(1); }
}
@keyframes cxeMatrixFall {
  0% { transform: translateY(-100%); opacity: 0; }
  15% { opacity: 0.5; }
  100% { transform: translateY(110vh); opacity: 0; }
}
@keyframes cxeNodePop {
  0% { transform: scale(0.2); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes cxeCheck {
  0% { transform: scale(0) rotate(-40deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-cxe-week1";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

/* ─────────────── UI PIECES ─────────────── */

function Terminal({ title = "mentor@cyberexplorers:~", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#0a0e1a",
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${CYAN}33`,
        boxShadow: `0 0 30px ${CYAN}1a`,
        animation: "cxeFadeIn 0.35s ease-out both",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          borderBottom: `1px solid ${CYAN}22`,
          background: "linear-gradient(180deg, rgba(34,211,238,0.06), transparent)",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: GOLD }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: EMERALD }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginLeft: 8 }}>{title}</span>
      </div>
      <div style={{ padding: "22px 24px", fontFamily: MONO, color: "#e2e8f0", fontSize: 14, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
        color: "#0a0e1a",
        fontWeight: 800,
        padding: "14px 32px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        fontFamily: HEAD,
        fontSize: 15,
        letterSpacing: 0.8,
        boxShadow: `0 0 22px ${CYAN}55`,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        color: CYAN,
        fontWeight: 700,
        padding: "12px 24px",
        borderRadius: 12,
        border: `1px solid ${CYAN}55`,
        cursor: "pointer",
        fontFamily: HEAD,
        fontSize: 14,
      }}
    >
      {children}
    </button>
  );
}

function CommandHeading({ cmd }: { cmd: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 14,
        color: "#e2e8f0",
        marginBottom: 16,
        letterSpacing: 0.3,
      }}
    >
      <span style={{ color: EMERALD }}>root@cyberexplorers</span>
      <span style={{ color: MUTED }}>:~$ </span>
      <span>{cmd}</span>
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 16,
          background: CYAN,
          marginLeft: 6,
          verticalAlign: "middle",
          animation: "cxeBlink 1s steps(1) infinite",
        }}
      />
    </div>
  );
}

function Typewriter({ text, speed = 24, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= text.length) {
      onDone?.();
      return;
    }
    const t = window.setTimeout(() => setShown((n) => Math.min(text.length, n + 1)), speed);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, text]);
  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && (
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 14,
            background: CYAN,
            marginLeft: 2,
            verticalAlign: "middle",
            animation: "cxeBlink 1s steps(1) infinite",
          }}
        />
      )}
    </span>
  );
}

function MentorTip({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 12,
        color: EMERALD,
        background: "rgba(16,185,129,0.06)",
        border: `1px solid ${EMERALD}44`,
        borderRadius: 10,
        padding: "8px 12px",
        marginTop: 16,
        maxWidth: 620,
        marginInline: "auto",
      }}
    >
      <span style={{ color: CYAN, marginRight: 8 }}>mentor&gt;</span>
      {message}
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.min(100, Math.round((step / (total - 1)) * 100));
  return (
    <div
      style={{
        position: "relative",
        height: 4,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
          boxShadow: `0 0 10px ${CYAN}aa`,
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

function MatrixBG() {
  const cols = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        key: i,
        left: (i * 5.7 + (i % 3)) % 100,
        char: "01XY#$/&*?!%@ZL".charAt(i % 15),
        delay: (i * 0.8) % 10,
        duration: 14 + (i % 6) * 2,
        size: 11 + (i % 3),
        colour: i % 3 === 0 ? CYAN : i % 3 === 1 ? EMERALD : PURPLE,
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0.05,
        zIndex: 0,
      }}
    >
      {cols.map((c) => (
        <span
          key={c.key}
          style={{
            position: "absolute",
            left: `${c.left}%`,
            top: 0,
            fontFamily: MONO,
            fontSize: c.size,
            color: c.colour,
            animation: `cxeMatrixFall ${c.duration}s linear infinite`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.char}
        </span>
      ))}
    </div>
  );
}

/* ─────────────── MAIN ─────────────── */
export default function CyberExplorersWeek1() {
  useEffect(ensureStyles, []);

  const [screen, setScreen] = useState(0);
  const [lessonXp, setLessonXp] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState<Record<number, number>>({});
  const [showBossBattle, setShowBossBattle] = useState(false);
  const [bossDone, setBossDone] = useState(false);
  const [bossStats, setBossStats] = useState<{ combo: number; accuracy: number; xp: number } | null>(null);
  const [pendingLevelUp, setPendingLevelUp] = useState<null | {
    oldRank: RankInfo;
    newRank: RankInfo;
    totalXP: number;
  }>(null);

  // BGM: lesson tune on content screens, battle tune on exercise/boss screens.
  useEffect(() => {
    const exerciseScreens = [3, 5, 7, 9, 11, 13, 14];
    const isExerciseScreen = exerciseScreens.includes(screen);
    try {
      playBGM(isExerciseScreen ? "bgmBattle" : "bgmLesson");
    } catch {
      /* BGM optional */
    }
    return () => {
      // Stop BGM on leaving the lesson (covers unmount)
    };
  }, [screen]);

  useEffect(
    () => () => {
      try {
        stopBGM();
      } catch {
        /* noop */
      }
    },
    []
  );

  const navigate = useCallback((to: number) => {
    playSFX("transition");
    setScreen((prev) => Math.max(0, Math.min(TOTAL_SCREENS - 1, to)));
  }, []);

  // Keyboard: arrow keys skip around (but not during boss battle).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (showBossBattle) return;
      if (e.key === "ArrowRight" && screen < TOTAL_SCREENS - 1) {
        e.preventDefault();
        navigate(screen + 1);
      } else if (e.key === "ArrowLeft" && screen > 0) {
        e.preventDefault();
        navigate(screen - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, navigate, showBossBattle]);

  const awardXp = useCallback((amount: number) => {
    const result = addXP(amount, "cyberexplorers-week-1");
    setLessonXp((v) => v + amount);
    if (result.leveledUp) {
      setPendingLevelUp({
        oldRank: result.oldRank,
        newRank: result.newRank,
        totalXP: result.newTotal,
      });
    }
  }, []);

  const addWrong = useCallback((scr: number) => {
    setWrongAttempts((prev) => ({ ...prev, [scr]: (prev[scr] || 0) + 1 }));
  }, []);

  /* ───────── CONTENT SCREENS ───────── */

  const S0 = () => (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <CommandHeading cmd="./mission --brief --module=01" />
      <Terminal title="mission_briefing.mp4 — Jermaine">
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            border: `1px solid ${CYAN}33`,
            aspectRatio: "16 / 9",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.25), rgba(10,14,26,0.95))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(transparent 0 3px, rgba(34,211,238,0.04) 3px 4px)",
              pointerEvents: "none",
            }}
          />
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Play briefing"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              color: "#0a0e1a",
              boxShadow: `0 0 40px ${CYAN}66`,
            }}
          >
            ▶
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 14,
              fontFamily: MONO,
              fontSize: 12,
              color: CYAN,
              letterSpacing: 1,
              background: "rgba(10,14,26,0.8)",
              padding: "4px 8px",
              borderRadius: 4,
              border: `1px solid ${CYAN}33`,
            }}
          >
            REC • 00:00 / 04:32
          </div>
        </div>
        <div style={{ marginTop: 18, color: MUTED, fontSize: 13, fontFamily: BODY }}>
          <span style={{ color: CYAN }}>[OPTIONAL]</span> Watch Jermaine introduce the first mission. Or skip straight to the mission overview.
        </div>
      </Terminal>
      <MentorTip message="Every mission starts with a briefing. Read everything. It matters." />
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <PrimaryButton onClick={() => navigate(1)}>Begin Mission →</PrimaryButton>
      </div>
    </div>
  );

  const S1 = () => (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <CommandHeading cmd="cat mission_01.md" />
      <Terminal title="mission_01.md">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><span style={{ color: CYAN }}>MISSION</span>: <span style={{ color: "#f1f5f9" }}>Digital Identity &amp; Footprint</span></div>
          <div><span style={{ color: CYAN }}>OBJECTIVE</span>: <span style={{ color: MUTED }}>Understand how your online actions create a permanent trail</span></div>
          <div><span style={{ color: CYAN }}>DIFFICULTY</span>: <span style={{ color: EMERALD }}>★</span><span style={{ color: DIM }}>☆☆ Beginner</span></div>
          <div><span style={{ color: CYAN }}>EST. TIME</span>: <span style={{ color: MUTED }}>45 minutes</span></div>

          <hr style={{ border: "none", borderTop: `1px dashed ${CYAN}33`, margin: "8px 0" }} />

          <div style={{ color: CYAN }}>// objectives</div>
          {[
            "Understand what a digital footprint is",
            "Learn what data you leave behind — with and without knowing",
            "Take control of your online presence",
          ].map((goal, i) => (
            <div key={i} style={{ paddingLeft: 18, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: EMERALD }}>▸</span>
              <span style={{ color: "#cbd5e1" }}>{goal}</span>
            </div>
          ))}
        </div>
      </Terminal>
      <MentorTip message="Accept the mission when you're ready. You can replay any section." />
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <PrimaryButton onClick={() => navigate(2)}>Accept Mission →</PrimaryButton>
      </div>
    </div>
  );

  const S2 = () => (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <CommandHeading cmd="./footprint --explain" />
      <Terminal title="digital_footprint.md">
        <div style={{ fontFamily: BODY, color: "#f1f5f9", fontSize: 16, lineHeight: 1.65 }}>
          Every time you go online, you leave a trail. Every search, every post, every
          click — it <span style={{ color: CYAN }}>all gets recorded</span> somewhere.
        </div>

        {/* Footstep animation */}
        <div
          style={{
            position: "relative",
            height: 60,
            marginTop: 22,
            background: "rgba(34,211,238,0.03)",
            borderRadius: 10,
            overflow: "hidden",
            border: `1px dashed ${CYAN}44`,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: i % 2 === 0 ? 12 : 32,
                left: 0,
                width: 22,
                height: 14,
                borderRadius: "40% 40% 50% 50%",
                background: CYAN,
                boxShadow: `0 0 10px ${CYAN}`,
                animation: `cxeFootstep 3.2s ease-in-out infinite`,
                animationDelay: `${i * 0.55}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Active vs passive */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22 }}>
          <div
            style={{
              border: `1px solid ${EMERALD}55`,
              borderRadius: 10,
              padding: 14,
              background: "rgba(16,185,129,0.05)",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: EMERALD, letterSpacing: 1, marginBottom: 6 }}>
              [ACTIVE]
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, color: "#f1f5f9", fontSize: 15, marginBottom: 4 }}>
              Things you POST
            </div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Photos, comments, stories, emails, form submissions. You chose to share them.
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${PURPLE}55`,
              borderRadius: 10,
              padding: 14,
              background: "rgba(139,92,246,0.05)",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: PURPLE, letterSpacing: 1, marginBottom: 6 }}>
              [PASSIVE]
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, color: "#f1f5f9", fontSize: 15, marginBottom: 4 }}>
              Things COLLECTED
            </div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
              Cookies, IP addresses, GPS pings, metadata. Harvested in the background.
            </div>
          </div>
        </div>
      </Terminal>
      <MentorTip message="Passive footprints are the sneaky ones. Most people don't even know they exist." />
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <PrimaryButton onClick={() => navigate(3)}>Next →</PrimaryButton>
      </div>
    </div>
  );

  const S4 = () => (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      <CommandHeading cmd="./data_collection --trace" />
      <Terminal title="how_data_gets_collected.md">
        <div style={{ fontFamily: BODY, color: "#cbd5e1", fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
          Websites, apps, and services collect data using these common methods:
        </div>
        {[
          { name: "COOKIES", desc: "Small files saved in your browser. Remember logins — and track you across sites.", colour: CYAN },
          { name: "IP ADDRESS", desc: "Your device's public address. Reveals approximate location and network.", colour: PURPLE },
          { name: "LOCATION DATA", desc: "GPS, Wi-Fi lookups, cell towers. Accurate to within metres.", colour: EMERALD },
          { name: "BROWSING HISTORY", desc: "Every URL you visit, stored locally AND sent to trackers on each page.", colour: GOLD },
          { name: "APP PERMISSIONS", desc: "Camera, mic, contacts, storage. Some apps ask for way more than they need.", colour: "#f472b6" },
        ].map((item) => (
          <div
            key={item.name}
            style={{
              fontFamily: MONO,
              background: "rgba(0,0,0,0.3)",
              borderLeft: `3px solid ${item.colour}`,
              padding: "10px 14px",
              borderRadius: "4px 8px 8px 4px",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            <span style={{ color: item.colour, fontWeight: 700 }}>{item.name}</span>
            <span style={{ color: "#64748b" }}> → </span>
            <span style={{ color: "#e2e8f0" }}>{item.desc}</span>
          </div>
        ))}
      </Terminal>
      <MentorTip message="Before you install an app, check the permissions list. It's your first line of defence." />
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <PrimaryButton onClick={() => navigate(5)}>Next →</PrimaryButton>
      </div>
    </div>
  );

  const S6 = () => {
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const nodes = [
      { label: "Your location", x: 50, y: 14, colour: CYAN },
      { label: "Your school", x: 22, y: 40, colour: EMERALD },
      { label: "Your friends", x: 78, y: 40, colour: PURPLE },
      { label: "Your schedule", x: 14, y: 72, colour: GOLD },
      { label: "Your appearance", x: 86, y: 72, colour: "#f472b6" },
    ];
    const reveal = (i: number) => {
      setRevealed((prev) => {
        const next = new Set(prev);
        next.add(i);
        return next;
      });
      playSFX("pop");
    };
    return (
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <CommandHeading cmd="./trail --visualise" />
        <Terminal title="one_post_reveals.md">
          <div style={{ fontFamily: BODY, color: "#cbd5e1", fontSize: 15, lineHeight: 1.6 }}>
            One photo can leak five things. Tap each node to see what a single post might reveal about you.
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1.8 / 1",
              marginTop: 20,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.08), transparent 70%)",
              borderRadius: 14,
              border: `1px solid ${CYAN}22`,
              overflow: "hidden",
            }}
          >
            {/* Central post node */}
            <button
              type="button"
              onClick={() => nodes.forEach((_, i) => reveal(i))}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                width: 70,
                height: 70,
                borderRadius: "50%",
                border: `2px solid ${CYAN}`,
                background: `radial-gradient(circle, ${CYAN}33, transparent)`,
                color: CYAN,
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 0 30px ${CYAN}66`,
              }}
            >
              POST
            </button>

            {/* Connector lines */}
            <svg
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {nodes.map((n, i) => (
                <line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={`${n.x}%`}
                  y2={`${n.y}%`}
                  stroke={revealed.has(i) ? n.colour : "rgba(148,163,184,0.15)"}
                  strokeWidth={revealed.has(i) ? 2 : 1}
                  strokeDasharray={revealed.has(i) ? "0" : "4 4"}
                  style={{
                    transition: "stroke 0.3s ease, stroke-width 0.3s ease",
                  }}
                />
              ))}
            </svg>

            {/* Surrounding nodes */}
            {nodes.map((n, i) => {
              const isRevealed = revealed.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => reveal(i)}
                  style={{
                    position: "absolute",
                    left: `${n.x}%`,
                    top: `${n.y}%`,
                    transform: "translate(-50%,-50%)",
                    minWidth: 110,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: `1px solid ${isRevealed ? n.colour : "rgba(148,163,184,0.25)"}`,
                    background: isRevealed
                      ? `${n.colour}1a`
                      : "rgba(15,21,37,0.85)",
                    color: isRevealed ? n.colour : MUTED,
                    fontFamily: MONO,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: 0.5,
                    boxShadow: isRevealed ? `0 0 14px ${n.colour}66` : "none",
                    animation: isRevealed ? "cxeNodePop 0.35s ease-out" : undefined,
                  }}
                >
                  {isRevealed ? n.label : "???"}
                </button>
              );
            })}
          </div>

          {revealed.size === nodes.length && (
            <div
              style={{
                marginTop: 18,
                padding: 12,
                background: `${CYAN}0f`,
                border: `1px solid ${CYAN}55`,
                borderRadius: 10,
                fontFamily: BODY,
                fontSize: 14,
                color: "#f1f5f9",
                animation: "cxeFadeIn 0.4s ease-out",
              }}
            >
              <span style={{ color: CYAN, fontWeight: 700 }}>// This is why it matters.</span> One
              post reveals more than you'd think.
            </div>
          )}
        </Terminal>
        <MentorTip message="Attackers chain small facts together. Individually harmless, together identifying." />
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <PrimaryButton onClick={() => navigate(7)}>Next →</PrimaryButton>
        </div>
      </div>
    );
  };

  const S8 = () => {
    const tips = [
      "Think before you post — would you be happy if a teacher or parent saw this?",
      "Check privacy settings on every app — defaults favour the platform, not you.",
      "Use private browsing for sensitive searches — it won't hide you from your ISP, but it helps locally.",
      "Regularly Google yourself — see what's public before someone else does.",
      "Audit app permissions — revoke anything an app doesn't actually need to do its job.",
    ];
    return (
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <CommandHeading cmd="checklist --controls" />
        <Terminal title="protect_yourself.md">
          <div style={{ fontFamily: BODY, color: "#cbd5e1", fontSize: 15, lineHeight: 1.6, marginBottom: 14 }}>
            Five habits that shrink your digital footprint without locking you out of the internet:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tips.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "11px 14px",
                  background: "rgba(16,185,129,0.05)",
                  border: `1px solid ${EMERALD}33`,
                  borderRadius: 10,
                  animation: `cxeFadeIn 0.4s ease-out both`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: EMERALD,
                    color: "#0a0e1a",
                    fontWeight: 900,
                    fontSize: 13,
                    flexShrink: 0,
                    animation: `cxeCheck 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                    animationDelay: `${i * 0.1 + 0.15}s`,
                  }}
                >
                  ✓
                </span>
                <div style={{ fontFamily: BODY, fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 }}>
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </Terminal>
        <MentorTip message="You don't need to become invisible — just deliberate." />
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <PrimaryButton onClick={() => navigate(9)}>Next →</PrimaryButton>
        </div>
      </div>
    );
  };

  const S10 = () => {
    // Mock profile audit — each element is flagged as SAFE or RISKY
    const elements = [
      { label: "Bio: \"Class 9B @ St Mary's\"", risky: true, reason: "School name = physical location" },
      { label: "Avatar photo: a sunset silhouette", risky: false, reason: "Non-identifying — safe" },
      { label: "Location: \"Manchester, UK\"", risky: true, reason: "Home town narrows you down fast" },
      { label: "Birthday: \"14th March\"", risky: true, reason: "Common security question" },
      { label: "Favourite film listed", risky: false, reason: "Opinion, not ID info" },
      { label: "Tagged photos at your school", risky: true, reason: "Same as listing the school in bio" },
    ];
    const [tagged, setTagged] = useState<Record<number, "safe" | "risky" | undefined>>({});
    const setMark = (i: number, mark: "safe" | "risky") => {
      setTagged((prev) => ({ ...prev, [i]: mark }));
      const correct = elements[i].risky ? mark === "risky" : mark === "safe";
      if (correct) {
        playSFX("correct");
        awardXp(15);
      } else {
        playSFX("wrong");
        addWrong(10);
      }
    };
    const allDone = Object.keys(tagged).length === elements.length;
    const score = Object.entries(tagged).filter(([i, m]) => {
      const el = elements[Number(i)];
      return el.risky ? m === "risky" : m === "safe";
    }).length;

    return (
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <CommandHeading cmd="./audit --profile mock_user" />
        <Terminal title="profile_scan.log">
          <div style={{ fontFamily: BODY, fontSize: 14, color: MUTED, marginBottom: 16 }}>
            Fake profile snapshot. Mark each element <span style={{ color: EMERALD }}>SAFE</span> or <span style={{ color: "#ef4444" }}>RISKY</span>.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {elements.map((el, i) => {
              const m = tagged[i];
              const correct = el.risky ? m === "risky" : m === "safe";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 12px",
                    background: m ? (correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)") : "rgba(0,0,0,0.25)",
                    border: `1px solid ${m ? (correct ? EMERALD : "#ef4444") : "rgba(148,163,184,0.2)"}`,
                    borderRadius: 10,
                    transition: "all 0.2s ease",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600, fontFamily: BODY }}>
                      {el.label}
                    </div>
                    {m && (
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2, fontFamily: MONO }}>
                        {correct ? "✓" : "✗"} {el.reason}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => !m && setMark(i, "safe")}
                      disabled={!!m}
                      style={{
                        background: m === "safe" ? EMERALD : "transparent",
                        color: m === "safe" ? "#0a0e1a" : EMERALD,
                        border: `1px solid ${EMERALD}`,
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontFamily: MONO,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: m ? "default" : "pointer",
                        letterSpacing: 0.5,
                        opacity: m && m !== "safe" ? 0.4 : 1,
                      }}
                    >
                      SAFE
                    </button>
                    <button
                      type="button"
                      onClick={() => !m && setMark(i, "risky")}
                      disabled={!!m}
                      style={{
                        background: m === "risky" ? "#ef4444" : "transparent",
                        color: m === "risky" ? "#0a0e1a" : "#ef4444",
                        border: `1px solid #ef4444`,
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontFamily: MONO,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: m ? "default" : "pointer",
                        letterSpacing: 0.5,
                        opacity: m && m !== "risky" ? 0.4 : 1,
                      }}
                    >
                      RISKY
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {allDone && (
            <div
              style={{
                marginTop: 16,
                fontFamily: MONO,
                fontSize: 13,
                color: score === elements.length ? EMERALD : GOLD,
                animation: "cxeFadeIn 0.4s ease-out",
              }}
            >
              &gt; Audit complete. {score}/{elements.length} identified correctly.
            </div>
          )}
        </Terminal>
        <MentorTip message="What feels normal to share often isn't. Audit your own profile tonight." />
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <PrimaryButton onClick={() => navigate(11)}>Next →</PrimaryButton>
        </div>
      </div>
    );
  };

  const S12 = () => {
    const cases = [
      {
        id: "CASE-001",
        title: "The uni rejection",
        outcome: "A top UK university rescinded a student's offer after reviewing their public social-media history. Posts from age 14 surfaced in admission-review screenshots.",
        takeaway: "Old posts don't age out of the internet.",
        colour: CYAN,
      },
      {
        id: "CASE-002",
        title: "The metadata trail",
        outcome: "A teen posted a photo from their bedroom. Image metadata contained GPS coordinates accurate to within 3 metres. A stalker found them from it.",
        takeaway: "Most phones embed location unless you strip it.",
        colour: PURPLE,
      },
      {
        id: "CASE-003",
        title: "The quiz that wasn't",
        outcome: "A \"What's your vampire name?\" quiz asked for first pet, mother's maiden name, and birthday. Exactly the three answers most used as password-recovery security questions.",
        takeaway: "Fun quizzes are often data-harvesting in disguise.",
        colour: EMERALD,
      },
    ];
    return (
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <CommandHeading cmd="ls /archive/case_files/" />
        <div style={{ fontFamily: MONO, color: MUTED, fontSize: 13, marginBottom: 16 }}>
          Three real (anonymised) examples of digital footprints backfiring.
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {cases.map((c) => (
            <div
              key={c.id}
              style={{
                background: CARD,
                border: `1px solid ${c.colour}44`,
                borderLeft: `4px solid ${c.colour}`,
                borderRadius: 10,
                padding: "16px 18px",
                animation: "cxeFadeIn 0.45s ease-out both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 11, color: c.colour, letterSpacing: 1.5 }}>
                  {c.id}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: "#ef4444",
                    letterSpacing: 2,
                    padding: "2px 8px",
                    border: "1px solid #ef4444",
                    borderRadius: 4,
                  }}
                >
                  CLASSIFIED
                </span>
              </div>
              <h3 style={{ fontFamily: HEAD, fontSize: 18, color: "#f1f5f9", fontWeight: 700, margin: "0 0 8px" }}>
                {c.title}
              </h3>
              <p style={{ fontFamily: BODY, fontSize: 14, color: "#cbd5e1", lineHeight: 1.55, margin: "0 0 10px" }}>
                {c.outcome}
              </p>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: c.colour,
                  letterSpacing: 0.5,
                  paddingTop: 8,
                  borderTop: `1px dashed ${c.colour}33`,
                }}
              >
                <span style={{ color: MUTED }}>// takeaway: </span>
                {c.takeaway}
              </div>
            </div>
          ))}
        </div>
        <MentorTip message="These aren't edge cases. They're Tuesdays." />
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <PrimaryButton onClick={() => navigate(13)}>Next →</PrimaryButton>
        </div>
      </div>
    );
  };

  const S15 = () => {
    const accuracy = bossStats ? bossStats.accuracy : 100;
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <CommandHeading cmd="./mission --complete --reward" />
        <Terminal title="mission_complete.log">
          <div style={{ fontFamily: HEAD, fontSize: 28, fontWeight: 900, color: EMERALD, marginBottom: 6, letterSpacing: 0.5 }}>
            MISSION COMPLETE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: MUTED, marginBottom: 20 }}>
            // digital_identity_footprint.session = passed
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12,
              marginBottom: 22,
            }}
          >
            <Stat label="Accuracy" value={`${accuracy}%`} colour={CYAN} />
            <Stat label="XP Earned" value={lessonXp.toString()} colour={GOLD} />
            <Stat
              label="Best Combo"
              value={bossStats ? bossStats.combo.toString() : "0"}
              colour={PURPLE}
            />
          </div>
          <div
            style={{
              padding: 20,
              background: `${GOLD}0f`,
              border: `1px solid ${GOLD}66`,
              borderRadius: 12,
              marginBottom: 22,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 6 }}>
              // BADGE UNLOCKED
            </div>
            <div style={{ fontSize: 48, marginBottom: 4 }}>🕵️</div>
            <div style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 800, color: GOLD }}>
              Digital Footprint Detective
            </div>
          </div>
        </Terminal>
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <GhostButton onClick={() => (window.location.href = "/cyberexplorers")}>
            Return to Dashboard
          </GhostButton>
          <PrimaryButton onClick={() => { /* Week 2 placeholder */ }}>
            Start Week 2 (soon)
          </PrimaryButton>
        </div>
      </div>
    );
  };

  /* ───────── EXERCISE SCREENS (wrap existing exercises) ───────── */

  const renderScreen = (): React.ReactNode => {
    switch (screen) {
      case 0:
        return <S0 />;
      case 1:
        return <S1 />;
      case 2:
        return <S2 />;
      case 3:
        return (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <CommandHeading cmd="./scan --classify active|passive" />
            <div style={{ fontFamily: MONO, fontSize: 12, color: MUTED, marginBottom: 12 }}>
              // <span style={{ color: CYAN }}>STRONG</span> = ACTIVE footprint · <span style={{ color: "#fca5a5" }}>WEAK</span> = PASSIVE footprint
            </div>
            <CyberScanner
              passwords={SCAN_ITEMS}
              onComplete={() => navigate(4)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(3)}
            />
          </div>
        );
      case 4:
        return <S4 />;
      case 5:
        return (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <CommandHeading cmd="./shield --protect private_data" />
            <ProtectTheData
              items={PROTECT_ITEMS}
              onComplete={() => navigate(6)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(5)}
            />
          </div>
        );
      case 6:
        return <S6 />;
      case 7:
        return (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <CommandHeading cmd="./match --pairs concept:definition" />
            <MemoryMatch
              pairs={MATCH_PAIRS}
              onComplete={() => navigate(8)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(7)}
            />
          </div>
        );
      case 8:
        return <S8 />;
      case 9:
        return (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <CommandHeading cmd="./scenarios --run --mode=identity" />
            <ChooseYourPath
              scenarios={PATH_SCENARIOS}
              onComplete={() => navigate(10)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(9)}
            />
          </div>
        );
      case 10:
        return <S10 />;
      case 11:
        return (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <CommandHeading cmd="./firewall --build --policy=privacy" />
            <FirewallBuilder
              onComplete={() => navigate(12)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(11)}
            />
          </div>
        );
      case 12:
        return <S12 />;
      case 13:
        return (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <CommandHeading cmd="./maze --navigate --topic=footprint" />
            <CyberMaze
              questions={MAZE_QUESTIONS}
              onComplete={() => navigate(14)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(13)}
            />
          </div>
        );
      case 14:
        // Boss battle pre-screen — similar to Cyber Heroes, different boss name.
        if (bossDone) {
          return (
            <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
              <CommandHeading cmd="./boss_defeated --harvest_neutralised" />
              <Terminal title="data_harvester.defeated">
                <div style={{ fontSize: 72, marginBottom: 12 }}>🧠</div>
                <div
                  style={{
                    fontFamily: HEAD,
                    fontSize: 28,
                    fontWeight: 900,
                    background: `linear-gradient(135deg, ${CYAN}, ${EMERALD})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 10,
                  }}
                >
                  DATA HARVESTER DEFEATED
                </div>
                <div style={{ fontFamily: BODY, fontSize: 14, color: MUTED }}>
                  You mapped every attack vector and held the line. Mission logs sealed.
                </div>
              </Terminal>
              <div style={{ marginTop: 24 }}>
                <PrimaryButton onClick={() => navigate(15)}>Claim Reward →</PrimaryButton>
              </div>
            </div>
          );
        }
        return (
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <CommandHeading cmd="./engage --boss data_harvester" />
            <Terminal title="WARNING: hostile entity detected">
              <div style={{ fontSize: 84, marginBottom: 16 }}>🦝</div>
              <div
                style={{
                  fontFamily: HEAD,
                  fontSize: 36,
                  fontWeight: 900,
                  background: `linear-gradient(135deg, #ef4444, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 8,
                  letterSpacing: 1,
                }}
              >
                THE DATA HARVESTER
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: "#fca5a5", marginBottom: 20 }}>
                30 questions. 3 difficulty tiers. Miss too many and you're scraped.
              </div>
              <PrimaryButton onClick={() => { playSFX("transition"); setShowBossBattle(true); }}>
                START BATTLE →
              </PrimaryButton>
            </Terminal>
          </div>
        );
      case 15:
        return <S15 />;
      default:
        return <div>Unknown screen.</div>;
    }
  };

  /* ───────── LAYOUT ───────── */

  return (
    <div
      style={{
        background: BG,
        color: "#e2e8f0",
        fontFamily: BODY,
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <MatrixBG />

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 24px 12px",
          borderBottom: `1px solid ${CYAN}22`,
          background: "rgba(10,14,26,0.75)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/cyberexplorers"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: CYAN,
              textDecoration: "none",
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ color: DIM }}>← </span>
            cd ../
          </Link>
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 12,
            }}
          >
            <span style={{ color: MUTED }}>
              <span style={{ color: CYAN }}>week</span> 01 / 12
            </span>
            <span style={{ color: DIM }}>·</span>
            <span style={{ color: MUTED }}>
              <span style={{ color: CYAN }}>screen</span> {screen + 1}/{TOTAL_SCREENS}
            </span>
            <span style={{ color: DIM }}>·</span>
            <span style={{ color: GOLD }}>
              <span style={{ color: MUTED }}>XP</span> {lessonXp}
            </span>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "10px auto 0" }}>
          <ProgressBar step={screen} total={TOTAL_SCREENS} />
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 20px 80px",
        }}
      >
        <ExerciseErrorBoundary
          key={screen}
          onSkip={() => navigate(Math.min(TOTAL_SCREENS - 1, screen + 1))}
        >
          {renderScreen()}
        </ExerciseErrorBoundary>

        {/* Nav arrows (hidden on boss pre-screen + complete) */}
        {screen > 0 && screen !== 14 && screen !== 15 && (
          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 13,
              color: MUTED,
            }}
          >
            <button
              type="button"
              onClick={() => navigate(screen - 1)}
              style={{
                background: "transparent",
                border: `1px solid ${CYAN}33`,
                color: MUTED,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 12,
              }}
            >
              ← prev
            </button>
            <span style={{ color: DIM }}>
              use <span style={{ color: CYAN }}>← →</span> to navigate
            </span>
            <div style={{ width: 70 }} />
          </div>
        )}
      </main>

      {/* Boss battle overlay */}
      {showBossBattle && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
          <BossBattle
            bossName="THE DATA HARVESTER"
            questions={BOSS_QUESTIONS.map((q) => ({
              question: q.question,
              answers: q.answers,
              correctIndex: q.correctIndex,
            }))}
            onEnd={(won, stats) => {
              setShowBossBattle(false);
              setBossDone(true);
              setBossStats({
                combo: stats.combo ?? 0,
                accuracy: stats.accuracy ?? 0,
                xp: stats.xp ?? 0,
              });
              if (won) {
                awardXp(150);
                void correctAnswerBurst();
                void badgeEarnedCelebration();
              }
            }}
          />
        </div>
      )}

      {/* Level-up toast (minimal) */}
      {pendingLevelUp && (
        <div
          role="alert"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 32,
            transform: "translateX(-50%)",
            zIndex: 90,
            background: "rgba(10,14,26,0.95)",
            border: `1px solid ${GOLD}`,
            borderRadius: 12,
            padding: "14px 22px",
            boxShadow: `0 0 26px ${GOLD}66`,
            fontFamily: MONO,
            color: GOLD,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>⭐</span>
          <div>
            <div style={{ fontFamily: HEAD, fontWeight: 800 }}>RANK UP!</div>
            <div style={{ color: MUTED, fontSize: 12 }}>
              {pendingLevelUp.oldRank.name} → {pendingLevelUp.newRank.name}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPendingLevelUp(null)}
            style={{
              background: "transparent",
              border: `1px solid ${GOLD}55`,
              color: GOLD,
              fontFamily: MONO,
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, colour }: { label: string; value: string; colour: string }) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${colour}55`,
        borderRadius: 10,
        padding: "14px 16px",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          color: MUTED,
          letterSpacing: 2,
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: HEAD,
          fontSize: 24,
          fontWeight: 900,
          color: colour,
        }}
      >
        {value}
      </div>
    </div>
  );
}
