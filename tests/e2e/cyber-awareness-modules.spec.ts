import { test, expect, type Page } from "@playwright/test";
import { getAwarenessModule } from "../../app/cyber-awareness/manifests";

/**
 * Cyber Awareness play-throughs.
 *
 * Every shipped Cyber Awareness module is played from its first screen to
 * its result stamp in the offline preview (/dev/cyber-awareness, no
 * database: every practice is scripted). The walker takes the first
 * available action on each screen, flags every moment in the morning and
 * names a button for each, marks every inbox message and names a tell for
 * each phish, so a screen with no way forward, a crash, or a console
 * error fails the build. On the inbox it also hovers a sender and a link
 * and checks what is behind them appears. On the phone it answers every
 * notification, checks each one explains itself, and reaches the day's
 * log. In a scene it opens every spot in every view, by keyboard as well
 * as by tap, makes a call on each and checks each one explains itself. In
 * the outbox it looks closer at a line by keyboard, checks every Fix is
 * labelled, then sends or fixes each item in turn, checks each one
 * explains itself, and reaches the outbox log. A learn screen's quick
 * check is answered too. A second pass answers every Prove item correctly
 * (found by text, because the options shuffle) and must pass; in the
 * outbox it makes the right call on every item and must see each one
 * stamped right. In the payment queue it opens every request from the
 * queue, takes a check by keyboard and sees what it finds, checks every
 * decision is labelled, decides each one (the best decision on the passing
 * run, which must be stamped right), checks each explains itself, and
 * reaches the week's log.
 */

const MODULES = [1, 2, 3, 4, 5, 6];
const MAX_SCREENS = 40;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on("response", (r) => {
    const path = new URL(r.url()).pathname;
    if (/^\/_vercel\//.test(path) || /\/envelope\/?$/.test(path)) return;
    if (r.status() >= 400) errors.push(`${r.status()} ${path}`);
  });
  return errors;
}

/* The right option's text for a prove stem, from the manifest. */
function rightAnswerFor(m: number, stem: string): string | null {
  const block = getAwarenessModule(m)!.tracks.general!;
  const q = block.prove.find((p) => p.kind === "choose" && stem.startsWith(p.stem.split("{{")[0].slice(0, 40)));
  if (!q || q.kind !== "choose") return null;
  return q.options[q.answer].split("{{")[0].slice(0, 30);
}

/* The right call on an outbox item, by its title, from the manifest: the
 * Fix button's accessible name for the main faulty line, or null to send. */
function rightOutboxFix(m: number, title: string): string | null {
  const pr = getAwarenessModule(m)!.tracks.general!.practise;
  if (pr?.kind !== "outbox") return null;
  const item = pr.items.find((i) => i.title === title);
  const main = item?.fault?.[0];
  const part = main ? item!.parts.find((p) => p.id === main) : undefined;
  return part ? `Fix this: ${part.label}` : null;
}

/* The best decision on a payment request, by its subject, from the manifest. */
function rightPayment(m: number, subject: string): string | null {
  const pr = getAwarenessModule(m)!.tracks.general!.practise;
  if (pr?.kind !== "payments") return null;
  return pr.requests.find((r) => r.subject === subject)?.accept[0] ?? null;
}

async function playThrough(page: Page, query: string, opts: { m: number; answerRight?: boolean }) {
  const errors = collectErrors(page);
  await page.goto(`/dev/cyber-awareness?${query}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await expect(page.locator(".cl-eyebrow").first()).toBeVisible({ timeout: 60_000 });

  let screens = 0;
  let stuckAt: string | null = null;
  let peeked = false;
  let phoned = 0;
  let dayLogged = false;
  let spotted = 0;
  let outboxed = 0;
  let outboxRight = 0;
  let lookedCloser = 0;
  let outboxLogged = false;
  let decided = 0;
  let decidedRight = 0;
  let payChecked = 0;
  let payLogged = false;
  for (let guard = 0; guard < MAX_SCREENS; guard++) {
    await page.waitForTimeout(200);
    const eyebrow = (await page.locator(".cl-eyebrow").first().textContent().catch(() => "")) || "screen";
    screens++;

    for (let k = 0; k < 12 && (await page.locator(".cl-cardbtn:not(.static):not(.open)").count()); k++) {
      await page.locator(".cl-cardbtn:not(.static):not(.open)").first().click();
      await page.waitForTimeout(100);
    }
    for (let k = 0; k < 12 && (await page.locator(".cl-switch:not(.on)").count()); k++) {
      await page.locator(".cl-switch:not(.on)").first().click();
      await page.waitForTimeout(80);
    }
    while (await page.locator(".cl-nav button.cl-btn:not(.cl-btn-pri):not(:disabled)").filter({ hasText: /^Show / }).count()) {
      await page.locator(".cl-nav button.cl-btn").filter({ hasText: /^Show / }).first().click();
      await page.waitForTimeout(120);
    }
    /* The morning: flag every moment, then name a button on each one
     * that asks. */
    for (let k = 0; k < 20 && (await page.locator(".cl-mo-flag").count()); k++) {
      await page.locator(".cl-mo-flag").first().click();
      await page.waitForTimeout(60);
    }
    for (let k = 0; k < 20 && (await page.locator(".cl-mo-ask .cl-opt:not(:disabled)").count()); k++) {
      await page.locator(".cl-mo-ask .cl-opt:not(:disabled)").first().click();
      await page.waitForTimeout(80);
    }
    /* The inbox: hover the first sender and the first link and check the
     * real address shows, then mark every message (the first call on
     * each) and name a tell on each one that asks. */
    if (await page.locator(".cl-ib-msg").count()) {
      await page.locator(".cl-peek.from").first().hover();
      await expect(page.locator(".cl-peek-wrap.from .cl-peek-real").first(), "hovering a sender shows who it is really from").toBeVisible();
      await page.locator(".cl-peek.link").first().hover();
      await expect(page.locator(".cl-peek-wrap.link .cl-peek-real").first(), "hovering a link shows where it goes").toBeVisible();
      peeked = true;
    }
    for (let k = 0; k < 20 && (await page.locator(".cl-ib-call").count()); k++) {
      await page.locator(".cl-ib-call").first().click();
      await page.waitForTimeout(60);
    }
    for (let k = 0; k < 20 && (await page.locator(".cl-ib-ask .cl-opt:not(:disabled)").count()); k++) {
      await page.locator(".cl-ib-ask .cl-opt:not(:disabled)").first().click();
      await page.waitForTimeout(80);
    }
    /* The phone: answer the notification on the lock screen (the first
     * action) and check its reason shows; the primary button then brings
     * the next one, and after the last, the day's log. */
    if (await page.locator(".cl-ph-act:not(:disabled)").count()) {
      await page.locator(".cl-ph-act:not(:disabled)").first().click();
      await page.waitForTimeout(100);
      await expect(page.locator(".cl-ph-fb").first(), "every notification explains itself").toBeVisible();
      phoned++;
    }
    if (await page.locator(".cl-ph-log").count()) dayLogged = true;
    /* The scene: in each view, open every spot (the first by keyboard,
     * the rest by tap), make the first call, and check it explains itself. */
    if (await page.locator(".cl-sc").count()) {
      const tabs = page.locator(".cl-sc-tab");
      const views = await tabs.count();
      for (let v = 0; v < views; v++) {
        await tabs.nth(v).click();
        for (let k = 0; k < 12 && (await page.locator(".cl-sc-spot:not(.done)").count()); k++) {
          const spot = page.locator(".cl-sc-spot:not(.done)").first();
          await expect(spot, "every spot is labelled").toHaveAttribute("aria-label", /^Spot \d+: .{8,}/);
          if (k === 0) {
            await spot.focus();
            await page.keyboard.press("Enter");
          } else await spot.click();
          await expect(page.locator(".cl-sc-title"), "opening a spot shows what it is").toBeVisible();
          await page.locator(".cl-sc-call:not(:disabled)").first().click();
          await expect(page.locator(".cl-sc-fb").first(), "every spot explains itself").toBeVisible();
          spotted++;
        }
      }
    }
    /* A learn screen's quick check (the firm's data classes): pick one, and
     * check the reason shows. */
    if (await page.locator(".cl-check:not(.solid) .cl-opt:not(:disabled)").count()) {
      await page.locator(".cl-check:not(.solid) .cl-opt:not(:disabled)").first().click();
      await expect(page.locator(".cl-check .cl-fb").first(), "the quick check explains itself").toBeVisible();
    }
    /* The outbox: look closer at a line by keyboard, check every Fix is
     * labelled, then send or fix (in turn, or the right call on the
     * passing run) and check the reason shows. The primary button then
     * brings the next item, and after the last, the outbox log. */
    if ((await page.locator(".cl-ob-draft").count()) && (await page.locator(".cl-ob-act").count())) {
      const lookBtn = page.locator(".cl-ob-look").first();
      if (await lookBtn.count()) {
        await lookBtn.focus();
        await page.keyboard.press("Enter");
        await expect(page.locator(".cl-ob-found").first(), "looking closer shows what is there").toBeVisible();
        lookedCloser++;
      }
      const fixes = page.locator(".cl-ob-fix");
      for (let k = 0; k < (await fixes.count()); k++) await expect(fixes.nth(k), "every Fix names its line").toHaveAttribute("aria-label", /^Fix this: .{2,}/);
      if (opts.answerRight) {
        const title = ((await page.locator(".cl-ob-title b").first().textContent()) ?? "").trim();
        const fix = rightOutboxFix(opts.m, title);
        await (fix ? page.getByRole("button", { name: fix, exact: true }) : page.locator(".cl-ob-send")).click();
        await expect(page.locator(".cl-ob-stamp.right"), `"${title}": the right call is stamped right`).toBeVisible();
        outboxRight++;
      } else {
        await (outboxed % 2 ? page.locator(".cl-ob-send") : fixes.first()).click();
      }
      await expect(page.locator(".cl-ob-fb"), "every outbox item explains itself").toBeVisible();
      outboxed++;
    }
    if (await page.locator(".cl-ob-log").count()) outboxLogged = true;
    /* The payment queue: open each request from the queue, take its first
     * check by keyboard and check what it finds shows, check every decision
     * is labelled, then decide (in turn, or the best decision on the
     * passing run) and check the reason shows. Then the week's log. */
    if ((await page.locator(".cl-pay-queue").count()) && !(await page.locator(".cl-pay-log").count())) {
      const reqs = page.locator(".cl-pay-req");
      const n = await reqs.count();
      for (let i = 0; i < n; i++) {
        await expect(reqs.nth(i), "every request in the queue is labelled").toHaveAttribute("aria-label", /^Request \d+ of \d+: .{8,}/);
        await reqs.nth(i).click();
        await expect(reqs.nth(i)).toHaveAttribute("aria-pressed", "true");
        const subject = ((await page.locator(".cl-pay-meta dd").nth(1).textContent()) ?? "").trim();
        const check = page.locator(".cl-pay-check").first();
        await check.focus();
        await page.keyboard.press("Enter");
        await expect(page.locator(".cl-pay-found").first(), "a check shows what it finds").toBeVisible();
        payChecked++;
        const acts = page.locator(".cl-pay-act");
        await expect(acts).toHaveCount(3);
        for (let k = 0; k < 3; k++) await expect(acts.nth(k), "every decision is labelled").toHaveAccessibleName(/^\S.{4,}/);
        if (opts.answerRight) {
          const best = rightPayment(opts.m, subject);
          expect(best, `"${subject}" is in the manifest`).toBeTruthy();
          await page.locator(`.cl-pay-act.${best}`).click();
          await expect(page.locator(".cl-pay-stamp.right"), `"${subject}": the best decision is stamped right`).toBeVisible();
          decidedRight++;
        } else {
          await acts.nth(decided % 3).click();
        }
        await expect(page.locator(".cl-pay-fb"), "every decision explains itself").toBeVisible();
        decided++;
      }
      await page.locator(".cl-pay-next").click();
      await expect(page.locator(".cl-pay-log"), "the week's log shows").toBeVisible();
    }
    if (await page.locator(".cl-pay-log").count()) payLogged = true;
    /* A prove item: the right answer on the passing run, else the first. */
    if (await page.locator(".cl-opts.col .cl-opt:not(:disabled)").count()) {
      const stem = ((await page.locator(".cl-h1").first().textContent()) ?? "").trim();
      const right = opts.answerRight ? rightAnswerFor(opts.m, stem) : null;
      const target = right ? page.locator(".cl-opts.col .cl-opt:not(:disabled)", { hasText: right }) : page.locator(".cl-opts.col .cl-opt:not(:disabled)");
      await target.first().click();
      await page.waitForTimeout(120);
      await expect(page.locator(".cl-fb").first(), "every answer reveals its reasoning").toBeVisible();
    }
    if (await page.locator(".cl-stamp").count()) break;
    const pri = page.locator(".cl-nav .cl-btn-pri:not(:disabled)").first();
    if (!(await pri.count())) {
      stuckAt = eyebrow;
      break;
    }
    await pri.click();
  }
  const stamp = (await page.locator(".cl-stamp").textContent().catch(() => "")) ?? "";
  return { screens, stuckAt, errors, stamped: (await page.locator(".cl-stamp").count()) > 0, stamp, peeked, phoned, dayLogged, spotted, outboxed, outboxRight, lookedCloser, outboxLogged, decided, decidedRight, payChecked, payLogged };
}

/* Modules whose practice is an inbox, where the walker must have looked behind a sender and a link. */
const INBOX = new Set(MODULES.filter((m) => getAwarenessModule(m)!.tracks.general!.practise?.kind === "inbox"));
/* Modules whose practice is a day on the phone: the walker must have answered every notification and seen the day's log. */
const PHONE = new Map(MODULES.flatMap((m) => {
  const pr = getAwarenessModule(m)!.tracks.general!.practise;
  return pr?.kind === "phone" ? [[m, pr.events.length] as const] : [];
}));
/* Modules whose practice is a scene: the walker must have opened and called every spot in every view. */
const SCENE = new Map(MODULES.flatMap((m) => {
  const pr = getAwarenessModule(m)!.tracks.general!.practise;
  return pr?.kind === "scene" ? [[m, pr.views.reduce((a, v) => a + v.spots.length, 0)] as const] : [];
}));
/* Modules whose practice is an outbox: the walker must have dealt with every item, looked closer, and seen the outbox log. */
const OUTBOX = new Map(MODULES.flatMap((m) => {
  const pr = getAwarenessModule(m)!.tracks.general!.practise;
  return pr?.kind === "outbox" ? [[m, pr.items.length] as const] : [];
}));

/* Modules whose practice is a payment queue: the walker must have decided every request, taken a check on each, and seen the week's log. */
const PAYMENTS = new Map(MODULES.flatMap((m) => {
  const pr = getAwarenessModule(m)!.tracks.general!.practise;
  return pr?.kind === "payments" ? [[m, pr.requests.length] as const] : [];
}));

test.describe("Cyber Awareness modules play through to the result", () => {
  test.setTimeout(150_000);

  for (const m of MODULES) {
    test(`module ${m}, desktop`, async ({ page }) => {
      const r = await playThrough(page, `m=${m}`, { m });
      expect(r.stuckAt, `no way forward at "${r.stuckAt}" after ${r.screens} screens`).toBeNull();
      expect(r.stamped, "reached the result stamp").toBe(true);
      expect(r.errors, "no page or console errors").toEqual([]);
      if (INBOX.has(m)) expect(r.peeked, "looked behind a sender and a link in the inbox").toBe(true);
      if (PHONE.has(m)) {
        expect(r.phoned, "answered every notification on the phone").toBe(PHONE.get(m));
        expect(r.dayLogged, "saw the day's log").toBe(true);
      }
      if (SCENE.has(m)) expect(r.spotted, "opened and called every spot in the scene").toBe(SCENE.get(m));
      if (OUTBOX.has(m)) {
        expect(r.outboxed, "dealt with every item in the outbox").toBe(OUTBOX.get(m));
        expect(r.lookedCloser, "looked closer by keyboard").toBeGreaterThan(0);
        expect(r.outboxLogged, "saw the outbox log").toBe(true);
      }
      if (PAYMENTS.has(m)) {
        expect(r.decided, "decided every payment request").toBe(PAYMENTS.get(m));
        expect(r.payChecked, "took a check on every request").toBe(PAYMENTS.get(m));
        expect(r.payLogged, "saw the week's log").toBe(true);
      }
    });

    test(`module ${m}, right answers pass`, async ({ page }) => {
      const r = await playThrough(page, `m=${m}&track=finance`, { m, answerRight: true });
      expect(r.stuckAt).toBeNull();
      expect(r.stamp).toMatch(/Module done/i);
      expect(r.errors).toEqual([]);
      if (OUTBOX.has(m)) expect(r.outboxRight, "the right call on every outbox item is stamped right").toBe(OUTBOX.get(m));
      if (PAYMENTS.has(m)) expect(r.decidedRight, "the best decision on every payment request is stamped right").toBe(PAYMENTS.get(m));
    });

    test(`module ${m} on a phone`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const r = await playThrough(page, `m=${m}`, { m });
      expect(r.stuckAt).toBeNull();
      expect(r.stamped).toBe(true);
      expect(r.errors).toEqual([]);
      if (INBOX.has(m)) expect(r.peeked).toBe(true);
      if (PHONE.has(m)) {
        expect(r.phoned).toBe(PHONE.get(m));
        expect(r.dayLogged).toBe(true);
      }
      if (SCENE.has(m)) expect(r.spotted).toBe(SCENE.get(m));
      if (OUTBOX.has(m)) {
        expect(r.outboxed).toBe(OUTBOX.get(m));
        expect(r.outboxLogged).toBe(true);
      }
      if (PAYMENTS.has(m)) {
        expect(r.decided).toBe(PAYMENTS.get(m));
        expect(r.payLogged).toBe(true);
      }
    });
  }
});
