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

const AVATAR_COLORS = [
  { name: "purple", color: "#8b5cf6", label: "Purple" },
  { name: "blue", color: "#3b82f6", label: "Blue" },
  { name: "cyan", color: "#06b6d4", label: "Cyan" },
  { name: "green", color: "#22c55e", label: "Green" },
  { name: "amber", color: "#f59e0b", label: "Amber" },
  { name: "pink", color: "#ec4899", label: "Pink" },
];

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#f59e0b", dur: 9, delay: 0 },
        { size: 6, top: "18%", right: "10%", color: "#8b5cf6", dur: 11, delay: 1 },
        { size: 10, top: "35%", left: "3%", color: "#3b82f6", dur: 13, delay: 2 },
        { size: 5, top: "52%", right: "5%", color: "#f59e0b", dur: 8, delay: 0.5 },
        { size: 7, top: "70%", left: "12%", color: "#8b5cf6", dur: 10, delay: 3 },
        { size: 9, top: "82%", right: "8%", color: "#3b82f6", dur: 12, delay: 1.5 },
      ].map((o, i) => (
        <motion.div key={i} className="absolute rounded-full"
          animate={{ y: [0, -18, 0], scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: o.dur, ease: "easeInOut", repeat: Infinity, delay: o.delay }}
          style={{
            width: o.size, height: o.size, top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color, opacity: 0.35,
            boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
          }} />
      ))}
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
        <a href="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRAD, boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
            <span className="text-sm font-black text-white">AX</span>
          </div>
          <span className="text-xl font-black text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
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
            className="w-full max-w-2xl"
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
                      width={220} height={220}
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
