import { test, expect } from "@playwright/test";

/**
 * Week-1 new-screen dead-end guards.
 *
 * The 5 concept-recap "checkpoint" screens and the rewired Mission Brief
 * were added recently and had ZERO e2e coverage. Each MUST always render an
 * ENABLED advance control — a missing/disabled "Keep going" is exactly the
 * "no Next button" dead-end class these tests exist to catch.
 *
 * Visits screens directly via the ?screen=N QA deep-link, which is
 * disabled in production but re-enabled for this test build via E2E_TESTS
 * (wired in app/lesson/[week]/page.tsx -> DynamicLesson qaEnabled). Runs in
 * the `authed` project so the session + Week-1 entitlement are seeded.
 */

test.describe("Week 1 new screens - no dead-ends", () => {
  // The four mid-week concept recaps.
  for (const idx of [6, 10, 14, 18]) {
    test(`recap checkpoint (screen ${idx}) shows takeaway + enabled "Keep going"`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(`/lesson/1?screen=${idx}`);

      // The recap must render its plain takeaway. Match the eyebrow label
      // exactly — a loose regex also hits the narration caption that echoes
      // the takeaway ("You just learned what a…"), tripping strict mode.
      await expect(
        page.getByText("You just learned", { exact: true }),
      ).toBeVisible({ timeout: 10_000 });
      // ...and always offer an enabled way forward (no dead-end).
      await expect(
        page.getByRole("button", { name: /Keep going/i }),
      ).toBeEnabled({ timeout: 10_000 });

      expect(errors, `page errors on recap screen ${idx}`).toEqual([]);
    });
  }

  test("finale recap (screen 22) shows mastery + an enabled advance button", async ({
    page,
  }) => {
    await page.goto("/lesson/1?screen=22");
    // Target the headline specifically — the narration caption also says
    // "…you've mastered…", which would trip strict mode on a bare getByText.
    await expect(
      page.getByRole("heading", { name: /mastered/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /I'm ready|Keep going/i }),
    ).toBeEnabled({ timeout: 10_000 });
  });

  test("mission brief (screen 2) reveals an enabled Accept Mission", async ({
    page,
  }) => {
    await page.goto("/lesson/1?screen=2");
    await expect(
      page.getByRole("button", { name: /Accept Mission/i }),
    ).toBeEnabled({ timeout: 10_000 });
  });
});
