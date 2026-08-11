import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cyber Ops · Range previews",
  robots: { index: false, follow: false },
};

const disp = "var(--font-chakra),'Chakra Petch',system-ui,sans-serif";
const mono = "var(--font-plex-mono),ui-monospace,Menlo,monospace";
const sans = "var(--font-plex-sans),system-ui,sans-serif";

const items = [
  { href: "/operators/hero", code: "FILM", title: "Marketing hero · Get There First", desc: "The ~29s page-one hero, with sound: cinematic stakes → the field is short defenders → a head start. Press Play with sound." },
  { href: "/operators/week1", code: "E-01", title: "Week 1 · Rules of Engagement", desc: "The onboarding engagement, taught as a full lesson: learn → check → capture → defend → report." },
  { href: "/operators/first-capture", code: "E-05", title: "First Capture · SQL injection", desc: "The flagship capture — a real payload runs against in-browser SQLite and bypasses auth." },
];

export default function OperatorsIndex() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0b0f", color: "#e8edff", fontFamily: sans, display: "grid", placeItems: "start center", padding: "64px 22px 100px" }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase", color: "#8b7bff", fontWeight: 600 }}>Cyber Ops · Range · internal preview</div>
        <h1 style={{ fontFamily: disp, fontSize: 34, fontWeight: 700, margin: "14px 0 8px", letterSpacing: "-.01em" }}>Range previews</h1>
        <p style={{ color: "#a6b2d6", fontSize: 15, lineHeight: 1.6, margin: "0 0 30px", maxWidth: "56ch" }}>
          Playable slices of the Cyber Ops range engine. Behind the site password and kept out of search — not the shipped lesson flow yet.
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          {items.map((it) => (
            <Link key={it.href} href={it.href} style={{ textDecoration: "none", display: "block", background: "#0f1119", border: "1px solid rgba(139,123,255,0.18)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#8b7bff", fontWeight: 600 }}>{it.code}</span>
                <span style={{ fontFamily: disp, fontWeight: 700, fontSize: 18, color: "#e8edff" }}>{it.title}</span>
                <span aria-hidden style={{ marginLeft: "auto", color: "#b3a8ff", fontFamily: mono, fontSize: 14 }}>→</span>
              </div>
              <p style={{ color: "#a6b2d6", fontSize: 13.5, lineHeight: 1.55, margin: "8px 0 0" }}>{it.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
