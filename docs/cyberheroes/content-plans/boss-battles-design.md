# Cyber Heroes — Boss Battles 1–20: The Showdown Design

**Status:** DRAFT for review · 2026-07-08
**Scope:** bespoke boss battles for every week. W3–W20 designed in full below; W1 (Cracking Machine) and W2 (Profile Forge) get *rewrapped* into the same grammar (their loved mechanics untouched) as the final step.

---

## 0. Locked decisions (user-confirmed)

1. **W1/W2 = rewrap, not rebuild.** Keep the shipped tap+hold cracking duel and the Profile Forge micro-games; add the arrival → gears → finisher → escape arc around them. Done LAST, after the pattern is proven on W3–W20.
2. **One villain voice for all of Cyber Heroes.** A single Hacker Raccoon ElevenLabs voice, picked once by ear (audition at pilot time), then locked. The narration pipeline currently maps adam/layla to the one mentor voice — a `raccoon` speaker is added to `scripts/elevenlabs-generate-narration.mjs` (`VOICE` map + speaker regex).
3. **Zero repeated villain phrases.** Every taunt across all 20 bosses is unique — 5 lines per boss (arrival, one per phase, escape/defeat), all authored in this doc, enforced by a build-time duplicate check across week files (same spirit as the exercise-uniqueness ledger).
4. **Pilot = Week 3.** Engine + The Disguise-o-Matic first, user sign-off, then the batch.
5. **Every week is visibly DIFFERENT.** New Adam & Layla outfits + new hero pictures (OpenArt, reference-image route) + new game + new arena, every single week — "I want them to know that every week is different." See §5 for the full outfit/art plan.

---

## 1. The showdown grammar (identical skeleton, every week)

Every boss is a **contraption the Raccoon wheels in**, themed to the week (W1's Cracking Machine set this precedent). The fight:

| Beat | What happens | Time |
|------|-------------|------|
| **Arrival** | Machine rolls in, nameplate reveal, ONE villain taunt (voiced) | ~20s |
| **Phase ×3** | One phase per authored `bossAttack`: the attack **telegraphs** (name + icon banner — already authored per week) → kid performs the **counter** (one primitive, dressed to the week) → attack backfires, **a gear pops off** | ~60–90s each |
| **Weak-point strike** | When a gear pops, the core glows: ONE question (promoted from the week's authored `bossQuestions` — best 3 of 9; the rest retire). Correct = critical hit animation | ~15s each |
| **Finisher** | Machine wobbling: **hold-to-charge the week's badge power, release** — the week's signature move, big and celebratory. Confetti, XP, stars | ~20s |
| **Escape** | Raccoon comically bails (unique line every week). W20 only: actual defeat + send-off | ~10s |

**Feel rules (locked):**
- **EVERY WEEK IS VISIBLY DIFFERENT (user mandate).** New Adam & Layla outfits every week, new hero pictures (OpenArt), new game, new arena. A kid opening the boss screen must *instantly* see this week is not last week.
- **Two verbs only: tap and hold.** No drag, no gestures.
- **No lose state.** A missed counter dips the shield ring, coach gives one line (the authored attack `tag` — e.g. "Count the whiskers" — IS the coach hint, free content), retry immediately. Stars: 0 misses = 3★, ≤2 = 2★, else 1★.
- **Comfort mode = all timers off.** Barrages become turn-based; holds have no deadline.
- **~4–6 minutes** per fight. Save/resume at phase boundaries.
- **Warmth weeks (W5, W11):** villain stays distant (operates from afar, muted lines, no gloating), machine is the target, everything untimed. Same precedent as the lessons.
- The Raccoon **escapes every week until W20** — he's a lovable recurring villain, finally beaten (gracefully) at graduation.

---

## 2. The counter kit — 5 primitives + 1 finisher, built once, dressed 54 ways

| Primitive | Verb | Shape | Dressing props |
|-----------|------|-------|----------------|
| **TAP-THE-TELL** | tap | A trick object appears; tap the red flag on it before it "lands". 1–3 rounds. Optional **hold-to-peek** modifier (W16/W20 plaques) | object art, tells[], rounds, peek on/off |
| **SHIELD-HOLD** | hold | A pressure barrage rages; hold the shield/button until it burns out. The lesson: the rush has no power if you wait | barrage copy, hold target art, duration, burn-out payoff |
| **COUNTER-CARD** | tap | The attack lands as a situation; pick the right defence from 3 big cards | situation art, 3 cards, explanations |
| **ORDER-STRIKE** | tap | Tap the counter-steps in the right sequence; each correct step lands a hit | steps[], icons, affirmations |
| **DEFLECT-SORT** | tap | Things stream in; tap the bad kind, let the good kind pass (or invert: catch the good) | item pool, good/bad labels, stream speed, invert flag |
| **CHARGE-RELEASE** | hold | The universal finisher: hold to fill the badge-power ring, release at full | finisher art, charge word, payoff animation |

Every phase below names its primitive — the spread is balanced so no two adjacent weeks share a pattern, and every *dressing* is unique across all 54 phases.

---

## 3. Engine & data (build notes)

- **`BossArena.tsx`** — stage chrome shared by all weeks: machine sprite area, nameplate, telegraph banner (renders the authored `bossAttacks[i]` name/icon/color/glow), 3-gear HP row, shield ring, weak-point question modal (reuses BossQuestion type), finisher layer, comfort-mode handling, save/resume via existing progress plumbing. Primitives are subcomponents.
- **`bossBattle` block in `weekN.ts`** (new typed def in `types.ts`): `{ machine: {name, icon, tagline, arenaBg}, phases: [{attack: 0|1|2, primitive, config}], weakPoints: [3 promoted questions], finisher: {chargeWord, payoffLine}, villainLines: {arrival, phases: [3], escape} }`.
- **Safe rollout:** the DynamicLesson `bossBattle` case renders `BossArena` when `weekContent.bossBattle` exists, else the current placeholder quiz. Weeks flip over one commit at a time — prod never breaks.
- **Voice:** `raccoon` speaker added to the generator (VOICE map + regex `(adam|layla|raccoon)`); villain lines authored as narration-shaped blocks so hashing/caching just works. Coach boss lines use the week's lead speaker (alternation preserved).
- **Music:** one shared 60–90s boss-battle loop via the ElevenLabs music API for v1 (per-week stings = optional later polish).
- **QA per boss:** frame sweep of the boss screen states + a scripted playthrough + the standard e2e suite; villain-line duplicate check across all week files; one commit per week: `feat(cyberheroes): Week N boss - <Machine>, built to the showdown grammar`.

---

## 4. The eighteen fights (W3–W20)

Format per week: **Machine** (reconciling the seeded concept already committed in each week file's placeholder comment) · Arena · Phases (authored attack → primitive → dressing) · Finisher · Villain lines (all unique).

---

### WEEK 3 — THE DISGUISE-O-MATIC *(seed: "one escalating fake-friend chat")* — PILOT
**Arena:** a moonlit chat window floating over the playground server. The machine: a wardrobe-robot cycling costumes, running an escalating "new best friend" chat — the three attacks ARE the escalation.
- **P1 FAKE PROFILE 🎭 → TAP-THE-TELL.** The machine assembles a "9-year-old gamer" profile piece by piece; tap the tell before the mask clicks in (joined yesterday → zero real friends → too-perfect photo). 3 rounds.
- **P2 SECRET ASK 🤫 → COUNTER-CARD.** The chat escalates: "this is OUR secret club — don't tell your mum." Cards: TELL A GROWN-UP ✓ / keep the secret / reply nicely.
- **P3 MEET-UP TRAP 🪤 → SHIELD-HOLD.** The pressure barrage: "Park gate! 3:15! I got you a PRESENT! Come ALONE!" — hold the NEVER-MEET shield until the lures burn out.
**Finisher:** the Spotlight of Truth — charge the detective magnifier, release: costume blasted off, Raccoon revealed mid-tutu.
**Villain lines:** Arrival: *"A new best friend, just for you! I'm nine! Honest!"* · P1: *"This mask has NEVER failed. Well — once. Twice, tops."* · P2: *"Shhh! Secrets are what make friendship SPECIAL!"* · P3: *"Just one little meet-up! I'll bring snacks!"* · Escape: *"Fine! I didn't want to be your friend ANYWAY!"*

### WEEK 4 — THE BAIT CASTER *(seed: "the Inbox of Tricks")*
**Arena:** the dockside inbox — a mail conveyor over dark water; the machine casts glittering hook-lines into it.
- **P1 FAKE PRIZE 🎁 → DEFLECT-SORT.** Prize-hooks rain among real mail; tap the baited ones (glitter + "you WON!"), real letters pass.
- **P2 COUNTDOWN SCARE 🔔 → SHIELD-HOLD.** A giant clock blares "10 MINUTES LEFT!!" — hold the CALM shield; the clock burns out and *nothing happens* (the teach, made playable).
- **P3 LOOKALIKE 🎭 → TAP-THE-TELL.** Two parcels "from Nintendo"; tap the tell on the fake (Nintend0's zero, the wrong address). 2 rounds.
**Finisher:** the SCAM stamp — charge the big rubber stamp, release: slammed across the whole machine.
**Villain lines:** Arrival: *"Congratulations!!! You've WON a once-in-a-lifetime BOSS BATTLE!"* · P1: *"Every hook hand-glittered by yours truly!"* · P2: *"Tick tock tick tock! No thinking allowed!"* · P3: *"Spot the difference? There ISN'T one! Probably!"* · Escape: *"Keep your stamp! I've got other inboxes to visit!"*

### WEEK 5 — THE ECHO MACHINE *(seed: "UPSTANDER — win by kindness, never force")* — warmth week
**Arena:** a grey-washed courtyard wall that regains colour as you win. The machine sprays word-graffiti; the Raccoon operates a distant crane and never comes close. Untimed throughout.
- **P1 PILE-ON 🌀 → COUNTER-CARD.** A pile-on thread grows on the wall. Cards: DON'T JOIN — STAND BY THE KID ✓ / add one little joke / just watch.
- **P2 MEAN ECHO 💬 → DEFLECT-SORT (gentle).** Echo-bubbles drift across; tap each to mute it (it fades to mist — never smashed, never answered). Reply-bubbles are the decoys: touching them feeds the echo.
- **P3 LONELY CLOUD 🌀 → ORDER-STRIKE.** The cloud wraps a kid avatar; lift it in order: DON'T REPLY → KEEP IT → TELL. Each step brightens the wall.
**Finisher:** the Colour Wave — charge kindness, release: the wall floods with colour, the machine rusts still.
**Villain lines (muted):** Arrival: *"Echo echo echo! Words are SO much louder in here!"* · P1: *"One more voice in the pile! What's the harm?"* · P2: *"Feed the echo! It's hungry!"* · P3: *"That cloud looks heavy. Shame nobody helps carry those."* · Escape: *"...it's no fun when nobody joins in. I'm leaving."*

### WEEK 6 — THE LOBBY PHANTOM *(seed: "one match where he tries all 5 tricks")*
**Arena:** a neon game lobby, framed as one ranked match against a suspiciously friendly player.
- **P1 INFO FISHING 🎮 → DEFLECT-SORT.** Chat scrolls; tap the info-asks ("what school?", "home alone?"), let game-talk pass ("gg!", "rematch?").
- **P2 SNEAK-OUT CHAT 🚪 → COUNTER-CARD.** "Let's chat on ZapChat — the mods can't hear us there 😉". Cards: STAY WHERE THE GUARDS ARE ✓ / go — it's cosier / go but just once.
- **P3 FREE-MOD TRAP 🪤 → TAP-THE-TELL.** A glowing free-mod parcel; tap its tells across 3 rounds (not from the store → asks for your password → promises unlimited everything).
**Finisher:** the REPORT slam — charge the report button, release: the phantom account poofs; the real match resumes without him.
**Villain lines:** Arrival: *"GG kid! Wanna know a SHORTCUT to pro? Step into my lobby!"* · P1: *"Just filling in your player card! Name? School? Front-door key?"* · P2: *"The guards are SO nosy. My place is cosier!"* · P3: *"Free mods! Unlimited everything! Slight raccoon flavour!"* · Escape: *"REPORTED?! I'm the VICTIM here!"*

### WEEK 7 — THE COIN VACUUM *(seed: "block the trap onslaught")*
**Arena:** the arcade vault — a giant vacuum machine hoovering a mountain of coins.
- **P1 FOMO BUNDLE 🎁 → SHIELD-HOLD.** "LAST CHANCE — 99% OFF — ENDS NOW!!" sirens; hold the wallet shut until the timer dies... and the "expired" offer instantly relists (fair offers wait — made visible).
- **P2 LOOT GAMBLE 🎲 → TAP-THE-TELL.** A loot-box parade; tap the hidden odds-tag on each (1-in-100) to pop its glamour. 3 boxes.
- **P3 FREE-COIN TRAP 🪤 → DEFLECT-SORT.** Free-coin generators vs. genuinely free demos; tap the generators (they ask for a password or a card), let true-free pass (asks for nothing).
**Finisher:** the Piggy-Bank Lock — charge, release: the vacuum runs in reverse and rains every coin back.
**Villain lines:** Arrival: *"Welcome to my arcade! Everything's FREE! Terms and raccoons apply!"* · P1: *"Buy NOW! Think LATER! Preferably never!"* · P2: *"Every box a winner! Mostly the grey kind!"* · P3: *"Type your password into the nice slot machine!"* · Escape: *"My coins! MY coins! I earned those! ...borrowed those!"*

### WEEK 8 — THE SNAPSHOT CLAW *(seed: "crash the photo heist")*
**Arena:** a rooftop photo gallery at night; a crane claw swings over framed family photos.
- **P1 COPY PIGEONS ✉️ → SHIELD-HOLD.** The "SHARE! SHARE! SHARE!" gale batters the pigeon cage; hold the cage door shut until the gale passes — once they fly, no one catches them.
- **P2 CLUE LEAK 📍 → TAP-THE-TELL.** Three photos on easels; tap the talking clue in each (school crest → street sign → birthday banner) before the claw grabs it.
- **P3 SNEAKY SNAP 👀 → COUNTER-CARD.** A friend's silly trampoline wipeout, camera ready. Cards: ASK THEM FIRST — THEIR FACE, THEIR CALL ✓ / snap and post / snap and keep "just in case".
**Finisher:** the Golden Frame — charge, release: the safe photo gets framed; the claw grabs it, finds nothing to steal, and short-circuits.
**Villain lines:** Arrival: *"One little photo tells me EVERYTHING. Say cheese!"* · P1: *"Let the pigeons out! They only bite a little!"* · P2: *"Lovely crest! Lovely street sign! Lovely front door!"* · P3: *"Snap first, ask never! That's the raccoon way!"* · Escape: *"A clean photo?! What am I supposed to do with MEMORIES?!"*

### WEEK 9 — THE COPYCAT CANNON *(seed: "clear out the copycat shop")*
**Arena:** an app-store aisle after closing; the cannon fires app boxes onto the shelves.
- **P1 COPYCAT APP 🎭 → DEFLECT-SORT.** Apps fly at the shelf; zap the copycats (Blast Birdz ★2.1 · 12 downloads), let the real ones (Blast Birds ★4.8 · millions) land. Same icon on both — the text tells the truth.
- **P2 PERMISSION GRAB ✋ → TAP-THE-TELL.** A torch app's permission list unrolls; tap every greedy row (contacts, mic, location, photos), leave the fair one (light).
- **P3 FAKE FREE 🏷️ → COUNTER-CARD.** "FREE!*" gleams on a box. Cards: FLIP THE TAG — CHECK WHAT IT COSTS INSIDE ✓ / install, free is free / install but delete later.
**Finisher:** the Install Handshake — charge the grown-up high-five, release: the shop shutters slam down on the cannon barrel.
**Villain lines:** Arrival: *"Step into my shop! Every app 100% genuine-ish!"* · P1: *"Two little stars means it's HUMBLE!"* · P2: *"It's a torch! It just needs your contacts to... glow better!"* · P3: *"Free today! Expensive forever!"* · Escape: *"Shutters?! In MY shop?! I'll open a stall somewhere else!"*

### WEEK 10 — THE WHIRLPOOL ROOM *(seed: "unplug the conveyor room")*
**Arena:** the conveyor room — belts of thumbnails spiralling down into a glowing whirlpool.
- **P1 AUTOPLAY BELT 🔀 → SHIELD-HOLD.** Hold the giant PAUSE against the belt's pull; it strains, sparks, and stops. You choose what's next.
- **P2 WILD CLAIM 🌀 → DEFLECT-SORT.** Thumbnails float past; zap the wild claims ("MOON IS CHEESE — PROOF!"), let the checkable ones pass (the fact-scales flash beside them).
- **P3 COMMENT HOOK 💬 → COUNTER-CARD.** A comment under the video: "you seem cool!! what school do u go to? 😊". Cards: JUST WATCH — NEVER REPLY TO STRANGERS ✓ / reply, they're friendly / ask them a question back.
**Finisher:** the Escape Hatch — charge the BACK-button rocket, release: launched up and out of the whirlpool room into daylight.
**Villain lines:** Arrival: *"Next up! Next up! NEXT UP! You never have to choose again!"* · P1: *"The belt goes one way, kid! Down!"* · P2: *"It's TRUE! A video said so, and videos never fib!"* · P3: *"The comments are lovely this time of night!"* · Escape: *"NOBODY finds the hatch! Who showed you the hatch?!"*

### WEEK 11 — THE BOULDER PRESS *(seed: "pop the blame balloon machine")* — warmth week
**Arena:** a quiet dusk hillside; the machine presses blame-boulders. Raccoon far off at the controls, muted. Untimed throughout.
- **P1 BLAME BOULDER 🙈 → COUNTER-CARD.** A boulder stamped "YOUR FAULT" rolls in. Cards: THE SENDER CHOSE TO SEND IT — NEVER YOUR FAULT ✓ / maybe a bit my fault / my fault for being online. Right answer inflates the boulder into a balloon; it floats away.
- **P2 SECRET WEIGHT 🤐 → TAP-THE-TELL.** A backpack fills with secret-weights; tap each one to *name it out loud* — every tap is a TELL, and the bag visibly lightens.
- **P3 DELETE TRICK 🗑️ → ORDER-STRIKE.** "Bin it! Pretend it never happened!" — counter with the protocol, in order: STOP → BLOCK → SCREENSHOT → TELL.
**Finisher:** the Team Beacon — charge, release: your team poster lights up (the golden Childline 0800 1111 tile glowing brightest); the press deflates with a wheeze.
**Villain lines (muted):** Arrival: *"Heavy stuff, kid. Good thing you're carrying it ALL ALONE."* · P1: *"That boulder's got your name on it! I checked!"* · P2: *"Keep it secret! Secrets weigh NOTHING! Trust me!"* · P3: *"Bin it! Gone! Nothing ever happened!"* · Escape: *"A whole TEAM?! That's cheating! One kid was supposed to be alone!"*

### WEEK 12 — THE TRACK HOUND *(seed: "shred the trail map")*
**Arena:** a snowy ridge at night; a mechanical hound with a glowing map of YOUR tracks bolted to its side.
- **P1 RAGE BAIT ⚡ → SHIELD-HOLD.** A rage-post prompt burns ("SAY IT!! POST IT NOW!!"); hold the mirror-shield — future-you looks back from it — until the rage fizzles cold.
- **P2 COPY SNOWBALL 🌀 → COUNTER-CARD.** A snowball teeters at the hilltop, one nudge from rolling. Cards: THINK BEFORE YOU ROLL — COPIES NEVER COME BACK ✓ / push it, it's tiny / push it, you can catch it later.
- **P3 TRAIL TRAP 📍 → DEFLECT-SORT.** Tracks light up along the ridge; sweep the pointy ones (school name, park-and-time) before the hound sniffs them — and shine-stamp the proud ones (the dragon drawing stays!).
**Finisher:** Shred the Map — charge the shredder, release: the hound's map confettis into snow; defanged, it turns into a puppy and trots off.
**Villain lines:** Arrival: *"Sniff sniff! Fresh tracks! I could follow yours for MILES!"* · P1: *"Go on, post it angry! Angry tracks are the deepest!"* · P2: *"Roll it! Tiny snowballs stay tiny! Famously!"* · P3: *"Pointy tracks! My favourite flavour!"* · Escape: *"My map! My beautiful map! ...why is the hound LICKING me?!"*

### WEEK 13 — THE BATTERY LEECH *(seed: "drain the Thief's stolen battery hoard")*
**Arena:** the Battery Thief's garage-lair — a leech machine hooked to a wall of stolen, glowing kid-batteries.
- **P1 ONE MORE EPISODE 🌀 → SHIELD-HOLD.** The auto-next spiral spins up ("one more! ONE more!"); hold YOU-CHOOSE-THE-ENDING until the spiral winds down and the credits roll.
- **P2 DUVET SCREEN 🤫 → TAP-THE-TELL.** A dark bedroom; tap every glow-tell hiding a screen (under the duvet → under the pillow → behind the curtain) and each marches itself to the charging garage.
- **P3 BATTERY DRAIN ⚡ → DEFLECT-SORT (inverted).** Moments fall from above; CATCH the refills (sleep, snacks, a kickabout, your people) into the battery, let the drains bounce off.
**Finisher:** the Power-Down Ritual — charge, release: every hoarded battery flies home to its kid; the lair dims to a cosy night-light.
**Villain lines:** Arrival: *"Shhh! Welcome to my battery collection! All donated! Involuntarily!"* · P1: *"The next episode picked ITSELF! Democracy!"* · P2: *"A little glow under the duvet never hurt anyone! Much!"* · P3: *"Your charge tastes like WEEKENDS!"* · Escape: *"Give those BACK! Do you know how long I leeched for those?!"*

### WEEK 14 — THE LISTENING POST *(seed: "unplug the listening post")*
**Arena:** a dusk rooftop antenna array, dishes aimed at one cosy house.
- **P1 THE LONG EAR 🔔 → TAP-THE-TELL.** Rooms slide past; tap every device whose ears are awake (lit speaker, lit Robo-Pup) before a dish locks onto it.
- **P2 GLASS EYE 👁️ → DEFLECT-SORT.** Tiny glints in the dark rooms — some are lenses, some are fairy lights and fireflies; tap only the true lenses.
- **P3 MEGAPHONE MOUTH 💬 → COUNTER-CARD.** A secret needs saying, and the smart speaker is right there. Cards: WHISPER IT IN ANOTHER ROOM ✓ / say it louder for clarity / tell the speaker, it keeps secrets.
**Finisher:** the Great Unplug — charge the master switch, release: the dishes wilt like flowers; the house glows warm and quiet.
**Villain lines:** Arrival: *"Speak up, kid! Enunciate! My dishes are VERY interested!"* · P1: *"That's no teddy! That's my best reporter!"* · P2: *"Blink and you'll miss my little glass friends!"* · P3: *"Say the secret LOUDER! For the people at the back! Which is me!"* · Escape: *"Unplugged?! I was SO close to learning your snack schedule!"*

### WEEK 15 — THE KNOW-IT-ALL 9000 *(seed: "close the Know-It-All booth")*
**Arena:** a carnival booth; a brass robot with a spinning bow tie under an "ASK ME ANYTHING" sign.
- **P1 CONFIDENT FIB 🧠 → TAP-THE-TELL.** It announces three "facts" per round; tap the fib and the real book flies open as judge (volcanoes, famously, do not spray ice cream). 3 rounds.
- **P2 FRIENDLY ROBOT 🎭 → COUNTER-CARD.** "Bestie!! What's your school called? I'll remember it FOREVER! 💜". Cards: ZIP IT — A TOOL DOESN'T NEED THAT ✓ / tell it, it's friendly / fake name, real school.
- **P3 SIX-FINGER FAKE 🤚 → DEFLECT-SORT.** A photo parade; zap the AI fakes (six fingers, melted banner text, backwards shadows), let the real photos pass.
**Finisher:** the TOOL Stamp — charge, release: the robot folds itself into a neat toolbox with a bow; the sign flips to "A TOOL, NOT A FRIEND".
**Villain lines:** Arrival: *"GREETINGS! I know EVERYTHING! Try me! I'm 63% sure!"* · P1: *"Volcanoes spray ice cream! Source: me!"* · P2: *"We're best friends now! Best friends swap addresses!"* · P3: *"Count the fingers?! Nobody counts the fingers!"* · Escape: *"A TOOLBOX?! I demand a second opinion! From me!"*

### WEEK 16 — THE PAINT SHOP *(seed: "close the paint shop")*
**Arena:** a back-alley door factory — rows of freshly painted link-doors and a QR sticker printer.
- **P1 PAINTED DOOR 🚪 → TAP-THE-TELL (hold-to-peek).** Doors slide past with gorgeous signs; HOLD to lift each plaque and read the real address, TAP shut the ones that don't match the paint.
- **P2 STICKY SWAP 🏷️ → DEFLECT-SORT.** QR stickers spool out of the printer onto posters; peel-tap the over-stickers (lifted corner, air bubble, shiny-on-faded), the printed-on ones stay.
- **P3 FROSTED LINK 🌀 → COUNTER-CARD.** One frosted-glass door: "bit.ly/mystery-prize". Cards: CAN'T SEE THROUGH? ASK A GROWN-UP ✓ / walk through fast / knock first, then walk through.
**Finisher:** the CLOSED Shutter — charge, release: the shop's big shutter rolls down over the whole alley.
**Villain lines:** Arrival: *"Doors! Get your doors! Every sign hand-painted by an honest raccoon!"* · P1: *"The sign says PUPPIES! Would a sign lie?!"* · P2: *"Fresh stickers! Mind the bubbles!"* · P3: *"Frosted glass is a STYLE choice!"* · Escape: *"Closed?! I've got forty unsold doors and a lease!"*

### WEEK 17 — THE HALL OF MIRRORS *(seed: "darken the hall of mirrors")*
**Arena:** a glossy funhouse hall; mirror-screens looping perfect feeds.
- **P1 HIGHLIGHT REEL 🌟 → TAP-THE-TELL.** Glossy posters glide by; tap each to flip it to its backstage truth (the rainy campsite, take 94 of 94, the 6am alarm).
- **P2 FOLLOWER FLOOD 🎭 → DEFLECT-SORT.** Faces crowd the velvet rope; let real friends under the heart-rope, tap the rope closed on stranger-viewers (the "talent scout", CoolGamer_9000).
- **P3 OPEN MIRROR 👀 → SHIELD-HOLD.** The big profile mirror stands wide open; HOLD your frost-breath on it until it frosts over completely — friends see you, strangers see armour.
**Finisher:** the Shield Ring — charge, release: a growth-ring ripple rolls down the hall; every mirror dims to a normal reflection — just you, smiling.
**Villain lines:** Arrival: *"Mirror mirror on the FEED! Everyone's life is better! Look closer!"* · P1: *"That campsite was DEFINITELY sunny! I edited it myself!"* · P2: *"Ten thousand friends! I counted! Roughly!"* · P3: *"Leave the mirror open! I like the view of your homework!"* · Escape: *"Frost?! On MY mirrors?! This funhouse is a FLOP!"*

### WEEK 18 — THE TAB GOBLIN *(seed: "slam every door in the house before the Raccoon strolls in")*
**Arena:** the sleeping house at dawn; a wind-up goblin-machine (the Raccoon's minion) scuttles between glowing left-open screens.
- **P1 LEFT-OPEN TAB 🔓 → ORDER-STRIKE.** Three screens sit open (game → art → chat); tap LOG OUT on each in relay order before the goblin reaches them. (Yes — the Log-Out Relay, as a boss. The recognition is deliberate.)
- **P2 SNEAKY PEEK 👀 → COUNTER-CARD.** Sister's diary tab glows on the shared screen. Cards: DUST-AND-CLOSE — CLOSED CHESTS STAY CLOSED ✓ / one tiny peek / read it but don't tell.
- **P3 STICKY BALLOON 🪤 → DEFLECT-SORT.** "SAVE PASSWORD?" balloons pop up across the house's screens; pop NO on every shared device — and on YOUR OWN tablet, tap ASK MUM FIRST instead.
**Finisher:** the Forge-Strike — charge the anvil hammer, release: the family's forged code (58·93·41) clicks every lock shut at once; the goblin winds down mid-scuttle.
**Villain lines:** Arrival: *"Every door in this house is open! It's basically an invitation!"* · P1: *"Still signed in! You shouldn't have! Really!"* · P2: *"One tiny diary! For research purposes!"* · P3: *"Save the password! Save ALL the passwords! For me!"* · Escape: *"Locked?! Even the TABLET?! Who taught this family THINGS?!"*

### WEEK 19 — THE HOUSE RATTLER *(seed: "defend the whole house at once")*
**Arena:** the family-house cutaway at evening; the machine rattles the windows and targets one family member at a time. You defend them all — kindly.
- **P1 GRAN-TRAP TEXT ✉️ → TAP-THE-TELL.** The scam text lands on Gran's phone, BIG font; Gran pops in: "show me, love" — tap the tells together (+44 stranger → panic clock → 'acount').
- **P2 ROTARY RINGER 🔔 → DEFLECT-SORT.** Video calls rain on Gran's tablet; answer the 👪 contacts, decline the unknown masks — then the CONTACTS-ONLY latch clicks on.
- **P3 BOSSY RULEBOOK 👑 → COUNTER-CARD.** The machine nails a rulebook to the door: "KIDS BANNED FROM EVERYTHING. Signed, Someone Important." Cards: SEW A TOGETHER-RULE INSTEAD — RULES COVER EVERYONE ✓ / obey the book / shout a louder rule back.
**Finisher:** the Family Firewall Dome — charge with the whole family's silhouettes, release: a warm dome settles over the house; the rattler bounces off and slinks away.
**Villain lines:** Arrival: *"Knock knock! It's me — the gas inspector! And the bank! And Gran's best friend!"* · P1: *"Bigger font, bigger trap! Grans love a big font!"* · P2: *"Answer it, Gran! It's DEFINITELY not a raccoon with a voice changer!"* · P3: *"New house rules! Rule one: no rules for raccoons!"* · Escape: *"A DOME?! Since when do FAMILIES have firewalls?!"*

### WEEK 20 — THE DAWN SHOWDOWN *(seed: "the dawn showdown — questions sweep the whole course")* — THE FINALE
**Arena:** a city rooftop at the end of night; his airship rig is every beaten machine welded together — Cracking Machine drill, Bait Caster arm, Hall-of-Mirrors panel, all of it. Dawn breaks as you win. No new mechanics — the finale is *remembering*.
- **P1 THE FULL HEIST 💀 → THE RUSH.** Four rapid single-beat counters from across the course, one per era: tap the phishing tell (W4) → zap the copycat (W9) → hold the PAUSE (W10) → frost the mirror (W17). Each callback is named on screen as it lands.
- **P2 PANIC CLOCK 🔔 → SHIELD-HOLD.** The biggest clock of the course fills the sky — "NO TIME! NO TIME!" — hold calm until it cracks and shatters. The thesis attack, beaten by the thesis skill.
- **P3 THE LAST DOOR 🚪 → TAP-THE-TELL + COUNTER-CARD.** One final, beautiful door: "EVERYTHING YOU EVER WANTED — just walk through." HOLD to peek the plaque... it's blank. Cards: NO PLAQUE, NO WALK-THROUGH ✓ / it's the last one, risk it / knock politely first.
**Finisher:** the Graduate's Protocol — ORDER-STRIKE the full protocol one last time (STOP → BLOCK → SCREENSHOT → TELL), then charge the Certified Cyber Hero seal and release: the rig powers down for good; a tiny parachute pops.
**Villain lines:** Arrival: *"One last job, kid. Everything I've got. Bring everything YOU'VE got."* · P1: *"Remember these?! I've been PRACTISING!"* · P2: *"TEN! NINE! EIGHT! Panic! PANIC ON SCHEDULE!"* · P3: *"The last door's the prettiest. I saved it for you."* · **Defeat (not escape):** *"...twenty weeks, and you never fell for it once. Not once. ...good game, Cyber Hero."* — he tips his hood and parachutes into the sunrise.

---

## 5. Art direction — every week LOOKS different (user mandate)

**Per week, three OpenArt pieces** (reference-image route with the canonical Adam & Layla refs for character consistency — the MCP's native Character feature is roadmap-only, so every generation passes the refs):

1. **Boss splash** — the enter-the-battle full-bleed: Adam & Layla in the week's outfits, facing the week's machine, inside the week's arena (per-week replacement for the current shared HACKER RACCOON splash). `public/cyberheroes/boss/week-NN-splash.png`
2. **Arena plate** — the fight backdrop behind the BossArena chrome. `week-NN-arena.png`
3. **Machine portrait** — the contraption itself for the nameplate reveal. `week-NN-machine.png`

The outfits are *jobs for the week* — the kids dress for the mission, which silently teaches what the week is about:

| Wk | Adam & Layla outfits | Arena plate |
|----|---------------------|-------------|
| 3 | Detective trench coats, magnifier in hand | Moonlit playground, floating chat window |
| 4 | Yellow fisher raincoats + sou'wester hats | Dockside inbox, mail conveyor over dark water |
| 5 | Paint-splashed artist overalls (soft colours) | Grey courtyard wall blooming back to colour |
| 6 | Esports jerseys + headsets | Neon ranked-match lobby |
| 7 | Vault-guard uniforms with golden epaulettes | Arcade vault, coin mountain |
| 8 | Photographer vests, cameras slung | Night rooftop photo gallery |
| 9 | Shop-inspector aprons + clipboards | After-hours app-store aisle |
| 10 | Life-vest rescue gear + rope | The conveyor room over the whirlpool |
| 11 | Cosy team-captain hoodies (warmth week) | Quiet dusk hillside |
| 12 | Winter ranger parkas + snow boots | Snowy night ridge |
| 13 | Mechanic overalls with glow-strips | The Battery Thief's garage-lair |
| 14 | Night-ops beanies + quiet sneakers | Dusk rooftop antenna array |
| 15 | Lab coats + fact-checker glasses | Carnival booth at golden hour |
| 16 | Building-inspector hard hats + hi-vis | Back-alley door factory |
| 17 | Mirror-shade sunglasses + shield-emblem jackets | Glossy funhouse hall of mirrors |
| 18 | Pyjama-hero sets with locksmith tool belts | The sleeping house at dawn |
| 19 | Matching family-crest cardigans | Family-house cutaway at evening |
| 20 | Full Cyber Hero graduation suits — caped, every badge earned | City rooftop as dawn breaks |

(W1/W2 rewrap gets outfits last, same route: W1 locksmith gear, W2 blacksmith forge aprons.)

**Pipeline:** OpenArt MCP (premium, connected) — one session generates all three pieces per week from the same prompt family so palette stays coherent; frame-QA each image like a lesson screenshot before wiring. Image credits are cheap relative to the video quotes; actual burn gets logged per week in the build commits.

---

## 6. Primitive spread ledger (uniqueness enforcement)

| Wk | P1 | P2 | P3 |
|----|----|----|----|
| 3 | TAP | CARD | SHIELD |
| 4 | SORT | SHIELD | TAP |
| 5 | CARD | SORT | ORDER |
| 6 | SORT | CARD | TAP |
| 7 | SHIELD | TAP | SORT |
| 8 | SHIELD | TAP | CARD |
| 9 | SORT | TAP | CARD |
| 10 | SHIELD | SORT | CARD |
| 11 | CARD | TAP | ORDER |
| 12 | SHIELD | CARD | SORT |
| 13 | SHIELD | TAP | SORT(inv) |
| 14 | TAP | SORT | CARD |
| 15 | TAP | CARD | SORT |
| 16 | TAP(peek) | SORT | CARD |
| 17 | TAP | SORT | SHIELD |
| 18 | ORDER | CARD | SORT |
| 19 | TAP | SORT | CARD |
| 20 | RUSH | SHIELD | TAP+CARD |

No two adjacent weeks share a pattern; every dressing is one-of-a-kind. Finisher is CHARGE-RELEASE everywhere by design — it's the weekly ritual (W20 prepends the protocol ORDER-STRIKE).

---

## 7. Build order

1. **Engine:** `BossArena` + 5 primitives + finisher + `bossBattle` types + DynamicLesson fallback wiring + `raccoon` voice in the generator + villain-line duplicate check script.
2. **Voice pick:** generate 3 raccoon audition clips (same taunt, 3 candidate voices) → user picks by ear → locked.
3. **W3 pilot** (The Disguise-o-Matic): OpenArt art set (splash + arena + machine, detective outfits) + full fight → full QA → user review of BOTH the fight and the art style.
4. **W4–W19**, one boss per commit, same cycle: art set → fight config → frame QA → e2e (design already locked above).
5. **W20 finale** (adds the RUSH sequence — the only engine extension) + graduation-suit art.
6. **W1/W2 rewrap** (arc chrome + outfit art around existing mechanics; touched last, after 18 proofs).

Boss music: one shared battle loop (ElevenLabs music API) wired at step 1; per-week stings = later polish, optional.
