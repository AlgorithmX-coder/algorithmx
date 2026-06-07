"use client";

/**
 * TEMPORARY demo route for Phase 0 Batch 6 — view the engine-rebuilt
 * vault (`PasswordVaultV2`) in isolation with the real Week 1 lock data.
 *
 * Deleted in Batch 7 when the new vault is swapped into the live lesson.
 */

import PasswordVaultV2, {
  type PasswordVaultLock,
} from "@/app/components/exercises/PasswordVaultV2";

// Copied verbatim from app/lesson/weekContent/week1.ts (screen 6).
const LOCKS: PasswordVaultLock[] = [
  {
    id: "length",
    ruleLabel: "LENGTH",
    icon: "📏",
    prompt: "Which password is LONG enough?",
    speaker: "adam",
    choices: [
      { text: "cat", isCorrect: false, explanation: "Only 3 letters - way under the 8-character rule." },
      { text: "Tiger!7", isCorrect: false, explanation: "Only 7 characters. The rule is 8 OR MORE." },
      { text: "MyL0ng_Pass!", isCorrect: true, explanation: "" },
      { text: "abc", isCorrect: false, explanation: "Just 3 letters - cracked in less than a second." },
    ],
  },
  {
    id: "mix",
    ruleLabel: "MIX",
    icon: "🎨",
    prompt: "Which password mixes ALL the character types?",
    speaker: "layla",
    choices: [
      { text: "tigertigertiger", isCorrect: false, explanation: "All lowercase - no numbers, no symbols, no capitals." },
      { text: "Tr0pic4l$un!", isCorrect: true, explanation: "" },
      { text: "12345678", isCorrect: false, explanation: "Just numbers - no letters and no symbols." },
      { text: "ABCDEFGHIJ", isCorrect: false, explanation: "All capitals - no lowercase, no numbers, no symbols." },
    ],
  },
  {
    id: "personal",
    ruleLabel: "PERSONAL",
    icon: "🪪",
    prompt: "Which password does NOT use personal info?",
    speaker: "adam",
    choices: [
      { text: "Sam2014!", isCorrect: false, explanation: "That's a name and what looks like a birth year - easy for anyone who knows you." },
      { text: "Maya0511", isCorrect: false, explanation: "A name plus a date - hackers try names and birthdays first." },
      { text: "Volcano$Mango7", isCorrect: true, explanation: "" },
      { text: "Smith123", isCorrect: false, explanation: "That looks like a surname plus '123' - very easy to guess." },
    ],
  },
  {
    id: "common",
    ruleLabel: "COMMON",
    icon: "📕",
    prompt: "Which password is NOT in a hacker's top-guess list?",
    speaker: "layla",
    choices: [
      { text: "password", isCorrect: false, explanation: "Literally the #1 most-guessed password in the world." },
      { text: "qwerty", isCorrect: false, explanation: "Keyboard row in order - hackers try this in the first 5 attempts." },
      { text: "Compass!Otter9", isCorrect: true, explanation: "" },
      { text: "football", isCorrect: false, explanation: "Common dictionary word - top-100 every year." },
    ],
  },
  {
    id: "secret",
    ruleLabel: "SECRET",
    icon: "🤐",
    prompt: "Who should know your password?",
    speaker: "adam",
    choices: [
      { text: "Just my best friend", isCorrect: false, explanation: "Even best friends shouldn't know. Accounts get hacked that way." },
      { text: "Anyone who asks nicely", isCorrect: false, explanation: "Never. People who really need access ask a grown-up - not you." },
      { text: "Only me (and a parent)", isCorrect: true, explanation: "" },
      { text: "My whole class", isCorrect: false, explanation: "That's not a secret any more - that's a public announcement!" },
    ],
  },
];

const GUIDANCE = {
  intro: "Tap a glowing lock to begin.",
  progress: "Keep going - each rule opens a lock!",
  complete: "VAULT OPEN - the Raccoon can't get in!",
};

export default function VaultV2DemoPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(180deg, #050714 0%, #0a0e25 100%)",
      }}
    >
      <PasswordVaultV2
        locks={LOCKS}
        guidance={GUIDANCE}
        onComplete={(score) => console.log("[vault-v2] onComplete", score)}
        onCorrect={() => console.log("[vault-v2] onCorrect")}
        onWrong={() => console.log("[vault-v2] onWrong")}
        onHintReached={(tier) => console.log("[vault-v2] onHintReached", tier)}
        onAnswered={(d) => console.log("[vault-v2] onAnswered", d)}
      />
    </div>
  );
}
