# AlgorithmX — Cyber Explorers Art Direction
## "Signal Room"

**Status:** Canonical once Asad signs off. Single source of truth for all Cyber Explorers visual, motion, audio, and tone decisions. The Explorers parallel to `algorithmx-warm-pixar-art-direction.md`.

**Markers:** `LOCKED` = decided, do not change without explicit sign-off. `DEFAULT` = recommended value, override freely. `DECIDE` = genuinely open, recommendation attached.

**Rule carried from the Heroes build:** art direction locks before any implementation. No Claude Code prompt may cite a visual decision that is not in this document.

> **v1.1 note:** this repo copy carries build-side patches applied during implementation review — see Appendix A. Where an Appendix A entry conflicts with the body text, Appendix A wins.

---

## 1. What this document locks (fork record)

Resolved in design session, July 2026:

1. **Season arc — LOCKED.** Twenty missions build to unmasking STATIC's coordinator in Mission 20. The serial thread lives **only in the bookends** (incoming transmission and debrief); mission bodies stay topic-modular so curriculum reordering never breaks the arc. Coordinator breadcrumbs are seeded across actor dossiers, so the collection layer pays off the arc.
2. **In-engine briefings — LOCKED.** No video bookends. Briefings are motion graphics + handler VO on the mission-control surface. Jermaine's lane redirects to: adversary dossier portraits, briefing motion-graphic assets, transmission stingers, and (budget permitting) one video-grade finale set piece.
3. **Clearance ladder — LOCKED.** Trainee → CONFIDENTIAL → SECRET → TOP SECRET → ULTRA. Real classification terms; ULTRA deliberately invokes the Bletchley → GC&CS → GCHQ → NCSC lineage that points at the CyberFirst accreditation target.
4. **SIMULATE mechanic — LOCKED with a hard line.** The child *anticipates and counters* — predicts the attacker's next move, spots the trap being set. The child **never authors an attack artifact** (no writing phishing emails, even as exercise). Gated by the ARC Code signing in Mission 1. Parent-facing copy frames it as how professional defenders train.
5. **Callsigns — LOCKED.** Child-chosen identity via a two-part builder, no free text. Word lists must pass an "aspirational, not cute" review. The builder is a deliberate callback to the Heroes W2 username-builder lesson: the product practising its own curriculum.
6. **Tier boundary — LOCKED.** Cyber Heroes = ages 6–9. Cyber Explorers = ages 10–13. This supersedes the 6–10 / 11–18 split in the gamification skill canon (skill update pending — see §14). All of Explorers v1 applies the stricter no-social-comparison rules regardless: leagues off, personal bests and cooperative framing only.

---

## 2. North star

**A real analyst's room, rendered with respect for a ten-to-thirteen-year-old's intelligence.**

The fantasy is competence, not power. The child is the person in the room who notices the thing everyone else missed. Every surface should feel like a working tool that happens to be beautiful — never a toy, never a film set, never a casino.

The one-line test for any new screen: *would a thirteen-year-old screenshot this without embarrassment?*

**The inverse parent test — LOCKED.** In Heroes, re-skins fail if a parent could mistake two weeks for each other. In Explorers the test inverts across tiers: **if a parent could mistake an Explorers screen for a Heroes screen, the Explorers screen fails.** No shared assets, no shared iconography, no shared celebration grammar.

### Anti-goals (things this direction is explicitly not)

- **Not neon-hacker cliché.** No Matrix rain, no skull ASCII, no hoodie iconography, no "HACKING…" progress bars, no acid-green-on-black as the whole personality.
- **Not Heroes in a trench coat.** Nothing rounded-chunky, nothing bouncy, no PixIcon, no emoji in mission UI (DEFAULT — see DECIDE list).
- **Not horror.** Threats are cases, never personal jeopardy. STATIC is unsettling the way a wrong URL is unsettling — a puzzle, not a monster.
- **Not a generic dark dashboard.** The distinctiveness lives in three signature moves: the paper/analog counterpoint (§5), interference-as-villain (§6), and the stamp/brass ceremony grammar (§8). Protect these; keep everything around them quiet.

---

## 3. Axis 1 — Palette and colour roles

### Base neutrals (the room)

| Token | Hex | Use |
|---|---|---|
| `ink-black` | `#0B0F14` | Page base |
| `panel` | `#121820` | Resting surfaces |
| `panel-raised` | `#1A222E` | Elevated cards, active panes |
| `hairline` | `#2A3644` | 1px borders, dividers, grid rules |
| `text-primary` | `#E6EDF3` | Body and data |
| `text-secondary` | `#8FA0B2` | Labels, metadata |
| `text-disabled` | `#5A6B80` | Inactive states |

### Semantic accents — the role system, resolved (LOCKED)

This resolves the conflict between the Heroes lesson colour-psychology system (blue/green/orange/yellow) and the brand palette (cyan/violet/lime). All four Heroes roles carry forward with shifted hues, plus one new role this tier needs. **The role survives even where the hue changes.**

| Role | Heroes | Explorers token | Hex | Meaning in Explorers |
|---|---|---|---|---|
| Identity / primary | Blue `#3b82f6` | `arc-cyan` | `#22D3EE` | ARC system identity, selection, live data. Tempered from brand cyan `#00E5FF`. |
| Success / confirmed | Green `#10b981` | `confirmed-green` | `#3ECF8E` | Correct, safe, verified, case progress. |
| Interactive | Orange `#f97316` | `action-amber` | `#E8A33D` | **"Your move."** CTAs, prompts, flagged items awaiting review. |
| Reward | Yellow `#f59e0b` | `clearance-brass` | `#C9A961` | Clearance, stamps, field rating, case-closed moments. **Nowhere else.** |
| Threat (new) | — | `threat-red` | `#E5484D` | Live threat, critical, incorrect feedback. |

**The amber unification — the semantic upgrade of this tier.** In a SOC, a warning *is* a call to action. So Explorers unifies "interactive CTA" and "attention required" under one honest meaning: **amber marks wherever the operative must act.** There is no separate warning colour; caution states are amber (act on this) or red (threat, live). This is tighter than the Heroes system, not looser.

**Cosmic violet `#7C5CFF` is retired from lesson UI** (DEFAULT). It remains a site-level brand colour only.

### The analog counterpoint

| Token | Hex | Use |
|---|---|---|
| `manila` | `#E8E2D0` | Case-file folders |
| `paper` | `#F4F1E8` | Dossier sheets, evidence documents, after-action reports |
| `file-ink` | `#14181D` | Print on paper surfaces |

Paper is the one warm note in the room, and it is load-bearing (see §5).

### Attention budget (LOCKED)

Neutrals occupy ≥85% of any resting screen. **A resting screen shows at most two accent hues.** Brass appears only in reward moments. A screen with four accents lit simultaneously is a failed screen — the entire pedagogy of this tier is *finding the signal*, and the UI must model that discipline itself.

---

## 4. Axis 2 — Light

The room is lit by its screens. No sunlight, no directional key light, no drop-shadow theatre.

- **Glow is information.** Things glow because they are live — an active feed, a selected node, a fresh flag. Decorative glow is banned. If it glows, the child should be able to ask "why is that live?" and get an answer.
- Soft cyan ambient bleed at panel edges (2–4px, ≤15% opacity) sells the monitor-room feel without gradients-as-decoration.
- Subtle edge vignette on full-bleed surfaces (incidents, briefings) to pull focus centre.
- **Contrast discipline (LOCKED):** body text ≥4.5:1 against its surface, target 7:1. Ten-to-thirteens do lessons at 9pm on cheap tablets; legibility is non-negotiable.

---

## 5. Axes 3 & 4 — Shape and material

### Shape language

Precise, rectilinear, quiet.

- 1px hairline strokes; corner radii 2–4px maximum (against Heroes' big friendly radii).
- 45° chamfered corner cuts on key panels — the HUD notch — used sparingly (one or two per screen), or they become wallpaper.
- Grid-aligned, data-dense but breathing: generous line-height (1.6 body) because these are still children reading.
- **Redaction bars** as a recurring graphic motif: locked content, unrevealed intel, dossier fields pending declassification.
- Stamps are circular or rectangular official marks, rotated 2–4° so they read as physically applied, never perfectly straight.

### Material story: digital tools, paper evidence

Three materials, and the contrast between the first two is the texture story of the whole tier:

1. **Terminal glass** — ARC's own surfaces. Dark matte, 1–2% noise grain, crisp type. Trustworthy, calm, precise.
2. **Paper** — evidence, dossiers, intercepted documents, after-action reports. Manila folders, slight paper texture, hard small shadows, typewriter-adjacent mono print, ink stamps.
3. **Brass and ink** — clearance seals, stamps, the ID card's metal details. Reward material only.

**The pedagogically loaded rule (LOCKED): ARC chrome is never corrupted.** STATIC interference (§6) appears only on *evidence and external content* — never on the child's own tools, navigation, or HUD. The art direction itself teaches the distinction between *your verified tools* and *untrusted content*. The child's instruments are always trustworthy; the material they inspect is not.

Banned materials: glossy gradients, heavy glassmorphism blur, skeuomorphic leather, chrome bevels.

### Typography

- **Geist Mono SemiBold, promoted to a starring role** (LOCKED, from the straw man): display headers, eyebrows, labels, all data, timestamps, callsigns. Uppercase eyebrows at +0.08em tracking.
- **Inter 400/500** stays for body prose — platform continuity where it doesn't cost identity.
- Iconography: flat technical glyphs, 1.5px stroke, geometric. PixIcon retires at this tier (LOCKED).

---

## 6. Axis 5 — Presence and tone

### The handler

One human voice. Calm, dry, radio-crackle competent; treats the child as the analyst in the room.

- **Visual presence: a waveform chip** — a live audio waveform with callsign and status, docked in the briefing surface. Never an avatar face; the handler is a voice on the net, and the imagination does better work than any character rig. (DEFAULT — see DECIDE list for the alternative.)
- Handler codename: **WREN** (DECIDE — recommendation and reasoning in §14).
- Copy voice: brisk, understated, second person, British English. The handler's praise is dry — *"Nicely done. Next."* — which makes the rare warm line land twice as hard. Reading age 10–11. *(Superseded on language — see Appendix A.1.)*
- Child address term: **"Operative"** (DEFAULT), retiring the Heroes "Agent".

### STATIC — the villain rendered as interference

STATIC is never a face in mission UI (v1). Its presence is **signal interference** — which is thematically perfect, because static *is* noise, and the course *is* finding signal in noise.

Three intensities of the interference grammar:

| Level | Treatment | Where |
|---|---|---|
| **Whisper** | 1px scanline flicker, ≤2s, on a piece of evidence | Something is off. Investigation cycles. |
| **Intrusion** | Character scramble on affected text, chromatic split ≤2px | An actor is actively present in the material. |
| **Takeover** | Full-surface tear, brief audio noise burst ≤400ms | Incidents only. The one moment STATIC gets the whole screen. |

- Each STATIC operative gets **one signature interference flavour + one glyph** (PHANTOM HOOK's scanlines drift like a lure; MIMIC's scramble resolves into *almost*-right characters; SKELETON KEY's flicker sweeps like tumblers; and so on — final flavours assigned per actor in the mission map).
- **Dossier portraits** — monochrome, evidence-photo treatment — are Jermaine's lane, revealed only on case close.
- Never frightening. Interference is a puzzle-texture, not a jump scare. No sudden full-volume stings, ever.

### Copy rules (carried and extended from platform canon)

Carried: zero guilt, zero FOMO, zero countdown pressure on rewards, no streak-shame, no comparisons to named children. Extended for this tier: no baby-talk, no exclamation-mark spam, no emoji in mission UI (DEFAULT). Incidents may have *diegetic* urgency (a live case moves fast) but never reward-attached countdown pressure — the ICO line the platform already holds.

---

## 7. Axis 6 — Motion and feedback

### Motion verbs (the only moves in the vocabulary)

| Verb | Spec | Use |
|---|---|---|
| **Snap** | 120–160ms, `cubic-bezier(0.2, 0, 0, 1)` | Things lock into place: selections, connections, panel docking |
| **Slide** | 200–260ms | Panels, drawers, file movement |
| **Scan** | 800ms linear sweep | Progress, analysis-in-motion |
| **Resolve** | ≤600ms character de-scramble | Reveals only — text decrypting from noise. The signature reveal move. |
| **Stamp** | 90ms scale 1.15→1.0, one 2px shake frame, 200ms ink settle | Confirmations, case-closed, checkpoints passed |
| **Sweep** | Slow radial, ambient | Radar/status surfaces, idle life |

**Nothing bounces. Nothing floats. No spring easings anywhere (LOCKED).** Idle screens breathe through *data* — cursor blink (1.1s), ticking timestamps, drifting sweep — never through wobble.

### Celebration grammar: precision satisfaction

The Heroes bar — "nothing flat, anywhere, ever" — carries over, but the *register* changes completely. Explorers celebrations feel like a well-machined latch, not a party popper: the dossier slam, the stamp thunk, the file sliding home, the clearance band ticking up. Sound does half the work (§9). Form still rotates per platform canon (stamp angle, ink spread, drawer position, handler line) while reward value stays deterministic.

### The two-channel rule — fixing the Heroes gap on day one (LOCKED)

The Heroes build shipped with a known accessibility gap: at `intensity === 0` (strict OS reduced-motion), the big-FX helpers fire nothing, so a child can get **no confirmation on a correct answer**. Explorers bakes the fix in from the first commit:

> **Every feedback moment must land on at least two channels: motion, colour/text, sound. At motion intensity 0, colour/text and sound still fire. A silent, unmarked success is a shipping blocker, not a polish item.**

This is an acceptance-test item (§12), and it should be back-ported to Heroes when that gap is scheduled.

---

## 8. Axis 7 — Signature objects

Heroes has the vault. Explorers has two anchors:

### The ARC ID card

The child's persistent identity object: callsign, clearance band, field rating, case count, ARC glyph. It lives on the dashboard and evolves visibly.

- **Clearance bands use real cover-sheet convention** (DEFAULT): CONFIDENTIAL = blue band, SECRET = red band, TOP SECRET = orange band, ULTRA = brass. The authenticity is worth the mild collision between SECRET's red band and `threat-red` — a band on a card is contextually unambiguous. (Alternative if vetoed: an invented ARC banding ramp in cyan→brass.) *(Sanctioned checklist exception — see Appendix A.2.)*
- The **phase ceremony is a card reprint**: old card slides out, new card prints in with the upgraded band. The biggest celebration in the tier, and it is still quiet by Heroes standards — which is exactly right.

### The case archive

A drawer of closed dossiers — the Explorers descendant of the sticker book, and the spaced-revision surface.

- Each closed case = a stamped manila folder holding the actor's declassified dossier (portrait, M.O., the trick explained, coordinator breadcrumb where seeded).
- **Case-closed ceremony (the weekly big beat):** dossier slams shut → stamp comes down → folder slides into the archive → clearance progress ticks → **full-stop screen** (the ICO natural-break rule carries verbatim from platform canon: no autoplay-next, no "one more").

---

## 9. Sound direction

- **Handler voice: new audition required.** Sarah and Callum are Heroes-only (LOCKED, platform canon). Brief: British, calm, dry, mid-30s+, unhurried authority — someone you'd trust on a radio at 2am. Voice ID self-verified from a test script per platform rule, never trusted from a name. *(Accent superseded on language ruling — see Appendix A.1.)*
- **Ambient beds:** low room-tone plus a very faint tense-but-cool music bed **from day one** — the "very very faint music" lesson from the Heroes pilot ships here at launch, not as a patch. Ducked under VO.
- **UI audio family:** restrained and mechanical — latch clicks, relay switches, the stamp thunk, soft radar pings. Success sounds are pitched *confident*, not celebratory. Errors are a dull thud, never a harsh buzzer.
- **STATIC's audio signature:** brief band-limited noise, ≤400ms, volume-capped. Interference is heard the way it is seen: unsettling, never startling.
- All via the existing ElevenLabs pipeline; Howler/audiosprite decision inherits whatever Heroes lands on.

---

## 10. Screen archetypes (how the axes combine)

- **Incoming transmission** — full-bleed, vignette, takeover-grade interference resolving into the cold open. The serial arc lives here.
- **Briefing** — mission-control surface: pinned objectives (mono, numbered), handler waveform chip live, case header stamped CONFIDENTIAL-and-up per mission.
- **Investigation workspace** — the tier's home: evidence board for TRACE (paper items pinned on terminal glass, connections snap between them), inspector panes for INSPECT (headers, URLs, chat logs on paper; anomalies flagged amber by the child).
- **Checkpoint** — terminal-glass form; passing earns the stamp treatment.
- **Incident** — the boss. Full-bleed takeover; the one surface where interference grammar is unleashed; diegetic urgency without reward-countdown pressure.
- **Debrief** — paper after-action report, handler VO, and the locked transfer beat: *your move in the real world*.
- **Archive** — the drawer. Browsing is revision; revision is the point.

---

## 11. What carries from platform canon unchanged

Predict-before-reveal on all REVEAL-family mechanics. Never subtract (XP never drops; streaks shield, never break; no guilt copy). Mastery earns, attendance doesn't. Server-authoritative awards. No randomised-value rewards. Gamification and payment never touch. The full-stop screen. Weekly streak cadence with shields. "Nothing flat, anywhere, ever" — reinterpreted through §7's precision grammar.

---

## 12. Acceptance checklist (parallel to the warm-vault 7-pointer)

Every Explorers screen or scene passes all eight before merge:

1. **Inverse parent test:** could a parent mistake this for a Heroes screen? Fail if yes.
2. **Asset purity:** zero Heroes assets, PixIcon glyphs, or emoji in mission UI.
3. **Colour-role audit:** every accent on screen maps to its §3 role; resting screens show ≤2 accent hues; brass appears only in reward moments. *(ID-card classification bands exempt — Appendix A.2.)*
4. **Two-channel feedback:** at motion intensity 0, every success/failure still lands via colour/text + sound. No silent successes.
5. **Contrast:** body text ≥4.5:1 (target 7:1).
6. **Celebration grammar:** precision only. Any bounce, confetti, or spring easing = fail.
7. **Interference discipline:** STATIC effects on evidence/external content only; ARC chrome is never corrupted. *(Reduced-motion variants required — Appendix A.3.)*
8. **Copy pass:** US English (Appendix A.1), reading age 10–11, handler understatement, no guilt/FOMO/countdown-reward pressure, no baby-talk.

---

## 13. Out of scope for this document

- **Mission anatomy, curriculum map, mechanic specs** — `mission-template-v1.md` (companion, same directory).
- **Save/resume checkpoint schema** — Explorers build kit. Flagged now: Progress is week+screen-grained today; mid-mission resume needs a **structured checkpoint state payload** (evidence-board state, incident phase, mechanic state) designed into the model before Mission 1 is built, not retrofitted. *(Corrected — see Appendix A.4.)*
- **Accreditation evidence capture** — mission template. Design constraint registered: Checkpoint (Prove) beats must emit evidence artifacts from day one, serving CyberFirst/ASDAN and the school-licensing documentation play.
- **Reward economy numbers** — gamification canon (`economy.md`) governs; this document only sets the *presentation* of rewards.

---

## 14. Canon reconciliation and open DECIDEs

### Reconciliation actions

- **Tier boundary:** 6–9 / 10–13 now LOCKED (§1.6). The gamification skill's 6–10 / 11–18 split needs updating to match — pending action, single-source rule applies.
- **Colour roles:** §3 supersedes the straw-man sketch (cyan/lime/amber) which had silently dropped the interactive and reward roles.
- **Violet:** retired from lesson UI, site-level only (DEFAULT).
- Once this document and the mission template are signed off, the gamification skill needs an **Explorers layer** so future builds stop inheriting Cubs voice rules ("Agent", Raccoon reactions, reading age 7) by accident.

### Open DECIDEs (recommendation attached; say yes/no per line)

1. **Handler codename — recommend WREN.** British bird, small and sharp-eyed; and the Wrens (Women's Royal Naval Service) staffed Bletchley Park — the same lineage the ULTRA clearance already points at. One name, three layers deep.
2. **Clearance band colours — recommend real cover-sheet convention** (blue/red/orange/brass) over an invented ramp. Authenticity is the tier's whole register.
3. **Child address term — recommend "Operative"**, retiring "Agent" at this tier.
4. **Style name — recommend "Signal Room"** as the canonical direction name (this doc's title updates on confirmation).
5. **Emoji in mission UI — recommend full retirement** for Explorers.
6. **Handler presence — recommend the waveform chip** over any abstract sigil/avatar.

---

## Appendix A — Build-side patches (v1.1, applied 2026-07-12 during implementation review)

Applied under the user's "do what you think is best" delegation; each is reversible and flagged for formal sign-off alongside the body.

- **A.1 — Language: US English.** The platform shipped a deliberate US localization on 2026-07-10 (US narrator, Childhelp 1-800-422-4453, 911); product copy follows the narrator. Explorers therefore ships **US English copy and an American handler voice**, superseding the body's "British English" lines (§6, §9, §12.8). The WREN name and ULTRA clearance survive on their own merits; the Bletchley/CyberFirst *rationale* is parked pending an explicit market ruling from Asad. Real-world escalation copy (debrief transfer beats) must name US paths while this stands.
- **A.2 — ID-card band exemption.** §12 item 3 as written fails every screen showing a SECRET/TOP SECRET card. Classification bands on the ARC ID card and case headers are a **sanctioned exception** to the colour-role audit; they are the only non-role accents permitted, and only in that context.
- **A.3 — Interference reduced-motion variants.** The two-channel rule covers feedback; interference is *content*. Each interference level (whisper / intrusion / takeover) must define an **intensity-0 static equivalent** (e.g., marked border treatment + label instead of animation), and all interference respects flash-rate caps per platform child-safety canon.
- **A.4 — Progress model correction.** `Progress` already stores a per-week `screen` index (schema.prisma, `model Progress`) — resume is screen-grained today. The genuine gap for Explorers is the **structured mid-beat state payload** (evidence-board connections, incident phase, mechanic state). §13 has been corrected to say so.

---

*Companion documents: `algorithmx-warm-pixar-art-direction.md` (Heroes tier, lives with the design chat) · `mission-template-v1.md` (same directory) · gamification skill references (platform canon).*
