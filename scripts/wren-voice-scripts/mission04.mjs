/**
 * WREN's spoken scripts for Mission 04 ("The Puzzle You Posted"). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 * catchThem.voice.pass/fail reuse the shared m01-catch-pass/fail.mp3,
 * already regenerated — not included here.
 */
export const mission04VoiceScripts = {
  "/audio/wren/m04-transmission.mp3":
    "[serious] Agent, there's an auction running on a hidden channel, and the lot for sale is a file about a student. Her school, her schedule, her birthday, all of it. [concerned] Here's the thing. She never told anyone any of it. She posted it in pieces, all harmless on their own, and PACKRAT pocketed every crumb. [determined] He never broke in. He never had to. Tonight we learn how the pieces became a file, and make his file worthless.",

  "/audio/wren/m04-briefing.mp3":
    "[warm] Seven skills, then a test to close the case. [serious] One rule tonight, Agent. PACKRAT can only keep what you leave lying out. [excited] Ready?",

  // cycle 1 — the assembly attack
  "/audio/wren/m04-c1-b1.mp3":
    "[curious] One post on its own? PACKRAT can't do a thing with it. A handle. A team photo. A birthday joke. Each one is harmless.",
  "/audio/wren/m04-c1-b2.mp3":
    "[serious] That's exactly the trap. Every crumb feels too small to matter, so you drop it in public without a second thought.",
  "/audio/wren/m04-c1-b3.mp3":
    "[serious] But PACKRAT doesn't read one post. He STACKS them. A handle names your town. A photo names your school. A comment names your schedule. Alone, nothing. Stacked, a file. ARC calls it the assembly attack.",
  "/audio/wren/m04-c1-b4.mp3":
    "[determined] Tonight we run one ourselves, the safe way, on a volunteer's test account, with her say-so. Watch four harmless crumbs become a file, without anyone breaking into anything.",
  "/audio/wren/m04-c1-chk1-ok.mp3":
    "[proud] Exactly. On their own they are crumbs. Stacked, they hand a stranger a whole file. That is the assembly attack.",
  "/audio/wren/m04-c1-chk2-ok.mp3":
    "[proud] That is the whole trick. No break-in, just patience. He pockets each harmless crumb and stacks them into one file.",
  "/audio/wren/m04-c1-practice.mp3":
    "[excited] Now let's put it to work, Agent. The audit board is up next, a fresh trail of crumbs. [encouraging] Pin every one that feeds the file, then chain them in the order PACKRAT would.",
  "/audio/wren/m04-c1-play.mp3":
    "[curious] Audit board. Pin every crumb that feeds the file, then chain them in the order PACKRAT would.",

  // cycle 2 — read the photo
  "/audio/wren/m04-c2-b1.mp3":
    "[curious] A photo shows what you pointed it at. It also shows everything BEHIND it, and you stopped looking the second the smile was good.",
  "/audio/wren/m04-c2-b2.mp3":
    "[serious] Uniform crests that name your school. Street signs. House numbers. A reflection in a window. A landmark out the bus.",
  "/audio/wren/m04-c2-b3.mp3":
    "[serious] And underneath the whole thing, the location tag your phone stapled on automatically, without ever asking you.",
  "/audio/wren/m04-c2-b4.mp3":
    "[encouraging] You checked the smile. PACKRAT checked the background, and the tags. Same photo, two completely different reads.",
  "/audio/wren/m04-c2-chk1-ok.mp3":
    "[proud] Right. You checked the haircut. PACKRAT checks the shelf, the window, the letter on the desk. Same photo, a whole other read.",
  "/audio/wren/m04-c2-chk2-ok.mp3":
    "[proud] That is the silent one. The phone tags the exact spot without ever asking. Turn location tags off and that leak closes.",
  "/audio/wren/m04-c2-practice.mp3":
    "[excited] Now let's put it to work, Agent. Priya's match-day photo is up next, straight from the audit. [encouraging] Tap every leak hiding in it, not just the obvious one.",
  "/audio/wren/m04-c2-play.mp3":
    "[curious] Priya's match-day photo, from the audit. Tap every leak hiding in it. Some of what's in frame is just a nice picture.",
  "/audio/wren/m04-c2-review.mp3":
    "[proud] Three leaks, and not one of them in the caption she actually wrote. [warm] The crest, the sign, the silent tag. That's exactly why PACKRAT loves a photo.",

  // cycle 3 — the fun quiz trap
  "/audio/wren/m04-c3-b1.mp3":
    "[curious] PACKRAT's favourite trick isn't sneaky at all. It's FUN. 'Your superstar name is your first pet plus your street name!' Everyone joins in, laughing.",
  "/audio/wren/m04-c3-b2.mp3":
    "[warm] But look at what it's actually asking for. Your first pet. Your street. Your first school. Your mum's maiden name.",
  "/audio/wren/m04-c3-b3.mp3":
    "[serious] Those aren't random. They're the exact 'security questions' your bank and your apps use to check it's really you. You just posted the answers, as a joke, in public.",
  "/audio/wren/m04-c3-b4.mp3":
    "[determined] So when a quiz asks for a real FACT about your past, that's not a game. That's PACKRAT, holding out a bucket and hoping you fill it.",
  "/audio/wren/m04-c3-chk1-ok.mp3":
    "[proud] Spot on. Those are not random. They are the exact security answers that unlock accounts, and the quiz just got you to post them for laughs.",
  "/audio/wren/m04-c3-chk2-ok.mp3":
    "[proud] That is the safe one. It asks for an opinion, not a real fact from your life. The dangerous ones always fish for facts.",
  "/audio/wren/m04-c3-practice.mp3":
    "[excited] Now let's put it to work, Agent. A whole feed of 'fun' quizzes is waiting. [encouraging] Sort each one, harmless fun, or fishing for a real secret about you?",
  "/audio/wren/m04-c3-play.mp3":
    "[curious] A feed full of 'fun' quizzes. [determined] Sort each one, harmless fun, or is it fishing for a real secret about you?",

  // cycle 4 — scrub the post
  "/audio/wren/m04-c4-b1.mp3":
    "[warm] Here's the good news. You don't have to go silent to stay safe. You just have to scrub. Read a post before it goes up, the way PACKRAT will.",
  "/audio/wren/m04-c4-b2.mp3":
    "[encouraging] Some bits are completely fine. That you had a great game. That you're buzzing about it. Feelings give a stranger nothing.",
  "/audio/wren/m04-c4-b3.mp3":
    "[serious] But the WHERE and the WHEN? Your school's name, the street, 'every Tuesday at six', a live location? Those put a stranger at your door.",
  "/audio/wren/m04-c4-b4.mp3":
    "[determined] So black out the where-and-when, keep the feeling, and post THAT. Same fun, none of the map.",
  "/audio/wren/m04-c4-chk1-ok.mp3":
    "[proud] Exactly. Keep the excitement, black out the where-and-when. A stranger should learn she is happy, and nothing else.",
  "/audio/wren/m04-c4-chk2-ok.mp3":
    "[proud] That is the one. A feeling gives a stranger nothing to stand on. The other two hand over exactly where and when to find you.",
  "/audio/wren/m04-c4-practice.mp3":
    "[excited] Now let's put it to work, Agent. Priya's about to post something new. [encouraging] Black out every bit a stranger could use to find her in person, and leave the harmless bits alone.",
  "/audio/wren/m04-c4-play.mp3":
    "[serious] Priya's about to post this. Black out every bit a stranger could use to find her in person. Leave the harmless bits.",
  "/audio/wren/m04-c4-review.mp3":
    "[proud] That's scrubbed. The excitement stays, the map disappears. [warm] A stranger reading this now learns Priya is happy, and absolutely nothing else.",

  // cycle 5 — scrub by priority
  "/audio/wren/m04-c5-b1.mp3":
    "[curious] One thing makes assembly even easier for PACKRAT, the same handle everywhere. The same name on games, photos, and forums is one thread, tying every crumb together.",
  "/audio/wren/m04-c5-b2.mp3":
    "[warm] So you'd think, delete everything! But you can't delete the internet, and you don't need to. Panic is not a plan.",
  "/audio/wren/m04-c5-b3.mp3":
    "[encouraging] Analysts scrub by PRIORITY. Not the most embarrassing crumb. The most DANGEROUS one. The one that could put a stranger in front of you.",
  "/audio/wren/m04-c5-b4.mp3":
    "[determined] So which is that? Where you'll be, and when. A real-world place and time beats every other leak. That one comes down first, every single time.",
  "/audio/wren/m04-c5-chk1-ok.mp3":
    "[proud] Right first move. A real-world where-and-when beats every other leak. That one comes down first, then the rest.",
  "/audio/wren/m04-c5-chk2-ok.mp3":
    "[proud] That is it. Panic is not a plan. Scrub the most dangerous crumb first instead, calm and by priority.",
  "/audio/wren/m04-c5-practice.mp3":
    "[excited] Now let's put it to work, Agent. The audit's just flagged three loud crumbs, and Priya's got five minutes before practice. [encouraging] Read what's at stake, then make the call.",
  "/audio/wren/m04-c5-play.mp3":
    "[serious] The audit found three loud crumbs, and Priya has five minutes before practice. Make the call.",

  // cycle 6 — know PACKRAT's play
  "/audio/wren/m04-c6-b1.mp3":
    "[warm] Let's name PACKRAT's game so you see it coming. Move one, he COLLECTS. He never breaks into anything. He just saves every crumb you drop in public, and he keeps it forever.",
  "/audio/wren/m04-c6-b2.mp3":
    "[serious] Move two, he LINKS. The same handle on every app is a thread. He pulls it, and every crumb from every account comes along for the ride.",
  "/audio/wren/m04-c6-b3.mp3":
    "[serious] Move three, he ASSEMBLES and SELLS. Stacked crumbs become a file, a where, a when, a name, and he auctions it to whoever's buying.",
  "/audio/wren/m04-c6-b4.mp3":
    "[determined] And the counter to all of it? Give him nothing worth linking. Different handles, no where-and-when, backgrounds checked. An empty nest is a very bored magpie.",
  "/audio/wren/m04-c6-chk1-ok.mp3":
    "[proud] That is the thread he pulls. One handle links every account, so every crumb comes along together. Vary it and you cut the thread.",
  "/audio/wren/m04-c6-chk2-ok.mp3":
    "[proud] Correct. He never breaks in. He only collects, links, and sells what you already left lying out. That is the whole game.",
  "/audio/wren/m04-c6-practice.mp3":
    "[excited] Now let's put it to work, Agent. Here's tonight's evidence, laid out on the next screen. [determined] Tap the three moves that are really PACKRAT's, no more, no less.",
  "/audio/wren/m04-c6-play.mp3":
    "[determined] Here's the evidence from tonight. Tap the 3 moves that are really PACKRAT's.",

  // cycle 7 — lock down your trail
  "/audio/wren/m04-c7-b1.mp3":
    "[curious] So how do you starve the nest for good? A footprint clean-up, in four steps, and you can do it this week.",
  "/audio/wren/m04-c7-b2.mp3":
    "[determined] Step one, audit. Look at your last few posts the way PACKRAT does. Where's the where, the when, the school, the face in the background?",
  "/audio/wren/m04-c7-b3.mp3":
    "[warm] Steps two and three, kill location and go private. Turn location tags off, and set the accounts that don't need to be public, to private.",
  "/audio/wren/m04-c7-b4.mp3":
    "[encouraging] Step four, cut the thread. Use a different handle where you can, so your game name can't lead a stranger straight to your real one.",
  "/audio/wren/m04-c7-chk1-ok.mp3":
    "[proud] Right. You cannot scrub what you have not spotted. Look at your own posts first and find the leaks.",
  "/audio/wren/m04-c7-chk2-ok.mp3":
    "[proud] Exactly. It kills the silent geotag your phone adds on its own. One setting, and that leak is closed.",
  "/audio/wren/m04-c7-practice.mp3":
    "[excited] Now let's put it to work, Agent. Time to build Priya's footprint clean-up properly. [encouraging] For each step, pick the move that actually starves the nest.",
  "/audio/wren/m04-c7-play.mp3":
    "[determined] Build Priya's footprint clean-up. For each step, pick the move that actually starves the nest.",

  // the test
  "/audio/wren/m04-catch-intro.mp3":
    "[warm] Okay Agent, this is the real test. [serious] Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take what you learned about the nest, and work out an answer you've never seen before. [determined] I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. [encouraging] Take your time.",

  // debrief
  "/audio/wren/m04-debrief.mp3":
    "[proud] File closed, nest empty. [serious] Watch what you drop, Agent. [warm] Sign out.",
};
