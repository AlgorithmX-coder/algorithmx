# E2E tests

```
npm run test:e2e        # production build, headless (matches CI)
npm run test:e2e:dev    # next dev, headless (faster iteration)
npm run test:e2e:ui     # interactive UI runner
```

## Test projects

Two Playwright projects, configured in `playwright.config.ts`:

- **`public`** — runs `public-pages.spec.ts`. No auth, no DB required
  beyond build-time. Smoke-tests the landing page, login form,
  signup form, forgot-password flow and course pages. Uses
  `tests/e2e/fixtures.ts` to pre-set the `site_auth` gate cookie.

- **`authed`** — runs anything in `tests/e2e/authed/`. Loads
  `storageState` from `tests/e2e/.auth/user.json`, which is generated
  by `globalSetup` once before the suite runs. Tests start already
  signed in as the e2e test user.

`globalSetup` (see `global-setup.ts`):
1. POSTs to `/api/test/seed` (only enabled when `E2E_TESTS=1`).
   Creates the test user, child profile, course + week-1 module, and
   wipes any progress.
2. Drives the login form to obtain a real session cookie.
3. Saves storageState to `tests/e2e/.auth/user.json`.

Both projects run `tsc + vitest` in parallel via the GitHub Actions
workflow on every push.

## What's covered today

- `public-pages.spec.ts` — landing, login, signup, forgot-password,
  course pages (cyberheroes / cyberexplorers / cyberstart /
  cyberstart-pro), age-range regression guard.
- `authed/lesson-flow.spec.ts` — `/lesson` boots, Save & Exit visible,
  Resume prompt after autosave, dashboard renders, age-range while
  authed, **first-lesson-screen always has an enabled action button**
  (gate-everything regression guard).
- `authed/gate-button-regression.spec.ts` — explicitly named guards
  against the "no Next button / no doors / can't proceed" class of
  bug. Add a new case here every time we ship a fix for a stranded
  player.

## How to add a regression test for a new bug

When a bug is filed:

1. Add a `test(...)` to `authed/gate-button-regression.spec.ts` (or a
   new file under `authed/`) that asserts the buggy behaviour fails.
   It should **go red** before any fix is applied.
2. Implement the fix in the relevant file.
3. The test now goes green. Commit both together so the test stays in
   the suite as a permanent guard.

That's the loop: every reported bug becomes a permanent test.

## Still uncovered

- Inside-canvas interactions (Pixi BossBattle internals, canvas-only
  collision detection). DOM-level Playwright can't reach them.
- Visual regressions ("looks too 2D"). Visual snapshot testing is the
  next investment if visual bugs become a recurring problem.
- Audio assertions.
- Real-device touch gestures (BrowserStack later).
- Multi-week lesson progression (Week 2+ flows).
