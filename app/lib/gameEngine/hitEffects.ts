/**
 * Shared particle / hit-effect helpers.
 *
 * Every canvas exercise previously hand-rolled a particle struct +
 * burst spawn function. This module centralises:
 *   - Particle interface
 *   - createBurst() that spawns N particles into an array
 *   - updateParticles() that advances + filters dead particles
 *   - drawParticles() that paints them with a single style
 *
 * Particle counts honour `scaledParticleCount()` from adaptiveQuality
 * so low-power tiers automatically render fewer.
 *
 * Particle pools also enforce a hard MAX_PARTICLES cap to prevent
 * runaway accumulation during long sessions.
 */

import { scaledParticleCount } from "./adaptiveQuality";

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Lifetime remaining in ms. */
  life: number;
  /** Original lifetime in ms (used to compute alpha fade). */
  totalLife: number;
  colour: string;
  size: number;
  gravity: number;
}

const HARD_CAP = 220;

export interface BurstOptions {
  x: number;
  y: number;
  /** Logical count BEFORE adaptive-quality scaling. */
  count: number;
  colour: string;
  /** Average particle size in logical px. Default 3.5. */
  size?: number;
  /** Lifetime in ms. Default 700. */
  life?: number;
  /** Downward acceleration applied per frame-equivalent. Default 0.3. */
  gravity?: number;
  /** Min/max initial speed in logical px per frame. Default 2–6. */
  minSpeed?: number;
  maxSpeed?: number;
  /** Vertical bias on initial velocity. Negative = upward. Default -2. */
  yBias?: number;
}

let nextId = 1;

export function createBurst(
  pool: Particle[],
  opts: BurstOptions
): void {
  const scaledCount = scaledParticleCount(opts.count);
  const size = opts.size ?? 3.5;
  const life = opts.life ?? 700;
  const gravity = opts.gravity ?? 0.3;
  const minSpeed = opts.minSpeed ?? 2;
  const maxSpeed = opts.maxSpeed ?? 6;
  const yBias = opts.yBias ?? -2;

  for (let i = 0; i < scaledCount; i++) {
    if (pool.length >= HARD_CAP) break;
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    pool.push({
      id: nextId++,
      x: opts.x,
      y: opts.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + yBias,
      life,
      totalLife: life,
      colour: opts.colour,
      size: size + (Math.random() - 0.5) * 1.5,
      gravity,
    });
  }
}

/** Advance every particle by one frame-equivalent and drop dead ones. */
export function updateParticles(pool: Particle[], dt: number): void {
  const frames = dt / (1000 / 60);
  let write = 0;
  for (let read = 0; read < pool.length; read++) {
    const p = pool[read];
    p.x += p.vx * frames;
    p.y += p.vy * frames;
    p.vy += p.gravity * frames;
    p.life -= dt;
    if (p.life > 0) {
      if (write !== read) pool[write] = p;
      write++;
    }
  }
  pool.length = write;
}

/** Paint every particle as a soft round dot with alpha tied to remaining life. */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  pool: Particle[]
): void {
  for (const p of pool) {
    const alpha = Math.max(0, Math.min(1, p.life / p.totalLife));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
