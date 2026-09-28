import type { Metadata } from "next";
import Link from "next/link";
import { fmtDate, verifyCertificate } from "@/app/lib/aiClearedCertificate";
import Aurora from "@/app/ai-cleared/Aurora";

/* /verify/[serial]: the public certificate check. Name, firm, dates, valid
 * or not. Nothing else: no scores, no track, nothing from the register. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verify an AI Cleared certificate", robots: { index: false, follow: false } };

const C = { ground: "#f3ede4", panel: "#ffffff", ink: "#14161d", muted: "#5b6572", faint: "#8a8f98", edge: "#dcd6ca", teal: "#0a7085", green: "#0e7a45", red: "#a63a08" };

export default async function VerifyPage({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const cert = await verifyCertificate(decodeURIComponent(serial));

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "100svh", background: C.ground, color: C.ink, fontFamily: "var(--font-inter), Inter, system-ui, sans-serif", padding: "48px 20px 80px" }}>
      <Aurora />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-geist-mono), ui-monospace, Consolas, monospace", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.22em", color: C.teal }}>
          <span aria-hidden style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(120deg, #0a7085, #5744c9 58%, #a5117f)", transform: "rotate(45deg)" }} />
          AI CLEARED · CERTIFICATE CHECK
        </div>
        {!cert ? (
          <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.85)`, borderRadius: 18, padding: "26px 28px", marginTop: 20, boxShadow: "0 18px 50px rgba(20,22,29,0.10)" }}>
            <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 11, letterSpacing: "0.14em", color: C.red, fontWeight: 700 }}>NOT FOUND</div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: "10px 0 8px", letterSpacing: "-0.015em" }}>No certificate matches {decodeURIComponent(serial)}.</h1>
            <p style={{ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.55 }}>Check the serial for a typo. Serials look like AXC-XXXX-XXXX. If you were given this one by a member of staff, ask them to open their certificate page and send the verify link from there.</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.85)`, borderLeft: `5px solid ${cert.valid ? C.green : C.red}`, borderRadius: 18, padding: "26px 28px", marginTop: 20, boxShadow: "0 18px 50px rgba(20,22,29,0.10)" }}>
            <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 11, letterSpacing: "0.14em", color: cert.valid ? C.green : C.red, fontWeight: 700 }}>{cert.valid ? "VALID" : "EXPIRED"}</div>
            <h1 style={{ fontSize: 26, fontWeight: 600, margin: "10px 0 4px", letterSpacing: "-0.015em" }}>{cert.holder}</h1>
            <div style={{ fontSize: 15, color: C.muted }}>{cert.firm}</div>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: "16px 0 0" }}>
              {cert.valid
                ? "Completed AI Cleared, the five-module course on safe and effective AI use for staff, and passed the final assessment."
                : "Completed AI Cleared, but this certificate has passed its twelve-month validity. Renewal is on the refreshed course content."}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.edge}` }}>
              {[
                ["Issued", fmtDate(cert.issuedAt)],
                ["Valid until", fmtDate(cert.expiresAt)],
                ["Serial", cert.serial],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontFamily: "ui-monospace, Consolas, monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.faint }}>{k}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <p style={{ fontSize: 13.5, color: C.muted, marginTop: 22, lineHeight: 1.55 }}>
          AI Cleared is run by AlgorithmX. This page confirms a certificate was issued and whether it is still within its validity; it shows no scores and nothing from the firm&rsquo;s training register. <Link href="/corporate" style={{ color: C.teal }}>About the course</Link>.
        </p>
      </div>
    </div>
  );
}
