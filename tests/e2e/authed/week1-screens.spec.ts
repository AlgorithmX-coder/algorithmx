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
  // The four mid-week concept recaps. Screen indices are position-coupled to
  // week1.ts's `screens` array — recaps sit at 8/12/16/20, the finale recap at
  // 24, the mission brief at 3. Recompute these if Week 1 is restructured.
  for (const idx of [8, 12, 16, 20]) {
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

  test("finale recap (screen 24) shows mastery + an enabled advance button", async ({
    page,
  }) => {
    await page.goto("/lesson/1?screen=24");
    // Target the headline specifically — the narration caption also says
    // "…you've mastered…", which would trip strict mode on a bare getByText.
    await expect(
      page.getByRole("heading", { name: /mastered/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /I'm ready|Keep going/i }),
    ).toBeEnabled({ timeout: 10_000 });
  });

  test("mission brief (screen 3): tapping the objectives arms Accept Mission", async ({
    page,
  }) => {
    await page.goto("/lesson/1?screen=3");
    // SCREEN-AUDIT rebuild: objectives arrive as sealed envelopes the
    // child taps open; the CTA reads "Tap your objectives!" until ALL
    // are flipped, then becomes Accept Mission. The CTA is never
    // disabled (gate-button contract) - it ARMS after the taps. Tap
    // however many objectives this mission has (Week 1 = 4) rather than a
    // hardcoded count, so it survives a different objective count.
    const objectives = page.getByRole("button", { name: /Objective \d/i });
    await expect(objectives.first()).toBeVisible({ timeout: 10_000 });
    const count = await objectives.count();
    for (let i = 1; i <= count; i++) {
      await page
        .getByRole("button", { name: new RegExp(`Objective ${i}\\b`, "i") })
        .click({ timeout: 10_000, force: true });
    }
    await expect(
      page.getByRole("button", { name: /Accept Mission/i }),
    ).toBeEnabled({ timeout: 10_000 });
  });
});
