"use client";

/**
 * Cyber Explorers product landing — v2, "the operations floor."
 *
 * v1 read as a spec sheet: it applied the mission-screen austerity
 * rules (attention budget, glow-is-information) to a marketing page.
 * v2 ports the ENERGY ARCHITECTURE of the proven /cyberheroes landing
 * — living full-page backdrop, motion-on-entry, animated counters,
 * hover theater, scroll reveals, persuasion skeleton — translated
 * into the Signal Room register for 10–13s: a command center at
 * night, mid-operation. Tension instead of bounce; declassification
 * instead of sparkles. No emoji, no springs.
 *
 * Hero centerpiece: a self-running demo of the actual Mission 01 UI
 * (transmission → inspect → case closed on a loop) — swap for real
 * screen-recorded footage when captured.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MONO, BODY, T, BAND_BY_CLASSIFICATION } from "@/app/explorers/engine/tokens";
import { Resolve, useReducedMotion } from "@/app/explorers/engine/primitives";

/* ================================================================ data */

const ACTORS = [
  {
    code: "PHANTOM HOOK",
    tease: "Urgent fakes dressed as companies you trust. Wants the click before the thought.",
    declassified: true,
  },
  { code: "MIMIC", tease: "Voices you trust. Faces you know. Neither is real." },
  { code: "SKELETON KEY", tease: "Ten thousand guesses a second — and one weak password." },
  { code: "SIREN", tease: "Prizes, flattery, urgency. Whatever gets a yes." },
  { code: "GHOSTWRITER", tease: "Machine-written lures, fluent in your favorite games." },
  { code: "PACKRAT", tease: "Hoards every detail you overshare. Spends it later." },
];

const BEATS = [
  { name: "Incoming transmission", desc: "A 40-second cold open. Something on the network is wrong — and it just became your case." },
  { name: "Briefing", desc: "WREN, your handler, pins the objectives to the mission-control surface. Three. Never more." },
  { name: "Three investigation cycles", desc: "Learn the concept, run the fieldwork, prove it at a checkpoint — on real-looking evidence: emails, URLs, chat logs." },
  { name: "The incident", desc: "The case goes live. Triage the wave, make the containment call, put it on the record." },
  { name: "Debrief", desc: "The after-action report — ending with your move in the real world, this week." },
  { name: "Case closed", desc: "The dossier declassifies into your archive, the stamp comes down, and the session ends. On purpose." },
];

const BLOCKS = [
  {
    n: 1,
    name: "Signals",
    clearance: "CONFIDENTIAL" as const,
    skills: [
      "Read messages the way an analyst does",
      "Spot pressure tactics before they work",
      "Decode what a web address really says",
      "File your first threat-actor dossiers",
    ],
  },
  {
    n: 2,
    name: "The Human Factor",
    clearance: "SECRET" as const,
    skills: [
      "How social engineering actually works",
      "Impersonation, fake voices, borrowed trust",
      "Why scams are a business — and how that helps you",
      "Predict the attacker's next move",
    ],
  },
  {
    n: 3,
    name: "Systems",
    clearance: "TOP SECRET" as const,
    skills: [
      "How accounts, logins, and recovery really work",
      "Two-factor authentication and password managers",
      "Ciphers, keys, and the basics of encryption",
      "Build defenses — then watch them hold",
    ],
  },
  {
    n: 4,
    name: "The Long Game",
    clearance: "ULTRA" as const,
    skills: [
      "Your digital footprint, and who can read it",
      "AI-era threats: cloned voices, machine-written lures",
      "The ethics of skill — living the ARC Code",
      "The season finale: unmask STATIC's coordinator",
    ],
  },
];

const VERBS = [
  { v: "INSPECT", d: "Examine evidence; flag what doesn't belong" },
  { v: "TRACE", d: "Follow a trail across sources until it resolves" },
  { v: "DECIDE", d: "Make the response call; see the consequences" },
  { v: "BUILD", d: "Configure a real defense and test it" },
  { v: "PROFILE", d: "Reconstruct an actor's M.O. from their moves" },
  { v: "CIPHER", d: "Make and break codes; understand keys" },
  { v: "SIMULATE", d: "Anticipate the attack to counter it" },
];

const LADDER = ["TRAINEE", "CONFIDENTIAL", "SECRET", "TOP SECRET", "ULTRA"] as const;

const PARENT_POINTS = [
  {
    t: "Rewards certify learning, not screen time",
    d: "Every point maps to something demonstrated. No XP for logging in, watching, or grinding — and nothing is ever taken away.",
  },
  {
    t: "Sessions end on purpose",
    d: "Each mission closes with a full stop — no autoplay, no \"one more,\" no countdown pressure. Designed to the ICO Children's Code, not around it.",
  },
  {
    t: "No leaderboards, no comparison",
    d: "Progress is measured against the case, never against other kids. Personal bests and closed cases — that's the scoreboard.",
  },
  {
    t: "Defense-first, by design",
    d: "Explorers anticipate and counter attacks. They never write or send one — not even as an exercise. Mission 01 opens with signing the ARC Code.",
  },
  {
    t: "Every mission lands in real life",
    d: "Debriefs end with one concrete action for the week: check the sender, turn on two-factor, report and loop in an adult they trust.",
  },
  {
    t: "Evidence you can see",
    d: "Checkpoints produce real records of what your child can do — calls made correctly, not minutes watched.",
  },
];

const FAQS = [
  {
    q: "Is Cyber Explorers right for my child's age?",
    a: "It's built for ages 10–13 — the years kids get their first phone, first accounts, and first group chats. The tone is a professional field unit that takes them seriously: no cartoons, no baby-talk, no horror.",
  },
  {
    q: "Do they need to finish Cyber Heroes first?",
    a: "No. Explorers is fully standalone. If your child did Cyber Heroes (ages 6–9), Explorers is the natural graduation — same platform, entirely new world, deeper skills.",
  },
  {
    q: "Is this teaching my kid to hack?",
    a: "It's teaching your kid to think like the person who stops the hack. Explorers analyze, anticipate, and counter attacks; they never create them. That line is hard-coded into the curriculum and the fiction — it's the first thing an operative signs.",
  },
  {
    q: "How much time does it take?",
    a: "One mission a week, 45–60 minutes, with save-and-resume at any point. The course is 20 missions across four clearance blocks.",
  },
  {
    q: "What does it run on?",
    a: "Any modern browser — laptop, desktop, or tablet. Nothing to install.",
  },
];

const STATS = [
  { to: 20, suffix: "", label: "MISSIONS" },
  { to: 6, suffix: "", label: "THREAT ACTORS" },
  { to: 4, suffix: "", label: "CLEARANCE LEVELS" },
  { to: 1, suffix: "", label: "OPERATIVE: YOURS" },
];

/* ============================================================= helpers */

/** Heroes-style scroll reveal: [data-scroll] rises into view once. */
function useScrollReveal(reduced: boolean) {
  useEffect(() => {
    if (reduced) return;
    const els = document.querySelectorAll<HTMLElement>("[data-scroll]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => {
      const delay = el.getAttribute("data-scroll-delay") || "0";
      // Never hide content already at/near the viewport (robust for slow
      // JS, prerender snapshots, and full-page captures).
      if (el.getBoundingClientRect().top < window.innerHeight * 1.2) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(26px)";
      el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [reduced]);
}

function CountUp({ to, suffix = "", reduced }: { to: number; suffix?: string; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [val, setVal] = useState(reduced ? to : 0);
  const started = useRef(false);
  useEffect(() => {
    if (reduced) {
      setVal(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const dur = 1100;
            const step = (now: number) => {
              const p = Math.min(1, (now - t0) / dur);
              setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, reduced]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

function Eyebrow({ text, color = T.textSecondary }: { text: string; color?: string }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color, textTransform: "uppercase" }}>
      {text}
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 30 }} data-scroll>
      <Eyebrow text={eyebrow} color={T.arcCyan} />
      <h2 style={{ fontFamily: MONO, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 600, margin: "12px 0 0", color: T.textPrimary }}>
        {title}
      </h2>
      {sub && (
        <p className="cx-sub" style={{ fontSize: 16, lineHeight: 1.65, color: T.textSecondary, margin: "12px 0 0", maxWidth: 640 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** Per-section ambient wash — each section owns a color (criterion 7). */
function Wash({ color, at = "50% 20%" }: { color: string; at?: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: "-60px -18vw",
        background: `radial-gradient(ellipse 55% 60% at ${at}, ${color}16 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
}

/* ================================================== operations floor */
/* The living backdrop: radar sweep, data streams, node clusters, dot
   field, a drifting STATIC ripple. Activity lives at the edges; the
   center column stays dark for text (the Heroes legibility trick). */

function OpsFloor({ reduced }: { reduced: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        background: [
          `radial-gradient(ellipse 70% 55% at 88% 6%, ${T.arcCyan}12 0%, transparent 55%)`,
          `radial-gradient(ellipse 60% 50% at 6% 90%, #2A5B8F1F 0%, transparent 58%)`,
          `radial-gradient(ellipse 50% 40% at 95% 92%, ${T.actionAmber}0A 0%, transparent 60%)`,
          `linear-gradient(180deg, #080C11 0%, ${T.inkBlack} 40%, #080B10 100%)`,
        ].join(","),
      }}
    >
      {/* depth 1 — drifting color gas (the room's atmosphere) */}
      <div className="cxof-blob" style={{ top: "-22vmax", right: "-14vmax", width: "60vmax", height: "60vmax", background: `radial-gradient(circle, ${T.arcCyan}24, transparent 62%)`, animationName: reduced ? "none" : "cxofDriftA" }} />
      <div className="cxof-blob" style={{ bottom: "-26vmax", left: "-16vmax", width: "68vmax", height: "68vmax", background: "radial-gradient(circle, rgba(42,91,143,0.30), transparent 62%)", animationName: reduced ? "none" : "cxofDriftB" }} />
      <div className="cxof-blob" style={{ top: "34%", left: "58%", width: "44vmax", height: "44vmax", background: `radial-gradient(circle, ${T.actionAmber}0E, transparent 60%)`, animationName: reduced ? "none" : "cxofDriftC" }} />

      {/* depth 2 — diagonal signal band (the data milky way) */}
      <div className="cxof-band" />

      {/* depth 3 — dot dust, two layers */}
      <div className="cxof-dots cxof-dots-far" />
      <div className="cxof-dots cxof-dots-near" />

      {/* depth 4 — constellation network, edges of the map */}
      <svg className="cxof-net" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g stroke={T.arcCyan} strokeOpacity="0.14" strokeWidth="1" fill="none">
          <path d="M120 180 L235 120 L360 210 L235 320 Z M235 120 L235 320 M360 210 L470 160" />
          <path d="M1180 620 L1290 560 L1380 660 L1300 760 L1170 730 Z M1290 560 L1300 760" />
          <path d="M1230 140 L1330 90 L1400 190 M1330 90 L1360 220" />
          <path d="M90 640 L190 700 L150 810 M190 700 L300 670" />
        </g>
        <g fill={T.arcCyan}>
          {[[120,180],[235,120],[360,210],[235,320],[470,160],[1180,620],[1290,560],[1380,660],[1300,760],[1170,730],[1230,140],[1330,90],[1400,190],[1360,220],[90,640],[190,700],[150,810],[300,670]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.6 : 1.8} className={!reduced && i % 2 === 0 ? "cxof-nodepulse" : undefined} style={{ animationDelay: `${i * 0.9}s` }} opacity={0.55} />
          ))}
        </g>
      </svg>

      {/* depth 5 — the radar instrument, sharp, top right */}
      <div className="cxof-radar" style={{ top: "4vh", right: "-8vmax" }}>
        <div className="cxof-radar-rings" />
        <div className="cxof-radar-cross" />
        {!reduced && <div className="cxof-radar-sweep" />}
        <span className="cxof-radar-core" />
      </div>

      {/* perspective floor — the room has a ground plane */}
      <div className="cxof-floor" />

      {/* data streams — thin vertical traffic at the margins */}
      {!reduced &&
        [
          { left: "4%", dur: "11s", delay: "0s", h: 120 },
          { left: "9%", dur: "17s", delay: "3s", h: 70 },
          { right: "6%", dur: "13s", delay: "1.5s", h: 100 },
          { right: "11%", dur: "19s", delay: "6s", h: 60 },
        ].map((s, i) => (
          <div
            key={i}
            className="cxof-stream"
            style={{
              left: s.left,
              right: s.right,
              height: s.h,
              animationDuration: s.dur,
              animationDelay: s.delay,
            }}
          />
        ))}

      {/* node clusters — blinking contacts near the corners */}
      {[
        { top: "12%", left: "6%" },
        { top: "18%", left: "9%" },
        { top: "74%", right: "7%" },
        { top: "80%", right: "11%" },
        { top: "86%", right: "5%" },
        { top: "8%", right: "22%" },
      ].map((p, i) => (
        <span
          key={i}
          className={reduced ? "cxof-node" : "cxof-node cxof-node-blink"}
          style={{ ...p, animationDelay: `${i * 1.7}s` }}
        />
      ))}

      {/* STATIC whisper — a faint interference line drifting down, rarely */}
      {!reduced && <div className="cxof-ripple" />}

      {/* corner readout */}
      <div className="cxof-readout" style={{ bottom: 18, left: 20 }}>
        ARC NET // UPLINK STABLE
        <span className="cxof-cursor">▌</span>
      </div>

      {/* center-column dark pool for legibility — soft, not a void */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 48% 50% at 42% 40%, ${T.inkBlack}8C 0%, transparent 75%)`,
        }}
      />
    </div>
  );
}

/* ==================================================== mission demo */
/* Self-running loop of the actual Mission 01 UI grammar:
   transmission → inspect (tells flag themselves) → case closed.
   Swap for screen-recorded footage when captured. */

const DEMO_TELLS = [
  { label: "Sender address", text: "support@gamehub-rewards-center.com" },
  { label: "Pressure line", text: "DELETED in 24 hours" },
  { label: "Link target", text: "gamehub.support-verify.net" },
];

function MissionDemo({ reduced }: { reduced: boolean }) {
  const [scene, setScene] = useState<"tx" | "inspect" | "closed">(reduced ? "inspect" : "tx");
  const [flagged, setFlagged] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    if (scene === "tx") {
      at(3000, () => {
        setFlagged(0);
        setScene("inspect");
      });
    } else if (scene === "inspect") {
      at(1000, () => setFlagged(1));
      at(1900, () => setFlagged(2));
      at(2800, () => setFlagged(3));
      at(4600, () => setScene("closed"));
    } else {
      at(3800, () => setScene("tx"));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [scene, reduced]);

  return (
    <div style={{ position: "relative" }}>
      {/* ambient glow behind the monitor — static, cheap */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -50,
          background: `radial-gradient(ellipse at center, ${T.arcCyan}26 0%, ${T.arcCyan}0D 45%, transparent 75%)`,
          filter: "blur(42px)",
          pointerEvents: "none",
        }}
      />
      {/* the monitor */}
      <div
        style={{
          position: "relative",
          border: `1px solid ${T.hairline}`,
          borderRadius: 6,
          overflow: "hidden",
          background: T.inkBlack,
          boxShadow: `0 24px 60px -18px rgba(0,0,0,0.8), 0 0 0 1px ${T.arcCyan}14`,
        }}
      >
        {/* chrome bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${T.hairline}`, background: T.panel }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: T.textSecondary }}>
            CASE 001 // THE 24-HOUR THREAT
          </span>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: T.confirmedGreen }}>
            <span className="cxof-cursor" style={{ marginRight: 6, color: T.confirmedGreen }}>●</span>
            LIVE DEMO
          </span>
        </div>

        {/* screen sheen — cinematic monitor glass */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background: "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 24%), repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.06) 3px 4px)",
          }}
        />
        {/* stage — fixed height so scenes swap without jumping */}
        <div style={{ position: "relative", height: 368, padding: "20px 22px", display: "grid", alignContent: "center" }}>
          {scene === "tx" && (
            <div>
              <Eyebrow text="ARC secure net — incoming transmission" color={T.arcCyan} />
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: T.textPrimary, margin: "16px 0 14px", minHeight: "1.2em" }}>
                <Resolve text="SIGNAL DETECTED" reduced={reduced} />
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, maxWidth: 380, borderLeft: `2px solid ${T.hairline}`, paddingLeft: 12 }}>
                A message just hit a student&rsquo;s inbox — it says her game account gets deleted in 24
                hours. She almost clicked. Find out what reads wrong.
              </p>
            </div>
          )}

          {scene === "inspect" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 148px", gap: 12 }}>
              <div style={{ background: T.paper, color: T.fileInk, borderRadius: 2, padding: "12px 14px", fontSize: 11, lineHeight: 1.55, boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, borderBottom: `1px solid ${T.fileInk}22`, paddingBottom: 8, marginBottom: 8 }}>
                  <div>
                    <span style={{ opacity: 0.5 }}>FROM: </span>
                    <span className={flagged >= 1 ? "cxd-tell cxd-hit" : "cxd-tell"}>GameHub Support &lt;support@gamehub-rewards-center.com&gt;</span>
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <span style={{ opacity: 0.5 }}>SUBJ: </span>
                    <span className={flagged >= 2 ? "cxd-tell cxd-hit" : "cxd-tell"}>URGENT: your account will be DELETED in 24 hours</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 8px" }}>Hi player, we detected a problem with your GameHub account. To keep your skins and progress, verify your password now:</p>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 10.5 }}>
                  <span className={flagged >= 3 ? "cxd-tell cxd-hit" : "cxd-tell"}>[ VERIFY MY ACCOUNT → gamehub.support-verify.net ]</span>
                </p>
              </div>
              <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "10px 11px", alignSelf: "start" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: T.textSecondary }}>
                  <span>ANALYST LOG</span>
                  <span style={{ color: flagged === 3 ? T.confirmedGreen : T.textSecondary }}>{flagged}/3</span>
                </div>
                <div style={{ display: "grid", gap: 5, marginTop: 8 }}>
                  {DEMO_TELLS.map((t, i) => {
                    const hit = flagged > i;
                    return (
                      <div
                        key={t.label}
                        style={{
                          fontFamily: MONO,
                          fontSize: 9,
                          padding: "5px 7px",
                          borderRadius: 2,
                          border: `1px solid ${hit ? T.confirmedGreen : T.hairline}`,
                          color: hit ? T.confirmedGreen : T.textDisabled,
                          background: hit ? `${T.confirmedGreen}12` : "transparent",
                        }}
                      >
                        {hit ? "■ " : "□ "}
                        {hit ? t.label : "█████████"}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {scene === "closed" && (
            <div style={{ position: "relative", background: T.manila, color: T.fileInk, borderRadius: 2, padding: "16px 18px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", opacity: 0.6 }}>THREAT ACTOR DOSSIER</div>
              <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 600, margin: "6px 0 8px" }}>PHANTOM HOOK</div>
              <p style={{ fontSize: 11.5, lineHeight: 1.55, margin: 0, maxWidth: 300 }}>
                <strong>M.O.:&nbsp;</strong>sends fake &ldquo;urgent&rdquo; messages dressed up as companies you trust.
                Defeated by anyone who slows down and reads the address.
              </p>
              <div
                className={reduced ? undefined : "cxd-stamp"}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 16,
                  transform: "rotate(-3deg)",
                  border: `3px solid ${T.stampInk}`,
                  color: T.stampInk,
                  fontFamily: MONO,
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.16em",
                  padding: "4px 9px",
                  borderRadius: 3,
                  opacity: 0.9,
                }}
              >
                CASE CLOSED
              </div>
              <div style={{ marginTop: 14, borderTop: `1px solid ${T.fileInk}26`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em" }}>
                <span style={{ color: "#7A6428" }}>CLEARANCE — TRAINEE ▸ CONFIDENTIAL</span>
                <span>+290 XP</span>
              </div>
            </div>
          )}
        </div>

        {/* scene tracker */}
        <div style={{ display: "flex", gap: 6, padding: "0 20px 14px" }}>
          {(["tx", "inspect", "closed"] as const).map((s) => (
            <span
              key={s}
              style={{
                height: 2,
                flex: 1,
                background: scene === s ? T.arcCyan : T.hairline,
                transition: "background 300ms cubic-bezier(0.2,0,0,1)",
              }}
            />
          ))}
        </div>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.textDisabled, textAlign: "center", margin: "12px 0 0" }}>
        SELF-RUNNING DEMO — ACTUAL MISSION 01 INTERFACE
      </p>
    </div>
  );
}

/* ==================================================== dossier card */

function DossierCard({ actor, reduced }: { actor: (typeof ACTORS)[number]; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const revealed = actor.declassified || open || reduced;

  return (
    <div
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className="cx-card"
      style={
        {
          background: actor.declassified ? T.manila : T.panel,
          color: actor.declassified ? T.fileInk : T.textSecondary,
          border: `1px solid ${actor.declassified ? T.manila : T.hairline}`,
          borderRadius: 3,
          padding: "13px 13px 15px",
          minHeight: 128,
          position: "relative",
          cursor: "default",
          "--ac": actor.declassified ? T.clearanceBrass : T.arcCyan,
        } as React.CSSProperties
      }
    >
      {/* corner viewfinder tick */}
      <span
        aria-hidden
        className="cx-tick"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 12,
          height: 12,
          borderTop: `1.5px solid ${actor.declassified ? "#7A6428" : T.arcCyan}`,
          borderRight: `1.5px solid ${actor.declassified ? "#7A6428" : T.arcCyan}`,
        }}
      />
      <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.08em", opacity: 0.65 }}>
        {actor.declassified ? "DOSSIER — DECLASSIFIED" : revealed ? "DOSSIER — INTERCEPTED FRAGMENT" : "DOSSIER — SEALED"}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, margin: "7px 0 0", color: actor.declassified ? T.fileInk : T.textPrimary }}>
        {actor.code}
      </div>
      {revealed ? (
        <p style={{ fontSize: 11.5, lineHeight: 1.55, margin: "8px 0 0" }}>
          {open && !actor.declassified && !reduced ? <Resolve text={actor.tease} reduced={false} /> : actor.tease}
        </p>
      ) : (
        <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
          {[92, 66, 80].map((w, i) => (
            <div key={i} style={{ height: 7, width: `${w}%`, background: T.hairline }} />
          ))}
        </div>
      )}
      {!actor.declassified && (
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", color: T.textDisabled, marginTop: 9 }}>
          FULL DOSSIER: CLOSE THE CASE
        </div>
      )}
    </div>
  );
}

/* =================================================== waitlist form */

function SignalWaitlist({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      setErrorMsg("That address doesn't parse. Check it and try again.");
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, courseSlug: "cyberexplorers", source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string })?.error || "Server error");
      }
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again?");
    }
  };

  if (state === "success") {
    return (
      <div
        role="status"
        style={{
          display: "inline-block",
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "0.04em",
          color: T.confirmedGreen,
          background: `${T.confirmedGreen}14`,
          border: `1px solid ${T.confirmedGreen}`,
          borderRadius: 3,
          padding: "14px 20px",
          boxShadow: `0 0 24px ${T.confirmedGreen}22`,
        }}
      >
        ON THE LIST — we&rsquo;ll signal you at launch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 470 }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        placeholder="parent@email.com"
        aria-label="Email address for the waitlist"
        style={{
          flex: "1 1 220px",
          height: 50,
          fontFamily: MONO,
          fontSize: 13,
          color: T.textPrimary,
          background: `${T.panel}E6`,
          border: `1px solid ${T.hairline}`,
          borderRadius: 3,
          padding: "0 14px",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = T.arcCyan;
          e.currentTarget.style.boxShadow = `0 0 18px ${T.arcCyan}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = T.hairline;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="cx-cta"
        style={{
          height: 50,
          fontFamily: MONO,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: T.inkBlack,
          background: T.actionAmber,
          border: "none",
          borderRadius: 3,
          padding: "0 24px",
          cursor: state === "loading" ? "wait" : "pointer",
          opacity: state === "loading" ? 0.7 : 1,
          boxShadow: `0 0 26px ${T.actionAmber}40, 0 4px 14px rgba(0,0,0,0.4)`,
        }}
      >
        {state === "loading" ? "TRANSMITTING…" : "JOIN THE WAITLIST"}
      </button>
      {state === "error" && <p style={{ width: "100%", margin: 0, fontSize: 13, color: T.threatRed }}>{errorMsg}</p>}
    </form>
  );
}

/* ============================================================== page */

export default function CyberExplorersLanding() {
  const reduced = useReducedMotion();
  useScrollReveal(reduced);

  return (
    <main className="cx-legible" style={{ background: "transparent", color: T.textPrimary, fontFamily: BODY, position: "relative", overflowX: "hidden" }}>
      <OpsFloor reduced={reduced} />

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 22px",
          background: `${T.inkBlack}D9`,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        <Link href="/" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.textPrimary, textDecoration: "none" }}>
          ALGORITHMX <span style={{ color: T.textDisabled }}>//</span> <span style={{ color: T.arcCyan }}>CYBER EXPLORERS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="#mission" className="cx-navlink">THE MISSION</a>
          <a href="#curriculum" className="cx-navlink">CURRICULUM</a>
          <a href="#parents" className="cx-navlink">PARENTS</a>
          <a
            href="#waitlist"
            className="cx-cta"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: T.inkBlack,
              background: T.actionAmber,
              borderRadius: 3,
              padding: "9px 15px",
              textDecoration: "none",
              boxShadow: `0 0 18px ${T.actionAmber}44`,
            }}
          >
            WAITLIST
          </a>
        </div>
      </nav>

      <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)", gap: 52, alignItems: "center", padding: "76px 0 30px" }} className="cx-two-col">
          <div className="cx-hero-in">
            <Eyebrow text="AlgorithmX Cybersecurity · Ages 10–13" color={T.arcCyan} />
            <h1 style={{ fontFamily: MONO, fontSize: "clamp(36px, 6vw, 74px)", fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.02em", margin: "18px 0 20px" }}>
              <Resolve text="Train the kid" reduced={reduced} />
              <br />
              <span className="cx-grad">
                <Resolve text="who spots the scam." reduced={reduced} delay={400} />
              </span>
            </h1>
            <p className="cx-sub" style={{ fontSize: 17, lineHeight: 1.65, color: T.textSecondary, maxWidth: 520, margin: "0 0 10px" }}>
              Your child joins <span style={{ color: T.textPrimary }}>ARC</span> — an anomaly-response unit hunting a
              network called <span style={{ color: T.textPrimary }}>STATIC</span> — and learns to read the internet the
              way an analyst does. Real skills. Real judgment. Zero jump scares.
            </p>
            <p style={{ fontFamily: MONO, fontSize: 13.5, color: T.actionAmber, margin: "0 0 24px" }}>
              <span className="cx-typeline">&gt; 20 missions. 6 threat actors. 1 operative._</span>
            </p>
            <div id="waitlist">
              <SignalWaitlist source="hero" />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", margin: "18px 0 0", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.05em", color: T.textSecondary }}>
              <span><span style={{ color: T.confirmedGreen }}>✓</span> ICO CHILDREN&rsquo;S CODE–ALIGNED</span>
              <span><span style={{ color: T.confirmedGreen }}>✓</span> NO ADS, NO LOOT BOXES</span>
              <span><span style={{ color: T.confirmedGreen }}>✓</span> SESSIONS END ON PURPOSE</span>
            </div>
          </div>

          <div className="cx-hero-in" style={{ animationDelay: "0.15s" }}>
            <MissionDemo reduced={reduced} />
          </div>
        </section>

        {/* stat modules */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "26px 0 60px" }} className="cx-four-col">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              data-scroll
              data-scroll-delay={String(i * 0.1)}
              className="cx-stat"
              style={{
                background: `${T.panel}CC`,
                border: `1px solid ${T.hairline}`,
                borderRadius: 3,
                padding: "16px 14px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.arcCyan}AA, transparent)` }} />
              <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: T.arcCyan, lineHeight: 1, textShadow: `0 0 22px ${T.arcCyan}55` }}>
                <CountUp to={s.to} suffix={s.suffix} reduced={reduced} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", color: T.textSecondary, marginTop: 8 }}>
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* ── PREMISE ────────────────────────────────────────────── */}
        <section id="mission" style={{ padding: "56px 0", position: "relative" }}>
          <Wash color={T.arcCyan} at="30% 10%" />
          <SectionHead
            eyebrow="The premise"
            title="Your child is the operative."
            sub="No cartoon sidekicks, no classroom. A calm handler on the radio, real-looking evidence on the desk, and a network of threat actors running the exact tricks the real internet runs."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cx-three-col">
            {[
              { t: "THE UNIT", h: "ARC — Anomaly Response Command", d: "The people who find the signal in the noise. Your child joins as a Trainee, earns a callsign, and works real cases from a mission-control desk." },
              { t: "THE ENEMY", h: "STATIC", d: "Not one villain — a network. Each mission's threat actor runs a real internet trick: the urgent fake, the copied voice, the look-alike login page." },
              { t: "THE OPERATIVE", h: "That's your kid", d: "The one in the room who notices what everyone else missed. The fantasy here isn't power — it's competence. Ten-to-thirteens can tell the difference." },
            ].map((c, i) => (
              <div
                key={c.t}
                data-scroll
                data-scroll-delay={String(i * 0.12)}
                className="cx-card"
                style={{ position: "relative", overflow: "hidden", background: `${T.panelRaised}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "22px 22px", "--ac": T.arcCyan } as React.CSSProperties}
              >
                <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.arcCyan}CC, transparent 70%)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Eyebrow text={c.t} color={T.arcCyan} />
                  <span aria-hidden style={{ fontFamily: MONO, fontSize: 14, color: `${T.arcCyan}88`, letterSpacing: "0.1em" }}>
                    {["▲▲", "▚▚", "⊕"][i]}
                  </span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, margin: "12px 0 8px" }}>{c.h}</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.textSecondary, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>

          {/* WREN presence */}
          <div data-scroll style={{ marginTop: 18, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, background: `${T.panelRaised}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 18px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, height: 18 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} className={reduced ? undefined : "cx-wave"} style={{ width: 2, height: [7, 12, 9, 15, 6, 11, 8][i], background: T.arcCyan, animationDelay: `${i * 0.11}s` }} />
              ))}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>WREN — HANDLER, ARC SECURE NET</span>
            <p style={{ margin: 0, fontSize: 14.5, color: T.textPrimary, fontStyle: "italic", flex: 1, minWidth: 240 }}>
              &ldquo;Slow is smooth, Operative. The address always tells the truth — read it before the message reads you.&rdquo;
            </p>
          </div>

          {/* dossier wall — hover to declassify */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }} className="cx-dossier-grid" data-scroll>
            {ACTORS.map((a) => (
              <DossierCard key={a.code} actor={a} reduced={reduced} />
            ))}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.05em", color: T.textDisabled, margin: "12px 0 0" }}>
            HOVER A SEALED DOSSIER FOR THE INTERCEPTED FRAGMENT. FULL FILES DECLASSIFY IN THE COURSE — THE ARCHIVE IS THE REVISION.
          </p>
        </section>

        {/* ── WHO IS STATIC (parent reframe) ─────────────────────── */}
        <section style={{ padding: "40px 0" }}>
          <div
            data-scroll
            style={{
              maxWidth: 820,
              margin: "0 auto",
              background: `${T.panel}E6`,
              border: `1px solid ${T.threatRed}33`,
              boxShadow: `0 0 40px ${T.threatRed}0D`,
              borderRadius: 3,
              padding: "26px 30px",
            }}
          >
            <div style={{ display: "inline-block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.threatRed, border: `1px solid ${T.threatRed}55`, borderRadius: 2, padding: "4px 10px", marginBottom: 14 }}>
              THREAT BRIEFING — FOR PARENTS
            </div>
            <h3 style={{ fontFamily: MONO, fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 600, margin: "0 0 12px", color: T.textPrimary }}>
              Who is STATIC, really?
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: T.textSecondary, margin: 0 }}>
              STATIC isn&rsquo;t a cartoon — it&rsquo;s the real threat landscape wearing a codename. Phishing campaigns
              dressed as game rewards. Voice clones that sound like a friend. Credential attacks on reused passwords.
              Engineered urgency, fake prizes, data harvesting. Every actor your child profiles is a category of attack
              they will actually face — probably this year. Explorers don&rsquo;t memorize rules about it. They learn to
              recognize it, out-think it, and report it.
            </p>
          </div>
        </section>

        {/* ── MISSION BEATS ──────────────────────────────────────── */}
        <section style={{ padding: "48px 0" }}>
          <SectionHead
            eyebrow="How a mission works"
            title="Six beats. One hour. Every week."
            sub="Each mission is a complete case with a beginning, a middle, and a deliberate end — 45–60 minutes, save-and-resume anywhere."
          />
          <div style={{ position: "relative", maxWidth: 760 }}>
            {/* connecting line */}
            <span aria-hidden style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 1, background: `linear-gradient(180deg, ${T.arcCyan}66, ${T.hairline})` }} />
            {BEATS.map((b, i) => (
              <div key={b.name} data-scroll data-scroll-delay={String(i * 0.08)} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 18, padding: "14px 0", position: "relative" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 3,
                    background: T.panel,
                    border: `1px solid ${i === 5 ? T.clearanceBrass : T.arcCyan}55`,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: MONO,
                    fontSize: 12,
                    color: i === 5 ? T.clearanceBrass : T.arcCyan,
                    zIndex: 1,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, marginBottom: 4, paddingTop: 5 }}>{b.name}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INCIDENT DIVIDER — full-bleed set piece ────────────── */}
        <div
          aria-hidden
          style={{
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            margin: "26px 0 26px calc(50% - 50vw)",
            borderTop: `1px solid ${T.threatRed}44`,
            borderBottom: `1px solid ${T.threatRed}44`,
            background: `linear-gradient(90deg, transparent, ${T.threatRed}14 20%, ${T.threatRed}1F 50%, ${T.threatRed}14 80%, transparent)`,
            padding: "14px 0",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", gap: 56, whiteSpace: "nowrap", fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", color: T.threatRed, justifyContent: "center", opacity: 0.9 }}>
            <span>■ LIVE INCIDENT</span>
            <span>SECOND WAVE DETECTED</span>
            <span>4 MESSAGES · 2 THREATS</span>
            <span>CONTAINMENT: YOUR CALL</span>
            <span>■ LIVE INCIDENT</span>
          </div>
        </div>

        {/* ── CURRICULUM ─────────────────────────────────────────── */}
        <section id="curriculum" style={{ padding: "56px 0", position: "relative" }}>
          <Wash color="#4A78B5" at="70% 15%" />
          <SectionHead
            eyebrow="The curriculum"
            title="20 missions. 4 clearance blocks."
            sub="Every five closed cases raise your child's clearance — earned by demonstrated skill, never bought with points. The season builds to unmasking STATIC's coordinator in Mission 20."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="cx-two-col">
            {BLOCKS.map((b, i) => (
              <div
                key={b.n}
                data-scroll
                data-scroll-delay={String((i % 2) * 0.12)}
                className="cx-card"
                style={{ border: `1px solid ${T.hairline}`, borderRadius: 3, overflow: "hidden", "--ac": BAND_BY_CLASSIFICATION[b.clearance] } as React.CSSProperties
                }
              >
                <div style={{ background: BAND_BY_CLASSIFICATION[b.clearance], color: T.inkBlack, fontFamily: MONO, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.2em", textAlign: "center", padding: "5px 0" }}>
                  BLOCK {b.n} → CLEARANCE: {b.clearance}
                </div>
                <div style={{ background: `${T.panel}E6`, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                  <div aria-hidden style={{ position: "absolute", top: -40, right: -40, width: 220, height: 180, background: `radial-gradient(ellipse at center, ${BAND_BY_CLASSIFICATION[b.clearance]}22 0%, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    {b.name}
                    <span style={{ color: T.textDisabled, fontSize: 12, marginLeft: 10 }}>MISSIONS {(b.n - 1) * 5 + 1}–{b.n * 5}</span>
                  </div>
                  <div style={{ display: "grid", gap: 7 }}>
                    {b.skills.map((s) => (
                      <div key={s} style={{ fontSize: 13.5, lineHeight: 1.55, color: T.textSecondary, display: "flex", gap: 10 }}>
                        <span style={{ color: T.confirmedGreen, fontFamily: MONO }}>■</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── THE VERBS ──────────────────────────────────────────── */}
        <section style={{ padding: "48px 0" }}>
          <SectionHead
            eyebrow="The mechanics"
            title="Seven verbs an analyst actually uses."
            sub="No worksheets wearing a game costume. Fieldwork runs on mechanics built for how 10–13s think — inference, consequence, anticipation."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }} data-scroll>
            {VERBS.map((m) => (
              <div key={m.v} className="cx-card" style={{ background: `${T.panel}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 16px", "--ac": T.arcCyan } as React.CSSProperties}>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: T.arcCyan }}>{m.v}</span>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: T.textSecondary, margin: "6px 0 0" }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p data-scroll style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: "16px 0 0", maxWidth: 660 }}>
            <span style={{ fontFamily: MONO, color: T.textPrimary }}>A note on SIMULATE:</span> professional defenders
            train by anticipating the attacker&rsquo;s next move. Your child predicts and counters attacks —{" "}
            <span style={{ color: T.textPrimary }}>they never write or send one.</span> That line is hard-coded.
          </p>
        </section>

        {/* ── PROGRESSION ────────────────────────────────────────── */}
        <section style={{ padding: "56px 0", position: "relative" }}>
          <Wash color={T.clearanceBrass} at="50% 55%" />
          <SectionHead
            eyebrow="Progression"
            title="From Trainee to ULTRA."
            sub="XP tracks pace. Clearances certify skill. Dossiers make revision something kids do on purpose. Nothing is randomized, nothing expires, nothing is for sale."
          />
          <div data-scroll style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {LADDER.map((l, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  className="cx-band"
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    padding: "10px 17px",
                    borderRadius: 3,
                    color: i === 0 ? T.textSecondary : T.inkBlack,
                    background: i === 0 ? "transparent" : BAND_BY_CLASSIFICATION[l as keyof typeof BAND_BY_CLASSIFICATION],
                    border: i === 0 ? `1px solid ${T.hairline}` : "none",
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  {l}
                </span>
                {i < LADDER.length - 1 && <span style={{ fontFamily: MONO, color: T.textDisabled }}>▸</span>}
              </div>
            ))}
          </div>

          {/* the ARC ID card — the tier's signature object, at scale */}
          <div data-scroll style={{ marginTop: 34, display: "flex", justifyContent: "center" }}>
            <div
              className="cx-idcard"
              style={{
                position: "relative",
                width: "min(460px, 100%)",
                borderRadius: 6,
                overflow: "hidden",
                background: `linear-gradient(150deg, ${T.panelRaised}, ${T.panel})`,
                border: `1px solid ${T.clearanceBrass}55`,
                boxShadow: `0 30px 70px -24px rgba(0,0,0,0.9), 0 0 46px ${T.clearanceBrass}1F`,
                padding: "0 0 18px",
              }}
            >
              <div style={{ background: BAND_BY_CLASSIFICATION.CONFIDENTIAL, color: T.inkBlack, fontFamily: MONO, fontWeight: 600, fontSize: 10, letterSpacing: "0.26em", textAlign: "center", padding: "5px 0" }}>
                ARC FIELD CREDENTIAL — CONFIDENTIAL
              </div>
              <div style={{ display: "flex", gap: 18, padding: "18px 20px 6px", alignItems: "center" }}>
                <div style={{ width: 72, height: 88, background: T.inkBlack, border: `1px solid ${T.hairline}`, borderRadius: 3, display: "grid", placeItems: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.08em", color: T.textDisabled, textAlign: "center", lineHeight: 1.6 }}>
                    PHOTO<br />REDACTED
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.textSecondary }}>CALLSIGN</div>
                  <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color: T.textPrimary, margin: "2px 0 8px" }}>NIGHT-HERON</div>
                  <div style={{ display: "flex", gap: 22, fontFamily: MONO, fontSize: 10.5, color: T.textSecondary, letterSpacing: "0.06em" }}>
                    <span>FIELD RATING <span style={{ color: T.arcCyan }}>07</span></span>
                    <span>CASES <span style={{ color: T.clearanceBrass }}>05/20</span></span>
                  </div>
                </div>
              </div>
              <div style={{ margin: "12px 20px 0", borderTop: `1px solid ${T.hairline}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.textDisabled }}>
                <span>ANOMALY RESPONSE COMMAND</span>
                <span style={{ color: T.clearanceBrass }}>▲▲▲</span>
              </div>
              {/* card sheen */}
              {!reduced && <span aria-hidden className="cx-sheen" />}
            </div>
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.05em", color: T.textDisabled, textAlign: "center", margin: "14px 0 0" }}>
            YOUR CHILD&rsquo;S CREDENTIAL EVOLVES WITH EVERY CLOSED CASE — CLEARANCE CEREMONIES REPRINT THE CARD.
          </p>
        </section>

        {/* ── PARENTS ────────────────────────────────────────────── */}
        <section id="parents" style={{ padding: "56px 0", position: "relative" }}>
          <Wash color={T.confirmedGreen} at="25% 20%" />
          <SectionHead
            eyebrow="For parents"
            title="Engagement without the tricks."
            sub="A cybersecurity course shouldn't use the manipulation patterns it warns kids about. Ours can't — the same rules that shaped Cyber Heroes are wired into this tier's design."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="cx-two-col">
            {PARENT_POINTS.map((p, i) => (
              <div key={p.t} data-scroll data-scroll-delay={String((i % 2) * 0.1)} className="cx-card" style={{ background: `${T.panel}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "16px 18px", "--ac": T.confirmedGreen } as React.CSSProperties}>
                <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 600, marginBottom: 6, color: T.textPrimary }}>{p.t}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>{p.d}</p>
              </div>
            ))}
          </div>

          <div data-scroll style={{ marginTop: 20, background: `${T.panelRaised}E6`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Coming from Cyber Heroes?</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0, maxWidth: 520 }}>
                Explorers is the graduation tier: ages 6–9 train alongside the heroes; ages 10–13 become the operative.
                Same platform, new world — and Heroes is never required.
              </p>
            </div>
            <Link href="/cyberheroes" className="cx-navlink" style={{ fontSize: 12, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "10px 16px", display: "inline-block" }}>
              CYBER HEROES (AGES 6–9) →
            </Link>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section style={{ padding: "48px 0" }}>
          <SectionHead eyebrow="Questions" title="Cleared for release." />
          <div style={{ display: "grid", gap: 10, maxWidth: 780 }}>
            {FAQS.map((f, i) => (
              <details key={f.q} data-scroll data-scroll-delay={String(i * 0.06)} className="cx-faq" style={{ background: `${T.panel}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3 }}>
                <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: MONO, fontSize: 13.5, fontWeight: 600, padding: "15px 18px", color: T.textPrimary }}>
                  {f.q}
                </summary>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.textSecondary, margin: 0, padding: "0 18px 16px" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────── */}
        <section style={{ padding: "56px 0 76px", textAlign: "center", position: "relative" }}>
          <Wash color={T.arcCyan} at="50% 40%" />
          <div data-scroll style={{ maxWidth: 640, margin: "0 auto", background: `${T.panel}CC`, border: `1px solid ${T.arcCyan}33`, borderRadius: 4, padding: "40px 32px", boxShadow: `0 0 60px ${T.arcCyan}0F` }}>
            <Eyebrow text="Status: Mission 01 in field testing" color={T.confirmedGreen} />
            <h2 style={{ fontFamily: MONO, fontSize: "clamp(26px, 4.5vw, 38px)", fontWeight: 600, margin: "14px 0 12px" }}>
              The room is almost ready.
            </h2>
            <p className="cx-sub" style={{ fontSize: 16, lineHeight: 1.65, color: T.textSecondary, margin: "0 0 26px" }}>
              Join the waitlist and we&rsquo;ll signal you the moment ARC starts taking recruits.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SignalWaitlist source="footer" />
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ position: "relative", borderTop: `1px solid ${T.hairline}`, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: `${T.inkBlack}CC` }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: T.textDisabled }}>
          © {new Date().getFullYear()} ALGORITHMX · CYBER EXPLORERS
        </span>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="/privacy" className="cx-navlink">PRIVACY</a>
          <a href="/terms" className="cx-navlink">TERMS</a>
          <a href="mailto:support@algorithmx.co.uk" className="cx-navlink">CONTACT</a>
        </div>
      </footer>

      <style>{`
        /* legibility halo over the live backdrop (Heroes trick, our ink) */
        .cx-legible h1, .cx-legible h2, .cx-legible h3 { text-shadow: 0 1px 3px rgba(4,7,10,0.85), 0 0 18px rgba(4,7,10,0.6); }
        .cx-legible .cx-sub { text-shadow: 0 1px 3px rgba(4,7,10,0.8), 0 0 14px rgba(4,7,10,0.55); }

        .cx-navlink {
          font-family: ${MONO}; font-size: 11px; letter-spacing: 0.08em;
          color: ${T.textSecondary}; text-decoration: none;
          transition: color 140ms cubic-bezier(0.2,0,0,1);
        }
        .cx-navlink:hover { color: ${T.textPrimary}; }

        .cx-cta { transition: filter 140ms cubic-bezier(0.2,0,0,1), transform 140ms cubic-bezier(0.2,0,0,1); }
        .cx-cta:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .cx-cta:active { transform: translateY(1px); }

        /* hover theater — lift + accent ring via --ac */
        .cx-card { transition: transform 260ms cubic-bezier(0.16,1,0.3,1), box-shadow 260ms cubic-bezier(0.16,1,0.3,1), border-color 260ms; }
        @media (hover:hover) {
          .cx-card:hover, .cx-card:focus-within {
            transform: translateY(-5px);
            box-shadow: 0 18px 40px -18px rgba(0,0,0,0.85), 0 0 24px -6px var(--ac, ${T.arcCyan})55;
            border-color: var(--ac, ${T.arcCyan})AA;
          }
        }
        .cx-tick { opacity: 0.45; transition: opacity 260ms; }
        .cx-card:hover .cx-tick, .cx-card:focus-within .cx-tick { opacity: 1; }

        /* hero entrance */
        .cx-hero-in { animation: cxRise 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cxRise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }

        /* terminal type-out */
        .cx-typeline {
          display: inline-block; overflow: hidden; white-space: nowrap;
          border-right: 2px solid ${T.actionAmber};
          animation: cxType 2.6s steps(38) 1.1s forwards, cxBlink 0.9s step-end infinite;
          width: 0; vertical-align: bottom;
        }
        @keyframes cxType { to { width: 100%; } }
        @keyframes cxBlink { 0%,100% { border-color: transparent; } 50% { border-color: ${T.actionAmber}; } }

        /* WREN waveform */
        .cx-wave { animation: cxWave 0.9s cubic-bezier(0.2,0,0,1) infinite alternate; }
        @keyframes cxWave { from { height: 4px; } to { height: 16px; } }

        /* clearance bands pulse once on reveal */
        .cx-band { animation: cxBandIn 0.5s cubic-bezier(0.2,0,0,1) both; }
        @keyframes cxBandIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        /* demo: tells snap-flag; stamp slams */
        .cxd-tell { border-radius: 2px; padding: 0 2px; transition: background 160ms cubic-bezier(0.2,0,0,1), outline-color 160ms; outline: 2px solid transparent; }
        .cxd-hit { background: ${T.actionAmber}33; outline-color: ${T.actionAmber}; }
        .cxd-hit::after { content: " ⚑"; color: #A66A00; }
        .cxd-stamp { animation: cxStamp 300ms cubic-bezier(0.2,0,0,1) both; }
        @keyframes cxStamp {
          0% { transform: rotate(-3deg) scale(1.18); opacity: 0; }
          35% { transform: rotate(-3deg) scale(1); opacity: 1; }
          45% { transform: rotate(-3deg) scale(1) translate(2px, 0); }
          100% { transform: rotate(-3deg) scale(1); opacity: 0.9; }
        }

        /* ── operations floor ── */
        .cxof-blob { position: absolute; border-radius: 50%; filter: blur(72px); mix-blend-mode: screen; will-change: transform; opacity: 0.7; animation-duration: 80s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
        @keyframes cxofDriftA { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-6vw, 5vh, 0) scale(1.15); } }
        @keyframes cxofDriftB { from { transform: translate3d(0,0,0) scale(1.06); } to { transform: translate3d(7vw, -4vh, 0) scale(1); } }
        @keyframes cxofDriftC { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-5vw, -6vh, 0) scale(1.18); } }
        .cxof-band {
          position: absolute; inset: -25%;
          background: radial-gradient(ellipse 64% 16% at 50% 50%, ${T.arcCyan}17 0%, rgba(42,91,143,0.10) 40%, transparent 72%);
          transform: rotate(-24deg); filter: blur(30px); mix-blend-mode: screen;
        }
        .cxof-net { position: absolute; inset: 0; width: 100%; height: 100%; }
        .cxof-nodepulse { animation: cxofNode 6s ease-in-out infinite; }
        @keyframes cxofNode { 0%, 78%, 100% { opacity: 0.35; } 86%, 92% { opacity: 1; } }
        .cxof-radar-cross {
          position: absolute; inset: 0;
          background: linear-gradient(0deg, transparent calc(50% - 0.5px), ${T.arcCyan}26 50%, transparent calc(50% + 0.5px)),
                      linear-gradient(90deg, transparent calc(50% - 0.5px), ${T.arcCyan}26 50%, transparent calc(50% + 0.5px));
        }
        .cxof-radar-core { position: absolute; top: 50%; left: 50%; width: 6px; height: 6px; margin: -3px; border-radius: 50%; background: ${T.arcCyan}; box-shadow: 0 0 14px ${T.arcCyan}AA; }
        .cxof-floor {
          position: absolute; left: -20%; right: -20%; bottom: -6vh; height: 34vh;
          background:
            repeating-linear-gradient(90deg, ${T.arcCyan}14 0 1px, transparent 1px 90px),
            repeating-linear-gradient(0deg, ${T.arcCyan}10 0 1px, transparent 1px 46px);
          transform: perspective(640px) rotateX(58deg);
          transform-origin: 50% 100%;
          mask-image: linear-gradient(180deg, transparent 0%, black 55%);
          -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 55%);
          opacity: 0.5;
        }
        .cxof-dots { position: absolute; inset: 0; background-repeat: repeat; }
        .cxof-dots-far {
          opacity: 0.7; background-size: 220px 220px;
          background-image:
            radial-gradient(1px 1px at 30px 40px, ${T.arcCyan}40, transparent),
            radial-gradient(1px 1px at 140px 90px, ${T.textSecondary}33, transparent),
            radial-gradient(1px 1px at 80px 170px, ${T.arcCyan}2E, transparent),
            radial-gradient(1px 1px at 190px 130px, ${T.textSecondary}2A, transparent);
        }
        .cxof-dots-near {
          opacity: 0.4; background-size: 340px 340px;
          background-image:
            radial-gradient(1.5px 1.5px at 60px 100px, ${T.arcCyan}59, transparent),
            radial-gradient(1.4px 1.4px at 240px 200px, ${T.textSecondary}40, transparent),
            radial-gradient(1.5px 1.5px at 160px 300px, ${T.arcCyan}40, transparent);
        }
        .cxof-radar { position: absolute; width: 34vmax; height: 34vmax; }
        .cxof-radar-rings {
          position: absolute; inset: 0; border-radius: 50%;
          background: repeating-radial-gradient(circle at center, transparent 0 calc(20% - 1px), ${T.arcCyan}24 calc(20% - 1px) 20%);
          border: 1px solid ${T.arcCyan}30;
        }
        .cxof-radar-sweep {
          position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from 0deg, ${T.arcCyan}38 0deg, ${T.arcCyan}10 42deg, transparent 70deg);
          animation: cxofSpin 16s linear infinite;
        }
        @keyframes cxofSpin { to { transform: rotate(360deg); } }
        .cxof-stream {
          position: absolute; top: -140px; width: 1px;
          background: linear-gradient(180deg, transparent, ${T.arcCyan}59 40%, ${T.arcCyan}26 70%, transparent);
          animation: cxofFall linear infinite;
        }
        @keyframes cxofFall { from { transform: translateY(-10vh); } to { transform: translateY(115vh); } }
        .cxof-node { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: ${T.arcCyan}66; box-shadow: 0 0 8px ${T.arcCyan}44; }
        .cxof-node-blink { animation: cxofBlink 5.5s ease-in-out infinite; }
        @keyframes cxofBlink { 0%, 82%, 100% { opacity: 0.25; } 88%, 94% { opacity: 1; } }
        .cxof-ripple {
          position: absolute; left: 0; right: 0; height: 1px; top: -2px;
          background: linear-gradient(90deg, transparent, ${T.textSecondary}2E 30%, ${T.textSecondary}40 50%, ${T.textSecondary}2E 70%, transparent);
          animation: cxofRipple 13s linear infinite;
        }
        @keyframes cxofRipple { 0%, 68% { transform: translateY(0); opacity: 0; } 70% { opacity: 1; transform: translateY(0); } 100% { transform: translateY(105vh); opacity: 0.4; } }
        .cxof-readout { position: absolute; font-family: ${MONO}; font-size: 10px; letter-spacing: 0.1em; color: ${T.textDisabled}; }
        .cxof-cursor { animation: cxBlinkSoft 1.1s step-end infinite; }
        @keyframes cxBlinkSoft { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        /* gradient accent for display lines */
        .cx-grad {
          background: linear-gradient(100deg, ${T.arcCyan} 0%, #7FD4E8 45%, ${T.clearanceBrass} 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          text-shadow: none;
        }

        /* ID card sheen — slow diagonal light pass */
        .cx-idcard { isolation: isolate; }
        .cx-sheen {
          position: absolute; inset: -40%; z-index: 1; pointer-events: none;
          background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.07) 50%, transparent 58%);
          animation: cxSheen 6.5s cubic-bezier(0.2,0,0,1) infinite;
        }
        @keyframes cxSheen { 0%, 55% { transform: translateX(-60%); } 90%, 100% { transform: translateX(60%); } }

        .cx-faq summary::-webkit-details-marker { display: none; }
        .cx-faq summary::before { content: "▸ "; color: ${T.arcCyan}; }
        .cx-faq[open] summary::before { content: "▾ "; }

        @media (max-width: 940px) {
          .cx-two-col { grid-template-columns: 1fr !important; }
          .cx-three-col { grid-template-columns: 1fr !important; }
          .cx-four-col { grid-template-columns: repeat(2, 1fr) !important; }
          .cx-dossier-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          nav .cx-navlink { display: none; }
          .cx-dossier-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cx-hero-in, .cx-typeline, .cx-wave, .cx-band, .cxd-stamp,
          .cxof-radar-sweep, .cxof-stream, .cxof-node-blink, .cxof-ripple, .cxof-cursor { animation: none !important; }
          .cx-typeline { width: 100%; border-right: none; }
          .cx-card, .cx-card:hover { transform: none; }
        }
      `}</style>
    </main>
  );
}
