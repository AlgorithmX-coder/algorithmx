import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for AlgorithmX.
 *
 * The CI pipeline runs `npm run test:e2e`, which boots a fresh production
 * build (`next build && next start`) on port 3100 and runs every spec
 * inside `tests/e2e`.  We use the production build rather than `next dev`
 * so the tests catch build-time errors too.
 *
 * Local: just run `npm run test:e2e:dev` — that uses `next dev` so iteration
 * is faster, at the cost of HMR noise in test output.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
const devMode = process.env.PLAYWRIGHT_USE_DEV === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
  },
});
