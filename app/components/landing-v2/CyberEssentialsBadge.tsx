/**
 * Cyber Essentials certification badge (AlgorithmX certified 2026-09).
 *
 * The scheme's wordmark is navy, so the logo sits on a white tile inside
 * the same glass pill the NCSC alignment mark uses, and the two read as
 * one trust row. Artwork: the 2022 accessibility-refreshed Cyber
 * Essentials logo published by IASME, the scheme's delivery partner.
 */
export default function CyberEssentialsBadge({ logoHeight = 26 }: { logoHeight?: number }) {
  return (
    <span
      className="lv2-ce-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "7px 18px 7px 7px",
        borderRadius: 999,
        background: "rgba(13,15,24,0.55)",
        border: "1px solid rgba(159,245,255,0.28)",
        boxShadow: "0 0 30px -16px rgba(159,245,255,0.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 9px",
          borderRadius: 999,
          background: "#fff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/cyber-essentials.png"
          alt="Cyber Essentials"
          loading="lazy"
          style={{ height: logoHeight, width: "auto", display: "block" }}
        />
      </span>
      <span
        className="lv2-ce-label"
        style={{
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--lv2-cyan-soft)",
        }}
      >
        Cyber Essentials certified
      </span>
      {/* Phones: same pill, smaller. Scoped so desktop is untouched. */}
      <style>{`
        @media (max-width: 1100px) {
          .lv2-ce-badge { padding: 6px 14px 6px 6px !important; gap: 10px !important; }
          .lv2-ce-badge img { height: 24px !important; }
        }
        @media (max-width: 640px) {
          .lv2-ce-badge { padding: 5px 12px 5px 5px !important; gap: 9px !important; }
          .lv2-ce-badge img { height: 20px !important; }
          .lv2-ce-label { font-size: 9px !important; letter-spacing: 0.12em !important; }
        }
      `}</style>
    </span>
  );
}
