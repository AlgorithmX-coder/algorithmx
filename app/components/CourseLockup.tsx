/**
 * Branded course name lockups (glyph + wordmark), the same marks the
 * course landings and the /cybersecurity cards use, sized for the
 * schools page. Fonts come from app/schools/layout.tsx.
 */
export type LockupId = "heroes" | "explorers" | "ops" | "pro";

const ROW: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  whiteSpace: "nowrap",
  lineHeight: 1,
};

/* The marks were drawn to glow on black. On paper the wordmark has to be
   * ink and the glyphs have to come down to colours that clear 4.5:1 on a
   * near-white card; the drop shadows go, because a glow on paper is a
   * smudge. Measured on the raised card #fffdf8. */
const TONES = {
  night: { word: "#eaf6ff", heroes: "#ffb347", explorers: "#22D3EE", ops: "#8b7bff", pro: "#ff7a3d", glow: true },
  sand: { word: "#14161d", heroes: "#8a5400", explorers: "#0a6675", ops: "#5744c9", pro: "#a63a08", glow: false },
} as const;

export default function CourseLockup({
  id,
  size = 1,
  tone = "night",
}: {
  id: LockupId;
  size?: number;
  tone?: keyof typeof TONES;
}) {
  const T = TONES[tone];
  const glow = (colour: string, blur: number) => (T.glow ? `drop-shadow(0 0 ${blur}px ${colour})` : "none");
  if (id === "heroes") {
    return (
      <span style={ROW}>
        <svg width={20 * size} height={20 * size} viewBox="0 0 24 24" aria-hidden style={{ transform: "rotate(-7deg)", filter: glow("rgba(138,84,0,0.35)", 8), flexShrink: 0 }}>
          <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill={T.heroes} />
          <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill={tone === "sand" ? "#fffdf8" : "#08101f"} />
        </svg>
        <span style={{ fontFamily: "var(--font-fredoka), system-ui, sans-serif", fontWeight: 700, fontSize: `${1.15 * size}rem`, letterSpacing: "0.02em", color: T.word }}>
          CYBER <span style={{ color: T.heroes }}>HEROES</span>
        </span>
      </span>
    );
  }
  if (id === "explorers") {
    return (
      <span style={ROW}>
        <svg width={17 * size} height={17 * size} viewBox="0 0 24 24" fill="none" stroke={T.explorers} strokeWidth="1.8" aria-hidden style={{ filter: glow("rgba(10,102,117,0.32)", 7), flexShrink: 0 }}>
          <circle cx="12" cy="12" r="6.4" />
          <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
          <circle cx="12" cy="12" r="1.6" fill={T.explorers} stroke="none" />
        </svg>
        <span style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontWeight: 600, fontSize: `${0.98 * size}rem`, letterSpacing: "0.12em", color: T.word }}>
          CYBER EXPLORERS
        </span>
      </span>
    );
  }
  if (id === "ops") {
    return (
      <span style={ROW}>
        <span aria-hidden style={{ width: 11 * size, height: 11 * size, borderRadius: 3, background: T.ops, boxShadow: T.glow ? "0 0 12px rgba(139,123,255,0.45)" : "none", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-chakra), ui-sans-serif, system-ui, sans-serif", fontWeight: 700, fontSize: `${1.05 * size}rem`, letterSpacing: "0.16em", color: T.word }}>
          CYBER OPS
        </span>
      </span>
    );
  }
  // Pro: the notched terminal chip from the /cybersecurity cards, static here.
  return (
    <span style={ROW}>
      <svg width={18 * size} height={18 * size} viewBox="0 0 24 24" fill="none" stroke={T.pro} strokeWidth="2" aria-hidden style={{ filter: glow("rgba(166,58,8,0.32)", 8), flexShrink: 0 }}>
        <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
        <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 15.5 H16.2" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: "var(--font-chakra), ui-sans-serif, system-ui, sans-serif", fontWeight: 700, fontSize: `${1.05 * size}rem`, letterSpacing: "0.07em", color: T.word }}>
        CYBER PRO
      </span>
    </span>
  );
}
