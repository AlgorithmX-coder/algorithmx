"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* The Week 2 play area. Real primitives, not a fiction: it runs genuine
 * AES-256-GCM with a PBKDF2-derived key through the browser's Web Crypto
 * API, the same authenticated cipher that protects HTTPS and disk
 * encryption. Zero network egress: message and key never leave the page.
 *
 * The teaching beats the learner discovers by doing:
 *  - the message becomes unreadable ciphertext (secrecy, not a fingerprint);
 *  - a WRONG key returns nothing at all (authentication: no "close enough");
 *  - the method is public (it says AES-256 right there); only the key is
 *    secret. That is Kerckhoffs's principle, felt rather than told. */

async function deriveKey(pass: string, salt: BufferSource): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function b64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

async function encryptMessage(message: string, pass: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(message));
  const packed = new Uint8Array(salt.length + iv.length + ct.byteLength);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(new Uint8Array(ct), salt.length + iv.length);
  return b64(packed);
}

async function decryptMessage(blob: string, pass: string): Promise<string> {
  const packed = unb64(blob);
  const salt = packed.slice(0, 16);
  const iv = packed.slice(16, 28);
  const ct = packed.slice(28);
  const key = await deriveKey(pass, salt);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct); // throws on a wrong key
  return new TextDecoder().decode(pt);
}

/* Chunk the base64 so the ciphertext reads as a solid block of nonsense
 * rather than one runaway line. */
function Cipher({ blob }: { blob: string }) {
  return (
    <div style={{ fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.7, wordBreak: "break-all", letterSpacing: "0.02em", color: T.faint }}>
      {blob}
    </div>
  );
}

export default function EncryptionLab({ onDidTry }: LabProps) {
  const [message, setMessage] = useState("");
  const [lockKey, setLockKey] = useState("");
  const [blob, setBlob] = useState("");
  const [openKey, setOpenKey] = useState("");
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const firedTry = useRef(false);

  // Live-encrypt whenever the message or key changes. A fresh random salt +
  // IV each time is deliberate: the same message locks to a different blob
  // every keystroke (randomised encryption), unlike a hash.
  useEffect(() => {
    let live = true;
    if (!message || !lockKey) {
      setBlob("");
      return;
    }
    encryptMessage(message, lockKey).then((b) => {
      if (live) setBlob(b);
    }).catch(() => {});
    return () => {
      live = false;
    };
  }, [message, lockKey]);

  // A changed lockbox invalidates any previous unlock attempt.
  useEffect(() => {
    setResult(null);
  }, [blob]);

  useEffect(() => {
    if (!firedTry.current && message.length >= 3 && lockKey.length >= 1) {
      firedTry.current = true;
      onDidTry();
    }
  }, [message, lockKey, onDidTry]);

  async function tryOpen() {
    if (!blob || !openKey) return;
    try {
      const text = await decryptMessage(blob, openKey);
      setResult({ ok: true, text });
    } catch {
      setResult({ ok: false, text: "" });
    }
  }

  const keysMatchHint = useMemo(
    () => lockKey && openKey && lockKey !== openKey,
    [lockKey, openKey],
  );

  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", padding: "12px 14px",
    background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 10,
    fontFamily: T.mono, fontSize: 14.5,
  };
  const capLabel: React.CSSProperties = {
    fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.faint, marginBottom: 8,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. LOCK IT */}
      <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "16px 16px 18px" }}>
        <div style={{ ...capLabel, color: T.cyan }}>1 · Lock a message</div>
        <label htmlFor="enc-msg" style={{ display: "block", fontSize: 13, fontWeight: 700, color: T.muted, margin: "0 0 8px" }}>
          Your secret message
        </label>
        <input id="enc-msg" value={message} onChange={(e) => setMessage(e.target.value)} autoComplete="off" spellCheck={false}
          placeholder="meet me at the docks at nine" style={{ ...field, marginBottom: 12 }} />
        <label htmlFor="enc-key" style={{ display: "block", fontSize: 13, fontWeight: 700, color: T.muted, margin: "0 0 8px" }}>
          Your key (a secret only you and the reader know)
        </label>
        <input id="enc-key" value={lockKey} onChange={(e) => setLockKey(e.target.value)} autoComplete="off" spellCheck={false}
          placeholder="try: bluewhale" style={field} />
      </div>

      {/* THE CIPHERTEXT */}
      <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
          <div style={capLabel}>Real AES-256 ciphertext</div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.cyan }}>change one letter, the whole box changes</div>
        </div>
        {blob ? (
          <Cipher blob={blob} />
        ) : (
          <div style={{ fontFamily: T.mono, fontSize: 12.5, color: T.faint }}>(type a message and a key above to lock it)</div>
        )}
        <div style={{ fontSize: 11, color: T.faint, marginTop: 10 }}>
          This is genuine AES-256-GCM, the same cipher behind the padlock in your browser. To anyone without the key, it is noise.
        </div>
      </div>

      {/* 2. OPEN IT */}
      <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "16px" }}>
        <div style={{ ...capLabel, color: T.amber }}>2 · Try to open it</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>
          Type a key and open the box. Try the wrong key first, then the real one.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={openKey} onChange={(e) => setOpenKey(e.target.value)} autoComplete="off" spellCheck={false}
            placeholder="the key to try" onKeyDown={(e) => { if (e.key === "Enter") void tryOpen(); }}
            style={{ ...field, flex: 1, minWidth: 180 }} />
          <button type="button" onClick={() => void tryOpen()} disabled={!blob || !openKey}
            style={{ fontFamily: T.display, fontWeight: 700, fontSize: 14, color: T.bg, background: blob && openKey ? T.amber : T.edge, border: "none", borderRadius: 10, padding: "0 20px", cursor: blob && openKey ? "pointer" : "not-allowed" }}>
            Open the box
          </button>
        </div>
        {keysMatchHint && !result && (
          <div style={{ fontSize: 11, color: T.faint, marginTop: 8 }}>That key is different from the one you locked with. See what AES gives you.</div>
        )}
        {result && (
          <div style={{ marginTop: 14, background: T.bgRaise, border: `1px solid ${result.ok ? T.green : T.red}`, borderLeft: `3px solid ${result.ok ? T.green : T.red}`, borderRadius: 10, padding: "13px 15px" }}>
            {result.ok ? (
              <>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.green, marginBottom: 6 }}>Box open, right key</div>
                <div style={{ fontSize: 15, color: T.ink }}>{result.text}</div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.red, marginBottom: 6 }}>Box stays shut, wrong key</div>
                <div style={{ fontSize: 13.5, color: T.muted }}>
                  AES gives you nothing back, not a partial message, not a hint. There is no &quot;close enough&quot;: one character off and the whole thing refuses to open. That is the difference the key makes.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
