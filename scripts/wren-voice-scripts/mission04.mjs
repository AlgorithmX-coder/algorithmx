/**
 * WREN's spoken scripts for Mission 04 ("The Puzzle You Posted"). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 * catchThem.voice.pass/fail reuse the shared m01-catch-pass/fail.mp3,
 * not included here.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress.
 */
export const mission04VoiceScripts = {
  "/audio/wren/m04-transmission.mp3":
    "[serious] Agent, there's an auction running on a hidden channel, and the lot for sale is a file about a student. It has her school, her schedule, her birthday, all of it. Here's the thing. She never told anyone any of it. She posted it in pieces, all harmless on their own, and PACKRAT pocketed every crumb. He never broke in. He never had to. Tonight we learn how the pieces became a file, and make his file worthless.",

  "/audio/wren/m04-briefing.mp3":
    "[warm] You'll learn seven skills, then take a test to close the case. There's one rule tonight, Agent. PACKRAT can only keep what you leave lying out. Ready?",

  // cycle 1 — the assembly attack
  "/audio/wren/m04-c1-b1.mp3":
    "[warm] What about one post on its own? PACKRAT can't do a thing with it. A handle, a team photo, or a birthday joke is harmless on its own.",
  "/audio/wren/m04-c1-b2.mp3":
    "[warm] That's exactly the trap. Every crumb feels too small to matter, so you drop it in public without a second thought.",
  "/audio/wren/m04-c1-b3.mp3":
    "[warm] But PACKRAT doesn't read one post. He stacks them. A handle names your town. A photo names your school. A comment names your schedule. On their own, they're nothing. Stacked together, they're a file. ARC calls it the assembly attack.",
  "/audio/wren/m04-c1-b4.mp3":
    "[warm] Tonight we run one ourselves, the safe way, on a volunteer's test account, with her say-so. Watch four harmless crumbs become a file, without anyone breaking into anything.",
  "/audio/wren/m04-c1-chk1-ok.mp3":
    "[warm] Exactly. On their own they are crumbs. Stacked, they hand a stranger a whole file. That is the assembly attack.",
  "/audio/wren/m04-c1-chk2-ok.mp3":
    "[warm] That is the whole trick. There's no break-in, just patience. He pockets each harmless crumb and stacks them into one file.",
  "/audio/wren/m04-c1-practice.mp3":
    "[warm] Now let's put it to work, Agent. The audit board is up next, with a fresh trail of crumbs. Pin every one that feeds the file, then chain them in the order PACKRAT would.",
  "/audio/wren/m04-c1-play.mp3":
    "[warm] Here's the audit board. Pin every crumb that feeds the file, then chain them in the order PACKRAT would.",

  // cycle 2 — read the photo
  "/audio/wren/m04-c2-b1.mp3":
    "[warm] A photo shows what you pointed it at. It also shows everything behind it, and you stopped looking the second the smile was good.",
  "/audio/wren/m04-c2-b2.mp3":
    "[warm] There are uniform crests that name your school. There are street signs, house numbers, a reflection in a shop window, and a landmark seen from the bus.",
  "/audio/wren/m04-c2-b3.mp3":
    "[warm] And underneath the whole thing is the location tag your phone stapled on automatically, without ever asking you.",
  "/audio/wren/m04-c2-b4.mp3":
    "[warm] You checked the smile. PACKRAT checked the background, and the tags. It's the same photo, with two completely different reads.",
  "/audio/wren/m04-c2-chk1-ok.mp3":
    "[warm] Right. You checked the haircut. PACKRAT checked the shelf, the window, and the letter on the desk. It's the same photo, with a whole other read.",
  "/audio/wren/m04-c2-chk2-ok.mp3":
    "[warm] That is the silent one. The phone tags the exact spot without ever asking. Turn location tags off and that leak closes.",
  "/audio/wren/m04-c2-practice.mp3":
    "[warm] Now let's put it to work, Agent. Priya's match-day photo is up next, straight from the audit. Tap every leak hiding in it, not just the obvious one.",
  "/audio/wren/m04-c2-play.mp3":
    "[warm] Here's Priya's match-day photo, from the audit. Tap every leak hiding in it. Some of what's in frame is just a nice picture.",
  "/audio/wren/m04-c2-review.mp3":
    "[warm] There were three leaks, and not one of them was in the caption she actually wrote. They were the crest, the sign, and the silent tag. That's exactly why PACKRAT loves a photo.",

  // cycle 3 — the fun quiz trap
  "/audio/wren/m04-c3-b1.mp3":
    "[warm] PACKRAT's favourite trick isn't sneaky at all. It's fun. A post says your superstar name is your first pet plus your street name, and everyone joins in, laughing.",
  "/audio/wren/m04-c3-b2.mp3":
    "[warm] But look at what it's actually asking for. It wants your first pet, your street, your first school, and your mum's maiden name.",
  "/audio/wren/m04-c3-b3.mp3":
    "[warm] Those aren't random. They're the exact security questions your bank and your apps use to check it's really you. You just posted the answers, as a joke, in public.",
  "/audio/wren/m04-c3-b4.mp3":
    "[warm] So when a quiz asks for a real fact about your past, that's not a game. That's PACKRAT, holding out a bucket and hoping you fill it.",
  "/audio/wren/m04-c3-chk1-ok.mp3":
    "[warm] Spot on. Those are not random. They are the exact security answers that unlock accounts, and the quiz just got you to post them for laughs.",
  "/audio/wren/m04-c3-chk2-ok.mp3":
    "[warm] That is the safe one. It asks for an opinion, not a real fact from your life. The dangerous ones always fish for facts.",
  "/audio/wren/m04-c3-practice.mp3":
    "[warm] Now let's put it to work, Agent. A whole feed of fun quizzes is waiting. Sort each one. Is it harmless fun, or is it fishing for a real secret about you?",
  "/audio/wren/m04-c3-play.mp3":
    "[warm] Here's a feed full of fun quizzes. Sort each one. Is it harmless fun, or is it fishing for a real secret about you?",

  // cycle 4 — scrub the post
  "/audio/wren/m04-c4-b1.mp3":
    "[warm] Here's the good news. You don't have to go silent to stay safe. You just have to scrub. Read a post before it goes up, the way PACKRAT will.",
  "/audio/wren/m04-c4-b2.mp3":
    "[warm] Some bits are completely fine, like that you had a great game, or that you're buzzing about it. Feelings give a stranger nothing.",
  "/audio/wren/m04-c4-b3.mp3":
    "[warm] But what about the where and the when? Your school's name, the street, every Tuesday at six, or a live location will put a stranger at your door.",
  "/audio/wren/m04-c4-b4.mp3":
    "[warm] So black out the where and when, keep the feeling, and post that. It's the same fun, with none of the map.",
  "/audio/wren/m04-c4-chk1-ok.mp3":
    "[warm] Exactly. Keep the excitement, and black out the where and when. A stranger should learn she is happy, and nothing else.",
  "/audio/wren/m04-c4-chk2-ok.mp3":
    "[warm] That is the one. A feeling gives a stranger nothing to stand on. The other two hand over exactly where and when to find you.",
  "/audio/wren/m04-c4-practice.mp3":
    "[warm] Now let's put it to work, Agent. Priya's about to post something new. Black out every bit a stranger could use to find her in person, and leave the harmless bits alone.",
  "/audio/wren/m04-c4-play.mp3":
    "[warm] Priya's about to post this. Black out every bit a stranger could use to find her in person, and leave the harmless bits alone.",
  "/audio/wren/m04-c4-review.mp3":
    "[warm] That's scrubbed. The excitement stays, and the map disappears. A stranger reading this now learns Priya is happy, and absolutely nothing else.",

  // cycle 5 — scrub by priority
  "/audio/wren/m04-c5-b1.mp3":
    "[warm] One thing makes assembly even easier for PACKRAT, and that's the same handle everywhere. The same name on games, photos, and forums is one thread, tying every crumb together.",
  "/audio/wren/m04-c5-b2.mp3":
    "[warm] So you'd think you should delete everything. But you can't delete the internet, and you don't need to. Panic is not a plan.",
  "/audio/wren/m04-c5-b3.mp3":
    "[warm] Analysts scrub by priority. They don't start with the most embarrassing crumb. They start with the most dangerous one, the one that could put a stranger in front of you.",
  "/audio/wren/m04-c5-b4.mp3":
    "[warm] So which one is that? It's where you'll be, and when. A real-world place and time beats every other leak. That one comes down first, every single time.",
  "/audio/wren/m04-c5-chk1-ok.mp3":
    "[warm] That's the right first move. A real-world where and when beats every other leak. That one comes down first, then the rest.",
  "/audio/wren/m04-c5-chk2-ok.mp3":
    "[warm] That is it. Panic is not a plan. Scrub the most dangerous crumb first instead, calm and by priority.",
  "/audio/wren/m04-c5-practice.mp3":
    "[warm] Now let's put it to work, Agent. The audit's just flagged three loud crumbs, and Priya's got five minutes before practice. Read what's at stake, then make the call.",
  "/audio/wren/m04-c5-play.mp3":
    "[warm] The audit found three loud crumbs, and Priya has five minutes before practice. Make the call.",

  // cycle 6 — know PACKRAT's play
  "/audio/wren/m04-c6-b1.mp3":
    "[warm] Let's name PACKRAT's game so you see it coming. In move one, he collects. He never breaks into anything. He just saves every crumb you drop in public, and he keeps it forever.",
  "/audio/wren/m04-c6-b2.mp3":
    "[warm] In move two, he links. The same handle on every app is a thread. He pulls it, and every crumb from every account comes along for the ride.",
  "/audio/wren/m04-c6-b3.mp3":
    "[warm] In move three, he assembles and sells. Stacked crumbs become a file with a where, a when, and a name, and he auctions it to whoever's buying.",
  "/audio/wren/m04-c6-b4.mp3":
    "[warm] And what's the counter to all of it? Give him nothing worth linking. Use different handles, leave out the where and when, and check your backgrounds. An empty nest makes a very bored PACKRAT.",
  "/audio/wren/m04-c6-chk1-ok.mp3":
    "[warm] That is the thread he pulls. One handle links every account, so every crumb comes along together. Vary it and you cut the thread.",
  "/audio/wren/m04-c6-chk2-ok.mp3":
    "[warm] Correct. He never breaks in. He only collects, links, and sells what you already left lying out. That is the whole game.",
  "/audio/wren/m04-c6-practice.mp3":
    "[warm] Now let's put it to work, Agent. Here's tonight's evidence, laid out on the next screen. Tap the three moves that are really PACKRAT's, no more, no less.",
  "/audio/wren/m04-c6-play.mp3":
    "[warm] Here's the evidence from tonight. Tap the three moves that are really PACKRAT's.",

  // cycle 7 — lock down your trail
  "/audio/wren/m04-c7-b1.mp3":
    "[warm] So how do you starve the nest for good? You do a footprint clean-up in four steps, and you can do it this week.",
  "/audio/wren/m04-c7-b2.mp3":
    "[warm] Step one is the audit. Look at your last few posts the way PACKRAT does. Where's the where, the when, the school, and the face in the background?",
  "/audio/wren/m04-c7-b3.mp3":
    "[warm] Steps two and three are to kill location and go private. Turn location tags off, and set any account that doesn't need to be public to private.",
  "/audio/wren/m04-c7-b4.mp3":
    "[warm] Step four is to cut the thread. Use a different handle where you can, so your game name can't lead a stranger straight to your real one.",
  "/audio/wren/m04-c7-chk1-ok.mp3":
    "[warm] Right. You cannot scrub what you have not spotted. Look at your own posts first and find the leaks.",
  "/audio/wren/m04-c7-chk2-ok.mp3":
    "[warm] Exactly. It kills the silent geotag your phone adds on its own. One setting, and that leak is closed.",
  "/audio/wren/m04-c7-practice.mp3":
    "[warm] Now let's put it to work, Agent. Time to build Priya's footprint clean-up properly. For each step, pick the move that actually starves the nest.",
  "/audio/wren/m04-c7-play.mp3":
    "[warm] Build Priya's footprint clean-up. For each step, pick the move that actually starves the nest.",

  // the test
  "/audio/wren/m04-catch-intro.mp3":
    "[warm] Okay, Agent, this is the real test. There are nineteen questions, and none of them just ask you to repeat what I said. Every single one makes you think. Use what you've learned about the nest to work out answers you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right, and you close the case. If you get fewer than fifteen, you'll play the whole case again. So take your time, and good luck.",

  // debrief
  "/audio/wren/m04-debrief.mp3":
    "[proud] The file is closed, and the nest is empty. Keep watching what you drop, Agent.",

  // boss: WREN reads each phase's instruction (the villain's taunts stay text)
  "/audio/wren/m04-boss-p1.mp3":
    "[determined] Phase one, the listing. There are four claims, each built from a crumb. Tap the claim that puts Priya in real-world danger.",
  "/audio/wren/m04-boss-p2.mp3":
    "[determined] Phase two, the auction. It closes in minutes. Scrub the live sources in the right order.",
  "/audio/wren/m04-boss-p3.mp3":
    "[determined] Phase three, the nest. The file still sits in there. Make it worthless, and pick the finishing move.",
};
