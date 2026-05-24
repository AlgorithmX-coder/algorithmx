"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * 404 - AlgorithmX OS error screen.
 *
 * Matches the dark sci-fi cinematic aesthetic. Reads as a system-level
 * error message from the AlgorithmX OS, not a generic "oops" page. The
 * pulsing orb + mono caps + corner brackets pick up the visual language
 * used in the cinematic chapter labels, holographic cards, and ALGO
 * widget so the 404 still feels native to the platform.
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(124,92,255,0.18), transparent 55%), " +
          "radial-gradient(ellipse at 30% 70%, rgba(0,229,255,0.14), transparent 60%), " +
          "var(--lv2-ink, #04050d)",
        color: "var(--lv2-paper, #e8edff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "calc(var(--lv2-rail, 28px) * 2) var(--lv2-rail, 28px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Vignette edge - matches the cinematic */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(4,5,13,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          background: "rgba(13,15,24,0.78)",
          backdropFilter: "blur(18px) saturate(1.5)",
          WebkitBackdropFilter: "blur(18px) saturate(1.5)",
          border: "1px solid rgba(0,229,255,0.22)",
          borderTop: "2px solid var(--lv2-cyan, #00f5ff)",
          borderRadius: 22,
          padding: "44px 36px 38px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
        }}
      >
        {/* Corner brackets - JARVIS-style */}
        <Bracket position="tl" />
        <Bracket position="tr" />
        <Bracket position="bl" />
        <Bracket position="br" />

        <Orb />

        <div
          style={{
            fontFamily: "var(--lv2-font-mono, ui-monospace, monospace)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.55)",
            marginBottom: 14,
          }}
        >
          // ALGORITHMX OS / SYSTEM EVENT
        </div>

        <div
          style={{
            fontFamily: "var(--lv2-font-mono, ui-monospace, monospace)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#ff7a9f",
            marginBottom: 28,
          }}
        >
          ERR_404 · RESOURCE NOT FOUND
        </div>

        <h1
          style={{
            fontFamily:
              "var(--lv2-font-display, ui-sans-serif, system-ui, sans-serif)",
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            fontWeight: 400,
            margin: 0,
            color: "var(--lv2-paper, #e8edff)",
          }}
        >
          Target path is unreachable.
        </h1>

        <p
          style={{
            fontFamily:
              "var(--lv2-font-display, ui-sans-serif, system-ui, sans-serif)",
            fontSize: 16,
            lineHeight: 1.55,
            color: "rgba(232,237,255,0.7)",
            margin: "20px auto 32px",
            maxWidth: 420,
          }}
        >
          The page you tried to reach has been moved, never existed, or fell out
          of the curriculum index. Routing you back to known territory.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              background: "var(--lv2-cyan, #00f5ff)",
              color: "var(--lv2-ink, #04050d)",
              fontFamily: "var(--lv2-font-mono, ui-monospace, monospace)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "14px 22px",
              borderRadius: 999,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 8px 28px rgba(0,229,255,0.32)",
            }}
          >
            Return to root
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/cyberheroes"
            style={{
              background: "rgba(232,237,255,0.06)",
              color: "var(--lv2-paper, #e8edff)",
              border: "1px solid rgba(232,237,255,0.22)",
              fontFamily: "var(--lv2-font-mono, ui-monospace, monospace)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "14px 22px",
              borderRadius: 999,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Start with Cyber Heroes
          </Link>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 18,
            borderTop: "1px solid rgba(232,237,255,0.08)",
            fontFamily: "var(--lv2-font-mono, ui-monospace, monospace)",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.4)",
          }}
        >
          // ALGORITHMX // TECHNOLOGY EDUCATION FOR EVERY STAGE OF LIFE
        </div>
      </motion.div>
    </div>
  );
}

function Orb() {
  return (
    <div
      style={{
        margin: "0 auto 26px",
        position: "relative",
        width: 36,
        height: 36,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: "var(--lv2-cyan, #00f5ff)",
          boxShadow: "0 0 24px rgba(0,229,255,0.8)",
          animation: "algo404Pulse 1.8s ease-in-out infinite",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 999,
          border: "1px solid rgba(0,229,255,0.45)",
          animation: "algo404Ring 2.4s ease-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes algo404Pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(0.82);
          }
        }
        @keyframes algo404Ring {
          0% {
            transform: scale(0.7);
            opacity: 0.7;
          }
          80%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function Bracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 28,
    height: 28,
    pointerEvents: "none",
  };
  const placement: Record<typeof position, React.CSSProperties> = {
    tl: { top: 12, left: 12, borderTop: "2px solid var(--lv2-cyan, #00f5ff)", borderLeft: "2px solid var(--lv2-cyan, #00f5ff)" },
    tr: { top: 12, right: 12, borderTop: "2px solid var(--lv2-cyan, #00f5ff)", borderRight: "2px solid var(--lv2-cyan, #00f5ff)" },
    bl: { bottom: 12, left: 12, borderBottom: "2px solid var(--lv2-cyan, #00f5ff)", borderLeft: "2px solid var(--lv2-cyan, #00f5ff)" },
    br: { bottom: 12, right: 12, borderBottom: "2px solid var(--lv2-cyan, #00f5ff)", borderRight: "2px solid var(--lv2-cyan, #00f5ff)" },
  };
  return <span aria-hidden style={{ ...base, ...placement[position] }} />;
}
