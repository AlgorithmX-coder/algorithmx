# Week 1 "Passwords" — Complete Build Reference

> Exhaustive, self-contained spec of the Cyber Heroes **Week 1: Passwords** lesson
> at `/lesson/1`. Every screen, activity, data shape, prop, XP value, audio cue,
> server call, and persistence key. Read-only documentation — describes the code
> as built, changes nothing.
>
> **Do not confuse** with `/cyberexplorers/week1` ("Digital Identity & Footprint"),
> a separate hardcoded lesson that shares none of this architecture.

---

## 0. Lesson metadata (`app/lesson/weekContent/week1.ts` → `WEEK_1`)

| Field | Value |
|---|---|
| `weekNumber` | `1` |
| `title` | "Passwords: The Secret Code" |
| `topic` | "passwords" |
| `badgeName` | "Password Protector" |
| `badgeIcon` | 🔐 |
| `screens.length` | **23** (indices 0–22) |
| Boss | 5-phase (`bossPhases`, 14 questions) + 15-question flat fallback (`bossQuestions`) |

**Curriculum rule (enforced by content order):** every concept is *taught before tested*. No 2FA, no password managers, no hashing — those belong to later weeks and are deliberately absent.

---

## 1. How the lesson loads

```
/lesson/1
  → app/lesson/[week]/page.tsx        (SERVER)
       auth() → if no session: redirect("/login")
       hasEntitlement(userId,"cyber-heroes") → if false: redirect("/hub")
       (BYPASS_ENTITLEMENT_FOR_TESTING = false, module scope)
       renders <DynamicLesson/>
  → app/lesson/[week]/DynamicLesson.tsx (CLIENT)
       useParams().week → Number → getWeekContent(1) → WEEK_1
       wrapped in <ComfortModeProvider>
```

- **Lesson identity = the numeric URL segment** looked up in `WEEK_CONTENT: Record<number, WeekContent>` (`weekContent/index.ts`). No slug/DB drives *which* lesson.
- **QA deep-link:** `?screen=N` jumps to a screen, bypassing the resume banner (clamped to range).
- **Unknown/not-ready week** → `<WeekNotReady>` fallback ("Week N is on the way").

---

## 2. Global systems (apply to every screen)

### 2.1 Navigation & state
- `const [screen, setScreen] = useState(0)`. `navigate(to)` clamps `[0, 22]`, sets `navDirRef` (forward/back), plays `transition` SFX.
- **Arrow keys** ←/→ free-skip screens (disabled inside inputs and during the boss overlay). No hard gating — each screen advances via its own button or `onComplete`.
- Per-screen `wrongCounts[screen]` → **stars**: `0 wrong = 3★`, `1 = 2★`, `≥2 = 1★`.
- `lessonXp` accumulates; `awardXp(amount)` also calls `addXP(amount,"week-1")` (`app/lib/progression.ts`, localStorage rank) and can raise a **RANK UP!** toast.
- On correct: 3D arena mood → "correct" + pulse. On wrong: arena "wrong" + `ScreenShake` + `wrongAnswerShake()` (body shake + SFX).

### 2.2 Persistence & analytics (`app/lib/useLessonProgress.ts` → `lessonProgress.actions.ts` → Prisma)
- **On mount:** `startOrResumeAttempt(1)` → `LessonAttempt`. If unfinished with progress > 0 → **Resume banner** (Continue / Restart). `restartAttempt(1)` bumps attempt number.
- **On forward nav:** `saveScreen({screenIndex, wrongCount, xpEarned, starsEarned})` → `ScreenResult` row + `screen_completed` analytics (includes duration + max hint tier).
- **Per answer (exercises exposing `onAnswered`):** `saveQuestion({screenIndex, questionKey, selectedIndex, correctIndex, wasCorrect})` → `QuestionResponse` row. Wrong answers also emit `wrong_answer` analytics.
- **Hints:** `reportHint(screen, tier)` tracks the max tier per screen → `hint_used` analytics (first time each tier shows).
- **Completion:** reaching screen 22 fires `complete({totalXp, finalScreenIndex})` → `completedAt` + `lesson_completed`. `reportExerciseQuit()` on unmount if incomplete.
- **Boss:** `reportBossStarted()` on START; `saveBoss({...})` → `BossResult` (+`badgeId:"week-1"` if won); per-phase `boss_completed` analytics.
- **Stickers:** `awardStickers(ids)` server action (→ `EarnedSticker`) fired once when the `stickerUnlock` screen first mounts (`stickersAwardedRef` guard; idempotent server-side).
- **Failure policy:** every server call is best-effort try/catch — persistence never crashes gameplay.

### 2.3 Audio (see §5 for the full asset inventory)
- **BGM:** `bgmLesson` on all non-boss screens; `bgmBattle` only on the `bossBattle` screen (`app/lib/sounds.ts`).
- **Signature SFX** (ElevenLabs sound-gen, `/audio/sfx-signature/manifest.json`, via `audio.signature(id)`):
  - `mission` screen → `"mission-start"` (320 ms after entry).
  - `completion` screen → `"mission-complete"` (240 ms) then `"badge-bloom"` (1100 ms).
  - `passwordVault` → `"vault-open"` / `"vault-reveal"` (fired inside the component).
  - Boss victory → its own cues inside `BossVictoryScene`.
- **Exercise SFX** via the typed facade `useGameAudio()` (`audio.correct/wrong/tap/unlock/…`) → `playSound()`.
- **Voice interjections** ("Will" micro-cues) exist but are **globally OFF** (`VOICE_INTERJECTIONS_ENABLED = false`).

### 2.4 Narration (info screens) — `app/components/lesson/InfoNarration.tsx`
- Plays pre-rendered **ElevenLabs MP3s** resolved from `/audio/voice/manifest.json` by a block-key lookup (joined lines), per character voice (**adam** / **layla**). Falls back to **Web Speech API TTS**, then to silent captions. Auto-plays on mount (~400 ms delay), user-toggleable (`algorithmx-narration-on-v1` localStorage).
- Data source = each screen's `narration: { speaker, lines }` in `week1.ts`. Present on screens **2, 9, 11, 12** (info) and **20** (missionDebrief). No "George" exists in this codebase — the narrators are adam/layla.

### 2.5 Motion & accessibility
- `useMotionIntensity()` → `1` normal, `0.45` comfort mode, **`0` under OS `prefers-reduced-motion`**. Toolkit multiplies durations/particle counts by it; `0` skips confetti entirely.
- `ComfortModeProvider` wraps the whole lesson.

### 2.6 Persistent chrome (mounted around every screen)
`LessonHUD` (Adam avatar, week title, screen X/total, XP), `LessonArena3D` (dynamic `ssr:false` 3D backdrop reacting to mood), `LessonAmbience`, `ScreenTransition` (per-type: exercises `fadeScale`, boss `wipeDown`, else slide), `ScreenShake`, `ExerciseErrorBoundary` (per-screen, "skip on crash"). **Character guides (Adam/Layla `RiveCharacterGuide`) are mounted ONLY on the boss screen** — every other screen is character-free even though `reactions` are defined for all of them.

### 2.7 Standard exercise contract
Every exercise receives from `DynamicLesson`: `onComplete()` (→ next screen), `onCorrect()` (→ `awardXp`), `onWrong()` (→ `addWrong`), most also `onHintReached(tier)`; data-rich ones add `onAnswered({questionKey, selectedIndex, correctIndex, wasCorrect})`. Internally most wrap in `<ExerciseFrame>` and use `useExerciseFeedback()` (`fx.correct/wrong/unlock/toast/layer`).

---

## 3. Screen-by-screen breakdown (0–22)

> Format: **index · `type`** — component (file) · activity · data · orchestrator props/XP · audio/persistence · background. `reaction[i]` = the Adam/Layla line defined in `week1.ts` (rendered only on the boss screen, but listed for completeness).

### 0 · `video` — intro video
- **Component:** inline `VideoScreen` (DynamicLesson).
- **Activity:** plays `/videos/module-01-intro.mp4` in a real `<video>` (play button → native controls; `onEnded`/Skip → next). Missing file falls back to a "Skip video" affordance.
- **Data:** `{ videoPlaceholder:"Week 1: Passwords intro video", videoSrc:"/videos/module-01-intro.mp4" }`.
- **XP/audio:** none; `transition` SFX on advance. **BG:** `#0a0a1a→#1a1033`.
- `reaction[0]`: adam *excited* "Welcome back to Week 1!"

### 1 · `mission` — mission briefing
- **Component:** inline `mission` case.
- **Activity:** shows badge 🔐 + "Week 1: Passwords: The Secret Code" + 3 objectives; "Accept Mission →".
- **Data:** `objectives: ["Find out what a password really is","Learn what makes a password strong","Spot bad passwords a hacker could crack"]`.
- **Audio:** `audio.signature("mission-start")` 320 ms after entry. **BG:** `#0a0e2a→#1a1033` + blue glow.
- `reaction[1]`: layla *curious* "Let's learn what makes a password strong."

### 2 · `info` — "What Is a Password?"
- **Component:** inline `info` case + `<InfoNarration>`.
- **Activity:** teaching card; 4 bullets; narrated.
- **Data:** content = "A password is a secret code that only YOU know…"; bullets = keep secret / 8+ chars / mix upper-lower-number-symbol / no name·birthday·'password'. **Narration (adam, 5 lines):** "A password is your secret code." → "…big letters, small letters, numbers and symbols."
- **BG:** `#0a1020→#1a1033` + blue glow.
- `reaction[2]`: adam *thinking* "Passwords are your secret code."

### 3 · `cyberScanner` — strong/weak scan
- **Component:** `CyberScanner` (`app/components/exercises/CyberScanner.tsx`). Reaction-time canvas: tap STRONG/WEAK before the card drifts off.
- **Data (`items`, 10):** `password123`(weak), `Tr0pic4l$unR1se!`(strong), `qwerty`(weak), `MyN@me1sJ0hn!`(strong), `ilovecats`(weak), `G4m3r#Pr0!`(strong), `123456789`(weak), `Cyb3r$h13ld_2024!`(strong), `football`(weak), `X#9kL2$mP!`(strong) — each with an `explanation`.
- **Props:** `passwords=def.items`, `onComplete→nav`, `onCorrect→awardXp(25)`, `onWrong→addWrong`, `onHintReached→reportHint`.
- **Toolkit:** ExerciseFrame ✅; **legacy juice** — raw `audio.correct/wrong` + `correctAnswerBurst()` on finish (bypasses `fx.correct`). **BG:** `#050a1a→#1a1033`.
- `reaction[3]`: layla *excited* "Scan each password!"

### 4 · `passwordLab` — build a strong password
- **Component:** `PasswordLab`. Builder — the only exercise whose **content is hardcoded inside the component** (no data in `week1.ts`).
- **Data:** `{ type:"passwordLab" }` only.
- **Props:** `onComplete/onCorrect→awardXp(25)/onWrong`. **BG:** `#050a1a→#1a1033`.
- `reaction[4]`: adam *excited* "Let's brew a super-strong password!"

### 5 · `threeRandomWords` — passphrase builder
- **Component:** `ThreeRandomWords`. Pick 3 of 24 words from a wall; live strength meter; variety bonus for 3 different categories. Demonstrates "length beats complexity" (NCSC three-random-words).
- **Data:** `slots:3`; `words` = 24 entries across categories **animal/object/place/food** (e.g. `w-tiger`, `w-kettle`, `w-mountain`, `w-pancake`); `hints:{tier1,tier2}`.
- **Props:** `words/slots/hints` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached` + **`onAnswered`** → `saveQuestion` with `questionKey="trw-build@w-tiger+w-mountain+w-cookie"` (chosen ids encoded; assembled passphrase never stored).
- **Toolkit:** ExerciseFrame ✅, `fx.toast/unlock/layer`, `audio.tap`, motion-gated. **BG:** `#050a1a→#1a1f4d`.
- `reaction[5]`: layla *curious* "Three random words — long beats clever every time."

### 6 · `passwordVault` — flagship 5-lock vault (⭐ scene template)
- **Component:** `PasswordVault`. Cinematic vault door, 5 glowing locks; tap a lock → camera focus-zoom → 2D challenge panel → correct activates the lock, wrong teaches via `WrongAnswerPanel`. All 5 → vault opens (light burst + confetti) → complete. This is the reusable **hotspot + 2D-overlay + camera-pan** pattern.
- **Data (`locks`, 5):** each `{id, ruleLabel, icon, prompt, speaker, choices[4]{text,isCorrect,explanation}}`:
  1. `length` 📏 "Which password is LONG enough?" → `MyL0ng_Pass!`
  2. `mix` 🎨 "Which mixes ALL character types?" → `Tr0pic4l$un!`
  3. `personal` 🪪 "Which does NOT use personal info?" → `Volcano$Mango7`
  4. `common` 📕 "Which is NOT in a hacker's top-guess list?" → `Compass!Otter9`
  5. `secret` 🤐 "Who should know your password?" → `Only me (and a parent)`
  - `guidance:{intro:"Tap a glowing lock to begin.", progress:"Keep going - each rule opens a lock!", complete:"VAULT OPEN - the Raccoon can't get in!"}`.
- **Props:** `locks/guidance` + `onComplete/onWrong/onHintReached` + **`onCorrect→awardXp(30)`** (higher than the standard 25) + **`onAnswered`** → `saveQuestion` (questionKey per lock id).
- **Toolkit/audio:** ExerciseFrame (16:9, reserve 210) ✅; `fx.correct({xp:30})`/`fx.unlock({xp:100,text:"VAULT MASTER!"})`; `audio.signature("vault-open"/"vault-reveal")` + tap/select/unlock/victory; motion-gated camera + confetti. **BG:** radial `#1a1f4d→#0a0e25→#050714`.
- `reaction[6]`: adam *excited* "Open every lock on the vault door!"

### 7 · `weakSorter` — name the reason it's weak
- **Component:** `WeakSorter`. Each card is a weak password; tap which of 4 reasons applies (recognition, not classification).
- **Data:** `reasons[4]` = `too-short`/`common-word`/`personal`/`keyboard` (each `{id,label,example}`); `items[8]` = `abc→too-short`, `football→common-word`, `Sam2014→personal`, `qwerty→keyboard`, `123→too-short`, `dragon→common-word`, `Maya0511→personal`, `asdfgh→keyboard` (each with `explanation`); `hints:{tier1,tier2,tier3}`.
- **Props:** `reasons/items/hints` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached`.
- **Toolkit:** ExerciseFrame ✅; **legacy** `correctAnswerBurst()` on completion (only `fx.layer()` otherwise). **BG:** `#050a1a→#1a1033`.
- `reaction[7]`: layla *thinking* "Each of these is WEAK - tell me WHY."

### 8 · `passwordHospital` — diagnose then repair
- **Component:** `PasswordHospital`. Multi-phase: (1) **diagnose** weak reason (4-choice), (2) **repair** by tapping toolbox action cards that transform the working password + raise a strength meter, (3) **discharge** ("HEALED!") once threshold crossed. Reason ids match `weakSorter` so analytics aggregate.
- **Data:** `reasons[4]` (same id space); `patients[6]` = `abc`/`football`/`qwerty`/`Sam2014`/`123`/`dragon`, each `{id, password, primaryReason, chartNote, diagnosisExplanation, recommendedActions[]}` (action ids like `addLetters/addNumber/addSymbol/mixCase/removePersonal/scramble`); `hints:{diagnosisTier1,diagnosisTier2,repairTier1,repairTier2}`.
- **Props:** `reasons/patients/hints` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached` + **`onAnswered`** → `saveQuestion` with `questionKey="hospital-{patientId}-{diagnosis|healed}"` (working password text never sent).
- **Toolkit:** ExerciseFrame ✅; `fx.correct({xp:10,text:"DIAGNOSED!"})`, `fx.unlock({xp:25,text:"HEALED!"})`, `fx.toast`; `audio.wrong/tap`; motion-gated. **BG:** `#050a1a→#122318` (green clinical tint).
- `reaction[8]`: adam *excited* "Welcome to the Hospital - let's heal these weak passwords!"

### 9 · `info` — "One Password, One Account" (uniqueness teaching)
- Inline + narration. Content = the "one key opens house, locker AND bike" analogy; 4 bullets (different password per account, reuse multiplies risk, strong AND different, ask a parent). **Narration (layla, 5 lines).** **BG:** info gradient.
- `reaction[9]`: adam *thinking* "One key, one door - never reuse passwords."

### 10 · `accountRescue` — assign unique passwords
- **Component:** `AccountRescue`. The Raccoon hacked 1 of 3 accounts sharing one password; assign a **different** new password to each from a shared bank. Duplicate picks blocked at assignment time.
- **Data:** `sharedPassword:"Dragon2014"`, `leakedAccountId:"acc-roblox"`, `accounts[3]` = Roblox🎮/School📚/Email✉️, `passwordBank[5]` = `Tiger#Mountain42`, `Cookie!Lantern9`, `Otter$Rocket27`, `Mango_Compass85`, `Falcon&Jungle13`; `hints:{tier1,tier2}`.
- **Props:** all data + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached` + **`onAnswered`**.
- **Toolkit:** ExerciseFrame ✅; `fx.toast({tone:"danger"})` on duplicate, `fx.correct({xp:8})`, `fx.unlock({xp:30,text:"ALL ACCOUNTS SECURED!"})`. **BG:** `#050a1a→#1a1f4d`.
- `reaction[10]`: layla *worried* "The Raccoon's in - rescue every account!"

### 11 · `info` — "The 5 Golden Rules"
- Inline + narration. Bullets = SECRET / LONG (8+) / MIXED / UNIQUE / never name·birthday·'password'. **Narration (adam, 6 lines).**
- `reaction[11]`: layla *thumbsup* "The 5 Golden Rules - memorise them!"

### 12 · `info` — "Watch Out for Phishing"
- Inline + narration. Content defines phishing ("say it like 'fishing'"); bullets = free prize = bait / URGENT password demand = bait / unknown sender = careful / when in doubt show a parent. **Narration (layla, 6 lines).**
- `reaction[12]`: adam *worried* "Phishing is the Raccoon's favourite trick - watch out!"

### 13 · `phishInspector` — inspect then decide
- **Component:** `PhishInspector`. Each email exposes 4 tap zones — **WHO** sent it / **WHAT** the link is / **HOW** it sounds / **WHAT** it asks for — each reveal flags red/green + explanation. ZAP/SAFE unlock only after all 4 inspected. Teaches "don't react, inspect first."
- **Data (`emails`, 3):** `email-roblox` (phishing — lookalike `RobIox` capital-I sender), `email-school` (safe — Mrs Johnson PE reminder), `email-vbucks` (phishing — free V-Bucks). Each `{id, sender, subject, body, isPhishing, inspections:{senderNote/senderIsRedFlag, linkText/linkNote/linkIsRedFlag, urgencyNote/urgencyIsRedFlag, claimNote/claimIsRedFlag}}`; `hints:{tier1,tier2}`.
- **Props:** `emails/hints` + `onComplete/onWrong/onHintReached` + **`onCorrect→awardXp(30)`** + **`onAnswered`**.
- **Toolkit:** ExerciseFrame (maxWidth 1000) ✅; `fx.toast` per zone, `fx.correct({xp:15})` on correct decision; `audio.tap/wrong`. **BG:** `#050a1a→#1a1033`.
- `reaction[13]`: layla *curious* "Inspect each email before deciding - look for the red flags."

### 14 · `spamBlaster` — reaction-speed phishing shooter
- **Component:** `SpamBlaster`. Fast "zap the phish, keep the safe" arcade — the deliberate counterpart to PhishInspector.
- **Data (`emails`, 10):** mix of phishing (free iPhone, URGENT password, free V-Bucks, "your school needs your password", 1,000,000th visitor, account-deletion scare) and safe (Sam video, PE reminder, homework, Grandma birthday) — each `{sender, subject, isPhishing, clue}`.
- **Props:** `emails` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached`. **BG:** `#050a1a→#1a1033`.
- `reaction[14]`: layla *worried* "Zap the phishing emails!"

### 15 · `popupPanic` — find the X, not OK
- **Component:** `PopupPanic`. Scary fake pop-ups; tap the small **X**, never the tempting **OK**. Drills "close it and tell a grown-up."
- **Data (`popups`, 5):** `pop-prize`🎁 free iPhone, `pop-virus`⚠️ virus detected, `pop-delete`⏱️ account-deletion countdown, `pop-vbucks`💰 free V-Bucks, `pop-phone`📞 call-this-number — each `{id, icon, title, body, whyTrick}`; `hints:{tier1,tier2,tier3}`.
- **Props:** `popups/hints` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached` + **`onAnswered`** (questionKey per popup).
- **Toolkit:** ExerciseFrame (maxWidth 900) ✅; `fx.correct({xp:10,text:"GOT IT!"})`, `audio.wrong` on OK tap. **BG:** `#050a1a→#1a0f2a`.
- `reaction[15]`: adam *worried* "Find the X - never tap OK on a scary pop-up."

### 16 · `memoryMatch` — vocabulary pairs
- **Component:** `MemoryMatch`. Match 6 term↔definition pairs.
- **Data (`pairs`, 6):** Password / Strong / Weak / Unique / Phishing / Secret — each `{term, match, colour}` (colours `#60a5fa, #34d399, #ef4444, #8b5cf6, #ff5fb3, #fbbf24`).
- **Props:** `pairs` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached`. **BG:** `#0a0a2a→#1a1033`.
- `reaction[16]`: adam *curious* "Match the password concepts."

### 17 · `chooseYourPath` — branching decisions
- **Component:** `ChooseYourPath`. Pick the safe choice; each shows a consequence.
- **Data (`scenarios`, 2):** (a) best friend asks for your Roblox password; (b) pop-up says account hacked, enter password NOW. Each choice `{text, isSafe, consequence}`.
- **Props:** `scenarios` + `onComplete/onCorrect→awardXp(25)/onWrong`. **BG:** `#0a0a2a→#1a1033`.
- `reaction[17]`: layla *thinking* "Pick the safe door."

### 18 · `cyberMaze` — end-of-lesson quiz maze
- **Component:** `CyberMaze`. Navigate a maze answering recall questions.
- **Data (`questions`, 5):** strong-password definition / who should know it / what a good password excludes / reused-password blast radius / "free phone for your password" = phishing. Each `{question, answers[4], correctIndex:0}`.
- **Props:** `questions` + `onComplete/onCorrect→awardXp(25)/onWrong/onHintReached` + **`onAnswered`** → `questionKey="maze-{index}"`. **BG:** `#050a1a→#1a1033`.
- `reaction[18]`: adam *excited* "Navigate the maze!"

### 19 · `bossBattle` — Hacker Raccoon (5-phase) — see §4
- **Pre-screen:** "BOSS BATTLE / Hacker Raccoon is waiting…" → START BATTLE → `reportBossStarted()` + `setShowBoss(true)`. **BG:** `#1a0505→#0a0a1a` + red glow; **BGM = `bgmBattle`** (only here).
- **Post-win:** `bossDone` renders `BossVictoryScene` (badge 🔐, "Password Protector", stats, Claim → next).
- **Character guides Adam + Layla mounted here only.**
- `reaction[19]`: layla *excited* "Boss battle - let's beat the Raccoon!"

### 20 · `missionDebrief` — concept recap
- **Component:** `MissionDebrief`. 4 concept cards light up in sequence with narration.
- **Data:** `title:"Mission Complete!"`, `subtitle:"Here's what you mastered this week."`, `concepts[4]` = `strength`💪(`#00e5ff`) / `secrecy`🤐(`#fde047`) / `uniqueness`🗝️(`#7c5cff`) / `phishing`🔍(`#ff5fb3`), each `{id,label,accent,icon,summary}`; **narration (layla, 6 lines).**
- **Props:** `title/subtitle/concepts/narration` + `onComplete`. **BG:** `#050a1a→#1a1f4d`.
- `reaction[20]`: adam *thumbsup* "Look at everything you learned this week!"

### 21 · `stickerUnlock` — reward reveal
- **Component:** `StickerUnlock`. Three stickers drop in sequence with confetti/audio.
- **Data:** `title:"Stickers Unlocked!"`, `stickers[3]` = `password-master`🔐 / `secret-keeper`🤐 / `phish-spotter`🔍, each `{id,name,icon,description}`.
- **Server:** `awardStickers(["password-master","secret-keeper","phish-spotter"])` fires from a `DynamicLesson` effect on first mount of this screen (ids read from `def.stickers`; `stickersAwardedRef` guard). **Props:** `title/stickers/onComplete`. **BG:** `#050a1a→#1f1240`.
- `reaction[21]`: layla *excited* "Stickers earned - they're going to your Cyber HQ!"

### 22 · `completion` — badge bloom
- **Component:** inline `completion` case. Rotating laurels, badge bloom (🔐), "Week 1 complete" tag, "Password Protector" headline, **+XP** stat tile, CTAs **Cyber HQ** (`/cyberhq`) and **Next Week** (`/lesson/2`).
- **Audio:** `audio.signature("mission-complete")` + `"badge-bloom"`. Lesson `complete()` is fired when this screen is *reached* (in `navigate`), not on the CTA. **BG:** radial `#2a1a08→#1a1033→#04050d` + gold glow.
- `reaction[22]`: adam *thumbsup* "Password Protector badge earned!"

---

## 4. Boss battle (screen 19) — `app/components/game/BossBattle.tsx`

- **Overlay:** full-screen `z-index:80`, `bossName:"HACKER RACCOON"`, dynamic-imported (`ssr:false`).
- **Drive:** `phases={content.bossPhases}` (preferred). BossBattle flattens phases into a serial question list while tagging each with phase metadata. If `bossPhases` were empty it would fall back to the flat `bossQuestions` (easy/medium/hard, 15 Q).
- **5 acts (14 questions total):**
  1. **Strength** (cyan) — 3 Q ("Which is the STRONGEST?", min length, why mixed > plain).
  2. **Secrecy** (gold) — 2 Q (share with best friend?, "borrow yours for a day?").
  3. **Uniqueness** (blue) — 2 Q (same password everywhere = risky, Roblox hacked → change both).
  4. **Phishing** (red) — 3 Q (URGENT password message, 60-sec deletion popup, "free game money for your password").
  5. **Final Showdown** (red) — 4 Q (what is a password, sticky-note risk, what slows guessing, leaked password → change everywhere reused).
  - Each question `{question, answers[], correctIndex, explanation, key}` (keys like `boss-strength-1`, `boss-final-4`).
- **Per question:** `onQuestionAnswered` → `saveQuestion` with `questionKey = key@phaseId` (phase-attributable without a schema change); wrong → `reportWrong`.
- **On end:** `setBossDone(true)`, `setBossStats({combo,accuracy,xp})`, `saveBoss({won, accuracy, totalQuestions, correctCount, wrongCount, bestCombo, durationMs, badgeEarned:won, badgeId: won?"week-1":undefined})`, per-phase `boss_completed` analytics. **If won:** `awardXp(150)` + `correctAnswerBurst()` + `badgeEarnedCelebration()`.

---

## 5. Audio asset inventory

| Asset / source | Used for |
|---|---|
| `/videos/module-01-intro.mp4` | Screen 0 intro video |
| `/audio/voice/manifest.json` + MP3s | InfoNarration (ElevenLabs, adam/layla voices) — screens 2, 9, 11, 12, 20; TTS fallback |
| `/audio/voice/interjections/manifest.json` | "Will" voice micro-cues — **DISABLED** (`VOICE_INTERJECTIONS_ENABLED=false`) |
| `/audio/sfx-signature/manifest.json` | Signature cues: `mission-start`, `mission-complete`, `badge-bloom`, `vault-open`, `vault-reveal`, boss cues |
| `app/lib/sounds.ts` SFX names | `correct`, `wrong`(soft), `click`, `transition`, `select`, `back`, `hover`, `reveal`, `lock`, `xpGain`, `badgeEarned`, `levelUp`, `starEarned`, `streak3/5/7`, `bossRoar`, `bossDefeated`, `phaseChange`, `star`, `celebration` |
| BGM tracks | `bgmLesson` (all non-boss), `bgmBattle` (boss), `bgmVictory` |
| Intro cutscene slide `sound` cues | `lessonStart`, `bossRoar`, `select`, `confetti` (cutscene currently disabled — `cutsceneDone` defaults true) |

Generation scripts: `scripts/elevenlabs-generate-narration.mjs`, `…-generate-interjections.mjs`, `…-generate-sfx.mjs`.

---

## 6. API / server-action & data-model inventory

| Server action (`app/lib/lessonProgress.actions.ts` / `stickers.actions.ts`) | Trigger | Prisma model |
|---|---|---|
| `startOrResumeAttempt(weekNumber)` | mount | `LessonAttempt` (read/create) |
| `restartAttempt(weekNumber)` | Resume banner → Restart | `LessonAttempt` (new attemptNumber) |
| `saveScreenResult(...)` | forward nav | `ScreenResult` |
| `saveQuestionResponse(...)` | exercise `onAnswered` + boss | `QuestionResponse` |
| `saveBossResult(...)` | boss end | `BossResult` |
| `completeAttempt(...)` | reach screen 22 | `LessonAttempt.completedAt` |
| `awardStickers(ids)` | mount of screen 21 | `EarnedSticker` |

- **Gate (not an action):** `auth()` + `hasEntitlement(userId,"cyber-heroes")` in the server `page.tsx`.
- **XP/rank:** `addXP(amount,"week-1")` (`app/lib/progression.ts`, client/localStorage).
- **Analytics events** (`app/lib/analytics.ts`, Plausible): `lesson_started`, `screen_completed`, `wrong_answer`, `hint_used`, `boss_started`, `boss_completed` (+ per-phase), `exercise_quit`, `lesson_completed`.
- **No REST endpoint** is hit by the lesson itself — everything is Next server actions. (The onboarding `POST /api/child-profile` is a *different* flow.)

---

## 7. How to change things (edit map)

- **Curriculum/content/answers/hints/narration text/sequence:** edit `app/lesson/weekContent/week1.ts` only. Re-voice narration via `scripts/elevenlabs-generate-narration.mjs` + `/audio/voice/manifest.json`.
- **An exercise's mechanics/visuals:** edit its `app/components/exercises/*.tsx`. The 8 password-themed ones (`PasswordVault, PasswordHospital, WeakSorter, ThreeRandomWords, AccountRescue, PopupPanic, PhishInspector, PasswordLab`) are **Week-1 exclusive** — safe to rewrite. `CyberScanner, ProtectTheData, MemoryMatch, ChooseYourPath, CyberMaze, FirewallBuilder, SpamBlaster` and `BossBattle` are **shared with Weeks 2–6** — fork instead.
- **A brand-new screen type:** add a `ScreenDef` variant in `weekContent/types.ts`, the data in `week1.ts`, and an `import` + `case` in `DynamicLesson.tsx` (register in `EXERCISE_SCREEN_TYPES`).
- **Cross-cutting juice/audio/motion:** `ExerciseFrame`, `useExerciseFeedback`, `useGameAudio`, `useMotionIntensity`, `celebrations.ts` — additive-only; changes ripple to every week.

### Known fragilities to respect
1. `reactions` are keyed by **hardcoded numeric screen index (0–22)** — reorder screens and they silently misalign.
2. Adam/Layla reactions are **only rendered on the boss screen** despite being defined for all screens.
3. `questionKey` strings are an **analytics contract** (parent dashboard) — renaming breaks aggregation continuity.
4. `CyberScanner`/`ProtectTheData`/`WeakSorter` use **legacy juice** (`correctAnswerBurst`/raw audio) instead of `fx.*`.
5. `PasswordLab` content is **hardcoded** (not data-driven), unlike every other exercise.
6. Colours are **inline hex literals**, not tokens — a visual restyle is a wide find/replace.
