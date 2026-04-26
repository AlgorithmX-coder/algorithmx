"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import { PixarFinishOverlay } from "@/app/components/scene";

export interface SpamEmail {
  sender: string;
  subject: string;
  isPhishing: boolean;
  clue: string;
}

export interface SpamBlasterProps {
  emails?: SpamEmail[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_EMAILS: SpamEmail[] = [
  { sender: "Prize Central", subject: "YOU WON A FREE iPHONE!", isPhishing: true, clue: "Too good to be true" },
  { sender: "Security Team", subject: "URGENT: Enter your password NOW!", isPhishing: true, clue: "Real banks never ask for passwords" },
  { sender: "Sam", subject: "Funny video from school!", isPhishing: false, clue: "" },
  { sender: "V-Bucks Giveaway", subject: "FREE 10,000 V-BUCKS! Click here!", isPhishing: true, clue: "Free offers are usually scams" },
  { sender: "School Admin", subject: "Reminder: PE kit tomorrow", isPhishing: false, clue: "" },
  { sender: "Your School", subject: "Your school needs your password", isPhishing: true, clue: "Schools never ask for passwords by email" },
  { sender: "Mrs Johnson", subject: "Homework reminder for Monday", isPhishing: false, clue: "" },
  { sender: "Lucky Visitor", subject: "CONGRATULATIONS! You are our 1,000,000th visitor!", isPhishing: true, clue: "No website tracks visitors this way" },
  { sender: "Grandma", subject: "Happy birthday next week!", isPhishing: false, clue: "" },
  { sender: "Account Security", subject: "Verify your account or it will be DELETED", isPhishing: true, clue: "Scare tactics = phishing" },
];

const CANVAS_W = 720;
const CANVAS_H = 500;
const EMAIL_W = 180;
const EMAIL_H = 60;
const MONITOR_X = CANVAS_W / 2;
const MONITOR_Y = CANVAS_H - 95;
const MONITOR_W = 200;
const MONITOR_H = 140;

interface LiveEmail {
  idx: number;
  sender: string;
  subject: string;
  isPhishing: boolean;
  clue: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  alive: boolean;
  resolved: boolean;
  // Shrink phase when entering the monitor (safe success)
  enteringMonitor: boolean;
  scale: number;
}

interface Fragment {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  life: number;
  colour: string;
  size: number;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  colour: string;
  bornAt: number;
  duration: number;
}

interface ClueBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  bornAt: number;
}

function speedForIndex(i: number) {
  // First email flies slower than base — a learning lap after the intro.
  if (i === 0) return 0.75;
  if (i < 4) return 1;
  if (i < 7) return 1.4;
  return 1.8;
}

function maxParallel(i: number) {
  if (i < 4) return 1;
  if (i < 7) return 2;
  return 3;
}

export default function SpamBlaster({
  emails,
  onComplete,
  onCorrect,
  onWrong,
}: SpamBlasterProps) {
  const list = useMemo(() => emails ?? DEFAULT_EMAILS, [emails]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const state = useRef({
    spawnedIdx: 0,
    nextSpawnAt: 0,
    live: [] as LiveEmail[],
    fragments: [] as Fragment[],
    floaters: [] as Floater[],
    clues: [] as ClueBubble[],
    bullets: [] as {
      id: number;
      sx: number; sy: number;
      tx: number; ty: number;
      bornAt: number;
      duration: number;
      colour: string;
      kind: "phishing" | "safe";
    }[],
    bulletId: 0,
    fragmentId: 0,
    floaterId: 0,
    clueId: 0,
    zapped: 0,
    totalPhishing: 0,
    inbox: 0,
    totalSafe: 0,
    viruses: 0,
    streak: 0,
    bestStreak: 0,
    monitorFlashColour: null as string | null,
    monitorFlashUntil: 0,
    monitorShakeUntil: 0,
    finished: false,
    // Crosshair tracking — follows mouse position over canvas so the
    // kid feels they're actively aiming. Null when cursor is off-canvas.
    cursorX: null as number | null,
    cursorY: null as number | null,
  });

  const [render, setRender] = useState(0);

  useEffect(() => {
    const s = state.current;
    s.totalPhishing = list.filter((e) => e.isPhishing).length;
    s.totalSafe = list.length - s.totalPhishing;
  }, [list]);

  // Track mouse position for the aiming crosshair
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    state.current.cursorX = (e.clientX - rect.left) * scale;
    state.current.cursorY = (e.clientY - rect.top) * scale;
  };
  const onPointerLeave = () => {
    state.current.cursorX = null;
    state.current.cursorY = null;
  };

  // Hit test on canvas pointer
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    // find front-most live email under point
    const s = state.current;
    const hit = [...s.live]
      .reverse()
      .find(
        (em) =>
          !em.resolved &&
          em.alive &&
          Math.abs(x - em.x) < (EMAIL_W / 2) * em.scale &&
          Math.abs(y - em.y) < (EMAIL_H / 2) * em.scale
      );
    if (!hit) return;

    // Fire a visible laser bullet from the monitor (the user's "device")
    // up at the email. The actual zap/nudge logic runs after the bullet
    // travels for ~140ms so the visual feedback feels causal.
    const now = performance.now();
    const phishing = hit.isPhishing;
    state.current.bullets.push({
      id: ++state.current.bulletId,
      sx: MONITOR_X,
      sy: MONITOR_Y - MONITOR_H / 2,
      tx: hit.x,
      ty: hit.y,
      bornAt: now,
      duration: 140,
      colour: phishing ? "#00e5ff" : "#00e5ff",
      kind: phishing ? "phishing" : "safe",
    });
    playSound("click");
    window.setTimeout(() => {
      if (phishing) zapPhishing(hit);
      else nudgeSafe(hit);
    }, 140);
  };

  const spawnFragments = (em: LiveEmail, colour: string, count: number) => {
    const s = state.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      s.fragments.push({
        id: ++s.fragmentId,
        x: em.x,
        y: em.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        life: 700,
        colour,
        size: 6 + Math.random() * 8,
      });
    }
  };

  const addFloater = (text: string, x: number, y: number, colour: string, duration = 900) => {
    const s = state.current;
    s.floaters.push({
      id: ++s.floaterId,
      x,
      y,
      text,
      colour,
      bornAt: performance.now(),
      duration,
    });
  };

  const addClue = (text: string, x: number, y: number) => {
    const s = state.current;
    s.clues.push({
      id: ++s.clueId,
      x,
      y,
      text: `Clue: ${text}`,
      bornAt: performance.now(),
    });
  };

  const zapPhishing = (em: LiveEmail) => {
    const s = state.current;
    if (em.resolved) return;
    em.resolved = true;
    em.alive = false;
    spawnFragments(em, "#ef4444", 10 + Math.floor(Math.random() * 4));
    addFloater("ZAP!", em.x, em.y, "#f87171", 800);
    if (em.clue) addClue(em.clue, em.x, em.y - 40);
    s.zapped += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    playSound("correct");
    onCorrect?.();
  };

  const nudgeSafe = (em: LiveEmail) => {
    addFloater("OOPS! That was a real email!", em.x, em.y - 30, "#f97316", 1100);
    playSound("wrong");
    state.current.streak = 0;
    onWrong?.();
    // wobble
    em.vx += (Math.random() - 0.5) * 2;
  };

  const pinPhishingHit = (em: LiveEmail) => {
    const s = state.current;
    em.resolved = true;
    em.alive = false;
    s.viruses += 1;
    s.streak = 0;
    s.monitorFlashColour = "#ef4444";
    s.monitorFlashUntil = performance.now() + 380;
    s.monitorShakeUntil = performance.now() + 380;
    addFloater("HACKED!", MONITOR_X, MONITOR_Y - MONITOR_H / 2 - 20, "#ef4444", 1200);
    playSound("wrong");
    onWrong?.();
  };

  const safeDelivered = (em: LiveEmail) => {
    const s = state.current;
    em.resolved = true;
    em.alive = false;
    s.inbox += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    s.monitorFlashColour = "#7eff97";
    s.monitorFlashUntil = performance.now() + 280;
    playSound("pop");
    onCorrect?.();
  };

  const resetExercise = () => {
    state.current = {
      spawnedIdx: 0,
      nextSpawnAt: 0,
      live: [],
      fragments: [],
      floaters: [],
      clues: [],
      bullets: [],
      bulletId: 0,
      fragmentId: 0,
      floaterId: 0,
      clueId: 0,
      zapped: 0,
      totalPhishing: list.filter((e) => e.isPhishing).length,
      inbox: 0,
      totalSafe: list.length - list.filter((e) => e.isPhishing).length,
      viruses: 0,
      streak: 0,
      bestStreak: 0,
      monitorFlashColour: null,
      monitorFlashUntil: 0,
      monitorShakeUntil: 0,
      finished: false,
      cursorX: null,
      cursorY: null,
    };
    setShowIntro(true);
    setResetKey((k) => k + 1);
    setRender((n) => n + 1);
  };

  useEffect(() => {
    if (showIntro) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    let running = true;
    let lastTime = performance.now();
    // Longer lead-in after the intro dismisses — 2 s grace before first email.
    state.current.nextSpawnAt = performance.now() + 2000;

    const trySpawn = (now: number) => {
      const s = state.current;
      if (s.spawnedIdx >= list.length) return;
      const aliveCount = s.live.filter((e) => e.alive && !e.resolved).length;
      if (aliveCount >= maxParallel(s.spawnedIdx)) return;
      if (now < s.nextSpawnAt) return;
      const em = list[s.spawnedIdx];
      // random edge spawn
      const edge = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (edge === 0) {
        x = -EMAIL_W;
        y = 60 + Math.random() * (CANVAS_H - 220);
      } else if (edge === 1) {
        x = CANVAS_W + EMAIL_W;
        y = 60 + Math.random() * (CANVAS_H - 220);
      } else if (edge === 2) {
        x = 60 + Math.random() * (CANVAS_W - 120);
        y = -EMAIL_H;
      } else {
        x = 60 + Math.random() * (CANVAS_W - 120);
        y = -EMAIL_H - 40;
      }
      const dx = MONITOR_X - x;
      const dy = MONITOR_Y - MONITOR_H / 2 - y;
      const len = Math.max(1, Math.hypot(dx, dy));
      const speed = speedForIndex(s.spawnedIdx);
      s.live.push({
        idx: s.spawnedIdx,
        sender: em.sender,
        subject: em.subject,
        isPhishing: em.isPhishing,
        clue: em.clue,
        x,
        y,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        speed,
        alive: true,
        resolved: false,
        enteringMonitor: false,
        scale: 1,
      });
      s.spawnedIdx += 1;
      s.nextSpawnAt = now + 2500;
    };

    const drawMonitor = (now: number) => {
      const s = state.current;
      const flashing = s.monitorFlashColour && now < s.monitorFlashUntil;
      const shakeAmt =
        now < s.monitorShakeUntil ? (Math.random() - 0.5) * 6 : 0;
      const mx = MONITOR_X + shakeAmt;
      const my = MONITOR_Y + (now < s.monitorShakeUntil ? (Math.random() - 0.5) * 4 : 0);
      const sx = mx - MONITOR_W / 2 + 10;
      const sy = my - MONITOR_H / 2 + 10;
      const sw = MONITOR_W - 20;
      const sh = MONITOR_H - 20;

      // frame
      const frameColour = flashing ? s.monitorFlashColour! : "#3a1a3e";
      ctx.fillStyle = "#0f1530";
      roundRect(ctx, mx - MONITOR_W / 2, my - MONITOR_H / 2, MONITOR_W, MONITOR_H, 14);
      ctx.fill();
      ctx.strokeStyle = frameColour;
      ctx.lineWidth = 4;
      roundRect(ctx, mx - MONITOR_W / 2, my - MONITOR_H / 2, MONITOR_W, MONITOR_H, 14);
      ctx.stroke();

      // screen background
      const screenGrad = ctx.createLinearGradient(0, my - MONITOR_H / 2, 0, my + MONITOR_H / 2);
      screenGrad.addColorStop(0, "rgba(20,30,80,0.95)");
      screenGrad.addColorStop(1, "rgba(8,12,24,0.98)");
      ctx.fillStyle = screenGrad;
      roundRect(ctx, sx, sy, sw, sh, 8);
      ctx.fill();

      // Clip subsequent drawing to inside the screen so the AlgorithmX
      // mock-app can't bleed past the bezel.
      ctx.save();
      roundRect(ctx, sx, sy, sw, sh, 8);
      ctx.clip();

      // App title bar
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.fillRect(sx, sy, sw, 18);
      // Traffic-light dots
      ["#ef4444", "#fbbf24", "#7eff97"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(sx + 8 + i * 7, sy + 9, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      // Brand mark "AX" badge
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 9px 'Space Grotesk', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("◆ AlgorithmX Mail", sx + 32, sy + 9);
      // Status dot (live)
      ctx.fillStyle = "#7eff97";
      ctx.beginPath();
      ctx.arc(sx + sw - 8, sy + 9, 2, 0, Math.PI * 2);
      ctx.fill();

      // Inbox header (inside app)
      ctx.fillStyle = "rgba(160,106,255,0.18)";
      ctx.fillRect(sx, sy + 18, sw, 16);
      ctx.fillStyle = "#7c5cff";
      ctx.font = "900 9px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText("▸ INBOX", sx + 8, sy + 26);
      ctx.fillStyle = "#a0ffb0";
      ctx.textAlign = "right";
      ctx.fillText(`${s.inbox}/${s.totalSafe}`, sx + sw - 8, sy + 26);

      // Recent message rows (one per email already in inbox, max 3)
      const rowH = 14;
      for (let i = 0; i < Math.min(s.inbox, 3); i++) {
        const ry = sy + 38 + i * rowH;
        // Row background
        ctx.fillStyle = i === 0 ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.03)";
        ctx.fillRect(sx + 4, ry, sw - 8, rowH - 2);
        // Avatar dot
        const dotC = ["#00e5ff", "#7c5cff", "#fbbf24"][i % 3];
        ctx.fillStyle = dotC;
        ctx.beginPath();
        ctx.arc(sx + 12, ry + (rowH - 2) / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Sender stripe
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(sx + 20, ry + 3, sw * 0.45, 2);
        // Subject stripe
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(sx + 20, ry + 7, sw * 0.6, 1.5);
      }
      // Empty-state placeholders
      for (let i = s.inbox; i < 3; i++) {
        const ry = sy + 38 + i * rowH;
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(sx + 4, ry, sw - 8, rowH - 2);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(sx + 4, ry, sw - 8, rowH - 2);
        ctx.setLineDash([]);
      }

      // Footer status bar
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.fillRect(sx, sy + sh - 14, sw, 14);
      ctx.fillStyle = s.viruses > 0 ? "#ef4444" : "#7eff97";
      ctx.beginPath();
      ctx.arc(sx + 8, sy + sh - 7, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = s.viruses > 0 ? "#fca5a5" : "#a0ffb0";
      ctx.font = "700 8px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        s.viruses > 0 ? `${s.viruses} VIRUS${s.viruses > 1 ? "ES" : ""} DETECTED` : "ALL CLEAR",
        sx + 14, sy + sh - 7
      );
      ctx.textAlign = "right";
      ctx.fillStyle = "#7c5cff";
      ctx.fillText(`STREAK ${s.streak}`, sx + sw - 6, sy + sh - 7);

      // Subtle scanlines on top of everything
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      for (let yL = 0; yL < sh; yL += 3) {
        ctx.fillRect(sx, sy + yL, sw, 1);
      }

      ctx.restore();

      // Glow ring if flashing
      if (flashing) {
        ctx.shadowColor = s.monitorFlashColour!;
        ctx.shadowBlur = 28;
        roundRect(ctx, mx - MONITOR_W / 2, my - MONITOR_H / 2, MONITOR_W, MONITOR_H, 14);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // base
      ctx.fillStyle = "#3a1a3e";
      ctx.fillRect(mx - 40, my + MONITOR_H / 2, 80, 12);
      ctx.fillRect(mx - 70, my + MONITOR_H / 2 + 12, 140, 8);

      // External inbox label above the monitor
      ctx.fillStyle = "#93c5fd";
      ctx.font = "900 13px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        `INBOX ${s.inbox}/${s.totalSafe}`,
        MONITOR_X,
        MONITOR_Y - MONITOR_H / 2 - 8
      );
    };

    const drawEmail = (em: LiveEmail) => {
      ctx.save();
      ctx.translate(em.x, em.y);
      ctx.scale(em.scale, em.scale);
      // tint
      const tint = em.isPhishing ? "rgba(239,68,68,0.08)" : "rgba(168,227,187,0.08)";
      // body
      ctx.fillStyle = "#0b1222";
      roundRect(ctx, -EMAIL_W / 2, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.fill();
      ctx.fillStyle = tint;
      roundRect(ctx, -EMAIL_W / 2, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(148,163,184,0.5)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, -EMAIL_W / 2, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.stroke();
      // envelope icon
      ctx.save();
      ctx.translate(-EMAIL_W / 2 + 22, 0);
      ctx.strokeStyle = "rgba(125,240,255,0.55)";
      ctx.lineWidth = 2;
      roundRect(ctx, -14, -10, 28, 20, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, -10);
      ctx.lineTo(0, 4);
      ctx.lineTo(14, -10);
      ctx.stroke();
      ctx.restore();
      // text
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "700 13px 'Space Grotesk', sans-serif";
      const sender = em.sender.length > 20 ? em.sender.slice(0, 18) + "…" : em.sender;
      ctx.fillText(sender, -EMAIL_W / 2 + 44, -10);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "500 11px 'Space Grotesk', sans-serif";
      const subj = em.subject.length > 24 ? em.subject.slice(0, 22) + "…" : em.subject;
      ctx.fillText(subj, -EMAIL_W / 2 + 44, 10);
      ctx.restore();
    };

    const checkFinished = () => {
      const s = state.current;
      if (s.finished) return;
      if (s.spawnedIdx >= list.length && s.live.every((e) => !e.alive)) {
        s.finished = true;
        void correctAnswerBurst();
        setRender((n) => n + 1);
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const frames = dt / (1000 / 60);
      const s = state.current;

      trySpawn(now);

      for (const em of s.live) {
        if (!em.alive) continue;
        if (em.resolved) continue;
        em.x += em.vx * frames;
        em.y += em.vy * frames;

        // Check if reached monitor
        const dx = em.x - MONITOR_X;
        const dy = em.y - (MONITOR_Y - MONITOR_H / 4);
        if (Math.abs(dx) < MONITOR_W / 2 - 10 && Math.abs(dy) < MONITOR_H / 2 - 10) {
          if (em.isPhishing) {
            pinPhishingHit(em);
          } else {
            em.enteringMonitor = true;
            safeDelivered(em);
          }
        }
      }

      // entering-monitor shrink (after resolved safe)
      for (const em of s.live) {
        if (em.enteringMonitor && em.resolved) {
          em.scale *= Math.pow(0.86, frames);
          if (em.scale < 0.05) em.alive = false;
        }
      }

      // fragments
      s.fragments = s.fragments
        .map((f) => ({
          ...f,
          x: f.x + f.vx * frames,
          y: f.y + f.vy * frames,
          vy: f.vy + 0.3 * frames,
          rot: f.rot + f.rotSpeed * frames,
          life: f.life - dt,
        }))
        .filter((f) => f.life > 0);

      // floaters + clues + bullets
      s.floaters = s.floaters.filter((f) => now - f.bornAt < f.duration);
      s.clues = s.clues.filter((c) => now - c.bornAt < 1500);
      s.bullets = s.bullets.filter((b) => now - b.bornAt < b.duration);

      // ── DRAW ──
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      // Cyber-arcade background: radial nebula + drifting binary rain +
      // pulsing scan ring around the monitor + perspective floor grid.
      const bgGrad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H * 0.7, 0, CANVAS_W / 2, CANVAS_H * 0.7, Math.max(CANVAS_W, CANVAS_H));
      bgGrad.addColorStop(0, "#1a2147");
      bgGrad.addColorStop(0.45, "#0f1530");
      bgGrad.addColorStop(1, "#080a16");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Drifting warm "spam stream" digits
      ctx.font = "700 14px ui-monospace, 'JetBrains Mono', Menlo, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      for (let i = 0; i < 26; i++) {
        const baseX = (i * 41) % CANVAS_W;
        const speed = 30 + (i % 5) * 12;
        const y = ((now / 18) * speed / 60 + i * 73) % (CANVAS_H + 30) - 30;
        const alpha = 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(now * 0.002 + i));
        ctx.fillStyle = `rgba(124, 92, 255, ${alpha * 0.5})`;
        ctx.fillText(((i * 73 + Math.floor(now / 240)) & 1).toString(), baseX, y);
      }

      // Perspective floor grid lines drawing toward the monitor — warm
      ctx.strokeStyle = "rgba(124, 92, 255, 0.22)";
      ctx.lineWidth = 1;
      const horizonY = CANVAS_H * 0.55;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(CANVAS_W / 2, horizonY);
        ctx.lineTo(CANVAS_W / 2 + i * 80, CANVAS_H + 8);
        ctx.stroke();
      }
      // Horizontal floor lines (perspective) — warm
      const driftPhase = (now / 30) % 36;
      for (let i = 0; i < 8; i++) {
        const t = (i + driftPhase / 36) / 8;
        const yLine = horizonY + t * t * (CANVAS_H - horizonY);
        const alpha = 0.2 - i * 0.015;
        ctx.strokeStyle = `rgba(124, 92, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, yLine);
        ctx.lineTo(CANVAS_W, yLine);
        ctx.stroke();
      }

      // Pulsing warm scan rings around the monitor (highlights the "danger zone")
      const ringPhase = (now / 1800) % 1;
      for (let k = 0; k < 2; k++) {
        const phase = (ringPhase + k * 0.5) % 1;
        const radius = 30 + phase * 200;
        ctx.strokeStyle = `rgba(124, 92, 255, ${0.5 * (1 - phase)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(MONITOR_X, MONITOR_Y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Subtle scanlines (lighter than before, kept for retro-terminal feel)
      ctx.strokeStyle = "rgba(124, 92, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let y = 0; y < CANVAS_H; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      drawMonitor(now);

      // draw emails
      for (const em of s.live) {
        if (em.alive) drawEmail(em);
      }

      // fragments
      for (const f of s.fragments) {
        const alpha = Math.max(0, f.life / 700);
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.fillStyle = f.colour;
        ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // bullets — laser/zap projectiles fired from the monitor toward
      // the email the user clicked. The whole shot animates over its
      // `duration`, drawing both the in-flight head and a fading tail
      // along the path.
      for (const b of s.bullets) {
        const t = Math.min(1, (now - b.bornAt) / b.duration);
        const hx = b.sx + (b.tx - b.sx) * t;
        const hy = b.sy + (b.ty - b.sy) * t;
        // Trail
        ctx.save();
        ctx.strokeStyle = b.colour;
        ctx.lineCap = "round";
        ctx.shadowColor = b.colour;
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sy);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        // Bright core
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.95;
        const tailX = b.sx + (b.tx - b.sx) * Math.max(0, t - 0.35);
        const tailY = b.sy + (b.ty - b.sy) * Math.max(0, t - 0.35);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        // Glowing head
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = b.colour;
        ctx.beginPath();
        ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // floaters
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / f.duration);
        const dy = -age * 0.06;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.font = "900 19px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      // clue bubbles
      for (const c of s.clues) {
        const age = now - c.bornAt;
        const alpha = Math.max(0, 1 - age / 1500);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(15,23,42,0.9)";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.font = "700 12px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const w = ctx.measureText(c.text).width + 24;
        roundRect(ctx, c.x - w / 2, c.y - 14, w, 28, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fde68a";
        ctx.fillText(c.text, c.x, c.y);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = "800 13px 'Space Grotesk', sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText(`ZAPPED ${s.zapped}/${s.totalPhishing}`, 14, 12);
      ctx.textAlign = "right";
      ctx.fillStyle = "#a0ffb0";
      ctx.fillText(`INBOX ${s.inbox}/${s.totalSafe}`, CANVAS_W - 14, 12);
      ctx.textAlign = "center";
      ctx.fillStyle = s.viruses > 0 ? "#ef4444" : "#4b5563";
      ctx.fillText(`VIRUSES ${s.viruses}`, CANVAS_W / 2, 12);
      if (s.streak >= 3) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`STREAK x${s.streak}`, CANVAS_W / 2, 30);
      }

      // CROSSHAIR / AIMING RETICULE — follows mouse position so the kid
      // feels they're operating a turret. Cyan ring + cross-hair
      // arms + faint guideline back to the firing monitor at the
      // bottom (only drawn when cursor is over a virus to avoid
      // visual noise on idle hover).
      if (s.cursorX !== null && s.cursorY !== null && !s.finished) {
        const cx = s.cursorX;
        const cy = s.cursorY;
        const overTarget = s.live.some(
          (em) =>
            em.alive &&
            !em.resolved &&
            Math.abs(cx - em.x) < (EMAIL_W / 2) * em.scale &&
            Math.abs(cy - em.y) < (EMAIL_H / 2) * em.scale &&
            em.isPhishing
        );
        ctx.save();
        // Outer ring
        ctx.strokeStyle = overTarget ? "#ff5577" : "#00e5ff";
        ctx.lineWidth = 1.6;
        ctx.shadowColor = overTarget ? "#ff5577" : "#00e5ff";
        ctx.shadowBlur = overTarget ? 16 : 10;
        ctx.beginPath();
        ctx.arc(cx, cy, overTarget ? 22 : 18, 0, Math.PI * 2);
        ctx.stroke();
        // Inner dot
        ctx.fillStyle = overTarget ? "#ff5577" : "#00e5ff";
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
        // Cross-hair arms (4 short lines)
        ctx.beginPath();
        const arm = overTarget ? 14 : 10;
        const gap = 6;
        ctx.moveTo(cx - arm - gap, cy); ctx.lineTo(cx - gap, cy);
        ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + arm + gap, cy);
        ctx.moveTo(cx, cy - arm - gap); ctx.lineTo(cx, cy - gap);
        ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + arm + gap);
        ctx.stroke();
        // When over a virus, draw a guideline from the firing
        // monitor at the bottom up to the crosshair so the kid sees
        // the firing path before they tap.
        if (overTarget) {
          ctx.strokeStyle = "rgba(255, 80, 100, 0.45)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(MONITOR_X, MONITOR_Y - MONITOR_H / 2);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // Big glowing instruction prompt at the top — the user wanted
      // this to make the goal unmissable. Pulses softly, RGB-split
      // chromatic shimmer (cyan + neon-pink) for the holographic feel.
      const promptPulse = 0.7 + 0.3 * Math.sin(now / 380);
      ctx.save();
      ctx.font = "900 22px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const promptY = 56;
      const promptX = CANVAS_W / 2;
      // Cyan ghost behind the text
      ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 18 * promptPulse;
      ctx.fillText("⚡ ZAP THE VIRUS EMAILS! ⚡", promptX - 1.5, promptY);
      // Neon-pink ghost on the other side
      ctx.fillStyle = "rgba(255, 95, 179, 0.5)";
      ctx.shadowColor = "#ff5fb3";
      ctx.shadowBlur = 18 * promptPulse;
      ctx.fillText("⚡ ZAP THE VIRUS EMAILS! ⚡", promptX + 1.5, promptY);
      // Bright white core
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e8edff";
      ctx.fillText("⚡ ZAP THE VIRUS EMAILS! ⚡", promptX, promptY);
      ctx.restore();

      checkFinished();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, showIntro, resetKey]);

  const s = state.current;
  const total = list.length;
  const stars = s.viruses === 0 ? 3 : s.viruses === 1 ? 2 : 1;
  const accuracy = total > 0 ? Math.round(((s.zapped + s.inbox) / total) * 100) : 0;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        touchAction: "none",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          cursor: "crosshair",
        }}
        aria-label="Spam Blaster game"
      />
      {s.finished && (
        <PixarFinishOverlay
          title="DEFENCE COMPLETE!"
          accuracy={accuracy}
          subline={`Zapped ${s.zapped}/${s.totalPhishing} · Delivered ${s.inbox}/${s.totalSafe} · Viruses ${s.viruses}`}
          stars={stars}
          onContinue={() => {
            playSound("click");
            onComplete(s.zapped + s.inbox);
          }}
          onRetry={() => {
            playSound("select");
            resetExercise();
          }}
        />
      )}
      {showIntro && (
        <ExerciseIntro
          title="Spam Blaster!"
          description="Emails are flying toward your computer! ZAP the phishing emails but let the real ones through!"
          icon="📧"
          controls="Click on phishing emails to zap them"
          onStart={() => setShowIntro(false)}
        />
      )}
      {/* `render` is read so state-bumps trigger re-render for the finish overlay */}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

