# E2E tests

Run locally:

```
npm run test:e2e          # production build, headless (matches CI)
npm run test:e2e:dev      # dev server, headless (faster iteration)
npm run test:e2e:ui       # opens Playwright UI runner
```

## What's covered today

- `public-pages.spec.ts` — every public/auth-free page renders without
  console errors, the login form has its expected fields, the
  forgot-password flow validates and shows its success state, and the
  Cyber Heroes age range stays "6-9".

These are smoke tests. They catch the "white page after deploy" and
"button removed by accident" regressions that have hit production.

## What's not covered yet (auth-required flows)

The lesson player, exercises, and boss battle live behind authentication
and require a populated user with a `Course → Module → Week` row in
Postgres. Those tests need:

1. A test database (or a Postgres test container in CI).
2. A `tests/fixtures/seed.ts` that creates a known user + course state
   before the suite, wraps each test in a transaction, and tears down
   afterwards.
3. A storage-state file so we don't go through the full sign-in flow on
   every test.

When we add those, the next batch of specs to write (in priority order):

1. **Lesson smoke** — load `/lesson/1`, click through the cutscene-skip
   path, and verify each screen renders without errors.
2. **Exercise interactions** — for every exercise, verify the primary
   button or canvas interaction registers a score change. This is the
   suite that would have caught the CyberScanner stale-`disabled` bug
   before it shipped.
3. **Boss battle** — verify the START button triggers the battle, an
   answer click registers, and the victory state shows a Next button.
4. **Completion** — verify "You Did It!" reveals achievements within 5s
   and the Next button is clickable. (This is the gate-bug class.)
5. **Onboarding wizard** — colour selection persists, age validates,
   profile is created, redirect to /welcome works.

## Why the gates keep breaking

The class of bug we keep hitting is "the Next button is rendered behind
a condition that's only true at the end of a long stagger animation, and
the stagger never completes because of an unrelated state mismatch."
The unit-of-test that catches this is "wait 6 seconds, assert the Next
button is visible/clickable." That's exactly what these specs will do
once the auth fixture is in place.
