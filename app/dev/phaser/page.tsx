"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MemoryMatchPhaser = dynamic(
  () => import("@/app/components/exercises/MemoryMatchPhaser"),
  { ssr: false },
);

const MemoryMatchReact = dynamic(
  () => import("@/app/components/exercises/MemoryMatch"),
  { ssr: false },
);

export default function PhaserDevPage() {
  const [engine, setEngine] = useState<"phaser" | "react">("phaser");
  const [runId, setRunId] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#04050d",
        color: "#e8edff",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Phaser proof-of-concept · MemoryMatch
            </h1>
            <p style={{ opacity: 0.7, fontSize: 13, margin: "6px 0 0" }}>
              A/B compare the Phaser-engine version against the existing React
              version. Same game, two different rendering stacks.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setEngine("phaser");
                setRunId((n) => n + 1);
              }}
              style={btn(engine === "phaser")}
            >
              Phaser
            </button>
            <button
              onClick={() => {
                setEngine("react");
                setRunId((n) => n + 1);
              }}
              style={btn(engine === "react")}
            >
              React (current)
            </button>
            <button
              onClick={() => setRunId((n) => n + 1)}
              style={{
                ...btn(false),
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              Restart
            </button>
          </div>
        </header>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 12,
            minHeight: 720,
          }}
        >
          <div
            key={`${engine}-${runId}`}
            style={{ width: "100%", height: 700 }}
          >
            {engine === "phaser" ? (
              <MemoryMatchPhaser
                onComplete={(score) =>
                  console.log("[phaser] complete", score)
                }
                onCorrect={() => console.log("[phaser] correct")}
                onWrong={() => console.log("[phaser] wrong")}
              />
            ) : (
              <MemoryMatchReact
                onComplete={(score) => console.log("[react] complete", score)}
                onCorrect={() => console.log("[react] correct")}
                onWrong={() => console.log("[react] wrong")}
              />
            )}
          </div>
        </div>

        <footer style={{ opacity: 0.5, fontSize: 12 }}>
          Open the browser console to see the lifecycle callbacks fire.
        </footer>
      </div>
    </main>
  );
}

function btn(active: boolean): React.CSSProperties {
  return {
    background: active
      ? "linear-gradient(135deg,#00e5ff,#7c5cff)"
      : "transparent",
    color: active ? "#04050d" : "#e8edff",
    border: active
      ? "1px solid transparent"
      : "1px solid rgba(255,255,255,0.2)",
    borderRadius: 999,
    padding: "8px 18px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    cursor: "pointer",
  };
}
