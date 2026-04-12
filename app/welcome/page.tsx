"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

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
                    <img src="/characters/adam-layla-happy.png" alt="Adam and Layla"
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
                <motion.img src="/characters/raccoon.png" alt="Hacker Raccoon" width={60} height={60}
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
