"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* The Week 1 play area. Real primitives, not a fiction: it computes a
 * genuine SHA-256 with the browser's Web Crypto API and estimates
 * crack time from real character-set entropy. Zero network egress.
 *
 * The crack-time model is deliberately simple and honest: entropy =
 * length x log2(pool), guesses = 2^(entropy-1) (average), against a
 * stated offline rate. It is labelled as a rough estimate; the point
 * is the dramatic, correct ordering (trivial vs centuries), not a
 * forensic figure. */

const OFFLINE_GUESSES_PER_SEC = 1e11; // ~100 billion/s, a modern GPU rig on a fast hash

/* The most common real passwords (from published breach analyses, incl.
 * rockyou.txt). A cracker tries these first, so any of them falls in
 * milliseconds regardless of its raw length or character mix. Detecting
 * them here is what keeps the lab honest and ties it straight back to
 * the RockYou lesson. Bases are matched after stripping trailing
 * digits/symbols (so "password123" and "Password1!" both hit). */
const COMMON_BASES = new Set([
  "password", "passw0rd", "qwerty", "qwertyuiop", "letmein", "welcome",
  "admin", "login", "abc", "iloveyou", "monkey", "dragon", "football",
  "baseball", "master", "sunshine", "princess", "superman", "batman",
  "trustno", "hello", "freedom", "whatever", "ninja", "azerty", "solo",
  "starwars", "flower", "hottie", "loveme", "zaq", "michael", "shadow",
  "ashley", "qazwsx", "changeme", "secret",
]);

function isCommon(pw: string): boolean {
  const lower = pw.toLowerCase();
  if (COMMON_BASES.has(lower)) return true;
  // strip trailing digits and common symbols, then test the base word
  const base = lower.replace(/[0-9!@#$%^&*._-]+$/, "");
  if (base.length >= 3 && COMMON_BASES.has(base)) return true;
  // pure digits (PINs, years) are also cracked near-instantly
  if (/^\d{1,10}$/.test(pw)) return true;
  return false;
}

function poolSize(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33; // rough printable-symbol span
  return pool;
}

const YEAR_SECONDS = 60 * 60 * 24 * 365;

function humanTime(seconds: number): { text: string; band: "trivial" | "weak" | "ok" | "strong" } {
  if (!isFinite(seconds) || seconds <= 0) return { text: "instantly", band: "trivial" };
  // Beyond a few thousand years, exact figures are meaningless and ugly;
  // a plain-English ceiling teaches better than 25 digits.
  if (seconds > YEAR_SECONDS * 5000) {
    return { text: "longer than there has been life on Earth", band: "strong" };
  }
  const units: [number, string, string][] = [
    [60, "second", "seconds"],
    [60, "minute", "minutes"],
    [24, "hour", "hours"],
    [365, "day", "days"],
    [100, "year", "years"],
    [Infinity, "century", "centuries"],
  ];
  let val = seconds;
  let one = "second", many = "seconds";
  for (const [step, singular, plural] of units) {
    one = singular; many = plural;
    if (val < step) break;
    val = val / step;
  }
  const rounded = val < 10 ? Math.round(val * 10) / 10 : Math.round(val);
  const text = `${rounded.toLocaleString("en-GB")} ${rounded === 1 ? one : many}`;
  let band: "trivial" | "weak" | "ok" | "strong" = "strong";
  if (seconds < 1) band = "trivial";
  else if (seconds < 60 * 60 * 24) band = "weak";
  else if (seconds < YEAR_SECONDS * 100) band = "ok";
  return { text, band };
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const BAND_COLOR: Record<string, string> = {
  trivial: T.red,
  weak: T.amber,
  ok: T.cyan,
  strong: T.green,
};

/* Colour each hex character so the avalanche is visible: characters
 * that differ from the previous hash light up. */
function HashView({ hash, prev }: { hash: string; prev: string }) {
  return (
    <div style={{ fontFamily: T.mono, fontSize: 13, lineHeight: 1.7, wordBreak: "break-all", letterSpacing: "0.02em" }}>
      {hash.split("").map((ch, i) => {
        const changed = prev && prev[i] !== ch;
        return (
          <span key={i} style={{ color: changed ? T.cyan : T.faint, fontWeight: changed ? 700 : 400, background: changed ? T.cyanSoft : "transparent", borderRadius: 2 }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export default function PasswordLab({ onDidTry }: LabProps) {
  const [pw, setPw] = useState("");
  const [hash, setHash] = useState("");
  const prevHash = useRef("");
  const [reveal, setReveal] = useState(false);
  const firedTry = useRef(false);

  useEffect(() => {
    let live = true;
    if (!pw) {
      prevHash.current = "";
      setHash("");
      return;
    }
    sha256(pw).then((h) => {
      if (!live) return;
      setHash((old) => {
        prevHash.current = old;
        return h;
      });
    });
    return () => {
      live = false;
    };
  }, [pw]);

  // Count the learner as having "tried" once they type something real.
  useEffect(() => {
    if (!firedTry.current && pw.length >= 4) {
      firedTry.current = true;
      onDidTry();
    }
  }, [pw, onDidTry]);

  const stats = useMemo(() => {
    if (!pw) return null;
    const pool = poolSize(pw);
    const entropyBits = pw.length * Math.log2(pool || 1);
    if (isCommon(pw)) {
      // On a known-password list: a cracker finds it near-instantly, no
      // matter how long or mixed it looks. This is the RockYou lesson.
      return { pool, entropyBits, text: "instantly", band: "trivial" as const, common: true };
    }
    const avgGuesses = Math.pow(2, Math.max(entropyBits - 1, 0));
    const seconds = avgGuesses / OFFLINE_GUESSES_PER_SEC;
    return { pool, entropyBits, ...humanTime(seconds), common: false };
  }, [pw]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label htmlFor="pw" style={{ display: "block", fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 8 }}>
          Type a password (this never leaves your browser)
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="pw"
            type={reveal ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="try: password123"
            style={{
              width: "100%", boxSizing: "border-box", padding: "13px 70px 13px 15px",
              background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 10,
              fontFamily: T.mono, fontSize: 15,
            }}
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: T.muted, background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 6, padding: "5px 9px", cursor: "pointer" }}
          >
            {reveal ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "13px 15px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint, marginBottom: 6 }}>
              Time to crack (offline)
            </div>
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: BAND_COLOR[stats.band] }}>
              {stats.text}
            </div>
            <div style={{ fontSize: 11, color: stats.common ? T.red : T.faint, marginTop: 5 }}>
              {stats.common
                ? "this is on public wordlists like rockyou.txt, so a cracker tries it first, length does not save it"
                : "rough estimate vs a modern cracking rig (~100 billion guesses/sec)"}
            </div>
          </div>
          <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "13px 15px" }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint, marginBottom: 6 }}>
              Strength
            </div>
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: BAND_COLOR[stats.band], textTransform: "capitalize" }}>
              {stats.band === "ok" ? "decent" : stats.band}
            </div>
            <div style={{ fontSize: 11, color: T.faint, marginTop: 5 }}>
              {Math.round(stats.entropyBits)} bits of entropy, {stats.pool}-character set
            </div>
          </div>
        </div>
      )}

      <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "13px 15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint }}>
            Its real SHA-256 fingerprint
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.cyan }}>
            change one letter, watch it avalanche
          </div>
        </div>
        {hash ? (
          <HashView hash={hash} prev={prevHash.current} />
        ) : (
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.faint }}>
            (type above to see the fingerprint)
          </div>
        )}
      </div>
    </div>
  );
}
