"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCinematicReleaseProgress } from "./utilities";

/**
 * ALGO - the AlgorithmX OS path advisor.
 *
 * A subtle persistent corner widget that helps users choose a stream
 * without ever turning into a generic chatbot. Visual language is
 * "AlgorithmX OS UI element", not "Intercom bubble":
 *  - pulsing cyan orb (system online indicator)
 *  - mono caps wordmark
 *  - status line in muted mono
 *  - expanded panel reads like a heads-up display with a single
 *    actionable recommendation
 *
 * Behaviour:
 *  - HIDDEN during the cinematic so it doesn't compete with the chapter
 *    framework (appears once user has scrolled past ~1.6x viewport).
 *  - Adapts its suggestion to the audience the user selected in the
 *    ChooseYourPath section (Parent / Student / Adult Learner / School)
 *    via a `algo:audience-changed` window event.
 *  - Collapsed by default: chip with orb + ALGO + status. Click to
 *    expand into a recommendation panel with a single primary CTA.
 */

type AudienceId = "parent" | "student" | "adult" | "school" | null;

interface Suggestion {
  stream: string;
  accent: string;
  status: string;
  project: string;
  href: string;
  cta: string;
}

const DEFAULT_SUGGESTION: Suggestion = {
  stream: "CYBER HEROES ACADEMY",
  accent: "#5fffa3",
  status: "LIVE NOW",
  project: "Build a Password Defender — the only stream live today.",
  href: "/cyberheroes",
  cta: "Start Cyber Heroes",
};

const AUDIENCE_SUGGESTIONS: Record<Exclude<AudienceId, null>, Suggestion> = {
  parent: {
    stream: "CYBER HEROES ACADEMY",
    accent: "#5fffa3",
    status: "LIVE NOW",
    project: "Story-led safety lessons for ages 6-14. Hands-on, not videos.",
    href: "/cyberheroes",
    cta: "Start Cyber Heroes",
  },
  student: {
    stream: "CYBER HEROES ACADEMY",
    accent: "#9ff5ff",
    status: "LIVE NOW",
    project: "8 cyber missions to beat. Game Dev + AI streams arriving 2026.",
    href: "/cyberheroes",
    cta: "Start Cyber Heroes",
  },
  adult: {
    stream: "CYBERSECURITY",
    accent: "#cba8ff",
    status: "LIVE NOW",
    project: "Build a portfolio. UK tech avg £65K — start here.",
    href: "/cyberheroes",
    cta: "Start Cybersecurity",
  },
  school: {
    stream: "SCHOOL PACKAGE",
    accent: "#ffd07a",
    status: "PILOT INTAKE",
    project: "Six streams. KS2-KS4. Volume licensing for autumn 2026.",
    href: "/cyberheroes",
    cta: "Book a demo",
  },
};

const AUDIENCE_LABEL_SHORT: Record<Exclude<AudienceId, null>, string> = {
  parent: "Parents",
  student: "Students",
  adult: "Adults",
  school: "Schools",
};

/* Scroll-context status phrases. Each one is paired with the DOM id
 * of the section that activates it (matches the `id="..."` on the
 * page sections). When that section enters the viewport, ALGO's
 * status line crossfades to the matching phrase. */
const SECTION_PHRASES: ReadonlyArray<{ id: string; phrase: string }> = [
  { id: "choose-your-path", phrase: "Awaiting audience input." },
  { id: "the-state-of-play", phrase: "Reading stats." },
  { id: "subjects", phrase: "Six streams detected." },
  { id: "how", phrase: "Parsing programme structure." },
  { id: "age-progression", phrase: "Aligning age band." },
  { id: "projects", phrase: "Project pool ready." },
  { id: "parent-trust", phrase: "Validating safety policy." },
  { id: "testimonials", phrase: "Reading family signal." },
  { id: "faq", phrase: "Resolving objections." },
  { id: "final-cta", phrase: "Path locked. Ready when you are." },
];

export default function Algo() {
  const [expanded, setExpanded] = useState(false);
  const [audience, setAudience] = useState<AudienceId>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  /* Use the shared cinematic-release hook so ALGO appears at the same
   * moment the Nav CTA returns - both honour the viewport-aware
   * cinematic rail height. visible is a boolean derived from the fade
   * value crossing 0.5 (avoids ALGO flickering during the fade window). */
  const releaseProgress = useCinematicReleaseProgress();
  const visible = releaseProgress > 0.5;

  /* IntersectionObserver: which page section is currently most in view?
   * Updates the status line so ALGO feels like it's "watching" the user
   * scroll through the page. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    const observed: HTMLElement[] = [];
    SECTION_PHRASES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observed.push(el);
    });
    if (observed.length === 0) return;
    /* Track which sections are intersecting; pick the one nearest the
     * top of the viewport as the "active" section. */
    const seen = new Map<string, IntersectionObserverEntry>();
    const recompute = () => {
      let best: { id: string; top: number } | null = null;
      seen.forEach((entry, id) => {
        if (!entry.isIntersecting) return;
        const top = entry.boundingClientRect.top;
        /* Prefer sections that have just entered (top near 0 or
         * positive but small). Sections far up the page (top negative)
         * are de-prioritised in favour of the one currently dominant. */
        const score = top >= -100 ? Math.abs(top) : Math.abs(top) + 10000;
        if (best === null || score < best.top) {
          best = { id, top: score };
        }
      });
      setActiveSectionId(best ? (best as { id: string }).id : null);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          seen.set(entry.target.id, entry);
        });
        recompute();
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    observed.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Listen for audience-change events dispatched by ChooseYourPath.
   * ALGO mounts later than ChooseYourPath (only once the user scrolls
   * past the cinematic), so the initial event has already fired by the
   * time we subscribe. To catch the initial value, also read the
   * window cache that ChooseYourPath maintains. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = (window as unknown as { __lvAudience?: AudienceId })
      .__lvAudience;
    if (cached) setAudience(cached);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ audience: AudienceId }>).detail;
      if (detail) setAudience(detail.audience);
    };
    window.addEventListener("algo:audience-changed", handler as EventListener);
    return () =>
      window.removeEventListener(
        "algo:audience-changed",
        handler as EventListener,
      );
  }, []);

  const suggestion = audience ? AUDIENCE_SUGGESTIONS[audience] : DEFAULT_SUGGESTION;
  /* Status priority:
   *   1. scroll-context phrase (what section is visible)
   *   2. audience-pinned phrase (what they picked in ChooseYourPath)
   *   3. default "standing by"
   * Section phrase wins so the user feels ALGO is alive and following
   * their scroll; audience info still surfaces inside the expanded
   * panel. */
  const sectionPhrase = SECTION_PHRASES.find(
    (s) => s.id === activeSectionId,
  )?.phrase;
  const statusLine =
    sectionPhrase ??
    (audience ? `Path for ${AUDIENCE_LABEL_SHORT[audience]}.` : "Standing by.");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: 22,
            right: 22,
            zIndex: 40,
          }}
        >
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              aria-label="Open ALGO path advisor"
              style={{
                background: "rgba(13,15,24,0.86)",
                backdropFilter: "blur(18px) saturate(1.6)",
                WebkitBackdropFilter: "blur(18px) saturate(1.6)",
                border: "1px solid rgba(0,229,255,0.32)",
                borderRadius: 999,
                padding: "9px 18px 9px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "var(--lv2-paper)",
                boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
              }}
            >
              <Orb />
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                ALGO
              </span>
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(232,237,255,0.6)",
                  borderLeft: "1px solid rgba(232,237,255,0.14)",
                  paddingLeft: 12,
                }}
              >
                {statusLine}
              </span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: "rgba(13,15,24,0.92)",
                backdropFilter: "blur(20px) saturate(1.6)",
                WebkitBackdropFilter: "blur(20px) saturate(1.6)",
                border: "1px solid rgba(0,229,255,0.28)",
                borderTop: `2px solid ${suggestion.accent}`,
                borderRadius: 18,
                padding: "20px 22px 18px",
                width: 344,
                color: "var(--lv2-paper)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <Orb size={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                    }}
                  >
                    ALGO
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "rgba(232,237,255,0.5)",
                    }}
                  >
                    PATH ADVISOR
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Collapse ALGO"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(232,237,255,0.6)",
                    fontSize: 20,
                    cursor: "pointer",
                    padding: "0 4px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Message */}
              <p
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: "var(--lv2-paper)",
                  margin: "0 0 14px",
                }}
              >
                {audience
                  ? `Path tuned for ${AUDIENCE_LABEL_SHORT[audience].toLowerCase()}. Here's your starting point:`
                  : "Pick an audience above or jump straight into the only stream live today."}
              </p>

              {/* Recommendation card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={audience ?? "default"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.24 }}
                  style={{
                    background: "rgba(4,5,13,0.6)",
                    border: `1px solid ${suggestion.accent}33`,
                    borderRadius: 12,
                    padding: "13px 14px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: suggestion.accent,
                        boxShadow: `0 0 12px ${suggestion.accent}b3`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: suggestion.accent,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {suggestion.stream}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--lv2-ink)",
                        background: suggestion.accent,
                        padding: "3px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {suggestion.status}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--lv2-font-display)",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "rgba(232,237,255,0.78)",
                      margin: 0,
                    }}
                  >
                    {suggestion.project}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <Link
                  href={suggestion.href}
                  style={{
                    background: "var(--lv2-cyan)",
                    color: "var(--lv2-ink)",
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "10px 14px",
                    borderRadius: 999,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    boxShadow: "0 6px 22px rgba(0,229,255,0.32)",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {suggestion.cta}
                  <span aria-hidden style={{ marginLeft: 6 }}>
                    →
                  </span>
                </Link>
                <button
                  onClick={() => setExpanded(false)}
                  style={{
                    background: "rgba(232,237,255,0.06)",
                    color: "var(--lv2-paper)",
                    border: "1px solid rgba(232,237,255,0.18)",
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    padding: "10px 14px",
                    borderRadius: 999,
                    cursor: "pointer",
                  }}
                >
                  Later
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Pulsing cyan orb with an outer ring that expands and fades - the
 * "system online" indicator. Sized via the size prop. */
function Orb({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        display: "inline-block",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: "var(--lv2-cyan)",
          boxShadow: "0 0 12px rgba(0,229,255,0.85)",
          animation: "algoPulse 1.8s ease-in-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: 999,
          border: "1px solid rgba(0,229,255,0.4)",
          animation: "algoRing 2.4s ease-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes algoPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.82);
          }
        }
        @keyframes algoRing {
          0% {
            transform: scale(0.7);
            opacity: 0.7;
          }
          80%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
