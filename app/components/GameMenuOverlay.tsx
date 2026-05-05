"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useState,
} from "react";
import { SoundManager, playSound } from "@/app/lib/sounds";
import { clearActiveSlot } from "@/app/lib/saveSlots";
import {
  isFullscreen,
  toggleFullscreen,
} from "@/app/components/FullscreenManager";

/**
 * GameMenuOverlay — pause menu + settings, triggered globally by ESC
 * anywhere inside the lesson shell.
 *
 * Visible behaviour:
 *   - Press ESC → "GAME PAUSED" panel slides in, world dims and pauses
 *     pointer events behind it.
 *   - Resume / ESC again → overlay closes.
 *   - Settings → swaps the panel content for sliders + toggles.
 *   - Main Menu → clears active slot, hard-reloads back to title.
 *
 * Audio + reduce-motion preferences are persisted to localStorage so
 * settings survive across sessions.
 */

const VOLUME_STORAGE_KEY = "algorithmx-volume-prefs-v1";
const REDUCE_MOTION_KEY = "algorithmx-reduce-motion";

interface VolumePrefs {
  music: number;
  sfx: number;
  voice: number;
}

const DEFAULT_VOLUMES: VolumePrefs = { music: 1, sfx: 1, voice: 1 };

function loadVolumes(): VolumePrefs {
  if (typeof window === "undefined") return DEFAULT_VOLUMES;
  try {
    const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (!raw) return DEFAULT_VOLUMES;
    const parsed = JSON.parse(raw) as Partial<VolumePrefs>;
    return {
      music: parsed.music ?? 1,
      sfx: parsed.sfx ?? 1,
      voice: parsed.voice ?? 1,
    };
  } catch {
    return DEFAULT_VOLUMES;
  }
}

function saveVolumes(v: VolumePrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

function loadReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(REDUCE_MOTION_KEY) === "true";
  } catch {
    return false;
  }
}

function saveReduceMotion(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REDUCE_MOTION_KEY, value ? "true" : "false");
  } catch {
    /* ignore */
  }
}

type Panel = "pause" | "settings";

export interface GameMenuOverlayProps {
  /** Optional — disable the global ESC hotkey if the host wants to
   * own that key (e.g. during a particular cutscene). */
  enabled?: boolean;
}

export default function GameMenuOverlay({
  enabled = true,
}: GameMenuOverlayProps) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("pause");
  const [vols, setVols] = useState<VolumePrefs>(() => loadVolumes());
  const [muted, setMuted] = useState<boolean>(() =>
    typeof window === "undefined"
      ? false
      : SoundManager.getInstance().isMuted(),
  );
  const [reduceMotion, setReduceMotion] = useState<boolean>(() =>
    loadReduceMotion(),
  );
  const [fsActive, setFsActive] = useState<boolean>(() => isFullscreen());

  /* Keep the settings toggle's state in sync if the user exits via Esc
   * or the OS chrome so the switch reflects reality. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setFsActive(isFullscreen());
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Apply persisted volumes on mount so a fresh tab honours the user's
   * last session's mix. */
  useEffect(() => {
    const sm = SoundManager.getInstance();
    sm.setVolume("music", vols.music);
    sm.setVolume("sfx", vols.sfx);
    sm.setVolume("voice", vols.voice);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const closeOverlay = useCallback(() => {
    setOpen(false);
    setPanel("pause");
    playSound("back");
  }, []);

  const openOverlay = useCallback(() => {
    setOpen(true);
    setPanel("pause");
    playSound("transition");
  }, []);

  /* Global ESC binding. */
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      /* Don't swallow Escape if the user is typing in an input or the
       * page is in fullscreen (browser will exit fullscreen on its own). */
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setOpen((current) => {
        if (current) {
          playSound("back");
          setPanel("pause");
          return false;
        }
        playSound("transition");
        return true;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  /* Volume slider change → mutate live audio + persist. */
  const setVolume = useCallback(
    (cat: keyof VolumePrefs, value: number) => {
      const next = { ...vols, [cat]: value };
      setVols(next);
      saveVolumes(next);
      SoundManager.getInstance().setVolume(cat, value);
    },
    [vols],
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    SoundManager.getInstance().setMuted(next);
    playSound(next ? "back" : "select");
  }, [muted]);

  const toggleReduceMotion = useCallback(() => {
    const next = !reduceMotion;
    setReduceMotion(next);
    saveReduceMotion(next);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.axReduceMotion = next ? "true" : "false";
    }
    playSound("hover");
  }, [reduceMotion]);

  /* Mark the html element with the reduce-motion flag once on mount so
   * other components reading data-ax-reduce-motion="true" can adjust. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.axReduceMotion = reduceMotion
      ? "true"
      : "false";
  }, [reduceMotion]);

  const handleMainMenu = useCallback(() => {
    clearActiveSlot();
    playSound("back");
    if (typeof window !== "undefined") {
      /* Hard reload so server-side auth check + LessonGate boot path
       * runs fresh. Avoids any in-memory React state surviving. */
      window.location.href = "/lesson";
    }
  }, []);

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={dimStyle} onClick={closeOverlay} aria-hidden />
      <div style={panelStyle}>
        {panel === "pause" ? (
          <PausePanel
            onResume={closeOverlay}
            onSettings={() => {
              setPanel("settings");
              playSound("select");
            }}
            onMainMenu={handleMainMenu}
          />
        ) : (
          <SettingsPanel
            vols={vols}
            muted={muted}
            reduceMotion={reduceMotion}
            fsActive={fsActive}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
            onToggleReduceMotion={toggleReduceMotion}
            onBack={() => {
              setPanel("pause");
              playSound("back");
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── PAUSE PANEL ─────────────────────────── */

function PausePanel({
  onResume,
  onSettings,
  onMainMenu,
}: {
  onResume: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}) {
  return (
    <div style={panelInnerStyle}>
      <div style={kickerStyle}>SYSTEM</div>
      <h2 style={panelHeadingStyle}>GAME PAUSED</h2>
      <div style={panelDividerStyle} />
      <div style={menuListStyle}>
        <MenuButton onClick={onResume} label="RESUME" hint="ESC" primary />
        <MenuButton onClick={onSettings} label="SETTINGS" />
        <MenuButton onClick={onMainMenu} label="MAIN MENU" warn />
      </div>
      <div style={hintRowStyle}>Press ESC to resume</div>
    </div>
  );
}

/* ─────────────────────────── SETTINGS PANEL ─────────────────────────── */

function SettingsPanel({
  vols,
  muted,
  reduceMotion,
  fsActive,
  onVolumeChange,
  onToggleMute,
  onToggleReduceMotion,
  onBack,
}: {
  vols: VolumePrefs;
  muted: boolean;
  reduceMotion: boolean;
  fsActive: boolean;
  onVolumeChange: (cat: keyof VolumePrefs, value: number) => void;
  onToggleMute: () => void;
  onToggleReduceMotion: () => void;
  onBack: () => void;
}) {
  return (
    <div style={panelInnerStyle}>
      <div style={kickerStyle}>OPTIONS</div>
      <h2 style={panelHeadingStyle}>SETTINGS</h2>
      <div style={panelDividerStyle} />

      <div style={settingsBodyStyle}>
        <SectionLabel>Audio</SectionLabel>
        <VolumeSlider
          label="Music"
          value={vols.music}
          onChange={(v) => onVolumeChange("music", v)}
          accent="#7c5cff"
        />
        <VolumeSlider
          label="Sound effects"
          value={vols.sfx}
          onChange={(v) => onVolumeChange("sfx", v)}
          accent="#00e5ff"
        />
        <VolumeSlider
          label="Voice"
          value={vols.voice}
          onChange={(v) => onVolumeChange("voice", v)}
          accent="#ff5fb3"
        />
        <ToggleRow
          label="Mute everything"
          value={muted}
          onChange={onToggleMute}
        />

        <SectionLabel>Display</SectionLabel>
        <ToggleRow
          label="Fullscreen"
          value={fsActive}
          onChange={() => {
            void toggleFullscreen();
            playSound("hover");
          }}
          hint="Press F anywhere to toggle quickly."
        />

        <SectionLabel>Accessibility</SectionLabel>
        <ToggleRow
          label="Reduce motion"
          value={reduceMotion}
          onChange={onToggleReduceMotion}
          hint="Disables decorative shake / particle bursts."
        />
      </div>

      <button onClick={onBack} style={backButtonStyle}>
        ← Back
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={sectionLabelStyle}>{children}</div>;
}

function VolumeSlider({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div style={sliderRowStyle}>
      <div style={sliderHeaderRowStyle}>
        <span style={sliderLabelStyle}>{label}</span>
        <span style={{ ...sliderValueStyle, color: accent }}>{pct}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          ...sliderInputStyle,
          accentColor: accent,
        }}
      />
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
  hint?: string;
}) {
  return (
    <button
      onClick={onChange}
      style={{
        ...toggleRowStyle,
        borderColor: value ? "#00e5ff" : "rgba(255,255,255,0.12)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
        <span style={toggleLabelStyle}>{label}</span>
        {hint && <span style={toggleHintStyle}>{hint}</span>}
      </div>
      <div
        style={{
          ...toggleSwitchStyle,
          background: value ? "#00e5ff" : "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            ...toggleKnobStyle,
            transform: value ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </div>
    </button>
  );
}

/* ─────────────────────────── MENU BUTTON ─────────────────────────── */

function MenuButton({
  onClick,
  label,
  hint,
  primary,
  warn,
}: {
  onClick: () => void;
  label: string;
  hint?: string;
  primary?: boolean;
  warn?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const accent = warn ? "#ff5fb3" : primary ? "#00e5ff" : "#7df0ff";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setHover(true);
        playSound("hover");
      }}
      onMouseLeave={() => setHover(false)}
      style={{
        ...menuButtonStyle,
        borderColor: hover ? accent : "rgba(255,255,255,0.12)",
        background: hover
          ? `linear-gradient(90deg, ${accent}22, transparent)`
          : "rgba(255,255,255,0.04)",
        color: hover ? accent : "#e8edff",
        boxShadow: hover ? `0 0 24px ${accent}33` : "none",
      }}
    >
      <span>{label}</span>
      {hint && <span style={menuHintStyle}>{hint}</span>}
    </button>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const dimStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(4,5,13,0.78)",
  backdropFilter: "blur(8px)",
  animation: "ax-menu-fade-in 240ms ease-out both",
};

const panelStyle: CSSProperties = {
  position: "relative",
  width: "min(440px, 92vw)",
  maxHeight: "92vh",
  overflowY: "auto",
  background:
    "linear-gradient(180deg, rgba(15,21,48,0.95) 0%, rgba(10,8,32,0.98) 100%)",
  border: "1px solid rgba(0,229,255,0.28)",
  borderRadius: 18,
  boxShadow:
    "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
  padding: 28,
  color: "#e8edff",
  animation: "ax-menu-pop-in 320ms cubic-bezier(0.16,1,0.3,1) both",
};

const panelInnerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const kickerStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 4,
  color: "#7df0ff",
  fontWeight: 700,
};

const panelHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 900,
  letterSpacing: 4,
  background:
    "linear-gradient(135deg, #00e5ff 0%, #7c5cff 60%, #ff5fb3 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const panelDividerStyle: CSSProperties = {
  height: 1,
  background:
    "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)",
};

const menuListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginTop: 4,
};

const menuButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  borderRadius: 12,
  padding: "14px 18px",
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: 3,
  cursor: "pointer",
  textTransform: "uppercase",
  transition: "all 220ms ease",
  color: "#e8edff",
};

const menuHintStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: 2,
  color: "rgba(232,237,255,0.5)",
  fontFamily: "monospace",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6,
  padding: "2px 6px",
};

const hintRowStyle: CSSProperties = {
  textAlign: "center",
  fontSize: 11,
  color: "rgba(232,237,255,0.45)",
  letterSpacing: 2,
  textTransform: "uppercase",
};

const settingsBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 3,
  fontWeight: 800,
  color: "#7df0ff",
  textTransform: "uppercase",
  marginTop: 4,
};

const sliderRowStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const sliderHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const sliderLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
};

const sliderValueStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 1,
  fontFamily: "monospace",
};

const sliderInputStyle: CSSProperties = {
  width: "100%",
  height: 4,
  cursor: "pointer",
};

const toggleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "12px 14px",
  cursor: "pointer",
  width: "100%",
  color: "#e8edff",
};

const toggleLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
};

const toggleHintStyle: CSSProperties = {
  fontSize: 11,
  color: "rgba(232,237,255,0.55)",
};

const toggleSwitchStyle: CSSProperties = {
  width: 44,
  height: 24,
  borderRadius: 999,
  position: "relative",
  transition: "background 200ms ease",
  flexShrink: 0,
};

const toggleKnobStyle: CSSProperties = {
  position: "absolute",
  top: 2,
  left: 2,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#04050d",
  transition: "transform 220ms cubic-bezier(0.16,1,0.3,1)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
};

const backButtonStyle: CSSProperties = {
  marginTop: 8,
  background: "transparent",
  color: "rgba(232,237,255,0.7)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 999,
  padding: "10px 16px",
  fontSize: 12,
  letterSpacing: 2,
  cursor: "pointer",
  fontWeight: 700,
  textTransform: "uppercase",
  alignSelf: "flex-start",
};

if (typeof document !== "undefined") {
  const id = "ax-menu-overlay-keyframes";
  if (!document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-menu-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes ax-menu-pop-in {
  0% { opacity: 0; transform: translateY(12px) scale(0.96); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
`;
    document.head.appendChild(el);
  }
}
