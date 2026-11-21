import CubeMark from "@/app/components/CubeMark";

/* The /schools product mark: the glowing Learning Atom (teal/lime/cyan
 * orbits, white-hot core) on its own dark teal chip, so it keeps its colour
 * and glow on a light nav instead of flattening out (owner rule: never
 * flatten it). "CYBER SCHOOL / by AlgorithmX" sits beside it in the nav's
 * tone-aware ink. Lived inside SchoolsLanding.tsx until 2026-11-21; it is
 * its own file now so the Hologram Campus page and the old landing share
 * one drawing. */

export function SchoolAtom({ size = 38, idPrefix = "schAtom" }: { size?: number; idPrefix?: string }) {
  const svg = Math.round(size * (28 / 38));
  const id = (n: string) => `${idPrefix}${n}`;
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * (11 / 38)),
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(90% 90% at 50% 38%, rgba(31,214,200,0.28), #06201d 72%)",
        border: "1px solid rgba(31,214,200,0.5)",
        boxShadow: "0 6px 18px -6px rgba(16,160,150,0.7), inset 0 0 12px rgba(31,214,200,0.15)",
      }}
    >
      <svg width={svg} height={svg} viewBox="0 0 72 72" style={{ display: "block", filter: "drop-shadow(0 0 3px rgba(60,230,200,0.9)) drop-shadow(0 0 8px rgba(60,230,200,0.5))" }}>
        <defs>
          <linearGradient id={id("Teal")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8bffe8" /><stop offset="100%" stopColor="#11b6c6" /></linearGradient>
          <linearGradient id={id("Lime")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d6ff8f" /><stop offset="100%" stopColor="#23e2a2" /></linearGradient>
          <linearGradient id={id("Cyan")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9ff8ff" /><stop offset="100%" stopColor="#2bb2ff" /></linearGradient>
          <radialGradient id={id("Core")} cx="50%" cy="42%" r="56%"><stop offset="0" stopColor="#ffffff" /><stop offset="45%" stopColor="#9affe0" /><stop offset="100%" stopColor="#14b8b4" /></radialGradient>
        </defs>
        <ellipse cx="36" cy="36" rx="28" ry="11" fill="none" stroke={`url(#${id("Teal")})`} strokeWidth="2.8" />
        <ellipse cx="36" cy="36" rx="28" ry="11" fill="none" stroke={`url(#${id("Lime")})`} strokeWidth="2.8" transform="rotate(60 36 36)" />
        <ellipse cx="36" cy="36" rx="28" ry="11" fill="none" stroke={`url(#${id("Cyan")})`} strokeWidth="2.8" transform="rotate(120 36 36)" />
        <circle cx="63.5" cy="36" r="2.8" fill="#d6ff8f" />
        <circle cx="22" cy="11.8" r="2.8" fill="#8bffe8" />
        <circle cx="50" cy="11.8" r="2.8" fill="#9affe0" />
        <circle cx="36" cy="36" r="8.5" fill={`url(#${id("Core")})`} />
      </svg>
    </span>
  );
}

export default function SchoolBrand() {
  return (
    <>
      <SchoolAtom />
      <span style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--lv2-font-mono)", fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--lv2-word-mark, #14243a)" }}>
          CYBER <span style={{ color: "#0f968b" }}>SCHOOL</span>
        </span>
        <span style={{ fontFamily: "var(--lv2-font-mono)", fontWeight: 500, fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--lv2-word-mark, #14243a)", display: "inline-flex", alignItems: "center" }}>
          <span style={{ opacity: 0.6 }}>by</span>
          <CubeMark size={12} color="#5f8dff" code style={{ display: "inline-block", margin: "0 3px", filter: "drop-shadow(0 0 4px rgba(95,141,255,0.7))" }} />
          <span style={{ opacity: 0.6 }}>AlgorithmX</span>
        </span>
      </span>
    </>
  );
}
