# Bug triage workflow

This is the system that stops bugs reaching the same kid twice.

## How to file a bug (you + your friend)

1. Open <https://github.com/AlgorithmX-coder/algorithmx/issues/new>
2. Pick **Bug report**.
3. Fill in: where, what happened, what you expected, screenshot,
   severity, device.
4. Submit.

That's it. Don't worry about formatting - the template asks for
everything I need.

## Severity labels

| label       | meaning                                                                     | example                                   |
| ----------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| `blocker`   | Can't proceed. Lesson won't load, crashes, or no way forward on a screen.   | "No Next button on Golden Rules screen."  |
| `broken`    | Works but wrong behaviour or content.                                       | "Right answer is always C in boss quiz."  |
| `polish`    | Looks or feels off but functionally fine.                                   | "Cauldron looks too plain, want bubbles." |

## How fixes happen

For each bug report I (Claude) will:

1. Reproduce locally.
2. Write a Playwright test that exercises the bug - **test goes red**.
   The test stays in the repo forever as a permanent regression guard.
3. Fix the code - **test goes green**.
4. CI runs `tsc + vitest + playwright` on every push and blocks merge
   if any test goes red.
5. PR merges → Vercel deploys → bug closed with the test PR linked.

This is the loop that prevents the same bug being reported twice.

## How to test in priority order

If you and your friend are doing a manual pass, test in this order
(matches the lesson flow + the most common bug surfaces):

1. **Sign up + onboarding** (new account end-to-end). 5 min.
2. **Welcome / dashboard renders**.
3. **Lesson Week 1 from start to finish**, screen by screen:
   - Intro / mission
   - "What is a Password?" lock-items (tap each)
   - CyberScanner (does STRONG/WEAK actually click?)
   - ProtectTheData (mouse / arrow keys / WASD / tap on tablet)
   - Memory Match
   - ConveyorBelt (lever up/down - does it route correctly?)
   - Crack the Code (does the rings indicator update?)
   - Golden Rules (tap each medal - answer each rule's question)
   - Spot the Tricks (4 evidence files)
   - Choose Your Path (4 scenarios)
   - FirewallBuilder (catch green, space-to-reject red)
   - SpamBlaster (click phishing emails - laser zap?)
   - Boss Battle (10 questions vs the Raccoon)
   - You Did It! (achievements + Next button)
   - Week summary (badge + coins)
4. **Save & Exit mid-lesson, close tab, reopen**. Resume prompt should
   appear with correct screen / coins / XP.
5. **Forgot password** flow.

For each step where something is wrong → file an issue.

## Test commands (for me)

```bash
npm test                  # vitest unit tests (fast)
npm run test:e2e          # full e2e suite (production build)
npm run test:e2e:dev      # e2e against next dev (faster)
npm run test:e2e:ui       # interactive UI runner
```

## Known-uncovered surfaces (where regressions can still slip through)

- BossBattle Pixi internals (canvas-only; can't test via DOM selectors).
- Visual regressions ("looks too 2D"). These need a human eye until we
  add visual snapshot testing.
- Audio (no SFX assertions).
- Touch gestures on real iPads (we test mouse + keyboard locally;
  BrowserStack / real device farm is the next investment if we hit
  iPad-specific bugs).

When you hit something that ISN'T in one of those buckets and we shipped
a regression anyway, **that's a hole in the test suite** - file the bug
and a test will be added at the same time as the fix.
