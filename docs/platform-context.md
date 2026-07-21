# AlgorithmX — Platform Context Brief for AI Coding Assistants

Paste this whole document into a fresh AI prompt to bring it up to speed
on this codebase. Maintained at `docs/platform-context.md`.

---

## 1. PRODUCT

**AlgorithmX — Cyber Heroes Academy.** A premium UK-based interactive
cybersecurity course for children aged 6-10. Animated lessons, mini
games, boss battles, milestone certificates. Solo developer (Asad
Jalal, asadjalal96@outlook.com) targeting end-of-August 2026 launch.
£99 one-time lifetime-access payment per child, billed via Stripe.

Domain: `algorithmx.io` (canonical; `www.algorithmx.co.uk` 301-redirects
to it). Hosted on Vercel. Database is Neon
Postgres (Azure Frankfurt). Support email
`support@algorithmx.co.uk`.

Other planned courses live as `cyberexplorers`, `cyberstart`,
`cyberstart-pro` placeholders in the route tree but Cyber Heroes is
the only active product right now.

---

## 2. TECH STACK

- **Framework**: Next.js 16.2.2 with Turbopack, React 19.2.4,
  TypeScript 5
- **Database**: Postgres via Neon, accessed through Prisma 7.7
  (pooled connection for serverless functions, direct for migrations)
- **Auth**: NextAuth v5 beta (`next-auth`), Credentials provider with
  bcryptjs-hashed passwords, JWT session strategy. Adapter:
  `@auth/prisma-adapter`.
- **Payments**: Stripe SDK v22 server-side + `@stripe/stripe-js`
  client. Inline `price_data` Checkout Session (no Stripe Product /
  Price objects yet).
- **Email**: Resend SDK. Verified sender `support@algorithmx.co.uk`.
- **Observability**: Sentry (`@sentry/nextjs`) wired via
  `instrumentation.ts` + the three `sentry.*.config.ts` files.
  Plausible Analytics via `<PlausibleScript />`.
- **Game engines / animation**: Phaser 4.0 (one POC scene built so
  far), Pixi.js 8 (boss-battle backdrop), Three.js (CyberGlobe,
  CyberPanelBackdrop, HeroAtlas etc), Framer Motion + GSAP for
  micro-animations, Howler for audio.
- **Lottie playback**: `@lottiefiles/dotlottie-react` and
  `@lottiefiles/react-lottie-player`. Most Lottie slots are placeholder
  `undefined` in `app/lib/lottie-manifest.ts`. The system falls back
  to canvas-confetti when no Lottie is configured.
- **3D and effects**: `@react-three/fiber`, `@react-three/drei`,
  `@react-three/postprocessing`, postprocessing, camera-controls,
  maath, `three-stdlib`, jspdf (for certificates).
- **Styling**: Tailwind v4 via `@tailwindcss/postcss`, inline styles
  for component-level visuals, tailwind-merge + clsx helpers.

---

## 3. ROUTES (App Router)

### Public marketing pages
- `/` — top-level landing with course catalog
- `/cyberheroes` — Cyber Heroes Academy product page (the primary
  conversion funnel). Cosmic backdrop, code-rain mesh, 3D R3F
  components, FAQ, £99 pricing card. Hero "Enrol Now" links to /signup.
- `/cyberexplorers`, `/cyberstart`, `/cyberstart-pro`,
  `/cyberheroes/week1` — coming-soon / sample-content placeholders
- `/welcome` — alternative welcome page
- `/login`, `/signup`, `/forgot-password`, `/reset-password`,
  `/password` — auth pages with cyber theme (Three.js globe / R3F
  HeroAtlas, glass inputs, particle fields). Currently the 3D globe
  may not render in prod due to a yet-undiagnosed runtime issue.
- `/privacy`, `/terms` — GDPR + acceptable use
- `/onboarding` — post-signup child-profile creation step

### Authed pages
- `/dashboard` — parent + child progress overview. Shows £99 upsell
  card when paywall is enforced AND user is unpaid.
- `/parent` — parent-dashboard view (week-by-week summaries, raccoon
  power meter, certificates).
- `/lesson` — Week 1 entry point. Bounces to dashboard if paywall is
  enforced and stripeStatus is not active/paid.
- `/lesson/[week]` — dynamic week route (Week 2+ when shipped)
- `/lesson/new` — alternative lesson entry (mirrors /lesson)
- `/lesson/week2` — explicit Week 2 player (work in progress)

### Dev / preview routes
- `/dev/preview` — exercise component preview
- `/dev/phaser` — A/B compare React vs Phaser MemoryMatch
- `/dev/rive-demo` — earlier Rive experiment (deprecated)
- `/test/bossbattle` — boss battle isolated test page

### API routes
- `POST /api/signup` — bcrypt-hashes password, inserts User row.
  Validates 8+ chars, capital letter, special character server-side
  AND client-side.
- `POST /api/forgot-password` — generates SHA-256 hashed token,
  stores in PasswordResetToken with expiry, emails the link via Resend.
- `POST /api/reset-password` — verifies token, bcrypt-rehashes new
  password, marks token as used.
- `POST /api/password` — change-password while signed in
- `GET/POST /api/child-profile` — child profile CRUD
- `POST /api/progress` — update lesson progress
- `POST /api/checkout` — Stripe Checkout Session creation. Returns
  the hosted-checkout URL. Has clear error reporting for
  STRIPE_SECRET_KEY missing / DB unreachable / Stripe SDK errors.
- `POST /api/stripe/webhook` — receives Stripe events, flips
  `user.stripeStatus` to `'active'`, sets `stripePaidAt`.
- `POST /api/waitlist` — captures email for unreleased courses
- `GET /api/certificate` — generates a printable PDF certificate for
  a completed week via jspdf
- `POST /api/test/seed` — dev-only test data seeder
- `app/api/auth/[...nextauth]/route.ts` — NextAuth v5 handler

---

## 4. DATABASE (prisma/schema.prisma)

All models persisted on Neon Postgres. Schema is under migration
control. Baseline migration at
`prisma/migrations/20260510000000_baseline/`. `npm run build` runs
`prisma migrate deploy` on every Vercel build.

```prisma
model User {
  id             String     @id @default(cuid())
  name           String?
  email          String     @unique
  hashedPassword String?
  role           String     @default("learner")
  stripeCustomerId String?  @unique
  stripeStatus     String?     // 'active' | 'paid' | null | other
  stripePaidAt     DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  progress       Progress[]
  children       ChildProfile[]
  passwordResetTokens PasswordResetToken[]
}

model ChildProfile {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(...)
  childName   String
  age         Int
  avatarColor String   @default("purple")
  createdAt   DateTime @default(now())
}

model Course {
  id, title, description, ageRange, duration, weeksCount,
  emoji, color, createdAt, modules: Module[]
}

model Module {
  id, courseId, weekNumber, title, description, order,
  createdAt, course: Course, progress: Progress[]
}

model Progress {
  id, userId, moduleId, status: NOT_STARTED|IN_PROGRESS|COMPLETED,
  completedAt, createdAt
  @@unique([userId, moduleId])
}

model PasswordResetToken {
  id, tokenHash (SHA-256, unique), userId, expiresAt, usedAt, createdAt
}

model WaitlistEntry {
  id, email, courseSlug, source, createdAt
  @@unique([email, courseSlug])
}
```

---

## 5. AUTH (app/lib/auth.ts)

NextAuth v5 with Credentials provider, JWT session strategy. Login
page calls `signIn("credentials", { email, password })`. Password
verification uses `bcryptjs.compare`. Session callback enriches the
JWT with `user.id` and `user.role`.

---

## 6. STRIPE (app/lib/stripe.ts, app/api/checkout, app/api/stripe/webhook)

- Server-side SDK singleton in `app/lib/stripe.ts`, pinned API
  version `2026-04-22.dahlia` (cast as `unknown as never` to bypass
  type lag).
- Pricing constant: `CYBER_HEROES_PRICE_GBP = 9900` (pence).
- Checkout session uses inline `price_data` (no Stripe Product /
  Price objects yet — add later when multiple SKUs land).
- Webhook listens for `checkout.session.completed` events, finds
  the user via `client_reference_id` or email match, sets
  `stripeStatus='active'` and `stripePaidAt`.
- `app/components/SubscribeButton.tsx` is the client component that
  POSTs `/api/checkout`, gets the URL back, redirects via
  `window.location.href`.

---

## 7. PAYWALL (app/lib/paywall.ts)

**Default: paywall is OFF.** Anyone signed in walks into lessons.
The gate only enforces when `PAYWALL_ENFORCED=true` is set as a
Vercel env var. Two exported helpers:

- `hasLessonAccess(user)` — returns true if either the env var
  is unset OR the user has `stripeStatus` of `active`/`paid`.
- `isPaywallEnforced()` — used by the dashboard to decide whether
  to show the £99 upsell card.

Four enforcement call sites all route through this helper:
- `app/lesson/page.tsx`
- `app/lesson/[week]/page.tsx`
- `app/lesson/new/page.tsx`
- `app/dashboard/page.tsx`

For launch: set `PAYWALL_ENFORCED=true` on Vercel (Production
scope), redeploy with cache UNTICKED.

---

## 8. SAVE SYSTEM (Console-style slot picker)

Files: `app/lib/saveSlots.ts`, `app/lib/slotStorage.ts`,
`app/lib/progression.ts`, `app/lib/activityLog.ts`,
`app/lib/inventory.ts`.

### Slots
Three save slots per browser. Each slot has avatar (adam | layla),
name, createdAt, lastPlayedAt, totalXP, weekUnlocked, totalStars,
playSeconds. Stored under `algorithmx-save-slots-v1` localStorage
key. Active slot id stored under `algorithmx-active-slot-v1`.

### Per-slot namespacing
Every lesson-runtime localStorage key is automatically suffixed
with `::slot-N` via the `slotKey()` helper. Covers:
- `algorithmx-progression-{slotId}` — XP / badges / weekProgress
  (managed by progression.ts)
- `algorithmx:lesson:week-N:state::{slotId}` — mid-lesson autosave
- `ax-inventory-v1::week-N::{slotId}` — earned inventory items
- `ax-w1-saved-password::{slotId}` — saved password from PasswordLab

Without slot namespacing, Adam's progress would bleed into Layla's.

### `deleteSlot()`
Wipes EVERY per-slot blob, not just progression. Otherwise deleting
Adam's slot leaves his coins / inventory / password under that slot
id, ready to bleed into the next player.

### Activity log (app/lib/activityLog.ts)
Append-only log of last 24 events ("Adam earned Phishing Hunter").
Drives the `RecentActivityMarquee` on the title screen.

### Progression (app/lib/progression.ts)
- `RANKS` array (Recruit → Cyber Hero) with min-XP thresholds
- `addXP(amount, source)` — adds XP, returns rank-up info, fires
  achievement toast + big-moment flash if level-up
- `earnBadge(badgeId)` — appends to badges array, fires badge toast
- `getRank(totalXP)` — current + next rank + progress %
- `getProgressionState()` / `getSlotProgressionState(slotId)` — read
  the active slot's or a specific slot's progression blob
- `WEEK_BADGES` — 20 canonical badge ids + names

### Inventory (app/lib/inventory.ts)
19 collectible items keyed by stable id. One per lesson screen in
Week 1. `loadEarnedItems(weekKey)` / `saveEarnedItems(...)` read +
write the slot-namespaced array.

---

## 9. LESSON PLAYER (app/lesson/LessonPlayer.tsx)

~5,000-line client component. The Week 1 lesson lives here. 17
"cases" (screens) numbered 0-17 plus prologue / mission brief /
victory / graduation / outro states. Mid-lesson autosave to
localStorage under the per-slot SAVE_KEY. Resume prompt offered on
remount if a save is detected.

### Navigation
`navigate(to: number)` — sets screen, plays transition SFX, fires
`fireSceneTitle(...)` for the curtain wipe, resets per-case
ephemeral state, optionally re-shows the case-intro overlay for cases
2-15.

### State variables (non-exhaustive)
- `screen` — current case (0..17)
- `coins`, `lessonXp` — running totals, surface in HUD
- `lessonCombo` — combo count, increments on awardXp, resets on wrong
  answer
- per-quiz: `q1Idx/q1Score, q2Idx/q2Score, q3Idx/q3Score, swipeScore,
  phishScore, wydScore, bossScore`
- `bossDone, achievePhase, revealedRules, answeredRules, ruleAnswers,
  lockedItems` — case-specific state
- `wrongAttempts: Record<number, number>` — per-case wrong-answer
  counts for star calculation

### Key handlers
- `awardXp(amount, source, element?)` — adds XP, spawns floating text
  + particle burst, fires combo escalations (3x/5x/7x), triggers
  level-up celebration
- `addWrong(scr)` — bumps wrongAttempts, flashes wrong reaction,
  resets `lessonCombo`, triggers shake
- `addCoins(n)` — pulses the coin counter in the HUD
- `getStars(scr)` — 0 wrong → 3, ≤2 → 2, more → 1

### Cases imported from `app/lesson/cases/`
- `FullScene.tsx` — shared scene wrapper
- `Case16Victory.tsx` — post-boss celebration
- `Case17Graduation.tsx` — graduation + star tier
- `Case18Outro.tsx` — final outro

### Mid-lesson save (`SavedLessonState`)
Persists screen, coins, lessonXp, every quiz score, bossDone,
achievePhase, revealedRules / answeredRules / ruleAnswers,
lockedItems. Wiped on reaching case 17+. `resumeFromSaved()`
restores all fields AND explicitly resets ephemeral state
(`lessonCombo`, `wrongAttempts`, `shakeTrigger`).

---

## 10. EXERCISE COMPONENTS (app/components/exercises/)

Each is its own client component, mounted from LessonPlayer when its
case is active. Roughly 12 exercise types:

- `PasswordLab` — drag-and-drop cauldron, sandbox builder. Phase B
  saves a password that surfaces in CrackTheCode + boss battle.
- `CrackTheCode` — combination-dial puzzle. Phase B is "defend the
  password" reflex round.
- `ProtectTheData` — shield drag-to-block scenario.
- `CyberScanner` — STRONG / WEAK password quick-fire.
- `CyberMaze` — arrow-key maze with cybersecurity questions at
  decision points.
- `ConveyorBelt` — sort items into private / public bins.
- `FirewallBuilder` — Tetris-style brick-stacking.
- `MemoryMatch` — flip-card pair matching. Has Phase A (match pairs)
  + Phase B (rebuild from memory).
- `ChooseYourPath` — choose-your-own-adventure branching.
- `BattleArena` — boss battle (Case 15). 750 lines, uses Pixi
  particles + Three backdrops. Currently being redesigned to warm
  Pixar palette via a remote-agent PR on branch
  `pixar/boss-battle-redesign`.
- `SpamBlaster` — swipe / tap to delete spam emails.
- `SortingStation` — generic sorting drill.
- `InboxSimulator` — fake-email inspection.
- `PhaserExercise.tsx` + `PhaserMemoryMatch.ts` +
  `MemoryMatchPhaser.tsx` — proof-of-concept Phaser 4 reimplementation
  of MemoryMatch. Mounted on `/dev/phaser` for A/B testing.

All exercise components implement the same callback contract:
`onComplete(stars)`, `onCorrect()`, `onWrong()`.

---

## 11. GAME SHELL (12+ commits worth)

A "feels like a proper PC game" layer wraps the lesson player. All
components are mounted in `app/lesson/LessonGate.tsx`.

### Title screen entry
- `app/components/TitleScreen.tsx` — full-screen title with phases:
  - `boot` — animated AlgorithmX logo with mouse-parallax tilt,
    "PRESS ANY KEY"
  - `slots` — 3 save-slot cards with avatar portraits, rank chip,
    week-progress bar, per-week stars grid (20 dots), "Quick Resume"
    CTA for slots played in last 14 days, recent-activity marquee at
    top
  - `newGame` — name + avatar (adam | layla) picker
  - `intro` — plays `BootIntro` cinematic
- `app/components/BootIntro.tsx` — 2.6s cinematic for new slots:
  rule sweeps, AX glyph fades up, "WELCOME" stamp lands, "AGENT
  {name}" types out, fade to lesson.

### In-lesson overlays (all mounted by LessonGate)
- `GameMenuOverlay.tsx` — ESC-triggered pause menu. Resume /
  Trophies / Settings / Main Menu. Settings: Music/SFX/Voice volume
  sliders driving `SoundManager` buses, mute toggle, fullscreen
  toggle, reduce-motion toggle.
- `TrophiesGallery.tsx` — 20-badge collection grid. Earned ones gold
  with shimmer, locked ones dim with 🔒.
- `OnboardingOverlay.tsx` — 4-step "how to play" carousel on first
  slot creation. Marks `algorithmx-onboarded-v1` to skip subsequent.
- `AchievementToastHost` (`AchievementToast.tsx`) — Steam-style
  slide-in notifications. `fireAchievement({...})` global API.
  Auto-fires on `earnBadge` and `addXP` rank-up.
- `SceneTitleHost` (`SceneTitleCard.tsx`) — case-transition curtain.
  Full-screen opaque overlay with kicker ("CASE 7") + title
  ("MEMORY MATCH") + rotating gameplay tip. Driven by
  `fireSceneTitle()` called from `navigate()`.
- `StreakIndicator.tsx` — flame-style chip top-right that listens
  to `algorithmx:answer-correct` / `:answer-wrong` events.
  Tiers cyan → cosmic → pink → gold.
- `BigMomentFlash.tsx` — subtle radial colour flash on screen edges
  for rank-ups + badge earns. mix-blend: screen.
- `AutosaveIndicator.tsx` — "AUTOSAVED" pill bottom-left for ~1.6s
  after every `progression.ts` save (dispatches
  `algorithmx:autosave` event).
- `FullscreenManager.tsx` — F-key shortcut + Settings toggle hooks
  into the Fullscreen API.
- `IdleWorldLayer.tsx` — fixed canvas behind everything, ~38
  drifting cyber particles (cyan/violet/pink, additive). Pauses on
  `visibilitychange` to save battery.
- `LessonHUD.tsx` — top-bar with overlapping Adam + Layla avatars,
  rank progress bar, week / case chip, +XP counter (animated via
  `AnimatedCounter.tsx`), mute button.
- `RecentActivityMarquee.tsx` — title-screen scrolling band of recent
  achievements.
- `GlobalGameStyles.tsx` — global stylesheet injection: focus-visible
  rings, hover lift on `[data-ax-juice]` buttons, reduce-motion kill
  switch, selection colour.

### Animated counter primitive
`AnimatedCounter.tsx` — eased lerp from previous value to new value
over 600ms. Used in HUD XP display. Honours reduce-motion.

### Case titles (app/lib/caseTitles.ts)
Single source of truth for the 18 case labels and titles. Consumed
by both `SceneTitleCard` and `LessonHUD`.

---

## 12. AUDIO (app/lib/sounds.ts)

`SoundManager` singleton using Howler.js.

### Three buses
- **sfx** — UI sounds, feedback, exercise SFX (~40 keys mapped to
  files under `/public/audio/sfx/`)
- **music** — background loops (`bgmLesson`, `bgmBattle`,
  `bgmVictory`) cross-faded at low volume (0.04 max)
- **voice** — voice-over playback. SFX duck to 30% while voice plays.

### Volume persistence
User-set volumes are persisted via `setVolume(category, vol)` from
`GameMenuOverlay` to localStorage `algorithmx-volume-prefs-v1`.

### Categories
- `playSound(key)` — fire-and-forget SFX
- `playBGM(trackOrKey)` — start background music with cross-fade
- `stopBGM(fadeOut?)` — fade out current music
- `playVoice(path)` — play voice-over, auto-ducks music

---

## 13. CELEBRATIONS (app/lib/celebrations.ts)

- `hitStop(target?)` — 80ms scale + brightness pulse for visceral
  feedback on every correct answer
- `correctAnswerBurst(streak, target?)` — particle burst scaled to
  streak (25 → 120 particles), with secondary waves at streak 5+
  and 10+. Dispatches `algorithmx:answer-correct` event.
- `wrongAnswerShake()` — body-level shake, 250ms cubic-bezier,
  dispatches `algorithmx:answer-wrong`
- `badgeEarnedCelebration()` — sustained confetti for big moments
- `bossDefeatedExplosion()` — boss-only celebration
- `starBurst(x, y)`, `milestoneFireworks()` — additional flavours
- Falls back to canvas-confetti when no Lottie is configured.

---

## 14. MARKETING + AUTH PAGES (CYBER PALETTE)

Brand palette is cyber-dusk:
- Cyan `#00e5ff`, cyan-soft `#7df0ff`
- Cosmic violet `#7c5cff`, blue `#3a7bff`
- Neon pink `#ff5fb3`, coral `#ff7a59`
- Gold `#ffd158`, lime `#7eff97`
- Background near-black `#04050d`, panel `#0f1530`

Cyberheroes page uses `ParticleNetworkScene`, `CyberPanelBackdrop`,
`HeroAtlas`, `CyberGlobe` for 3D. Login + Signup pages have
`CyberGlobe` (R3F wireframe sphere with orbital rings + 80 floating
points), `CyberFloatingIcons`, glass inputs.

Privacy + Terms pages list the company contact as
`support@algorithmx.co.uk`. All purchases are final — no refund
policy is offered.

---

## 15. GLOBAL STATE PATTERNS

Most game-shell components communicate via `CustomEvent` dispatched
on `window`:

| Event name | Fired by | Listened to by |
|---|---|---|
| `algorithmx:autosave` | progression.ts saveProgression | AutosaveIndicator, TrophiesGallery |
| `algorithmx:answer-correct` | correctAnswerBurst | StreakIndicator |
| `algorithmx:answer-wrong` | wrongAnswerShake, dispatchWrongAnswer | StreakIndicator |
| `algorithmx:big-moment` | progression.ts on rank-up + badge earn | BigMomentFlash |
| `algorithmx:activity` | activityLog.appendActivity | RecentActivityMarquee |
| `algorithmx:scene-title` (via `__axSceneTitle__`) | LessonPlayer navigate | SceneTitleHost |
| `algorithmx:achievement` (via `__axAchievement__`) | progression.ts addXP / earnBadge | AchievementToastHost |

Achievement toasts and scene-title cards use direct `window.__axFn__`
function references rather than events because they need a value
returned synchronously.

---

## 16. DEPLOY PIPELINE

### Vercel
- Project name: `algorithmx`. Hobby tier.
- Auto-deploys on every push to `main`.
- Env vars needed:
  - `DATABASE_URL` — pooled Neon URL (Production + Preview)
    with `-pooler` in hostname. **Sensitive**.
  - `AUTH_SECRET` — NextAuth secret (Production + Preview)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` —
    only required when paywall is enforced
  - `RESEND_API_KEY` — only required for sending real emails
    (dev falls back to console.log)
  - `SENTRY_*` — Sentry config (optional)
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — analytics (optional)
  - `PAYWALL_ENFORCED=true` — set to enable Stripe gate for launch

### Build script (package.json)
`"build": "prisma migrate deploy && prisma generate && next build"`

### CI
- `.github/workflows/ci.yml` — typecheck + unit tests on PR
- `.github/workflows/post-deploy-smoke.yml` — fires on every push to
  main, waits 4 min, POSTs `/api/signup` to prod. Goes red on the
  commit if signup returns 5xx.

### Migrations
- Baseline migration at `prisma/migrations/20260510000000_baseline/`
  was applied to prod via `prisma migrate resolve --applied`
  (one-time bootstrap).
- Future schema changes: `npx prisma migrate dev --name short_description`
  locally, commit the new migration folder, push. Vercel auto-applies.

---

## 17. CURRENT STATE (as of 2026-05-16)

### Working in production
- Signup + login + reset password
- Title screen + slot system
- Pause menu + settings + trophies
- Achievement toasts + big-moment flash + streak chip
- Scene-title curtain wipe between cases
- Animated XP counter + autosave indicator + idle particles
- Fullscreen toggle + reduce-motion accessibility
- Onboarding overlay + boot intro
- Recent-activity marquee + per-week stars grid
- Week 1 lesson (~17 cases, ~5000-line LessonPlayer)
- Schema migrations + post-deploy smoke test
- Paywall toggle (default off, set `PAYWALL_ENFORCED=true` to enable)
- Stripe checkout endpoint (error handling improved, actual flow
  untested on prod beyond a "couldn't reach DB" earlier — now needs
  STRIPE_SECRET_KEY confirmed set on Vercel)

### Outstanding / known issues
- 3D `CyberGlobe` may not render on prod login/signup (runtime issue,
  not code) — needs browser-console diagnosis
- Week 2 player exists but is incomplete
- Boss battle Pixar redesign is on a feature branch
  (`pixar/boss-battle-redesign`) waiting for a PR to be opened on
  GitHub — the remote agent pushed the branch but couldn't open the PR
- Lottie character animations are placeholder `undefined` slots
- SFX library is good but no variant rotation (every click sounds the
  same)
- Em-dashes have been stripped repo-wide (1,526 occurrences replaced
  with hyphens) — keep new code free of them

---

## 18. WHERE TO START FOR COMMON TASKS

| Task | File(s) |
|---|---|
| Add a new exercise | `app/components/exercises/Foo.tsx` + import in `LessonPlayer.tsx` + add to `navigate()` switch + add to `caseTitles.ts` |
| Add a new lesson screen | Edit `LessonPlayer.tsx` (find the screen JSX, mirror existing case structure) + `caseTitles.ts` + `inventory.ts` |
| Change badge name | `app/lib/progression.ts` `WEEK_BADGES` array |
| Add a new sound | Drop file in `public/audio/sfx/foo.mp3` + add key to `SFX_REGISTRY` in `app/lib/sounds.ts` |
| Add a new toast trigger | Import `fireAchievement` from `app/components/AchievementToast.tsx` + call it |
| Schema change | Edit `prisma/schema.prisma` → `npx prisma migrate dev --name short_description` → commit |
| Toggle paywall | Set `PAYWALL_ENFORCED=true` (on) or unset (off) in Vercel env vars |
| Update support email | `app/lib/resend.ts` (FROM_ADDRESS), `app/cyberheroes/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/api/checkout/route.ts` (custom_text) |

---

## 19. CONVENTIONS

- **No em-dashes anywhere.** Use periods, commas, parens, or hyphens.
- **Avoid new dependencies** unless asked — the stack is heavy already.
- **Default to no comments** in new code. Only annotate WHY for
  non-obvious decisions. Existing comments lean toward "why this
  happens" rather than "what this does".
- **localStorage keys for player data** must go through `slotKey()` in
  `app/lib/slotStorage.ts` so multi-slot isolation holds.
- **Match the existing palette** — don't introduce new colours without
  a reason. Hex codes in section 14.
- **CustomEvents over global state** for cross-component signals
  inside the game shell. Pattern shown in section 15.
- **Server components for auth gates, client components for
  interactive UI.** Mixing inside a single route is the norm
  (`app/lesson/page.tsx` is server, `LessonGate.tsx` underneath is
  client).
- **No new files unless necessary.** Prefer editing existing
  components.

---

End of brief. Reload this file from `docs/platform-context.md` if it
needs updating.
