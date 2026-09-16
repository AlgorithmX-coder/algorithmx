/**
 * Branded course name lockups (glyph + wordmark), the same marks the
 * course landings and the /cybersecurity cards use, sized for the
 * schools page. Fonts come from app/schools/layout.tsx.
 */
export type LockupId = "heroes" | "explorers" | "ops";

const ROW: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  whiteSpace: "nowrap",
  lineHeight: 1,
};

export default function CourseLockup({ id, size = 1 }: { id: LockupId; size?: number }) {
  if (id === "heroes") {
    return (
      <span style={ROW}>
        <svg width={20 * size} height={20 * size} viewBox="0 0 24 24" aria-hidden style={{ transform: "rotate(-7deg)", filter: "drop-shadow(0 0 8px rgba(255,179,71,0.45))", flexShrink: 0 }}>
          <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#ffb347" />
          <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#08101f" />
        </svg>
        <span style={{ fontFamily: "var(--font-fredoka), system-ui, sans-serif", fontWeight: 700, fontSize: `${1.15 * size}rem`, letterSpacing: "0.02em", color: "#eaf6ff" }}>
          CYBER <span style={{ color: "#ffb347" }}>HEROES</span>
        </span>
      </span>
    );
  }
  if (id === "explorers") {
    return (
      <span style={ROW}>
        <svg width={17 * size} height={17 * size} viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="1.8" aria-hidden style={{ filter: "drop-shadow(0 0 7px rgba(34,211,238,0.4))", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="6.4" />
          <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
          <circle cx="12" cy="12" r="1.6" fill="#22D3EE" stroke="none" />
        </svg>
        <span style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontWeight: 600, fontSize: `${0.98 * size}rem`, letterSpacing: "0.12em", color: "#eaf6ff" }}>
          CYBER EXPLORERS
        </span>
      </span>
    );
  }
  return (
    <span style={ROW}>
      <span aria-hidden style={{ width: 11 * size, height: 11 * size, borderRadius: 3, background: "#8B7BFF", boxShadow: "0 0 12px rgba(139,123,255,0.45)", flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--font-chakra), ui-sans-serif, system-ui, sans-serif", fontWeight: 700, fontSize: `${1.05 * size}rem`, letterSpacing: "0.16em", color: "#eaf6ff" }}>
        CYBER OPS
      </span>
    </span>
  );
}
