"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const GRAD   = "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";
const TOTAL  = 17;

// ─── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes bobble    {0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-14px) rotate(2deg)}}
  @keyframes floatUp   {0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
  @keyframes popIn     {0%{opacity:0;transform:scale(0.4) rotate(-8deg)}70%{transform:scale(1.1) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
  @keyframes slideInR  {from{opacity:0;transform:translateX(70px) scale(0.97)}to{opacity:1;transform:translateX(0) scale(1)}}
  @keyframes slideOutL {from{opacity:1;transform:translateX(0) scale(1)}to{opacity:0;transform:translateX(-70px) scale(0.97)}}
  @keyframes slideUp   {from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bounceIn  {0%{opacity:0;transform:scale(0.2) rotate(-15deg)}55%{transform:scale(1.15) rotate(4deg);opacity:1}78%{transform:scale(0.95) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}
  @keyframes glowBlue  {0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0.5)}50%{box-shadow:0 0 0 14px rgba(59,130,246,0)}}
  @keyframes glowPurple{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.5)}50%{box-shadow:0 0 0 14px rgba(139,92,246,0)}}
  @keyframes pulseDot  {0%,100%{opacity:1}50%{opacity:0}}
  @keyframes celebrate {0%{transform:scale(1)}30%{transform:scale(1.25) rotate(-5deg)}60%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
  .slide-in  {animation:slideInR  0.45s ${SPRING} both}
  .slide-out {animation:slideOutL 0.25s ease-in  forwards}
`;

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

function FloatingBubbles() {
  const bs = [
    [100,"8%","4%",null,"#bfdbfe","9s","0s"],
    [70,"20%",null,"6%","#e9d5ff","11s","1s"],
    [55,"58%","7%",null,"#fbcfe8","8s","2s"],
    [85,"40%",null,"9%","#bbf7d0","12s","0.5s"],
    [45,"78%","56%",null,"#fef08a","7s","3s"],
    [110,"10%","46%",null,"#a5f3fc","14s","1.5s"],
  ] as const;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {bs.map(([size, top, left, right, color, dur, delay], i) => (
        <div key={i} className="absolute rounded-full opacity-25"
          style={{
            width: size, height: size, top,
            left: left ?? undefined, right: right ?? undefined,
            backgroundColor: color,
            animation: `floatUp ${dur} ease-in-out infinite ${delay}`,
          }} />
      ))}
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-4 bg-white rounded-full overflow-hidden border border-purple-100 shadow-inner">
        <div className="h-full rounded-full" style={{
          width: `${(step / (TOTAL - 1)) * 100}%`,
          background: GRAD,
          transition: `width 0.8s ${SPRING}`,
        }} />
      </div>
      <span className="text-xs font-black text-purple-500 shrink-0">{step + 1}/{TOTAL}</span>
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: TOTAL }, (_, i) => (
        <div key={i} className="rounded-full transition-all duration-500"
          style={{ width: i === step ? 20 : 7, height: 7, background: i <= step ? GRAD : "#e9d5ff" }} />
      ))}
    </div>
  );
}

// ─── CUSTOM VIDEO CONTROLS ──────────────────────────────────────────────────

function MediaControls({
  isPlaying,
  progress,
  duration,
  muted,
  onPlayPause,
  onMuteToggle,
  onSeek,
}: {
  isPlaying: boolean;
  progress: number;
  duration: number;
  muted: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onSeek: (pct: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pct);
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 border border-purple-100 shadow-sm backdrop-blur-sm"
      style={{ animation: `slideUp 0.5s ${SPRING} 0.2s both` }}>
      {/* Play / Pause */}
      <button onClick={onPlayPause}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer"
        style={{ background: GRAD, boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
        <span className="text-white font-black text-sm">{isPlaying ? "⏸" : "▶"}</span>
      </button>

      {/* Time */}
      <span className="text-xs font-bold text-gray-500 shrink-0 w-10 text-right">{fmtTime(progress)}</span>

      {/* Seek bar */}
      <div ref={barRef} onClick={handleBarClick}
        className="flex-1 h-3 bg-purple-100 rounded-full overflow-hidden cursor-pointer relative group">
        <div className="h-full rounded-full transition-all duration-150"
          style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%`, background: GRAD }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-purple-400 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${duration > 0 ? (progress / duration) * 100 : 0}% - 8px)` }} />
      </div>

      {/* Duration */}
      <span className="text-xs font-bold text-gray-500 shrink-0 w-10">{fmtTime(duration)}</span>

      {/* Mute */}
      <button onClick={onMuteToggle}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-purple-200 bg-white cursor-pointer hover:bg-purple-50 transition-colors">
        <span className="text-sm">{muted ? "🔇" : "🔊"}</span>
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

type Hero = "hex" | "nova";

export default function LessonNew({ userName, moduleId }: { userName: string; moduleId: string }) {
  // ── Navigation ──────────────────────────────────────────────────────────
  const [screen, setScreen] = useState(0);
  const [animClass, setAnimClass] = useState("slide-in");

  // ── Screen 0: Character selection ───────────────────────────────────────
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [heroConfirmed, setHeroConfirmed] = useState(false);

  // ── Screen 1: Video ─────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaMuted, setMediaMuted] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);

  // ── Completion tracking ─────────────────────────────────────────────────
  const progressPosted = useRef(false);

  // ── Navigate ────────────────────────────────────────────────────────────
  const navigate = useCallback((to: number) => {
    // Pause media when leaving screen 1
    if (screen === 1) {
      videoRef.current?.pause();
      setIsPlaying(false);
    }

    // Reset state for target screen
    if (to === 1) {
      setVideoEnded(false);
      setMediaProgress(0);
      setIsPlaying(false);
    }

    setAnimClass("slide-out");
    setTimeout(() => { setScreen(to); setAnimClass("slide-in"); }, 260);
  }, [screen]);

  // ── Video controls ──────────────────────────────────────────────────────
  const playMedia = useCallback(() => {
    const vp = videoRef.current?.play();
    if (vp) vp.catch(() => {});
    setIsPlaying(true);
  }, []);

  const pauseMedia = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pauseMedia();
    else playMedia();
  }, [isPlaying, playMedia, pauseMedia]);

  const toggleMute = useCallback(() => {
    setMediaMuted(m => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  const seekMedia = useCallback((pct: number) => {
    const t = pct * mediaDuration;
    if (videoRef.current) videoRef.current.currentTime = t;
    setMediaProgress(t);
  }, [mediaDuration]);

  // Auto-play when screen 1 mounts
  useEffect(() => {
    if (screen !== 1) return;
    const timer = setTimeout(() => {
      playMedia();
    }, 400);
    return () => clearTimeout(timer);
  }, [screen, playMedia]);

  // Sync progress from video timeupdate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setMediaProgress(video.currentTime);
    const onLoadedMeta = () => setMediaDuration(video.duration);
    const onEnded = () => { setVideoEnded(true); setIsPlaying(false); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [screen]);

  // Progress API on final screen
  useEffect(() => {
    if (screen === TOTAL - 1 && moduleId && !progressPosted.current) {
      progressPosted.current = true;
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      }).catch(console.error);
    }
  }, [screen, moduleId]);

  // ── Gradient button helper ──────────────────────────────────────────────
  const btn = (onClick: () => void, label: React.ReactNode, extra?: React.CSSProperties) => (
    <button onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      style={{
        background: GRAD, color: "#fff", fontWeight: 900, fontSize: 17,
        padding: "13px 34px", borderRadius: 20, border: "none", cursor: "pointer",
        boxShadow: "0 8px 32px rgba(139,92,246,0.3)", transition: "transform 0.2s",
        minHeight: 54, ...extra,
      }}>
      {label}
    </button>
  );

  // ── Screens ─────────────────────────────────────────────────────────────

  const renderScreen = () => {
    switch (screen) {

      // ── 0: CHARACTER SELECTION ───────────────────────────────────────────
      case 0: {
        const heroes: { id: Hero; name: string; borderColor: string; glowAnim: string; accent: string }[] = [
          { id: "hex",  name: "Hex",  borderColor: "#3b82f6", glowAnim: "glowBlue",   accent: "#2563eb" },
          { id: "nova", name: "Nova", borderColor: "#8b5cf6", glowAnim: "glowPurple", accent: "#7c3aed" },
        ];

        return (
          <div className="flex flex-col items-center text-center gap-8 py-8 pb-12">
            <div style={{ animation: `popIn 0.7s ${SPRING} both` }}>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight"
                style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Choose Your Cyber Hero!
              </h1>
              <p className="text-gray-500 font-bold mt-2 text-lg">Pick a hero to guide you on your adventure!</p>
            </div>

            <div className="flex gap-6 sm:gap-8 justify-center flex-wrap"
              style={{ animation: `slideUp 0.6s ${SPRING} 0.2s both` }}>
              {heroes.map(hero => {
                const isSelected = selectedHero === hero.id;
                return (
                  <button key={hero.id}
                    onClick={() => setSelectedHero(hero.id)}
                    className="relative flex flex-col items-center gap-3 rounded-3xl p-6 border-4 cursor-pointer transition-all duration-300 bg-white"
                    style={{
                      borderColor: isSelected ? hero.borderColor : "#e5e7eb",
                      transform: isSelected ? "scale(1.08)" : "scale(1)",
                      boxShadow: isSelected
                        ? `0 0 0 4px ${hero.borderColor}30, 0 12px 40px rgba(0,0,0,0.12)`
                        : "0 4px 20px rgba(0,0,0,0.06)",
                      animation: isSelected ? `${hero.glowAnim} 2s ease-in-out infinite` : undefined,
                      minWidth: 160,
                    }}>
                    {/* Character placeholder */}
                    <div className="w-28 h-28 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${hero.borderColor}20, ${hero.borderColor}40)`,
                        border: `3px dashed ${hero.borderColor}60`,
                      }}>
                      <span style={{ fontSize: 56 }}>{hero.id === "hex" ? "🛡️" : "⚡"}</span>
                    </div>
                    <div className="font-black text-xl" style={{ color: hero.accent }}>{hero.name}</div>
                    <div className="text-xs font-bold text-gray-400">
                      {hero.id === "hex" ? "The Shield Guardian" : "The Code Breaker"}
                    </div>

                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black"
                        style={{ background: hero.borderColor, animation: `popIn 0.3s ${SPRING} both` }}>
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedHero && (
              <div style={{ animation: `bounceIn 0.6s ${SPRING} both` }}>
                {btn(() => { setHeroConfirmed(true); navigate(1); }, `Let's Go, ${selectedHero === "hex" ? "Hex" : "Nova"}! 🚀`)}
              </div>
            )}
          </div>
        );
      }

      // ── 1: WELCOME — VIDEO + AUDIO ──────────────────────────────────────
      case 1: return (
        <div className="flex flex-col gap-5 pb-10">
          <div className="text-center" style={{ animation: `slideUp 0.5s ${SPRING} both` }}>
            <h2 className="text-3xl font-black"
              style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Welcome to Cyber Heroes Academy! 🛡️
            </h2>
            <p className="text-gray-500 font-bold mt-1 text-base">Week 1 · What is a Password?</p>
          </div>

          {/* Video container */}
          <div className="rounded-3xl overflow-hidden border-4 border-purple-200 shadow-2xl bg-black"
            style={{ animation: `popIn 0.7s ${SPRING} 0.1s both` }}>
            <video
              ref={videoRef}
              src="/videos/01-welcome.mp4"
              playsInline
              className="w-full block"
              style={{ aspectRatio: "1/1", objectFit: "contain", background: "#000" }}
            />
          </div>

          {/* Custom controls */}
          <MediaControls
            isPlaying={isPlaying}
            progress={mediaProgress}
            duration={mediaDuration}
            muted={mediaMuted}
            onPlayPause={togglePlayPause}
            onMuteToggle={toggleMute}
            onSeek={seekMedia}
          />

          {/* Post-video content */}
          {videoEnded && (
            <div className="flex flex-col items-center gap-4"
              style={{ animation: `slideUp 0.6s ${SPRING} both` }}>
              <div className="bg-white rounded-3xl px-6 py-5 shadow-xl border-2 border-purple-100 max-w-md w-full">
                <p className="font-black text-gray-700 text-base leading-relaxed mb-2">
                  This is <span className="text-blue-600">Robo</span>! He helps the Cyber Heroes with their computer work. 🤖
                </p>
                <p className="font-bold text-gray-500 text-sm leading-relaxed">
                  But today, something went <span className="text-red-500 font-black">wrong</span>…
                </p>
              </div>

              <div style={{ animation: `bounceIn 0.6s ${SPRING} 0.3s both` }}>
                {btn(() => navigate(2), "What happened? 👀")}
              </div>
            </div>
          )}
        </div>
      );

      // ── 2–16: PLACEHOLDER SCREENS ───────────────────────────────────────
      default: return (
        <div className="flex flex-col items-center text-center gap-6 py-12">
          <div style={{ fontSize: 80 }}>🚧</div>
          <h2 className="text-2xl font-black text-gray-700">Screen {screen} — Coming Soon</h2>
          <p className="text-gray-400 font-bold">This screen is under construction.</p>
          <div className="flex gap-3">
            {screen > 0 && btn(() => navigate(screen - 1), "← Back")}
            {screen < TOTAL - 1 && btn(() => navigate(screen + 1), "Next →")}
          </div>
        </div>
      );
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>
      <FloatingBubbles />
      <div className="min-h-screen bg-[#f0f4ff] relative" style={{ zIndex: 1 }}>
        <header className="sticky top-0 z-40 border-b border-purple-100 shadow-sm"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-2xl mx-auto px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <a href="/dashboard" className="font-black text-sm transition"
                style={{ color: "#8b5cf6", textDecoration: "none" }}>
                ← Dashboard
              </a>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow"
                  style={{ background: GRAD }}>
                  <span className="text-xs font-black text-white">AX</span>
                </div>
                <span className="font-black text-gray-700 text-sm hidden sm:block">
                  Week 1 · What is a Password?
                </span>
              </div>
            </div>
            {heroConfirmed && <ProgressBar step={screen} />}
            {heroConfirmed && <StepDots step={screen} />}
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-5 pt-8">
          <div key={screen} className={animClass}>{renderScreen()}</div>
        </main>
      </div>
    </>
  );
}
