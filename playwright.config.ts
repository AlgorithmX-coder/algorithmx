import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

/**
 * Playwright config for AlgorithmX.
 *
 * Two test projects:
 *   - `public`     — auth-free smoke tests (landing/login/signup pages).
 *   - `authed`     — runs after `globalSetup` has signed in the test
 *                    user, so specs land already authenticated. This is
 *                    where lesson-flow / exercise / boss-battle tests
 *                    live.
 *
 * The CI pipeline runs `npm run test:e2e`, which boots a fresh production
 * build (`next build && next start`) on port 3100 with E2E_TESTS=1 set
 * so the test-only seed endpoint is reachable. We use the production
 * build rather than `next dev` so the tests catch build-time errors too.
 *
 * Local: just run `npm run test:e2e:dev` — that uses `next dev` so
 * iteration is faster, at the cost of HMR noise in test output.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
const devMode = process.env.PLAYWRIGHT_USE_DEV === "1";

const STORAGE_STATE = path.join(__dirname, "tests/e2e/.auth/user.json");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  globalSetup: path.join(__dirname, "tests/e2e/global-setup.ts"),

  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "public",
      testMatch: /public-pages\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "authed",
      testMatch: /authed\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE,
      },
    },
  ],

  webServer: {
    command: devMode
      ? `next dev --port ${PORT}`
      : `next start --port ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      // Enables /api/test/seed. Production deploys never set this.
      E2E_TESTS: "1",
      // next-auth refuses to handle requests on a host it doesn't
      // recognise unless this is set. Localhost is never trusted by
      // default in production mode.
      AUTH_TRUST_HOST: "true",
      NEXTAUTH_URL: baseURL,
    },
  },
});
