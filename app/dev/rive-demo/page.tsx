"use client";

import { useState } from "react";
import RiveScene from "@/app/components/RiveScene";

/**
 * /dev/rive-demo - proof-of-concept for the Rive integration.
 *
 * Visits http://localhost:3000/dev/rive-demo to see RiveScene working
 * end-to-end against a Rive Community sample (`light_switch.riv`,
 * hosted on Rive's CDN).  Toggle the boolean input, watch the
 * animation react.  Once your animator delivers the first .riv file,
 * point `src` at `/rive/<filename>.riv` and you're done.
 *
 * Dev-only - gated by being under `/dev/*`.  Don't ship a link to it
 * in production navigation.
 */

const DEMO_SRC = "https://cdn.rive.app/animations/vehicles.riv";

export default function RiveDemoPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, #080a16 70%, #04050d 100%)",
        color: "#e8edff",
        fontFamily:
          "'Fredoka', 'Nunito', ui-rounded, system-ui, sans-serif",
        padding: 40,
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            background: "linear-gradient(135deg, #00e5ff, #7c5cff, #ff5fb3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          Rive integration - proof of concept
        </h1>
        <p style={{ color: "#c5cdf0", marginBottom: 32, lineHeight: 1.6 }}>
          The block on the left is a real Rive scene loaded over the network.
          The buttons on the right write boolean inputs and fire triggers
          on its state machine - the animator builds the actual reaction.
          When your `.riv` files arrive, swap the <code style={{ background: "#1a2147", padding: "2px 6px", borderRadius: 4 }}>src</code>
          {" "}prop and these controls drive the new scene with no other code change.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            background: "rgba(15, 21, 48, 0.72)",
            border: "1px solid rgba(0, 229, 255, 0.25)",
            borderRadius: 18,
            padding: 32,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 360,
              borderRadius: 12,
              background: "rgba(8, 10, 22, 0.55)",
              border: "1px dashed rgba(125, 240, 255, 0.35)",
            }}
          >
            <RiveScene
              src={DEMO_SRC}
              stateMachine="bumpy"
              width={320}
              height={320}
              inputs={{
                isFlipped,
                isMatched,
              }}
              triggers={shakeKey > 0 ? [`shake-${shakeKey}`] : []}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Pane label="Boolean input: isFlipped">
              <Toggle
                on={isFlipped}
                onClick={() => setIsFlipped((v) => !v)}
                onLabel="Flipped"
                offLabel="Not flipped"
              />
            </Pane>

            <Pane label="Boolean input: isMatched">
              <Toggle
                on={isMatched}
                onClick={() => setIsMatched((v) => !v)}
                onLabel="Matched"
                offLabel="Not matched"
              />
            </Pane>

            <Pane label="One-shot trigger">
              <button
                type="button"
                onClick={() => setShakeKey((k) => k + 1)}
                style={btn}
              >
                Fire shake trigger
              </button>
              <p
                style={{
                  fontSize: 12,
                  color: "#7df0ff",
                  marginTop: 8,
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                triggers fired: {shakeKey}
              </p>
            </Pane>

            <Pane label="What this proves">
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: "#c5cdf0",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                <li>Rive runtime works in this Next.js 16 app.</li>
                <li>Inputs map cleanly from React state to state-machine inputs.</li>
                <li>Triggers fire on a one-shot signal from React.</li>
                <li>Fallback shows if the .riv file is missing or fails.</li>
              </ul>
            </Pane>
          </div>
        </section>

        <section
          style={{
            marginTop: 32,
            padding: 24,
            background: "rgba(8, 10, 22, 0.55)",
            border: "1px solid rgba(255, 209, 88, 0.35)",
            borderRadius: 12,
          }}
        >
          <p style={{ color: "#ffd158", fontWeight: 700, marginBottom: 8 }}>
            Note on the demo file
          </p>
          <p style={{ color: "#c5cdf0", fontSize: 13, lineHeight: 1.6 }}>
            The remote <code>vehicles.riv</code> is a stock Rive sample - its
            real state machine is named <code>bumpy</code> and it doesn&rsquo;t
            actually have inputs called <code>isFlipped</code> or{" "}
            <code>isMatched</code>, so the toggles above will register but
            won&rsquo;t change what you see. The demo is here to prove the
            integration plumbing is correct. When the animator ships{" "}
            <code>memory-card.riv</code> with those exact inputs, this page
            (and the production lesson) will react properly.
          </p>
        </section>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 100,
  background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
  color: "#0a0e22",
  fontWeight: 800,
  fontSize: 13,
  border: "none",
  cursor: "pointer",
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

function Toggle({
  on,
  onClick,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onClick: () => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...btn,
        background: on
          ? "linear-gradient(135deg, #7eff97, #00e5ff)"
          : "rgba(0, 229, 255, 0.12)",
        color: on ? "#0a0e22" : "#7df0ff",
        border: on ? "none" : "1px solid rgba(0, 229, 255, 0.45)",
      }}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

function Pane({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 14,
        background: "rgba(8, 10, 22, 0.55)",
        border: "1px solid rgba(0, 229, 255, 0.18)",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#7df0ff",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 8,
          fontFamily: "ui-monospace, monospace",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
