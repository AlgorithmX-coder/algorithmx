#!/usr/bin/env node
/**
 * qa-verdict-voice.mjs — drives a WRONG then a RIGHT answer in every button-
 * based exercise of the given weeks and checks that the shared spoken verdict
 * fired (a hidden <VerdictVoice> mounts with data-verdict-voice="wrong"|"right")
 * and that the narration click-guard appeared (= a recorded clip played and
 * held the screen). Canvas / drag engines (cyberScanner, spamBlaster,
 * proofScale, cyberMaze, memoryMatch) are not driven here.
 *
 * Usage: node scripts/qa-verdict-voice.mjs --week=3 [--week=15 ...]
 * Needs the dev server on :3006 with AX_LOCAL_QA=1 (site_auth cookie is set).
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:3006";
const OUT = "C:/Users/ASADJA~1/AppData/Local/Temp/claude/c--Users-Asad-Jalal-code-algorithmx/e0f9e610-8b50-4111-9260-5128af8f3c69/scratchpad/qa";
const WEEKS = process.argv.filter((a) => a.startsWith("--week=")).map((a) => Number(a.slice(7)));
if (!WEEKS.length) WEEKS.push(3);

/* ── content parsing (same shape as audit-verdict-voice.mjs) ── */
const STR = '"((?:[^"\\\\]|\\\\.)*)"';
const un = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
const fld = (span, k) => { const m = span.match(new RegExp("\\b" + k + ":\\s*" + STR)); return m ? un(m[1]) : null; };
const flag = (span, k) => { const m = span.match(new RegExp("\\b" + k + ":\\s*(true|false)")); return m ? m[1] === "true" : null; };
const objs = (span, listKey) => {
  const i = span.search(new RegExp("\\b" + listKey + ":\\s*\\[")); if (i < 0) return [];
  const a = span.indexOf("[", i); let depth = 0, start = -1; const out = [];
  for (let j = a; j < span.length; j++) {
    const ch = span[j];
    if (ch === "[") depth++;
    else if (ch === "]") { depth--; if (depth === 0) break; }
    else if (ch === "{") { if (depth === 1) start = j; depth++; }
    else if (ch === "}") { depth--; if (depth === 1 && start >= 0) { out.push(span.slice(start, j + 1)); start = -1; } }
  }
  return out;
};
const screensOf = (w) => {
  const src = readFileSync(`app/lesson/weekContent/week${w}.ts`, "utf8");
  const start = src.indexOf("  screens: [");
  const starts = [...src.slice(start).matchAll(/^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm)].map((m) => ({ t: m[1], o: start + m.index }));
  return starts.map((st, i) => ({ i, type: st.t, span: src.slice(st.o, i + 1 < starts.length ? starts[i + 1].o : src.length) }));
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const short = (s, n = 36) => s.replace(/\s+/g, " ").trim().slice(0, n);

/* ── browser ── */
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1414, height: 771 } });
await ctx.addCookies([{ name: "site_auth", value: "true", domain: "localhost", path: "/" }]);
// Recorded clips never fire `ended` in headless Edge (Build Standard gotcha), so
// every hold would wait on a safety timer. Fake play() for VOICE clips only: the
// clip "ends" after 300ms, the guard drops on cue, and the lesson video stays real.
await ctx.addInitScript(() => {
  const realPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) {
    const src = this.currentSrc || this.src || "";
    if (!src.includes("/audio/voice/") && !src.includes("/audio/atlas/")) return realPlay.apply(this, a);
    // 700ms: long enough for the 80ms guard poll to see the hold, short enough to stay quick.
    setTimeout(() => this.dispatchEvent(new Event("ended")), 700);
    return Promise.resolve();
  };
});
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

const guardUp = () => page.evaluate(() => !!document.querySelector("[data-narration-guard]") || /Listening/i.test(document.body.innerText));
async function waitQuiet(ms = 45000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (!(await guardUp())) return true; await page.waitForTimeout(150); }
  return false;
}
async function waitGuard(ms = 3500) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await guardUp()) return true; await page.waitForTimeout(80); }
  return false;
}
const go = async (w, n) => { await page.goto(`${BASE}/lesson/${w}?screen=${n}`, { waitUntil: "domcontentloaded", timeout: 90000 }); await page.waitForTimeout(1800); };
async function dismissIntro(ms = 80000) {
  const btn = page.getByRole("button", { name: /I'm ready|Let's go|Let's play|Start|Begin/i }).first();
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if ((await btn.isVisible().catch(() => false)) && (await btn.isEnabled().catch(() => false)) && !(await guardUp())) {
      await btn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(600);
      return true;
    }
    await page.waitForTimeout(250);
  }
  return false;
}
const btn = (text) => page.getByRole("button", { name: new RegExp(esc(short(text)), "i") }).first();
async function clickBtn(text, ms = 60000) {
  const b = btn(text);
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if ((await b.isVisible().catch(() => false)) && (await b.isEnabled().catch(() => false)) && !(await guardUp())) {
      await b.click({ force: true }).catch(() => {});
      return true;
    }
    await page.waitForTimeout(150);
  }
  return false;
}
async function clickLabel(label, ms = 60000) { return clickBtn(label, ms); }
async function visibleOf(list, key) {
  for (const o of list) { const t = o[key]; if (!t) continue; if (await page.getByText(short(t, 30), { exact: false }).first().isVisible().catch(() => false)) return o; }
  return null;
}
/** After a pick: did the verdict mount, did a clip hold the screen; then let it finish and clear any panel. */
async function afterPick(kind) {
  let mounted = false; const t0 = Date.now();
  while (Date.now() - t0 < 4000) { if (await page.evaluate((k) => !!document.querySelector(`[data-verdict-voice="${k}"]`), kind)) { mounted = true; break; } await page.waitForTimeout(80); }
  const guard = await waitGuard(3500);
  await waitQuiet(45000);
  const got = page.getByRole("button", { name: /Got it/i }).first();
  if (await got.isVisible().catch(() => false)) { await got.click({ force: true }).catch(() => {}); await page.waitForTimeout(400); await waitQuiet(20000); }
  return { mounted, guard };
}

const results = [];
const rec = (week, screen, engine, wrong, right, note = "") => { results.push({ week, screen, engine, wrong, right, note }); console.log(`W${week} [${screen}] ${engine}: wrong=${fmt(wrong)} right=${fmt(right)} ${note}`); };
const fmt = (v) => v == null ? "-" : typeof v === "string" ? v : `${v.mounted ? "mounted" : "NO-MOUNT"}/${v.guard ? "held" : "no-guard"}`;

/* ── drivers ── */
const D = {
  async quickCheck(w, sc) {
    const mode = fld(sc.span, "mode");
    const choices = objs(sc.span, "choices").map((o) => ({ text: fld(o, "text"), ok: flag(o, "isCorrect") }));
    const teach = /teachNarration:\s*\{/.test(sc.span);
    // A fresh browser context fetches the voice manifest on this very screen, so
    // Sarah's prompt can start a second or two AFTER the buttons are enabled. Wait
    // for the prompt to START (guard up) and finish, as a child listening would;
    // a tap in that gap gets swallowed by the prompt's guard and reads as a false failure.
    await go(w, sc.i); await waitGuard(8000); await waitQuiet();
    if (mode === "order") {
      const wrongTile = choices[1]; await clickBtn(wrongTile.text); const wr = await afterPick("wrong");
      for (const c of choices) { await clickBtn(c.text); await page.waitForTimeout(300); await waitQuiet(); }
      return rec(w, sc.i, "quickCheck/order", wr, teach ? "teach" : await afterPick("right"));
    }
    const wrong = choices.find((c) => !c.ok), right = choices.find((c) => c.ok);
    await clickBtn(wrong.text); const wr = await afterPick("wrong");
    await clickBtn(right.text); const rt = teach ? (await page.getByRole("button", { name: /Got it/i }).first().waitFor({ timeout: 60000 }).then(() => "teach").catch(() => "TEACH-MISSING")) : await afterPick("right");
    rec(w, sc.i, `quickCheck/${mode}`, wr, rt);
  },
  async conveyorSort(w, sc) {
    const cats = objs(sc.span, "categories").map((o) => ({ id: fld(o, "id"), label: fld(o, "label") }));
    const items = objs(sc.span, "items").map((o) => ({ text: fld(o, "text"), cat: fld(o, "categoryId") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const item = await visibleOf(items, "text"); if (!item) return rec(w, sc.i, "conveyorSort", "no-item", null);
    const right = cats.find((c) => c.id === item.cat), wrong = cats.find((c) => c.id !== item.cat);
    await clickLabel(`Send the card to ${wrong.label}`); const wr = await afterPick("wrong");
    await clickLabel(`Send the card to ${right.label}`); const rt = await afterPick("right");
    rec(w, sc.i, "conveyorSort", wr, rt);
  },
  async clueBoard(w, sc) {
    const clues = objs(sc.span, "clues").map((o) => fld(o, "label"));
    const opts = objs(sc.span, "options").map((o) => ({ text: fld(o, "text"), ok: flag(o, "isCorrect") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    for (const c of clues) { await clickLabel(`Inspect ${c}`); await page.waitForTimeout(400); await waitQuiet(); }
    await clickBtn(opts.find((o) => !o.ok).text); const wr = await afterPick("wrong");
    await clickBtn(opts.find((o) => o.ok).text); const rt = await afterPick("right");
    rec(w, sc.i, "clueBoard", wr, rt);
  },
  async senderLineup(w, sc) {
    const rounds = objs(sc.span, "rounds").map((r) => ({ prompt: fld(r, "prompt"), senders: objs(r, "senders").map((o) => ({ name: fld(o, "name"), fake: flag(o, "isFake") })) }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const round = await visibleOf(rounds, "prompt"); if (!round) return rec(w, sc.i, "senderLineup", "no-round", null);
    await clickBtn(round.senders.find((s) => !s.fake).name); const wr = await afterPick("wrong");
    await clickBtn(round.senders.find((s) => s.fake).name); const rt = await afterPick("right");
    rec(w, sc.i, "senderLineup", wr, rt);
  },
  async trailStamper(w, sc) {
    const spots = objs(sc.span, "spots").map((s) => ({ prompt: fld(s, "prompt"), options: objs(s, "options").map((o) => ({ label: fld(o, "label"), proud: flag(o, "isProud") })) }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const spot = await visibleOf(spots, "prompt"); if (!spot) return rec(w, sc.i, "trailStamper", "no-spot", null);
    await clickBtn(spot.options.find((o) => !o.proud).label); const wr = await afterPick("wrong");
    await clickBtn(spot.options.find((o) => o.proud).label); const rt = await afterPick("right");
    rec(w, sc.i, "trailStamper", wr, rt);
  },
  async vaultDrop(w, sc) {
    const items = objs(sc.span, "items").map((o) => ({ text: fld(o, "text"), priv: flag(o, "isPrivate") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const item = await visibleOf(items, "text"); if (!item) return rec(w, sc.i, "vaultDrop", "no-item", null);
    const VAULT = "The vault - keep private", BOARD = "Share board - safe to share";
    await clickLabel(item.priv ? BOARD : VAULT); const wr = await afterPick("wrong");
    await clickLabel(item.priv ? VAULT : BOARD); const rt = await afterPick("right");
    rec(w, sc.i, "vaultDrop", wr, rt);
  },
  async requestInspector(w, sc) {
    const reqs = objs(sc.span, "requests").map((r) => ({ appName: fld(r, "appName"), nosy: flag(r, "isNosy"), zones: objs(r, "zones").map((z) => fld(z, "label")) }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const req = await visibleOf(reqs, "appName"); if (!req) return rec(w, sc.i, "requestInspector", "no-request", null);
    for (const z of req.zones) { await clickLabel(`Inspect: ${z}`); await page.waitForTimeout(300); await waitQuiet(); }
    await waitQuiet();
    const FAIR = /Looks fair|fair/i, NOSY = /Too nosy|nosy/i;
    const click = async (re) => { const b = page.getByRole("button", { name: re }).first(); const t0 = Date.now(); while (Date.now() - t0 < 60000) { if ((await b.isEnabled().catch(() => false)) && !(await guardUp())) { await b.click({ force: true }); return; } await page.waitForTimeout(150); } };
    await click(req.nosy ? FAIR : NOSY); const wr = await afterPick("wrong");
    await click(req.nosy ? NOSY : FAIR); const rt = await afterPick("right");
    rec(w, sc.i, "requestInspector", wr, rt);
  },
  async usernameBuilder(w, sc) {
    const parts = objs(sc.span, "parts").map((o) => ({ text: fld(o, "text"), trap: fld(o, "trap") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    await clickBtn(parts.find((p) => p.trap).text); const wr = await afterPick("wrong");
    await clickBtn(parts.find((p) => !p.trap).text); const rt = await afterPick("right");
    rec(w, sc.i, "usernameBuilder", wr, rt);
  },
  async stepOrder(w, sc) {
    const steps = objs(sc.span, "steps").map((o) => fld(o, "text"));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    await clickBtn(steps[1]); const wr = await afterPick("wrong");
    await clickBtn(steps[0]); const rt = await afterPick("right");
    rec(w, sc.i, "stepOrder", wr, rt);
  },
  async weakSorter(w, sc) {
    const reasons = objs(sc.span, "reasons").map((o) => ({ id: fld(o, "id"), label: fld(o, "label") }));
    const items = objs(sc.span, "items").map((o) => ({ text: fld(o, "text"), reason: fld(o, "reasonId") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const item = await visibleOf(items, "text"); if (!item) return rec(w, sc.i, "weakSorter", "no-item", null);
    await clickBtn(reasons.find((r) => r.id !== item.reason).label); const wr = await afterPick("wrong");
    await clickBtn(reasons.find((r) => r.id === item.reason).label); const rt = await afterPick("right");
    rec(w, sc.i, "weakSorter", wr, rt);
  },
  async passwordHospital(w, sc) {
    const reasons = objs(sc.span, "reasons").map((o) => ({ id: fld(o, "id"), label: fld(o, "label") }));
    const patients = objs(sc.span, "patients").map((o) => ({ password: fld(o, "password"), reason: fld(o, "primaryReason") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const p = await visibleOf(patients, "password"); if (!p) return rec(w, sc.i, "passwordHospital", "no-patient", null);
    await clickBtn(reasons.find((r) => r.id !== p.reason).label); const wr = await afterPick("wrong");
    await clickBtn(reasons.find((r) => r.id === p.reason).label); const rt = await afterPick("right");
    rec(w, sc.i, "passwordHospital", wr, rt);
  },
  async chooseYourPath(w, sc) {
    const scen = objs(sc.span, "scenarios").map((s) => ({ setup: fld(s, "setup"), choices: objs(s, "choices").map((c) => ({ text: fld(c, "text"), safe: flag(c, "isSafe") })) }));
    const device = fld(sc.span, "presentation") === "device";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const s1 = await visibleOf(scen, "setup"); if (!s1) return rec(w, sc.i, device ? "pauseDecide" : "chooseYourPath", "no-scenario", null);
    const pick = (c) => device ? clickLabel(c.text) : clickLabel(`Choose: ${c.text}`);
    await pick(s1.choices.find((c) => !c.safe)); const wr = await afterPick("wrong");
    const cont = page.getByRole("button", { name: /Continue|Next/i }).first();
    if (await cont.isVisible().catch(() => false)) { await cont.click({ force: true }).catch(() => {}); await page.waitForTimeout(800); }
    await waitQuiet();
    const s2 = (await visibleOf(scen.filter((s) => s !== s1), "setup")) ?? s1;
    await pick(s2.choices.find((c) => c.safe)); const rt = await afterPick("right");
    rec(w, sc.i, device ? "pauseDecide" : "chooseYourPath", wr, rt);
  },
  async signBingo(w, sc) {
    const signs = objs(sc.span, "signs").map((o) => ({ id: fld(o, "id"), label: fld(o, "label") }));
    const rounds = objs(sc.span, "rounds").map((o) => ({ scene: fld(o, "scene"), signId: fld(o, "signId") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const round = await visibleOf(rounds, "scene"); if (!round) return rec(w, sc.i, "signBingo", "no-round", null);
    await clickLabel(signs.find((s) => s.id !== round.signId).label); const wr = await afterPick("wrong");
    await clickLabel(signs.find((s) => s.id === round.signId).label); const rt = await afterPick("right");
    rec(w, sc.i, "signBingo", wr, rt);
  },
  async plaquePeek(w, sc) {
    const doors = objs(sc.span, "doors").map((o) => ({ claim: fld(o, "claim"), matches: flag(o, "matches") }));
    const matchLabel = fld(sc.span, "matchLabel") ?? "goes where it says", sneakyLabel = fld(sc.span, "sneakyLabel") ?? "sneaky";
    const peek = fld(sc.span, "peekPrompt") ?? "PEEK";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const door = await visibleOf(doors, "claim"); if (!door) return rec(w, sc.i, "plaquePeek", "no-door", null);
    await clickBtn(peek); await page.waitForTimeout(500); await waitQuiet();
    await clickBtn(door.matches ? sneakyLabel : matchLabel); const wr = await afterPick("wrong");
    await clickBtn(door.matches ? matchLabel : sneakyLabel); const rt = await afterPick("right");
    rec(w, sc.i, "plaquePeek", wr, rt);
  },
  async clueStamper(w, sc) {
    const cases = objs(sc.span, "cases").map((o) => ({ handle: fld(o, "handle"), clues: objs(o, "clues").map((c) => ({ id: fld(c, "id"), red: flag(c, "isRedFlag") })) }));
    const closeLabel = fld(sc.span, "closeLabel") ?? "CLOSE THE CASE";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const c = await visibleOf(cases, "handle"); if (!c) return rec(w, sc.i, "clueStamper", "no-case", null);
    const ROW = { when: /WHEN did it join/i, who: /WHO are its friends/i, how: /HOW does it talk/i, what: /WHAT does it ask/i };
    const clickRow = async (id) => { const b = page.getByRole("button", { name: ROW[id] }).first(); const t0 = Date.now(); while (Date.now() - t0 < 60000) { if ((await b.isEnabled().catch(() => false)) && !(await guardUp())) { await b.click({ force: true }); return; } await page.waitForTimeout(150); } };
    // WRONG: stamp exactly the opposite set (every clean row stamped, every sneaky row clean)
    for (const cl of c.clues) if (!cl.red) { await clickRow(cl.id); await page.waitForTimeout(250); }
    await clickBtn(closeLabel); const wr = await afterPick("wrong");
    // FIX: toggling every row turns the opposite set into the exact sneaky set
    for (const cl of c.clues) { await clickRow(cl.id); await page.waitForTimeout(250); }
    await clickBtn(closeLabel); const rt = await afterPick("right");
    rec(w, sc.i, "clueStamper", wr, rt);
  },
  async profileInspector(w, sc) {
    const profiles = objs(sc.span, "profiles").map((o) => ({ handle: fld(o, "handle"), fake: flag(o, "isFake"), zones: objs(o, "zones").map((z) => fld(z, "label")) }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const p = await visibleOf(profiles, "handle"); if (!p) return rec(w, sc.i, "profileInspector", "no-profile", null);
    for (const z of p.zones) { await clickLabel(`Inspect: ${z}`); await page.waitForTimeout(300); await waitQuiet(); }
    await waitQuiet();
    const FAKE = /FAKE/i, REAL = /Real/i;
    const click = async (re) => { const b = page.getByRole("button", { name: re }).first(); const t0 = Date.now(); while (Date.now() - t0 < 60000) { if ((await b.isEnabled().catch(() => false)) && !(await guardUp())) { await b.click({ force: true }); return; } await page.waitForTimeout(150); } };
    await click(p.fake ? REAL : FAKE); const wr = await afterPick("wrong");
    await click(p.fake ? FAKE : REAL); const rt = await afterPick("right");
    rec(w, sc.i, "profileInspector", wr, rt);
  },
  async popupPanic(w, sc) {
    const pops = objs(sc.span, "popups").map((o) => ({ body: fld(o, "body") ?? fld(o, "title"), flag: flag(o, "isRedFlag") !== false }));
    const flagLabel = fld(sc.span, "flagLabel") ?? "Red flag", fineLabel = fld(sc.span, "fineLabel") ?? "Friendly ask";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const p = await visibleOf(pops, "body"); if (!p) return rec(w, sc.i, "popupPanic", "no-popup", null);
    await clickBtn(p.flag ? fineLabel : flagLabel); const wr = await afterPick("wrong");
    await clickBtn(p.flag ? flagLabel : fineLabel); const rt = await afterPick("right");
    rec(w, sc.i, "popupPanic", wr, rt);
  },
  async chatSimulator(w, sc) {
    const groups = objs(sc.span, "choices").map((g) => objs(g, "options").map((o) => ({ text: fld(o, "text"), safe: flag(o, "isSafe") })));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const waitChoice = async () => { const t0 = Date.now(); while (Date.now() - t0 < 90000) { for (const g of groups) if (await btn(g[0].text).isVisible().catch(() => false)) return g; await page.waitForTimeout(200); } return null; };
    const g1 = await waitChoice(); if (!g1) return rec(w, sc.i, "chatSimulator", "no-choice", null);
    await clickBtn(g1.find((o) => !o.safe).text); const wr = await afterPick("wrong");
    const g2 = await waitChoice(); if (!g2) return rec(w, sc.i, "chatSimulator", wr, "no-2nd-choice");
    await clickBtn(g2.find((o) => o.safe).text); const rt = await afterPick("right");
    rec(w, sc.i, "chatSimulator", wr, rt);
  },
  async teamPoster(w, sc) {
    const tiles = objs(sc.span, "tiles").map((o) => ({ label: fld(o, "label"), team: flag(o, "isTeam") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    await clickBtn(tiles.find((t) => !t.team).label); const wr = await afterPick("wrong");
    await clickBtn(tiles.find((t) => t.team).label); const rt = await afterPick("right");
    rec(w, sc.i, "teamPoster", wr, rt);
  },
  // ── Week 4 engines (2026-09-16) ──
  async stringsAttached(w, sc) {
    const TOKEN = { password: "Your password", money: "Your money", tap: "Your tap", nothing: "Nothing, it's real" };
    const offers = objs(sc.span, "offers").map((o) => ({ text: fld(o, "text"), wants: fld(o, "wants") }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const o = await visibleOf(offers, "text"); if (!o) return rec(w, sc.i, "stringsAttached", "no-offer", null);
    await clickLabel(`Prize: ${o.text}`); await page.waitForTimeout(300); await waitQuiet();
    const wrongWant = Object.keys(TOKEN).find((k) => k !== o.wants);
    await clickLabel(`String leads to: ${TOKEN[wrongWant]}`); const wr = await afterPick("wrong");
    await clickLabel(`String leads to: ${TOKEN[o.wants]}`); const rt = await afterPick("right");
    rec(w, sc.i, "stringsAttached", wr, rt);
  },
  async believeOMeter(w, sc) {
    const POS = { real: 0, hmm: 1, noway: 2 };
    const offers = objs(sc.span, "offers").map((o) => ({ text: fld(o, "text"), answer: fld(o, "answer") }));
    const lockLabel = fld(sc.span, "lockLabel") ?? "LOCK IT IN";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const o = await visibleOf(offers, "text"); if (!o) return rec(w, sc.i, "believeOMeter", "no-offer", null);
    let needle = 1; // always starts on the middle stop
    const turn = async (dir) => { await clickLabel(dir < 0 ? "Turn the needle left" : "Turn the needle right"); needle += dir; await page.waitForTimeout(250); };
    // WRONG: lock anywhere that is not the answer
    if (POS[o.answer] === needle) await turn(1);
    await clickBtn(lockLabel); const wr = await afterPick("wrong");
    // RIGHT: walk the needle to the answer, then lock
    while (needle !== POS[o.answer]) await turn(POS[o.answer] > needle ? 1 : -1);
    await clickBtn(lockLabel); const rt = await afterPick("right");
    rec(w, sc.i, "believeOMeter", wr, rt);
  },
  async nameTagCheck(w, sc) {
    const cases = objs(sc.span, "cases").map((o) => ({ id: fld(o, "id"), chunks: objs(o, "chunks").map((c) => ({ text: fld(c, "text"), wrong: flag(c, "isWrong") })) }));
    const closeLabel = fld(sc.span, "closeLabel") ?? "CLOSE THE BOOTH";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    // the case on screen = the one whose pieces are all tappable buttons (the real tag's pieces are plain divs)
    let c = null;
    for (const k of cases) { let all = true; for (const ch of k.chunks) if (!(await page.getByRole("button", { name: `Piece: ${ch.text}` }).first().isVisible().catch(() => false))) { all = false; break; } if (all) { c = k; break; } }
    if (!c) return rec(w, sc.i, "nameTagCheck", "no-case", null);
    // WRONG: mark exactly the opposite set (every matching piece marked, every swapped piece clean)
    for (const ch of c.chunks) if (!ch.wrong) { await clickLabel(`Piece: ${ch.text}`); await page.waitForTimeout(250); }
    await clickBtn(closeLabel); const wr = await afterPick("wrong");
    // FIX: toggling every piece turns the opposite set into the exact swapped set
    for (const ch of c.chunks) { await clickLabel(`Piece: ${ch.text}`); await page.waitForTimeout(250); }
    await clickBtn(closeLabel); const rt = await afterPick("right");
    rec(w, sc.i, "nameTagCheck", wr, rt);
  },
  async firewallBuilder(w, sc) {
    const bricks = objs(sc.span, "bricks").map((o) => ({ text: fld(o, "text"), good: flag(o, "good") }));
    const binLabel = fld(sc.span, "binLabel") ?? "THROW IT OUT";
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const b = await visibleOf(bricks, "text"); if (!b) return rec(w, sc.i, "firewallBuilder", "no-brick", null);
    const COL = "Lay the brick in column 1";
    await clickLabel(b.good ? binLabel : COL); const wr = await afterPick("wrong");
    await clickLabel(b.good ? COL : binLabel); const rt = await afterPick("right");
    rec(w, sc.i, "firewallBuilder", wr, rt);
  },
  async phishInspector(w, sc) {
    const emails = objs(sc.span, "emails").map((o) => ({ subject: fld(o, "subject"), phish: flag(o, "isPhishing") }));
    const zl = objs(sc.span, "zoneLabels");
    const zoneBlock = sc.span.match(/zoneLabels:\s*\{([\s\S]*?)\}/);
    const labels = zoneBlock ? [...zoneBlock[1].matchAll(new RegExp(STR, "g"))].map((m) => un(m[1])) : ["Who sent it?", "What's the link?", "How does it sound?", "What's it promising?"];
    const zap = fld(sc.span, "zapLabel") ?? "ZAP it!", safe = fld(sc.span, "safeLabel") ?? "Mark SAFE";
    void zl;
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    const e = await visibleOf(emails, "subject"); if (!e) return rec(w, sc.i, "phishInspector", "no-email", null);
    for (const l of labels) { await clickBtn(l); await page.waitForTimeout(300); await waitQuiet(); }
    await waitQuiet();
    await clickBtn(e.phish ? safe : zap); const wr = await afterPick("wrong");
    await clickBtn(e.phish ? zap : safe); const rt = await afterPick("right");
    rec(w, sc.i, "phishInspector", wr, rt);
  },
  async passwordVault(w, sc) {
    const locks = objs(sc.span, "locks").map((l) => ({ label: fld(l, "ruleLabel"), choices: objs(l, "choices").map((c) => ({ text: fld(c, "text"), ok: flag(c, "isCorrect") })) }));
    await go(w, sc.i); await dismissIntro(); await waitQuiet(); await page.waitForTimeout(1500);
    const lock = locks[0];
    const spot = page.getByRole("button", { name: new RegExp(esc(lock.label), "i") }).first();
    if (!(await spot.isVisible().catch(() => false))) return rec(w, sc.i, "passwordVault", "no-hotspot", null, "no button named " + lock.label);
    await spot.click({ force: true }); await page.waitForTimeout(600); await waitQuiet();
    await clickBtn(lock.choices.find((c) => !c.ok).text); const wr = await afterPick("wrong");
    if (!(await btn(lock.choices.find((c) => c.ok).text).isVisible().catch(() => false))) { await spot.click({ force: true }).catch(() => {}); await page.waitForTimeout(600); await waitQuiet(); }
    await clickBtn(lock.choices.find((c) => c.ok).text); const rt = await afterPick("right");
    rec(w, sc.i, "passwordVault", wr, rt);
  },
  async threeRandomWords(w, sc) {
    const words = objs(sc.span, "words").map((o) => fld(o, "text")).slice(0, 3);
    await go(w, sc.i); await dismissIntro(); await waitQuiet();
    for (const t of words) { await clickBtn(t); await page.waitForTimeout(250); }
    const build = page.getByRole("button", { name: /Build|Make|Forge|Create|Submit|Done/i }).first();
    if (await build.isVisible().catch(() => false)) await build.click({ force: true }).catch(() => {});
    const rt = await afterPick("right");
    rec(w, sc.i, "threeRandomWords", "n/a", rt);
  },
};

// ONLY=13,17 limits a run to those screen indices (re-checks after a stall).
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",").map(Number)) : null;
for (const w of WEEKS) {
  const seen = new Set();
  for (const sc of screensOf(w)) {
    if (!D[sc.type]) continue;
    if (ONLY && !ONLY.has(sc.i)) continue;
    if (sc.type !== "quickCheck" && seen.has(sc.type)) continue;
    seen.add(sc.type);
    const before = pageErrors.length;
    try { await D[sc.type](w, sc); } catch (e) { rec(w, sc.i, sc.type, "DRIVER-ERROR", null, String(e.message).slice(0, 120)); }
    if (pageErrors.length > before) console.log("   PAGE ERROR:", pageErrors.slice(before).join(" | ").slice(0, 300));
  }
}
await browser.close();
writeFileSync(`${OUT}/verdict-qa-results.json`, JSON.stringify({ results, pageErrors }, null, 2));
const bad = results.filter((r) => (r.wrong && r.wrong.mounted === false) || (r.right && r.right.mounted === false) || r.wrong === "DRIVER-ERROR");
console.log(`\n${results.length} engine runs · ${bad.length} with a missing verdict mount or driver error · ${pageErrors.length} page error(s)`);
