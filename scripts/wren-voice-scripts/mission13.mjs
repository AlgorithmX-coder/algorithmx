/**
 * WREN's spoken scripts for Case 013 ("Backdoors", the Console runtime).
 * See mission01.mjs, mission06.mjs, and mission11.mjs for conventions.
 * test.passVoice has no text field in case13.ts — recovered by transcription.
 * test.failVoice is the generic template reused across cases (confirmed
 * against Case 11/12's).
 */
export const mission13VoiceScripts = {
  "/audio/wren/m13c-open-1.mp3":
    "[warm] Your locks are strong now, Agent. Unique passwords, 2FA, the lot. So SKELETON KEY has stopped trying the front door entirely.",
  "/audio/wren/m13c-open-2.mp3":
    "[serious] It's going for the BACK door: account recovery. That 'forgot my password' path, the security questions, the recovery email. If those are weak, your brilliant password doesn't matter one bit.",
  "/audio/wren/m13c-open-3.mp3":
    "[determined] Seven skills to slam every back door shut, then a boss and a test. Let's find the way in that you never think about, and lock it.",

  // skill 1 — the back door
  "/audio/wren/m13c-s1-learn.mp3":
    "[curious] Here's the thing almost everyone forgets. Every account has a SECOND way in, the recovery path, the 'I forgot my password' button. It exists so YOU can get back in. [serious] But it's a door too, and if it's weaker than your password, that's the door a thief walks through. A castle with a titanium gate and an open back window isn't safe. So we go find the windows.",
  "/audio/wren/m13c-s1-ok.mp3":
    "[proud] Exactly. Why pick a titanium lock when there's a back door? A thief always goes for the weakest way in, and recovery is the one people never think to strengthen. So we're about to.",
  "/audio/wren/m13c-s1-bad.mp3":
    "[warm] A strong unique password with 2FA is a dead end, so it won't waste time there. It looks for a weaker door: recovery. Try again.",
  "/audio/wren/m13c-s1-bad2.mp3":
    "[warm] SKELETON KEY doesn't give up, it changes doors. The recovery path is the one it's heading for. Try again.",
  "/audio/wren/m13c-s1-q2ok.mp3":
    "[proud] Right. Two real doors: the password you type, and the recovery path behind it. Lock only the front, and the back stays wide open.",
  "/audio/wren/m13c-s1-q3ok.mp3":
    "[proud] Exactly. A brilliant front lock is real progress, but the back door is still there, and it still counts. That is why we go and shut it.",

  // skill 2 — guessable answers
  "/audio/wren/m13c-s2-learn.mp3":
    "[curious] Look at what security questions ask: your first pet's name, your mum's maiden name, the street you grew up on. And now remember Case 4, the footprint. [serious] Every one of those answers is sitting in your posts, your photos, your relatives' profiles. A security question isn't a secret. It's a quiz a stranger can pass by scrolling your feed. That's the flaw.",
  "/audio/wren/m13c-s2-ok.mp3":
    "[proud] Right. Bailey the dog is in six photos. That 'secret' answer is public. A security question you can answer truthfully is one a thief can answer too. So we're going to stop answering them truthfully.",
  "/audio/wren/m13c-s2-bad.mp3":
    "[warm] Your pet is tagged in half your photos. That answer is public, not secret. Try again.",
  "/audio/wren/m13c-s2-bad2.mp3":
    "[warm] They very much are, and that's the problem, the answer is easy to find. Try again.",
  "/audio/wren/m13c-s2-q2ok.mp3":
    "[proud] Right. Pet, street, mum's maiden name, every one is sitting in someone's public post. A question you can answer honestly is one a stranger can answer too.",
  "/audio/wren/m13c-s2-q3ok.mp3":
    "[proud] Exactly. Everything they scraped is public, so no true answer is really secret. That is why we stop answering truthfully next.",

  // skill 3 — answers can be lies
  "/audio/wren/m13c-s3-learn.mp3":
    "[excited] Here's the clever fix, and it feels like cheating. Your security answers don't have to be TRUE. Nobody checks whether Bailey was really your first pet. [encouraging] So you make the answer something no one could ever guess, and treat it like a password. First pet's name? Answer: purple-tractor-42. It's unguessable, and your password manager remembers it for you. A lie that only you know is the strongest answer there is.",
  "/audio/wren/m13c-s3-ok.mp3":
    "[proud] Perfect. A made-up answer no one can look up, remembered by your manager so you never lose it. Now even a thief who knows your whole life story can't answer your security question, because the answer isn't your life story.",
  "/audio/wren/m13c-s3-bad.mp3":
    "[warm] Careful. Anything true, or anything public like your bio, is guessable. The strongest answer is a made-up one your manager remembers. Pick those two.",
  "/audio/wren/m13c-s3-q2ok.mp3":
    "[proud] Perfect. Nobody checks whether it is true. A made-up answer treated like a password is unbeatable, and your manager remembers it for you.",
  "/audio/wren/m13c-s3-q2bad.mp3":
    "[warm] That is the one thing a thief can look up. The answer does not have to be true, so do not make it your real pet. Try again.",
  "/audio/wren/m13c-s3-q2bad2.mp3":
    "[warm] Far too easy to guess. Use a long, made-up answer your manager stores. Try again.",
  "/audio/wren/m13c-s3-q3ok.mp3":
    "[proud] That is the trick. The answer can be a lie, and your manager keeps it safe, so it is both unguessable and unforgettable. True never comes into it.",

  // skill 4 — keep recovery fresh
  "/audio/wren/m13c-s4-learn.mp3":
    "[serious] One more back-door check. If your account resets through an OLD email you don't use any more, and someone gets into that dead inbox, they can reset everything through it. So your recovery contact, email or phone, must be current, one you still control, and locked with its own 2FA. A recovery email is a master key. Treat it like one.",
  "/audio/wren/m13c-s4-ok.mp3":
    "[proud] Locked. A current recovery email you control, with its own second lock, and no dead old inbox hanging around as a way in. Whoever controls your recovery controls your account, so now that's only you.",
  "/audio/wren/m13c-s4-bad.mp3":
    "[warm] Not quite. Your recovery email must be current AND have 2FA, and an old forgotten inbox is a way in, not a safety net. Fix the switches.",
  "/audio/wren/m13c-s4-q2ok.mp3":
    "[proud] Exactly. A recovery email is a master key. If it is an old inbox you never check, a thief who cracks it can reset every account it points to.",
  "/audio/wren/m13c-s4-q2bad.mp3":
    "[warm] Old and forgotten is worse, not safer. You are not watching it, so a break-in goes unnoticed. Try again.",
  "/audio/wren/m13c-s4-q2bad2.mp3":
    "[warm] They can, and that is the whole risk. If it still resets your account, it is still a live key. Try again.",
  "/audio/wren/m13c-s4-q3ok.mp3":
    "[proud] That is a locked master key. Current, so you would spot trouble, and 2FA protected, so a thief cannot use it to reset the rest.",

  // skill 5 — log out the strangers
  "/audio/wren/m13c-s5-learn.mp3":
    "[warm] Last door: you leave yourself logged in everywhere, and forget. That library computer, a friend's tablet, a phone you sold. Every account keeps a list of devices it's logged in on, and each is a door left open. [encouraging] So two habits: on any shared or public machine, log OUT when you're done, never just close the tab. And now and then, check that device list and kick off anything you don't recognise.",
  "/audio/wren/m13c-s5-ok.mp3":
    "[proud] Good sweep. Your own phone stays, but the library PC you forgot and a login from a city you've never been to are both doors slammed shut. Logging out where you shouldn't be is a two-second habit that closes real gaps.",
  "/audio/wren/m13c-s5-bad.mp3":
    "[warm] Not quite. Keep your own phone, but log OUT the forgotten library PC and that unknown device in another city, those aren't you. Fix it.",
  "/audio/wren/m13c-s5-q2ok.mp3":
    "[proud] Right. Closing the tab often leaves you logged in for the next person. A two-second log out shuts that door.",
  "/audio/wren/m13c-s5-q2bad.mp3":
    "[warm] Closing the tab can leave your session alive. The next user might open it right back up. Log out properly. Try again.",
  "/audio/wren/m13c-s5-q2bad2.mp3":
    "[warm] On a public machine that is an open door for anyone who sits down next. Always log out when you are done. Try again.",
  "/audio/wren/m13c-s5-q3ok.mp3":
    "[proud] Good sweep. A login from nowhere you have been and a device you no longer own are both open doors. Kick them off and keep your own.",

  // skill 6 — know SKELETON KEY's play
  "/audio/wren/m13c-s6-learn.mp3":
    "[serious] See SKELETON KEY's back-door play, four moves. First, skip your strong password entirely. Second, click 'forgot password'. Third, answer your security questions using facts scraped from your public life. Fourth, reset your password and stroll in. [determined] And here's the wall you just built: made-up answers it can't guess, and a locked recovery email it can't reach. Every move fails.",
  "/audio/wren/m13c-s6-ok.mp3":
    "[proud] That's the whole defence. It can know your real pet, street, and school, and it still can't answer, because your answers are lies only you know. And it can't hijack your recovery email either. The back door is shut.",
  "/audio/wren/m13c-s6-bad.mp3":
    "[warm] Assume it knows everything real about you, that's the point. It fails because your ANSWERS aren't the real details. Try again.",
  "/audio/wren/m13c-s6-bad2.mp3":
    "[warm] Recovery works fine, that's why it's a target. It fails because you made the answers unguessable and locked recovery. Try again.",
  "/audio/wren/m13c-s6-q2ok.mp3":
    "[proud] That is the play. Skip the password, click forgot, answer from your public life, reset, and stroll in. Four quiet moves that never touch your strong password.",
  "/audio/wren/m13c-s6-q3ok.mp3":
    "[proud] Exactly. It can skip your password all it likes, but made-up answers and a locked recovery email leave it stuck at the back door. Every move fails.",

  // skill 7 — slam the side door
  "/audio/wren/m13c-s7-learn.mp3":
    "[warm] Last skill, your back-door habit. One, make your security answers unguessable lies your manager remembers. Two, keep your recovery email current and locked with 2FA. Three, log out on shared machines and sweep your device list now and then. [encouraging] Do those, and you've closed the door most people never even knew was open.",
  "/audio/wren/m13c-s7-ok.mp3":
    "[proud] That's the back door bolted. Made-up answers, locked recovery, clean sessions. A thief can know everything true about you and still be left standing outside every door.",
  "/audio/wren/m13c-s7-bad.mp3":
    "[warm] Careful, you picked a weak one. True answers and old recovery emails are exactly the gaps a thief uses. Choose only the three that shut the door.",
  "/audio/wren/m13c-s7-q2ok.mp3":
    "[proud] Great pick. That single move beats a thief's whole scrapbook, however much they already know about you.",
  "/audio/wren/m13c-s7-q2bad.mp3":
    "[warm] Understanding a door does not bolt it. Pick the move that actually shuts it. Try again.",
  "/audio/wren/m13c-s7-q2bad2.mp3":
    "[warm] Thieves do not read warnings. Change your answers and lock recovery instead. Try again.",
  "/audio/wren/m13c-s7-q3ok.mp3":
    "[proud] That is the whole habit locked in. Made-up answers, locked recovery, clean sessions, and the back door most people never notice stays bolted.",

  // boss — "The Side Door"
  "/audio/wren/m13c-boss-intro.mp3":
    "[serious] This is it, Agent. SKELETON KEY has given up on your password and gone straight for the back door, armed with everything it scraped about your life. No hints from me. [determined] Hold the recovery path, and tell me why every attempt bounces.",
  "/audio/wren/m13c-boss-win.mp3":
    "[excited] Watch that, Agent. SKELETON KEY knew your real pet, your real school, your real street, and it still couldn't get in. [proud] Your made-up answers beat its whole scrapbook, your locked recovery email held, and there wasn't a single forgotten door left open. You didn't just lock the front. You bolted every window it knew about.",

  // test — "Prove it"
  "/audio/wren/m13c-test-intro.mp3":
    "[serious] Last thing before I sign this off, the test. Fresh scenarios, no hints, and you need to pass. Everything about back doors, put it to work. [excited] Ready?",
  "/audio/wren/m13c-test-pass.mp3":
    "[excited] Yes! Every door held on your own, even against a thief who knew all your real details. [proud] Beautifully bolted, Agent.",
  "/audio/wren/m13c-test-fail.mp3":
    "[warm] So close. Don't sweat it. Even pros miss a couple. [encouraging] Take a breath and run it again. You know this.",
};
