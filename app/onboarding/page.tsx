"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import AcademyPortalBackdrop from "@/app/components/onboarding/AcademyPortalBackdrop";
import { CyberIcon, type CyberIconName } from "@/app/components/CyberIcon";

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
const DISPLAY_FONT = "'Space Grotesk', system-ui, sans-serif";
const MONO_FONT = "ui-monospace, 'JetBrains Mono', Menlo, monospace";

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

// Onboarding journey — the three dots become a labelled rail.
const STEP_META: { label: string; icon: CyberIconName }[] = [
  { label: "Hero Profile", icon: "shield" },
  { label: "Learning Path", icon: "compass" },
  { label: "Academy Access", icon: "key" },
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

/* Shared eyebrow used above every step headline. */
function Eyebrow({ stepIndex }: { stepIndex: number }) {
  return (
    <div
      className="inline-flex items-center gap-2 mb-4"
      style={{ fontFamily: MONO_FONT, fontSize: 11, letterSpacing: 2.5, color: C.textMuted }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.goldLight,
          boxShadow: `0 0 8px ${C.goldLight}`,
        }}
      />
      ACADEMY ONBOARDING · STEP {String(stepIndex + 1).padStart(2, "0")}
    </div>
  );
}

/* Labelled progress rail (desktop) + segmented bar (mobile). */
function ProgressRail({ step }: { step: number }) {
  return (
    <div className="w-full">
      {/* Desktop / tablet — labelled nodes + connecting lines */}
      <div className="hidden sm:flex items-start justify-center">
        {STEP_META.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          const accent = state === "todo" ? "rgba(125,240,255,0.28)" : C.goldLight;
          return (
            <div key={s.label} className="flex items-start" style={{ flex: i < STEP_META.length - 1 ? "1 1 0" : "0 0 auto", maxWidth: 200 }}>
              {/* node + label */}
              <div className="flex flex-col items-center gap-2" style={{ width: 84 }}>
                <div className="relative" style={{ width: 46, height: 46 }}>
                  {state === "active" && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1.5px solid ${C.goldLight}` }}
                      animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center transition-all duration-500"
                    style={{
                      background:
                        state === "todo" ? "rgba(15,21,48,0.55)" : "linear-gradient(135deg, rgba(0,229,255,0.18), rgba(124,92,255,0.18))",
                      border: `1.5px solid ${accent}`,
                      boxShadow: state === "active" ? "0 0 20px rgba(124,92,255,0.45)" : state === "done" ? "0 0 14px rgba(0,229,255,0.3)" : "none",
                    }}
                  >
                    {state === "done" ? (
                      <CyberIcon name="star" size={20} accent="cyan" glow={false} />
                    ) : (
                      <CyberIcon name={s.icon} size={22} accent={state === "active" ? "cosmic" : "cyan"} glow={state === "active"} />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p
                    className="text-[10px] font-bold tracking-wider"
                    style={{ fontFamily: MONO_FONT, color: state === "todo" ? "rgba(125,240,255,0.35)" : C.textMuted }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{
                      fontFamily: DISPLAY_FONT,
                      color: state === "active" ? C.text : state === "done" ? C.textSoft : "rgba(168,178,209,0.45)",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
              {/* connector */}
              {i < STEP_META.length - 1 && (
                <div className="relative mt-[22px] mx-1 flex-1" style={{ height: 2, minWidth: 40 }}>
                  <div className="absolute inset-0 rounded-full" style={{ background: "rgba(125,240,255,0.14)" }} />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: GRAD, boxShadow: "0 0 8px rgba(0,229,255,0.5)" }}
                    initial={false}
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile — compact 3-segment bar + active label */}
      <div className="sm:hidden">
        <div className="flex gap-1.5 mb-2">
          {STEP_META.map((s, i) => (
            <div key={s.label} className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "rgba(125,240,255,0.14)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: GRAD }}
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs font-bold text-center" style={{ fontFamily: MONO_FONT, color: C.textMuted, letterSpacing: 1.5 }}>
          STEP {String(step + 1).padStart(2, "0")} · {STEP_META[step].label.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

/* The "Adventure Preview" holographic frame around the existing artwork. */
function AdventurePreview({ signalActive, name }: { signalActive: boolean; name: string }) {
  const chips = ["Logic", "Creativity", "Problem Solving"];
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* violet ambient glow behind the panel */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[34px]"
        style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(124,92,255,0.32), transparent 70%)", filter: "blur(26px)" }}
      />
      <motion.div
        className="relative rounded-[26px] overflow-hidden"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        style={{
          background: "linear-gradient(180deg, rgba(20,28,70,0.78) 0%, rgba(12,16,40,0.88) 100%)",
          border: "1px solid rgba(125,240,255,0.2)",
          boxShadow:
            "0 30px 70px -24px rgba(0,0,0,0.8), 0 0 40px rgba(124,92,255,0.22), 0 1px 0 rgba(0,229,255,0.4) inset",
        }}
      >
        {/* cyan edge highlight, top-left */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0"
          style={{ height: 1, background: "linear-gradient(90deg, rgba(0,229,255,0.7), transparent 60%)" }}
        />

        {/* top bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(125,240,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full"
              style={{ width: 7, height: 7, background: C.moss, boxShadow: `0 0 8px ${C.moss}` }}
            />
            <span className="text-[10px] font-bold tracking-widest" style={{ fontFamily: MONO_FONT, color: C.textMuted }}>
              ADVENTURE PREVIEW
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={signalActive ? "on" : "off"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] font-bold tracking-wider"
              style={{ fontFamily: MONO_FONT, color: signalActive ? C.moss : C.textMuted }}
            >
              {signalActive ? "● PROFILE SIGNAL DETECTED" : "○ AWAITING HERO"}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* artwork */}
        <div className="relative">
          <Image
            src="/characters/waving.png"
            alt="Adam and Layla, the AlgorithmX academy heroes, waving hello"
            width={420}
            height={300}
            className="block w-full h-auto"
            style={{ filter: "drop-shadow(0 20px 30px rgba(8,10,22,0.5))" }}
          />
          {/* bottom overlay */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0"
            style={{ height: "55%", background: "linear-gradient(180deg, transparent, rgba(12,16,40,0.92))" }}
          />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
            <p className="text-sm font-bold" style={{ fontFamily: DISPLAY_FONT, color: C.text }}>
              {name.trim() ? `${name.trim()}'s first mission is waiting` : "Your first mission is waiting"}
            </p>
          </div>
        </div>

        {/* metadata chips */}
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {chips.map((c, i) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{
                fontFamily: DISPLAY_FONT,
                color: C.textSoft,
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.18)",
              }}
            >
              <CyberIcon name={(["brain", "wand", "target"] as CyberIconName[])[i]} size={13} accent="cyan" glow={false} />
              {c}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [avatarColor, setAvatarColor] = useState("purple");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);

  const trimmedName = childName.trim();
  const nameValid = trimmedName.length >= 2;

  const goNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      /* The API expects the canonical schema shape: `name`,
       *  `dateOfBirth` (ISO date string), `favouriteColour`. The
       *  wizard collects `childName`, `age` (integer years), and
       *  `avatarColor` (a slug), so we translate at the boundary
       *  rather than renaming wizard state.
       *
       *  Age → DOB: store DOB as today minus the given number of
       *  years. The platform reads back via getAge(dob) which
       *  computes age from DOB, so this round-trips correctly (the
       *  child stays the same integer age for one year, then
       *  increments). */
      const ageYears = age ?? 0;
      const today = new Date();
      const dob = new Date(
        today.getFullYear() - ageYears,
        today.getMonth(),
        today.getDate(),
      );

      const res = await fetch("/api/child-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: childName.trim(),
          dateOfBirth: dob.toISOString(),
          favouriteColour: avatarColor,
        }),
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
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
          color: C.text,
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
          * { font-family: 'Nunito', sans-serif; }
          .ob-input::placeholder { color: rgba(168,178,209,0.5); font-weight: 600; }
        `}</style>

        <AcademyPortalBackdrop />

        <div
          className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10"
          style={{ zIndex: 1 }}
        >
          {/* ── Header bar: logo + secure chip ── */}
          <motion.div
            className="w-full mx-auto flex items-center justify-between mb-7 sm:mb-9"
            style={{ maxWidth: 1140 }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Link href="/" className="inline-flex items-center gap-3 no-underline">
              <motion.div
                animate={{ rotate: [0, 6, 0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: GRAD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 26px -8px rgba(124,92,255,0.6), 0 0 0 1px rgba(125,240,255,0.4) inset",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 900, color: C.goldDark, fontFamily: DISPLAY_FONT }}>AX</span>
              </motion.div>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: DISPLAY_FONT,
                  background: TITLE_GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AlgorithmX
              </span>
            </Link>

            <div
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: "rgba(8,10,22,0.5)", border: "1px solid rgba(0,229,255,0.18)" }}
            >
              <CyberIcon name="lock" size={14} accent="cyan" glow={false} />
              <span className="text-[10px] font-bold tracking-widest" style={{ fontFamily: MONO_FONT, color: C.textMuted }}>
                SECURE ENROLMENT
              </span>
            </div>
          </motion.div>

          {/* ── Progress rail ── */}
          <motion.div
            className="w-full mx-auto mb-8 sm:mb-10"
            style={{ maxWidth: 620 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          >
            <ProgressRail step={step} />
          </motion.div>

          {/* ── Stage ── */}
          <div className="w-full mx-auto flex-1 flex items-start sm:items-center justify-center" style={{ maxWidth: 1140 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="w-full"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 250, damping: 26 }}
              >
                {/* ───────────── STEP 0: HERO PROFILE ───────────── */}
                {step === 0 && (
                  <div
                    className="relative rounded-[28px] p-5 sm:p-8 lg:p-10"
                    style={{
                      background: "linear-gradient(180deg, rgba(18,24,56,0.5) 0%, rgba(10,14,34,0.4) 100%)",
                      border: "1px solid rgba(125,240,255,0.1)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      boxShadow: "0 40px 90px -40px rgba(0,0,0,0.8)",
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)] gap-8 lg:gap-10 items-center">
                      {/* LEFT — identity module */}
                      <div className="text-left">
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
                        >
                          <Eyebrow stepIndex={0} />
                          <h1
                            className="font-black mb-3"
                            style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.1, letterSpacing: "-0.01em", color: C.text }}
                          >
                            Let&apos;s build your{" "}
                            <span
                              style={{
                                background: TITLE_GRAD,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                              }}
                            >
                              hero profile
                            </span>
                          </h1>
                          <p style={{ color: C.textSoft, fontSize: 15, lineHeight: 1.55, maxWidth: 440 }}>
                            Tell us who is joining the academy. We&apos;ll shape the missions, challenges and
                            learning path around them.
                          </p>
                        </motion.div>

                        <motion.div
                          className="mt-7"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.28, ease: "easeOut" }}
                        >
                          {/* module label */}
                          <div className="flex items-center gap-2 mb-3">
                            <CyberIcon name="ai-spark" size={15} accent="cosmic" glow={false} />
                            <span className="text-[11px] font-bold tracking-widest" style={{ fontFamily: MONO_FONT, color: C.textMuted }}>
                              HERO IDENTITY
                            </span>
                            <span className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.25), transparent)" }} />
                          </div>

                          <label htmlFor="child-name" className="block text-sm font-bold mb-2.5" style={{ color: C.textSoft }}>
                            What&apos;s your child&apos;s name?
                          </label>

                          <div
                            className="relative rounded-2xl transition-all duration-300"
                            style={{
                              background: "rgba(8,10,22,0.55)",
                              border: `1.5px solid ${nameFocused ? C.goldLight : nameValid ? "rgba(126,255,151,0.5)" : "rgba(0,229,255,0.22)"}`,
                              boxShadow: nameFocused ? "0 0 26px rgba(124,92,255,0.28)" : "none",
                            }}
                          >
                            <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ lineHeight: 0 }}>
                              <CyberIcon name="wave" size={22} accent={nameFocused ? "cosmic" : "cyan"} glow={nameFocused} />
                            </span>
                            <input
                              id="child-name"
                              type="text"
                              value={childName}
                              onChange={(e) => setChildName(e.target.value)}
                              onFocus={() => setNameFocused(true)}
                              onBlur={() => setNameFocused(false)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && nameValid) goNext();
                              }}
                              autoFocus
                              maxLength={20}
                              aria-invalid={trimmedName.length === 1}
                              aria-describedby="name-hint"
                              className="ob-input w-full bg-transparent pl-13 pr-4 font-bold focus:outline-none"
                              style={{ height: 62, fontSize: 18, color: C.text, paddingLeft: 52, borderRadius: 16 }}
                              placeholder="e.g. Oliver"
                            />
                            {/* focus circuit underline */}
                            <motion.span
                              aria-hidden
                              className="absolute left-4 right-4 bottom-0 rounded-full"
                              style={{ height: 2, background: GRAD, transformOrigin: "left" }}
                              initial={false}
                              animate={{ scaleX: nameFocused ? 1 : 0, opacity: nameFocused ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>

                          {/* inline validation / helper */}
                          <div id="name-hint" aria-live="polite" className="flex items-center justify-between mt-2.5 min-h-[18px]">
                            <span className="text-xs font-semibold flex items-center gap-1.5">
                              {trimmedName.length === 0 && (
                                <span style={{ color: C.textMuted }}>We&apos;ll personalise every mission around this name.</span>
                              )}
                              {trimmedName.length === 1 && (
                                <span style={{ color: C.ember }}>A little longer — at least 2 letters.</span>
                              )}
                              {nameValid && (
                                <span className="flex items-center gap-1.5" style={{ color: C.moss }}>
                                  <CyberIcon name="star" size={13} accent="lime" glow={false} />
                                  Profile signal detected
                                </span>
                              )}
                            </span>
                            {nameFocused && childName.length > 0 && (
                              <span className="text-[11px] font-bold" style={{ fontFamily: MONO_FONT, color: C.textMuted }}>
                                {childName.length}/20
                              </span>
                            )}
                          </div>

                          {/* Continue button */}
                          <motion.button
                            onClick={() => nameValid && goNext()}
                            disabled={!nameValid}
                            whileHover={nameValid ? { y: -2 } : {}}
                            whileTap={nameValid ? { scale: 0.98 } : {}}
                            className="group relative w-full sm:w-auto overflow-hidden mt-5 font-black rounded-full inline-flex items-center justify-center gap-2"
                            style={{
                              height: 54,
                              minWidth: 240,
                              padding: "0 28px",
                              fontSize: 16,
                              background: nameValid ? GRAD : "rgba(15,21,48,0.6)",
                              color: nameValid ? C.goldDark : "rgba(168,178,209,0.45)",
                              fontFamily: DISPLAY_FONT,
                              letterSpacing: 0.3,
                              border: nameValid ? "none" : "1px solid rgba(125,240,255,0.14)",
                              cursor: nameValid ? "pointer" : "not-allowed",
                              boxShadow: nameValid ? "0 16px 34px -10px rgba(124,92,255,0.6), 0 0 0 1px rgba(125,240,255,0.5) inset" : "none",
                              transition: "background 0.3s, color 0.3s, box-shadow 0.3s",
                            }}
                          >
                            {/* hover light sweep */}
                            {nameValid && (
                              <span
                                aria-hidden
                                className="absolute inset-y-0 -left-1/3 w-1/3 -translate-x-full group-hover:translate-x-[400%]"
                                style={{
                                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                                  transition: "transform 0.7s ease",
                                }}
                              />
                            )}
                            <span className="relative z-10">Create hero profile</span>
                            <span className="relative z-10 inline-flex transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </motion.button>
                        </motion.div>
                      </div>

                      {/* connector line (desktop) */}
                      <div
                        aria-hidden
                        className="hidden lg:block absolute top-[18%] bottom-[18%]"
                        style={{
                          left: "calc(100% - 420px - 20px)",
                          width: 1,
                          background: "linear-gradient(180deg, transparent, rgba(0,229,255,0.25), transparent)",
                        }}
                      />

                      {/* RIGHT — adventure preview */}
                      <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45, delay: 0.34, ease: "easeOut" }}
                      >
                        <AdventurePreview signalActive={nameValid} name={childName} />
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* ───────────── STEP 1: LEARNING PATH (age) ───────────── */}
                {step === 1 && (
                  <div
                    className="relative rounded-[28px] p-6 sm:p-10 text-center mx-auto"
                    style={{
                      maxWidth: 760,
                      background: "linear-gradient(180deg, rgba(18,24,56,0.5) 0%, rgba(10,14,34,0.4) 100%)",
                      border: "1px solid rgba(125,240,255,0.1)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      boxShadow: "0 40px 90px -40px rgba(0,0,0,0.8)",
                    }}
                  >
                    <Eyebrow stepIndex={1} />
                    <h1
                      className="font-black mb-2"
                      style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(26px, 3.6vw, 38px)", letterSpacing: "-0.01em", color: C.text }}
                    >
                      How old is{" "}
                      <span style={{ background: TITLE_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {trimmedName}
                      </span>
                      ?
                    </h1>
                    <p style={{ color: C.textSoft, fontSize: 15, marginBottom: 28 }}>
                      We tune mission difficulty and reading level to their age.
                    </p>

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
                              transform: isSelected ? "scale(1.12)" : "scale(1)",
                              boxShadow: isSelected ? "0 0 24px rgba(124, 92, 255, 0.45)" : "none",
                              minWidth: 48,
                              minHeight: 48,
                              fontFamily: DISPLAY_FONT,
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
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                          <div
                            className="rounded-2xl p-4 mb-6 inline-block"
                            style={{ background: "rgba(15, 21, 48, 0.6)", border: `1px solid ${C.borderStrong}`, backdropFilter: "blur(12px)" }}
                          >
                            <p className="text-base font-bold" style={{ color: C.goldLight }}>
                              {getCourseLabel(age, trimmedName)}
                            </p>
                          </div>

                          <div>
                            <motion.button
                              onClick={goNext}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="font-black rounded-full inline-flex items-center justify-center gap-2"
                              style={{
                                height: 52,
                                minWidth: 220,
                                padding: "0 28px",
                                fontSize: 16,
                                background: GRAD,
                                color: C.goldDark,
                                fontFamily: DISPLAY_FONT,
                                letterSpacing: 0.3,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 16px 34px -10px rgba(124,92,255,0.6), 0 0 0 1px rgba(125,240,255,0.5) inset",
                              }}
                            >
                              Choose academy access <span>→</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ───────────── STEP 2: ACADEMY ACCESS (colour) ───────────── */}
                {step === 2 && (
                  <div
                    className="relative rounded-[28px] p-6 sm:p-10 text-center mx-auto"
                    style={{
                      maxWidth: 820,
                      background: "linear-gradient(180deg, rgba(18,24,56,0.5) 0%, rgba(10,14,34,0.4) 100%)",
                      border: "1px solid rgba(125,240,255,0.1)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      boxShadow: "0 40px 90px -40px rgba(0,0,0,0.8)",
                    }}
                  >
                    <Eyebrow stepIndex={2} />
                    <h1
                      className="font-black mb-2"
                      style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(26px, 3.6vw, 38px)", letterSpacing: "-0.01em", color: C.text }}
                    >
                      Pick{" "}
                      <span style={{ background: TITLE_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {trimmedName}
                      </span>
                      &apos;s academy colour
                    </h1>
                    <p style={{ color: C.textSoft, fontSize: 15, marginBottom: 28 }}>This becomes their profile accent across the academy.</p>

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
                                width: 76,
                                height: 76,
                                background: c.color,
                                border: isSelected ? `4px solid ${C.text}` : "3px solid transparent",
                                boxShadow: isSelected ? `0 0 28px ${c.color}` : `0 0 14px ${c.color}40`,
                                minWidth: 48,
                                minHeight: 48,
                              }}
                            />
                            <span className="text-xs font-bold" style={{ color: isSelected ? c.color : C.textMuted }}>
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
                          style={{ background: selectedColor, color: C.goldDark, transition: "background 0.3s ease" }}
                        >
                          {trimmedName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-sm" style={{ color: C.text }}>
                            {trimmedName}&apos;s Profile
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
                          role="alert"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mb-4 p-3 rounded-2xl text-sm font-semibold max-w-xs mx-auto"
                          style={{ background: "rgba(255, 95, 179, 0.18)", border: "1px solid rgba(255, 95, 179, 0.5)", color: "#f4a89a" }}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      onClick={handleSubmit}
                      disabled={loading}
                      whileHover={!loading ? { y: -2 } : {}}
                      whileTap={!loading ? { scale: 0.97 } : {}}
                      className="font-black text-lg rounded-full disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      style={{
                        height: 56,
                        minWidth: 260,
                        padding: "0 32px",
                        background: GRAD,
                        color: C.goldDark,
                        fontFamily: DISPLAY_FONT,
                        letterSpacing: 0.3,
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: "0 18px 36px -10px rgba(124,92,255,0.6), 0 0 0 1px rgba(125,240,255,0.5) inset",
                      }}
                    >
                      {loading ? "Setting up..." : "Enter the academy 🚀"}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
