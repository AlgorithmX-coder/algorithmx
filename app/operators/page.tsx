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
  { href: "/operators/play/1", code: "LIVE", title: "Play · Module 01 (persisted)", desc: "The REAL lesson: signs you in, saves progress + reputation, and files the finding to your portfolio." },
  { href: "/operators/portfolio", code: "FILE", title: "Your portfolio", desc: "Rank, reputation, and every finding you've filed. The thing a learner walks away with." },
  { href: "/operators/hero", code: "FILM", title: "Marketing hero · Get There First", desc: "The ~29s page-one hero, with sound: cinematic stakes → the field is short defenders → a head start. Press Play with sound." },
  { href: "/operators/module1", code: "M-01", title: "Module 1 preview (no save)", desc: "The onboarding module as a standalone preview: learn → check → capture → defend → report." },
  { href: "/operators/first-capture", code: "M-05", title: "First Capture · SQL injection", desc: "The flagship capture — a real payload runs against in-browser SQLite and bypasses auth." },
];

export default function OperatorsIndex() {
  return (
    <main style={{ minHeight: "100vh", background: "#16181f", color: "#dce2ee", fontFamily: sans, display: "grid", placeItems: "start center", padding: "64px 22px 100px" }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".3em", textTransform: "uppercase", color: "#8b7bff", fontWeight: 600 }}>Cyber Ops · Range · internal preview</div>
        <h1 style={{ fontFamily: disp, fontSize: 34, fontWeight: 700, margin: "14px 0 8px", letterSpacing: "-.01em" }}>Range previews</h1>
        <p style={{ color: "#a8b2cc", fontSize: 15, lineHeight: 1.6, margin: "0 0 30px", maxWidth: "56ch" }}>
          Playable slices of the Cyber Ops range engine. Behind the site password and kept out of search — not the shipped lesson flow yet.
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          {items.map((it) => (
            <Link key={it.href} href={it.href} style={{ textDecoration: "none", display: "block", background: "#1d212c", border: "1px solid rgba(139,123,255,0.20)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#8b7bff", fontWeight: 600 }}>{it.code}</span>
                <span style={{ fontFamily: disp, fontWeight: 700, fontSize: 18, color: "#dce2ee" }}>{it.title}</span>
                <span aria-hidden style={{ marginLeft: "auto", color: "#b3a8ff", fontFamily: mono, fontSize: 14 }}>→</span>
              </div>
              <p style={{ color: "#a8b2cc", fontSize: 13.5, lineHeight: 1.55, margin: "8px 0 0" }}>{it.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
