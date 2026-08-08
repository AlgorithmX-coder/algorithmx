"use client";

/**
 * Cyber Explorers — "Signal Room" PROOF OF CONCEPT.
 *
 * One playable slice of the art direction in
 * `algorithmx-explorers-art-direction.md`: incoming transmission →
 * briefing → INSPECT (flag the tells in an intercepted email) →
 * case-closed stamp ceremony, full stop.
 *
 * Deliberately self-contained: no auth, no DB, no SoundManager, no
 * shared Heroes assets (the inverse parent test starts at the import
 * list). Sounds are tiny WebAudio synths; art is placeholder
 * (redaction bars, which the direction makes on-brand).
 *
 * Two-channel rule: every success/failure lands on color/text + sound
 * even at OS reduced-motion, where all animation (scramble, scanline,
 * waveform, stamp kinetics) is disabled.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ---------------------------------------------------------------- tokens */

const T = {
  inkBlack: "#0B0F14",
  panel: "#121820",
  panelRaised: "#1A222E",
  hairline: "#2A3644",
  textPrimary: "#E6EDF3",
  textSecondary: "#8FA0B2",
  textDisabled: "#5A6B80",
  arcCyan: "#22D3EE",
  confirmedGreen: "#3ECF8E",
  actionAmber: "#E8A33D",
  clearanceBrass: "#C9A961",
  threatRed: "#E5484D",
  manila: "#E8E2D0",
  paper: "#F4F1E8",
  fileInk: "#14181D",
  // CONFIDENTIAL cover-sheet band (sanctioned exception to the accent roles)
  bandBlue: "#4A78B5",
};

const MONO = "var(--font-geist-mono), ui-monospace, 'Cascadia Code', Consolas, monospace";
const BODY = "var(--font-inter), system-ui, -apple-system, sans-serif";

/* ----------------------------------------------------------- motion hook */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------ tiny audio */
/* Restrained, mechanical, very low gain. Success = confident latch, not a
   fanfare; error = dull thud, never a buzzer (§9). */

function useSignalAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      try {
        ctxRef.current = new AudioContext();
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  };

  const tone = useCallback(
    (freq: number, dur: number, type: OscillatorType, gain: number, when = 0) => {
      const ctx = ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    [],
  );

  return useMemo(
    () => ({
      click: () => tone(1150, 0.05, "square", 0.025),
      latch: () => {
        tone(660, 0.07, "sine", 0.06);
        tone(880, 0.09, "sine", 0.05, 0.06);
      },
      thud: () => tone(110, 0.09, "sine", 0.08),
      stamp: () => {
        tone(85, 0.13, "sine", 0.11);
        tone(320, 0.04, "square", 0.03, 0.01);
      },
    }),
    [tone],
  );
}

/* ------------------------------------------------------- resolve (verb) */
/* Text de-scrambles from noise, left to right, ≤600ms. At reduced motion
   it simply renders — the information channel never depends on it. */

const NOISE = "▓▒░/\\|<>+=#%@$&";

function Resolve({ text, reduced, delay = 0 }: { text: string; reduced: boolean; delay?: number }) {
  const [display, setDisplay] = useState(reduced ? text : "");
  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const totalFrames = 18; // ~600ms at 30fps
    let raf = 0;
    let started = false;
    const start = performance.now() + delay;
    const step = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(step);
        return;
      }
      started = true;
      frame++;
      const settled = Math.floor((frame / totalFrames) * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < settled || text[i] === " ") out += text[i];
        else out += NOISE[Math.floor(Math.random() * NOISE.length)];
      }
      setDisplay(out);
      if (frame < totalFrames) raf = requestAnimationFrame(step);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      if (started) setDisplay(text);
    };
  }, [text, reduced, delay]);
  return <>{display || " "}</>;
}

/* -------------------------------------------------------- waveform chip */

function HandlerChip({ reduced, speaking }: { reduced: boolean; speaking: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        background: T.panelRaised,
        border: `1px solid ${T.hairline}`,
        borderRadius: 3,
      }}
    >
      <span aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 2, height: 16 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={!reduced && speaking ? "sr-wavebar" : undefined}
            style={{
              width: 2,
              height: reduced || !speaking ? [6, 11, 8, 12, 5][i] : 4,
              background: T.arcCyan,
              animationDelay: `${i * 0.13}s`,
            }}
          />
        ))}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>
        WREN: HANDLER
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.08em",
          color: T.arcCyan,
          borderLeft: `1px solid ${T.hairline}`,
          paddingLeft: 10,
        }}
      >
        CHANNEL LIVE
      </span>
    </div>
  );
}

/* ------------------------------------------------------------- evidence */

type Tell = {
  id: string;
  label: string;
  why: string;
};

const TELLS: Tell[] = [
  {
    id: "sender",
    label: "Sender address",
    why: "The address ends in gamehub-rewards-center.com. The real company's domain is gamehub.com. Close is not the same.",
  },
  {
    id: "urgency",
    label: "Pressure line",
    why: "“24 hours or you lose everything” is a rush tactic. Real companies don't threaten a countdown.",
  },
  {
    id: "link",
    label: "Link target",
    why: "The button says GameHub, but the link goes to gamehub.support-verify.net, a different site wearing a costume.",
  },
];

/* ============================================================== page */

type Scene = "transmission" | "briefing" | "inspect" | "closed";

export default function ExplorersPoC() {
  const reduced = useReducedMotion();
  const audio = useSignalAudio();
  const [scene, setScene] = useState<Scene>("transmission");
  const [found, setFound] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ kind: "hit" | "miss"; text: string } | null>(null);
  const [stamped, setStamped] = useState(false);
  const allFound = found.length === TELLS.length;

  useEffect(() => {
    if (scene === "closed") {
      const t = window.setTimeout(() => {
        setStamped(true);
        audio.stamp();
      }, reduced ? 150 : 900);
      return () => window.clearTimeout(t);
    }
  }, [scene, reduced, audio]);

  const flag = (tell: Tell) => {
    if (found.includes(tell.id)) return;
    const next = [...found, tell.id];
    setFound(next);
    setFeedback({ kind: "hit", text: `FLAGGED: ${tell.label}. ${tell.why}` });
    audio.latch();
  };

  const miss = () => {
    setFeedback({ kind: "miss", text: "That part checks out. Keep looking." });
    audio.thud();
  };

  const go = (s: Scene) => {
    audio.click();
    setScene(s);
    setFeedback(null);
  };

  /* shared chrome bits */
  const eyebrow = (text: string, color: string = T.textSecondary) => (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color, textTransform: "uppercase" }}>
      {text}
    </div>
  );

  const amberButton = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="sr-btn"
      style={{
        fontFamily: MONO,
        fontSize: 13,
        letterSpacing: "0.06em",
        color: T.inkBlack,
        background: T.actionAmber,
        border: "none",
        borderRadius: 3,
        padding: "12px 22px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: T.inkBlack,
        color: T.textPrimary,
        fontFamily: BODY,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* quiet background grid — the room */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${T.hairline}22 1px, transparent 1px), linear-gradient(90deg, ${T.hairline}22 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* PoC tag — self-describing screenshots */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.08em",
          color: T.textDisabled,
          border: `1px solid ${T.hairline}`,
          padding: "4px 8px",
          borderRadius: 2,
          zIndex: 2,
        }}
      >
        SIGNAL ROOM: PROOF OF CONCEPT
      </div>

      <div style={{ position: "relative", maxWidth: 880, margin: "0 auto", padding: "56px 24px 80px" }}>
        {/* ============================== 1 · TRANSMISSION ============================== */}
        {scene === "transmission" && (
          <section style={{ paddingTop: 90, textAlign: "left" }}>
            {eyebrow("ARC SECURE NET: INCOMING TRANSMISSION", T.arcCyan)}
            <h1
              style={{
                fontFamily: MONO,
                fontSize: "clamp(30px, 6vw, 52px)",
                fontWeight: 600,
                margin: "18px 0 26px",
                color: T.textPrimary,
                minHeight: "1.2em",
              }}
            >
              <Resolve text="SIGNAL DETECTED" reduced={reduced} />
            </h1>
            <div style={{ maxWidth: 560, borderLeft: `2px solid ${T.hairline}`, paddingLeft: 18 }}>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: T.textPrimary, margin: 0 }}>
                Operative. A message just hit a student&rsquo;s inbox. It says her game account gets
                deleted in 24 hours. She almost clicked. Something about it reads wrong.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: T.textSecondary, margin: "12px 0 0" }}>
                Find out what.
              </p>
            </div>
            <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 18 }}>
              {amberButton("OPEN BRIEFING", () => go("briefing"))}
              <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled, letterSpacing: "0.06em" }}>
                CASE 001
              </span>
            </div>
          </section>
        )}

        {/* ================================ 2 · BRIEFING ================================ */}
        {scene === "briefing" && (
          <section>
            {/* case header with CONFIDENTIAL band — sanctioned exception */}
            <div style={{ border: `1px solid ${T.hairline}`, borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  background: T.bandBlue,
                  color: T.inkBlack,
                  fontFamily: MONO,
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.24em",
                  textAlign: "center",
                  padding: "6px 0",
                }}
              >
                CONFIDENTIAL
              </div>
              <div style={{ background: T.panel, padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  {eyebrow("CASE 001 // SUSPECTED ACTOR: PHANTOM HOOK")}
                  <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled }}>ARC // SIGNAL ROOM</span>
                </div>
                <h2 style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, margin: "14px 0 4px" }}>
                  The 24-Hour Threat
                </h2>
                <p style={{ color: T.textSecondary, fontSize: 15, lineHeight: 1.6, margin: "10px 0 22px", maxWidth: 560 }}>
                  One intercepted email. The sender wants a password before anyone slows down enough
                  to read carefully. You read carefully.
                </p>

                {/* pinned objectives */}
                <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8, maxWidth: 480 }}>
                  {["Review the intercepted email", "Flag every detail that doesn't belong", "Report back to WREN"].map(
                    (o, i) => (
                      <li
                        key={o}
                        style={{
                          fontFamily: MONO,
                          fontSize: 13,
                          color: T.textPrimary,
                          background: T.panelRaised,
                          border: `1px solid ${T.hairline}`,
                          borderRadius: 2,
                          padding: "10px 14px",
                          display: "flex",
                          gap: 12,
                        }}
                      >
                        <span style={{ color: T.arcCyan }}>{String(i + 1).padStart(2, "0")}</span>
                        {o}
                      </li>
                    ),
                  )}
                </ol>

                <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                  <HandlerChip reduced={reduced} speaking />
                  <p style={{ margin: 0, fontSize: 14, color: T.textSecondary, fontStyle: "italic" }}>
                    &ldquo;Three things in this message don&rsquo;t belong. Show me you can find all three.&rdquo;
                  </p>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 26 }}>{amberButton("OPEN THE EVIDENCE", () => go("inspect"))}</div>
          </section>
        )}

        {/* ================================ 3 · INSPECT ================================ */}
        {scene === "inspect" && (
          <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 20, alignItems: "start" }} className="sr-inspect-grid">
            {/* the evidence — paper, and the ONLY surface interference touches */}
            <div style={{ position: "relative" }}>
              {eyebrow("EVIDENCE 01 · INTERCEPTED EMAIL · TAP ANYTHING THAT DOESN'T BELONG", T.actionAmber)}
              <div
                className={reduced ? undefined : "sr-whisper"}
                style={{
                  marginTop: 12,
                  background: T.paper,
                  color: T.fileInk,
                  borderRadius: 2,
                  padding: "26px 28px",
                  boxShadow: "0 2px 0 rgba(0,0,0,0.55)",
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 12.5, borderBottom: `1px solid ${T.fileInk}22`, paddingBottom: 12, marginBottom: 14 }}>
                  <div>
                    <span style={{ opacity: 0.55 }}>FROM:&nbsp;&nbsp;</span>
                    <button className="sr-tell" data-hit={found.includes("sender") || undefined} onClick={() => flag(TELLS[0])}>
                      GameHub Support &lt;support@gamehub-rewards-center.com&gt;
                    </button>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ opacity: 0.55 }}>TO:&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <button className="sr-decoy" onClick={miss}>maya.k@homemail.com</button>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ opacity: 0.55 }}>SUBJ:&nbsp;&nbsp;</span>
                    <button className="sr-tell" data-hit={found.includes("urgency") || undefined} onClick={() => flag(TELLS[1])}>
                      URGENT: your account will be DELETED in 24 hours
                    </button>
                  </div>
                </div>
                <p style={{ margin: "0 0 12px" }}>
                  <button className="sr-decoy" onClick={miss}>Hi player,</button>
                </p>
                <p style={{ margin: "0 0 12px" }}>
                  <button className="sr-decoy" onClick={miss}>
                    We detected a problem with your GameHub account.
                  </button>{" "}
                  To keep your skins and progress, you must verify your password now:
                </p>
                <p style={{ margin: "0 0 14px" }}>
                  <button className="sr-tell" data-hit={found.includes("link") || undefined} onClick={() => flag(TELLS[2])} style={{ fontFamily: MONO, fontSize: 13 }}>
                    [ VERIFY MY ACCOUNT → gamehub.support-verify.net ]
                  </button>
                </p>
                <p style={{ margin: 0, opacity: 0.75 }}>
                  <button className="sr-decoy" onClick={miss}>The GameHub Team</button>
                </p>
              </div>
            </div>

            {/* analyst log — terminal glass, never corrupted */}
            <aside style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "16px 16px 18px", position: "sticky", top: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                {eyebrow("ANALYST LOG")}
                <span style={{ fontFamily: MONO, fontSize: 12, color: allFound ? T.confirmedGreen : T.textSecondary }}>
                  {found.length}/{TELLS.length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {TELLS.map((t) => {
                  const hit = found.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      style={{
                        fontFamily: MONO,
                        fontSize: 12,
                        padding: "8px 10px",
                        borderRadius: 2,
                        border: `1px solid ${hit ? T.confirmedGreen : T.hairline}`,
                        color: hit ? T.confirmedGreen : T.textDisabled,
                        background: hit ? `${T.confirmedGreen}14` : "transparent",
                      }}
                    >
                      {hit ? "■ " : "□ "}
                      {hit ? t.label : "████████████"}
                    </div>
                  );
                })}
              </div>

              {feedback && (
                <p
                  role="status"
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    margin: "14px 0 0",
                    color: feedback.kind === "hit" ? T.confirmedGreen : T.textSecondary,
                  }}
                >
                  {feedback.text}
                </p>
              )}

              {allFound && (
                <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: T.textSecondary, fontStyle: "italic" }}>
                    &ldquo;All three. Nicely done, Operative. Filing the case.&rdquo;
                  </p>
                  {amberButton("CLOSE THE CASE", () => go("closed"))}
                </div>
              )}
            </aside>
          </section>
        )}

        {/* =============================== 4 · CASE CLOSED =============================== */}
        {scene === "closed" && (
          <section style={{ maxWidth: 620, margin: "0 auto", paddingTop: 30 }}>
            {eyebrow("AFTER-ACTION REPORT: CASE 001", T.clearanceBrass)}

            {/* dossier on paper */}
            <div
              style={{
                marginTop: 14,
                background: T.manila,
                color: T.fileInk,
                borderRadius: 2,
                padding: "26px 28px 30px",
                boxShadow: "0 2px 0 rgba(0,0,0,0.55)",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 108,
                    height: 128,
                    background: T.fileInk,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    padding: 10,
                  }}
                >
                  <div style={{ display: "grid", gap: 6, width: "100%" }}>
                    {[80, 100, 60, 90].map((w, i) => (
                      <div key={i} style={{ height: 8, width: `${w}%`, background: "#3A4654" }} />
                    ))}
                    <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#5A6B80", marginTop: 6, letterSpacing: "0.06em" }}>
                      PORTRAIT PENDING
                      <br />
                      DECLASSIFICATION
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6 }}>
                    THREAT ACTOR DOSSIER
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, margin: "6px 0 10px" }}>
                    PHANTOM HOOK
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    <strong>M.O.:&nbsp;</strong>sends fake &ldquo;urgent&rdquo; messages dressed up as companies you
                    trust. Wants you to click before you think. Defeated by anyone who slows down and
                    reads the address.
                  </p>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${T.fileInk}26`, marginTop: 20, paddingTop: 16 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6, marginBottom: 6 }}>
                  YOUR MOVE IN THE REAL WORLD
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                  Real companies don&rsquo;t give you 24 hours to save your account. When a message rushes
                  you, slow down and check the sender&rsquo;s address. Still feels wrong? Report it in the
                  app, and loop in an adult you trust.
                </p>
              </div>

              {/* the stamp */}
              <div
                aria-hidden={!stamped}
                className={stamped && !reduced ? "sr-stamp-in" : undefined}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 22,
                  transform: "rotate(-3deg)",
                  border: `3px solid ${stamped ? "#8A2E2E" : "transparent"}`,
                  color: "#8A2E2E",
                  fontFamily: MONO,
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: "0.18em",
                  padding: "6px 12px",
                  borderRadius: 3,
                  opacity: stamped ? 0.9 : 0,
                }}
              >
                CASE CLOSED
              </div>
            </div>

            {/* clearance progress — the only brass on any screen */}
            <div
              style={{
                marginTop: 18,
                background: T.panel,
                border: `1px solid ${T.hairline}`,
                borderRadius: 3,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: T.clearanceBrass }}>
                CLEARANCE: TRAINEE ▸ CONFIDENTIAL
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
                CASES CLOSED&nbsp;
                <span style={{ color: T.clearanceBrass }}>{stamped ? "1" : "0"}</span> / 5
              </span>
            </div>

            {/* full stop — no autoplay, no "one more" */}
            {stamped && (
              <p style={{ textAlign: "center", marginTop: 44, fontFamily: MONO, fontSize: 13, color: T.textSecondary, letterSpacing: "0.06em" }}>
                That&rsquo;s the mission, Operative. ARC out.
              </p>
            )}
          </section>
        )}
      </div>

      {/* demo-only restart, quiet and symmetric */}
      {scene !== "transmission" && (
        <button
          onClick={() => {
            setScene("transmission");
            setFound([]);
            setFeedback(null);
            setStamped(false);
          }}
          style={{
            position: "fixed",
            bottom: 14,
            right: 16,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.06em",
            color: T.textDisabled,
            background: "transparent",
            border: `1px solid ${T.hairline}`,
            borderRadius: 2,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          ↺ RESTART PROOF OF CONCEPT
        </button>
      )}

      <style>{`
        .sr-btn { transition: filter 140ms cubic-bezier(0.2, 0, 0, 1); }
        .sr-btn:hover { filter: brightness(1.08); }
        .sr-btn:active { transform: translateY(1px); }

        .sr-wavebar { animation: srWave 0.9s cubic-bezier(0.2, 0, 0, 1) infinite alternate; }
        @keyframes srWave { from { height: 4px; } to { height: 14px; } }

        /* tells + decoys: printed text, flaggable */
        .sr-tell, .sr-decoy {
          background: none; border: none; padding: 0 2px; margin: 0;
          font: inherit; color: inherit; cursor: pointer; text-align: left;
          border-radius: 2px;
        }
        .sr-tell:hover, .sr-decoy:hover { background: rgba(20, 24, 29, 0.08); }
        .sr-tell[data-hit] {
          background: ${T.actionAmber}33;
          outline: 2px solid ${T.actionAmber};
          cursor: default;
        }
        .sr-tell[data-hit]::after {
          content: " ⚑";
          color: #A66A00;
        }

        /* whisper-grade interference — evidence only, never ARC chrome */
        .sr-whisper::before {
          content: "";
          position: absolute; left: 0; right: 0; height: 1px;
          background: rgba(20, 24, 29, 0.18);
          animation: srScan 7s linear infinite;
          pointer-events: none;
        }
        @keyframes srScan {
          0%, 92% { opacity: 0; top: 0; }
          93% { opacity: 1; top: 12%; }
          96% { opacity: 1; top: 78%; }
          97%, 100% { opacity: 0; top: 100%; }
        }

        /* stamp: 90ms scale 1.15→1.0, one shake frame, ink settle */
        .sr-stamp-in { animation: srStamp 300ms cubic-bezier(0.2, 0, 0, 1); }
        @keyframes srStamp {
          0% { transform: rotate(-3deg) scale(1.15); opacity: 0; }
          30% { transform: rotate(-3deg) scale(1.0); opacity: 1; }
          38% { transform: rotate(-3deg) scale(1.0) translate(2px, 0); }
          46% { transform: rotate(-3deg) scale(1.0) translate(0, 0); }
          100% { transform: rotate(-3deg) scale(1.0); opacity: 0.9; }
        }

        @media (max-width: 760px) {
          .sr-inspect-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sr-wavebar, .sr-whisper::before, .sr-stamp-in { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
