# Cyber Explorers — Mission Template v1

> **SUPERSEDED ON STRUCTURE (2026-08-24):** how a case is shaped is now locked in **`case-framework-locked.md`** (Case 001 = reference: 7-skill LEARN→PRACTICE, bigger boss field mission, blind must-pass test, narration locks). This doc's platform/engine/reward/art canon still holds; where the two disagree on case shape, the locked framework wins.

**Status:** Working canon for the Mission 01 vertical slice; locks on Asad's sign-off together with the art direction. Companion to `algorithmx-explorers-art-direction.md` (same directory — visual/motion/audio/tone canon) and the gamification skill references (reward economy + child safety, binding).

**Markers:** `LOCKED` = platform canon or signed design-session decision. `DEFAULT` = this template's recommended value; change here, in one place only. `DECIDE` = open, recommendation attached.

The engine principle this template exists to serve: **missions are content; structure lives in the engine.** A mission ships as a typed manifest plus (only) a bespoke Incident component. If a mission needs bespoke code anywhere else, that is a template bug — fix the template.

---

## 1. The six beats (LOCKED sequence)

| # | Beat | Surface (art §10) | Duration | Reward attach | Resume grain |
|---|---|---|---|---|---|
| 1 | **Incoming transmission** | Full-bleed, interference resolve-in | ≤40s | none | beat |
| 2 | **Briefing** | Mission-control panel, WREN chip, ≤3 pinned objectives | 1–2 min | none | beat |
| 3 | **Investigation cycles ×3** | Intel → Fieldwork → Checkpoint (see §2) | 3 × 8–12 min | per sub-beat (§6) | sub-beat + mechanic state |
| 4 | **The Incident** | Full-bleed takeover; the boss | 6–10 min | per phase | phase |
| 5 | **Debrief** | Paper after-action report | 1–2 min | none | beat |
| 6 | **Case closed** | Dossier + stamp ceremony + clearance tick | 1 min | case-close bonus | terminal |

Rules that ride the sequence:

- **The serial arc appears only in beats 1 and 5** (transmission and debrief) — mission bodies stay modular (art §1.1).
- **Beat 6 ends in a full stop** (LOCKED, ICO): no autoplay, no "next mission" CTA on the terminal screen. The archive and dashboard are where the child chooses to continue, on their own initiative.
- **Transmission replay-skip (DEFAULT):** first viewing is unskippable-by-design at ≤40s; on a resumed or replayed mission a quiet `SKIP ▸` appears after 3s. Never gate skipping behind anything.
- **Debrief transfer beat (LOCKED):** every debrief ends with **"Your move in the real world"** — one concrete, US-localized action the child can take this week. A mission without it fails review.

## 2. The investigation cycle

Each of the three cycles = **Intel → Fieldwork → Checkpoint**, one concept per cycle, ramping difficulty across cycles (recognize → apply → integrate).

- **Intel** (active learn, 60–120s): 2–4 short beats of terminal-glass exposition **plus a mandatory prediction interaction** — Learn beats are active, never watch-only (platform canon). The prediction feeds forward into Fieldwork ("you said X — check it").
- **Fieldwork** (the verb, 3–6 min): one mechanic from §3 with a content payload. This is where the child does the job.
- **Checkpoint** (prove, 1–2 min): 2–3 **application-grade** questions (scenario, not recall), terminal-glass form, stamp treatment on pass. Retry allowed; retried passes pay reduced XP and never block progress. Checkpoint outcomes are recorded as **evidence artifacts** (§7).

**No-verb-repeats rule (LOCKED, carried from Heroes):** the three Fieldwork verbs and the Incident's dominant verb are all distinct within a mission. Sanity clause carries too: if a mission genuinely needs a repeat, flag it in review rather than contorting the design.

## 3. The mechanic library (the verbs)

Every mechanic implements one contract (§4) and owns its own two-channel feedback and intensity-0 behavior internally, so accessibility is inherited, never re-implemented.

| Verb | The job | Age fit (10–13) | Status |
|---|---|---|---|
| **INSPECT** | Examine an artifact (email, URL, chat log, permission dialog); flag what doesn't belong | Anomaly detection — the tier's core skill | **built** (M01) |
| **DECIDE** | Incident-response call with visible consequences; branch, then learn why | Consequential reasoning, newly available at this age | **built** (M01) |
| **PROFILE** | Build the actor's M.O. from case evidence; separate matching from non-matching behavior | Inference about intent — abstract reasoning | **built** (M01) |
| **TRACE** | Evidence board: connect items across sources until the trail resolves | Multi-source synthesis | planned (Block 1) |
| **BUILD** | Configure a real defense (2FA, privacy settings, recovery) and see it hold | Constructive mastery | planned (Block 3) |
| **CIPHER** | Encode/decode; keys and secrets made tactile | Systems thinking | planned (Block 3) |
| **SIMULATE** | Predict the attacker's next move; counter it. **Hard line (LOCKED): the child never authors an attack artifact.** | Hypothetical/adversarial reasoning — the tier's crown jewel | planned (Block 2+, post ARC-Code beat) |

Incidents may **compose** these skills into new one-off surfaces (that's what makes them bosses), but a bespoke incident mechanic never graduates into the library without a template update.

## 4. Contracts (the shapes the engine holds everyone to)

Definitive TypeScript lives in `app/explorers/engine/types.ts`; the doc shape is:

```ts
MissionManifest {
  id, caseNumber, title, block: 1|2|3|4,
  classification: "CONFIDENTIAL" | "SECRET" | "TOP SECRET" | "ULTRA",
  actor: { codename, mo, interferenceFlavor },
  transmission: { headline, lines[] },
  briefing: { summary, objectives: [string ×3], wrenLine },
  cycles: [CycleDef ×3],          // intel{beats[], prediction} · fieldwork{verb, payload} · checkpoint{questions[]}
  incident: { title, phases, component },   // the one bespoke seam
  debrief: { report[], realWorldMove, wrenLine },
  dossier: { mo, defeatedBy, breadcrumb? },  // breadcrumb = season-arc seed
}

MechanicProps<Payload> {
  payload: Payload,
  reduced: boolean,               // OS reduced-motion, resolved by the runtime
  audio: SignalAudio,             // the shared restrained-mechanical family
  onEvent(e: MechanicEvent): void // HIT | MISS | COMPLETED{mastery}
}
```

Mechanics are pure content-renderers: no XP math, no persistence, no navigation. The runtime owns all three.

## 5. Save/resume (the checkpoint payload)

Resume target: **any sub-beat**, with mechanic state intact.

```ts
MissionCheckpoint {
  missionId, beat,                 // "transmission" | "briefing" | "cycle" | "incident" | "debrief" | "closed"
  cycleIndex?, cycleStage?,        // 0–2 · "intel" | "fieldwork" | "checkpoint"
  incidentPhase?,
  mechanicState?: Json,            // opaque, owned by the active mechanic
  events: AwardEvent[],            // the idempotent claim ledger so far
}
```

- **Vertical slice (current):** persisted to `localStorage`, keyed per mission. The seam is already the payload above so the server swap is a transport change, not a redesign.
- **Server (before Mission 02 ships — DEFAULT):** add `Progress.checkpoint Json?`; the existing `screen Int` stays as the coarse index for dashboard display. Max-merge semantics do NOT apply to the checkpoint blob (it's a cursor, not a reward) — last-write-wins per child+mission.

## 6. Award events and RULES (server-authoritative; slice runs the same table client-side behind a stub seam)

All values **DEFAULT**, single source: `XP_RULES` in `engine/types.ts` — a number appearing anywhere else is a bug (platform canon). Design target ≈ **300 XP/mission**, matching the Heroes weekly target so the level curve and Field Rating stay tier-comparable.

| Event | XP | × per mission | Subtotal |
|---|---|---|---|
| `INTEL_COMPLETED` | 10 | 3 | 30 |
| `FIELDWORK_COMPLETED` | 20 | 3 | 60 |
| `FIELDWORK_MASTERY` (first-try, no-miss — quiet bonus) | 5 | ≤3 | ≤15 |
| `CHECKPOINT_PASSED` | 25 | 3 | 75 |
| `INCIDENT_PHASE_CLEARED` | 20 | 3 (band 2–4) | 60 |
| `CASE_CLOSED` | 50 | 1 | 50 |
| **Mission total** | | | **≈ 275–290** |

Carried rules (LOCKED, platform canon): first completion pays full, replays 20%, replays never re-trigger clearances/dossiers/streaks; XP never subtracts; no XP for time-on-app or attendance; events are idempotent by `(childId, missionId, eventType, sourceKey)`. The slice logs claims to the dev ledger; the server route + tests land with the checkpoint column (§5) **before Mission 02** — Explorers never inherits the Heroes magic-number debt.

## 7. Evidence artifacts (accreditation seam)

Every `CHECKPOINT_PASSED` and `INCIDENT_PHASE_CLEARED` carries an evidence record: question/task id, the child's answer/action, attempt count, timestamp. Slice: retained inside the event objects. Server: persisted with the claim, exportable per child per block — the CyberFirst/ASDAN/school-licensing documentation play. Data-minimal by canon: outcomes only, no behavioral telemetry, no timing analytics.

## 8. Mission acceptance checklist (extends art §12's eight points)

9. Verbs distinct across cycles + incident (or a flagged sanity-clause exception).
10. Intel beats each contain a real prediction interaction.
11. Checkpoint questions are application-grade (a scenario the child acts on, not "what did we just say").
12. Debrief ends with a concrete, US-localized "your move in the real world".
13. Dossier back teaches trick + defense in ≤60 words (it's the spaced-revision surface).
14. All XP flows through `XP_RULES` events; no inline numbers.
15. Full stop verified: terminal screen offers no continuation CTA.
16. Season-arc content appears only in transmission/debrief/dossier-breadcrumb.

## 9. Open DECIDEs

1. **Incident phase band** — spec says 3; allow 2–4 per mission for variety. *Recommend: band 2–4, 3 as default.*
2. **Server checkpoint column timing** — with Mission 02, or immediately after slice sign-off. *Recommend: immediately after sign-off, while the seam is fresh.*
3. **Field Rating display curve** — reuse the Heroes level formula (tier-comparable) vs. a flatter analyst-grade scale (GS-1 flavor). *Recommend: same formula, different label — keeps platform math single-source.*
4. **ARC Code beat placement** — Mission 01 cold-open addendum vs. its own pre-course onboarding moment. *Recommend: end of Mission 01 briefing, first run only — signing before your first real case lands harder than a form before any context.*
