/**
 * WREN's spoken scripts for Case 020 ("Signal Zero", the series finale, the
 * WarRoom runtime). See mission01.mjs, mission06.mjs, and mission11.mjs for
 * conventions. test.passVoice/failVoice have no text field in case20.ts —
 * recovered by transcription; both are case-specific, matching the finale's
 * weight (the pass line calls the player "Explorer", not "Agent" — the
 * series' one graduation moment).
 */
export const mission20VoiceScripts = {
  "/audio/wren/m20w-open-1.mp3":
    "[serious] This is the last case, Agent. No new tricks today, you already have everything you need. Today we put it all together, and we find out who's been behind it the whole time.",
  "/audio/wren/m20w-open-2.mp3":
    "[determined] Every signature you've faced, the phisher, the data hoarder, the ghostwriter, the flood, they were never really separate. One hand has been conducting them. On this board, we connect all of it, and we trace it back to the source. Signal Zero.",
  "/audio/wren/m20w-open-3.mp3":
    "[excited] Seven skills, all recombined, then a final boss and a last test. Everything you've learned, one board, one answer. Let's finish this.",

  // skill 1 — read the whole board
  "/audio/wren/m20w-s1-learn.mp3":
    "[serious] Start where the War Room began: never trust one clue alone, read the whole board. One alert is noise. Ten alerts that fit together are a story. [curious] Your job as an analyst was never to react to a single message, it was to step back and see the pattern the pieces make. Today the whole board is finally in front of you, months of it. So let's do what you do best, step back, and read it as one picture.",
  "/audio/wren/m20w-s1-ok.mp3":
    "[proud] That's it. A single alert tells you almost nothing; the pattern across all of them tells you everything. Reading the whole board is what turns scattered noise into a name.",
  "/audio/wren/m20w-s1-bad.mp3":
    "[warm] Handled one at a time, you'd miss the very thing that matters, how they connect. Step back and read the whole board. Try again.",
  "/audio/wren/m20w-s1-bad2.mp3":
    "[warm] Twelve connected clues is exactly when patterns appear. Don't ignore them, connect them. Try again.",
  "/audio/wren/m20w-s1-q2ok.mp3":
    "[proud] Right. Alerts that fit together and details that repeat are how a pattern shows itself. One alert alone tells you almost nothing.",
  "/audio/wren/m20w-s1-q3ok.mp3":
    "[proud] That's the analyst's eye. One clue is noise, connected clues are a story, and a repeat is where the pattern begins.",

  // skill 2 — the five signatures
  "/audio/wren/m20w-s2-learn.mp3":
    "[determined] You've met them all, and you know their signatures cold. PHANTOM HOOK, the phisher, fake urgency to steal a login. PACKRAT, the hoarder, quietly building a file to sell. GHOSTWRITER, the forger, fakes made to be believed and shared. THE FLOOD, the spammer, blasting scams wide to catch the few. [curious] Each has a fingerprint you can spot in seconds now. Let's connect each attack on the board to the signature behind it.",
  "/audio/wren/m20w-s2-ok.mp3":
    "[serious] Every signature, named on sight. That's a year of training in one glance. Now here's the thing that should give you a chill, look at how neatly they interlock. That's not four crews bumping into each other. [determined] That's coordination.",
  "/audio/wren/m20w-s2-bad.mp3":
    "[warm] Not quite, but you know these. Fake urgency is PHANTOM HOOK; the quiet file is PACKRAT; the fake video is GHOSTWRITER; the mass blast is THE FLOOD. Match them up. Try again.",
  "/audio/wren/m20w-s2-q2ok.mp3":
    "[proud] Spot on. Fake urgency plus a 'verify now' link is PHANTOM HOOK's whole move, phishing for your login.",
  "/audio/wren/m20w-s2-q2bad.mp3":
    "[warm] PACKRAT works in silence, it never shouts at you to click. Fake urgency for a login is PHANTOM HOOK. Try again.",
  "/audio/wren/m20w-s2-q2bad2.mp3":
    "[warm] THE FLOOD blasts wide, but this is the classic 'verify now' login trap, PHANTOM HOOK. Try again.",
  "/audio/wren/m20w-s2-q3ok.mp3":
    "[proud] Right. GHOSTWRITER makes convincing fakes designed to be believed and shared. That's the forger's fingerprint.",

  // skill 3 — follow the benefit
  "/audio/wren/m20w-s3-learn.mp3":
    "[curious] Bring back the question from the ghostwriter case, who benefits? But now ask it about everything at once. Who gains if PACKRAT's file feeds PHANTOM HOOK's phishing, which feeds THE FLOOD's scams, all covered by GHOSTWRITER's fakes? [serious] Not four separate crooks with four small wins. One operator, running them as one machine, taking the profit from the whole chain. Follow the benefit all the way up, and it points to a single desk.",
  "/audio/wren/m20w-s3-ok.mp3":
    "[proud] Right. When separate attacks fit together this cleanly and hand off to each other, that's design, not luck. Someone built the machine and takes the profit from all of it. Follow the benefit, find the hand.",
  "/audio/wren/m20w-s3-bad.mp3":
    "[warm] Four strangers don't hand off to each other this perfectly. The clean fit is the fingerprint of one coordinator. Try again.",
  "/audio/wren/m20w-s3-bad2.mp3":
    "[warm] This is far too neat for chance. Ask who profits from the whole chain, and a single operator appears. Try again.",
  "/audio/wren/m20w-s3-q2ok.mp3":
    "[proud] See the chain? Each attack feeds the next, and every link pays into the same pocket. Follow the benefit and it points to one operator.",
  "/audio/wren/m20w-s3-q3ok.mp3":
    "[proud] Right. Clean hand-offs and profit flowing one way both point to a single operator running the whole chain.",

  // skill 4 — one hand behind it
  "/audio/wren/m20w-s4-learn.mp3":
    "[serious] So how do you prove one hand, not four? You look for shared fingerprints across the attacks. Same timing, they all move together. Same tools, reused code and phrases. Same targets, the same people hit in sequence. And the same tradecraft, the same clever style in how it's run. [determined] When four 'different' attacks share timing, tools, targets and style, that's not a coincidence, that's a signature of its own. The coordinator's own fingerprint. Let's connect each shared trait to what it proves.",
  "/audio/wren/m20w-s4-ok.mp3":
    "[serious] That's how you prove coordination. One schedule, one toolkit, one target list, four masks over a single operator. The fingerprint is unmistakable now. [determined] Which means it's time to ask the hardest question: who is it?",
  "/audio/wren/m20w-s4-bad.mp3":
    "[warm] Not quite. Shared timing means one schedule; reused tools mean one author; the same targets in sequence mean one plan. Match the trait to the proof. Try again.",
  "/audio/wren/m20w-s4-q2ok.mp3":
    "[proud] Right. Rare reused code is like handwriting. The same fingerprint across attacks means one author behind them.",
  "/audio/wren/m20w-s4-q2bad.mp3":
    "[warm] Rare phrases don't repeat by accident. Reused code is a fingerprint pointing to one author. Try again.",
  "/audio/wren/m20w-s4-q2bad2.mp3":
    "[warm] Two strangers don't reuse the same rare code word for word. That's one hand. Try again.",
  "/audio/wren/m20w-s4-q3ok.mp3":
    "[proud] That's the proof. Shared timing, shared tools, and the same targets in sequence are the coordinator's own fingerprint.",

  // skill 5 — the Code
  "/audio/wren/m20w-s5-learn.mp3":
    "[serious] Before we name them, remember your Code, because you and this coordinator have the exact same skills. What separates you isn't talent, it's the Code you chose: you act only with permission, you never set out to harm, and you never work in secret from the people you should trust. [warm] The coordinator has every skill you have. They just broke the Code, and told themselves they were clever enough that the rules didn't apply. That one choice is the whole difference between an analyst and a criminal.",
  "/audio/wren/m20w-s5-ok.mp3":
    "[proud] Exactly. Skill is neutral. The Code is the line. You chose permission, no harm, and honesty, and that choice, made again and again, is what makes you an analyst instead of what they became.",
  "/audio/wren/m20w-s5-bad.mp3":
    "[warm] Skill alone is exactly what the coordinator has, and it made them dangerous, not good. The Code is the difference. Try again.",
  "/audio/wren/m20w-s5-bad2.mp3":
    "[warm] 'Clever enough to break the rules' is the exact lie the coordinator told themselves. The Code is what matters. Try again.",
  "/audio/wren/m20w-s5-q2ok.mp3":
    "[proud] That's the Code in three lines. Only with permission, never to harm, never in secret. Live those and the skills stay a force for good.",
  "/audio/wren/m20w-s5-q3ok.mp3":
    "[proud] Right. Permission, no harm, no secrets, chosen on purpose, that's what keeps your skills a good thing.",

  // skill 6 — the turncoat
  "/audio/wren/m20w-s6-learn.mp3":
    "[serious] Here's the hard part, Agent, and I won't soften it. The fingerprints, the tradecraft, the way it's all run, we've matched it. The coordinator, K-STATIC, is a former ARC analyst. One of us. [concerned] They trained where you trained, learned the same Code you learned, and then decided their talent put them above it. That's the warning at the heart of this whole programme: the skills don't make you good. Only the Code does. The most dangerous person in this story is the one who was almost you.",
  "/audio/wren/m20w-s6-ok.mp3":
    "[warm] That's the whole programme in one sentence. The coordinator had the training and threw away the Code. Which means staying good isn't something you finish, it's a choice you keep making. [encouraging] You'll make it well.",
  "/audio/wren/m20w-s6-bad.mp3":
    "[warm] This case is the proof they can, if they abandon the Code. Training without the Code is exactly the danger. Try again.",
  "/audio/wren/m20w-s6-bad2.mp3":
    "[warm] Not at all, the training plus the Code is what keeps you right. It's dropping the Code that's the failure, not the skill. Try again.",
  "/audio/wren/m20w-s6-q2ok.mp3":
    "[warm] That's the lesson of the turncoat. The training was real and the skills were real, and none of it mattered once the Code was gone.",
  "/audio/wren/m20w-s6-q3ok.mp3":
    "[warm] Right. Skills don't make you good, and staying good is a choice you make again and again. That's the whole warning.",

  // skill 7 — do it right
  "/audio/wren/m20w-s7-learn.mp3":
    "[serious] Last skill of the whole programme, and it's the truest test. You now know who they are, and you have the skills to hit back, to expose them, to take revenge. Here's what makes you an analyst instead of another K-STATIC: you don't. [determined] You do it right. You gather the evidence cleanly, you hand it to the people whose job it is, the proper authorities, and you let justice work. Fighting a rule-breaker by breaking the rules just makes two of them. [encouraging] You win this by staying exactly who you are. Uphold the Code, even now, especially now.",
  "/audio/wren/m20w-s7-ok.mp3":
    "[proud] That's how a real analyst finishes it. Clean evidence, the proper authorities, the Code upheld even against someone who threw theirs away. You beat the coordinator not by becoming them, but by refusing to. That's the win that actually matters.",
  "/audio/wren/m20w-s7-bad.mp3":
    "[warm] Careful, two of those are exactly what K-STATIC would do, hacking back and exposing private data. Fighting a rule-breaker that way just makes another one. Pin only the moves that keep the Code.",
  "/audio/wren/m20w-s7-q2ok.mp3":
    "[proud] Exactly. Clean evidence to the people whose job it is. Fighting a rule-breaker by the rules is how you stay the analyst instead of becoming one.",
  "/audio/wren/m20w-s7-q2bad.mp3":
    "[warm] Hacking back just makes two criminals, and it's the trap they set. Evidence and proper channels win this. Try again.",
  "/audio/wren/m20w-s7-q2bad2.mp3":
    "[warm] Exposing private data harms people and breaks your Code, exactly what K-STATIC wants. Do it right instead. Try again.",
  "/audio/wren/m20w-s7-q3ok.mp3":
    "[proud] That's finishing it right. Clean evidence so it holds, the authorities so justice works, and the Code kept so you stay exactly who you are.",

  // boss — "Signal Zero"
  "/audio/wren/m20w-boss-intro.mp3":
    "[serious] This is it, Agent. The last board, the whole case, one answer. Every signature you've ever faced is up here at once. Connect it all, trace it to the one hand behind it, name them, and then, hardest of all, choose how you finish it. No hints from me. [determined] You already know everything you need. Read the board.",
  "/audio/wren/m20w-boss-win.mp3":
    "[excited] That's it, Agent. Signal Zero, unmasked. You connected a whole year of attacks into one picture, traced four signatures to one hand, and named K-STATIC, a former analyst who had everything you have and threw away the only thing that mattered, the Code. [warm] And at the very end, offered the chance to become them, to hit back, to take revenge, you didn't. You did it right. [proud] That, more than any skill, is what makes you a Cyber Explorer. The skills made you capable. The Code made you someone the world can trust with them. You've completed the programme, and you finished it as the real thing.",

  // test — the last test
  "/audio/wren/m20w-test-intro.mp3":
    "[serious] The last test, Agent. No hints this time, just you and the board. Everything you've become across the whole programme, put it to work again now. This is where it all comes together. [determined] Ready?",
  "/audio/wren/m20w-test-pass.mp3":
    "[excited] Yes! Twenty cases and you finished as the real thing. You unmasked Signal Zero and kept the Code doing it. [proud] I could not be prouder, Explorer.",
  "/audio/wren/m20w-test-fail.mp3":
    "[warm] So close. And this is the last one, so let's finish it right. [encouraging] Take a breath, trust everything you've learned, and run it again.",
};
