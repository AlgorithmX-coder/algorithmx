---
name: cyberheroes-boss-qa
description: Run and extend the scripted QA playthroughs for Cyber Heroes boss battles and lesson screens (scripts/_showdown-qa.mjs). Use whenever verifying a boss or lesson change in the real app, taking QA screenshots, adding a STEPS entry for a new week, or debugging a failing playthrough. Contains the wide-viewport timing gotchas that cost five failed runs to learn.
---

# Cyber Heroes Boss QA

## Running

```
E2E_TESTS=1 npx next dev -p 3100          # seed endpoint 404s without the env var
node scripts/_showdown-qa.mjs --week=N [--out=DIR] [--vw=2560 --vh=1440]
```

- Always run BOTH viewports: standard 1280×900 and wide 2560×1440 (wide exposed every cast/board overlap).
- Boss auto-enters at `/lesson/N?screen=24`. Test login: `e2e@algorithmx.test` / `e2e-test-pw` (seeded via POST `/api/test/seed`).
- Fresh server before QA after code changes: kill port 3100, `rm -rf .next`, restart — dev HMR silently serves stale code.
- Personally READ every frame produced. A run that "passes" with unreviewed frames is not QA.

## Step DSL (STEPS table in the script)

`{wait: ms}` · `{shot: name}` · `{click: "visible text"}` (case-insensitive SUBSTRING) · `{clickExact: "text"}` (exact match — use when a label collides with a header/hint substring, e.g. "password", "77", "SHARE") · `{clickLabel: "aria-label"}` · `{hold: "label", ms, shotDuring: "name", engagedWhenGone: true}` (re-presses up to 8× until the resting label flips — VaultBoss labels swap to COVERING…/FORGING…).

Clicks use `force: true` — game buttons pulse forever, Playwright's stability check never passes.

## Wide-viewport timing gotchas (each cost a failed run — bake into any new STEPS)

A 2560×1440 screenshot costs ~2.5s, and:
- **(a)** taking one between a timer-phase's mount and its first required press pushes the press past the deadline (W1 cover "He peeked!"). Fix: hold-at-mount, no pre-hold shot; the mid-hold `shotDuring` documents the phase.
- **(b)** capturing ACROSS a setTimeout-scheduled transition can freeze those timers (W2 whack FINAL WAVE never launched). Fix: move shots off transitions.
- **(c)** two shots before the first click of a deadline phase guarantee timeout (W2 rapid 7s "Too slow!"). Fix: click first, shots ride BETWEEN clicks.
- Heavy arena PNGs delay entrance/announce shots (01/02/08 may capture the previous beat) — verify content in the other viewport's frames before calling a defect.
- Stage-transition waits race: phaseClear→victory hop is 2600ms; a 2400ms wait shoots the tail of PHASE CLEAR. Wait 4800ms after the final click to land mid-victory (clears the column's 0.5s entrance too).

## Frame-review checklist (what to actually look for)

Cast at fixed sideline spots, hero = raccoon height, nobody behind boards/select cards/victory text (both viewports); captions on dark chips, legible on light arenas; correct week outfits/machine/arena/badge; no dev-overlay "Issues" badge in frames (React duplicate-key errors — diagnose with a console-capturing probe: copy the login flow + `page.on("console"/"pageerror")`); boss → video → badge flow lands in order.

## Extending

New week = add a STEPS entry. Rules: every click target's text must be unique on screen; never reuse a coach-copy phrase as a click label; shots between deadline-phase clicks, never before the first one. Deleted one-off probes are the convention — copy the login flow from `_showdown-qa.mjs` when a probe is needed, delete it after.
