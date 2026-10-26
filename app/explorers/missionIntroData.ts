/**
 * Mission-intro briefings — the per-CASE equivalent of blockIntroData.ts's
 * block-level cards, one per mission, spoken by ATLAS (ARC Command), same
 * visual language as the block briefing but scoped to a single case: no
 * five-case preview grid (nothing to preview for one case), and the "by the
 * end you'll be able to" checklist is THAT case's own skill list instead of
 * an aggregate across five.
 *
 * Owner, 2026-10-25: "create one of these for the beginning of every single
 * mission... 20, each appropriate for the theme of the mission." Narrator =
 * ATLAS (owner's explicit call — previously ATLAS spoke 4 times total, once
 * per block; this means every mission opens on a short ATLAS brief before
 * WREN picks up for the case itself).
 *
 * Owner, 2026-10-26: "do it for all of them first — every single mission I
 * start, I should see that screen." All 20 entries below. Content/theme for
 * every mission sourced from that mission's own case file (accent, matrix,
 * backdrop, skill titles, villain) so the briefing is never guessing at what
 * the case actually teaches.
 */

import type { BackdropVariant } from "./BlockBackdrop";

export interface MissionTheme {
  accent: string;
  accentHi: string;
  accentRGB: string;
  classification: string;
  matrix: string[];
  backdrop: BackdropVariant;
}

export interface MissionIntroData {
  caseId: string;
  caseNumber: string;
  codename: string;
  title: string;
  thesis: string;
  realWorld: string;
  audio: string;
  /** The literal ElevenLabs script — see blockIntroData.ts's identical field
   *  for why this is kept as the source of truth alongside the clip. */
  voiceScript: string;
  skills: string[];
  beginLabel: string;
  theme: MissionTheme;
}

/* ----------------------------------------------------------- BLOCK 1 · SIGNAL ROOM · CONFIDENTIAL */

export const mission01Intro: MissionIntroData = {
  caseId: "explorers-m01",
  caseNumber: "CASE 001",
  codename: "PHANTOM HOOK",
  title: "Phishing",
  thesis: "One fake message, built to look exactly like the one you trust, and three seconds to make you click before you think.",
  realWorld:
    "Phishing is still the single most common way in — not a hack, just a message built to feel real enough that you act before you check. Learn how PHANTOM HOOK builds that message, and every copy of it stops working on you.",
  audio: "/audio/atlas/m01-brief.mp3",
  voiceScript:
    "[serious] Agent. PHANTOM HOOK doesn't break in, he gets invited in. One message, dressed as your bank, your school, your favourite app, built to make you move before you think. [determined] Today you learn to take that message apart: the address, the link, the pressure, all of it. [warm] WREN's got the first case open. [excited] Let's teach you to read past the disguise.",
  skills: [
    "Spot the pressure",
    "Take apart the address",
    "Check the sender",
    "Scan with care",
    "Don't download the trap",
    "Know the play",
    "If you get caught",
  ],
  beginLabel: "Begin Case 001 →",
  theme: {
    accent: "#34E1FF", accentHi: "#7FF0FF", accentRGB: "52, 225, 255",
    classification: "CONFIDENTIAL", matrix: ["#34E1FF", "#7FF0FF", "#3BF57E"], backdrop: "signals",
  },
};

export const mission02Intro: MissionIntroData = {
  caseId: "explorers-m02",
  caseNumber: "CASE 002",
  codename: "SIREN",
  title: "Too Good To Be True",
  thesis: "A prize with your name on it, ticking down, showing up in three places at once — and every bit of it built to collect, not to give.",
  realWorld:
    "SIREN's whole trick is flattery and a countdown: the second you believe you've won something, you stop checking anything. Spot the funnel and the gift stops working on you.",
  audio: "/audio/atlas/m02-brief.mp3",
  voiceScript:
    "[warm] Agent, welcome back. [serious] Meet SIREN — she doesn't threaten you, she flatters you. A prize, a gift, a clock running down, and a form waiting to collect. [determined] Today you trace the funnel from the bait to the form, and learn why 'free' always has a price. [excited] WREN's waiting in the Signal Room. Let's find the hook under the glitter.",
  skills: [
    "Too good to be true",
    "'Free' has a price",
    "The fake giveaway",
    "Follow the funnel",
    "Guard the form",
    "Know SIREN's play",
    "If you got reeled in",
  ],
  beginLabel: "Begin Case 002 →",
  theme: {
    accent: "#FF3DA6", accentHi: "#FFCC4D", accentRGB: "255, 61, 166",
    classification: "CONFIDENTIAL", matrix: ["#FF3DA6", "#FFCC4D", "#B85CFF"], backdrop: "prize",
  },
};

export const mission03Intro: MissionIntroData = {
  caseId: "explorers-m03",
  caseNumber: "CASE 003",
  codename: "SKELETON KEY",
  title: "The Guessing Game",
  thesis: "One rig, millions of guesses a second, built entirely out of your own life — your pet's name, your birthday, the password you've used since forever.",
  realWorld:
    "SKELETON KEY doesn't need to trick you if your password is guessable. Length and randomness beat cleverness every time — three random words will outlast anything you could 'cleverly' make up.",
  audio: "/audio/atlas/m03-brief.mp3",
  voiceScript:
    "[serious] Agent, SKELETON KEY is back, and he's not guessing blind, he's guessing YOU. Pet names, birthdays, old passwords, he feeds it all into the rig and waits. [determined] Today you learn his math, and build a password his machine can't crack: long, random, and nothing it can scrape off you. [warm] WREN's got the Signal Room standing by. [excited] Let's lock every door he thinks he knows.",
  skills: [
    "How the rig guesses",
    "The ingredients you hand it",
    "One key, every door",
    "Length beats cleverness",
    "Three random words",
    "Know SKELETON KEY's play",
    "Lock every door",
  ],
  beginLabel: "Begin Case 003 →",
  theme: {
    accent: "#3BF57E", accentHi: "#B9FFD0", accentRGB: "59, 245, 126",
    classification: "CONFIDENTIAL", matrix: ["#3BF57E", "#8Cff9f", "#1FB45A"], backdrop: "crack",
  },
};

export const mission04Intro: MissionIntroData = {
  caseId: "explorers-m04",
  caseNumber: "CASE 004",
  codename: "PACKRAT",
  title: "The Puzzle You Posted",
  thesis: "He never breaks in. He just collects what you post, piece by piece, until the pieces make a file worth selling.",
  realWorld:
    "PACKRAT's attack has no hacking in it at all — just patience, and the crumbs people hand out for free in photos, quizzes, and posts. Scrub the trail and there's nothing left for him to assemble.",
  audio: "/audio/atlas/m04-brief.mp3",
  voiceScript:
    "[serious] Agent, PACKRAT doesn't break locks, he picks up what falls outside them. A handle here, a photo there, a quiz that asks one question too many, and he builds a file. [determined] Today you learn to read a photo the way he does, and scrub your trail before he can stack it. [warm] WREN's holding the next piece of evidence. [excited] Let's make sure PACKRAT's file on you stays empty.",
  skills: [
    "The assembly attack",
    "Read the photo",
    "The fun quiz that isn't",
    "Scrub the post",
    "Scrub by priority",
    "Know PACKRAT's play",
    "Lock down your trail",
  ],
  beginLabel: "Begin Case 004 →",
  theme: {
    accent: "#FFB23E", accentHi: "#FFD98A", accentRGB: "255, 178, 62",
    classification: "CONFIDENTIAL", matrix: ["#FF6B57", "#FFB23E", "#FFD98A"], backdrop: "pinboard",
  },
};

export const mission05Intro: MissionIntroData = {
  caseId: "explorers-m05",
  caseNumber: "CASE 005",
  codename: "PHANTOM HOOK",
  title: "Signal Storm",
  thesis: "Same trick, three costumes, three hundred targets at once — and one of them was built just for you.",
  realWorld:
    "A real attack rarely stops at one message. It fires the same trick across every channel you own, spoofing senders and mixing in one personal, researched spear among the spray. Reading addresses, not names, catches all of it.",
  audio: "/audio/atlas/m05-brief.mp3",
  voiceScript:
    "[serious] Agent, PHANTOM HOOK is back, and this time he's not firing once, he's firing everywhere at once. Email, text, a QR code on a poster, and somewhere in the spray, one message built just for you. [determined] Today you close out the Signal Room: read the address, not the name, and triage the storm by danger, not by noise. [warm] WREN's running every channel live. [excited] Let's catch the spear hiding in the spray.",
  skills: [
    "The costume change",
    "Read the address, not the name",
    "The QR costume",
    "Spray vs spear",
    "Work the queue",
    "Know PHANTOM HOOK's play",
    "The two-check habit",
  ],
  beginLabel: "Begin Case 005 →",
  theme: {
    accent: "#FF5A5F", accentHi: "#FF9AA0", accentRGB: "255, 90, 95",
    classification: "CONFIDENTIAL", matrix: ["#FF5A5F", "#B85CFF", "#FF9AA0"], backdrop: "storm",
  },
};

/* ----------------------------------------------------------- BLOCK 2 · PHONE · SECRET */

export const mission06Intro: MissionIntroData = {
  caseId: "explorers-m06",
  caseNumber: "CASE 006",
  codename: "SIREN",
  title: "Levers",
  thesis: "Every message that moves you fast is pulling a lever on purpose — flattery, urgency, guilt, a gift with a string attached.",
  realWorld:
    "Manipulation in a DM follows a short list of levers, used again and again because they work. Name the lever while it's being pulled, and it stops working on you.",
  audio: "/audio/atlas/m06-brief.mp3",
  voiceScript:
    "[serious] Agent, SIREN's moved into your messages. Every line she sends is pulling a lever on you, on purpose, flattery, urgency, a gift that isn't free. [determined] Today you learn to name the lever the second it's pulled, and read one move ahead of her. [warm] WREN's in the thread with you. [excited] Let's see through every message she sends.",
  skills: [
    "Spot the lever",
    "Levers stack",
    "The gift with a string",
    "Verify another channel",
    "Read one move ahead",
    "Know SIREN's play",
    "Walk away clean",
  ],
  beginLabel: "Begin Case 006 →",
  theme: {
    accent: "#FF3D8A", accentHi: "#FF74AE", accentRGB: "255, 61, 138",
    classification: "SECRET", matrix: ["#FF3D8A", "#FF74AE", "#C355FF"], backdrop: "ripple",
  },
};

export const mission07Intro: MissionIntroData = {
  caseId: "explorers-m07",
  caseNumber: "CASE 007",
  codename: "MIMIC",
  title: "Borrowed Faces",
  thesis: "The account is real. The face is real. The person typing isn't your friend anymore — it's MIMIC, wearing them.",
  realWorld:
    "Account takeovers let an attacker message you from a face you already trust, which is exactly why 'it looked like them' isn't proof. A question only the real friend knows, checked on another channel, is.",
  audio: "/audio/atlas/m07-brief.mp3",
  voiceScript:
    "[serious] Agent, meet MIMIC. He doesn't fake a face, he STEALS one, a real friend's real account, now typing to you with a weird ask. [determined] Today you learn that trust doesn't transfer with the account, and build the one question MIMIC can never answer. [warm] WREN's standing by in the thread. [excited] Let's find out who's really on the other end.",
  skills: [
    "Trust doesn't transfer",
    "The weird ask",
    "Verify another channel",
    "The check-question",
    "Read the dodge",
    "Know MIMIC's play",
    "Protect and warn",
  ],
  beginLabel: "Begin Case 007 →",
  theme: {
    accent: "#9B7BFF", accentHi: "#C4B2FF", accentRGB: "155, 123, 255",
    classification: "SECRET", matrix: ["#9B7BFF", "#C4B2FF", "#6B4FE0"], backdrop: "loop",
  },
};

export const mission08Intro: MissionIntroData = {
  caseId: "explorers-m08",
  caseNumber: "CASE 008",
  codename: "GHOSTWRITER",
  title: "The Perfect Message",
  thesis: "Flawless, warm, personal-sounding, and written by a machine that's never met you — polish like that proves nothing.",
  realWorld:
    "AI-written messages can sound warmer and more convincing than a real friend's typo-filled text, which makes polish a terrible way to judge anything. Verify by source, not by how good it sounds.",
  audio: "/audio/atlas/m08-brief.mp3",
  voiceScript:
    "[serious] Agent, GHOSTWRITER doesn't make mistakes, that's the problem. Every message is flawless, warm, written at scale by a machine with no history with you at all. [determined] Today you learn the clues a machine still leaks, and how to verify by source, never by vibe. [warm] WREN's got the next message queued. [excited] Let's read past the polish.",
  skills: [
    "Polish proves nothing",
    "Written for everyone",
    "Warmth without history",
    "Verify by source, not style",
    "Predict the ask",
    "Know GHOSTWRITER's play",
    "Don't trust the vibe",
  ],
  beginLabel: "Begin Case 008 →",
  theme: {
    accent: "#FF7A4D", accentHi: "#FFB088", accentRGB: "255, 122, 77",
    classification: "SECRET", matrix: ["#FF7A4D", "#FFB088", "#FF9A4D"], backdrop: "glint",
  },
};

export const mission09Intro: MissionIntroData = {
  caseId: "explorers-m09",
  caseNumber: "CASE 009",
  codename: "SIREN",
  title: "The Long Game",
  thesis: "Not one message, weeks of them — warmth first, a gift, then the ask, and finally the turn you were never meant to see coming.",
  realWorld:
    "The slowest scams are the most convincing because trust is built for weeks before the ask ever appears. Laying the whole thing on a timeline is how you spot the turn in time, and exit without shame.",
  audio: "/audio/atlas/m09-brief.mp3",
  voiceScript:
    "[serious] Agent, SIREN's playing the long game now, weeks of warmth, building trust before she ever asks for anything. [determined] Today you learn to lay the whole con on a timeline, spot the exact moment it turns, and exit clean, no shame, ever. [warm] WREN's ready to walk it with you. [excited] Let's see the whole game, not just one message.",
  skills: [
    "Scams are a business",
    "Trust-farming",
    "The sunk-cost trap",
    "Trace the timeline",
    "Spot the turn",
    "Exit without shame",
    "The pause-and-tell rule",
  ],
  beginLabel: "Begin Case 009 →",
  theme: {
    accent: "#FFB13D", accentHi: "#FFD27A", accentRGB: "255, 177, 61",
    classification: "SECRET", matrix: ["#FFB13D", "#FFD27A", "#FF9A3D"], backdrop: "bond",
  },
};

export const mission10Intro: MissionIntroData = {
  caseId: "explorers-m10",
  caseNumber: "CASE 010",
  codename: "MIMIC",
  title: "The Voice",
  thesis: "A voice you'd know anywhere, saying exactly the right thing — except it isn't them, it's a clone built from scraps.",
  realWorld:
    "Voice cloning means a familiar voice is no longer proof of anything; one real call can be enough to build the clone that calls you next asking for help. A family code word beats any ear test.",
  audio: "/audio/atlas/m10-brief.mp3",
  voiceScript:
    "[serious] Agent, this is MIMIC's last trick, and it's his biggest: a cloned voice, built from scraps of someone you love, calling to ask for help. [determined] Today you learn why spotting the fake won't save you, and build the one thing that will, your family's code word. [warm] WREN's got the final call queued. [excited] Let's close out the Human Factor, and make sure no voice can fool you again.",
  skills: [
    "The cloned voice",
    "Why spotting won't save you",
    "Verify, don't spot",
    "The family code word",
    "Predict the clone's ask",
    "Know MIMIC's play",
    "Stay calm, run the protocol",
  ],
  beginLabel: "Begin Case 010 →",
  theme: {
    accent: "#35C777", accentHi: "#7AF0B0", accentRGB: "53, 199, 119",
    classification: "SECRET", matrix: ["#35C777", "#7AF0B0", "#1F9A5C"], backdrop: "ringer",
  },
};

/* ----------------------------------------------------------- BLOCK 3 · CONSOLE · TOP SECRET */

export const mission11Intro: MissionIntroData = {
  caseId: "explorers-m11",
  caseNumber: "CASE 011",
  codename: "SKELETON KEY",
  title: "The Master Key",
  thesis: "One machine, millions of guesses a second, and every password you own in its sights.",
  realWorld:
    "This is the single most common break-in there is — not a clever trick, just a machine trying password after password until one works. Build a vault that doesn't crack, and this attack fails before it starts.",
  audio: "/audio/atlas/m11-brief.mp3",
  voiceScript:
    "[serious] Agent. SKELETON KEY doesn't guess, it grinds. Millions of attempts a second, every password you've ever reused, every weak one you thought was clever enough. [determined] Today you stop being a guessable target. You're going to build a vault: one master key strong enough to hold forty-one others, and a second lock that turns a stolen password into a dead end. [warm] WREN's got the console ready. [excited] Let's build something that holds.",
  skills: [
    "Why your brain can't do this",
    "Build the master passphrase",
    "Let the vault do the rest",
    "The second lock (2FA)",
    "A code is a key",
    "Know SKELETON KEY's play",
    "Turn it on today",
  ],
  beginLabel: "Begin Case 011 →",
  theme: {
    accent: "#2DD4BF",
    accentHi: "#7FEFE2",
    accentRGB: "45, 212, 191",
    classification: "TOP SECRET",
    matrix: ["#2DD4BF", "#7FEFE2", "#17A398"],
    backdrop: "vault",
  },
};

export const mission12Intro: MissionIntroData = {
  caseId: "explorers-m12",
  caseNumber: "CASE 012",
  codename: "PACKRAT",
  title: "Unreadable",
  thesis: "He's not stealing your account anymore — he's sitting on the network, reading every unlocked message that passes by.",
  realWorld:
    "Open wi-fi and unencrypted traffic let anyone nearby read what you send, no password theft required. Seal the channel and PACKRAT gets nothing but gibberish.",
  audio: "/audio/atlas/m12-brief.mp3",
  voiceScript:
    "[serious] Agent, PACKRAT's changed tactics. He's not stealing your account, he's sitting quietly on the network, reading everything that isn't sealed. [determined] Today you learn codes, keys, and how to send a message only the right person can read. [warm] WREN's got the console live. [excited] Let's make your words unreadable to everyone but the person they're for.",
  skills: [
    "Scramble it with a key",
    "Why real codes hold",
    "The padlock",
    "Postcards vs envelopes",
    "Who's on the wi-fi",
    "Know PACKRAT's play",
    "Seal your traffic",
  ],
  beginLabel: "Begin Case 012 →",
  theme: {
    accent: "#9B59F6", accentHi: "#C4A0FF", accentRGB: "155, 89, 246",
    classification: "TOP SECRET", matrix: ["#9B59F6", "#C4A0FF", "#6B2FD6"], backdrop: "cipher",
  },
};

export const mission13Intro: MissionIntroData = {
  caseId: "explorers-m13",
  caseNumber: "CASE 013",
  codename: "SKELETON KEY",
  title: "Backdoors",
  thesis: "He's done guessing your password — now he's after the back door: the recovery questions that give him a way back in.",
  realWorld:
    "Account recovery is often the weakest lock on the door — guessable security answers and stale recovery details let an attacker back in long after the front door's secure. Fresh, unguessable recovery closes it.",
  audio: "/audio/atlas/m13-brief.mp3",
  voiceScript:
    "[serious] Agent, SKELETON KEY's given up on your front door, he's after the back one: account recovery. Guessable answers, stale details, a session nobody logged out. [determined] Today you slam every side door shut: strong recovery answers, fresh details, no strangers left logged in. [warm] WREN's got the console ready. [excited] Let's leave him nothing to walk through.",
  skills: [
    "The back door",
    "Guessable answers",
    "Answers can be lies",
    "Keep recovery fresh",
    "Log out the strangers",
    "Know SKELETON KEY's play",
    "Slam the side door",
  ],
  beginLabel: "Begin Case 013 →",
  theme: {
    accent: "#FF4D5E", accentHi: "#FF8A94", accentRGB: "255, 77, 94",
    classification: "TOP SECRET", matrix: ["#FF4D5E", "#FF8A94", "#C62828"], backdrop: "backdoor",
  },
};

export const mission14Intro: MissionIntroData = {
  caseId: "explorers-m14",
  caseNumber: "CASE 014",
  codename: "GHOSTWRITER",
  title: "The Update Trap",
  thesis: "A download isn't just a file, it's a set of powers you hand over — and GHOSTWRITER's disguised his as the update you were waiting for.",
  realWorld:
    "Malware disguised as a real installer or urgent update is one of the most effective ways onto a device, because the download LOOKS legitimate. Checking what powers you're actually granting catches it before it runs.",
  audio: "/audio/atlas/m14-brief.mp3",
  voiceScript:
    "[serious] Agent, GHOSTWRITER's gone quiet and clever: no message this time, just a fake installer dressed exactly like the real update you were waiting for. [determined] Today you learn that a download is a set of powers, grant only what fits, and keep real updates as your armour. [warm] WREN's got a batch of installs waiting on the console. [excited] Let's install smart, and catch what he's hiding.",
  skills: [
    "A download is powers",
    "Does it need that?",
    "Grant only what fits",
    "Updates are armour",
    "The fake installer",
    "Know GHOSTWRITER's play",
    "Install smart",
  ],
  beginLabel: "Begin Case 014 →",
  theme: {
    accent: "#3ECF8E", accentHi: "#8CFFC1", accentRGB: "62, 207, 142",
    classification: "TOP SECRET", matrix: ["#3ECF8E", "#8CFFC1", "#1FA36A"], backdrop: "install",
  },
};

export const mission15Intro: MissionIntroData = {
  caseId: "explorers-m15",
  caseNumber: "CASE 015",
  codename: "MIMIC",
  title: "The Real Site",
  thesis: "The page is pixel-perfect. The login box works. Everything about it is real — except the address, which was never yours to trust.",
  realWorld:
    "A fake login page can be a flawless copy, which means looks can't authenticate anything — only the address bar can, and a password manager that refuses to autofill is the lie detector that catches the swap.",
  audio: "/audio/atlas/m15-brief.mp3",
  voiceScript:
    "[serious] Agent, MIMIC's finest work yet: a login page so perfect you'd never spot it by eye. [determined] Today you learn the one thing that can't be faked, the address bar, and why your password manager refusing to help is the loudest warning you'll get. [warm] WREN's got the console lit up with five doors. [excited] Let's close out Systems, and find the one real site among them.",
  skills: [
    "A fake can look perfect",
    "The address bar is the truth",
    "Read the address, not the page",
    "The manager is a lie detector",
    "Don't be sent, arrive",
    "Know MIMIC's play",
    "Trust the tools",
  ],
  beginLabel: "Begin Case 015 →",
  theme: {
    accent: "#3B9EFF", accentHi: "#8CC8FF", accentRGB: "59, 158, 255",
    classification: "TOP SECRET", matrix: ["#3B9EFF", "#8CC8FF", "#1F6FD6"], backdrop: "browser",
  },
};

/* ----------------------------------------------------------- BLOCK 4 · WAR ROOM · ULTRA */

export const mission16Intro: MissionIntroData = {
  caseId: "explorers-m16",
  caseNumber: "CASE 016",
  codename: "PACKRAT",
  title: "The File On You",
  thesis: "Every account, every app, every quiz you've ever answered — somewhere, it's all compiled into one file, and PACKRAT's been building yours for years.",
  realWorld:
    "Data brokers and scattered permissions quietly assemble a detailed file on almost everyone, built from sign-ups most people forgot they made. A self-audit and real takedown requests are the only way to shrink it.",
  audio: "/audio/atlas/m16-brief.mp3",
  voiceScript:
    "[serious] Agent, step up to the board. PACKRAT's spent this whole case building a file, your file, out of every account and quiz you forgot you answered. [determined] Today you audit your own trail, cut what you don't need, and ask companies to delete the rest. [warm] WREN's got the evidence board lit. [excited] Let's take your file back.",
  skills: [
    "The data economy",
    "What's in your file",
    "Audit your own trail",
    "Cut it down",
    "Ask it down",
    "Know PACKRAT's play",
    "Own your trail",
  ],
  beginLabel: "Begin Case 016 →",
  theme: {
    accent: "#FFC43D", accentHi: "#FFE08A", accentRGB: "255, 196, 61",
    classification: "ULTRA", matrix: ["#FFC43D", "#FFE08A", "#FF9A4D"], backdrop: "harvest",
  },
};

export const mission17Intro: MissionIntroData = {
  caseId: "explorers-m17",
  caseNumber: "CASE 017",
  codename: "GHOSTWRITER",
  title: "Ghost Stories",
  thesis: "The video looks real. The quote looks real. The only way to know for sure is to stop looking AT it and start looking AROUND it.",
  realWorld:
    "Convincing fakes are cheap to make now, which means spotting tells by eye is no longer reliable — lateral reading, leaving the page to check elsewhere, and tracing to the original source are what actually work.",
  audio: "/audio/atlas/m17-brief.mp3",
  voiceScript:
    "[serious] Agent, GHOSTWRITER's moved into video and headlines now, and the fakes are good, good enough that tells won't save you anymore. [determined] Today you learn to read sideways, leave the page, ask who benefits, and trace every story back to its original source. [warm] WREN's got the board full of rumours. [excited] Let's be the circuit breaker, not the next share.",
  skills: [
    "Fakes are cheap now",
    "Tells run out",
    "Read sideways",
    "Who benefits?",
    "Find the original",
    "Know GHOSTWRITER's play",
    "Be the circuit breaker",
  ],
  beginLabel: "Begin Case 017 →",
  theme: {
    accent: "#5FD3F3", accentHi: "#B4ECFF", accentRGB: "95, 211, 243",
    classification: "ULTRA", matrix: ["#5FD3F3", "#B4ECFF", "#2FA3D6"], backdrop: "deepfake",
  },
};

export const mission18Intro: MissionIntroData = {
  caseId: "explorers-m18",
  caseNumber: "CASE 018",
  codename: "THE RECRUITER",
  title: "The Recruiter",
  thesis: "A flattering message, a 'skill' you already have, and an offer that only makes sense if you don't ask who it's really for.",
  realWorld:
    "Real recruitment cons flatter a skilled kid with an 'exciting opportunity' that's actually asking them to do something harmful or illegal. Knowing your own line, and your exit to a trusted adult, is what keeps the offer from ever landing.",
  audio: "/audio/atlas/m18-brief.mp3",
  voiceScript:
    "[serious] Agent, someone's noticed your skills, and they're not the only ones who have. There's an offer waiting, built entirely out of the same levers you've already learned to spot. [determined] Today you learn white hat from black hat, read the red flags of a bad offer, and know your line before anyone asks you to cross it. [warm] WREN's got the message waiting on the board. [excited] Let's see exactly what's really being asked.",
  skills: [
    "Same skill, two paths",
    "White, grey, black",
    "Found a flaw? Report it",
    "The recruiter's levers",
    "Red flags of a bad offer",
    "Know the recruiter's play",
    "Your line, your exit",
  ],
  beginLabel: "Begin Case 018 →",
  theme: {
    accent: "#FF8A3D", accentHi: "#FFB988", accentRGB: "255, 138, 61",
    classification: "ULTRA", matrix: ["#FF8A3D", "#FFB988", "#D6601F"], backdrop: "crossroads",
  },
};

export const mission19Intro: MissionIntroData = {
  caseId: "explorers-m19",
  caseNumber: "CASE 019",
  codename: "ALL FREQUENCIES",
  title: "Static Rising",
  thesis: "No attack is just one trick. It's a chain — recon, lure, access, harvest, spread — and you've just been handed command.",
  realWorld:
    "Real breaches are rarely a single clever move; they're a staged campaign, and breaking the chain at any single link stops the whole operation. Defence in depth means no one failure ever ends the story.",
  audio: "/audio/atlas/m19-brief.mp3",
  voiceScript:
    "[serious] Agent, this is bigger than one actor. Every signature you've learned is firing at once, recon, lure, access, harvest, spread, a full campaign, and you're now incident commander. [determined] Today you learn to read the chain, break it at any link, and stack defence so deep no single failure gets through. [warm] WREN's got the board live with every frequency open. [excited] Let's take command.",
  skills: [
    "An attack is a chain",
    "Stage one: recon",
    "Stage two: the lure",
    "Stage three: access",
    "Stage four: harvest & spread",
    "Defence in depth",
    "Take command",
  ],
  beginLabel: "Begin Case 019 →",
  theme: {
    accent: "#E8384F", accentHi: "#FF8A94", accentRGB: "232, 56, 79",
    classification: "ULTRA", matrix: ["#E8384F", "#34E1FF", "#3BF57E", "#FFB23E", "#B98BFF"], backdrop: "convergence",
  },
};

export const mission20Intro: MissionIntroData = {
  caseId: "explorers-m20",
  caseNumber: "CASE 020",
  codename: "SIGNAL ZERO",
  title: "Signal Zero",
  thesis: "Five signatures. One coordinating hand. And the only move left is to do this one exactly right.",
  realWorld:
    "Every real investigation ends the same way an attack campaign does in training: by following the evidence to whoever's actually behind it, and handling the answer through the proper channel, not revenge. That's the whole Code.",
  audio: "/audio/atlas/m20-brief.mp3",
  voiceScript:
    "[serious] Agent, this is it, the capstone. Every signature you've ever faced, PHANTOM HOOK, PACKRAT, GHOSTWRITER, SIREN, MIMIC, all trace back to one hand behind the board. [determined] No new tricks today, just everything you know, recombined, to find out who's really been running this and why. [warm] WREN's got the full board open, every case, every clue. [excited] Let's finish this the right way, Agent. Signal Zero, go.",
  skills: [
    "Read the whole board",
    "The five signatures",
    "Follow the benefit",
    "One hand behind it",
    "The Code",
    "The turncoat",
    "Do it right",
  ],
  beginLabel: "Begin Case 020 →",
  theme: {
    accent: "#F0C14B", accentHi: "#FFE08A", accentRGB: "240, 193, 75",
    classification: "ULTRA", matrix: ["#F0C14B", "#FFE08A", "#C9A961"], backdrop: "unmask",
  },
};

export const MISSION_INTROS: Record<string, MissionIntroData> = {
  "explorers-m01": mission01Intro,
  "explorers-m02": mission02Intro,
  "explorers-m03": mission03Intro,
  "explorers-m04": mission04Intro,
  "explorers-m05": mission05Intro,
  "explorers-m06": mission06Intro,
  "explorers-m07": mission07Intro,
  "explorers-m08": mission08Intro,
  "explorers-m09": mission09Intro,
  "explorers-m10": mission10Intro,
  "explorers-m11": mission11Intro,
  "explorers-m12": mission12Intro,
  "explorers-m13": mission13Intro,
  "explorers-m14": mission14Intro,
  "explorers-m15": mission15Intro,
  "explorers-m16": mission16Intro,
  "explorers-m17": mission17Intro,
  "explorers-m18": mission18Intro,
  "explorers-m19": mission19Intro,
  "explorers-m20": mission20Intro,
};
