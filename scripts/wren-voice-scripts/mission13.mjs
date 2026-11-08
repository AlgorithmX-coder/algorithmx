/**
 * WREN's spoken scripts for Case 013 ("Backdoors", the Console runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice has no text field in case13.ts — recovered by transcription.
 * test.failVoice is the generic template reused across cases (confirmed
 * against Case 11/12's).
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress, and SKELETON KEY is "he".
 */
export const mission13VoiceScripts = {
  "/audio/wren/m13c-open-1.mp3":
    "[serious] Your locks are strong now, Agent. You've got unique passwords, 2FA, the lot. So SKELETON KEY has stopped trying the front door entirely.",
  "/audio/wren/m13c-open-2.mp3":
    "[serious] He's going for the back door instead, which is account recovery. That means the forgot password button, the security questions, and the recovery email. If those are weak, your brilliant password doesn't matter one bit.",
  "/audio/wren/m13c-open-3.mp3":
    "[serious] You'll learn seven skills to slam every back door shut, then face a boss and a test. Let's find the way in that you never think about, and lock it.",

  // skill 1 — the back door
  "/audio/wren/m13c-s1-learn.mp3":
    "[warm] Here's the thing almost everyone forgets. Every account has a second way in, called the recovery path. It's the button you press when you forget your password. It exists so you can get back in. But it's a door too. If it's weaker than your password, that's the door a thief walks through. A castle with a titanium gate and an open back window isn't safe. So let's go and find those windows.",
  "/audio/wren/m13c-s1-ok.mp3":
    "[warm] Exactly. Why pick a titanium lock when there's a back door? A thief always goes for the weakest way in, and recovery is the one people never think to strengthen. So that's what we're about to do.",
  "/audio/wren/m13c-s1-bad.mp3":
    "[warm] A strong, unique password with 2FA is a dead end, so he won't waste his time there. He looks for a weaker door, which is recovery. Try again.",
  "/audio/wren/m13c-s1-bad2.mp3":
    "[warm] SKELETON KEY doesn't give up. He just changes doors. The recovery path is the one he's heading for. Try again.",
  "/audio/wren/m13c-s1-q2ok.mp3":
    "[warm] Right. There are two real doors, the password you type and the recovery path behind it. Lock only the front, and the back stays wide open.",
  "/audio/wren/m13c-s1-q3ok.mp3":
    "[warm] Exactly. A brilliant front lock is real progress, but the back door is still there, and it still counts. That is why we go and shut it.",

  // skill 2 — guessable answers
  "/audio/wren/m13c-s2-learn.mp3":
    "[warm] Look at what security questions ask. They want your first pet's name, your mum's maiden name, or the street you grew up on. Now remember Case 4, and your footprint. Every one of those answers is sitting in your posts, your photos, and your family's profiles. A security question isn't a secret. It's a quiz a stranger can pass by scrolling your feed. That's the flaw.",
  "/audio/wren/m13c-s2-ok.mp3":
    "[warm] Right. Bailey the dog is in six photos, so that so-called secret answer is public. A security question you can answer truthfully is one a thief can answer too. So we're going to stop answering them truthfully.",
  "/audio/wren/m13c-s2-bad.mp3":
    "[warm] Your pet is tagged in half your photos. That answer is public, not secret. Try again.",
  "/audio/wren/m13c-s2-bad2.mp3":
    "[warm] They very much can be, and that's the problem. The answer is easy to find. Try again.",
  "/audio/wren/m13c-s2-q2ok.mp3":
    "[warm] Right. Your pet, your street, and your mum's maiden name are all sitting in someone's public post. A question you can answer honestly is one a stranger can answer too.",
  "/audio/wren/m13c-s2-q3ok.mp3":
    "[warm] Exactly. Everything they scraped is public, so no true answer is really secret. That is why we stop answering truthfully next.",

  // skill 3 — answers can be lies
  "/audio/wren/m13c-s3-learn.mp3":
    "[warm] Here's the clever fix, and it feels like cheating. Your security answers don't have to be true. Nobody checks whether Bailey was really your first pet. So you make the answer something no one could ever guess, and you treat it like a password. What was your first pet's name? Your answer could be purple-tractor-42. It's unguessable, and your password manager remembers it for you. A lie that only you know is the strongest answer there is.",
  "/audio/wren/m13c-s3-ok.mp3":
    "[warm] Perfect. It's a made-up answer no one can look up, and your manager remembers it so you never lose it. Now even a thief who knows your whole life story can't answer your security question, because the answer isn't your life story.",
  "/audio/wren/m13c-s3-bad.mp3":
    "[warm] Careful. Anything true, or anything public like your bio, is guessable. The strongest answer is a made-up one that your manager remembers. Pick those two.",
  "/audio/wren/m13c-s3-q2ok.mp3":
    "[warm] Perfect. Nobody checks whether it is true. A made-up answer treated like a password is unbeatable, and your manager remembers it for you.",
  "/audio/wren/m13c-s3-q2bad.mp3":
    "[warm] That is the one thing a thief can look up. The answer does not have to be true, so do not make it your real pet's name. Try again.",
  "/audio/wren/m13c-s3-q2bad2.mp3":
    "[warm] That's far too easy to guess. Use a long, made-up answer that your manager stores. Try again.",
  "/audio/wren/m13c-s3-q3ok.mp3":
    "[warm] That is the trick. The answer can be a lie, and your manager keeps it safe, so it is both unguessable and unforgettable. Whether it's true never comes into it.",

  // skill 4 — keep recovery fresh
  "/audio/wren/m13c-s4-learn.mp3":
    "[warm] Here's one more back-door check. Your account might reset through an old email you don't use any more. If someone gets into that dead inbox, they can reset everything through it. So your recovery email or phone must be current, and one you still control. It must also be locked with its own 2FA. A recovery email is a master key, so treat it like one.",
  "/audio/wren/m13c-s4-ok.mp3":
    "[warm] That's locked. You have a current recovery email you control, with its own second lock. There's no dead old inbox hanging around as a way in. Whoever controls your recovery controls your account, and now that's only you.",
  "/audio/wren/m13c-s4-bad.mp3":
    "[warm] Not quite. Your recovery email must be current, and it must have 2FA. An old, forgotten inbox is a way in, not a safety net. Fix the switches.",
  "/audio/wren/m13c-s4-q2ok.mp3":
    "[warm] Exactly. A recovery email is a master key. If it is an old inbox you never check, a thief who cracks it can reset every account it points to.",
  "/audio/wren/m13c-s4-q2bad.mp3":
    "[warm] Old and forgotten is worse, not safer. You are not watching it, so a break-in goes unnoticed. Try again.",
  "/audio/wren/m13c-s4-q2bad2.mp3":
    "[warm] They can, and that is the whole risk. If it still resets your account, it is still a live key. Try again.",
  "/audio/wren/m13c-s4-q3ok.mp3":
    "[warm] That is a locked master key. It's current, so you would spot trouble, and it's protected by 2FA, so a thief cannot use it to reset the rest.",

  // skill 5 — log out the strangers
  "/audio/wren/m13c-s5-learn.mp3":
    "[warm] Here's the last door. You leave yourself logged in everywhere, and then you forget. Think of that library computer, a friend's tablet, or a phone you sold. Every account keeps a list of the devices it's logged in on, and each one is a door left open. So build two habits. On any shared or public machine, log out when you're done, and never just close the tab. And now and then, check that device list and kick off anything you don't recognise.",
  "/audio/wren/m13c-s5-ok.mp3":
    "[warm] That's a good sweep. Your own phone stays. But the library PC you forgot, and a login from a city you've never been to, are both doors slammed shut. Logging out of devices you've finished with is a two-second habit that closes real gaps.",
  "/audio/wren/m13c-s5-bad.mp3":
    "[warm] Not quite. Keep your own phone, but log out the forgotten library PC and that unknown device in another city. Neither of those is you. Fix it.",
  "/audio/wren/m13c-s5-q2ok.mp3":
    "[warm] Right. Closing the tab often leaves you logged in for the next person. A two-second log out shuts that door.",
  "/audio/wren/m13c-s5-q2bad.mp3":
    "[warm] Closing the tab can leave your session alive. The next user might open it right back up. Log out properly. Try again.",
  "/audio/wren/m13c-s5-q2bad2.mp3":
    "[warm] On a public machine, that is an open door for anyone who sits down next. Always log out when you are done. Try again.",
  "/audio/wren/m13c-s5-q3ok.mp3":
    "[warm] That's a good sweep. A login from somewhere you have never been and a device you no longer own are both open doors. Kick them off, and keep your own.",

  // skill 6 — know SKELETON KEY's play
  "/audio/wren/m13c-s6-learn.mp3":
    "[warm] Let's look at SKELETON KEY's back-door play. It has four moves. First, he skips your strong password entirely. Second, he clicks the forgot password button. Third, he answers your security questions using facts scraped from your public life. Fourth, he resets your password and strolls in. And here's the wall you just built. You have made-up answers he can't guess, and a locked recovery email he can't reach. Every move fails.",
  "/audio/wren/m13c-s6-ok.mp3":
    "[warm] That's the whole defence. He can know your real pet, street, and school, and he still can't answer, because your answers are lies only you know. And he can't hijack your recovery email either. The back door is shut.",
  "/audio/wren/m13c-s6-bad.mp3":
    "[warm] Assume he knows everything real about you. That's the point. He fails because your answers aren't the real details. Try again.",
  "/audio/wren/m13c-s6-bad2.mp3":
    "[warm] Recovery works fine, and that's why it's a target. He fails because you made the answers unguessable and locked your recovery. Try again.",
  "/audio/wren/m13c-s6-q2ok.mp3":
    "[warm] That is the play. He skips the password, clicks forgot password, answers from your public life, resets, and strolls in. Those are four quiet moves that never touch your strong password.",
  "/audio/wren/m13c-s6-q3ok.mp3":
    "[warm] Exactly. He can skip your password all he likes, but made-up answers and a locked recovery email leave him stuck at the back door. Every move fails.",

  // skill 7 — slam the side door
  "/audio/wren/m13c-s7-learn.mp3":
    "[warm] This last skill is your back-door habit. One, make your security answers unguessable lies that your manager remembers. Two, keep your recovery email current, and lock it with 2FA. Three, log out on shared machines, and sweep your device list now and then. Do those, and you've closed the door most people never even knew was open.",
  "/audio/wren/m13c-s7-ok.mp3":
    "[warm] That's the back door bolted. You have made-up answers, locked recovery, and clean sessions. A thief can know everything true about you, and still be left standing outside every door.",
  "/audio/wren/m13c-s7-bad.mp3":
    "[warm] Careful, you picked a weak one. True answers and old recovery emails are exactly the gaps a thief uses. Choose only the three that shut the door.",
  "/audio/wren/m13c-s7-q2ok.mp3":
    "[warm] That's a great pick. That single move beats a thief's whole scrapbook, however much they already know about you.",
  "/audio/wren/m13c-s7-q2bad.mp3":
    "[warm] Understanding a door does not bolt it. Pick the move that actually shuts it. Try again.",
  "/audio/wren/m13c-s7-q2bad2.mp3":
    "[warm] Thieves do not read warnings. Change your answers and lock recovery instead. Try again.",
  "/audio/wren/m13c-s7-q3ok.mp3":
    "[warm] That is the whole habit locked in. With made-up answers, locked recovery and clean sessions, the back door most people never notice stays bolted.",

  // boss — "The Side Door"
  "/audio/wren/m13c-boss-intro.mp3":
    "[determined] This is it, Agent. SKELETON KEY has given up on your password and gone straight for the back door. He's armed with everything he scraped about your life. You'll get no hints from me. Hold the recovery path, and tell me why every attempt bounces.",
  "/audio/wren/m13c-boss-win.mp3":
    "[proud] Watch that, Agent. SKELETON KEY knew your real pet, your real school and your real street, and he still couldn't get in. Your made-up answers beat his whole scrapbook. Your locked recovery email held, and there wasn't a single forgotten door left open. You didn't just lock the front. You bolted every window he knew about.",

  // test — "Prove it"
  "/audio/wren/m13c-test-intro.mp3":
    "[warm] There's one last thing before I sign this off, and that's the test. The scenarios are fresh, there are no hints, and you need to pass. Put everything you know about back doors to work. Ready?",
  "/audio/wren/m13c-test-pass.mp3":
    "[proud] Yes! You held every door on your own, even against a thief who knew all your real details. Everything is beautifully bolted, Agent.",
  "/audio/wren/m13c-test-fail.mp3":
    "[warm] That was so close, Agent. Don't sweat it, because even pros miss a couple. Take a breath and run it again. You know this.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
export const mission13Say = {
  "purple-tractor-42": "purple tractor forty-two",
  "2FA": "two F A",
};
