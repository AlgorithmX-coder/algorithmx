"use client";

import { motion } from "framer-motion";

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

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 20, delay: 0.4 + i * 0.1 },
  }),
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "#1a1033" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
      `}</style>

      <FloatingOrbs />

      <div className="text-center relative" style={{ zIndex: 1, fontFamily: "Nunito, sans-serif" }}>
        {/* Raccoon */}
        <div className="mb-6">
          <motion.img
            src="/characters/raccoon-sneaking.png"
            alt="The Hacker Raccoon"
            width={120}
            height={120}
            className="mx-auto block"
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Card */}
        <motion.div className="rounded-3xl p-8 sm:p-10 max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Oops! The Raccoon stole this page! 🦝
          </h1>
          <p className="text-gray-400 text-base mb-8">
            Don&apos;t worry - we&apos;ll get you back to safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.a href="/"
              custom={0}
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-2xl font-black text-white text-sm inline-block"
              style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
              Go Home 🏠
            </motion.a>
            <motion.a href="/dashboard"
              custom={1}
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-2xl font-black text-sm inline-block"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#d1d5db",
              }}>
              Go to Dashboard 📚
            </motion.a>
          </div>
        </motion.div>

        <p className="text-gray-600 text-xs mt-6 font-bold">Error 404 - Page not found</p>
      </div>
    </div>
  );
}
