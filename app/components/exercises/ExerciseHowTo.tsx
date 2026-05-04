"use client";

/**
 * ExerciseHowTo — small persistent instruction bar at the top of an
 * exercise wrapper. Pixar-warm styling: dusk-glass pills with cream
 * text so it reads against any background palette (light or dark).
 *
 * Drop in as the first child of an exercise wrapper:
 *
 *   <ExerciseHowTo
 *     title="Protect the Data"
 *     steps={[
 *       { glyph: "🛡️", text: "Block PRIVATE info" },
 *       { glyph: "✅", text: "Let SAFE info through" },
 *     ]}
 *     accent="#3a7bff"
 *   />
 */

interface Step {
  glyph: string;
  text: string;
}

export default function ExerciseHowTo({
  title,
  steps,
  accent = "#3a7bff",
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
        gap: 8,
        padding: "12px 16px 14px",
        background: "rgba(15, 21, 48, 0.62)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(0, 229, 255, 0.22)",
        boxShadow: "0 8px 18px -8px rgba(8, 10, 22, 0.4)",
        userSelect: "none",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 11,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: accent,
          fontWeight: 800,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}55`,
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
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              // Was warm parchment + warm-brown text + warm border —
              // a Pixar dusk pill on a cyber surface. Now cyber glass:
              // dark navy translucent + cyan border + bright text.
              background: "rgba(15, 21, 48, 0.78)",
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "rgba(125, 240, 255, 0.45)",
              fontSize: 12,
              color: "#e8edff",
              fontWeight: 700,
              lineHeight: 1.3,
              boxShadow:
                "0 4px 10px -4px rgba(8, 10, 22, 0.55), 0 0 14px rgba(0, 229, 255, 0.18)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
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
