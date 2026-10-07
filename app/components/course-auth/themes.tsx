"use client";

/**
 * Course-themed auth: one visual pack per cybersecurity course.
 *
 * Each of the four courses gets its OWN login + signup pages (owner
 * call 2026-10-07), skinned to the course world, over the same auth
 * plumbing the platform pages use. Route pages pass a course KEY (a
 * string, server-component safe); CourseAuthPage looks the pack up
 * here on the client.
 *
 * Palette/typography sources: each course landing's locked look -
 * Heroes playful cosmic (amber, Fredoka), Explorers matrix terminal
 * (greens on black, mono), Ops operator console (violet, Chakra),
 * Pro black coding theme (orange ghost terminal; owner taste).
 */

import type React from "react";
import CodeRainBackground from "@/app/components/CodeRainBackground";

export type CourseAuthKey = "cyberheroes" | "cyberexplorers" | "ops" | "pro";

export interface CourseAuthTheme {
  /** Catalog slug, carried through the auth flow for the hub target. */
  slug: string;
  /** Landing base path; also where "Back to course" points. */
  base: string;
  courseName: string;
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
  };
  copy: {
    loginTitle: string;
    loginSub: string;
    signupTitle: string;
    signupSub: string;
    registeredNotice: string;
    submitLogin: string;
    submitSignup: string;
  };
  /** Small glyph + wordmark, echoing the course logo lockups. */
  lockup: React.ReactNode;
  /** Full-page backdrop, absolutely positioned behind the panel. */
  backdrop: React.ReactNode;
}

/* ── Backdrops (all CSS-light; reduced-motion safe - nothing animates
      except Explorers' code rain, which handles that itself) ── */

function HeroesBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #0b1026 0%, #141a3a 55%, #1a1440 100%)" }}>
      {/* star specks */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.8,
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 12% 18%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 32% 64%, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 54% 28%, rgba(255,255,255,0.75), transparent), radial-gradient(1px 1px at 68% 74%, rgba(255,255,255,0.55), transparent), radial-gradient(1.5px 1.5px at 82% 40%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 22% 86%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 90% 82%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 44% 48%, rgba(255,255,255,0.45), transparent)",
        }}
      />
      {/* warm + cool nebula pools, kid-bright but behind a veil */}
      <div style={{ position: "absolute", width: "52vw", height: "52vw", left: "-14vw", bottom: "-20vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,0.3), transparent 65%)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", width: "46vw", height: "46vw", right: "-10vw", top: "-16vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.22), transparent 65%)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", width: "30vw", height: "30vw", right: "18vw", bottom: "-8vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,255,0.25), transparent 65%)", filter: "blur(28px)" }} />
    </div>
  );
}

function ExplorersBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#030805" }}>
      <CodeRainBackground fixed={false} bg="#030805" head="rgba(110,231,183,0.9)" accentA="rgba(74,222,128,0.85)" accentB="rgba(125,240,255,0.8)" />
      {/* veil + scanlines keep the terminal look while the form wins */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(3,8,5,0.25), rgba(3,8,5,0.78))" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)" }} />
    </div>
  );
}

function OpsBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #0a0b0f 0%, #0d0e16 60%, #12101f 100%)" }}>
      {/* console grid, receding */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(139,123,255,0.09) 0px, rgba(139,123,255,0.09) 1px, transparent 1px, transparent 46px), repeating-linear-gradient(90deg, rgba(139,123,255,0.07) 0px, rgba(139,123,255,0.07) 1px, transparent 1px, transparent 46px)",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 42%, #000 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 42%, #000 35%, transparent 100%)",
        }}
      />
      <div style={{ position: "absolute", width: "56vw", height: "40vw", left: "50%", top: "-14vw", transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,123,255,0.2), transparent 62%)", filter: "blur(34px)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.3, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 1px, transparent 1px, transparent 4px)" }} />
    </div>
  );
}

function ProBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(135deg, #060709 0%, #090a0e 52%, #0b0c12 100%)" }}>
      <div style={{ position: "absolute", width: "60vw", height: "44vw", right: "-16vw", bottom: "-18vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,61,0.14), transparent 60%)", filter: "blur(30px)" }} />
      {/* ghost terminal log, the Pro black-coding motif */}
      <pre
        style={{
          position: "absolute",
          top: "12%",
          right: "6%",
          margin: 0,
          fontFamily: "var(--font-pro-mono, ui-monospace, Menlo, monospace)",
          fontSize: 12,
          lineHeight: 2.1,
          letterSpacing: "0.02em",
          color: "rgba(232,237,255,0.1)",
          userSelect: "none",
        }}
      >
        {"$ nmap -sV target\n"}
        {"  443/tcp open\n"}
        {"$ run exploit.py\n"}
        <span style={{ color: "rgba(255,122,61,0.3)" }}>{"[+] auth bypass\n"}</span>
        {"$ sudo -l\n"}
        {"  NOPASSWD: backup\n"}
        <span style={{ color: "rgba(255,122,61,0.38)" }}>{"[+] root shell"}</span>
      </pre>
      <pre
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          margin: 0,
          fontFamily: "var(--font-pro-mono, ui-monospace, Menlo, monospace)",
          fontSize: 11,
          lineHeight: 2.1,
          color: "rgba(232,237,255,0.07)",
          userSelect: "none",
        }}
      >
        {"mov rbp,rsp\n"}
        {"sub rsp,0x40\n"}
        {"lea rax,[rbp-40]\n"}
        {"call gets ; overflow"}
      </pre>
    </div>
  );
}

/* ── Lockups (glyph + wordmark, scaled from the course logo system) ── */

const LOCKUP_ROW: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" };

/* ── The four packs ── */

export const COURSE_AUTH_THEMES: Record<CourseAuthKey, CourseAuthTheme> = {
  cyberheroes: {
    slug: "cyber-heroes",
    base: "/cyberheroes",
    courseName: "Cyber Heroes",
    fonts: {
      display: "var(--font-fredoka, 'Fredoka'), var(--font-nunito, 'Nunito'), system-ui, sans-serif",
      body: "var(--font-nunito, 'Nunito'), system-ui, sans-serif",
      mono: "var(--font-jetbrains-mono, ui-monospace), Menlo, monospace",
    },
    palette: {
      page: "#0b1026",
      panel: "rgba(16,20,44,0.82)",
      border: "rgba(255,179,71,0.3)",
      accent: "#ffb347",
      ink: "#1a1205",
      text: "#f3f6ff",
      textSoft: "rgba(223,230,255,0.75)",
      danger: "#ff6b81",
      success: "#5fe0a8",
    },
    copy: {
      loginTitle: "Welcome back!",
      loginSub: "Log in to continue the adventure with Adam and Layla.",
      signupTitle: "Join Cyber Heroes",
      signupSub: "Create the family account that powers your child's missions.",
      registeredNotice: "Account created! Log in to start the adventure.",
      submitLogin: "Log in",
      submitSignup: "Create account",
    },
    lockup: (
      <span style={LOCKUP_ROW}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden style={{ transform: "rotate(-7deg)", filter: "drop-shadow(0 0 10px rgba(255,179,71,0.45))", flexShrink: 0 }}>
          <path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z" fill="#ffb347" />
          <path d="M12 7l1.3 2.7 3 .4-2.2 2.1.5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.2-2.1 3-.4L12 7z" fill="#1a1205" />
        </svg>
        <span style={{ fontFamily: "var(--font-fredoka, 'Fredoka'), system-ui", fontWeight: 600, fontSize: "1.25rem", color: "#f3f6ff" }}>
          Cyber <span style={{ color: "#ffb347" }}>Heroes</span>
        </span>
      </span>
    ),
    backdrop: <HeroesBackdrop />,
  },

  cyberexplorers: {
    slug: "cyberexplorers",
    base: "/cyberexplorers",
    courseName: "Cyber Explorers",
    fonts: {
      display: "var(--font-geist-mono, ui-monospace), 'Geist Mono', Menlo, monospace",
      body: "var(--font-geist-sans, system-ui), sans-serif",
      mono: "var(--font-geist-mono, ui-monospace), Menlo, monospace",
    },
    palette: {
      page: "#030805",
      panel: "rgba(5,14,9,0.88)",
      border: "rgba(74,222,128,0.32)",
      accent: "#4ade80",
      ink: "#04130a",
      text: "#e7fff1",
      textSoft: "rgba(201,243,219,0.72)",
      danger: "#ff6b81",
      success: "#4ade80",
    },
    copy: {
      loginTitle: "AGENT SIGN-IN",
      loginSub: "Re-establish your secure link to ARC.",
      signupTitle: "NEW AGENT INTAKE",
      signupSub: "Create your credentials. ARC is watching the watchers.",
      registeredNotice: "Credentials issued. Sign in to go operational.",
      submitLogin: "Establish link",
      submitSignup: "Issue credentials",
    },
    lockup: (
      <span style={LOCKUP_ROW}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8" aria-hidden style={{ filter: "drop-shadow(0 0 8px rgba(74,222,128,0.4))", flexShrink: 0 }}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.4" />
          <path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.12em", color: "#e7fff1" }}>
          CYBER_<span style={{ color: "#4ade80" }}>EXPLORERS</span>
        </span>
      </span>
    ),
    backdrop: <ExplorersBackdrop />,
  },

  ops: {
    slug: "cyberstart",
    base: "/ops",
    courseName: "Cyber Ops",
    fonts: {
      display: "'Chakra Petch', var(--font-chakra, system-ui), sans-serif",
      body: "system-ui, 'Segoe UI', sans-serif",
      mono: "ui-monospace, Menlo, monospace",
    },
    palette: {
      page: "#0a0b0f",
      panel: "rgba(15,17,25,0.88)",
      border: "rgba(139,123,255,0.32)",
      accent: "#8b7bff",
      ink: "#0b0820",
      text: "#e8edff",
      textSoft: "rgba(192,200,235,0.72)",
      danger: "#ff6b81",
      success: "#5fe0a8",
    },
    copy: {
      loginTitle: "OPERATOR SIGN-IN",
      loginSub: "Reconnect to the range. Your engagements are waiting.",
      signupTitle: "ENLIST",
      signupSub: "Create your operator account and step onto the range.",
      registeredNotice: "Operator account created. Sign in to deploy.",
      submitLogin: "Connect",
      submitSignup: "Enlist",
    },
    lockup: (
      <span style={LOCKUP_ROW}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b7bff" strokeWidth="1.8" aria-hidden style={{ filter: "drop-shadow(0 0 8px rgba(139,123,255,0.4))", flexShrink: 0 }}>
          <path d="M12 2l8 3.5v5.5c0 5-3.4 8-8 11-4.6-3-8-6-8-11V5.5L12 2z" />
          <path d="M8.5 12l2.3 2.3L15.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: "'Chakra Petch', system-ui, sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.1em", color: "#e8edff" }}>
          CYBER <span style={{ color: "#8b7bff" }}>OPS</span>
        </span>
      </span>
    ),
    backdrop: <OpsBackdrop />,
  },

  pro: {
    slug: "cyberstart-pro",
    base: "/pro",
    courseName: "Cyber Pro",
    fonts: {
      display: "var(--font-pro-display, system-ui), sans-serif",
      body: "var(--font-pro-sans, system-ui), sans-serif",
      mono: "var(--font-pro-mono, ui-monospace), Menlo, monospace",
    },
    palette: {
      page: "#060709",
      panel: "rgba(12,13,17,0.9)",
      border: "rgba(255,122,61,0.3)",
      accent: "#ff7a3d",
      ink: "#160a03",
      text: "#eef1f8",
      textSoft: "rgba(205,212,230,0.72)",
      danger: "#ff6b81",
      success: "#5fe0a8",
    },
    copy: {
      loginTitle: "Sign in",
      loginSub: "Pick up your modules where you left off, on any device.",
      signupTitle: "Create your account",
      signupSub: "21 modules of career-grade cyber. Your progress follows you.",
      registeredNotice: "Account created. Sign in to open your modules.",
      submitLogin: "Sign in",
      submitSignup: "Create account",
    },
    lockup: (
      <span style={LOCKUP_ROW}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" aria-hidden style={{ filter: "drop-shadow(0 0 9px rgba(255,122,61,0.35))", flexShrink: 0 }}>
          <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
          <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 15.5 H16.2" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "var(--font-pro-display, system-ui), sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.07em", color: "#eef1f8" }}>
          CYBER <span style={{ color: "#ff7a3d" }}>PRO</span>
        </span>
      </span>
    ),
    backdrop: <ProBackdrop />,
  },
};
