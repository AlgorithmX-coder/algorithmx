# Cyber Heroes — Curriculum Build Sheet

**Status:** locked design · v1 · 2026-06-16. This is the single source of truth for the 20-week Cyber Heroes Academy curriculum. Every week is authored to the rules below. No screen is built that contradicts this sheet.

---

## 1. Product facts

- **Audience:** ages 6–9.
- **Length:** 20 weeks, **~45 min/week**.
- **Save/resume:** first-class. Every screen is a checkpoint; the child logs back in on the next unfinished screen with stars/progress intact.
- **Cast:** **Adam + Layla** (mentors who teach), the **Hacker Raccoon** (the through-line villain, present every week).
- **Engine:** data-driven. A week is a `WeekContent` object rendered by `DynamicLesson`. Building a week = writing data + reusing mechanics. See `app/lesson/weekContent/`.

## 2. The week shape (the cookie-cutter — identical every week)

```
🎬 Opening video — the Raccoon exploits THIS week's weakness and WINS
   Mission brief — the week's objectives
   BEAT ×5:  Learn → Game → quick Prove        (5 concepts)
   Consolidation — one fun mixed recap
   ⚔️ Boss battle — synthesises all 5 concepts
🎬 Closing video — the Raccoon tries the same attack and BOUNCES off
   🏅 Reward — badge + stickers + "what you mastered" debrief
```

**Theme = a transformation between two videos.** Open on weakness, close on strength. The 45 minutes between the two videos is the child becoming the defender. *(Opening video exists for W1; each week's closing "Raccoon blocked" video is a new asset to produce.)*

## 3. Pedagogy

Each concept is one **beat = Learn → Game → Prove**:

- **Learn** — Adam/Layla teach **one** idea: short, narrated, visual (low cognitive load, dual coding).
- **Game** — guided practice. Teaching is fresh, hints available, **wrong answers teach, never punish**.
- **Prove** — short (≤40s) **unsupported retrieval**. No hints. The "you've got it" win. **NOT a formal quiz** (avoids test fatigue).

**Within-week difficulty ramp: Spot it → Build it → Use it** (recognise → construct → decide/transfer). Early beats lean recognition/construction; later beats lean judgment.

**Teach-before-test rule:** every concept is taught before it is tested. Concepts outside a week's lane are absent (they belong to their home week — see §7).

## 4. The mechanic palette (~14 patterns)

Consistency = these are the only ways a child interacts, so controls are always familiar and the brain is free for the *lesson*. Variety = each is re-themed per use.

| Pattern | What it teaches best | Library mapping |
|---|---|---|
| **SELECT** | quick recognition (tap the right one) | (generic) |
| **SORT** | classification into buckets | cyberScanner, conveyorBelt, protectTheData, weakSorter |
| **BUILD** | construction + a quality/strength meter | passwordLab, threeRandomWords *(+ new variants)* |
| **INSPECT** | analysis — examine zones/clues before acting | phishInspector *(+ reskins)* |
| **SCENE** | flagship synthesis — cinematic hotspot environment | passwordVault |
| **DECIDE** | judgment / real-life transfer (branching) | chooseYourPath |
| **ARCADE** | fast recognition under light time pressure | spamBlaster |
| **MATCH** | vocab / pair recall | memoryMatch |
| **FIND** | locate the right control/instinct (find the button/X) | popupPanic |
| **ORDER** | sequence / procedure | *new (small)* |
| **REVEAL** | cause → effect; reveal a hidden truth/consequence | *new engine (high value)* |
| **ASSIGN** | constraint logic (a different X for each) | accountRescue |
| **REPAIR** | diagnose then fix (two-phase) | passwordHospital |
| **(MATCH/SELECT spice)** | — | — |

## 5. The 6 boss forms

The Raccoon is the antagonist every week; only **how you beat him** changes — picked to fit the topic's tone.

| Form | You win by… | Used for |
|---|---|---|
| **COMBAT** | skill (phase fight) | clear-adversary threat weeks |
| **GAUNTLET** | judgment (scenario after scenario) | behaviour / decision weeks |
| **PROTOCOL** | doing it right (execute steps under pressure) | procedure weeks |
| **UPSTANDER** | character (not joining in; telling) | emotionally sensitive weeks |
| **BUILD-FINAL** | creating the good thing | "make/protect" weeks |
| **ULTIMATE** | everything (multi-trick capstone) | W20 only |

All 20 bosses are **bespoke set-pieces** — same form ≠ same encounter. Sensitive weeks are **never** a literal fight (W5 = Upstander, W11/W18 = Protocol).

## 6. Variety & consistency rules (the contract)

1. **Within any single week, the 5 games use 5 DIFFERENT patterns**, plus the boss as a 6th distinct experience. A child never repeats a mechanic in one sitting.
2. **Prove formats vary within a week too** (rotate SPEED / CATCH-THE-LIE / FINISH-THE-RULE / QUICK-SORT / ONE-TAP-RECALL / PUT-IN-ORDER).
3. **Patterns reused across weeks are re-themed** so they play as new games (a SORT for passwords ≠ a SORT for smart devices).
4. **All 20 bosses are bespoke.**
5. **No 100-unique-mechanics goal** — that's unbuildable and bad for 6–9s (re-learning controls every screen steals focus from learning). Freshness comes from theme + distribution, not novelty for its own sake.

## 7. Dedupe lanes & cross-cutting threads (no overlap)

**Lane decisions:** phishing/scams = **W4** (fake *senders*, not links) · the click/QR *mechanism* = **W16** · dangerous *people* = **W3** · report/block/tell *protocol* = **W11** · cyberbullying *emotional* frame = **W5** · screen-time *balance habit* = **W13** (W10 only teases breaks) · all *free-currency* scams = **W7**.

**Threads (taught once at home, reinforced elsewhere — never re-taught):**

| Thread | Home | Reinforced in |
|---|---|---|
| Tell a trusted adult / not your fault | W11 (emotional W5) | nearly every "Prove"/boss |
| Private vs public | W2 | W8, W12, W14, W17, W18 |
| Spot the trick | W4 | W6, W7, W9, W16 |
| Is it real? (people / content) | W3 + W15 | W9, W16 |
| Once it's out, it's out | W8 / W12 | W17 |
| Balance & breaks / power-off | W13 (tease W10) | W6, W10 |
| Ask a grown-up before X | everywhere | — |

---

## 8. The 20-week build sheet

Format per beat: **Game** = `PATTERN` · theme. **Prove** = format. `NEW` flags a mechanic not yet in the library.

### PHASE 1 · Foundations → 🛡️ Cyber Cadet

#### W1 · Passwords: The Secret Code
🎬 *Open:* Raccoon cracks `password123` in a second and breaks in. **Boss: COMBAT** (Password Vault arena).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|A password is a key|Your secret code that proves it's *you*|`MATCH` keys → what they lock|FINISH "proves it's ___"|
|2|Make it long|Longer = stronger; **3 random words**|`BUILD` threeRandomWords|SPEED tap the longest|
|3|Mix it up|Letters + numbers + symbols, not a real word|`REPAIR` heal a weak word into a strong one|CATCH-THE-LIE "`tiger` is unbreakable"|
|4|Keep it secret|Never tell anyone — not even a best friend|`DECIDE` friend asks for it|RECALL who can know it?|
|5|Don't pick the obvious|Not name, birthday, or `123456`|`SORT` why each is guessable|QUICK-SORT obvious vs okay|

**Boss:** 5 vault locks = Long · Mix · Secret · Obvious · final scenario. 🎬 *Close:* Raccoon re-runs the crack, the vault holds, he's zapped.

#### W2 · Private Info: Guard Your Secrets
🎬 *Open:* Raccoon poses as a "free game" sign-up and harvests address + school. **Boss: BUILD-FINAL** (assemble a guarded identity under prying).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|What counts as private|Name, address, school, phone, where you are|`REVEAL` tap a detail → who could misuse it|RECALL which is private?|
|2|Private vs OK-to-share *(load-bearing)*|Favourite game = fine; address = no|`SORT` conveyor → Share / Keep-Private|QUICK-SORT 3 cards|
|3|"Why are they asking?"|Pause on the *reason* they want it|`INSPECT` examine the request|CATCH-THE-LIE "a quiz app needs your address"|
|4|Safe usernames|No real name, age or birthday in your handle|`BUILD` username builder `NEW`|SPEED tap the safe handle|
|5|Unsure? Ask a grown-up|The rule for sharing anything|`DECIDE` ask vs share|FINISH "If unsure, ___"|

**Boss:** build a safe profile while the Raccoon probes — share nothing he can use. 🎬 *Close:* his form comes back blank.

#### W3 · Stranger Danger: Friend or Foe?
🎬 *Open:* Raccoon builds a fake-kid profile, "friends" the hero, asks for a secret. **Boss: GAUNTLET** (one fake-friend chat that escalates through all 5).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Friends aren't always who they say|An adult can pretend to be a kid|`REVEAL` unmask who's really behind it|CATCH-THE-LIE|
|2|Spotting a fake profile|New account, no real friends, copied photos, too-friendly-too-fast|`INSPECT` profile inspector `NEW`|SPEED tap the fake|
|3|Red-flag requests *(most protective)*|Secrets / photos / gifts / "don't tell your parents"|`SORT` red-flag vs okay messages|RECALL which is the red flag?|
|4|Never meet, never send|The two hard rules|`SELECT` tap the safe reply|FINISH "Never ___, never ___"|
|5|Icky feeling → tell|Trust the gut, then tell a grown-up|`DECIDE` chat turns uncomfortable|PUT-IN-ORDER feel → stop → tell|

**Boss:** the fake friend escalates; make the safe call each turn (reporting itself = W11). 🎬 *Close:* blocked, mask falls off.

#### W4 · Scams and Tricks: Real or Fake?
🎬 *Open:* Raccoon blasts "YOU WON 10,000 V-BUCKS!" and a kid bites. **Boss: COMBAT** (the "Inbox of Tricks" — inspect & decide 5).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|What a scam is|A trick for your info, money or clicks|`SORT` real message vs scam|FINISH|
|2|Too good to be true|Free stuff, "you won," free V-Bucks|`ARCADE` zap the too-good ones|SPEED|
|3|Hurry! / scary|Urgency + fear are the trick|`INSPECT` find the urgency flag|CATCH-THE-LIE a countdown threat|
|4|Fake senders *(not links — W16)*|Looks like someone real, but isn't|`SELECT` spot the lookalike sender|RECALL|
|5|Don't bite|Stop, check, show a grown-up|`DECIDE` a tempting message|PUT-IN-ORDER|

🎬 *Close:* every scam returns to sender.

#### W5 · Cyberbullying: Words Have Power
🎬 *Open:* Raccoon stirs a group chat, eggs others into piling on a kid. **Boss: UPSTANDER** (win by *not* joining, supporting the target, telling — kindness, not force).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|What cyberbullying is|Mean on purpose, again and again|`SORT` banter vs bullying|RECALL|
|2|It's not your fault|The emotional anchor|`REVEAL` tap for supportive truths|FINISH "It's not ___ fault"|
|3|Don't fight back|Retaliating makes it worse|`DECIDE` clap back vs calmer move|CATCH-THE-LIE "hit back harder!"|
|4|Don't pass it on *(standout)*|Forwarding / laughing along joins in|`SELECT` the kind action of four|QUICK-SORT helps vs harms|
|5|Tell someone you trust|You don't carry it alone|`ORDER` don't react → save → tell|PUT-IN-ORDER|

🎬 *Close:* the group turns kind, the Raccoon deflates — no one plays his game.

### PHASE 2 · Digital World → ⚔️ Cyber Guardian

#### W6 · Gaming Safety: Defend Your Game Zone
🎬 *Open:* Raccoon joins the lobby, fishes for info + "let's chat on Discord." **Boss: GAUNTLET** (a match where he tries all 5 tricks).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Real info stays out of chat *(W2)*|No name/age/school/where-you-live|`ARCADE` zap the oversharing lines|SPEED|
|2|Friends-only + the setting|Play with people you actually know|`SCENE` flip the friends-only setting|RECALL|
|3|"Chat somewhere else" red flag *(W3)*|Moving you to Discord/Snapchat|`DECIDE` a player asks to move chat|CATCH-THE-LIE|
|4|Report & block buttons|Every game has them — here's where|`FIND` tap report/block in the UI|PUT-IN-ORDER stop → block → tell|
|5|Fake mods / "free download" traps|Dodgy downloads = malware|`INSPECT` is this mod safe?|QUICK-SORT|

🎬 *Close:* the Raccoon-player is reported & booted.

#### W7 · In-Game Spending: The V-Bucks Trap
🎬 *Open:* Raccoon's "limited-time bundle!" + "free V-Bucks generator" drain an account. **Boss: COMBAT** (block the trap onslaught — pause/ask/refuse each).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Coins = real money|V-Bucks / Robux cost actual £|`MATCH` coin packs → real £|FINISH|
|2|Loot boxes are a gamble|You don't know what you'll get — built that way|`REVEAL` loot-box sim, odds revealed `NEW`|CATCH-THE-LIE "next one's guaranteed!"|
|3|Pressure tricks|"Limited time," "everyone has it," FOMO|`INSPECT` spot the pressure in a banner|SPEED|
|4|Always ask before you buy|Not your money, not your call alone|`DECIDE` a buy prompt appears|RECALL|
|5|"Free" currency is a scam *(all live here)*|Generators steal your account|`ARCADE` zap the "free V-Bucks" scams|QUICK-SORT real shop vs scam|

🎬 *Close:* the shady shop shuts down, account safe.

#### W8 · Photos & Videos: Think Before You Share
🎬 *Open:* Raccoon screenshots a "just for friends" photo and reshares it everywhere. **Boss: GAUNTLET** (inspect each photo for reveals + audience).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Once shared, it's out|Screenshots exist; you can't truly delete|`REVEAL` screenshot demo — copies remain `NEW`|FINISH|
|2|Ask before posting someone else|Consent both ways|`DECIDE` post a friend's photo?|RECALL|
|3|What a photo gives away *(home of geotag)*|Uniform = school, street sign = home, location data|`INSPECT` photo inspector `NEW`|SPEED tap the giveaway|
|4|Who can actually see it|"Friends" reshare; public = everyone, forever|`SORT` audience sort|CATCH-THE-LIE "private = safe forever"|
|5|Think before you share|Would I be OK with everyone seeing this?|`SELECT` share / don't|PUT-IN-ORDER look → think → ask|

🎬 *Close:* the Raccoon finds nothing worth stealing.

#### W9 · Apps & Downloads: Spot the Fakes
🎬 *Open:* Raccoon publishes a fake "Roblox+" app that asks for everything. **Boss: COMBAT** (inspect 5 apps — source/copycat/permissions/cost — + ask).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Official stores only|App Store / Google Play, not random sites|`SORT` official vs dodgy source|RECALL|
|2|Spot a copycat|Wrong-ish name, bad reviews, weird logo|`SELECT` tap the fake among reals|SPEED|
|3|"Why does it need that?" *(the aha)*|A torch app doesn't need camera/contacts|`INSPECT` review the permissions|CATCH-THE-LIE|
|4|"Free" isn't free|Ads, in-app buys, your data|`REVEAL` what's the catch? `NEW`|QUICK-SORT|
|5|A grown-up installs with you|The rule|`DECIDE`|FINISH|

🎬 *Close:* the fake app is reported & pulled.

#### W10 · YouTube & Videos: Escape the Rabbit Hole
🎬 *Open:* Raccoon's autoplay traps a kid for hours; clickbait everywhere. **Boss: GAUNTLET** (a watch-session: resist autoplay, fact-check, leave bad content, ignore comment bait, choose to stop).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|The autoplay rabbit hole|"Next video" is built to keep you watching|`REVEAL` rabbit-hole sim `NEW`|FINISH|
|2|Not everything is true|"A video said so" ≠ fact|`SORT` fact vs claim|CATCH-THE-LIE|
|3|Not everything is for you|Some content isn't for kids — how to leave|`FIND` find back / close|PUT-IN-ORDER|
|4|Comments are strangers *(W3)*|Don't reply or share info there|`ARCADE` zap unsafe replies|RECALL|
|5|"I've been watching a while" *(teases W13)*|Notice the pull, choose to stop|`DECIDE` spot signs, pick next activity|SPEED|

🎬 *Close:* the rabbit hole collapses; the kid powers off proud.

### PHASE 3 · Advanced Skills → 🏰 Cyber Defender

#### W11 · Something Wrong? Emergency Protocol
🎬 *Open:* a scary message lands and the kid freezes. **Boss: PROTOCOL** (run the steps in order under gentle pressure).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|It's never your fault|The permission that unblocks telling|`REVEAL` tap for reassurance|FINISH|
|2|Who is a trusted adult *(most-skipped)*|Name them now — parent/teacher/carer/relative|`BUILD` trusted-adult list builder `NEW`|RECALL who's on *your* list?|
|3|Stop & block|Don't reply, block, close the app|`FIND` find & tap block|SPEED|
|4|Save the evidence|Screenshot, don't delete, show a grown-up|`SELECT` screenshot, not delete|CATCH-THE-LIE "delete it to make it go away"|
|5|How to get help|Tell a grown-up + Childline 0800 1111|`ORDER` the full protocol|PUT-IN-ORDER|

🎬 *Close:* the kid handles it calmly, a grown-up steps in, the scare fizzles.

#### W12 · Digital Footprint: Tracks in the Snow
🎬 *Open:* Raccoon follows a kid's posts/searches to learn all about them. **Boss: GAUNTLET** (he profiles you from your trail; defend by judging/cleaning each track + showing good ones).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Everything leaves a track|Posts, searches, likes, messages|`REVEAL` tap actions → trail appears `NEW`|RECALL|
|2|Tracks last and spread|They don't melt; others copy & share|`ARCADE` try (and fail) to catch the spreading copies|CATCH-THE-LIE "I deleted it so it's gone"|
|3|Your future self|A future you / school / team might see it|`DECIDE` post now, future-you reacts|FINISH|
|4|Make GOOD tracks *(agency)*|Build a footprint you're proud of|`BUILD` assemble a positive trail|QUICK-SORT proud vs regret|
|5|Check your trail|Look yourself up — what's out there?|`INSPECT` search-yourself, flag oversharing|SPEED|

🎬 *Close:* he finds only careful, proud tracks — nothing to exploit.

#### W13 · Screen Time: Balance Your Power
🎬 *Open:* Raccoon keeps the hero glued — tired, grumpy, missing real life. **Boss: BUILD-FINAL** (build & stick to a balanced plan; resist "just one more").

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Why balance|Screens are fun *and* you need sleep/friends/outside|`SORT` the day into screen / non-screen|RECALL|
|2|Signs you need a break|Tired eyes, grumpy, can't stop, ignoring people|`SELECT` tap the signs|SPEED|
|3|Screens & sleep *(most evidence-backed)*|Devices at night wreck sleep — out of the bedroom|`DECIDE` bedtime; park the device|CATCH-THE-LIE "screens help you sleep"|
|4|Make a plan|Agree rules *with* a grown-up (ownership)|`BUILD` screen-time plan builder `NEW`|FINISH|
|5|Power-off skills|Timers, parking it, a "what's next"|`ORDER` the steps to stop|PUT-IN-ORDER|

🎬 *Close:* hero logs off happy and goes outside.

#### W14 · Smart Devices: Who's Listening?
🎬 *Open:* Raccoon listens in through a smart speaker / TV / toy. **Boss: GAUNTLET** (walk the smart home, make the private choice at each device).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|What smart devices are *(surprise hook)*|Alexa, smart TVs, watches, doorbells, even toys|`SORT` tap the listening devices in a room|RECALL|
|2|They listen|Assistants hear to work; sometimes record|`REVEAL` "what did it hear?" `NEW`|CATCH-THE-LIE|
|3|Cameras can watch|Smart cameras, doorbells, some toys|`SCENE` find the cameras in the home|SPEED|
|4|No secrets out loud *(W1/W2)*|Don't say passwords/private info near them|`DECIDE` about to say a secret aloud|FINISH|
|5|Settings + a grown-up|Privacy settings exist — check together|`FIND` find the mute/privacy setting|PUT-IN-ORDER|

🎬 *Close:* the Raccoon's listening feed goes silent.

#### W15 · AI & Chatbots: Robot or Real?
🎬 *Open:* Raccoon disguises as a friendly chatbot — fishes for secrets, feeds fake "facts." **Boss: COMBAT** (the bot chat: catch its lies, refuse secrets, spot a fake, use it well).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|What AI is|A clever program — not a person, not your friend|`SORT` human vs AI|FINISH|
|2|AI can be confidently wrong *(load-bearing)*|It makes things up — check a real source|`INSPECT` spot the confident mistake|CATCH-THE-LIE|
|3|Don't tell a bot your secrets|It isn't private — treat it like a stranger|`DECIDE` the bot asks for info|RECALL|
|4|Real or fake? *(deepfakes, gentle)*|AI can fake photos/voices/video|`SELECT` spot the AI-faked one|SPEED|
|5|Use it kindly|A tool for good (homework with a grown-up), not to be mean|`REVEAL` see the result of misuse vs good use|QUICK-SORT|

🎬 *Close:* the "friendly bot" mask drops, Raccoon exposed.

### PHASE 4 · Cyber Hero → 🎓 Certified Cyber Hero

#### W16 · QR Codes & Links: Don't Take the Bait
🎬 *Open:* Raccoon slaps a fake QR sticker over a real one on a poster. **Boss: COMBAT** (judge 5 links/QRs by mechanism only).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|What a link/QR really is|A doorway — you can't always see where it leads|`REVEAL` "where does it go?" `NEW`|FINISH|
|2|Look before you click|Preview the address — does it look right?|`INSPECT` address: real vs lookalike|SPEED|
|3|Fake QR in the real world *(current threat)*|Stickers over real ones on menus/posters/car parks|`SORT` legit vs tampered QR|CATCH-THE-LIE|
|4|Hidden / shortened links|`bit.ly` hides the destination = caution|`SELECT` tap the clear/safe link|RECALL|
|5|Not sure? Don't click|Ask|`DECIDE`|PUT-IN-ORDER preview → unsure → ask|

🎬 *Close:* every bad doorway refused.

#### W17 · Social Media: The Profile Shield
🎬 *Open:* Raccoon scrapes an open profile for location, school, plans. **Boss: BUILD-FINAL** (set up a safe profile under prying — private, smart posts, no oversharing).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Age limits exist & why|13+ on most platforms — "here's what's coming, why you wait"|`REVEAL` "why 13?" `NEW`|RECALL|
|2|Private accounts & settings|Lock it so only people you know can see|`FIND` flip the privacy settings|SPEED|
|3|Followers aren't friends|A big count ≠ real friends|`SORT` real friend vs stranger follower|CATCH-THE-LIE|
|4|Smart posting *(W8+W2)*|No location/school — think first|`INSPECT` flag the risky draft post|QUICK-SORT|
|5|Pressure & comparison *(wellbeing)*|Likes/FOMO/"everyone looks perfect" isn't real|`DECIDE` a comparison moment|FINISH|

🎬 *Close:* the Raccoon hits the profile shield, learns nothing.

#### W18 · Sharing Devices: Lock Before You Leave
🎬 *Open:* Raccoon uses a left-logged-in family tablet to snoop and post as the kid. **Boss: PROTOCOL** (leave a shared device safely: log out, lock, don't save, respect others).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|Lots of devices are shared|Family tablet, school computer, sibling's console|`SORT` your device vs shared|RECALL|
|2|Log out when done|So the next person isn't "you"|`FIND` find & tap log out|SPEED|
|3|Lock it|Passcode / lock screen|`BUILD` set a passcode/lock|FINISH|
|4|Respect others' privacy *(cuts both ways)*|Don't snoop in a sibling's/parent's stuff|`DECIDE` tempted to peek|CATCH-THE-LIE|
|5|Keep your stuff yours *(W1)*|Don't save passwords on shared devices|`SELECT` "save password?" → no|QUICK-SORT|

🎬 *Close:* the Raccoon finds a locked, logged-out device.

#### W19 · Protecting Family: Family Firewall
🎬 *Open:* Raccoon targets Grandma with a scam text; the kid must step in. **Boss: GAUNTLET** (the Raccoon attacks the family on 5 fronts; coach each member to safety).

| # | Concept | Learn | Game | Prove |
|---|---|---|---|---|
|1|You're the expert now *(role-flip)*|The role flips — you teach them|`DECIDE` a family member faces a risk|FINISH|
|2|Help grown-ups spot scams *(W4)*|Grandparents get scam texts too|`INSPECT` check Grandma's text|CATCH-THE-LIE|
|3|Make family rules together *(W13/W2)*|Devices at dinner, ask before downloads|`BUILD` family-rules builder|QUICK-SORT|
|4|Check the family's settings *(W14/W17)*|Help set up privacy|`FIND` set a member's privacy|SPEED|
|5|Speak up|If someone's about to be tricked, say something|`SELECT` the moment to intervene|PUT-IN-ORDER|

🎬 *Close:* the family stands protected, Raccoon shut out.

#### W20 · Graduation Day: The Final Mission
🎬 *Open:* the Raccoon's biggest, multi-trick assault on everything. **Boss: ULTIMATE** — **no new concepts**; the 5 beats are five recombination missions (each a bespoke composite scene). Arc: **crack → deceive → tempt → expose → resolve.**

| # | Mission | Recombines | Tests |
|---|---|---|---|
|1|The Password Vault|W1 + W4/W16|crack attempt + a fake "reset your password" message|
|2|The Fake Friend|W3 + W6 + W2|a too-good new gaming "friend" moving chats & fishing for info|
|3|The Money Trap|W7 + W4 + W16|"free V-Bucks, hurry!" + a dodgy QR|
|4|The Leak|W8 + W12 + W17|an oversharing post + a footprint check|
|5|The Call for Backup|W11 + W19|something goes wrong — run the full protocol + protect the family|

🎬 *Close:* the Raccoon is beaten **for good** → 🎓 Certified Cyber Hero graduation + certificate.

---

## 9. Engineering scope (what's actually new)

Almost everything reuses the existing ~14 mechanics, re-themed. The genuinely new work is small and front-loadable:

1. **A flexible `REVEAL` engine** — *the single biggest win.* One mechanic ("tap → a hidden truth/consequence/simulation plays out") powers ~11 beats: who-could-misuse (W2), unmask-profile (W3), loot-box odds (W7), screenshot-permanence (W8), what's-the-catch (W9), rabbit-hole autoplay (W10), reassurance (W11), footprints + spread (W12), what-it-heard (W14), misuse-result (W15), where-does-it-go (W16), why-13 (W17).
2. **An `ORDER` mechanic** — arrange steps into sequence (W5, W11, W13).
3. **`BUILD` variants** — username (W2), trusted-adult list (W11), screen-time plan (W13), family-rules (W19): extend the existing builder.
4. **`INSPECT` reskins** — profile (W3), photo (W8), permissions (W9): extend `phishInspector`.

Everything else — SELECT, SORT, SCENE, DECIDE, ARCADE, MATCH, FIND, ASSIGN, REPAIR — already exists. Net: **~2 new engines (REVEAL, ORDER) + 2 generalisations.** This is a content project, not an engineering one.

---

## 10. Boss-form distribution (reference)

W1 Combat · W2 Build-Final · W3 Gauntlet · W4 Combat · W5 **Upstander** · W6 Gauntlet · W7 Combat · W8 Gauntlet · W9 Combat · W10 Gauntlet · W11 **Protocol** · W12 Gauntlet · W13 Build-Final · W14 Gauntlet · W15 Combat · W16 Combat · W17 Build-Final · W18 **Protocol** · W19 Gauntlet · W20 **Ultimate**. *(Form ≠ encounter — all 20 are bespoke.)*
