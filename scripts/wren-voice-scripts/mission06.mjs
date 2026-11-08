/**
 * WREN's spoken scripts for Case 006 ("Levers", Block 2 opener). See
 * mission01.mjs for why this is a separate file from the on-screen text.
 *
 * Block 2 structure differs from Block 1: the scam ("con") messages
 * themselves are NEVER voiced, by design (case06.ts: "the cons are text you
 * read, never voiced, so you learn by being TARGETED, not lectured"). Only
 * WREN's own lines are voiced, but there are MORE of them per case than in
 * Block 1, because every branching choice outcome has its own WREN reaction.
 *
 * test.passVoice/failVoice have no text field in case06.ts (same gap as the
 * ATLAS block intros and Block 1's shared catch-pass/fail), recovered here
 * by transcription. They are spoken only.
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress. Test-pass wording kept as it was (owner decision 3).
 */
export const mission06VoiceScripts = {
  "/audio/wren/m06p-open-1.mp3":
    "[warm] Welcome to a new block, Agent, and a whole new job. There's no control room tonight, just this, your phone.",
  "/audio/wren/m06p-open-2.mp3":
    "[warm] That's because this is where it really happens. People won't hack your machine. They'll message you, sweet as anything, and try to work you through the screen.",
  "/audio/wren/m06p-open-3c.mp3":
    "[warm] You'll learn seven skills, then face a boss and a test to close the case, all in your messages. Let's turn you into someone a con can't touch.",

  // skill 1 — spot the lever
  "/audio/wren/m06p-teach-intro.mp3":
    "[warm] Every con on earth runs on just six feelings, six levers they pull on you. Learn these six and you'll see one coming a mile off.",
  "/audio/wren/m06p-teach-hurry.mp3":
    "[warm] They rush you so you can't stop and think.",
  "/audio/wren/m06p-teach-scarcity.mp3":
    "[warm] They make it feel rare, so you grab it fast.",
  "/audio/wren/m06p-teach-authority.mp3":
    "[warm] They act important so you just do as you're told.",
  "/audio/wren/m06p-teach-liking.mp3":
    "[warm] They befriend you first, so you won't want to say no.",
  "/audio/wren/m06p-teach-fear.mp3":
    "[warm] They scare you so you panic and act fast.",
  "/audio/wren/m06p-teach-payback.mp3":
    "[warm] They give you a gift so you feel you owe them.",
  "/audio/wren/m06p-teach-outro.mp3":
    "[warm] That's your six levers. They're hurry, scarcity, authority, liking, fear and payback. Now let's catch one in the wild. Here comes your first message.",
  "/audio/wren/m06p-t1-eager.mp3":
    "[warm] Whoa, slow down. You don't even know who this is yet. Getting excited is exactly what he's counting on. Ask who he is first.",
  "/audio/wren/m06p-t1-read.mp3":
    "[warm] Good. Now don't chase the prize. Read him instead. Here he goes.",
  "/audio/wren/m06p-t1-hurry.mp3":
    "[warm] You called it. That twenty-minute clock isn't real. It's just there to stop you thinking. That's your first lever, felt and named.",
  "/audio/wren/m06p-s1-q2ok.mp3":
    "[warm] You named it. That flash of panic is exactly what he wants, so you act before you think. That's fear, spotted.",
  "/audio/wren/m06p-s1-q2bad.mp3":
    "[warm] It isn't this one. There's no warmth here, just a scare. Look at the feeling he's pushing. Try again.",
  "/audio/wren/m06p-s1-q3ok.mp3":
    "[warm] Exactly. Being one of only five makes it feel rare, so you reach before you think. That's scarcity.",
  "/audio/wren/m06p-s1-q3bad.mp3":
    "[warm] Nobody's acting like a boss here. The pull is that it feels rare. Try again.",
  "/audio/wren/m06p-s1-q3bad2.mp3":
    "[warm] No gift has landed yet. Being one of only five is what's doing the work. Try again.",

  // skill 2 — levers stack
  "/audio/wren/m06p-s2-learn.mp3":
    "[warm] A con almost never stops at one lever. He stacks them, hoping one of them lands. So don't relax after you spot the first one, because the next is usually right behind it. Watch Kai keep going.",
  "/audio/wren/m06p-t1-scarcity.mp3":
    "[warm] You've got two in a row. He rushed you, then made it rare. That's the stack, and you named both.",
  "/audio/wren/m06p-t1-ask.mp3":
    "[warm] And there's the real ask. Freeze. A real mod never needs your password. This whole tournament was only ever the bait for this. It's your call.",
  "/audio/wren/m06p-t1-bad.mp3":
    "[warm] Stop. Don't send it. That password is the only thing he ever wanted, and once it's gone you can't get it back. Try that last move again.",
  "/audio/wren/m06p-t1-win.mp3":
    "[warm] Look at that. Now he's the one panicking. He's scrambling like this because he knows that you know it's a scam. The moment a con flips from smooth to desperate, you've already won. That was brilliant, Agent.",
  "/audio/wren/m06p-t1-win2.mp3":
    "[warm] That's even better. You shut him down before he could get another word in, and that's how you end it. Well done, Agent.",
  "/audio/wren/m06p-s2-q2ok.mp3":
    "[warm] You tagged all three. The prize team is authority, one code left is scarcity, and ten minutes is hurry. That's the whole stack, right where it landed.",

  // skill 3 — the gift with a string
  "/audio/wren/m06p-s3-learn.mp3":
    "[warm] Here's a sneaky one. Sometimes a con gives you something first, like a gift or a prize, so you feel like you owe them back. That's called payback. Under all the pressure, there's always one real ask, and your job is to find it. Watch.",
  "/audio/wren/m06p-t3-eager.mp3":
    "[warm] Careful. This is free stuff you never entered for, from a stranger. That's the hook, and you're reaching for it. Ask what the catch is first.",
  "/audio/wren/m06p-t3-warn.mp3":
    "[warm] Nothing's free, and you never entered anything. Keep reading, because here comes the hook.",
  "/audio/wren/m06p-t3-payback.mp3":
    "[warm] There's payback. They say they gave you something, so you feel like you owe them one. But a gift with a string was never a gift. It was bait on a hook.",
  "/audio/wren/m06p-s3-ask.mp3":
    "[warm] Exactly. Every lever was just there to get you to that one link and hand over your login. Find the real ask and the whole con falls apart.",
  "/audio/wren/m06p-s3-askbad.mp3":
    "[warm] That's the wrapper, not the goal. No real prize ever needs you to log in through a stranger's link. Look again at what he wants you to do.",
  "/audio/wren/m06p-s3-askbad2.mp3":
    "[warm] He doesn't care about that. Follow the pressure to the thing he wants you to do. That's the real ask.",
  "/audio/wren/m06p-t3-bad.mp3":
    "[warm] Stop. That login is the whole prize, but it's a prize for them. You don't owe a stranger a thing. Try that again.",
  "/audio/wren/m06p-s3-q2ok.mp3":
    "[warm] That's the real ask. The gift was only there to walk you to that login box. Find the ask and it falls apart.",
  "/audio/wren/m06p-s3-q2bad.mp3":
    "[warm] No real bonus makes you log in through a stranger's link. Follow what he wants you to do. Try again.",
  "/audio/wren/m06p-s3-q3ok.mp3":
    "[warm] Exactly. A gift with a string was never a gift. You don't owe a stranger anything.",
  "/audio/wren/m06p-s3-q3bad.mp3":
    "[warm] The favour they ask for right after the gift is the giveaway. That's payback, not kindness. Try again.",
  "/audio/wren/m06p-s3-q3bad2.mp3":
    "[warm] Free stuff you never asked for, with an ask attached, is bait. Look for the string. Try again.",

  // skill 4 — verify another channel
  "/audio/wren/m06p-t2-intro.mp3":
    "[warm] This next one is actually your best friend Maya's account. So why might it feel off? It's because accounts get stolen, and when they do, the thief keeps the friendship you built. Watch how the person typing as Maya talks.",
  "/audio/wren/m06p-t2-fear.mp3":
    "[warm] Yep, that's panic and pressure, so you act before you think. There's a bit of liking in there too, leaning on your friendship. But a code sent to your phone unlocks your account, never hers.",
  "/audio/wren/m06p-t2-verify.mp3":
    "[warm] Here's the golden rule for a friend acting weird. Check on a different channel. Don't reply here, where a thief could be reading. What do you do?",
  "/audio/wren/m06p-t2-bad.mp3":
    "[warm] That code was for your account, and you just handed it to whoever stole hers. Rewind. A real friend won't mind you checking first.",
  "/audio/wren/m06p-t2-dodge.mp3":
    "[warm] See that? The real Maya would answer. A thief dodges and rushes you instead. That dodge just gave the whole thing away.",
  "/audio/wren/m06p-s4-q2ok.mp3":
    "[warm] That's it. A different channel beats the thief. The real Sam won't mind you checking first.",
  "/audio/wren/m06p-s4-q2bad.mp3":
    "[warm] A code sent to your phone unlocks your account, not Sam's. Check another way first. Try again.",
  "/audio/wren/m06p-s4-q3ok.mp3":
    "[warm] Perfect. Verify on a channel you know before you act. If it's really them, they'll still be there.",
  "/audio/wren/m06p-s4-q3bad.mp3":
    "[warm] Names and photos are easy to copy. That's not proof it's them. Check another way. Try again.",
  "/audio/wren/m06p-s4-q3bad2.mp3":
    "[warm] A thief will just promise you it's real. The same channel proves nothing. Reach them elsewhere. Try again.",

  // skill 5 — read one move ahead
  "/audio/wren/m06p-t4-intro.mp3":
    "[warm] This account added you two weeks ago. It was sweet and funny, and it seemed to know your mates. I've fast-forwarded the whole thing so you can see its shape. Watch how patient it is, and try to see where it's heading.",
  "/audio/wren/m06p-t4-liking.mp3":
    "[warm] See that? There's no ask at all, just warmth, for days on end. That's the liking lever being built. She's not spending it yet. She's saving it up.",
  "/audio/wren/m06p-t4-ahead.mp3":
    "[warm] Now two weeks of this go by. Then one day the tone changes. You've seen the levers, so you tell me. What do you think her first real ask looks like?",
  "/audio/wren/m06p-t4-pred-a.mp3":
    "[warm] That's what she wants you to expect. Two weeks of niceness was an investment, and investments get cashed in. Think again.",
  "/audio/wren/m06p-t4-pred-b.mp3":
    "[warm] That's too clumsy for this one. She's sweet, remember? The ask hides inside the kindness. Think again.",
  "/audio/wren/m06p-t4-ask.mp3":
    "[warm] And there it is, exactly where you called it. She spent two weeks being lovely, and now she's cashing it in for money. Calling you her only friend is the squeeze, so saying no feels cruel. That's how the long con pays off.",
  "/audio/wren/m06p-t4-bad.mp3":
    "[warm] You'll never see that tenner again, and next week she'll need twenty. Kindness isn't a debt you owe. Try again.",
  "/audio/wren/m06p-t4-guilt.mp3":
    "[warm] And there's the last trick, which is guilt. When she says after everything, that's fear and payback teaming up to make you feel like a bad person for saying no. You're not a bad person. A real friend would never do this, and you did exactly right.",
  "/audio/wren/m06p-s5-q2ok.mp3":
    "[warm] You read it right. Asking whether you'd help out is the runway. The real ask is about to land.",
  "/audio/wren/m06p-s5-q2bad.mp3":
    "[warm] That's what they want you to think. All that warmth is an investment. Look one move ahead. Try again.",
  "/audio/wren/m06p-s5-q3ok.mp3":
    "[warm] Exactly. The long con is patient. Seeing the ask coming is how you're ready when it does.",
  "/audio/wren/m06p-s5-q3bad.mp3":
    "[warm] Real friends do ask sometimes. It's the built-up pressure to say yes that's the warning. Try again.",
  "/audio/wren/m06p-s5-q3bad2.mp3":
    "[warm] A threat is too clumsy for a sweet long con. The ask hides inside the kindness, not inside a threat. Try again.",

  // skill 6 — know SIREN's play
  "/audio/wren/m06p-s6-learn.mp3":
    "[warm] Step back, because every con you just met ran the same four moves, in the same order. First they make friends or grab your attention. Then they pull a lever, which is a feeling. Then comes the real ask. And if you hesitate, they pile on guilt to push you over. Learn that shape and no con can surprise you.",
  "/audio/wren/m06p-s6-ok.mp3":
    "[warm] That's the play, start to finish. It goes warm-up, lever, ask, then guilt. Spot which move you're in, and you always know what's coming next.",
  "/audio/wren/m06p-s6-bad.mp3":
    "[warm] No con leads with the ask, because you'd say no on the spot. They warm you up first, so the ask feels normal by the time it lands. Try again.",
  "/audio/wren/m06p-s6-bad2.mp3":
    "[warm] That's close, but guilt is the last move. It's the shove when you hesitate, not the opener. Put the warm-up first. Try again.",
  "/audio/wren/m06p-s6-q2ok.mp3":
    "[warm] Spot on. Guilt is the closer, the push after the ask. You know it, so it can't move you.",
  "/audio/wren/m06p-s6-q2bad.mp3":
    "[warm] The warm-up is sweet, not sulky. When a con says after everything, that's guilt, the final move. Try again.",
  "/audio/wren/m06p-s6-q3ok.mp3":
    "[warm] Right. It goes warm-up, lever, then the ask. Naming the move you're in tells you what's coming.",
  "/audio/wren/m06p-s6-q3bad.mp3":
    "[warm] The warm-up comes first, before the lever. After a lever comes the ask. Try again.",
  "/audio/wren/m06p-s6-q3bad2.mp3":
    "[warm] It's not over yet. The lever is the setup for the real ask, so stay ready. Try again.",

  // skill 7 — walk away clean
  "/audio/wren/m06p-s7-learn.mp3":
    "[warm] This is the last skill, and it's the most important. When you've spotted a con, you don't owe them a debate. You don't need to prove they're fake. You just get out clean. Stop replying, block and report, and if it shook you at all, tell an adult you trust. Walking away isn't rude, and it isn't weak. It's the win.",
  "/audio/wren/m06p-s7-ok.mp3":
    "[warm] Perfect. You didn't reply or argue. You were just gone, with an adult in the loop. That's a clean walk-away, and it's exactly how a pro ends it.",
  "/audio/wren/m06p-s7-bad.mp3":
    "[warm] It's tempting, but arguing just tells them you're paying attention, and it keeps the door open. You owe a con nothing, not even the last word. Try again.",
  "/audio/wren/m06p-s7-bad2.mp3":
    "[warm] I know it feels clever, but any reply keeps you on their hook and marks you as a live target. The clean move is no reply at all. Try again.",
  "/audio/wren/m06p-s7-q2ok.mp3":
    "[warm] That's it. Go silent, then block and report. You don't owe a con another word.",
  "/audio/wren/m06p-s7-q2bad.mp3":
    "[warm] Any reply keeps the door open and marks you as active. Just go quiet. Try again.",
  "/audio/wren/m06p-s7-q3ok.mp3":
    "[warm] Exactly. Telling someone isn't weak, it's smart, and it takes the weight off you.",
  "/audio/wren/m06p-s7-q3bad.mp3":
    "[warm] Nobody's silly for being targeted, because cons are built to fool people. Tell a trusted adult. Try again.",
  "/audio/wren/m06p-s7-q3bad2.mp3":
    "[warm] That just reopens the door. You've already won by walking away. Try again.",

  // boss — "The Setup"
  "/audio/wren/m06p-boss-intro.mp3":
    "[determined] This is it, Agent. Here's one last con, and this time you're on your own, with no hints from me. Name every lever, find the ask, and get out clean. Show me you've got it.",
  "/audio/wren/m06p-boss-win.mp3":
    "[proud] That's it. He stacked up authority, fear and hurry, and threw them at you fast. You named every one, found the ask, and refused, with me saying nothing at all. You're not just safe now, Agent. You're sharp.",

  // test — "Prove it"
  "/audio/wren/m06p-test-intro.mp3":
    "[warm] There's one last thing before I close the case, and that's the test. It's a fresh batch of scams you haven't seen. There are no hints, and you'll need most of them right. Take what you learned, and think. Ready?",
  "/audio/wren/m06p-test-pass.mp3":
    "[proud] Yes! Six fresh scams, and you saw straight through every one, all on your own. Case closed, Agent. You've earned it.",
  "/audio/wren/m06p-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",

  // debrief
  "/audio/wren/m06p-debrief.mp3":
    "[proud] You made it through the night.",
};
