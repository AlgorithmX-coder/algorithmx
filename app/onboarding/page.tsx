"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataLabScene } from "@/app/components/CyberFutureScenes";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";

const C = {
  pageBg: "#080a16",
  card: "rgba(15, 21, 48, 0.78)",
  border: "rgba(0, 229, 255, 0.35)",
  borderStrong: "rgba(0, 229, 255, 0.6)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.6)",
  goldLight: "#00e5ff",
  goldMid: "#7c5cff",
  goldDeep: "#3a7bff",
  goldDark: "#080a16",
  coral: "#ff5fb3",
  ember: "#ff7a59",
  moss: "#7eff97",
};
const GRAD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;
const TITLE_GRAD = "linear-gradient(135deg, #7df0ff, #00e5ff, #7c5cff)";

const AGES = [6, 7, 8, 9, 10];

function getCourseLabel(_age: number, name: string) {
  return `🛡️ Cyber Heroes Academy - Perfect for ${name}!`;
}

// Slugs are preserved so saved profiles stay valid; warm accent colours
// override the cool cyber-blues from the previous palette.
const AVATAR_COLORS = [
  { name: "purple", color: "#7c5cff", label: "Mystic Violet" },
  { name: "blue", color: "#6aa6ff", label: "Twilight Blue" },
  { name: "cyan", color: "#7eff97", label: "Forest Glow" },
  { name: "green", color: "#5eff80", label: "Meadow Moss" },
  { name: "amber", color: "#00e5ff", label: "Solar Amber" },
  { name: "pink", color: "#f7c1d6", label: "Blossom Pink" },
  { name: "neon-violet", color: "#c08aff", label: "Lavender Magic" },
  { name: "plasma-magenta", color: "#ff5fb3", label: "Coral Flame" },
  { name: "inferno-red", color: "#ff7a59", label: "Ember Red" },
  { name: "glitch-gold", color: "#7c5cff", label: "Glowing Gold" },
  { name: "frost-teal", color: "#5fa8b3", label: "Frost Teal" },
  { name: "laser-lime", color: "#a8c46a", label: "Sunlit Lime" },
];

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

  const goNext = () => setStep((s) => s + 1);

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

  const selectedColor = AVATAR_COLORS.find((c) => c.name === avatarColor)?.color || C.goldLight;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
        color: C.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700;800&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>

      <DataLabScene />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ zIndex: 1 }}>
        {/* Logo */}
        <a href="/" className="inline-flex items-center gap-3 mb-8 no-underline">
          <motion.div
            animate={{ rotate: [0, 6, 0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: GRAD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 14px 30px -8px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset",
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: C.goldDark,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              AX
            </span>
          </motion.div>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              background: TITLE_GRAD,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AlgorithmX
          </span>
        </a>

        {/* Step dots */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-500"
              style={{
                width: s === step ? 32 : 10,
                height: 10,
                background: s <= step ? GRAD : "rgba(0, 229, 255, 0.18)",
                boxShadow: s === step ? "0 0 12px rgba(124, 92, 255, 0.45)" : "none",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="w-full max-w-3xl"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
          >
            {/* STEP 0: NAME */}
            {step === 0 && (
              <div className="text-center">
                <h1
                  className="text-3xl sm:text-4xl font-black mb-2"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    background: TITLE_GRAD,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Welcome to the academy!
                </h1>
                <p style={{ color: C.textSoft, opacity: 0.92, marginBottom: 32, fontSize: 15 }}>
                  Tell us about your young hero so we can pick the perfect adventure.
                </p>

                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <motion.div
                    className="flex-1 w-full rounded-3xl p-7 sm:p-8"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{
                      background: C.card,
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: `1px solid ${C.border}`,
                      boxShadow:
                        "0 30px 60px -20px rgba(8, 10, 22, 0.7), 0 0 40px rgba(124, 92, 255, 0.18)",
                    }}
                  >
                    <label className="block text-left text-sm font-bold mb-3" style={{ color: C.textSoft }}>
                      What&apos;s your child&apos;s name?
                    </label>
                    <div className="relative">
                      <motion.span
                        className="absolute left-5 top-1/2 -translate-y-1/2"
                        style={{ lineHeight: 0 }}
                        animate={{ rotate: [-20, 20, -20] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <CyberIconOrEmoji emoji="👋" size={24} accent="cyan" />
                      </motion.span>
                      <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        autoFocus
                        className="w-full pl-14 pr-5 rounded-2xl font-bold transition-all duration-300 focus:outline-none"
                        style={{
                          height: 60,
                          fontSize: 18,
                          color: C.text,
                          background: "rgba(8, 10, 22, 0.5)",
                          border: `1px solid rgba(0, 229, 255, 0.22)`,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.goldLight;
                          e.currentTarget.style.boxShadow = "0 0 25px rgba(124, 92, 255, 0.25)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.22)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        placeholder="e.g. Oliver"
                      />
                    </div>

                    <AnimatePresence>
                      {childName.trim().length >= 2 && (
                        <motion.div
                          className="mt-6"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <motion.button
                            onClick={goNext}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full font-black text-base rounded-full"
                            style={{
                              height: 50,
                              background: GRAD,
                              color: C.goldDark,
                              fontFamily: "'Space Grotesk', system-ui, sans-serif",
                              letterSpacing: 0.5,
                              border: "none",
                              cursor: "pointer",
                              boxShadow:
                                "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
                            }}
                          >
                            Next →
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Adam & Layla (desktop only) */}
                  <div className="hidden lg:block shrink-0">
                    <motion.img
                      src="/characters/waving.png"
                      alt="Adam and Layla"
                      width={280}
                      height={280}
                      className="block rounded-3xl"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                      style={{
                        filter:
                          "drop-shadow(0 30px 50px rgba(8, 10, 22, 0.55)) drop-shadow(0 0 30px rgba(124, 92, 255, 0.18))",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: AGE */}
            {step === 1 && (
              <div className="text-center">
                <h1
                  className="text-3xl sm:text-4xl font-black mb-2"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    background: TITLE_GRAD,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.01em",
                  }}
                >
                  How old is {childName.trim()}? 🎂
                </h1>
                <div className="mb-8" />

                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {AGES.map((a, idx) => {
                    const isSelected = age === a;
                    return (
                      <motion.button
                        key={a}
                        onClick={() => setAge(a)}
                        custom={idx}
                        variants={ageBubbleVariants}
                        initial="hidden"
                        animate="visible"
                        className="rounded-full flex items-center justify-center font-black transition-all duration-300"
                        style={{
                          width: 70,
                          height: 70,
                          fontSize: 18,
                          background: isSelected ? GRAD : "rgba(15, 21, 48, 0.55)",
                          border: `2px solid ${isSelected ? C.goldLight : "rgba(0, 229, 255, 0.4)"}`,
                          color: isSelected ? C.goldDark : C.textSoft,
                          transform: isSelected ? "scale(1.15)" : "scale(1)",
                          boxShadow: isSelected ? "0 0 24px rgba(124, 92, 255, 0.45)" : "none",
                          minWidth: 48,
                          minHeight: 48,
                          fontFamily: "'Space Grotesk', system-ui, sans-serif",
                          cursor: "pointer",
                        }}
                      >
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
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <div
                        className="rounded-2xl p-4 mb-6 inline-block"
                        style={{
                          background: "rgba(15, 21, 48, 0.6)",
                          border: `1px solid ${C.borderStrong}`,
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <p className="text-base font-bold" style={{ color: C.goldLight }}>
                          {getCourseLabel(age, childName.trim())}
                        </p>
                      </div>

                      <div>
                        <motion.button
                          onClick={goNext}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full max-w-xs font-black text-base rounded-full"
                          style={{
                            height: 50,
                            background: GRAD,
                            color: C.goldDark,
                            fontFamily: "'Space Grotesk', system-ui, sans-serif",
                            letterSpacing: 0.5,
                            border: "none",
                            cursor: "pointer",
                            boxShadow:
                              "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
                          }}
                        >
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
                <h1
                  className="text-3xl sm:text-4xl font-black mb-2"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    background: TITLE_GRAD,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Pick {childName.trim()}&apos;s favourite colour! 🎨
                </h1>
                <p style={{ color: C.textSoft, opacity: 0.92, marginBottom: 32 }}>
                  This will be their profile accent.
                </p>

                <div className="flex flex-wrap justify-center gap-5 mb-8">
                  {AVATAR_COLORS.map((c, idx) => {
                    const isSelected = avatarColor === c.name;
                    return (
                      <motion.button
                        key={c.name}
                        onClick={() => setAvatarColor(c.name)}
                        custom={idx}
                        variants={colorCircleVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center gap-2 transition-all duration-300"
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <motion.div
                          className="rounded-full transition-all duration-300"
                          animate={isSelected ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          transition={isSelected ? { duration: 0.6, ease: "easeInOut" } : {}}
                          style={{
                            width: 80,
                            height: 80,
                            background: c.color,
                            border: isSelected ? `4px solid ${C.text}` : "3px solid transparent",
                            boxShadow: isSelected ? `0 0 28px ${c.color}` : `0 0 14px ${c.color}40`,
                            minWidth: 48,
                            minHeight: 48,
                          }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: isSelected ? c.color : C.textMuted }}
                        >
                          {c.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Preview card */}
                <div
                  className="rounded-3xl p-5 max-w-xs mx-auto mb-8"
                  style={{
                    background: C.card,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: `2px solid ${selectedColor}`,
                    transition: "border-color 0.3s ease",
                    boxShadow: "0 20px 40px -16px rgba(8, 10, 22, 0.55)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg"
                      style={{
                        background: selectedColor,
                        color: C.goldDark,
                        transition: "background 0.3s ease",
                      }}
                    >
                      {childName.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm" style={{ color: C.text }}>
                        {childName.trim()}&apos;s Profile
                      </p>
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        Age {age} · {getCourseLabel(age!, "").split("-")[0].trim()}
                      </p>
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
                      style={{
                        background: "rgba(255, 95, 179, 0.18)",
                        border: "1px solid rgba(255, 95, 179, 0.5)",
                        color: "#f4a89a",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={!loading ? { y: -2, scale: 1.03 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className="w-full max-w-xs font-black text-lg rounded-full disabled:opacity-50"
                  style={{
                    height: 56,
                    background: GRAD,
                    color: C.goldDark,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    letterSpacing: 0.5,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow:
                      "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
                  }}
                >
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
