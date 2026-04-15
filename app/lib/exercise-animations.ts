import gsap from "gsap";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
  bossDefeatedExplosion,
} from "@/app/lib/celebrations";
import { playSound } from "@/app/lib/sounds";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function resolveElement(target: string | HTMLElement): HTMLElement | null {
  if (!isBrowser()) return null;
  if (typeof target === "string") {
    return document.querySelector(target) as HTMLElement | null;
  }
  return target instanceof HTMLElement ? target : null;
}

export function animateQuizOptionsIn(
  containerSelector: string,
  delay = 0,
): void {
  if (!isBrowser()) return;
  const container = resolveElement(containerSelector);
  if (!container) return;
  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  gsap.fromTo(
    children,
    { opacity: 0, y: 30, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.7)",
      delay,
      clearProps: "transform",
    },
  );
}

export function animateCorrectAnswer(element: HTMLElement): void {
  if (!isBrowser() || !element) return;

  const tl = gsap.timeline();
  tl.to(element, { scale: 1.1, duration: 0.15, ease: "power2.out" })
    .to(element, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.3)" })
    .to(
      element,
      {
        boxShadow:
          "0 0 30px rgba(52,211,153,0.65), 0 0 60px rgba(52,211,153,0.3)",
        duration: 0.2,
      },
      0,
    )
    .to(
      element,
      {
        boxShadow: "0 0 10px rgba(52,211,153,0.15)",
        duration: 0.5,
      },
      0.35,
    );

  playSound("correct");
  void correctAnswerBurst();
}

export function animateWrongAnswer(element: HTMLElement): void {
  if (!isBrowser() || !element) return;

  const originalBg = element.style.backgroundColor;

  gsap
    .timeline()
    .to(element, { x: -8, duration: 0.05 })
    .to(element, { x: 8, duration: 0.05 })
    .to(element, { x: -4, duration: 0.05 })
    .to(element, { x: 4, duration: 0.05 })
    .to(element, { x: 0, duration: 0.05 })
    .to(
      element,
      {
        backgroundColor: "rgba(239,68,68,0.35)",
        duration: 0.1,
      },
      0,
    )
    .to(
      element,
      {
        backgroundColor: originalBg || "rgba(0,0,0,0)",
        duration: 0.3,
      },
      0.2,
    );

  playSound("wrong");
  wrongAnswerShake();
}

export function animateScreenEnter(containerSelector: string): void {
  if (!isBrowser()) return;
  const container = resolveElement(containerSelector);
  if (!container) return;

  gsap.fromTo(
    container,
    { opacity: 0 },
    { opacity: 1, duration: 0.4, ease: "power2.out" },
  );

  const animated = Array.from(
    container.querySelectorAll<HTMLElement>("[data-animate]"),
  );
  if (animated.length === 0) return;

  gsap.fromTo(
    animated,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
      clearProps: "transform",
    },
  );
}

export function animateBossAppear(bossSelector: string): void {
  if (!isBrowser()) return;
  const el = resolveElement(bossSelector);
  if (!el) return;

  playSound("boss-appear");

  gsap
    .timeline()
    .fromTo(
      el,
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, duration: 0.4, ease: "power2.out" },
    )
    .to(el, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.4)",
    })
    .fromTo(
      el,
      { boxShadow: "0 0 0 rgba(239,68,68,0)" },
      {
        boxShadow: "0 0 50px rgba(239,68,68,0.7), 0 0 90px rgba(239,68,68,0.35)",
        duration: 0.4,
      },
      0,
    )
    .to(
      el,
      {
        boxShadow: "0 0 22px rgba(239,68,68,0.4)",
        duration: 0.4,
      },
      0.4,
    );
}

export function animateBossHit(bossSelector: string): void {
  if (!isBrowser()) return;
  const el = resolveElement(bossSelector);
  if (!el) return;

  playSound("boss-hit");

  gsap
    .timeline()
    .to(el, { filter: "brightness(2)", duration: 0.1 })
    .to(el, { x: -10, duration: 0.05 }, 0)
    .to(el, { x: 10, duration: 0.05 }, 0.05)
    .to(el, { x: -6, duration: 0.05 }, 0.1)
    .to(el, { x: 0, duration: 0.05 }, 0.15)
    .to(el, { scale: 0.95, duration: 0.12, ease: "power2.out" }, 0)
    .to(el, { filter: "brightness(1)", duration: 0.2 }, 0.15)
    .to(el, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" }, 0.2);
}

export function animateBossDefeated(bossSelector: string): void {
  if (!isBrowser()) return;
  const el = resolveElement(bossSelector);
  if (!el) return;

  playSound("boss-defeated");
  void bossDefeatedExplosion();

  gsap.to(el, {
    rotation: 720,
    scale: 0,
    opacity: 0,
    duration: 1.5,
    ease: "power2.in",
  });
}

export function animateBadgeEarned(badgeSelector: string): void {
  if (!isBrowser()) return;
  const el = resolveElement(badgeSelector);
  if (!el) return;

  playSound("badge-earned");
  void badgeEarnedCelebration();

  gsap.fromTo(
    el,
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
    },
  );

  gsap.to(el, {
    boxShadow: "0 0 40px rgba(245,158,11,0.8), 0 0 80px rgba(245,158,11,0.4)",
    duration: 0.6,
    repeat: 5,
    yoyo: true,
    ease: "sine.inOut",
    delay: 0.4,
  });
}

export function animateProgressBar(
  barSelector: string,
  targetWidth: string,
): void {
  if (!isBrowser()) return;
  const el = resolveElement(barSelector);
  if (!el) return;

  gsap.fromTo(
    el,
    { width: "0%" },
    {
      width: targetWidth,
      duration: 1.2,
      ease: "power2.out",
    },
  );
}
