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
import { IntroVideo } from "./IntroVideo";
import LiveBackground from "./LiveBackground";

/* ================================================================ data */

const ACTORS = [
  {
    code: "PHANTOM HOOK",
    tease: "Urgent fakes dressed as companies you trust. Wants the click before the thought.",
    declassified: true,
    portrait: "/explorers/actors/phantom-hook.png",
  },
  { code: "MIMIC", tease: "Voices you trust. Faces you know. Neither is real.", portrait: "/explorers/actors/mimic.png" },
  { code: "SKELETON KEY", tease: "Ten thousand guesses a second. And one weak password.", portrait: "/explorers/actors/skeleton-key.png" },
  { code: "SIREN", tease: "Prizes, flattery, urgency. Whatever gets a yes.", portrait: "/explorers/actors/siren.png" },
  { code: "GHOSTWRITER", tease: "Machine-written lures, fluent in your favorite games.", portrait: "/explorers/actors/ghostwriter.png" },
  { code: "PACKRAT", tease: "Hoards every detail you overshare. Spends it later.", portrait: "/explorers/actors/packrat.png" },
];

const BEATS = [
  { name: "Incoming transmission", desc: "A 40-second cold open. Something on the network is wrong, and it just became your case." },
  { name: "Briefing", desc: "WREN, your handler, pins the objectives to the mission-control surface. Three. Never more." },
  { name: "Three investigation cycles", desc: "Learn the concept, run the fieldwork, prove it at a checkpoint, on real-looking evidence: emails, URLs, chat logs." },
  { name: "The incident", desc: "The case goes live. Triage the wave, make the containment call, put it on the record." },
  { name: "Debrief", desc: "The after-action report, ending with your move in the real world, this week." },
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
      "Why scams are a business, and how that helps you",
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
      "Build defenses, then watch them hold",
    ],
  },
  {
    n: 4,
    name: "The Long Game",
    clearance: "ULTRA" as const,
    skills: [
      "Your digital footprint, and who can read it",
      "AI-era threats: cloned voices, machine-written lures",
      "The ethics of skill: living the ARC Code",
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
    d: "Every point maps to something demonstrated. No XP for logging in, watching, or grinding. And nothing is ever taken away.",
  },
  {
    t: "Sessions end on purpose",
    d: "Each mission closes with a full stop: no autoplay, no \"one more,\" no countdown pressure. Designed to the ICO Children's Code, not around it.",
  },
  {
    t: "No leaderboards, no comparison",
    d: "Progress is measured against the case, never against other kids. Personal bests and closed cases: that's the scoreboard.",
  },
  {
    t: "Defense-first, by design",
    d: "Explorers anticipate and counter attacks. They never write or send one, not even as an exercise. Mission 01 opens with signing the ARC Code.",
  },
  {
    t: "Every mission lands in real life",
    d: "Debriefs end with one concrete action for the week: check the sender, turn on two-factor, report and loop in an adult they trust.",
  },
  {
    t: "Evidence you can see",
    d: "Checkpoints produce real records of what your child can do: calls made correctly, not minutes watched.",
  },
];

const FAQS = [
  {
    q: "Is Cyber Explorers right for my child's age?",
    a: "It's built for ages 10–13, the years kids get their first phone, first accounts, and first group chats. The tone is a professional field unit that takes them seriously: no cartoons, no baby-talk, no horror.",
  },
  {
    q: "Do they need to finish Cyber Heroes first?",
    a: "No. Explorers is fully standalone. If your child did Cyber Heroes (ages 6–9), Explorers is the natural graduation: same platform, entirely new world, deeper skills.",
  },
  {
    q: "Is this teaching my kid to hack?",
    a: "It's teaching your kid to think like the person who stops the hack. Explorers analyze, anticipate, and counter attacks; they never create them. That line is hard-coded into the curriculum and the fiction: it's the first thing an operative signs.",
  },
  {
    q: "How much time does it take?",
    a: "One mission a week, 45–60 minutes, with save-and-resume at any point. The course is 20 missions across four clearance blocks.",
  },
  {
    q: "What does it run on?",
    a: "Any modern browser: laptop, desktop, or tablet. Nothing to install.",
  },
  {
    q: "My kid says they already know about scams.",
    a: "Most kids can recite 'don't click suspicious links.' Very few can tell you WHY gamehub.support-verify.net isn't GameHub, or what a pressure deadline is doing to their brain. Explorers teaches the mechanism, not the slogan. And kids who 'already know' tend to be the ones who love it most, because it finally treats them as capable.",
  },
  {
    q: "How much does it cost?",
    a: "£99, once. That's all 20 missions, lifetime access, and every future update. No subscription, no in-app purchases, nothing sold to your child, ever.",
  },
  {
    q: "What if my child loses interest?",
    a: "Every mission is a complete case with a real ending, built for 45–60 minutes: no cliffhanger traps, no daily-streak guilt. And enrollment comes with a simple money-back guarantee: if it doesn't land with your kid, you get your money back.",
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
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", color, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span aria-hidden style={{ width: 18, height: 2, borderRadius: 1, background: color, opacity: 0.75, display: "inline-block" }} />
      {text}
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 30 }} data-scroll>
      <Eyebrow text={eyebrow} color={T.arcCyan} />
      <h2 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.015em", margin: "14px 0 0", color: T.textPrimary }}>
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
              <Eyebrow text="ARC secure net · incoming transmission" color={T.arcCyan} />
              <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: T.textPrimary, margin: "16px 0 14px", minHeight: "1.2em" }}>
                <Resolve text="SIGNAL DETECTED" reduced={reduced} />
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, maxWidth: 380, borderLeft: `2px solid ${T.hairline}`, paddingLeft: 12 }}>
                A message just hit a student&rsquo;s inbox. It says her game account gets deleted in 24
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
                <span style={{ color: "#7A6428" }}>CLEARANCE: TRAINEE ▸ CONFIDENTIAL</span>
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
        SELF-RUNNING DEMO · ACTUAL MISSION 01 INTERFACE
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
          padding: 0,
          minHeight: 128,
          position: "relative",
          cursor: "default",
          overflow: "hidden",
          "--ac": actor.declassified ? T.clearanceBrass : T.arcCyan,
        } as React.CSSProperties
      }
    >
      {actor.portrait && (
        <div style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={actor.portrait}
            alt={`Surveillance photo of ${actor.code}`}
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center 20%", display: "block", filter: actor.declassified ? "none" : "grayscale(0.6) brightness(0.85)" }}
          />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 45%, ${actor.declassified ? T.manila : T.panel} 100%)` }} />
        </div>
      )}
      <div style={{ padding: "10px 13px 15px" }}>
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
        {actor.declassified ? "DOSSIER: DECLASSIFIED" : revealed ? "DOSSIER: INTERCEPTED FRAGMENT" : "DOSSIER: SEALED"}
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
    </div>
  );
}

/* ============================================================== page */

export default function CyberExplorersLanding() {
  const reduced = useReducedMotion();
  useScrollReveal(reduced);

  return (
    <main className="cx-legible" style={{ background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflowX: "hidden" }}>
      {/* live backdrop: colour aurora base + an animated neon particle network
          (canvas), then a vignette on top for legibility (no matrix/code — parents) */}
      <div aria-hidden className="cx-aurora" />
      <LiveBackground reduced={reduced} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 120% 100% at 50% 20%, rgba(6,8,18,0.04) 0%, rgba(6,8,16,0.22) 55%, rgba(3,5,12,0.42) 100%)" }} />

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
        <Link
          href="/"
          aria-label="Cyber Explorers by AlgorithmX, home"
          style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: MONO, fontWeight: 600, fontSize: 13, letterSpacing: "0.12em", color: T.textPrimary, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={T.arcCyan}
            strokeWidth="1.8"
            aria-hidden
            style={{ filter: `drop-shadow(0 0 8px ${T.arcCyan}59)`, flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="6.4" />
            <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
            <circle cx="12" cy="12" r="1.6" fill={T.arcCyan} stroke="none" />
          </svg>
          CYBER EXPLORERS
          <span className="cx-brand-by" style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.16em", color: T.textDisabled, marginLeft: 5 }}>
            BY ALGORITHMX
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="#course" className="cx-navlink">THE COURSE</a>
          <a href="#parents" className="cx-navlink">FOR PARENTS</a>
          <Link href="/login?course=cyberexplorers" className="cx-navlink" style={{ border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "8px 13px" }}>
            LOG IN
          </Link>
          <Link
            href="/signup?course=cyberexplorers"
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
            ENROLL · £99
          </Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* ── HERO — matrix-terminal cold open ─────────────────────── */}
        <section style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 0.88fr) minmax(0, 1.22fr)", gap: 44, alignItems: "center", padding: "86px 0 54px" }} className="cx-two-col">
          <div className="cx-hero-in">
            <Eyebrow text="AlgorithmX Cybersecurity · Ages 10–13" color={T.arcCyan} />
            <h1 style={{ fontFamily: BODY, fontSize: "clamp(44px, 6.2vw, 74px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em", margin: "16px 0 18px" }}>
              <Resolve text="Raise a" reduced={reduced} />
              <br />
              <span className="cx-grad">
                <Resolve text="cyber-smart kid." reduced={reduced} delay={300} />
              </span>
            </h1>
            <p className="cx-sub" style={{ fontSize: 18.5, lineHeight: 1.5, color: "#D6E3F1", maxWidth: 500, margin: "0 0 14px" }}>
              Cyber Explorers teaches 10&ndash;13s to outsmart scams, deepfakes and hackers.
            </p>
            <p style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, color: T.actionAmber, margin: "0 0 16px", letterSpacing: "0.02em" }}>
              <span style={{ color: T.textSecondary, fontWeight: 500 }}>Covers</span>&nbsp;&nbsp;Scams · Deepfakes · Passwords · Privacy · Social engineering
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 13, margin: "0 0 20px", padding: "10px 18px", borderRadius: 11, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.arcCyan}3A`, boxShadow: `0 0 26px -14px ${T.arcCyan}` }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", color: T.textSecondary, textTransform: "uppercase" }}>Aligned with UK&rsquo;s National Cyber Security Centre</span>
              <span aria-hidden style={{ width: 1, height: 24, background: T.hairline }} />
              <img src="/logos/ncsc.svg" alt="National Cyber Security Centre" style={{ height: 36, width: "auto" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Link
                href="/signup?course=cyberexplorers"
                className="cx-cta cx-cta-primary"
                style={{
                  fontFamily: MONO,
                  fontSize: 14.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: T.inkBlack,
                  background: T.actionAmber,
                  border: "none",
                  borderRadius: 9,
                  padding: "16px 30px",
                  textDecoration: "none",
                }}
              >
                ENROLL NOW · £99
              </Link>
              <a href="#course" className="cx-navlink" style={{ fontSize: 12, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 18px", display: "inline-block" }}>
                SEE WHAT&rsquo;S INCLUDED ↓
              </a>
            </div>
            <p style={{ fontSize: 12.5, color: T.textSecondary, margin: "12px 0 0", maxWidth: 440 }}>
              One payment. Lifetime access. Money-back guarantee: if it doesn&rsquo;t land with your kid, you get it back.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", margin: "18px 0 0", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.05em", color: T.textSecondary }}>
              <span><span style={{ color: T.confirmedGreen }}>✓</span> ICO CHILDREN&rsquo;S CODE–ALIGNED</span>
              <span><span style={{ color: T.confirmedGreen }}>✓</span> NO ADS, NO LOOT BOXES</span>
              <span><span style={{ color: T.confirmedGreen }}>✓</span> SESSIONS END ON PURPOSE</span>
            </div>
          </div>

          <div className="cx-hero-in" style={{ animationDelay: "0.15s" }}>
            <IntroVideo reduced={reduced} />
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
              <div className="cx-num" style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, lineHeight: 1 }}>
                <CountUp to={s.to} suffix={s.suffix} reduced={reduced} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", color: T.textSecondary, marginTop: 8 }}>
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* ── THE PROBLEM (parent-first) ─────────────────────────── */}
        <section style={{ padding: "46px 0", position: "relative" }}>
          <Wash color={T.threatRed} at="70% 20%" />
          <SectionHead
            eyebrow="01 · Why this matters now"
            title="The internet doesn't wait until they're ready."
            sub="Age 10 to 13 is when it all arrives at once: the phone, the accounts, the group chats. And the scams arrive with them."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cx-three-col">
            {[
              { big: "56% → 83%", small: "Smartphone ownership jumps between ages 10 and 11, the single biggest change in a child's digital life. (Ofcom)" },
              { big: "3 in 4", small: "11–17s have already seen harmful content online. Most never tell anyone. (Ofcom)" },
              { big: "One voice note", small: "is all AI needs to fake a voice your child trusts. The tricks are getting better. Your child can too." },
            ].map((s, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.1)} className="cx-card" style={{ background: `${T.panel}D9`, border: `1px solid ${T.threatRed}44`, borderRadius: 8, padding: "22px 24px", "--ac": T.threatRed } as React.CSSProperties}>
                <div className="cx-num" style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, marginBottom: 8 }}>{s.big}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>{s.small}</p>
              </div>
            ))}
          </div>
          <p data-scroll style={{ fontSize: 16, lineHeight: 1.7, color: T.textPrimary, margin: "24px 0 0", maxWidth: 620 }}>
            You can&rsquo;t read over their shoulder anymore. The next best thing is a kid who doesn&rsquo;t need you to.
          </p>
        </section>

        {/* ── THE TRANSFORMATION ─────────────────────────────────── */}
        <section style={{ padding: "40px 0 56px", position: "relative" }}>
          <SectionHead eyebrow="02 · The change you'll see" title="Same kid. Different reflexes." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="cx-two-col">
            <div data-scroll style={{ background: `${T.panel}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "22px 24px" }}>
              <Eyebrow text="Before" color={T.textDisabled} />
              <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textSecondary, margin: "12px 0 0", fontStyle: "italic" }}>
                &ldquo;It said my account would be deleted in 24 hours&hellip; so I clicked it and typed my password.&rdquo;
              </p>
            </div>
            <div data-scroll data-scroll-delay="0.12" style={{ background: `${T.confirmedGreen}0D`, border: `1px solid ${T.confirmedGreen}55`, borderRadius: 3, padding: "22px 24px" }}>
              <Eyebrow text="After 20 missions" color={T.confirmedGreen} />
              <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textPrimary, margin: "12px 0 0", fontStyle: "italic" }}>
                &ldquo;Real companies don&rsquo;t rush you. And that&rsquo;s not even their domain. Screenshotted, reported, blocked.&rdquo;
              </p>
            </div>
          </div>
          <p data-scroll style={{ fontSize: 14.5, lineHeight: 1.65, color: T.textSecondary, margin: "18px 0 0", maxWidth: 620 }}>
            That reflex is the product. The spy fiction below is just how we get a 12-year-old to practice it every week.
            Voluntarily.
          </p>
        </section>

        {/* ── WHAT YOUR CHILD GETS — the deliverables, concretely ── */}
        <section id="course" style={{ padding: "46px 0", position: "relative" }}>
          <Wash color={T.arcCyan} at="50% 10%" />
          <SectionHead
            eyebrow="03 · What your child gets"
            title="Everything included. Nothing vague."
            sub="A spy thriller they choose to play, not a worksheet in a game costume: a calm handler on the radio, real cases on the desk, and the exact tricks the real internet runs. Here is what arrives the day you enroll."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }} className="cx-three-col">
            {[
              { n: "20", t: "Story missions", d: "One complete case a week, 45–60 minutes, fully self-guided with save-and-resume." },
              { n: "7", t: "Real analyst skills", d: "Spotting scams, reading web addresses, verifying identities, building real defenses, taught by doing." },
              { n: "1", t: "Voice-acted mentor", d: "WREN, their handler, talks them through every mission like a colleague, never a lecture." },
              { n: "6", t: "Villains to unmask", d: "Each one is a real internet threat in a story costume: phishing, fake voices, data theft." },
              { n: "∞", t: "Progress you can check", d: "XP, clearance ranks, and quiz records: evidence of learning, visible any time." },
              { n: "£99", t: "Once. Lifetime access", d: "Every mission, every future update, no subscription, and a money-back guarantee." },
            ].map((g, i) => (
              <div key={g.t} data-scroll data-scroll-delay={String((i % 3) * 0.08)} className="cx-card" style={{ background: `${T.panel}E6`, border: `1px solid ${T.hairline}`, borderRadius: 9, padding: "20px 22px", "--ac": T.arcCyan } as React.CSSProperties}>
                <div className="cx-num" style={{ fontFamily: MONO, fontSize: 38, fontWeight: 700, lineHeight: 1 }}>{g.n}</div>
                <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 600, margin: "10px 0 6px" }}>{g.t}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PARENTS ────────────────────────────────────────────── */}
        {/* ── PROOF ──────────────────────────────────────────────── */}
        <section style={{ padding: "46px 0", position: "relative" }}>
          <Wash color={T.arcCyan} at="50% 30%" />
          <div data-scroll style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow text="Why trust us" color={T.arcCyan} />
            <h2 style={{ fontFamily: BODY, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.015em", margin: "12px 0 14px" }}>
              We already built this for the little ones.
            </h2>
            <p className="cx-sub" style={{ fontSize: 16, lineHeight: 1.7, color: T.textSecondary, margin: "0 auto 22px", maxWidth: 640 }}>
              Cyber Explorers comes from the team behind <span style={{ color: T.textPrimary }}>Cyber Heroes</span>,
              our cybersecurity course for ages 6–9, live today with all 20 weeks and 20 bespoke boss battles shipped.
              Same platform, same safety rules, built up for the next age. CyberFirst and ASDAN aligned; GDPR and ICO
              Children&rsquo;s Code by design.
            </p>
            <Link href="/cyberheroes" className="cx-navlink" style={{ fontSize: 12, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "10px 16px", display: "inline-block" }}>
              SEE CYBER HEROES (AGES 6–9) →
            </Link>
          </div>
        </section>

        <section id="parents" style={{ padding: "46px 0", position: "relative" }}>
          <Wash color={T.confirmedGreen} at="25% 20%" />
          <SectionHead
            eyebrow="04 · What you get as a parent"
            title="Visibility, safety, and a kid who talks about it."
            sub="Six commitments, built into the product's design, not promises on a page."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="cx-two-col">
            {PARENT_POINTS.map((p, i) => (
              <div key={p.t} data-scroll data-scroll-delay={String((i % 2) * 0.1)} className="cx-card" style={{ background: `${T.panel}D9`, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "16px 18px", "--ac": T.confirmedGreen } as React.CSSProperties}>
                <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 600, marginBottom: 6, color: T.textPrimary }}>{p.t}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section style={{ padding: "48px 0" }}>
          <SectionHead eyebrow="Questions" title="Questions, answered." />
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
          <div data-scroll className="cx-card" style={{ maxWidth: 640, margin: "0 auto", background: `${T.panel}D9`, border: `1px solid ${T.arcCyan}44`, borderRadius: 14, padding: "44px 34px", "--ac": T.arcCyan } as React.CSSProperties}>
            <Eyebrow text="Simple pricing" color={T.clearanceBrass} />
            <h2 style={{ fontFamily: BODY, fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.015em", margin: "14px 0 6px" }}>
              One price. Lifetime access.
            </h2>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: "clamp(50px, 6.5vw, 74px)", lineHeight: 1, background: "linear-gradient(118deg, #FFE7A6, #E8A33D)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 24px ${T.clearanceBrass}66)`, margin: "8px 0 20px" }}>
              £99
            </div>
            <div style={{ display: "grid", gap: 8, maxWidth: 440, margin: "0 auto 26px", textAlign: "left" }}>
              {[
                "All 20 missions, every incident, the full dossier archive",
                "Lifetime access, including every future update to the course",
                "One payment. No subscription, no in-app purchases, ever",
                "Money-back guarantee if it doesn't land with your kid",
              ].map((b) => (
                <div key={b} style={{ fontSize: 14.5, lineHeight: 1.6, color: T.textSecondary, display: "flex", gap: 10 }}>
                  <span style={{ color: T.confirmedGreen, fontFamily: MONO }}>✓</span>
                  {b}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/signup?course=cyberexplorers"
                className="cx-cta cx-cta-primary"
                style={{
                  fontFamily: MONO,
                  fontSize: 14.5,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: T.inkBlack,
                  background: T.actionAmber,
                  borderRadius: 9,
                  padding: "17px 32px",
                  textDecoration: "none",
                }}
              >
                ENROLL NOW · £99
              </Link>
              <Link href="/login?course=cyberexplorers" className="cx-navlink" style={{ fontSize: 12, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "15px 20px", display: "inline-block" }}>
                ALREADY ENROLLED? LOG IN
              </Link>
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

        /* glass-glow cards — lit gradient border + resting glow, dramatic hover */
        .cx-card { position: relative; transition: transform 280ms cubic-bezier(0.16,1,0.3,1), box-shadow 280ms, border-color 280ms;
          box-shadow: 0 12px 34px -20px rgba(0,0,0,0.85), 0 0 32px -24px var(--ac, ${T.arcCyan}); }
        .cx-card::before { content:""; position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
          background: linear-gradient(140deg, var(--ac, ${T.arcCyan})88, transparent 42%, transparent 66%, var(--ac, ${T.arcCyan})33);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
          opacity: .8; transition: opacity 280ms; }
        .cx-card::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
          background: radial-gradient(120% 82% at 14% 0%, rgba(255,255,255,.055), transparent 48%); }
        @media (hover:hover) {
          .cx-card:hover, .cx-card:focus-within {
            transform: translateY(-6px);
            box-shadow: 0 26px 54px -22px rgba(0,0,0,0.92), 0 0 46px -8px var(--ac, ${T.arcCyan})66;
            border-color: var(--ac, ${T.arcCyan})AA;
          }
          .cx-card:hover::before, .cx-card:focus-within::before { opacity: 1; }
        }
        .cx-tick { opacity: 0.45; transition: opacity 260ms; }
        .cx-card:hover .cx-tick, .cx-card:focus-within .cx-tick { opacity: 1; }

        /* aurora backdrop */
        .cx-aurora { position: fixed; inset: -20%; z-index: 0; pointer-events: none;
          background:
            radial-gradient(40% 44% at 15% 14%, rgba(52,225,255,.34), transparent 70%),
            radial-gradient(44% 48% at 85% 8%, rgba(185,139,255,.30), transparent 72%),
            radial-gradient(54% 54% at 50% 112%, rgba(255,92,168,.22), transparent 70%),
            radial-gradient(42% 42% at 90% 82%, rgba(52,225,255,.22), transparent 72%);
          animation: cxAurora 26s ease-in-out infinite alternate; }
        @keyframes cxAurora { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(2%,-1.6%,0) scale(1.06); } 100% { transform: translate3d(-2%,1.6%,0) scale(1.03); } }

        /* gradient-glow display numbers */
        .cx-num { background: linear-gradient(118deg, #7EEBFF 0%, ${T.arcCyan} 42%, #B98BFF 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
          filter: drop-shadow(0 0 16px rgba(52,225,255,.35)); }

        /* primary CTA — gradient fill + pulse glow */
        .cx-cta-primary { background-image: linear-gradient(118deg, #FFCB5C, ${T.actionAmber}) !important;
          box-shadow: 0 0 0 1px rgba(255,203,92,.45), 0 10px 28px -8px rgba(232,163,61,.6), 0 0 40px -10px rgba(255,203,92,.55);
          animation: cxPulse 2.8s ease-in-out infinite; }
        @keyframes cxPulse {
          0%,100% { box-shadow: 0 0 0 1px rgba(255,203,92,.4), 0 10px 26px -10px rgba(232,163,61,.5), 0 0 34px -12px rgba(255,203,92,.4); }
          50% { box-shadow: 0 0 0 1px rgba(255,203,92,.6), 0 12px 32px -8px rgba(232,163,61,.7), 0 0 56px -8px rgba(255,203,92,.7); } }
        @media (prefers-reduced-motion: reduce) { .cx-aurora, .cx-cta-primary { animation: none; } }

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
          .cx-brand-by { display: none; }
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
