# Cyber Heroes — Weeks 3–20 In-Week Content Plan + Mechanics Ledger

**Status:** DRAFT v1 for review · 2026-07-07
**Scope:** the in-week content only — Mission brief, 5× (Learn → Game → Prove), per-beat recap, consolidation. **Boss battles are explicitly OUT of scope** (planned separately). Videos already exist for every week.
**Parents:** `docs/cyberheroes/curriculum-buildsheet.md` (locked v1 — concepts, patterns, lanes) and the bookend film scripts (`docs/cyberheroes/bookend-scripts/`). This document goes one level deeper: what the child actually sees, does, and hears in every exercise. Nothing here contradicts the build sheet.

---

## 0. Ground rules (locked)

1. **Structure identical every week:** intro video → mission brief → 5 beats (Learn → Game → Prove → recap) → consolidation → [boss — separate track] → outro video → reward.
2. **Uniqueness contract:** the ~14-pattern palette is deliberate (familiar controls = brain free for the lesson). What is BANNED is two exercises that *feel* alike. Every pattern use gets a unique **dressing** (visual system + verb flavour + item domain) recorded in the ledger below. Within one week the 5 games are 5 different patterns; Prove formats also all differ within a week.
3. **Relevance:** every item, card, scenario and coach line comes from that week's lane in the curriculum map. No borrowing another week's home concept (threads may be *reinforced*, never re-taught).
4. **Ages 6–9 language:** narration carries every instruction (autoplay, via SoundManager only — never raw Audio/SpeechSynthesis). One idea per screen. Short common words; UK context. No reading required to progress.
5. **Playability:** max 1–2 input verbs per game; first move guided; big targets; no timers/traps/lose states (ARCADE uses *gentle* pace, not fail pressure); wrong answers teach.
6. **Film continuity:** each week's lesson speaks its film's metaphor (doors, tracks, straw, toy-chests…) so the intro primes the lesson and the boss/outro pay it off.
7. **Visual:** PixIcon 3D icons only — no emoji (W3–W6 stub files violate this and get rebuilt, not extended). Palette per week matches its film.
8. **Audio:** coach = Will, villain = Callum, pre-generated MP3s; one coach line per game; music ducks under narration; master mute respected.
9. **QA per week (definition of done):** all screens built → Playwright `?screen=N` full-frame screenshot sweep reviewed → play-like-a-6-year-old pass (tap-what-glows, sound-off completable) → audio pass by ear → e2e green (15s budgets on WebGL pages) → commit.
10. **Data:** `week{N}.ts` per the W1/W2 `WeekContent` shape (`info` = Learn, typed game screen, `quickCheck` = Prove, `recap`); save/resume checkpoint every screen; badge + stickers per week.

**Engineering pre-work (front-loaded, before W3):** the `REVEAL` engine (powers 13 beats below) and the small `ORDER` mechanic; `BUILD` and `INSPECT` generalised from usernameBuilder/requestInspector. Everything else reuses the shipped library (cyberScanner, chooseYourPath, weakSorter, vaultDrop, threeRandomWords, requestInspector, passwordHospital, memoryMatch, usernameBuilder, spamBlaster-style arcade, popupPanic-style find, scene).

---

## 1. THE MECHANICS LEDGER

Every pattern use across all 20 weeks, each with its unique dressing. **Rule: before building any game, check its row; if a dressing drifts toward another row, redesign it.** (W1–W2 rows = already shipped, listed to protect against repeats.)

### SORT (classify into groups) — 13 uses
| Use | Dressing (what makes it unlike every other SORT) |
|---|---|
| W1.5 shipped | weakSorter — drop passwords into strong/weak testing rig |
| W2.2 shipped | cyberScanner conveyor — cards ride a belt past a scanner |
| W3.3 | **Message Sorting Machine** *(BUILT — conveyorSort's first-ever outing)* — chat messages ride the belt; green FRIENDLY chute vs red RED FLAG chute (new red "flag" tone) |
| W4.1 | **The Fishing Dock** *(BUILT — new hookSort)* — one message dangles per line; REEL IN (real) or CUT THE LINE (scam), no timer, one catch in play |
| W5.1 | **Kind-or-Mean machine** *(BUILT — conveyorSort re-dress: BOTH LAUGHING safe chute vs MEAN ON PURPOSE flag chute; chat-moment cards, two weeks after its W3 outing in a different domain)* |
| W8.4 | **Theatre doors** *(BUILT as "The Theatre of Doors" — conveyorSort's first THREE-category outing via new introTitle/introSubtitle/introIcon/machineLabel/chuteWord/completeTitle/completeLine props; 8 photos sorted to FRIENDS/SCHOOL/WHOLE WORLD by the smallest-door rule)* — a photo walks toward three doors (Friends / School / Whole World); open the right door for each |
| W9.1 | **Shop shelves** *(BUILT as "The Delivery Dock" — hookSort's second outing via its new copy-override props (introTitle/reelLabel/cutLabel/toasts/wrong-titles/complete copy): 8 app-delivery lines, REEL IN official-store/school apps vs CUT random-website/pop-up/forum/comment-link installs; dock metaphor swapped for shelves since hookSort's one-at-a-time rhythm fit better and W16's doors lane stays clear)* — app boxes slide in; shelve in the bright Official Store or the back-alley crate |
| W13.1 | **Day-wheel** — drag activity tiles onto a big clock face; screen tiles glow blue, real-life tiles glow gold; balance the wheel |
| W14.1 | **Room sweep** — a cosy 3D room; tap each object and swipe to EARS (it listens) or SLEEPS (it doesn't) trays |
| W15.1 | **Voice booth** — speech bubbles play; slide to HUMAN chair or ROBOT charging dock |
| W16.3 | **Peel test** — posters with QR codes; pick at the corner — tampered stickers peel off, real codes don't |
| W17.3 | **Photo wall** — follower cards; pin real friends inside the heart frame, strangers stay outside the rope |
| W18.1 | **Family coat-rack** — devices hang like coats; hang on MINE hook or EVERYONE hook |

### INSPECT (examine before acting) — 12 uses
| Use | Dressing |
|---|---|
| W2.3 shipped | requestInspector — examine an info request |
| W3.2 | **Profile Detective** *(BUILT — new profileInspector)* — friend-request card with stat chips; 4 inspect zones (joined / friends & photos / how it talks / what it asks) unlock the REAL-or-FAKE verdict |
| W4.3 | **The Trick Inspector** *(BUILT — phishInspector's first week outing, re-dressed)* — 4 inspect zones per message with urgency/fear focus; ZAP-or-SAFE verdict unlocks after full inspection |
| W6.5 | **The Download Checker** *(BUILT — requestInspector re-dress via new badgeLabel/intro/verdict props)* — mod download pages with 4 inspect zones; "Looks safe — ask first!" vs "It's a trap — close it!" |
| W7.3 | **Banner X-ray slider** *(BUILT as "The Banner X-Ray" — phishInspector re-dress via new zoneLabels prop: "Who's selling? / What's the button? / How does it rush you? / What's it promising?"; 3 shop banners, 2 tricks + 1 fair offer; note: small default zone subtexts "Check the sender" etc. not yet overridable — candidate polish)* — drag an X-ray bar across a shop banner; pressure tricks glow through the paint |
| W8.3 | **Detective corkboard** *(BUILT as "The Picture Detective" — NEW clueBoard engine: photo pinned centre with 4 tappable clue chips (crest/sign/banner/name label), red-thread evidence cards pin beside it, share-or-scrub verdict + CASE CLOSED stamp; re-dressable via intro/photo/verdict/stamp props for W12 telescope / W16 peephole / W17 highlighter)* (film tie-in) — the photo pinned centre; drag string from clue (crest, sign, pin) to what it gives away |
| W9.3 | **Permission gate** *(BUILT as "The Permission Gate" — settingsSwitch re-dress via panelTitle/intro props: Torchy the Torch App asks for six keys; light 💡 + button ⚡ stay Allowed, contacts/mic/location/photos flipped to Blocked with does-the-JOB-need-it teach notes)* — a torch app asks; flip each permission tile to see IF the app truly needs it; leave greedy ones down |
| W12.5 | **Trail telescope** — pan a telescope across your own trail in the snow; flag any oversharing track |
| W15.2 | **Fact-checker's desk** — bot answer on one side, the real book on the other; tap the sentence that doesn't match the book |
| W16.2 | **Address peephole** (film tie-in) — lift the plaque on each door-link to preview where it really leads |
| W17.4 | **Draft-post highlighter** — run a highlighter over a draft post; risky bits (location, school) fluoresce red to scrub |
| W19.2 | **Side-by-side spot-the-scam** — Grandma's text vs a real bank text; circle the 3 differences, kid-teaches-grown-up framing |

### DECIDE (branching judgment) — 15 uses
| Use | Dressing |
|---|---|
| W1.4 / W2.5 shipped | chooseYourPath scenario cards |
| W3.5 | **The Uh-Oh Meter** *(BUILT — chatSimulator)* — phone-framed live chat; the meter climbs as it gets icky; three choice moments ending in stop-and-tell |
| W4.5 | **Bite or Don't** *(BUILT — chooseYourPath classic-card re-dress)* — three rush-you scenarios (fake prize, stuck parcel, virus pop-up); NIBBLE vs STOP-CHECK-SHOW |
| W5.3 | **Don't Feed the Fire** *(BUILT — chooseYourPath device skin)* — three hot moments in chat/lobby frames; fire-back vs stay-calm with fire/wood consequences |
| W6.3 | **The Somewhere-Else Trick** *(BUILT — chatSimulator re-dress: lobby chat, GoldRush_Gary escalates to "what's your Discord")* — three choice moments ending in refuse-and-tell |
| W7.4 | **Till moment** *(BUILT — chooseYourPath classic cards; 3 buy-pressure scenarios: saved-card GOLDEN BLASTER prompt / 5-minute mega-deal / "everyone in the squad has it"; ask-first is always the hero path)* — at a checkout with a coin meter; choose ASK FIRST / BUY NOW; asking summons the grown-up, buying drains the piggy bank |
| W9.5 | **Install handshake** *(BUILT as "Install Handshake" — chooseYourPath classic cards; 3 install moments: glowing INSTALL NOW button / "asking is for babies" whisper / fake update pop-up; get-a-grown-up is always the hero path, together-install framing in consequences)* — a shiny app install; choose GET GROWN-UP / INSTALL ALONE; together-install shows the safe path |
| W10.5 | **Clock mirror** *(BUILT as the body-bell Clock Mirror — chooseYourPath classic cards; 3 moments: autoplay 'just one more' / dry-eyes-jiggly-leg reflection / dinner-vs-next-episode countdown; something-else is always the hero path, activity ideas live in the consequences)* — mid-binge you catch your reflection (jiggling leg, dry eyes); choose ONE MORE / SOMETHING ELSE with an activity picker |
| W12.3 | **Future-self mirror** (film tie-in) — draft a post; older-you appears in the mirror and reacts; choose post/edit/skip |
| W13.3 | **Bedtime garage** (film tie-in) — bedtime chime; choose PARK IT in the charging garage / SNEAK IT under the duvet — duvet path shows the groggy morning |
| W14.4 | **Whisper check** — about to say a password aloud; the smart speaker's ear-light pulses; choose SAY IT / WRITE-IT-INSTEAD |
| W15.3 | **Bot's open jar** — chatbot asks a personal question; choose TELL IT / ZIP IT; telling drops your secret icon into a jar that never opens again |
| W16.5 | **No-plaque door** (film tie-in) — a mystery shortened link-door; choose WALK THROUGH / WHEEL THE BARRIER + ask |
| W17.5 | **Perfect-feed pause** — scrolling perfect posts, your sparkle dims; choose KEEP COMPARING / FLIP TO BACKSTAGE (real, messy, happy) |
| W18.4 | **Sibling's diary tab** — tempted to peek at an open account; choose PEEK / DUST-AND-CLOSE (respect beat, film tie-in) |
| W19.1 | **Expert call-out** — a family member about to slip; choose SAY SOMETHING / STAY QUIET; speaking up gets a family high-five |

### REVEAL (tap → hidden truth plays out; NEW engine) — 13 uses
| Use | Dressing |
|---|---|
| W2.1 shipped | tap a detail → who could misuse it |
| W3.1 | **The Disguise Kit** *(BUILT — reveal board re-dress)* — four disguise pieces (photo/age/name/friendliness); flip each → the trick behind it |
| W5.2 | **Pop the Doubt Clouds** *(BUILT — RevealBoard with new boardIcon prop, 💬 not the Raccoon)* — four grey doubt-clouds ("it's my fault…"); each pops into the supportive truth |
| W7.2 | **Loot-box glass** *(BUILT as "The Glass Loot Box" — RevealBoard re-dress, 🎁 boardIcon; 4 boxes: shiny crate → 1-gold-in-100-marbles odds, "SO close!" feeling → designed on purpose, "next one's THE one" → same odds every time, price tag → real money every open)* — an exciting crate; tap to make it glass → see the 100-marble odds jar inside (1 gold, 99 grey) |
| W8.1 | **Copy pigeons** *(BUILT as "The Copy Pigeons" — RevealBoard re-dress, ✉️ board; 4 moments: DELETE only empties your nest / screenshot = unreachable copy / group chat = 8 pigeons / the app keeps one too)* (film tie-in) — delete a shared photo → it vanishes locally but paper pigeons stay on every rooftop |
| W9.4 | **Price-tag flip** *(BUILT as "The Price-Tag Flip" — RevealBoard re-dress, 🏷️ board; 4 FREE tags flipped: Ad Machine pays-with-your-time / Coin Shop Inside real-money nudges / Info Collector pays-with-your-data / The Truly Free library app that asks for nothing)* — a FREE app; flip the tag → the real costs slide out (ads, purchases, your data icons) |
| W10.1 | **Conveyor curtain** *(BUILT as "The Curtain Pull" — RevealBoard re-dress, 🌀 board; 4 curtains: never-ending belt / countdown rush / hungry thumbnails / the Raccoon greasing the conveyor behind the curtain)* — press NEXT twice → curtain pulls back on the raccoon greasing the next-video conveyor |
| W11.1 | **Weight lift** — a heavy "my fault" boulder on a kid figure; tap → it deflates into a balloon reading NOT-YOUR-FAULT (icon) and floats away |
| W12.1 | **Footprint lamp** — do 3 innocent actions (like, search, post) → UV lamp sweeps → glowing tracks appear behind each |
| W14.2 | **Speaker diary** — tap the smart speaker → its paper ribbon prints symbols of everything it heard today |
| W15.5 | **Two gardens** — same AI seed used meanly vs kindly; tap each → thorns grow vs flowers grow |
| W16.1 | **Door swing** — identical pretty link-doors; tap → each swings open on where it REALLY goes (party vs raccoon slide) |
| W17.1 | **Growth rings** — tap the 13+ sign → tree rings light up year by year showing what grows before you're ready |

### ARCADE (gentle-pace zap/catch) — 5 uses
| Use | Dressing |
|---|---|
| W4.2 | **Too-Good Blaster** *(BUILT — spamBlaster's first week outing, re-dressed via new headline/missLabel/intro props)* — zap the too-good offers flying in; real messages pass to the inbox |
| W6.1 | **Chat Goalie** *(BUILT — spamBlaster re-dress: "PUNCH AWAY THE OVERSHARES!", LEAKS counter, chat-line cards; note: bottom monitor chrome still reads "AlgorithmX Mail" — candidate polish)* |
| W7.5 | **Generator whack** *(BUILT as "The Free-Coin Fakes" — popupPanic's first week outing via new introTitle/introSubtitle/introIcon/introNarration props: 4 free-coin fake pop-ups — FREE 10,000 V-BUCKS / lucky-player password ask / coin doubler / skin spinner; find the corner X, never the shiny CLAIM)* — "FREE COINS" machines pop from the arcade floor; bop them before they gobble the account key (no lose state — they retreat) |
| W10.4 | **Reply-frog catch** *(BUILT as "The Comment Pond" — spamBlaster's second outing, 4 weeks after W6: INCOMING stranger comments, net the fishing ones (school/age/name asks, free-stuff links, dares), friendly video chatter passes; new introIcon + hints props stop the W1 email hint copy leaking; NIBBLES miss counter; note: bottom monitor chrome still "AlgorithmX Mail"/"INBOX" — the standing polish candidate)* — comment-frogs leap at your screen; catch unsafe replies in a net before you'd send them |
| W12.2 | **Snowball chase** — copies of a track roll away multiplying; chase with a broom — you can never sweep them all (the *point*: designed to be uncatchable, coach explains) |

### SELECT (tap the right one) — 10 uses
| Use | Dressing |
|---|---|
| W3.4 | **Reply cards fan** *(BUILT — new replyCards)* — three tilted reply cards fan out per incoming message; the safe one slots into the chat with a green glow |
| W4.4 | **The Lookalike Lineup** *(BUILT — new senderLineup)* — four sender badges on podiums, exactly one lookalike (swapped letters, weird address); tap it → IMPOSTER! stamp |
| W5.4 | **The Four Doors** *(BUILT — replyCards new DOORS skin, 4 choices)* — arched golden doors per scenario; laugh-along/forward/ignore/support — only the kind door is the hero's |
| W8.5 | **Share lever** *(BUILT as "The Share Lever" — replyCards' new LEVERS skin (identical brass levers, no answer giveaway) + new copy-override props (pickLabel/roundNoun/correctToast/wrongTitle/completeTitle/completeLine/scoreNoun); 5 photos judged by look-think-ask)* — one photo, big brass SHARE/DON'T levers; sound-off decidable from the photo's clues |
| W9.2 | **Icon parade** *(BUILT as "The Icon Parade" — senderLineup's second outing via its new intro/complete copy props: 3 rounds of 4 same-icon app badges, tap the COPYCAT (inverted from W4's bust-the-imposter wording but same engine): "Blast Birdz" ★2.1/12 downloads, "Pixel Pets FREE" 12 permissions, "R0bo Racers" zero-for-o)* — five near-identical cat app icons march past; tap the genuine one (rosette), the copycat's eyes cross |
| W11.4 | **Camera vs bin** — a nasty message with two buttons; tap CAMERA (screenshot) not BIN — camera freezes it into an evidence frame |
| W15.4 | **Odd shadow out** — four photos, one AI-faked (wrong-way shadow, six fingers); tap the fake, it wobbles apart |
| W16.4 | **Clear-glass links** — link-doors: some clear glass (see destination), some frosted bit.ly; tap the one you can see through |
| W18.5 | **Balloon refuser** — "SAVE PASSWORD?" balloon bobs up on a shared tablet; tap NO — it deflates with a squeak (film tie-in) |
| W19.5 | **Freeze the moment** — a family scene plays; tap the exact moment someone's about to be tricked to freeze-frame and speak up |

### FIND (locate the control) — 6 uses
| Use | Dressing |
|---|---|
| W6.4 | **The Button Hunt** *(BUILT — new buttonHunt engine; reuse W10 escape / W11 block / W14 mute / W18 log-out)* — player-menu mock, find Report then Block among 4 teaching decoys |
| W10.3 | **Escape hatch** *(BUILT as "The Escape Hatch" — buttonHunt's second outing, re-dressed as the TubeTown Player: find BACK then TELL A GROWN-UP among Next Video/Like/Comment/Share teaching decoys; warm never-your-fault framing, no room-dim needed)* — a not-for-kids video starts; find the back/close control as the room dims — one calm tap out |
| W11.3 | **Block under pressure** — a chat app mock; find the block button while the message pulses (gentle, no timer) |
| W14.5 | **Mute safari** — three devices (speaker, TV, toy); find each one's mute/privacy switch — sleeping-ear icon confirms |
| W17.2 | **Settings burrow** — dig through a 2-level settings menu to flip Public → Private; padlock frosts the profile mirror |
| W18.2 | **Log-out relay** — the family tablet with 3 open accounts; find each log-out, chests click shut one by one (film tie-in) |

### BUILD (construct with a quality meter) — 6 uses
| Use | Dressing |
|---|---|
| W2.4 shipped | usernameBuilder |
| W11.2 | **My Team poster** (film tie-in) — drag real trusted-adult figures onto a poster; name slots + the Childline phone tile (0800 1111) must be placed to finish |
| W12.4 | **Golden trail stamper** — stomp a path across snow choosing track stamps (helped-friend hands, rocket project, kind heart); trail-glow meter rises |
| W13.4 | **Day balancer** — stack activity blocks onto a see-saw day plan (screen blocks vs sleep/outside/family); the see-saw must sit level; grown-up figure co-signs |
| W18.3 | **Passcode forge** — forge a lock-screen code on an anvil; each digit hammered in; a "guessability" spark meter (no W1 re-teach — it's about HAVING a lock) |
| W19.3 | **Family-rules quilt** — each family member contributes a rule patch (moon zone, ask-first, dinner basket); quilt only complete when every member has sewn one |

### ORDER (sequence steps; NEW small mechanic) — 3 uses
| W5.5 | **The Calm Path** *(BUILT — new stepOrder engine, reusable for W11/W13)* — stepping stones across a river; tap shuffled step tiles in order: don't reply → keep it → tell |
| W11.5 | **Protocol launchpad** — stack the rocket stages in order: stop → block → screenshot → tell → Childline; launch on correct order |
| W13.5 | **Power-off ritual strip** — arrange comic panels: finish level → say bye to pet → power off → park in garage → pick what's next |

### MATCH / SCENE (existing) — 4 uses
| W1.1 shipped | memoryMatch keys→locks | W7.1 | **Coin-to-coins till** *(BUILT as "The Coin Till" — memoryMatch's first return since W1, re-dressed via new introTitle/introSubtitle/introWelcome props; pairs coin packs to real £: 500 Blast Coins↔£4, 1,000 V-Bucks↔£7, loot crate↔£3 every time, "game money"↔real money in disguise; note: in-game header/how-to row still reads "Memory Match" — candidate polish)* — match coin-pack cards to the real £ they cost (piggy-bank pans balance when right) |
| W6.2 | **The Lobby Lockdown** *(BUILT — new settingsSwitch engine: find-and-flip risky toggles among safe rows; reuse W14/W17/W19)* | W14.3 | **SCENE: camera hunt at dusk** — pan a 3D smart home; spot every camera dot glowing like tiny moons (film tie-in) |

### Prove-format rotation (6 formats; 5 per week, none repeated within a week)
`SPEED` (tap fast among 3) · `CATCH-THE-LIE` (villain claim: true/false) · `FINISH-THE-RULE` (complete the phrase, icon answers) · `QUICK-SORT` (3 cards, 2 bins) · `ONE-TAP-RECALL` (which one was it?) · `PUT-IN-ORDER` (3 tiles). Assignments per beat are in the week tables — carried unchanged from the build sheet.

---

## 2. WEEK PLANS (W3–W20)

Format per beat: **Learn** (the one idea, narrated) · **Game** (ledger dressing) · **Prove** (format + prompt). Coach lines are one sentence per game, written at build time to the narrator spec (hero-mentor, empowering not frightening).

---

### WEEK 3 — Stranger Danger: Friend or Foe? *(rebuild — stub file is pre-template)*
- **Film metaphor / palette:** mask & disguise; teal-night + mask-rainbow accents. **Badge:** "Mask Spotter" (PixIcon magnifier-over-mask).
- **Mission brief:** spot who's real · catch the red flags · know the two never-rules.
- Beat 1 — *Friends aren't always who they say.* Learn: an adult can pretend to be a kid. Game: REVEAL **mask lift**. Prove: CATCH-THE-LIE "Everyone online is who they say they are."
- Beat 2 — *Spotting a fake profile.* Learn: new account, no real friends, copied photo, too-friendly-too-fast. Game: INSPECT **magnifier over profile card**. Prove: SPEED tap the fake of 3.
- Beat 3 — *Red-flag requests (most protective beat — handle warmly).* Learn: secrets / photos / gifts / "don't tell your parents" = flags. Game: SORT **postbox sort**. Prove: ONE-TAP-RECALL which message was the red flag?
- Beat 4 — *Never meet, never send.* Learn: the two hard rules. Game: SELECT **reply cards fan**. Prove: FINISH-THE-RULE "Never ___, never ___" (icon tiles: meet / send).
- Beat 5 — *Icky feeling → tell.* Learn: trust the tummy, then tell. Game: DECIDE **feelings meter**. Prove: PUT-IN-ORDER feel → stop → tell.
- **Consolidation:** "Unmask Parade" — 5 quick mixed questions styled as masks lifting one by one.

### WEEK 4 — Scams and Tricks: Real or Fake? *(rebuild)*
- **Film/palette:** carnival prize-wheel glitter vs plain truth; gold + red. **Badge:** "Trick Catcher" (PixIcon fishing hook with X).
- **Mission brief:** know what a scam is · smell "too good" · never bite.
- Beat 1 — *What a scam is.* Learn: a trick for your info, money or clicks. Game: SORT **fishing lines**. Prove: FINISH-THE-RULE "A scam is a ___" (trick).
- Beat 2 — *Too good to be true.* Learn: free stuff and "you won!" are bait. Game: ARCADE **too-good balloons**. Prove: SPEED tap the too-good offer.
- Beat 3 — *Hurry! / scary.* Learn: urgency + fear are the trick's engine. Game: INSPECT **alarm-wire tracing**. Prove: CATCH-THE-LIE "You must click in 10 seconds or lose everything."
- Beat 4 — *Fake senders (senders only — links are W16).* Learn: looks like someone real, but isn't. Game: SELECT **lookalike lineup**. Prove: ONE-TAP-RECALL which sender was fake?
- Beat 5 — *Don't bite.* Learn: stop, check, show a grown-up. Game: DECIDE **bite or don't**. Prove: PUT-IN-ORDER stop → check → show.
- **Consolidation:** "Return to Sender" — 5 mixed questions; each right answer stamps a scam envelope and mails it back.

### WEEK 5 — Cyberbullying: Words Have Power *(rebuild — extra warmth, never a fight)*
- **Film/palette:** speech bubbles & light; soft blues warming to gold. **Badge:** "Kind Defender" (PixIcon heart-shield).
- **Mission brief:** know what bullying is · it's never your fault · be the kind one.
- Beat 1 — *What cyberbullying is.* Learn: mean on purpose, again and again. Game: SORT **two megaphones**. Prove: ONE-TAP-RECALL which was bullying?
- Beat 2 — *It's not your fault.* Learn: the emotional anchor. Game: REVEAL **balloon pop**. Prove: FINISH-THE-RULE "It's not ___ fault" (your).
- Beat 3 — *Don't fight back.* Learn: clapping back feeds the fire. Game: DECIDE **two reply pens**. Prove: CATCH-THE-LIE "Hit back harder and it stops."
- Beat 4 — *Don't pass it on (standout).* Learn: forwarding or laughing along joins in. Game: SELECT **four doors of kindness**. Prove: QUICK-SORT helps vs harms.
- Beat 5 — *Tell someone you trust.* Learn: you don't carry it alone. Game: ORDER **calm-path stepping stones**. Prove: PUT-IN-ORDER don't-react → save → tell.
- **Consolidation:** "Light the Thread" — 5 mixed questions; each answer relights one grey chat bubble to gold.

### WEEK 6 — Gaming Safety: Defend Your Game Zone *(rebuild)*
- **Film/palette:** game-lobby neon; green + purple. **Badge:** "Lobby Guardian" (PixIcon controller-shield).
- **Mission brief:** keep real info out of chat · lock your lobby · know the escape buttons.
- Beat 1 — *Real info stays out of chat (W2 applied).* Learn: no name/age/school/where-you-live in game chat. Game: ARCADE **chat goalie**. Prove: SPEED tap the oversharing line.
- Beat 2 — *Friends-only + the setting.* Learn: play with people you actually know. Game: SCENE **lobby settings room**. Prove: ONE-TAP-RECALL where was the friends-only switch?
- Beat 3 — *"Chat somewhere else" red flag (W3 applied).* Learn: moving you to Discord/Snapchat is a flag. Game: DECIDE **lobby doors**. Prove: CATCH-THE-LIE "Real friends need you on a different app."
- Beat 4 — *Report & block buttons.* Learn: every game has them — here's where. Game: FIND **game-menu hunt**. Prove: PUT-IN-ORDER stop → block → tell.
- Beat 5 — *Fake mods / free-download traps.* Learn: dodgy downloads carry malware. Game: INSPECT **sniffer-bot**. Prove: QUICK-SORT safe vs dodgy download.
- **Consolidation:** "Victory Lap" — 5 mixed questions as end-of-match award cards.

### WEEK 7 — In-Game Spending: The V-Bucks Trap
- **Film/palette:** casino-bright shop vs honest piggy bank; gold + duck-yellow. **Badge:** "Wallet Guard" (PixIcon padlocked piggy bank).
- **Mission brief:** coins are real money · spot the pressure · always ask first.
- Beat 1 — *Coins = real money.* Learn: V-Bucks/Robux cost actual pounds. Game: MATCH **coin-to-coins till**. Prove: FINISH-THE-RULE "Game coins are really ___" (money).
- Beat 2 — *Loot boxes are a gamble.* Learn: you don't know what you'll get — built that way. Game: REVEAL **loot-box glass**. Prove: CATCH-THE-LIE "The next box is guaranteed to be rare!"
- Beat 3 — *Pressure tricks.* Learn: "limited time," "everyone has it" = FOMO. Game: INSPECT **banner X-ray slider**. Prove: SPEED tap the pressure trick.
- Beat 4 — *Always ask before you buy.* Learn: not your money, not your call alone. Game: DECIDE **till moment**. Prove: ONE-TAP-RECALL who do you ask?
- Beat 5 — *"Free" currency is a scam (all live here).* Learn: generators steal accounts. Game: ARCADE **generator whack**. Prove: QUICK-SORT real shop vs scam.
- **Consolidation:** "Duck Count" — 5 mixed questions; each right answer sends one rubber duck back to the raccoon's fort.

### WEEK 8 — Photos & Videos: Think Before You Share *(in-week flavour: the Picture Detective)*
- **Film/palette:** detective corkboard + paper pigeons; sepia + red string. **Badge:** "Photo Detective" (PixIcon magnifier-over-photo).
- **Mission brief:** shared means out forever · photos talk · ask before posting others.
- Beat 1 — *Once shared, it's out.* Learn: screenshots exist; delete doesn't reach the copies. Game: REVEAL **copy pigeons**. Prove: FINISH-THE-RULE "Once it's shared, it's ___" (out).
- Beat 2 — *Ask before posting someone else.* Learn: consent both ways. Game: DECIDE (chooseYourPath re-dress: **superhero-pose consent** — friend in your photo; ask first? she strikes the pose from the film) *(BUILT — 3 scenarios: mid-sneeze photo → show-her-first (she picks her superhero pose), little brother's faceplant video → ask him + grown-up, just-for-you selfie → never forward)*. Prove: ONE-TAP-RECALL what do you do first?
- Beat 3 — *What a photo gives away (geotag home).* Learn: uniform=school, street sign=home, pin=location. Game: INSPECT **detective corkboard**. Prove: SPEED tap the giveaway in the photo.
- Beat 4 — *Who can actually see it.* Learn: friends reshare; public = everyone, forever. Game: SORT **theatre doors**. Prove: CATCH-THE-LIE "Private means safe forever."
- Beat 5 — *Think before you share.* Learn: happy for EVERYONE to see it? Game: SELECT **share lever**. Prove: PUT-IN-ORDER look → think → ask.
- **Consolidation:** "Case Closed" — 5 mixed questions pinned as corkboard cases; each answer stamps one SOLVED.

### WEEK 9 — Apps & Downloads: Spot the Fakes *(in-week flavour: the Copycat Shop)*
- **Film/palette:** bright official store vs alley stall; store-blue + counterfeit grey. **Badge:** "Copycat Catcher" (PixIcon crossed-eyed cat in a no-symbol ring).
- **Mission brief:** official store only · count the whiskers · ask "why does it need that?"
- Beat 1 — *Official stores only.* Learn: App Store / Google Play, never random sites. Game: SORT **shop shelves**. Prove: ONE-TAP-RECALL which shelf is safe?
- Beat 2 — *Spot a copycat.* Learn: wrong-ish name, weird logo, bad reviews. Game: SELECT **icon parade**. Prove: SPEED tap the copycat.
- Beat 3 — *"Why does it need that?" (the aha).* Learn: a torch app doesn't need your contacts. Game: INSPECT **permission gate**. Prove: CATCH-THE-LIE "A pet game needs your microphone."
- Beat 4 — *"Free" isn't free.* Learn: ads, purchases, your data. Game: REVEAL **price-tag flip**. Prove: QUICK-SORT truly-free vs hidden-cost.
- Beat 5 — *A grown-up installs with you.* Learn: the rule. Game: DECIDE **install handshake**. Prove: FINISH-THE-RULE "Install ___ a grown-up" (with).
- **Consolidation:** "Whisker Count" — 5 mixed questions; each answer adds a tick to the genuine app's rosette.

### WEEK 10 — YouTube & Videos: Escape the Rabbit Hole
- **Film/palette:** thumbnail glow vs daylight; screen-blue vs sunset gold. **Badge:** "Pull Noticer" (PixIcon caught NEXT-card).
- **Mission brief:** notice the pull · doubt wild claims · know how to leave.
- Beat 1 — *The autoplay rabbit hole.* Learn: "next video" is built to keep you watching. Game: REVEAL **conveyor curtain**. Prove: FINISH-THE-RULE "Autoplay is built to keep me ___" (watching).
- Beat 2 — *Not everything is true.* Learn: "a video said so" isn't proof — check a real source. Game: SORT (re-dress: **library scales** — claim cards weighed against fact books; true claims balance, wild ones fling off) *(BUILT as "The Fact Scales" — conveyorSort re-dress, 2 weeks after W8's doors: CHECKS OUT/WILD CLAIM pans via machineLabel/chuteWord="PAN"; 8 claims incl. true-but-wild lightning + octopus facts so kids weigh instead of vibe-guess)*. Prove: CATCH-THE-LIE "The moon is made of cheese — a video proved it."
- Beat 3 — *Not everything is for you.* Learn: some content isn't for kids — leaving is strong, not scared. Game: FIND **escape hatch**. Prove: PUT-IN-ORDER notice → back out → tell if needed.
- Beat 4 — *Comments are strangers (W3 applied).* Learn: don't reply or share info there. Game: ARCADE **reply-frog catch**. Prove: ONE-TAP-RECALL who lives in the comments?
- Beat 5 — *"I've been watching a while" (teases W13).* Learn: notice the signs, choose to stop. Game: DECIDE **clock mirror**. Prove: SPEED tap the watching-too-long sign.
- **Consolidation:** "Climb Out" — 5 mixed questions as ladder rungs up out of the rabbit hole.

### WEEK 11 — Something Wrong? Emergency Protocol *(sensitive — dummy-doll distance where villain acts; child side is warm and calm)*
- **Film/palette:** lecture-hall gloom flipping to team-poster warmth; navy → sunrise. **Badge:** "Team Captain" (PixIcon MY-TEAM poster).
- **Mission brief:** never your fault · name your team · save, don't delete.
- Beat 1 — *It's never your fault.* Learn: the permission that unblocks telling. Game: REVEAL **weight lift**. Prove: FINISH-THE-RULE "It's never ___ fault" (your).
- Beat 2 — *Who is a trusted adult (most-skipped — give it full weight).* Learn: name them NOW — parent, teacher, carer, relative. Game: BUILD **My Team poster** (incl. Childline 0800 1111 tile — lesson carries the number the no-text films couldn't). Prove: ONE-TAP-RECALL who's on YOUR team? (their own poster shown).
- Beat 3 — *Stop & block.* Learn: don't reply; block; close the app. Game: FIND **block under pressure**. Prove: SPEED tap the block button.
- Beat 4 — *Save the evidence.* Learn: screenshot, don't delete; show a grown-up. Game: SELECT **camera vs bin**. Prove: CATCH-THE-LIE "Delete it and it never happened."
- Beat 5 — *How to get help.* Learn: grown-up first; Childline 0800 1111 always exists. Game: ORDER **protocol launchpad**. Prove: PUT-IN-ORDER the full protocol.
- **Consolidation:** "Drill Run" — 5 mixed questions run as a calm practice drill with the coach counting stages.

### WEEK 12 — Digital Footprint: Tracks in the Snow
- **Film/palette:** indoor snowfield + glowing tracks; white + aurora. **Badge:** "Trail Ranger" (PixIcon golden footprint).
- **Mission brief:** everything leaves a track · tracks don't melt · make good ones.
- Beat 1 — *Everything leaves a track.* Learn: posts, searches, likes — all tracks. Game: REVEAL **footprint lamp**. Prove: ONE-TAP-RECALL which action left a track? (all of them — the trick recall).
- Beat 2 — *Tracks last & spread.* Learn: they don't melt; copies travel. Game: ARCADE **snowball chase** (deliberately uncatchable — the lesson IS the futility, coach names it). Prove: CATCH-THE-LIE "I deleted it, so it's gone everywhere."
- Beat 3 — *Your future self.* Learn: future-you (and future school/team) will see it. Game: DECIDE **future-self mirror**. Prove: FINISH-THE-RULE "Old tracks can trip the ___ you" (future).
- Beat 4 — *Make GOOD tracks (agency).* Learn: build a trail you're proud of. Game: BUILD **golden trail stamper**. Prove: QUICK-SORT proud track vs regret track.
- Beat 5 — *Check your trail.* Learn: look at what's already out there. Game: INSPECT **trail telescope**. Prove: SPEED tap the oversharing track.
- **Consolidation:** "Ranger Report" — 5 mixed questions as trail-marker flags planted along a golden path.

### WEEK 13 — Screen Time: Balance Your Power *(in-week flavour: the Battery Thief)*
- **Film/palette:** battery meter + bendy straw; green→amber→red + cosy night. **Badge:** "Battery Keeper" (PixIcon full green battery).
- **Mission brief:** notice the signs · screens out of bedtime · power off like a pro.
- Beat 1 — *Why balance.* Learn: screens are fun AND you need sleep, friends, outside. Game: SORT **day-wheel**. Prove: ONE-TAP-RECALL what refills your battery?
- Beat 2 — *Signs you need a break.* Learn: tired eyes, jiggling leg, grumpy snap, uneaten snack (film montage echoes). Game: SELECT (re-dress: **sign bingo** — the film scene plays as stills; tap each sign to fill a 4-square bingo card). Prove: SPEED tap the tired sign.
- Beat 3 — *Screens & sleep (most evidence-backed).* Learn: screens at night shoo the moon away — device out of the bedroom. Game: DECIDE **bedtime garage**. Prove: CATCH-THE-LIE "Screens help you fall asleep."
- Beat 4 — *Make a plan WITH a grown-up.* Learn: agree it together — ownership, not punishment. Game: BUILD **day balancer**. Prove: FINISH-THE-RULE "Make the plan ___ a grown-up" (with).
- Beat 5 — *Power-off skills.* Learn: finish, say bye, off, park, pick what's next. Game: ORDER **power-off ritual strip**. Prove: PUT-IN-ORDER the ritual.
- **Consolidation:** "Recharge Race" — 5 mixed questions; each answer fills one bar of a giant battery to full green.

### WEEK 14 — Smart Devices: Who's Listening? *(in-week flavour: the House That Listens)*
- **Film/palette:** cosy home + glowing ear/camera dots; warm home + cool device-blue. **Badge:** "Settings Scout" (PixIcon sleeping-ear switch).
- **Mission brief:** know what's smart · no secrets out loud · check settings together.
- Beat 1 — *What smart devices are (surprise hook).* Learn: speakers, TVs, watches, doorbells, even toys. Game: SORT **room sweep**. Prove: ONE-TAP-RECALL which one was listening?
- Beat 2 — *They listen.* Learn: assistants hear to work; sometimes record. Game: REVEAL **speaker diary**. Prove: CATCH-THE-LIE "The speaker only hears its name."
- Beat 3 — *Cameras can watch.* Learn: cameras live in doorbells, TVs, some toys. Game: SCENE **camera hunt at dusk**. Prove: SPEED tap the camera dot.
- Beat 4 — *No secrets out loud (W1/W2 applied).* Learn: don't say passwords/private stuff near them. Game: DECIDE **whisper check**. Prove: FINISH-THE-RULE "Secrets said out loud are ___" (broadcasts — icon: megaphone).
- Beat 5 — *Settings + a grown-up.* Learn: privacy switches exist — flip them together. Game: FIND **mute safari**. Prove: PUT-IN-ORDER find → ask → flip.
- **Consolidation:** "Quiet House" — 5 mixed questions; each answer tucks one device to sleep (ear icon closes).

### WEEK 15 — AI & Chatbots: Robot or Real? *(in-week flavour: the Know-It-All That Didn't)*
- **Film/palette:** serene glowing orb vs real library book; cyan glow + paper warm. **Badge:** "Fact Checker" (PixIcon book-beats-orb).
- **Mission brief:** a tool, not a friend · check a real source · keep secrets out.
- Beat 1 — *What AI is.* Learn: a clever program — not a person, not your friend. Game: SORT **voice booth**. Prove: FINISH-THE-RULE "AI is a ___, not a friend" (tool).
- Beat 2 — *AI can be confidently WRONG (load-bearing).* Learn: it makes things up cheerfully — check a real source. Game: INSPECT **fact-checker's desk** (ice-cream volcano from the film is exhibit A). Prove: CATCH-THE-LIE "The bot sounded sure, so it's true."
- Beat 3 — *Don't tell a bot your secrets.* Learn: it isn't private — treat it like a stranger. Game: DECIDE **bot's open jar**. Prove: ONE-TAP-RECALL what stays in your head?
- Beat 4 — *Real or fake? (deepfakes, gentle).* Learn: AI can fake photos — look for the wrong-way shadow. Game: SELECT **odd shadow out**. Prove: SPEED tap the fake photo.
- Beat 5 — *Use it kindly.* Learn: a tool for good — with a grown-up, never to be mean. Game: REVEAL **two gardens**. Prove: QUICK-SORT kind use vs mean use.
- **Consolidation:** "Stamp Parade" — 5 mixed questions; right answers stamp REAL or FAKE on parade floats.

### WEEK 16 — QR Codes & Links: Don't Take the Bait *(in-week flavour: the Doorway Trick)*
- **Film/palette:** floating doors with plaques; dreamscape violet + door-glow. **Badge:** "Door Checker" (PixIcon peephole plaque).
- **Mission brief:** links are doorways · look before you walk through · unsure = don't.
- Beat 1 — *What a link/QR really is.* Learn: a doorway — you can't always see where it leads. Game: REVEAL **door swing**. Prove: FINISH-THE-RULE "A link is a ___" (doorway).
- Beat 2 — *Look before you click.* Learn: preview the address — does it look right? Game: INSPECT **address peephole**. Prove: SPEED tap the real address of 3.
- Beat 3 — *Fake QR in the real world (current threat).* Learn: stickers get pasted over real codes on posters and menus. Game: SORT **peel test**. Prove: CATCH-THE-LIE "A QR sticker on a poster is always the real one."
- Beat 4 — *Hidden / shortened links.* Learn: bit.ly hides the destination — caution. Game: SELECT **clear-glass links**. Prove: ONE-TAP-RECALL which door could you see through?
- Beat 5 — *Not sure? Don't click.* Learn: the barrier rule — ask. Game: DECIDE **no-plaque door**. Prove: PUT-IN-ORDER preview → unsure → ask.
- **Consolidation:** "Corridor Check" — 5 mixed questions walked down a hall of doors; each answer swings one open safely.

### WEEK 17 — Social Media: The Profile Shield *(in-week flavour: the Highlight Reel)*
- **Film/palette:** neon mirror-hall vs frosted padlock calm; club neon + frost. **Badge:** "Shield Bearer" (PixIcon frosted-mirror padlock).
- **Mission brief:** why 13+ exists · frosted beats clear · feeds aren't real life.
- Beat 1 — *Age limits exist & why.* Learn: 13+ isn't a punishment — it's "what's coming, why you wait" (golden SOON ticket framing). Game: REVEAL **growth rings**. Prove: ONE-TAP-RECALL what number is on the sign?
- Beat 2 — *Private accounts & settings.* Learn: lock it so only people you know can see. Game: FIND **settings burrow**. Prove: SPEED tap the padlock setting.
- Beat 3 — *Followers aren't friends.* Learn: a big number isn't a friendship (trench coats in the crowd…). Game: SORT **photo wall**. Prove: CATCH-THE-LIE "10,000 followers means 10,000 friends."
- Beat 4 — *Smart posting (W8+W2 applied).* Learn: no location, no school — think first. Game: INSPECT **draft-post highlighter**. Prove: QUICK-SORT post it vs fix it first.
- Beat 5 — *Pressure & comparison (wellbeing).* Learn: perfect feeds are highlight reels — backstage is messy for everyone. Game: DECIDE **perfect-feed pause**. Prove: FINISH-THE-RULE "Feeds aren't ___ life" (real).
- **Consolidation:** "Backstage Pass" — 5 mixed questions flip glossy posters to their funny backstage truths.

### WEEK 18 — Sharing Devices: Lock Before You Leave *(in-week flavour: the Family Tablet)*
- **Film/palette:** breakfast relay + toy-chest accounts; morning warm + chest-glow. **Badge:** "Lock Master" (PixIcon roller-blind padlock).
- **Mission brief:** log out when done · lock it · respect other people's chests.
- Beat 1 — *Lots of devices are shared.* Learn: family tablet, school computer, sibling's console. Game: SORT **family coat-rack**. Prove: ONE-TAP-RECALL which was shared?
- Beat 2 — *Log out when done.* Learn: so the next person isn't "you". Game: FIND **log-out relay**. Prove: SPEED tap log-out.
- Beat 3 — *Lock it.* Learn: a lock screen is a front door (not W1's password lesson — this is about HAVING the lock). Game: BUILD **passcode forge**. Prove: FINISH-THE-RULE "Before you leave it, ___ it" (lock).
- Beat 4 — *Respect others' privacy (cuts both ways).* Learn: closed chest = not yours to open. Game: DECIDE **sibling's diary tab**. Prove: CATCH-THE-LIE "If it's open, it's fine to look."
- Beat 5 — *No saved passwords on shared devices (W1 applied).* Learn: the balloon always asks; the answer here is no. Game: SELECT **balloon refuser**. Prove: QUICK-SORT save-here vs never-save.
- **Consolidation:** "Morning Relay" — 5 mixed questions passed like the breakfast baton; each answer hands off cleanly.

### WEEK 19 — Protecting Family: Family Firewall *(in-week flavour: the Expert in the House)*
- **Film/palette:** kitchen evening + rotary-phone villainy; hearth warm + expert badge gold. **Badge:** "Family Firewall" (PixIcon house-shield).
- **Mission brief:** you're the expert now · help the grown-ups · speak up.
- Beat 1 — *You're the expert now (role-flip).* Learn: 18 weeks of skills — now you teach. Game: DECIDE **expert call-out**. Prove: FINISH-THE-RULE "Now I'm the ___" (expert).
- Beat 2 — *Help grown-ups spot scams (W4 applied).* Learn: grandparents get scam texts too — same tricks, bigger font. Game: INSPECT **side-by-side spot-the-scam**. Prove: CATCH-THE-LIE "Grown-ups can't be tricked."
- Beat 3 — *Make family rules together (W13/W2 applied).* Learn: rules everyone signs beat rules one person sets. Game: BUILD **family-rules quilt**. Prove: QUICK-SORT together-rule vs bossy-rule.
- Beat 4 — *Check the family's settings (W14/W17 applied).* Learn: be the settings helper. Game: FIND (re-dress: **house rounds** — walk room to room; one privacy fix per family member's device, each a different switch). Prove: SPEED tap the unlocked one.
- Beat 5 — *Speak up.* Learn: if someone's about to be tricked, say something — kindly, right then. Game: SELECT **freeze the moment**. Prove: PUT-IN-ORDER notice → speak up → fix together.
- **Consolidation:** "Family Photo" — 5 mixed questions; each answer adds a protected family member into a group photo frame.

### WEEK 20 — Graduation Day: The Final Mission *(capstone — NO new concepts; 5 recombination missions)*
- **Film/palette:** heist-night → dawn victory; storm purple → gold. **Badge:** the 20th badge + 🎓 Certified Cyber Hero certificate (PixIcon mortarboard shield).
- **Mission brief:** everything he's got, all at once · you've done all of this before · finish it.
- Each mission = one composite scene (bespoke dressings; mechanics REUSED knowingly — the child should *recognise* them, that's the graduation feeling — but every scene is new):
- Mission 1 — *The Password Vault* (W1 + W4/W16). A crack attempt + a fake "reset your password" envelope: judge the sender, refuse the fake door, hold the vault. Prove: CATCH-THE-LIE.
- Mission 2 — *The Fake Friend* (W3 + W6 + W2). A too-friendly gaming buddy moves fast: spot the profile tells, refuse the chat-move, give nothing away. Prove: ONE-TAP-RECALL the red flag.
- Mission 3 — *The Money Trap* (W7 + W4 + W16). "Free V-Bucks, hurry!" + a dodgy QR: name the pressure, peel the sticker, don't bite. Prove: SPEED.
- Mission 4 — *The Leak* (W8 + W12 + W17). An oversharing draft + a trail check: scrub the giveaways, sweep the reachable track, frost the mirror. Prove: QUICK-SORT.
- Mission 5 — *The Call for Backup* (W11 + W19). Something lands wrong: run the full protocol AND coach a family member through it. Prove: PUT-IN-ORDER the protocol (the final Prove of the course).
- **Consolidation:** "The Highlight Reel" — the doorbell-camera 19-week fast-forward from the film, as 5 rapid-fire mixed questions across the whole course.

---

## 3. Build order & open decisions

1. **Engine sprint first:** REVEAL engine + ORDER mechanic + BUILD/INSPECT generalisation (small, front-loaded — unblocks every week).
2. **Then W3 → W20 sequentially**, one week fully done (per the §0.9 checklist) before the next starts. W3–W6 stub files are torn down and rebuilt to this plan.
3. **Bosses:** separate planning track (user-led) — the boss slot is left as a placeholder screen per week until then.
4. **For review/decision:** (a) badge names above, (b) the deliberately-uncatchable W12.2 snowball game (intentional frustration-as-lesson — flagging for sign-off), (c) whether consolidations use new light dressings as written or plain recap screens to save build time.
