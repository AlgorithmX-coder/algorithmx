"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

function FloatingOrbs() {
  // Pixar-magic background — bright animated gradient blobs, twinkling
  // stars, drifting cyber-icons, shooting stars and an aurora ribbon at
  // the bottom. Matches the onboarding wizard so visual language stays
  // consistent across the sign-up journey.
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
    size: 2 + (i % 2),
    delay: (i * 0.13) % 5,
    dur: 2 + (i % 4),
    peak: 0.35 + ((i * 13) % 35) / 100,
  }));
  const SHOOTERS = Array.from({ length: 5 }).map((_, i) => ({
    key: i,
    top: 8 + i * 14,
    delay: i * 9 + 2,
    dur: 22 + i * 3,
  }));
  const ICONS = ["🔒", "🛡", "🔑", "⭐", "✨", "✨", "🌙"];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Saturated drifting blobs */}
      <motion.div
        animate={{ x: ["-6%", "6%", "-6%"], y: ["-4%", "4%", "-4%"], scale: [1, 1.08, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-20%", left: "-15%", width: "70vmax", height: "70vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.45), transparent 65%)", filter: "blur(40px)" }}
      />
      <motion.div
        animate={{ x: ["4%", "-6%", "4%"], y: ["6%", "-4%", "6%"], scale: [1, 1.1, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", bottom: "-25%", right: "-15%", width: "70vmax", height: "70vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.42), transparent 65%)", filter: "blur(40px)" }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.12, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: "55vmax", height: "55vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.32), transparent 60%)", filter: "blur(36px)" }}
      />
      <motion.div
        animate={{ x: ["-4%", "6%", "-4%"], y: ["3%", "-5%", "3%"], scale: [0.95, 1.1, 0.95] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "55%", left: "-10%", width: "55vmax", height: "55vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.32), transparent 65%)", filter: "blur(38px)" }}
      />

      {/* Aurora ribbon */}
      <div style={{
        position: "absolute", left: "-10%", right: "-10%", bottom: "-5%", height: "32vh",
        background: "linear-gradient(90deg, rgba(167,139,250,0.0) 0%, rgba(96,165,250,0.35) 25%, rgba(244,114,182,0.32) 55%, rgba(34,211,238,0.32) 80%, rgba(167,139,250,0.0) 100%)",
        filter: "blur(60px)",
        mixBlendMode: "screen",
        animation: "welcomeAuroraDrift 18s ease-in-out infinite",
      }} />

      {STARS.map((s) => (
        <span key={`star-${s.key}`} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: "50%", background: "#fff", boxShadow: "0 0 6px rgba(255,255,255,0.85)", animation: `welcomeStarTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`, ["--welcome-star-peak" as string]: `${s.peak}` } as React.CSSProperties} />
      ))}
      {PARTICLES.map((p) => (
        <span key={`p-${p.key}`} style={{ position: "absolute", left: `${p.left}%`, bottom: -12, width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 12px ${p.color}`, animation: `welcomeParticleRise ${p.duration}s linear ${p.delay}s infinite`, ["--welcome-particle-peak" as string]: `${p.peak}` } as React.CSSProperties} />
      ))}

      {/* Shooting stars — diagonal streaks */}
      {SHOOTERS.map((s) => (
        <span key={`shoot-${s.key}`} style={{
          position: "absolute", top: `${s.top}%`, left: "-10%",
          width: 140, height: 2,
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 60%, #fff 100%)",
          borderRadius: 2,
          opacity: 0,
          animation: `welcomeShootingStar ${s.dur}s linear ${s.delay}s infinite`,
        }} />
      ))}

      {/* Drifting cyber-icons */}
      {ICONS.map((icon, i) => (
        <span key={`ic-${i}`} style={{
          position: "absolute",
          left: `${(i * 13.7) % 100}%`,
          top: `${(i * 17.3) % 80 + 6}%`,
          fontSize: 22 + (i % 3) * 6,
          opacity: 0.22,
          filter: "drop-shadow(0 0 6px rgba(167,139,250,0.6))",
          animation: `welcomeIconDrift ${22 + (i % 4) * 4}s ease-in-out ${i * 1.7}s infinite`,
        }}>
          {icon}
        </span>
      ))}

      <style>{`
        @keyframes welcomeStarTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: var(--welcome-star-peak, 0.7); } }
        @keyframes welcomeParticleRise { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: var(--welcome-particle-peak, 0.4); } 88% { opacity: var(--welcome-particle-peak, 0.4); } 100% { transform: translateY(-110vh); opacity: 0; } }
        @keyframes welcomeShootingStar { 0% { transform: translate(0,0) rotate(18deg); opacity: 0; } 4% { opacity: 1; } 14% { opacity: 0; } 100% { transform: translate(120vw, 30vh) rotate(18deg); opacity: 0; } }
        @keyframes welcomeAuroraDrift { 0%,100% { transform: translateX(-3%); } 50% { transform: translateX(3%); } }
        @keyframes welcomeIconDrift { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(20px, -30px) rotate(8deg); } }
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
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => setPhase(3), 6000),
      setTimeout(() => setPhase(4), 8000),
      setTimeout(() => setPhase(5), 11000),
      setTimeout(() => setPhase(6), 13000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loaded]);

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
