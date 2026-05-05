"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AVAILABLE_SLOT_IDS,
  createSlot,
  deleteSlot,
  formatPlayTime,
  formatRelative,
  listSlots,
  migrateLegacyIfNeeded,
  setActiveSlot,
  type SaveSlot,
} from "@/app/lib/saveSlots";
import { playBGM, playSound } from "@/app/lib/sounds";
import { getRank } from "@/app/lib/progression";
import BootIntro from "@/app/components/BootIntro";
import RecentActivityMarquee from "@/app/components/RecentActivityMarquee";

/**
 * TitleScreen — full-screen "boot" experience that gates the lesson.
 *
 * Phases:
 *   1. boot      → animated logo + "PRESS ANY KEY"
 *   2. slots     → save-slot picker (3 slots, "New Game" / "Continue" / "Delete")
 *   3. newGame   → name + avatar picker for an empty slot
 *
 * Once a slot is chosen, `onStart()` is called; the parent unmounts the
 * title and renders the lesson player.
 */

export interface TitleScreenProps {
  /** Display name to default the new-slot input to. */
  defaultName: string;
  /** Called once the player has picked or created a slot and is ready to play. */
  onStart: (slot: SaveSlot) => void;
}

type Phase = "boot" | "slots" | "newGame" | "intro";

const AVATAR_OPTIONS: { id: SaveSlot["avatar"]; label: string; tint: string }[] = [
  { id: "adam", label: "Adam", tint: "#00e5ff" },
  { id: "layla", label: "Layla", tint: "#ff5fb3" },
];

export default function TitleScreen({ defaultName, onStart }: TitleScreenProps) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [slots, setSlots] = useState<(SaveSlot | null)[]>(() => {
    if (typeof window === "undefined") return [null, null, null];
    migrateLegacyIfNeeded();
    return listSlots();
  });
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null);
  const [newName, setNewName] = useState(defaultName);
  const [newAvatar, setNewAvatar] = useState<SaveSlot["avatar"]>("adam");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  /* Mouse-parallax: subtle 3D tilt on the logo. Tracks across the
   * whole window so the kid doesn't have to hover precisely. */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      setTilt({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* Ambient music starts here and continues into the lesson —
   * SoundManager.playBGM crossfades when LessonPlayer eventually
   * picks its own track, so the kid never hears a silence gap. */
  useEffect(() => {
    playBGM("bgmLesson");
  }, []);

  /* "Press any key" → slots. Clicking the screen also advances. */
  const advanceFromBoot = useCallback(() => {
    setPhase("slots");
    playSound("transition");
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    const onKey = (_e: KeyboardEvent) => {
      advanceFromBoot();
    };
    const onClick = () => advanceFromBoot();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [phase, advanceFromBoot]);

  const refreshSlots = useCallback(() => {
    setSlots(listSlots());
  }, []);

  const handleContinue = useCallback(
    (slot: SaveSlot) => {
      setActiveSlot(slot.id);
      playSound("select");
      onStart(slot);
    },
    [onStart],
  );

  const [pendingNewSlot, setPendingNewSlot] = useState<SaveSlot | null>(null);

  const handleNewGameStart = useCallback(() => {
    if (!pickerSlotId) return;
    const slot = createSlot({
      id: pickerSlotId,
      name: newName,
      avatar: newAvatar,
    });
    playSound("levelUp");
    /* Play the boot intro before handing control to the lesson. */
    setPendingNewSlot(slot);
    setPhase("intro");
  }, [pickerSlotId, newName, newAvatar]);

  const handleIntroComplete = useCallback(() => {
    if (pendingNewSlot) {
      const slot = pendingNewSlot;
      setPendingNewSlot(null);
      onStart(slot);
    }
  }, [pendingNewSlot, onStart]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSlot(id);
      playSound("back");
      setConfirmDeleteId(null);
      refreshSlots();
    },
    [refreshSlots],
  );

  /* ─────────────────────────── RENDER ─────────────────────────── */

  return (
    <div style={containerStyle}>
      <Backdrop />
      <StarLayer />

      <div style={contentStyle}>
        {phase === "boot" && (
          <BootPhase
            titleRef={titleRef}
            defaultName={defaultName}
            hasSaves={slots.some((s) => s !== null)}
            tilt={tilt}
          />
        )}

        {phase === "slots" && (
          <SlotsPhase
            slots={slots}
            onContinue={handleContinue}
            onNew={(slotId) => {
              setPickerSlotId(slotId);
              setPhase("newGame");
              playSound("select");
            }}
            onDelete={(id) => setConfirmDeleteId(id)}
            confirmDeleteId={confirmDeleteId}
            confirmDelete={handleDelete}
            cancelDelete={() => setConfirmDeleteId(null)}
            onBack={() => {
              setPhase("boot");
              playSound("back");
            }}
          />
        )}

        {phase === "newGame" && (
          <NewGamePhase
            defaultName={newName}
            onName={setNewName}
            avatar={newAvatar}
            onAvatar={setNewAvatar}
            onConfirm={handleNewGameStart}
            onBack={() => {
              setPhase("slots");
              playSound("back");
            }}
          />
        )}
      </div>

      {phase === "intro" && pendingNewSlot && (
        <BootIntro
          name={pendingNewSlot.name}
          onComplete={handleIntroComplete}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── BOOT PHASE ─────────────────────────── */

function BootPhase({
  titleRef,
  hasSaves,
  tilt,
}: {
  titleRef: React.RefObject<HTMLDivElement | null>;
  defaultName: string;
  hasSaves: boolean;
  tilt: { x: number; y: number };
}) {
  /* Parallax transforms — subtle, 6deg max tilt. */
  const tiltX = -tilt.y * 6;
  const tiltY = tilt.x * 6;
  return (
    <div style={bootColumnStyle}>
      <div
        ref={titleRef}
        style={{
          ...logoWrapStyle,
          transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: "transform 200ms ease-out",
        }}
      >
        <div
          style={{
            ...logoLineStyle,
            transform: `translateX(${tilt.x * -8}px) translateY(${tilt.y * -4}px)`,
          }}
        >
          ALGORITHMX
        </div>
        <div
          style={{
            ...logoSubStyle,
            transform: `translateX(${tilt.x * -4}px)`,
          }}
        >
          CYBER HEROES ACADEMY
        </div>
        <div style={logoUnderlineStyle} />
      </div>

      <div style={pressStartStyle}>
        {hasSaves ? "PRESS ANY KEY TO CONTINUE" : "PRESS ANY KEY TO START"}
      </div>

      <div style={tagStyle}>
        Train. Defend. Become a Cyber Hero.
      </div>
    </div>
  );
}

/* ─────────────────────────── SLOTS PHASE ─────────────────────────── */

function SlotsPhase({
  slots,
  onContinue,
  onNew,
  onDelete,
  confirmDeleteId,
  confirmDelete,
  cancelDelete,
  onBack,
}: {
  slots: (SaveSlot | null)[];
  onContinue: (slot: SaveSlot) => void;
  onNew: (slotId: string) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  confirmDelete: (id: string) => void;
  cancelDelete: () => void;
  onBack: () => void;
}) {
  /* Quick-resume — most-recently-played slot, only if played in the
   * last 14 days. Filters out brand-new empty slots. */
  const recent = slots
    .filter((s): s is SaveSlot => s !== null)
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)[0];
  const fourteenDaysMs = 14 * 86_400_000;
  const showQuickResume =
    !!recent && Date.now() - recent.lastPlayedAt < fourteenDaysMs;

  return (
    <div style={slotsColumnStyle}>
      <RecentActivityMarquee />
      <h1 style={panelTitleStyle}>CHOOSE YOUR HERO</h1>
      <p style={panelSubStyle}>Pick a save slot to continue, or start a new adventure.</p>

      {showQuickResume && recent && (
        <button
          onClick={() => {
            playSound("select");
            onContinue(recent);
          }}
          style={quickResumeStyle}
        >
          <span style={quickResumeKickerStyle}>QUICK RESUME</span>
          <span style={quickResumeNameStyle}>{recent.name}</span>
          <span style={quickResumeMetaStyle}>
            Week {recent.weekUnlocked} · {recent.totalXP} XP
          </span>
          <span style={quickResumeArrowStyle}>→</span>
        </button>
      )}

      <div style={slotsGridStyle}>
        {AVAILABLE_SLOT_IDS.map((slotId, i) => {
          const slot = slots[i];
          const confirming = confirmDeleteId === slotId;
          return (
            <SlotCard
              key={slotId}
              slot={slot}
              slotId={slotId}
              index={i + 1}
              confirming={confirming}
              onContinue={() => slot && onContinue(slot)}
              onNew={() => onNew(slotId)}
              onDelete={() => onDelete(slotId)}
              onConfirmDelete={() => confirmDelete(slotId)}
              onCancelDelete={cancelDelete}
            />
          );
        })}
      </div>

      <button onClick={onBack} style={backButtonStyle}>
        ← Back
      </button>
    </div>
  );
}

function SlotCard({
  slot,
  slotId,
  index,
  confirming,
  onContinue,
  onNew,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  slot: SaveSlot | null;
  slotId: string;
  index: number;
  confirming: boolean;
  onContinue: () => void;
  onNew: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  const empty = slot === null;
  const tint = slot
    ? AVATAR_OPTIONS.find((a) => a.id === slot.avatar)?.tint ?? "#00e5ff"
    : "#7c5cff";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...slotCardStyle,
        borderColor: hover ? tint : "rgba(255,255,255,0.12)",
        boxShadow: hover
          ? `0 12px 40px ${tint}33, 0 0 0 1px ${tint}55 inset`
          : "0 8px 24px rgba(0,0,0,0.4)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div style={{ ...slotIndexStyle, color: tint }}>SLOT {index}</div>

      {empty ? (
        <div style={emptySlotInnerStyle}>
          <div style={emptySlotPlusStyle}>+</div>
          <div style={emptySlotLabelStyle}>EMPTY</div>
          <button
            onClick={onNew}
            style={{ ...primaryButtonStyle, background: `linear-gradient(135deg, ${tint}, #7c5cff)` }}
            onMouseDown={() => playSound("click")}
          >
            NEW GAME
          </button>
        </div>
      ) : confirming ? (
        <div style={confirmDeleteStyle}>
          <div style={confirmTitleStyle}>Delete {slot.name}?</div>
          <div style={confirmSubStyle}>
            All progress for this slot will be lost.
          </div>
          <div style={confirmButtonRowStyle}>
            <button
              onClick={onConfirmDelete}
              style={dangerButtonStyle}
              onMouseDown={() => playSound("click")}
            >
              DELETE
            </button>
            <button
              onClick={onCancelDelete}
              style={secondaryButtonStyle}
              onMouseDown={() => playSound("click")}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <div style={slotInnerStyle}>
          <AvatarRing avatar={slot.avatar} tint={tint} />
          <div style={slotNameStyle}>{slot.name}</div>
          <RankChip totalXP={slot.totalXP} />
          <div style={slotMetaStyle}>
            <span>★ {slot.totalStars}</span>
            <span style={dotStyle}>•</span>
            <span>{slot.totalXP} XP</span>
          </div>
          <div style={slotPlayStyle}>
            Week {slot.weekUnlocked} · {formatPlayTime(slot.playSeconds)} played
          </div>
          <WeekProgressBar weekUnlocked={slot.weekUnlocked} tint={tint} />
          <div style={slotLastStyle}>{formatRelative(slot.lastPlayedAt)}</div>

          <div style={slotButtonRowStyle}>
            <button
              onClick={onContinue}
              style={{
                ...primaryButtonStyle,
                background: `linear-gradient(135deg, ${tint}, #7c5cff)`,
              }}
              onMouseDown={() => playSound("click")}
            >
              CONTINUE
            </button>
            <button
              onClick={onDelete}
              style={iconButtonStyle}
              title="Delete this save"
              onMouseDown={() => playSound("hover")}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div style={{ ...slotIdStyle, opacity: 0.4 }}>{slotId}</div>
    </div>
  );
}

function WeekProgressBar({
  weekUnlocked,
  tint,
}: {
  weekUnlocked: number;
  tint: string;
}) {
  const pct = Math.min(100, Math.round((weekUnlocked / 20) * 100));
  return (
    <div style={{ width: "100%", marginTop: 6 }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 2,
          fontWeight: 700,
          color: "rgba(232,237,255,0.5)",
          marginBottom: 4,
          display: "flex",
          justifyContent: "space-between",
          textTransform: "uppercase",
        }}
      >
        <span>CURRICULUM</span>
        <span style={{ color: tint }}>{weekUnlocked}/20</span>
      </div>
      <div
        style={{
          height: 4,
          width: "100%",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${tint}, #7c5cff)`,
            transition: "width 600ms cubic-bezier(0.16,1,0.3,1)",
            boxShadow: `0 0 8px ${tint}88`,
          }}
        />
      </div>
    </div>
  );
}

function RankChip({ totalXP }: { totalXP: number }) {
  const rank = getRank(totalXP).current;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        background: `${rank.colour}22`,
        border: `1px solid ${rank.colour}55`,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 800,
        color: rank.colour,
        textTransform: "uppercase",
      }}
    >
      <span aria-hidden>{rank.icon}</span>
      <span>{rank.name}</span>
    </div>
  );
}

function AvatarRing({
  avatar,
  tint,
}: {
  avatar: SaveSlot["avatar"];
  tint: string;
}) {
  return (
    <div
      style={{
        width: 84,
        height: 84,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${tint}55, ${tint}22 50%, rgba(15,21,48,0.8))`,
        border: `2px solid ${tint}`,
        boxShadow: `0 0 18px ${tint}55, inset 0 0 12px ${tint}33`,
        overflow: "hidden",
        position: "relative",
        marginBottom: 4,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/game/characters/${avatar}-idle.png`}
        alt={avatar}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ─────────────────────────── NEW GAME PHASE ─────────────────────────── */

function NewGamePhase({
  defaultName,
  onName,
  avatar,
  onAvatar,
  onConfirm,
  onBack,
}: {
  defaultName: string;
  onName: (n: string) => void;
  avatar: SaveSlot["avatar"];
  onAvatar: (a: SaveSlot["avatar"]) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const tint =
    AVATAR_OPTIONS.find((a) => a.id === avatar)?.tint ?? "#00e5ff";
  return (
    <div style={slotsColumnStyle}>
      <h1 style={panelTitleStyle}>CREATE HERO</h1>
      <p style={panelSubStyle}>Name your cyber hero and pick a starting avatar.</p>

      <div
        style={{
          ...slotCardStyle,
          width: 480,
          margin: "0 auto",
          padding: 28,
          alignItems: "center",
          gap: 18,
        }}
      >
        <AvatarRing avatar={avatar} tint={tint} />
        <input
          value={defaultName}
          onChange={(e) => onName(e.target.value)}
          placeholder="Hero name"
          maxLength={20}
          style={inputStyle}
        />

        <div style={avatarRowStyle}>
          {AVATAR_OPTIONS.map((opt) => {
            const selected = opt.id === avatar;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onAvatar(opt.id);
                  playSound("hover");
                }}
                style={{
                  ...avatarPillStyle,
                  borderColor: selected ? opt.tint : "rgba(255,255,255,0.12)",
                  background: selected
                    ? `${opt.tint}22`
                    : "rgba(255,255,255,0.04)",
                  color: selected ? opt.tint : "#e8edff",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onConfirm}
          style={{
            ...primaryButtonStyle,
            background: `linear-gradient(135deg, ${tint}, #7c5cff)`,
            width: "100%",
            padding: "14px 18px",
            fontSize: 14,
          }}
          onMouseDown={() => playSound("click")}
        >
          BEGIN ADVENTURE →
        </button>
      </div>

      <button onClick={onBack} style={backButtonStyle}>
        ← Back
      </button>
    </div>
  );
}

/* ─────────────────────────── BACKDROP / STARS ─────────────────────────── */

function Backdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at top, #1a1244 0%, #0a0820 40%, #04050d 100%)",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 20%, rgba(124,92,255,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,229,255,0.18), transparent 45%), radial-gradient(circle at 60% 30%, rgba(255,95,179,0.15), transparent 35%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

function StarLayer() {
  /* Deterministic star field — same on every render so it doesn't twinkle
   * randomly between phase transitions. */
  const stars = useMemo(() => {
    const out: { x: number; y: number; size: number; delay: number }[] = [];
    let seed = 1234;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 80; i++) {
      out.push({
        x: rand() * 100,
        y: rand() * 100,
        size: rand() * 2 + 1,
        delay: rand() * 4,
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-title-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-twinkle { 0%,100%{opacity:0.25;} 50%{opacity:0.85;} }
@keyframes ax-pulse { 0%,100%{opacity:0.55;letter-spacing:6px;} 50%{opacity:1;letter-spacing:8px;} }
@keyframes ax-logo-in { 0%{opacity:0;transform:translateY(20px) scale(0.96);filter:blur(8px);} 100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);} }
@keyframes ax-logo-glow { 0%,100%{text-shadow:0 0 24px rgba(0,229,255,0.5),0 0 48px rgba(124,92,255,0.4);} 50%{text-shadow:0 0 32px rgba(0,229,255,0.7),0 0 64px rgba(255,95,179,0.5);} }
@keyframes ax-underline { 0%{width:0;opacity:0;} 100%{width:100%;opacity:1;} }
@keyframes ax-tag-in { 0%{opacity:0;transform:translateY(8px);} 100%{opacity:0.8;transform:translateY(0);} }
`;
    document.head.appendChild(el);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.5,
            animation: `ax-twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const containerStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  /* Translucent — IdleWorldLayer below shows through. */
  background:
    "radial-gradient(ellipse at center, rgba(15,21,48,0.6) 0%, rgba(4,5,13,0.92) 70%)",
  color: "#e8edff",
  fontFamily: "system-ui, -apple-system, sans-serif",
  overflow: "hidden",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const contentStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 1100,
  padding: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const bootColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 32,
  textAlign: "center",
};

const logoWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  animation: "ax-logo-in 1.2s cubic-bezier(0.16,1,0.3,1) both",
};

const logoLineStyle: CSSProperties = {
  fontSize: "clamp(48px, 9vw, 96px)",
  fontWeight: 900,
  letterSpacing: 6,
  background:
    "linear-gradient(135deg, #00e5ff 0%, #7c5cff 50%, #ff5fb3 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "ax-logo-glow 4s ease-in-out infinite",
  lineHeight: 1,
};

const logoSubStyle: CSSProperties = {
  marginTop: 8,
  fontSize: "clamp(12px, 1.4vw, 16px)",
  letterSpacing: 8,
  color: "#7df0ff",
  fontWeight: 600,
};

const logoUnderlineStyle: CSSProperties = {
  height: 2,
  width: "100%",
  background:
    "linear-gradient(90deg, transparent, #00e5ff 20%, #7c5cff 50%, #ff5fb3 80%, transparent)",
  marginTop: 16,
  animation: "ax-underline 1.6s 0.4s ease-out both",
};

const pressStartStyle: CSSProperties = {
  fontSize: 14,
  letterSpacing: 6,
  fontWeight: 700,
  color: "#7df0ff",
  animation: "ax-pulse 1.6s ease-in-out infinite, ax-tag-in 0.8s 0.8s both",
};

const tagStyle: CSSProperties = {
  fontSize: 13,
  color: "rgba(232,237,255,0.6)",
  letterSpacing: 1,
  animation: "ax-tag-in 0.9s 1.2s both",
};

const slotsColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  width: "100%",
  animation: "ax-logo-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
};

const panelTitleStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: 4,
  margin: 0,
  background:
    "linear-gradient(135deg, #00e5ff 0%, #7c5cff 60%, #ff5fb3 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const panelSubStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 13,
  color: "rgba(232,237,255,0.65)",
};

const quickResumeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  width: "min(720px, 92vw)",
  padding: "12px 18px",
  background:
    "linear-gradient(90deg, rgba(0,229,255,0.1), rgba(124,92,255,0.06) 50%, rgba(255,95,179,0.08))",
  border: "1px solid rgba(0,229,255,0.32)",
  borderRadius: 14,
  color: "#e8edff",
  cursor: "pointer",
  boxShadow: "0 6px 22px rgba(0,229,255,0.18)",
  transition: "transform 200ms ease, box-shadow 200ms ease",
};

const quickResumeKickerStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: 3,
  fontWeight: 800,
  color: "#7df0ff",
  textTransform: "uppercase",
};

const quickResumeNameStyle: CSSProperties = {
  flex: 1,
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: 1,
};

const quickResumeMetaStyle: CSSProperties = {
  fontSize: 12,
  color: "rgba(232,237,255,0.7)",
  fontFamily: "monospace",
};

const quickResumeArrowStyle: CSSProperties = {
  fontSize: 22,
  color: "#00e5ff",
  fontWeight: 800,
};

const slotsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 16,
  width: "100%",
  maxWidth: 960,
};

const slotCardStyle: CSSProperties = {
  position: "relative",
  background: "rgba(15,21,48,0.7)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 22,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  transition:
    "transform 240ms cubic-bezier(0.16,1,0.3,1), box-shadow 240ms ease, border-color 240ms ease",
  willChange: "transform, box-shadow",
  minHeight: 280,
};

const slotIndexStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 2,
  textTransform: "uppercase",
};

const slotInnerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  flex: 1,
};

const emptySlotInnerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 18,
  flex: 1,
};

const emptySlotPlusStyle: CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  border: "2px dashed rgba(255,255,255,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 36,
  color: "rgba(255,255,255,0.45)",
  fontWeight: 300,
};

const emptySlotLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: 4,
  color: "rgba(232,237,255,0.45)",
  fontWeight: 700,
};

const slotNameStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 1,
  marginTop: 4,
};

const slotMetaStyle: CSSProperties = {
  fontSize: 12,
  color: "rgba(232,237,255,0.7)",
  letterSpacing: 1,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const dotStyle: CSSProperties = {
  opacity: 0.5,
};

const slotPlayStyle: CSSProperties = {
  fontSize: 11,
  color: "rgba(232,237,255,0.55)",
  letterSpacing: 1,
};

const slotLastStyle: CSSProperties = {
  fontSize: 11,
  color: "rgba(125,240,255,0.7)",
  fontStyle: "italic",
};

const slotButtonRowStyle: CSSProperties = {
  marginTop: "auto",
  display: "flex",
  gap: 8,
  width: "100%",
  paddingTop: 12,
};

const slotIdStyle: CSSProperties = {
  position: "absolute",
  top: 8,
  right: 12,
  fontSize: 10,
  letterSpacing: 1,
  color: "rgba(232,237,255,0.4)",
  fontFamily: "monospace",
};

const primaryButtonStyle: CSSProperties = {
  flex: 1,
  border: "none",
  borderRadius: 999,
  padding: "10px 14px",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 2,
  color: "#04050d",
  cursor: "pointer",
  textTransform: "uppercase",
  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
};

const secondaryButtonStyle: CSSProperties = {
  flex: 1,
  background: "transparent",
  color: "#e8edff",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 999,
  padding: "10px 14px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 2,
  cursor: "pointer",
  textTransform: "uppercase",
};

const dangerButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  borderColor: "#ff5fb3",
  color: "#ff5fb3",
};

const iconButtonStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(232,237,255,0.6)",
  cursor: "pointer",
  fontSize: 14,
};

const backButtonStyle: CSSProperties = {
  marginTop: 12,
  background: "transparent",
  color: "rgba(232,237,255,0.7)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 999,
  padding: "8px 16px",
  fontSize: 12,
  letterSpacing: 2,
  cursor: "pointer",
  fontWeight: 700,
  textTransform: "uppercase",
};

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  color: "#e8edff",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
  fontWeight: 700,
  textAlign: "center",
  letterSpacing: 1,
  outline: "none",
};

const avatarRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  width: "100%",
  justifyContent: "center",
};

const avatarPillStyle: CSSProperties = {
  flex: 1,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 2,
  color: "#e8edff",
  cursor: "pointer",
  textTransform: "uppercase",
};

const confirmDeleteStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  flex: 1,
};

const confirmTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#ff5fb3",
  textAlign: "center",
};

const confirmSubStyle: CSSProperties = {
  fontSize: 12,
  color: "rgba(232,237,255,0.6)",
  textAlign: "center",
};

const confirmButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  width: "100%",
  marginTop: 8,
};
