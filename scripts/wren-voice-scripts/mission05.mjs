/**
 * WREN's spoken scripts for Mission 05 ("Signal Storm", the Block 1 finale).
 * See mission01.mjs for why this is a separate file from the on-screen text.
 * catchThem.voice.pass/fail reuse the shared m01-catch-pass/fail.mp3,
 * already regenerated — not included here.
 */
export const mission05VoiceScripts = {
  "/audio/wren/m05-transmission.mp3":
    "[serious] Agent, PHANTOM HOOK is back, and he's done being subtle. Texts, QR posters, DMs, emails. Every screen you own, all at once. [concerned] Volume is the weapon, and panic is the plan. 'Tick tock, player,' he says, hoping you'll tap before you think. [determined] But here's the thing. Analysts don't panic in a storm. They work the queue. Tonight we read every costume, and find the one hook cut just for you.",

  "/audio/wren/m05-briefing.mp3":
    "[warm] Seven skills, then a test to close the case, and close out Block One. [serious] One rule tonight, Agent. His storm is loud, so slow down. [excited] Ready?",

  // cycle 1 — the costume change
  "/audio/wren/m05-c1-b1.mp3":
    "[curious] A text. A QR poster. A DM. Three different screens, three different costumes, and one very busy quick-change artist behind all of them.",
  "/audio/wren/m05-c1-b2.mp3":
    "[serious] Underneath every costume is one author, running one play. He swaps the costume because it's cheap. He keeps the MOVES, because they work.",
  "/audio/wren/m05-c1-b3.mp3":
    "[encouraging] And moves leave fingerprints. The same ticking clock. The same weird verify-website. The same one ask, hand over your login.",
  "/audio/wren/m05-c1-b4.mp3":
    "[determined] So don't get lost in the costumes. Match the fingerprints, and a whole screaming storm collapses into one single case.",
  "/audio/wren/m05-c1-chk1-ok.mp3":
    "[proud] Right. Same link, same story, two channels. That is one author swapping costumes, not two real alerts.",
  "/audio/wren/m05-c1-chk2-ok.mp3":
    "[proud] Exactly. The costume keeps changing, the moves stay the same. Match the moves and the whole storm becomes one case.",
  "/audio/wren/m05-c1-practice.mp3":
    "[excited] Now let's put it to work, Agent. The channel monitor's live on the next screen, last twenty minutes of traffic. [determined] Tap the three fingerprints every scam channel shares, and leave the one genuine alert alone.",
  "/audio/wren/m05-c1-play.mp3":
    "[curious] The channel monitor, last twenty minutes. [determined] Tap the 3 fingerprints every scam channel shares. One message is a genuine school alert.",
  "/audio/wren/m05-c1-review.mp3":
    "[proud] Three costumes, one signature. The clock, the verify-site, the login ask. [excited] Tick tock, PHANTOM HOOK. Your storm is one case now.",

  // cycle 2 — read the address
  "/audio/wren/m05-c2-b1.mp3":
    "[curious] Every message arrives wearing a name tag. 'GameHub Support.' 'Library Desk.' Even your head teacher's name. And you read the tag and relax.",
  "/audio/wren/m05-c2-b2.mp3":
    "[serious] Here's the catch you've been missing. The name tag is typed by whoever SENT the message. Anyone can type anything. PHANTOM HOOK types whatever fits you.",
  "/audio/wren/m05-c2-b3.mp3":
    "[warm] The address underneath, though? That's much harder to fake. 'GameHub Support' can send from a random verify-site, but it can't magic up the real gamehub.com.",
  "/audio/wren/m05-c2-b4.mp3":
    "[determined] So do what an analyst does. Ignore the name. Peel it back, read the actual address, and let THAT tell you who really sent it.",
  "/audio/wren/m05-c2-chk1-ok.mp3":
    "[proud] That is it. The name tag is typed by whoever sent it. The address, mrsp-school-alerts dot co, is the giveaway.",
  "/audio/wren/m05-c2-chk2-ok.mp3":
    "[proud] Correct. Name and address agree, and the address is the real streambox.com. This one genuinely is them.",
  "/audio/wren/m05-c2-practice.mp3":
    "[excited] Now let's put it to work, Agent. Five messages are waiting, all wearing the 'GameHub' name tag. [encouraging] Tap each one to read the real address underneath, then call it real or fake.",
  "/audio/wren/m05-c2-play.mp3":
    "[curious] Five messages, all wearing the 'GameHub' name tag. [determined] Tap each to read the real address, then call REAL or FAKE.",
  "/audio/wren/m05-c2-review.mp3":
    "[proud] Names are costume, addresses are fingerprints. [warm] Two of those were really GameHub. The other three were PHANTOM HOOK, wearing GameHub's name tag.",

  // cycle 3 — the QR costume
  "/audio/wren/m05-c3-b1.mp3":
    "[curious] Here's PHANTOM HOOK's newest costume. A QR code. A little square you point your camera at, and it whisks you off somewhere. But WHERE? You can't read a square.",
  "/audio/wren/m05-c3-b2.mp3":
    "[serious] That's the whole trick. A QR code hides its destination completely. You just have to trust it, and he is absolutely counting on that trust.",
  "/audio/wren/m05-c3-b3.mp3":
    "[serious] So he prints stickers and slaps them over the real ones. On posters, on tables, on the canteen machine itself. Same square, brand-new destination, his.",
  "/audio/wren/m05-c3-b4.mp3":
    "[determined] The rule? Never trust a square blind. Scan to PREVIEW the address first, and if it's not the place's real website, don't go. When in doubt, type the address in yourself.",
  "/audio/wren/m05-c3-chk1-ok.mp3":
    "[proud] Right. A square hides its destination. Swap the sticker and the same-looking code now points at his site.",
  "/audio/wren/m05-c3-chk2-ok.mp3":
    "[proud] Good call. The preview showed a stranger's verify-site, not the real one. Type the real address in yourself instead.",
  "/audio/wren/m05-c3-practice.mp3":
    "[excited] Now let's put it to work, Agent. Four canteen top-up QR codes are waiting, straight from around school. [encouraging] Scan each to preview the real address, then call it real or fake.",
  "/audio/wren/m05-c3-play.mp3":
    "[curious] Four canteen top-up QR codes from around school. [determined] Scan each to preview the real address, then call REAL or FAKE.",
  "/audio/wren/m05-c3-review.mp3":
    "[proud] Only the one on the wall went to the school's real site. [serious] The three stickers were PHANTOM HOOK, pasted over the top. [determined] Never trust a square blind.",

  // cycle 4 — spray vs spear
  "/audio/wren/m05-c4-b1.mp3":
    "[curious] In a storm, every message is screaming for your attention. So an analyst doesn't answer the loudest one. They rank them by how dangerous they really are.",
  "/audio/wren/m05-c4-b2.mp3":
    "[serious] And loud is not the same as dangerous. A message blasted to the whole school is SPRAY. It's just guessing, hoping someone panics.",
  "/audio/wren/m05-c4-b3.mp3":
    "[concerned] But a message that knows your name, your form room, your teacher? That's a SPEAR. Someone did real homework on YOU to write it.",
  "/audio/wren/m05-c4-b4.mp3":
    "[determined] Spray is cheap and it's guessing. A spear cost effort, which means someone decided you were worth targeting. Targeted beats loud, every single time.",
  "/audio/wren/m05-c4-chk1-ok.mp3":
    "[proud] Yes. Personal details mean someone did homework on you. That is a spear, and it outranks the mass blast.",
  "/audio/wren/m05-c4-chk2-ok.mp3":
    "[proud] Exactly. Spray is cheap guessing. A spear cost effort, which means someone decided you were worth the aim.",
  "/audio/wren/m05-c4-practice.mp3":
    "[excited] Now let's put it to work, Agent. The storm's live and three messages just got flagged. [encouraging] The queue is yours, read them, then make the call.",
  "/audio/wren/m05-c4-play.mp3":
    "[serious] Three messages are flagged and the storm is live. The queue is yours, Agent. Which do you handle first?",

  // cycle 5 — work the queue
  "/audio/wren/m05-c5-b1.mp3":
    "[curious] When the storm hits, your inbox is a wall of noise, and every message wants to be first. Don't let the volume set your order. YOU set the order.",
  "/audio/wren/m05-c5-b2.mp3":
    "[warm] Loud is not dangerous. A message shouting 'FREE JETPACK' in ten emojis is loud, and asks for nothing real. That's noise. Log it, move on.",
  "/audio/wren/m05-c5-b3.mp3":
    "[serious] The dangerous ones are usually quieter and more specific. The one asking for your login. The one that knows your name. Those go straight to the top.",
  "/audio/wren/m05-c5-b4.mp3":
    "[determined] So work the queue like a pro. Real threats first, noise last, and never, ever let the flood rush you into tapping something.",
  "/audio/wren/m05-c5-chk1-ok.mp3":
    "[proud] Right. Loud and asking for nothing real is just noise. Log it and move to the threats that matter.",
  "/audio/wren/m05-c5-chk2-ok.mp3":
    "[proud] That is the one. It asks for your login, which is the whole scam. Quiet and specific beats loud every time.",
  "/audio/wren/m05-c5-practice.mp3":
    "[excited] Now let's put it to work, Agent. The flood's live on the next screen. [determined] Sort each message, a real threat to handle now, or just noise to log and ignore?",
  "/audio/wren/m05-c5-play.mp3":
    "[determined] The flood is live. Sort each message, is it a real threat to handle now, or just noise to log and ignore?",

  // cycle 6 — know PHANTOM HOOK's play
  "/audio/wren/m05-c6-b1.mp3":
    "[warm] Let's name PHANTOM HOOK's whole play, because you've now seen every part of it. Move one, MANY COSTUMES. The same hook by text, by QR, by DM, by email. Wherever you look, a costume is waiting.",
  "/audio/wren/m05-c6-b2.mp3":
    "[serious] Move two, a BORROWED NAME. He types a trusted name on the tag, GameHub, the library, your head teacher, while the address underneath is pure him.",
  "/audio/wren/m05-c6-b3.mp3":
    "[serious] Move three, THE ASK. Every costume, every channel, ends the exact same way, hand over your login. That's the only thing he ever actually wants.",
  "/audio/wren/m05-c6-b4.mp3":
    "[concerned] And the scariest upgrade? Sometimes he BUYS a file on you first, so the hook already knows your name. That's when he stops being spray and becomes a spear. Remember that. It matters next case.",
  "/audio/wren/m05-c6-chk1-ok.mp3":
    "[proud] Yes. The costume changes and the channel changes, but the ask never does. It is always your login.",
  "/audio/wren/m05-c6-chk2-ok.mp3":
    "[proud] Exactly. A bought file turned a blind blast into a hook aimed at you. Remember who sells those files.",
  "/audio/wren/m05-c6-practice.mp3":
    "[excited] Now let's put it to work, Agent. Everything from tonight is on one board. [determined] Tap the three moves that are really PHANTOM HOOK's, no more, no less.",
  "/audio/wren/m05-c6-play.mp3":
    "[determined] Everything you've seen tonight, on one board. Tap the 3 moves that are really PHANTOM HOOK's.",

  // cycle 7 — the two-check habit
  "/audio/wren/m05-c7-b1.mp3":
    "[curious] So how do you beat a storm that hits every channel at once? Not with panic. With a drill. The same four steps, every single time, no matter which costume it's wearing.",
  "/audio/wren/m05-c7-b2.mp3":
    "[determined] First, the hardest one. PAUSE. Don't tap anything. The ticking clock is fake, and the pause is what beats him.",
  "/audio/wren/m05-c7-b3.mp3":
    "[warm] Then two quick checks. Check one, does the ADDRESS match the name? Check two, open the REAL app yourself, not his link, and see if it's actually there.",
  "/audio/wren/m05-c7-b4.mp3":
    "[encouraging] And if it still feels off after both? Tell an adult you trust. Two checks and a grown-up. Ten seconds, and his whole storm is just noise.",
  "/audio/wren/m05-c7-chk1-ok.mp3":
    "[proud] Right. The timer is fake and the pause beats it. Nothing gets tapped until you have checked.",
  "/audio/wren/m05-c7-chk2-ok.mp3":
    "[proud] That is the second check. If it is real it will be in your actual account. His link only ever goes to his page.",
  "/audio/wren/m05-c7-practice.mp3":
    "[excited] Now let's put it to work, Agent. Time to build your storm drill properly. [encouraging] For each step, pick the move an analyst actually makes, not just the one that feels right.",
  "/audio/wren/m05-c7-play.mp3":
    "[determined] Build your storm drill. For each step, pick the move an analyst actually makes.",

  // the test (block-finale variant — not reused elsewhere, own wording)
  "/audio/wren/m05-catch-intro.mp3":
    "[warm] Okay Agent, this is the real test, and it closes out Block One. [serious] Nineteen questions, and not one of them is “what did I say”. Every single one makes you THINK. Take everything you learned this block, and work out an answer you've never seen before. [determined] I won't tell you how you're doing until the very end. Get fifteen right to close the case. Miss it, and you sit the whole case again. [encouraging] Take your time.",

  // debrief
  "/audio/wren/m05-debrief.mp3":
    "[proud] Block One, closed. PHANTOM HOOK's storm is one filed case, Agent. [excited] CONFIDENTIAL clearance, confirmed. [warm] Wear it well.",
};
