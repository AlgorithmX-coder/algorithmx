"use client";

/**
 * ExerciseHowTo — small, persistent instruction bar that sits at the top
 * of an exercise wrapper. Designed to fill the empty space above the
 * canvas with a kid-friendly "what to do" reminder so players don't need
 * to recall the intro overlay mid-game.
 *
 * Drop in as the first child of an exercise wrapper:
 *
 *   <ExerciseHowTo
 *     title="Protect the Data"
 *     steps={[
 *       { glyph: "🛡️", text: "Block PRIVATE info" },
 *       { glyph: "✅", text: "Let SAFE info through" },
 *     ]}
 *     accent="#60a5fa"
 *   />
 *
 * It is purely visual — no game-state interaction — and uses inline
 * styles so it works anywhere without touching shared CSS.
 */

interface Step {
  glyph: string;
  text: string;
}

export default function ExerciseHowTo({
  title,
  steps,
  accent = "#60a5fa",
}: {
  title: string;
  steps: Step[];
  accent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "10px 14px 12px",
        borderBottom: `1px solid ${accent}33`,
        background: `linear-gradient(180deg, ${accent}14 0%, rgba(5,6,15,0) 100%)`,
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: accent,
          fontWeight: 900,
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
        />
        How to play · {title}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${accent}33`,
              fontSize: 12,
              color: "#e2e8f0",
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            <span style={{ fontSize: 14 }}>{s.glyph}</span>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
