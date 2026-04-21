/**
 * Tween engine — smooth value interpolation, spring physics, and screen shake.
 * Pure TypeScript with no Pixi dependency; drive from any game loop.
 */

export type EaseFn = (t: number) => number;

export const Ease = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export interface TweenOptions {
  from: number;
  to: number;
  duration: number; // milliseconds
  ease?: EaseFn;
  delay?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

export class Tween {
  private elapsed = 0;
  done = false;

  constructor(private opts: TweenOptions) {}

  update(deltaMs: number) {
    if (this.done) return;
    this.elapsed += deltaMs;
    const delay = this.opts.delay ?? 0;
    if (this.elapsed < delay) return;

    const active = this.elapsed - delay;
    const t = Math.min(active / this.opts.duration, 1);
    const eased = (this.opts.ease ?? Ease.easeOutQuad)(t);
    this.opts.onUpdate(this.opts.from + (this.opts.to - this.opts.from) * eased);

    if (t >= 1) {
      this.done = true;
      this.opts.onComplete?.();
    }
  }

  stop() {
    this.done = true;
  }
}

export class TweenManager {
  private tweens: Tween[] = [];

  add(opts: TweenOptions): Tween {
    const t = new Tween(opts);
    this.tweens.push(t);
    return t;
  }

  update(deltaMs: number) {
    for (const t of this.tweens) t.update(deltaMs);
    this.tweens = this.tweens.filter((t) => !t.done);
  }

  clear() {
    this.tweens.length = 0;
  }
}

/* ─────────────── Spring Physics ─────────────── */

export interface Spring {
  position: number;
  velocity: number;
  target: number;
  stiffness: number;
  damping: number;
  mass: number;
}

export function createSpring(
  position: number,
  target: number,
  stiffness = 170,
  damping = 20,
  mass = 1
): Spring {
  return { position, velocity: 0, target, stiffness, damping, mass };
}

/** Integrate a spring one step. Returns the new position for convenience. */
export function updateSpring(spring: Spring, deltaMs: number): number {
  const dt = Math.min(deltaMs / 1000, 0.064); // cap to avoid explosions on long pauses
  const displacement = spring.position - spring.target;
  const springForce = -spring.stiffness * displacement;
  const dampingForce = -spring.damping * spring.velocity;
  const acceleration = (springForce + dampingForce) / spring.mass;
  spring.velocity += acceleration * dt;
  spring.position += spring.velocity * dt;
  return spring.position;
}

/* ─────────────── Screen Shake ─────────────── */

export class ScreenShake {
  private intensity = 0;
  private decay = 5;

  /** Current (x, y) offset — apply to a container each frame. */
  readonly offset = { x: 0, y: 0 };

  /** Trigger a shake. Higher intensity = larger offset. decay = how fast it dies off. */
  shake(intensity: number, decay = 5) {
    this.intensity = Math.max(this.intensity, intensity);
    this.decay = decay;
  }

  update(deltaMs: number) {
    if (this.intensity > 0.05) {
      const angle = Math.random() * Math.PI * 2;
      this.offset.x = Math.cos(angle) * this.intensity;
      this.offset.y = Math.sin(angle) * this.intensity;
      this.intensity *= Math.exp((-this.decay * deltaMs) / 1000);
    } else {
      this.intensity = 0;
      this.offset.x = 0;
      this.offset.y = 0;
    }
  }

  reset() {
    this.intensity = 0;
    this.offset.x = 0;
    this.offset.y = 0;
  }
}
