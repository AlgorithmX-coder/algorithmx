"use client";

type Particle = {
  left: string;
  top: string;
  size: number;
  color: string;
  opacity: number;
  path: "A" | "B" | "C" | "D";
  duration: number;
  delay: number;
};

const PARTICLES: Particle[] = [
  { left: "8%",  top: "14%", size: 4, color: "#60a5fa", opacity: 0.10, path: "A", duration: 22, delay: 0 },
  { left: "22%", top: "72%", size: 3, color: "#34d399", opacity: 0.08, path: "B", duration: 18, delay: -3 },
  { left: "35%", top: "32%", size: 5, color: "#f97316", opacity: 0.12, path: "C", duration: 26, delay: -6 },
  { left: "48%", top: "82%", size: 4, color: "#f59e0b", opacity: 0.09, path: "D", duration: 20, delay: -9 },
  { left: "60%", top: "18%", size: 3, color: "#60a5fa", opacity: 0.07, path: "B", duration: 24, delay: -2 },
  { left: "72%", top: "62%", size: 5, color: "#34d399", opacity: 0.11, path: "A", duration: 28, delay: -11 },
  { left: "84%", top: "26%", size: 4, color: "#f97316", opacity: 0.10, path: "D", duration: 16, delay: -5 },
  { left: "92%", top: "78%", size: 3, color: "#f59e0b", opacity: 0.08, path: "C", duration: 30, delay: -14 },
  { left: "16%", top: "44%", size: 4, color: "#34d399", opacity: 0.09, path: "C", duration: 19, delay: -7 },
  { left: "54%", top: "54%", size: 3, color: "#60a5fa", opacity: 0.06, path: "A", duration: 15, delay: -12 },
];

export default function LessonAmbience({ glows }: { glows?: string[] } = {}) {
  // A themed week recolours the four corner glows to its palette and makes them
  // a touch more present; an un-themed week keeps the faint cool defaults.
  const glowOpacity = glows ? 0.4 : 0.04;
  const cornerBg = (i: number, fallback: string) =>
    glows?.[i]
      ? `radial-gradient(circle, ${glows[i]} 0%, transparent 70%)`
      : fallback;
  return (
    <>
      <style>{`
        @keyframes axAmbPathA {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(30px,-40px); }
          50% { transform: translate(-20px,-70px); }
          75% { transform: translate(-45px,15px); }
        }
        @keyframes axAmbPathB {
          0%,100% { transform: translate(0,0); }
          30% { transform: translate(-50px,35px); }
          60% { transform: translate(55px,-25px); }
        }
        @keyframes axAmbPathC {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(25px,55px); }
          50% { transform: translate(50px,-30px); }
          75% { transform: translate(-35px,20px); }
        }
        @keyframes axAmbPathD {
          0%,100% { transform: translate(0,0); }
          33% { transform: translate(-35px,-50px); }
          66% { transform: translate(55px,-35px); }
        }
        @keyframes axAmbGlowBlue   { 0%,100% { opacity: 0.03; } 50% { opacity: 0.06; } }
        @keyframes axAmbGlowGreen  { 0%,100% { opacity: 0.03; } 50% { opacity: 0.06; } }
        @keyframes axAmbGlowOrange { 0%,100% { opacity: 0.03; } 50% { opacity: 0.06; } }
        @keyframes axAmbGlowYellow { 0%,100% { opacity: 0.03; } 50% { opacity: 0.06; } }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* ── Corner glows (one per brand colour) ── */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: cornerBg(0, "radial-gradient(circle, rgba(96,165,250,1) 0%, rgba(96,165,250,0) 70%)"),
            opacity: glowOpacity,
            filter: "blur(24px)",
            animation: "axAmbGlowBlue 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: cornerBg(1, "radial-gradient(circle, rgba(52,211,153,1) 0%, rgba(52,211,153,0) 70%)"),
            opacity: glowOpacity,
            filter: "blur(24px)",
            animation: "axAmbGlowGreen 10s ease-in-out infinite",
            animationDelay: "-2.5s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: cornerBg(2, "radial-gradient(circle, rgba(249,115,22,1) 0%, rgba(249,115,22,0) 70%)"),
            opacity: glowOpacity,
            filter: "blur(24px)",
            animation: "axAmbGlowOrange 10s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: cornerBg(3, "radial-gradient(circle, rgba(245,158,11,1) 0%, rgba(245,158,11,0) 70%)"),
            opacity: glowOpacity,
            filter: "blur(24px)",
            animation: "axAmbGlowYellow 10s ease-in-out infinite",
            animationDelay: "-7.5s",
          }}
        />

        {/* ── Floating particles ── */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 8px ${p.color}`,
              animation: `axAmbPath${p.path} ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              willChange: "transform",
            }}
          />
        ))}

        {/* ── Vignette ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 75% 75% at center, transparent 60%, rgba(0,0,0,0.15) 100%)",
          }}
        />
      </div>
    </>
  );
}
