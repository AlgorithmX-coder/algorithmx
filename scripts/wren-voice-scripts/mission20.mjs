/**
 * WREN's spoken scripts for Case 020 ("Signal Zero", the series finale, the
 * WarRoom runtime). See mission01.mjs, mission06.mjs, and mission11.mjs for
 * conventions. test.passVoice/failVoice have no text field in case20.ts —
 * recovered by transcription; both are case-specific, matching the finale's
 * weight (the pass line calls the player "Explorer", not "Agent" — the
 * series' one graduation moment).
 *
 * Re-scripted 2026-11-08 to the WREN script standard (see mission01.mjs):
 * one tag per line by role, complete sentences, no quote marks, no capitals
 * for stress.
 */
export const mission20VoiceScripts = {
  "/audio/wren/m20w-open-1.mp3":
    "[determined] This is the last case, Agent. There are no new tricks today, because you already have everything you need. Today we put it all together, and we find out who's been behind it the whole time.",
  "/audio/wren/m20w-open-2.mp3":
    "[determined] Think back to the signatures you've faced, the phisher, the data hoarder, the ghostwriter, and the con artist. They were never really separate. One hand has been conducting them. On this board, we connect all of it, and we trace it back to the source. This is Signal Zero.",
  "/audio/wren/m20w-open-3.mp3":
    "[determined] You'll use seven skills, all recombined, then face a final boss and a last test. Everything you've learned comes down to one board and one answer. Let's finish this.",

  // skill 1 — read the whole board
  "/audio/wren/m20w-s1-learn.mp3":
    "[warm] Let's start where the War Room began. Never trust one clue alone, and read the whole board. One alert is noise. Ten alerts that fit together are a story. Your job as an analyst was never to react to a single message. It was to step back and see the pattern the pieces make. Today the whole board is finally in front of you, every month of it. So let's do what you do best. Step back, and read it as one picture.",
  "/audio/wren/m20w-s1-ok.mp3":
    "[warm] That's it. A single alert tells you almost nothing, but the pattern across all of them tells you everything. Reading the whole board is what turns scattered noise into a name.",
  "/audio/wren/m20w-s1-bad.mp3":
    "[warm] If you handle them one at a time, you'll miss the very thing that matters, which is how they connect. Step back and read the whole board. Try again.",
  "/audio/wren/m20w-s1-bad2.mp3":
    "[warm] Twelve connected clues are exactly where patterns appear. Don't ignore them. Connect them. Try again.",
  "/audio/wren/m20w-s1-q2ok.mp3":
    "[warm] Right. Alerts that fit together and details that repeat are how a pattern shows itself. One alert alone tells you almost nothing.",
  "/audio/wren/m20w-s1-q3ok.mp3":
    "[warm] That's the analyst's eye. One clue is noise, connected clues are a story, and a repeat is where the pattern begins.",

  // skill 2 — the signatures
  "/audio/wren/m20w-s2-learn.mp3":
    "[warm] You've met these four before, and you know their signatures cold. PHANTOM HOOK is the phisher, using fake urgency to steal a login. PACKRAT is the hoarder, quietly building a file to sell. GHOSTWRITER is the forger, making fakes to be believed and shared. SIREN is the con artist, blasting scams wide to catch the few. Each one has a fingerprint you can spot in seconds now. Let's connect each attack on the board to the signature behind it.",
  "/audio/wren/m20w-s2-ok.mp3":
    "[warm] You named every signature on sight. That's a year of training in one glance. Now here's the thing that should give you a chill. Look at how neatly they interlock. That's not four crews bumping into each other. That's coordination.",
  "/audio/wren/m20w-s2-bad.mp3":
    "[warm] Not quite, but you know these. Fake urgency is PHANTOM HOOK. The quiet file is PACKRAT. The fake video is GHOSTWRITER. The mass blast is SIREN. Match them up. Try again.",
  "/audio/wren/m20w-s2-q2ok.mp3":
    "[warm] Spot on. Fake urgency plus a link telling you to verify now is PHANTOM HOOK's whole move. He's phishing for your login.",
  "/audio/wren/m20w-s2-q2bad.mp3":
    "[warm] PACKRAT works in silence, and he never shouts at you to click. Fake urgency for a login is PHANTOM HOOK. Try again.",
  "/audio/wren/m20w-s2-q2bad2.mp3":
    "[warm] SIREN blasts wide, but this is the classic login trap that tells you to verify now. That's PHANTOM HOOK. Try again.",
  "/audio/wren/m20w-s2-q3ok.mp3":
    "[warm] Right. GHOSTWRITER makes convincing fakes designed to be believed and shared. That's the forger's fingerprint.",

  // skill 3 — follow the benefit
  "/audio/wren/m20w-s3-learn.mp3":
    "[warm] Bring back the question from the ghostwriter case. Who benefits? But now, ask it about everything at once. Who gains if PACKRAT's file feeds PHANTOM HOOK's phishing, which feeds SIREN's scams, all covered by GHOSTWRITER's fakes? This isn't four separate crooks with four small wins. It's one operator, running them as one machine, and taking the profit from the whole chain. Follow the benefit all the way up, and it points to a single desk.",
  "/audio/wren/m20w-s3-ok.mp3":
    "[warm] Right. When separate attacks fit together this cleanly and hand off to each other, that's design, not luck. Someone built the machine and takes the profit from all of it. Follow the benefit, and you find the hand.",
  "/audio/wren/m20w-s3-bad.mp3":
    "[warm] Four strangers don't hand off to each other this perfectly. The clean fit is the fingerprint of one coordinator. Try again.",
  "/audio/wren/m20w-s3-bad2.mp3":
    "[warm] This is far too neat for chance. Ask who profits from the whole chain, and a single operator appears. Try again.",
  "/audio/wren/m20w-s3-q2ok.mp3":
    "[warm] See the chain? Each attack feeds the next, and every link pays into the same pocket. Follow the benefit and it points to one operator.",
  "/audio/wren/m20w-s3-q3ok.mp3":
    "[warm] Right. Clean hand-offs and profit flowing one way both point to a single operator running the whole chain.",

  // skill 4 — one hand behind it
  "/audio/wren/m20w-s4-learn.mp3":
    "[warm] So how do you prove it's one hand, not four? You look for shared fingerprints across the attacks. There's the same timing, because they all move together. There are the same tools, with reused code and phrases. There are the same targets, with the same people hit in sequence. And there's the same tradecraft, the same clever style in how it's run. When four supposedly different attacks share timing, tools, targets and style, that's not a coincidence. It's a signature of its own, the coordinator's own fingerprint. Let's connect each shared trait to what it proves.",
  "/audio/wren/m20w-s4-ok.mp3":
    "[warm] That's how you prove coordination. There's one schedule, one toolkit, and one target list, with four masks over a single operator. The fingerprint is unmistakable now. So it's time to ask the hardest question. Who is it?",
  "/audio/wren/m20w-s4-bad.mp3":
    "[warm] Not quite. Shared timing means one schedule. Reused tools mean one author. The same targets in sequence mean one plan. Match the trait to the proof. Try again.",
  "/audio/wren/m20w-s4-q2ok.mp3":
    "[warm] Right. Rare reused code is like handwriting. The same fingerprint across attacks means one author behind them.",
  "/audio/wren/m20w-s4-q2bad.mp3":
    "[warm] Rare phrases don't repeat by accident. Reused code is a fingerprint pointing to one author. Try again.",
  "/audio/wren/m20w-s4-q2bad2.mp3":
    "[warm] Two strangers don't reuse the same rare code word for word. That's one hand. Try again.",
  "/audio/wren/m20w-s4-q3ok.mp3":
    "[warm] That's the proof. Shared timing, shared tools, and the same targets in sequence are the coordinator's own fingerprint.",

  // skill 5 — the Code
  "/audio/wren/m20w-s5-learn.mp3":
    "[warm] Before we name them, remember your Code, because you and this coordinator have the exact same skills. What separates you isn't talent. It's the Code you chose. You act only with permission, you never set out to harm, and you never work in secret from the people you should trust. The coordinator has every skill you have. They just broke the Code, and told themselves they were clever enough that the rules didn't apply. That one choice is the whole difference between an analyst and a criminal.",
  "/audio/wren/m20w-s5-ok.mp3":
    "[warm] Exactly. Skill is neutral, and the Code is the line. You chose permission, no harm, and honesty. That choice, made again and again, is what makes you an analyst instead of what they became.",
  "/audio/wren/m20w-s5-bad.mp3":
    "[warm] Skill alone is exactly what the coordinator has, and it made them dangerous, not good. The Code is the difference. Try again.",
  "/audio/wren/m20w-s5-bad2.mp3":
    "[warm] Thinking you're clever enough to break the rules is the exact lie the coordinator told themselves. The Code is what matters. Try again.",
  "/audio/wren/m20w-s5-q2ok.mp3":
    "[warm] That's the Code in three lines. Act only with permission, never to harm, and never in secret. Live by those, and the skills stay a force for good.",
  "/audio/wren/m20w-s5-q3ok.mp3":
    "[warm] Right. Permission, no harm, and no secrets, chosen on purpose, are what keep your skills a good thing.",

  // skill 6 — the turncoat
  "/audio/wren/m20w-s6-learn.mp3":
    "[warm] Here's the hard part, Agent, and I won't soften it. We've matched the fingerprints, the tradecraft, and the way it's all run to someone who trained where you trained. It's one of us. They learned the same Code you learned, and then decided their talent put them above it. We don't have a name yet, not officially, and not until the board confirms it properly. But I need you ready for this. The warning at the heart of this whole programme is that the skills don't make you good. Only the Code does. The most dangerous person in this story is the one who was almost you.",
  "/audio/wren/m20w-s6-ok.mp3":
    "[warm] That's the whole programme in one sentence. The coordinator had the training and threw away the Code. That means staying good isn't something you finish. It's a choice you keep making, and you'll make it well.",
  "/audio/wren/m20w-s6-bad.mp3":
    "[warm] This case is the proof that they can, if they abandon the Code. Training without the Code is exactly the danger. Try again.",
  "/audio/wren/m20w-s6-bad2.mp3":
    "[warm] Not at all. The training plus the Code is what keeps you right. It's dropping the Code that's the failure, not the skill. Try again.",
  "/audio/wren/m20w-s6-q2ok.mp3":
    "[warm] That's the lesson of the turncoat. The training was real and the skills were real, and none of it mattered once the Code was gone.",
  "/audio/wren/m20w-s6-q3ok.mp3":
    "[warm] Right. Skills don't make you good, and staying good is a choice you make again and again. That's the whole warning.",

  // skill 7 — do it right
  "/audio/wren/m20w-s7-learn.mp3":
    "[warm] This is the last skill of the whole programme, and it's the truest test. Once the board confirms who's behind this, you'll have the skills to hit back, to expose them, and to take revenge. Here's what makes you an analyst instead of another rule-breaker. You don't. You do it right. You gather the evidence cleanly, and you hand it to the people whose job it is, the proper authorities. Then you let justice work. Fighting a rule-breaker by breaking the rules just makes two of them. You win this by staying exactly who you are. Uphold the Code, even now, and especially now.",
  "/audio/wren/m20w-s7-ok.mp3":
    "[warm] That's how a real analyst finishes it. You used clean evidence and the proper authorities, and you upheld the Code, even against someone who threw theirs away. You beat the coordinator not by becoming them, but by refusing to. That's the win that actually matters.",
  "/audio/wren/m20w-s7-bad.mp3":
    "[warm] Careful, because two of those are exactly what the coordinator would do. Those are hacking back, and exposing private data. Fighting a rule-breaker that way just makes another one. Pin only the moves that keep the Code.",
  "/audio/wren/m20w-s7-q2ok.mp3":
    "[warm] Exactly. Clean evidence goes to the people whose job it is. Fighting a rule-breaker by the rules is how you stay the analyst, instead of becoming a rule-breaker yourself.",
  "/audio/wren/m20w-s7-q2bad.mp3":
    "[warm] Hacking back just makes two criminals, and it's the trap they set. Evidence and proper channels win this. Try again.",
  "/audio/wren/m20w-s7-q2bad2.mp3":
    "[warm] Exposing private data harms people and breaks your Code, which is exactly what the coordinator wants. Do it right instead. Try again.",
  "/audio/wren/m20w-s7-q3ok.mp3":
    "[warm] That's finishing it right. Clean evidence means the case holds. The authorities mean justice works. And keeping the Code means you stay exactly who you are.",

  // boss — "Signal Zero"
  "/audio/wren/m20w-boss-intro.mp3":
    "[determined] This is it, Agent. It's the last board, the whole case, and one answer. Four signatures you've faced are up here at once. Connect it all, trace it to the one hand behind it, and name them. Then, hardest of all, choose how you finish it. You'll get no hints from me. You already know everything you need. Read the board.",
  "/audio/wren/m20w-boss-win.mp3":
    "[proud] That's it, Agent. Signal Zero is unmasked. You connected a whole year of attacks into one picture, and traced four signatures to one hand. You named K-STATIC, a former analyst who had everything you have, and threw away the only thing that mattered, which was the Code. And at the very end, you were offered the chance to become them, to hit back and take revenge. You didn't. You did it right. That, more than any skill, is what makes you a Cyber Explorer. The skills made you capable. The Code made you someone the world can trust with them. You've completed the programme, and you finished it as the real thing.",

  // test — the last test
  "/audio/wren/m20w-test-intro.mp3":
    "[warm] This is the last test, Agent. There are no hints this time. It's just you and the board. Put everything you've become across the whole programme to work again now. This is where it all comes together. Ready?",
  "/audio/wren/m20w-test-pass.mp3":
    "[proud] Yes! That's twenty cases, and you finished as the real thing. You unmasked Signal Zero and kept the Code while doing it. I could not be prouder, Explorer.",
  "/audio/wren/m20w-test-fail.mp3":
    "[warm] That was so close. And this is the last one, so let's finish it right. Take a breath, trust everything you've learned, and run it again.",
};

// Shown as typed on screen, said as words (see generate-explorers-wren-mission.mjs).
export const mission20Say = {
  "K-STATIC": "Kay Static",
};
