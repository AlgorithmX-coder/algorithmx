/**
 * WREN's spoken scripts for Case 008 ("The Perfect Message"). See
 * mission01.mjs and mission06.mjs for conventions. test.passVoice/
 * failVoice have no text field in case08.ts — recovered by transcription.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. GHOSTWRITER is "he". test-pass keeps its words (owner decision).
 */
export const mission08VoiceScripts = {
  "/audio/wren/m08p-recap.mp3":
    "[warm] Previously on Cyber Explorers, MIMIC hijacked a friend's account and messaged you from inside it, borrowing a face you trusted. You learned to verify a weird ask on a different channel before you ever believe it. Today, a message arrives with zero typos. It's perfectly written. In fact, it's too perfect.",
  "/audio/wren/m08p-open-1.mp3":
    "[serious] We've got a new case, Agent. This villain is called GHOSTWRITER, and he doesn't type. He uses a machine.",
  "/audio/wren/m08p-open-2.mp3":
    "[serious] Everything you were taught about spotting scams, like bad spelling and dodgy grammar, is out of date. AI now writes perfect, warm, friendly messages by the thousand. Each one is tweaked to feel like it was made just for you.",
  "/audio/wren/m08p-open-3.mp3":
    "[serious] You'll learn seven skills to beat a machine that never makes a typo, then face a boss and a test. The trick isn't spotting mistakes any more. It's something better.",

  // skill 1 — polish proves nothing
  "/audio/wren/m08p-s1-learn.mp3":
    "[warm] Here's what's changed. You were taught that scams have bad spelling and clumsy grammar. That was true, once. But a machine now writes flawless, friendly messages by the thousand. So perfect writing, good grammar and no typos prove absolutely nothing any more. A message with zero mistakes can still be a total trap.",
  "/audio/wren/m08p-s1-ok.mp3":
    "[warm] Right. It's tidy, it's friendly, it has no typos, and none of that tells you a single thing about whether it's real. Polish is exactly what the machine is good at. Stop using it as your safety check.",
  "/audio/wren/m08p-s1-bad.mp3":
    "[warm] That used to be true, but the machine changed it. A flawless message is now just as likely to be a scam as a messy one. Try again.",
  "/audio/wren/m08p-s1-bad2.mp3":
    "[warm] Neat and friendly is what a machine does best. It's the disguise, not proof of safety. Try again.",
  "/audio/wren/m08p-s1-q2ok.mp3":
    "[warm] Correct. Zero mistakes is easy for a machine and tells you nothing. Judge it some other way.",
  "/audio/wren/m08p-s1-q2bad.mp3":
    "[warm] Reading well is free now, because a machine never fumbles a word. Polish is not a safety check. Try again.",
  "/audio/wren/m08p-s1-q2bad2.mp3":
    "[warm] A machine writes better grammar than most adults. Perfect writing points to nobody. Try again.",
  "/audio/wren/m08p-s1-q3ok.mp3":
    "[warm] Exactly. The tell you relied on is gone. Perfect messages and messy ones are equally likely to be traps.",
  "/audio/wren/m08p-s1-q3bad.mp3":
    "[warm] Typos don't catch scams any more. The best scams now have zero typos. That old rule will let them straight past. Try again.",
  "/audio/wren/m08p-s1-q3bad2.mp3":
    "[warm] They send more than ever, and the messages are just cleaner. The rule fails because the writing got perfect. Try again.",

  // skill 2 — written for everyone
  "/audio/wren/m08p-s2-learn.mp3":
    "[warm] Here's why this matters so much. A machine doesn't get tired. GHOSTWRITER can send the same warm, personal-sounding message to ten thousand kids at once. Each one is auto-filled with your name and your favourite game. It feels like it was written just for you. It wasn't. It was written for everyone.",
  "/audio/wren/m08p-s2-ok.mp3":
    "[warm] Exactly. Your name and your game are on your profile for anyone, human or machine, to grab. Feeling known by a stranger is the trick, not the proof. It just means the machine did its homework.",
  "/audio/wren/m08p-s2-q2ok.mp3":
    "[warm] That's it. Your year and your hobby are on your profile for anyone to grab and slot in. It feels aimed at you, but it isn't.",
  "/audio/wren/m08p-s2-q2bad.mp3":
    "[warm] Nobody wrote it by hand. A machine drops your details in automatically and sends it to thousands at once. Try again.",
  "/audio/wren/m08p-s2-q2bad2.mp3":
    "[warm] Your hobbies are public, so anyone can read them. That detail proves nothing. Try again.",
  "/audio/wren/m08p-s2-q3ok.mp3":
    "[warm] Right. It's the same template, with different names slotted in. If two of you got the personal message, so did thousands.",
  "/audio/wren/m08p-s2-q3bad.mp3":
    "[warm] Two messages that match word for word are no coincidence. That's one machine blasting the same lure at everyone. Try again.",
  "/audio/wren/m08p-s2-q3bad2.mp3":
    "[warm] It doesn't know either of you. It just filled in your names. The matching text gives it away. Try again.",

  // skill 3 — warmth without history
  "/audio/wren/m08p-s3-learn.mp3":
    "[warm] So if polish and personal details prove nothing, what can you notice? You can notice clues. They're not proof, just clues. A machine gives you warmth with no real history. It acts like your best friend when you've barely spoken. It shows huge feelings, all at once, with nothing real behind them. When someone is super close super fast, that's your clue to slow right down.",
  "/audio/wren/m08p-s3-ok.mp3":
    "[warm] That's the clue. Real closeness takes real time and real shared moments. When a near-stranger instantly calls you their best friend, that's a machine turning up the warmth dial. Slow down.",
  "/audio/wren/m08p-s3-bad.mp3":
    "[warm] Friendly is fine. But saying they've known you forever after two days isn't friendly. It's fake history. That mismatch is the clue. Try again.",
  "/audio/wren/m08p-s3-bad2.mp3":
    "[warm] We just learned that polish proves nothing. Look at the mismatch instead. There's huge closeness, with no time behind it. Try again.",
  "/audio/wren/m08p-s3-q2ok.mp3":
    "[warm] That's the clue. Becoming someone's closest friend takes real time. Instant and intense closeness from a near-stranger is the warmth dial turned up. Slow down.",
  "/audio/wren/m08p-s3-q2bad.mp3":
    "[warm] Some do, a little. But calling you inseparable after one day isn't bonding. It's fake history. That gap is the clue. Try again.",
  "/audio/wren/m08p-s3-q2bad2.mp3":
    "[warm] Emojis are free, and a machine adds them by the handful. Look at the mismatch instead. There are huge feelings, with no time behind them. Try again.",
  "/audio/wren/m08p-s3-q3ok.mp3":
    "[warm] Exactly. Kind words are cheap. A real past together is not, and that's what a fast, gushing stranger is missing.",
  "/audio/wren/m08p-s3-q3bad.mp3":
    "[warm] Kind words are the machine's speciality. What it can't fake is real history together. Try again.",
  "/audio/wren/m08p-s3-q3bad2.mp3":
    "[warm] Anyone can paste emojis, and machines love them. The real gap is shared history. Try again.",

  // skill 4 — verify by source, not style
  "/audio/wren/m08p-s4-learn.mp3":
    "[warm] Here's the rule that beats all of it, and you met it last case. Verify by source, not by style. You can't trust a message just because it reads well or feels warm. The machine controls those completely. You trust it only once you've checked who it's really from, a different way. Style is what the machine owns. The source is what it can't fake.",
  "/audio/wren/m08p-s4-ok.mp3":
    "[warm] That's it. Sounding real is free, because a machine does it in a second. Message the real Liam on a channel you already trust, or ask him in person. Verify the source, and ignore the style.",
  "/audio/wren/m08p-s4-bad.mp3":
    "[warm] Sounding genuine is exactly what the machine is built to do. You can't verify by how it reads. Check the source instead. Try again.",
  "/audio/wren/m08p-s4-bad2.mp3":
    "[warm] Whoever's on that account will just say yes. You have to check on a different channel they don't control. Try again.",
  "/audio/wren/m08p-s4-q2ok.mp3":
    "[warm] Perfect. Ring the number you already have for her, or ask your family. Verify the source, and don't trust the sound of it.",
  "/audio/wren/m08p-s4-q2bad.mp3":
    "[warm] Sounding like her is easy to fake. Check on a channel you already trust before you add anyone. Try again.",
  "/audio/wren/m08p-s4-q2bad2.mp3":
    "[warm] Whoever holds that account will just say yes. You have to check in a different way, one they don't control. Try again.",
  "/audio/wren/m08p-s4-q3ok.mp3":
    "[warm] Right. The machine owns the style completely. The source is the part it can't fake, so that's the part you check.",
  "/audio/wren/m08p-s4-q3bad.mp3":
    "[warm] Good writing is exactly what the machine controls. It's no proof at all. Check the source instead. Try again.",
  "/audio/wren/m08p-s4-q3bad2.mp3":
    "[warm] Only one of them is, and that's the source. Style is free to fake. Never let good writing stand in for a real check. Try again.",

  // skill 5 — predict the ask
  "/audio/wren/m08p-s5-learn.mp3":
    "[warm] Here's the thing about all that warmth. It isn't the goal. It's the warm-up. GHOSTWRITER builds trust for days, being lovely and asking for nothing. Then, once you feel close, comes a small ask. So predict it. When a brand-new online friend is all warmth and no reason, ask yourself one question. What is this going to cost me later?",
  "/audio/wren/m08p-s5-ok.mp3":
    "[warm] You called it. All that free warmth is an investment, and investments get cashed in. The ask is coming, and it'll feel small and reasonable because of everything that came before. Now you can't be surprised.",
  "/audio/wren/m08p-s5-bad.mp3":
    "[warm] Maybe, but a machine doesn't spend a week being lovely for nothing. Assume an ask is coming and you'll be ready. Try again.",
  "/audio/wren/m08p-s5-bad2.mp3":
    "[warm] That would be too clumsy for this one. They've been sweet on purpose. The ask hides inside the kindness, not inside a threat. Try again.",
  "/audio/wren/m08p-s5-q2ok.mp3":
    "[warm] That's the question. Free warmth from a stranger is a warm-up, not a gift. Keep asking it and the ask won't catch you out.",
  "/audio/wren/m08p-s5-q2bad.mp3":
    "[warm] That's exactly what it wants you to feel. The smarter question is what all this is setting up. Try again.",
  "/audio/wren/m08p-s5-q2bad2.mp3":
    "[warm] The niceness is the plan, not proof that there's no plan. Ask what it will cost you later. Try again.",
  "/audio/wren/m08p-s5-q3ok.mp3":
    "[warm] Exactly. A machine doesn't spend two weeks being sweet for nothing. The longer the warm-up, the bigger the ask that's waiting. Stay ready.",
  "/audio/wren/m08p-s5-q3bad.mp3":
    "[warm] No ask yet just means it's still coming. The patient ones are setting you up. Stay careful. Try again.",
  "/audio/wren/m08p-s5-q3bad2.mp3":
    "[warm] Two weeks of warmth is cheap for a machine, and it's building towards the ask. Time isn't proof. Try again.",

  // skill 6 — know GHOSTWRITER's play
  "/audio/wren/m08p-s6-learn.mp3":
    "[warm] Step back and see GHOSTWRITER's whole play. It's always the same four moves. First, he sends a flawless message, with no tells to catch. Second, he adds fake warmth and personal details, so it feels made just for you. Third, he builds trust over days, asking for nothing. Fourth, he asks for the small favour, like money, a code, or a secret. Learn the shape, and perfect writing stops fooling you.",
  "/audio/wren/m08p-s6-ok.mp3":
    "[warm] That's the play, start to finish. It's a perfect message, then fake warmth, then patient trust, and then the ask. Spot which move you're in, and you always know what's next.",
  "/audio/wren/m08p-s6-bad.mp3":
    "[warm] It never leads with the favour, because you'd say no on the spot. The warm-up comes first, so the ask feels normal later. Try again.",
  "/audio/wren/m08p-s6-bad2.mp3":
    "[warm] It can't build trust before it's even sent a message. The flawless message is always move one. Try again.",
  "/audio/wren/m08p-s6-q2ok.mp3":
    "[warm] Spot on. This is the flattery step, move two. Name the move and you already know the trust-building and the ask are next.",
  "/audio/wren/m08p-s6-q2bad.mp3":
    "[warm] There's no favour here yet, just flattery. That's move two, fake warmth. The ask comes later. Try again.",
  "/audio/wren/m08p-s6-q2bad2.mp3":
    "[warm] That niceness is move two. It's fake warmth, straight from the script, and it's part of the play. Try again.",
  "/audio/wren/m08p-s6-q3ok.mp3":
    "[warm] Exactly. Days of warmth with no ask is the trust-building step. The favour is move four, and it's coming up. Now you're ahead of it.",
  "/audio/wren/m08p-s6-q3bad.mp3":
    "[warm] It isn't the last move, because the ask hasn't happened yet. You're in trust-building, with the favour still to come. Try again.",
  "/audio/wren/m08p-s6-q3bad2.mp3":
    "[warm] They started days ago, so you're well past move one. This is trust-building, and the ask is next. Try again.",

  // skill 7 — don't trust the vibe
  "/audio/wren/m08p-s7-learn.mp3":
    "[warm] This is the last skill, and it's the big one. Your feelings are exactly what a machine is built to play. So never act just because something feels real. Feelings are the easiest thing to fake. Verify the source, every single time. And keep the rule from last case. If any online friend asks for money, a code, or secrecy, it's a scam, no matter how lovely they've been. You don't owe them a thing. Tell an adult you trust.",
  "/audio/wren/m08p-s7-ok.mp3":
    "[warm] Perfect. It doesn't matter how kind they've been. A stranger asking for money or codes is a scam, full stop. Send nothing, verify the source, and loop in an adult. That's the whole defence.",
  "/audio/wren/m08p-s7-bad.mp3":
    "[warm] The niceness was the whole setup. That's what the week was for. Kindness from a stranger is never a debt, so never send it. Try again.",
  "/audio/wren/m08p-s7-bad2.mp3":
    "[warm] They'll happily offer more perfect words as proof, because the machine has endless ones. Don't ask them. Verify the source yourself, and tell an adult. Try again.",
  "/audio/wren/m08p-s7-q2ok.mp3":
    "[warm] Perfect. Asking for a code and telling you to keep it secret is a scam, no matter how sweet they've been. Send nothing, check who they are, and tell an adult.",
  "/audio/wren/m08p-s7-q2bad.mp3":
    "[warm] The kindness was the whole setup. A stranger asking for a code is a scam, full stop. Never send it. Try again.",
  "/audio/wren/m08p-s7-q2bad2.mp3":
    "[warm] Secrecy is the biggest red flag of all. Never send it, and never keep it quiet. Tell an adult. Try again.",
  "/audio/wren/m08p-s7-q3ok.mp3":
    "[warm] Exactly. Your feelings are what the machine plays best. Never act on a vibe. Check who it really is, every single time.",
  "/audio/wren/m08p-s7-q3bad.mp3":
    "[warm] That feeling is exactly what the machine built. It's the easiest thing to fake, so it's never enough. Verify the source. Try again.",
  "/audio/wren/m08p-s7-q3bad2.mp3":
    "[warm] Perfect spelling and a warm feeling are both things a machine makes on purpose. Neither is proof. Check the source. Try again.",

  // boss — "The Pen Pal"
  "/audio/wren/m08p-boss-intro.mp3":
    "[determined] This is it, Agent. You've been chatting to a new online friend for a week, and they've been perfect. In fact, they've been too perfect. I've sped up the week so you can see its shape. There are no hints from me now. Read the warmth, predict the ask, verify the source, and don't get played. Go.",
  "/audio/wren/m08p-boss-win.mp3":
    "[proud] That was a flawless run, Agent. You had a whole week of perfect, machine-made warmth, and you didn't send a penny. You saw that polish proves nothing, and you spotted warmth with no history. You predicted the ask before it came, and when it did, you refused to verify by vibes. And the moment it wanted secrecy, you knew to tell an adult. GHOSTWRITER wrote a beautiful lie, and you read straight through it.",

  // test — "Prove it"
  "/audio/wren/m08p-test-intro.mp3":
    "[warm] There's one last thing before I close the case, and that's the test. It's a fresh batch you haven't seen. There are no hints, and you'll need most of them right. Remember, the trick isn't spotting typos any more. Ready?",
  // owner decision 2026-11-08: test-pass keeps its words
  "/audio/wren/m08p-test-pass.mp3":
    "[proud] Yes! Six perfect fakes and not one of them fooled you. Case closed, Agent. You've earned it.",
  "/audio/wren/m08p-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",

  // debrief
  "/audio/wren/m08p-debrief.mp3":
    "[proud] You beat the machine.",
};
