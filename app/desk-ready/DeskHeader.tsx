import Link from "next/link";
import CubeMark from "@/app/components/CubeMark";
import { D } from "./tokens";

/* The course's top bar: the same DESK READY lockup as the landing, a trail
 * of where you are, and one link back. Dark glass, sticky. Sizes are inline
 * (not styled-jsx) so nothing jumps on first paint. */
export function DeskWordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11, whiteSpace: "nowrap" }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden style={{ display: "block", flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(95,141,255,0.55))" }}>
        <rect x="3" y="4" width="18" height="12" rx="2" fill="rgba(95,141,255,0.14)" stroke="#5f8dff" strokeWidth="1.8" />
        <path d="M9 20 H15 M12 16 V20" stroke="#5f8dff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 10 L10.2 12.6 L15.8 7.4" stroke="#8fd3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", gap: 3, lineHeight: 1 }}>
        <span style={{ fontFamily: D.mono, fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", color: D.ink }}>
          DESK <span style={{ color: "#5f8dff" }}>READY</span>
        </span>
        <span style={{ fontFamily: D.mono, fontWeight: 500, fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase", color: D.ink, display: "inline-flex", alignItems: "center" }}>
          <span style={{ opacity: 0.6 }}>by</span>
          <CubeMark size={12} color="#5f8dff" code style={{ display: "inline-block", margin: "0 3px", filter: "drop-shadow(0 0 4px rgba(95,141,255,0.7))" }} />
          <span style={{ opacity: 0.6 }}>AlgorithmX</span>
        </span>
      </span>
    </span>
  );
}

export default function DeskHeader({ link, trail }: { link: { href: string; label: string }; trail?: string }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(7,11,23,0.78)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${D.edge}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 16px", minHeight: 64, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 18, minWidth: 0 }}>
          <Link href="/desk-ready/course" style={{ textDecoration: "none" }} aria-label="Desk Ready: your desk">
            <DeskWordmark />
          </Link>
          {trail && (
            <span className="dr-trail" style={{ fontFamily: D.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: D.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingLeft: 18, borderLeft: `1px solid ${D.edge}` }}>
              {trail}
            </span>
          )}
        </span>
        <Link
          href={link.href}
          style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", minHeight: 42, padding: "0 18px", borderRadius: 999, border: `1px solid ${D.edgeStrong}`, background: D.glass, color: D.ink, fontFamily: D.display, fontSize: 15, fontWeight: 600, textDecoration: "none" }}
        >
          {link.label}
        </Link>
      </div>
      <style>{"@media (max-width: 720px) { .dr-trail { display: none !important; } }"}</style>
    </header>
  );
}
