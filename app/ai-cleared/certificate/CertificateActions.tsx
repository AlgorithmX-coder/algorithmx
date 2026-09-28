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
      const j = (await r.json().catch(() => ({}))) as { emailed?: boolean };
      setState(r.ok && j.emailed ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 20 }}>
      <a href="/api/ai-cleared/certificate" className="cf-btn cf-btn-pri">Download the PDF</a>
      <a href={`/verify/${serial}`} target="_blank" rel="noopener noreferrer" className="cf-btn">Open the verify page</a>
      <button type="button" onClick={email} disabled={state === "sending" || state === "sent"} className="cf-btn" style={{ opacity: state === "sent" ? 0.7 : 1 }}>
        {state === "idle" ? "Email me a copy" : state === "sending" ? "Sending…" : state === "sent" ? "Sent to your inbox" : "Could not send, try again"}
      </button>
      <span style={{ fontSize: 12.5, color: K.faint, fontFamily: K.mono, overflowWrap: "anywhere", flexBasis: "100%" }}>{verify}</span>
    </div>
  );
}
