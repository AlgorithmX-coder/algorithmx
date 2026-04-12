"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function AnimatedCard({ children, className, delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedProgress({ width, color, className, style }: { width: number; color?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${width}%` }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      className={className}
      style={{ height: "100%", borderRadius: 999, background: color, ...style }}
    />
  );
}

export function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);
  return <span ref={ref}>{count}</span>;
}

export function FloatingOrbs() {
  const orbs = [
    { size: 8, left: "6%", top: "8%", delay: 0, color: "#f59e0b" },
    { size: 6, left: undefined, right: "8%", top: "20%", delay: 1, color: "#8b5cf6" },
    { size: 10, left: "3%", top: "40%", delay: 2, color: "#3b82f6" },
    { size: 5, left: undefined, right: "5%", top: "60%", delay: 0.5, color: "#f59e0b" },
    { size: 7, left: "14%", top: "75%", delay: 3, color: "#8b5cf6" },
    { size: 4, left: "52%", top: "45%", delay: 4, color: "#f59e0b" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          animate={{ y: [-15, 15, -15], scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
          style={{
            position: "absolute", width: o.size, height: o.size, left: o.left, right: o.right, top: o.top,
            borderRadius: "50%", backgroundColor: o.color, boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
          }}
        />
      ))}
    </div>
  );
}

export function PulsingGlow({ children, color = "rgba(139,92,246,0.4)", className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <motion.div
      animate={{ boxShadow: [`0 0 0 0 ${color}`, `0 0 24px 4px ${color.replace("0.4", "0.15")}`, `0 0 0 0 ${color}`] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
