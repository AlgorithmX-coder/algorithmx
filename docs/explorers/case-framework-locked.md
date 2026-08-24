# Cyber Explorers — Case Framework (LOCKED)

**Status:** LOCKED by owner 2026-08-24. **Case 001 (Phishing) is the reference build** — when this doc and Case 001 disagree, Case 001 wins. Supersedes the *structure* sections of `mission-template-v1.md` (that doc's platform/engine/reward canon still holds). Every case 002–020 is built to this spec.

Ages 10–13. Buyer = parent; player = kid. One case = one topic (see `curriculum-map-v1.md`).

---

## 1. The skeleton (fixed order)

```
Cold open → Transmission → Briefing
  Skill 1 : LEARN → PRACTICE
  Skill 2 : LEARN → PRACTICE
   … (7 skills for Case 001; range 3–7, see §2)
  Skill N : LEARN → PRACTICE
Boss "field mission" (blind, integrates every skill)
THE TEST (blind, must-pass, all skills)
Debrief → Rewards
```

No per-skill quiz between skills. **The only graded gate is the end test.** A skill is just LEARN then PRACTICE, then straight to the next.

---

## 2. How many skills

- **Default 7.** Range **3–7**, driven by how many *genuinely distinct* skills the topic honestly holds. Never pad to a number — thin/overlapping "skills" recreate the "feels like a recap/filler" failure. If a topic only has 4 real skills, it has 4.
- The engine derives everything from `manifest.cycles.length` (HUD bar, map, "SKILL x OF N", boss/report indices). Just add cycles; nothing else to wire.
- Order the skills as a real arc (Case 001: feel the pressure → check the link → check the sender → QR codes → downloads → the pattern → recover if caught).

---

## 3. LEARN (teach) — the rules

- WREN **teaches properly** on a real, concrete example. **No mid-lesson quizzing** ("how are you asking me before you taught me" was the cardinal sin).
- **Paced so a kid can't skip:** narrated beats auto-advance as each VO clip ends; voice-off falls back to a slow per-beat read-timer. While WREN speaks, the **whole page is non-clickable** (see §7).
- **Vary the delivery across cases** so it isn't all chat bubbles. Case 001 Skill 1 uses the **ARTIFACT** style (teach ON the real message; tap hotspots, teaching pops on the message). Others use narrated **beats**. Use artifact/beats/other to keep cases feeling different.
- 4–5 beats per skill is typical. Teach the REASONING, not facts to recite.

## 4. PRACTICE — the rules

- **Hands-on, on NEW material** the kid hasn't seen (fresh brands/scenarios), so they APPLY the skill, not re-recognise the taught example.
- **Harder than the taught example** — enough items and tricky/tempting decoys that it's a real discrimination call, not tap-until-it-lights-up. (Case 001 depth pass: INSPECT 9 lines/4 tells among official-looking decoys; SORT 9 addresses incl. brand-in-path; UNMASK 6 senders; PROFILE 8 with tempting wrong tactics; BUILD 5 slots.)
- **Select-then-submit** where it fits; a wrong answer makes them **think again** (short lock + "look again"), never brute-forceable.
- **Not graded** (no XP gate) — it's for learning. The gate is the test.
- On a **correct** answer: WREN **reviews it aloud** during a **15s "look it over" hold** (the lock covers CONTINUE so they hear it through). On a **wrong** answer: WREN plays a short generic **nudge** ("not quite, look again") — `playWrenNudge()`, rotates, never reveals the answer.
- **Different practice interaction per skill where possible.** Mechanic palette: INSPECT, SORT, UNMASK, PROFILE, BUILD, DECIDE, TRACE, SIMULATE, CIPHER, METER, REDACT. Reusing a mechanic on genuinely different content is fine when it's the best fit (Case 001 reuses UNMASK for QR and SORT for downloads) — prefer variety, but **difficulty beats novelty**.

## 5. THE BOSS — "field mission"

- A **longer, story-driven, blind** challenge that makes the kid **use every skill together** on realistic material. Case 001 "The Second Wave": a 7-message triage (call THREAT/SAFE on each — pressure lures, look-alike links, fake senders, a QR trap, a download trap, real-but-boring safe ones), then a containment decision, then a hold-to-transmit.
- **Blind:** take ALL the calls first, **no per-item feedback**, then reveal truth + why on SUBMIT. Wrong → try again.
- Bespoke component per case (`incidents/MissionNNIncident.tsx`), takeover-grade interference on the evidence feed only.

## 6. THE TEST — must-pass gate

- **Blind:** no right/wrong shown per question; only the final score.
- **~2–3 questions per skill** (Case 001: 19 for 7 skills). **Pass ≈ 80%** (Case 001: 15/19). Below pass → **resit the WHOLE case**; never told which they missed. Feedback (per-question review) shown **only after passing**.
- **Think-for-yourself:** fresh brands/scenarios never seen in lessons/practice; apply, don't recite. Mix in a couple that combine skills.
- **No tells:**
  - **Options shuffle** at render (`shuffleQ`) — correct answer never a fixed slot.
  - **Balanced option lengths** — the correct answer must **never be the unique longest** (kids learn to pick the wordiest). Trim the correct answer to a plain statement (reasoning lives in the post-pass review); fill out distractors. Verify with the length-check script; aim for correct answer's length-rank spread across short/middle.
- WREN reads the intro; **START is gated until she finishes** the intro clip (gate on the clip's END event, with fallbacks).

---

## 7. Interaction rules (LOCKED, apply everywhere)

- **Full-page narration lock:** whenever a narrator is speaking — WREN **and** the cinematic block films — **nothing anywhere is clickable** until they finish. Global z50 catcher over HUD/content/dev; armed the instant a narrated screen mounts (before the audio signal, via `beatNarrates` + layout effects), so there's no first-frame gap. Films disable SKIP while playing. This blocks the VOICE toggle too (accepted).
- **Audio unlock:** the first user gesture primes audio so WREN's first line isn't swallowed by autoplay block.
- **Review time:** after a correct practice answer, hold CONTINUE ~15s so they read + hear the review.
- **Change before submit:** an unsubmitted answer is always changeable.
- **Fail the test → redo the whole case.**

## 8. Voice (WREN)

- One female narrator, must sound like a **human being**. ElevenLabs voice `trTZq8BsN25LRj9YD7fR`, model `eleven_v3`, settings `{stability:0.4, similarity_boost:0.8, use_speaker_boost:true}`, `mp3_44100_192`.
- Pace with **`<break>` tags** (0.9s after full stops, 0.2s at commas) — **never ffmpeg atempo** (time-stretch = robotic).
- **Word VO count-agnostically** ("a batch of addresses", not "six addresses") so tweaking item counts doesn't desync the audio.
- Files: `public/audio/wren/m{NN}-…` — beats `-cN-bN` / content-named (`-c-sender-…`), practice intro `-play`, review `-review`, nudges shared `nudge-1..3`, test `-catch-intro`.

## 9. Build + verify checklist (per case)

1. Manifest `missions/missionNN.ts`: cycles (LEARN beats/artifact + PRACTICE payload + `playAudio`), boss `incident`, `catchThem` test, debrief, dossier, `voice`.
2. Bespoke boss component.
3. Generate WREN VO (break-paced, count-agnostic).
4. `npx tsc --noEmit` clean.
5. Length-check the test (0 unique-longest correct).
6. Browser-verify: N-skill wiring (HUD/map), each practice completes, boss blind flow, test walks + passes, **0 console errors**. (Headless can't play audio — the narration-lock/voice behaviours are verified by the owner on a real machine.)

---

## 10. Security / policy (still binding)

- GitHub repo is PUBLIC; the Neon DB password in git history is public → **owner must rotate; never commit secrets**.
- NCSC = "aligned with", never "endorsed by".
- **No em-dashes** in user-visible copy.
- M08 catfish / M09 long-con need RSHE/safeguarding sign-off before market.
- `gh pr merge` is classifier-gated — merge only on explicit owner go.
