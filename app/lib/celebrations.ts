import { playSound } from "@/app/lib/sounds";

/* ───────────────────────── LOTTIE OVERLAY ───────────────────
 *
 * When a Lottie path is set on `window.__axLottieOverlay__` (via the
 * <LottieOverlayHost />  component, which gets mounted once near the
 * lesson root), every celebration / badge / wrong-answer fires an
 * overlay Lottie INSTEAD of the canvas-confetti burst.  This is the
 * graceful upgrade path: drop a .lottie file in /public/lottie/, set
 * its path on the global, and the lesson uses it everywhere the
 * legacy effect was firing.
 *
 * If no Lottie is configured, the old canvas-confetti burst still
 * fires.  No regression; pure additive enhancement.
 */

interface LottieOverlayHandle {
  fire: (kind: "correct" | "wrong" | "badge", streak?: number) => void;
}

const LOTTIE_HANDLE_KEY = "__axLottieOverlay__";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __axLottieOverlay__?: LottieOverlayHandle;
  }
}

function fireLottieOverlay(
  kind: "correct" | "wrong" | "badge",
  streak: number = 0,
): boolean {
  if (typeof window === "undefined") return false;
  const handle = window[LOTTIE_HANDLE_KEY];
  if (!handle) return false;
  try {
    handle.fire(kind, streak);
    return true;
  } catch {
    return false;
  }
}

/* ───────────────────────── PALETTE ───────────────────────── */
/*
 * Was warm Pixar (`#f97316`, `#f59e0b`) which clashed with the cyber
 * surface introduced for the lesson player.  Now sources from the same
 * palette as cyberTokens.ts: lime / cyan / cosmic-violet / neon-pink /
 * gold.  Gold survived as a celebration accent because it's the
 * universal "you earned it" cue across kids' apps.
 */
const BRAND_COLORS = [
  "#7eff97", // lime
  "#00e5ff", // cyan
  "#7c5cff", // cosmic violet
  "#ff5fb3", // neon pink
  "#ffd158", // gold
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/* ───────────────────────── HIT-STOP ───────────────────────── */
/*
 * Game-feel primitive - a sub-100ms "thunk" of feedback applied to a
 * target element on a positive event.  Briefly scales it up + brightens,
 * then snaps back.  The brain reads this as weight / impact, the same
 * pattern Mario / Hollow Knight / Celeste use on hit and pickup.  Pure
 * code - no extra assets needed.
 *
 * Default target is `document.body` so callers can fire-and-forget
 * without grabbing a ref.  Pass a specific element for a localised
 * pulse (e.g. the answer card the kid just tapped).
 */
export function hitStop(target?: HTMLElement | null): void {
  if (typeof document === "undefined") return;
  const el = target ?? document.body;
  // Bail if a previous hit-stop hasn't completed - avoids stacking
  // transforms which look glitchy.
  if (el.dataset.hitStopActive === "1") return;
  el.dataset.hitStopActive = "1";

  const prevTransition = el.style.transition;
  const prevTransform = el.style.transform;
  const prevFilter = el.style.filter;

  el.style.transition = "transform 80ms ease-out, filter 80ms ease-out";
  el.style.transform = `${prevTransform || ""} scale(1.015)`.trim();
  el.style.filter = `${prevFilter || ""} brightness(1.18) saturate(1.18)`.trim();

  window.setTimeout(() => {
    el.style.transform = prevTransform;
    el.style.filter = prevFilter;
    window.setTimeout(() => {
      el.style.transition = prevTransition;
      delete el.dataset.hitStopActive;
    }, 100);
  }, 80);
}

/* ───────────────────────── CORRECT ANSWER ───────────────────────── */
/*
 * Streak-scaled celebration.  Was a fixed 40-particle burst regardless
 * of streak, so a kid getting their 1st right answer felt the same as
 * their 10th in a row - no progressive reward.  Now scales with streak:
 *
 *   1   → 25 particles, modest spread, no second wave
 *   3+  → 50 particles, bigger spread, snappier velocity
 *   5+  → adds a top-down second wave (200ms after primary)
 *   10+ → adds full-screen side bursts (400ms after primary)
 *
 * Also fires `hitStop()` automatically so every correct answer carries
 * a visceral "thunk" of feedback regardless of where it's called.
 */
export async function correctAnswerBurst(
  streak: number = 1,
  target?: HTMLElement | null,
): Promise<void> {
  playSound("correct");
  hitStop(target);
  if (!isBrowser()) return;
  /* Notify any global listeners (StreakIndicator, achievement hooks). */
  try {
    window.dispatchEvent(
      new CustomEvent("algorithmx:answer-correct", { detail: { streak } }),
    );
  } catch {
    /* ignore */
  }

  // If a Lottie celebration is configured at the page level, play that
  // INSTEAD of the canvas-confetti burst.  The Lottie itself was made
  // by a real animator so it carries craft the confetti can't.
  const lottieFired = fireLottieOverlay("correct", streak);
  if (lottieFired) return;

  const confetti = (await import("canvas-confetti")).default;

  const particleCount = Math.min(120, 25 + Math.floor(streak * 7));
  const spread = Math.min(120, 50 + streak * 5);
  const startVelocity = 25 + Math.min(20, streak * 1.5);

  confetti({
    particleCount,
    spread,
    startVelocity,
    gravity: 0.85,
    ticks: 70,
    origin: { x: 0.5, y: 0.55 },
    colors: BRAND_COLORS,
  });

  // Streak 5+: second wave from above for a fuller payoff.
  if (streak >= 5) {
    window.setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 100,
        startVelocity: 38,
        gravity: 1,
        ticks: 90,
        origin: { x: 0.5, y: 0.35 },
        colors: BRAND_COLORS,
      });
    }, 200);
  }

  // Streak 10+: full-screen side bursts.  Rare event so it actually
  // feels rare when it happens.
  if (streak >= 10) {
    window.setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 80,
        startVelocity: 50,
        ticks: 120,
        origin: { x: 0, y: 0.6 },
        colors: BRAND_COLORS,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 80,
        startVelocity: 50,
        ticks: 120,
        origin: { x: 1, y: 0.6 },
        colors: BRAND_COLORS,
      });
    }, 400);
  }
}

/* ───────────────────────── WRONG ANSWER ───────────────────────── */
/*
 * Tighter shake than before.  Old version: body-level x-axis only,
 * 4px amplitude, 300ms with default ease - read as "harsh slap".
 * Now uses both axes (more natural physical-object feel), 3px
 * amplitude (subtler), 250ms with cubic-bezier(.36,.07,.19,.97) so
 * it settles instead of bouncing.  Sympathetic, not punitive - kids
 * audience.
 */
export function dispatchWrongAnswer(): void {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent("algorithmx:answer-wrong"));
  } catch {
    /* ignore */
  }
}

export function wrongAnswerShake(): void {
  playSound("wrong");
  if (!isBrowser()) return;

  /* Reset streak for any listeners (StreakIndicator). */
  try {
    window.dispatchEvent(new CustomEvent("algorithmx:answer-wrong"));
  } catch {
    /* ignore */
  }

  // If a Lottie wrong-reaction overlay is configured, fire that
  // alongside (not instead of) the body shake - the shake is good
  // tactile feedback and the Lottie adds character life.
  fireLottieOverlay("wrong");

  const styleId = "ax-screen-shake-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = `@keyframes screenShake {
      0%   { transform: translate(0, 0); }
      15%  { transform: translate(-3px, 1px); }
      30%  { transform: translate(3px, -1px); }
      45%  { transform: translate(-2px, 2px); }
      60%  { transform: translate(2px, -1px); }
      75%  { transform: translate(-1px, 1px); }
      100% { transform: translate(0, 0); }
    }`;
    document.head.appendChild(styleEl);
  }
  const body = document.body;
  body.style.animation = "screenShake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97)";
  window.setTimeout(() => {
    body.style.animation = "";
  }, 250);
}

/* ───────────────────────── BADGE EARNED ───────────────────────── */

export async function badgeEarnedCelebration(): Promise<void> {
  playSound("badge-earned");
  hitStop();
  if (!isBrowser()) return;

  // Lottie overlay takes precedence if configured.
  const lottieFired = fireLottieOverlay("badge");
  if (lottieFired) return;

  const confetti = (await import("canvas-confetti")).default;

  const fire = (angle: number, originX: number, particles: number) => {
    confetti({
      particleCount: particles,
      angle,
      spread: 80,
      startVelocity: 45,
      ticks: 120,
      origin: { x: originX, y: 0.6 },
      colors: BRAND_COLORS,
    });
  };

  fire(60, 0, 80);
  fire(120, 1, 80);
  window.setTimeout(() => {
    fire(60, 0.1, 40);
    fire(120, 0.9, 40);
  }, 200);
}

/* ───────────────────────── BOSS DEFEATED ───────────────────────── */

export async function bossDefeatedExplosion(): Promise<void> {
  playSound("boss-defeated");
  hitStop();
  if (!isBrowser()) return;
  const confetti = (await import("canvas-confetti")).default;
  const colors = [...BRAND_COLORS, "#ffffff"];

  // Central explosion
  confetti({
    particleCount: 100,
    spread: 180,
    startVelocity: 50,
    ticks: 140,
    origin: { x: 0.5, y: 0.5 },
    colors,
  });

  // Top rain bursts at 300ms
  window.setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      const x = 0.15 + Math.random() * 0.7;
      confetti({
        particleCount: 60,
        spread: 100,
        startVelocity: 35,
        gravity: 1.1,
        ticks: 140,
        origin: { x, y: 0 },
        colors,
      });
    }
  }, 300);

  // Side bursts at 600ms
  window.setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 80,
      startVelocity: 50,
      ticks: 120,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 80,
      startVelocity: 50,
      ticks: 120,
      origin: { x: 1, y: 0.6 },
      colors,
    });
  }, 600);
}

/* ───────────────────────── STAR BURST (small) ───────────────────────── */

export async function starBurst(x: number, y: number): Promise<void> {
  playSound("star");
  if (!isBrowser()) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 15,
    spread: 360,
    startVelocity: 20,
    ticks: 80,
    origin: { x, y },
    shapes: ["star"],
    // Was warm orange-only - now cyber gold + cyan so the star burst
    // belongs to the same celebration system as the bigger ones.
    colors: ["#ffd158", "#00e5ff", "#ff5fb3"],
  });
}

/* ───────────────────────── MILESTONE FIREWORKS ───────────────────────── */

export async function milestoneFireworks(): Promise<void> {
  playSound("celebration");
  hitStop();
  if (!isBrowser()) return;
  const confetti = (await import("canvas-confetti")).default;

  const end = Date.now() + 3000;
  const interval = window.setInterval(() => {
    if (Date.now() >= end) {
      window.clearInterval(interval);
      return;
    }
    const x = 0.1 + Math.random() * 0.8;
    const y = 0.2 + Math.random() * 0.5;
    confetti({
      particleCount: 30,
      spread: 70,
      startVelocity: 35,
      ticks: 100,
      origin: { x, y },
      colors: BRAND_COLORS,
    });
  }, 200);
}
