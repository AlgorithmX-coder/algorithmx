"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

const AGES = [6, 7, 8, 9, 10];

const AGE_COLOR = { bg: "rgba(6,182,212,0.1)", border: "#06b6d4", text: "#22d3ee" };

function getCourseLabel(_age: number, name: string) {
  return `🛡️ Cyber Heroes Academy — Perfect for ${name}!`;
}

// Slugs (`name`) preserve the original 6 values so saved profiles stay valid;
// labels are tech-themed. The next 6 are new options with new slugs.
const AVATAR_COLORS = [
  { name: "purple", color: "#8b5cf6", label: "Phantom Purple" },
  { name: "blue", color: "#3b82f6", label: "Blazing Blue" },
  { name: "cyan", color: "#06b6d4", label: "Cyber Cyan" },
  { name: "green", color: "#22c55e", label: "Hacker Green" },
  { name: "amber", color: "#f59e0b", label: "Solar Amber" },
  { name: "pink", color: "#ec4899", label: "Pixel Pink" },
  { name: "neon-violet", color: "#a855f7", label: "Neon Violet" },
  { name: "plasma-magenta", color: "#d946ef", label: "Plasma Magenta" },
  { name: "inferno-red", color: "#ef4444", label: "Inferno Red" },
  { name: "glitch-gold", color: "#fbbf24", label: "Glitch Gold" },
  { name: "frost-teal", color: "#14b8a6", label: "Frost Teal" },
  { name: "laser-lime", color: "#84cc16", label: "Laser Lime" },
];

function FloatingOrbs() {
  // Pixar-magic background — bright animated gradient blobs, twinkling
  // stars, drifting cyber-icons, shooting stars and an aurora ribbon at
  // the bottom. Lives in a fixed layer so it persists across wizard
  // steps without re-mounting (animation never resets between Next clicks).
  const PARTICLES = Array.from({ length: 32 }).map((_, i) => ({
    key: i,
    left: (i * 3.3 + (i % 3) * 2) % 100,
    size: 4 + (i % 5),
    color: ["#a78bfa", "#60a5fa", "#f472b6", "#fde047", "#22d3ee", "#34d399"][i % 6],
    delay: (i * 0.7) % 14,
    duration: 14 + (i % 7) * 2.2,
    peak: 0.32 + ((i * 11) % 22) / 100,
  }));
  const STARS = Array.from({ length: 56 }).map((_, i) => ({
    key: i,
    left: (i * 1.9 + (i % 5) * 1.7) % 100,
    top: (i * 2.3 + (i % 7) * 2.1) % 100,
    size: 2 + (i % 3),
    delay: (i * 0.13) % 5,
    dur: 2.2 + (i % 4),
    peak: 0.35 + ((i * 13) % 35) / 100,
  }));
  // Shooting stars — fire on a stagger so the sky always has motion.
  const SHOOTERS = Array.from({ length: 5 }).map((_, i) => ({
    key: i,
    delay: i * 4 + (i * 0.7),
    duration: 1.6 + (i % 3) * 0.4,
    top: 8 + i * 14,
    period: 18 + i * 2,
  }));
  // Drifting decorative cyber-friendly icons — kept faint so they read as
  // ambient magic, not foreground UI.
  const DRIFT_ICONS = [
    { ch: "🔒", left: 12, top: 18, dur: 24 },
    { ch: "🛡", left: 78, top: 22, dur: 28 },
    { ch: "🔑", left: 18, top: 70, dur: 26 },
    { ch: "⭐", left: 86, top: 64, dur: 30 },
    { ch: "✨", left: 50, top: 12, dur: 22 },
    { ch: "✨", left: 8, top: 48, dur: 24 },
    { ch: "🌙", left: 92, top: 8, dur: 32 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Big animated gradient blobs — brighter + saturated */}
      <motion.div
        animate={{ x: ["-8%", "8%", "-8%"], y: ["-6%", "6%", "-6%"], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-20%", left: "-15%",
          width: "75vmax", height: "75vmax",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.45), rgba(139,92,246,0.12) 45%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />
      <motion.div
        animate={{ x: ["6%", "-8%", "6%"], y: ["8%", "-6%", "8%"], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "-25%", right: "-15%",
          width: "75vmax", height: "75vmax",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.4), rgba(59,130,246,0.1) 45%, transparent 70%)",
          filter: "blur(36px)",
        }}
      />
      <motion.div
        animate={{ opacity: [0.28, 0.45, 0.28], scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "38%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "55vmax", height: "55vmax",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,114,182,0.32), rgba(244,114,182,0.08) 50%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], rotate: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "60%", left: "20%",
          width: "40vmax", height: "40vmax",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.28), transparent 60%)",
          filter: "blur(36px)",
        }}
      />

      {/* Aurora ribbon at the bottom — slowly hue-shifting wave */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-20%",
          right: "-20%",
          bottom: 0,
          height: "32vh",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(139,92,246,0.18) 35%, rgba(244,114,182,0.16) 65%, rgba(34,211,238,0.20) 100%)",
          filter: "blur(28px)",
          animation: "onbAuroraDrift 18s ease-in-out infinite",
          mixBlendMode: "screen",
        }}
      />

      {/* Drifting decorative cyber icons (very low opacity) */}
      {DRIFT_ICONS.map((ic, i) => (
        <span
          key={`icon-${i}`}
          style={{
            position: "absolute",
            left: `${ic.left}%`,
            top: `${ic.top}%`,
            fontSize: 28 + (i % 3) * 6,
            opacity: 0.18,
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
            animation: `onbIconDrift ${ic.dur}s ease-in-out ${i * 0.6}s infinite`,
          }}
        >
          {ic.ch}
        </span>
      ))}

      {/* Twinkling stars */}
      {STARS.map((s) => (
        <span
          key={`star-${s.key}`}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 7px rgba(255,255,255,0.9)",
            animation: `onbStarTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            ["--onb-star-peak" as string]: `${s.peak}`,
          } as React.CSSProperties}
        />
      ))}

      {/* Shooting stars — diagonal streaks across the sky */}
      {SHOOTERS.map((sh) => (
        <span
          key={`shooter-${sh.key}`}
          style={{
            position: "absolute",
            left: 0,
            top: `${sh.top}%`,
            width: 140,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), rgba(34,211,238,0.6))",
            filter: "blur(0.5px) drop-shadow(0 0 6px rgba(255,255,255,0.7))",
            animation: `onbShootingStar ${sh.period}s ease-in ${sh.delay}s infinite`,
            transformOrigin: "left center",
            opacity: 0,
          }}
        />
      ))}

      {/* Drifting pastel particles rising from below */}
      {PARTICLES.map((p) => (
        <span
          key={`p-${p.key}`}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: -12,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 12px ${p.color}`,
            animation: `onbParticleRise ${p.duration}s linear ${p.delay}s infinite`,
            ["--onb-particle-peak" as string]: `${p.peak}`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes onbStarTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: var(--onb-star-peak, 0.6); }
        }
        @keyframes onbParticleRise {
          0% { transform: translateY(0); opacity: 0; }
          12% { opacity: var(--onb-particle-peak, 0.4); }
          88% { opacity: var(--onb-particle-peak, 0.4); }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes onbShootingStar {
          0% { transform: translate(0, 0) rotate(18deg); opacity: 0; }
          5% { opacity: 1; }
          12% { opacity: 1; }
          18% { transform: translate(120vw, 24vh) rotate(18deg); opacity: 0; }
          100% { transform: translate(120vw, 24vh) rotate(18deg); opacity: 0; }
        }
        @keyframes onbAuroraDrift {
          0%, 100% { transform: translateX(-3%) scaleY(1); }
          50% { transform: translateX(3%) scaleY(1.08); }
        }
        @keyframes onbIconDrift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(8px, -10px) rotate(5deg); }
          50% { transform: translate(-6px, -4px) rotate(-3deg); }
          75% { transform: translate(4px, 8px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}

const ageBubbleVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20, delay: i * 0.05 },
  }),
};

const colorCircleVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20, delay: i * 0.06 },
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [avatarColor, setAvatarColor] = useState("purple");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goNext = () => {
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/child-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName: childName.trim(), age, avatarColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/welcome");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const selectedColor = AVATAR_COLORS.find((c) => c.name === avatarColor)?.color || "#8b5cf6";

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#1a1033" }}>
      <FloatingOrbs />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ zIndex: 1 }}>
        {/* Logo */}
        <a href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: GRAD, boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}>
            <span className="text-lg font-black text-white">AX</span>
          </div>
          <span className="text-2xl font-black text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            Algorithm<span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>X</span>
          </span>
        </a>

        {/* Step dots */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2].map((s) => (
            <div key={s} className="rounded-full transition-all duration-500" style={{
              width: s === step ? 32 : 10, height: 10,
              background: s <= step ? GRAD : "rgba(255,255,255,0.1)",
              boxShadow: s === step ? "0 0 10px rgba(139,92,246,0.4)" : "none",
            }} />
          ))}
        </div>

        {/* Content area with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="w-full max-w-3xl"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}>

            {/* STEP 0: NAME */}
            {step === 0 && (
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Welcome to{" "}
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>AlgorithmX!</span>
                </h1>
                <p className="text-gray-300 text-base mb-8">
                  Before we begin, tell us about your young learner
                </p>

                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Form card */}
                  <motion.div className="flex-1 w-full rounded-3xl p-7 sm:p-8"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{
                      background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                    <label className="block text-left text-sm font-bold text-gray-300 mb-3">
                      What&apos;s your child&apos;s name?
                    </label>
                    <div className="relative">
                      <motion.span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl"
                        animate={{ rotate: [-20, 20, -20] }}
                        transition={{ duration: 1, repeat: Infinity }}>
                        👋
                      </motion.span>
                      <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        autoFocus
                        className="w-full pl-14 pr-5 rounded-2xl text-white placeholder-gray-500 font-bold transition-all duration-300 focus:outline-none"
                        style={{
                          height: 60, fontSize: 18,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 0 25px rgba(139,92,246,0.2)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                        placeholder="e.g. Oliver"
                      />
                    </div>

                    <AnimatePresence>
                      {childName.trim().length >= 2 && (
                        <motion.div className="mt-6"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          <motion.button onClick={goNext}
                            whileHover={{ scale: 1.02, boxShadow: "0 6px 30px rgba(139,92,246,0.5)" }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full font-black text-white text-base rounded-2xl"
                            style={{ height: 50, background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                            Next →
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Adam & Layla (desktop only) */}
                  <div className="hidden lg:block shrink-0">
                    <motion.img src="/characters/waving.png" alt="Adam and Layla"
                      width={280} height={280}
                      className="block rounded-3xl"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: AGE */}
            {step === 1 && (
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
                  How old is {childName.trim()}? 🎂
                </h1>
                <div className="mb-8" />

                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {AGES.map((a, idx) => {
                    const isSelected = age === a;
                    return (
                      <motion.button key={a} onClick={() => setAge(a)}
                        custom={idx}
                        variants={ageBubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className="rounded-full flex items-center justify-center font-black transition-all duration-300"
                        style={{
                          width: 70, height: 70, fontSize: 18,
                          background: isSelected ? AGE_COLOR.border : AGE_COLOR.bg,
                          border: `2px solid ${AGE_COLOR.border}`,
                          color: isSelected ? "#fff" : AGE_COLOR.text,
                          transform: isSelected ? "scale(1.15)" : "scale(1)",
                          boxShadow: isSelected ? `0 0 20px ${AGE_COLOR.border}60` : "none",
                          minWidth: 48, minHeight: 48,
                        }}>
                        {isSelected ? `${a} ✓` : a}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {age !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                      <div className="rounded-2xl p-4 mb-6 inline-block"
                        style={{
                          background: AGE_COLOR.bg,
                          border: `1px solid ${AGE_COLOR.border}40`,
                        }}>
                        <p className="text-base font-bold" style={{ color: AGE_COLOR.text }}>
                          {getCourseLabel(age, childName.trim())}
                        </p>
                      </div>

                      <div>
                        <motion.button onClick={goNext}
                          whileHover={{ scale: 1.02, boxShadow: "0 6px 30px rgba(139,92,246,0.5)" }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full max-w-xs font-black text-white text-base rounded-2xl"
                          style={{ height: 50, background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                          Next →
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 2: COLOUR */}
            {step === 2 && (
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
                  Pick {childName.trim()}&apos;s favourite colour! 🎨
                </h1>
                <p className="text-gray-300 text-base mb-8">
                  This will be their profile accent
                </p>

                <div className="flex flex-wrap justify-center gap-5 mb-8">
                  {AVATAR_COLORS.map((c, idx) => {
                    const isSelected = avatarColor === c.name;
                    return (
                      <motion.button key={c.name} onClick={() => setAvatarColor(c.name)}
                        custom={idx}
                        variants={colorCircleVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center gap-2 transition-all duration-300">
                        <motion.div className="rounded-full transition-all duration-300"
                          animate={isSelected ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          transition={isSelected ? { duration: 0.6, ease: "easeInOut" } : {}}
                          style={{
                            width: 80, height: 80,
                            background: c.color,
                            border: isSelected ? "4px solid #fff" : "3px solid transparent",
                            boxShadow: isSelected ? `0 0 25px ${c.color}80` : `0 0 12px ${c.color}30`,
                            minWidth: 48, minHeight: 48,
                          }} />
                        <span className="text-xs font-bold" style={{ color: isSelected ? c.color : "#9ca3af" }}>
                          {c.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Preview card */}
                <div className="rounded-3xl p-5 max-w-xs mx-auto mb-8"
                  style={{
                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
                    border: `2px solid ${selectedColor}40`,
                    transition: "border-color 0.3s ease",
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg"
                      style={{ background: selectedColor, transition: "background 0.3s ease" }}>
                      {childName.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white text-sm">{childName.trim()}&apos;s Profile</p>
                      <p className="text-xs text-gray-400">Age {age} · {getCourseLabel(age!, "").split("—")[0].trim()}</p>
                    </div>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mb-4 p-3 rounded-2xl text-sm font-semibold max-w-xs mx-auto"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button onClick={handleSubmit} disabled={loading}
                  whileHover={!loading ? { scale: 1.03, boxShadow: "0 8px 35px rgba(139,92,246,0.6)" } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  animate={{ boxShadow: ["0 0 15px rgba(139,92,246,0.4)", "0 0 30px rgba(139,92,246,0.7)", "0 0 15px rgba(139,92,246,0.4)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full max-w-xs font-black text-white text-lg rounded-2xl disabled:opacity-50"
                  style={{
                    height: 56, background: GRAD,
                  }}>
                  {loading ? "Setting up..." : "Start My Adventure! 🚀"}
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
