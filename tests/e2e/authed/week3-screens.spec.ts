import { test, expect } from "@playwright/test";

/**
 * Week-3 screen dead-end guards (Learn-Loop rebuild, 2026-09-11).
 *
 * Mirrors week1-screens.spec.ts: the 5 concept-recap checkpoints and the
 * Mission Brief MUST always render an ENABLED advance control. A missing or
 * disabled "Keep going" is exactly the "no Next button" dead-end class these
 * tests exist to catch, and the screen indices are the contract the
 * reactions map and the deep-links are keyed to.
 *
 * Visits screens directly via the ?screen=N QA deep-link (re-enabled for
 * this test build via E2E_TESTS). Runs in the `authed` project; the seeded
 * entitlement is course-level, so Week 3 is reachable like Week 1.
 */

test.describe("Week 3 screens - no dead-ends", () => {
  // Week 3 layout (30 screens): video 0, alert 1, weekIntro 2, mission 3, then
  // 5 x (Learn, game, quickCheck, recap) from 4, so the recaps sit at 7, 11,
  // 15, 19 and the finale recap at 23.
  for (const idx of [7, 11, 15, 19]) {
    test(`recap checkpoint (screen ${idx}) shows takeaway + enabled "Keep going"`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(`/lesson/3?screen=${idx}`);

      await expect(
        page.getByText("You just learned", { exact: true }),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByRole("button", { name: /Keep going/i }),
      ).toBeEnabled({ timeout: 10_000 });

      expect(errors, `page errors on recap screen ${idx}`).toEqual([]);
    });
  }

  test("finale recap (screen 23) shows mastery + an enabled advance button", async ({
    page,
  }) => {
    await page.goto("/lesson/3?screen=23");
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
    await page.goto("/lesson/3?screen=3");
    for (let i = 1; i <= 3; i++) {
      await page
        .getByRole("button", { name: new RegExp(`Objective ${i}`, "i") })
        .click({ timeout: 10_000, force: true });
    }
    await expect(
      page.getByRole("button", { name: /Accept Mission/i }),
    ).toBeEnabled({ timeout: 10_000 });
  });

  test("the six Week 3 games render their intro beat (no blank frames)", async ({
    page,
  }) => {
    // plaquePeek 5, profileInspector 9, popupPanic 13, cyberMaze 17,
    // chatSimulator 21, teamPoster 24: each opens on the shared intro beat
    // whose start button is held while Sarah speaks, never missing.
    for (const [idx, title] of [
      [5, /The Mask Peek/i],
      [9, /The Profile Detective/i],
      [13, /Red-Flag Requests/i],
      [17, /The Meet-Up Maze/i],
      [21, /The Uh-Oh Chat/i],
      [24, /The Case Board/i],
    ] as const) {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`/lesson/3?screen=${idx}`);
      await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 15_000 });
      expect(errors, `page errors on game screen ${idx}`).toEqual([]);
    }
  });
});
