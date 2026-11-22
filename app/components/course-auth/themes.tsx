"use client";

/**
 * Desk Ready's auth skin: the dark desk with a faint grid, two soft glows
 * and a light Outlook window floating behind the form, as on the landing
 * hero (owner 2026-11-09: every screen must match how it is sold).
 *
 * The four cyber courses moved to the Night Console (NightConsole.tsx,
 * owner's pick 2026-11-22); this file keeps only what Desk Ready still
 * uses. Copy and routes live in content.ts; the plumbing in useCourseAuth.
 */

import type React from "react";

export interface DeskAuthTheme {
  /** Font stacks. Vars come from the route group's layout where one
   *  exists; every stack ends in a real family so the page still
   *  renders faithfully when a var is absent. */
  fonts: { display: string; body: string; mono: string };
  palette: {
    page: string;       // page background base
    panel: string;      // form panel fill
    border: string;     // panel hairline
    accent: string;     // course accent
    ink: string;        // text ON the accent (buttons)
    text: string;
    textSoft: string;
    danger: string;
    success: string;
    /** Input fill, placeholder and the panel's shadow. They default to
     *  the dark packs' smoked field and deep shadow; a light pack needs
     *  its own or the inputs read as grey and the panel looks muddy. */
    field?: string;
    placeholder?: string;
    shadow?: string;
  };
  /** Small glyph + wordmark, echoing the course logo lockup. */
  lockup: React.ReactNode;
  /** Full-page backdrop, absolutely positioned behind the panel. */
  backdrop: React.ReactNode;
}

/* Desk Ready matches the course inside (owner 2026-11-09: every screen
 * must match how it is sold): the dark desk with a faint grid, two soft
 * glows, and a light Outlook window floating behind the form, as on the
 * landing hero. */
function DeskBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(60% 55% at 12% 0%, rgba(43,89,195,0.32), transparent 60%), radial-gradient(50% 50% at 92% 25%, rgba(124,92,255,0.22), transparent 60%), #070b17" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(127,178,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,178,255,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 85%)",
        }}
      />
      <div className="caD-glow" style={{ position: "absolute", width: "60vw", height: "44vw", left: "-16vw", top: "-18vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(58,110,224,0.22), transparent 62%)", filter: "blur(28px)" }} />
      {/* a light Outlook window, tilted, behind the form */}
      <div
        className="caD-win"
        style={{
          position: "absolute",
          right: "5%",
          bottom: "9%",
          width: 300,
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 30px 70px -30px rgba(0,0,0,0.9), 0 0 44px -14px rgba(127,178,255,0.55)",
          transform: "rotate(-4deg)",
          opacity: 0.55,
          fontFamily: "'Segoe UI', var(--lv2-font-display), system-ui, sans-serif",
          userSelect: "none",
        }}
      >
        <div style={{ background: "#0f6cbd", color: "#fff", padding: "7px 12px", fontSize: 11, fontWeight: 700 }}>New message</div>
        <div style={{ padding: "10px 12px", fontSize: 12, lineHeight: 1.7, color: "#323130" }}>
          <div><b>Subject:</b> Delivery 4417 is two pallets short</div>
          <div style={{ marginTop: 6 }}>Hi Sarah,</div>
          <div>Could you check the order for me?</div>
          <div style={{ marginTop: 6 }}>Kind regards,</div>
        </div>
      </div>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .caD-glow { animation: caD-drift 18s ease-in-out infinite alternate; }
        }
        @keyframes caD-drift {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(8vw, 6vw, 0); }
        }
        @media (max-width: 760px) { .caD-win { display: none; } }
      `}</style>
    </div>
  );
}

const LOCKUP_ROW: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" };

export const DESK_THEME: DeskAuthTheme = {
  /* the site's own faces, as inside the course */
  fonts: {
    display: "var(--lv2-font-display, 'Inter'), system-ui, sans-serif",
    body: "var(--lv2-font-display, 'Inter'), system-ui, sans-serif",
    mono: "var(--lv2-font-mono, 'Geist Mono'), ui-monospace, monospace",
  },
  palette: {
    page: "#070b17",
    panel: "rgba(15,23,46,0.86)",
    border: "rgba(127,178,255,0.3)",
    accent: "#3a6ee0",
    ink: "#ffffff",
    text: "#ffffff",
    textSoft: "rgba(222,230,250,0.74)",
    danger: "#ff7a8a",
    success: "#4cc38a",
  },
  lockup: (
    <span style={LOCKUP_ROW}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(95,141,255,0.55))" }}>
        <rect x="3" y="4" width="18" height="12" rx="2" fill="rgba(95,141,255,0.14)" stroke="#5f8dff" strokeWidth="1.8" />
        <path d="M9 20 H15 M12 16 V20" stroke="#5f8dff" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 10 L10.2 12.6 L15.8 7.4" stroke="#8fd3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: "var(--lv2-font-mono, 'Geist Mono'), ui-monospace, monospace", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.2em", color: "#ffffff" }}>
        DESK <span style={{ color: "#5f8dff" }}>READY</span>
      </span>
    </span>
  ),
  backdrop: <DeskBackdrop />,
};
