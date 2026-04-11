"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#f59e0b", dur: "9s", delay: "0s" },
        { size: 6, top: "18%", right: "10%", color: "#8b5cf6", dur: "11s", delay: "1s" },
        { size: 10, top: "35%", left: "3%", color: "#3b82f6", dur: "13s", delay: "2s" },
        { size: 5, top: "52%", right: "5%", color: "#f59e0b", dur: "8s", delay: "0.5s" },
        { size: 7, top: "70%", left: "12%", color: "#8b5cf6", dur: "10s", delay: "3s" },
        { size: 9, top: "82%", right: "8%", color: "#3b82f6", dur: "12s", delay: "1.5s" },
      ].map((o, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: o.size, height: o.size, top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color, opacity: 0.35,
            boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
            animation: `floatOrb ${o.dur} ease-in-out infinite ${o.delay}`,
          }} />
      ))}
    </div>
  );
}

function ConfettiBurst() {
  const colors = ["#8b5cf6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const dist = 80 + Math.random() * 150;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 60;
        const size = 4 + Math.random() * 6;
        return (
          <div key={i} className="absolute rounded-full"
            style={{
              left: "50%", top: "70%",
              width: size, height: size,
              backgroundColor: colors[i % colors.length],
              animation: `confettiBurst 1.2s ease-out ${Math.random() * 0.3}s forwards`,
              // @ts-expect-error CSS custom properties
              "--tx": `${tx}px`, "--ty": `${ty}px`,
            }} />
        );
      })}
    </div>
  );
}

function Sparkles({ count = 8 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = 130 + Math.random() * 40;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return (
          <div key={i} className="absolute text-yellow-300"
            style={{
              left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
              fontSize: 10 + Math.random() * 8,
              animation: `sparkle 2s ease-in-out infinite ${i * 0.3}s`,
            }}>
            ✦
          </div>
        );
      })}
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

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
          50% { transform: translateY(-18px) scale(1.1); opacity: 0.55; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.5); }
          60% { opacity: 1; transform: scale(1.1); }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes waveHand {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes peekIn {
          0% { transform: translateX(100%); opacity: 0; }
          30% { transform: translateX(-15%); opacity: 1; }
          50% { transform: translateX(-15%); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(245,158,11,0.3); }
          50% { box-shadow: 0 0 60px rgba(245,158,11,0.5); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes confettiBurst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
        }
        @keyframes centerGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes happyBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes buttonPulse {
          0%, 100% { box-shadow: 0 4px 25px rgba(139,92,246,0.4); }
          50% { box-shadow: 0 8px 40px rgba(139,92,246,0.7); }
        }
        @keyframes textSparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      <FloatingOrbs />

      {phase >= 6 && <ConfettiBurst />}

      <div className="relative text-center px-4 py-10" style={{ zIndex: 1, maxWidth: 600 }}>

        {/* PHASE 0: Center glow */}
        <div className="relative mx-auto mb-8" style={{ width: 250, height: 250 }}>
          {/* Pulsing glow (always visible from start) */}
          <div className="absolute inset-0 rounded-full mx-auto"
            style={{
              width: 200, height: 200, left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
              animation: "centerGlow 3s ease-in-out infinite",
            }} />

          {/* PHASE 1+: Adam and Layla image */}
          {phase >= 1 && (
            <div className="relative" style={{ animation: `bounceIn 0.8s ${SPRING} both` }}>
              <div className="rounded-3xl overflow-hidden mx-auto border-2"
                style={{
                  width: 250, maxWidth: "70vw",
                  borderColor: "rgba(245,158,11,0.4)",
                  animation: `glowPulse 3s ease-in-out infinite${phase >= 3 ? ", happyBounce 1s ease 0.5s" : ""}`,
                }}>
                <img src="/characters/adam-layla-happy.png" alt="Adam and Layla"
                  className="block w-full" />
              </div>
              <Sparkles />
            </div>
          )}
        </div>

        {/* PHASE 2: Greeting */}
        {phase >= 2 && (
          <div style={{ animation: `slideUp 0.7s ${SPRING} both` }} className="mb-3">
            <h1 className="text-4xl sm:text-5xl font-black inline-flex items-center justify-center gap-2 flex-wrap">
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>
                Hi {childName}!
              </span>
              <span style={{ display: "inline-block", animation: "waveHand 1.2s ease-in-out infinite" }}>👋</span>
            </h1>
          </div>
        )}

        {/* PHASE 3: Introduction */}
        {phase >= 3 && (
          <p className="text-white text-xl sm:text-2xl font-bold mb-3"
            style={{ animation: `fadeIn 0.8s ease both` }}>
            We&apos;re Adam and Layla!
          </p>
        )}

        {/* PHASE 4: The story + raccoon peek */}
        {phase >= 4 && (
          <div className="relative mb-3">
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed"
              style={{ animation: `fadeIn 0.8s ease both` }}>
              We need <strong className="text-white">YOUR</strong> help to learn about cybersecurity and defeat the Hacker Raccoon!
            </p>
            {/* Raccoon peeking */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: 10 }}>
              <img src="/characters/raccoon.png" alt="Hacker Raccoon" width={60} height={60}
                style={{ animation: "peekIn 3s ease-in-out 0.5s both" }} />
            </div>
          </div>
        )}

        {/* PHASE 5: The promise */}
        {phase >= 5 && (
          <div className="relative mb-6">
            <p className="text-white text-lg sm:text-xl font-bold"
              style={{ animation: `slideUp 0.7s ${SPRING} both` }}>
              Every week is a new adventure. Are you ready?
            </p>
            {/* Small sparkles around text */}
            {["−30px", "30px"].map((x, i) => (
              <span key={i} className="absolute text-yellow-300" style={{
                top: "-8px",
                left: `calc(50% + ${x})`,
                fontSize: 14,
                animation: `textSparkle 1.5s ease-in-out infinite ${i * 0.5}s`,
              }}>✨</span>
            ))}
          </div>
        )}

        {/* PHASE 6: CTA button */}
        {phase >= 6 && (
          <div style={{ animation: `bounceIn 0.6s ${SPRING} both` }}>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto px-12 py-5 rounded-2xl font-black text-white text-lg sm:text-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: GRAD,
                animation: "buttonPulse 2s ease-in-out infinite",
                minHeight: 56,
              }}>
              Let&apos;s Start! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
