import Link from "next/link";
import { D } from "./tokens";

/* The Desk Ready top bar: wordmark on the left, one plain link on the
 * right. Sizes are inline (not styled-jsx) so nothing jumps on first paint. */
export function DeskWordmark({ size = 20 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 24 24" fill="none" stroke={D.accent} strokeWidth="2" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M9 20 H15 M12 16 V20" strokeLinecap="round" />
        <path d="M7.5 10 L10 12.5 L15.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: D.display, fontWeight: 700, fontSize: size, color: D.ink, letterSpacing: "0.01em" }}>
        Desk <span style={{ color: D.accent }}>Ready</span>
      </span>
    </span>
  );
}

export default function DeskHeader({ link }: { link: { href: string; label: string } }) {
  return (
    <header style={{ borderBottom: `1px solid ${D.edgeSoft}`, background: "rgba(246,243,238,0.88)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/desk-ready" style={{ textDecoration: "none" }} aria-label="Desk Ready home">
          <DeskWordmark />
        </Link>
        <Link href={link.href} style={{ fontSize: 16, fontWeight: 700, color: D.accent, textDecoration: "none", padding: "8px 4px" }}>
          {link.label}
        </Link>
      </div>
    </header>
  );
}
