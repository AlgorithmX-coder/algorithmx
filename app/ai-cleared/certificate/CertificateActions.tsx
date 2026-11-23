"use client";

import { useState } from "react";
import type { CertifiedCourseSlug } from "../engine/courses";

/* Download, email me a copy. */
export default function CertificateActions({ course = "ai-cleared" }: { course?: CertifiedCourseSlug }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function email() {
    setState("sending");
    try {
      const r = await fetch("/api/ai-cleared/certificate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: true, course }) });
      const j = (await r.json().catch(() => ({}))) as { emailed?: boolean };
      setState(r.ok && j.emailed ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 20 }}>
      <a href={`/api/ai-cleared/certificate?course=${course}`} className="cf-btn cf-btn-pri">Download the PDF</a>
      <button type="button" onClick={email} disabled={state === "sending" || state === "sent"} className="cf-btn" style={{ opacity: state === "sent" ? 0.7 : 1 }}>
        {state === "idle" ? "Email me a copy" : state === "sending" ? "Sending…" : state === "sent" ? "Sent to your inbox" : "Could not send, try again"}
      </button>
    </div>
  );
}
