# Implementation Architecture

Stack: Next.js 16 (App Router), React 19, TypeScript, Prisma, NextAuth, Phaser lesson games embedded in the React shell, Vercel. This file defines the *shape* of the system; adapt names to the existing codebase rather than duplicating models that already exist.

Design commitments this architecture enforces:
- **Server-authoritative**: clients claim *events*; the server computes *awards*. No client ever posts an XP amount.
- **One transaction per event**: XP, streak, badge, card, and level effects of an event commit together or not at all — no half-awarded state.
- **Idempotent by construction**: replaying the same event claim can never double-award. (Kids double-click. Networks retry. The Raccoon replays requests.)
- **One RULES table**: every award value lives in a single typed map. Magic numbers in route handlers are the canonical anti-pattern here.
- **Append-only ledger**: XP is a sum over ledger rows, so every balance is explainable and auditable — useful for parent queries and for debugging "where did my points go" (answer: nowhere, they can't go anywhere).

---

## Prisma schema (core models)

```prisma
model GameEvent {
  id         String   @id @default(cuid())
  userId     String
  eventType  String   // EventType enum in TS
  sourceId   String   // e.g. "w03:cycle2:prove" | "w03:boss:p4" | "w03:boss"
  tier       String   // "cubs" | "operatives"
  outcome    Json?    // minimal: { correct: true, firstTry: true } — data-minimised
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])

  @@unique([userId, eventType, sourceId])  // idempotency backstop at the DB
  @@index([userId, createdAt])
}

model XpLedger {
  id        String   @id @default(cuid())
  userId    String
  amount    Int      // > 0 always; there is no negative-amount code path
  ruleKey   String   // which RULES entry produced this
  eventId   String   @unique  // one ledger row per event
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeKey  String   // "phase:cadet" | "week:03:case-closed" | "behaviour:sharp-eyes"
  awardedAt DateTime @default(now())

  @@unique([userId, badgeKey])
}

model UserCard {
  id        String   @id @default(cuid())
  userId    String
  cardKey   String   // "capture:w03" — deterministic per week
  awardedAt DateTime @default(now())

  @@unique([userId, cardKey])
}

model StreakState {
  userId        String   @id
  currentWeeks  Int      @default(0)
  shields       Int      @default(0)
  lastWeekKey   String?  // ISO week key of last credited week, e.g. "2026-W28"
  pausedAt      DateTime? // set when a week is missed with no shield; never zeroed
  updatedAt     DateTime @updatedAt
}
```

Level is **not stored** — it derives from the ledger sum via a pure function (below). Cosmetic unlocks derive from level. Denormalise a cached `totalXp` on `User` only if profiling shows the sum is hot; if you do, the ledger remains the source of truth.

---

## The RULES table (single source of award values)

```ts
// lib/gamification/rules.ts
export const RULES = {
  "learn.completed":        { xp: 5 },
  "game.completed":         { xp: 10 },
  "game.mastery":           { xp: 5 },                    // bonus, same sourceId as game.completed + suffix
  "prove.correct.first":    { xp: 15 },
  "prove.correct.retry":    { xp: 10 },
  "consolidation.completed":{ xp: 20 },
  "boss.phase.cleared":     { xp: 15 },
  "boss.defeated":          { xp: 25, card: true, weekBadge: true, streakCredit: true },
  "session.replay.factor":  0.2,                          // replays pay 20%, no cards/badges/streaks
} as const;
export type RuleKey = keyof typeof RULES;
```

Level curve (pure, tested in isolation):

```ts
// Level 2 at 100 XP; each level costs 50 more than the last (100, 150, 200, ...).
// Cumulative XP to *reach* level n (n >= 2): 25 * (n - 1) * (n + 2)
export function levelForXp(totalXp: number): number {
  // solve 25 * (n - 1) * (n + 2) <= totalXp for the largest n
  const n = Math.floor((-1 + Math.sqrt(9 + totalXp / 6.25)) / 2);
  return Math.max(1, n);
}
export function xpForNextLevel(totalXp: number): { next: number; needed: number } {
  const next = levelForXp(totalXp) + 1;
  return { next, needed: 25 * (next - 1) * (next + 2) - totalXp };
}
```

(Sanity anchors: 100 XP → exactly L2; L15 opens at 5,950 and L16 at 6,750, so a ~6,000 XP 20-week run graduates at **Level 15**. If the curriculum length changes — see the DECIDE in SKILL.md — retune the ~300 XP/week target first, the curve second.)

---

## The award service (one transaction, one entry point)

```ts
// lib/gamification/award.ts — the ONLY writer of XpLedger/UserBadge/UserCard/StreakState
export async function processGameEvent(claim: GameEventClaim): Promise<CelebrationPayload> {
  const parsed = GameEventClaimSchema.parse(claim);        // zod; reject unknown eventTypes
  return prisma.$transaction(async (tx) => {
    // 1. Insert the event. The @@unique constraint is the idempotency gate:
    //    on P2002 (duplicate), fetch the original result and return it — no re-award.
    // 2. Look up RULES[ruleKeyFor(parsed)] — server derives the rule key; the client
    //    never names a rule, only what happened (eventType + sourceId + outcome).
    // 3. Validate the claim against curriculum structure: does week 3 have a cycle 2?
    //    Is this user enrolled and on/past this week? Reject impossible claims (see anti-tamper).
    // 4. Append XpLedger row (replay? multiply by replay factor, skip side effects).
    // 5. Side effects, same tx: boss.defeated → UserCard + week badge + streak credit;
    //    completed phase check → phase badge; level boundary check → levelUp flag.
    // 6. Build and return the CelebrationPayload.
  });
}
```

Streak credit logic (inside the tx): compute the ISO week key from server time; if `lastWeekKey` is the previous week → `currentWeeks++`; same week → no-op; a gap → consume a shield if available (streak holds, note `shieldUsed`), else set `pausedAt` (display keeps the count, shows the repair quest). Every 4th consecutive week adds a shield. **No code path sets `currentWeeks` to zero.** Inject a clock (`() => Date`) so week-boundary tests don't depend on wall time.

### CelebrationPayload (server decides the party)

```ts
type CelebrationPayload = {
  xpAwarded: number;
  totalXp: number;
  level: number;
  levelUp: boolean;
  badgesAwarded: string[];        // badge keys
  cardAwarded?: string;           // card key
  streak: { weeks: number; shields: number; shieldUsed: boolean; paused: boolean };
  celebrationVariant: string;     // rotated server-side per user (see below)
  copy: { headline: string; body: string };  // tier-appropriate, pre-written pool
};
```

`celebrationVariant` implements the LOCKED "win moments must vary" bar **deterministically**: rotate through the variant pool per user (`variantPool[winCount % poolLength]`), so variety is guaranteed and no reward value is ever randomised (child-safety). The React shell maps the variant to animation + sound + character bit; honour `prefers-reduced-motion` with the calm variant set.

---

## API contract

```
POST /api/game-events        — body: GameEventClaim; auth: NextAuth session (child account)
                                returns: CelebrationPayload
GET  /api/progress           — ledger-derived summary for the child UI (level, badges, cards, streak)
GET  /api/parent/digest      — parent-scoped weekly summary (feeds the email digest)
```

- Zod-validate everything; unknown `eventType` → 400, never a default award.
- Rate-limit per user (a child legitimately generates ~20–30 events per session; hundreds per minute is a script).
- NextAuth: the session's userId is authoritative — never accept a userId in the body.

**Anti-tamper stance:** impossible or forged claims (future weeks, nonexistent beats, replay floods) return 200-shaped friendly denial for the child UI — headline: *"Nice try — the Raccoon tried that too. Real heroes earn it."* — while logging the attempt server-side. Curious kids poking DevTools is a teaching moment, not an incident; actual abuse patterns are visible in the logs. Never leak validation internals in the response.

---

## Phaser → React → server bridge

Phaser scenes must not call the API directly (keeps games portable and the award path single).

```ts
// In the Phaser scene, on beat completion:
this.game.events.emit("ch:beat-complete", {
  eventType: "prove.correct", sourceId: "w03:cycle2:prove", outcome: { firstTry: true },
});

// In the React shell that mounts the game:
useEffect(() => {
  const game = gameRef.current;
  const handler = (claim: BeatClaim) => submitGameEvent(claim)   // POST /api/game-events
    .then(showCelebration);                                      // render payload variant
  game.events.on("ch:beat-complete", handler);
  return () => game.events.off("ch:beat-complete", handler);
}, []);
```

Mid-cycle beats render *inline* micro-celebrations (XP tick, sound blip — no modals, keep flow); `boss.defeated` triggers the full-screen ceremony, then the full-stop screen. The shell, not the scene, owns celebration UI, so all games share one crafted celebration system.

---

## Test checklist (write these before shipping any new event type)

Table-driven over event types where possible; these edges are where gamification systems actually break:

1. **Duplicate claim** → one ledger row, one card, one badge; second call returns the original payload.
2. **Transactional integrity** → force the streak write to fail; assert the XP row rolled back (no half-award).
3. **Level boundary** → XP crossing 25·(n−1)·(n+2) sets `levelUp: true` exactly once, in the same call.
4. **Streak edges** (injected clock) → same-week repeat no-ops; next-week increments; gap+shield holds and decrements; gap+no-shield pauses without zeroing; 4th week grants a shield; repair quest completion resumes.
5. **Replay policy** → replayed session pays 20% XP, awards no cards/badges/streak credit.
6. **Already-unlocked badge** → re-qualifying is a silent no-op (no duplicate ceremony).
7. **Forged claims** → future week, unknown beat, wrong tier: friendly denial payload, event logged, nothing awarded.
8. **Phase badge** → awarded exactly when the 5th `boss.defeated` of the phase commits, in the same transaction.
9. **Rules coverage** → a test asserting every `EventType` has a RULES entry (exhaustive TS check makes a missing one a compile error; keep the runtime test anyway for JSON-configured deployments).
10. **levelForXp** property test → monotonic, L1 at 0, L2 at exactly 100, inverse consistent with `xpForNextLevel`.

Reference implementations worth reading before big changes: `franverona/questlog` (TypeScript rule engine with tested streak/duplicate/unlock edges) for rule-engine shape, and the Phaser 4 official agent skills for game-side patterns. Port patterns, not dependencies.
