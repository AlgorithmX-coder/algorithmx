"use client";

/**
 * Cyber Explorers product landing — the public face of the Signal Room
 * tier (ages 10–13). Replaces the pre-design-session page (12-week /
 * ages 11–14 / code-rain era), which contradicted the locked canon in
 * docs/explorers/algorithmx-explorers-art-direction.md.
 *
 * Register: Signal Room chrome adapted for a dual audience — outcome
 * language for parents, competence fantasy for the 10–13s reading over
 * their shoulder. US English. No emoji, no bounce, no neon-hacker
 * cliché. Waitlist CTA posts to the existing /api/waitlist.
 */

import { useState } from "react";
import Link from "next/link";
import { MONO, BODY, T, BAND_BY_CLASSIFICATION } from "@/app/explorers/engine/tokens";
import { Resolve, useReducedMotion } from "@/app/explorers/engine/primitives";

/* ------------------------------------------------------------ content */

const ACTORS = [
  { code: "PHANTOM HOOK", mo: "Urgent fakes dressed as companies you trust.", declassified: true },
  { code: "MIMIC", mo: "" },
  { code: "SKELETON KEY", mo: "" },
  { code: "SIREN", mo: "" },
  { code: "GHOSTWRITER", mo: "" },
  { code: "PACKRAT", mo: "" },
];

const BEATS = [
  { name: "Incoming transmission", desc: "A 40-second cold open. Something on the network is wrong, and it just became your case." },
  { name: "Briefing", desc: "WREN — your handler — lays out the objectives on the mission-control surface. Three, never more." },
  { name: "Three investigation cycles", desc: "Learn the concept, run the fieldwork, prove it at a checkpoint. Real artifacts: emails, URLs, chat logs." },
  { name: "The incident", desc: "The case goes live. Triage the wave, make the containment call, put it on the record." },
  { name: "Debrief", desc: "The after-action report — including the part that matters most: your move in the real world, this week." },
  { name: "Case closed", desc: "The dossier is declassified into the archive, the stamp comes down, and the session ends. On purpose." },
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
    d: "Every point maps to something demonstrated. There is no XP for logging in, watching, or grinding — and nothing is ever taken away.",
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
    d: "Explorers train to anticipate and counter attacks. They never write or send one — not even as an exercise. It opens with signing the ARC Code.",
  },
  {
    t: "Every mission lands in real life",
    d: "Debriefs end with one concrete action for the week: check the sender, turn on two-factor, report and tell an adult they trust.",
  },
  {
    t: "Evidence you can see",
    d: "Checkpoints produce real records of what your child can do — not minutes watched, but calls made correctly.",
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

/* ------------------------------------------------- signal waitlist form */

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
        }}
      >
        ON THE LIST — we&rsquo;ll signal you at launch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 460 }}>
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
          height: 48,
          fontFamily: MONO,
          fontSize: 13,
          color: T.textPrimary,
          background: T.panel,
          border: `1px solid ${T.hairline}`,
          borderRadius: 3,
          padding: "0 14px",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = T.arcCyan)}
        onBlur={(e) => (e.currentTarget.style.borderColor = T.hairline)}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="cx-btn"
        style={{
          height: 48,
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "0.06em",
          color: T.inkBlack,
          background: T.actionAmber,
          border: "none",
          borderRadius: 3,
          padding: "0 22px",
          cursor: state === "loading" ? "wait" : "pointer",
          opacity: state === "loading" ? 0.7 : 1,
        }}
      >
        {state === "loading" ? "TRANSMITTING…" : "JOIN THE WAITLIST"}
      </button>
      {state === "error" && (
        <p style={{ width: "100%", margin: 0, fontSize: 13, color: T.threatRed }}>{errorMsg}</p>
      )}
    </form>
  );
}

/* ------------------------------------------------------- small pieces */

function Eyebrow({ text, color = T.textSecondary }: { text: string; color?: string }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color, textTransform: "uppercase" }}>
      {text}
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Eyebrow text={eyebrow} color={T.arcCyan} />
      <h2 style={{ fontFamily: MONO, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 600, margin: "12px 0 0", color: T.textPrimary }}>
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 16, lineHeight: 1.65, color: T.textSecondary, margin: "12px 0 0", maxWidth: 620 }}>{sub}</p>
      )}
    </div>
  );
}

function RedactionBars() {
  return (
    <div style={{ display: "grid", gap: 5, marginTop: 8 }}>
      {[90, 65, 78].map((w, i) => (
        <div key={i} style={{ height: 7, width: `${w}%`, background: T.hairline }} />
      ))}
    </div>
  );
}

/* ============================================================== page */

export default function CyberExplorersLanding() {
  const reduced = useReducedMotion();

  return (
    <main style={{ background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflowX: "hidden" }}>
      {/* the room */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `linear-gradient(${T.hairline}1E 1px, transparent 1px), linear-gradient(90deg, ${T.hairline}1E 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

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
          background: `${T.inkBlack}E6`,
          backdropFilter: "blur(8px)",
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
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.08em",
              color: T.inkBlack,
              background: T.actionAmber,
              borderRadius: 3,
              padding: "8px 14px",
              textDecoration: "none",
            }}
          >
            WAITLIST
          </a>
        </div>
      </nav>

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)", gap: 48, alignItems: "center", padding: "84px 0 72px" }} className="cx-two-col">
          <div>
            <Eyebrow text="AlgorithmX Cybersecurity · Ages 10–13" color={T.arcCyan} />
            <h1 style={{ fontFamily: MONO, fontSize: "clamp(34px, 5.5vw, 56px)", fontWeight: 600, lineHeight: 1.12, margin: "18px 0 20px" }}>
              <Resolve text="Train the kid" reduced={reduced} />
              <br />
              <Resolve text="who spots the scam." reduced={reduced} delay={350} />
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: T.textSecondary, maxWidth: 520, margin: "0 0 12px" }}>
              Cyber Explorers is a 20-mission cybersecurity course where your child joins{" "}
              <span style={{ color: T.textPrimary }}>ARC</span> — an anomaly-response unit hunting a network called{" "}
              <span style={{ color: T.textPrimary }}>STATIC</span> — and learns to read the internet the way an
              analyst does.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: T.textSecondary, maxWidth: 520, margin: "0 0 28px" }}>
              Real skills. Real judgment. Zero jump scares.
            </p>
            <div id="waitlist">
              <SignalWaitlist source="hero" />
            </div>
            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.05em", color: T.textDisabled, margin: "18px 0 0" }}>
              ICO CHILDREN&rsquo;S CODE–ALIGNED · NO ADS · NO LOOT BOXES · SESSIONS END ON PURPOSE
            </p>
          </div>

          {/* briefing-card mock — the product, honestly */}
          <div aria-hidden style={{ border: `1px solid ${T.hairline}`, borderRadius: 3, overflow: "hidden", boxShadow: `0 0 60px ${T.arcCyan}0F` }}>
            <div style={{ background: BAND_BY_CLASSIFICATION.CONFIDENTIAL, color: T.inkBlack, fontFamily: MONO, fontWeight: 600, fontSize: 11, letterSpacing: "0.24em", textAlign: "center", padding: "5px 0" }}>
              CONFIDENTIAL
            </div>
            <div style={{ background: T.panel, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <Eyebrow text="Case 001 // suspected actor: PHANTOM HOOK" />
                <span style={{ fontFamily: MONO, fontSize: 10, color: T.textDisabled }}>ARC // SIGNAL ROOM</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 21, fontWeight: 600, margin: "12px 0 14px" }}>The 24-Hour Threat</div>
              <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
                {["Break down how the lure works", "Flag every detail that doesn't belong", "Profile the actor and contain the wave"].map((o, i) => (
                  <div key={o} style={{ fontFamily: MONO, fontSize: 12, color: T.textPrimary, background: T.panelRaised, border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "8px 12px", display: "flex", gap: 10 }}>
                    <span style={{ color: T.arcCyan }}>{String(i + 1).padStart(2, "0")}</span>
                    {o}
                  </div>
                ))}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 12px", background: T.panelRaised, border: `1px solid ${T.hairline}`, borderRadius: 3 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2, height: 14 }}>
                  {[6, 11, 8, 12, 5].map((h, i) => (
                    <span key={i} style={{ width: 2, height: h, background: T.arcCyan }} />
                  ))}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: T.textSecondary }}>WREN — HANDLER</span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: T.arcCyan, borderLeft: `1px solid ${T.hairline}`, paddingLeft: 9 }}>CHANNEL LIVE</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── PREMISE ────────────────────────────────────────────── */}
        <section id="mission" style={{ padding: "56px 0" }}>
          <SectionHead
            eyebrow="The premise"
            title="Your child is the operative."
            sub="No cartoon sidekicks, no classroom. A calm handler on the radio, real-looking evidence on the desk, and a network of threat actors who play the exact tricks the real internet plays."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cx-three-col">
            {[
              { t: "THE UNIT", h: "ARC — Anomaly Response Command", d: "The people who find the signal in the noise. Your child joins as a Trainee, earns a callsign, and works real cases from a mission-control desk." },
              { t: "THE ENEMY", h: "STATIC", d: "Not one villain — a network. Each mission's threat actor runs a real internet trick: the urgent fake, the copied voice, the look-alike login page." },
              { t: "THE OPERATIVE", h: "That's your kid", d: "The one in the room who notices what everyone else missed. The fantasy here isn't power — it's competence. Ten-to-thirteens can tell the difference." },
            ].map((c) => (
              <div key={c.t} style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "20px 22px" }}>
                <Eyebrow text={c.t} color={T.arcCyan} />
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, margin: "10px 0 8px" }}>{c.h}</div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.textSecondary, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>

          {/* dossier wall */}
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }} className="cx-dossier-grid">
            {ACTORS.map((a) => (
              <div
                key={a.code}
                style={{
                  background: a.declassified ? T.manila : T.panel,
                  color: a.declassified ? T.fileInk : T.textSecondary,
                  border: `1px solid ${a.declassified ? T.manila : T.hairline}`,
                  borderRadius: 2,
                  padding: "12px 12px 14px",
                  minHeight: 110,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.08em", opacity: 0.6 }}>
                  {a.declassified ? "DOSSIER — DECLASSIFIED" : "DOSSIER — SEALED"}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 600, margin: "6px 0 0" }}>{a.code}</div>
                {a.declassified ? (
                  <p style={{ fontSize: 11.5, lineHeight: 1.5, margin: "8px 0 0" }}>{a.mo}</p>
                ) : (
                  <RedactionBars />
                )}
              </div>
            ))}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.05em", color: T.textDisabled, margin: "12px 0 0" }}>
            DOSSIERS DECLASSIFY AS CASES CLOSE — THE ARCHIVE IS THE REVISION.
          </p>
        </section>

        {/* ── MISSION BEATS ──────────────────────────────────────── */}
        <section style={{ padding: "56px 0" }}>
          <SectionHead
            eyebrow="How a mission works"
            title="Six beats. One hour. Every week."
            sub="Each mission is a complete case with a beginning, a middle, and a deliberate end — built for 45–60 minutes, with save-and-resume anywhere."
          />
          <div style={{ display: "grid", gap: 0 }}>
            {BEATS.map((b, i) => (
              <div key={b.name} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 18, padding: "18px 0", borderTop: `1px solid ${T.hairline}`, borderBottom: i === BEATS.length - 1 ? `1px solid ${T.hairline}` : "none" }}>
                <div style={{ fontFamily: MONO, fontSize: 13, color: T.arcCyan, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{b.name}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: T.textSecondary, margin: 0, maxWidth: 640 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CURRICULUM ─────────────────────────────────────────── */}
        <section id="curriculum" style={{ padding: "56px 0" }}>
          <SectionHead
            eyebrow="The curriculum"
            title="20 missions. 4 clearance blocks."
            sub="Every five closed cases raise your child's clearance — earned by demonstrated skill, never bought with points. The season builds to unmasking STATIC's coordinator in Mission 20."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="cx-two-col">
            {BLOCKS.map((b) => (
              <div key={b.n} style={{ border: `1px solid ${T.hairline}`, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ background: BAND_BY_CLASSIFICATION[b.clearance], color: T.inkBlack, fontFamily: MONO, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.2em", textAlign: "center", padding: "4px 0" }}>
                  BLOCK {b.n} → CLEARANCE: {b.clearance}
                </div>
                <div style={{ background: T.panel, padding: "18px 20px" }}>
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
        <section style={{ padding: "56px 0" }}>
          <SectionHead
            eyebrow="The mechanics"
            title="Seven verbs an analyst actually uses."
            sub="No worksheets wearing a game costume. Each mission's fieldwork runs on mechanics built for how 10–13s think — inference, consequence, anticipation."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
            {VERBS.map((m) => (
              <div key={m.v} style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "14px 16px" }}>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: T.arcCyan }}>{m.v}</span>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: T.textSecondary, margin: "6px 0 0" }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: "16px 0 0", maxWidth: 640 }}>
            <span style={{ fontFamily: MONO, color: T.textPrimary }}>A note on SIMULATE:</span> professional defenders
            train by anticipating the attacker&rsquo;s next move. Your child predicts and counters attacks —{" "}
            <span style={{ color: T.textPrimary }}>they never write or send one.</span> That line is hard-coded.
          </p>
        </section>

        {/* ── PROGRESSION ────────────────────────────────────────── */}
        <section style={{ padding: "56px 0" }}>
          <SectionHead
            eyebrow="Progression"
            title="From Trainee to ULTRA."
            sub="XP tracks pace. Clearances certify skill. Dossiers make revision something kids do on purpose. Nothing is randomized, nothing expires, nothing is for sale."
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {LADDER.map((l, i) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    padding: "9px 16px",
                    borderRadius: 3,
                    color: i === 0 ? T.textSecondary : T.inkBlack,
                    background: i === 0 ? "transparent" : BAND_BY_CLASSIFICATION[l as keyof typeof BAND_BY_CLASSIFICATION],
                    border: i === 0 ? `1px solid ${T.hairline}` : "none",
                  }}
                >
                  {l}
                </span>
                {i < LADDER.length - 1 && <span style={{ fontFamily: MONO, color: T.textDisabled }}>▸</span>}
              </div>
            ))}
          </div>
        </section>

        {/* ── PARENTS ────────────────────────────────────────────── */}
        <section id="parents" style={{ padding: "56px 0" }}>
          <SectionHead
            eyebrow="For parents"
            title="Engagement without the tricks."
            sub="A cybersecurity course shouldn't use the manipulation patterns it warns kids about. Ours can't — the same rules that shaped Cyber Heroes are wired into this tier's design."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="cx-two-col">
            {PARENT_POINTS.map((p) => (
              <div key={p.t} style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "16px 18px" }}>
                <div style={{ fontFamily: MONO, fontSize: 13.5, fontWeight: 600, marginBottom: 6, color: T.textPrimary }}>{p.t}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>{p.d}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, background: T.panelRaised, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Coming from Cyber Heroes?</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textSecondary, margin: 0, maxWidth: 520 }}>
                Explorers is the graduation tier: ages 6–9 train alongside the heroes; ages 10–13 become the operative.
                Same platform, new world — and Heroes is never required.
              </p>
            </div>
            <Link href="/cyberheroes" className="cx-navlink" style={{ fontSize: 12, border: `1px solid ${T.hairline}`, borderRadius: 3, padding: "10px 16px" }}>
              CYBER HEROES (AGES 6–9) →
            </Link>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section style={{ padding: "56px 0" }}>
          <SectionHead eyebrow="Questions" title="Cleared for release." />
          <div style={{ display: "grid", gap: 10, maxWidth: 760 }}>
            {FAQS.map((f) => (
              <details key={f.q} className="cx-faq" style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 3 }}>
                <summary
                  style={{
                    cursor: "pointer",
                    listStyle: "none",
                    fontFamily: MONO,
                    fontSize: 13.5,
                    fontWeight: 600,
                    padding: "15px 18px",
                    color: T.textPrimary,
                  }}
                >
                  {f.q}
                </summary>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: T.textSecondary, margin: 0, padding: "0 18px 16px" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────── */}
        <section style={{ padding: "64px 0 72px", textAlign: "center" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <Eyebrow text="Status: Mission 01 in field testing" color={T.confirmedGreen} />
            <h2 style={{ fontFamily: MONO, fontSize: "clamp(26px, 4.5vw, 38px)", fontWeight: 600, margin: "14px 0 12px" }}>
              The room is almost ready.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: T.textSecondary, margin: "0 0 26px" }}>
              Join the waitlist and we&rsquo;ll signal you the moment ARC starts taking recruits.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SignalWaitlist source="footer" />
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ position: "relative", borderTop: `1px solid ${T.hairline}`, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
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
        .cx-btn { transition: filter 140ms cubic-bezier(0.2, 0, 0, 1); }
        .cx-btn:hover { filter: brightness(1.12); }
        .cx-navlink {
          font-family: ${MONO};
          font-size: 11px;
          letter-spacing: 0.08em;
          color: ${T.textSecondary};
          text-decoration: none;
          transition: color 140ms cubic-bezier(0.2, 0, 0, 1);
        }
        .cx-navlink:hover { color: ${T.textPrimary}; }
        .cx-faq summary::-webkit-details-marker { display: none; }
        .cx-faq summary::before {
          content: "▸ ";
          color: ${T.arcCyan};
        }
        .cx-faq[open] summary::before { content: "▾ "; }
        @media (max-width: 900px) {
          .cx-two-col { grid-template-columns: 1fr !important; }
          .cx-three-col { grid-template-columns: 1fr !important; }
          .cx-dossier-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .cx-navlink { display: none; }
          nav .cx-navlink { display: none; }
          .cx-dossier-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          nav a[href="#waitlist"] { display: inline-block !important; }
        }
      `}</style>
    </main>
  );
}
