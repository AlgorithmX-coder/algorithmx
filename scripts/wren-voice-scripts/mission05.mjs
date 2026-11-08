/**
 * WREN's spoken scripts for Mission 05 ("Signal Storm", the Block 1 finale).
 * See mission01.mjs for why this is a separate file from the on-screen text.
 * catchThem.voice.pass/fail reuse the shared m01-catch-pass/fail.mp3,
 * not included here.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress.
 */
export const mission05VoiceScripts = {
  "/audio/wren/m05-transmission.mp3":
    "[serious] Agent, PHANTOM HOOK is back, and he's done being subtle. He's using texts, QR posters, DMs, and emails, on every screen you own, all at once. Volume is the weapon, and panic is the plan. Tick tock, player, he says, hoping you'll tap before you think. But here's the thing. Analysts don't panic in a storm. They work the queue. Tonight we read every costume, and find the one hook cut just for you.",

  "/audio/wren/m05-briefing.mp3":
    "[warm] You'll learn seven skills, then take a test to close the case, and close out Block One. There's one rule tonight, Agent. His storm is loud, so slow down. Ready?",

  // cycle 1 — the costume change
  "/audio/wren/m05-c1-b1.mp3":
    "[warm] A text, a QR poster, and a DM are three different screens and three different costumes. There's one very busy quick-change artist behind all of them.",
  "/audio/wren/m05-c1-b2.mp3":
    "[warm] Underneath every costume is one author, running one play. He swaps the costume because it's cheap. He keeps the moves, because they work.",
  "/audio/wren/m05-c1-b3.mp3":
    "[warm] And moves leave fingerprints. There's the same ticking clock, the same weird verify website, and the same one ask, which is to hand over your login.",
  "/audio/wren/m05-c1-b4.mp3":
    "[warm] So don't get lost in the costumes. Match the fingerprints, and a whole screaming storm collapses into one single case.",
  "/audio/wren/m05-c1-chk1-ok.mp3":
    "[warm] Right. It's the same link and the same story on two channels. That is one author swapping costumes, not two real alerts.",
  "/audio/wren/m05-c1-chk2-ok.mp3":
    "[warm] Exactly. The costume keeps changing, but the moves stay the same. Match the moves and the whole storm becomes one case.",
  "/audio/wren/m05-c1-practice.mp3":
    "[warm] Now let's put it to work, Agent. The channel monitor's live on the next screen, with the last twenty minutes of traffic. Tap the three fingerprints every scam channel shares, and leave the one genuine alert alone.",
  "/audio/wren/m05-c1-play.mp3":
    "[warm] Here's the channel monitor for the last twenty minutes. Tap the three fingerprints every scam channel shares. One message is a genuine school alert.",
  "/audio/wren/m05-c1-review.mp3":
    "[warm] There were three costumes, with one signature. It was the clock, the verify site, and the login ask. Tick tock, PHANTOM HOOK. Your storm is one case now.",

  // cycle 2 — read the address
  "/audio/wren/m05-c2-b1.mp3":
    "[warm] Every message arrives wearing a name tag, like GameHub Support, the Library Desk, or even your head teacher's name. And you read the tag and relax.",
  "/audio/wren/m05-c2-b2.mp3":
    "[warm] Here's the catch you've been missing. The name tag is typed by whoever sent the message. Anyone can type anything, and PHANTOM HOOK types whatever fits you.",
  "/audio/wren/m05-c2-b3.mp3":
    "[warm] The address underneath is much harder to fake. A message from GameHub Support can come from a random verify site, but it can't magic up the real gamehub.com.",
  "/audio/wren/m05-c2-b4.mp3":
    "[warm] So do what an analyst does. Ignore the name. Peel it back, read the actual address, and let that tell you who really sent it.",
  "/audio/wren/m05-c2-chk1-ok.mp3":
    "[warm] That is it. The name tag is typed by whoever sent it. The address, mrsp-school-alerts.co, is the giveaway.",
  "/audio/wren/m05-c2-chk2-ok.mp3":
    "[warm] Correct. The name and address agree, and the address is the real streambox.com. This one genuinely is them.",
  "/audio/wren/m05-c2-practice.mp3":
    "[warm] Now let's put it to work, Agent. Five messages are waiting, all wearing the GameHub name tag. Tap each one to read the real address underneath, then call it real or fake.",
  "/audio/wren/m05-c2-play.mp3":
    "[warm] Here are five messages, all wearing the GameHub name tag. Tap each one to read the real address, then call it real or fake.",
  "/audio/wren/m05-c2-review.mp3":
    "[warm] Names are costumes, and addresses are fingerprints. Two of those were really GameHub. The other three were PHANTOM HOOK, wearing GameHub's name tag.",

  // cycle 3 — the QR costume
  "/audio/wren/m05-c3-b1.mp3":
    "[warm] Here's PHANTOM HOOK's newest costume, the QR code. It's a little square you point your camera at, and it whisks you off somewhere. But where does it go? You can't read a square.",
  "/audio/wren/m05-c3-b2.mp3":
    "[warm] That's the whole trick. A QR code hides its destination completely. You just have to trust it, and he is absolutely counting on that trust.",
  "/audio/wren/m05-c3-b3.mp3":
    "[warm] So he prints stickers and slaps them over the real ones, on posters, on tables, and on the canteen machine itself. It's the same square, with a brand-new destination, and it's his.",
  "/audio/wren/m05-c3-b4.mp3":
    "[warm] What's the rule? Never trust a square blind. Scan to preview the address first, and if it's not the place's real website, don't go. When in doubt, type the address in yourself.",
  "/audio/wren/m05-c3-chk1-ok.mp3":
    "[warm] Right. A square hides its destination. Swap the sticker, and the same-looking code now points at his site.",
  "/audio/wren/m05-c3-chk2-ok.mp3":
    "[warm] Good call. The preview showed a stranger's verify site, not the real one. Type the real address in yourself instead.",
  "/audio/wren/m05-c3-practice.mp3":
    "[warm] Now let's put it to work, Agent. Four canteen top-up QR codes are waiting, straight from around school. Scan each one to preview the real address, then call it real or fake.",
  "/audio/wren/m05-c3-play.mp3":
    "[warm] Here are four canteen top-up QR codes from around school. Scan each one to preview the real address, then call it real or fake.",
  "/audio/wren/m05-c3-review.mp3":
    "[warm] Only the one on the wall went to the school's real site. The three stickers were PHANTOM HOOK, pasted over the top. Never trust a square blind.",

  // cycle 4 — spray vs spear
  "/audio/wren/m05-c4-b1.mp3":
    "[warm] In a storm, every message is screaming for your attention. So an analyst doesn't answer the loudest one. They rank them by how dangerous they really are.",
  "/audio/wren/m05-c4-b2.mp3":
    "[warm] And loud is not the same as dangerous. A message blasted to the whole school is spray. It's just guessing, and hoping someone panics.",
  "/audio/wren/m05-c4-b3.mp3":
    "[warm] But what about a message that knows your name, your form room, and your teacher? That's a spear. Someone did real homework on you to write it.",
  "/audio/wren/m05-c4-b4.mp3":
    "[warm] Spray is cheap, and it's guessing. A spear cost effort, which means someone decided you were worth targeting. Targeted beats loud, every single time.",
  "/audio/wren/m05-c4-chk1-ok.mp3":
    "[warm] Yes. Personal details mean someone did homework on you. That is a spear, and it outranks the mass blast.",
  "/audio/wren/m05-c4-chk2-ok.mp3":
    "[warm] Exactly. Spray is cheap guessing. A spear cost effort, which means someone decided you were worth the aim.",
  "/audio/wren/m05-c4-practice.mp3":
    "[warm] Now let's put it to work, Agent. The storm's live, and three messages just got flagged. The queue is yours. Read them, then make the call.",
  "/audio/wren/m05-c4-play.mp3":
    "[warm] Three messages are flagged, and the storm is live. The queue is yours, Agent. Which do you handle first?",

  // cycle 5 — work the queue
  "/audio/wren/m05-c5-b1.mp3":
    "[warm] When the storm hits, your inbox is a wall of noise, and every message wants to be first. Don't let the volume set your order. You set the order.",
  "/audio/wren/m05-c5-b2.mp3":
    "[warm] Loud is not dangerous. A message shouting about a free jetpack in ten emojis is loud, and it asks for nothing real. That's noise, so log it and move on.",
  "/audio/wren/m05-c5-b3.mp3":
    "[warm] The dangerous ones are usually quieter and more specific, like the one asking for your login, or the one that knows your name. Those go straight to the top.",
  "/audio/wren/m05-c5-b4.mp3":
    "[warm] So work the queue like a pro. Handle real threats first and noise last, and never, ever let the flood rush you into tapping something.",
  "/audio/wren/m05-c5-chk1-ok.mp3":
    "[warm] Right. Loud and asking for nothing real is just noise. Log it, and move to the threats that matter.",
  "/audio/wren/m05-c5-chk2-ok.mp3":
    "[warm] That is the one. It asks for your login, which is the whole scam. Quiet and specific beats loud every time.",
  "/audio/wren/m05-c5-practice.mp3":
    "[warm] Now let's put it to work, Agent. The flood's live on the next screen. Sort each message. Is it a real threat to handle now, or just noise to log and ignore?",
  "/audio/wren/m05-c5-play.mp3":
    "[warm] The flood is live. Sort each message. Is it a real threat to handle now, or just noise to log and ignore?",

  // cycle 6 — know PHANTOM HOOK's play
  "/audio/wren/m05-c6-b1.mp3":
    "[warm] Let's name PHANTOM HOOK's whole play, because you've now seen every part of it. Move one is many costumes. It's the same hook by text, by QR, by DM, and by email. Wherever you look, a costume is waiting.",
  "/audio/wren/m05-c6-b2.mp3":
    "[warm] Move two is a borrowed name. He types a trusted name on the tag, like GameHub, the library, or your head teacher, while the address underneath is pure him.",
  "/audio/wren/m05-c6-b3.mp3":
    "[warm] Move three is the ask. Every costume, on every channel, ends the exact same way. He wants you to hand over your login. That's the only thing he ever actually wants.",
  "/audio/wren/m05-c6-b4.mp3":
    "[warm] And what's the scariest upgrade? Sometimes he buys a file on you first, so the hook already knows your name. That's when he stops being spray and becomes a spear. Remember that, because you'll need it before this case is closed.",
  "/audio/wren/m05-c6-chk1-ok.mp3":
    "[warm] Yes. The costume changes and the channel changes, but the ask never does. It is always your login.",
  "/audio/wren/m05-c6-chk2-ok.mp3":
    "[warm] Exactly. A bought file turned a blind blast into a hook aimed at you. Remember who sells those files.",
  "/audio/wren/m05-c6-practice.mp3":
    "[warm] Now let's put it to work, Agent. Everything from tonight is on one board. Tap the three moves that are really PHANTOM HOOK's, no more, no less.",
  "/audio/wren/m05-c6-play.mp3":
    "[warm] Everything you've seen tonight is on one board. Tap the three moves that are really PHANTOM HOOK's.",

  // cycle 7 — the two-check habit
  "/audio/wren/m05-c7-b1.mp3":
    "[warm] So how do you beat a storm that hits every channel at once? You don't beat it with panic. You beat it with a drill, the same four steps every single time, no matter which costume it's wearing.",
  "/audio/wren/m05-c7-b2.mp3":
    "[warm] First comes the hardest one, which is to pause. Don't tap anything. The ticking clock is fake, and the pause is what beats him.",
  "/audio/wren/m05-c7-b3.mp3":
    "[warm] Then come two quick checks. Check one, does the address match the name? Check two, open the real app yourself, not his link, and see if it's actually there.",
  "/audio/wren/m05-c7-b4.mp3":
    "[warm] And what if it still feels off after both? Tell an adult you trust. It's two checks and a grown-up. That takes ten seconds, and his whole storm is just noise.",
  "/audio/wren/m05-c7-chk1-ok.mp3":
    "[warm] Right. The timer is fake, and the pause beats it. Nothing gets tapped until you have checked.",
  "/audio/wren/m05-c7-chk2-ok.mp3":
    "[warm] That is the second check. If it is real, it will be in your actual account. His link only ever goes to his page.",
  "/audio/wren/m05-c7-practice.mp3":
    "[warm] Now let's put it to work, Agent. Time to build your storm drill properly. For each step, pick the move an analyst actually makes, not just the one that feels right.",
  "/audio/wren/m05-c7-play.mp3":
    "[warm] Build your storm drill. For each step, pick the move an analyst actually makes.",

  // the test (block-finale variant of Mission 1's approved intro)
  "/audio/wren/m05-catch-intro.mp3":
    "[warm] Okay, Agent, this is the real test, and it closes out Block One. There are nineteen questions, and none of them just ask you to repeat what I said. Every single one makes you think. Use everything you've learned this block to work out answers you've never seen before. I won't tell you how you're doing until the very end. Get fifteen right, and you close the case. If you get fewer than fifteen, you'll play the whole case again. So take your time, and good luck.",

  // debrief
  "/audio/wren/m05-debrief.mp3":
    "[proud] Block One is closed, and PHANTOM HOOK's storm is one filed case, Agent. Your Confidential clearance is confirmed. Wear it well.",

  // boss: WREN reads each phase's instruction (the villain's taunts stay text)
  "/audio/wren/m05-boss-p1.mp3":
    "[determined] Phase one, the wall. Six messages just landed. Tap every one that belongs to the storm, and don't flag the real ones.",
  "/audio/wren/m05-boss-p2.mp3":
    "[determined] Phase two, the spear. There are four storm messages. Three are spray, and one did its homework. Tap the spear.",
  "/audio/wren/m05-boss-p3.mp3":
    "[determined] Phase three, the source. The spear knew your form and your teacher. Where did that data come from?",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
export const mission05Say = {
  "mrsp-school-alerts.co": "M R S P dash school dash alerts dot co",
};
