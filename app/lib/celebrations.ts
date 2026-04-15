import { playSound } from "@/app/lib/sounds";

const BRAND_COLORS = ["#60a5fa", "#34d399", "#f97316", "#f59e0b"];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export async function correctAnswerBurst(): Promise<void> {
  playSound("correct");
  if (!isBrowser()) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 40,
    spread: 60,
    startVelocity: 30,
    gravity: 0.8,
    ticks: 60,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#34d399", "#60a5fa", "#f59e0b"],
  });
}

export function wrongAnswerShake(): void {
  playSound("wrong");
  if (!isBrowser()) return;
  const styleId = "ax-screen-shake-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = `@keyframes screenShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }`;
    document.head.appendChild(styleEl);
  }
  const body = document.body;
  body.style.animation = "screenShake 0.3s ease";
  window.setTimeout(() => {
    body.style.animation = "";
  }, 300);
}

export async function badgeEarnedCelebration(): Promise<void> {
  playSound("badge-earned");
  if (!isBrowser()) return;
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

export async function bossDefeatedExplosion(): Promise<void> {
  playSound("boss-defeated");
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
    colors: ["#f59e0b", "#f97316"],
  });
}

export async function milestoneFireworks(): Promise<void> {
  playSound("celebration");
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
