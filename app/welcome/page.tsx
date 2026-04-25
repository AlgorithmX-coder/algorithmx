"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { speak, stopSpeaking, primeVoices } from "@/app/lib/speech";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

function FloatingOrbs() {
  // Alive, Pixar-theatre background — soft gradient glows + twinkling stars
  // + drifting pastel particles. Shared visual language with the onboarding
  // wizard so the tone is consistent across the sign-up journey.
  const PARTICLES = Array.from({ length: 22 }).map((_, i) => ({
    key: i,
    left: (i * 4.7 + (i % 3) * 2) % 100,
    size: 4 + (i % 5),
    color: ["#8b5cf6", "#3b82f6", "#f472b6", "#fbbf24", "#22d3ee", "#10b981"][i % 6],
    delay: (i * 0.9) % 14,
    duration: 16 + (i % 7) * 2.2,
    peak: 0.22 + ((i * 11) % 18) / 100,
  }));
  const STARS = Array.from({ length: 36 }).map((_, i) => ({
    key: i,
    left: (i * 2.9 + (i % 5) * 1.7) % 100,
    top: (i * 3.3 + (i % 7) * 2.1) % 100,
    size: 2 + (i % 2),
    delay: (i * 0.17) % 5,
    dur: 2.2 + (i % 4),
    peak: 0.25 + ((i * 13) % 30) / 100,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        animate={{ x: ["-6%", "6%", "-6%"], y: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-20%", left: "-15%", width: "70vmax", height: "70vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.28), transparent 65%)", filter: "blur(40px)" }}
      />
      <motion.div
        animate={{ x: ["4%", "-6%", "4%"], y: ["6%", "-4%", "6%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: "-25%", right: "-15%", width: "70vmax", height: "70vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.24), transparent 65%)", filter: "blur(40px)" }}
      />
      <motion.div
        animate={{ opacity: [0.18, 0.3, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "50vmax", height: "50vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.18), transparent 60%)", filter: "blur(36px)" }}
      />
      {STARS.map((s) => (
        <span key={`star-${s.key}`} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: "50%", background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.8)", animation: `welcomeStarTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`, ["--welcome-star-peak" as string]: `${s.peak}` } as React.CSSProperties} />
      ))}
      {PARTICLES.map((p) => (
        <span key={`p-${p.key}`} style={{ position: "absolute", left: `${p.left}%`, bottom: -12, width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 10px ${p.color}`, animation: `welcomeParticleRise ${p.duration}s linear ${p.delay}s infinite`, ["--welcome-particle-peak" as string]: `${p.peak}` } as React.CSSProperties} />
      ))}
      <style>{`
        @keyframes welcomeStarTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: var(--welcome-star-peak, 0.5); } }
        @keyframes welcomeParticleRise { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: var(--welcome-particle-peak, 0.3); } 88% { opacity: var(--welcome-particle-peak, 0.3); } 100% { transform: translateY(-110vh); opacity: 0; } }
      `}</style>
    </div>
  );
}

function ConfettiBurst() {
  const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => {
      const angle = (i / 40) * Math.PI * 2;
      const dist = 80 + Math.random() * 150;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 60;
      const size = 4 + Math.random() * 6;
      const delay = Math.random() * 0.3;
      return { tx, ty, size, delay, color: colors[i % colors.length] };
    }), []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute rounded-full"
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.tx, y: p.ty, scale: 0.3, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: p.delay }}
          style={{
            left: "50%", top: "70%",
            width: p.size, height: p.size,
            backgroundColor: p.color,
          }} />
      ))}
    </div>
  );
}

function Sparkles({ count = 8 }: { count?: number }) {
  const sparkleData = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 130 + Math.random() * 40;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const fontSize = 10 + Math.random() * 8;
      return { x, y, fontSize };
    }), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkleData.map((s, i) => (
        <motion.div key={i} className="absolute text-yellow-300"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, delay: i * 0.3 }}
          style={{
            left: `calc(50% + ${s.x}px)`, top: `calc(50% + ${s.y}px)`,
            fontSize: s.fontSize,
          }}>
          ✦
        </motion.div>
      ))}
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [childName, setChildName] = useState("Cyber Hero");
  const [loaded, setLoaded] = useState(false);

  // Fetch child profile
  useEffect(() => {
    fetch("/api/child-profile")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0 && data[0].childName) {
          setChildName(data[0].childName);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Phase timing
  useEffect(() => {
    if (!loaded) return;
    primeVoices();
    const timers = [
      setTimeout(() => {
        setPhase(1);
      }, 2000),
      setTimeout(() => {
        setPhase(2);
        speak(`Hi ${childName}!`, "adam");
      }, 4000),
      setTimeout(() => {
        setPhase(3);
        speak("We're Adam and Layla!", "layla");
      }, 6000),
      setTimeout(() => {
        setPhase(4);
        speak("We need YOUR help to learn about cybersecurity and defeat the Hacker Raccoon!", "adam");
      }, 8000),
      setTimeout(() => {
        setPhase(5);
        speak("Every week is a new adventure. Are you ready?", "layla");
      }, 11000),
      setTimeout(() => setPhase(6), 13000),
    ];
    return () => {
      timers.forEach(clearTimeout);
      stopSpeaking();
    };
  }, [loaded, childName]);

  // Stop any in-flight speech when leaving the page.
  useEffect(() => () => stopSpeaking(), []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: "#1a1033" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>

      <FloatingOrbs />

      <AnimatePresence>
        {phase >= 6 && <ConfettiBurst />}
      </AnimatePresence>

      <div className="relative text-center px-4 py-10" style={{ zIndex: 1, maxWidth: 600 }}>

        {/* PHASE 0: Center glow */}
        <div className="relative mx-auto mb-8" style={{ width: 250, height: 250 }}>
          {/* Pulsing glow (always visible from start) */}
          <motion.div className="absolute rounded-full mx-auto"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 200, height: 200, left: "50%", top: "50%",
              x: "-50%", y: "-50%",
              background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
            }} />

          {/* PHASE 1+: Adam and Layla image */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div className="relative"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}>
                  <div className="rounded-3xl overflow-hidden mx-auto border-2"
                    style={{
                      width: 250, maxWidth: "70vw",
                      borderColor: "rgba(245,158,11,0.4)",
                      boxShadow: "0 0 30px rgba(245,158,11,0.3)",
                    }}>
                    <img src="/characters/waving.png" alt="Adam and Layla"
                      className="block w-full" />
                  </div>
                </motion.div>
                <Sparkles />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PHASE 2: Greeting */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mb-3">
              <h1 className="text-4xl sm:text-5xl font-black inline-flex items-center justify-center gap-2 flex-wrap">
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>
                  Hi {childName}!
                </span>
                <motion.span
                  style={{ display: "inline-block" }}
                  animate={{ rotate: [-20, 20, -20] }}
                  transition={{ duration: 1.2, repeat: Infinity }}>
                  👋
                </motion.span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE 3: Introduction */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.p className="text-white text-xl sm:text-2xl font-bold mb-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              We&apos;re Adam and Layla!
            </motion.p>
          )}
        </AnimatePresence>

        {/* PHASE 4: The story + raccoon peek */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div className="relative mb-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                We need <strong className="text-white">YOUR</strong> help to learn about cybersecurity and defeat the Hacker Raccoon!
              </p>
              {/* Raccoon peeking */}
              <div className="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
                <motion.img src="/characters/raccoon-sneaking.png" alt="Hacker Raccoon" width={60} height={60}
                  initial={{ x: "100%" }}
                  animate={{ x: ["100%", "85%", "100%"] }}
                  transition={{ duration: 2.5, ease: "easeInOut" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE 5: The promise */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div className="relative mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <p className="text-white text-lg sm:text-xl font-bold">
                Every week is a new adventure. Are you ready?
              </p>
              {/* Small sparkles around text */}
              {["−30px", "30px"].map((x, i) => (
                <motion.span key={i} className="absolute text-yellow-300"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: i * 0.5 }}
                  style={{
                    top: "-8px",
                    left: `calc(50% + ${x})`,
                    fontSize: 14,
                  }}>✨</motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE 6: CTA button */}
        <AnimatePresence>
          {phase >= 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <motion.button
                onClick={() => router.push("/dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                animate={{ boxShadow: ["0 4px 25px rgba(139,92,246,0.4)", "0 8px 40px rgba(139,92,246,0.7)", "0 4px 25px rgba(139,92,246,0.4)"] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                className="w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-white text-lg sm:text-xl cursor-pointer"
                style={{
                  background: GRAD,
                  minHeight: 56,
                }}>
                Let&apos;s Start! 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
