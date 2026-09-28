"use client";

import { useEffect, useState } from "react";
import { K } from "../engine/tokens";

/* Download, verify link, email me a copy. */
export default function CertificateActions({ serial }: { serial: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [verify, setVerify] = useState(`/verify/${serial}`);
  useEffect(() => {
    setVerify(`${window.location.origin}/verify/${serial}`);
  }, [serial]);

  async function email() {
    setState("sending");
    try {
      const r = await fetch("/api/ai-cleared/certificate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: true }) });
      setState(r.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  const btn = { font: "inherit", fontSize: 14.5, fontWeight: 600, borderRadius: 9, padding: "11px 18px", textDecoration: "none", display: "inline-flex", alignItems: "center", cursor: "pointer" } as const;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 18 }}>
      <a href="/api/ai-cleared/certificate" style={{ ...btn, color: K.onAccent, background: K.accent, border: `1px solid ${K.accent}` }}>Download the PDF</a>
      <a href={`/verify/${serial}`} target="_blank" rel="noopener noreferrer" style={{ ...btn, color: K.ink, background: "transparent", border: `1px solid ${K.edge}` }}>Open the verify page</a>
      <button type="button" onClick={email} disabled={state === "sending" || state === "sent"} style={{ ...btn, color: K.ink, background: "transparent", border: `1px solid ${K.edge}`, opacity: state === "sent" ? 0.7 : 1 }}>
        {state === "idle" ? "Email me a copy" : state === "sending" ? "Sending…" : state === "sent" ? "Sent to your inbox" : "Could not send, try again"}
      </button>
      <span style={{ fontSize: 12.5, color: K.faint, fontFamily: K.mono, overflowWrap: "anywhere" }}>{verify}</span>
    </div>
  );
}
