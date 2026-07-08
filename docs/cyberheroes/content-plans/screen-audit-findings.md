# Cyber Heroes — Full-course screen audit (2026-07-08)

**Mandate (user):** "Go through every single screen on every single week and ask yourself: is it meaningful? Is it clear? Is it worded for a child? Will a child learn from it? Is it interactive?" — review, rebuild, screenshot, review again. Structure stays LOCKED across all weeks.

**Method:** five parallel auditors, four weeks each, judging every screen's content against the five questions. Verified non-findings: boss MCQ answers are runtime-shuffled (LessonPlayer + the new ShowdownBoss/QuickCheck shuffles), so all-`correctIndex: 0` authoring is safe.

**Interactivity verdict (chrome-level, fixed in code):** ~14 of 29 screens per week were passive (5 Learn, 5 recaps, alert, brief, debrief). Fixes: Learn = tap-each-clue-to-power-up; Brief = tap-to-flip objective envelopes + hero/raccoon cast. Recap/debrief upgrades tracked separately.

---

## SEVERE / SAFETY (fix first)

1. **W11 + W20 — protocol order teaches BLOCK before SCREENSHOT.** Blocking can hide/delete the conversation on real apps; evidence must be frozen first. Standard guidance: STOP → SCREENSHOT → BLOCK → TELL (→ Childline / COACH in W20). W11 beat 4 already teaches screenshot-first, so beat 5's launchpad contradicts it in-week (screens 19/20/21 + scanner hints + boss hard Q). Fix EVERYWHERE both weeks; mnemonic: "Hands off… camera… door… team…".
2. **W5 — "not replying makes it stop" overpromise** (screens 11/13/14). Ignoring often doesn't stop bullying → silent self-blame. Rewrite: don't reply = stops the fire GROWING; TELLING is what puts it out.
3. **W15 — inverse-heuristic overconfidence** (screen 4 completeLine + reaction 25: "Robot OR real - you always know!"). Bots claim bodies/feelings. Keep game, fix takeaway: robots can PRETEND; not sure → ask a grown-up.
4. **W16 — link display-text can lie; the real check is never taught.** Beat 4 says a readable full address = safe (contradicts beat 1 sign-vs-plaque). Add: press-and-HOLD a link → the real address pops up (that's the plaque); message words can be paint too.
5. **W14 — fantasy leak mechanism** (screen 16 scenario 2: Robo-Pup announces the secret aloud at dinner). Contradicts the accurate recordings-in-app model taught in beat 2. Rewrite: the plan is found in the app's recordings.
6. **W8 — frightening alert** ("told strangers exactly where to find her") vs the locked empowering-not-frightening voice. Rewrite: "showed strangers her school and her street — way more than she meant to share."
7. **W17 — dev shorthand in child copy** (screen 12: "W3's stranger playbook", "W16's painted ones"). Spell out "Week 3"/"Week 16". Same class: W6 screen 11 "your W3 training".

## CROSS-WEEK PATTERNS (single sweeps)

- **Lie-mode is always FALSE** (every week's raccoonLine check) → kids learn "Raccoon = tap FALSE" without reading. Fix: occasionally a twisted-TRUE line (e.g. W1: "long passwords are harder to crack… that's why I HATE them!" → TRUE).
- **Boss-quiz joke distractors** (all weeks): "Only on weekends", "Good weather", "Puppies"… one serious option = guessable. Give each question one tempting near-miss distractor.
- **Correct answers self-gloss / correct choices have empty explanations** (W5 s16, W8 s20, W12 s16 golden notes, W17 s17, W20 s17): strip the gloss from the correct label; add one-line affirmations to correct choices.
- **UK vocabulary vs the locked American narrator** ("Mum", "£", "telly", "duvet", "jumper", "fruit machines", 07700 numbers, "practise"). DECISION NEEDED (user): pick locale; then sweep all weeks. NOTE: product currently ships Childline 0800 1111 (UK) — audience decision affects far more than vocabulary.
- **5-second speed checks with sentence-length choices** (W3 s9, W4 s9, W16 s9): trim choices to 2-4 words or raise to 8-10s.
- **≠ symbol in child copy** (W15 s7, W16 s3/s23): write "is NOT".
- **Info `content` paragraphs run 70-95 words** (worst W14 s11, W16 s11/s15): cap ~50.

## PER-WEEK FINDINGS (abridged fix list)

### W1
- s4 memoryMatch: pairs test untaught beats (Strong/long+mixed, Secret/never share) + phase-2 position-memory is busywork → restrict to Beat-1 pairs ("Password→My secret code", "Key→Proves it's ME", "Hacker→Tries to guess it", "Mine→Only I know it").
- s9 speed: "Tap the LONGEST password" answerable by eyesight → "Which password would take the Raccoon YEARS to crack?"
- s23 scanner: "MyL0ng_Pass!" as STRONG exemplar contradicts W1/W4 teaching → "Pickle-Rocket-Moon9!".
- s8 tier2 hint: category-mixing ≠ strength → LENGTH is the strength; silly combos are for memory.
- bossVault crack-time theatre: same password jumps 87→214→400 years → keep 87 constant, jump only at the forge (or label "SECRET-SHIELDED").

### W2
- reactions[8]/[10] + recap-10 narration: "chutes/machine" leftovers for the vaultDrop table game → "Drag every treasure home!" / "Best vault-guard I've ever met." / "That vault has never been safer!"
- s4 reveal name-card: "hero name" forward-ref → "Your real name stays with you. Strangers online never need it."
- s1 alert: "he's coming for your secrets next!" targets the child → "Your secrets? He's not getting a single one - let's make sure."

### W3
- s9 speed 5s unreadable → "Best friend after 1 day" / "Your cousin" / "Your schoolmate".
- s8 profileInspector: PixelPanda42 reused as a DIFFERENT person than W2's own-username → rename "DoodleDragon_Sam".
- s20 chat feedback: rematch praise adds no caution → "…but this is still a stranger. Keep it about the game, radar ON."
- "Insta-best-friend" (s4/s8) → "Best friends in five minutes? Warning sign."

### W4
- "your click" never explained (s3/s6/s26) → "…or to make you press its button - pressing is how the trick gets in."
- Beat-1 fisher vs beat-5 fish metaphor inversion → re-skin beat 1: scams are baited hooks, snip before anyone bites; real mail floats in.
- s13 praise absolute → "Real companies never THREATEN you with a countdown."
- s9 speed: 7-8s or trim.

### W5
- SEVERE #2 above (s11/s13/s14).
- s16: "nice try, newbie!" put-down in model kind reply → "good first game!"; correct doors' empty explanations → add affirmations; taught-safe "scroll past"/"leave lobby" marked wrong → soften to "good — but here's the HERO move" copy.
- s5: "Friendly…banter" self-labels + "banter" not kid vocab → "'I'll beat you next race!' before a rematch".
- s3 fragment bullet → "Bullying happens again and again".
- s8 "know exactly how to help" → "can help you carry it".
- s1 "hurt like anything" → "really, really hurt". s19 "calm path across it" → drop river ref.

### W6
- s11 "W3 training" → "Week 3 training". s4 "OVERSHARES!" → "SECRET-SPILLERS!" (+ goalie frames guarding the SEND button).
- s20/s23 "harvest" → "STEAL"/"thief". s9 distractors joke-tier → tempting settings (real name shown / mic open / invites anyone).
- s7 "safe forever" → "they guard every game". s2 "eyes closed" idiom → "super-fast".

### W7
- s12 "FOMO trick" → "left-out trick". s7 odds as fact → "Usually about 1-in-100."
- s20 X-is-safe → add "Can't find a real X? Close the whole app and tell a grown-up." (SAME fix in W20 s12 popups.)
- s16 "count double" → "still count". s4 memoryMatch price pairs are rote → reshape as concept pairs.

### W8
- SEVERE #6 above (s1 alert).
- s15/16: "private ones" undefined + no-door never practiced → define + add "JUST FOR ME - no door" chute with 1-2 items.
- s5 "gone" distractor is arguably true → distractors "secret"/"only yours"/"easy to delete".
- s20 lever correct explanations empty → add. s17 lie drop "Screenshots aren't even real!".

### W9
- s2 brief: "whiskers" pre-taught + fused bullet → split; s8 round-2 fake uses permissions (taught later) → "★ 1.9 · 9 downloads · new today".
- s20 consequence referent confusion → "You installed it alone — missed the coin shop… a week later your coins were gone."
- s4 school-app card lacks its store fact → "School's letter says: 'get our reading app on the App Store'".
- s15 "data" → "INFO". s5/s17 self-labelling answers → strip adjectives.

### W10
- SEVERE-ish: s8 Fact Scales tests trivia → put the source ON each card ("Your science book says: YES ✓" / "No book says this — only the video") so the child practices checking.
- s7 scales metaphor abstract → lead with "Would a real book, my teacher or my grown-up say this too?"
- s5 finish distractors joke-tier → "choosing"/"waiting"/"learning". s1 alert 3 untaught metaphors → plain rewrite. s17 recall distractors → plausible ones.

### W11 (beyond SEVERE #1)
- s4 "lighter in about one minute flat" → "starts making it lighter straight away". s8 team-rule absolute vs Childline → "…plus one special phone line just for kids."

### W12
- s21 "OVERSHARING track" → "POINTY track". s19 define pointy = points AT you like an arrow.
- s4 "advertiser friends" → "companies that choose which adverts you see". s16 golden notes empty → add. s13 distractors → "older"/"school"/"grown-up"; s12 "team trial" → "every time he joins a new team".

### W13
- s17 finish grammar-guessable → replace with "Who makes the screen plan work best?" + real distractors.
- s11 title "The Moon-Shooer" → "Screens Shoo Sleep Away". s2 brief garage/co-sign pre-taught → plain wording.
- s4 "proper glug"/"full of beans" → plain. s21 order duplicates s20 → application question. s15 punishment line → "Rules dropped on you feel unfair - and unfair rules are hard to keep."

### W14 (beyond SEVERE #5)
- s17 "broadcasts" untaught → megaphone frame ("Near smart ears, saying a secret out loud is like using a ___" → megaphone).
- s11 double-passive → "A camera pointing at your bed? Tell a grown-up straight away - every time."
- s1 caption length → split. s8 scare-quotes → literal. "off the air" → gloss once in s15. s21 prompt → "Put the Scout's three moves in order!"

### W15 (beyond SEVERE #3)
- s16 completeLine overpromise → end on "who took this?". s21 kind-garden distractors → ideas-vs-copying set. s7 "≠" → "is NOT". s19 seed/garden muddle → "AI is like a garden - it grows whatever seeds YOU plant." s1 "silver-tongued" → "smooth-talking". s12 "train"/week-ref → plain.

### W16 (beyond SEVERE #4)
- s7 add the concrete action (press-and-hold = plaque). s1 alert 40-word sentence → short declaratives.
- s9 speed 5s over URLs → 10s or door-name-length choices. s20 scenario-3 "frosted" mislabel → mystery door or real shortener. s8 "not-the-post" joke domain → "parcel-track.deliveree-prizes.biz". "≠" sweeps. s8 "lookalike weeks" ref → "classic copycat trick".

### W17
- s3 metaphor pile-up + broken ticket sentence + "fit-check" slang → plain rewrite ("not yet - you're still growing your trick-spotting powers").
- s12 dev shorthand (SEVERE #7). s15 "fluoresce" → "glow". s4 growthRings reveal-only → add a micro-choice per ring.
- s1 "fruit machines" + backwards velvet rope → "follower numbers spinning round and round, and unlocked profiles anyone can stare into."
- s17 self-gloss → strip. s19 "takes"/"flip to backstage" → doable action. s9 distractors → one plausible. s2 "Frost the mirror" pre-taught → "Make your profile PRIVATE - friends only".

### W18
- "Dust it" mantra never defined + competes with taught rule (s15/s16/s23/reactions[16]) → ONE mantra everywhere: "Don't read it, close it gently, tell them."
- s5 "Your"-prefix giveaway → one distractor without possessive. s12 "18/birth year" decoding + ages out → birthday month pair. s8 balloon forward-ref → "keep-me-signed-in trap".

### W19
- "Firewall" never explained (whole week) → add one gloss line to s3. s16 child fixes grown-ups' devices solo → "show that person and flip it TOGETHER" + notes.
- s8 sender-number tell overclaim → add "tricksters can fake the number too - check the OTHER tells."
- s16 "rule installs WITH someone" garble → "downloads happen WITH a grown-up". s13 duplicate distractors → replace one. s8 giggle/costume mixed metaphor → loose-thread line.

### W20
- Protocol order (SEVERE #1). s21 final prove drops COACH → add 5th item or reword prompt + praise.
- s19 "land wrong" unnamed threat → "a MEAN, scary message - sent late, hoping you'll be frightened and all alone."
- s12 popup X safety valve (see W7). s8 Maya "checkable" → state the check ("ask Zain in REAL LIFE"). s5 "who profits" → "who WANTS you to panic?" s11 "rush is the engine" → "the countdown is the trick - rush = trap". s23 Highlight Reel inversion + 19-vs-20 wobble → acknowledge line + fix count. s17 self-gloss → strip.

## STRENGTHS CONFIRMED (do not regress)
W2 requestInspector/usernameBuilder traps; W5's no-blame warmth; W11's warmth (outside the order bug); W12 snowballChase (interaction IS the lesson); W13 balance-positive throughout; W18's metaphor discipline; W20's inline restatement of old-week callbacks.
