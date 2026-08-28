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
    "You've learned to read the machine. Now you learn to read the <b>person</b> — because the best attackers never touch your computer. They target the one thing no firewall protects.",
  audio: "/audio/atlas/block2.mp3",
  commander: { name: "ATLAS", org: "ARC COMMAND", signoff: "ATLAS · ARC Command · I'll be watching" },
  shift: {
    kicker: "The shift",
    lede: "In Block One you audited the evidence. Here, <em>you are the evidence.</em>",
    body:
      "Every case in this block is a person, not a file. They won't send you a dodgy link and hope. They'll message you like a friend, wait as long as it takes, and reach for a feeling instead of a password. <b>Polish won't save you and spelling won't give them away.</b> The only defence left is to know how you're being played, and to verify who you're really talking to.",
  },
  filesKicker: "What you'll face · five operators",
  files: [
    { caseNo: "CASE 006", codename: "SIREN", title: "Levers", blurb: "The six feelings every con pulls: hurry, scarcity, authority, liking, fear, payback. Feel one being pulled, and name it." },
    { caseNo: "CASE 007", codename: "MIMIC", title: "Borrowed Faces", blurb: "The message really is from your friend's account. Accounts get stolen; trust doesn't transfer. Check on another channel." },
    { caseNo: "CASE 008", codename: "GHOSTWRITER", title: "The Perfect Message", blurb: "Scams written by a machine, flawless and warm. The old tells are dead. From now on you verify by source, never by style." },
    { caseNo: "CASE 009", codename: "SIREN", title: "The Long Game", blurb: "A con that takes weeks and calls you a friend. Small gifts, slow trust, the 'you've come this far' trap, and how to walk out of it." },
    { caseNo: "CASE 010", codename: "MIMIC", title: "The Voice", blurb: "A phone call in a voice you love, that isn't them. Seconds of audio is all it takes to clone. The defence is a family code word." },
  ],
  ceremony: "Clear all five and your clearance rises to SECRET.",
  skills: [
    { name: "Name the lever", desc: "call the pressure out loud, and watch it stop working" },
    { name: "Verify by source", desc: "trust who a message is really from, not how good it looks" },
    { name: "Check another channel", desc: "a friend acting strange gets a call, not a reply" },
    { name: "Hold a code word", desc: "the one thing a cloned voice can never fake" },
    { name: "Walk away clean", desc: "leave any con mid-sentence, with nothing to be ashamed of" },
  ],
  handoff:
    "This is where nearly everyone gets caught. It's harder, it's personal, and from here, <em>WREN takes you into the field.</em>",
  beginLabel: "Begin Case 006 →",
  theme: {
    accent: "#D8432E",
    accentHi: "#EE6B54",
    accentRGB: "216, 67, 46",
    classification: "SECRET",
    matrix: ["#D8432E", "#FF3D7F", "#B98BFF"],
  },
};
