"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS } from "./data";
import { Ico, FadeUp, useTilt3D } from "./utilities";

/**
 * Subject showcase - 6 tabs (Cybersecurity / Game Dev / AI / App Dev /
 * Entrepreneurship / Robotics) on the bright product page.
 *
 * Interactive:
 *  - Tabs glow with their accent on hover
 *  - Active tab → animated connection lines fan out toward course cards
 *  - Course cards 3D-tilt on hover (perspective rotate Y/X based on cursor)
 *  - Cards cascade-stagger in when section enters view
 */
export default function SubjectShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const active = SUBJECTS[activeTab];

  return (
    <section
      id="subjects"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 2.4) var(--lv2-rail)",
        overflow: "hidden",
        color: "var(--lv2-paper)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,255,0.32), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Soft accent wash that follows the active subject */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id + "-wash"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 1100,
            height: 1100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${active.accent}, transparent 62%)`,
            opacity: 0.14,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      </AnimatePresence>

      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <FadeUp>
            <p
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(232,237,255,0.55)",
                marginBottom: 14,
              }}
            >
              // ENGINEERING FIELDS
            </p>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2
              style={{
                fontFamily: "var(--lv2-font-display)",
                fontSize: "clamp(32px, 4.5vw, 56px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--lv2-paper)",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Six streams of technology education.
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p
              style={{
                color: "rgba(232,237,255,0.7)",
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 640,
                margin: "16px auto 0",
              }}
            >
              From online safety for six-year-olds to professional
              cybersecurity certifications. Pick a track.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.15}>
          <div className="lv2-tab-row">
            {SUBJECTS.map((s, i) => {
              const isActive = i === activeTab;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(i)}
                  type="button"
                  style={{
                    border: isActive
                      ? `1.5px solid ${s.accent}`
                      : "1px solid rgba(232,237,255,0.14)",
                    background: isActive
                      ? `${s.accent}22`
                      : "rgba(13,15,24,0.6)",
                    color: isActive ? s.accent : "rgba(232,237,255,0.78)",
                    padding: "11px 22px",
                    borderRadius: 999,
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    boxShadow: isActive
                      ? `0 0 28px ${s.accent}60`
                      : "none",
                    transition:
                      "background .25s ease, color .25s ease, box-shadow .25s ease, border-color .25s ease, transform .2s ease",
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = `${s.accent}1a`;
                      e.currentTarget.style.borderColor = `${s.accent}66`;
                      e.currentTarget.style.color = s.accent;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "rgba(13,15,24,0.6)";
                      e.currentTarget.style.borderColor =
                        "rgba(232,237,255,0.14)";
                      e.currentTarget.style.color = "rgba(232,237,255,0.78)";
                    }
                  }}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </FadeUp>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subject header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginBottom: 26,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${active.accent}1a`,
                  border: `1px solid ${active.accent}55`,
                }}
              >
                <Ico
                  name={active.iconName}
                  size={20}
                  color={active.accent}
                  sw={2.1}
                />
              </span>
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: active.accent,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: `1px solid ${active.accent}66`,
                  background: `${active.accent}14`,
                }}
              >
                {active.status}
              </span>
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(232,237,255,0.55)",
                }}
              >
                {active.ages}
              </span>
            </div>

            {/* Course cards row */}
            <div className="lv2-course-grid">
              {active.courses.map((c, i) => (
                <CourseCard
                  key={c.title}
                  course={c}
                  accent={active.accent}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        .lv2-tab-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 44px;
        }
        .lv2-course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
      `}</style>
    </section>
  );
}

function CourseCard({
  course,
  accent,
  index,
}: {
  course: import("./data").Course;
  accent: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useTilt3D(cardRef, { max: 4.5, scale: 1.02 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08 + index * 0.07 }}
      style={{ perspective: 1200 }}
    >
      <div
        ref={cardRef}
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(13,15,24,0.72)",
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          border: "1px solid rgba(232,237,255,0.1)",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.4), 0 14px 36px rgba(0,0,0,0.25)",
          transition:
            "box-shadow .35s cubic-bezier(0.16,1,0.3,1), border-color .35s ease",
          willChange: "transform",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${accent}66`;
          e.currentTarget.style.boxShadow = `0 1px 3px rgba(0,0,0,0.4), 0 28px 70px ${accent}48`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,237,255,0.1)";
          e.currentTarget.style.boxShadow =
            "0 1px 3px rgba(0,0,0,0.4), 0 14px 36px rgba(0,0,0,0.25)";
        }}
      >
        {/* Accent top stripe */}
        <div
          aria-hidden
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          }}
        />
        <div
          style={{
            padding: "26px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: accent,
                padding: "5px 10px",
                borderRadius: 999,
                border: `1px solid ${accent}55`,
                background: `${accent}10`,
              }}
            >
              {course.ageRange}
            </span>
            {course.live ? (
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#5fffa3",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "#5fffa3",
                    boxShadow: "0 0 12px rgba(95,255,163,0.85)",
                    animation: "lv2Pulse 1.6s ease-in-out infinite",
                  }}
                />
                LIVE
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(232,237,255,0.5)",
                }}
              >
                {course.coming}
              </span>
            )}
          </div>

          <h3
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--lv2-paper)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {course.title}
          </h3>

          <p
            style={{
              color: "rgba(232,237,255,0.72)",
              fontSize: 14,
              lineHeight: 1.6,
              margin: 0,
              minHeight: 84,
            }}
          >
            {course.desc}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 11,
                color: "rgba(232,237,255,0.5)",
                letterSpacing: "0.06em",
              }}
            >
              {course.duration}
            </span>
            <span
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 12,
                color: accent,
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              {course.price}
            </span>
            {course.extra && (
              <span
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  color: "rgba(232,237,255,0.5)",
                  marginTop: 2,
                }}
              >
                {course.extra}
              </span>
            )}
          </div>

          <Link
            href={course.href}
            style={{
              marginTop: "auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 18px",
              background: course.live ? accent : "transparent",
              color: course.live ? "var(--lv2-ink)" : accent,
              border: course.live ? "none" : `1px solid ${accent}66`,
              borderRadius: 999,
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: course.live ? `0 8px 24px ${accent}55` : "none",
              transition: "transform .2s ease",
            }}
          >
            {course.live ? "Explore Course" : "Notify Me"}
            <Ico name="arrow" size={14} sw={2.2} />
          </Link>
        </div>
      </div>
      <style jsx global>{`
        @keyframes lv2Pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
}
