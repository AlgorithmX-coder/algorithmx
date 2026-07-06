"use client";

/**
 * bossArena — shared building blocks for the bespoke boss set-pieces
 * (Week 2's Profile Forge, Week 1's Cracking Machine, and the bosses
 * still to come). Owns the juice layers (particles, data rain), the
 * playable-hero registry with per-hero arena themes, the Raccoon sprite
 * map, the capped/mute-gated villain voice player and the small shared
 * chrome pieces. Each boss composes these; the fight itself stays
 * bespoke per week.
 */

import { useEffect, useRef } from "react";
import { isAudioMuted } from "@/app/lib/audioMute";

export const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
export const ROUNDED = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif";

export const RACCOON = {
  idle: "/game/characters/raccoon-idle.png",
  taunt: "/game/characters/raccoon-taunt.png",
  attack: "/game/characters/raccoon-attack.png",
  hurt: "/game/characters/raccoon-hurt.png",
  defeated: "/game/characters/raccoon-defeated.png",
} as const;
export type RaccoonMood = keyof typeof RACCOON;

export interface HeroTheme {
  accent: string;
  glow: string;
  washA: string;
  washB: string;
  title: string;
  floor: string;
}

export interface HeroDef {
  name: string;
  tagline: string;
  portrait: string;
  sprites: { idle: string; attack: string; celebrate: string };
  theme: HeroTheme;
}

export type HeroKey = "adam" | "layla";
export type HeroMood = keyof HeroDef["sprites"];

/** Base hero registry. Bosses may override sprites (e.g. the forge's
 *  writing-behind-shield idles) via makeHeroes. */
export const BASE_HEROES: Record<HeroKey, HeroDef> = {
  adam: {
    name: "ADAM",
    tagline: "Cool and steady",
    portrait: "/game/characters/adam-head.png",
    sprites: {
      idle: "/game/characters/adam-idle.png",
      attack: "/game/characters/adam-attack.png",
      celebrate: "/game/characters/adam-celebrate.png",
    },
    theme: {
      accent: "#00e5ff",
      glow: "rgba(0,229,255,0.45)",
      washA: "rgba(0,150,255,0.16)",
      washB: "rgba(0,229,255,0.12)",
      title: "linear-gradient(135deg, #00e5ff 0%, #3b82f6 55%, #7c5cff 100%)",
      floor: "rgba(0,229,255,0.4)",
    },
  },
  layla: {
    name: "LAYLA",
    tagline: "Quick and clever",
    portrait: "/game/characters/layla-head.png",
    sprites: {
      idle: "/game/characters/layla-idle.png",
      attack: "/game/characters/layla-attack.png",
      celebrate: "/game/characters/layla-celebrate.png",
    },
    theme: {
      accent: "#ff5fb3",
      glow: "rgba(255,95,179,0.45)",
      washA: "rgba(255,95,179,0.16)",
      washB: "rgba(192,132,252,0.12)",
      title: "linear-gradient(135deg, #ff5fb3 0%, #c084fc 55%, #7c5cff 100%)",
      floor: "rgba(255,95,179,0.45)",
    },
  },
};

/** Compose a hero registry with per-boss sprite overrides. */
export function makeHeroes(
  overrides?: Partial<Record<HeroKey, Partial<HeroDef["sprites"]>>>,
): Record<HeroKey, HeroDef> {
  if (!overrides) return BASE_HEROES;
  const out = {} as Record<HeroKey, HeroDef>;
  (Object.keys(BASE_HEROES) as HeroKey[]).forEach((k) => {
    out[k] = { ...BASE_HEROES[k], sprites: { ...BASE_HEROES[k].sprites, ...overrides[k] } };
  });
  return out;
}

/** Raccoon voice clips (Callum) — capped + mute-gated raw Audio, per the
 *  audio contract. Never full volume. */
export function playVillain(file: string) {
  if (typeof window === "undefined" || isAudioMuted()) return;
  const el = new Audio(`/audio/villain/${file}.mp3`);
  el.volume = 0.45;
  void el.play().catch(() => {});
}

/* ─────────────────────── particle + rain layers ─────────────────────── */

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  size: number; colour: string; gravity: number;
}

export interface ParticleAPI {
  burst: (x: number, y: number, colour: string, count?: number) => void;
}

/** Imperative canvas particle layer. Coordinates are in container px. */
export function ParticleLayer({ apiRef, disabled }: { apiRef: React.MutableRefObject<ParticleAPI | null>; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    apiRef.current = {
      burst: (x, y, colour, count = 14) => {
        if (disabled) return;
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 2 + Math.random() * 5;
          particles.current.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2,
            life: 0, max: 34 + Math.random() * 22,
            size: 2.5 + Math.random() * 3.5,
            colour, gravity: 0.14,
          });
        }
      },
    };
    return () => { apiRef.current = null; };
  }, [apiRef, disabled]);

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life < p.max);
      for (const p of particles.current) {
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        // Clamp: fractional lifetimes can overshoot by one tick, and a
        // negative arc radius throws (which would kill this rAF loop).
        const t = Math.max(0, 1 - p.life / p.max);
        ctx.globalAlpha = t;
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.01, p.size * t), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [disabled]);

  if (disabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }}
    />
  );
}

/** Falling data-rain backdrop (cheap canvas, arena ambience). */
export function DataRain({ disabled }: { disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const glyphs = "01<>{}#$%&?!";
    let cols: { y: number; speed: number }[] = [];
    let raf = 0;
    let frame = 0;
    const loop = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        const n = Math.floor(canvas.width / 26);
        cols = Array.from({ length: n }, () => ({ y: Math.random() * canvas.height, speed: 0.6 + Math.random() * 1.4 }));
      }
      frame += 1;
      if (frame % 2 === 0) {
        ctx.fillStyle = "rgba(8, 10, 26, 0.14)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "13px monospace";
        cols.forEach((c, i) => {
          const ch = glyphs[(i * 7 + Math.floor(c.y / 13)) % glyphs.length];
          ctx.fillStyle = i % 5 === 0 ? "rgba(192,132,252,0.5)" : "rgba(0,229,255,0.38)";
          ctx.fillText(ch, i * 26 + 6, c.y);
          c.y += c.speed * 4;
          if (c.y > canvas.height + 20) c.y = -10;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [disabled]);
  if (disabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5 }}
    />
  );
}

/* ─────────────────────────── shared chrome ─────────────────────────── */

export function PhaseHint({ text, accent }: { text: string; accent: string }) {
  return (
    <div
      style={{
        textAlign: "center", fontSize: 13.5, fontWeight: 800, color: "#fff7e6",
        padding: "7px 14px", borderRadius: 999, alignSelf: "center",
        background: "rgba(6,8,20,0.75)", border: `1px solid ${accent}66`,
        boxShadow: `0 0 18px ${accent}33`, backdropFilter: "blur(4px)",
        textShadow: "0 2px 4px rgba(0,0,0,0.8)", maxWidth: 640,
      }}
    >
      {text}
    </div>
  );
}
