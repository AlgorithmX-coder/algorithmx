"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import BrandCube from "@/app/components/BrandCube";
import { AX } from "./content";

/* The hologram laptop as a full machine.
 *
 * Owner (2026-11-21): the first hologram concept is the style they want, but
 * "positioned like a full laptop, angled like the old one, and opening like
 * the old one". So this is the old hero's rig (same 620 x 430 body, hinge on
 * the far edge, lid 0 to 110 degrees, camera 62 to 48 degrees with a 17
 * degree yaw, perspective 1900) wearing the hologram concept's materials:
 * a frosted glass deck with a keyboard of light and a caustic pool, a thin
 * glass lid with a lit front edge and the brand cube etched on top, and the
 * dark holographic ALGORITHMX_OS pane inside. One number drives it, 0 shut
 * to 1 open and lit, on the same beats the old machine used so it reads as
 * a real laptop opening. */

const smoothstep = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const KEY_ROWS = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "enter"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "ctrl", "alt", "⌘", "", "⌘", "alt", "←", "↑", "→"],
];
const KEY_HUES = ["#00e5ff", "#00e5ff", "#7c5cff", "#ff2bd6", "#ff7a9f", "#ffd27a", "#5fffa3"];

export default function HoloMachine({ drive }: { drive: MotionValue<number> }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { const mq = window.matchMedia("(prefers-reduced-motion: reduce)"); const apply = () => setReducedMotion(mq.matches); apply(); mq.addEventListener("change", apply); return () => mq.removeEventListener("change", apply); }, []);

  const shortness = useMotionValue(0);
  useEffect(() => { const apply = () => shortness.set(Math.max(0, Math.min(1, (900 - window.innerHeight) / 250))); apply(); window.addEventListener("resize", apply); return () => window.removeEventListener("resize", apply); }, [shortness]);

  const progress = useTransform(drive, (v) => (reducedMotion ? 1 : v));
  /* the old machine's beats */
  const lidAngle = useTransform(progress, (p) => 110 * smoothstep(0.06, 0.48, p));
  const sceneRotX = useTransform(progress, (p) => 62 - 14 * smoothstep(0, 0.55, p));
  const sceneScale = useTransform([progress, shortness] as const, ([p, s]: number[]) => (0.87 + 0.12 * smoothstep(0, 0.6, p)) * (1 - 0.14 * s));
  const sceneY = useTransform([progress, shortness] as const, ([p, s]: number[]) => 79 + 22 * smoothstep(0, 0.6, p) + 110 * s);
  const screenT = useTransform(progress, (p) => smoothstep(0.4, 0.56, p));
  const dormant = useTransform(progress, (p) => 1 - smoothstep(0.4, 0.52, p));
  const kbGlow = useTransform(progress, (p) => smoothstep(0.5, 0.64, p));
  const poolGlow = useTransform(progress, (p) => 0.35 + 0.65 * smoothstep(0.38, 0.6, p));
  const ledOpacity = useTransform(progress, (p) => 1 - smoothstep(0.35, 0.5, p));
  const sweepX = useTransform(progress, (p) => `${-160 + 330 * smoothstep(0.08, 0.44, p)}%`);
  const sweepOpacity = useTransform(progress, (p) => Math.sin(Math.PI * smoothstep(0.08, 0.44, p)) * 0.6);
  const ignition = useTransform(progress, (p) => Math.sin(Math.PI * smoothstep(0.4, 0.58, p)) * 0.7);
  const keyOpacity = useTransform(kbGlow, (g) => 0.55 + 0.45 * g);

  /* mouse parallax, as before: the whole rig tilts a little toward the cursor */
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; pointerX.set((e.clientX / window.innerWidth) * 2 - 1); pointerY.set((e.clientY / window.innerHeight) * 2 - 1); };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion, pointerX, pointerY]);
  const parRotY = useSpring(useTransform(pointerX, (v) => v * 3), { stiffness: 46, damping: 16 });
  const parRotX = useSpring(useTransform(pointerY, (v) => v * -2.2), { stiffness: 46, damping: 16 });

  const sc = AX.hero.screen;
  /* frosted platinum glass: cool and a touch denser than the page, so the body reads as an object */
  const glass = "linear-gradient(148deg, rgba(250,252,255,.96) 0%, rgba(232,240,249,.9) 38%, rgba(214,226,240,.92) 72%, rgba(226,236,248,.94) 100%)";
  const edge = "linear-gradient(180deg, rgba(214,226,240,.99) 0%, rgba(172,190,212,.99) 50%, rgba(138,160,188,.99) 100%)";
  const chamfer = "inset 0 1px 0 rgba(255,255,255,.98), inset 0 0 0 1px rgba(168,190,214,.6), inset 0 -1px 0 rgba(140,165,195,.55), 0 0 0 1px rgba(150,172,198,.55)";
  /* the lid top is a touch more opaque than the deck so the keys only ghost through it when shut */
  const lidGlass = "linear-gradient(148deg, rgba(252,253,255,.98) 0%, rgba(236,243,251,.96) 40%, rgba(218,229,242,.97) 74%, rgba(230,238,249,.98) 100%)";

  return (
    <div className="hm-frame" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="hm-scale" style={{ perspective: 1900, perspectiveOrigin: "55% 34%", transformStyle: "preserve-3d" }}>
        <motion.div style={{ rotateX: sceneRotX, rotateZ: -17, scale: sceneScale, y: sceneY, transformStyle: "preserve-3d", willChange: "transform" }}>
          <motion.div style={{ rotateX: parRotX, rotateY: parRotY, transformStyle: "preserve-3d" }}>
            {/* contact shadow and the cool pool the machine sits in */}
            <motion.div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: 980, height: 560, transform: "translate(-46%, -24%)", borderRadius: "50%", opacity: poolGlow, background: "radial-gradient(ellipse 40% 24% at 50% 52%, rgba(20,40,70,.22), rgba(20,40,70,.08) 48%, transparent 68%), radial-gradient(ellipse 62% 36% at 50% 50%, rgba(0,229,255,.16), rgba(124,92,255,.08) 55%, transparent 72%)", filter: "blur(6px)" }} />

            {/* ══ the machine ══ */}
            <div style={{ position: "relative", width: 620, height: 430, transformStyle: "preserve-3d" }}>
              {/* ── deck: frosted glass ── */}
              <div className="hm-deck" style={{ position: "absolute", inset: 0, borderRadius: 16, transformStyle: "preserve-3d", background: glass, boxShadow: `${chamfer}, inset 0 0 70px rgba(0,229,255,.06), 0 30px 80px -30px rgba(20,30,60,.5)`, backgroundImage: `${glass}, linear-gradient(rgba(10,112,133,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(10,112,133,.06) 1px, transparent 1px)`, backgroundSize: "100% 100%, 28px 28px, 28px 28px" }}>
                {/* the body's thickness: front and side faces hanging below the deck */}
                <div className="hm-face" aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 18, transformOrigin: "50% 0%", transform: "rotateX(-90deg)", background: edge, borderRadius: "0 0 10px 10px", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), inset 0 -1px 0 rgba(120,145,175,.6)" }}>
                  <div style={{ position: "absolute", left: 40, right: 40, top: 5, height: 2, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(0,229,255,.95), transparent)", boxShadow: "0 0 14px rgba(0,229,255,.7)" }} />
                </div>
                <div className="hm-face" aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, transformOrigin: "0% 50%", transform: "rotateY(90deg)", background: edge, boxShadow: "inset 1px 0 0 rgba(255,255,255,.6)" }} />
                <div className="hm-face" aria-hidden style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 18, transformOrigin: "100% 50%", transform: "rotateY(-90deg)", background: edge, boxShadow: "inset -1px 0 0 rgba(255,255,255,.6)" }} />
                {/* a crisp shadow under the body, for grounding */}
                <div aria-hidden style={{ position: "absolute", inset: -2, borderRadius: 18, transform: "translateZ(-20px) translate(10px, 14px)", background: "rgba(20,40,70,.34)", filter: "blur(12px)" }} />
                {/* gloss: one soft highlight across the deck */}
                <div className="hm-gloss" aria-hidden />
                {/* lit rim, sweeping */}
                <div className="hm-rim" aria-hidden />
                {/* hinge: one continuous bar along the back edge with a light seam */}
                <div aria-hidden style={{ position: "absolute", left: 36, right: 36, top: -5, height: 11, borderRadius: 6, background: "linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(222,232,244,.98) 45%, rgba(176,194,216,.98) 100%)", boxShadow: "inset 0 1px 0 #fff, inset 0 -1px 0 rgba(120,145,175,.7), 0 1px 3px rgba(20,40,70,.25)" }}>
                  <div style={{ position: "absolute", left: 10, right: 10, top: 5, height: 1, background: "rgba(110,135,165,.6)" }} />
                  <motion.div style={{ position: "absolute", left: 60, right: 60, top: 4, height: 2, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(0,229,255,.9), transparent)", boxShadow: "0 0 10px rgba(0,229,255,.6)", opacity: kbGlow }} />
                </div>
                {/* caustic pool under the keys */}
                <motion.div aria-hidden style={{ position: "absolute", left: "18%", right: "18%", top: "2%", height: "48%", borderRadius: "50%", opacity: kbGlow, background: "radial-gradient(ellipse, rgba(0,229,255,.45), rgba(124,92,255,.18) 50%, transparent 72%)", filter: "blur(14px)" }} />
                {/* keyboard of light */}
                <div style={{ position: "absolute", left: 44, right: 44, top: 34, height: 208, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(196,212,232,.7), rgba(206,220,238,.6))", boxShadow: "inset 0 0 0 1px rgba(150,172,198,.55), inset 0 2px 8px rgba(20,40,70,.18), inset 0 -1px 0 rgba(255,255,255,.7)" }}>
                  <motion.div aria-hidden style={{ position: "absolute", inset: 6, borderRadius: 8, opacity: kbGlow, background: "linear-gradient(90deg, rgba(0,229,255,.18), rgba(124,92,255,.14), rgba(255,43,214,.12), rgba(255,210,122,.12), rgba(95,255,163,.14))", filter: "blur(10px)" }} />
                  {KEY_ROWS.map((row, r) => (
                    <div key={r} style={{ display: "flex", gap: 6, position: "relative", flex: 1 }}>
                      {row.map((legend, k) => {
                        const wide = legend.length > 1 && legend !== "⌘" ? 1.7 : legend === "" ? 4.4 : 1;
                        const hue = KEY_HUES[Math.floor((k / row.length) * KEY_HUES.length)];
                        return (
                          <motion.div key={k} className="hm-key" style={{ flex: wide, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: legend.length > 1 ? 6.5 : 8.5, fontWeight: 600, color: "rgba(16,44,68,.8)", userSelect: "none", background: "linear-gradient(180deg, #ffffff 0%, #f1f6fc 55%, #e4edf8 100%)", boxShadow: `inset 0 1px 0 #fff, inset 0 -1px 0 rgba(150,172,198,.55), 0 1.5px 0 rgba(120,145,175,.6), 0 2px 3px rgba(20,40,70,.16), 0 0 8px ${hue}1f`, ["--hue" as string]: hue, ["--d" as string]: `${((r * 7 + k * 3) % 20) / 10}s`, opacity: keyOpacity }}>
                            {legend}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* trackpad */}
                <div style={{ position: "absolute", left: "50%", bottom: 38, width: 200, height: 118, transform: "translateX(-58%)", borderRadius: 12, background: "linear-gradient(155deg, rgba(246,250,255,.95), rgba(226,236,248,.95))", boxShadow: "inset 0 0 0 1px rgba(160,182,208,.6), inset 0 1px 0 #fff, inset 0 -10px 24px rgba(20,40,70,.08), 0 1px 0 rgba(255,255,255,.8)" }} />
                {/* deck badge + model line */}
                <div style={{ position: "absolute", right: 58, bottom: 52, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12, letterSpacing: ".22em", color: "#0a7085", textShadow: "0 0 10px rgba(0,229,255,.6)" }}>ALGORITHM<span style={{ color: "#00bfe0" }}>X</span></div>
                <div style={{ position: "absolute", right: 58, bottom: 38, fontFamily: "var(--mono)", fontSize: 5.5, letterSpacing: ".12em", color: "rgba(10,60,80,.55)", userSelect: "none" }}>{sc.deckModel}</div>
                {/* standby LED on the front lip */}
                <motion.div className="hm-led" style={{ position: "absolute", left: 84, bottom: 10, width: 26, height: 3, borderRadius: 2, background: "#00bfe0", boxShadow: "0 0 8px rgba(0,229,255,.9)", opacity: ledOpacity }} />
                {/* lit front edge */}
                <div aria-hidden style={{ position: "absolute", left: 40, right: 40, bottom: 0, height: 2, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(0,229,255,.9), transparent)", boxShadow: "0 0 16px rgba(0,229,255,.6)" }} />
              </div>

              {/* ── lid, hinged on the far edge ── */}
              <motion.div style={{ position: "absolute", inset: 0, transformOrigin: "50% 0%", rotateX: lidAngle, transformStyle: "preserve-3d", willChange: "transform", z: 2 }}>
                {/* outer shell: a sheet of glass with the cube etched in */}
                <div style={{ position: "absolute", inset: 0, borderRadius: 16, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(1.2px)", background: lidGlass, boxShadow: chamfer, backgroundImage: `${lidGlass}, linear-gradient(rgba(10,112,133,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(10,112,133,.05) 1px, transparent 1px)`, backgroundSize: "100% 100%, 28px 28px, 28px 28px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <div className="hm-gloss" aria-hidden />
                  <div style={{ display: "grid", placeItems: "center", gap: 14 }}>
                    <span style={{ filter: "drop-shadow(0 0 12px rgba(0,229,255,.8)) drop-shadow(0 0 30px rgba(0,229,255,.35))" }}><BrandCube size={56} /></span>
                    <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 22, letterSpacing: ".4em", paddingLeft: ".4em", color: "#0a7085", textShadow: "0 0 14px rgba(0,229,255,.7), 0 0 40px rgba(0,229,255,.35)" }}>ALGORITHM<span style={{ color: "#00bfe0" }}>X</span></span>
                  </div>
                  {/* lit edge on the lid's free end */}
                  <div aria-hidden style={{ position: "absolute", left: 40, right: 40, bottom: 0, height: 3, borderRadius: 3, background: "linear-gradient(90deg, transparent, rgba(0,229,255,.95), transparent)", boxShadow: "0 0 18px rgba(0,229,255,.7)" }} />
                  {/* specular sweep while the lid moves */}
                  <motion.div aria-hidden style={{ position: "absolute", top: "-25%", bottom: "-25%", left: 0, width: "48%", x: sweepX, opacity: sweepOpacity, background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,.75) 46%, rgba(0,229,255,.25) 54%, transparent 78%)", pointerEvents: "none" }} />
                </div>

                {/* the lid's thickness: a 6px glass edge on its free end and sides */}
                <div className="hm-face" aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, transformOrigin: "50% 0%", transform: "translateZ(1.2px) rotateX(-90deg)", background: edge, borderRadius: "0 0 6px 6px" }} />
                <div className="hm-face" aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, transformOrigin: "0% 50%", transform: "translateZ(1.2px) rotateY(90deg)", background: edge }} />
                <div className="hm-face" aria-hidden style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 6, transformOrigin: "100% 50%", transform: "translateZ(1.2px) rotateY(-90deg)", background: edge }} />
                {/* inner face: the hologram pane */}
                <div style={{ position: "absolute", inset: 0, borderRadius: 16, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateX(180deg) translateZ(3.5px)", background: "linear-gradient(160deg, #101a2a, #0a121f)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08), 0 0 0 1px rgba(150,172,198,.55)", padding: 11 }}>
                  <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 3, width: 5, height: 5, marginLeft: -2.5, borderRadius: 99, background: "radial-gradient(circle at 40% 35%, #3a5577 0%, #0a1220 70%)", boxShadow: "0 0 0 1.5px rgba(120,150,190,.35)" }} />
                  <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 10, overflow: "hidden", background: "linear-gradient(180deg, rgba(6,18,36,.97), rgba(6,18,36,.92))", boxShadow: "inset 0 0 0 1px rgba(0,229,255,.45), inset 0 0 60px rgba(0,229,255,.08)" }}>
                    {/* dormant: a faint cyan grid, fading as the console lights */}
                    <motion.div aria-hidden style={{ position: "absolute", inset: 0, opacity: dormant, backgroundImage: "linear-gradient(rgba(0,229,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <span className="hm-corner tl" /><span className="hm-corner tr" /><span className="hm-corner bl" /><span className="hm-corner br" />
                    <motion.div className="os" style={{ opacity: screenT, zIndex: 2, z: 0.6 }}>
                      <div className="bar"><span className="t">{sc.os}</span><span className="tabs">{sc.tabs.map((t) => <span key={t}>{t}</span>)}</span><span className="r"><span>{sc.clock}</span><span>{sc.sys}</span></span></div>
                      <div className="side"><div className="lab">{sc.shield.label}</div><div className="ring" /><div className="big">{sc.shield.value}</div><div className="lab">{sc.shield.sub}</div><ul>{sc.side.map((s) => <li key={s}>{s}</li>)}</ul><div className="lab" style={{ marginTop: "auto" }}>{sc.blocked.label} <b style={{ color: "#fff" }}>{sc.blocked.value}</b></div></div>
                      <div className="main"><div className="hd"><span>{sc.opsTitle}</span><span>{sc.opsStatus}</span></div>{sc.ops.map((o, i) => <div className="row" key={o.name} style={{ "--i": i } as React.CSSProperties}><i /><span className="nm">{o.name}</span><span className="mt">{o.meta}</span><span className="st">{o.status}</span></div>)}</div>
                      <div className="right"><div className="box"><div className="hd">{sc.scan.title}</div>{sc.scan.rows.map((r) => <div className="kv" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b></div>)}</div><div className="box log"><div className="hd">{sc.log.title}</div>{sc.log.rows.map((r) => <div key={r[0]}><span>{r[0]}</span><span>{r[1]}</span></div>)}</div></div>
                      <div className="foot">{sc.foot.map((f) => <span key={f}>{f}</span>)}</div>
                    </motion.div>
                    <motion.div aria-hidden style={{ position: "absolute", inset: 0, opacity: screenT, zIndex: 3, z: 0.8, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 40%, rgba(0,229,255,.14), transparent 70%)" }} />
                    <div className="hm-scan" aria-hidden />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* ignition flash as the screen lights */}
      <motion.div aria-hidden style={{ position: "absolute", left: "22%", top: "0%", width: "64%", height: "80%", opacity: ignition, pointerEvents: "none", background: "radial-gradient(circle at 56% 38%, rgba(150,235,255,.5) 0%, rgba(80,140,255,.16) 38%, transparent 68%)" }} />
    </div>
  );
}
