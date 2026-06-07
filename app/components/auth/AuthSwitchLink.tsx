"use client";

import Link from "next/link";
import { useState } from "react";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "./accessTokens";

/**
 * The "Already have an account? Log in" / "Don't have an account? Sign up"
 * switch — a muted prompt + a polished glass pill button with a hover lift,
 * cyan edge-glow and an arrow nudge. `solid` uses the brand gradient for the
 * primary action (e.g. Sign up on the login page). Inline styles + hover state
 * so it renders identically everywhere (no styled-jsx dependency).
 */
export default function AuthSwitchLink({
  prompt,
  label,
  href,
  variant = "outline",
}: {
  prompt: string;
  label: string;
  href: string;
  variant?: "outline" | "solid";
}) {
  const [hover, setHover] = useState(false);
  const solid = variant === "solid";

  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 16px",
    borderRadius: 11,
    fontFamily: ACCESS_FONT.body,
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.2,
    textDecoration: "none",
    whiteSpace: "nowrap",
    color: solid ? "#06080f" : hover ? "#eafcff" : ACCESS.cyanSoft,
    border: `1px solid ${solid ? "transparent" : rgba(ACCESS.cyan, hover ? 0.85 : 0.42)}`,
    background: solid
      ? ACCESS_GRAD.brand
      : `linear-gradient(180deg, ${rgba(ACCESS.cyan, hover ? 0.22 : 0.1)}, ${rgba(ACCESS.cyan, hover ? 0.08 : 0.03)})`,
    boxShadow: solid
      ? hover
        ? `0 10px 26px -6px ${rgba(ACCESS.cyan, 0.6)}, 0 0 20px ${rgba(ACCESS.violet, 0.3)}`
        : `0 6px 18px -6px ${rgba(ACCESS.cyan, 0.5)}`
      : hover
        ? `0 8px 22px -6px ${rgba(ACCESS.cyan, 0.45)}, 0 0 18px ${rgba(ACCESS.cyan, 0.22)}, inset 0 1px 0 rgba(255,255,255,0.12)`
        : "inset 0 1px 0 rgba(255,255,255,0.06)",
    transform: hover ? "translateY(-1px)" : "translateY(0)",
    filter: solid && hover ? "brightness(1.08)" : "none",
    transition: "transform 220ms cubic-bezier(.2,.7,.3,1), box-shadow 220ms ease, border-color 220ms ease, background 220ms ease, color 220ms ease",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 13, color: ACCESS.textMuted, fontWeight: 500 }}>{prompt}</span>
      <Link href={href} style={pill} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <span>{label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ transform: hover ? "translateX(3px)" : "translateX(0)", transition: "transform 220ms ease" }}
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
