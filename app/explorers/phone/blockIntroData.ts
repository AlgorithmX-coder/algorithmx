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

export interface BlockTheme {
  /** Classification accent (the block's identity colour). */
  accent: string;
  accentHi: string;
  /** "216, 67, 46" — the accent as an RGB triplet for glows. */
  accentRGB: string;
  classification: string;
  /** Code-rain colours behind the briefing, tinted to the block. */
  matrix: string[];
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
  commander: { name: string; org: string; signoff: string };
  shift: { kicker: string; lede: string; body: string };
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
  audio: "/audio/atlas/block2.mp3",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · I'll be watching" },
  shift: {
    kicker: "The shift",
    lede: "In Block One you audited the evidence. Here, <em>you are the evidence.</em>",
    body:
      "Every case in this block is a person, not a file. They won't send you a dodgy link and hope. They'll message you like a friend, wait as long as it takes, and reach for a feeling instead of a password. <b>Polish won't save you and spelling won't give them away.</b> The only defence left is to know how you're being played, and to verify who you're really talking to.",
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
  },
};

export const block1Intro: BlockIntroData = {
  block: "BLOCK ONE",
  title: ["Signals"],
  thesis:
    "Every scam has to reach you first, as a message, a link, a post. Learn to read it, and you'll spot the trap <b>before it springs.</b>",
  audio: "/audio/atlas/block1.mp3",
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
  },
};
