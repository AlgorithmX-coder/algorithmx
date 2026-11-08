/**
 * WREN's spoken scripts for Case 011 ("The Master Key", Block 3 opener, the
 * Console runtime). See mission01.mjs and mission06.mjs for conventions.
 *
 * Console's `toggle`/`build` interactions have a single ok/bad voice line
 * each (not one per option, unlike Phone's `choose`), so Console cases run
 * shorter than Phone cases (~52 lines here vs ~77-85). test.passVoice/
 * failVoice have no text field in case11.ts — recovered by transcription.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. SKELETON KEY is "he"; his rig is "it".
 */
export const mission11VoiceScripts = {
  "/audio/wren/m11c-open-0.mp3":
    "[serious] Notice something different, Agent? This is ARC's real systems console. It's built to look like the tools an attacker actually uses. The fastest way to learn to defend a system is to see it exactly the way someone trying to break in sees it. Everything you run here is authorised ARC work. You study the attack to build the defence, and you never attack anyone else's system.",
  "/audio/wren/m11c-open-1.mp3":
    "[serious] You've got new clearance, Agent, and a whole new job. There's no more reading messages, and no more dodging DMs. Now you're at the controls of the machine itself.",
  "/audio/wren/m11c-open-2.mp3":
    "[serious] SKELETON KEY is back. He's the one whose rig guesses passwords. Last time, you just watched it. This time, you're going to build the defences that stop it dead.",
  "/audio/wren/m11c-open-3.mp3":
    "[serious] You'll learn seven skills to lock every door you own, then face a boss and a test. Put your hands on the console, Agent. Let's build.",

  // skill 1 — why your brain can't do this
  "/audio/wren/m11c-s1-learn.mp3":
    "[warm] Let's start with the honest truth. To be safe, every account needs its own long, random password. That doesn't mean one clever password everywhere. It means a different strong one for each. And you've got dozens of accounts. Nobody, no human alive, can invent and remember forty-one random passwords. So we stop trying. This is a job for a tool, and I'll show you how to build one.",
  "/audio/wren/m11c-s1-ok.mp3":
    "[warm] Exactly. A password manager invents a long random password for every account and remembers all of them, so you don't have to. Your brain's job shrinks to remembering just one. That's the whole trick, and it's what we build next.",
  "/audio/wren/m11c-s1-bad.mp3":
    "[warm] One password everywhere is the master key SKELETON KEY dreams of. If he cracks it once, he opens everything. One unique password per account is the rule, and no human can do that alone. Try again.",
  "/audio/wren/m11c-s1-bad2.mp3":
    "[warm] A list anyone could find or lose isn't a vault. We want them generated and locked, not scribbled on paper. Try again.",
  "/audio/wren/m11c-s1-q2ok.mp3":
    "[warm] Right. There are too many, and there's no pattern to lean on. That is exactly why we hand the job to a tool.",
  "/audio/wren/m11c-s1-q3ok.mp3":
    "[warm] Exactly. The tool invents and remembers the forty-one. Your brain only keeps the one master key.",

  // skill 2 — build the master passphrase
  "/audio/wren/m11c-s2-learn.mp3":
    "[warm] A password manager locks all your passwords behind one master key, so that key has to be brilliant. It shouldn't be short and clever. It should be long and random. The strongest trick is a passphrase, which is several random, unrelated words strung together. It's long enough that a guessing rig would take centuries, but simple enough that you'll never forget it. Let's build one.",
  "/audio/wren/m11c-s2-ok.mp3":
    "[warm] Now that's a real master key. It's four random words a rig would take centuries to guess. But you'll picture a copper otter with a lantern in a galaxy, and never forget it. Long and random beats short and clever, every time.",
  "/audio/wren/m11c-s2-bad.mp3":
    "[warm] Be careful. Anything a rig can guess or a stranger can look up, like your birthday, a pet, or password123, weakens the whole vault. Pick only the long, random, unguessable parts.",
  "/audio/wren/m11c-s2-q2ok.mp3":
    "[warm] Yes. That's four random words a rig would take centuries to crack, and a picture you will never forget.",
  "/audio/wren/m11c-s2-q2bad.mp3":
    "[warm] A pet and a year are both easy to look up or guess. The master key has to be long and random. Try again.",
  "/audio/wren/m11c-s2-q2bad2.mp3":
    "[warm] Short and common is the first thing any rig tries. Reach for several random words instead. Try again.",
  "/audio/wren/m11c-s2-q3ok.mp3":
    "[warm] That is the recipe. Make it long and random, and never personal. Personal facts are the first thing a rig checks.",

  // skill 3 — let the vault do the rest
  "/audio/wren/m11c-s3-learn.mp3":
    "[warm] Your master key is set. Now comes the magic. From here, every time you make an account, the manager generates a brand-new random password, stores it, and fills it in for you. You never see it, never type it, and never reuse it. That's forty-one unique fortress passwords, and you only ever remember the one master. Watch it fill the vault.",
  "/audio/wren/m11c-s3-ok.mp3":
    "[warm] Perfect. That's the whole point of the vault. You never invent a password again. It makes one no human could guess, and remembers it so you don't have to.",
  "/audio/wren/m11c-s3-bad.mp3":
    "[warm] Never reuse the master. It's the one key to everything. Let the manager make a fresh, unique password instead. Try again.",
  "/audio/wren/m11c-s3-bad2.mp3":
    "[warm] That's back to the impossible human job. The manager exists so you never have to invent one again. Let it do the job. Try again.",
  "/audio/wren/m11c-s3-q2ok.mp3":
    "[warm] Right. It generates, stores and fills. That's three jobs off your plate, so you never type or reuse a password again.",
  "/audio/wren/m11c-s3-q3ok.mp3":
    "[warm] Exactly. It builds an unguessable one and remembers it, so your brain stays free for the master key alone.",

  // skill 4 — the second lock (2FA)
  "/audio/wren/m11c-s4-learn.mp3":
    "[warm] Even a perfect password can be phished or leaked. So we add a second lock, called two-factor authentication, or 2FA for short. Some apps call it two-step verification. It's a second key, usually a code on your phone, needed on top of the password. Now a thief with your password still can't get in, because they don't have your phone. It's the single strongest switch you can flip. So flip it on the accounts that matter most.",
  "/audio/wren/m11c-s4-ok.mp3":
    "[warm] They're locked down. Email matters most, because whoever controls your email can reset every other password you own. With 2FA on, a stolen password is just half a key. It won't open the door.",
  "/audio/wren/m11c-s4-bad.mp3":
    "[warm] Not quite. Turn the second lock on for all three, because these are the accounts a thief wants most. Email especially matters, because it's the master key to everything else.",
  "/audio/wren/m11c-s4-q2ok.mp3":
    "[warm] Exactly. The password is only half a key now. Without the code on your phone, the door stays shut.",
  "/audio/wren/m11c-s4-q2bad.mp3":
    "[warm] Not with 2FA on. The password alone is only half the key. They still need the code on your phone. Try again.",
  "/audio/wren/m11c-s4-q2bad2.mp3":
    "[warm] Nothing so dramatic happens. 2FA simply blocks the login until the second key is entered. Try again.",
  "/audio/wren/m11c-s4-q3ok.mp3":
    "[warm] Right. There are two keys now, something you know and something you have. A thief needs both, and they only ever get one.",

  // skill 5 — a code is a key
  "/audio/wren/m11c-s5-learn.mp3":
    "[warm] Here's one warning that comes with 2FA. That code on your phone is a key, the second key to your account. And you know the rule about keys from last block. Nobody real ever asks you for one, not the bank, not support, and not a friend. You only ever type a code into the login box yourself. Never read it out to a person. If anyone asks for your code, they're a thief, every single time.",
  "/audio/wren/m11c-s5-ok.mp3":
    "[warm] Exactly. Real security already knows the code, so they don't need you to read it back. Anyone asking for your code is trying to steal your second key. You never hand it over.",
  "/audio/wren/m11c-s5-bad.mp3":
    "[warm] That code is the only thing standing between a thief and your account. Read it out and you've handed them the second key. Never share it. Try again.",
  "/audio/wren/m11c-s5-bad2.mp3":
    "[warm] Any code you read to a person unlocks your account for them. Don't negotiate. Just refuse. Real security never asks. Try again.",
  "/audio/wren/m11c-s5-q2ok.mp3":
    "[warm] Right. The code only ever goes in the login box, and only you put it there. Anyone asking you to hand it over is a thief.",
  "/audio/wren/m11c-s5-q3ok.mp3":
    "[warm] Exactly. They already know it, so anyone who asks is after your second key. You never read it out.",

  // skill 6 — know SKELETON KEY's play
  "/audio/wren/m11c-s6-learn.mp3":
    "[warm] Here's SKELETON KEY's whole play, in four moves. First, he guesses or steals one password. Second, he tries that same password on all your other accounts, hoping you reused it. Third, if it works, he walks straight in. Fourth, he uses your email to reset everything else. Now look how your vault breaks it. Unique passwords kill the reuse, and 2FA kills the walk-in. You've beaten every move before it starts.",
  "/audio/wren/m11c-s6-ok.mp3":
    "[warm] That's the whole defence in one line. A unique password means a stolen one opens exactly one door, and 2FA means it can't even open that. The rig runs out of moves. That's what building defences that hold looks like.",
  "/audio/wren/m11c-s6-bad.mp3":
    "[warm] Don't rely on being fast. Rely on the locks. The real reason it stops is unique passwords plus 2FA. Try again.",
  "/audio/wren/m11c-s6-bad2.mp3":
    "[warm] A rig never gives up. It just fails. What makes it fail is your unique passwords and 2FA. Try again.",
  "/audio/wren/m11c-s6-q2ok.mp3":
    "[warm] Right. Unique passwords kill the reuse trick, and 2FA blocks the walk-in. Two switches beat all four of his moves.",
  "/audio/wren/m11c-s6-q3ok.mp3":
    "[warm] That's it. Unique means one stolen key opens one door, and 2FA means it can't even open that.",

  // skill 7 — turn it on today
  "/audio/wren/m11c-s7-learn.mp3":
    "[warm] This is the last skill, and it's a real-world one. None of this protects you until you actually switch it on. So here's your mission outside these walls. This week, turn on 2FA for your most important account, your email, with a parent or carer to help. Then, over time, let a password manager take over the rest. Knowing is good, but flipping the switch is what keeps you safe.",
  "/audio/wren/m11c-s7-ok.mp3":
    "[warm] That's the single best move you can make. Email resets everything else, so locking it with a second key protects your whole digital life. Do that one thing, and you're already ahead of most adults.",
  "/audio/wren/m11c-s7-bad.mp3":
    "[warm] That's not bad, but the biggest win is 2FA on your email, because it can reset every other account. Start there. Try again.",
  "/audio/wren/m11c-s7-bad2.mp3":
    "[warm] Understanding a lock doesn't lock the door. The protection only starts when you flip the switch. Pick the real action. Try again.",
  "/audio/wren/m11c-s7-q2ok.mp3":
    "[warm] Perfect. Put 2FA on your email first, then let a manager take over. Those are real switches, flipped for real.",
  "/audio/wren/m11c-s7-q3ok.mp3":
    "[warm] Right. Your email always comes first. Whoever holds your email can reset every other account you own.",

  // boss — "Locksmith's Nightmare"
  "/audio/wren/m11c-boss-intro.mp3":
    "[determined] This is it, Agent. SKELETON KEY has dusted off the cracking rig from Case 3 and pointed it straight at your accounts. There are no hints from me. You've built the defences, so now watch them work, and tell me exactly why the rig fails.",
  "/audio/wren/m11c-boss-win.mp3":
    "[proud] Watch that, Agent. The rig threw millions of guesses, a real leaked password, and even your email password, and it walked away with nothing. Unique passwords killed the reuse, and 2FA killed the last door. You didn't dodge SKELETON KEY this time. You built a wall he couldn't climb, and made him bounce off. That's what defences that hold look like.",

  // test — "Prove it"
  "/audio/wren/m11c-test-intro.mp3":
    "[warm] There's one last thing before I sign off your build, and that's the test. It's a fresh set with no hints, and you'll need to get most of them right. Put everything you just built to work. Ready?",
  "/audio/wren/m11c-test-pass.mp3":
    "[proud] Yes. You held every defence on your own. Your build is signed off, Agent. SKELETON KEY doesn't stand a chance against you now.",
  "/audio/wren/m11c-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
export const mission11Say = {
  "password123": "password one two three",
  "2FA": "two F A",
};
