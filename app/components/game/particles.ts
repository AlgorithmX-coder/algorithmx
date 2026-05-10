/**
 * Particle system - explosions, sparkles, and trails.
 * Owns a Pixi Container + single Graphics object; redraws on each update() call.
 */
import { Container, Graphics } from "pixi.js";

export type ParticleShape = "circle" | "square" | "star";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  life: number; // elapsed ms
  maxLife: number;
  startSize: number;
  endSize: number;
  color: number;
  rotation: number;
  vrotation: number; // radians / second
  shape: ParticleShape;
}

export interface EmitOptions {
  x: number;
  y: number;
  count?: number;
  speed?: [number, number]; // px/sec [min, max]
  angle?: [number, number]; // radians [min, max]
  life?: [number, number]; // ms [min, max]
  size?: [number, number]; // [min, max] start size
  endSize?: number;
  color?: number | number[];
  gravity?: number; // px/sec² downward
  shape?: ParticleShape;
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function pickColor(c: number | number[]): number {
  return Array.isArray(c) ? c[Math.floor(Math.random() * c.length)] : c;
}

export class ParticleSystem {
  readonly container: Container;
  private graphics: Graphics;
  private particles: Particle[] = [];

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  emit(opts: EmitOptions) {
    const count = opts.count ?? 20;
    const speed = opts.speed ?? [100, 300];
    const angle = opts.angle ?? [0, Math.PI * 2];
    const life = opts.life ?? [500, 1000];
    const size = opts.size ?? [2, 6];
    const endSize = opts.endSize ?? 0;
    const color = opts.color ?? 0xffffff;
    const gravity = opts.gravity ?? 0;
    const shape: ParticleShape = opts.shape ?? "circle";

    for (let i = 0; i < count; i++) {
      const a = rand(angle[0], angle[1]);
      const s = rand(speed[0], speed[1]);
      const startSize = rand(size[0], size[1]);
      this.particles.push({
        x: opts.x,
        y: opts.y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        ax: 0,
        ay: gravity,
        life: 0,
        maxLife: rand(life[0], life[1]),
        startSize,
        endSize,
        color: pickColor(color),
        rotation: Math.random() * Math.PI * 2,
        vrotation: rand(-5, 5),
        shape,
      });
    }
  }

  /* ── Presets ───────────────────────── */

  explosion(x: number, y: number, color: number | number[] = [0xff6b35, 0xf7b801, 0xffffff]) {
    this.emit({
      x,
      y,
      count: 40,
      speed: [150, 450],
      life: [400, 900],
      size: [3, 8],
      endSize: 0,
      color,
      gravity: 300,
    });
  }

  sparkle(x: number, y: number, color: number | number[] = [0xffff00, 0xffffff, 0x60a5fa]) {
    this.emit({
      x,
      y,
      count: 12,
      speed: [50, 200],
      life: [300, 700],
      size: [2, 5],
      endSize: 0,
      color,
      shape: "star",
    });
  }

  /** Short cone of particles trailing behind a moving object (point downward by default). */
  trail(x: number, y: number, color: number | number[] = 0x3b82f6) {
    this.emit({
      x,
      y,
      count: 3,
      speed: [20, 60],
      angle: [Math.PI * 0.7, Math.PI * 1.3],
      life: [200, 500],
      size: [2, 4],
      endSize: 0,
      color,
    });
  }

  /* ── Loop ──────────────────────────── */

  update(deltaMs: number) {
    const dt = deltaMs / 1000;
    for (const p of this.particles) {
      p.life += deltaMs;
      p.vx += p.ax * dt;
      p.vy += p.ay * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vrotation * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
    this.render();
  }

  private render() {
    const g = this.graphics;
    g.clear();
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const size = Math.max(0.1, p.startSize + (p.endSize - p.startSize) * t);
      const alpha = Math.max(0, 1 - t);

      if (p.shape === "circle") {
        g.circle(p.x, p.y, size);
        g.fill({ color: p.color, alpha });
      } else if (p.shape === "square") {
        g.rect(p.x - size / 2, p.y - size / 2, size, size);
        g.fill({ color: p.color, alpha });
      } else {
        // Star - two crossed rectangles, no rotation needed (cheap sparkle)
        const s = size;
        g.rect(p.x - s / 2, p.y - s / 6, s, s / 3);
        g.fill({ color: p.color, alpha });
        g.rect(p.x - s / 6, p.y - s / 2, s / 3, s);
        g.fill({ color: p.color, alpha });
      }
    }
  }

  get count() {
    return this.particles.length;
  }

  clear() {
    this.particles.length = 0;
    this.graphics.clear();
  }

  destroy() {
    this.graphics.destroy();
    this.container.destroy();
  }
}
