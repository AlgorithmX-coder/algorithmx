/**
 * Block-intro briefings — one strong, comprehensive opening per block, spoken by
 * ATLAS (ARC Command; a man's voice, distinct from WREN who is your field
 * partner). Each block's intro is THEMED to that block: the accent is its
 * classification colour and the code-rain is tinted to match.
 *
 *   Block 1 · Signals        · CONFIDENTIAL · blue   (M01-05)
 *   Block 2 · The Human Factor · SECRET     · red    (M06-10)  ← built
 *   Block 3 · Systems        · TOP SECRET   · amber  (M11-15)
 *   Block 4 · The Long Game  · ULTRA        · brass  (M16-20)
 */

import type { BackdropVariant } from "../BlockBackdrop";

export interface BlockTheme {
  /** Classification accent (the block's identity colour). */
  accent: string;
  accentHi: string;
  /** "216, 67, 46" — the accent as an RGB triplet for glows. */
  accentRGB: string;
  classification: string;
  /** Code-rain colours behind the briefing, tinted to the block. */
  matrix: string[];
  /** The living background "world" for this block (a distinct animation each). */
  backdrop: BackdropVariant;
}

export interface BlockFile {
  caseNo: string;
  codename: string;
  title: string;
  blurb: string;
}

export interface BlockIntroData {
  block: string;
  /** Title split into lines for the hero. */
  title: string[];
  thesis: string;
  audio: string;
  /**
   * The literal script fed to ElevenLabs for `audio` — NOT the same text as
   * `thesis`/`realWorld`/`shift`/`handoff` (those are the on-screen reading
   * copy). Until 2026-10-18 this script existed nowhere in the repo; the
   * only record of what ATLAS actually says was baked into the mp3 itself,
   * recovered here by transcription. Keep this in sync with `audio` so a
   * future re-record never has to reverse-engineer the clip again.
   * Bracketed words like [warm]/[serious] are ElevenLabs v3 delivery tags,
   * not spoken text.
   */
  voiceScript: string;
  commander: { name: string; org: string; signoff: string };
  shift: { kicker: string; lede: string; body: string };
  /** A short real-world hook that ties the block to real stakes out there. */
  realWorld?: string;
  filesKicker: string;
  files: BlockFile[];
  ceremony: string;
  skills: { name: string; desc: string }[];
  handoff: string; // may contain <em>…</em>
  beginLabel: string;
  theme: BlockTheme;
}

export const block2Intro: BlockIntroData = {
  block: "BLOCK TWO",
  title: ["The Human", "Factor"],
  thesis:
    "They won't try to hack your phone. They'll try to hack <b>you.</b>",
  realWorld:
    "This is where nearly everyone gets caught, because it never feels like an attack. It feels like a friend. Learn how you're played, and you stop being the easy target.",
  audio: "/audio/atlas/block2.mp3",
  voiceScript:
    "[warm] Agent, you've earned your next clearance, and believe me, you're going to need it. Up to now, you've learned to read the machine. [serious] From here, you learn to read the person, because the best attackers in the world never touch your computer. They go after the one thing no firewall can protect: you. This is Block Two: The Human Factor. Six pressure levers, stolen faces, perfect lies, and a voice on the phone you would swear you knew. [determined] It is harder than anything you have done. It is personal, and it is where nearly everyone gets caught. [warm] WREN takes you into the field. I will be right here. [serious] Don't let them in.",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · I'll be watching" },
  shift: {
    kicker: "The shift",
    lede: "In Block One you audited the evidence. Here, <em>you are the evidence.</em>",
    body:
      "Every case in this block is a person, not a file. They won't send you a dodgy link and hope. They'll message you like a friend, wait as long as it takes, and reach for a feeling instead of a password. <b>Polish won't save you, and spelling won't give them away.</b> The only defence left is to know how you're being played, and to verify who you're really talking to.",
  },
  filesKicker: "Five people are going to try to play you.",
  files: [
    { caseNo: "006", codename: "SIREN", title: "The Feels", blurb: "The 6 feelings that make you tap." },
    { caseNo: "007", codename: "MIMIC", title: "Borrowed Faces", blurb: "Your friend's account, stolen." },
    { caseNo: "008", codename: "GHOSTWRITER", title: "Too Perfect", blurb: "A scam with zero typos. AI wrote it." },
    { caseNo: "009", codename: "SIREN", title: "The Long Game", blurb: "A 'friend' who plays you for weeks." },
    { caseNo: "010", codename: "MIMIC", title: "Fake Voice", blurb: "A call in a voice you'd trust." },
  ],
  ceremony: "Clear all five → SECRET clearance.",
  skills: [
    { name: "Spot the trick", desc: "" },
    { name: "Check who it's really from", desc: "" },
    { name: "Ask them another way", desc: "" },
    { name: "Keep a secret code word", desc: "" },
    { name: "Walk away, no shame", desc: "" },
  ],
  handoff:
    "This is where nearly everyone gets caught. It's harder, it's personal, and from here, <em>WREN takes you into the field.</em>",
  beginLabel: "Begin Case 006 →",
  theme: {
    accent: "#FF3D8A",
    accentHi: "#FF74AE",
    accentRGB: "255, 61, 138",
    classification: "SECRET",
    matrix: ["#FF3D8A", "#FF74AE", "#C355FF"],
    backdrop: "human",
  },
};

export const block1Intro: BlockIntroData = {
  block: "BLOCK ONE",
  title: ["Signals"],
  thesis:
    "Every scam has to reach you first, as a message, a link, a post. Learn to read it, and you'll spot the trap <b>before it springs.</b>",
  realWorld:
    "Out there, this catches real people every single day, with nothing more than a message. You've dodged it so far. Now you'll understand it inside and out, so it never catches you for real.",
  audio: "/audio/atlas/block1.mp3",
  voiceScript:
    "[warm] Agent, welcome to the ARC. You're here because you can see what most people miss. Good, you're going to need it. [serious] Before anyone can steal a single thing from you, they have to reach you first, a message, a post, a link that looks completely normal. We call these signals. This is Block One: Signals. Five cases, and in every one, someone sends you something built to fool you. A fake message, a prize too good to be true, a password that falls in seconds. [determined] Your job is simple to say and hard to do. Read the signal, and spot the trap before it springs. [warm] Master this, and everything that comes after gets easier. WREN is waiting for you. [excited] Let's begin.",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · Start here" },
  shift: {
    kicker: "The job",
    lede: "Before anyone can steal a thing from you, they have to <em>reach you first.</em>",
    body:
      "Every attack starts as a signal: a message, a post, a link that looks completely normal. This block is five of them, and in each one someone sends you something built to fool you. Your job is simple to say and hard to do. Read the signal, and spot the trap before it springs.",
  },
  filesKicker: "Five cases. Five ways in.",
  files: [
    { caseNo: "001", codename: "PHANTOM HOOK", title: "The Fake Message", blurb: "A message pretending to be someone you trust." },
    { caseNo: "002", codename: "SIREN", title: "Too Good To Be True", blurb: "The prize that costs you everything." },
    { caseNo: "003", codename: "SKELETON KEY", title: "The Guessing Game", blurb: "How a machine cracks a weak password." },
    { caseNo: "004", codename: "PACKRAT", title: "The Puzzle You Posted", blurb: "What your posts quietly give away." },
    { caseNo: "005", codename: "PHANTOM HOOK", title: "Signal Storm", blurb: "One attack, aimed straight at you." },
  ],
  ceremony: "Clear all five → CONFIDENTIAL clearance.",
  skills: [
    { name: "Spot a fake message", desc: "" },
    { name: "Ignore a too-good offer", desc: "" },
    { name: "Build a strong password", desc: "" },
    { name: "See what you leak", desc: "" },
    { name: "Catch a targeted attack", desc: "" },
  ],
  handoff:
    "Master this, and everything that comes after gets easier. <em>WREN is waiting for you.</em>",
  beginLabel: "Begin Case 001 →",
  theme: {
    accent: "#34E1FF",
    accentHi: "#7FF0FF",
    accentRGB: "52, 225, 255",
    classification: "CONFIDENTIAL",
    matrix: ["#34E1FF", "#7FF0FF", "#3BF57E"],
    backdrop: "signals",
  },
};

export const block3Intro: BlockIntroData = {
  block: "BLOCK THREE",
  title: ["Systems"],
  thesis:
    "You've beaten the tricks. Now look under the hood: how the tech really works, and <b>where it breaks.</b>",
  realWorld:
    "Every account you own runs on systems like these. The people who break in understand exactly how they work. After this block, so do you — on a console built to look like the tools they use, because the fastest way to learn to defend a system is to see it exactly the way someone trying to break in sees it. Everything you run here is authorized ARC work, studying the attack to build the defence, never to attack anyone else's system.",
  audio: "/audio/atlas/block3.mp3",
  voiceScript:
    "[warm] Agent, you've learned to spot the trick, and to read the person. [serious] But every con eventually touches a machine, and machines have rules. This is Block Three: Systems. [serious] And from here, your console changes too. It's built to look like the tools ARC's own analysts use to study an attacker's methods, because the fastest way to learn to defend a system is to see it exactly the way someone trying to break in sees it. Every case on this console is authorized ARC work: studying the attack to build the defence, never to attack anyone else's system. [determined] Five cases on how the technology actually works, the locks, the networks, the hidden doors, and exactly where each one can be forced. Stop trusting the surface. Start understanding the wiring. Because once you can see how a system really works, you can see how it breaks, and how to defend it. [excited] Top secret clearance from here. WREN is ready.",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · Top clearance" },
  shift: {
    kicker: "The shift",
    lede: "Every con eventually touches a machine, and <em>machines have rules.</em>",
    body:
      "You've learned to read the message and the person. This block goes under the surface: the locks, the networks, the hidden doors. Five cases on how the technology actually works, and exactly where each part can be forced. <b>Your console changes too from here</b> — it's built to look like the tools ARC's own analysts use to study how an attacker thinks, because the fastest way to learn to defend a system is to see it exactly the way someone trying to break in sees it. Every case on it is authorized ARC work: studying the attack to build the defence, never to attack anyone else's system. Once you see how a system really works, you can see how it breaks, and how to defend it.",
  },
  filesKicker: "Five systems. Five weak points.",
  files: [
    { caseNo: "011", codename: "SKELETON KEY", title: "The Second Lock", blurb: "Why one password is never enough." },
    { caseNo: "012", codename: "PACKRAT", title: "The Listener", blurb: "Someone quietly reading your wi-fi." },
    { caseNo: "013", codename: "SKELETON KEY", title: "The Side Door", blurb: "The secret way back into a system." },
    { caseNo: "014", codename: "GHOSTWRITER", title: "The Trojan", blurb: "Malware hiding in something you want." },
    { caseNo: "015", codename: "MIMIC", title: "The Look-Alike", blurb: "A fake site dressed as the real one." },
  ],
  ceremony: "Clear all five → TOP SECRET clearance.",
  skills: [
    { name: "Lock down an account", desc: "" },
    { name: "Spot a fake network", desc: "" },
    { name: "Find the side door", desc: "" },
    { name: "Unmask a Trojan", desc: "" },
    { name: "Catch a look-alike site", desc: "" },
  ],
  handoff:
    "Stop trusting the surface. Start understanding the wiring — on a console built like the ones they use. <em>WREN's ready when you are.</em>",
  beginLabel: "Begin Case 011 →",
  theme: {
    accent: "#FFB23E",
    accentHi: "#FFD27A",
    accentRGB: "255, 178, 62",
    classification: "TOP SECRET",
    matrix: ["#FFB23E", "#FFD27A", "#FF7A3E"],
    backdrop: "systems",
  },
};

export const block4Intro: BlockIntroData = {
  block: "BLOCK FOUR",
  title: ["The Long", "Game"],
  thesis:
    "One attacker was never the whole story. This is the operation behind it, and <b>the mind running it.</b>",
  realWorld:
    "Real operations are never one move. They're patient, linked, and run top-down. Read the whole board, and unmask who's really running it.",
  audio: "/audio/atlas/block4.mp3",
  voiceScript:
    "[serious] Agent, every op so far was one piece of something bigger. [warm] This is Block Four, The Long Game, your highest clearance yet. Five cases, one operation: who's buying your data, what's real, and the mind running every attack you've faced. [determined] This is where an agent becomes an analyst. Read the whole board, find who's behind it. [excited] Signal zero. Let's finish this.",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · Highest clearance" },
  shift: {
    kicker: "The endgame",
    lede: "Every op you've run was <em>one person.</em>",
    body:
      "This is your highest clearance. Five cases, one operation: who's buying your data, what's real, and the mind running every attack you've faced. This is where an agent becomes an analyst. Read the whole board, find who's behind it.",
  },
  filesKicker: "Five cases. One mastermind.",
  files: [
    { caseNo: "016", codename: "PACKRAT", title: "Who Owns You", blurb: "The companies quietly buying your data." },
    { caseNo: "017", codename: "GHOSTWRITER", title: "Seeing Isn't Believing", blurb: "Faked faces, voices, and video." },
    { caseNo: "018", codename: "ZERO", title: "The Choice", blurb: "The line between hacker and criminal." },
    { caseNo: "019", codename: "ZERO", title: "The Whole Attack", blurb: "Every trick, linked into one." },
    { caseNo: "020", codename: "ZERO", title: "Signal Zero", blurb: "Unmask the mind behind it all." },
  ],
  ceremony: "Clear all five → ULTRA clearance.",
  skills: [
    { name: "See who buys your data", desc: "" },
    { name: "Spot a deepfake", desc: "" },
    { name: "Know the line you won't cross", desc: "" },
    { name: "Read a whole attack", desc: "" },
    { name: "Unmask the mastermind", desc: "" },
  ],
  handoff:
    "This is where a trainee becomes an operator. <em>Read the board. Then finish this.</em>",
  beginLabel: "Begin Case 016 →",
  theme: {
    accent: "#B98BFF",
    accentHi: "#D4B8FF",
    accentRGB: "185, 139, 255",
    classification: "ULTRA",
    matrix: ["#B98BFF", "#D4B8FF", "#7A5CFF"],
    backdrop: "network",
  },
};
