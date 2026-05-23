"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "./utilities";

/**
 * ChooseYourPath. The first proper page section after the cinematic.
 *
 * Answers the question the cinematic's READY-state ends on:
 *   "CHOOSE A STREAM TO BEGIN"
 *
 * The user picks one of four audiences (Parent / Student / Adult /
 * School); copy, recommended stream, example project, and CTA all
 * adapt to the selection. The four audiences cover the entire ages
 * 6 -> adult product surface.
 *
 * Visual language matches the cinematic chapter aesthetic: glass dark
 * panels, accent-coloured rims, mono labels, big display headings.
 */

type AudienceId = "parent" | "student" | "adult" | "school";

interface Audience {
  id: AudienceId;
  label: string;
  /* Tag shown next to the label in the tab (e.g. "ages 6-14") */
  hint: string;
  heading: string;
  copy: string;
  recommended: {
    name: string;
    accent: string;
    status: string;
    project: string;
  };
  cta: { label: string; href: string };
}

const AUDIENCES: Audience[] = [
  {
    id: "parent",
    label: "Parent",
    hint: "ages 6–14",
    heading: "Give your child a head start.",
    copy:
      "Online life is the new playground. Build their confidence, curiosity, and safety with hands-on lessons designed for ages 6 to 14 — guided by characters and stories, not lectures.",
    recommended: {
      name: "CYBER HEROES ACADEMY",
      accent: "#5fffa3",
      status: "LIVE NOW",
      project: "Build a Password Defender — they learn by doing, not watching.",
    },
    cta: { label: "Start Cyber Heroes", href: "/cyberheroes" },
  },
  {
    id: "student",
    label: "Student",
    hint: "ages 8–16",
    heading: "Build cool stuff with tech.",
    copy:
      "Forget passive videos. Hack a phishing email, make a pixel-art platformer, train a tiny AI to recognise cats — and walk away with projects you can actually show off.",
    recommended: {
      name: "CYBER HEROES ACADEMY",
      accent: "#9ff5ff",
      status: "LIVE NOW",
      project: "Beat 8 cyber missions. Game Dev + AI streams arriving 2026.",
    },
    cta: { label: "Start Cyber Heroes", href: "/cyberheroes" },
  },
  {
    id: "adult",
    label: "Adult Learner",
    hint: "17+",
    heading: "Switch careers without the burnout.",
    copy:
      "The UK tech sector pays £65K average and is hiring everywhere. Learn cybersecurity, AI, app development or entrepreneurship with structured lessons that fit around work and family.",
    recommended: {
      name: "CYBERSECURITY",
      accent: "#cba8ff",
      status: "LIVE NOW",
      project:
        "Build a security toolkit you can put on your CV. AI & App Dev pathways launching 2026/27.",
    },
    cta: { label: "Start with Cybersecurity", href: "/cyberheroes" },
  },
  {
    id: "school",
    label: "School",
    hint: "KS2 – KS4",
    heading: "Bring AlgorithmX to your classroom.",
    copy:
      "Curriculum-aligned, teacher-friendly lessons covering all six technology streams. One platform, ages 6 to 16, volume licensing available. Pilots opening for autumn 2026.",
    recommended: {
      name: "ALL 6 STREAMS — SCHOOL PACKAGE",
      accent: "#ffd07a",
      status: "PILOT INTAKE OPEN",
      project:
        "Cyber Heroes today, plus Pixel Platformer + Maze-Solver Bot pilots from 2026.",
    },
    cta: { label: "Book a school demo", href: "/cyberheroes" },
  },
];

export default function ChooseYourPath() {
  const [active, setActive] = useState<AudienceId>("parent");
  const current = AUDIENCES.find((a) => a.id === active) ?? AUDIENCES[0];

  return (
    <section
      id="choose-your-path"
      style={{
        position: "relative",
        padding:
          "calc(var(--lv2-rail) * 2.4) var(--lv2-rail) calc(var(--lv2-rail) * 2.2)",
        color: "var(--lv2-paper)",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        {/* Section eyebrow */}
        <FadeUp>
          <p
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(232,237,255,0.55)",
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            // CHOOSE YOUR PATH
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2.2rem, 4.8vw, 4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              fontWeight: 400,
              margin: "0 auto",
              maxWidth: 880,
              color: "var(--lv2-paper)",
              textAlign: "center",
            }}
          >
            Who is this for?
          </h2>
        </FadeUp>

        {/* Audience tabs */}
        <FadeUp delay={0.14}>
          <div
            role="tablist"
            aria-label="Audience"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              marginTop: 40,
            }}
          >
            {AUDIENCES.map((a) => {
              const isActive = a.id === active;
              return (
                <button
                  key={a.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(a.id)}
                  style={{
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "12px 22px",
                    borderRadius: 999,
                    background: isActive
                      ? "var(--lv2-cyan)"
                      : "rgba(232,237,255,0.06)",
                    color: isActive ? "var(--lv2-ink)" : "var(--lv2-paper)",
                    border: isActive
                      ? "1px solid var(--lv2-cyan)"
                      : "1px solid rgba(232,237,255,0.18)",
                    cursor: "pointer",
                    transition:
                      "background .25s ease, color .25s ease, border-color .25s ease",
                    boxShadow: isActive
                      ? "0 6px 22px rgba(0,229,255,0.32)"
                      : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>{a.label}</span>
                  <span
                    style={{
                      opacity: 0.65,
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                    }}
                  >
                    {a.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* Adaptive content panel */}
        <FadeUp delay={0.22}>
          <div
            style={{
              marginTop: 36,
              position: "relative",
              minHeight: 380,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: "rgba(13,15,24,0.72)",
                  backdropFilter: "blur(16px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                  border: "1px solid rgba(232,237,255,0.1)",
                  borderTop: `2px solid ${current.recommended.accent}`,
                  borderRadius: 22,
                  padding: "44px 46px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.32)",
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                  gap: 40,
                }}
                className="lv2-cyp-card"
              >
                {/* Left column: heading + copy */}
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--lv2-font-display)",
                      fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
                      lineHeight: 1.06,
                      letterSpacing: "-0.02em",
                      fontWeight: 400,
                      margin: 0,
                      color: "var(--lv2-paper)",
                    }}
                  >
                    {current.heading}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--lv2-font-display)",
                      fontSize: "clamp(0.95rem, 1.2vw, 1.0625rem)",
                      lineHeight: 1.6,
                      color: "rgba(232,237,255,0.78)",
                      marginTop: 18,
                      marginBottom: 28,
                      maxWidth: "44ch",
                    }}
                  >
                    {current.copy}
                  </p>
                  <Link
                    href={current.cta.href}
                    style={{
                      background: "var(--lv2-cyan)",
                      color: "var(--lv2-ink)",
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      padding: "14px 22px",
                      borderRadius: 999,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      boxShadow: "0 8px 28px rgba(0,229,255,0.32)",
                    }}
                  >
                    {current.cta.label}
                    <span aria-hidden style={{ marginLeft: 10 }}>
                      →
                    </span>
                  </Link>
                </div>

                {/* Right column: recommended stream + project */}
                <div
                  style={{
                    background: "rgba(4,5,13,0.55)",
                    border: `1px solid ${current.recommended.accent}33`,
                    borderRadius: 16,
                    padding: "28px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "rgba(232,237,255,0.55)",
                    }}
                  >
                    // RECOMMENDED STREAM
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: current.recommended.accent,
                        boxShadow: `0 0 16px ${current.recommended.accent}b3`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: current.recommended.accent,
                      }}
                    >
                      {current.recommended.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--lv2-ink)",
                        background: current.recommended.accent,
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {current.recommended.status}
                    </span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid rgba(232,237,255,0.08)",
                      marginTop: 6,
                      paddingTop: 14,
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "rgba(232,237,255,0.5)",
                    }}
                  >
                    // EXAMPLE PROJECT
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--lv2-font-display)",
                      fontSize: "1.0625rem",
                      lineHeight: 1.5,
                      color: "var(--lv2-paper)",
                    }}
                  >
                    {current.recommended.project}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>
      </div>

      <style jsx>{`
        @media (max-width: 820px) {
          .lv2-cyp-card {
            grid-template-columns: 1fr !important;
            gap: 26px !important;
            padding: 32px 26px !important;
          }
        }
      `}</style>
    </section>
  );
}
