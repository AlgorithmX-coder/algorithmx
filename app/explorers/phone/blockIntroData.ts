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
    "The best attackers never touch your computer. They come after the one thing no firewall protects: <b>you.</b>",
  audio: "/audio/atlas/block2.mp3",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · I'll be watching" },
  shift: {
    kicker: "The shift",
    lede: "In Block One you audited the evidence. Here, <em>you are the evidence.</em>",
    body:
      "Every case in this block is a person, not a file. They won't send you a dodgy link and hope. They'll message you like a friend, wait as long as it takes, and reach for a feeling instead of a password. <b>Polish won't save you and spelling won't give them away.</b> The only defence left is to know how you're being played, and to verify who you're really talking to.",
  },
  filesKicker: "Five operators. Five cases.",
  files: [
    { caseNo: "006", codename: "SIREN", title: "Levers", blurb: "The six feelings every con pulls." },
    { caseNo: "007", codename: "MIMIC", title: "Borrowed Faces", blurb: "Your friend's account, stolen." },
    { caseNo: "008", codename: "GHOSTWRITER", title: "The Perfect Message", blurb: "Flawless scams, written by AI." },
    { caseNo: "009", codename: "SIREN", title: "The Long Game", blurb: "The con that takes weeks." },
    { caseNo: "010", codename: "MIMIC", title: "The Voice", blurb: "A cloned voice on the phone." },
  ],
  ceremony: "Clear all five → SECRET clearance.",
  skills: [
    { name: "Name the lever", desc: "" },
    { name: "Verify by source", desc: "" },
    { name: "Check another channel", desc: "" },
    { name: "Hold a code word", desc: "" },
    { name: "Walk away clean", desc: "" },
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
