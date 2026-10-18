/**
 * WREN's spoken scripts for Case 006 ("Levers", Block 2 opener). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 *
 * Block 2 structure differs from Block 1: the scam ("con") messages
 * themselves are NEVER voiced, by design (case06.ts: "the cons are text you
 * read, never voiced, so you learn by being TARGETED, not lectured"). Only
 * WREN's own lines are voiced — but there are MORE of them per case than in
 * Block 1, because every branching choice outcome has its own WREN reaction.
 *
 * test.passVoice/failVoice have no text field in case06.ts (same gap as the
 * ATLAS block intros and Block 1's shared catch-pass/fail) — recovered here
 * by transcription.
 */
export const mission06VoiceScripts = {
  "/audio/wren/m06p-open-1.mp3":
    "[warm] New block, Agent, and a whole new job. No control room tonight. Just this, your phone.",
  "/audio/wren/m06p-open-2.mp3":
    "[serious] Because this is where it really happens. People won't hack your machine. They'll message you, sweet as anything, and try to work you through the screen.",
  "/audio/wren/m06p-open-3c.mp3":
    "[excited] Seven skills, then a boss and a test to close the case, all in your messages. Let's turn you into someone a con can't touch.",

  // skill 1 — spot the lever
  "/audio/wren/m06p-teach-intro.mp3":
    "[curious] Every con on earth runs on just six feelings, six levers they pull on you. Learn these six and you'll see one coming a mile off.",
  "/audio/wren/m06p-teach-hurry.mp3":
    "[serious] They rush you so you can't stop and think.",
  "/audio/wren/m06p-teach-scarcity.mp3":
    "[serious] They make it feel rare, so you grab it fast.",
  "/audio/wren/m06p-teach-authority.mp3":
    "[serious] They act important so you just do as you're told.",
  "/audio/wren/m06p-teach-liking.mp3":
    "[warm] They befriend you first, so you won't want to say no.",
  "/audio/wren/m06p-teach-fear.mp3":
    "[concerned] They scare you so you panic and act fast.",
  "/audio/wren/m06p-teach-payback.mp3":
    "[serious] They give you a gift so you feel you owe them.",
  "/audio/wren/m06p-teach-outro.mp3":
    "[encouraging] That's your six, hurry, scarcity, authority, liking, fear, payback. [excited] Now let's catch one in the wild. Here comes your first message.",
  "/audio/wren/m06p-t1-eager.mp3":
    "[concerned] Whoa, slow down. You don't even know who this is yet. Getting excited is exactly what he's counting on. Ask who he is first.",
  "/audio/wren/m06p-t1-read.mp3":
    "[warm] Good. Now don't chase the prize, read HIM. Here he goes.",
  "/audio/wren/m06p-t1-hurry.mp3":
    "[proud] Called it. That 20-minute clock isn't real, it's just there to stop you thinking. That's your first lever, felt and named.",
  "/audio/wren/m06p-s1-q2ok.mp3":
    "[proud] Named it. That flash of panic is exactly what he wants, so you act before you think. Fear, spotted.",
  "/audio/wren/m06p-s1-q2bad.mp3":
    "[warm] Not this one. There's no warmth here, just a scare. Look at the feeling he's pushing. Try again.",
  "/audio/wren/m06p-s1-q3ok.mp3":
    "[proud] Exactly. 'Only 5' makes it feel rare, so you reach before you think. That's scarcity.",
  "/audio/wren/m06p-s1-q3bad.mp3":
    "[warm] Nobody's acting like a boss here. The pull is that it feels rare. Look again. Try again.",
  "/audio/wren/m06p-s1-q3bad2.mp3":
    "[warm] No gift has landed yet. It's the 'only 5' doing the work. Try again.",

  // skill 2 — levers stack
  "/audio/wren/m06p-s2-learn.mp3":
    "[serious] A con almost never stops at one lever. He stacks them, hoping one of them lands. So don't relax after you spot the first, the next is usually right behind it. Watch Kai keep going.",
  "/audio/wren/m06p-t1-scarcity.mp3":
    "[proud] Two in a row. He rushed you, then made it rare. That's the stack, and you named both.",
  "/audio/wren/m06p-t1-ask.mp3":
    "[determined] And there's the real ask. Freeze. A real mod NEVER needs your password. This whole 'tournament' was the bait for THIS. Your call.",
  "/audio/wren/m06p-t1-bad.mp3":
    "[concerned] Stop, don't send it. That password is the only thing he ever wanted, and once it's gone you can't get it back. Try that last move again.",
  "/audio/wren/m06p-t1-win.mp3":
    "[excited] Look at that. Now HE'S the one panicking. He's scrambling like this because he knows that you know it's a scam. The moment a con flips from smooth to desperate, you've already won. [proud] Brilliant, Agent.",
  "/audio/wren/m06p-t1-win2.mp3":
    "[proud] Even better. You shut him down before he could get another word in. That's how you end it. Well done, Agent.",
  "/audio/wren/m06p-s2-q2ok.mp3":
    "[proud] All three, tagged. 'Prize team' is authority, '1 code left' is scarcity, '10 mins' is hurry. That's the whole stack, right where it landed.",

  // skill 3 — the gift with a string
  "/audio/wren/m06p-s3-learn.mp3":
    "[curious] Here's a sneaky one. Sometimes a con gives you something first, a gift, a prize, so you feel like you owe them back. It's called payback, and under all the pressure there's always ONE real ask. Your job is to find it. Watch.",
  "/audio/wren/m06p-t3-eager.mp3":
    "[concerned] Careful. Free stuff you never entered for, from a stranger? That's the hook, and you're reaching for it. Ask what the catch is first.",
  "/audio/wren/m06p-t3-warn.mp3":
    "[serious] Nothing's free, and you never entered anything. Keep reading, here comes the hook.",
  "/audio/wren/m06p-t3-payback.mp3":
    "[proud] There's PAYBACK. They 'gave' you something so you feel like you owe them one. But a gift with a string was never a gift, it was bait on a hook.",
  "/audio/wren/m06p-s3-ask.mp3":
    "[proud] Exactly. Every lever was just there to get you to that one link and hand over your login. Find the real ask and the whole con falls apart.",
  "/audio/wren/m06p-s3-askbad.mp3":
    "[warm] That's the wrapper, not the goal. No real prize ever needs you to log in through a stranger's link. Look again at what he wants you to DO.",
  "/audio/wren/m06p-s3-askbad2.mp3":
    "[warm] He doesn't care about that. Follow the pressure to the thing he wants you to DO, that's the real ask.",
  "/audio/wren/m06p-t3-bad.mp3":
    "[concerned] Stop. That login is the whole prize, for THEM. You don't owe a stranger a thing. Try that again.",
  "/audio/wren/m06p-s3-q2ok.mp3":
    "[proud] That's the real ask. The gift was only there to walk you to that login box. Find the ask and it falls apart.",
  "/audio/wren/m06p-s3-q2bad.mp3":
    "[warm] No real bonus makes you log in through a stranger's link. Follow what he wants you to DO. Try again.",
  "/audio/wren/m06p-s3-q3ok.mp3":
    "[proud] Exactly. A gift with a string was never a gift. You don't owe a stranger anything.",
  "/audio/wren/m06p-s3-q3bad.mp3":
    "[warm] The 'favour' right after the gift is the giveaway. That's payback, not kindness. Try again.",
  "/audio/wren/m06p-s3-q3bad2.mp3":
    "[warm] Free stuff you never asked for, with an ask attached, is bait. Look for the string. Try again.",

  // skill 4 — verify another channel
  "/audio/wren/m06p-t2-intro.mp3":
    "[warm] This next one is actually your best friend Maya's account. So why might it feel off? Because accounts get stolen, and when they do, the thief keeps the friendship you built. Watch how 'Maya' talks.",
  "/audio/wren/m06p-t2-fear.mp3":
    "[proud] Yep, panic and pressure, so you act before you think. There's a bit of LIKING in there too, leaning on your friendship. But a code sent to YOUR phone unlocks YOUR account, never hers.",
  "/audio/wren/m06p-t2-verify.mp3":
    "[determined] Here's the golden rule for a friend acting weird, check on a DIFFERENT channel. Don't reply here, where a thief could be reading. What do you do?",
  "/audio/wren/m06p-t2-bad.mp3":
    "[concerned] That code was for YOUR account, and you just handed it to whoever stole hers. Rewind, a real friend won't mind you checking first.",
  "/audio/wren/m06p-t2-dodge.mp3":
    "[encouraging] See that? The real Maya would answer. A thief dodges and rushes you instead. That dodge just gave the whole thing away.",
  "/audio/wren/m06p-s4-q2ok.mp3":
    "[proud] That's it. A different channel beats the thief. A real Sam won't mind you checking first.",
  "/audio/wren/m06p-s4-q2bad.mp3":
    "[warm] A code sent to YOUR phone unlocks YOUR account, not Sam's. Check another way first. Try again.",
  "/audio/wren/m06p-s4-q3ok.mp3":
    "[proud] Perfect. Verify on a channel you know before you act. If it's really them, they'll still be there.",
  "/audio/wren/m06p-s4-q3bad.mp3":
    "[warm] Names and photos are easy to copy. That's not proof it's them. Check another way. Try again.",
  "/audio/wren/m06p-s4-q3bad2.mp3":
    "[warm] A thief will just say 'i promise.' The same channel proves nothing. Reach them elsewhere. Try again.",

  // skill 5 — read one move ahead
  "/audio/wren/m06p-t4-intro.mp3":
    "[curious] This account added you two weeks ago. Sweet, funny, seemed to know your mates. I've fast-forwarded the whole thing so you can see its shape. Watch how patient it is, and try to see where it's heading.",
  "/audio/wren/m06p-t4-liking.mp3":
    "[warm] See that? No ask at all, just warmth, for days on end. That's the LIKING lever being BUILT. She's not spending it yet, she's saving it up.",
  "/audio/wren/m06p-t4-ahead.mp3":
    "[curious] Now two weeks of this go by. Then one day the tone changes. You've seen the levers, so YOU tell me. What do you think her first real ask looks like?",
  "/audio/wren/m06p-t4-pred-a.mp3":
    "[warm] That's what she WANTS you to expect. Two weeks of niceness was an investment, and investments get cashed in. Think again.",
  "/audio/wren/m06p-t4-pred-b.mp3":
    "[warm] Too clumsy for this one. She's sweet, remember? The ask hides INSIDE the kindness. Think again.",
  "/audio/wren/m06p-t4-ask.mp3":
    "[serious] And there it is, exactly where you called it. Two weeks of being lovely, cashed in for money. 'You're my only friend' is the squeeze, so saying no feels cruel. That's how the long con pays off.",
  "/audio/wren/m06p-t4-bad.mp3":
    "[concerned] You'll never see that tenner again, and next week she'll need twenty. Kindness isn't a debt you owe. Try again.",
  "/audio/wren/m06p-t4-guilt.mp3":
    "[warm] And there's the last trick, guilt. 'After everything' is FEAR and PAYBACK teamed up to make you feel like a bad person for saying no. You're not. A real friend would never do this, and you did exactly right.",
  "/audio/wren/m06p-s5-q2ok.mp3":
    "[proud] You read it right. 'You'd help me, right?' is the runway. The real ask is about to land.",
  "/audio/wren/m06p-s5-q2bad.mp3":
    "[warm] That's what they want you to think. All that warmth is an investment. Look one move ahead. Try again.",
  "/audio/wren/m06p-s5-q3ok.mp3":
    "[proud] Exactly. The long con is patient. Seeing the ask coming is how you're ready when it does.",
  "/audio/wren/m06p-s5-q3bad.mp3":
    "[warm] Real friends do ask sometimes. It's the built-up pressure to say yes that's the warning. Try again.",
  "/audio/wren/m06p-s5-q3bad2.mp3":
    "[warm] Too clumsy for a sweet long con. The ask hides inside the kindness, not a threat. Try again.",

  // skill 6 — know SIREN's play
  "/audio/wren/m06p-s6-learn.mp3":
    "[serious] Step back, because every con you just met ran the SAME four moves, in the same order. First they make friends or grab your attention. Then they pull a lever, a feeling. Then comes the real ask. And if you hesitate, they pile on guilt to push you over. [determined] Learn that shape and no con can surprise you.",
  "/audio/wren/m06p-s6-ok.mp3":
    "[proud] That's the play, start to finish. Warm-up, lever, ask, guilt. Spot which move you're in, and you always know what's coming next.",
  "/audio/wren/m06p-s6-bad.mp3":
    "[warm] No con leads with the ask, you'd say no on the spot. They warm you up FIRST, so the ask feels normal by the time it lands. Try again.",
  "/audio/wren/m06p-s6-bad2.mp3":
    "[warm] Close, but guilt is the LAST move, the shove when you hesitate, not the opener. Put the warm-up first. Try again.",
  "/audio/wren/m06p-s6-q2ok.mp3":
    "[proud] Spot on. Guilt is the closer, the push after the ask. You know it, so it can't move you.",
  "/audio/wren/m06p-s6-q2bad.mp3":
    "[warm] The warm-up is sweet, not sulky. 'After everything' is guilt, the final move. Try again.",
  "/audio/wren/m06p-s6-q3ok.mp3":
    "[proud] Right. Warm-up, lever, then the ask. Naming the move you're in tells you what's coming.",
  "/audio/wren/m06p-s6-q3bad.mp3":
    "[warm] The warm-up comes first, before the lever. After a lever comes the ask. Try again.",
  "/audio/wren/m06p-s6-q3bad2.mp3":
    "[warm] Not yet. The lever is the setup for the real ask. Stay ready. Try again.",

  // skill 7 — walk away clean
  "/audio/wren/m06p-s7-learn.mp3":
    "[warm] Last skill, and it's the most important. When you've spotted a con, you don't owe them a debate. You don't need to prove they're fake. You just get out clean, stop replying, block and report, and if it shook you at all, tell an adult you trust. [encouraging] Walking away isn't rude and it isn't weak. It's the win.",
  "/audio/wren/m06p-s7-ok.mp3":
    "[proud] Perfect. No reply, no argument, just gone, and an adult in the loop. That's a clean walk-away, and it's exactly how a pro ends it.",
  "/audio/wren/m06p-s7-bad.mp3":
    "[warm] Tempting, but arguing just tells them you're paying attention, and keeps the door open. You owe a con nothing, not even the last word. Try again.",
  "/audio/wren/m06p-s7-bad2.mp3":
    "[warm] I know it feels clever, but any reply keeps you on their hook and marks you as a live target. The clean move is no reply at all. Try again.",
  "/audio/wren/m06p-s7-q2ok.mp3":
    "[proud] That's it. Silence, then block and report. You don't owe a con another word.",
  "/audio/wren/m06p-s7-q2bad.mp3":
    "[warm] Any reply keeps the door open and marks you as active. Just go quiet. Try again.",
  "/audio/wren/m06p-s7-q3ok.mp3":
    "[proud] Exactly. Telling someone isn't weak, it's smart, and it takes the weight off you.",
  "/audio/wren/m06p-s7-q3bad.mp3":
    "[warm] Nobody's silly for being targeted, cons are built to fool people. Tell a trusted adult. Try again.",
  "/audio/wren/m06p-s7-q3bad2.mp3":
    "[warm] That just reopens the door. You've already won by walking away. Try again.",

  // boss — "The Setup"
  "/audio/wren/m06p-boss-intro.mp3":
    "[serious] This is it, Agent. One last con, and this time you're on your own. No hints from me. [determined] Name every lever, find the ask, and get out clean. Show me you've got it.",
  "/audio/wren/m06p-boss-win.mp3":
    "[excited] That's it. Authority, fear, and hurry, stacked up and thrown at you fast, and you named every one, found the ask, and refused, with me saying nothing at all. [proud] You're not just safe now, Agent. You're sharp.",

  // test — "Prove it"
  "/audio/wren/m06p-test-intro.mp3":
    "[serious] Last thing before I close the case, the test. A fresh batch of scams you haven't seen. No hints, and you'll need most of them right. [determined] Take what you learned and think. [excited] Ready?",
  "/audio/wren/m06p-test-pass.mp3":
    "[excited] Yes! Six fresh scams, and you saw straight through every one, all on your own. [proud] Case closed, Agent. You've earned it.",
  "/audio/wren/m06p-test-fail.mp3":
    "[warm] So close. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You know this.",

  // debrief
  "/audio/wren/m06p-debrief.mp3":
    "[proud] You made it through the night.",
};
