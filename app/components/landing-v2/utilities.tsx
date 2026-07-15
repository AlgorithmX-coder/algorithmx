"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useInView } from "framer-motion";
import { ICON_PATHS, ICON_RECTS } from "./data";

/* useMediaQuery - reactive subscription to a CSS media query. SSR safe
 * (returns the fallback value during initial render so hydration is
 * stable). Use this when styled-jsx scoped breakpoints don't reach
 * elements inside framer-motion AnimatePresence (class isn't applied
 * to the dynamically rendered motion.div consistently). */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(fallback);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* isWeakGpu - true on integrated / software GPUs that can't drive the
 * heavy WebGL hero cinematic smoothly (measured ~5fps on Intel Iris Xe).
 * Detected from the WebGL renderer string. Memoised at module scope so we
 * only ever create one throwaway context. On browsers that mask the
 * renderer (privacy modes) it returns false — we don't force the static
 * fallback on an unknown GPU. */
let _weakGpu: boolean | null = null;
export function isWeakGpu(): boolean {
  if (_weakGpu !== null) return _weakGpu;
  if (typeof document === "undefined") return false;
  try {
    const gl =
      document.createElement("canvas").getContext("webgl") ||
      (document.createElement("canvas").getContext(
        "experimental-webgl",
      ) as WebGLRenderingContext | null);
    const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
    const r = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : "";
    _weakGpu =
      /intel|iris|\buhd\b|hd graphics|mali|adreno|powervr|swiftshader|llvmpipe|basic render/i.test(
        r,
      );
  } catch {
    _weakGpu = false;
  }
  return _weakGpu;
}

/* useCinematicReleaseProgress - 0..1 fade value for any UI that should
 * appear AFTER the hero cinematic releases its sticky pin. The rail
 * height is 220vh on desktop / 170vh on phones (mirrors
 * HeroCinematicV3), so the actual release scroll position depends on
 * viewport. Single source of truth so Nav (Get Started CTA) and Algo
 * (corner widget) stay in sync. */
export function useCinematicReleaseProgress(): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = 0;
    const compute = () => {
      const vh = window.innerHeight;
      const isCompact = window.matchMedia("(max-width: 768px)").matches;
      /* Cinematic rail height in vh (mirrors HeroCinematicV3.tsx) */
      const railVh = isCompact ? 1.7 : 2.2;
      /* Sticky releases at scrollY = (railVh - 1) * vh. Fade the value
       * in over the next 0.3 vh of scroll so consumers can ease in. */
      const releaseAt = (railVh - 1) * vh;
      const fadeWindow = vh * 0.3;
      const raw = (window.scrollY - releaseAt) / fadeWindow;
      const clamped = Math.max(0, Math.min(1, raw));
      setValue(clamped);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return value;
}

/* SVG icon - thin-stroke line icons in the landing-v2 style. */
export function Ico({
  name,
  size = 20,
  color = "currentColor",
  sw = 1.8,
}: {
  name: keyof typeof ICON_PATHS;
  size?: number;
  color?: string;
  sw?: number;
}) {
  const path = ICON_PATHS[name];
  const rect = ICON_RECTS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {rect && (
        <rect
          x={rect[0]}
          y={rect[1]}
          width={rect[2]}
          height={rect[3]}
          rx={rect[4]}
        />
      )}
      {path && <path d={path} />}
    </svg>
  );
}

/* Animated count-up. */
export function Counter({ to, duration = 1800 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - f, 3);
      setV(Math.round(to * eased));
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{v}</span>;
}

/* FadeUp on scroll into view. */
export function FadeUp({
  children,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* 3D-tilt on hover. Cursor position within the element drives a small
 * perspective rotation around X and Y, plus a touch of scale-up.
 * The card "looks at" the cursor. */
export function useTilt3D(
  ref: RefObject<HTMLElement | null>,
  options: { max?: number; scale?: number } = {},
) {
  const max = options.max ?? 7;
  const scale = options.scale ?? 1.025;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let targetRX = 0;
    let targetRY = 0;
    let targetSc = 1;
    let curRX = 0;
    let curRY = 0;
    let curSc = 1;
    const tick = () => {
      /* Soft lerp toward targets so movement feels physical */
      curRX += (targetRX - curRX) * 0.18;
      curRY += (targetRY - curRY) * 0.18;
      curSc += (targetSc - curSc) * 0.18;
      el.style.transform = `perspective(900px) rotateY(${curRY}deg) rotateX(${curRX}deg) scale(${curSc})`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      targetRY = nx * max * 2;
      targetRX = -ny * max * 2;
      targetSc = scale;
    };
    const onLeave = () => {
      targetRX = 0;
      targetRY = 0;
      targetSc = 1;
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, max, scale]);
}

/* Magnetic-button effect. When the cursor is within `radius` pixels of
 * the element's centre, the element translates a fraction of the way
 * toward the cursor. Snaps back when far. */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  options: { strength?: number; radius?: number } = {},
) {
  const strength = options.strength ?? 0.32;
  const radius = options.radius ?? 80;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    const tick = () => {
      curX += (targetX - curX) * 0.2;
      curY += (targetY - curY) * 0.2;
      el.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        targetX = dx * strength * falloff;
        targetY = dy * strength * falloff;
      } else {
        targetX = 0;
        targetY = 0;
      }
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [ref, strength, radius]);
}

/* Hover-trigger counter. Returns the value + a hovered setter. When you
 * hover the bound element, the counter resets to 0 and ramps up to the
 * target again - reads as "fresh data just came in". */
export function useHoverCount(
  to: number,
  duration = 1400,
): { value: number; bind: { onMouseEnter: () => void } } {
  const [v, setV] = useState(to);
  const rafRef = useRef<number>(0);

  /* On mount, count from 0 up to target so the card has an intro animation
   * the first time it enters view too. */
  useEffect(() => {
    let t0 = performance.now();
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - f, 3);
      setV(Math.round(to * eased));
      if (f < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, duration]);

  const recount = () => {
    cancelAnimationFrame(rafRef.current);
    const t0 = performance.now();
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - f, 3);
      setV(Math.round(to * eased));
      if (f < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return {
    value: v,
    bind: { onMouseEnter: recount },
  };
}

/* Marquee scroller for testimonial / trust-logo strips.
 *
 * Default behaviour: accelerates by `hoverBoost` when the cursor enters
 * (instead of the cliched "pause on hover"). Feels more responsive -
 * like the content reacts to your attention. */
export function Marquee<T>({
  items,
  speed = 60,
  hoverBoost = 0.55,
  itemKey,
  renderItem,
}: {
  items: T[];
  speed?: number;
  /* Multiplier on duration when hovered. < 1 = faster. */
  hoverBoost?: number;
  itemKey: (t: T) => string;
  renderItem: (t: T) => React.ReactNode;
}) {
  const seq = [...items, ...items];
  return (
    <div
      style={{
        overflow: "hidden",
        position: "relative",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)",
      }}
      onMouseEnter={(e) => {
        const track = e.currentTarget.querySelector(
          "[data-marquee-track]",
        ) as HTMLDivElement | null;
        if (track) track.style.animationDuration = `${speed * hoverBoost}s`;
      }}
      onMouseLeave={(e) => {
        const track = e.currentTarget.querySelector(
          "[data-marquee-track]",
        ) as HTMLDivElement | null;
        if (track) track.style.animationDuration = `${speed}s`;
      }}
    >
      <div
        data-marquee-track
        style={{
          display: "flex",
          gap: 24,
          width: "max-content",
          animation: `lv2Marquee ${speed}s linear infinite`,
          transition: "animation-duration .35s ease",
        }}
      >
        {seq.map((item, i) => (
          <div key={`${itemKey(item)}-${i}`} style={{ flexShrink: 0 }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes lv2Marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
