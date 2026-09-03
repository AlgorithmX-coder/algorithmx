/**
 * Shared "Welcome back" resume screen for the Phone / Console / War Room
 * runtimes. Rendered in the same slot as the boot / lock screen when a saved
 * mid-case stage exists. Themed by the block's accent; neutral text works on
 * all three dark panels.
 */
const MONO = "ui-monospace, 'SF Mono', 'Fira Code', monospace";

export function ResumePrompt({
  caseNumber,
  title,
  acc,
  atLabel,
  onContinue,
  onRestart,
}: {
  caseNumber: string;
  title: string;
  acc: string;
  atLabel: string;
  onContinue: () => void;
  onRestart: () => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px 30px", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 8 }}>
        {caseNumber} · Welcome back
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.01em", color: "#fff", marginBottom: 8 }}>Your progress is saved</div>
      <div style={{ fontSize: 14, color: "#aeb6c8", marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: acc, marginBottom: 26 }}>Pick up at {atLabel}</div>
      <button
        onClick={onContinue}
        style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".03em", color: "#0b0b14", background: acc, border: 0, borderRadius: 7, padding: "13px 20px", cursor: "pointer", marginBottom: 11 }}
      >
        ▸ Continue
      </button>
      <button
        onClick={onRestart}
        style={{ fontFamily: MONO, fontWeight: 600, fontSize: 13, color: "#aeb6c8", background: "transparent", border: "1px solid rgba(255,255,255,.22)", borderRadius: 7, padding: "10px 20px", cursor: "pointer" }}
      >
        Start over
      </button>
    </div>
  );
}
