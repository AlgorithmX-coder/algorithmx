"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const BLUE = "#3b82f6";
const GREEN = "#10b981";
const HEADING = "#0f172a";
const BODY = "#475569";
const MUTED = "#94a3b8";
const BORDER = "#e2e8f0";
const RED = "#ef4444";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
*{font-family:'DM Sans',sans-serif;box-sizing:border-box;margin:0;padding:0}
h1,h2,h3,.dsp{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.02em}
body{background:#ffffff}
`;

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", background: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: `linear-gradient(135deg,${BLUE},${GREEN})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="dsp" style={{ fontSize: 24, fontWeight: 700, color: HEADING }}>
              Algorithm<span style={{ color: BLUE }}>X</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="dsp" style={{ fontSize: 28, fontWeight: 700, color: HEADING, marginBottom: 10 }}>
            This site is in development
          </h1>
          <p style={{ color: BODY, fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            Please enter the access password to continue.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              style={{
                padding: "14px 18px", borderRadius: 12,
                border: `1px solid ${BORDER}`, outline: "none",
                fontSize: 15, color: HEADING,
                transition: "border-color .2s ease, box-shadow .2s ease",
                fontFamily: "'DM Sans',sans-serif",
                width: "100%",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = `0 0 0 3px ${BLUE}22`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
            />
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                padding: "13px 22px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
                fontSize: 15, fontWeight: 700,
                boxShadow: `0 4px 14px ${BLUE}30`,
                opacity: loading || !password ? 0.6 : 1,
                cursor: loading || !password ? "not-allowed" : "pointer",
                transition: "opacity .2s ease",
              }}
            >
              {loading ? "Checking..." : "Enter"}
            </button>
            {error && (
              <p role="alert" style={{ color: RED, fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                {error}
              </p>
            )}
          </form>

          <p style={{ color: MUTED, fontSize: 12, marginTop: 32 }}>
            &copy; 2026 AlgorithmX Ltd.
          </p>
        </div>
      </div>
    </>
  );
}
